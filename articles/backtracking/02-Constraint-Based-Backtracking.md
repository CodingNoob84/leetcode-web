# Constraint-Based Backtracking: A Visual Guide

> **Goal:** Learn to place pieces one at a time, **reject bad placements instantly**, and undo on dead ends.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Constraint-Based Backtracking?](#0-the-big-idea-what-is-constraint-based-backtracking)
1. [N-Queens (Hard)](#1-n-queens-hard)
2. [N-Queens II (Hard)](#2-n-queens-ii-hard)
3. [M-Coloring Problem (Medium)](#3-m-coloring-problem-medium)
4. [Matchsticks to Square (Medium)](#4-matchsticks-to-square-medium)
5. [Partition to K Equal Sum Subsets (Medium)](#5-partition-to-k-equal-sum-subsets-medium)
6. [Knight's Tour (Medium)](#6-knights-tour-medium)
7. [Master Cheat Sheet](#7-master-cheat-sheet)

> **Suggested order:** N-Queens → N-Queens II → M-Coloring → Matchsticks → Partition K → Knight's Tour.
> Queens teaches the template, coloring moves it to graphs, the two bucket problems add
> "fill containers" plus pruning, and Knight's Tour adds a move-ordering heuristic.

---

## 0. The Big Idea: What Is Constraint-Based Backtracking?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "CONSTRAINT BACKTRACKING"               │
├──────────────────────────────────────────────────────────────────┤
│  • Place pieces so that NONE ATTACK / CONFLICT (queens, colors)  │
│  • Fill containers so each hits an EXACT target (square, k sums) │
│  • Visit every square / node EXACTLY ONCE (knight's tour)        │
│  • "Is it possible?", "print one / all valid arrangements"       │
│  • Small input (n ≤ 15ish): exponential search is expected       │
└──────────────────────────────────────────────────────────────────┘
```

### One decision per level

```
   level 0 :  decide item 0          ●
                                   / | \
   level 1 :  decide item 1      ●   ●   ✗   ← violates a rule → cut instantly
                                / \   \
   level 2 :  decide item 2    ✗   ●   ●
                                   │    \
   ...                             ●     ✗   ← dead end → go back up (UNDO)
                                   │
   level n :  all decided  →  ✅ SOLUTION

   Every level answers ONE question:
     N-Queens   : "which column for the queen in row r?"
     Coloring   : "which color for vertex v?"
     Buckets    : "which bucket gets stick i?"
     Knight     : "which square is move number k?"
```

### The universal template

```
function solve(level):
    if level == END:
        record / return success
    for each choice c at this level:
        if isValid(level, c):          // ⚡ check BEFORE going deeper
            apply(c)                   // place piece, mark sets
            if solve(level + 1): return true    // (for "find one")
            undo(c)                    // remove piece, unmark sets
    return false
```

### Prune early vs check at the end

```
   CHECK AT END (slow)                     PRUNE EARLY (fast)
   build a full arrangement,               reject the moment a rule breaks
   then test it

        ●                                       ●
      / | \                                   / | \
     ●  ●  ●                                 ●  ✗  ✗      ← whole subtrees
    /|\ /|\ /|\                             /|\              never built
   ● ●● ●●● ●●●  ← test every leaf         ● ✗ ✗

   N-Queens 8×8: 8^8 ≈ 16.7 million         ≈ 15,000 nodes visited
   full placements
```

> 💡 **Key insight:** a constraint problem is fast when `isValid` is **cheap** and **called early**.

### O(1) validity with sets: the board trick

```
   For a queen at (r, c), the attacked lines are:

     column        c       → set  cols
     diagonal  ╲   r − c   → set  diag      (constant along ╲)
     anti-diag ╱   r + c   → set  anti      (constant along ╱)

   r − c values on a 4×4:          r + c values on a 4×4:
        c=0 c=1 c=2 c=3                 c=0 c=1 c=2 c=3
   r=0 │  0  -1  -2  -3 │          r=0 │  0   1   2   3 │
   r=1 │  1   0  -1  -2 │          r=1 │  1   2   3   4 │
   r=2 │  2   1   0  -1 │          r=2 │  2   3   4   5 │
   r=3 │  3   2   1   0 │          r=3 │  3   4   5   6 │
          same number = same ╲            same number = same ╱

   isValid(r, c) = c ∉ cols  AND  (r−c) ∉ diag  AND  (r+c) ∉ anti     → O(1)
```

> Instead of scanning the board (O(n) per check), keep one set/array per kind of line.

### Ordering heuristics: try the hardest choice first

```
  ┌──────────────────────────┬────────────────────────────────────────────┐
  │ Heuristic                │ Why it helps                               │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Sort items DESCENDING    │ Big sticks/numbers fail fast; small ones   │
  │ (Matchsticks, Partition) │ fill gaps at the end                       │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Most-constrained first   │ Pick the variable with the FEWEST legal    │
  │ (Sudoku, Coloring)       │ options, so dead ends show up early        │
  ├──────────────────────────┼────────────────────────────────────────────┤
  │ Warnsdorff (Knight)      │ Move to the square with the FEWEST onward  │
  │                          │ moves, so corners don't get stranded       │
  └──────────────────────────┴────────────────────────────────────────────┘
```

### Symmetry pruning: don't solve the mirror twice

```
   N-Queens: solutions starting in column c mirror those starting in n−1−c.

     first queen in   ┌───┬───┬───┬───┐
     columns 0..n/2   │ ✓ │ ✓ │ ↔ │ ↔ │    try left half, double the count
     only             └───┴───┴───┴───┘    (odd n: handle the middle column once)

   Buckets: all EMPTY buckets are identical.
     placing a stick in empty bucket #2 or #3 = same situation as bucket #1
     → only try the FIRST empty bucket.
```

### The 5-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  LEVEL       what one decision is made per level?      │
 │ STEP 2  CHOICES     what can be chosen at that level?         │
 │ STEP 3  VALIDITY    which rules can I check RIGHT NOW (O(1))? │
 │ STEP 4  UNDO        what must be restored after returning?    │
 │ STEP 5  PRUNING     ordering, symmetry, impossible-early tests│
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. N-Queens (Hard)

### Problem
Place `n` queens on an `n × n` board so no two attack each other (same row, column, or diagonal).
Return **all** distinct boards.

### Visualize it

```
     ┌───┬───┬───┬───┐          A queen attacks along:
     │   │ Q │   │   │              ─ its row
     ├───┼───┼───┼───┤              │ its column
     │   │   │   │ Q │              ╲ ╱ both diagonals
     ├───┼───┼───┼───┤
     │ Q │   │   │   │          Exactly one queen per row and per column,
     ├───┼───┼───┼───┤          so place ROW BY ROW.
     │   │   │ Q │   │
     └───┴───┴───┴───┘
```

### The decision at every level

```
   level r = row r
   choice  = column c in 0..n−1
   valid   = c ∉ cols, (r−c) ∉ diag, (r+c) ∉ anti
   rows never clash because each level IS a different row
```

### The 5 steps

| Step | Answer |
|------|--------|
| Level | row `r` |
| Choices | column `0..n-1` |
| Validity | column / `r-c` / `r+c` sets |
| Undo | remove from the 3 sets, clear the board cell |
| Pruning | the sets prune instantly; optional half-board symmetry |

### Full trace (n = 4)

Notation: `[c0, c1, ...]` = column chosen in row 0, row 1, ...

```
 row0=0  [0]
 │ row1: c0 ✗ col   c1 ✗ ╲diag   c2 ✓
 ├─ [0,2]
 │   row2: c0 ✗ col   c1 ✗ ╱anti(with 1,2)   c2 ✗ col   c3 ✗ ╲diag(with 1,2)
 │   ✗ DEAD END → undo row1
 │ row1: c3 ✓
 ├─ [0,3]
 │   row2: c0 ✗ col   c1 ✓
 │   ├─ [0,3,1]
 │   │   row3: c0 ✗ col  c1 ✗ col  c2 ✗ ╲diag(with 2,1)  c3 ✗ col
 │   │   ✗ DEAD END → undo row2
 │   row2: c2 ✗ ╲diag(with 0,0)   c3 ✗ col
 │   ✗ DEAD END → undo row1
 │ row1: no columns left → undo row0
 │
 row0=1  [1]
 │ row1: c0 ✗ ╱anti   c1 ✗ col   c2 ✗ ╲diag   c3 ✓
 ├─ [1,3]
 │   row2: c0 ✓
 │   ├─ [1,3,0]
 │   │   row3: c0 ✗ col  c1 ✗ col  c2 ✓
 │   │   └─ [1,3,0,2]  ✅ SOLUTION 1
 │   │   row3: c3 ✗ col
 │   row2: c1 ✗ col   c2 ✗ ╱anti(with 1,3)   c3 ✗ col
 │
 row0=2  [2]  → mirror of row0=1  → [2,0,3,1]  ✅ SOLUTION 2
 row0=3  [3]  → mirror of row0=0  → no solution
```

```
   SOLUTION 1 [1,3,0,2]        SOLUTION 2 [2,0,3,1]
   ┌───┬───┬───┬───┐           ┌───┬───┬───┬───┐
   │ . │ Q │ . │ . │           │ . │ . │ Q │ . │
   │ . │ . │ . │ Q │           │ Q │ . │ . │ . │
   │ Q │ . │ . │ . │           │ . │ . │ . │ Q │
   │ . │ . │ Q │ . │           │ . │ Q │ . │ . │
   └───┴───┴───┴───┘           └───┴───┴───┴───┘
              mirror images of each other ↔
```

### Pseudocode

```
function solveNQueens(n):
    results ← empty list
    board   ← n × n of '.'
    cols, diag, anti ← empty sets
    place(0)
    return results

function place(r):
    if r == n:
        add a copy of board to results
        return
    for c from 0 to n−1:
        if c in cols or (r−c) in diag or (r+c) in anti: continue   // ✗ prune
        board[r][c] ← 'Q';  add c, r−c, r+c to the 3 sets
        place(r + 1)
        board[r][c] ← '.';  remove c, r−c, r+c from the 3 sets      // undo
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try every cell for every queen | O(C(n², n)) | O(n²) |
| One queen per row, scan board to validate | O(n! · n) | O(n²) |
| **One per row + 3 sets** | **≈ O(n!)** | **O(n)** extra |

### 📌 Points to remember
- **Row = level.** That removes the row constraint for free.
- **`r − c` for ╲, `r + c` for ╱.** If using arrays, offset `r − c` by `n − 1` so it never goes negative.
- Undo **exactly** what you applied (board cell + all 3 sets).
- n = 2 and n = 3 have **no** solutions; n = 4 has 2; n = 8 has 92.

---

## 2. N-Queens II (Hard)

### Problem
Same board, same rules. Return only the **number** of solutions.

### What changes

```
   N-Queens                         N-Queens II
   ───────────────────────────      ───────────────────────────
   build board strings              no board at all
   copy board at every leaf         count += 1 at every leaf
   O(n²) memory for the board       O(n) memory (just the 3 sets)
```

### The 5 steps

| Step | Answer |
|------|--------|
| Level | row `r` |
| Choices | column `0..n-1` |
| Validity | the same 3 sets |
| Undo | remove from the 3 sets |
| Answer | number of times `r == n` was reached |

### Trace (n = 4)

```
   Same search tree as problem 1:
     row0=0 → 0 leaves
     row0=1 → 1 leaf
     row0=2 → 1 leaf
     row0=3 → 0 leaves
                       total = 2 ✅

   With symmetry: try row0 ∈ {0, 1} only → 0 + 1 = 1 → double → 2 ✅
```

### Pseudocode

```
function totalNQueens(n):
    return count(0)

function count(r):
    if r == n: return 1
    total ← 0
    for c from 0 to n−1:
        if c in cols or (r−c) in diag or (r+c) in anti: continue
        add c, r−c, r+c
        total ← total + count(r + 1)
        remove c, r−c, r+c
    return total
```

### 🚀 Bitmask version (the fastest)

```
   Keep 3 integers instead of 3 sets. Bit i = "column i is attacked in THIS row".

     cols : columns used so far
     ld   : ╲ attacks, shifted LEFT  by 1 each row going down
     rd   : ╱ attacks, shifted RIGHT by 1 each row going down

     free = ~(cols | ld | rd) & ((1 << n) − 1)       // legal columns as bits

     row r   ld: 0 0 1 0          a ╲ attack moves one column per row
     row r+1 ld: 0 1 0 0   ◄── shift

   while free ≠ 0:
       bit  ← free & −free            // lowest legal column
       free ← free − bit
       count(cols|bit, (ld|bit) << 1, (rd|bit) >> 1)
```

> Same O(n!) shape, but every set operation is one CPU instruction.

### 📌 Points to remember
- Counting needs **no board**. Don't build strings you never return.
- Symmetry halves the work: count the left half of row 0, double it, then add the middle column once for odd `n`.
- Bitmask trick: `x & −x` isolates the lowest set bit.

---

## 3. M-Coloring Problem (Medium)

### Problem
*(GFG convention)* Given an **undirected** graph with `V` vertices and an integer `m`, can every vertex get one of `m` colors so that **no edge joins two vertices of the same color**? Return true / false.

### Visualize it

```
   V = 4, edges: 0-1, 1-2, 2-3, 3-0, 0-2

          0 ─────── 1
          │ ╲       │
          │   ╲     │        triangle 0-1-2 → needs at least 3 colors
          │     ╲   │
          3 ─────── 2
```

### The decision at every level

```
   level v = vertex v (in order 0, 1, 2, ...)
   choice  = color 1..m
   valid   = no ALREADY-colored neighbor has this color

           color(v) = k ?
       ┌──────────┴──────────┐
   neighbor has k         nobody has k
         ✗                     ✓ → recurse to v+1
```

### The 5 steps

| Step | Answer |
|------|--------|
| Level | vertex `v` |
| Choices | colors `1..m` |
| Validity | scan `v`'s neighbors: none colored `k` |
| Undo | `color[v] ← 0` |
| Answer | true as soon as `v == V` |

### Trace (m = 3) → true

```
   v=0: color 1                         ✓   color = [1, -, -, -]
   v=1: color 1 ✗ (nbr 0)   color 2     ✓   color = [1, 2, -, -]
   v=2: color 1 ✗ (nbr 0)   color 2 ✗ (nbr 1)   color 3 ✓
                                            color = [1, 2, 3, -]
   v=3: color 1 ✗ (nbr 0)   color 2     ✓   (nbrs 2→3, 0→1)
                                            color = [1, 2, 3, 2]
   v=4 == V  → ✅ true

          0(1) ───── 1(2)
           │  ╲       │
           │    ╲     │
          3(2) ───── 2(3)
```

### Trace (m = 2) → false

```
   v=0: 1       v=1: 1✗ 2✓      v=2: 1✗(nbr 0) 2✗(nbr 1)   ✗ dead end
        undo v=1: no colors left → undo v=0
   v=0: 2       v=1: 1✓          v=2: 1✗(nbr 1) 2✗(nbr 0)   ✗ dead end
        undo v=1: 2✗ (nbr 0)     → undo v=0: no colors left
   → ❌ false   (the triangle 0-1-2 can never be 2-colored)
```

### Pseudocode

```
function graphColoring(V, adj, m):
    color ← array of V, all 0          // 0 = uncolored
    return paint(0)

function paint(v):
    if v == V: return true
    for k from 1 to m:
        if no neighbor u of v has color[u] == k:
            color[v] ← k
            if paint(v + 1): return true
            color[v] ← 0                // undo
    return false
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try all colorings, check at end | O(m^V · E) | O(V) |
| **Backtracking, check per vertex** | **O(m^V · deg)** worst, much less in practice | O(V) |

### 📌 Points to remember
- Only compare against **already-colored** neighbors. Uncolored ones (`0`) never conflict.
- Build an **adjacency list** first if the input is an edge list.
- Symmetry: colors are interchangeable, so vertex 0 can always take color 1.
- m = 2 is just **bipartite checking**. BFS/DFS solves that in O(V + E).
- Heuristic: color the **highest-degree** vertex first (most constrained).

---

## 4. Matchsticks to Square (Medium)

### Problem
Use **every** matchstick exactly once (no breaking) to form a square. Return true / false.

### Visualize it

```
   sticks = [1, 1, 2, 2, 2]     total = 8 → each side must be 8 / 4 = 2

        ┌── 2 ──┐
        │       │
        2       2            sides: {2} {2} {2} {1,1}  ✅
        │       │
        └─1──1──┘
```

### Turn it into "fill 4 buckets"

```
   target = total / 4

   ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
   │ b0  │ │ b1  │ │ b2  │ │ b3  │     each bucket must hit EXACTLY target
   └─────┘ └─────┘ └─────┘ └─────┘

   level i = stick i
   choice  = which bucket gets it
   valid   = bucket + stick ≤ target
```

### Early "impossible" checks

```
   ✗ fewer than 4 sticks
   ✗ total % 4 ≠ 0
   ✗ the biggest stick > target
```

### Pruning toolbox

```
  1. SORT DESCENDING    → big sticks fail fast near the root
  2. bucket + stick > target  → skip
  3. SAME-SUM SKIP      → if bucket j has the same current sum as a bucket
                          already tried for this stick, skip it (identical subtree)
  4. EMPTY-BUCKET BREAK → if the stick failed in an EMPTY bucket,
                          it will fail in every other empty bucket → stop
```

### The 5 steps

| Step | Answer |
|------|--------|
| Level | stick `i` (after sorting descending) |
| Choices | bucket `0..3` |
| Validity | `bucket[j] + stick ≤ target` |
| Undo | `bucket[j] −= stick` |
| Answer | true when all sticks placed (all buckets then equal target) |

### Trace 1: [1,1,2,2,2] → true

```
   sorted: [2, 2, 2, 1, 1]    target = 2

   stick 2 → b0      buckets [2, 0, 0, 0]
   stick 2 → b0 ✗ (4 > 2)   → b1      [2, 2, 0, 0]
   stick 2 → b0 ✗  b1 ✗     → b2      [2, 2, 2, 0]
   stick 1 → b0 ✗  b1 ✗  b2 ✗ → b3    [2, 2, 2, 1]
   stick 1 → b0 ✗  b1 ✗  b2 ✗ → b3    [2, 2, 2, 2]
   all placed → ✅ true
```

### Trace 2: [3,3,3,3,4] → false

```
   total = 16, target = 4, biggest = 4 ≤ 4 → passes the early checks
   sorted: [4, 3, 3, 3, 3]

   stick 4 → b0                       [4, 0, 0, 0]
   stick 3 → b0 ✗ → b1                [4, 3, 0, 0]
   stick 3 → b0 ✗  b1 ✗ (6) → b2      [4, 3, 3, 0]
   stick 3 → b0 ✗  b1 ✗  b2 ✗ → b3    [4, 3, 3, 3]
   stick 3 → every bucket ✗           dead end
     undo → b3 was empty and failed  → BREAK (other empties are the same)
     ... every level unwinds the same way
   → ❌ false
```

### Pseudocode

```
function makesquare(sticks):
    total ← sum(sticks)
    if count < 4 or total % 4 ≠ 0: return false
    target ← total / 4
    sort sticks DESCENDING
    if sticks[0] > target: return false
    bucket ← [0, 0, 0, 0]
    return place(0)

function place(i):
    if i == length(sticks): return true
    for j from 0 to 3:
        if bucket[j] + sticks[i] > target: continue
        if j > 0 and bucket[j] == bucket[j−1]: continue   // same-sum skip
        bucket[j] ← bucket[j] + sticks[i]
        if place(i + 1): return true
        bucket[j] ← bucket[j] − sticks[i]                  // undo
        if bucket[j] == 0: break                            // empty-bucket break
    return false
```

> The same-sum check compares neighbors. It catches the most common duplicates (several empty buckets) cheaply.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Plain bucket backtracking | O(4ⁿ) | O(n) |
| + sort + pruning | O(4ⁿ) worst, tiny in practice | O(n) |
| Bitmask DP (`dp[mask]` = side fill) | O(n · 2ⁿ) | O(2ⁿ) |

### 📌 Points to remember
- Run the **3 cheap impossibility checks** before any recursion.
- **Sort descending.** This is the single most important speedup.
- **Empty-bucket break** removes the 4! = 24 ways to relabel identical sides.
- Matchsticks is exactly **Partition to K Equal Sum Subsets with k = 4**.

---

## 5. Partition to K Equal Sum Subsets (Medium)

### Problem
Can `nums` be split into `k` non-empty groups with **equal sums**?

### Visualize it

```
   nums = [4, 3, 2, 3, 5, 2, 1],  k = 4
   total = 20  →  target = 20 / 4 = 5

   ┌─────┐ ┌───────┐ ┌───────┐ ┌───────┐
   │  5  │ │ 4 + 1 │ │ 3 + 2 │ │ 3 + 2 │      ✅ all equal 5
   └─────┘ └───────┘ └───────┘ └───────┘
```

### Two ways to search

```
   WAY A: BUCKET-FILLING (like Matchsticks)
   ─────────────────────────────────────────
   level = number i
   choice = which of the k buckets gets it
   tree width = k, depth = n            →  O(kⁿ)

   WAY B: ONE BUCKET AT A TIME (with a used-mask)
   ─────────────────────────────────────────
   Fill bucket 1 completely, then bucket 2, ...
   level = "pick the next unused number for the CURRENT bucket"
   when current sum == target → start the next bucket from index 0
   state = which numbers are used (a bitmask)

   The current bucket's sum is FIXED by the mask:
       currentSum = sum(used numbers) % target
   → the same mask always means the same situation → MEMOIZE on mask
                                            →  O(n · 2ⁿ)
```

### The 5 steps (Way A)

| Step | Answer |
|------|--------|
| Level | number `i` (sorted descending) |
| Choices | bucket `0..k-1` |
| Validity | `bucket[j] + nums[i] ≤ target` |
| Undo | `bucket[j] −= nums[i]` |
| Pruning | early checks, sort desc, empty-bucket break |

### Trace (Way A): [4,3,2,3,5,2,1], k = 4

```
   early checks: total 20 % 4 = 0 ✓   max 5 ≤ 5 ✓
   sorted desc: [5, 4, 3, 3, 2, 2, 1]   target = 5

   num │ tries (✗ = would exceed 5)        │ buckets after
   ────┼───────────────────────────────────┼──────────────
    5  │ b0 ✓                              │ [5, 0, 0, 0]
    4  │ b0 ✗(9)  b1 ✓                     │ [5, 4, 0, 0]
    3  │ b0 ✗  b1 ✗(7)  b2 ✓               │ [5, 4, 3, 0]
    3  │ b0 ✗  b1 ✗  b2 ✗(6)  b3 ✓         │ [5, 4, 3, 3]
    2  │ b0 ✗  b1 ✗(6)  b2 ✓ (5)           │ [5, 4, 5, 3]
    2  │ b0 ✗  b1 ✗(6)  b2 ✗(7)  b3 ✓ (5)  │ [5, 4, 5, 5]
    1  │ b0 ✗  b1 ✓ (5)                    │ [5, 5, 5, 5]
   all placed → ✅ true

   Groups: {5} {4,1} {3,2} {3,2}
```

> With descending order this example needs **zero** backtracks.
> Unsorted, the search tries many more dead ends before succeeding.

### Pseudocode (Way A: bucket-filling)

```
function canPartitionKSubsets(nums, k):
    total ← sum(nums)
    if total % k ≠ 0: return false
    target ← total / k
    sort nums DESCENDING
    if nums[0] > target: return false
    bucket ← array of k zeros
    return place(0)

function place(i):
    if i == n: return true
    for j from 0 to k−1:
        if bucket[j] + nums[i] > target: continue
        bucket[j] ← bucket[j] + nums[i]
        if place(i + 1): return true
        bucket[j] ← bucket[j] − nums[i]
        if bucket[j] == 0: break                // empty-bucket break
    return false
```

### Pseudocode (Way B: one bucket at a time + memo)

```
function canPartition(mask, currSum):           // memo[mask] ∈ {unknown, true, false}
    if mask == all used: return true
    if memo[mask] known: return memo[mask]
    for i from 0 to n−1:
        if i is used in mask: continue
        if currSum + nums[i] > target: break      // nums sorted ASCENDING here
        next ← (currSum + nums[i]) % target       // full bucket → restart at 0
        if canPartition(mask | (1 << i), next):
            memo[mask] ← true; return true
    memo[mask] ← false
    return false

start: canPartition(0, 0)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Way A: bucket-filling | O(kⁿ) worst | O(n + k) |
| **Way B: mask + memo** | **O(n · 2ⁿ)** | O(2ⁿ) |

> Way A is usually faster on easy inputs thanks to pruning.
> Way B has a guaranteed bound, which matters on adversarial tests.

### 📌 Points to remember
- Same 3 early checks as Matchsticks: `total % k`, the largest number ≤ target, enough numbers.
- **Sort descending** (Way A) / **ascending + break** (Way B).
- Way B's key fact: the mask **determines** the current partial sum, so memo on the mask alone is valid.
- Generalizes Matchsticks (k = 4) and Partition Equal Subset Sum (k = 2, where knapsack DP is better).

---

## 6. Knight's Tour (Medium)

### Problem
*(GFG-style convention)* On an `N × N` board, a knight starts at `(0, 0)` and must visit **every square exactly once**.
Print the board with each square labeled by its **move number**. GFG labels moves `0 .. N²−1`.
This guide shows `1 .. N²` for readability. Subtract 1 to match GFG. Return "no solution" if none exists.

### Visualize the knight's moves

```
          ┌───┬───┬───┬───┬───┐
          │   │ ● │   │ ● │   │        8 possible jumps:
          ├───┼───┼───┼───┼───┤        (±1, ±2) and (±2, ±1)
          │ ● │   │   │   │ ● │
          ├───┼───┼───┼───┼───┤        dr = [ 2, 1,−1,−2,−2,−1, 1, 2]
          │   │   │ ♞ │   │   │        dc = [ 1, 2, 2, 1,−1,−2,−2,−1]
          ├───┼───┼───┼───┼───┤
          │ ● │   │   │   │ ● │
          ├───┼───┼───┼───┼───┤
          │   │ ● │   │ ● │   │
          └───┴───┴───┴───┴───┘
```

### The decision at every level

```
   level k = move number k (k = 2 .. N²)
   choice  = one of 8 jumps from the current square
   valid   = lands on the board AND the square is unvisited
   undo    = clear that square back to "unvisited"
```

### Why brute force is huge

```
   Up to 8 choices per move, N² − 1 moves:
       5×5 → up to 8²⁴ ≈ 4.7 × 10²¹ branches (upper bound)
       8×8 → up to 8⁶³ — hopeless without pruning or a heuristic

   Most branches die quickly (walls + visited squares), but the plain
   search still explodes on 8×8 because it strands CORNERS for later.
```

### Warnsdorff's heuristic: go where you'd have the fewest exits

```
   Degree = number of onward moves from a square (on an empty 5×5 board):

        ┌───┬───┬───┬───┬───┐
        │ 2 │ 3 │ 4 │ 3 │ 2 │
        ├───┼───┼───┼───┼───┤
        │ 3 │ 4 │ 6 │ 4 │ 3 │       corners = 2 exits  → visit EARLY
        ├───┼───┼───┼───┼───┤       center  = 8 exits  → safe to leave LATE
        │ 4 │ 6 │ 8 │ 6 │ 4 │
        ├───┼───┼───┼───┼───┤
        │ 3 │ 4 │ 6 │ 4 │ 3 │
        ├───┼───┼───┼───┼───┤
        │ 2 │ 3 │ 4 │ 3 │ 2 │
        └───┴───┴───┴───┴───┘

   Rule: among the legal next squares, try the one with the FEWEST
         unvisited onward moves first (recompute as squares get used).
   Effect: hard-to-reach squares get used before they become dead ends.
           On 8×8 it usually finds a tour with almost no backtracking.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Level | move number `k` |
| Choices | 8 jumps (ordered by Warnsdorff for speed) |
| Validity | inside board and `board[r][c]` unvisited |
| Undo | `board[r][c] ← unvisited` |
| Answer | true when `k` passes `N²` |

### A valid 5×5 tour from (0,0)

```
        c=0  c=1  c=2  c=3  c=4
      ┌────┬────┬────┬────┬────┐
  r=0 │  1 │ 14 │  9 │ 20 │  3 │
      ├────┼────┼────┼────┼────┤
  r=1 │ 24 │ 19 │  2 │ 15 │ 10 │
      ├────┼────┼────┼────┼────┤
  r=2 │ 13 │  8 │ 23 │  4 │ 21 │
      ├────┼────┼────┼────┼────┤
  r=3 │ 18 │ 25 │  6 │ 11 │ 16 │
      ├────┼────┼────┼────┼────┤
  r=4 │  7 │ 12 │ 17 │ 22 │  5 │
      └────┴────┴────┴────┴────┘
```

Every step is a legal knight jump:

```
  1 (0,0) → 2 (1,2)  (+1,+2)     14 (0,1) → 15 (1,3)  (+1,+2)
  2 (1,2) → 3 (0,4)  (−1,+2)     15 (1,3) → 16 (3,4)  (+2,+1)
  3 (0,4) → 4 (2,3)  (+2,−1)     16 (3,4) → 17 (4,2)  (+1,−2)
  4 (2,3) → 5 (4,4)  (+2,+1)     17 (4,2) → 18 (3,0)  (−1,−2)
  5 (4,4) → 6 (3,2)  (−1,−2)     18 (3,0) → 19 (1,1)  (−2,+1)
  6 (3,2) → 7 (4,0)  (+1,−2)     19 (1,1) → 20 (0,3)  (−1,+2)
  7 (4,0) → 8 (2,1)  (−2,+1)     20 (0,3) → 21 (2,4)  (+2,+1)
  8 (2,1) → 9 (0,2)  (−2,+1)     21 (2,4) → 22 (4,3)  (+2,−1)
  9 (0,2) → 10 (1,4) (+1,+2)     22 (4,3) → 23 (2,2)  (−2,−1)
 10 (1,4) → 11 (3,3) (+2,−1)     23 (2,2) → 24 (1,0)  (−1,−2)
 11 (3,3) → 12 (4,1) (+1,−2)     24 (1,0) → 25 (3,1)  (+2,+1)
 12 (4,1) → 13 (2,0) (−2,−1)
 13 (2,0) → 14 (0,1) (−2,+1)
                                 all 25 squares used exactly once ✅
```

> Notice the center square (degree 8) is visited at move 23, near the end, just as Warnsdorff predicts.

### Which board sizes have a tour?

```
   N = 1        trivially yes (one square)
   N = 2, 3, 4  NO tour exists → the search must return "no solution"
   N ≥ 5        a tour exists (from a corner start, as above)
```

### Pseudocode

```
function knightTour(N):
    board ← N × N of 0              // 0 = unvisited
    board[0][0] ← 1
    if tour(0, 0, 2): return board
    return "no solution"

function tour(r, c, k):              // k = the move number to place next
    if k > N·N: return true
    candidates ← every (r+dr, c+dc) inside the board with board value 0
    sort candidates by onwardDegree ascending          // Warnsdorff (optional)
    for each (nr, nc) in candidates:
        board[nr][nc] ← k
        if tour(nr, nc, k + 1): return true
        board[nr][nc] ← 0                               // undo
    return false

function onwardDegree(r, c):
    return number of jumps from (r, c) that land on an unvisited square
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Plain backtracking | O(8^(N²)) worst | O(N²) |
| **Backtracking + Warnsdorff** | near O(N²) in practice | O(N²) |
| Warnsdorff alone, no backtracking | O(N²) but can fail rarely | O(N²) |

### 📌 Points to remember
- Store the **move number** in the board. It doubles as the "visited" marker (0 = free).
- Check bounds **before** reading the board.
- The order of the 8 jump directions changes speed a lot. Warnsdorff ordering is the fix.
- 2×2, 3×3 and 4×4 have **no** tour. Don't wait for a search to "find" one.
- Know your convention: GFG prints 0..N²−1, many textbooks print 1..N².

---

## 7. Master Cheat Sheet

### All 6 problems at a glance

```
┌────────────────────────┬──────────────┬───────────────┬──────────────────────────────┬──────────────┐
│ Problem                │ Level        │ Choices       │ Validity check               │ Best known   │
├────────────────────────┼──────────────┼───────────────┼──────────────────────────────┼──────────────┤
│ N-Queens               │ row r        │ column c      │ cols, r−c, r+c sets          │ ≈ O(n!)      │
│ N-Queens II            │ row r        │ column c      │ same, or 3 bitmasks          │ ≈ O(n!)      │
│ M-Coloring             │ vertex v     │ color 1..m    │ no colored neighbor shares it│ O(m^V)       │
│ Matchsticks to Square  │ stick i      │ bucket 0..3   │ bucket + stick ≤ side        │ O(n·2ⁿ) DP   │
│ Partition K Equal Sum  │ number i     │ bucket 0..k−1 │ bucket + num ≤ target        │ O(n·2ⁿ) DP   │
│ Knight's Tour          │ move k       │ 8 jumps       │ on board and unvisited       │ ~O(N²) w/ W. │
└────────────────────────┴──────────────┴───────────────┴──────────────────────────────┴──────────────┘
```

### Pattern family tree

```
                     CONSTRAINT-BASED BACKTRACKING
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
   PLACE WITHOUT CONFLICT    FILL BUCKETS EXACTLY     VISIT EVERYTHING ONCE
   (attack / adjacency)      (sum targets)            (path covering)
        │                        │                         │
   ├─ N-Queens              ├─ Matchsticks (k = 4)     └─ Knight's Tour
   ├─ N-Queens II           └─ Partition K Equal Sum       (cousin: Hamiltonian
   └─ M-Coloring                 (cousin: Partition         path, Unique Paths III)
      (cousin: Sudoku)            Equal Subset Sum, k=2)
```

### The pruning card

```
  ┌───────────────────────────────┬──────────────────────────────────────┐
  │ Trick                         │ Where it applies                     │
  ├───────────────────────────────┼──────────────────────────────────────┤
  │ O(1) validity sets            │ Queens (cols, r−c, r+c)              │
  │ Bitmasks                      │ Queens II, Partition K (Way B)       │
  │ Cheap impossibility tests     │ Matchsticks, Partition K (sum % k)   │
  │ Sort descending               │ Matchsticks, Partition K             │
  │ Empty / same-sum bucket skip  │ Matchsticks, Partition K             │
  │ Fix the first choice          │ Coloring (vertex 0 = color 1)        │
  │ Mirror symmetry               │ Queens (half of row 0, then double)  │
  │ Fewest-options-first          │ Knight (Warnsdorff), Coloring, Sudoku│
  │ Memo on state                 │ Partition K (mask determines sum)    │
  └───────────────────────────────┴──────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Can I reject a choice in O(1)?                  → keep sets / arrays / bitmasks
  ☐ Is there a quick "impossible" test up front?    → sum % k, max > target, N ∈ {2,3,4}
  ☐ Would a different order fail faster?            → sort desc / most-constrained first
  ☐ Are some choices interchangeable?               → break symmetry (first empty bucket only)
  ☐ Does the same state repeat?                     → memoize (bitmask of used items)
  ☐ Am I only counting?                             → drop the board, count leaves
```

### 🚩 Common bugs to avoid

```
  ✗ Forgetting to UNDO one of the marks (e.g. removing from cols but not diag)
  ✗ Negative index for r − c in an array (offset by n − 1)
  ✗ Coloring: comparing against uncolored (0) neighbors as if they conflict
  ✗ Matchsticks: no total % 4 check → long useless search
  ✗ Partition K: "empty-bucket break" placed BEFORE undo (must be after)
  ✗ Partition K Way B: memo keyed on (mask, sum) when mask alone suffices (waste)
  ✗ Knight: reading board[r][c] before checking bounds
  ✗ Knight: mixing the 0-based vs 1-based move-number convention
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What is the ONE decision at this level, and which      ║
   ║   rule can I check RIGHT NOW to kill a bad choice?"      ║
   ╚══════════════════════════════════════════════════════════╝
     Cheap early rejection is the whole game in constraint problems.
```

---

### ✅ Progress tracker

- [ ] N-Queens (Hard)
- [ ] N-Queens II (Hard)
- [ ] M-Coloring Problem (Medium)
- [ ] Matchsticks to Square (Medium)
- [ ] Partition to K Equal Sum Subsets (Medium)
- [ ] Knight's Tour (Medium)
