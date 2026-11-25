# Basic Trie Operations: A Visual Guide

> **Goal:** Learn to *see* a trie (prefix tree), walk it by hand, and decide what extra information to store at each node.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is a Trie?](#0-the-big-idea-what-is-a-trie)
1. [Implement Trie (Medium)](#1-implement-trie-prefix-tree-medium)
2. [Longest Common Prefix (Easy)](#2-longest-common-prefix-easy)
3. [Longest Word in Dictionary (Medium)](#3-longest-word-in-dictionary-medium)
4. [Design Add and Search Words Data Structure (Medium)](#4-design-add-and-search-words-data-structure-medium)
5. [Index Pairs of a String (Easy)](#5-index-pairs-of-a-string-easy)
6. [Search Suggestions System (Medium)](#6-search-suggestions-system-medium)
7. [Design Search Autocomplete System (Hard)](#7-design-search-autocomplete-system-hard)
8. [Word Squares (Hard)](#8-word-squares-hard)
9. [Prefix and Suffix Search (Hard)](#9-prefix-and-suffix-search-hard)
10. [Master Cheat Sheet](#10-master-cheat-sheet)

> **Suggested order:** Implement Trie → Longest Common Prefix → Longest Word in Dictionary
> → Add and Search Words → Index Pairs → Search Suggestions → Autocomplete System
> → Word Squares → Prefix and Suffix Search.
> The first three only *walk* the trie. The next two *branch* while walking. The last four
> *store extra information at nodes*, which is where tries get powerful.

---

## 0. The Big Idea: What Is a Trie?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TRIE"                                  │
├──────────────────────────────────────────────────────────────────┤
│  • A DICTIONARY of words, and many lookups against it            │
│  • "starts with", "prefix", "autocomplete", "suggestions"        │
│  • Typing character by character (keystrokes)                    │
│  • Find every dictionary word that appears inside a text         │
│  • Wildcards like '.' that match any letter                      │
│  • Building words one letter at a time                           │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: shared prefixes share a path

```
  Words: cat, car, cart, dog

              (root)
             /      \
           c          d
           |          |
           a          o
          / \         |
        t●   r●       g●
             |
             t●

  ● = "a word ends here"  (isEnd = true)

  • "cat" and "car" share the path c → a, then split.
  • "car" is a word AND a prefix of "cart", so the r node is ● and has a child.
  • Each EDGE is one letter. A word = the letters on the path from the root.
```

### Trie vs. hash set

```
  ┌─────────────────────────────┬──────────────────┬──────────────────────┐
  │ Question                    │ Hash set         │ Trie                 │
  ├─────────────────────────────┼──────────────────┼──────────────────────┤
  │ Is "cart" a word?           │ O(L) ✅           │ O(L) ✅               │
  │ Does any word start "ca"?   │ scan ALL words ❌ │ O(L) walk ✅          │
  │ List words starting "ca"    │ scan ALL words ❌ │ walk + DFS subtree ✅ │
  │ Match "c.t" (wildcard)      │ try 26 options   │ branch only on real  │
  │                             │ per dot ❌        │ children ✅           │
  │ Typing letter by letter     │ re-hash each time│ move ONE step ✅      │
  │ Memory                      │ smaller          │ larger (node per char)│
  └─────────────────────────────┴──────────────────┴──────────────────────┘

  Rule of thumb: if the problem only asks "is this exact word present?",
  a hash set is enough. The moment PREFIXES matter, use a trie.
```

### Node structure

```
  ┌──────────────────────────────────────┐
  │ TrieNode                             │
  │   children : 26 slots  OR  a map     │   a..z → child node (or empty)
  │   isEnd    : true / false            │   does a word end exactly here?
  │   ─── optional extras ───            │
  │   word     : the full word           │   saves rebuilding it from the path
  │   count    : how many words pass     │   prefix counting
  │   index    : a number                │   e.g. largest word index
  │   top3     : up to 3 suggestions     │   autocomplete answers, precomputed
  └──────────────────────────────────────┘

  children as ARRAY[26]          children as MAP
  ─────────────────────          ───────────────────────────
  O(1) lookup by c − 'a'         O(1) average lookup
  26 slots even if empty         only stores real children
  natural alphabetical order     order depends on map type
  best: lowercase a–z only       best: big / unknown alphabet
```

### The three walks

```
  INSERT "cart"                    SEARCH "car"                STARTSWITH "ca"
  (create missing nodes)           (must END on ●)             (just must EXIST)

  root ─c─► ○                      root ─c─► ○                 root ─c─► ○
            │ a                              │ a                         │ a
            ○                                ○                         ○  ✅ exists
            │ r                              │ r
            ○●                               ○●  ✅ isEnd
            │ t   ← new node
            ○●    ← mark isEnd

  SEARCH "ca" → walk succeeds, but the a node is NOT ● → false.
  SEARCH "cab" → no b child under a → false.
```

### The universal template

```
function walk(word):
    node ← root
    for each char ch in word:
        if node.children[ch] is empty:
            return null                 // path breaks: no such prefix
        node ← node.children[ch]
    return node                         // the node where the prefix ends

search(word)     = walk(word) is not null AND walk(word).isEnd
startsWith(pre)  = walk(pre)  is not null
```

> 💡 **Key insight:** almost every trie problem is "walk to a node, then read or update something stored there."
> The art is deciding **what to store at each node**.

### Complexity basics

| Operation | Time | Notes |
|---|---|---|
| insert / search / startsWith | O(L) | L = length of the word |
| Build from N words | O(total characters) | |
| Space | O(total characters × alphabet) | with array[26]; a map uses O(total characters) |

---

## 1. Implement Trie (Prefix Tree) (Medium)

### Problem
Build a class with `insert(word)`, `search(word)` (exact word?), and `startsWith(prefix)` (any word with this prefix?).

### Visualize it (LeetCode example)

```
  insert("apple")      search("apple") → true
  search("app")        → false   (path exists, but no ● at "app")
  startsWith("app")    → true
  insert("app")
  search("app")        → true    (now "app" is ●)
```

### The trie after each insert

```
  after insert("apple")          after insert("app")

     (root)                         (root)
       │ a                            │ a
       ○                              ○
       │ p                            │ p
       ○                              ○
       │ p                            │ p
       ○                              ○●   ← only change: mark isEnd
       │ l                            │ l
       ○                              ○
       │ e                            │ e
       ○●                             ○●
```

### The 4 steps

| Step | Answer |
|------|--------|
| Node | `children[26]`, `isEnd` |
| insert | walk, create missing nodes, mark the last node `isEnd` |
| search | walk; fail if path breaks; return last node's `isEnd` |
| startsWith | walk; return true if the path never breaks |

### Trace

```
  op                   path walked              result
  ───────────────────  ───────────────────────  ───────────────────────────
  insert("apple")      a p p l e (all new)      e node ●
  search("apple")      a p p l e                e is ● → true
  search("app")        a p p                    p is not ● → false
  startsWith("app")    a p p                    path exists → true
  insert("app")        a p p (all exist)        mark 2nd p ●
  search("app")        a p p                    p is ● → true
```

### Pseudocode

```
class Trie:
    root ← new TrieNode

    insert(word):
        node ← root
        for each ch in word:
            if node.children[ch] is empty:
                node.children[ch] ← new TrieNode
            node ← node.children[ch]
        node.isEnd ← true

    search(word):
        node ← walk(word)
        return node ≠ null and node.isEnd

    startsWith(prefix):
        return walk(prefix) ≠ null
```

### 📌 Points to remember
- **search** needs `isEnd`. **startsWith** doesn't. This is the #1 bug.
- Inserting an existing word or a prefix of one creates no new nodes. It only flips `isEnd`.
- Every operation is O(L), no matter how many words are stored.

---

## 2. Longest Common Prefix (Easy)

### Problem
Return the longest prefix shared by **all** strings in the list (or `""`).

### Visualize it

```
  ["flower", "flow", "flight"]

     (root)
       │ f
       ○
       │ l
       ○            ← first node with 2 children → STOP here
      / \
     o   i
     │   │
     w●  g
     │   │
     e   h
     │   │
     r●  t●

  Answer: "fl"
```

### The trie walk: keep going while the path is a single lane

```
  From the root, keep stepping down while:
     ✓ the node has EXACTLY ONE child         (everyone agrees on the next letter)
     ✓ the node is NOT ●                       (no word has ended yet)

  Stop when:
     ✗ 2+ children   → words disagree here
     ✗ node is ●     → some word is already finished (it is the whole prefix)
```

### Trace

```
  node     children   isEnd   action
  ───────  ─────────  ──────  ────────────────────
  root     {f}        no      go f   prefix = "f"
  f        {l}        no      go l   prefix = "fl"
  l        {o, i}     no      2 children → STOP

  answer = "fl" ✅

  Edge: ["ab", "a"] → after 'a' the node is ● → STOP → "a"
  Edge: ["", "x"]   → root is ● (empty word) → ""
```

### Pseudocode (trie version)

```
function longestCommonPrefix(strs):
    trie ← insert every string in strs
    node ← root,  prefix ← ""
    while node has exactly one child and not node.isEnd:
        (ch, next) ← the only child
        prefix ← prefix + ch
        node ← next
    return prefix
```

### Simpler alternatives (this problem doesn't really need a trie)

```
  VERTICAL SCAN                         SORT + COMPARE ENDS
  compare column by column              sort: ["flight","flow","flower"]
                                        the first and last strings differ
  f l o w e r                           the most, so compare only them:
  f l o w
  f l i g h t                           flight
  ─ ─ ✗                                 flower
  stop at column 2 → "fl"               f l ✗  → "fl"

  O(total chars), O(1) extra space      O(S · log n) for the sort
```

### 📌 Points to remember
- Trie rule: stop at **2+ children** or at an **end-of-word** node.
- Learn it here, but in an interview the vertical scan is shorter and uses no extra memory.
- The trie version shines when you get **many LCP queries** over the same set.

---

## 3. Longest Word in Dictionary (Medium)

### Problem
Find the longest word that can be **built one letter at a time** from other words in the list
(every prefix must itself be a word). Ties → lexicographically smallest.

### Visualize it

```
  words = ["a","banana","app","appl","ap","apply","apple"]

        (root)
        /    \
      a●      b         ← b is NOT ● → "banana" can't be built
      │       │
      p●      a ...
      │
      p●
      │
      l●
     / \
   e●   y●

  Walk only through ● nodes:
    a → ap → app → appl → apple   (length 5)
                        → apply   (length 5)
  Tie → "apple" < "apply" → answer "apple" ✅
```

### The rule: only step onto ● nodes

```
   A word is buildable  ⇔  every node on its path is ●.

   ○ = not a word  →  a wall: never enter it
   ● = a word      →  safe stepping stone
```

### The 4 steps

| Step | Answer |
|------|--------|
| Build | insert all words |
| Explore | DFS from root, visiting children **a → z**, only into ● nodes |
| Track | the deepest word seen; replace only when **strictly longer** |
| Tie-break | automatic: a → z DFS finds the smaller word first |

### Trace (DFS, children in alphabetical order)

```
  visit         depth   best so far
  ────────────  ─────   ──────────────
  a ●           1       "a"
  ap ●          2       "ap"
  app ●         3       "app"
  appl ●        4       "appl"
  apple ●       5       "apple"
  apply ●       5       not longer → keep "apple"
  b ○           —       wall → skip the whole banana branch

  answer = "apple" ✅

  ["w","wo","wor","worl","world"] → "world"
```

### Pseudocode

```
function longestWord(words):
    trie ← insert all words, storing node.word at end nodes
    best ← ""
    dfs(root)
    return best

function dfs(node):
    for ch from 'a' to 'z':
        child ← node.children[ch]
        if child exists and child.isEnd:
            if length(child.word) > length(best): best ← child.word
            dfs(child)
```

> Alternative without a trie: sort words (shorter first, then a → z), keep a set of buildable words,
> and accept a word if `word minus its last letter` is in the set.

### 📌 Points to remember
- Store the **whole word** at the end node so you don't rebuild it from the path.
- Update on **strictly longer** only. Alphabetical DFS handles ties for free.
- BFS by levels also works; DFS is shorter to write.

---

## 4. Design Add and Search Words Data Structure (Medium)

### Problem
`addWord(word)` and `search(word)`, where `word` may contain `'.'`, which matches **any one letter**.

### Visualize it (LeetCode example)

```
  addWord: bad, dad, mad

         (root)
        /  |   \
       b   d    m
       │   │    │
       a   a    a
       │   │    │
       d●  d●   d●

  search("pad") → false      search(".ad") → true
  search("bad") → true       search("b..") → true
```

### The decision at each character

```
                  current char
           ┌───────────┴────────────┐
       a letter                    '.'
           │                        │
   follow ONE child          try EVERY existing child
   (or fail if missing)      (true if ANY branch succeeds)

            ○                          ○
            │ b                     /  |  \
            ○                      b   d   m     ← branch on real children only
```

### Trace: search(".ad")

```
  depth  char  node   action
  ─────  ────  ─────  ──────────────────────────────────────────
  0      '.'   root   try child b
  1      'a'   b      go a
  2      'd'   a      go d
  3      end   d      d is ● → return true   (no need to try d, m)

  search("pad"): root has no 'p' child → false
  search("b.."): b → '.' tries a → '.' tries d → ● → true
```

### Pseudocode

```
addWord(word): same as Trie insert

search(word):
    return dfs(root, word, 0)

dfs(node, word, i):
    if i == length(word): return node.isEnd
    ch ← word[i]
    if ch == '.':
        for each existing child c of node:
            if dfs(c, word, i+1): return true
        return false
    else:
        if node.children[ch] is empty: return false
        return dfs(node.children[ch], word, i+1)
```

### Complexity

| Operation | Time |
|---|---|
| addWord | O(L) |
| search without dots | O(L) |
| search with dots (worst) | can visit every node in the trie |

### 📌 Points to remember
- A '.' branches only into **existing** children, not all 26 letters.
- Return **as soon as** one branch succeeds.
- The end check is still `isEnd`. A dot can't match "nothing".

---

## 5. Index Pairs of a String (Easy)

> **LeetCode Premium 1065.** Given `text` and a list of `words`, return every pair `[i, j]`
> such that `text[i..j]` (inclusive) is one of the words. Sort by `i`, then by `j`.

### Visualize it

```
  text  = "ababa"
  words = ["aba", "ab"]

   index:  0   1   2   3   4
   text:   a   b   a   b   a
           └───┘                 [0,1]  "ab"
           └───────┘             [0,2]  "aba"
                   └───┘         [2,3]  "ab"
                   └───────┘     [2,4]  "aba"
```

### The idea: start a trie walk at EVERY position

```
  for each start i:
      walk the trie with text[i], text[i+1], ...
      every time you land on a ● node at position j → record [i, j]
      stop when the path breaks

  One walk from i finds ALL words starting at i, in increasing j.
  So the output comes out already sorted.
```

### Trace ("ababa", words ["aba","ab"])

```
  trie:  root ─a─► ○ ─b─► ○● ─a─► ○●
                          ("ab")   ("aba")

  i  walk                              recorded
  ─  ──────────────────────────────    ─────────────
  0  a ○ → b ● (j=1) → a ● (j=2)       [0,1] [0,2]
     → next 'b': no child → stop
  1  'b': no child of root → stop      —
  2  a ○ → b ● (j=3) → a ● (j=4)       [2,3] [2,4]
     → end of text
  3  'b': no child → stop              —
  4  a ○ → end of text                 —

  answer = [[0,1],[0,2],[2,3],[2,4]] ✅
```

> LeetCode example: text `"thestoryofleetcodeandme"`, words `["story","fleet","leetcode"]`
> → `[[3,7],[9,13],[10,17]]`. Note "fleet" (9..13) and "leetcode" (10..17) overlap. Overlaps are fine.

### Pseudocode

```
function indexPairs(text, words):
    trie ← insert all words
    result ← []
    for i from 0 to n−1:
        node ← root
        for j from i to n−1:
            node ← node.children[text[j]]
            if node is empty: break
            if node.isEnd: append [i, j] to result
    return result
```

### Complexity
- Build: O(total word characters). Search: O(n × longest word), since each walk stops after at most the longest word.

### 📌 Points to remember
- **Don't stop at the first ●.** Keep walking: a longer word may start at the same i.
- Sorted output comes for free from "i ascending, j ascending".
- This "walk from every start" idea also powers Aho-Corasick (a faster multi-pattern search).

---

## 6. Search Suggestions System (Medium)

### Problem
Given `products` and a `searchWord`, after **each typed character** return up to **3**
products that start with the typed prefix, in **lexicographic** order.

### Visualize it (LeetCode example)

```
  products   = ["mobile","mouse","moneypot","monitor","mousepad"]
  searchWord = "mouse"

  sorted     = [mobile, moneypot, monitor, mouse, mousepad]

  typed     suggestions
  ───────   ───────────────────────────────
  "m"       [mobile, moneypot, monitor]
  "mo"      [mobile, moneypot, monitor]
  "mou"     [mouse, mousepad]
  "mous"    [mouse, mousepad]
  "mouse"   [mouse, mousepad]
```

### Idea A: store the top 3 at each node

```
  Insert products in SORTED order. Along each path, append the word to a
  node's list only if the list has fewer than 3 items.
  Because insertion is sorted, the first 3 that arrive ARE the answer.

            (root)
              │ m      top3 = [mobile, moneypot, monitor]
              ○
              │ o      top3 = [mobile, moneypot, monitor]
              ○
          ┌───┼────────┐
          b   n        u
          │   │        │     u: top3 = [mouse, mousepad]
          …   …        ○
                       │ s   top3 = [mouse, mousepad]
                       ○
                       │ e   top3 = [mouse, mousepad]
                       ●
                       │ p …
```

### Trace (building "mo" node's list)

```
  insert in order     "m".top3                         "mo".top3
  ──────────────      ──────────────────────────────   ──────────────────────
  mobile              [mobile]                          [mobile]
  moneypot            [mobile, moneypot]                [mobile, moneypot]
  monitor             [mobile, moneypot, monitor]       [... , monitor]
  mouse               full → skip                       full → skip
  mousepad            full → skip                       full → skip

  "mou".top3 gets only mouse, mousepad → [mouse, mousepad] ✅
```

### Pseudocode (trie)

```
function suggestedProducts(products, searchWord):
    sort products
    for each p in products:
        node ← root
        for each ch in p:
            create child if missing; node ← child
            if size(node.top3) < 3: append p to node.top3
    result ← [], node ← root
    for each ch in searchWord:
        if node ≠ null: node ← node.children[ch]
        append (node ≠ null ? node.top3 : []) to result
    return result
```

### Idea B: no trie (sort + binary search)

```
  sorted: [mobile, moneypot, monitor, mouse, mousepad]

  prefix "mou": lower_bound("mou") → index 3 (mouse)
                take items 3, 4, 5 that still start with "mou" → [mouse, mousepad]

  Each prefix: O(L · log n). Shorter to write, same answers.
```

### 📌 Points to remember
- **Sort first**, then insert. The first 3 that reach a node are the smallest 3.
- Once the typed prefix leaves the trie, every later answer is `[]`. Keep the node as null.
- The binary-search version is a great follow-up answer.

---

## 7. Design Search Autocomplete System (Hard)

> **LeetCode Premium 642.** Constructor gets `sentences[]` and `times[]` (how often each was typed).
> `input(c)`:
> - if `c != '#'`: append `c` to the current query and return the **top 3** historical sentences
>   starting with the query. Order: **higher count first**, ties → **ASCII order** (space ' ' < letters).
> - if `c == '#'`: the query is finished. Save it as a sentence (count +1), reset the query, return `[]`.

### Visualize it (LeetCode example)

```
  sentences: "i love you"(5)  "island"(3)  "iroman"(2)  "i love leetcode"(2)

  input('i') → ["i love you", "island", "i love leetcode"]
  input(' ') → ["i love you", "i love leetcode"]
  input('a') → []
  input('#') → []            and "i a" is saved with count 1
```

### Why "i love leetcode" beats "iroman"

```
  both have count 2 → compare by ASCII:

    "i love leetcode"     "iroman"
     i  ' '                i  'r'
        ▲                     ▲
       32          <         114     → "i love leetcode" first ✅
```

### Design: keep a pointer that moves one step per keystroke

```
   query so far:  "i "          current node pointer
                                       │
        (root) ─i─► ○ ─' '─► ○ ◄───────┘
                     │
                     s ─► l ─► a ─► n ─► d●  (island)

   Each keystroke moves ONE step from the current node. No re-walking from the root.
   If the step fails, the pointer becomes DEAD (null) until '#'.
```

### What each node stores

```
   OPTION 1 (simple):   sentence + count stored at the end node only.
                        On each keystroke: DFS the current subtree, collect all
                        sentences, pick top 3. Fine for small inputs.

   OPTION 2 (fast):     every node stores counts[sentence] for ALL sentences in
                        its subtree. On insert, add to every node on the path.
                        On each keystroke: read the current node's map, take top 3.
```

### Trace

```
  keystroke  query        pointer        candidates (count)                    top 3
  ─────────  ───────────  ─────────────  ────────────────────────────────────  ─────────────────────────────
  'i'        "i"          node "i"       i love you 5, island 3,               i love you, island,
                                         i love leetcode 2, iroman 2           i love leetcode
  ' '        "i "         node "i "      i love you 5, i love leetcode 2       i love you, i love leetcode
  'a'        "i a"        DEAD           —                                     []
  '#'        reset        root           insert "i a" (count 1)                []
```

### Pseudocode

```
class AutocompleteSystem:
    constructor(sentences, times):
        for each k: addSentence(sentences[k], times[k])
        query ← "", node ← root

    addSentence(s, cnt):
        n ← root
        for each ch in s:
            create child if missing; n ← child
            n.counts[s] ← n.counts[s] + cnt         // option 2

    input(c):
        if c == '#':
            addSentence(query, 1)
            query ← "", node ← root
            return []
        query ← query + c
        if node ≠ null: node ← node.children[c]      // may become null
        if node == null: return []
        return top 3 of node.counts by (count desc, sentence asc)
```

### Complexity
- Keystroke: O(1) step + choosing top 3 from k candidates: O(k log k) by sorting, or O(k log 3) with a size-3 heap.
- '#': O(L) insert.

### 📌 Points to remember
- Keep the **pointer across keystrokes**. Never re-walk the whole query.
- A **dead pointer** stays dead until '#'. Still append the char to `query` so '#' saves the right sentence.
- Children must include **space** (use a map, or a 27-slot array).
- Tie-break by ASCII, which means a plain string comparison.

---

## 8. Word Squares (Hard)

> **LeetCode Premium 425.** Given **distinct** words of the **same length**, return every word square:
> a list of words where **row k reads the same as column k**. A word may be reused. Any output order.
> The backtracking side is covered in [../backtracking/03-Grid-Path-Backtracking.md](../backtracking/03-Grid-Path-Backtracking.md).
> Here we focus on the **trie that makes it fast**.

### Visualize it

```
  words = ["area","lead","wall","lady","ball"]

     b a l l          w a l l
     a r e a          a r e a
     l e a d          l e a d
     l a d y          l a d y

  Row k == column k. e.g. column 2 of the left square: l, e, a, d = "lead" = row 2 ✓
```

### The key observation: the next row's PREFIX is already fixed

```
   After placing rows 0..k−1, row k must start with column k of those rows.

     b a l l
     a r e a
     ? ? ? ?    ← row 2 must start with column 2 so far: "l","e" → "le"

   So the question each time is:
      "Which words start with this prefix?"  ← exactly what a trie answers
```

### The trie: store word indices at every node

```
   words: 0 area   1 lead   2 wall   3 lady   4 ball

              (root)
          ┌─────┬──┴───┬──────┐
          a     l      w      b
       [0]   [1,3]    [2]    [4]
          │    / \      │      │
          r   e   a     a      a
         [0] [1] [3]   [2]    [4]
          │   │   │     │      │
          e   a   d     l      l
          …   …   …     …      …

   Each node lists every word that has this prefix.
   prefix "le" → node l → e → [1] → "lead"
```

### Trace

```
  start  row 1 prefix     candidates   row 2 prefix   candidates   row 3 prefix   result
  ─────  ───────────────  ───────────  ─────────────  ───────────  ─────────────  ─────────────
  ball   "a"              area         "le"           lead         "lad"          lady ✅
  wall   "a"              area         "le"           lead         "lad"          lady ✅
  area   "r"              none ✗       —              —            —              dead
  lead   "e"              none ✗       —              —            —              dead
  lady   "a"              area         "de"           none ✗       —              dead

  answer = [[ball,area,lead,lady], [wall,area,lead,lady]] ✅
```

### Pseudocode

```
function wordSquares(words):
    trie ← insert each word; at every node on its path, append the word's index
    result ← []
    for each w in words:
        backtrack([w])
    return result

function backtrack(square):
    k ← size(square)
    if k == L: append copy of square to result; return
    prefix ← square[0][k] + square[1][k] + ... + square[k−1][k]
    for each index in trie.wordsWithPrefix(prefix):
        append words[index] to square
        backtrack(square)
        remove last from square
```

### 📌 Points to remember
- Row k's prefix = **column k of the rows already placed**.
- Storing the word list **at every node** turns "words with this prefix" into one O(prefix length) walk.
- A hash map from every prefix to its words works too, and is simpler.

---

## 9. Prefix and Suffix Search (Hard)

### Problem
`WordFilter(words)`. `f(pref, suff)` returns the **largest index** of a word that starts with `pref`
**and** ends with `suff`, or −1.

### The trick: turn "prefix AND suffix" into ONE prefix

```
   For a word w at index i, insert every    suffix + '#' + w
   (including the empty suffix) into ONE trie.

   "apple" (index 0) inserts:
        "#apple"
        "e#apple"
        "le#apple"
        "ple#apple"
        "pple#apple"
        "apple#apple"

   Query f(pref, suff) = walk   suff + '#' + pref
   ┌────────────────────────────────────────────────────────────┐
   │ A word matches  ⇔  "suff#pref" is a PREFIX of one of its   │
   │                    inserted keys                          │
   └────────────────────────────────────────────────────────────┘
```

### Why it works

```
     key:     e # a p p l e
              └┬┘ └───┬───┘
            suffix   the whole word
            "e"

     query:   e # a
              └┬┘ └┬┘
            suff  pref        "e#a" is a prefix of "e#apple" ✅
```

### Store the largest index at every node

```
   While inserting word i, set node.index ← i on EVERY node along the path.
   Words are inserted in index order, so later words overwrite → the node
   always holds the LARGEST matching index.
```

### Trace

```
  words = ["apple", "ape"]

  word 0 "apple" keys: #apple, e#apple, le#apple, ple#apple, pple#apple, apple#apple
  word 1 "ape"   keys: #ape, e#ape, pe#ape, ape#ape

  query              walk      node reached?     index
  ─────────────────  ────────  ────────────────  ──────────────────────────────
  f("a", "e")        e#a       yes (shared by    1   ("ape" overwrote 0)  ✅
                               e#apple, e#ape)
  f("ap", "le")      le#ap     yes (le#apple)    0
  f("b", "")         #b        no                −1

  LeetCode: WordFilter(["apple"]), f("a","e") → 0 ✅
```

### Pseudocode

```
class WordFilter:
    constructor(words):
        for i from 0 to n−1:
            w ← words[i]
            for k from length(w) down to 0:         // suffix w[k..] (k = len → empty)
                key ← w[k..] + '#' + w
                node ← root
                for each ch in key:
                    create child if missing; node ← child
                    node.index ← i

    f(pref, suff):
        node ← walk(suff + '#' + pref)
        return node ≠ null ? node.index : −1
```

> Use 27 children slots (a–z plus '#'), or a map.

### Alternatives

```
  ┌────────────────────────────┬──────────────────────┬─────────────────────┐
  │ Approach                   │ Build                │ Query               │
  ├────────────────────────────┼──────────────────────┼─────────────────────┤
  │ suffix#word trie (above)   │ O(N · L²)            │ O(|pref| + |suff|)  │
  │ hash map of every          │ O(N · L³) strings    │ O(1) average        │
  │ (prefix, suffix) pair      │ (L² pairs per word)  │                     │
  │ two tries (prefix trie +   │ O(N · L)             │ intersect two index │
  │ reversed-word trie)        │                      │ lists: slower       │
  └────────────────────────────┴──────────────────────┴─────────────────────┘
  LeetCode: word length ≤ 7, so L² is tiny and the suffix#word trie is ideal.
```

### 📌 Points to remember
- **suffix + '#' + word**, then query **suff + '#' + pref**. The '#' separates the two parts.
- Include the **empty suffix** so queries with `suff = ""` work.
- Set `index` on **every node** of the path, not only the end.

---

## 10. Master Cheat Sheet

### All 9 problems at a glance

```
┌──────────────────────────┬───────────────────────────────────────────────┬──────────────────────┐
│ Problem                  │ Core idea                                     │ Stored at node       │
├──────────────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ Implement Trie           │ walk; search needs isEnd                      │ isEnd                │
│ Longest Common Prefix    │ walk while 1 child and not end                │ isEnd                │
│ Longest Word in Dict     │ DFS only through end nodes, a → z             │ isEnd, word          │
│ Add and Search Words     │ '.' branches into every existing child        │ isEnd                │
│ Index Pairs of a String  │ walk from every start i, record every ●       │ isEnd                │
│ Search Suggestions       │ sorted insert, keep first 3 per node          │ top3                 │
│ Autocomplete System      │ pointer per keystroke, '#' saves sentence     │ counts / sentence    │
│ Word Squares             │ next row's prefix = column k so far           │ list of word indices │
│ Prefix and Suffix Search │ insert suffix#word, query suff#pref           │ largest index        │
└──────────────────────────┴───────────────────────────────────────────────┴──────────────────────┘
```

### Pattern family tree

```
                             BASIC TRIE
                                 │
      ┌──────────────────┬───────┴─────────┬─────────────────────────┐
      │                  │                 │                         │
  PLAIN WALK        BRANCHING WALK    WALK FROM EVERY START    EXTRA INFO AT NODES
      │                  │                 │                         │
  ├ Implement Trie   └ Add & Search    └ Index Pairs           ├ Search Suggestions (top3)
  ├ Longest Common     ('.' wildcard)                          ├ Autocomplete (counts)
  │   Prefix                                                   ├ Word Squares (word lists)
  └ Longest Word                                               └ Prefix & Suffix (index)
     (only ● steps)
```

### What to store at a node

```
  ┌──────────────────────────────────┬──────────────────────────────┐
  │ The question asks for...         │ Store at each node           │
  ├──────────────────────────────────┼──────────────────────────────┤
  │ exact word?                      │ isEnd                        │
  │ the word itself at the end       │ word                         │
  │ how many words have this prefix  │ count (+1 on every node)     │
  │ top k suggestions                │ a small sorted list          │
  │ best by frequency                │ counts map                   │
  │ all words with this prefix       │ list of word indices         │
  │ largest / latest index           │ index (overwrite on insert)  │
  └──────────────────────────────────┴──────────────────────────────┘
```

### Checklist

```
  ☐ Is it only "exact word present?"      → a hash set may be enough
  ☐ Lowercase a–z only?                   → children array[26]; else a map
  ☐ Need suggestions in sorted order?     → sort first, then insert
  ☐ Typing one char at a time?            → keep a current-node pointer
  ☐ Wildcard '.'?                         → DFS into every existing child
  ☐ Match words anywhere in a text?       → start a walk at every index
  ☐ Prefix AND suffix together?           → insert suffix#word
```

### 🚩 Common bugs to avoid

```
  ✗ search() returning true for a prefix (forgot isEnd)
  ✗ Longest Common Prefix: not stopping at an end-of-word node
  ✗ Longest Word: stepping onto a node that is not a word
  ✗ Add & Search: trying all 26 letters for '.' instead of existing children
  ✗ Index Pairs: stopping at the first match instead of walking on
  ✗ Search Suggestions: inserting before sorting
  ✗ Autocomplete: re-walking from root each keystroke; forgetting the space child;
    not appending to the query while the pointer is dead
  ✗ Prefix/Suffix: forgetting the empty suffix; storing index only at the end node
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "When my walk STOPS at a node, what do I need to know   ║
   ║   there, and can I store it during insert?"              ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Implement Trie (Prefix Tree) (Medium)
- [ ] Longest Common Prefix (Easy)
- [ ] Longest Word in Dictionary (Medium)
- [ ] Design Add and Search Words Data Structure (Medium)
- [ ] Index Pairs of a String (Easy)
- [ ] Search Suggestions System (Medium)
- [ ] Design Search Autocomplete System (Hard)
- [ ] Word Squares (Hard)
- [ ] Prefix and Suffix Search (Hard)
