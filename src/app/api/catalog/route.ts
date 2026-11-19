import { getCatalog } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(await getCatalog());
}
