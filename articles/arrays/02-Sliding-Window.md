# Sliding Window: A Visual Guide

> **Goal:** Learn to *see* "best / count of subarrays under a constraint" problems, slide a window
> across the array in one pass, and know when to grow it, shrink it, count with it, or bolt on a deque or two heaps.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> The string version of this pattern lives in [../strings/02-Sliding-Window-String.md](../strings/02-Sliding-Window-String.md).

---

## Table of Contents

0. [The Big Idea: A Window That Slides](#0-the-big-idea-a-window-that-slides)
1. [Maximum Sum Subarray of Size K (Easy)](#1-maximum-sum-subarray-of-size-k-easy)
2. [Maximum Average Subarray I (Easy)](#2-maximum-average-subarray-i-easy)
3. [Find K Closest Elements (Medium)](#3-find-k-closest-elements-medium)
4. [Max Consecutive Ones (Easy)](#4-max-consecutive-ones-easy)
5. [Max Consecutive Ones III (Medium)](#5-max-consecutive-ones-iii-medium)
6. [Fruit Into Baskets (Medium)](#6-fruit-into-baskets-medium)
7. [Minimum Size Subarray Sum (Medium)](#7-minimum-size-subarray-sum-medium)
8. [Subarray Product Less Than K (Medium)](#8-subarray-product-less-than-k-medium)
9. [Subarrays with K Different Integers (Hard)](#9-subarrays-with-k-different-integers-hard)
10. [Sliding Window Maximum (Hard)](#10-sliding-window-maximum-hard)
11. [Sliding Window Median (Hard)](#11-sliding-window-median-hard)
12. [Master Cheat Sheet](#12-master-cheat-sheet)

> **Suggested order:** **fixed window** (Max Sum of Size K → Max Average → K Closest)
> → **variable window, longest** (Max Consecutive Ones → Ones III → Fruit Into Baskets)
> → **variable window, shortest** (Minimum Size Subarray Sum)
> → **counting trick** (Product Less Than K → K Different Integers)
> → **deque** (Sliding Window Maximum) → **two heaps** (Sliding Window Median).
> Each group adds exactly one new idea on top of the previous one.

---

## 0. The Big Idea: A Window That Slides

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "SLIDING WINDOW"                        │
├──────────────────────────────────────────────────────────────────┤
│  • "CONTIGUOUS subarray / substring"                             │
│  • "of size k" / "every window of length k"                      │
│  • "LONGEST subarray such that ..." (at most k zeros, ≤ 2 types) │
│  • "SHORTEST subarray such that ..." (sum ≥ target)              │
│  • "COUNT subarrays such that ..." (product < k, exactly k kinds)│
│  • Constraint on SUM, LENGTH, or DISTINCT COUNT                  │
│  • All numbers are NON-NEGATIVE (so sums only grow when you grow)│
└──────────────────────────────────────────────────────────────────┘

  ⚠ "Count subarrays with sum = k" and negatives allowed → PREFIX SUM + hashmap.
  ⚠ "Best subarray sum, no length rule"                  → KADANE.
```

### Two kinds of windows

```
  FIXED WINDOW (size k never changes)            k = 3

  index:  0   1   2   3   4   5
  a    : [2 , 1 , 5 , 1 , 3 , 2]
          └───────┘                  window 0..2
              └───────┘              window 1..3   ← a[0] leaves, a[3] enters
                  └───────┘          window 2..4   ← a[1] leaves, a[4] enters
                      └───────┘      window 3..5

  Each slide = ONE element out on the left + ONE element in on the right.
  Update the state in O(1) instead of recomputing the whole window.


  VARIABLE WINDOW (size breathes)

           l               r
           ▼               ▼
  a    : [ 1 , 1 , 0 , 1 , 1 , 0 , 1 ]
           └───────────────┘
           r ALWAYS moves right  → EXPAND (take a new element in)
           l moves right ONLY when the window breaks the rule → SHRINK

     expand ──►  ┌─────────────┐  ──► expand
                 │   window    │
     shrink ──►  └─────────────┘
     (left edge chases the right edge, never moves backward)
```

### Why it's O(n)

```
  r goes 0 → n-1           : n moves
  l goes 0 → (at most) n-1 : at most n moves in TOTAL, across the whole run

  The inner "while shrink" loop looks nested, but l never goes back.
  Total work = O(n + n) = O(n).  (amortized)
```

### The expand-right / shrink-left template

```
function slidingWindow(a):
    l ← 0, state ← empty, best ← initial
    for r from 0 to n-1:
        add a[r] to state                    // EXPAND
        while window [l..r] is INVALID:      // SHRINK until valid again
            remove a[l] from state
            l ← l + 1
        best ← update(best, window [l..r])   // window is valid here
    return best
```

```
  Three flavors of "update":

  ┌───────────────┬────────────────────────────────┬─────────────────────────────┐
  │ Goal          │ Shrink while ...               │ Record ...                  │
  ├───────────────┼────────────────────────────────┼─────────────────────────────┤
  │ LONGEST valid │ window is INVALID              │ after the loop: r − l + 1   │
  │ SHORTEST valid│ window is VALID (record first!)│ INSIDE the loop: r − l + 1  │
  │ COUNT valid   │ window is INVALID              │ after the loop: += r − l + 1│
  └───────────────┴────────────────────────────────┴─────────────────────────────┘
```

### The "at most K minus at most K−1" counting trick

```
  Counting subarrays with EXACTLY k of something is hard to do with one window:
  when the window has exactly k, should you shrink or not? Both choices lose answers.

  But "AT MOST k" is easy:
     every time the window [l..r] is valid, ALL of these end at r and are valid too:

        [l..r], [l+1..r], ..., [r..r]    → that's (r − l + 1) subarrays

  Then:
  ┌───────────────────────────────────────────────────────┐
  │   exactly(k)  =  atMost(k)  −  atMost(k − 1)          │
  └───────────────────────────────────────────────────────┘

     atMost(k)    : ████████████████████████  (0, 1, 2, ..., k kinds)
     atMost(k−1)  : ██████████████████        (0, 1, ..., k−1 kinds)
     difference   :                   ██████  (exactly k kinds)
```

### Why windows fail with negative numbers

```
  Sliding window needs MONOTONICITY:
     growing the window  → the sum only goes UP
     shrinking the window → the sum only goes DOWN

  Negatives break it. Shortest subarray with sum ≥ 4:

     nums = [ 3, -2, 4 ]

     r=0: [3]        sum 3
     r=1: [3,-2]     sum 1
     r=2: [3,-2,4]   sum 5 ≥ 4 → length 3, shrink: drop 3 → [-2,4] sum 2 < 4, stop.

     window answer = 3   ✗
     real answer   = 1   ([4] alone has sum 4)

  Dropping the -2 would RAISE the sum again, but the window had already stopped.
  → use PREFIX SUMS instead (+ hash map, or + monotonic deque for LC 862).
```

> 💡 See [03-Prefix-Sum.md](03-Prefix-Sum.md), section "When sliding window FAILS but prefix works".

### Complexity at a glance

```
   ┌──────────────────────────────────┬─────────────┬──────────────────┐
   │ Window kind                      │ Time        │ Space            │
   ├──────────────────────────────────┼─────────────┼──────────────────┤
   │ Fixed, running sum               │ O(n)        │ O(1)             │
   │ Variable, counter / sum          │ O(n)        │ O(1)             │
   │ Variable, hash map of counts     │ O(n)        │ O(distinct)      │
   │ Monotonic deque (window max/min) │ O(n)        │ O(k)             │
   │ Two heaps (window median)        │ O(n log k)  │ O(n) lazy / O(k) │
   │ Brute force (every window)       │ O(n·k)/O(n²)│ O(1)             │
   └──────────────────────────────────┴─────────────┴──────────────────┘
```

---

## 1. Maximum Sum Subarray of Size K (Easy)

### Problem
(GFG.) Given an array `a` and an integer `k` (1 ≤ k ≤ n), return the **maximum sum of any contiguous subarray of length exactly k**.

### Visualize it

```
  k = 3
  index:   0    1    2    3    4    5
  a    :   2    1    5    1    3    2

  windows:  [2 1 5]               = 8
               [1 5 1]            = 7
                  [5 1 3]         = 9  ✅
                     [1 3 2]      = 6
```

### The key decision picture

```
           leaves                  enters
             │                       │
             ▼                       ▼
   ...  [ a[r-k] | a[r-k+1] ... a[r-1] ]  a[r]  ...
              old window

   newSum = oldSum − a[r−k] + a[r]        ← O(1), not O(k)

   No real decision: the window ALWAYS slides by one.
   The only choice is "is this window's sum the best so far?"
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Fixed, size `k` |
| State kept | `sum` of the current window |
| Expand | `sum += a[r]` |
| Shrink | once `r ≥ k`: `sum -= a[r−k]` (exactly one element leaves) |
| Answer | `best = max(best, sum)` whenever `r ≥ k−1` |

### Trace (a = [2, 1, 5, 1, 3, 2], k = 3)

```
  r │ a[r] │ leaves a[r−k] │ sum │ full? │ best
  ──┼──────┼───────────────┼─────┼───────┼──────
  0 │  2   │       —       │  2  │  no   │  —
  1 │  1   │       —       │  3  │  no   │  —
  2 │  5   │       —       │  8  │  yes  │  8     [2,1,5]
  3 │  1   │    a[0] = 2   │  7  │  yes  │  8     [1,5,1]
  4 │  3   │    a[1] = 1   │  9  │  yes  │  9     [5,1,3]
  5 │  2   │    a[2] = 5   │  6  │  yes  │  9     [1,3,2]

  answer = 9 ✅
```

### Trace (a = [-1, -2, -3], k = 2): don't start best at 0

```
  r │ a[r] │ leaves │ sum │ best
  ──┼──────┼────────┼─────┼──────
  0 │ -1   │   —    │ -1  │  —
  1 │ -2   │   —    │ -3  │ -3     [-1,-2]
  2 │ -3   │  -1    │ -5  │ -3     [-2,-3]

  answer = -3 ✅      (best = 0 at the start would wrongly return 0)
```

### Pseudocode

```
function maxSumOfSizeK(a, k):
    sum ← 0, best ← −∞
    for r from 0 to n-1:
        sum ← sum + a[r]                 // enter on the right
        if r ≥ k:
            sum ← sum − a[r − k]         // leave on the left
        if r ≥ k − 1:                    // window is full
            best ← max(best, sum)
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every window, re-sum k elements | O(n·k) | O(1) |
| Prefix sums: `P[r+1] − P[r+1−k]` | O(n) | O(n) |
| **Running window sum** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Add the new element, subtract the one that is **k steps behind**.
- Only record once the window is **full** (`r ≥ k − 1`).
- Start `best` at −∞ (or the first window's sum), never 0.
- Negatives are fine here: the window size is fixed, so there's no grow/shrink decision to get wrong.

---

## 2. Maximum Average Subarray I (Easy)

### Problem
Given `nums` and `k`, find the contiguous subarray of length `k` with the **maximum average**, and return that average.

### Visualize it

```
  k = 4
  index:   0    1    2    3    4    5
  nums :   1   12   -5   -6   50    3

  [1 12 -5 -6]          sum = 2    avg = 0.5
     [12 -5 -6 50]      sum = 51   avg = 12.75  ✅
        [-5 -6 50 3]    sum = 42   avg = 10.5
```

### The key decision picture

```
   average = sum / k,  and k is the SAME for every window

        max average  ⟺  max sum

   So: run problem 1 exactly, divide ONCE at the very end.

     ┌──────────────┐        ┌──────────┐
     │ max window   │ ─────► │  ÷ k     │ ─────► answer
     │ sum (ints)   │        │ (once)   │
     └──────────────┘        └──────────┘
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Fixed, size `k` |
| State kept | `sum` of the window (integer) |
| Expand / shrink | `+ nums[r]`, `− nums[r−k]` |
| Record | `bestSum = max(bestSum, sum)` when the window is full |
| Answer | `bestSum / k` (as a decimal) |

### Trace (nums = [1, 12, -5, -6, 50, 3], k = 4)

```
  r │ nums[r] │ leaves │ sum │ full? │ bestSum
  ──┼─────────┼────────┼─────┼───────┼─────────
  0 │    1    │   —    │  1  │  no   │   —
  1 │   12    │   —    │ 13  │  no   │   —
  2 │   -5    │   —    │  8  │  no   │   —
  3 │   -6    │   —    │  2  │  yes  │   2      [1,12,-5,-6]
  4 │   50    │   1    │ 51  │  yes  │  51      [12,-5,-6,50]
  5 │    3    │  12    │ 42  │  yes  │  51      [-5,-6,50,3]

  answer = 51 / 4 = 12.75 ✅
```

### Pseudocode

```
function findMaxAverage(nums, k):
    sum ← 0
    for i from 0 to k-1:                 // build the first window
        sum ← sum + nums[i]
    bestSum ← sum
    for r from k to n-1:                 // slide
        sum ← sum + nums[r] − nums[r − k]
        bestSum ← max(bestSum, sum)
    return bestSum / k                   // decimal division, once
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every window, compute its average | O(n·k) | O(1) |
| **Running sum, divide at the end** | **O(n)** | **O(1)** ✅ |

> **Follow-up (Maximum Average Subarray II, length ≥ k):** the window is no longer fixed.
> Binary search on the answer `avg`, subtract `avg` from every element, and ask
> "is there a subarray of length ≥ k with sum ≥ 0?" using prefix sums.
> See [../binary search/03-Binary-Search-on-Answers.md](../binary%20search/03-Binary-Search-on-Answers.md).

### 📌 Points to remember
- Same length for every window → compare **sums**, not averages.
- Divide **once**, at the end, using decimal division (not integer division).
- Build the first window separately, then slide. Two clean loops, no `if r ≥ k` checks.

---

## 3. Find K Closest Elements (Medium)

### Problem
Given a **sorted** array `arr`, an integer `k`, and a target `x`, return the `k` elements closest to `x`, in ascending order.
"Closer" means smaller `|a − x|`; on a tie, the **smaller** value wins.

### Visualize it

```
  arr = [1, 3, 5, 7, 9, 11, 13],  k = 3,  x = 8

  value   :   1    3    5    7    9   11   13
  |v − x| :   7    5    3    1    1    3    5
                       └─────────────┘
                        [5, 7, 9]  ✅     (5 beats 11 on the tie 3 vs 3)

  KEY FACT: the answer is always a CONTIGUOUS block of length k
            (the array is sorted, so "closest" values sit next to each other).
            → it's a FIXED window of size k. We only need its LEFT EDGE.
```

### The key decision picture (binary search on the left edge)

```
  Candidate left edges: 0 .. n−k        (window = arr[mid .. mid+k−1])

  Compare the element just INSIDE on the left with the one just OUTSIDE on the right:

        arr[mid]  [ ...... window ...... ]  arr[mid+k]
           ▲                                    ▲
        x − arr[mid]                    arr[mid+k] − x

   if  x − arr[mid]  >  arr[mid+k] − x :
        the left end is FARTHER than the next one on the right
        → slide right: the answer starts AFTER mid          lo ← mid + 1
   else:
        arr[mid] is at least as good (ties go left)
        → the answer starts at mid or BEFORE                 hi ← mid

  ⚠ Use the SIGNED differences, not |...|. (See the duplicates trap below.)
```

### The 5 steps (binary search version)

| Step | Answer |
|------|--------|
| Window type | Fixed, size `k`, slides over left edges `0 .. n−k` |
| Search space | `lo = 0`, `hi = n − k` |
| Test | `x − arr[mid] > arr[mid+k] − x` ? |
| Move | true → `lo = mid + 1`; false → `hi = mid` |
| Answer | `arr[lo .. lo+k−1]` |

### Trace A: binary search on the left edge (arr = [1,3,5,7,9,11,13], k = 3, x = 8)

```
  lo │ hi │ mid │ arr[mid] │ arr[mid+k] │ x − arr[mid] │ arr[mid+k] − x │ move
  ───┼────┼─────┼──────────┼────────────┼──────────────┼────────────────┼────────────
   0 │  4 │  2  │    5     │    11      │      3       │       3        │ 3>3? no → hi = 2
   0 │  2 │  1  │    3     │     9      │      5       │       1        │ 5>1 yes → lo = 2
   2 │  2 │  —  │          │            │              │                │ stop

  left edge = 2  →  arr[2..4] = [5, 7, 9] ✅
```

### Trace B: two-pointer shrink (same input)

```
  Start with the WHOLE array as the window, then throw away the worse end
  until only k remain.

  l │ r │ arr[l] │ arr[r] │ |arr[l]−x| │ |arr[r]−x| │ drop           │ size after
  ──┼───┼────────┼────────┼────────────┼────────────┼────────────────┼───────────
  0 │ 6 │   1    │  13    │     7      │     5      │ left  (7 > 5)  │ 6
  1 │ 6 │   3    │  13    │     5      │     5      │ right (tie)    │ 5
  1 │ 5 │   3    │  11    │     5      │     3      │ left  (5 > 3)  │ 4
  2 │ 5 │   5    │  11    │     3      │     3      │ right (tie)    │ 3  stop

  window = arr[2..4] = [5, 7, 9] ✅
  (tie → drop the RIGHT one, because the smaller value wins ties)
```

### The duplicates trap (why signed, not absolute)

```
  arr = [1, 1, 2, 2, 2, 2, 2, 3, 3],  k = 3,  x = 3      (n = 9, hi = 6)
  correct answer: [2, 3, 3]   (distances 1, 0, 0)

  SIGNED test  (x − arr[mid] > arr[mid+k] − x):
    mid=3: 3−2 = 1  vs  arr[6]−3 = −1   → 1 > −1  → lo = 4
    mid=5: 3−2 = 1  vs  arr[8]−3 =  0   → 1 >  0  → lo = 6
    left = 6 → [2, 3, 3] ✅

  ABSOLUTE test (|x − arr[mid]| > |arr[mid+k] − x|):
    mid=3: |1| vs |−1| → 1 > 1? no → hi = 3
    mid=1: |2| vs |−1| → 2 > 1     → lo = 2
    mid=2: |1| vs |−1| → no        → hi = 2
    left = 2 → [2, 2, 2] ✗   (abs hides WHICH SIDE of x arr[mid+k] is on)
```

### Pseudocode

```
// Version 1: binary search on the left edge   O(log(n−k) + k)
function findClosestElements(arr, k, x):
    lo ← 0, hi ← n − k
    while lo < hi:
        mid ← (lo + hi) / 2
        if x − arr[mid] > arr[mid + k] − x:
            lo ← mid + 1
        else:
            hi ← mid
    return arr[lo .. lo + k − 1]

// Version 2: two-pointer shrink   O(n − k)
function findClosestElementsShrink(arr, k, x):
    l ← 0, r ← n − 1
    while r − l + 1 > k:
        if |arr[l] − x| > |arr[r] − x|:
            l ← l + 1                    // left end is strictly worse
        else:
            r ← r − 1                    // right is worse OR tie (smaller wins)
    return arr[l .. r]
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Sort all by (distance, value), take k, sort again | O(n log n) | O(n) |
| Max-heap of size k keyed by distance | O(n log k) | O(k) |
| Two-pointer shrink from both ends | O(n − k) | O(1) |
| Lower bound for x, then expand outward k times | O(log n + k) | O(1) |
| **Binary search on the left edge** | **O(log(n−k) + k)** | **O(1)** ✅ |

> 💡 The heap version is the general "top k by some key" idea: [../heap/02-Top-K-Elements.md](../heap/02-Top-K-Elements.md).
> The "find where x would go, then expand" version uses [../binary search/02-Lower-Upper-Bound.md](../binary%20search/02-Lower-Upper-Bound.md).

### 📌 Points to remember
- Sorted input → the answer is a **contiguous window of size k**. Search for its **left edge**.
- Search space is `0 .. n−k` (not `0 .. n−1`), so `arr[mid + k]` is always in bounds.
- Compare `x − arr[mid]` with `arr[mid+k] − x` **without** absolute values.
- Ties go to the **smaller** value: in the shrink version, drop the right end on a tie.

---

## 4. Max Consecutive Ones (Easy)

### Problem
Given a binary array `nums`, return the maximum number of consecutive `1`s.

### Visualize it

```
  index:  0   1   2   3   4   5
  nums : [1 , 1 , 0 , 1 , 1 , 1]
          └─────┘     └─────────┘
           len 2       len 3  ✅
```

### The key decision picture

```
  The window = "the current run of 1s". The rule: NO zeros allowed inside.

      see a 1  →  EXPAND   (window grows by one)
      see a 0  →  the window is broken; ANY window containing this 0 is invalid
                  → jump l to r + 1  (empty window, start fresh after the 0)

      [ 1  1 ] 0 [ 1  1  1 ]
        run 1  ▲   run 2
               └─ wall: windows never cross a 0
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Variable, longest valid |
| State kept | `l` (or just a running `count`) |
| Expand | every step |
| Shrink | on a `0`: `l = r + 1` (count = 0) |
| Answer | `best = max(best, r − l + 1)` |

### Trace (nums = [1, 1, 0, 1, 1, 1])

```
  r │ nums[r] │ action        │ l │ count = r−l+1 │ best
  ──┼─────────┼───────────────┼───┼───────────────┼──────
  0 │    1    │ expand        │ 0 │       1       │  1
  1 │    1    │ expand        │ 0 │       2       │  2
  2 │    0    │ reset l = 3   │ 3 │       0       │  2
  3 │    1    │ expand        │ 3 │       1       │  2
  4 │    1    │ expand        │ 3 │       2       │  2
  5 │    1    │ expand        │ 3 │       3       │  3

  answer = 3 ✅
```

### Pseudocode

```
function findMaxConsecutiveOnes(nums):
    count ← 0, best ← 0
    for each x in nums:
        if x = 1:
            count ← count + 1            // expand
            best  ← max(best, count)
        else:
            count ← 0                    // the 0 is a wall: restart after it
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| From every start, walk while 1s | O(n²) | O(1) |
| **One pass, running count** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- It's the simplest variable window: the "shrink" is a full reset because the rule is "zero 0s".
- Update `best` **inside** the 1-branch (or after every step), not only when you hit a 0, or a run at the end is missed.
- Relax "zero 0s" to "at most k 0s" and you get the next problem.

---

## 5. Max Consecutive Ones III (Medium)

### Problem
Given a binary array `nums` and an integer `k`, return the maximum number of consecutive `1`s if you can flip **at most `k`** zeros.

### Visualize it

```
  nums = [1,1,1,0,0,0,1,1,1,1,0],  k = 2

  index:  0  1  2  3  4  5  6  7  8  9  10
  nums :  1  1  1  0  0  0  1  1  1  1  0
                       └──────────────┘
                        flip 4 and 5 → six 1s  ✅

  Rephrase: "longest window that contains AT MOST k zeros".
  (You never actually flip anything.)
```

### The key decision picture

```
                 add nums[r]
                      │
           ┌──────────┴──────────┐
     zeros ≤ k ?               zeros > k ?
     window is VALID           window is INVALID
           │                         │
     record r − l + 1          SHRINK: move l right,
                               (if nums[l] was 0, zeros − 1)
                               until zeros ≤ k again
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Variable, longest valid |
| State kept | `zeros` = number of 0s inside `[l..r]` |
| Expand | if `nums[r] = 0`: `zeros += 1` |
| Shrink | while `zeros > k`: if `nums[l] = 0`, `zeros −= 1`; `l += 1` |
| Answer | `best = max(best, r − l + 1)` after shrinking |

### Trace (nums = [1,1,1,0,0,0,1,1,1,1,0], k = 2)

```
   r │ nums[r] │ zeros after add │ shrink                          │ l │ len │ best
  ───┼─────────┼─────────────────┼─────────────────────────────────┼───┼─────┼──────
   0 │    1    │       0         │                                 │ 0 │  1  │  1
   1 │    1    │       0         │                                 │ 0 │  2  │  2
   2 │    1    │       0         │                                 │ 0 │  3  │  3
   3 │    0    │       1         │                                 │ 0 │  4  │  4
   4 │    0    │       2         │                                 │ 0 │  5  │  5
   5 │    0    │       3         │ drop 1,1,1 (l→3), drop 0 (z=2)  │ 4 │  2  │  5
   6 │    1    │       2         │                                 │ 4 │  3  │  5
   7 │    1    │       2         │                                 │ 4 │  4  │  5
   8 │    1    │       2         │                                 │ 4 │  5  │  5
   9 │    1    │       2         │                                 │ 4 │  6  │  6
  10 │    0    │       3         │ drop 0 at l=4 (z=2)             │ 5 │  6  │  6

  answer = 6 ✅    (window 4..9 = [0,0,1,1,1,1], flip both 0s)
```

### The "never-shrinking window" variant

```
  Replace "while zeros > k" with "if zeros > k" (move l by ONE step at most).

  The window never gets SMALLER, it only slides when invalid.
  Its size at the end = the best size ever reached.
  → answer = n − l   (no "best" variable needed)

  Same O(n), slightly shorter code. Nice trick, but the "while" version
  is easier to reason about, so learn that one first.
```

### Pseudocode

```
function longestOnes(nums, k):
    l ← 0, zeros ← 0, best ← 0
    for r from 0 to n-1:
        if nums[r] = 0: zeros ← zeros + 1          // expand
        while zeros > k:                            // shrink until valid
            if nums[l] = 0: zeros ← zeros − 1
            l ← l + 1
        best ← max(best, r − l + 1)
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every (l, r), count zeros | O(n³) / O(n²) with running count | O(1) |
| Prefix count of zeros + binary search the farthest r for each l | O(n log n) | O(n) |
| **Sliding window, count zeros** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Translate "flip at most k" into "**at most k zeros in the window**".
- Shrink with **while**, then record. The window is always valid when you record.
- Only decrement `zeros` when the element **leaving** (`nums[l]`) is a 0.
- k = 0 gives back problem 4.

---

## 6. Fruit Into Baskets (Medium)

### Problem
Trees in a row, `fruits[i]` is the fruit type of tree `i`. You have **2 baskets**, each holds **one type** (unlimited amount). Start at any tree, pick one fruit from every tree moving right, and stop when a fruit fits no basket. Return the maximum number of fruits you can pick.

### Visualize it

```
  Rephrase: "longest window with AT MOST 2 DISTINCT values".

  fruits = [3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]

  index:  0  1  2  3  4  5  6  7  8  9  10
  fruit:  3  3  3  1  2  1  1  2  3  3  4
                   └────────────┘
                    {1, 2}, length 5  ✅
```

### The key decision picture

```
   count map  =  { fruit type → how many inside the window }

             add fruits[r] to the map
                       │
          ┌────────────┴────────────┐
    map has ≤ 2 keys         map has 3 keys
       VALID                    INVALID
          │                         │
   record r − l + 1          SHRINK: count[fruits[l]] − 1,
                             delete the key when it hits 0,
                             l + 1 … until only 2 keys remain

   ⚠ "Distinct count" = number of KEYS, so a count of 0 MUST be deleted.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Variable, longest valid |
| State kept | `count` map (type → frequency) |
| Expand | `count[fruits[r]] += 1` |
| Shrink | while `size(count) > 2`: decrement `count[fruits[l]]`, delete at 0, `l += 1` |
| Answer | `best = max(best, r − l + 1)` |

### Trace (fruits = [3,3,3,1,2,1,1,2,3,3,4])

```
   r │ fruit │ map after add      │ shrink (removed → l)           │ map after shrink │ l │ len │ best
  ───┼───────┼────────────────────┼────────────────────────────────┼──────────────────┼───┼─────┼──────
   0 │   3   │ {3:1}              │                                │ {3:1}            │ 0 │  1  │  1
   1 │   3   │ {3:2}              │                                │ {3:2}            │ 0 │  2  │  2
   2 │   3   │ {3:3}              │                                │ {3:3}            │ 0 │  3  │  3
   3 │   1   │ {3:3, 1:1}         │                                │ {3:3, 1:1}       │ 0 │  4  │  4
   4 │   2   │ {3:3, 1:1, 2:1}    │ 3,3,3 → l=3 (key 3 deleted)    │ {1:1, 2:1}       │ 3 │  2  │  4
   5 │   1   │ {1:2, 2:1}         │                                │ {1:2, 2:1}       │ 3 │  3  │  4
   6 │   1   │ {1:3, 2:1}         │                                │ {1:3, 2:1}       │ 3 │  4  │  4
   7 │   2   │ {1:3, 2:2}         │                                │ {1:3, 2:2}       │ 3 │  5  │  5
   8 │   3   │ {1:3, 2:2, 3:1}    │ 1,2,1,1 → l=7 (key 1 deleted)  │ {2:1, 3:1}       │ 7 │  2  │  5
   9 │   3   │ {2:1, 3:2}         │                                │ {2:1, 3:2}       │ 7 │  3  │  5
  10 │   4   │ {2:1, 3:2, 4:1}    │ 2 → l=8 (key 2 deleted)        │ {3:2, 4:1}       │ 8 │  3  │  5

  answer = 5 ✅    (window 3..7 = [1, 2, 1, 1, 2])
```

### Trace (fruits = [1, 2, 3, 2, 2]): short one

```
  r │ fruit │ map after shrink │ l │ len │ best
  ──┼───────┼──────────────────┼───┼─────┼──────
  0 │   1   │ {1:1}            │ 0 │  1  │  1
  1 │   2   │ {1:1, 2:1}       │ 0 │  2  │  2
  2 │   3   │ {2:1, 3:1}       │ 1 │  2  │  2     (dropped the 1)
  3 │   2   │ {2:2, 3:1}       │ 1 │  3  │  3
  4 │   2   │ {2:3, 3:1}       │ 1 │  4  │  4

  answer = 4 ✅    ([2, 3, 2, 2])
```

### Pseudocode

```
function totalFruit(fruits):
    count ← empty map, l ← 0, best ← 0
    for r from 0 to n-1:
        count[fruits[r]] ← count[fruits[r]] + 1          // expand
        while size(count) > 2:                            // too many types
            count[fruits[l]] ← count[fruits[l]] − 1
            if count[fruits[l]] = 0: delete count[fruits[l]]
            l ← l + 1
        best ← max(best, r − l + 1)
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| From every start, walk until a 3rd type | O(n²) | O(1) |
| **Sliding window + count map** | **O(n)** | **O(1)** (≤ 3 keys) ✅ |
| Window with "last type, last run length" (no map) | O(n) | O(1) |

> 💡 Same shape as "Longest Substring with At Most K Distinct Characters" in
> [../strings/02-Sliding-Window-String.md](../strings/02-Sliding-Window-String.md). Here K = 2.

### 📌 Points to remember
- The story hides the real question: **longest subarray with ≤ 2 distinct values**.
- Delete a key when its count hits **0**, otherwise `size(count)` lies.
- The map never holds more than 3 keys, so the space is O(1).
- Swap 2 for K and the same code solves "at most K distinct".

---

## 7. Minimum Size Subarray Sum (Medium)

### Problem
Given an array of **positive** integers `nums` and a positive `target`, return the **minimal length** of a contiguous subarray whose sum is **≥ target**. Return 0 if there is none.

### Visualize it

```
  target = 7
  index:   0    1    2    3    4    5
  nums :   2    3    1    2    4    3
                               └─────┘
                               4 + 3 = 7, length 2  ✅
```

### The key decision picture

```
   This is the SHORTEST-window flavor. The roles flip:

     LONGEST:  shrink while INVALID, record AFTER the loop
     SHORTEST: shrink while VALID,   record INSIDE the loop (before each shrink)

                  add nums[r]
                       │
                sum ≥ target ?
               ┌───────┴────────┐
              yes               no
               │                 │
     record r − l + 1        keep expanding
     drop nums[l], l + 1
     ask again (maybe still ≥ target → even shorter!)

   Positives only → dropping from the left ALWAYS lowers the sum.
   That one-way movement is what makes the window correct.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Variable, shortest valid |
| State kept | `sum` of `[l..r]` |
| Expand | `sum += nums[r]` |
| Shrink | while `sum ≥ target`: record, `sum −= nums[l]`, `l += 1` |
| Answer | `best` (or 0 if it was never set) |

### Trace (nums = [2, 3, 1, 2, 4, 3], target = 7)

```
  r │ nums[r] │ sum after add │ inside the while (record, then drop)               │ l after │ best
  ──┼─────────┼───────────────┼────────────────────────────────────────────────────┼─────────┼──────
  0 │    2    │       2       │ 2 < 7, skip                                        │    0    │  ∞
  1 │    3    │       5       │ skip                                               │    0    │  ∞
  2 │    1    │       6       │ skip                                               │    0    │  ∞
  3 │    2    │       8       │ len 4 (0..3) → best 4; drop 2 → sum 6, stop        │    1    │  4
  4 │    4    │      10       │ len 4 (1..4); drop 3 → 7; len 3 (2..4) → best 3;   │    3    │  3
    │         │               │ drop 1 → 6, stop                                   │         │
  5 │    3    │       9       │ len 3 (3..5); drop 2 → 7; len 2 (4..5) → best 2;   │    5    │  2
    │         │               │ drop 4 → 3, stop                                   │         │

  answer = 2 ✅    ([4, 3])
```

### Trace (nums = [1, 1, 1, 1], target = 5): no answer

```
  sums: 1, 2, 3, 4  → never ≥ 5 → best stays ∞ → return 0 ✅
```

### Pseudocode

```
function minSubArrayLen(target, nums):
    l ← 0, sum ← 0, best ← ∞
    for r from 0 to n-1:
        sum ← sum + nums[r]                     // expand
        while sum ≥ target:                     // valid → try to shrink
            best ← min(best, r − l + 1)         // record FIRST
            sum ← sum − nums[l]
            l ← l + 1
    return 0 if best = ∞ else best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every (l, r) with a running sum | O(n²) | O(1) |
| Prefix sums + binary search (for each l, lower bound of `P[l] + target`) | O(n log n) | O(n) |
| **Sliding window** | **O(n)** | **O(1)** ✅ |

> 💡 The O(n log n) follow-up is a lower-bound search on the (increasing) prefix array:
> [03-Prefix-Sum.md](03-Prefix-Sum.md) + [../binary search/02-Lower-Upper-Bound.md](../binary%20search/02-Lower-Upper-Bound.md).
> With **negative** numbers (LC 862) neither works; you need prefix sums + a monotonic deque.

### 📌 Points to remember
- Shortest window: **shrink while valid**, and **record before** each shrink.
- Return 0 when nothing ever reached the target (don't return ∞).
- Correct only because all numbers are **positive** (see section 0).

---

## 8. Subarray Product Less Than K (Medium)

### Problem
Given an array of **positive** integers `nums` and an integer `k`, return the **number** of contiguous subarrays whose product is **strictly less than k**.

### Visualize it

```
  nums = [10, 5, 2, 6],  k = 100

  [10]  [5]  [2]  [6]                 4 singles
  [10,5]=50  [5,2]=10  [2,6]=12       3 pairs
  [5,2,6]=60                          1 triple     ([10,5,2] = 100 ✗, not < 100)
                                      ─────
                                      8 ✅
```

### The key decision picture (the counting trick)

```
  Once [l..r] is valid (product < k), every subarray that ENDS at r
  and starts inside the window is ALSO valid (fewer positives → smaller product):

           l               r
           ▼               ▼
     [ ... 5 ─── 2 ─── 6 ]
                       [6]           ← starts at r
                 [2 ── 6]            ← starts at r−1
           [5 ── 2 ── 6]             ← starts at l

     new subarrays ending at r  =  r − l + 1

  Each subarray is counted exactly ONCE: at its own right end.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Variable, counting |
| State kept | `prod` of `[l..r]` |
| Expand | `prod *= nums[r]` |
| Shrink | while `prod ≥ k`: `prod /= nums[l]`, `l += 1` |
| Answer | `count += r − l + 1` after shrinking |

### Trace (nums = [10, 5, 2, 6], k = 100)

```
  r │ nums[r] │ prod after × │ shrink                     │ l │ r−l+1 │ count │ new subarrays
  ──┼─────────┼──────────────┼────────────────────────────┼───┼───────┼───────┼────────────────────────
  0 │   10    │      10      │                            │ 0 │   1   │   1   │ [10]
  1 │    5    │      50      │                            │ 0 │   2   │   3   │ [5], [10,5]
  2 │    2    │     100      │ 100 ≥ 100 → ÷10 → 10, l=1  │ 1 │   2   │   5   │ [2], [5,2]
  3 │    6    │      60      │                            │ 1 │   3   │   8   │ [6], [2,6], [5,2,6]

  answer = 8 ✅
```

### Edge case: k ≤ 1

```
  All numbers are ≥ 1, so every product is ≥ 1, and nothing can be < 1.
  → return 0 right away.

  Without this check: prod ≥ k is true even for the EMPTY window (prod = 1),
  so l would run past r. (A "while l ≤ r" guard also fixes it.)
```

### Pseudocode

```
function numSubarrayProductLessThanK(nums, k):
    if k ≤ 1: return 0
    prod ← 1, l ← 0, count ← 0
    for r from 0 to n-1:
        prod ← prod × nums[r]                 // expand
        while prod ≥ k:                       // shrink until valid
            prod ← prod / nums[l]
            l ← l + 1
        count ← count + (r − l + 1)           // all valid subarrays ending at r
    return count
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every (l, r) with a running product | O(n²) | O(1) |
| Logs turn × into +, then prefix sums + binary search | O(n log n) | O(n) |
| **Sliding window + count r − l + 1** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **`count += r − l + 1`** is THE counting trick. You'll reuse it in problem 9.
- Strictly less than k: shrink while `prod ≥ k`.
- Guard **k ≤ 1** → 0.
- Product of positives only grows when you add, only shrinks when you remove: monotonic, so the window works.

---

## 9. Subarrays with K Different Integers (Hard)

### Problem
Given `nums` and `k`, return the number of contiguous subarrays that contain **exactly `k`** different integers.

### Visualize it

```
  nums = [1, 2, 1, 2, 3],  k = 2

  [1,2]  [2,1]  [1,2]  [2,3]           length 2
  [1,2,1]  [2,1,2]                     length 3
  [1,2,1,2]                            length 4
                                       ─────
                                       7 ✅
```

### Why one window can't count "exactly k"

```
  Window [l..r] has exactly k kinds. Should you shrink?

     nums = [1, 2, 1, 2],  k = 2,  at r = 3, l = 0:

       [1,2,1,2]  2 kinds ✓
         [2,1,2]  2 kinds ✓
           [1,2]  2 kinds ✓
             [2]  1 kind  ✗

     The valid starts form a RANGE in the middle of the window, not "l to r".
     A single l can't describe it.

  ┌──────────────────────────────────────────────────────────┐
  │  exactly(k) = atMost(k) − atMost(k − 1)                  │
  │  and atMost(k) is just problem 6 + problem 8's counting  │
  └──────────────────────────────────────────────────────────┘
```

### The key decision picture

```
         atMost(k):  longest window with ≤ k kinds, and at each r
                     count += r − l + 1

     run it twice:

        atMost(2)  ─┐
                    ├─►  subtract  ─►  answer
        atMost(1)  ─┘
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Variable, counting, run **twice** |
| State kept | `count` map (value → frequency) |
| Expand | `count[nums[r]] += 1` |
| Shrink | while `size(count) > k`: decrement `count[nums[l]]`, delete at 0, `l += 1` |
| Answer | `atMost(k) − atMost(k−1)`, where `atMost` sums `r − l + 1` |

### Trace (nums = [1, 2, 1, 2, 3], k = 2)

```
  atMost(2):

  r │ x │ map after shrink │ shrink                     │ l │ r−l+1 │ total
  ──┼───┼──────────────────┼────────────────────────────┼───┼───────┼───────
  0 │ 1 │ {1:1}            │                            │ 0 │   1   │   1
  1 │ 2 │ {1:1, 2:1}       │                            │ 0 │   2   │   3
  2 │ 1 │ {1:2, 2:1}       │                            │ 0 │   3   │   6
  3 │ 2 │ {1:2, 2:2}       │                            │ 0 │   4   │  10
  4 │ 3 │ {2:1, 3:1}       │ drop 1,2,1 → l=3 (1 gone)  │ 3 │   2   │  12

  atMost(1):

  r │ x │ map after shrink │ shrink                     │ l │ r−l+1 │ total
  ──┼───┼──────────────────┼────────────────────────────┼───┼───────┼───────
  0 │ 1 │ {1:1}            │                            │ 0 │   1   │   1
  1 │ 2 │ {2:1}            │ drop 1 → l=1               │ 1 │   1   │   2
  2 │ 1 │ {1:1}            │ drop 2 → l=2               │ 2 │   1   │   3
  3 │ 2 │ {2:1}            │ drop 1 → l=3               │ 3 │   1   │   4
  4 │ 3 │ {3:1}            │ drop 2 → l=4               │ 4 │   1   │   5

  answer = 12 − 5 = 7 ✅

  Sanity: 15 subarrays in total; only [1,2,1,2,3], [2,1,2,3], [1,2,3] have 3 kinds
          → atMost(2) = 15 − 3 = 12 ✓.  No two neighbors are equal → atMost(1) = 5 singles ✓.
```

### Pseudocode

```
function subarraysWithKDistinct(nums, k):
    return atMost(nums, k) − atMost(nums, k − 1)

function atMost(nums, k):
    count ← empty map, l ← 0, total ← 0
    for r from 0 to n-1:
        count[nums[r]] ← count[nums[r]] + 1               // expand
        while size(count) > k:                             // too many kinds
            count[nums[l]] ← count[nums[l]] − 1
            if count[nums[l]] = 0: delete count[nums[l]]
            l ← l + 1
        total ← total + (r − l + 1)                        // every start in [l..r]
    return total
```

### Alternative: one pass with two left pointers

```
  Keep lFar  = smallest start with ≤ k kinds    (window [lFar..r] has ≤ k)
       lNear = smallest start with ≤ k−1 kinds  (window [lNear..r] has ≤ k−1)

  starts in [lFar .. lNear−1] give EXACTLY k kinds → add (lNear − lFar) at each r.

  Same O(n), one loop, two maps. The atMost − atMost form is easier to get right.
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Every (l, r), set of values | O(n²) | O(n) |
| **atMost(k) − atMost(k−1)** | **O(n)** | **O(k)** ✅ |
| One pass, two left pointers | O(n) | O(k) |

### 📌 Points to remember
- **Exactly k = atMost(k) − atMost(k−1).** Memorize this line.
- `atMost` is "longest window" (shrink while > k) + "count" (`+= r − l + 1`).
- Same trick works for "Count Number of Nice Subarrays" (exactly k odd numbers) and "Binary Subarrays With Sum" (exactly goal ones).
- Delete zero-count keys, or `size(count)` is wrong.

---

## 10. Sliding Window Maximum (Hard)

### Problem
Given `nums` and a window size `k`, the window slides from the far left to the far right one step at a time. Return the **maximum of each window**.

### Visualize it

```
  nums = [1, 3, -1, -3, 5, 3, 6, 7],  k = 3

  window              max
  [1  3  -1] -3  5  3  6  7     3
   1 [3  -1  -3] 5  3  6  7     3
   1  3 [-1  -3  5] 3  6  7     5
   1  3  -1 [-3  5  3] 6  7     5
   1  3  -1  -3 [5  3  6] 7     6
   1  3  -1  -3  5 [3  6  7]    7

  answer = [3, 3, 5, 5, 6, 7]
```

### The key decision picture (monotonic deque)

```
  A running SUM can "un-add" the element that leaves. A running MAX can't:
  if the max leaves, what's the next max? You'd have to rescan.

  Idea: keep a DEQUE of INDICES whose values are STRICTLY DECREASING front → back.
        front = index of the current window max.

  When a new value x arrives at the back:

     deque (values):   [ 9 , 7 , 4 , 2 ]   ← x = 5
                                  ▲   ▲
                          4 < 5, 2 < 5: they are OLDER and SMALLER than 5,
                          so they can NEVER be a window max again → pop them.

     deque (values):   [ 9 , 7 , 5 ]

  When the front index falls out of the window (index ≤ i − k) → pop the front.

     ┌─────── front: expired? pop ──────┐       ┌── back: smaller than x? pop ──┐
     ▼                                  │       ▼                               │
   [ i0 ,  i1 ,  i2 ,  ... ]  ◄──────── push i at the back ─────────────────────┘
     ▲
   window max = nums[front]
```

> 💡 The "pop everything smaller from the back" move is exactly the monotonic stack:
> [../stack/01-Monotonic-Stack.md](../stack/01-Monotonic-Stack.md). A deque just also lets you expire from the front.

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Fixed, size `k` |
| State kept | deque of indices, values strictly decreasing |
| Expire | if `front ≤ i − k`: pop front |
| Push | pop back while `nums[back] ≤ nums[i]`, then push `i` |
| Answer | once `i ≥ k − 1`: output `nums[front]` |

### Trace (nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3)

```
  i │ nums[i] │ expire front (≤ i−k) │ pop back (≤ nums[i]) │ deque idx → values     │ output
  ──┼─────────┼──────────────────────┼──────────────────────┼────────────────────────┼────────
  0 │    1    │          —           │          —           │ [0]     → [1]          │   —
  1 │    3    │          —           │ 0 (1)                │ [1]     → [3]          │   —
  2 │   -1    │          —           │          —           │ [1,2]   → [3,-1]       │   3
  3 │   -3    │  front 1 > 0, keep   │          —           │ [1,2,3] → [3,-1,-3]    │   3
  4 │    5    │  front 1 ≤ 1, pop    │ 3 (-3), 2 (-1)       │ [4]     → [5]          │   5
  5 │    3    │  front 4 > 2, keep   │          —           │ [4,5]   → [5,3]        │   5
  6 │    6    │  front 4 > 3, keep   │ 5 (3), 4 (5)         │ [6]     → [6]          │   6
  7 │    7    │  front 6 > 4, keep   │ 6 (6)                │ [7]     → [7]          │   7

  answer = [3, 3, 5, 5, 6, 7] ✅
```

### Pseudocode

```
function maxSlidingWindow(nums, k):
    dq ← empty deque (of indices), out ← empty list
    for i from 0 to n-1:
        if dq not empty and dq.front ≤ i − k:          // expired
            dq.popFront()
        while dq not empty and nums[dq.back] ≤ nums[i]: // useless forever
            dq.popBack()
        dq.pushBack(i)
        if i ≥ k − 1:
            out.append(nums[dq.front])
    return out
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Scan every window for its max | O(n·k) | O(1) |
| Max-heap of (value, index), pop stale tops lazily | O(n log n) | O(n) |
| Block trick: prefix-max and suffix-max per block of k | O(n) | O(n) |
| **Monotonic deque** | **O(n)** | **O(k)** ✅ |

> 💡 The heap version is the same "lazy deletion" idea used in problem 11.

### 📌 Points to remember
- Store **indices**, not values: you need them to know when the front expires.
- Deque values are **decreasing** front → back; the front is the max.
- Each index is pushed once and popped at most once → O(n) total.
- For window **minimum**, flip the comparison (keep values increasing).

---

## 11. Sliding Window Median (Hard)

### Problem
Given `nums` and a window size `k`, return the **median of each window** of size `k`, as the window slides left to right. For even `k`, the median is the average of the two middle values.

### Visualize it

```
  nums = [1, 3, -1, -3, 5, 3, 6, 7],  k = 3

  window          sorted         median
  [1, 3, -1]      [-1, 1, 3]        1
  [3, -1, -3]     [-3, -1, 3]      -1
  [-1, -3, 5]     [-3, -1, 5]      -1
  [-3, 5, 3]      [-3, 3, 5]        3
  [5, 3, 6]       [3, 5, 6]         5
  [3, 6, 7]       [3, 6, 7]         6

  answer = [1, -1, -1, 3, 5, 6]
```

### The key decision picture (two heaps)

```
  Split the window into a SMALL half and a LARGE half:

       lo = MAX-heap (small half)          hi = MIN-heap (large half)
       ┌───────────────────┐               ┌───────────────────┐
       │  -3   -1   [ 1 ]  │               │  [ 3 ]   5    6   │
       └───────────────▲───┘               └────▲──────────────┘
                     lo.top                   hi.top
                   (largest small)          (smallest large)

  INVARIANTS (counting only VALID elements):
     • every value in lo ≤ every value in hi
     • size(lo) = size(hi)  or  size(lo) = size(hi) + 1

  median = lo.top                     if k is odd
         = (lo.top + hi.top) / 2      if k is even

  The hard part: heaps can't delete an element from the MIDDLE.
```

### Lazy deletion: "delete it later, when it reaches the top"

```
  To remove x (the element leaving the window):
     1. delayed[x] += 1                        ← remember it's dead
     2. fix the VALID size of the side x lives on (x ≤ lo.top → lo, else hi)
     3. if x is sitting at the top of its heap → prune now
     4. rebalance

  prune(heap):  while heap.top is in delayed:  delayed[top] −= 1, pop
                (only ever looks at the TOP, so dead elements deeper down wait)

       lo (physical):   [ 5 , 3 , -3 ]      delayed = { -3 : 1 }
       lo (valid)   :   [ 5 , 3 ]           -3 is a ghost, harmless until it surfaces

  ⚠ Track validLo and validHi as counters. heap.size includes ghosts.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window type | Fixed, size `k` |
| State kept | max-heap `lo`, min-heap `hi`, `delayed` map, `validLo`, `validHi` |
| Add x | `x ≤ lo.top` → lo, else → hi; rebalance |
| Remove x | `delayed[x] += 1`; shrink the right valid count; prune that top; rebalance |
| Answer | `lo.top` (odd k) or `(lo.top + hi.top) / 2` (even k) |

### Trace (nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3)

```
  lo / hi below show VALID contents; "ghosts" are dead entries still inside a heap.

  i │ add │ after add + rebalance            │ remove │ after remove + rebalance                    │ median
  ──┼─────┼──────────────────────────────────┼────────┼─────────────────────────────────────────────┼────────
  0 │  1  │ lo{1}        hi{}                │   —    │                                             │   —
  1 │  3  │ lo{1}        hi{3}               │   —    │                                             │   —
  2 │ -1  │ lo{1,-1}     hi{3}               │   —    │                                             │   1
  3 │ -3  │ lo has 3 vs 1 → move 1 to hi     │   1    │ 1 > lo.top(-1) → hi side; it's hi.top →     │  -1
    │     │ lo{-1,-3}    hi{1,3}             │        │ pop now → lo{-1,-3}  hi{3}                  │
  4 │  5  │ lo{-1,-3}    hi{3,5}             │   3    │ hi side, hi.top → pop → lo{-1,-3} hi{5}     │  -1
  5 │  3  │ lo{-1,-3}    hi{3,5}             │  -1    │ lo side, lo.top → pop → lo{-3} hi{3,5};     │   3
    │     │                                  │        │ 1 < 2 → move 3 to lo → lo{3,-3} hi{5}       │
  6 │  6  │ lo{3,-3}     hi{5,6}             │  -3    │ lo side, NOT the top → ghost (delayed{-3:1})│   5
    │     │                                  │        │ valid lo{3} hi{5,6}; 1 < 2 → move 5 to lo   │
    │     │                                  │        │ → lo{5,3} (+ghost -3)  hi{6}                │
  7 │  7  │ lo{5,3}      hi{6,7}             │   5    │ lo side, lo.top → pop → lo{3} hi{6,7};      │   6
    │     │                                  │        │ 1 < 2 → move 6 to lo → lo{6,3} hi{7}        │
    │     │                                  │        │ (ghost -3 still at the bottom of lo)        │

  answer = [1, -1, -1, 3, 5, 6] ✅
```

### Pseudocode

```
function medianSlidingWindow(nums, k):
    lo ← max-heap, hi ← min-heap, delayed ← empty map
    validLo ← 0, validHi ← 0, out ← empty list

    for i from 0 to n-1:
        add(nums[i])
        if i ≥ k:
            remove(nums[i − k])
        if i ≥ k − 1:
            if k is odd: out.append(lo.top)
            else:        out.append(lo.top / 2 + hi.top / 2)   // decimal; avoids overflow
    return out

    add(x):
        if lo is empty or x ≤ lo.top: lo.push(x), validLo ← validLo + 1
        else:                          hi.push(x), validHi ← validHi + 1
        rebalance()

    remove(x):
        delayed[x] ← delayed[x] + 1
        if x ≤ lo.top:
            validLo ← validLo − 1
            if x = lo.top: prune(lo)
        else:
            validHi ← validHi − 1
            if x = hi.top: prune(hi)
        rebalance()

    rebalance():
        if validLo > validHi + 1:              // lo too big
            hi.push(lo.pop()), validLo − 1, validHi + 1
            prune(lo)
        else if validLo < validHi:             // hi too big
            lo.push(hi.pop()), validHi − 1, validLo + 1
            prune(hi)

    prune(heap):
        while heap not empty and delayed[heap.top] > 0:
            delayed[heap.top] ← delayed[heap.top] − 1
            heap.pop()
```

### Alternative: one balanced sorted multiset

```
  Keep the window in a sorted multiset (balanced BST / sorted list)
  with an iterator "mid" pointing at the median position.

     insert x     → O(log k), move mid one step if x landed on its left/right
     erase a[i−k] → O(log k), move mid one step the other way
     median       → *mid  (odd)  or  (*mid + *next(mid)) / 2  (even)

  Same O(n log k), true deletion (no ghosts), but needs a language with
  an ordered multiset. Two heaps + lazy deletion works everywhere.
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Copy and sort every window | O(n · k log k) | O(k) |
| Keep a sorted array; binary-search insert/delete (shifting) | O(n · k) | O(k) |
| **Two heaps + lazy deletion** | **O(n log n)** worst, ~O(n log k) | **O(n)** ✅ |
| Balanced multiset with a middle iterator | O(n log k) | O(k) |

> 💡 Two heaps is the classic "median of a stream" setup. Top-k style heap thinking is in
> [../heap/02-Top-K-Elements.md](../heap/02-Top-K-Elements.md).

### 📌 Points to remember
- **lo = max-heap** of the small half (holds the extra one when k is odd), **hi = min-heap** of the large half.
- Heaps can't erase from the middle → **lazy deletion**: mark in `delayed`, pop only when it reaches a top.
- Keep **valid size counters**; the real heap sizes include ghosts.
- **Prune after every move** that can expose a new top (remove, rebalance).
- Average with `a/2 + b/2` (or wide integers) to avoid overflow when both are huge.

---

## 12. Master Cheat Sheet

### All 11 problems at a glance

```
┌────────────────────────────┬───────────────┬─────────────────────┬───────────────────────┬────────────┬───────┐
│ Problem                    │ Window        │ State kept          │ Shrink when           │ Time       │ Space │
├────────────────────────────┼───────────────┼─────────────────────┼───────────────────────┼────────────┼───────┤
│ Max Sum Subarray of Size K │ fixed k       │ running sum         │ r ≥ k (drop a[r−k])   │ O(n)       │ O(1)  │
│ Maximum Average Subarray I │ fixed k       │ running sum         │ r ≥ k (drop a[r−k])   │ O(n)       │ O(1)  │
│ Find K Closest Elements    │ fixed k       │ left edge lo/hi     │ x−a[m] > a[m+k]−x     │ O(log n+k) │ O(1)  │
│ Max Consecutive Ones       │ longest       │ run count           │ see a 0 → reset       │ O(n)       │ O(1)  │
│ Max Consecutive Ones III   │ longest       │ zeros in window     │ zeros > k             │ O(n)       │ O(1)  │
│ Fruit Into Baskets         │ longest       │ type → count map    │ map has > 2 keys      │ O(n)       │ O(1)  │
│ Minimum Size Subarray Sum  │ shortest      │ running sum         │ sum ≥ target (record) │ O(n)       │ O(1)  │
│ Subarray Product < K       │ count         │ running product     │ prod ≥ k              │ O(n)       │ O(1)  │
│ Subarrays w/ K Different   │ count ×2      │ value → count map   │ map has > k keys      │ O(n)       │ O(k)  │
│ Sliding Window Maximum     │ fixed + deque │ decreasing deque    │ front index ≤ i−k     │ O(n)       │ O(k)  │
│ Sliding Window Median      │ fixed + heaps │ max-heap + min-heap │ lazy-delete a[i−k]    │ O(n log k) │ O(n)  │
└────────────────────────────┴───────────────┴─────────────────────┴───────────────────────┴────────────┴───────┘
```

### Family tree

```
                              SLIDING WINDOW
                                    │
      ┌─────────────────┬───────────┴───────────┬─────────────────────┐
      │                 │                       │                     │
   FIXED SIZE k     VARIABLE SIZE           COUNTING            FIXED k + HELPER
   (+ in, − out)    (expand / shrink)       (+= r − l + 1)      (window statistic)
      │                 │                       │                     │
   ├ Max Sum of K    ├ LONGEST:              ├ Product < K         ├ DEQUE: Sliding
   ├ Max Average I   │  ├ Max Consec. Ones   └ EXACTLY K:          │   Window Maximum
   └ K Closest       │  ├ Max Consec. III      atMost(k) −         └ TWO HEAPS: Sliding
     (binary search  │  └ Fruit Into Baskets   atMost(k−1)             Window Median
      on left edge)  └ SHORTEST:               └ K Different
                        └ Min Size Subarray      Integers
                          Sum
```

### Recognition checklist

```
  ☐ Contiguous subarray / substring?                   → window candidate
  ☐ Size k given?                                       → FIXED: add a[r], drop a[r−k]
  ☐ "Longest such that ..."?                            → shrink while INVALID, record after
  ☐ "Shortest such that ..."?                           → shrink while VALID, record inside
  ☐ "Count subarrays such that ..." (monotone rule)?    → count += r − l + 1
  ☐ "Count with EXACTLY k ..."?                         → atMost(k) − atMost(k−1)
  ☐ Need max / min of each window?                      → monotonic deque
  ☐ Need median of each window?                         → two heaps + lazy deletion
  ☐ Sorted array + "k closest"?                         → binary search the window's left edge
  ☐ Negative numbers + sum target?                      → STOP: prefix sums, not a window
```

### Window vs. its neighbors

```
   ┌──────────────────────────────────────────┬────────────────────────────┐
   │ Question                                 │ Pattern                    │
   ├──────────────────────────────────────────┼────────────────────────────┤
   │ Longest/shortest/count, all ≥ 0          │ Sliding window             │
   │ Count subarrays with sum = k, negatives  │ Prefix sum + hashmap       │
   │ Best subarray sum, any length            │ Kadane                     │
   │ Shortest sum ≥ k WITH negatives (LC 862) │ Prefix sum + mono deque    │
   │ Same idea on strings (distinct chars)    │ Sliding window on strings  │
   └──────────────────────────────────────────┴────────────────────────────┘
```

> 💡 Neighbors: [03-Prefix-Sum.md](03-Prefix-Sum.md), [04-Kadanes-Algorithm.md](04-Kadanes-Algorithm.md),
> [../strings/02-Sliding-Window-String.md](../strings/02-Sliding-Window-String.md).

### 🚩 Common bugs to avoid

```
  ✗ Fixed window: recording before the window is full (r < k − 1)
  ✗ Starting best at 0 when sums can be negative (Max Sum of Size K)
  ✗ Integer division for the average, or dividing every window instead of once
  ✗ Using "if" instead of "while" to shrink (unless you mean the never-shrink trick)
  ✗ Shortest window: recording AFTER the shrink loop instead of inside it
  ✗ Not deleting a key whose count hit 0 → distinct count is wrong
  ✗ Product < K: forgetting k ≤ 1 → l runs past r
  ✗ Trying to count "exactly k" with a single window
  ✗ K Closest: |...| in the binary search test, or search space 0..n−1 instead of 0..n−k
  ✗ Deque: storing values instead of indices (can't tell when the front expires)
  ✗ Median: using heap.size instead of valid counters; forgetting to prune after rebalance
  ✗ Using a window at all when the array has negatives and the rule is about the sum
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "When I grow the window, does it only get 'more'?       ║
   ║   And when it breaks the rule, does shrinking from       ║
   ║   the left always help?"                                 ║
   ╚══════════════════════════════════════════════════════════╝
     Yes → sliding window, O(n).
     No (negatives, exact targets) → prefix sums or a smarter structure.
```

---

### ✅ Progress tracker

- [ ] Maximum Sum Subarray of Size K (Easy)
- [ ] Maximum Average Subarray I (Easy)
- [ ] Find K Closest Elements (Medium)
- [ ] Max Consecutive Ones (Easy)
- [ ] Max Consecutive Ones III (Medium)
- [ ] Fruit Into Baskets (Medium)
- [ ] Minimum Size Subarray Sum (Medium)
- [ ] Subarray Product Less Than K (Medium)
- [ ] Subarrays with K Different Integers (Hard)
- [ ] Sliding Window Maximum (Hard)
- [ ] Sliding Window Median (Hard)
