# Grid / Path Backtracking: A Visual Guide

> **Goal:** Learn to explore **every path** through a grid: step in, try all directions, step back out.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [../graph/01-DFS-Connectivity.md](../graph/01-DFS-Connectivity.md). Same DFS, with one extra line: **unmark**.

---

## Table of Contents

0. [The Big Idea: Mark → Explore → Unmark](#0-the-big-idea-mark--explore--unmark)
1. [Rat in a Maze (Medium)](#1-rat-in-a-maze-medium)
2. [Path with Maximum Gold (Medium)](#2-path-with-maximum-gold-medium)
3. [Unique Paths III (Hard)](#3-unique-paths-iii-hard)
4. [Word Search (Medium)](#4-word-search-medium)
5. [Word Search II (Hard)](#5-word-search-ii-hard)
6. [Sudoku Solver (Hard)](#6-sudoku-solver-hard)
7. [Word Squares (Hard)](#7-word-squares-hard)
8. [Master Cheat Sheet](#8-master-cheat-sheet)

> **Suggested order:** Rat in a Maze → Path with Maximum Gold → Unique Paths III → Word Search
> → Word Search II → Sudoku Solver → Word Squares.
> The first three teach the walk itself. Word Search adds "match a string", Word Search II adds a Trie,
> and the last two move from "walk a grid" to "fill a grid".

---

## 0. The Big Idea: Mark → Explore → Unmark

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "GRID BACKTRACKING"                     │
├──────────────────────────────────────────────────────────────────┤
│  • A maze / board / grid of letters or numbers                   │
│  • "ALL paths", "every route", "count the walks"                 │
│  • "Each cell may be used AT MOST ONCE in a path"                │
│  • "Visit EVERY empty cell exactly once"                         │
│  • Find a word by walking through neighboring letters            │
│  • FILL a grid so every rule holds (sudoku, word squares)        │
│  • Small grids (≤ 20×20, often far smaller) → exponential is OK  │
└──────────────────────────────────────────────────────────────────┘
```

### The template, as a picture

```
   1. MARK     2. EXPLORE (4 directions)     3. UNMARK
   ┌───┬───┐      ┌───┬───┐                  ┌───┬───┐
   │ ● │   │      │ ● │ → │  try right       │   │   │   cell is free again
   ├───┼───┤      ├───┼───┤  try down        ├───┼───┤   for OTHER paths
   │   │   │      │ ↓ │   │  try left, up    │   │   │
   └───┴───┘      └───┴───┘                  └───┴───┘
   "I'm standing   "go as deep as             "I'm leaving,
    here now"       each direction allows"     undo my footprint"
```

### Pseudocode template

```
function explore(r, c, pathState):
    if r, c is out of bounds:            return     // 1. bounds
    if cell is blocked or visited:       return     // 2. legality
    if cell completes the goal:                     // 3. goal
        record answer
        return                                      //    (or keep going, per problem)

    mark (r, c) as visited                          // MARK
    for each (dr, dc) in [(1,0), (0,-1), (0,1), (-1,0)]:
        explore(r + dr, c + dc, pathState + this cell)   // EXPLORE
    unmark (r, c)                                   // UNMARK ← the backtracking line
```

### Why unmark? Reachability vs. all paths

```
  FLOOD FILL / ISLANDS (graph/01)            PATH BACKTRACKING (this file)
  "Can I REACH this cell?"                   "List / count / score EVERY PATH"

  ┌───┬───┬───┐                              ┌───┬───┬───┐
  │ S │ → │ ✓ │   once a cell is visited,    │ S │ → │ ↓ │  path A uses the middle
  ├───┼───┼───┤   it stays visited forever   ├───┼───┼───┤
  │ ↓ │ ✓ │ ✓ │   → each cell processed      │ ↓ │ ● │ ← │  path B ALSO needs the
  └───┴───┴───┘     ONCE: O(cells)           └───┴───┴───┘  middle → must unmark!

  never unmark  → visits each cell once      unmark → a cell can appear in many paths
  O(m·n)                                     exponential (that's the price of "all")
```

> 💡 **Rule of thumb:** "visited" in flood fill means *"already counted"*.
> "visited" in backtracking means *"on my current path right now"*.

### The in-place marking trick

```
   Instead of a separate visited[][] array, overwrite the cell:

     saved ← board[r][c]
     board[r][c] ← '#'          // '#' never matches anything → acts as "visited"
     ... explore ...
     board[r][c] ← saved        // restore on the way back

   ✓ O(1) extra memory   ✓ one fewer check   ⚠ MUST restore, or the next search breaks
```

### Bounds-check styles

```
   Style A: check at the TOP of the call      Style B: check BEFORE recursing
   explore(r, c):                             for each neighbor (nr, nc):
     if r<0 or r≥m or c<0 or c≥n: return        if inside and legal:
     ...                                            explore(nr, nc)

   A is simpler to write. B makes fewer calls. Both are correct; pick one and stay consistent.
```

### Pruning: cut dead branches early

```
                    start
                 ╱    │    ╲
               ✓      ✂      ✓       ✂ = stop here: this branch can never succeed
              ╱ ╲            │
             ✓   ✂           ✓       Typical cuts:
                                       • next letter doesn't match (Word Search)
                                       • prefix not in the Trie (Word Search II)
                                       • digit already in row/col/box (Sudoku)
                                       • no word starts with this prefix (Word Squares)
```

### The universal complexity shape

```
   First step: up to 4 choices.  Every later step: up to 3 (you can't go back
   to where you came from).  For a path of length L:

        4 · 3^(L-1)   paths from one start cell

   With every cell as a start:  O(m·n · 3^L)
```

---

## 1. Rat in a Maze (Medium)

### Problem (GFG convention)
`n × n` matrix, `1` = open, `0` = blocked. The rat starts at `(0, 0)` and must reach `(n-1, n-1)`.
Moves: **D** (down), **L** (left), **R** (right), **U** (up). A cell can't be reused within one path.
Return **all** paths as direction strings, **sorted lexicographically**. If none exist (or the start is blocked), return an empty list.

### Visualize it

```
       c=0  c=1  c=2  c=3
     ┌────┬────┬────┬────┐
 r=0 │ S  │ ▓  │ ▓  │ ▓  │      S = start, E = end, ▓ = wall (0)
     ├────┼────┼────┼────┤
 r=1 │ 1  │ 1  │ ▓  │ 1  │
     ├────┼────┼────┼────┤
 r=2 │ 1  │ 1  │ ▓  │ ▓  │
     ├────┼────┼────┼────┤
 r=3 │ ▓  │ 1  │ 1  │ E  │
     └────┴────┴────┴────┘

   Path 1: D D R D R R           Path 2: D R D D R R
   ┌───┬───┬───┬───┐             ┌───┬───┬───┬───┐
   │ S │   │   │   │             │ S │   │   │   │
   │ ↓ │   │   │   │             │ ↓ │   │   │   │
   ├───┼───┼───┼───┤             ├───┼───┼───┼───┤
   │ ↓ │   │   │   │             │ → │ ↓ │   │   │
   ├───┼───┼───┼───┤             ├───┼───┼───┼───┤
   │ → │ ↓ │   │   │             │   │ ↓ │   │   │
   ├───┼───┼───┼───┤             ├───┼───┼───┼───┤
   │   │ → │ → │ E │             │   │ → │ → │ E │
   └───┴───┴───┴───┘             └───┴───┴───┴───┘
```

### The free sorting trick

```
   Alphabetical order:  D  <  L  <  R  <  U

   If you TRY directions in exactly that order at every cell,
   paths are discovered already sorted. No sort needed at the end.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | current cell `(r, c)` + the direction string so far |
| Choices | D, L, R, U (in that order) |
| Legal? | inside the grid, cell is `1`, not on the current path |
| Goal | `(r, c) == (n-1, n-1)` → record the string |
| Undo | unmark the cell, drop the last letter |

### Trace (DFS order D, L, R, U)

```
  at (0,0) ""      D → (1,0)
  at (1,0) "D"     D → (2,0)
  at (2,0) "DD"    D → (3,0) wall ✗    L → out ✗    R → (2,1)
  at (2,1) "DDR"   D → (3,1)
  at (3,1) "DDRD"  D → out ✗   L → (3,0) wall ✗   R → (3,2)
  at (3,2) "DDRDR" D → out ✗   L → (3,1) on path ✗   R → (3,3) GOAL
                   ✅ record "DDRDRR"
  ... back at (2,1): L (2,0) on path ✗, R (2,2) wall ✗, U → (1,1)
  at (1,1) "DDRU"  D (2,1) on path, L (1,0) on path, R wall, U (0,1) wall → dead end
  ... unwind to (1,0) "D": L out ✗, R → (1,1)
  at (1,1) "DR"    D → (2,1)
  at (2,1) "DRD"   D → (3,1) → R (3,2) → R (3,3)
                   ✅ record "DRDDRR"
  ... remaining branches all hit walls or the current path.

  result = ["DDRDRR", "DRDDRR"]   (already sorted ✅)
```

### Pseudocode

```
function ratInMaze(maze):
    n ← size of maze
    results ← empty list
    if maze[0][0] == 0: return results
    solve(0, 0, "")
    return results

function solve(r, c, path):
    if (r, c) == (n-1, n-1):
        add path to results
        return
    maze[r][c] ← 0                            // mark (in place: treat as wall)
    for (letter, dr, dc) in [('D',1,0), ('L',0,-1), ('R',0,1), ('U',-1,0)]:
        nr ← r + dr,  nc ← c + dc
        if inside(nr, nc) and maze[nr][nc] == 1:
            solve(nr, nc, path + letter)
    maze[r][c] ← 1                            // unmark
```

### Complexity

| Measure | Value |
|---|---|
| Time | O(3^(n²)) worst case: up to 3 fresh choices per step, path up to n² cells |
| Space | O(n²) recursion depth (+ output) |

### 📌 Points to remember
- Check **start blocked** (and end blocked) before doing anything.
- Try directions in **D, L, R, U** order → output is sorted for free.
- Marking the cell as `0` is the in-place "visited" trick. Restore it to `1`.
- Older GFG versions return `-1` when there is no path. Read the version you are solving.

---

## 2. Path with Maximum Gold (Medium)

### Problem
Grid of gold amounts (`0` = empty, can't step on). Start at **any** cell with gold, move 4 directions,
never revisit a cell in the same walk, never step on `0`. Stop whenever you like.
Return the most gold you can collect.

### Visualize it

```
       ┌───┬───┬───┐
       │ 0 │ 6 │ 0 │
       ├───┼───┼───┤
       │ 5 │ 8 │ 7 │         9 → 8 → 7  = 24 ✅
       ├───┼───┼───┤
       │ 0 │ 9 │ 0 │
       └───┴───┴───┘
```

### What's different from Rat in a Maze

```
   Rat in a Maze                     Path with Maximum Gold
   ──────────────────────            ───────────────────────────────
   fixed start (0,0)                 ANY gold cell can be the start
   fixed end (n-1,n-1)               stop ANYWHERE
   collect ALL paths                 return the BEST score

   → try every start, and at every cell: score = cell + best(neighbor branches)
```

### The decision at each cell

```
                       ┌─────────────┐
                       │ at (r,c):   │
                       │ take gold g │
                       └──────┬──────┘
              ┌───────────┬───┴───────┬───────────┐
            down        left        right        up
              │           │           │           │
           best_D      best_L      best_R      best_U    (0 if blocked)

     best(r, c) = g + max(best_D, best_L, best_R, best_U, 0)
                                                       ▲
                                            "stop here" is always allowed
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | current cell `(r, c)`, with the current path marked |
| Choices | 4 neighbors with gold that aren't on the path |
| Value | `gold(r,c) + max(0, best of each neighbor branch)` |
| Start | every cell with gold > 0 |
| Answer | max over all starts |

### Trace: best score from each start

```
   start │ best walk         │ total
   ──────┼───────────────────┼──────
     6   │ 6 → 8 → 9         │  23
     5   │ 5 → 8 → 9         │  22
     8   │ 8 → 9             │  17     (8 is in the middle: the walk can only go ONE way)
     7   │ 7 → 8 → 9         │  24 ✅
     9   │ 9 → 8 → 7         │  24 ✅

   answer = 24
```

> Note: from `8` you can't do `9 → 8 → 7` because you START at 8.
> The middle of a good path is never the best starting point. That's why every start is tried.

### Pseudocode

```
function getMaximumGold(grid):
    best ← 0
    for every cell (r, c) with grid[r][c] > 0:
        best ← max(best, dig(r, c))
    return best

function dig(r, c):
    if out of bounds or grid[r][c] == 0: return 0
    gold ← grid[r][c]
    grid[r][c] ← 0                           // mark (0 = can't step here)
    most ← 0
    for each of 4 neighbors (nr, nc):
        most ← max(most, dig(nr, nc))
    grid[r][c] ← gold                        // unmark
    return gold + most
```

### Complexity

| Measure | Value |
|---|---|
| Time | O(k · 3^k), k = number of gold cells (LeetCode: k ≤ 25) |
| Space | O(k) recursion depth |

### 📌 Points to remember
- Return a **value** from the recursion (best below me) instead of tracking a global path sum. Cleaner.
- `0` doubles as "wall" and "visited". Set the cell to 0 while on the path, restore after.
- No memo: the best from `(r,c)` depends on which cells are already used. Memoizing on `(r,c)` alone is **wrong**.
- Try every gold cell as a start.

---

## 3. Unique Paths III (Hard)

### Problem
Grid values: `1` = start, `2` = end, `0` = empty, `-1` = obstacle.
Count the walks from start to end that step on **every non-obstacle cell exactly once**.

### Visualize it

```
       c=0  c=1  c=2  c=3
     ┌────┬────┬────┬────┐
 r=0 │ S  │ 0  │ 0  │ 0  │
     ├────┼────┼────┼────┤
 r=1 │ 0  │ 0  │ 0  │ 0  │       12 cells, 1 obstacle → 11 cells to walk
     ├────┼────┼────┼────┤
 r=2 │ 0  │ 0  │ E  │ ▓  │
     └────┴────┴────┴────┘
```

### The two answers

```
   Walk 1 (snake right, then back left)       Walk 2 (down, zigzag up, then right)
   ┌────┬────┬────┬────┐                      ┌────┬────┬────┬────┐
   │ 1  │ 2  │ 3  │ 4  │                      │ 1  │ 6  │ 7  │ 8  │
   ├────┼────┼────┼────┤                      ├────┼────┼────┼────┤
   │ 8  │ 7  │ 6  │ 5  │                      │ 2  │ 5  │ 10 │ 9  │
   ├────┼────┼────┼────┤                      ├────┼────┼────┼────┤
   │ 9  │ 10 │ 11 │ ▓  │                      │ 3  │ 4  │ 11 │ ▓  │
   └────┴────┴────┴────┘                      └────┴────┴────┴────┘
     numbers = visit order, 11 = E                    answer = 2 ✅
```

### The key idea: count what's left

```
   need = number of cells that are NOT -1   (includes start and end)

   Walk with a counter "steps = cells visited so far, including this one".

   Reach E with steps == need  →  covered everything → count 1
   Reach E with steps <  need  →  missed cells       → count 0 (dead end)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(r, c)` + `steps` (cells on the path so far) |
| Choices | 4 neighbors that are not obstacles and not on the path |
| Goal | at `E` and `steps == need` |
| Return | number of complete walks from here |
| Answer | `walks(start, 1)` |

### Small trace: a grid with 0 answers

```
       ┌────┬────┐
       │ 0  │ S  │      need = 4 (all cells)
       ├────┼────┤
       │ E  │ 0  │
       └────┴────┘

   S(0,1) steps=1
    ├─ left  → (0,0) steps=2 → down → E steps=3 ≠ 4 ✗   ((1,1) never visited)
    └─ down  → (1,1) steps=2 → left → E steps=3 ≠ 4 ✗   ((0,0) never visited)

   answer = 0
```

### Pseudocode

```
function uniquePathsIII(grid):
    need ← count of cells with value ≠ -1
    find start (sr, sc)
    return walk(sr, sc, 1)

function walk(r, c, steps):
    if grid[r][c] == 2:                       // reached the end
        return 1 if steps == need else 0
    saved ← grid[r][c]
    grid[r][c] ← -1                           // mark as obstacle
    total ← 0
    for each of 4 neighbors (nr, nc):
        if inside and grid[nr][nc] ≠ -1:
            total ← total + walk(nr, nc, steps + 1)
    grid[r][c] ← saved                        // unmark
    return total
```

### Complexity

| Measure | Value |
|---|---|
| Time | O(3^(m·n)) worst case. LeetCode keeps m·n ≤ 20 |
| Space | O(m·n) recursion depth |

### 📌 Points to remember
- Count `need` **once** at the beginning. Include start and end in it.
- Don't stop at `E` early when cells are left over: return 0 for that branch.
- Don't continue past `E` either. The walk must **end** there.
- Bonus: Hamiltonian path counting on small grids. Bitmask DP is an alternative for slightly larger grids.

---

## 4. Word Search (Medium)

### Problem
Grid of letters and one `word`. Can the word be spelled by walking through neighboring cells (4 directions),
using each cell at most once?

### Visualize it

```
       c=0  c=1  c=2  c=3
     ┌────┬────┬────┬────┐
 r=0 │ A  │ B  │ C  │ E  │      "ABCCED"
     ├────┼────┼────┼────┤       A(0,0) → B(0,1) → C(0,2)
 r=1 │ S  │ F  │ C  │ S  │              → C(1,2) → E(2,2) → D(2,1)   ✅
     ├────┼────┼────┼────┤
 r=2 │ A  │ D  │ E  │ E  │      "SEE"    S(1,3) → E(2,3) → E(2,2)     ✅
     └────┴────┴────┴────┘      "ABCB"   needs B(0,1) twice           ❌
```

### The walk now carries an index into the word

```
   find(r, c, i):  "can I spell word[i..] starting at cell (r, c)?"

          board[r][c] == word[i] ?
             │
       no ───┴──► return false          ← pruning: wrong letter, stop at once
             │
       yes, and i is the last index ──► return true
             │
       yes → mark, try 4 neighbors with i+1, unmark
```

### Trace: "ABCB"

```
   start A(0,0) i=0 ✓
     → B(0,1) i=1 ✓
         → C(0,2) i=2 ✓
             need 'B' next. Neighbors of (0,2):
               left  B(0,1)  → on the current path ('#') ✗
               down  C(1,2)  → 'C' ≠ 'B' ✗
               right E(0,3)  → 'E' ≠ 'B' ✗
             dead end
         other neighbors of B(0,1): F(1,1) ≠ 'C' ✗
   other 'A' at (2,0): next must be 'B', neighbors S, D ✗

   answer = false ✅
```

### Pseudocode

```
function exist(board, word):
    for every cell (r, c):
        if find(r, c, 0): return true
    return false

function find(r, c, i):
    if out of bounds or board[r][c] ≠ word[i]: return false
    if i == length(word) - 1: return true
    saved ← board[r][c]
    board[r][c] ← '#'                         // mark
    found ← find(r+1,c,i+1) or find(r-1,c,i+1) or find(r,c+1,i+1) or find(r,c-1,i+1)
    board[r][c] ← saved                       // unmark (even when found!)
    return found
```

### Pruning tricks (LeetCode's follow-up)

```
  ✂ 1. Letter count: if the word needs three 'E's and the board has two → false at once.
  ✂ 2. Reverse the word when its LAST letter is rarer on the board than its FIRST.
        Fewer matching starts → far fewer searches.
  ✂ 3. Word longer than m·n → false.
```

### Complexity

| Measure | Value |
|---|---|
| Time | O(m·n · 3^L), L = word length |
| Space | O(L) recursion depth |

### 📌 Points to remember
- **Restore the cell before returning**, even on success, if the board will be reused.
- Short-circuit `or` stops as soon as one direction succeeds.
- The `'#'` trick works because `'#'` never equals a letter in `word`.

---

## 5. Word Search II (Hard)

### Problem
Same board, but now a **list of words**. Return every word that can be found.

### Why "run Word Search once per word" is too slow

```
   words = 30,000      board = 12 × 12
   30,000 × (144 starts × 3^10 walks) → far too slow

   Insight: many words SHARE PREFIXES ("oath", "oat", "oak").
   Walk the board ONCE, and follow ALL words at the same time.
   The tool for "all words that start with this prefix": a TRIE.
```

### Visualize it

```
   board                           words = ["oath", "pea", "eat", "rain"]
     ┌───┬───┬───┬───┐
     │ o │ a │ a │ n │             oath: o(0,0) a(0,1) t(1,1) h(2,1)  ✅
     ├───┼───┼───┼───┤             eat : e(1,3) a(1,2) t(1,1)         ✅
     │ e │ t │ a │ e │             pea : no 'p' on the board          ❌
     ├───┼───┼───┼───┤             rain: r(2,3) has no 'a' neighbor   ❌
     │ i │ h │ k │ r │
     ├───┼───┼───┼───┤             answer = ["eat", "oath"]
     │ i │ f │ l │ v │
     └───┴───┴───┴───┘
```

### Draw the Trie

```
                     (root)
          ┌─────┬──────┴──┬──────┐
          o     p         e      r
          │     │         │      │
          a     e         a      a
          │     │         │      │
          t     a◆pea     t◆eat  i
          │                      │
          h◆oath                 n◆rain

   ◆ = a word ends here (store the whole word in the node)
```

### The walk: board cell and trie node move TOGETHER

```
   find(r, c, node):
       letter ← board[r][c]
       child  ← node.children[letter]
       no child?  ✂ stop: NO word continues this way
       child.word set?  → found it! record, then clear child.word (no duplicates)
       mark, recurse into 4 neighbors with child, unmark

   Board path:  o → a → t → h
   Trie path:   root → o → a → t → h◆   → "oath" found
```

### Two prunings that make it fast

```
  ✂ 1. After recording a word, set node.word ← null
        → the same word is never added twice.

  ✂ 2. After exploring a child, if it has NO children and NO word left, DELETE it:

        before finding "oath"        after finding "oath"
           root                         root
            │                            │
            o                         (o deleted, nothing left below it)
            │
            a ─ t ─ h◆oath

        Later walks through 'o' stop immediately instead of re-exploring dead branches.
```

### Pseudocode

```
function findWords(board, words):
    root ← build trie from words (store full word at each ending node)
    found ← empty list
    for every cell (r, c):
        if board[r][c] in root.children:
            search(r, c, root)
    return found

function search(r, c, parent):
    letter ← board[r][c]
    node   ← parent.children[letter]
    if node.word ≠ null:
        add node.word to found
        node.word ← null                        // prune 1: no duplicates
    board[r][c] ← '#'                           // mark
    for each of 4 neighbors (nr, nc):
        if inside and board[nr][nc] in node.children:
            search(nr, nc, node)
    board[r][c] ← letter                        // unmark
    if node has no children and node.word == null:
        remove letter from parent.children      // prune 2: drop dead leaves
```

### Complexity

| Measure | Value |
|---|---|
| Build trie | O(total letters in all words) |
| Search | O(m·n · 4 · 3^(L-1)), L = longest word length |
| Space | O(total letters) for the trie |

### 📌 Points to remember
- **One board walk, all words at once.** The trie is the pruning engine.
- Store the **whole word** at its end node, so you don't rebuild strings while walking.
- Clear `node.word` after finding it, or a word reachable two ways appears twice.
- Leaf removal turns "Time Limit Exceeded" into "Accepted" on big tests.

---

## 6. Sudoku Solver (Hard)

### Problem
Fill a 9×9 board so every **row**, **column** and **3×3 box** contains digits 1–9 exactly once.
The puzzle has exactly one solution.

### Visualize it

```
   ┌───────┬───────┬───────┐
   │ 5 3 . │ . 7 . │ . . . │     "." = empty cell
   │ 6 . . │ 1 9 5 │ . . . │
   │ . 9 8 │ . . . │ . 6 . │
   ├───────┼───────┼───────┤
   │ 8 . . │ . 6 . │ . . 3 │
   │ 4 . . │ 8 . 3 │ . . 1 │
   │ 7 . . │ . 2 . │ . . 6 │
   ├───────┼───────┼───────┤
   │ . 6 . │ . . . │ 2 8 . │
   │ . . . │ 4 1 9 │ . . 5 │
   │ . . . │ . 8 . │ . 7 9 │
   └───────┴───────┴───────┘
```

### Walking a grid vs. filling a grid

```
   Problems 1–5: the PATH moves through the grid, 4 directions.
   Sudoku:       YOU move through the empty cells in a fixed order,
                 and at each one you CHOOSE a digit.

     empty cells:  e₁ → e₂ → e₃ → ... → e_last
                   try    try    try
                   1..9   1..9   1..9      wrong digit later? come back and try the next one
```

### Which box is (r, c) in?

```
         c: 0 1 2   3 4 5   6 7 8
           ┌───────┬───────┬───────┐
   r 0-2   │ box 0 │ box 1 │ box 2 │
           ├───────┼───────┼───────┤      box = (r / 3) * 3 + (c / 3)
   r 3-5   │ box 3 │ box 4 │ box 5 │            (integer division)
           ├───────┼───────┼───────┤
   r 6-8   │ box 6 │ box 7 │ box 8 │      (4, 4) → 1*3 + 1 = 4 ✓
           └───────┴───────┴───────┘      (7, 2) → 2*3 + 0 = 6 ✓
```

### O(1) legality check with 27 sets

```
   rows[9], cols[9], boxes[9]  ← each a set of digits already used

   digit d is legal at (r, c)  ⇔  d ∉ rows[r]  and  d ∉ cols[c]  and  d ∉ boxes[box]

   place d:   add d to all three sets,  board[r][c] ← d
   undo d:    remove d from all three,  board[r][c] ← '.'
```

### Trace: candidates for the first empty cell (0, 2)

```
   row 0 uses:    5 3 7
   col 2 uses:    8
   box 0 uses:    5 3 6 9 8
                  ─────────────────
   used:          3 5 6 7 8 9
   candidates:    1 2 4

   The solver tries 1, then 2, then 4.
   1 and 2 eventually hit a cell with ZERO candidates → backtrack.
   4 leads to the (unique) solution:  row 0 = 5 3 4 6 7 8 9 1 2
```

### Speed-up: most-constrained cell first

```
   Instead of "next empty cell in reading order",
   pick the empty cell with the FEWEST candidates.

   Example: the center cell (4, 4)
     row 4 uses:  4 8 3 1
     col 4 uses:  7 9 6 2 1 8
     box 4 uses:  6 8 3 2
     used:        1 2 3 4 6 7 8 9     → only candidate: 5   (no guessing at all!)

   A cell with 1 candidate costs nothing.
   A cell with 0 candidates → backtrack immediately (prunes a whole subtree).
```

### Pseudocode

```
function solveSudoku(board):
    fill rows, cols, boxes from the given digits
    empties ← list of all (r, c) with board[r][c] == '.'
    solve(0)

function solve(i):                            // i = index into empties
    if i == length(empties): return true      // every cell filled
    (r, c) ← empties[i]
    b ← (r / 3) * 3 + (c / 3)
    for d from 1 to 9:
        if d ∉ rows[r] and d ∉ cols[c] and d ∉ boxes[b]:
            place d at (r, c)                 // add to 3 sets + board
            if solve(i + 1): return true      // stop at the first solution
            undo d at (r, c)                  // remove from 3 sets + board
    return false                              // no digit works → backtrack
```

### Complexity

| Approach | Notes |
|---|---|
| Scan row/col/box for every check | O(27) per check |
| **27 sets / bitmasks** | **O(1)** per check ✅ |
| Worst case search | O(9^E), E = empty cells (the board is fixed at 81, so this is bounded) |
| Most-constrained cell | same worst case, far fewer nodes in practice |

### 📌 Points to remember
- Return **`true` up the stack** as soon as the board is full. Don't undo a correct solution.
- Box index: `(r / 3) * 3 + c / 3`. Get it wrong and nothing works.
- Bitmasks (`rows[r]` as a 9-bit number) make the checks and the candidate count very fast.
- This is **constraint-based** backtracking on a grid. Compare with N-Queens.

---

## 7. Word Squares (Hard)

### Problem (LeetCode 425, Premium)
Given **distinct** words that all have the **same length L**, return every word square you can build.
In a word square, **row k reads the same as column k**. A word may be used more than once.
The output order doesn't matter.

### Visualize it

```
   words = ["area", "lead", "wall", "lady", "ball"]

        b a l l            w a l l
        a r e a            a r e a
        l e a d            l e a d
        l a d y            l a d y

   Column 0 of the left square: b, a, l, l → "ball" = row 0 ✓
   Column 2:                    l, e, a, d → "lead" = row 2 ✓
```

### The key insight: the rows above fix the start of the next row

```
   Square filled up to row k-1. Row k must START with column k's letters so far:

        row 0:  b  a [l] l
        row 1:  a  r [e] a
        row 2:  ?  ?  ?  ?     ← must start with "le" (column 2, read downward)

   prefix(k) = square[0][k] + square[1][k] + ... + square[k-1][k]

   → "Which words start with this prefix?" → a PREFIX MAP (or Trie)
```

### Build the prefix map

```
   ""     → area, lead, wall, lady, ball
   "a"    → area           "ar", "are", "area" → area
   "l"    → lead, lady     "le" → lead          "la", "lad" → lady
   "w"    → wall           "b"  → ball          ... and so on
```

### Trace: starting from "ball"

```
   row │ prefix needed           │ candidates │ pick
   ────┼─────────────────────────┼────────────┼──────
    0  │ ""                      │ all words  │ ball
    1  │ col 1: "a"              │ area       │ area
    2  │ col 2: "l" + "e" = "le" │ lead       │ lead
    3  │ col 3: "l"+"a"+"d"="lad"│ lady       │ lady
       │ 4 rows filled           │            │ ✅ [ball, area, lead, lady]

   Starting from "wall": the same rows follow → ✅ [wall, area, lead, lady]
```

### Trace: starts that die early

```
   "area" → row 1 needs prefix "r"         → no word ✂
   "lead" → row 1 needs prefix "e"         → no word ✂
   "lady" → row 1 needs "a" → area
            row 2 needs "d" + "e" = "de"   → no word ✂

   answer = [[ball, area, lead, lady], [wall, area, lead, lady]] ✅
```

### Pseudocode

```
function wordSquares(words):
    L ← length of each word
    prefixMap ← for every word w and every k in 0..L: prefixMap[w[0..k)].add(w)
    results ← empty list
    build([])
    return results

function build(square):
    k ← length(square)
    if k == L:
        add a copy of square to results
        return
    prefix ← letters square[0][k], square[1][k], ..., square[k-1][k]
    for each word w in prefixMap[prefix]:
        push w onto square
        build(square)
        pop w from square
```

### Complexity

| Measure | Value |
|---|---|
| Build prefix map | O(N · L²) with strings (O(N · L) with a trie) |
| Search | exponential in L, but the prefix lookup prunes nearly every branch |
| Space | O(N · L²) for the map, O(L) recursion |

### 📌 Points to remember
- Row k is **forced to start with** column k's letters. That one rule drives everything.
- A Trie gives the same lookup. Store the list of words at each trie node.
- A word may repeat inside one square. Don't mark words as "used".
- This "fill a grid row by row" style is shared with Sudoku. The prefix lookup is the pruning step.

---

## 8. Master Cheat Sheet

### All 7 problems at a glance

```
┌──────────────────────┬───────────────────────────────────────────────┬──────────────────────┐
│ Problem              │ Core idea                                     │ Pruning / trick      │
├──────────────────────┼───────────────────────────────────────────────┼──────────────────────┤
│ Rat in a Maze        │ fixed start/end, collect all direction strings│ try D,L,R,U → sorted │
│ Max Gold             │ any start, return gold + max(branch)          │ 0 = wall = visited   │
│ Unique Paths III     │ count walks covering ALL cells                │ steps == need at end │
│ Word Search          │ walk + index into ONE word                    │ letter mismatch stop │
│ Word Search II       │ walk + TRIE node for ALL words                │ clear word, drop leaf│
│ Sudoku Solver        │ fill empties, try 1..9                        │ 27 sets, fewest-first│
│ Word Squares         │ fill rows, row k starts with column k         │ prefix map / trie    │
└──────────────────────┴───────────────────────────────────────────────┴──────────────────────┘
```

### Pattern family tree

```
                          GRID / PATH BACKTRACKING
                                    │
            ┌───────────────────────┼───────────────────────┐
            │                       │                       │
      WALK THE GRID           WALK + MATCH TEXT        FILL THE GRID
   (mark → 4 dirs → unmark)  (cell + index / trie)   (choose a value per cell)
            │                       │                       │
   ├─ Rat in a Maze  (all)   ├─ Word Search          ├─ Sudoku Solver
   ├─ Max Gold       (best)  └─ Word Search II       └─ Word Squares
   └─ Unique Paths III (count)
```

### What you return decides the shape

```
   ┌──────────────────────┬──────────────────────────────┬────────────────────┐
   │ Question             │ Return from recursion        │ Example            │
   ├──────────────────────┼──────────────────────────────┼────────────────────┤
   │ list all paths       │ nothing; push to a list      │ Rat in a Maze      │
   │ best score           │ cell + max(child branches)   │ Max Gold           │
   │ count paths          │ sum(child counts)            │ Unique Paths III   │
   │ does one exist?      │ true/false, short-circuit OR │ Word Search        │
   │ one solution         │ true → stop and keep board   │ Sudoku Solver      │
   └──────────────────────┴──────────────────────────────┴────────────────────┘
```

### Backtracking vs. flood fill card

```
   ┌──────────────────┬─────────────────────────┬──────────────────────────┐
   │                  │ Flood fill (graph/01)   │ Path backtracking        │
   ├──────────────────┼─────────────────────────┼──────────────────────────┤
   │ visited means    │ already seen, forever   │ on the CURRENT path      │
   │ unmark?          │ never                   │ always, on the way back  │
   │ answers          │ reachability, size      │ all / best / count paths │
   │ time             │ O(m·n)                  │ exponential              │
   │ memo on (r,c)?   │ n/a                     │ usually WRONG (path state)│
   └──────────────────┴─────────────────────────┴──────────────────────────┘
```

### Optimization checklist

```
  ☐ Can I mark in place ('#', 0, -1) instead of a visited array?
  ☐ Can I stop a branch the moment it's hopeless (letter, prefix, digit)?
  ☐ Many target words? → Trie, walk once
  ☐ Words found? → clear them and drop empty trie leaves
  ☐ Filling cells? → keep row/col/box sets for O(1) checks
  ☐ Filling cells? → choose the cell with the fewest options next
  ☐ Need sorted output? → try choices in sorted order
```

### 🚩 Common bugs to avoid

```
  ✗ Forgetting to UNMARK → later paths think cells are blocked
  ✗ Unmarking only on failure → board left with '#' after a success
  ✗ Memoizing on (r, c) when the answer depends on which cells are used
  ✗ Rat in a Maze: not checking a blocked start; trying directions in random order
  ✗ Unique Paths III: forgetting to count start and end in "need"
  ✗ Word Search II: duplicates in output (didn't clear node.word)
  ✗ Sudoku: wrong box index; undoing the board after the solution is found
  ✗ Word Squares: building the prefix from the ROW instead of the COLUMN
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What do I change when I step INTO this cell,           ║
   ║   and have I put it back exactly when I step OUT?"       ║
   ╚══════════════════════════════════════════════════════════╝
     Every grid backtracking bug is a broken answer to this question.
```

---

### ✅ Progress tracker

- [ ] Rat in a Maze (Medium)
- [ ] Path with Maximum Gold (Medium)
- [ ] Unique Paths III (Hard)
- [ ] Word Search (Medium)
- [ ] Word Search II (Hard)
- [ ] Sudoku Solver (Hard)
- [ ] Word Squares (Hard)
