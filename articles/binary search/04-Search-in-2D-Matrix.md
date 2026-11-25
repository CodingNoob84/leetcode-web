# Search in a 2D Matrix: A Visual Guide

> **Goal:** Learn to *see* how a sorted matrix can be searched, pick the right "view" of it, and hand-trace every step.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> The last two problems reuse the "binary search on the **value**" idea from
> [03-Binary-Search-on-Answers.md](03-Binary-Search-on-Answers.md).

---

## Table of Contents

0. [The Big Idea: Three Views of a Sorted Matrix](#0-the-big-idea-three-views-of-a-sorted-matrix)
1. [Search a 2D Matrix (Medium)](#1-search-a-2d-matrix-medium)
2. [Search a 2D Matrix II (Medium)](#2-search-a-2d-matrix-ii-medium)
3. [Kth Smallest Element in a Sorted Matrix (Medium)](#3-kth-smallest-element-in-a-sorted-matrix-medium)
4. [Median in a Row-wise Sorted Matrix (Medium)](#4-median-in-a-row-wise-sorted-matrix-medium)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Search a 2D Matrix → Search a 2D Matrix II → Kth Smallest → Median.
> Each one relaxes how sorted the matrix is, so each needs a smarter view.

---

## 0. The Big Idea: Three Views of a Sorted Matrix

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BINARY SEARCH IN A MATRIX"             │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a MATRIX whose rows (and maybe columns) are SORTED   │
│  • "Does target exist?"            → search for a POSITION       │
│  • "Kth smallest", "median"        → search for a VALUE          │
│  • Constraints hint at O(log) or O(m + n), not O(m · n)          │
└──────────────────────────────────────────────────────────────────┘
```

### First question: HOW sorted is the matrix?

```
  ┌──────────────────────────────────────────────────────────────────────────┐
  │ How sorted?                          │ View to use                       │
  ├──────────────────────────────────────┼───────────────────────────────────┤
  │ Each row sorted AND row i's first    │ VIEW 1: FLATTEN into one sorted   │
  │ element > row i-1's last element     │         1D array                  │
  ├──────────────────────────────────────┼───────────────────────────────────┤
  │ Rows sorted AND columns sorted       │ VIEW 2: STAIRCASE walk from the   │
  │ (but rows overlap in range)          │         top-right corner          │
  ├──────────────────────────────────────┼───────────────────────────────────┤
  │ Asking for the k-th / median value   │ VIEW 3: binary search on the      │
  │ (any of the above, or rows only)     │         VALUE range + count ≤ mid │
  └──────────────────────────────────────┴───────────────────────────────────┘
```

### VIEW 1: Flatten (the matrix is secretly a 1D array)

```
   matrix (3 × 4)                      flattened view (12 cells)
  ┌────┬────┬────┬────┐
  │  1 │  3 │  5 │  7 │   ──►    idx:  0  1  2  3  4  5  6  7  8  9 10 11
  ├────┼────┼────┼────┤          val:  1  3  5  7 10 11 16 20 23 30 34 60
  │ 10 │ 11 │ 16 │ 20 │                └── row 0 ──┘└── row 1 ──┘└─ row 2 ─┘
  ├────┼────┼────┼────┤
  │ 23 │ 30 │ 34 │ 60 │          idx ──► (row, col) = ( idx / cols , idx % cols )
  └────┴────┴────┴────┘          e.g. idx 6 → (6/4, 6%4) = (1, 2) → 16 ✓

  You never build the 1D array. You just convert the index on the fly.
```

### VIEW 2: Staircase (start where one move goes up and the other goes down)

```
   rows sorted →, columns sorted ↓

          smaller ◄──────── START
              ┌────┬────┬────┬────┐
              │  1 │  4 │  7 │ 11 │ ◄── top-right corner
              ├────┼────┼────┼────┤      • go LEFT  → values get SMALLER
              │  2 │  5 │  8 │ 12 │      • go DOWN  → values get BIGGER
              ├────┼────┼────┼────┤
              │  3 │  6 │  9 │ 16 │   One comparison throws away a whole
              └────┴────┴────┴────┘   row or a whole column. O(m + n).
                                ▼
                              bigger
```

### VIEW 3: Binary search on the VALUE, not the position

```
   Don't ask "WHERE is it?". Ask "WHAT value is it?"

   value line:   min ─────────────── mid ─────────────── max
                  lo                                      hi

   count(mid) = how many cells are ≤ mid       (cheap: O(n) or O(r log c))

   count(mid) ≥ k  →  answer is mid or SMALLER  →  hi = mid
   count(mid) < k  →  answer is BIGGER          →  lo = mid + 1

   count(x) only goes UP as x grows → it's MONOTONIC → binary search works.
   (Same yes/no idea as 03-Binary-Search-on-Answers.md.)
```

### The two binary-search templates used here

```
  TEMPLATE A: "find exact"                TEMPLATE B: "smallest x that works"
  lo ← 0, hi ← n − 1                       lo ← smallest, hi ← largest
  while lo ≤ hi:                           while lo < hi:
      mid ← lo + (hi − lo) / 2                 mid ← lo + (hi − lo) / 2
      if a[mid] == t: return found             if works(mid): hi ← mid
      if a[mid] <  t: lo ← mid + 1             else:          lo ← mid + 1
      else:           hi ← mid − 1         return lo
  return not found

  Used in: Search a 2D Matrix               Used in: Kth Smallest, Median
```

> 💡 **Key insight:** "Sorted" is a property you can exploit in more than one shape.
> A sorted **position space** lets you search positions. A monotonic **count** lets you search values.

---

## 1. Search a 2D Matrix (Medium)

### Problem
Each row is sorted, and each row's first number is **greater than the previous row's last number**.
Return whether `target` exists.

### Visualize it

```
  ┌────┬────┬────┬────┐
  │  1 │  3 │  5 │  7 │
  ├────┼────┼────┼────┤      Read it like a book, left → right, top → bottom:
  │ 10 │ 11 │ 16 │ 20 │      1, 3, 5, 7, 10, 11, 16, 20, 23, 30, 34, 60
  ├────┼────┼────┼────┤      → one long SORTED array. Use normal binary search.
  │ 23 │ 30 │ 34 │ 60 │
  └────┴────┴────┴────┘
```

### The decision at every step

```
                   value = matrix[mid / cols][mid % cols]
                  ┌───────────────┼───────────────┐
           value < target   value == target   value > target
                  │               │               │
          lo = mid + 1        FOUND ✅        hi = mid − 1
          (go right)                          (go left)
```

### Steps

| Step | Answer |
|------|--------|
| Search space | indices `0 .. m·n − 1` |
| Map index → cell | `row = idx / cols`, `col = idx % cols` |
| Compare | normal binary search (Template A) |
| Stop | found, or `lo > hi` |
| Answer | true / false |

### Trace (target = 3)

```
  ┌──────┬────┬────┬─────┬───────────┬───────┬───────────────────────┐
  │ iter │ lo │ hi │ mid │ (row,col) │ value │ action                │
  ├──────┼────┼────┼─────┼───────────┼───────┼───────────────────────┤
  │  1   │  0 │ 11 │  5  │  (1, 1)   │  11   │ 11 > 3  → hi = 4      │
  │  2   │  0 │  4 │  2  │  (0, 2)   │   5   │  5 > 3  → hi = 1      │
  │  3   │  0 │  1 │  0  │  (0, 0)   │   1   │  1 < 3  → lo = 1      │
  │  4   │  1 │  1 │  1  │  (0, 1)   │   3   │ FOUND ✅               │
  └──────┴────┴────┴─────┴───────────┴───────┴───────────────────────┘
```

### Trace (target = 13, not present)

```
  ┌──────┬────┬────┬─────┬───────────┬───────┬───────────────────────┐
  │ iter │ lo │ hi │ mid │ (row,col) │ value │ action                │
  ├──────┼────┼────┼─────┼───────────┼───────┼───────────────────────┤
  │  1   │  0 │ 11 │  5  │  (1, 1)   │  11   │ 11 < 13 → lo = 6      │
  │  2   │  6 │ 11 │  8  │  (2, 0)   │  23   │ 23 > 13 → hi = 7      │
  │  3   │  6 │  7 │  6  │  (1, 2)   │  16   │ 16 > 13 → hi = 5      │
  │  —   │  6 │  5 │     │           │       │ lo > hi → false ❌     │
  └──────┴────┴────┴─────┴───────────┴───────┴───────────────────────┘
```

### Pseudocode

```
function searchMatrix(matrix, target):
    m ← rows, n ← cols
    lo ← 0, hi ← m · n − 1
    while lo ≤ hi:
        mid   ← lo + (hi − lo) / 2
        value ← matrix[mid / n][mid % n]
        if value == target: return true
        if value <  target: lo ← mid + 1
        else:               hi ← mid − 1
    return false
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Scan every cell | O(m·n) | O(1) |
| Staircase (View 2 also works here) | O(m + n) | O(1) |
| Binary search the row, then the column | O(log m + log n) | O(1) |
| **Flattened binary search** | **O(log(m·n))** | **O(1)** ✅ |

### 📌 Points to remember
- Divide and mod by the number of **columns**, not rows.
- `log(m·n) = log m + log n`. The two-step "find the row, then search it" approach is just as fast, only longer to write.
- The flatten trick only works because rows **don't overlap**. Check the problem statement for that guarantee.

---

## 2. Search a 2D Matrix II (Medium)

### Problem
Rows are sorted left → right, **and** columns are sorted top → bottom.
Rows can overlap in range, so the matrix can't be flattened. Return whether `target` exists.

### Visualize it

```
  ┌────┬────┬────┬────┬────┐
  │  1 │  4 │  7 │ 11 │ 15 │
  ├────┼────┼────┼────┼────┤
  │  2 │  5 │  8 │ 12 │ 19 │     Row 0 ends at 15, but row 1 starts at 2.
  ├────┼────┼────┼────┼────┤     Reading it like a book gives
  │  3 │  6 │  9 │ 16 │ 22 │     1, 4, 7, 11, 15, 2, ...  → NOT sorted ✗
  ├────┼────┼────┼────┼────┤
  │ 10 │ 13 │ 14 │ 17 │ 24 │
  ├────┼────┼────┼────┼────┤
  │ 18 │ 21 │ 23 │ 26 │ 30 │
  └────┴────┴────┴────┴────┘
```

### Which corner to start from?

```
   TOP-LEFT (1):       right ↑ bigger,  down ↑ bigger   → both moves look the same ✗
   BOTTOM-RIGHT (30):  left  ↓ smaller, up   ↓ smaller  → both moves look the same ✗

   TOP-RIGHT (15):     left  ↓ smaller, down ↑ bigger   → each move has ONE meaning ✓
   BOTTOM-LEFT (18):   up    ↓ smaller, right ↑ bigger  → also works ✓

   You need a corner where "too big" and "too small" point in DIFFERENT directions.
```

### The decision at every step (from the top-right)

```
                    value = matrix[r][c]
              ┌──────────────┼──────────────┐
       value > target  value == target  value < target
              │              │              │
           c ← c − 1     FOUND ✅        r ← r + 1
     (this whole COLUMN                (this whole ROW
      below is even bigger              to the left is even smaller
      → discard it)                     → discard it)
```

### Trace (target = 5)

```
  ┌──────┬───────┬───────┬──────────────────────────────┐
  │ step │ (r,c) │ value │ action                       │
  ├──────┼───────┼───────┼──────────────────────────────┤
  │  1   │ (0,4) │  15   │ 15 > 5 → drop column 4, left │
  │  2   │ (0,3) │  11   │ 11 > 5 → drop column 3, left │
  │  3   │ (0,2) │   7   │  7 > 5 → drop column 2, left │
  │  4   │ (0,1) │   4   │  4 < 5 → drop row 0, down    │
  │  5   │ (1,1) │   5   │ FOUND ✅                      │
  └──────┴───────┴───────┴──────────────────────────────┘

  ┌────┬────┬────┬────┬────┐
  │  1 │ 4 ←│ 7 ←│11 ←│15 S│
  ├────┼─↓──┼────┼────┼────┤
  │  2 │ 5 ✅│  8 │ 12 │ 19 │
  └────┴────┴────┴────┴────┘
```

### Trace (target = 20, not present)

```
  ┌──────┬───────┬───────┬──────────────────┐
  │ step │ (r,c) │ value │ action           │
  ├──────┼───────┼───────┼──────────────────┤
  │  1   │ (0,4) │  15   │ 15 < 20 → down   │
  │  2   │ (1,4) │  19   │ 19 < 20 → down   │
  │  3   │ (2,4) │  22   │ 22 > 20 → left   │
  │  4   │ (2,3) │  16   │ 16 < 20 → down   │
  │  5   │ (3,3) │  17   │ 17 < 20 → down   │
  │  6   │ (4,3) │  26   │ 26 > 20 → left   │
  │  7   │ (4,2) │  23   │ 23 > 20 → left   │
  │  8   │ (4,1) │  21   │ 21 > 20 → left   │
  │  9   │ (4,0) │  18   │ 18 < 20 → down   │
  │  —   │ (5,0) │   —   │ off grid → false ❌│
  └──────┴───────┴───────┴──────────────────┘
```

### Pseudocode

```
function searchMatrixII(matrix, target):
    r ← 0, c ← cols − 1                 // top-right corner
    while r < rows and c ≥ 0:
        value ← matrix[r][c]
        if value == target: return true
        if value >  target: c ← c − 1   // column too big
        else:               r ← r + 1   // row too small
    return false
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Scan every cell | O(m·n) | O(1) |
| Binary search each row | O(m · log n) | O(1) |
| **Staircase from top-right** | **O(m + n)** | **O(1)** ✅ |

> Each step removes one row or one column, so there are at most `m + n` steps.

### 📌 Points to remember
- Start at **top-right** (or bottom-left). Never top-left or bottom-right.
- The loop runs while `r < rows and c ≥ 0`. Falling off the grid means "not found".
- The same staircase walk **counts** cells ≤ x in O(m + n). Problem 3 reuses it.

---

## 3. Kth Smallest Element in a Sorted Matrix (Medium)

### Problem
`n × n` matrix, rows **and** columns sorted. Return the **k-th smallest** value (counting duplicates).

### Visualize it

```
  ┌────┬────┬────┐
  │  1 │  5 │  9 │       all values sorted:
  ├────┼────┼────┤       1, 5, 9, 10, 11, 12, 13, 13, 15
  │ 10 │ 11 │ 13 │                                ▲
  ├────┼────┼────┤                              k = 8 → 13 ✅
  │ 12 │ 13 │ 15 │
  └────┴────┴────┘

  Positions are tangled (row 1 holds 10..13, row 2 holds 12..15),
  so searching POSITIONS is hard. Search the VALUE instead.
```

### Switch to View 3: binary search on the value

```
   value line:  1 ─────────────────────────────── 15
                lo = matrix[0][0]         hi = matrix[n−1][n−1]

   Ask for a guess x: "How many cells are ≤ x?"

        count(x) ≥ k  → the k-th smallest is x or smaller → hi = x
        count(x) < k  → too few cells, go bigger          → lo = x + 1

   Find the SMALLEST x with count(x) ≥ k.   (Template B)
```

### Counting cells ≤ x with the staircase (O(n))

```
   Start at BOTTOM-LEFT, walk right/up:

        if matrix[r][c] ≤ x:
            the whole column c from row 0..r is ≤ x
            → count += r + 1,  move RIGHT
        else:
            → move UP

   count(13):
  ┌────┬────┬────┐
  │  1 │  5 │  9 │
  ├────┼────┼────┤               (2,0)=12 ≤ 13 → +3 → 3, right
  │ 10 │ 11 │ 13 │ ← +2 (8)      (2,1)=13 ≤ 13 → +3 → 6, right
  ├────┼────┼────┤               (2,2)=15 > 13 → up
  │ 12 │ 13 │ 15 │               (1,2)=13 ≤ 13 → +2 → 8, right → done
  └────┴────┴────┘
   +3   +3   ↑
                                 count(13) = 8 ✓
```

### Trace (k = 8)

```
  ┌──────┬────┬────┬─────┬─────────────────────────────┬────────┬──────────────────┐
  │ iter │ lo │ hi │ mid │ cells ≤ mid                 │ count  │ action           │
  ├──────┼────┼────┼─────┼─────────────────────────────┼────────┼──────────────────┤
  │  1   │  1 │ 15 │  8  │ 1, 5                        │   2    │ 2 < 8 → lo = 9   │
  │  2   │  9 │ 15 │ 12  │ 1,5,9,10,11,12              │   6    │ 6 < 8 → lo = 13  │
  │  3   │ 13 │ 15 │ 14  │ 1,5,9,10,11,12,13,13        │   8    │ 8 ≥ 8 → hi = 14  │
  │  4   │ 13 │ 14 │ 13  │ 1,5,9,10,11,12,13,13        │   8    │ 8 ≥ 8 → hi = 13  │
  │  —   │ 13 │ 13 │     │                             │        │ lo == hi → 13 ✅  │
  └──────┴────┴────┴─────┴─────────────────────────────┴────────┴──────────────────┘
```

### Why the answer is always a real matrix value

```
   Suppose the smallest x with count(x) ≥ k were NOT in the matrix.
   Then no cell equals x, so count(x − 1) = count(x) ≥ k.
   So x − 1 also works, which contradicts "x is the smallest". ✗

   → Template B always lands on a value that exists in the matrix.
```

### Pseudocode

```
function kthSmallest(matrix, k):
    n  ← size
    lo ← matrix[0][0], hi ← matrix[n−1][n−1]
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if countLessEqual(matrix, mid) ≥ k: hi ← mid
        else:                               lo ← mid + 1
    return lo

function countLessEqual(matrix, x):
    r ← n − 1, c ← 0, count ← 0           // bottom-left
    while r ≥ 0 and c < n:
        if matrix[r][c] ≤ x:
            count ← count + (r + 1)
            c ← c + 1
        else:
            r ← r − 1
    return count
```

### Alternative: min-heap (merge n sorted rows)

```
   Push the first cell of every row into a min-heap.
   Pop k − 1 times; after each pop, push the next cell of that row.
   The top of the heap is the k-th smallest.

   heap: [1, 10, 12] → pop 1, push 5 → [5, 10, 12] → pop 5, push 9 → ...
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy everything and sort | O(n² log n) | O(n²) |
| Min-heap | O(k log n) | O(n) |
| **Value binary search + staircase** | **O(n · log(max − min))** | **O(1)** ✅ |

### 📌 Points to remember
- When positions are tangled, **search the value** and **count**.
- Use `count ≥ k` (not `== k`). Duplicates make an exact match impossible to rely on.
- `lo < hi` with `hi = mid` finds the smallest value that works.
- Use `mid ← lo + (hi − lo) / 2`, which is safe for negative values and large ranges.
- Heap is better when k is small. Value search is better when k is close to n².

---

## 4. Median in a Row-wise Sorted Matrix (Medium)

### Problem (GeeksforGeeks)
`r × c` matrix, **each row sorted** (columns are not). `r · c` is **odd**. Return the median.

### Visualize it

```
  ┌───┬───┬───┐
  │ 1 │ 3 │ 5 │       all values sorted:
  ├───┼───┼───┤       1, 2, 3, 3, 5, 6, 6, 9, 9
  │ 2 │ 6 │ 9 │                   ▲
  ├───┼───┼───┤          the 5th of 9 → median = 5 ✅
  │ 3 │ 6 │ 9 │
  └───┴───┴───┘

  Median = the value with exactly (r·c)/2 values BELOW it.
  r·c = 9 → we need the smallest x with count(≤ x) > 4.
```

### Same idea as Kth Smallest, with a different counter

```
   Columns are NOT sorted → no staircase.
   But each ROW is sorted → binary search inside each row.

   count(x) = Σ over rows of upperBound(row, x)
              (upperBound = index of the first value > x
                          = how many values in that row are ≤ x)

   row [1, 3, 5], x = 5 → upperBound = 3   (all three ≤ 5)
   row [2, 6, 9], x = 5 → upperBound = 1   (only 2)
```

### The value range

```
   lo = smallest value of column 0     (every row's minimum)
   hi = largest  value of the last column (every row's maximum)

   need = (r · c) / 2  (integer division)

        count(mid) > need  → median is mid or smaller → hi = mid
        count(mid) ≤ need  → median is bigger         → lo = mid + 1
```

### Trace

```
   lo = min(1, 2, 3) = 1,  hi = max(5, 9, 9) = 9,  need = 9 / 2 = 4

  ┌──────┬────┬────┬─────┬─────────────────────────┬───────┬──────────────────┐
  │ iter │ lo │ hi │ mid │ row0  + row1  + row2    │ total │ action           │
  ├──────┼────┼────┼─────┼─────────────────────────┼───────┼──────────────────┤
  │  1   │  1 │  9 │  5  │  3    +  1    +  1      │   5   │ 5 > 4 → hi = 5   │
  │  2   │  1 │  5 │  3  │  2    +  1    +  1      │   4   │ 4 ≤ 4 → lo = 4   │
  │  3   │  4 │  5 │  4  │  2    +  1    +  1      │   4   │ 4 ≤ 4 → lo = 5   │
  │  —   │  5 │  5 │     │                         │       │ lo == hi → 5 ✅   │
  └──────┴────┴────┴─────┴─────────────────────────┴───────┴──────────────────┘

   rows: [1,3,5]  [2,6,9]  [3,6,9]
   mid = 5 → row0 has 1,3,5 (3) · row1 has 2 (1) · row2 has 3 (1) → 5 values ≤ 5
   mid = 4 → row0 has 1,3   (2) · row1 has 2 (1) · row2 has 3 (1) → only 4 values ≤ 4
   → 5 is the smallest value with more than 4 values at or below it.
```

### Pseudocode

```
function matrixMedian(matrix):
    r ← rows, c ← cols
    lo ← min over rows of matrix[i][0]
    hi ← max over rows of matrix[i][c−1]
    need ← (r · c) / 2
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        count ← 0
        for each row in matrix:
            count ← count + upperBound(row, mid)   // # of values ≤ mid
        if count > need: hi ← mid
        else:            lo ← mid + 1
    return lo
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy everything and sort | O(r·c · log(r·c)) | O(r·c) |
| **Value binary search + upperBound per row** | **O(r · log c · log(max − min))** | **O(1)** ✅ |

### 📌 Points to remember
- "Median" = "k-th smallest" with `k = (r·c)/2 + 1`. Saying `count > (r·c)/2` is the same as `count ≥ k`.
- Rows sorted only → count with **upperBound per row**, not the staircase.
- `lo` and `hi` come from the first and last **columns**, not just the corners.
- Odd `r · c` is guaranteed. With an even total, the "median" would need two values.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌──────────────────────────┬──────────────────────────────┬────────────────────────┬──────────────────────┐
│ Problem                  │ Matrix guarantee             │ Technique              │ Time                 │
├──────────────────────────┼──────────────────────────────┼────────────────────────┼──────────────────────┤
│ Search a 2D Matrix       │ fully sorted (row by row)    │ flatten: idx→(i/n, i%n)│ O(log(m·n))          │
│ Search a 2D Matrix II    │ rows sorted + cols sorted    │ staircase, top-right   │ O(m + n)             │
│ Kth Smallest in Matrix   │ rows sorted + cols sorted    │ value search + stair   │ O(n · log range)     │
│                          │                              │ count (≥ k)            │                      │
│ Median (row-wise sorted) │ rows sorted only, r·c odd    │ value search + upper-  │ O(r·log c·log range) │
│                          │                              │ Bound per row (> half) │                      │
└──────────────────────────┴──────────────────────────────┴────────────────────────┴──────────────────────┘
```

### Pattern family tree

```
                        SEARCH IN A 2D MATRIX
                                 │
          ┌──────────────────────┼───────────────────────┐
          │                      │                       │
   SEARCH POSITION        ELIMINATE ROW/COL        SEARCH THE VALUE
   (fully sorted)         (rows + cols sorted)     (k-th / median)
          │                      │                       │
   └ Search a 2D Matrix   └ Search a 2D Matrix II  ├ Kth Smallest  (staircase count)
                                 │                 └ Median        (upperBound count)
                                 │                       ▲
                                 └──── staircase is ─────┘
                                       reused as the counter
```

### Which counter for "count ≤ x"?

```
   ┌───────────────────────────┬─────────────────────────────┬────────────────┐
   │ Matrix guarantee          │ Counter                     │ Cost per count │
   ├───────────────────────────┼─────────────────────────────┼────────────────┤
   │ rows + columns sorted     │ staircase from bottom-left  │ O(m + n)       │
   │ rows sorted only          │ upperBound on every row     │ O(r · log c)   │
   │ nothing sorted            │ scan every cell             │ O(m · n)       │
   └───────────────────────────┴─────────────────────────────┴────────────────┘
```

### Optimization checklist

```
  ☐ Is row i's first > row i−1's last?        → flatten, one binary search
  ☐ Rows AND columns sorted, find a target?   → staircase from top-right
  ☐ Asked for k-th / median / "how many ≤"?   → binary search on VALUE
  ☐ Counting is monotonic in x?               → Template B (lo < hi, hi = mid)
  ☐ k small compared to n²?                   → min-heap may be simpler
```

### 🚩 Common bugs to avoid

```
  ✗ Flatten: using rows instead of cols in idx / cols and idx % cols
  ✗ Flatten on a matrix whose rows overlap (that's Matrix II!)
  ✗ Staircase from top-left or bottom-right → no clear direction to move
  ✗ Staircase loop bounds: r < rows AND c ≥ 0
  ✗ Kth Smallest: checking count == k instead of count ≥ k (duplicates!)
  ✗ Value search: mid = (lo + hi) / 2 overflowing; use lo + (hi − lo) / 2
  ✗ Median: lo/hi taken from corners only, instead of first/last COLUMNS
  ✗ Median: lowerBound instead of upperBound (counts < x, not ≤ x)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Am I searching for a POSITION or for a VALUE?          ║
   ║   And what sorted / monotonic property lets me throw     ║
   ║   away half (or a whole row/column) with one check?"     ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Search a 2D Matrix (Medium)
- [ ] Search a 2D Matrix II (Medium)
- [ ] Kth Smallest Element in a Sorted Matrix (Medium)
- [ ] Median in a Row-wise Sorted Matrix (Medium)
