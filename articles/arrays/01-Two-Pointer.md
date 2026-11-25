# Two Pointers: A Visual Guide

> **Goal:** Learn to *see* when two indices walking toward (or alongside) each other can replace
> a nested loop, and run every classic two-pointer problem by hand.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Related guides: [03-Prefix-Sum.md](03-Prefix-Sum.md) (prefix maxima for rain water),
> [../binary search/01-Classic-Binary-Search.md](../binary%20search/01-Classic-Binary-Search.md) (rotated search),
> [../greedy/01-Intervals-and-Reach.md](../greedy/01-Intervals-and-Reach.md) (intervals).

---

## Table of Contents

0. [The Big Idea: Two Indices, One Pass](#0-the-big-idea-two-indices-one-pass)
1. [Move Zeroes (Easy)](#1-move-zeroes-easy)
2. [Squares of a Sorted Array (Easy)](#2-squares-of-a-sorted-array-easy)
3. [Two Sum II - Input Array Is Sorted (Medium)](#3-two-sum-ii---input-array-is-sorted-medium)
4. [Sort Colors (Medium)](#4-sort-colors-medium)
5. [Container With Most Water (Medium)](#5-container-with-most-water-medium)
6. [3Sum (Medium)](#6-3sum-medium)
7. [3Sum Closest (Medium)](#7-3sum-closest-medium)
8. [Interval List Intersections (Medium)](#8-interval-list-intersections-medium)
9. [Search in Rotated Sorted Array II (Medium)](#9-search-in-rotated-sorted-array-ii-medium)
10. [Trapping Rain Water (Hard)](#10-trapping-rain-water-hard)
11. [Master Cheat Sheet](#11-master-cheat-sheet)

> **Suggested order:** Move Zeroes → Squares of a Sorted Array → Two Sum II → Sort Colors
> → Container With Most Water → 3Sum → 3Sum Closest → Interval List Intersections
> → Search in Rotated Sorted Array II → Trapping Rain Water.
> The two Easys teach the two basic shapes (**same direction** and **opposite ends**).
> Two Sum II gives the elimination proof. Sort Colors adds a **third pointer**.
> Container, 3Sum and 3Sum Closest reuse the elimination proof with a twist each.
> Intervals walks **two arrays** at once, Rotated Search II is two pointers that **halve**,
> and Trapping Rain Water combines two pointers with running maxima.

---

## 0. The Big Idea: Two Indices, One Pass

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TWO POINTERS"                          │
├──────────────────────────────────────────────────────────────────┤
│  • The array is SORTED (or you are allowed to sort it)           │
│  • "Find a PAIR / TRIPLET with sum = / closest to target"        │
│  • "In place", "O(1) extra space", "keep the relative order"     │
│  • Something depends on BOTH ENDS (width × height, squares)      │
│  • Partition into groups (0s / 1s / 2s, zeros to the end)        │
│  • Two sorted lists walked together (merge, intersect)           │
│  • Brute force is a nested loop over (i, j) with i < j           │
└──────────────────────────────────────────────────────────────────┘

  ⚠ "COUNT subarrays with sum = k" (negatives allowed) → PREFIX SUM + hashmap.
  ⚠ "Longest window with property X"                   → SLIDING WINDOW
     (a close cousin: two pointers moving the SAME way, bounding a window).
```

### Mental model 1: opposite ends (squeeze)

```
   index:   0    1    2    3    4    5    6
          [ ·    ·    ·    ·    ·    ·    · ]
            L ──►                    ◄── R

   Each step looks at a[L] and a[R], decides, and moves ONE of them inward.
   They meet after at most n − 1 moves  →  O(n).

   Used by: Squares, Two Sum II, Container, 3Sum (inner loop),
            3Sum Closest, Trapping Rain Water, Rotated Search (lo / hi).
```

### Mental model 2: same direction (read / write)

```
          write
            ▼
          [ 1    3    0    0   12 ]
                           ▲
                          read

   read  = scout: visits every element once
   write = builder: the next slot where a "keeper" goes

   ┌──────── done (keepers) ────────┬──── junk ────┬──── unseen ────┐
   0                              write          read               n

   Used by: Move Zeroes (and Remove Duplicates, Remove Element, ...).
```

### Mental model 3: three-pointer partition (Dutch flag)

```
   ┌──── 0s ────┬──── 1s ────┬──── unknown ────┬──── 2s ────┐
   0           low          mid              high          n-1

   invariant:  a[0 .. low-1]    = 0
               a[low .. mid-1]  = 1
               a[mid .. high]   = not looked at yet
               a[high+1 .. n-1] = 2

   Each step classifies a[mid] and shrinks the "unknown" zone by one.

   Used by: Sort Colors (also quicksort 3-way partition).
```

### Mental model 4: two arrays, one pointer each

```
   A:  [■■■■]   [■■■■■■]      [■■■]
        i ──►
   B:     [■■■■■]     [■■]  [■■■■■■]
           j ──►

   Compare A[i] with B[j], record something, advance whichever
   "finishes first".  O(m + n).

   Used by: Interval List Intersections (also merging sorted arrays).
```

### Pointer-movement templates

```
TEMPLATE A: opposite ends
    L ← 0, R ← n-1
    while L < R:
        look at a[L], a[R]
        if (a[L] side can no longer help): L ← L + 1
        else:                              R ← R - 1

TEMPLATE B: read / write (same direction)
    write ← 0
    for read from 0 to n-1:
        if a[read] is a keeper:
            put a[read] at a[write]   (swap or copy)
            write ← write + 1

TEMPLATE C: three-way partition
    low ← 0, mid ← 0, high ← n-1
    while mid ≤ high:
        small  → swap(low, mid), low++, mid++
        middle → mid++
        large  → swap(mid, high), high--        // mid stays!

TEMPLATE D: two arrays
    i ← 0, j ← 0
    while i < len(A) and j < len(B):
        process A[i], B[j]
        advance the one that ends / is smaller
```

### Why moving a pointer is SAFE (the elimination proof)

```
  Sorted a, looking for a[L] + a[R] = target.
  Picture every pair as a cell in a grid (row = L, column = R):

             R →   0    1    2    3    4    5
         L  0      ·    ?    ?    ?    ?    ?
         ↓  1      ·    ·    ?    ?    ?    ?
            2      ·    ·    ·    ?    ?    ?
            3      ·    ·    ·    ·    ?    ?
            4      ·    ·    ·    ·    ·    ?

  Brute force checks every "?"  → O(n²).

  Two pointers start in the TOP-RIGHT corner (L = 0, R = n-1):

    sum > target ?  a[R] is too big even with the SMALLEST partner a[L]
                    → every cell in column R (rows ≥ L) is too big too
                    → cross out the whole COLUMN, R ← R − 1

    sum < target ?  a[L] is too small even with the BIGGEST partner a[R]
                    → every cell in row L is too small
                    → cross out the whole ROW,    L ← L + 1

  Each comparison deletes a full row or column → at most n − 1 steps.
  We never throw away a cell that could be the answer.  That is the proof.
```

> 💡 Every opposite-end problem in this guide has its own version of this sentence:
> "the pointer I move **cannot be part of any better answer** with the remaining partners."
> If you can't say that sentence, two pointers is probably wrong for the problem.

### Complexity at a glance

```
   One squeeze / one read-write pass         O(n) time, O(1) space
   Sort first, then squeeze                  O(n log n)
   Fix one element + squeeze the rest (3Sum) O(n²)
   Two arrays walked together                O(m + n)
   Halving two pointers (binary search)      O(log n)   (O(n) worst with duplicates)
```

---

## 1. Move Zeroes (Easy)

### Problem
Move all `0`s to the end of the array **in place**, keeping the relative order of the non-zero elements.

### Visualize it

```
  before:  [ 0 ,  1 ,  0 ,  3 , 12 ]
  after:   [ 1 ,  3 , 12 ,  0 ,  0 ]
             └──── same order ───┘ └ zeros ┘
```

### The key decision picture

```
                   a[read]
                      │
          ┌───────────┴───────────┐
       non-zero                  zero
          │                       │
   swap a[write], a[read]     do nothing
   write ← write + 1          (read moves on, the zero
                               gets pushed right later)

   Everything left of write is a finished non-zero.
   Everything between write and read is a zero.
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `write` (next slot for a non-zero), `read` (scanner) |
| Start | `write = 0` |
| Move | `read` always advances; `write` advances only after placing a non-zero |
| Action | non-zero → swap into `write` |
| Finish | when `read` hits the end, zeros are already at the back |

### Trace ([0, 1, 0, 3, 12])

```
  read │ a[read] │ action               │ array after          │ write after
  ─────┼─────────┼──────────────────────┼──────────────────────┼────────────
   0   │    0    │ skip                 │ [0, 1, 0, 3, 12]     │    0
   1   │    1    │ swap a[0], a[1]      │ [1, 0, 0, 3, 12]     │    1
   2   │    0    │ skip                 │ [1, 0, 0, 3, 12]     │    1
   3   │    3    │ swap a[1], a[3]      │ [1, 3, 0, 0, 12]     │    2
   4   │   12    │ swap a[2], a[4]      │ [1, 3, 12, 0, 0]     │    3

  answer = [1, 3, 12, 0, 0] ✅
```

### Edge cases

```
  all zeros   [0, 0, 0]  → read never finds a keeper, write stays 0, no swaps ✅
  no zeros    [1, 2, 3]  → each swap is a[i] with itself (harmless)        ✅
  single      [0] / [5]  → nothing to do                                    ✅
```

### Pseudocode

```
function moveZeroes(a):
    write ← 0
    for read from 0 to n-1:
        if a[read] ≠ 0:
            swap a[write], a[read]
            write ← write + 1
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Copy non-zeros into a new array, pad with zeros | O(n) | O(n) |
| Bubble each zero to the end | O(n²) | O(1) |
| Copy non-zeros forward, then fill the tail with 0 | O(n) | O(1) |
| **Read / write with swap (one pass)** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- `read` is the scout, `write` is the builder. `write ≤ read` always.
- Swapping (not overwriting) means the zeros travel to the back by themselves.
- Order is kept because non-zeros are placed in the order they are read.
- Optional micro-optimization: skip the swap when `write == read`.

---

## 2. Squares of a Sorted Array (Easy)

### Problem
Given a sorted array (may contain negatives), return the squares of each number, **also sorted**.

### Visualize it

```
  a:        [ -4 , -1 ,  0 ,  3 , 10 ]
  squares:  [ 16 ,  1 ,  0 ,  9 , 100 ]   ← NOT sorted: a "valley"

        sq ▲
       100 │                    ●
           │
        16 │●
         9 │              ●
         1 │     ●
         0 │          ●
           └──────────────────────► index

  The BIGGEST squares live at the two ENDS. The smallest is in the middle.
```

### The key decision picture

```
   L                                 R
   ▼                                 ▼
 [ -4 , -1 ,  0 ,  3 , 10 ]      result: [ _ , _ , _ , _ , _ ]
                                                           ▲ pos (fill from the back)

   compare |a[L]| vs |a[R]|
        bigger one's square → result[pos], pos ← pos − 1
        move THAT pointer inward
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n-1`, `pos = n-1` (write position in result) |
| Compare | `a[L]²` vs `a[R]²` (or absolute values) |
| Place | the larger square at `result[pos]` |
| Move | the pointer whose square was placed |
| Stop | when `L > R` (the last element is placed when `L == R`) |

### Trace ([-4, -1, 0, 3, 10])

```
  L │ R │ a[L]² │ a[R]² │ bigger │ result[pos]  │ move
  ──┼───┼───────┼───────┼────────┼──────────────┼──────
  0 │ 4 │  16   │  100  │  100   │ result[4]=100│ R → 3
  0 │ 3 │  16   │   9   │   16   │ result[3]=16 │ L → 1
  1 │ 3 │   1   │   9   │    9   │ result[2]=9  │ R → 2
  1 │ 2 │   1   │   0   │    1   │ result[1]=1  │ L → 2
  2 │ 2 │   0   │   0   │    0   │ result[0]=0  │ L → 3 (stop)

  answer = [0, 1, 9, 16, 100] ✅
```

### Edge cases

```
  all negative [-5, -3, -1] → the LEFT end always wins → [1, 9, 25]  ✅
  all positive [1, 2, 3]    → the RIGHT end always wins → [1, 4, 9]  ✅
  ties |-3| = |3|           → take either; the other is placed next ✅
```

### Pseudocode

```
function sortedSquares(a):
    result ← array of n
    L ← 0, R ← n-1, pos ← n-1
    while L ≤ R:
        if |a[L]| > |a[R]|:
            result[pos] ← a[L]²
            L ← L + 1
        else:
            result[pos] ← a[R]²
            R ← R − 1
        pos ← pos − 1
    return result
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Square everything, then sort | O(n log n) | O(n) or O(log n) |
| Find the first non-negative, merge outward from the middle | O(n) | O(n) |
| **Two pointers from the ends, fill from the back** | **O(n)** | **O(n)** (output) ✅ |

### 📌 Points to remember
- Fill the result **from the back**: the ends give the biggest values, not the smallest.
- Loop with `L ≤ R` (not `<`), or the last element is never placed.
- This is "merge two sorted lists" in disguise: the negatives (reversed) and the non-negatives.

---

## 3. Two Sum II - Input Array Is Sorted (Medium)

### Problem
`numbers` is sorted ascending. Find two **different** indices whose values add up to `target`.
Return them **1-indexed**. Exactly one solution exists. Use O(1) extra space.

### Visualize it

```
  index (1-based):   1    2    3    4    5    6
  numbers:         [ 1 ,  3 ,  4 ,  5 ,  7 , 11 ]     target = 9
                               └────┘
                              4 + 5 = 9  →  [3, 4] ✅
```

### The key decision picture

```
                 sum = a[L] + a[R]
                        │
      ┌─────────────────┼──────────────────┐
   sum < target      sum == target     sum > target
      │                 │                  │
   L ← L + 1          FOUND            R ← R − 1
   "need bigger:                     "need smaller:
    a[L] is too small                 a[R] is too big
    even with the                     even with the
    largest partner"                  smallest partner"
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n-1` |
| Compare | `sum = a[L] + a[R]` vs `target` |
| Too small | `L++` (cross out row L) |
| Too big | `R--` (cross out column R) |
| Answer | `[L+1, R+1]` when equal |

### Trace ([1, 3, 4, 5, 7, 11], target = 9)

```
  L │ R │ a[L] │ a[R] │ sum │ vs 9 │ move
  ──┼───┼──────┼──────┼─────┼──────┼──────────────
  0 │ 5 │   1  │  11  │ 12  │  >   │ R → 4
  0 │ 4 │   1  │   7  │  8  │  <   │ L → 1
  1 │ 4 │   3  │   7  │ 10  │  >   │ R → 3
  1 │ 3 │   3  │   5  │  8  │  <   │ L → 2
  2 │ 3 │   4  │   5  │  9  │  =   │ FOUND

  answer = [3, 4] (1-indexed) ✅
```

### The elimination grid for this trace

```
           R=1  R=2  R=3  R=4  R=5
   L=0      .    .    .    ✗    ✗ ← step 2 kills row 0 (1 + 7 < 9)
   L=1      .    .    ✗    ✗    ✗ ← step 4 kills row 1 (3 + 5 < 9)
   L=2      .    .    ✓    ✗    ✗
                           ▲    ▲
       step 3 kills col 4 ─┘    └─ step 1 kills col 5 (1 + 11 > 9)
   5 comparisons instead of 15 pairs.
```

### Pseudocode

```
function twoSumSorted(a, target):
    L ← 0, R ← n-1
    while L < R:
        sum ← a[L] + a[R]
        if sum == target: return [L+1, R+1]
        if sum < target:  L ← L + 1
        else:             R ← R − 1
    return []     // not reached when a solution is guaranteed
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every pair | O(n²) | O(1) |
| Hash map of seen values (ignores sortedness) | O(n) | O(n) |
| For each i, binary search for target − a[i] | O(n log n) | O(1) |
| **Two pointers from both ends** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Sorted input is the whole reason this works. Unsorted → hash map (Two Sum I).
- `L < R` (strict): the two indices must be different.
- Return **1-indexed** positions.
- The proof: each step removes a whole row or column of the pair grid.

---

## 4. Sort Colors (Medium)

### Problem
An array holds only `0`, `1`, `2` (red, white, blue). Sort it **in place**, in one pass, without a library sort.

### Visualize it

```
  before:  [ 2 , 0 , 2 , 1 , 1 , 0 ]
  after:   [ 0 , 0 , 1 , 1 , 2 , 2 ]
            └─0s─┘ └─1s─┘ └─2s─┘
```

### The key decision picture

```
   ┌──── 0s ────┬──── 1s ────┬──── unknown ────┬──── 2s ────┐
   0           low          mid              high          n-1

                          a[mid] = ?
                              │
        ┌─────────────────────┼──────────────────────┐
        0                     1                      2
        │                     │                      │
  swap(low, mid)          mid ← mid+1          swap(mid, high)
  low ← low+1             (already in           high ← high−1
  mid ← mid+1              the 1s zone)         mid STAYS
                                                (the value that came
  (what came back from low                       from high is unseen!)
   is a 1, already seen)
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `low = 0`, `mid = 0`, `high = n-1` |
| Loop while | `mid ≤ high` (unknown zone not empty) |
| `a[mid] = 0` | swap with `low`, `low++`, `mid++` |
| `a[mid] = 1` | `mid++` |
| `a[mid] = 2` | swap with `high`, `high--` (do **not** move `mid`) |

### Trace ([2, 0, 2, 1, 1, 0])

```
  low│mid│high│ a[mid] │ action                        │ array after
  ───┼───┼────┼────────┼───────────────────────────────┼────────────────────
   0 │ 0 │  5 │   2    │ swap a[0],a[5]; high → 4      │ [0, 0, 2, 1, 1, 2]
   0 │ 0 │  4 │   0    │ swap a[0],a[0]; low,mid → 1   │ [0, 0, 2, 1, 1, 2]
   1 │ 1 │  4 │   0    │ swap a[1],a[1]; low,mid → 2   │ [0, 0, 2, 1, 1, 2]
   2 │ 2 │  4 │   2    │ swap a[2],a[4]; high → 3      │ [0, 0, 1, 1, 2, 2]
   2 │ 2 │  3 │   1    │ mid → 3                       │ [0, 0, 1, 1, 2, 2]
   2 │ 3 │  3 │   1    │ mid → 4                       │ [0, 0, 1, 1, 2, 2]
   2 │ 4 │  3 │   —    │ mid > high → stop             │

  answer = [0, 0, 1, 1, 2, 2] ✅
```

### Why `mid` stays after swapping with `high` ⚠

```
  a = [1, 2, 0]     low=0, mid=0, high=2

  mid=0: a=1 → mid=1
  mid=1: a=2 → swap a[1], a[2] → [1, 0, 2], high=1

     WRONG (mid++ too):  mid=2 > high=1 → stop → [1, 0, 2] ❌
                         the 0 that arrived at mid was never checked
     RIGHT (mid stays):  mid=1: a=0 → swap a[0], a[1] → [0, 1, 2] ✅

  Swapping with LOW is different: everything in [low, mid) is already a 1,
  so the value coming back is known to be a 1 → safe to advance mid.
```

### Pseudocode

```
function sortColors(a):
    low ← 0, mid ← 0, high ← n-1
    while mid ≤ high:
        if a[mid] == 0:
            swap a[low], a[mid]
            low ← low + 1, mid ← mid + 1
        else if a[mid] == 1:
            mid ← mid + 1
        else:                      // a[mid] == 2
            swap a[mid], a[high]
            high ← high − 1
```

### Optimization ladder

| Approach | Time | Space | Passes |
|---|---|---|---|
| Library sort | O(n log n) | O(log n) | — |
| Counting sort (count 0s, 1s, 2s, rewrite) | O(n) | O(1) | 2 |
| **Dutch national flag (3 pointers)** | **O(n)** | **O(1)** | **1** ✅ |

### 📌 Points to remember
- Loop condition is `mid ≤ high` (the element at `high` is still unknown).
- After swapping with `high`, **do not** advance `mid`.
- After swapping with `low`, advance **both** `low` and `mid`.
- Same idea = 3-way partition in quicksort (less / equal / greater than pivot).

---

## 5. Container With Most Water (Medium)

### Problem
`height[i]` is a vertical line at position `i`. Pick two lines that, with the x-axis, hold the most water.
Area = `min(height[L], height[R]) × (R − L)`.

### Visualize it

```
  height = [1, 8, 6, 2, 5, 4, 8, 3, 7]

     8 │    █              █
     7 │    █  ~  ~  ~  ~  █  ~  █
     6 │    █  █  ~  ~  ~  █  ~  █
     5 │    █  █  ~  █  ~  █  ~  █
     4 │    █  █  ~  █  █  █  ~  █
     3 │    █  █  ~  █  █  █  █  █
     2 │    █  █  █  █  █  █  █  █
     1 │ █  █  █  █  █  █  █  █  █
       └───────────────────────────
         0  1  2  3  4  5  6  7  8

   best: lines 1 and 8 → min(8, 7) × 7 = 49
   (water level 7, the lines in between don't matter: they are "see-through")
```

### The key decision picture

```
   area = min(h[L], h[R]) × width

   The SHORTER line is the bottleneck.
   ┌──────────────────────────────────────────────────────────────┐
   │ Moving the TALLER line inward:                                │
   │   width shrinks, height is still capped by the shorter line   │
   │   → area can ONLY get smaller. Useless.                       │
   │ Moving the SHORTER line inward:                               │
   │   width shrinks, but the cap might rise → the only hope.      │
   └──────────────────────────────────────────────────────────────┘

   Safe-to-discard proof: the shorter line, paired with ANY line
   between L and R, has a smaller width and height ≤ itself
   → none of those pairs can beat the current area. Discard it.
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n-1` |
| Measure | `area = min(h[L], h[R]) × (R − L)`, update `best` |
| Move | the **shorter** line inward (tie: either one) |
| Stop | `L == R` |
| Answer | `best` |

### Trace ([1, 8, 6, 2, 5, 4, 8, 3, 7])

```
  L │ R │ h[L] │ h[R] │ width │ area         │ best │ move
  ──┼───┼──────┼──────┼───────┼──────────────┼──────┼──────────────
  0 │ 8 │  1   │  7   │   8   │ 1 × 8 =  8   │   8  │ L (1 < 7)
  1 │ 8 │  8   │  7   │   7   │ 7 × 7 = 49   │  49  │ R (7 < 8)
  1 │ 7 │  8   │  3   │   6   │ 3 × 6 = 18   │  49  │ R
  1 │ 6 │  8   │  8   │   5   │ 8 × 5 = 40   │  49  │ R (tie)
  1 │ 5 │  8   │  4   │   4   │ 4 × 4 = 16   │  49  │ R
  1 │ 4 │  8   │  5   │   3   │ 5 × 3 = 15   │  49  │ R
  1 │ 3 │  8   │  2   │   2   │ 2 × 2 =  4   │  49  │ R
  1 │ 2 │  8   │  6   │   1   │ 6 × 1 =  6   │  49  │ R → 1, stop

  answer = 49 ✅
```

### Pseudocode

```
function maxArea(h):
    L ← 0, R ← n-1, best ← 0
    while L < R:
        area ← min(h[L], h[R]) × (R − L)
        best ← max(best, area)
        if h[L] < h[R]: L ← L + 1
        else:           R ← R − 1
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every pair (L, R) | O(n²) | O(1) |
| **Two pointers, move the shorter line** | **O(n)** | **O(1)** ✅ |
| Micro-opt: after moving, skip lines not taller than the old bottleneck | O(n) | O(1) |

### 📌 Points to remember
- Always move the **shorter** line. Moving the taller one can never help.
- Not the same as Trapping Rain Water: here only **two** lines matter, the ones in between are ignored.
- Ties: moving either side is correct (both can't be part of a better answer with the current partner).

---

## 6. 3Sum (Medium)

### Problem
Return all **unique** triplets `[a, b, c]` from the array with `a + b + c = 0`.

### Visualize it

```
  nums   = [-1, 0, 1, 2, -1, -4]
  sorted = [-4, -1, -1, 0, 1, 2]

  Fix ONE number, then the other two are a Two Sum II on the rest:

     i         L ──►                ◄── R
   [ -4 ,   -1 ,  -1 ,   0 ,   1 ,   2 ]
     ▲     └──────── need sum = +4 ───────┘
    fixed
```

### The key decision picture

```
   for each i (fixed):   need = −a[i]
                          L = i+1, R = n-1
                                 │
             a[L] + a[R] vs need (i.e. total vs 0)
          ┌──────────────────────┼───────────────────────┐
        < 0                    == 0                     > 0
       L++               record triplet               R--
                         L++, R--
                         skip duplicate L's and R's

   DUPLICATE CONTROL (3 places):
     ① skip i if a[i] == a[i-1]        (same first number)
     ② after a hit, skip L while a[L] == a[L-1]
     ③ after a hit, skip R while a[R] == a[R+1]
```

### The steps

| Step | Answer |
|------|--------|
| Prep | sort the array |
| Outer | `i` from 0 to n−3; skip duplicate `a[i]`; stop early if `a[i] > 0` |
| Inner | Two Sum II on `[i+1 .. n-1]` with target `−a[i]` |
| On hit | record, move both, skip duplicates |
| Answer | all recorded triplets |

### Trace ([-4, -1, -1, 0, 1, 2])

```
  i │ a[i] │ L │ R │ a[L] │ a[R] │ total │ action
  ──┼──────┼───┼───┼──────┼──────┼───────┼─────────────────────────────
  0 │  -4  │ 1 │ 5 │  -1  │   2  │  -3   │ < 0 → L++
    │      │ 2 │ 5 │  -1  │   2  │  -3   │ < 0 → L++
    │      │ 3 │ 5 │   0  │   2  │  -2   │ < 0 → L++
    │      │ 4 │ 5 │   1  │   2  │  -1   │ < 0 → L++ → L = R, done
  1 │  -1  │ 2 │ 5 │  -1  │   2  │   0   │ ✅ [-1, -1, 2]; L → 3, R → 4
    │      │ 3 │ 4 │   0  │   1  │   0   │ ✅ [-1, 0, 1];  L → 4, R → 3, done
  2 │  -1  │   │   │      │      │       │ same as a[1] → SKIP ①
  3 │   0  │ 4 │ 5 │   1  │   2  │   3   │ > 0 → R-- → L = R, done

  answer = [[-1, -1, 2], [-1, 0, 1]] ✅
```

### Edge case: all zeros ([0, 0, 0, 0])

```
  i=0: L=1, R=3 → 0+0+0 = 0 ✅ [0, 0, 0]
       L → 2, R → 2  (skips stop because L < R fails)   → done
  i=1: a[1] == a[0] → SKIP
  (i=2 is n−2, outer loop ends)

  answer = [[0, 0, 0]]  (exactly once) ✅
  Without skip ①, i=1 would report [0, 0, 0] again.
```

### Edge case: why duplicates sneak in without ② and ③

```
  sorted = [-2, 0, 0, 2, 2],  i = 0 (a = -2)

  L=1, R=4: -2 + 0 + 2 = 0 ✅ [-2, 0, 2]
  without skipping:  L=2, R=3: -2 + 0 + 2 = 0 → [-2, 0, 2] AGAIN ❌
  with skipping:     L → 2 → skip to 3 (a[2] == a[1]); L=3, R=3 → stop ✅
```

### Pseudocode

```
function threeSum(a):
    sort a
    result ← []
    for i from 0 to n-3:
        if a[i] > 0: break                      // smallest is positive → no more zeros
        if i > 0 and a[i] == a[i-1]: continue   // ① skip duplicate first number
        L ← i+1, R ← n-1
        while L < R:
            total ← a[i] + a[L] + a[R]
            if total < 0:      L ← L + 1
            else if total > 0: R ← R − 1
            else:
                add [a[i], a[L], a[R]] to result
                L ← L + 1, R ← R − 1
                while L < R and a[L] == a[L-1]: L ← L + 1   // ②
                while L < R and a[R] == a[R+1]: R ← R − 1   // ③
    return result
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Three nested loops + set of sorted triplets | O(n³) | O(answer) |
| Fix i, hash set for the pair (dedupe with a set) | O(n²) | O(n) |
| **Sort + fix i + two pointers** | **O(n²)** | **O(1)** extra (ignoring sort / output) ✅ |

> O(n²) is the practical floor here: the output alone can be Θ(n²) triplets.

### 📌 Points to remember
- **Sort first.** It enables both the squeeze and the duplicate skipping.
- Three duplicate guards: outer `i`, and `L` / `R` after each hit.
- Early exit: `a[i] > 0` means no triplet can sum to 0 from here on.
- kSum generalizes: fix k−2 numbers with loops, squeeze the last two.

---

## 7. 3Sum Closest (Medium)

### Problem
Return the **sum** of the three numbers whose sum is closest to `target`. Exactly one answer exists.

### Visualize it

```
  nums = [-1, 2, 1, -4], target = 1
  sorted = [-4, -1, 1, 2]

  possible sums:  -4-1+1 = -4   -4-1+2 = -3   -4+1+2 = -1   -1+1+2 = 2
  distance to 1:     5             4             2            1  ← closest
```

### The key decision picture

```
   Same skeleton as 3Sum, but instead of "== 0" we track the best distance:

          total = a[i] + a[L] + a[R]
          if |total − target| < |best − target| → best ← total
                     │
       ┌─────────────┼──────────────┐
   total < target  total == target  total > target
       L++          return target     R--
   (need bigger)   (can't do better) (need smaller)

   No duplicate skipping needed: we return ONE number, not a list.
   (Skipping duplicate i's is still a harmless speed-up.)
```

### The steps

| Step | Answer |
|------|--------|
| Prep | sort; `best = a[0] + a[1] + a[2]` |
| Outer | fix `i` |
| Inner | squeeze `L`, `R`; update `best` if closer |
| Move | `total < target` → `L++`; `>` → `R--`; `==` → return immediately |
| Answer | `best` |

### Trace ([-4, -1, 1, 2], target = 1)

```
  start: best = -4 + -1 + 1 = -4   (distance 5)

  i │ a[i] │ L │ R │ total          │ |total − 1| │ best │ move
  ──┼──────┼───┼───┼────────────────┼─────────────┼──────┼──────────
  0 │  -4  │ 1 │ 3 │ -4 -1 +2 = -3  │      4      │  -3  │ < 1 → L++
    │      │ 2 │ 3 │ -4 +1 +2 = -1  │      2      │  -1  │ < 1 → L++ → done
  1 │  -1  │ 2 │ 3 │ -1 +1 +2 =  2  │      1      │   2  │ > 1 → R-- → done

  answer = 2 ✅
```

### Pseudocode

```
function threeSumClosest(a, target):
    sort a
    best ← a[0] + a[1] + a[2]
    for i from 0 to n-3:
        L ← i+1, R ← n-1
        while L < R:
            total ← a[i] + a[L] + a[R]
            if |total − target| < |best − target|: best ← total
            if total < target:      L ← L + 1
            else if total > target: R ← R − 1
            else: return target          // exact hit, distance 0
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| All triplets | O(n³) | O(1) |
| Fix two, binary search the third | O(n² log n) | O(1) |
| **Sort + fix i + two pointers** | **O(n²)** | **O(1)** ✅ |

### 📌 Points to remember
- Initialize `best` with a **real** triplet sum, not infinity (avoids overflow in `best − target`).
- Compare **distances** `|total − target|`, but store the **sum**.
- Exact hit → return at once.
- Why the squeeze is still safe: if `total < target`, every pair `(L, R')` with `R' < R` is even smaller, so it is further from the target. Row L is done.

---

## 8. Interval List Intersections (Medium)

### Problem
Two lists of **closed** intervals, each list sorted and pairwise disjoint. Return the intersection of the two lists.

> Intervals have their own guide: [../greedy/01-Intervals-and-Reach.md](../greedy/01-Intervals-and-Reach.md).
> Here the focus is the **one-pointer-per-list** walk.

### Visualize it

```
  A = [[0,2], [5,10], [13,23], [24,25]]
  B = [[1,5], [8,12], [15,24], [25,26]]

  A:  [0..2]       [5.......10]       [13...........23] [24..25]
  B:     [1......5]    [8........12]      [15.............24] [25..26]

  overlap: [1,2]  [5,5]  [8,10]  [15,23]  [24,24]  [25,25]
```

### The key decision picture

```
   A[i] = [s1, e1]       B[j] = [s2, e2]

   lo = max(s1, s2)      ← the LATER start
   hi = min(e1, e2)      ← the EARLIER end
   lo ≤ hi ?  → [lo, hi] is an intersection

       s1 ├────────────┤ e1
              s2 ├───────────┤ e2
                 ▲         ▲
                 lo        hi

   Which pointer moves?  The interval that ENDS FIRST.
   Every later interval of the other list starts after the current one ends,
   which is already past this short interval's end → it can't overlap anything else.
   The one that ends later might still overlap the NEXT interval of the other list.
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `i` into A, `j` into B |
| Overlap | `lo = max(starts)`, `hi = min(ends)`; keep if `lo ≤ hi` |
| Move | advance the interval with the smaller end (tie: either one) |
| Stop | when either list runs out |

### Trace

```
  i │ j │ A[i]    │ B[j]    │ lo │ hi │ result      │ ends first → move
  ──┼───┼─────────┼─────────┼────┼────┼─────────────┼──────────────────
  0 │ 0 │ [0,2]   │ [1,5]   │  1 │  2 │ [1,2]       │ A (2 < 5)   i → 1
  1 │ 0 │ [5,10]  │ [1,5]   │  5 │  5 │ [5,5]       │ B (5 < 10)  j → 1
  1 │ 1 │ [5,10]  │ [8,12]  │  8 │ 10 │ [8,10]      │ A (10 < 12) i → 2
  2 │ 1 │ [13,23] │ [8,12]  │ 13 │ 12 │ — (lo > hi) │ B (12 < 23) j → 2
  2 │ 2 │ [13,23] │ [15,24] │ 15 │ 23 │ [15,23]     │ A (23 < 24) i → 3
  3 │ 2 │ [24,25] │ [15,24] │ 24 │ 24 │ [24,24]     │ B (24 < 25) j → 3
  3 │ 3 │ [24,25] │ [25,26] │ 25 │ 25 │ [25,25]     │ A (25 < 26) i → 4, stop

  answer = [[1,2], [5,5], [8,10], [15,23], [24,24], [25,25]] ✅
```

### Edge cases

```
  touching endpoints   [1,3] & [3,5] → lo = 3, hi = 3 → [3,3] ✅ (closed intervals!)
  one list empty       → loop never runs → [] ✅
  one big interval     A = [[0,100]], B = many small ones inside it
                       → A never ends first, j walks all of B, each one is an overlap ✅
```

### Pseudocode

```
function intervalIntersection(A, B):
    i ← 0, j ← 0, result ← []
    while i < len(A) and j < len(B):
        lo ← max(A[i].start, B[j].start)
        hi ← min(A[i].end,   B[j].end)
        if lo ≤ hi: add [lo, hi] to result
        if A[i].end < B[j].end: i ← i + 1
        else:                   j ← j + 1
    return result
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Compare every A interval with every B interval | O(m · n) | O(1) extra |
| For each A interval, binary search B | O(m log n + output) | O(1) extra |
| **Two pointers, advance the earlier end** | **O(m + n)** | **O(1)** extra ✅ |

### 📌 Points to remember
- Intersection = **max of starts, min of ends**, valid when `lo ≤ hi`.
- Advance the interval that **ends first**. Never advance both blindly.
- Closed intervals: touching endpoints produce a single-point intersection.
- This is the "merge two sorted lists" walk with a different action per step.

---

## 9. Search in Rotated Sorted Array II (Medium)

### Problem
A sorted array (with **duplicates**) was rotated at an unknown pivot. Return `true` if `target` is in it.

> The no-duplicates version and the full binary-search toolkit live in
> [../binary search/01-Classic-Binary-Search.md](../binary%20search/01-Classic-Binary-Search.md).
> Here: `lo` and `hi` are two pointers that move toward each other, but they **jump** instead of stepping.

### Visualize it

```
  sorted:   [0, 0, 1, 2, 2, 5, 6]
  rotated:  [2, 5, 6, 0, 0, 1, 2]

     value ▲
         6 │       ●
         5 │    ●
         2 │ ●                    ●
         1 │                   ●
         0 │          ●  ●
           └──────────────────────► index
             0  1  2  3  4  5  6
             └─high run─┘└─low run──┘

  Cut it anywhere at mid → AT LEAST ONE half is a normal sorted run.
```

### The key decision picture

```
                  a[mid] == target ?  → true
                           │
       a[lo] == a[mid] == a[hi] ?  ── yes ──► can't tell which half is sorted
                           │                  lo ← lo + 1, hi ← hi − 1
                           no                 (both ends equal a[mid] ≠ target,
                           │                   so dropping them is safe)
        ┌──────────────────┴─────────────────────┐
   a[lo] ≤ a[mid]                           otherwise
   LEFT half [lo..mid] is sorted            RIGHT half [mid..hi] is sorted
        │                                        │
   a[lo] ≤ target < a[mid] ?               a[mid] < target ≤ a[hi] ?
     yes → hi ← mid − 1                       yes → lo ← mid + 1
     no  → lo ← mid + 1                       no  → hi ← mid − 1

   "Is the target inside the SORTED half? If yes go there, else go to the other half."
```

### Why duplicates hurt

```
  a = [1, 0, 1, 1, 1]       lo=0, mid=2, hi=4
       a[lo] = 1, a[mid] = 1, a[hi] = 1

  Is the left half [1, 0, 1] sorted?   NO.
  Compare with [1, 1, 1, 0, 1]: same lo / mid / hi values, but now the RIGHT half
  is the broken one. The three probes look identical → no way to decide.
  Only safe move: shrink both ends by one.
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `lo = 0`, `hi = n-1` |
| Probe | `mid = (lo + hi) / 2`; `a[mid] == target` → `true` |
| Ambiguous | `a[lo] == a[mid] == a[hi]` → `lo++`, `hi--` |
| Otherwise | find the sorted half, test if target is inside, keep that half or the other |
| Stop | `lo > hi` → `false` |

### Trace 1 ([1, 0, 1, 1, 1], target = 0) → true

```
  lo │ hi │ mid │ a[lo] a[mid] a[hi] │ case                        │ action
  ───┼────┼─────┼────────────────────┼─────────────────────────────┼──────────────────────
   0 │  4 │  2  │   1     1     1    │ all equal → ambiguous       │ lo → 1, hi → 3
   1 │  3 │  2  │   0     1     1    │ 0 ≤ 1 → left [0,1] sorted   │ 0 ≤ 0 < 1 ✓ → hi → 1
   1 │  1 │  1  │   0     0     0    │ a[mid] == 0                 │ FOUND

  answer = true ✅
```

### Trace 2 ([2, 5, 6, 0, 0, 1, 2], target = 3) → false

```
  lo │ hi │ mid │ a[lo] a[mid] a[hi] │ case                          │ action
  ───┼────┼─────┼────────────────────┼───────────────────────────────┼──────────────────────
   0 │  6 │  3  │   2     0     2    │ 2 > 0 → right [0,0,1,2] sorted│ 0 < 3 ≤ 2? no → hi → 2
   0 │  2 │  1  │   2     5     6    │ 2 ≤ 5 → left [2,5] sorted     │ 2 ≤ 3 < 5 ✓ → hi → 0
   0 │  0 │  0  │   2     2     2    │ 2 ≠ 3, all equal → ambiguous  │ lo → 1, hi → −1
   1 │ −1 │     │                    │ lo > hi                       │ stop

  answer = false ✅
```

### Worst case: O(n)

```
  a = [1, 1, 1, 1, 1, 1, 1],  target = 2

  every probe:  a[lo] = a[mid] = a[hi] = 1  → ambiguous → lo++, hi--
  (lo, hi):  (0,6) → (1,5) → (2,4) → (3,3) → (4,2) stop

  Each step removes only 2 elements → about n/2 steps → O(n).
  No algorithm can do better here: a single different value hidden among the 1s
  (e.g. [1, 1, 1, 1, 0, 1, 1]) looks identical at lo, mid and hi
  until you happen to probe it.
```

### Pseudocode

```
function search(a, target):
    lo ← 0, hi ← n-1
    while lo ≤ hi:
        mid ← lo + (hi − lo) / 2
        if a[mid] == target: return true
        if a[lo] == a[mid] and a[mid] == a[hi]:
            lo ← lo + 1, hi ← hi − 1
        else if a[lo] ≤ a[mid]:                       // left half sorted
            if a[lo] ≤ target < a[mid]: hi ← mid − 1
            else:                       lo ← mid + 1
        else:                                         // right half sorted
            if a[mid] < target ≤ a[hi]: lo ← mid + 1
            else:                       hi ← mid − 1
    return false
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Linear scan | O(n) | O(1) |
| Find the pivot, then binary search one side | O(log n) avg, O(n) worst | O(1) |
| **Modified binary search with the shrink-both-ends rule** | **O(log n) avg, O(n) worst** | **O(1)** ✅ |

### 📌 Points to remember
- Without duplicates (LC 33), `a[lo] ≤ a[mid]` always tells you the sorted half. With duplicates it can lie.
- The fix: when `a[lo] == a[mid] == a[hi]`, drop both ends (they equal `a[mid]`, which is not the target).
- Worst case is **O(n)**, and that is unavoidable, not a flaw of the method.
- Range checks: `≤` on the end of the sorted half you keep, strict `<` against `a[mid]` (already checked).

---

## 10. Trapping Rain Water (Hard)

### Problem
`height[i]` is the height of a bar of width 1. How much rain water is trapped after raining?

### Visualize it

```
  height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]

     3 │                      █
     2 │          █  ~  ~  ~  █  █  ~  █
     1 │    █  ~  █  █  ~  █  █  █  █  █  █
       └────────────────────────────────────
         0  1  2  3  4  5  6  7  8  9 10 11

   ~ = trapped water   total = 6
```

### The key idea: water above ONE bar

```
   water[i] = min( tallest bar to the LEFT  (including i),
                   tallest bar to the RIGHT (including i) ) − height[i]

          leftMax                       rightMax
            █                              █
            █  ~  ~  ~  ~  ~  ~  ~  ~  ~   █   ← level = the SHORTER wall
            █  ~  ~  ~  █  ~  ~  ~  ~  ~   █
            █  ~  ~  ~  █  ~  ~  ~  ~  ~   █
                        ▲
                        i: water = level − height[i]
```

### View 1: prefix maxima (two arrays)

> This is the "prefix from the left, suffix from the right" pattern from
> [03-Prefix-Sum.md](03-Prefix-Sum.md) (Pattern 4), with `max` instead of `+`.

```
  i        :  0  1  2  3  4  5  6  7  8  9 10 11
  height   :  0  1  0  2  1  0  1  3  2  1  2  1
  leftMax  :  0  1  1  2  2  2  2  3  3  3  3  3   ──► built left to right
  rightMax :  3  3  3  3  3  3  3  3  2  2  2  1   ◄── built right to left
  min      :  0  1  1  2  2  2  2  3  2  2  2  1
  water    :  0  0  1  0  1  2  1  0  0  1  0  0

  total = 1 + 1 + 2 + 1 + 1 = 6 ✅
```

### View 2: two pointers (O(1) space)

```
   Observation: water[i] only needs the SMALLER of leftMax and rightMax.

   L ──►                                  ◄── R
   lmax = max seen from the left       rmax = max seen from the right

   If height[L] < height[R]:
       the right side already has a wall (h[R]) taller than h[L],
       and every earlier left bar was processed only while some right bar
       was at least as tall → lmax ≤ the true rightMax(L)
       → the LEFT wall is the shorter one: level at L = lmax (after including h[L])
       → water at L = lmax − height[L]   (known NOW), then L++
   Else:
       symmetric: rmax is the smaller wall for R
       → water at R = rmax − height[R], then R--

   "Process the side with the lower bar: its level is already settled."
```

### The steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n-1`, `lmax = rmax = 0` |
| Choose side | `height[L] < height[R]` → left, else right |
| Left side | `lmax = max(lmax, height[L])`, `water += lmax − height[L]`, `L++` |
| Right side | `rmax = max(rmax, height[R])`, `water += rmax − height[R]`, `R--` |
| Stop | `L == R` (the last bar standing is a tallest bar; no water on top) |

### Trace 1 (two pointers, [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])

```
  L │ R  │ h[L] │ h[R] │ side  │ lmax │ rmax │ +water │ total
  ──┼────┼──────┼──────┼───────┼──────┼──────┼────────┼──────
  0 │ 11 │  0   │  1   │ left  │  0   │  0   │   0    │  0
  1 │ 11 │  1   │  1   │ right │  0   │  1   │   0    │  0
  1 │ 10 │  1   │  2   │ left  │  1   │  1   │   0    │  0
  2 │ 10 │  0   │  2   │ left  │  1   │  1   │   1    │  1
  3 │ 10 │  2   │  2   │ right │  1   │  2   │   0    │  1
  3 │  9 │  2   │  1   │ right │  1   │  2   │   1    │  2
  3 │  8 │  2   │  2   │ right │  1   │  2   │   0    │  2
  3 │  7 │  2   │  3   │ left  │  2   │  2   │   0    │  2
  4 │  7 │  1   │  3   │ left  │  2   │  2   │   1    │  3
  5 │  7 │  0   │  3   │ left  │  2   │  2   │   2    │  5
  6 │  7 │  1   │  3   │ left  │  2   │  2   │   1    │  6
  7 │  7 │      │      │ L == R → stop                │

  answer = 6 ✅   (a tie h[L] == h[R] goes right, as in the pseudocode)
```

### Trace 2 (prefix-max view, [4, 2, 0, 3, 2, 5])

```
  i        :  0  1  2  3  4  5
  height   :  4  2  0  3  2  5
  leftMax  :  4  4  4  4  4  5
  rightMax :  5  5  5  5  5  5
  min      :  4  4  4  4  4  5
  water    :  0  2  4  1  2  0

  total = 2 + 4 + 1 + 2 = 9 ✅
```

### Edge cases

```
  fewer than 3 bars        → 0 (need two walls and a dip)
  strictly increasing      [1, 2, 3]  → no left wall taller than any bar → 0
  strictly decreasing      [3, 2, 1]  → no right wall → 0
  one side lower           [3, 0, 1]  → level = min(3, 1) = 1 → water 1
  all zeros                [0, 0, 0]  → 0
```

### Pseudocode

```
// View 1: prefix maxima
function trapPrefix(h):
    leftMax[0] ← h[0]
    for i from 1 to n-1:      leftMax[i]  ← max(leftMax[i-1], h[i])
    rightMax[n-1] ← h[n-1]
    for i from n-2 down to 0: rightMax[i] ← max(rightMax[i+1], h[i])
    water ← 0
    for i from 0 to n-1:
        water ← water + min(leftMax[i], rightMax[i]) − h[i]
    return water

// View 2: two pointers
function trap(h):
    L ← 0, R ← n-1, lmax ← 0, rmax ← 0, water ← 0
    while L < R:
        if h[L] < h[R]:
            lmax  ← max(lmax, h[L])
            water ← water + lmax − h[L]
            L ← L + 1
        else:
            rmax  ← max(rmax, h[R])
            water ← water + rmax − h[R]
            R ← R − 1
    return water
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| For each i, scan left and right for the maxima | O(n²) | O(1) |
| Prefix / suffix max arrays | O(n) | O(n) |
| Monotonic stack (fills water in horizontal layers) | O(n) | O(n) |
| **Two pointers with running maxima** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Water at `i` = `min(leftMax, rightMax) − height[i]` (maxima include `i`, so it is never negative).
- Two pointers: **process the lower side**, because its level is already decided.
- Container With Most Water picks **two** lines; Rain Water sums over **every** bar. Don't mix them up.
- The prefix-max view is the easiest to explain in an interview; then optimize to two pointers.

---

## 11. Master Cheat Sheet

### All 10 problems at a glance

```
┌──────────────────────────────┬───────────────────┬───────────────────────────────────────────┬───────────────┬────────────┐
│ Problem                      │ Variant           │ Key move                                  │ Time          │ Space      │
├──────────────────────────────┼───────────────────┼───────────────────────────────────────────┼───────────────┼────────────┤
│ Move Zeroes                  │ read / write      │ non-zero → swap into write, write++       │ O(n)          │ O(1)       │
│ Squares of a Sorted Array    │ opposite ends     │ bigger |end| fills result from the back   │ O(n)          │ O(n) out   │
│ Two Sum II                   │ opposite ends     │ sum < t → L++, sum > t → R--              │ O(n)          │ O(1)       │
│ Sort Colors                  │ 3-way partition   │ 0 → swap low, 2 → swap high (mid stays)   │ O(n)          │ O(1)       │
│ Container With Most Water    │ opposite ends     │ move the SHORTER line                     │ O(n)          │ O(1)       │
│ 3Sum                         │ fix one + squeeze │ sort, fix i, Two Sum II, skip duplicates  │ O(n²)         │ O(1) extra │
│ 3Sum Closest                 │ fix one + squeeze │ same squeeze, track min |sum − target|    │ O(n²)         │ O(1) extra │
│ Interval List Intersections  │ two arrays        │ [max start, min end]; advance earlier end │ O(m + n)      │ O(1) extra │
│ Search Rotated Sorted II     │ halving lo / hi   │ pick sorted half; all equal → lo++, hi--  │ O(log n)–O(n) │ O(1)       │
│ Trapping Rain Water          │ ends + running max│ process the lower side with its max       │ O(n)          │ O(1)       │
└──────────────────────────────┴───────────────────┴───────────────────────────────────────────┴───────────────┴────────────┘
```

### Family tree

```
                                 TWO POINTERS
                                      │
       ┌───────────────┬──────────────┼───────────────┬──────────────────┐
       │               │              │               │                  │
  SAME DIRECTION   OPPOSITE ENDS    3-WAY         TWO ARRAYS        HALVING lo / hi
  (read / write)   (squeeze)        PARTITION     (one ptr each)    (binary search)
       │               │              │               │                  │
  └ Move Zeroes        │          └ Sort Colors   └ Interval List    └ Search Rotated
                       │                            Intersections      Sorted Array II
       ┌───────────────┼──────────────────┬────────────────────┐
       │               │                  │                    │
  MERGE FROM ENDS   PAIR SUM          BOTTLENECK          RUNNING MAX
  └ Squares of a    └ Two Sum II      └ Container         └ Trapping Rain Water
    Sorted Array        │               With Most Water     (also: prefix-max view)
                        │
                 FIX ONE + SQUEEZE
                 ├ 3Sum
                 └ 3Sum Closest
```

### Recognition checklist

```
  ☐ Sorted array + pair with a target sum?           → opposite ends (Two Sum II)
  ☐ Triplet / quadruplet sum?                        → sort, fix k−2 numbers, squeeze the last two
  ☐ "Closest to target"?                             → same squeeze, track the best distance
  ☐ In place, keep order, push some values aside?    → read / write pointers
  ☐ Only 3 distinct values to group?                 → low / mid / high partition
  ☐ Value depends on both ends and a width?          → move the bottleneck (shorter) side
  ☐ Biggest values sit at the two ends?              → fill the output from the back
  ☐ Two sorted lists to combine / intersect?         → one pointer per list
  ☐ Rotated sorted array?                            → lo / hi halving, find the sorted half
  ☐ Per-index answer needs left max AND right max?   → prefix arrays, or two pointers + running max
```

### 🚩 Common bugs to avoid

```
  ✗ Two pointers on an UNSORTED array for a pair sum (sort first, or use a hash map)
  ✗ Squares: loop with L < R → the last element is never written
  ✗ Two Sum II: returning 0-based indices
  ✗ Sort Colors: advancing mid after swapping with high
  ✗ Container: moving the TALLER line
  ✗ 3Sum: forgetting one of the three duplicate guards (i, L, R)
  ✗ 3Sum: skipping i when a[i] == a[i+1] (look BACK, a[i-1], or you lose [-1, -1, 2])
  ✗ 3Sum Closest: best = infinity, then best − target overflows
  ✗ Intervals: advancing both pointers, or the one that ends LATER
  ✗ Rotated II: no all-equal check → wrong half chosen → target missed
  ✗ Rain water: using the TALLER side's max as the water level
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which pointer can I move WITHOUT losing an answer,     ║
   ║   and why can't the element it leaves behind help?"      ║
   ╚══════════════════════════════════════════════════════════╝
     Sum too big → the right end is useless.   Shorter line → it is the bottleneck.
     Lower bar → its water level is settled.   Earlier end → it can't overlap more.
```

---

### ✅ Progress tracker

- [ ] Move Zeroes (Easy)
- [ ] Squares of a Sorted Array (Easy)
- [ ] Two Sum II - Input Array Is Sorted (Medium)
- [ ] Sort Colors (Medium)
- [ ] Container With Most Water (Medium)
- [ ] 3Sum (Medium)
- [ ] 3Sum Closest (Medium)
- [ ] Interval List Intersections (Medium)
- [ ] Search in Rotated Sorted Array II (Medium)
- [ ] Trapping Rain Water (Hard)
