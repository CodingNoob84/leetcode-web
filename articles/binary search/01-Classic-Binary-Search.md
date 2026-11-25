# Classic Binary Search: A Visual Guide

> **Goal:** Learn to *see* binary search problems, pick the right template, and never write an infinite loop again.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Binary Search?](#0-the-big-idea-what-is-binary-search)
1. [Binary Search (Easy)](#1-binary-search-easy)
2. [Search Insert Position (Easy)](#2-search-insert-position-easy)
3. [Sqrt(x) (Easy)](#3-sqrtx-easy)
4. [Peak Index in a Mountain Array (Medium)](#4-peak-index-in-a-mountain-array-medium)
5. [Find Peak Element (Medium)](#5-find-peak-element-medium)
6. [Find Minimum in Rotated Sorted Array (Medium)](#6-find-minimum-in-rotated-sorted-array-medium)
7. [Search in Rotated Sorted Array (Medium)](#7-search-in-rotated-sorted-array-medium)
8. [Search in Rotated Sorted Array II (Medium)](#8-search-in-rotated-sorted-array-ii-medium)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** Binary Search → Search Insert → Sqrt(x) → Peak in Mountain → Find Peak
> → Min in Rotated → Search in Rotated → Search in Rotated II.
> Each one adds exactly one new idea to the previous one.

---

## 0. The Big Idea: What Is Binary Search?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BINARY SEARCH"                         │
├──────────────────────────────────────────────────────────────────┤
│  • Input is SORTED (or "sorted, then rotated")                   │
│  • "Find in O(log n)": the constraint gives it away              │
│  • You can look at ONE middle element and throw away HALF        │
│  • The array has a "slope": up then down (peak / mountain)       │
│  • Answer is a number in a range with a monotonic test (sqrt)    │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: a shrinking window

```
  index:   0    1    2    3    4    5    6    7    8
         ┌────┬────┬────┬────┬────┬────┬────┬────┬────┐
  nums:  │  1 │  3 │  5 │  7 │  9 │ 11 │ 13 │ 15 │ 17 │   target = 13
         └────┴────┴────┴────┴────┴────┴────┴────┴────┘
           lo                  mid                  hi
                               9 < 13 → throw away the LEFT half

                                    ┌────┬────┬────┬────┐
                                    │ 11 │ 13 │ 15 │ 17 │
                                    └────┴────┴────┴────┘
                                     lo   mid        hi
                                         13 == 13 ✅

   n → n/2 → n/4 → ... → 1      →  about log₂(n) steps
   1,000,000 elements  →  only ~20 looks!
```

### The invariant mindset (the most important idea)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ Before writing a loop, finish this sentence:                  │
 │                                                               │
 │   "IF the answer exists, it is ALWAYS inside [lo, hi]."       │
 │                                                               │
 │ Every update (lo = ..., hi = ...) must keep that sentence     │
 │ true. If you can say WHY each half you throw away cannot      │
 │ contain the answer, your code is correct.                     │
 └───────────────────────────────────────────────────────────────┘

   ┌──────────┬───────────────────────────┬──────────┐
   │ discarded│   still possible [lo..hi] │ discarded│
   │ (proven  │                           │ (proven  │
   │  wrong)  │                           │  wrong)  │
   └──────────┴───────────────────────────┴──────────┘
```

### The 2 templates, side by side

```
 TEMPLATE A: "EXACT MATCH"                TEMPLATE B: "CONVERGE TO BOUNDARY"
 window is CLOSED [lo, hi]                window shrinks until lo == hi

 lo ← 0, hi ← n−1                         lo ← 0, hi ← n−1   (or n)
 while lo ≤ hi:                           while lo < hi:
     mid ← lo + (hi−lo)/2                     mid ← lo + (hi−lo)/2
     if nums[mid] == target: return mid       if condition(mid):
     if nums[mid] <  target: lo ← mid+1           hi ← mid       // mid MAY be answer
     else:                   hi ← mid−1       else:
 return −1   (lo = hi+1 here)                     lo ← mid+1     // mid is NOT answer
                                          return lo   (lo == hi here)

 USE WHEN:                                USE WHEN:
 • you look for one exact value           • you look for the FIRST index where
 • you can return as soon as you see it     something becomes true
                                          • peaks, minimums, insert positions
                                          • mid itself might be the answer
```

```
  Template B picture: condition(i) is FALSE ... FALSE TRUE ... TRUE
                                                       ▲
                                          lo and hi meet HERE

     F    F    F    F    T    T    T
   ┌────┬────┬────┬────┬────┬────┬────┐
   │    │    │    │    │ ★  │    │    │    ★ = first TRUE
   └────┴────┴────┴────┴────┴────┴────┘
```

### Why `mid = lo + (hi − lo) / 2`?

```
   (lo + hi) / 2         → lo + hi can overflow a 32-bit int when both are large
   lo + (hi − lo) / 2    → same value, never overflows ✅

   Both round DOWN, so mid is the "lower middle":  lo ≤ mid < hi  (when lo < hi)
```

### How to avoid infinite loops

```
  ┌──────────────────────────────────────────────────────────────────┐
  │ Rule: every iteration must SHRINK the window.                    │
  ├──────────────────────────────────────────────────────────────────┤
  │ Template A: lo = mid+1 / hi = mid−1  → always shrinks ✓          │
  │ Template B: hi = mid  + lo = mid+1   + LOWER mid → shrinks ✓     │
  │                                                                  │
  │ ⚠ DANGER: lo = mid  with lower mid                               │
  │     lo=4, hi=5 → mid=4 → lo=4 → stuck forever ✗                  │
  │   FIX: if you need "lo = mid", use UPPER mid:                    │
  │        mid ← lo + (hi − lo + 1) / 2                              │
  └──────────────────────────────────────────────────────────────────┘
```

### "Which half is sorted?" (for rotated arrays)

```
   A rotated sorted array = TWO sorted pieces glued together:

        ▲ value
        │        ●
        │      ●            left piece   (big values)
        │    ●
        │  ●
        │                ●
        │              ●    right piece  (small values)
        │            ●
        └──────────────────► index
              ▲ drop = rotation point

   Pick any mid. AT LEAST ONE side of mid is fully sorted:

                 nums[lo] ≤ nums[mid] ?
                 ┌─────────┴──────────┐
               YES                    NO
                 │                     │
     LEFT half [lo..mid] sorted   RIGHT half [mid..hi] sorted
                 │                     │
     target in [nums[lo],nums[mid])?   target in (nums[mid],nums[hi]]?
        yes → hi = mid−1                 yes → lo = mid+1
        no  → lo = mid+1                 no  → hi = mid−1
```

> 💡 **Key insight:** You can only make a decision about the half you **understand** (the sorted one).
> Check whether the target is inside it. If not, it must be in the other half.

---

## 1. Binary Search (Easy)

### Problem
Sorted array of distinct integers. Return the index of `target`, or `-1`.

### Visualize it

```
   nums  = [ -1,  0,  3,  5,  9, 12 ]     target = 9
   index:     0   1   2   3   4   5
```

### Decision at mid

```
              compare nums[mid] with target
          ┌──────────────┼──────────────┐
       smaller         equal          bigger
          │              │               │
   answer is RIGHT   FOUND! ✅      answer is LEFT
   lo ← mid + 1      return mid     hi ← mid − 1
```

### The setup

| Item | Answer |
|------|--------|
| Template | A (exact match, `lo ≤ hi`) |
| Invariant | if target exists, it is in `[lo, hi]` |
| Start | `lo = 0`, `hi = n − 1` |
| Stop | found, or `lo > hi` (window empty) |
| Answer | `mid` when found, else `-1` |

### Trace (target = 9)

```
  step │ lo │ hi │ mid │ nums[mid] │ action
  ─────┼────┼────┼─────┼───────────┼──────────────────────
   1   │ 0  │ 5  │  2  │     3     │ 3 < 9  → lo = 3
   2   │ 3  │ 5  │  4  │     9     │ 9 == 9 → return 4 ✅
```

### Trace (target = 2, not present)

```
  step │ lo │ hi │ mid │ nums[mid] │ action
  ─────┼────┼────┼─────┼───────────┼──────────────────────
   1   │ 0  │ 5  │  2  │     3     │ 3 > 2  → hi = 1
   2   │ 0  │ 1  │  0  │    -1     │ -1 < 2 → lo = 1
   3   │ 1  │ 1  │  1  │     0     │ 0 < 2  → lo = 2
   —   │ 2  │ 1  │     │           │ lo > hi → return -1 ✅

   Notice: lo ended at 2 = where 2 WOULD be inserted. (That's problem 2!)
```

### Pseudocode

```
function search(nums, target):
    lo ← 0, hi ← n − 1
    while lo ≤ hi:
        mid ← lo + (hi − lo) / 2
        if nums[mid] == target: return mid
        if nums[mid] <  target: lo ← mid + 1
        else:                   hi ← mid − 1
    return −1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Linear scan | O(n) | O(1) |
| **Binary search** | **O(log n)** | **O(1)** ✅ |

### 📌 Points to remember
- `lo ≤ hi` (not `<`): a window of **one** element still needs checking.
- `mid ± 1`: mid has been checked, so drop it.
- When the loop ends without finding the target, `lo` is where it **would** go. Remember this.

---

## 2. Search Insert Position (Easy)

### Problem
Sorted array of distinct values. Return the index of `target`, or the index where it **would be inserted** to keep the order.

### Visualize it

```
   nums = [ 1, 3, 5, 6 ]

   target 5 → index 2      (found)
   target 2 → index 1      ( 1 | ▼ | 3 5 6 )
   target 7 → index 4      ( 1 3 5 6 | ▼ )   ← can be n!
```

### Reframe as a boundary

```
   "Insert position" = FIRST index i with nums[i] ≥ target   (lower bound)

     nums:      1     3     5     6
     ≥ 2 ?      F     T     T     T
                      ▲
                 first TRUE = 1 ✅
```

### The setup

| Item | Answer |
|------|--------|
| Template | A ending with `return lo`, or B with `hi = n` |
| Invariant | everything left of `lo` is `< target`; everything right of `hi` is `≥ target` |
| Answer | `lo` when the loop ends |

### Trace (target = 2)

```
  step │ lo │ hi │ mid │ nums[mid] │ action
  ─────┼────┼────┼─────┼───────────┼──────────────────────
   1   │ 0  │ 3  │  1  │     3     │ 3 > 2  → hi = 0
   2   │ 0  │ 0  │  0  │     1     │ 1 < 2  → lo = 1
   —   │ 1  │ 0  │     │           │ stop → return lo = 1 ✅
```

### Trace (target = 7)

```
  step │ lo │ hi │ mid │ nums[mid] │ action
  ─────┼────┼────┼─────┼───────────┼──────────────────────
   1   │ 0  │ 3  │  1  │     3     │ 3 < 7  → lo = 2
   2   │ 2  │ 3  │  2  │     5     │ 5 < 7  → lo = 3
   3   │ 3  │ 3  │  3  │     6     │ 6 < 7  → lo = 4
   —   │ 4  │ 3  │     │           │ stop → return lo = 4 ✅
```

### Pseudocode

```
function searchInsert(nums, target):
    lo ← 0, hi ← n − 1
    while lo ≤ hi:
        mid ← lo + (hi − lo) / 2
        if nums[mid] == target: return mid
        if nums[mid] <  target: lo ← mid + 1
        else:                   hi ← mid − 1
    return lo            // ← the only change from problem 1
```

### Why `lo` is the answer

```
  At the end:  lo = hi + 1

     ... values < target ... │ ... values > target ...
                         hi ─┘└─ lo
                               ▲
                      the gap where target belongs
```

### 📌 Points to remember
- Same code as Binary Search, but return `lo` instead of `-1`.
- The answer can be `n` (past the end). Template B needs `hi = n` to allow that.
- This is the **lower bound**, the building block of the next pattern file.

---

## 3. Sqrt(x) (Easy)

### Problem
Return `⌊√x⌋` (rounded down) for a non-negative integer `x`, without a built-in sqrt.

### Visualize it: search the ANSWER, not an array

```
   x = 8

   m     :   1    2    3    4    5    6    7    8
   m·m   :   1    4    9   16   25   36   49   64
   ≤ 8 ? :   T    T    F    F    F    F    F    F
                  ▲
         LAST TRUE = 2  → ⌊√8⌋ = 2 ✅

   No array is given. The "array" is the numbers 1..x,
   and m·m is sorted, so binary search works.
```

### Decision at mid

```
                  mid · mid  vs  x
             ┌──────────┴──────────┐
          ≤ x                     > x
             │                      │
   mid is a candidate        mid is too big
   ans ← mid, lo ← mid+1     hi ← mid − 1
   (try bigger)
```

### The setup

| Item | Answer |
|------|--------|
| Search space | `1 .. x` (or `1 .. x/2` for x ≥ 4) |
| Template | A, remembering the last good `mid` |
| Condition | `mid · mid ≤ x` |
| Answer | largest `mid` that passed |
| Edge | `x < 2` → return `x` |

### Trace (x = 8)

```
  step │ lo │ hi │ mid │ mid² │ action
  ─────┼────┼────┼─────┼──────┼────────────────────────────
   1   │ 1  │ 8  │  4  │  16  │ 16 > 8 → hi = 3
   2   │ 1  │ 3  │  2  │   4  │ 4 ≤ 8  → ans = 2, lo = 3
   3   │ 3  │ 3  │  3  │   9  │ 9 > 8  → hi = 2
   —   │ 3  │ 2  │     │      │ stop → return ans = 2 ✅
```

### Pseudocode

```
function mySqrt(x):
    if x < 2: return x
    lo ← 1, hi ← x / 2, ans ← 1
    while lo ≤ hi:
        mid ← lo + (hi − lo) / 2
        if mid ≤ x / mid:          // same as mid·mid ≤ x, but no overflow
            ans ← mid
            lo  ← mid + 1
        else:
            hi  ← mid − 1
    return ans
```

### 📌 Points to remember
- **Binary search on the answer**: the search space is a range of numbers, not an array.
  This is the seed of the whole "Binary Search on Answers" pattern.
- `mid · mid` overflows 32-bit for large x. Compare `mid ≤ x / mid` or use 64-bit.
- "Largest value that passes" → store `ans` on success, then keep searching right.

---

## 4. Peak Index in a Mountain Array (Medium)

### Problem
The array strictly increases, then strictly decreases. Return the index of the top.

### Visualize it

```
   arr = [ 1, 3, 5, 7, 6, 4, 2 ]

               7
            5     6
         3           4
      1                 2
     ─────────────────────
      0  1  2  3  4  5  6       peak at index 3
```

### Decision at mid: look at the slope

```
                arr[mid] vs arr[mid+1]
           ┌───────────┴────────────┐
      arr[mid] < arr[mid+1]    arr[mid] > arr[mid+1]
      going UPHILL ↗           going DOWNHILL ↘
           │                         │
   peak is to the RIGHT       peak is mid or to the LEFT
   lo ← mid + 1               hi ← mid   (mid may be the peak!)
```

```
   condition "arr[i] > arr[i+1]" across the array:

      arr:        1    3    5    7    6    4    2
      downhill?   F    F    F    T    T    T    —
                                 ▲
                    first TRUE = the peak  → Template B
```

### The setup

| Item | Answer |
|------|--------|
| Template | B (`lo < hi`, `hi = mid`) |
| Invariant | the peak is always in `[lo, hi]` |
| Answer | `lo` when `lo == hi` |

### Trace

```
  step │ lo │ hi │ mid │ arr[mid] │ arr[mid+1] │ action
  ─────┼────┼────┼─────┼──────────┼────────────┼──────────────────
   1   │ 0  │ 6  │  3  │    7     │     6      │ downhill → hi = 3
   2   │ 0  │ 3  │  1  │    3     │     5      │ uphill   → lo = 2
   3   │ 2  │ 3  │  2  │    5     │     7      │ uphill   → lo = 3
   —   │ 3  │ 3  │     │          │            │ lo == hi → return 3 ✅
```

### Pseudocode

```
function peakIndexInMountainArray(arr):
    lo ← 0, hi ← n − 1
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if arr[mid] < arr[mid + 1]: lo ← mid + 1
        else:                       hi ← mid
    return lo
```

> 💡 `mid + 1` is always a valid index: with `lo < hi` and lower mid, `mid < hi ≤ n − 1`.

### 📌 Points to remember
- Compare with the **neighbor** (`mid+1`), not with a target. There is no target.
- `hi = mid`, not `mid − 1`, because mid could be the peak.
- `lo < hi` + lower mid + `hi = mid` / `lo = mid+1` is the safe, no-infinite-loop combo.

---

## 5. Find Peak Element (Medium)

### Problem
Return the index of **any** peak (an element strictly bigger than its neighbors).
Imagine `nums[-1] = nums[n] = −∞`. Neighbors are never equal.

### Visualize it

```
   nums = [ 1, 2, 1, 3, 5, 6, 4 ]

                        6
                     5     4
            2     3
         1     1
   −∞  ──────────────────────  −∞
        0  1  2  3  4  5  6

   peaks: index 1 (2) and index 5 (6). Either answer is accepted.
```

### Why it works even though the array isn't a mountain

```
   Walk UPHILL and you must reach a peak, because the edge is −∞:

     at mid, if nums[mid] < nums[mid+1]:
                 ↗ ... keeps going up ... eventually must come down
                       (or hit the −∞ wall)  → a peak exists to the RIGHT

     else (nums[mid] > nums[mid+1]):
         ↖ ... going left is uphill → a peak exists at mid or to the LEFT

   You don't need the WHOLE array sorted, only a guarantee that
   one side surely has an answer.
```

### The setup

| Item | Answer |
|------|--------|
| Template | B, **exact same code** as problem 4 |
| Invariant | `[lo, hi]` always contains at least one peak |
| Answer | `lo` |

### Trace

```
  step │ lo │ hi │ mid │ nums[mid] │ nums[mid+1] │ action
  ─────┼────┼────┼─────┼───────────┼─────────────┼──────────────────
   1   │ 0  │ 6  │  3  │     3     │      5      │ uphill   → lo = 4
   2   │ 4  │ 6  │  5  │     6     │      4      │ downhill → hi = 5
   3   │ 4  │ 5  │  4  │     5     │      6      │ uphill   → lo = 5
   —   │ 5  │ 5  │     │           │             │ return 5 ✅ (value 6)
```

### Pseudocode

```
function findPeakElement(nums):
    lo ← 0, hi ← n − 1
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if nums[mid] < nums[mid + 1]: lo ← mid + 1    // climb right
        else:                         hi ← mid        // climb left / stay
    return lo
```

### 📌 Points to remember
- Binary search needs a **reason to drop half**, not necessarily a sorted array.
- "Any peak" is what makes O(log n) possible. Finding the **global** max needs O(n).
- The `−∞` borders guarantee a peak always exists.

---

## 6. Find Minimum in Rotated Sorted Array (Medium)

### Problem
A sorted array (distinct values) was rotated. Find the minimum.

### Visualize it

```
   original : [ 0, 1, 2, 4, 5, 6, 7 ]
   rotated  : [ 4, 5, 6, 7, 0, 1, 2 ]
                          ▲  ▲
                       drop  minimum (index 4)

        7
      6 │
    5   │
  4     │
        └─▶     2
              1
            0
```

### Decision at mid: compare with `hi`

```
                     nums[mid] vs nums[hi]
             ┌──────────────┴───────────────┐
      nums[mid] > nums[hi]            nums[mid] < nums[hi]
             │                               │
   mid is in the BIG (left) piece    mid..hi is sorted;
   → min is RIGHT of mid             min is mid or LEFT of it
     lo ← mid + 1                      hi ← mid
```

```
   Why compare with hi, not lo?

   [ 1, 2, 3, 4, 5 ]  (not rotated)    nums[mid]=3 > nums[lo]=1 → "go right"? ✗ wrong!
                                       nums[mid]=3 < nums[hi]=5 → "go left"  ✓ right

   nums[hi] always belongs to the SMALL piece (or the only piece),
   so it's a reliable reference.
```

### The setup

| Item | Answer |
|------|--------|
| Template | B (`lo < hi`, `hi = mid`) |
| Invariant | the minimum is always in `[lo, hi]` |
| Answer | `nums[lo]` |

### Trace ([4,5,6,7,0,1,2])

```
  step │ lo │ hi │ mid │ nums[mid] │ nums[hi] │ action
  ─────┼────┼────┼─────┼───────────┼──────────┼──────────────────
   1   │ 0  │ 6  │  3  │     7     │    2     │ 7 > 2 → lo = 4
   2   │ 4  │ 6  │  5  │     1     │    2     │ 1 < 2 → hi = 5
   3   │ 4  │ 5  │  4  │     0     │    1     │ 0 < 1 → hi = 4
   —   │ 4  │ 4  │     │           │          │ return nums[4] = 0 ✅
```

### Trace ([3,4,5,1,2])

```
  step │ lo │ hi │ mid │ nums[mid] │ nums[hi] │ action
  ─────┼────┼────┼─────┼───────────┼──────────┼──────────────────
   1   │ 0  │ 4  │  2  │     5     │    2     │ 5 > 2 → lo = 3
   2   │ 3  │ 4  │  3  │     1     │    2     │ 1 < 2 → hi = 3
   —   │ 3  │ 3  │     │           │          │ return nums[3] = 1 ✅
```

### Pseudocode

```
function findMin(nums):
    lo ← 0, hi ← n − 1
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if nums[mid] > nums[hi]: lo ← mid + 1
        else:                    hi ← mid
    return nums[lo]
```

### 📌 Points to remember
- Compare with **`nums[hi]`**. It handles the "not rotated at all" case for free.
- `lo` ends on the **rotation point** (the index of the minimum). That is also the "Find Kth Rotation" answer.
- With duplicates (LC 154): when `nums[mid] == nums[hi]`, you can only do `hi ← hi − 1` → worst case O(n).

---

## 7. Search in Rotated Sorted Array (Medium)

### Problem
Rotated sorted array, **distinct** values. Return the index of `target` or `-1`, in O(log n).

### Visualize it

```
   nums = [ 4, 5, 6, 7, 0, 1, 2 ]     target = 0
   index:   0  1  2  3  4  5  6

   ┌────────────────┬─────────────┐
   │ 4  5  6  7     │ 0  1  2     │   two sorted pieces
   └────────────────┴─────────────┘
```

### Decision at mid (the "which half is sorted?" tree)

```
                          nums[mid] == target ?  → return mid
                                   │ no
                         nums[lo] ≤ nums[mid] ?
                ┌──────────────────┴───────────────────┐
              YES: LEFT sorted                    NO: RIGHT sorted
                │                                      │
   nums[lo] ≤ target < nums[mid] ?       nums[mid] < target ≤ nums[hi] ?
       │yes            │no                    │yes            │no
   hi ← mid−1      lo ← mid+1             lo ← mid+1      hi ← mid−1
```

### The setup

| Item | Answer |
|------|--------|
| Template | A (exact match, `lo ≤ hi`) |
| Key step | find the sorted half, test if target fits inside it |
| Answer | index, or `-1` |

### Trace (target = 0)

```
  step │ lo │ hi │ mid │ nums[mid] │ sorted half       │ target inside? │ action
  ─────┼────┼────┼─────┼───────────┼───────────────────┼────────────────┼──────────
   1   │ 0  │ 6  │  3  │     7     │ left [4..7]       │ 0 in [4,7)? no │ lo = 4
   2   │ 4  │ 6  │  5  │     1     │ left [0..1]       │ 0 in [0,1)? yes│ hi = 4
   3   │ 4  │ 4  │  4  │     0     │ —                 │ —              │ return 4 ✅
```

### Trace (target = 3, missing)

```
  step │ lo │ hi │ mid │ nums[mid] │ sorted half   │ target inside? │ action
  ─────┼────┼────┼─────┼───────────┼───────────────┼────────────────┼──────────
   1   │ 0  │ 6  │  3  │     7     │ left [4..7]   │ 3 in [4,7)? no │ lo = 4
   2   │ 4  │ 6  │  5  │     1     │ left [0..1]   │ 3 in [0,1)? no │ lo = 6
   3   │ 6  │ 6  │  6  │     2     │ left [2..2]   │ 3 in [2,2)? no │ lo = 7
   —   │ 7  │ 6  │     │           │               │                │ return -1 ✅
```

### Pseudocode

```
function searchRotated(nums, target):
    lo ← 0, hi ← n − 1
    while lo ≤ hi:
        mid ← lo + (hi − lo) / 2
        if nums[mid] == target: return mid
        if nums[lo] ≤ nums[mid]:                       // left half sorted
            if nums[lo] ≤ target < nums[mid]: hi ← mid − 1
            else:                             lo ← mid + 1
        else:                                          // right half sorted
            if nums[mid] < target ≤ nums[hi]: lo ← mid + 1
            else:                             hi ← mid − 1
    return −1
```

### Alternative: two-pass

```
   1. pivot ← findMin index (problem 6)
   2. binary search in [0 .. pivot−1] or [pivot .. n−1], whichever range holds target
   Same O(log n), but often easier to get right in an interview.
```

### 📌 Points to remember
- Use **`≤`** in `nums[lo] ≤ nums[mid]`. When `lo == mid`, the "left half" is one element and still sorted.
- Range checks: one end inclusive, the `mid` end exclusive (mid was already checked).
- Only trust the **sorted** half. Never reason about the messy half directly.

---

## 8. Search in Rotated Sorted Array II (Medium)

### Problem
Same as problem 7, but values **can repeat**. Return `true` / `false`.

### What breaks: duplicates hide the sorted half

```
   [ 1, 0, 1, 1, 1 ]        [ 1, 1, 1, 0, 1 ]
     lo    mid    hi          lo    mid    hi
     1     1      1           1     1      1

   Both look IDENTICAL at lo, mid, hi.
   In the first, the drop is LEFT of mid. In the second, it's RIGHT.
   → "nums[lo] ≤ nums[mid]" can't tell which half is sorted. ✗
```

### The fix: shrink both ends

```
                         nums[mid] == target ?  → true
                                  │ no
          nums[lo] == nums[mid] == nums[hi] ?  ──yes──►  lo ← lo+1, hi ← hi−1
                                  │ no                   (safe: those values equal
                                  ▼                        nums[mid] ≠ target)
                 same "which half is sorted?" logic as problem 7
```

### Trace ([1,0,1,1,1], target = 0)

```
  step │ lo │ hi │ mid │ lo/mid/hi values │ action
  ─────┼────┼────┼─────┼──────────────────┼────────────────────────────────
   1   │ 0  │ 4  │  2  │  1 / 1 / 1       │ all equal → lo = 1, hi = 3
   2   │ 1  │ 3  │  2  │  0 / 1 / 1       │ left sorted [0..1], 0 in [0,1)? yes → hi = 1
   3   │ 1  │ 1  │  1  │  0               │ nums[1] == 0 → return true ✅
```

### Pseudocode

```
function searchRotatedII(nums, target):
    lo ← 0, hi ← n − 1
    while lo ≤ hi:
        mid ← lo + (hi − lo) / 2
        if nums[mid] == target: return true
        if nums[lo] == nums[mid] and nums[mid] == nums[hi]:
            lo ← lo + 1
            hi ← hi − 1
        else if nums[lo] ≤ nums[mid]:                  // left half sorted
            if nums[lo] ≤ target < nums[mid]: hi ← mid − 1
            else:                             lo ← mid + 1
        else:                                          // right half sorted
            if nums[mid] < target ≤ nums[hi]: lo ← mid + 1
            else:                             hi ← mid − 1
    return false
```

### Complexity

| Case | Time |
|---|---|
| Few duplicates | O(log n) |
| Worst case `[1,1,1,...,1,0,1,...,1]` | **O(n)**: each step may shrink by only 2 |

### 📌 Points to remember
- Duplicates can make the sorted-half test **ambiguous**. Shrinking both ends is the only safe move.
- Worst case is O(n). That's unavoidable, and a good thing to mention in an interview.
- One extra `if` on top of problem 7. **Reuse templates!**

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────────┬──────────┬───────────────────────────────────────┬─────────────┬───────────┐
│ Problem                  │ Template │ Decision at mid                       │ Answer      │ Time      │
├──────────────────────────┼──────────┼───────────────────────────────────────┼─────────────┼───────────┤
│ Binary Search            │ A  (≤)   │ compare with target                   │ mid / −1    │ O(log n)  │
│ Search Insert Position   │ A  (≤)   │ compare with target                   │ lo          │ O(log n)  │
│ Sqrt(x)                  │ A  (≤)   │ mid·mid ≤ x → save, go right          │ ans         │ O(log x)  │
│ Peak in Mountain         │ B  (<)   │ arr[mid] < arr[mid+1] → right         │ lo          │ O(log n)  │
│ Find Peak Element        │ B  (<)   │ same as mountain                      │ lo          │ O(log n)  │
│ Min in Rotated           │ B  (<)   │ nums[mid] > nums[hi] → right          │ nums[lo]    │ O(log n)  │
│ Search in Rotated        │ A  (≤)   │ find sorted half, is target inside?   │ mid / −1    │ O(log n)  │
│ Search in Rotated II     │ A  (≤)   │ + all-equal → lo++, hi−−              │ true/false  │ O(n) worst│
└──────────────────────────┴──────────┴───────────────────────────────────────┴─────────────┴───────────┘
```

### Pattern family tree

```
                           CLASSIC BINARY SEARCH
                                    │
     ┌──────────────────┬───────────┴─────────┬─────────────────────┐
     │                  │                     │                     │
  EXACT MATCH       BOUNDARY            SLOPE / PEAK          ROTATED ARRAYS
  (Template A)      (first TRUE)        (compare neighbor)    (which half sorted?)
     │                  │                     │                     │
  └ Binary Search   ├ Search Insert      ├ Peak in Mountain    ├ Min in Rotated
                    └ Sqrt(x)            └ Find Peak Element   ├ Search in Rotated
                      (search the answer)                      └ Search in Rotated II
```

### Template picker

```
   ┌────────────────────────────────────────┬─────────────────────────────┐
   │ Question                               │ Use                         │
   ├────────────────────────────────────────┼─────────────────────────────┤
   │ "Is X here? Where?"                    │ A: lo ≤ hi, mid ± 1         │
   │ "Where WOULD X go?"                    │ A, return lo                │
   │ "First index where condition is true"  │ B: lo < hi, hi = mid        │
   │ "Last value where condition is true"   │ A + save ans, or B on ¬cond │
   │ "Find a peak / min / turning point"    │ B: compare with neighbor/hi │
   └────────────────────────────────────────┴─────────────────────────────┘
```

### Optimization / correctness checklist

```
  ☐ Can I state the invariant: "the answer is always in [lo, hi]"?
  ☐ mid = lo + (hi − lo) / 2                      (no overflow)
  ☐ Does every branch SHRINK the window?           (no infinite loop)
  ☐ Using lo = mid?  → switch to upper mid         (lo + (hi−lo+1)/2)
  ☐ Could mid itself be the answer?  → hi = mid, not mid − 1
  ☐ Could the answer be n (past the end)?  → hi = n
  ☐ Rotated array?  → find the sorted half first
  ☐ Duplicates?  → expect an O(n) worst case
```

### 🚩 Common bugs to avoid

```
  ✗ while lo < hi  with  hi = mid − 1  → skips the last candidate
  ✗ while lo ≤ hi  with  hi = mid      → infinite loop when lo == hi
  ✗ lo = mid with lower mid            → infinite loop on 2 elements
  ✗ (lo + hi) / 2                      → overflow for huge indices
  ✗ Sqrt: mid·mid in 32-bit            → overflow
  ✗ Rotated: nums[lo] < nums[mid] (strict) → wrong when lo == mid
  ✗ Min in Rotated: comparing with nums[lo] → fails on an un-rotated array
  ✗ Peak: forgetting nums[mid+1] must be in bounds (use lo < hi)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Looking ONLY at mid, can I PROVE one half does not     ║
   ║   contain the answer?"                                   ║
   ╚══════════════════════════════════════════════════════════╝
     If yes → binary search works. The proof tells you how to move lo / hi.
```

---

### ✅ Progress tracker

- [ ] Binary Search (Easy)
- [ ] Search Insert Position (Easy)
- [ ] Sqrt(x) (Easy)
- [ ] Peak Index in a Mountain Array (Medium)
- [ ] Find Peak Element (Medium)
- [ ] Find Minimum in Rotated Sorted Array (Medium)
- [ ] Search in Rotated Sorted Array (Medium)
- [ ] Search in Rotated Sorted Array II (Medium)
