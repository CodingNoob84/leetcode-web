# Matrix Simulation: A Visual Guide

> **Goal:** Learn to move around a 2D grid **by rules you can draw**: map indices, walk shrinking
> boundaries, rotate with transpose + reverse, and reuse the grid itself as scratch memory.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> For matrices as DP tables see [../dynammic programming/02-2D-Grid-DP.md](../dynammic%20programming/02-2D-Grid-DP.md).

---

## Table of Contents

0. [The Big Idea: Walk the Grid by Rules](#0-the-big-idea-walk-the-grid-by-rules)
1. [Convert 1D Array Into 2D Array (Easy)](#1-convert-1d-array-into-2d-array-easy)
2. [Spiral Matrix (Medium)](#2-spiral-matrix-medium)
3. [Rotate Image (Medium)](#3-rotate-image-medium)
4. [Set Matrix Zeroes (Medium)](#4-set-matrix-zeroes-medium)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Convert 1D → 2D → Spiral Matrix → Rotate Image → Set Matrix Zeroes.
> Each one adds exactly one tool: first **index mapping**, then **boundaries that shrink**,
> then **in-place transforms**, and finally **using the matrix itself as marker storage**.

---

## 0. The Big Idea: Walk the Grid by Rules

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "MATRIX SIMULATION"                     │
├──────────────────────────────────────────────────────────────────┤
│  • "Reshape / convert / flatten" a matrix or an array            │
│  • "Return the elements in SPIRAL order" / "fill in spiral"      │
│  • "ROTATE the image by 90°" / "flip" / "transpose"              │
│  • "If a cell is 0, set its whole ROW and COLUMN to 0"           │
│  • "Do it IN PLACE" / "O(1) extra space"                         │
│  • No "best", no "count ways": you just have to MOVE correctly   │
└──────────────────────────────────────────────────────────────────┘

  ⚠ "Min path sum / unique paths in a grid"   → that's 2D GRID DP, not simulation.
  ⚠ "Search a sorted matrix"                   → that's BINARY SEARCH on the index map.
  ⚠ "Number of islands / shortest path"        → that's BFS / DFS on a grid.
```

> 💡 Simulation problems have **no clever answer to find**. The whole difficulty is
> getting the indices right. So the strategy is always: **draw it, name the boundaries, then loop.**

### Tool 1: index mapping (1D ↔ 2D)

```
  A 1D array of length m·n laid out ROW BY ROW in an m × n grid (here n = 4 columns):

  k :   0   1   2   3   4   5   6   7   8   9  10  11
       ─────────────── ──────────────── ───────────────
            row 0           row 1           row 2

         col:  0    1    2    3
              ┌────┬────┬────┬────┐
       row 0  │ 0  │ 1  │ 2  │ 3  │
              ├────┼────┼────┼────┤
       row 1  │ 4  │ 5  │ 6  │ 7  │      k = 6  →  (6 / 4, 6 % 4) = (1, 2) ✓
              ├────┼────┼────┼────┤
       row 2  │ 8  │ 9  │ 10 │ 11 │      k = 11 →  (11 / 4, 11 % 4) = (2, 3) ✓
              └────┴────┴────┴────┘

  ┌──────────────────────────────────────────────────┐
  │   1D → 2D :   k  →  ( k / n ,  k % n )           │
  │   2D → 1D :   (r, c)  →  r · n + c               │
  │   n = number of COLUMNS (not rows!)              │
  └──────────────────────────────────────────────────┘
```

### Tool 2: four shrinking boundaries

```
             left                 right
              ▼                     ▼
            ┌────┬────┬────┬────┬────┐
   top    ► │ →  │ →  │ →  │ →  │ ↓  │      1. walk TOP row    left → right, then top++
            ├────┼────┼────┼────┼────┤
            │ ↑  │    │    │    │ ↓  │      2. walk RIGHT col  top → bottom, then right--
            ├────┼────┼────┼────┼────┤
            │ ↑  │    │    │    │ ↓  │      3. walk BOTTOM row right → left, then bottom--
            ├────┼────┼────┼────┼────┤
   bottom ► │ ←  │ ←  │ ←  │ ←  │ ←  │      4. walk LEFT col   bottom → top, then left++
            └────┴────┴────┴────┴────┘
                                            repeat while top ≤ bottom AND left ≤ right

  After each side is walked, that side's boundary moves INWARD by one.
  The "box" shrinks like peeling an onion, one layer at a time.
```

### Tool 3: transpose + reverse = rotate

```
   original             transpose               reverse each row
                     (swap across the ↘)        (mirror left ↔ right)
  ┌───┬───┬───┐       ┌───┬───┬───┐              ┌───┬───┬───┐
  │ 1 │ 2 │ 3 │       │ 1 │ 4 │ 7 │              │ 7 │ 4 │ 1 │
  ├───┼───┼───┤       ├───┼───┼───┤              ├───┼───┼───┤
  │ 4 │ 5 │ 6 │  ──►  │ 2 │ 5 │ 8 │     ──►      │ 8 │ 5 │ 2 │   = rotated 90° clockwise ✅
  ├───┼───┼───┤       ├───┼───┼───┤              ├───┼───┼───┤
  │ 7 │ 8 │ 9 │       │ 3 │ 6 │ 9 │              │ 9 │ 6 │ 3 │
  └───┴───┴───┘       └───┴───┴───┘              └───┴───┴───┘
   (r, c)          →    (c, r)            →        (c, n−1−r)

  A rotation is hard to do in place. Two FLIPS are easy to do in place.
  Two flips compose into one rotation.
```

### Tool 4: the first row / column as marker storage

```
  Need to remember "row i is dirty" and "column j is dirty"?
  Instead of two extra arrays, write the note INSIDE the matrix:

             col markers live in ROW 0
              ▼    ▼    ▼    ▼
            ┌────┬────┬────┬────┐
          ► │ ## │ c1 │ c2 │ c3 │
            ├────┼────┼────┼────┤
  row     ► │ r1 │    │    │    │
  markers   ├────┼────┼────┼────┤
  live in ► │ r2 │    │    │    │
  COLUMN 0  └────┴────┴────┴────┘

  ## = cell (0,0) is SHARED by row 0 and column 0 → it can only hold ONE fact.
       → keep ONE extra boolean for the other one (e.g. "column 0 has a zero").
```

### Complexity at a glance

```
   ┌──────────────────────────┬─────────────────┬────────────────┐
   │ Problem                  │ Time            │ Extra space    │
   ├──────────────────────────┼─────────────────┼────────────────┤
   │ Convert 1D → 2D          │ O(m·n)          │ O(1) + output  │
   │ Spiral Matrix            │ O(m·n)          │ O(1) + output  │
   │ Rotate Image             │ O(n²)           │ O(1) in place  │
   │ Set Matrix Zeroes        │ O(m·n)          │ O(1) in place  │
   └──────────────────────────┴─────────────────┴────────────────┘
   You must touch every cell at least once, so O(m·n) is optimal for all four.
   The game is always about SPACE and about not getting indices wrong.
```

---

## 1. Convert 1D Array Into 2D Array (Easy)

### Problem
Given a 1D array `original` and integers `m`, `n`, build an `m × n` 2D array using **all** elements of `original`,
row by row. If that is impossible, return an empty 2D array.

### Visualize it

```
  original = [ 1, 2, 3, 4, 5, 6 ],  m = 2, n = 3

  k:          0    1    2    3    4    5
            [ 1 ,  2 ,  3 ,  4 ,  5 ,  6 ]
              └─── row 0 ──┘  └── row 1 ──┘

              ┌───┬───┬───┐
       row 0  │ 1 │ 2 │ 3 │
              ├───┼───┼───┤
       row 1  │ 4 │ 5 │ 6 │
              └───┴───┴───┘
```

### The key decision

```
                     len(original)  ==  m · n ?
                    ┌───────────────┴────────────────┐
                   YES                               NO
                    │                                │
        every k lands on exactly one           some cell would be empty,
        cell (k / n, k % n)                    or some number left over
                    │                                │
               FILL the grid                    return [ ]  (empty)
```

### The 4 steps

| Step | Answer |
|------|--------|
| Guard | if `len(original) ≠ m·n` → return empty |
| Allocate | `m` rows, each of length `n` |
| Map | element `k` goes to row `k / n`, column `k % n` |
| Answer | the filled grid |

### Trace 1 (original = [1, 2, 3, 4, 5, 6], m = 2, n = 3)

```
  len = 6, m·n = 2·3 = 6  → OK

  k │ value │ k / 3 │ k % 3 │ cell
  ──┼───────┼───────┼───────┼───────
  0 │   1   │   0   │   0   │ (0,0)
  1 │   2   │   0   │   1   │ (0,1)
  2 │   3   │   0   │   2   │ (0,2)
  3 │   4   │   1   │   0   │ (1,0)     ← k / n ticks over to the next row
  4 │   5   │   1   │   1   │ (1,1)
  5 │   6   │   1   │   2   │ (1,2)

  grid after each row is done:

    after k=2           after k=5
   ┌───┬───┬───┐       ┌───┬───┬───┐
   │ 1 │ 2 │ 3 │       │ 1 │ 2 │ 3 │
   ├───┼───┼───┤       ├───┼───┼───┤
   │ . │ . │ . │       │ 4 │ 5 │ 6 │
   └───┴───┴───┘       └───┴───┴───┘

  answer = [[1, 2, 3], [4, 5, 6]] ✅
```

### Trace 2 (same array, m = 3, n = 2): same numbers, different shape

```
  k │ value │ k / 2 │ k % 2 │ cell
  ──┼───────┼───────┼───────┼───────
  0 │   1   │   0   │   0   │ (0,0)
  1 │   2   │   0   │   1   │ (0,1)
  2 │   3   │   1   │   0   │ (1,0)
  3 │   4   │   1   │   1   │ (1,1)
  4 │   5   │   2   │   0   │ (2,0)
  5 │   6   │   2   │   1   │ (2,1)

   ┌───┬───┐
   │ 1 │ 2 │
   ├───┼───┤
   │ 3 │ 4 │      answer = [[1, 2], [3, 4], [5, 6]] ✅
   ├───┼───┤
   │ 5 │ 6 │      ⚠ divide by n = COLUMNS (2), never by m.
   └───┴───┘
```

### Trace 3 (original = [1, 2], m = 1, n = 1): impossible

```
  len = 2, m·n = 1  → 2 ≠ 1  → return [ ] ✅
  (one cell can't hold two numbers)
```

### Pseudocode

```
function construct2DArray(original, m, n):
    if length(original) ≠ m × n:
        return empty list
    grid ← m × n array
    for k from 0 to m·n − 1:
        grid[k / n][k % n] ← original[k]        // integer division
    return grid

// equivalent "row by row" form:
//   for r from 0 to m-1:
//       for c from 0 to n-1:
//           grid[r][c] ← original[r·n + c]
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Nested loops with a separate running pointer `k` | O(m·n) | O(1) + output |
| **One loop over k with `(k / n, k % n)`** | **O(m·n)** | **O(1) + output** ✅ |

> Both are optimal; the index-map version is shorter and has nothing to keep in sync.
> The **check `len == m·n` first** is the part people forget.

### Where this mapping shows up again

```
  • Reshape the Matrix (LC 566): read old (r, c) → k → new (k / newN, k % newN)
  • Search a 2D Matrix: binary search over k in [0, m·n − 1],
    read the middle as grid[mid / n][mid % n]
    → see ../binary search/04-Search-in-2D-Matrix.md
```

Link: [../binary search/04-Search-in-2D-Matrix.md](../binary%20search/04-Search-in-2D-Matrix.md)

### 📌 Points to remember
- Check `len(original) == m·n` **before** anything else.
- Divide and mod by **n (columns)**. Using m only works by luck when m = n.
- `(r, c) → r·n + c` is the reverse map; together they let you treat a grid as a flat array.

---

## 2. Spiral Matrix (Medium)

### Problem
Given an `m × n` matrix, return all of its elements in **spiral order** (clockwise, starting top-left).

### Visualize it

```
   ┌────┬────┬────┬────┐
   │  1 →  2 →  3 →  4 │
   ├────┼────┼────┼─ ↓ ┤
   │  5 →  6 →  7 │  8 │
   ├─ ↑ ┼────┼────┼─ ↓ ┤
   │  9 ← 10 ← 11 ← 12 │
   └────┴────┴────┴────┘

   output = 1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7
```

### The key decision: when to walk the 3rd and 4th side

```
  After walking TOP (top++) and RIGHT (right--), the box may have COLLAPSED:

     single row left                    single column left
     ┌────┬────┬────┐                   ┌────┐
     │ a  │ b  │ c  │                   │ a  │
     └────┴────┴────┘                   ├────┤
     top row eats it all,               │ b  │
     top++ → top > bottom               ├────┤
                                        │ c  │
                                        └────┘
                                        right col eats it all,
                                        right-- → left > right

   ┌──────────────────────────────────────────────────────────────┐
   │  walk BOTTOM only if  top ≤ bottom                           │
   │  walk LEFT   only if  left ≤ right                           │
   │  otherwise you walk the SAME cells again in reverse (dupes!) │
   └──────────────────────────────────────────────────────────────┘
```

### The 4 sides, one round

| Side | Walk | Then |
|------|------|------|
| Top | row `top`, columns `left → right` | `top++` |
| Right | column `right`, rows `top → bottom` | `right--` |
| Bottom (if `top ≤ bottom`) | row `bottom`, columns `right → left` | `bottom--` |
| Left (if `left ≤ right`) | column `left`, rows `bottom → top` | `left++` |

### Trace (3 × 4 matrix)

```
  matrix:
          c0   c1   c2   c3
   r0  [   1,   2,   3,   4 ]
   r1  [   5,   6,   7,   8 ]
   r2  [   9,  10,  11,  12 ]

  start: top = 0, bottom = 2, left = 0, right = 3

  ── ROUND 1 ─────────────────────────────────────────────────────────────
  TOP    row 0, c 0..3   → 1, 2, 3, 4            top    = 1
  RIGHT  col 3, r 1..2   → 8, 12                 right  = 2
  top 1 ≤ bottom 2 ✓
  BOTTOM row 2, c 2..0   → 11, 10, 9             bottom = 1
  left 0 ≤ right 2 ✓
  LEFT   col 0, r 1..1   → 5                     left   = 1

   visited so far (■) and the box that remains (□):
   ┌───┬───┬───┬───┐
   │ ■ │ ■ │ ■ │ ■ │
   ├───┼───┼───┼───┤
   │ ■ │ □ │ □ │ ■ │      box: top = 1, bottom = 1, left = 1, right = 2
   ├───┼───┼───┼───┤
   │ ■ │ ■ │ ■ │ ■ │
   └───┴───┴───┴───┘

  ── ROUND 2 ─────────────────────────────────────────────────────────────
  TOP    row 1, c 1..2   → 6, 7                  top    = 2
  RIGHT  col 2, r 2..1   → (empty range)         right  = 1
  top 2 ≤ bottom 1 ✗  → SKIP bottom             ← guard saves us from re-reading 7, 6
  left 1 ≤ right 1 ✓
  LEFT   col 1, r from 1 down to 2  → (empty range)  left = 2

  loop check: top 2 > bottom 1 → stop

  output = 1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7 ✅   (12 numbers = 3 · 4)
```

### Why the guard matters: single row and single column

```
  SINGLE ROW  [[1, 2, 3]]          top=0, bottom=0, left=0, right=2

    TOP    row 0, c 0..2  → 1, 2, 3        top = 1
    RIGHT  col 2, r 1..0  → (empty)        right = 1
    no guard:  BOTTOM row 0, c 1..0 → 2, 1   ✗  output 1,2,3,2,1
    with guard: top 1 ≤ bottom 0 ✗ → skip     ✓  output 1,2,3 ✅

  SINGLE COLUMN  [[1], [2], [3]]    top=0, bottom=2, left=0, right=0

    TOP    row 0, c 0..0  → 1              top = 1
    RIGHT  col 0, r 1..2  → 2, 3           right = −1
    top 1 ≤ bottom 2 ✓
    BOTTOM row 2, c −1..0 → (empty)        bottom = 1
    no guard:  LEFT col 0, r 1..1 → 2        ✗  output 1,2,3,2
    with guard: left 0 ≤ right −1 ✗ → skip   ✓  output 1,2,3 ✅
```

> 💡 Rule: the **first two sides never need a guard** (the loop condition already covers them).
> The **last two sides always do**, because sides 1 and 2 just moved `top` and `right`.

### Pseudocode (boundaries)

```
function spiralOrder(matrix):
    top ← 0, bottom ← m − 1, left ← 0, right ← n − 1
    out ← empty list
    while top ≤ bottom and left ≤ right:
        for c from left to right:          out.append(matrix[top][c])
        top ← top + 1
        for r from top to bottom:          out.append(matrix[r][right])
        right ← right − 1
        if top ≤ bottom:
            for c from right down to left: out.append(matrix[bottom][c])
            bottom ← bottom − 1
        if left ≤ right:
            for r from bottom down to top: out.append(matrix[r][left])
            left ← left + 1
    return out
```

### Alternative: direction array + "turn right when blocked"

```
  directions (clockwise):   d = 0      1       2       3
                                right   down    left    up
                     dr  =  [  0,      1,      0,     −1 ]
                     dc  =  [  1,      0,     −1,      0 ]

  Walk one step at a time. If the next cell is OUTSIDE the grid or already
  VISITED, turn:  d ← (d + 1) % 4.  Stop after m·n cells.

           ┌────┬────┬────┐
     d=0 → │ 1  │ 2  │ 3  │ ┐
           ├────┼────┼────┤ │ d=1
         ┌ │ 4  │ 5  │ 6  │ │
     d=3 │ ├────┼────┼────┤ ▼
         └ │ 7  │ 8  │ 9  │
           └────┴────┴────┘
                ◄── d=2
```

### Trace (direction array, 3 × 3, values 1..9)

```
  step │ cell  │ value │ next cell in dir │ blocked? │ dir after
  ─────┼───────┼───────┼──────────────────┼──────────┼──────────
    1  │ (0,0) │   1   │ (0,1)            │          │ right
    2  │ (0,1) │   2   │ (0,2)            │          │ right
    3  │ (0,2) │   3   │ (0,3) outside    │   yes    │ down
    4  │ (1,2) │   6   │ (2,2)            │          │ down
    5  │ (2,2) │   9   │ (3,2) outside    │   yes    │ left
    6  │ (2,1) │   8   │ (2,0)            │          │ left
    7  │ (2,0) │   7   │ (2,−1) outside   │   yes    │ up
    8  │ (1,0) │   4   │ (0,0) visited    │   yes    │ right
    9  │ (1,1) │   5   │  — 9 cells done, stop      │

  output = 1, 2, 3, 6, 9, 8, 7, 4, 5 ✅
```

```
function spiralOrderDirections(matrix):
    dr ← [0, 1, 0, −1],  dc ← [1, 0, −1, 0]
    seen ← m × n booleans, all false
    r ← 0, c ← 0, d ← 0
    out ← empty list
    repeat m·n times:
        out.append(matrix[r][c]);  seen[r][c] ← true
        nr ← r + dr[d],  nc ← c + dc[d]
        if nr, nc outside the grid or seen[nr][nc]:
            d ← (d + 1) % 4
            nr ← r + dr[d],  nc ← c + dc[d]
        r ← nr, c ← nc
    return out
```

### Complexity + optimization ladder

| Approach | Time | Extra space |
|---|---|---|
| Direction array + `seen` matrix | O(m·n) | O(m·n) |
| Direction array, mark visited cells in the input (e.g. a sentinel) | O(m·n) | O(1), but **destroys the input** |
| **Four boundaries** | **O(m·n)** | **O(1)** ✅ |

> **Spiral Matrix II** (fill 1..n² in spiral order) uses the exact same loop; write `counter++`
> into the cell instead of reading it.

### 📌 Points to remember
- Shrink a boundary **right after** walking its side.
- Guard the **bottom** walk with `top ≤ bottom` and the **left** walk with `left ≤ right`.
- Test on a single row, a single column, and a 1 × 1 matrix before trusting your loop.
- The output must have exactly `m·n` numbers; that's your sanity check.

---

## 3. Rotate Image (Medium)

### Problem
Rotate an `n × n` matrix by **90° clockwise, in place** (no second matrix).

### Visualize it

```
   before                    after
  ┌───┬───┬───┐            ┌───┬───┬───┐
  │ 1 │ 2 │ 3 │            │ 7 │ 4 │ 1 │
  ├───┼───┼───┤    90° ↻   ├───┼───┼───┤
  │ 4 │ 5 │ 6 │   ─────►   │ 8 │ 5 │ 2 │
  ├───┼───┼───┤            ├───┼───┼───┤
  │ 7 │ 8 │ 9 │            │ 9 │ 6 │ 3 │
  └───┴───┴───┘            └───┴───┴───┘

  the first ROW (1 2 3) becomes the last COLUMN (top → bottom)
  cell (r, c) moves to (c, n − 1 − r)
```

### The key decision

```
                    rotate in place?
           ┌─────────────────┴──────────────────┐
     two simple flips                     move each cell directly
  transpose + reverse rows               layer by layer, 4-way swap
           │                                    │
   easy to get right                  every cell moved once,
   every cell moved twice              but index math is trickier
```

### Method 1: transpose, then reverse each row

| Step | What | Loop |
|------|------|------|
| Transpose | swap `(r, c)` with `(c, r)` | only `c > r` (upper triangle) |
| Reverse rows | swap `(r, c)` with `(r, n−1−c)` | `c < n/2` |

### Trace (3 × 3)

```
  START                    TRANSPOSE (3 swaps)          REVERSE EACH ROW
  ┌───┬───┬───┐            ┌───┬───┬───┐                ┌───┬───┬───┐
  │ 1 │ 2 │ 3 │            │ 1 │ 4 │ 7 │                │ 7 │ 4 │ 1 │
  ├───┼───┼───┤            ├───┼───┼───┤                ├───┼───┼───┤
  │ 4 │ 5 │ 6 │    ──►     │ 2 │ 5 │ 8 │      ──►       │ 8 │ 5 │ 2 │
  ├───┼───┼───┤            ├───┼───┼───┤                ├───┼───┼───┤
  │ 7 │ 8 │ 9 │            │ 3 │ 6 │ 9 │                │ 9 │ 6 │ 3 │
  └───┴───┴───┘            └───┴───┴───┘                └───┴───┴───┘

  transpose swaps:  (0,1)↔(1,0): 2↔4    (0,2)↔(2,0): 3↔7    (1,2)↔(2,1): 6↔8
  diagonal 1, 5, 9 never moves.

  reverse swaps:    row 0: 1↔7     row 1: 2↔8     row 2: 3↔9   (middle column stays)

  answer = [[7,4,1],[8,5,2],[9,6,3]] ✅
```

### ⚠ The double-swap trap

```
  If the transpose loop runs c over ALL columns (not just c > r):
     (0,1)↔(1,0) swaps 2 and 4 ...
     later (1,0)↔(0,1) swaps them BACK.
  Every pair is swapped twice → matrix unchanged ✗

  Fix: for r in 0..n-1, for c in r+1..n-1   (strictly above the diagonal)
```

### Method 2: layer by layer, 4-way swap

```
  Each layer is a square ring. Four cells, one on each side, form a cycle:

        first            last
          ▼               ▼
        ┌───┬───┬───┬───┐
  first►│ A │   │   │ B │        A (top)    → goes to B's spot (right)
        ├───┼───┼───┼───┤        B (right)  → goes to C's spot (bottom)
        │   │   │   │   │        C (bottom) → goes to D's spot (left)
        ├───┼───┼───┼───┤        D (left)   → goes to A's spot (top)
        │   │   │   │   │
        ├───┼───┼───┼───┤        Save A in temp, then pull backwards:
  last► │ D │   │   │ C │          top    ← left
        └───┴───┴───┴───┘          left   ← bottom
                                   bottom ← right
                                   right  ← temp
  For offset i = 0 .. (last − first − 1):
     top    = (first,     first + i)
     right  = (first + i, last)
     bottom = (last,      last − i)
     left   = (last − i,  first)
```

### Trace (layer swap, 4 × 4)

```
  START
  ┌────┬────┬────┬────┐
  │  1 │  2 │  3 │  4 │
  ├────┼────┼────┼────┤
  │  5 │  6 │  7 │  8 │
  ├────┼────┼────┼────┤
  │  9 │ 10 │ 11 │ 12 │
  ├────┼────┼────┼────┤
  │ 13 │ 14 │ 15 │ 16 │
  └────┴────┴────┴────┘

  LAYER 0 (first = 0, last = 3), offsets i = 0, 1, 2

  i=0: cells (0,0) (0,3) (3,3) (3,0)  hold 1, 4, 16, 13
       top ← 13, left ← 16, bottom ← 4, right ← 1
  ┌────┬────┬────┬────┐
  │ 13 │  2 │  3 │  1 │
  ├────┼────┼────┼────┤
  │  5 │  6 │  7 │  8 │
  ├────┼────┼────┼────┤
  │  9 │ 10 │ 11 │ 12 │
  ├────┼────┼────┼────┤
  │ 16 │ 14 │ 15 │  4 │
  └────┴────┴────┴────┘

  i=1: cells (0,1) (1,3) (3,2) (2,0)  hold 2, 8, 15, 9
       top ← 9, left ← 15, bottom ← 8, right ← 2
  ┌────┬────┬────┬────┐
  │ 13 │  9 │  3 │  1 │
  ├────┼────┼────┼────┤
  │  5 │  6 │  7 │  2 │
  ├────┼────┼────┼────┤
  │ 15 │ 10 │ 11 │ 12 │
  ├────┼────┼────┼────┤
  │ 16 │ 14 │  8 │  4 │
  └────┴────┴────┴────┘

  i=2: cells (0,2) (2,3) (3,1) (1,0)  hold 3, 12, 14, 5
       top ← 5, left ← 14, bottom ← 12, right ← 3
  ┌────┬────┬────┬────┐
  │ 13 │  9 │  5 │  1 │
  ├────┼────┼────┼────┤
  │ 14 │  6 │  7 │  2 │
  ├────┼────┼────┼────┤
  │ 15 │ 10 │ 11 │  3 │
  ├────┼────┼────┼────┤
  │ 16 │ 12 │  8 │  4 │
  └────┴────┴────┴────┘

  LAYER 1 (first = 1, last = 2), offset i = 0

  i=0: cells (1,1) (1,2) (2,2) (2,1)  hold 6, 7, 11, 10
       top ← 10, left ← 11, bottom ← 7, right ← 6
  ┌────┬────┬────┬────┐
  │ 13 │  9 │  5 │  1 │
  ├────┼────┼────┼────┤
  │ 14 │ 10 │  6 │  2 │
  ├────┼────┼────┼────┤      first row 1 2 3 4 is now the last column ✓
  │ 15 │ 11 │  7 │  3 │
  ├────┼────┼────┼────┤
  │ 16 │ 12 │  8 │  4 │
  └────┴────┴────┴────┘   ✅
```

### Other rotations with the same two tools

```
  ┌──────────────────────┬──────────────────────────────────────────────┐
  │ Want                 │ Recipe                                       │
  ├──────────────────────┼──────────────────────────────────────────────┤
  │ 90° clockwise        │ transpose → reverse each ROW                 │
  │                      │ (or: flip upside down → transpose)           │
  │ 90° counter-clockwise│ transpose → flip upside down (reverse ROWS'  │
  │                      │   order, i.e. each column)                   │
  │                      │ (or: reverse each row → transpose)           │
  │ 180°                 │ reverse each row → flip upside down          │
  │                      │ (= swap (r,c) with (n−1−r, n−1−c))           │
  └──────────────────────┴──────────────────────────────────────────────┘

  Counter-clockwise on the 3 × 3:

   transpose          flip upside down
  ┌───┬───┬───┐       ┌───┬───┬───┐
  │ 1 │ 4 │ 7 │       │ 3 │ 6 │ 9 │
  ├───┼───┼───┤       ├───┼───┼───┤
  │ 2 │ 5 │ 8 │  ──►  │ 2 │ 5 │ 8 │   first row 1 2 3 is now the first column,
  ├───┼───┼───┤       ├───┼───┼───┤   read bottom → top ✓   (r,c) → (n−1−c, r)
  │ 3 │ 6 │ 9 │       │ 1 │ 4 │ 7 │
  └───┴───┴───┘       └───┴───┴───┘

  180° on the 3 × 3:

   reverse each row   flip upside down
  ┌───┬───┬───┐       ┌───┬───┬───┐
  │ 3 │ 2 │ 1 │       │ 9 │ 8 │ 7 │
  ├───┼───┼───┤       ├───┼───┼───┤
  │ 6 │ 5 │ 4 │  ──►  │ 6 │ 5 │ 4 │   = the whole array read backwards ✓
  ├───┼───┼───┤       ├───┼───┼───┤
  │ 9 │ 8 │ 7 │       │ 3 │ 2 │ 1 │
  └───┴───┴───┘       └───┴───┴───┘
```

### Pseudocode

```
function rotate(matrix):                 // Method 1
    n ← size of matrix
    for r from 0 to n-1:                 // transpose (upper triangle only)
        for c from r+1 to n-1:
            swap matrix[r][c], matrix[c][r]
    for r from 0 to n-1:                 // reverse each row
        for c from 0 to n/2 − 1:
            swap matrix[r][c], matrix[r][n−1−c]

function rotateLayers(matrix):           // Method 2
    n ← size of matrix
    for first from 0 to n/2 − 1:
        last ← n − 1 − first
        for i from 0 to last − first − 1:
            temp                       ← matrix[first][first+i]       // top
            matrix[first][first+i]     ← matrix[last−i][first]        // top    ← left
            matrix[last−i][first]      ← matrix[last][last−i]         // left   ← bottom
            matrix[last][last−i]       ← matrix[first+i][last]        // bottom ← right
            matrix[first+i][last]      ← temp                         // right  ← top
```

### Complexity + optimization ladder

| Approach | Time | Extra space |
|---|---|---|
| Copy into a new matrix with `new[c][n−1−r] = old[r][c]`, copy back | O(n²) | O(n²) ✗ (not in place) |
| **Transpose + reverse rows** | **O(n²)** | **O(1)** ✅ (each cell moved twice) |
| **Layer-by-layer 4-way swap** | **O(n²)** | **O(1)** ✅ (each cell moved once) |

### 📌 Points to remember
- Clockwise = **transpose, then reverse each row**. Counter-clockwise = **transpose, then flip upside down**.
- Transpose only the **upper triangle** (`c > r`), or you undo your own swaps.
- Layer loop: `first < n/2`, offset `i < last − first` (the corner belongs to only one offset).
- In the 4-way swap, **save one value, then pull values backwards** around the cycle.
- Only works in place for a **square** matrix. A non-square rotation changes the shape (m × n → n × m).

---

## 4. Set Matrix Zeroes (Medium)

### Problem
Given an `m × n` matrix, if a cell is `0`, set its **entire row and column** to `0`. Do it **in place**.

### Visualize it

```
   before                     after
  ┌───┬───┬───┐             ┌───┬───┬───┐
  │ 1 │ 1 │ 1 │             │ 1 │ 0 │ 1 │
  ├───┼───┼───┤             ├───┼───┼───┤
  │ 1 │ 0 │ 1 │    ──►      │ 0 │ 0 │ 0 │
  ├───┼───┼───┤             ├───┼───┼───┤
  │ 1 │ 1 │ 1 │             │ 1 │ 0 │ 1 │
  └───┴───┴───┘             └───┴───┴───┘
              the 0 at (1,1) wipes row 1 and column 1
```

### ⚠ Why you can't zero as you go

```
  Zero row 1 and col 1 the moment you see (1,1) = 0:
   ┌───┬───┬───┐
   │ 1 │ 0 │ 1 │
   ├───┼───┼───┤
   │ 0 │ 0 │ 0 │   ← later the scan reaches (1,0), (1,2), (0,1), (2,1)...
   ├───┼───┼───┤      they are 0 now, so they wipe THEIR rows and columns too
   │ 1 │ 0 │ 1 │      → the whole matrix becomes 0 ✗
   └───┴───┴───┘

  Rule: FIRST record which rows/columns are dirty, THEN zero them.
```

### The key decision: where to store "row i / column j is dirty"

```
   copy of matrix          two sets                     inside the matrix
   O(m·n) space   ──►   rows{}, cols{}         ──►    row 0 = column markers
                        O(m + n) space                column 0 = row markers
                                                      + 1 flag for column 0
                                                      O(1) space ✅
```

### Step 1: the O(m + n) version (understand this first)

| Pass | What |
|------|------|
| Scan | for every 0 at `(i, j)`: add `i` to `rows`, `j` to `cols` |
| Zero | cell `(i, j)` becomes 0 if `i in rows` or `j in cols` |

```
function setZeroesSets(matrix):
    rows ← empty set, cols ← empty set
    for i from 0 to m-1:
        for j from 0 to n-1:
            if matrix[i][j] == 0: rows.add(i), cols.add(j)
    for i from 0 to m-1:
        for j from 0 to n-1:
            if i in rows or j in cols: matrix[i][j] ← 0
```

### Step 2: move the sets into the matrix

```
  rows set  →  column 0:   matrix[i][0] = 0  means "row i is dirty"
  cols set  →  row 0:      matrix[0][j] = 0  means "column j is dirty"

  Writing a marker 0 there is SAFE: if row i is dirty, matrix[i][0]
  is going to become 0 anyway. Same for matrix[0][j].

  The one conflict: cell (0,0)
     ┌────┬────┬────┐
     │ ?? │ c1 │ c2 │     ?? would have to mean BOTH
     ├────┼────┼────┤        "row 0 is dirty"  AND  "column 0 is dirty"
     │ r1 │    │    │
     └────┴────┴────┘     → let matrix[0][0] mean "ROW 0 is dirty"
                          → keep a separate boolean col0 = "COLUMN 0 is dirty"
```

### Step 3: the processing order

```
  PASS 1 (mark), top → bottom:
     for each row i:
        if matrix[i][0] == 0          → col0 ← true      (column 0 itself has a 0)
        for j from 1 to n−1:
           if matrix[i][j] == 0       → matrix[i][0] ← 0, matrix[0][j] ← 0

  PASS 2 (zero), BOTTOM → TOP, and right → left down to j = 1:
     for each row i:
        for j from n−1 down to 1:
           if matrix[i][0] == 0 or matrix[0][j] == 0 → matrix[i][j] ← 0
        if col0                       → matrix[i][0] ← 0

  Why bottom → top?  Row 0 HOLDS the column markers.
  If you zero row 0 first, its markers turn into fake "column dirty" signals.
  Doing row 0 LAST means every other row reads the markers before they change.
```

### Trace 1 (4 × 4, a zero inside and a zero in column 0)

```
  START
          c0   c1   c2   c3
   r0  [   1,   2,   3,   4 ]
   r1  [   5,   0,   7,   8 ]
   r2  [   9,  10,  11,  12 ]
   r3  [   0,  14,  15,  16 ]

  PASS 1 (mark)
   i=0: matrix[0][0] = 1; j=1..3: 2, 3, 4 → nothing
   i=1: matrix[1][0] = 5; j=1: 0 → matrix[1][0] ← 0, matrix[0][1] ← 0
   i=2: matrix[2][0] = 9; nothing
   i=3: matrix[3][0] = 0 → col0 ← true; j=1..3: 14, 15, 16 → nothing

  AFTER PASS 1                          col0 = true
          c0   c1   c2   c3
   r0  [   1,   0,   3,   4 ]     ← row 0 says: column 1 is dirty
   r1  [   0,   0,   7,   8 ]     ← column 0 says: rows 1 and 3 are dirty
   r2  [   9,  10,  11,  12 ]
   r3  [   0,  14,  15,  16 ]

  PASS 2 (bottom → top)
   i=3: matrix[3][0] = 0 → j=3,2,1 all zero;  col0 → matrix[3][0] ← 0
        r3 = [0, 0, 0, 0]
   i=2: matrix[2][0] = 9; j=3: m[0][3]=4 no; j=2: m[0][2]=3 no; j=1: m[0][1]=0 → zero
        col0 → matrix[2][0] ← 0
        r2 = [0, 0, 11, 12]
   i=1: matrix[1][0] = 0 → j=3,2,1 all zero;  col0 → 0
        r1 = [0, 0, 0, 0]
   i=0: matrix[0][0] = 1; j=3: 4 no; j=2: 3 no; j=1: m[0][1]=0 → stays 0
        col0 → matrix[0][0] ← 0
        r0 = [0, 0, 3, 4]

  FINAL
          c0   c1   c2   c3
   r0  [   0,   0,   3,   4 ]
   r1  [   0,   0,   0,   0 ]
   r2  [   0,   0,  11,  12 ]     ✅  rows 1, 3 and columns 0, 1 are zero
   r3  [   0,   0,   0,   0 ]
```

> 💡 Why the separate `col0` flag here: column 0 is dirty but row 0 is **not**.
> If we had stored "column 0 is dirty" in `matrix[0][0]`, row 0 would also be wiped
> and become `[0, 0, 0, 0]` instead of the correct `[0, 0, 3, 4]`.

### Trace 2 (3 × 4, zeros in row 0: the processing order matters)

```
  START
          c0   c1   c2   c3
   r0  [   0,   1,   2,   0 ]
   r1  [   3,   4,   5,   2 ]
   r2  [   1,   3,   1,   5 ]

  PASS 1 (mark)
   i=0: matrix[0][0] = 0 → col0 ← true
        j=3: 0 → matrix[0][0] ← 0 (already), matrix[0][3] ← 0 (already)
   i=1, i=2: no zeros
   matrix is unchanged; col0 = true
   markers: row 0 dirty (m[0][0]=0), column 3 dirty (m[0][3]=0), column 0 dirty (col0)

  PASS 2 (bottom → top)
   i=2: m[2][0]=1; j=3: m[0][3]=0 → zero; j=2: 2 no; j=1: 1 no; col0 → m[2][0] ← 0
        r2 = [0, 3, 1, 0]
   i=1: m[1][0]=3; j=3: zero; j=2, j=1: no; col0 → m[1][0] ← 0
        r1 = [0, 4, 5, 0]
   i=0: m[0][0]=0 → j=3,2,1 all zero; col0 → 0
        r0 = [0, 0, 0, 0]

  FINAL
          c0   c1   c2   c3
   r0  [   0,   0,   0,   0 ]
   r1  [   0,   4,   5,   0 ]     ✅
   r2  [   0,   3,   1,   0 ]
```

```
  What if PASS 2 went TOP → BOTTOM instead?

   i=0 first: m[0][0]=0 → row 0 becomes [0, 0, 0, 0]
              now m[0][1] = 0 and m[0][2] = 0 look like "columns 1, 2 are dirty"!
   i=1:       every j sees a 0 marker → r1 = [0, 0, 0, 0]   ✗ (should be [0, 4, 5, 0])

   → always zero row 0 (and column 0) LAST.
```

### Pseudocode (O(1) space)

```
function setZeroes(matrix):
    col0 ← false
    // PASS 1: mark
    for i from 0 to m-1:
        if matrix[i][0] == 0: col0 ← true
        for j from 1 to n-1:
            if matrix[i][j] == 0:
                matrix[i][0] ← 0             // row i dirty
                matrix[0][j] ← 0             // column j dirty
    // PASS 2: zero, bottom-up so row 0's markers are read before they change
    for i from m-1 down to 0:
        for j from n-1 down to 1:
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] ← 0
        if col0: matrix[i][0] ← 0
```

### Variant: two flags (easier to explain in an interview)

```
  rowZero ← does row 0 contain a 0?      colZero ← does column 0 contain a 0?
  1. compute both flags
  2. mark using row 0 / column 0 for the inner cells  (i ≥ 1, j ≥ 1)
  3. zero the inner cells from the markers             (i ≥ 1, j ≥ 1)
  4. if rowZero: zero row 0      if colZero: zero column 0

  Same O(1) space. The order is explicit: inner grid first, borders last.
```

### Complexity + optimization ladder

| Approach | Time | Extra space |
|---|---|---|
| Copy the matrix, read the copy, write the original | O(m·n) | O(m·n) |
| Zero as you go with a sentinel (only if values are bounded) | O(m·n·(m+n)) | O(1) ✗ slow and hacky |
| `rows` / `cols` sets (or boolean arrays) | O(m·n) | O(m + n) |
| **First row / column as markers + `col0` flag** | **O(m·n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Mark first, zero later.** Zeroing during the scan spreads fake zeros.
- `matrix[0][0]` can store only one fact: use it for **row 0**, plus a separate flag for **column 0**.
- In pass 1, the inner loop starts at **j = 1** (column 0 is handled by the flag).
- In pass 2, go **bottom → top** (or do the inner grid first, borders last) so row 0's markers survive until read.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌──────────────────────────────┬──────────────────────────────────────┬───────────┬──────────┬───────────────┐
│ Problem                      │ Trick                                │ In-place? │ Time     │ Extra space   │
├──────────────────────────────┼──────────────────────────────────────┼───────────┼──────────┼───────────────┤
│ Convert 1D Array Into 2D     │ k → (k / n, k % n), check len = m·n  │ no (new)  │ O(m·n)   │ O(1) + output │
│ Spiral Matrix                │ 4 shrinking boundaries + 2 guards    │ read-only │ O(m·n)   │ O(1) + output │
│ Rotate Image                 │ transpose + reverse rows / 4-swap    │ yes       │ O(n²)    │ O(1)          │
│ Set Matrix Zeroes            │ row 0 / col 0 as markers + col0 flag │ yes       │ O(m·n)   │ O(1)          │
└──────────────────────────────┴──────────────────────────────────────┴───────────┴──────────┴───────────────┘
```

### Family tree

```
                         MATRIX SIMULATION
                    (move by rules, no "best" to find)
                                 │
       ┌─────────────────┬───────┴─────────┬──────────────────────┐
       │                 │                 │                      │
  INDEX MAPPING     BOUNDARY WALK     IN-PLACE TRANSFORM     IN-MATRIX MARKERS
  k ↔ (r, c)        top/bottom/       transpose, reverse,    row 0 / col 0
       │            left/right        layer swaps            as scratch space
       │                 │                 │                      │
  ├ Convert 1D→2D   ├ Spiral Matrix   └ Rotate Image         └ Set Matrix Zeroes
  ├ Reshape Matrix  └ Spiral Matrix II   (90°, −90°, 180°)      (also: Game of Life
  └ Search 2D Matrix                                              uses in-cell state)
    (binary search)
```

### Related guides

```
  • 2D prefix sums (Matrix Block Sum)      → 03-Prefix-Sum.md, problem 7
  • Matrix as a DP table (paths, sums)     → ../dynammic programming/02-2D-Grid-DP.md
  • Flattened-index binary search          → ../binary search/04-Search-in-2D-Matrix.md
```

Links: [03-Prefix-Sum.md](03-Prefix-Sum.md) (Matrix Block Sum) ·
[../dynammic programming/02-2D-Grid-DP.md](../dynammic%20programming/02-2D-Grid-DP.md) ·
[../binary search/04-Search-in-2D-Matrix.md](../binary%20search/04-Search-in-2D-Matrix.md)

### Recognition checklist

```
  ☐ Converting between a flat array and a grid?        → k → (k / n, k % n), r·n + c
  ☐ Output in spiral / ring / layer order?             → 4 boundaries, guard sides 3 and 4
  ☐ Rotate or flip a square matrix in place?           → transpose + reverse (pick the flip)
  ☐ Need per-row / per-column flags with O(1) space?   → store them in row 0 / column 0
  ☐ Changes must not affect the reading of other cells? → mark first, apply in a second pass
  ☐ Shape is m × n, not n × n?                         → in-place rotation is impossible
```

### 🚩 Common bugs to avoid

```
  ✗ Dividing by m instead of n (columns) in the index map
  ✗ Forgetting the len(original) == m·n check
  ✗ Spiral: no guard on the bottom / left walks → duplicates on a single row or column
  ✗ Spiral: shrinking a boundary before walking its side
  ✗ Rotate: transposing the full matrix (every pair swapped twice → no change)
  ✗ Rotate: reversing columns when you meant rows (gives counter-clockwise)
  ✗ Rotate: 4-way swap in the wrong direction (rotates the other way)
  ✗ Zeroes: zeroing during the scan (zeros spread)
  ✗ Zeroes: using matrix[0][0] for both row 0 and column 0
  ✗ Zeroes: processing row 0 before the rows that read its markers
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What are my boundaries right now, and does this step   ║
   ║   overwrite something I still need to read?"            ║
   ╚══════════════════════════════════════════════════════════╝
     If yes → save it in a temp, change the order, or mark first and apply later.
```

---

### ✅ Progress tracker

- [ ] Convert 1D Array Into 2D Array (Easy)
- [ ] Spiral Matrix (Medium)
- [ ] Rotate Image (Medium)
- [ ] Set Matrix Zeroes (Medium)
