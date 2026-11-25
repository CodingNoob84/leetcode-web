# 2D / Grid Dynamic Programming: A Visual Guide

> **Goal:** Learn to *see* grid DP problems, fill the table by hand, and then shrink it.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-1D-Linear-DP.md](01-1D-Linear-DP.md). Grid DP is 1D DP with one more axis.

---

## Table of Contents

0. [The Big Idea: What Is Grid DP?](#0-the-big-idea-what-is-grid-dp)
1. [Unique Paths (Medium)](#1-unique-paths-medium)
2. [Unique Paths II (Medium)](#2-unique-paths-ii-medium)
3. [Minimum Path Sum (Medium)](#3-minimum-path-sum-medium)
4. [Minimum Falling Path Sum (Medium)](#4-minimum-falling-path-sum-medium)
5. [Maximum Path Sum in Matrix (Medium)](#5-maximum-path-sum-in-matrix-medium)
6. [Range Sum Query 2D (Medium)](#6-range-sum-query-2d-medium)
7. [Dungeon Game (Hard)](#7-dungeon-game-hard)
8. [Longest Increasing Path in a Matrix (Hard)](#8-longest-increasing-path-in-a-matrix-hard)
9. [Cherry Pickup (Hard)](#9-cherry-pickup-hard)
10. [Master Cheat Sheet](#10-master-cheat-sheet)

> **Suggested order:** Unique Paths → Unique Paths II → Min Path Sum → Min Falling → Max Path Sum
> → Range Sum 2D → Dungeon → Longest Increasing Path → Cherry Pickup.
> Each one adds exactly one new idea to the previous one.

---

## 0. The Big Idea: What Is Grid DP?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "GRID DP"                               │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a MATRIX / GRID / BOARD                              │
│  • Move from START (often top-left) to END (often bottom-right)  │
│  • Moves are RESTRICTED: only right/down, or only downward       │
│  • "Number of paths", "min/max path sum", "min health needed"    │
│  • Sum of a SUB-RECTANGLE asked many times                       │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: a table filled like reading a book

```
          c=0    c=1    c=2    c=3
        ┌──────┬──────┬──────┬──────┐
  r=0   │ base │  →   │  →   │  →   │   fill row by row,
        ├──────┼──────┼──────┼──────┤   left → right
  r=1   │  ↓   │  ?   │      │      │
        ├──────┼──────┼──────┼──────┤   each "?" uses its
  r=2   │  ↓   │      │      │ ANS  │   ↑ UP and ← LEFT neighbors
        └──────┴──────┴──────┴──────┘   (already filled)

                    ┌─────┐
                    │ UP  │
              ┌─────┼─────┤
              │LEFT │  ?  │     dp[r][c] = combine( dp[r-1][c], dp[r][c-1] )
              └─────┴─────┘
```

### The golden rule: dependencies decide the fill order

```
  ┌──────────────────────────────┬─────────────────────────────────────┐
  │ Cell depends on...           │ Fill order                          │
  ├──────────────────────────────┼─────────────────────────────────────┤
  │ UP and LEFT                  │ top → bottom, left → right          │
  │ DOWN and RIGHT               │ bottom → top, right → left          │
  │ the whole ROW above          │ row by row (falling path)           │
  │ ANY neighbor (4 directions)  │ no fixed order → DFS + memo / topo  │
  └──────────────────────────────┴─────────────────────────────────────┘
```

### The 5-step recipe (same as 1D, with two indices)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  STATE        dp[r][c] = ______ for cell (r, c)        │
 │ STEP 2  TRANSITION   "How did I ENTER (r, c)? From where?"    │
 │ STEP 3  BASE         first row / first column / start cell    │
 │ STEP 4  ORDER        so dependencies are ready (table above)  │
 │ STEP 5  ANSWER       dp[m-1][n-1]? best of last row? dp[0][0]?│
 └───────────────────────────────────────────────────────────────┘
```

### The universal space optimization: 2D → 1D

```
  If row r only reads row r-1, you need just ONE row array.

   row r-1:  [ a ][ b ][ c ][ d ]     ← "old" values
   row r  :  [ ? ][ ? ][ ? ][ ? ]

   Update IN PLACE, left → right:

     row[c] = combine( row[c] , row[c-1] )
                         ▲          ▲
                     still OLD    already NEW
                     (= UP)       (= LEFT)

   O(m·n) space  ──►  O(n) space
```

> 💡 **Key insight:** In a single row array, the cell **not yet overwritten** is "up",
> and the cell **just overwritten** to its left is "left". One array holds both rows.

---

## 1. Unique Paths (Medium)

### Problem
A robot starts at the top-left of an `m × n` grid and can move only **right** or **down**.
How many distinct paths reach the bottom-right?

### Visualize it

```
   S ──► ──► ┐
             ▼          Every path = some mix of (n-1) RIGHTs
             ▼          and (m-1) DOWNs.
             E
   S ┐
     ▼
     └──► ──►┐
             E
```

### Think in "last move"

```
                   paths(r, c)
                  /           \
       came from ABOVE      came from LEFT
              │                   │
        paths(r-1, c)       paths(r, c-1)

        dp[r][c] = dp[r-1][c] + dp[r][c-1]    ← Climbing Stairs, in 2D!
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[r][c]` = number of paths from start to `(r, c)` |
| Transition | `dp[r][c] = dp[r-1][c] + dp[r][c-1]` |
| Base | first row = all 1, first column = all 1 (only one straight way) |
| Order | top → bottom, left → right |
| Answer | `dp[m-1][n-1]` |

### Trace (3 × 3)

```
         c=0   c=1   c=2
       ┌─────┬─────┬─────┐
  r=0  │  1  │  1  │  1  │    first row: only "all right"
       ├─────┼─────┼─────┤
  r=1  │  1  │  2  │  3  │    2 = 1(up) + 1(left)
       ├─────┼─────┼─────┤    3 = 1(up) + 2(left)
  r=2  │  1  │  3  │  6  │    6 = 3(up) + 3(left)  ✅
       └─────┴─────┴─────┘

   (3 × 7 grid → 28)
```

### Pseudocode (1D row, O(n) space)

```
function uniquePaths(m, n):
    row ← array of n, all 1          // the first row
    for r from 1 to m-1:
        for c from 1 to n-1:
            row[c] ← row[c] + row[c-1]   // up (old) + left (new)
    return row[n-1]
```

### Row-array animation (3 × 3)

```
  start      : [1, 1, 1]
  after r=1  : [1, 2, 3]
  after r=2  : [1, 3, 6]   ✅
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Recursion | O(2^(m+n)) | O(m+n) |
| 2D table | O(m·n) | O(m·n) |
| **1D row** | **O(m·n)** | **O(n)** ✅ |
| Math: `C(m+n-2, m-1)` | O(min(m,n)) | O(1) |

> The math trick: a path is choosing **which** (m-1) of the (m+n-2) moves are DOWN.

### 📌 Points to remember
- This is the **template** for every "right/down" grid problem.
- First row and first column are base cases. Initialize them carefully.
- Counting → **add**. Swap to `min` / `max` for cost problems.

---

## 2. Unique Paths II (Medium)

### Problem
Same as Unique Paths, but some cells are **obstacles** (`1`). Paths can't pass through them.

### Visualize it

```
       ┌───┬───┬───┐
       │ S │   │   │
       ├───┼───┼───┤
       │   │ ▓ │   │   ▓ = obstacle
       ├───┼───┼───┤
       │   │   │ E │
       └───┴───┴───┘
```

### The only change: an obstacle cell has 0 paths

```
   if grid[r][c] is an obstacle:  dp[r][c] = 0      ← "wall kills the flow"
   else:                          dp[r][c] = up + left
```

### Trace

```
   grid                    dp
  ┌───┬───┬───┐        ┌───┬───┬───┐
  │ 0 │ 0 │ 0 │        │ 1 │ 1 │ 1 │
  ├───┼───┼───┤        ├───┼───┼───┤
  │ 0 │ 1 │ 0 │  ──►   │ 1 │ 0 │ 1 │   obstacle → 0
  ├───┼───┼───┤        ├───┼───┼───┤
  │ 0 │ 0 │ 0 │        │ 1 │ 1 │ 2 │   2 = 1(up) + 1(left)  ✅
  └───┴───┴───┘        └───┴───┴───┘
```

### ⚠️ The first-row / first-column trap

```
   grid first row:  [ 0, 0, 1, 0, 0 ]
   WRONG base:      [ 1, 1, 0, 1, 1 ]   ✗ cells after the wall are unreachable!
   RIGHT base:      [ 1, 1, 0, 0, 0 ]   ✓ once blocked, everything after is 0
```

> Easiest fix: don't special-case the first row at all. Use the general formula
> and treat out-of-bounds neighbors as 0. Only `dp[0][0]` is a base case.

### Pseudocode (1D row)

```
function uniquePathsWithObstacles(grid):
    n   ← number of columns
    row ← array of n, all 0
    row[0] ← (grid[0][0] is free) ? 1 : 0
    for r from 0 to m-1:
        for c from 0 to n-1:
            if grid[r][c] is obstacle:
                row[c] ← 0
            else if c > 0:
                row[c] ← row[c] + row[c-1]
            // c == 0: row[0] keeps its value (only "up" exists)
    return row[n-1]
```

### 📌 Points to remember
- Obstacle → set the cell to **0**. That is the whole new idea.
- If start or end is an obstacle → answer is 0.
- Don't fill the first row/column with 1s blindly.

---

## 3. Minimum Path Sum (Medium)

### Problem
Grid of non-negative numbers. Move **right or down** from top-left to bottom-right. Minimize the sum of the cells you visit.

### Visualize it

```
       ┌───┬───┬───┐
       │ 1 │ 3 │ 1 │      1 → 3 → 1
       ├───┼───┼───┤              ↓
       │ 1 │ 5 │ 1 │              1
       ├───┼───┼───┤              ↓
       │ 4 │ 2 │ 1 │              1      = 7 ✅
       └───┴───┴───┘
```

### Unique Paths with `min` instead of `+`

```
        Unique Paths                       Minimum Path Sum
   dp = up + left             ──►     dp = grid[r][c] + min(up, left)
   (count → ADD)                      (cost → MIN, then pay for this cell)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[r][c]` = cheapest cost to arrive at `(r, c)`, including this cell |
| Transition | `dp[r][c] = grid[r][c] + min(dp[r-1][c], dp[r][c-1])` |
| Base | `dp[0][0] = grid[0][0]`; first row/col = running sums |
| Order | top → bottom, left → right |
| Answer | `dp[m-1][n-1]` |

### Trace

```
   grid                   dp
  ┌───┬───┬───┐        ┌───┬───┬───┐
  │ 1 │ 3 │ 1 │        │ 1 │ 4 │ 5 │   running sum along the top
  ├───┼───┼───┤        ├───┼───┼───┤
  │ 1 │ 5 │ 1 │  ──►   │ 2 │ 7 │ 6 │   7 = 5 + min(4, 2)
  ├───┼───┼───┤        ├───┼───┼───┤   6 = 1 + min(5, 7)
  │ 4 │ 2 │ 1 │        │ 6 │ 8 │ 7 │   7 = 1 + min(6, 8)  ✅
  └───┴───┴───┘        └───┴───┴───┘
```

### Pseudocode (1D row)

```
function minPathSum(grid):
    row ← array of n, all +∞
    row[0] ← 0
    for r from 0 to m-1:
        row[0] ← row[0] + grid[r][0]                       // only "up"
        for c from 1 to n-1:
            row[c] ← grid[r][c] + min(row[c], row[c-1])    // up, left
    return row[n-1]
```

> 💡 Starting with `+∞` and `row[0] = 0` makes the first row work automatically:
> `min(+∞, left)` always picks left.

### 📌 Points to remember
- Add the **current cell's** value after taking the min.
- You can overwrite `grid` itself for O(1) extra space, if modifying input is allowed.
- Same skeleton as Unique Paths. **Recognize templates!**

---

## 4. Minimum Falling Path Sum (Medium)

### Problem
`n × n` matrix. Start at **any** cell in the first row. Each step goes to the next row:
**down-left, down, or down-right**. Minimize the total.

### Visualize it

```
     ┌───┬───┬───┐
     │ 2 │ 1 │ 3 │          From (r, c) you may go to:
     ├───┼───┼───┤
     │ 6 │ 5 │ 4 │                (r, c)
     ├───┼───┼───┤               ↙  ↓  ↘
     │ 7 │ 8 │ 9 │        (r+1,c-1)(r+1,c)(r+1,c+1)
     └───┴───┴───┘
```

### Flip it: where could I have COME FROM?

```
        ┌──────────┬──────────┬──────────┐
  r-1   │ (r-1,c-1)│ (r-1,c)  │ (r-1,c+1)│
        └────────┬─┴────┬─────┴─┬────────┘
                 ↘      ↓      ↙
                    ┌───────┐
  r                 │ (r,c) │
                    └───────┘

  dp[r][c] = matrix[r][c] + min( dp[r-1][c-1], dp[r-1][c], dp[r-1][c+1] )
             (skip neighbors that fall off the edge)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[r][c]` = min falling sum that ends at `(r, c)` |
| Transition | cell + min of the 3 cells above it |
| Base | `dp[0][c] = matrix[0][c]` (you may start anywhere) |
| Order | row by row, top → bottom |
| Answer | **min of the last row** ⚠ the end is not one fixed cell |

### Trace

```
   matrix                 dp
  ┌───┬───┬───┐        ┌────┬────┬────┐
  │ 2 │ 1 │ 3 │        │  2 │  1 │  3 │   copy first row
  ├───┼───┼───┤        ├────┼────┼────┤
  │ 6 │ 5 │ 4 │  ──►   │  7 │  6 │  5 │   7 = 6 + min(2,1)
  ├───┼───┼───┤        ├────┼────┼────┤   6 = 5 + min(2,1,3)
  │ 7 │ 8 │ 9 │        │ 13 │ 13 │ 14 │   5 = 4 + min(1,3)
  └───┴───┴───┘        └────┴────┴────┘
                         min(last row) = 13 ✅    (1 → 5 → 7  or  1 → 4 → 8)
```

### Pseudocode (two rows)

```
function minFallingPathSum(matrix):
    prev ← copy of matrix[0]
    for r from 1 to n-1:
        curr ← new array of n
        for c from 0 to n-1:
            best ← prev[c]
            if c > 0:     best ← min(best, prev[c-1])
            if c < n-1:   best ← min(best, prev[c+1])
            curr[c] ← matrix[r][c] + best
        prev ← curr
    return min(prev)
```

> ⚠️ Here a single in-place row **doesn't work** directly, because cell `c` needs the
> OLD `prev[c-1]`, which you just overwrote. Use two rows (or save one old value in a temp).

### 📌 Points to remember
- "Start anywhere in row 0, end anywhere in the last row" → base = whole first row, answer = best of last row.
- Guard the edges (`c-1 ≥ 0`, `c+1 < n`).
- Variant (LC 1289, "non-zero shift"): next row must use a **different column**. Track the smallest and second-smallest of the previous row.

---

## 5. Maximum Path Sum in Matrix (Medium)

### Problem
Start at any cell in the **first row**, end at any cell in the **last row**.
Moves: **down, down-left, down-right**. Maximize the sum.

> This is **Minimum Falling Path Sum with `max`**. If you solved problem 4, you have already solved this one.
> (Some versions only allow right/down moves. That is Minimum Path Sum with `max`.)

### Mirror image

```
       Minimum Falling Path Sum          Maximum Path Sum in Matrix
   dp = cell + MIN(3 above)     ──►    dp = cell + MAX(3 above)
   answer = MIN(last row)              answer = MAX(last row)
```

### Trace

```
   matrix                 dp
  ┌───┬───┬───┐        ┌────┬────┬────┐
  │ 1 │ 2 │ 3 │        │  1 │  2 │  3 │
  ├───┼───┼───┤        ├────┼────┼────┤
  │ 9 │ 8 │ 7 │  ──►   │ 11 │ 11 │ 10 │   11 = 9 + max(1,2)
  ├───┼───┼───┤        ├────┼────┼────┤   11 = 8 + max(1,2,3)
  │ 4 │ 5 │ 6 │        │ 15 │ 16 │ 17 │   10 = 7 + max(2,3)
  └───┴───┴───┘        └────┴────┴────┘
                        max(last row) = 17 ✅    path: 3 → 8 → 6
```

### Pseudocode

```
function maxPathSum(matrix):
    prev ← copy of matrix[0]
    for r from 1 to rows-1:
        curr ← new array
        for c from 0 to cols-1:
            best ← prev[c]
            if c > 0:        best ← max(best, prev[c-1])
            if c < cols-1:   best ← max(best, prev[c+1])
            curr[c] ← matrix[r][c] + best
        prev ← curr
    return max(prev)
```

### 📌 Points to remember
- Read the allowed moves carefully. They decide which cells are "parents".
- With **negative** numbers, initialize "best" from a real neighbor, never from 0.
- Want the actual path? Store which parent column won, then walk back from the best last-row cell.

---

## 6. Range Sum Query 2D (Medium)

### Problem
Given a matrix, answer **many** queries: "sum of the rectangle from `(r1, c1)` to `(r2, c2)`".

> Not a path problem. It is the 2D version of the **prefix sum** from 1D.
> Precompute once in O(m·n), then answer each query in **O(1)**.

### Step 1: build the prefix table (inclusion–exclusion)

```
  P[r][c] = sum of everything in the rectangle from (0,0) to (r-1, c-1)
  (P has an extra row and column of zeros, which removes edge cases)

   ┌───────────┬───┐
   │           │   │     P[r+1][c+1] =  matrix[r][c]
   │     A     │ B │                  +  P[r][c+1]      (A + B: everything above)
   │           │   │                  +  P[r+1][c]      (A + C: everything left)
   ├───────────┼───┤                  −  P[r][c]        (A counted twice!)
   │     C     │ ● │
   └───────────┴───┘
```

### Step 2: answer a query with 4 lookups

```
   ┌───────────────────────┐
   │  X    │       Y       │
   │───────┼───────────────│ ← r1
   │  Z    │   ███ WANT ███│
   │       │   ███████████ │
   └───────┴───────────────┘ ← r2
           ↑ c1         ↑ c2

   WANT = Total(r2,c2) − Above − Left + Corner(X, removed twice)

   sum = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]
```

### Trace

```
   matrix              P (extra 0 row/col)
  ┌───┬───┬───┐       ┌───┬───┬────┬────┐
  │ 3 │ 0 │ 1 │       │ 0 │ 0 │  0 │  0 │
  ├───┼───┼───┤       ├───┼───┼────┼────┤
  │ 5 │ 6 │ 3 │  ──►  │ 0 │ 3 │  3 │  4 │
  ├───┼───┼───┤       ├───┼───┼────┼────┤
  │ 1 │ 2 │ 0 │       │ 0 │ 8 │ 14 │ 18 │   14 = 6 + 3 + 8 − 3
  └───┴───┴───┘       ├───┼───┼────┼────┤
                      │ 0 │ 9 │ 17 │ 21 │   21 = total of matrix ✓
                      └───┴───┴────┴────┘

  Query (1,1) → (2,2):   6 + 3 + 2 + 0 = 11
    P[3][3] − P[1][3] − P[3][1] + P[1][1]
     = 21  −   4    −   9    +   3       = 11 ✅
```

### Pseudocode

```
function build(matrix):
    P ← (m+1) × (n+1) table of zeros
    for r from 0 to m-1:
        for c from 0 to n-1:
            P[r+1][c+1] ← matrix[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]

function sumRegion(r1, c1, r2, c2):
    return P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]
```

### Complexity

| Approach | Build | Per query |
|---|---|---|
| Sum each query by looping | — | O(m·n) |
| Row-wise prefix sums | O(m·n) | O(m) |
| **2D prefix table** | **O(m·n)** | **O(1)** ✅ |
| Updates too (LC 308) | 2D Fenwick tree | O(log m · log n) |

### 📌 Points to remember
- **Pad with a zero row and column.** It removes every `if r1 == 0` check.
- Build formula: **+ up + left − diagonal**. Query formula: **− up − left + diagonal**.
- Reusable for: count of 1s in a rectangle, max-sum submatrix, matrix block sum.

---

## 7. Dungeon Game (Hard)

### Problem
A knight starts at the top-left and must reach the princess at the bottom-right, moving **right or down**.
Each cell **adds or removes** health. Health must stay **≥ 1 at all times**.
Find the **minimum starting health**.

### Visualize it

```
       ┌─────┬─────┬─────┐
       │ -2  │ -3  │ +3  │     K = knight (start)
       │  K  │     │     │     P = princess (end)
       ├─────┼─────┼─────┤
       │ -5  │ -10 │ +1  │     negative = demon (lose HP)
       ├─────┼─────┼─────┤     positive = potion (gain HP)
       │ +10 │ +30 │ -5  │
       │     │     │  P  │
       └─────┴─────┴─────┘
```

### Why forward DP FAILS 🚫

```
  Going forward, each cell has TWO competing goals:
     • the highest current health  vs.  • the lowest health dip so far
  A path with less HP now may have a better future (a big potion ahead).
  One number per cell can't capture both → forward DP gives wrong answers.

  ┌──────────────────────────────────────────────────────────────────┐
  │ FIX: go BACKWARD. Ask "how much HP do I NEED when I ENTER (r,c)  │
  │      so that I survive from here to the princess?"               │
  └──────────────────────────────────────────────────────────────────┘
  The future is fixed, so one number per cell is enough.
```

### The backward transition

```
  need[r][c] = HP required when stepping onto (r, c)

      next = min( need[r+1][c], need[r][c+1] )   ← take the easier way forward
      need[r][c] = max( 1,  next − dungeon[r][c] )
                      ▲
                      HP can never be below 1

   Example: next = 6, cell = +30 → 6 − 30 = −24 → clamp → 1
            next = 6, cell = −5  → 6 + 5  = 11
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `need[r][c]` = min HP when entering `(r, c)` |
| Transition | `max(1, min(down, right) − dungeon[r][c])` |
| Base | princess cell: `max(1, 1 − dungeon[m-1][n-1])` |
| Order | **bottom → top, right → left** |
| Answer | `need[0][0]` |

### Trace (fill from bottom-right)

```
   dungeon                  need  (filled in the order ⑨ → ①)
  ┌─────┬─────┬─────┐     ┌─────┬─────┬─────┐
  │ -2  │ -3  │ +3  │     │ 7 ① │ 5 ② │ 2 ③ │
  ├─────┼─────┼─────┤     ├─────┼─────┼─────┤
  │ -5  │ -10 │ +1  │ ──► │ 6 ④ │ 11⑤ │ 5 ⑥ │
  ├─────┼─────┼─────┤     ├─────┼─────┼─────┤
  │ +10 │ +30 │ -5  │     │ 1 ⑦ │ 1 ⑧ │ 6 ⑨ │
  └─────┴─────┴─────┘     └─────┴─────┴─────┘

  ⑨ princess: max(1, 1 − (−5))          = 6
  ⑧ (2,1):    max(1, 6 − 30)            = 1
  ⑥ (1,2):    max(1, 6 − 1)             = 5
  ⑤ (1,1):    max(1, min(1,5) + 10)     = 11
  ② (0,1):    max(1, min(11,2) + 3)     = 5
  ① start:    max(1, min(6,5) + 2)      = 7  ✅   path: → → ↓ ↓
```

### Pseudocode (1D row, sentinel trick)

```
function calculateMinimumHP(dungeon):
    row ← array of n+1, all +∞
    row[n-1] ← 1                       // sentinel: "after the princess, need 1 HP"
    for r from m-1 down to 0:
        for c from n-1 down to 0:
            next   ← min(row[c], row[c+1])        // down (old), right (new)
            row[c] ← max(1, next − dungeon[r][c])
    return row[0]
```

> 💡 The `+∞` padding plus one `1` sentinel next to the princess removes every edge case.

### 📌 Points to remember
- **If the future decides feasibility, run DP backward.** This is the big lesson.
- `max(1, ...)`: you never need *more* than 1 HP at a cell full of potions.
- Minimum HP is at least **1**, not 0.
- Classic trap: binary search on start HP + forward simulation works, but it is slower.

---

## 8. Longest Increasing Path in a Matrix (Hard)

### Problem
From any cell, move **up, down, left, right** to a **strictly larger** neighbor.
Find the length of the longest such path.

### Visualize it

```
       ┌───┬───┬───┐
       │ 9 │ 9 │ 4 │
       ├───┼───┼───┤
       │ 6 │ 6 │ 8 │        1 → 2 → 6 → 9   (length 4) ✅
       ├───┼───┼───┤
       │ 2 │ 1 │ 1 │
       └───┴───┴───┘
```

### Why no fixed fill order works

```
  Moves go in ALL 4 directions → no "top-left to bottom-right" order.
  But "strictly increasing" means a path can NEVER return to a cell:

        a < b < c < a ?   impossible!

  → The moves form a DAG (no cycles)
  → DFS + memoization is safe. No "visited" set is needed.
```

### The recurrence

```
  lip(r, c) = 1 + max( lip(neighbor) )  over the 4 neighbors with a BIGGER value
            = 1                         if no neighbor is bigger (a "peak")

                     ┌───┐
                     │ ↑ │
                 ┌───┼───┼───┐
                 │ ← │ ● │ → │      only follow arrows to bigger values
                 └───┼───┼───┘
                     │ ↓ │
                     └───┘
```

### Trace (memo table)

```
   matrix              memo = lip(r, c)
  ┌───┬───┬───┐       ┌───┬───┬───┐
  │ 9 │ 9 │ 4 │       │ 1 │ 1 │ 2 │   9s are peaks → 1 ; 4 → 8 or 9 → 2
  ├───┼───┼───┤       ├───┼───┼───┤
  │ 6 │ 6 │ 8 │  ──►  │ 2 │ 2 │ 1 │   6 → 9 → 2 ; 8 is a peak → 1
  ├───┼───┼───┤       ├───┼───┼───┤
  │ 2 │ 1 │ 1 │       │ 3 │ 4 │ 2 │   2 → 6 → 9 = 3 ; 1 → 2 → 6 → 9 = 4 ✅
  └───┴───┴───┘       └───┴───┴───┘
```

### Pseudocode: DFS + memo

```
function longestIncreasingPath(matrix):
    memo ← m × n table of 0           // 0 = not computed yet
    best ← 0
    for every cell (r, c):
        best ← max(best, dfs(r, c))
    return best

function dfs(r, c):
    if memo[r][c] > 0: return memo[r][c]
    longest ← 1
    for each (nr, nc) in 4 neighbors of (r, c):
        if inside grid and matrix[nr][nc] > matrix[r][c]:
            longest ← max(longest, 1 + dfs(nr, nc))
    memo[r][c] ← longest
    return longest
```

### Alternative: topological "peeling" (BFS, no recursion)

```
  Layer 1: cells with NO bigger neighbor (peaks)        → remove them
  Layer 2: cells whose bigger neighbors are all gone    → remove them
  ...
  Answer = number of layers peeled.

   Like peeling an onion from the top:   ⛰  →  ⛰  →  ⛰  → done
```

> Useful when recursion depth could overflow the stack (very large grids).

### 📌 Points to remember
- **Strictly increasing ⇒ no cycles ⇒ memo is safe.** No `visited` array is needed.
- Each cell is computed once → **O(m·n)** time and space.
- Start a DFS from every cell, but memo makes the total work linear.
- Pattern: "longest path in a grid/graph with a monotonic rule" → DFS + memo or topological sort.

---

## 9. Cherry Pickup (Hard)

### Problem
`n × n` grid: `1` = cherry, `0` = empty, `-1` = thorn (blocked).
Go from `(0,0)` to `(n-1,n-1)` moving **right/down**, then return moving **left/up**.
Picked cherries disappear. Maximize the cherries collected (0 if no path exists).

### Why greedy (best trip, then best trip again) FAILS 🚫

```
     ┌───┬───┬───┐
     │ 1 │ 1 │ 0 │       Two trips together CAN collect all 6:
     ├───┼───┼───┤         trip A: → → ↓ ↓   (top row, right column)
     │ 1 │ 0 │ 1 │         trip B: ↓ ↓ → →   (left column, bottom row)
     ├───┼───┼───┤
     │ 0 │ 1 │ 1 │       Greedy trip 1 may take the "middle" path:
     └───┴───┴───┘         → ↓ ↓ →  = 4 cherries (tie for best)
                           leftovers (1,0) and (1,2) can't both be
                           reached in one trip → +1 → total 5 ❌

  The two trips must be planned TOGETHER.
```

### Key trick 1: the return trip is just another forward trip

```
  Going back (left/up) along a path = going forward (right/down) on the same path.

  → Treat it as TWO people walking from (0,0) to (n-1,n-1) at the SAME TIME.
```

### Key trick 2: walk in lockstep → 3 numbers describe the state

```
  After t steps, each person is on the anti-diagonal  r + c = t.

        t=0   t=1   t=2   t=3   t=4
      ┌─────┬─────┬─────┐
      │  0  │  1  │  2  │       every cell on the same diagonal
      ├─────┼─────┼─────┤       has the same r + c
      │  1  │  2  │  3  │
      ├─────┼─────┼─────┤
      │  2  │  3  │  4  │
      └─────┴─────┴─────┘

  Person 1 at (r1, t − r1),  person 2 at (r2, t − r2)

  ┌───────────────────────────────────────────────────────────────┐
  │ dp[t][r1][r2] = max cherries when both have taken t steps,    │
  │                 person 1 in row r1, person 2 in row r2        │
  └───────────────────────────────────────────────────────────────┘

  Bonus: both people reach a cell at the same step t, so
  "same cell" is easy to detect → count its cherry only ONCE.
```

### The transition: 4 combinations of previous moves

```
            person 1 came from      person 2 came from
               UP or LEFT     ×       UP or LEFT        = 4 combos

   prev options (at step t-1):
       (r1-1, r2-1)   both came from up
       (r1-1, r2  )   P1 up,   P2 left
       (r1  , r2-1)   P1 left, P2 up
       (r1  , r2  )   both came from left

   gain = grid[r1][c1] + (r1 ≠ r2 ? grid[r2][c2] : 0)   ← same cell: count once

   dp[t][r1][r2] = gain + max(4 prev options)
                   (−∞ if either cell is a thorn)
```

### Pseudocode

```
function cherryPickup(grid):
    dp ← n × n table of −∞            // layer for step t, indexed [r1][r2]
    dp[0][0] ← grid[0][0]
    for t from 1 to 2n−2:
        next ← n × n table of −∞
        for r1 from max(0, t−n+1) to min(n−1, t):
            for r2 from max(0, t−n+1) to min(n−1, t):
                c1 ← t − r1,  c2 ← t − r2
                if grid[r1][c1] == −1 or grid[r2][c2] == −1: continue
                best ← max( dp[r1−1][r2−1], dp[r1−1][r2],
                            dp[r1][r2−1],   dp[r1][r2] )   // skip out-of-range
                if best == −∞: continue
                gain ← grid[r1][c1]
                if r1 ≠ r2: gain ← gain + grid[r2][c2]
                next[r1][r2] ← best + gain
        dp ← next
    return max(0, dp[n−1][n−1])
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Two separate greedy trips | wrong ❌ | — |
| 4D `dp[r1][c1][r2][c2]` | O(n⁴) | O(n⁴) |
| **3D `dp[t][r1][r2]`** (c is derived) | **O(n³)** | O(n³) |
| **Rolling layer over t** | **O(n³)** | **O(n²)** ✅ |

### 📌 Points to remember
- **Round trip = two simultaneous forward trips.** This reframing is the whole problem.
- Lockstep walking means `c = t − r`, which drops one dimension.
- Same cell → count the cherry **once**.
- Unreachable state = `−∞`. Final answer `max(0, ...)` handles "no path".
- Follow-up: **Cherry Pickup II** (LC 1463). Two robots move down row by row, so the state is `dp[row][c1][c2]`.

---

## 10. Master Cheat Sheet

### All 9 problems at a glance

```
┌───────────────────────┬──────────────────────────────────────────────┬─────────────────┬────────────┐
│ Problem               │ Recurrence / core idea                       │ Answer          │ Best       │
├───────────────────────┼──────────────────────────────────────────────┼─────────────────┼────────────┤
│ Unique Paths          │ dp = up + left                               │ dp[m-1][n-1]    │ O(mn),O(n) │
│ Unique Paths II       │ same, obstacle → 0                           │ dp[m-1][n-1]    │ O(mn),O(n) │
│ Minimum Path Sum      │ dp = cell + min(up, left)                    │ dp[m-1][n-1]    │ O(mn),O(n) │
│ Min Falling Path Sum  │ dp = cell + min(3 cells above)               │ min(last row)   │ O(n²),O(n) │
│ Max Path Sum (matrix) │ dp = cell + max(3 cells above)               │ max(last row)   │ O(mn),O(n) │
│ Range Sum Query 2D    │ P = cell + up + left − diag                  │ 4 lookups       │ O(1)/query │
│ Dungeon Game          │ BACKWARD: max(1, min(down,right) − cell)     │ need[0][0]      │ O(mn),O(n) │
│ Longest Incr. Path    │ DFS + memo: 1 + max(bigger neighbors)        │ max over cells  │ O(mn)      │
│ Cherry Pickup         │ 2 walkers, dp[t][r1][r2], 4 combos           │ max(0, final)   │ O(n³),O(n²)│
└───────────────────────┴──────────────────────────────────────────────┴─────────────────┴────────────┘
```

### Pattern family tree

```
                                GRID DP
                                   │
    ┌──────────────┬───────────────┼────────────────┬──────────────────┐
    │              │               │                │                  │
 RIGHT/DOWN     ROW-BY-ROW      BACKWARD         ANY DIRECTION     MULTI-WALKER
 (up + left)    (3 parents)     (future decides) (DAG → memo)      (extra dims)
    │              │               │                │                  │
 ├ Unique Paths ├ Min Falling   └ Dungeon Game   └ Longest Incr.   └ Cherry Pickup
 ├ Unique P. II └ Max Path Sum                      Path
 └ Min Path Sum
                        + PREFIX-SUM TABLE
                          └ Range Sum Query 2D
```

### Fill order cheat card

```
  dependencies          fill order                 picture
  ───────────────────   ───────────────────────    ───────────
  up, left              top→bottom, left→right       ┌──►
                                                     ▼
  down, right           bottom→top, right→left        ◄──┐
                                                         ▲
  3 cells above         row by row                   ═══►
                                                     ═══►
  4 neighbors           DFS + memo / topo sort       ✶ any
  two walkers           by step t (anti-diagonals)   ⟋⟋⟋
```

### The operator tells you the question type

```
   ┌──────────────────┬──────────────┬──────────────────────────────┐
   │ Question         │ Combine with │ Example                      │
   ├──────────────────┼──────────────┼──────────────────────────────┤
   │ # of paths       │   +          │ Unique Paths I / II          │
   │ min cost path    │   min        │ Min Path Sum, Min Falling    │
   │ max value path   │   max        │ Max Path Sum, Cherry Pickup  │
   │ min HP to survive│ min, max(1,·)│ Dungeon Game                 │
   │ rectangle sum    │ + + − (incl.-excl.) │ Range Sum Query 2D    │
   └──────────────────┴──────────────┴──────────────────────────────┘
```

### Optimization checklist

```
  ☐ Row r only reads row r-1?                → 1D row array, O(n) space
  ☐ Need old LEFT-DIAGONAL value?            → two rows, or save it in a temp
  ☐ Moves go in all 4 directions?            → DFS + memo (only if no cycles!)
  ☐ Many rectangle-sum queries?              → 2D prefix table, O(1) per query
  ☐ Forward DP needs two numbers per cell?   → try running it BACKWARD
  ☐ Two agents moving together?              → lockstep step t, derive c = t − r
  ☐ Can I modify the input grid?             → O(1) extra space
```

### 🚩 Common bugs to avoid

```
  ✗ Unique Paths II: filling the first row/col with 1 past an obstacle
  ✗ Min Path Sum: forgetting to add the current cell's value
  ✗ Falling Path: in-place single row overwrites the left-diagonal you still need
  ✗ Falling Path: returning dp[n-1][n-1] instead of min/max of the whole last row
  ✗ Range Sum 2D: no zero padding → index −1 errors; wrong sign on the diagonal
  ✗ Dungeon: running forward; forgetting max(1, ...); allowing HP = 0
  ✗ Longest Incr. Path: adding a visited set (not needed) or forgetting memo
  ✗ Cherry Pickup: counting a shared cell twice; greedy two-pass
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which neighbor cells could I have ENTERED (r, c) from, ║
   ║   and are they already computed when I reach (r, c)?"    ║
   ╚══════════════════════════════════════════════════════════╝
     The first half gives the recurrence. The second gives the fill order.
```

---

### ✅ Progress tracker

- [ ] Unique Paths (Medium)
- [ ] Unique Paths II (Medium)
- [ ] Minimum Path Sum (Medium)
- [ ] Minimum Falling Path Sum (Medium)
- [ ] Maximum Path Sum in Matrix (Medium)
- [ ] Range Sum Query 2D (Medium)
- [ ] Dungeon Game (Hard)
- [ ] Longest Increasing Path in a Matrix (Hard)
- [ ] Cherry Pickup (Hard)
