# Lower / Upper Bound: A Visual Guide

> **Goal:** Stop writing a new binary search for every problem. Learn **two** searches
> (`lowerBound` and `upperBound`) and build floor, ceiling, first, last, count and more out of them.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Find the First TRUE](#0-the-big-idea-find-the-first-true)
1. [Ceiling in a Sorted Array (Easy)](#1-ceiling-in-a-sorted-array-easy)
2. [Floor in a Sorted Array (Easy)](#2-floor-in-a-sorted-array-easy)
3. [Find Smallest Letter Greater Than Target (Easy)](#3-find-smallest-letter-greater-than-target-easy)
4. [Find First and Last Position of Element (Medium)](#4-find-first-and-last-position-of-element-medium)
5. [Count Occurrences in Sorted Array (Easy)](#5-count-occurrences-in-sorted-array-easy)
6. [Find Kth Rotation (Easy)](#6-find-kth-rotation-easy)
7. [Find K Closest Elements (Medium)](#7-find-k-closest-elements-medium)
8. [Time Based Key-Value Store (Medium)](#8-time-based-key-value-store-medium)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** Ceiling → Floor → Smallest Letter → First & Last → Count → Kth Rotation
> → K Closest → Time Based KV Store. The first five are the two searches applied directly.
> The last three hide the search behind a twist.

---

## 0. The Big Idea: Find the First TRUE

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "LOWER / UPPER BOUND"                   │
├──────────────────────────────────────────────────────────────────┤
│  • Sorted data, possibly with DUPLICATES                         │
│  • "FIRST / LAST occurrence", "how many times does x appear"     │
│  • "Smallest ≥ x" (ceiling), "largest ≤ x" (floor)               │
│  • "Smallest STRICTLY greater", "where would x be inserted"      │
│  • "Latest value at or before time t"                            │
│  • Rotation point / boundary between two sorted parts            │
└──────────────────────────────────────────────────────────────────┘
```

### The one picture that explains everything

Every boundary search is really this: a **yes/no question** that is FALSE for a while and
then TRUE forever. Find where it flips.

```
   index:      0     1     2     3     4     5     6     7
            ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
   pred:    │  F  │  F  │  F  │  F  │  T  │  T  │  T  │  T  │
            └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
                                       ▲
                               FIRST TRUE ← the answer

   The predicate must be MONOTONIC: once it turns TRUE, it never goes back.
   Then binary search finds the flip in O(log n).
```

### The two searches you need

```
   lowerBound(x) = first index with arr[i] ≥ x      (predicate: arr[i] ≥ x)
   upperBound(x) = first index with arr[i] > x      (predicate: arr[i] > x)

   arr  =   [ 1 ,  2 ,  2 ,  2 ,  3 ,  5 ]        x = 2
   index:     0    1    2    3    4    5    6 (= n, "past the end")
                   ▲                   ▲
             lowerBound = 1       upperBound = 4
                   └──── all the 2s ───┘
                   [ ------------- )     half-open block of x's
```

> 💡 **Key insight:** the copies of `x` occupy exactly `[lowerBound, upperBound)`.
> Almost every problem in this section is a question about that block.

### Everything else comes from these two

```
┌──────────────────────────────────┬────────────────────────────────────────┐
│ Want                             │ Build it as                            │
├──────────────────────────────────┼────────────────────────────────────────┤
│ insert position of x             │ lowerBound(x)                          │
│ ceiling (smallest ≥ x)           │ arr[lowerBound(x)]       if < n        │
│ strictly greater (smallest > x)  │ arr[upperBound(x)]       if < n        │
│ floor (largest ≤ x)              │ arr[upperBound(x) − 1]   if ≥ 0        │
│ strictly smaller (largest < x)   │ arr[lowerBound(x) − 1]   if ≥ 0        │
│ first occurrence of x            │ lowerBound(x)      if arr[it] == x     │
│ last occurrence of x             │ upperBound(x) − 1  if arr[it] == x     │
│ count of x                       │ upperBound(x) − lowerBound(x)          │
└──────────────────────────────────┴────────────────────────────────────────┘
```

```
   Picture on the number line:

   ... < x  │ == x == x == x │  > x ...
            ▲                ▲
       lowerBound        upperBound
     (first ≥ x)        (first > x)
   ◄─ floor-ish side      ceiling-ish side ─►
```

### Two templates (pick ONE and master it)

```
 TEMPLATE A: "lo < hi" (half-open, returns the flip index directly)
 ──────────────────────────────────────────────────────────────────
   lo ← 0
   hi ← n                    ⚠ n, NOT n−1: the answer may be "past the end"
   while lo < hi:
       mid ← lo + (hi − lo) / 2
       if pred(mid):  hi ← mid          // mid might be the answer, keep it
       else:          lo ← mid + 1      // mid is definitely not
   return lo                 // first TRUE, or n if none

 TEMPLATE B: "ans variable" (closed, remember the best seen)
 ──────────────────────────────────────────────────────────────────
   lo ← 0, hi ← n − 1, ans ← −1
   while lo ≤ hi:
       mid ← lo + (hi − lo) / 2
       if pred(mid):  ans ← mid,  hi ← mid − 1    // record, look LEFT for earlier
       else:          lo ← mid + 1
   return ans                // −1 if none
```

```
   Why hi = n in Template A?

   arr = [1, 2, 3],  x = 9   → every element is < 9

        0   1   2   3
       [1] [2] [3]  │      lowerBound must return 3 ("insert at the end").
                    ▲      If hi started at n−1 = 2, the answer 3 is
                    n      outside the search range and can never be returned.
```

### The 4-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  Write the question as a YES/NO predicate on index i   │
 │ STEP 2  Check it is monotonic: F F F ... T T T                │
 │ STEP 3  Run "find first TRUE" (Template A or B)               │
 │ STEP 4  Post-process: −1? n? check arr[i] == x? wrap around?  │
 └───────────────────────────────────────────────────────────────┘
```

### Trace both searches once (arr = [1, 2, 2, 2, 3, 5], x = 2)

```
  lowerBound (pred: arr[mid] ≥ 2)          upperBound (pred: arr[mid] > 2)
  ┌────┬────┬─────┬──────────┬────────┐   ┌────┬────┬─────┬──────────┬────────┐
  │ lo │ hi │ mid │ arr[mid] │ action │   │ lo │ hi │ mid │ arr[mid] │ action │
  ├────┼────┼─────┼──────────┼────────┤   ├────┼────┼─────┼──────────┼────────┤
  │ 0  │ 6  │  3  │    2     │ hi=3   │   │ 0  │ 6  │  3  │    2     │ lo=4   │
  │ 0  │ 3  │  1  │    2     │ hi=1   │   │ 4  │ 6  │  5  │    5     │ hi=5   │
  │ 0  │ 1  │  0  │    1     │ lo=1   │   │ 4  │ 5  │  4  │    3     │ hi=4   │
  │ 1  │ 1  │  —  │    —     │ stop   │   │ 4  │ 4  │  —  │    —     │ stop   │
  └────┴────┴─────┴──────────┴────────┘   └────┴────┴─────┴──────────┴────────┘
          return 1 ✅                              return 4 ✅
```

---

## 1. Ceiling in a Sorted Array (Easy)

> GFG-style problem. **Definition used:** ceiling of `x` = the **smallest element ≥ x**.
> Return its index (or −1 if no such element).

### Visualize it

```
   arr:   1    2    8    10   10   12   19          x = 5
                   ▲
           ┌───────┘
           smallest value that is ≥ 5  →  8 (index 2)

   number line:   1   2  [5]  8   10   12   19
                         x ──►│
                           ceiling
```

### The predicate

```
   pred(i) = arr[i] ≥ x       → this is exactly lowerBound

   arr :   1    2    8   10   10   12   19
   ≥ 5:    F    F    T    T    T    T    T
                     ▲ first TRUE = ceiling
```

### Trace (x = 5, Template A, hi = n = 7)

```
  ┌────┬────┬─────┬──────────┬──────────────────┐
  │ lo │ hi │ mid │ arr[mid] │ arr[mid] ≥ 5 ?   │
  ├────┼────┼─────┼──────────┼──────────────────┤
  │ 0  │ 7  │  3  │   10     │ yes → hi = 3     │
  │ 0  │ 3  │  1  │    2     │ no  → lo = 2     │
  │ 2  │ 3  │  2  │    8     │ yes → hi = 2     │
  │ 2  │ 2  │  —  │    —     │ stop             │
  └────┴────┴─────┴──────────┴──────────────────┘
   return index 2 → ceiling = 8 ✅

   x = 20 → lowerBound = 7 = n → no ceiling → −1
   x = 10 → lowerBound = 3 → ceiling = 10 (equal counts!)
```

### Pseudocode

```
function ceilingIndex(arr, x):
    i ← lowerBound(arr, x)
    if i == n: return −1          // everything is smaller than x
    return i
```

### 📌 Points to remember
- Ceiling uses **≥**. An element equal to `x` *is* its own ceiling.
- "Past the end" (`n`) means no ceiling exists.
- Time O(log n), Space O(1).

---

## 2. Floor in a Sorted Array (Easy)

> GFG-style problem. **Definition used:** floor of `x` = the **largest element ≤ x**.
> Return its index (or −1 if no such element).

### Visualize it

```
   arr:   1    2    8    10   10   12   19          x = 5
              ▲
              └── largest value that is ≤ 5  →  2 (index 1)

   number line:   1   2  [5]  8   10   12   19
                      │◄── x
                    floor
```

### Two ways to see it

```
   WAY 1: floor is the element JUST BEFORE upperBound

       arr :   1    2    8   10   10   12   19
       > 5 :   F    F    T    T    T    T    T
                    ▲    ▲
               floor     upperBound(5) = 2
               = index 2 − 1 = 1

   WAY 2: "last TRUE" with Template B
       pred(i) = arr[i] ≤ x    →   T  T  F  F  F  F  F
                                      ▲ last TRUE
       record ans and go RIGHT when pred is true
```

### Trace (x = 5, Template B: last index with arr[i] ≤ 5)

```
  ┌────┬────┬─────┬──────────┬─────────────────────────────┐
  │ lo │ hi │ mid │ arr[mid] │ arr[mid] ≤ 5 ?              │
  ├────┼────┼─────┼──────────┼─────────────────────────────┤
  │ 0  │ 6  │  3  │   10     │ no  → hi = 2                │
  │ 0  │ 2  │  1  │    2     │ yes → ans = 1, lo = 2       │
  │ 2  │ 2  │  2  │    8     │ no  → hi = 1                │
  │ 2  │ 1  │  —  │    —     │ stop (lo > hi)              │
  └────┴────┴─────┴──────────┴─────────────────────────────┘
   ans = 1 → floor = 2 ✅

   x = 0  → nothing ≤ 0 → ans stays −1
   x = 10 → floor = 10 (the LAST 10, index 4)
```

### Pseudocode

```
function floorIndex(arr, x):
    return upperBound(arr, x) − 1      // −1 automatically if nothing is ≤ x
```

> Note that "upperBound − 1" returns −1 by itself when no floor exists. No special case needed.

### 📌 Points to remember
- Floor uses **≤**. An element equal to `x` *is* its own floor.
- Ceiling = lowerBound. Floor = upperBound − 1. **Memorize this pair.**
- With duplicates, floor lands on the **last** copy and ceiling on the **first**.

---

## 3. Find Smallest Letter Greater Than Target (Easy)

### Problem
`letters` is sorted. Return the smallest letter **strictly greater** than `target`.
If none exists, **wrap around** and return `letters[0]`.

### Visualize it

```
   letters:   c    f    j

   target 'a' →  c          (first letter > a)
   target 'c' →  f          (c is NOT > c, so skip it)
   target 'j' →  wrap → c   (nothing > j)

         ┌───────────────────────────┐
         ▼                           │ wrap
        [c]──►[f]──►[j]──► (end) ────┘
```

### The predicate

```
   pred(i) = letters[i] > target     → this is exactly upperBound

   target = 'c':     c    f    j
           > 'c':    F    T    T
                          ▲ answer
```

### Trace

```
  target = 'c'  (hi = n = 3)
  ┌────┬────┬─────┬─────────────┬──────────────────┐
  │ lo │ hi │ mid │ letters[mid]│ > 'c' ?          │
  ├────┼────┼─────┼─────────────┼──────────────────┤
  │ 0  │ 3  │  1  │     f       │ yes → hi = 1     │
  │ 0  │ 1  │  0  │     c       │ no  → lo = 1     │
  │ 1  │ 1  │  —  │     —       │ stop → 'f' ✅    │
  └────┴────┴─────┴─────────────┴──────────────────┘

  target = 'j'
  ┌────┬────┬─────┬─────────────┬──────────────────┐
  │ 0  │ 3  │  1  │     f       │ no  → lo = 2     │
  │ 2  │ 3  │  2  │     j       │ no  → lo = 3     │
  │ 3  │ 3  │  —  │     —       │ i = 3 = n → wrap │
  └────┴────┴─────┴─────────────┴──────────────────┘
   → letters[0] = 'c' ✅
```

### Pseudocode

```
function nextGreatestLetter(letters, target):
    i ← upperBound(letters, target)
    return letters[i mod n]          // i == n wraps to index 0
```

### 📌 Points to remember
- **Strictly greater** → upperBound (not lowerBound).
- The wrap-around is just `i mod n`.
- Duplicates are fine: `["x","x","y","y"]`, target `'z'` → wrap → `'x'`.

---

## 4. Find First and Last Position of Element (Medium)

### Problem
Sorted array, maybe with duplicates. Return `[first index, last index]` of `target`, or `[-1, -1]`.
Must be O(log n).

### Visualize it

```
   nums:   5    7    7    8    8    10        target = 8
                          ▲    ▲
                       first  last      → [3, 4]

          [  < 8   ][ == 8 ][ > 8 ]
                    ▲        ▲
              lowerBound  upperBound
                  = 3        = 5      → last = 5 − 1 = 4
```

### Why one search + "walk outward" is wrong

```
   nums = [8, 8, 8, 8, 8, ... 8]   (a million 8s)

   Find any 8, then walk left/right → O(n) in the worst case ❌
   Two boundary searches            → O(log n) always ✅
```

### Trace (target = 8)

```
  lowerBound(8)  (pred: ≥ 8)               upperBound(8)  (pred: > 8)
  ┌────┬────┬─────┬─────┬────────┐        ┌────┬────┬─────┬─────┬────────┐
  │ lo │ hi │ mid │ val │ action │        │ lo │ hi │ mid │ val │ action │
  ├────┼────┼─────┼─────┼────────┤        ├────┼────┼─────┼─────┼────────┤
  │ 0  │ 6  │  3  │  8  │ hi=3   │        │ 0  │ 6  │  3  │  8  │ lo=4   │
  │ 0  │ 3  │  1  │  7  │ lo=2   │        │ 4  │ 6  │  5  │ 10  │ hi=5   │
  │ 2  │ 3  │  2  │  7  │ lo=3   │        │ 4  │ 5  │  4  │  8  │ lo=5   │
  │ 3  │ 3  │  —  │  —  │ stop   │        │ 5  │ 5  │  —  │  —  │ stop   │
  └────┴────┴─────┴─────┴────────┘        └────┴────┴─────┴─────┴────────┘
     first = 3                                last = 5 − 1 = 4      → [3, 4] ✅

  target = 6 → lowerBound = 1, but nums[1] = 7 ≠ 6 → [−1, −1]
```

### Pseudocode

```
function searchRange(nums, target):
    first ← lowerBound(nums, target)
    if first == n or nums[first] ≠ target:
        return [−1, −1]
    last ← upperBound(nums, target) − 1
    return [first, last]
```

### 📌 Points to remember
- **Validate** after lowerBound: it returns an insert position even when the target is missing.
- Check `first == n` **before** reading `nums[first]` (out-of-bounds bug).
- Alternative: Template B twice, once going LEFT on a match (first), once going RIGHT (last).

---

## 5. Count Occurrences in Sorted Array (Easy)

> GFG-style problem. **Definition used:** return how many times `x` appears in a sorted
> array (0 if absent), in O(log n).

### Visualize it

```
   arr:   1    1    2    2    2    2    3          x = 2
                    ├──────────────┤
                    lowerBound=2    upperBound=6

   count = upperBound − lowerBound = 6 − 2 = 4
```

### Trace

```
  lowerBound(2)                            upperBound(2)
  ┌────┬────┬─────┬─────┬────────┐        ┌────┬────┬─────┬─────┬────────┐
  │ lo │ hi │ mid │ val │ action │        │ lo │ hi │ mid │ val │ action │
  ├────┼────┼─────┼─────┼────────┤        ├────┼────┼─────┼─────┼────────┤
  │ 0  │ 7  │  3  │  2  │ hi=3   │        │ 0  │ 7  │  3  │  2  │ lo=4   │
  │ 0  │ 3  │  1  │  1  │ lo=2   │        │ 4  │ 7  │  5  │  2  │ lo=6   │
  │ 2  │ 3  │  2  │  2  │ hi=2   │        │ 6  │ 7  │  6  │  3  │ hi=6   │
  │ 2  │ 2  │  —  │  —  │ stop   │        │ 6  │ 6  │  —  │  —  │ stop   │
  └────┴────┴─────┴─────┴────────┘        └────┴────┴─────┴─────┴────────┘
        2                                        6
                    count = 6 − 2 = 4 ✅
```

### Pseudocode

```
function countOccurrences(arr, x):
    return upperBound(arr, x) − lowerBound(arr, x)
```

> No "is x present?" check needed. If `x` is missing, both searches return the same
> index and the difference is **0** automatically.

### 📌 Points to remember
- **count = upper − lower.** One line, no special cases.
- Same trick counts values in a range `[a, b]`: `upperBound(b) − lowerBound(a)`.

---

## 6. Find Kth Rotation (Easy)

> GFG-style problem. **Definition used:** a sorted array of **distinct** numbers was rotated
> right `k` times. Find `k`.

### Visualize it

```
   original:   2    3    6    12   15   18
   rotated 2:  15   18   2    3    6    12
                         ▲
                    the minimum sits at index 2  →  k = 2

   Rotating right k times moves the smallest element to index k.
   So:   k = index of the minimum
```

### The predicate: compare with the LAST element

```
   arr:          15   18    2    3    6   12
   arr[i] ≤ 12:   F    F    T    T    T    T
                            ▲ first TRUE = minimum

   Left part  (before the drop): all > last element
   Right part (after the drop):  all ≤ last element
   → monotonic F...F T...T ✅
```

### Trace (arr = [15, 18, 2, 3, 6, 12], last = 12, hi = n − 1)

```
  ┌────┬────┬─────┬──────────┬──────────────────┐
  │ lo │ hi │ mid │ arr[mid] │ ≤ 12 ?           │
  ├────┼────┼─────┼──────────┼──────────────────┤
  │ 0  │ 5  │  2  │    2     │ yes → hi = 2     │
  │ 0  │ 2  │  1  │   18     │ no  → lo = 2     │
  │ 2  │ 2  │  —  │    —     │ stop → k = 2 ✅  │
  └────┴────┴─────┴──────────┴──────────────────┘

  arr = [7, 9, 11, 12, 5]:  mid=2 (11 ≤ 5? no) lo=3 → mid=3 (12? no) lo=4 → k = 4 ✅
  arr = [1, 2, 3] (no rotation): mid=1 yes hi=1 → mid=0 yes hi=0 → k = 0 ✅
```

> Here `hi = n − 1` is fine: the minimum always exists, so the answer is never "past the end".

### Pseudocode

```
function findKRotation(arr):
    lo ← 0, hi ← n − 1
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if arr[mid] ≤ arr[n − 1]:  hi ← mid     // mid is in the right (low) part
        else:                      lo ← mid + 1 // mid is in the left (high) part
    return lo
```

### 📌 Points to remember
- **Rotation count = index of the minimum.**
- Compare with the **last** element (or `arr[hi]`). Comparing with the first breaks on unrotated arrays.
- Works only with **distinct** values. With duplicates (e.g. `[2,2,2,0,2]`) the worst case is O(n).
- This is the same search as *Find Minimum in Rotated Sorted Array* (see the Classic Binary Search guide).

---

## 7. Find K Closest Elements (Medium)

### Problem
Sorted `arr`, integers `k` and `x`. Return the `k` elements closest to `x`, in sorted order.
On a tie, the **smaller** element wins.

### Visualize it

```
   arr:   1    3    5    7    9    11          k = 3, x = 8
   dist:  7    5    3    1    1    3
                    └─── window ───┘
                    [5,  7,  9]      (5 beats 11 on the tie: smaller wins)

   The answer is always a CONTIGUOUS window of size k.
   → Don't search for elements. Search for the window's LEFT EDGE.
```

### Search space: the left edge lives in [0, n − k]

```
   left edge L:   0      1      2      3        (n − k = 6 − 3 = 3)
   window:      [1 3 5][3 5 7][5 7 9][7 9 11]
```

### The decision: compare the two ends that are fighting

```
   Window starting at mid:   arr[mid] ... arr[mid+k−1]  │ arr[mid+k]
                              ▲ leftmost in              ▲ first one OUT

   Should the window slide right by one?
   Compare  x − arr[mid]     (how far the left end is)
      vs    arr[mid+k] − x   (how far the next element is)

   if  x − arr[mid] > arr[mid+k] − x   → left end is worse → answer is RIGHT of mid → lo = mid + 1
   else                                → mid is good enough (ties keep left)     → hi = mid
```

> ⚠️ Use the **signed** differences, not `abs(...)`. With `abs`, duplicates and an `x` that sits
> outside the window can make the predicate non-monotonic and give wrong answers.

### Trace (arr = [1, 3, 5, 7, 9, 11], k = 3, x = 8)

```
  ┌────┬────┬─────┬───────────────┬──────────────────┬──────────────────┐
  │ lo │ hi │ mid │ x − arr[mid]  │ arr[mid+k] − x   │ action           │
  ├────┼────┼─────┼───────────────┼──────────────────┼──────────────────┤
  │ 0  │ 3  │  1  │ 8 − 3 = 5     │ arr[4]=9 → 1     │ 5 > 1 → lo = 2   │
  │ 2  │ 3  │  2  │ 8 − 5 = 3     │ arr[5]=11 → 3    │ 3 > 3? no → hi=2 │
  │ 2  │ 2  │  —  │       —       │        —         │ stop             │
  └────┴────┴─────┴───────────────┴──────────────────┴──────────────────┘
   window starts at 2 → [5, 7, 9] ✅

  arr = [1,2,3,4,5], k = 4, x = 3:
     lo=0, hi=1, mid=0: 3−1 = 2 vs arr[4]−3 = 2 → tie → hi = 0 → [1,2,3,4] ✅
```

### Pseudocode

```
function findClosestElements(arr, k, x):
    lo ← 0
    hi ← n − k
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if x − arr[mid] > arr[mid + k] − x:
            lo ← mid + 1
        else:
            hi ← mid
    return arr[lo .. lo + k − 1]
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Sort all by distance | O(n log n) | O(n) |
| Max-heap of size k | O(n log k) | O(k) |
| Two pointers shrinking from both ends | O(n − k) | O(1) |
| lowerBound(x), then expand outward | O(log n + k) | O(1) |
| **Binary search the left edge** | **O(log(n − k) + k)** | **O(1)** ✅ |

### 📌 Points to remember
- **Search the window start, not the elements.** Range is `[0, n − k]`.
- Compare `arr[mid]` with `arr[mid + k]`, the element **just outside** the window.
- Ties go **left** (`else hi = mid`), because the smaller element wins.
- No `abs()`. Signed differences keep the predicate monotonic.

---

## 8. Time Based Key-Value Store (Medium)

### Problem
Design a store:
- `set(key, value, timestamp)` stores a value at a time.
- `get(key, timestamp)` returns the value with the **largest stored timestamp ≤ timestamp**, or `""`.

Timestamps for `set` are **strictly increasing**.

### Visualize it

```
   store["foo"] = [ (1, "bar") , (4, "bar2") ]     ← already sorted by time!

   time ──────┬──────────┬──────────────────────────►
              1          4
            "bar"      "bar2"

   get(foo, 0) → ""        nothing at or before 0
   get(foo, 3) → "bar"     latest at or before 3 is t=1
   get(foo, 4) → "bar2"    exact match
   get(foo, 9) → "bar2"
```

### The key observation

```
   Strictly increasing timestamps  →  every key's list is SORTED for free
                                   →  append on set, binary search on get

   "largest timestamp ≤ t"  =  FLOOR of t  =  upperBound(t) − 1
```

### Data layout

```
   ┌──────────┐     ┌────────────────────────────────────────┐
   │  "foo"   │ ──► │ (1,"bar") (4,"bar2") (7,"x") (10,"y")  │
   ├──────────┤     └────────────────────────────────────────┘
   │  "baz"   │ ──► │ (2,"a") (5,"b") │
   └──────────┘     └─────────────────┘
     hash map          sorted list per key
```

### Trace: `get("foo", 8)` on timestamps [1, 4, 7, 10]

```
  upperBound(8): first timestamp > 8
  ┌────┬────┬─────┬────────┬──────────────────┐
  │ lo │ hi │ mid │ ts[mid]│ > 8 ?            │
  ├────┼────┼─────┼────────┼──────────────────┤
  │ 0  │ 4  │  2  │   7    │ no  → lo = 3     │
  │ 3  │ 4  │  3  │  10    │ yes → hi = 3     │
  │ 3  │ 3  │  —  │   —    │ stop             │
  └────┴────┴─────┴────────┴──────────────────┘
   index = 3 − 1 = 2 → timestamp 7 → "x" ✅

  get("foo", 0): upperBound = 0 → index −1 → "" ✅
```

### Pseudocode

```
store ← empty map from key → list of (timestamp, value)

function set(key, value, timestamp):
    append (timestamp, value) to store[key]       // stays sorted

function get(key, timestamp):
    if key not in store: return ""
    list ← store[key]
    i ← upperBound(timestamps of list, timestamp) − 1
    if i < 0: return ""
    return list[i].value
```

### Complexity

| Operation | Time |
|---|---|
| `set` | O(1) |
| `get` | O(log m), m = entries for that key |

### 📌 Points to remember
- "Latest at or before t" is a **floor** query → `upperBound − 1`.
- Strictly increasing timestamps mean **appending keeps the list sorted**. No sorting needed.
- Handle both "missing key" and "t earlier than every timestamp".
- If timestamps were NOT increasing, you'd need a sorted map / balanced tree instead.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────────┬────────────────┐
│ Problem                  │ Core idea                                │ Post-process   │
├──────────────────────────┼──────────────────────────────────────────┼────────────────┤
│ Ceiling                  │ lowerBound(x)                            │ == n → −1      │
│ Floor                    │ upperBound(x) − 1                        │ −1 → none      │
│ Smallest Letter Greater  │ upperBound(target)                       │ i mod n (wrap) │
│ First & Last Position    │ lowerBound, upperBound − 1               │ check == x     │
│ Count Occurrences        │ upperBound − lowerBound                  │ none           │
│ Kth Rotation             │ first i with arr[i] ≤ arr[n−1]           │ none           │
│ K Closest Elements       │ search window start in [0, n−k]          │ slice k items  │
│ Time Based KV Store      │ per-key sorted list, upperBound − 1      │ < 0 → ""       │
└──────────────────────────┴──────────────────────────────────────────┴────────────────┘
       All: O(log n) per query, O(1) extra space (KV store: O(total entries))
```

### Pattern family tree

```
                         FIND THE FIRST TRUE
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
   lowerBound (≥ x)        upperBound (> x)         CUSTOM PREDICATE
        │                        │                         │
   ├─ Ceiling              ├─ Floor (−1)             ├─ Kth Rotation
   ├─ First position       ├─ Last position (−1)     │   (arr[i] ≤ last)
   └─ Count (as lower)     ├─ Smallest Letter        └─ K Closest
                           ├─ Count (as upper)           (window start)
                           └─ Time Based KV (−1)
```

### The ≥ vs > decision card

```
   ┌──────────────────────────────┬──────────────┬──────────────────┐
   │ The question says...         │ Use          │ Then             │
   ├──────────────────────────────┼──────────────┼──────────────────┤
   │ "≥ x", "at least", "ceiling" │ lowerBound   │ as is            │
   │ "> x", "strictly greater"    │ upperBound   │ as is            │
   │ "≤ x", "at most", "floor"    │ upperBound   │ − 1              │
   │ "< x", "strictly smaller"    │ lowerBound   │ − 1              │
   │ "first occurrence"           │ lowerBound   │ verify == x      │
   │ "last occurrence"            │ upperBound   │ − 1, verify == x │
   │ "how many"                   │ both         │ upper − lower    │
   └──────────────────────────────┴──────────────┴──────────────────┘
```

### Template checklist

```
  ☐ Can the answer be "past the end"?            → hi = n  (Template A)
  ☐ Predicate is F F F T T T (monotonic)?         → safe to binary search
  ☐ mid computed as lo + (hi − lo) / 2?           → no overflow
  ☐ "pred true" branch keeps mid (hi = mid)?      → don't skip the answer
  ☐ "pred false" branch moves past mid (lo = mid+1)? → no infinite loop
  ☐ Result could be n or −1?                      → guard before indexing
  ☐ Target might be missing?                      → verify arr[i] == x
```

### 🚩 Common bugs to avoid

```
  ✗ hi = n − 1 when the answer can be n (insert at end, no ceiling)
  ✗ Reading arr[i] when i == n
  ✗ Using lowerBound for "strictly greater" (Smallest Letter)
  ✗ First/Last: finding one match then walking outward → O(n)
  ✗ Kth Rotation: comparing with arr[0] instead of the last element
  ✗ K Closest: using abs(), or searching [0, n−1] instead of [0, n−k]
  ✗ KV Store: forgetting the "timestamp earlier than all" case → index −1
  ✗ Mixing templates: "lo < hi" with "hi = mid − 1" → skips answers
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What yes/no question is FALSE, FALSE, ..., then TRUE,  ║
   ║   TRUE, ... across the array, and is my answer the       ║
   ║   first TRUE or the last FALSE?"                         ║
   ╚══════════════════════════════════════════════════════════╝
     First TRUE → return lo.   Last FALSE → return lo − 1.
```

---

### ✅ Progress tracker

- [ ] Ceiling in a Sorted Array (Easy)
- [ ] Floor in a Sorted Array (Easy)
- [ ] Find Smallest Letter Greater Than Target (Easy)
- [ ] Find First and Last Position of Element (Medium)
- [ ] Count Occurrences in Sorted Array (Easy)
- [ ] Find Kth Rotation (Easy)
- [ ] Find K Closest Elements (Medium)
- [ ] Time Based Key-Value Store (Medium)
