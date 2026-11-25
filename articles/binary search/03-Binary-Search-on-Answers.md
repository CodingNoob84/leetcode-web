# Binary Search on Answers: A Visual Guide

> **Goal:** Learn to spot "search the answer, not the array" problems, write the yes/no check, and pick the right template.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Searching the Answer Space](#0-the-big-idea-searching-the-answer-space)
1. [Koko Eating Bananas (Medium)](#1-koko-eating-bananas-medium)
2. [Capacity To Ship Packages Within D Days (Medium)](#2-capacity-to-ship-packages-within-d-days-medium)
3. [Minimum Speed to Arrive on Time (Medium)](#3-minimum-speed-to-arrive-on-time-medium)
4. [Minimum Days to Make M Bouquets (Medium)](#4-minimum-days-to-make-m-bouquets-medium)
5. [Split Array Largest Sum (Hard)](#5-split-array-largest-sum-hard)
6. [Allocate Minimum Number of Pages (Medium)](#6-allocate-minimum-number-of-pages-medium)
7. [Aggressive Cows (Medium)](#7-aggressive-cows-medium)
8. [Magnetic Force Between Two Balls (Medium)](#8-magnetic-force-between-two-balls-medium)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** Koko → Ship Packages → Min Speed → Bouquets → Split Array → Allocate Pages
> → Aggressive Cows → Magnetic Force.
> The first six **minimize** a value. The last two **maximize** one. Each pair below is a near-twin.

---

## 0. The Big Idea: Searching the Answer Space

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BINARY SEARCH ON ANSWERS"              │
├──────────────────────────────────────────────────────────────────┤
│  • "MINIMIZE the MAXIMUM ..."  (largest sum, max pages, ...)     │
│  • "MAXIMIZE the MINIMUM ..."  (smallest gap, min distance, ...) │
│  • "Smallest speed / capacity / days SUCH THAT ..."              │
│  • Checking ONE candidate answer is easy (a greedy pass)         │
│  • Finding the answer directly is hard                           │
│  • Constraints are huge (answer up to 10^9) → can't try all      │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: the answer line is sorted by "yes / no"

```
  The array may NOT be sorted. But the ANSWERS are.

  Koko's speed:   1    2    3    4    5    6    7    8   ...
  finishes?      NO   NO   NO   YES  YES  YES  YES  YES
                 ───────────────┤►──────────────────────
                                 ▲
                      first YES = the answer

  Why monotonic? If speed 4 works, speed 5 surely works too.
  Faster never hurts → once YES, always YES.

  ┌──────────────────────────────────────────────────────────────┐
  │ Binary search finds the BOUNDARY between NO and YES          │
  │ in O(log(range)) checks instead of trying every value.       │
  └──────────────────────────────────────────────────────────────┘
```

### The two shapes

```
   MIN-FEASIBLE  ("smallest x that works")
   NO  NO  NO  NO  YES YES YES YES
                   ▲ answer = FIRST yes
   Koko, Ship, Speed, Bouquets, Split Array, Pages

   MAX-FEASIBLE  ("largest x that works")
   YES YES YES YES NO  NO  NO  NO
                ▲ answer = LAST yes
   Aggressive Cows, Magnetic Force
   (a bigger gap is HARDER to achieve, so YES comes first)
```

### The 3-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  PICK THE RANGE [lo, hi]                               │
 │         lo = the smallest answer that could POSSIBLY work      │
 │         hi = an answer that SURELY works                      │
 │         (e.g. ship capacity: lo = heaviest box, hi = all boxes)│
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 2  WRITE feasible(x)  → YES / NO                         │
 │         Almost always a single GREEDY left-to-right pass.     │
 │         "With limit x, how many days/pieces/cows do I use?"   │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 3  CHOOSE THE DIRECTION                                  │
 │         minimize → find FIRST yes   (min template)            │
 │         maximize → find LAST yes    (max template)            │
 └───────────────────────────────────────────────────────────────┘
```

### The two templates side by side

```
  MIN TEMPLATE (first YES)               MAX TEMPLATE (last YES)
  ───────────────────────────            ───────────────────────────
  while lo < hi:                         while lo < hi:
      mid ← lo + (hi − lo) / 2               mid ← lo + (hi − lo + 1) / 2   ← round UP!
      if feasible(mid):                      if feasible(mid):
          hi ← mid      // mid may be it         lo ← mid      // mid may be it
      else:                                  else:
          lo ← mid + 1                           hi ← mid − 1
  return lo                              return lo

  Picture:                               Picture:
  NO NO NO [YES] YES YES                 YES YES [YES] NO NO NO
       lo──►◄──hi                             lo──►◄──hi
```

> ⚠️ **Why round up in the MAX template?** With `lo = 3, hi = 4`, rounding down gives `mid = 3`.
> If 3 is feasible, `lo ← 3` again, and the loop never ends. Rounding up gives `mid = 4`, so progress is guaranteed.

### Overflow notes ⚠️

```
  • mid:              lo + (hi − lo) / 2       never (lo + hi) / 2
  • Koko hours:       Σ ceil(pile / k) can reach 10^4 · 10^9 = 10^13  → 64-bit
  • Bouquets:         m · k can reach 10^6 · 10^5 = 10^11             → 64-bit
  • Pages / Split:    sum of all values can exceed 2^31               → 64-bit
  • ceil(a / b) without floats:  (a + b − 1) / b
  • Speed problem:    hour is a DECIMAL → compare carefully (see §3)
```

---

## 1. Koko Eating Bananas (Medium)

### Problem
`piles[i]` bananas in each pile. Koko picks a speed `k` (bananas/hour). Each hour she eats from **one** pile; if it has fewer than `k`, she finishes it and waits.
Find the **minimum k** to finish all piles within `h` hours.

### Visualize it

```
   piles:  [ 3 ]  [ 6 ]  [ 7 ]  [ 11 ]        h = 8 hours

   speed k = 4:
   3  → ▓           1 hour  (ceil 3/4)
   6  → ▓▓          2 hours (ceil 6/4)
   7  → ▓▓          2 hours (ceil 7/4)
   11 → ▓▓▓         3 hours (ceil 11/4)
                    ───────
                    8 hours ≤ 8 ✅
```

### Feasibility check

```
   hoursNeeded(k) = Σ ceil(pile / k)

   feasible(k) = hoursNeeded(k) ≤ h

   k :     1    2    3    4    5    6   ...  11
   hours: 27   15   10    8    8    6   ...   4
   ok?    NO   NO   NO   YES  YES  YES  ...  YES
                          ▲ first YES = 4
```

### Range

| Bound | Value | Why |
|---|---|---|
| lo | 1 | slowest possible speed |
| hi | max(piles) = 11 | at this speed each pile takes exactly 1 hour; faster is pointless |

### Trace (min template)

| lo | hi | mid | hours(mid) | feasible? | action |
|---|---|---|---|---|---|
| 1 | 11 | 6 | 1+1+2+2 = 6 | ✅ | hi = 6 |
| 1 | 6 | 3 | 1+2+3+4 = 10 | ❌ | lo = 4 |
| 4 | 6 | 5 | 1+2+2+3 = 8 | ✅ | hi = 5 |
| 4 | 5 | 4 | 1+2+2+3 = 8 | ✅ | hi = 4 |
| 4 | 4 | — | — | — | **return 4** ✅ |

### Pseudocode

```
function minEatingSpeed(piles, h):
    lo ← 1, hi ← max(piles)
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        hours ← 0                              // 64-bit!
        for each p in piles:
            hours ← hours + (p + mid − 1) / mid
        if hours ≤ h:  hi ← mid
        else:          lo ← mid + 1
    return lo
```

### Complexity
`O(n · log(max pile))` time, `O(1)` space.

### 📌 Points to remember
- One pile per hour → `ceil(pile / k)`, not `sum / k`.
- `hi = max(piles)` is enough. `h ≥ n` is guaranteed, so this always works.
- This is the **cleanest example** of the pattern. Use it as your mental template.

---

## 2. Capacity To Ship Packages Within D Days (Medium)

### Problem
Ship packages **in order**. Each day you load packages onto the ship until the next one would exceed the capacity.
Find the **minimum capacity** to ship everything within `D` days.

### Visualize it

```
   weights: 1  2  3  4  5  6  7  8  9  10        D = 5

   capacity 15:
   day 1: [1 2 3 4 5]   = 15
   day 2: [6 7]         = 13     (+8 would be 21 > 15)
   day 3: [8]           = 8      (+9 would be 17 > 15)
   day 4: [9]           = 9
   day 5: [10]          = 10           → 5 days ✅
```

### Feasibility check: greedy filling

```
   daysNeeded(cap):
     load = 0, days = 1
     for each w:
        if load + w > cap:  start a new day (days++, load = 0)
        load += w

   ┌─────────┐┌─────────┐┌─────┐
   │ fill up ││ fill up ││ ... │   pack each day as full as possible;
   └─────────┘└─────────┘└─────┘   that minimizes the days used.
```

### Range

| Bound | Value | Why |
|---|---|---|
| lo | max(weights) = 10 | the heaviest box must fit on its own |
| hi | sum(weights) = 55 | everything in one day |

### Trace (min template)

| lo | hi | mid | days(mid) | feasible (≤ 5)? | action |
|---|---|---|---|---|---|
| 10 | 55 | 32 | [1..7] [8 9 10] = 2 | ✅ | hi = 32 |
| 10 | 32 | 21 | [1..6] [7 8] [9 10] = 3 | ✅ | hi = 21 |
| 10 | 21 | 15 | [1..5] [6 7] [8] [9] [10] = 5 | ✅ | hi = 15 |
| 10 | 15 | 12 | [1..4] [5 6] [7] [8] [9] [10] = 6 | ❌ | lo = 13 |
| 13 | 15 | 14 | [1..4] [5 6] [7] [8] [9] [10] = 6 | ❌ | lo = 15 |
| 15 | 15 | — | — | — | **return 15** ✅ |

### Pseudocode

```
function shipWithinDays(weights, D):
    lo ← max(weights), hi ← sum(weights)
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if daysNeeded(weights, mid) ≤ D:  hi ← mid
        else:                             lo ← mid + 1
    return lo

function daysNeeded(weights, cap):
    days ← 1, load ← 0
    for each w in weights:
        if load + w > cap:
            days ← days + 1
            load ← 0
        load ← load + w
    return days
```

### Complexity
`O(n · log(sum))` time, `O(1)` space.

### 📌 Points to remember
- `lo = max(weights)`, **not 1**. Otherwise a box never fits and the greedy loops forever or miscounts.
- Order is fixed → contiguous groups → greedy is optimal.
- This is the **same problem** as Split Array Largest Sum (§5): days = pieces, capacity = max piece sum.

---

## 3. Minimum Speed to Arrive on Time (Medium)

### Problem
`dist[i]` = length of train ride `i`, taken in order. Every train **departs only at an integer hour**, so after each ride (except the last) you wait until the next whole hour.
Find the minimum integer speed to arrive within `hour` (a decimal). Return `−1` if impossible. Answers never exceed `10^7`.

### Visualize it

```
   dist = [1, 3, 2],   hour = 2.7,   speed = 3

   time:  0        1        2   2.67
          ├────────┼────────┼────┤
   ride1: ▓▓▓ (0.33h) wait──┤               ceil → 1 hour
   ride2:          ▓▓▓▓▓▓▓▓ (1.0h)          ceil → 1 hour
   ride3:                   ▓▓▓▓ (0.67h)    last ride: NO rounding
                                  ▲ arrive at 2.67 ≤ 2.7 ✅
```

### Feasibility check

```
   time(s) = ceil(d₁/s) + ceil(d₂/s) + ... + ceil(d_{n−1}/s)  +  dₙ / s
             └──────────── wait to the next hour ────────────┘   └ exact ┘

   s :      1      2      3       4
   time:    6      4     2.67    2.5
   ≤ 2.7?   NO     NO    YES     YES
                         ▲ first YES = 3
```

### Range and the impossible case

| Bound | Value | Why |
|---|---|---|
| lo | 1 | speed must be a positive integer |
| hi | 10^7 | given by the problem: the answer never exceeds this |

```
  Impossible:  the first n−1 rides each take ≥ 1 full hour (after rounding),
               and the last ride takes > 0 hours.
               → if hour ≤ n − 1, return −1.
  Safe general rule: if feasible(hi) is NO, return −1.

  Example: dist = [1,3,2], hour = 1.9  → n−1 = 2 ≥ 1.9 → −1
```

### Trace (min template; range shown as [1, 10] to keep it short)

> With the real `hi = 10^7` the search takes ~24 steps but lands on the same boundary.

| lo | hi | mid | time(mid) | feasible (≤ 2.7)? | action |
|---|---|---|---|---|---|
| 1 | 10 | 5 | 1 + 1 + 0.4 = 2.4 | ✅ | hi = 5 |
| 1 | 5 | 3 | 1 + 1 + 0.67 = 2.67 | ✅ | hi = 3 |
| 1 | 3 | 2 | 1 + 2 + 1.0 = 4.0 | ❌ | lo = 3 |
| 3 | 3 | — | — | — | **return 3** ✅ |

### Pseudocode

```
function minSpeedOnTime(dist, hour):
    n ← length(dist)
    if hour ≤ n − 1: return −1
    lo ← 1, hi ← 10^7
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if travelTime(dist, mid) ≤ hour:  hi ← mid
        else:                             lo ← mid + 1
    return lo

function travelTime(dist, s):
    t ← 0
    for i from 0 to n − 2:
        t ← t + (dist[i] + s − 1) / s          // integer ceil
    t ← t + dist[n−1] / s                      // real division for the last ride
    return t
```

### Complexity
`O(n · log(10^7))` ≈ `O(24n)` time, `O(1)` space.

### 📌 Points to remember
- **Ceil every ride except the last.** This is the trap.
- `hour` has at most 2 decimals. To avoid float error, compare in hundredths (`time · 100 ≤ hour · 100` rounded), or add a tiny epsilon.
- The `−1` check comes first. `hour ≤ n − 1` can never be met by any speed.

---

## 4. Minimum Days to Make M Bouquets (Medium)

### Problem
`bloomDay[i]` = the day flower `i` blooms. A bouquet needs `k` **adjacent** bloomed flowers.
Find the minimum day you can make `m` bouquets, or `−1` if impossible.

### Visualize it

```
   bloomDay = [1, 10, 3, 10, 2],   m = 3,  k = 1

   on day 3:   ✿  ·  ✿  ·  ✿          ✿ = bloomed (bloomDay ≤ 3)
               └┘    └┘    └┘          3 bouquets of size 1 ✅
```

### Feasibility check: count runs of bloomed flowers

```
   bouquets(day):
      run = 0, count = 0
      for each flower:
         if bloomDay ≤ day:  run++;  if run == k: count++, run = 0
         else:               run = 0        ← a gap breaks adjacency

   feasible(day) = bouquets(day) ≥ m

   [7, 7, 7, 7, 12, 7, 7],  k = 3,  day = 9
    ✿  ✿  ✿  ✿  ·   ✿  ✿
    └──1──┘  ✗      └✗┘     → only 1 bouquet
```

### Range and the impossible case

| Bound | Value | Why |
|---|---|---|
| lo | min(bloomDay) | nothing blooms earlier |
| hi | max(bloomDay) | by then everything has bloomed |

```
  Impossible:  m · k > n  → not enough flowers at all → return −1.
               (m · k can overflow 32-bit!)

  Example: [1,10,3,10,2], m = 3, k = 2 → 6 > 5 → −1
```

### Trace 1: [1, 10, 3, 10, 2], m = 3, k = 1 → 3

| lo | hi | mid | bloomed | bouquets | feasible (≥ 3)? | action |
|---|---|---|---|---|---|---|
| 1 | 10 | 5 | ✿ · ✿ · ✿ | 3 | ✅ | hi = 5 |
| 1 | 5 | 3 | ✿ · ✿ · ✿ | 3 | ✅ | hi = 3 |
| 1 | 3 | 2 | ✿ · · · ✿ | 2 | ❌ | lo = 3 |
| 3 | 3 | — | — | — | — | **return 3** ✅ |

### Trace 2: [7, 7, 7, 7, 12, 7, 7], m = 2, k = 3 → 12

| lo | hi | mid | bloomed | bouquets | feasible (≥ 2)? | action |
|---|---|---|---|---|---|---|
| 7 | 12 | 9 | ✿✿✿✿·✿✿ | 1 | ❌ | lo = 10 |
| 10 | 12 | 11 | ✿✿✿✿·✿✿ | 1 | ❌ | lo = 12 |
| 12 | 12 | — | — | — | — | **return 12** ✅ |

### Pseudocode

```
function minDays(bloomDay, m, k):
    if m · k > n: return −1                       // 64-bit multiply
    lo ← min(bloomDay), hi ← max(bloomDay)
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if bouquets(bloomDay, mid, k) ≥ m:  hi ← mid
        else:                               lo ← mid + 1
    return lo

function bouquets(bloomDay, day, k):
    run ← 0, count ← 0
    for each b in bloomDay:
        if b ≤ day:
            run ← run + 1
            if run == k: count ← count + 1, run ← 0
        else:
            run ← 0
    return count
```

### Complexity
`O(n · log(max − min))` time, `O(1)` space.

### 📌 Points to remember
- Check `m · k > n` **before** searching, using 64-bit arithmetic.
- Reset `run` to 0 on a gap **and** after completing a bouquet.
- A run of 4 with `k = 3` gives **one** bouquet, not 4/3 rounded up.

---

## 5. Split Array Largest Sum (Hard)

### Problem
Split `nums` into `k` non-empty **contiguous** subarrays. Minimize the **largest** subarray sum.

### Visualize it

```
   nums = [7, 2, 5, 10, 8],   k = 2

   [7 2 5 | 10 8]   → sums 14, 18   → largest 18  ✅ best
   [7 2 5 10 | 8]   → sums 24, 8    → largest 24
   [7 | 2 5 10 8]   → sums 7, 25    → largest 25
```

### Flip the question

```
   Hard:  "What is the best way to cut?"
   Easy:  "If no piece may exceed LIMIT, how many pieces do I need?"

   pieces(limit) is a greedy pass (exactly like Ship Packages):
      keep adding to the current piece; cut when it would exceed limit.

   feasible(limit) = pieces(limit) ≤ k
   (fewer pieces is fine: you can always split a piece further, since n ≥ k)
```

### Range

| Bound | Value | Why |
|---|---|---|
| lo | max(nums) = 10 | every element sits in some piece |
| hi | sum(nums) = 32 | one single piece |

### Trace (min template)

| lo | hi | mid | greedy pieces | count | feasible (≤ 2)? | action |
|---|---|---|---|---|---|---|
| 10 | 32 | 21 | [7 2 5] [10 8] | 2 | ✅ | hi = 21 |
| 10 | 21 | 15 | [7 2 5] [10] [8] | 3 | ❌ | lo = 16 |
| 16 | 21 | 18 | [7 2 5] [10 8] | 2 | ✅ | hi = 18 |
| 16 | 18 | 17 | [7 2 5] [10] [8] | 3 | ❌ | lo = 18 |
| 18 | 18 | — | — | — | — | **return 18** ✅ |

### Pseudocode

```
function splitArray(nums, k):
    lo ← max(nums), hi ← sum(nums)
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if piecesNeeded(nums, mid) ≤ k:  hi ← mid
        else:                            lo ← mid + 1
    return lo

function piecesNeeded(nums, limit):
    pieces ← 1, curr ← 0
    for each x in nums:
        if curr + x > limit:
            pieces ← pieces + 1
            curr ← 0
        curr ← curr + x
    return pieces
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Interval / partition DP | O(k · n²) | O(k · n) |
| **Binary search on answer** | **O(n · log(sum))** | **O(1)** ✅ |

### 📌 Points to remember
- **"Minimize the maximum" over contiguous parts → this exact template.**
- Use `≤ k`, not `== k`. Fewer pieces can always be split further.
- `lo = max(nums)` makes sure no single element exceeds the limit.

---

## 6. Allocate Minimum Number of Pages (Medium)

### Problem
`pages[i]` pages in book `i`. Assign books to `m` students so that:
each student gets **at least one** book, books are **contiguous**, and every book is assigned.
Minimize the **maximum** pages any student gets. Return `−1` if `m > n`.

> This is **Split Array Largest Sum with different words**. Students = pieces, pages = values.

### Visualize it

```
   pages = [12, 34, 67, 90],   m = 2

   [12 34 67 | 90]   → 113, 90    → max 113 ✅ best
   [12 34 | 67 90]   → 46, 157    → max 157
   [12 | 34 67 90]   → 12, 191    → max 191
```

### Feasibility check

```
   students(limit) = greedy: give books to a student until the next would exceed limit
   feasible(limit) = students(limit) ≤ m

   Impossible: m > n (someone would get zero books) → −1
```

### Range

| Bound | Value | Why |
|---|---|---|
| lo | max(pages) = 90 | the biggest book must go to someone |
| hi | sum(pages) = 203 | one student reads everything |

### Trace (min template)

| lo | hi | mid | greedy groups | students | feasible (≤ 2)? | action |
|---|---|---|---|---|---|---|
| 90 | 203 | 146 | [12 34 67] [90] | 2 | ✅ | hi = 146 |
| 90 | 146 | 118 | [12 34 67] [90] | 2 | ✅ | hi = 118 |
| 90 | 118 | 104 | [12 34] [67] [90] | 3 | ❌ | lo = 105 |
| 105 | 118 | 111 | [12 34] [67] [90] | 3 | ❌ | lo = 112 |
| 112 | 118 | 115 | [12 34 67] [90] | 2 | ✅ | hi = 115 |
| 112 | 115 | 113 | [12 34 67] [90] | 2 | ✅ | hi = 113 |
| 112 | 113 | 112 | [12 34] [67] [90] | 3 | ❌ | lo = 113 |
| 113 | 113 | — | — | — | — | **return 113** ✅ |

### Pseudocode

```
function allocateBooks(pages, m):
    if m > n: return −1
    lo ← max(pages), hi ← sum(pages)                 // 64-bit sum
    while lo < hi:
        mid ← lo + (hi − lo) / 2
        if studentsNeeded(pages, mid) ≤ m:  hi ← mid
        else:                               lo ← mid + 1
    return lo

// studentsNeeded is exactly piecesNeeded from §5
```

### Complexity
`O(n · log(sum))` time, `O(1)` space.

### 📌 Points to remember
- Check `m > n → −1` first.
- Same greedy as Split Array and Ship Packages. **Three problems, one solution.**
- The answer is always an actual group sum (113 here), because it is the first limit where the greedy fits.

---

## 7. Aggressive Cows (Medium)

### Problem
`stalls[i]` = positions on a line. Place `c` cows in stalls so that the **minimum distance** between any two cows is as **large** as possible.

### Visualize it

```
   stalls (sorted):  1   2       4               8   9        c = 3

   gap = 3:  🐄──────────🐄───────────────🐄
             1           4                8       → min gap = min(3, 4) = 3 ✅

   gap = 4:  🐄────────────────────────────🐄   (next would need ≥ 12)
             1                             8      → only 2 cows ❌
```

### Direction flips: this is MAX-feasible

```
   gap:       1    2    3    4    5    6    7    8
   fits 3?   YES  YES  YES  NO   NO   NO   NO   NO
                       ▲ LAST yes = 3

   A bigger required gap is HARDER → YES comes first, then NO.
   → use the MAX template (mid rounds UP).
```

### Feasibility check: greedy placement

```
   canPlace(gap):
      place the first cow at the first stall
      for each next stall:
         if stall − lastCow ≥ gap: place a cow there
      return cowsPlaced ≥ c

   Greedy is optimal: placing each cow as early as possible
   leaves the most room for the rest.
```

### Range

| Bound | Value | Why |
|---|---|---|
| lo | 1 | positions are distinct, so a gap of 1 always works |
| hi | max − min = 8 | the widest any gap could be |

### Trace (MAX template, mid = lo + (hi − lo + 1) / 2)

| lo | hi | mid | greedy placement | cows | feasible (≥ 3)? | action |
|---|---|---|---|---|---|---|
| 1 | 8 | 5 | 1, 8 | 2 | ❌ | hi = 4 |
| 1 | 4 | 3 | 1, 4, 8 | 3 | ✅ | lo = 3 |
| 3 | 4 | 4 | 1, 8 | 2 | ❌ | hi = 3 |
| 3 | 3 | — | — | — | — | **return 3** ✅ |

### Pseudocode

```
function aggressiveCows(stalls, c):
    sort(stalls)
    lo ← 1, hi ← stalls[n−1] − stalls[0]
    while lo < hi:
        mid ← lo + (hi − lo + 1) / 2              // round UP
        if canPlace(stalls, mid, c):  lo ← mid
        else:                         hi ← mid − 1
    return lo

function canPlace(stalls, gap, c):
    count ← 1, last ← stalls[0]
    for i from 1 to n−1:
        if stalls[i] − last ≥ gap:
            count ← count + 1
            last ← stalls[i]
            if count ≥ c: return true
    return count ≥ c
```

### Complexity
`O(n log n)` sort + `O(n · log(range))` search.

### 📌 Points to remember
- **Sort first.** The greedy only works on sorted positions.
- **Maximize** → last YES → `mid` rounds **up**, `lo ← mid`.
- Tighter `hi` (optional): `(max − min) / (c − 1)`. With c cows, the min gap can't exceed the average gap.

---

## 8. Magnetic Force Between Two Balls (Medium)

### Problem
Put `m` balls into baskets at `position[i]`. The force between two balls is their distance.
Maximize the **minimum** force.

> This is **Aggressive Cows** word for word: baskets = stalls, balls = cows, force = gap.

### Visualize it

```
   position (sorted):  1  2  3  4        7        m = 3

   force 3:  ⚪─────⚪──────⚪
             1      4      7     → min force 3 ✅

   force 4:  ⚪──────────⚪       (next would need ≥ 9)
             1           7       → only 2 balls ❌
```

### Range

| Bound | Value | Why |
|---|---|---|
| lo | 1 | positions are distinct |
| hi | 7 − 1 = 6 | the widest any gap could be |

### Trace (MAX template)

| lo | hi | mid | greedy placement | balls | feasible (≥ 3)? | action |
|---|---|---|---|---|---|---|
| 1 | 6 | 4 | 1, 7 | 2 | ❌ | hi = 3 |
| 1 | 3 | 2 | 1, 3, 7 | 3 | ✅ | lo = 2 |
| 2 | 3 | 3 | 1, 4, 7 | 3 | ✅ | lo = 3 |
| 3 | 3 | — | — | — | — | **return 3** ✅ |

> Second example: `[5, 4, 3, 2, 1, 1000000000]`, m = 2 → sort → place at 1 and 10⁹ → **999999999**.

### Pseudocode

```
function maxDistance(position, m):
    sort(position)
    lo ← 1, hi ← position[n−1] − position[0]
    while lo < hi:
        mid ← lo + (hi − lo + 1) / 2
        if canPlace(position, mid, m):  lo ← mid
        else:                           hi ← mid − 1
    return lo

// canPlace is identical to Aggressive Cows
```

### Complexity
`O(n log n + n · log(range))` time, `O(1)` extra space (ignoring the sort).

### 📌 Points to remember
- LeetCode gives `position` **unsorted**. Sort it.
- Same MAX template as Aggressive Cows. If you know one, you know both.
- The greedy check can stop early once `m` balls are placed.

---

## 9. Master Cheat Sheet

### The twin-problems map

```
                     BINARY SEARCH ON ANSWERS
                                │
          ┌─────────────────────┴──────────────────────┐
          │                                            │
   MIN-FEASIBLE ("minimize the max")         MAX-FEASIBLE ("maximize the min")
   NO NO NO [YES] YES YES                    YES YES [YES] NO NO NO
   mid rounds DOWN, hi ← mid                 mid rounds UP, lo ← mid
          │                                            │
   ┌──────┴────────────────────────┐          Aggressive Cows ══ Magnetic Force
   │                               │          (place items with gap ≥ x)
 RATE / TIME                 CONTIGUOUS GROUPS
 "fast enough?"              "fits in ≤ k groups?"
   │                               │
 ├ Koko Eating Bananas       ├ Ship Packages        ┐
 ├ Min Speed to Arrive       ├ Split Array          ├ the SAME greedy
 └ Min Days for Bouquets     └ Allocate Pages       ┘
   (Koko ≈ Speed: Σ ceil)
```

### All 8 problems at a glance

```
┌──────────────────────────┬───────────────────────┬──────────────────────────────────┬──────┬──────────────┐
│ Problem                  │ Range                 │ feasible(x)                      │ Dir  │ −1 when      │
├──────────────────────────┼───────────────────────┼──────────────────────────────────┼──────┼──────────────┤
│ Koko Eating Bananas      │ [1, max]              │ Σ ceil(p/x) ≤ h                  │ MIN  │ never        │
│ Ship Packages            │ [max, sum]            │ greedy days ≤ D                  │ MIN  │ never        │
│ Min Speed Arrive on Time │ [1, 10^7]             │ Σ ceil(d/x) + last/x ≤ hour      │ MIN  │ hour ≤ n−1   │
│ Min Days M Bouquets      │ [min, max]            │ runs of k bloomed ≥ m            │ MIN  │ m·k > n      │
│ Split Array Largest Sum  │ [max, sum]            │ greedy pieces ≤ k                │ MIN  │ never        │
│ Allocate Min Pages       │ [max, sum]            │ greedy students ≤ m              │ MIN  │ m > n        │
│ Aggressive Cows          │ [1, max−min] sorted   │ greedy placed ≥ c                │ MAX  │ —            │
│ Magnetic Force           │ [1, max−min] sorted   │ greedy placed ≥ m                │ MAX  │ —            │
└──────────────────────────┴───────────────────────┴──────────────────────────────────┴──────┴──────────────┘
  All: O(n · log(range)) time, O(1) space  (+ O(n log n) sort for the last two)
```

### Template card

```
   ┌────────────────────────┬─────────────────────────┬─────────────────────────┐
   │                        │ MIN (first YES)         │ MAX (last YES)          │
   ├────────────────────────┼─────────────────────────┼─────────────────────────┤
   │ mid                    │ lo + (hi − lo) / 2      │ lo + (hi − lo + 1) / 2  │
   │ feasible(mid) is YES   │ hi ← mid                │ lo ← mid                │
   │ feasible(mid) is NO    │ lo ← mid + 1            │ hi ← mid − 1            │
   │ loop                   │ while lo < hi           │ while lo < hi           │
   │ return                 │ lo                      │ lo                      │
   └────────────────────────┴─────────────────────────┴─────────────────────────┘
```

### Checklist before you code

```
  ☐ Is feasibility MONOTONIC? (if x works, does x+1 / x−1 work too?)
  ☐ lo is the smallest POSSIBLE answer (often max element, not 1)
  ☐ hi SURELY works (sum, max, or the problem's stated bound)
  ☐ feasible(x) is one greedy O(n) pass
  ☐ MIN or MAX? → pick the template, round mid correctly
  ☐ Impossible case checked BEFORE the search (−1)
  ☐ Sums / products in 64-bit
  ☐ Positions problem? → SORT first
```

### 🚩 Common bugs to avoid

```
  ✗ lo = 1 for Ship / Split / Pages → a single item can exceed the limit
  ✗ MAX template with mid rounding down → infinite loop
  ✗ "== k" instead of "≤ k" in Split Array / Pages
  ✗ Koko: using sum/k instead of Σ ceil(pile/k)
  ✗ Speed: ceiling the LAST ride, or float comparison errors
  ✗ Bouquets: forgetting to reset the run on a gap; m·k overflow
  ✗ Cows / Balls: forgetting to sort
  ✗ (lo + hi) / 2 overflow when hi is near 2^31
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "If someone GAVE me the answer x, could I quickly       ║
   ║   check whether x is good enough?"                       ║
   ╚══════════════════════════════════════════════════════════╝
     If yes, and "good enough" only flips once as x grows,
     binary search the answer instead of computing it.
```

---

### ✅ Progress tracker

- [ ] Koko Eating Bananas (Medium)
- [ ] Capacity To Ship Packages Within D Days (Medium)
- [ ] Minimum Speed to Arrive on Time (Medium)
- [ ] Minimum Days to Make M Bouquets (Medium)
- [ ] Split Array Largest Sum (Hard)
- [ ] Allocate Minimum Number of Pages (Medium)
- [ ] Aggressive Cows (Medium)
- [ ] Magnetic Force Between Two Balls (Medium)
