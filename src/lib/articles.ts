import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export interface FileArticleMeta {
  id: string;
  title: string;
  summary: string;
  category: string;
  file: string;
}

export interface FileArticle extends FileArticleMeta {
  content: string;
}

export interface ArticleNavigation {
  previous: FileArticleMeta | null;
  next: FileArticleMeta | null;
}

interface ArticleFile {
  id: string;
  category: string;
  file: string;
}

async function findMarkdownFiles(parent = ""): Promise<ArticleFile[]> {
  const entries = await readdir(path.join(process.cwd(), "articles", parent), {
    withFileTypes: true,
  });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.join(parent, entry.name);
      if (entry.isDirectory()) {
        return findMarkdownFiles(relativePath);
      }
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) {
        return [];
      }

      const file = relativePath.split(path.sep).join("/");
      const id = file
        .replace(/\.md$/i, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const folder = path.dirname(relativePath);
      const category =
        folder === "."
          ? "General"
          : folder
              .split(path.sep)
              .pop()!
              .replace(/^dynammic programming$/i, "Dynamic Programming")
              .replace(/\b\w/g, (letter) => letter.toUpperCase());

      return [{ id, category, file }];
    }),
  );

  return files.flat();
}

function getTitle(content: string, file: string) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();

  return path.basename(file, path.extname(file)).replace(/^\d+-/, "").replace(/[-_]/g, " ");
}

function getSummary(content: string) {
  const lines = content.split(/\r?\n/);
  const firstHeading = lines.findIndex((line) => /^#\s+/.test(line));
  const introductoryLine = lines
    .slice(firstHeading + 1)
    .map((line) => line.trim())
    .find((line) => line.startsWith(">"));

  if (!introductoryLine) return "";
  const summary = introductoryLine
    .replace(/^>\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`/g, "")
    .trim();
  return summary.length > 180 ? `${summary.slice(0, 177).trimEnd()}…` : summary;
}

function getMetadata(
  file: ArticleFile,
  content: string,
): FileArticleMeta {
  return {
    ...file,
    title: getTitle(content, file.file),
    summary: getSummary(content),
  };
}

export async function getFileArticles(): Promise<FileArticleMeta[]> {
  const files = (await findMarkdownFiles()).sort((a, b) =>
    a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" }),
  );

  return Promise.all(
    files.map(async (file) => {
      const content = await readFile(path.join(process.cwd(), "articles", file.file), "utf8");
      return getMetadata(file, content);
    }),
  );
}

export async function readFileArticle(id: string): Promise<FileArticle | null> {
  const file = (await findMarkdownFiles()).find((article) => article.id === id);
  if (!file) return null;

  const content = await readFile(path.join(process.cwd(), "articles", file.file), "utf8");
  return { ...getMetadata(file, content), content };
}

export async function getFileArticleWithNavigation(
  id: string,
): Promise<{ article: FileArticle; navigation: ArticleNavigation } | null> {
  const files = (await findMarkdownFiles()).sort((a, b) =>
    a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" }),
  );
  const index = files.findIndex((file) => file.id === id);
  if (index === -1) return null;

  const current = files[index];
  const siblings = files.filter((file) => file.category === current.category);
  const siblingIndex = siblings.findIndex((file) => file.id === id);
  const previousFile = siblings[siblingIndex - 1];
  const nextFile = siblings[siblingIndex + 1];
  const readMetadata = async (file: ArticleFile | undefined) => {
    if (!file) return null;
    const content = await readFile(path.join(process.cwd(), "articles", file.file), "utf8");
    return getMetadata(file, content);
  };
  const [content, previous, next] = await Promise.all([
    readFile(path.join(process.cwd(), "articles", current.file), "utf8"),
    readMetadata(previousFile),
    readMetadata(nextFile),
  ]);

  return {
    article: { ...getMetadata(current, content), content },
    navigation: { previous, next },
  };
}
