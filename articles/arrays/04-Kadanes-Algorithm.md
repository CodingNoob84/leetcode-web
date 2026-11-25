# Kadane's Algorithm: A Visual Guide

> **Goal:** Learn to *see* "best subarray" problems, run Kadane's algorithm by hand, and adapt it
> to absolute sums, products, and circular arrays.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Kadane is a tiny 1D DP, so see also [../dynammic programming/01-1D-Linear-DP.md](../dynammic%20programming/01-1D-Linear-DP.md).

---

## Table of Contents

0. [The Big Idea: Extend or Restart](#0-the-big-idea-extend-or-restart)
1. [Maximum Subarray (Medium)](#1-maximum-subarray-medium)
2. [Maximum Absolute Sum of Any Subarray (Medium)](#2-maximum-absolute-sum-of-any-subarray-medium)
3. [Maximum Product Subarray (Medium)](#3-maximum-product-subarray-medium)
4. [Maximum Sum Circular Subarray (Medium)](#4-maximum-sum-circular-subarray-medium)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Maximum Subarray → Maximum Absolute Sum → Maximum Product → Circular.
> Each one adds exactly one twist: first a **min** version, then a **sign flip**, then a **wrap-around**.

---

## 0. The Big Idea: Extend or Restart

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "KADANE"                                │
├──────────────────────────────────────────────────────────────────┤
│  • "Maximum / minimum SUM of a (contiguous) SUBARRAY"            │
│  • "Maximum PRODUCT of a subarray"                               │
│  • "Circular array", "wraps around"                              │
│  • Array has NEGATIVE numbers (otherwise just take everything)   │
│  • You need ONE best subarray, not a count of them               │
└──────────────────────────────────────────────────────────────────┘

  ⚠ "COUNT subarrays with sum = k"  → that's PREFIX SUM + hashmap, not Kadane.
  ⚠ "Subarray with sum ≤ k, all positive" → that's SLIDING WINDOW.
```

### Kadane is 1D DP in disguise

```
  STATE:       cur[i] = best sum of a subarray that ENDS EXACTLY at index i
  TRANSITION:  cur[i] = max( a[i] ,  cur[i-1] + a[i] )
                              ▲            ▲
                          RESTART       EXTEND
                       (start fresh   (glue a[i] onto the
                        at i)          best chain ending at i-1)
  ANSWER:      best = max over all cur[i]

  It's the "ENDING AT i" flavor from the 1D DP guide → answer = max over all i.
```

### The decision at every index, as a picture

```
            ... ─── best chain ending at i-1 ───┐
                       (sum = cur)              │
                                                ▼
                                              [ a[i] ]
                                                │
                  ┌─────────────────────────────┴─────────────────────────┐
         cur + a[i]  >  a[i] ?                                    otherwise
         (old chain is a GIFT, cur > 0)                (old chain is a BURDEN, cur ≤ 0)
                  │                                                       │
              EXTEND                                                  RESTART
         chain grows by one                                   drop everything, start at i

  Rule of thumb: "If what I'm carrying is negative, drop it."
```

### The running table (how every trace in this guide looks)

```
  index        :   0    1    2   ...
  a            :   x    y    z
  cur (ending) :   .    .    .      ← best subarray ENDING here
  best (so far):   .    .    .      ← best seen anywhere so far
  action       :      E/R  E/R      ← Extend or Restart
```

### ⚠ The all-negative trap

```
  a = [-3, -1, -2]

  WRONG: cur = 0, best = 0 at start
         → best stays 0 → returns 0 (the EMPTY subarray!) ✗

  RIGHT: cur = a[0], best = a[0], loop from i = 1
         → best = -1 ✓   (must pick at least one element)
```

### Tracking WHERE the best subarray is

```
  Keep: tempStart (where the current chain began), and bestL, bestR.

    on RESTART at i  → tempStart = i
    when best improves at i → bestL = tempStart, bestR = i
```

### Min-Kadane: the mirror image

```
  curMin[i] = min( a[i], curMin[i-1] + a[i] )     ← "if what I'm carrying is POSITIVE, drop it"
  worst     = min over all curMin[i]

  Used by: Maximum Absolute Sum (problem 2) and Circular (problem 4).
```

### The prefix-sum view (same answer, different lens)

```
  P[k] = sum of the first k numbers  (P[0] = 0)
  sum(a[i..j]) = P[j+1] − P[i]

  Max subarray  = max over j of ( P[j] − min of the P's BEFORE j )
                   "sell high after buying low", like the stock problem!

     P ▲
       │            ●  ← highest point AFTER the lowest
       │       ●   ╱
       │  ●   ╱ ╲ ╱
       │   ╲ ╱   ●
       │    ●  ← lowest point
       └──────────────────► k
       answer = that vertical gap
```

> 💡 Link: this is exactly **Best Time to Buy and Sell Stock** on the prefix-sum array.

### The universal template

```
function kadane(a):
    cur  ← a[0]
    best ← a[0]
    for i from 1 to n-1:
        cur  ← max(a[i], cur + a[i])     // extend or restart
        best ← max(best, cur)
    return best
```

---

## 1. Maximum Subarray (Medium)

### Problem
Find the contiguous subarray (at least one number) with the **largest sum**. Return the sum.

### Visualize it

```
  index:   0    1    2    3    4    5    6    7    8
  a    :  -2    1   -3    4   -1    2    1   -5    4
                          └────────────────┘
                           [4, -1, 2, 1] = 6  ✅
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `cur` = best sum of a subarray ending at `i` |
| Transition | `cur = max(a[i], cur + a[i])` |
| Base | `cur = best = a[0]` |
| Order | left → right |
| Answer | `best` (max over all positions) |

### Trace

```
  i      :    0     1     2     3     4     5     6     7     8
  a      :   -2     1    -3     4    -1     2     1    -5     4
  cur    :   -2     1    -2     4     3     5     6     1     5
  best   :   -2     1     1     4     4     5     6     6     6
  action :   init   R     E     R     E     E     E     E     E

  i=1: max(1, -2+1 = -1)  = 1   → RESTART (carrying -2 is a burden)
  i=2: max(-3, 1-3 = -2)  = -2  → extend (still better than -3 alone)
  i=3: max(4, -2+4 = 2)   = 4   → RESTART (carrying -2 is a burden)
  i=4: max(-1, 4-1 = 3)   = 3   → extend
  i=5: max(2, 3+2 = 5)    = 5   → extend
  i=6: max(1, 5+1 = 6)    = 6   → extend  ← best becomes 6
  i=7: max(-5, 6-5 = 1)   = 1   → extend
  i=8: max(4, 1+4 = 5)    = 5   → extend

  answer = 6 ✅
```

### Recovering the subarray

```
  i      :   0    1    2    3    4    5    6    7    8
  restart:   ✓    ✓         ✓                            tempStart: 0 → 1 → 3
  best ↑ :   ✓    ✓         ✓         ✓    ✓             at i=6: bestL = 3, bestR = 6

  subarray = a[3..6] = [4, -1, 2, 1] ✅
```

### Same answer via prefix sums

```
  k  :   0    1    2    3    4    5    6    7    8    9
  P  :   0   -2   -1   -4    0   -1    1    2   -3    1
                        ▲                   ▲
                    min = -4             max after it = 2
                    (k = 3)              (k = 7)

  answer = 2 − (−4) = 6  → subarray a[3..6] ✅
```

### Pseudocode (with indices)

```
function maxSubArray(a):
    cur ← a[0], best ← a[0]
    tempStart ← 0, bestL ← 0, bestR ← 0
    for i from 1 to n-1:
        if a[i] > cur + a[i]:          // i.e. cur < 0 → restart
            cur ← a[i]
            tempStart ← i
        else:
            cur ← cur + a[i]
        if cur > best:
            best ← cur
            bestL ← tempStart, bestR ← i
    return best   (and a[bestL..bestR])
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every (i, j), sum each | O(n³) | O(1) |
| Every (i, j) with running sum | O(n²) | O(1) |
| Divide & conquer (left / right / crossing middle) | O(n log n) | O(log n) |
| **Kadane** | **O(n)** | **O(1)** ✅ |

> **Divide & conquer (the LeetCode follow-up):** the best subarray is either fully in the left half,
> fully in the right half, or **crosses the middle**. The crossing one = best suffix of the left + best prefix of the right.

### 📌 Points to remember
- Start from `a[0]`, never from 0. Otherwise an all-negative array returns 0.
- "Extend or restart" is the whole algorithm. Restart exactly when the carried sum is negative.
- Answer is the max **over all positions**, not `cur` at the end.

---

## 2. Maximum Absolute Sum of Any Subarray (Medium)

### Problem
Return the maximum of `|sum(subarray)|` over all subarrays (the empty subarray counts, with sum 0).

### Visualize it

```
  The biggest |sum| is either:
     • a very POSITIVE subarray   → max-Kadane
     • a very NEGATIVE subarray   → min-Kadane, then take its absolute value

       +  ▲  max subarray sum
          │
       0 ─┼──────────────────
          │
       −  ▼  min subarray sum

   answer = max( maxSum, |minSum| )
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `curMax` and `curMin` = best/worst sum ending at `i` |
| Transition | `curMax = max(a[i], curMax + a[i])`, `curMin = min(a[i], curMin + a[i])` |
| Base | both start at `a[0]` (or 0 — empty subarray is allowed here) |
| Order | left → right, one pass for both |
| Answer | `max(bestMax, −bestMin)` |

### Trace 1 (a = [1, -3, 2, 3, -4])

```
  i       :   0     1     2     3     4
  a       :   1    -3     2     3    -4
  curMax  :   1    -2     2     5     1
  bestMax :   1     1     2     5     5
  curMin  :   1    -3    -1     2    -4
  bestMin :   1    -3    -3    -3    -4

  answer = max(5, |−4|) = 5 ✅     (subarray [2, 3])
```

### Trace 2 (a = [2, -5, 1, -4, 3, -2])

```
  i       :   0     1     2     3     4     5
  a       :   2    -5     1    -4     3    -2
  curMax  :   2    -3     1    -3     3     1
  bestMax :   2     2     2     2     3     3
  curMin  :   2    -5    -4    -8    -5    -7
  bestMin :   2    -5    -5    -8    -8    -8

  answer = max(3, |−8|) = 8 ✅     (subarray [-5, 1, -4])
```

### The prefix-sum shortcut (beautiful one-liner)

```
  |sum(a[i..j])| = |P[j+1] − P[i]|  →  maximized by the two extreme prefix values!
  The order doesn't matter because of the absolute value.

  Trace 2:  P = 0, 2, -3, -2, -6, -3, -5
            max P = 2,  min P = -6

  answer = max P − min P = 2 − (−6) = 8 ✅

  Trace 1:  P = 0, 1, -2, 0, 3, -1  →  3 − (−2) = 5 ✅
```

### Pseudocode

```
function maxAbsoluteSum(a):
    curMax ← 0, curMin ← 0, best ← 0          // empty subarray allowed
    for each x in a:
        curMax ← max(x, curMax + x)
        curMin ← min(x, curMin + x)
        best   ← max(best, curMax, −curMin)
    return best

// or, prefix-sum version:
function maxAbsoluteSumPrefix(a):
    P ← 0, hi ← 0, lo ← 0
    for each x in a:
        P  ← P + x
        hi ← max(hi, P)
        lo ← min(lo, P)
    return hi − lo
```

### 📌 Points to remember
- Run **max and min Kadane in the same loop**.
- Absolute value means "most extreme in either direction".
- Prefix view: `max P − min P` (include `P = 0`). No ordering needed because of `| |`.

---

## 3. Maximum Product Subarray (Medium)

### Problem
Find the contiguous subarray with the **largest product**.

### Why plain Kadane breaks

```
  Sums:      a negative number always makes things WORSE.
  Products:  a negative number FLIPS the sign:

       big positive  × negative  →  big NEGATIVE     (worst!)
       big negative  × negative  →  big POSITIVE     (best!)

  So yesterday's WORST can become today's BEST.
  → track BOTH curMax and curMin at every index.

        curMax ──┐                ┌──► new curMax
                 ├── × a[i] ──────┤
        curMin ──┘   (a[i] < 0     └──► new curMin
                      swaps them)
```

### The transition: three candidates

```
  candidates = { a[i],  curMax × a[i],  curMin × a[i] }
                  ▲          ▲                ▲
              restart   extend the best   extend the worst
                                          (pays off if a[i] < 0)

  newMax = max(candidates)
  newMin = min(candidates)
  ⚠ compute both from the OLD curMax/curMin (use temporaries)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `curMax`, `curMin` = largest / smallest product ending at `i` |
| Transition | max / min of `{a[i], curMax·a[i], curMin·a[i]}` |
| Base | `curMax = curMin = best = a[0]` |
| Order | left → right |
| Answer | `best` |

### Trace 1 (a = [2, 3, -2, 4])

```
  i       :   0      1       2       3
  a       :   2      3      -2       4
  cands   :   —    3,6,6  -2,-12,-6  4,-8,-48
  curMax  :   2      6      -2       4
  curMin  :   2      3     -12     -48
  best    :   2      6       6       6

  answer = 6 ✅   (subarray [2, 3])
```

### Trace 2 (a = [-2, 0, -1]): zeros reset everything

```
  i       :   0      1       2
  a       :  -2      0      -1
  cands   :   —    0,0,0   -1,0,0
  curMax  :  -2      0       0
  curMin  :  -2      0      -1
  best    :  -2      0       0

  answer = 0 ✅   (a zero wipes out both chains; the "restart" candidate takes over)
```

### Trace 3 (a = [-2, 3, -4]): two negatives make a positive

```
  i       :   0       1         2
  a       :  -2       3        -4
  cands   :   —    3,-6,-6   -4,-12,24
  curMax  :  -2       3        24      ← curMin (-6) × (-4) = 24 !!
  curMin  :  -2      -6       -12
  best    :  -2       3        24

  answer = 24 ✅   (whole array: -2 × 3 × -4)
```

### Pseudocode

```
function maxProduct(a):
    curMax ← a[0], curMin ← a[0], best ← a[0]
    for i from 1 to n-1:
        x ← a[i]
        c1 ← x
        c2 ← curMax × x
        c3 ← curMin × x
        curMax ← max(c1, c2, c3)
        curMin ← min(c1, c2, c3)        // uses OLD values via c2, c3
        best   ← max(best, curMax)
    return best
```

### Alternative: prefix & suffix products

```
  Between zeros, the best product is a PREFIX or a SUFFIX of that segment
  (if the count of negatives is odd, drop everything up to the first
   negative OR from the last negative onward).

  Scan left→right and right→left with running products,
  resetting to 1 after a zero; answer = max seen in either scan.

  [-2, 3, -4]:  L→R: -2, -6, 24      R→L: -4, -12, 24     → 24 ✅
```

### 📌 Points to remember
- **Track min too.** A negative turns the min into the max.
- Compute new max and min from the **old** values (temporaries!).
- Zero resets both chains. The `a[i]` candidate handles that automatically.
- Watch for overflow in other languages; products grow fast.

---

## 4. Maximum Sum Circular Subarray (Medium)

### Problem
The array is circular (the end connects to the start). Find the max subarray sum; each element is used at most once.

### Visualize it: two kinds of answers

```
  CASE 1: normal (no wrap)            CASE 2: wraps around the end

  [ .  . ████████  .  . ]             [ ████  .  .  .  .  ████ ]
         └─ best ─┘                     └┬─┘   └─ gap ─┘  └┬─┘
                                         └──── best ───────┘

  CASE 2 trick:  wrapped part = TOTAL − (the middle gap)
                 To MAXIMIZE the wrapped part, MINIMIZE the gap!
                 gap = minimum subarray (min-Kadane)

  ┌────────────────────────────────────────────────────────┐
  │  answer = max( maxSubarray ,  total − minSubarray )    │
  │  EXCEPT when all numbers are negative → maxSubarray    │
  └────────────────────────────────────────────────────────┘
```

### Why the exception?

```
  If every number is negative, the min subarray is the WHOLE array:
       total − minSubarray = total − total = 0
  That 0 means "take nothing" (empty subarray), which isn't allowed.

  Detect it:  maxSubarray < 0  →  all negative  →  return maxSubarray
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `curMax`, `curMin` (sum ending at `i`), plus `total` |
| Transition | regular max-Kadane and min-Kadane in one pass |
| Base | all start at `a[0]` |
| Order | left → right |
| Answer | `maxSub < 0 ? maxSub : max(maxSub, total − minSub)` |

### Trace 1 (a = [1, -2, 3, -2])

```
  i       :   0     1     2     3
  a       :   1    -2     3    -2
  curMax  :   1    -1     3     1        maxSub = 3
  curMin  :   1    -2     1    -2        minSub = -2
  total = 0

  CASE 1 = 3      CASE 2 = 0 − (−2) = 2
  answer = max(3, 2) = 3 ✅   (just [3])
```

### Trace 2 (a = [5, -3, 5]): wrap wins

```
  i       :   0     1     2
  a       :   5    -3     5
  curMax  :   5     2     7        maxSub = 7
  curMin  :   5    -3     2        minSub = -3
  total = 7

  CASE 1 = 7      CASE 2 = 7 − (−3) = 10
  answer = 10 ✅

        ┌───┐       ┌───┐
     ┌─►│ 5 │  -3   │ 5 │──┐       take 5 (end) + 5 (start),
     │  └───┘ (gap) └───┘  │       skip the -3 gap in the middle
     └─────── wraps ───────┘
```

### Trace 3 (a = [-3, -2, -3]): all negative

```
  i       :   0     1     2
  a       :  -3    -2    -3
  curMax  :  -3    -2    -3        maxSub = -2
  curMin  :  -3    -5    -8        minSub = -8
  total = -8

  CASE 2 = -8 − (−8) = 0   ← fake (empty subarray)
  maxSub < 0  →  answer = -2 ✅
```

### Pseudocode

```
function maxSubarraySumCircular(a):
    curMax ← a[0], maxSub ← a[0]
    curMin ← a[0], minSub ← a[0]
    total  ← a[0]
    for i from 1 to n-1:
        x ← a[i]
        curMax ← max(x, curMax + x);   maxSub ← max(maxSub, curMax)
        curMin ← min(x, curMin + x);   minSub ← min(minSub, curMin)
        total  ← total + x
    if maxSub < 0: return maxSub          // all negative
    return max(maxSub, total − minSub)
```

### Alternative: doubled array + monotonic deque

```
  Write the array twice: [5, -3, 5, 5, -3, 5]
  Any circular subarray = a window of length ≤ n in the doubled array.
  Use prefix sums + a monotonic deque of min prefixes within the last n.
  O(n) too, but more machinery. The total − min trick is simpler.
```

### 📌 Points to remember
- Wrapped answer = **total − minimum subarray**.
- **All-negative check** (`maxSub < 0`) or you'll return 0.
- One pass computes max-Kadane, min-Kadane, and total together.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌──────────────────────────────┬──────────────────────────────────────────────┬──────────────────────────────┐
│ Problem                      │ Core idea                                    │ Watch out for                │
├──────────────────────────────┼──────────────────────────────────────────────┼──────────────────────────────┤
│ Maximum Subarray             │ cur = max(x, cur + x); best = max(best, cur) │ init with a[0], not 0        │
│ Max Absolute Sum             │ max(maxKadane, −minKadane) = maxP − minP     │ include P = 0                │
│ Maximum Product Subarray     │ track curMax AND curMin; 3 candidates        │ use OLD values; zeros        │
│ Max Sum Circular Subarray    │ max(maxSub, total − minSub)                  │ all negative → maxSub        │
└──────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────┘
   All:  O(n) time, O(1) space
```

### Family tree

```
                       KADANE  (extend or restart)
                                │
       ┌────────────────────────┼─────────────────────────┐
       │                        │                         │
   MAX version              MIN version             SIGN-FLIP version
   (Maximum Subarray)           │                   (track max & min)
       │                        │                         │
       │            ┌───────────┴───────────┐             └─ Maximum Product
       │            │                       │
       │    Max Absolute Sum       Circular: total − minSub
       │    (max & min together)
       │
   prefix-sum view: max P[j] − min P[i<j]  (= Best Time to Buy & Sell Stock)
```

### Kadane vs. its neighbors

```
   ┌──────────────────────────────────────┬───────────────────────────┐
   │ Question                             │ Pattern                   │
   ├──────────────────────────────────────┼───────────────────────────┤
   │ BEST (max/min) subarray sum/product  │ Kadane                    │
   │ COUNT subarrays with sum = k         │ Prefix sum + hashmap      │
   │ Longest/shortest window, all ≥ 0     │ Sliding window            │
   │ Best subarray with length ≤ k        │ Prefix sum + mono deque   │
   │ Pick NON-adjacent elements           │ House Robber (1D DP)      │
   └──────────────────────────────────────┴───────────────────────────┘
```

### 🚩 Common bugs to avoid

```
  ✗ Initializing cur/best with 0 → wrong on all-negative arrays
  ✗ Returning cur at the end instead of best
  ✗ Product: updating curMax, then using the NEW curMax to compute curMin
  ✗ Product: forgetting that curMin × negative can become the new max
  ✗ Circular: missing the all-negative case (returns 0)
  ✗ Circular: thinking you need to try every rotation (O(n²))
  ✗ Abs sum: forgetting P = 0 as a valid prefix
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Is the chain I'm carrying helping or hurting?          ║
   ║   If it hurts, drop it and restart here."                ║
   ╚══════════════════════════════════════════════════════════╝
     For products, ask it about BOTH the best and the worst chain.
```

---

### ✅ Progress tracker

- [ ] Maximum Subarray (Medium)
- [ ] Maximum Absolute Sum of Any Subarray (Medium)
- [ ] Maximum Product Subarray (Medium)
- [ ] Maximum Sum Circular Subarray (Medium)
