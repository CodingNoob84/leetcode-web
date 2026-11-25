# Prefix Sum: A Visual Guide

> **Goal:** Learn to turn "sum of a range" questions into **one subtraction**, and combine
> prefix sums with a **hash map** to count subarrays in a single pass.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is a Prefix Sum?](#0-the-big-idea-what-is-a-prefix-sum)
1. [Range Sum Query - Immutable (Easy)](#1-range-sum-query---immutable-easy)
2. [Find Pivot Index (Easy)](#2-find-pivot-index-easy)
3. [Product of Array Except Self (Medium)](#3-product-of-array-except-self-medium)
4. [Subarray Sum Equals K (Medium)](#4-subarray-sum-equals-k-medium)
5. [Subarray Sums Divisible by K (Medium)](#5-subarray-sums-divisible-by-k-medium)
6. [Continuous Subarray Sum (Medium)](#6-continuous-subarray-sum-medium)
7. [Matrix Block Sum (Medium)](#7-matrix-block-sum-medium)
8. [Count of Range Sum (Hard)](#8-count-of-range-sum-hard)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** Range Sum Query → Pivot Index → Product Except Self → Subarray Sum = K
> → Divisible by K → Continuous Subarray Sum → Matrix Block Sum → Count of Range Sum.
> The first three build the prefix array itself. The middle three add a hash map.
> The last two go to 2D and to sorted counting.

---

## 0. The Big Idea: What Is a Prefix Sum?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "PREFIX SUM"                            │
├──────────────────────────────────────────────────────────────────┤
│  • "Sum of elements from i to j" asked MANY times                │
│  • "Count subarrays whose sum is k / divisible by k / in range"  │
│  • "Left side equals right side" (pivot / equilibrium)           │
│  • Array may contain NEGATIVE numbers (sliding window breaks)    │
│  • "Everything except me" (prefix from left × suffix from right) │
│  • Rectangle sums in a matrix                                    │
└──────────────────────────────────────────────────────────────────┘
```

### The prefix array (with a zero in front)

```
  index:        0     1     2     3     4     5
  nums:      [ -2 ,  0 ,  3 , -5 ,  2 , -1 ]

  P:      [ 0 , -2 , -2 ,  1 , -4 , -2 , -3 ]
           P0   P1   P2   P3   P4   P5   P6

  P[k] = sum of the FIRST k numbers   (P[0] = 0 = sum of nothing)

  Build:  P[k+1] = P[k] + nums[k]
```

> 💡 The extra `P[0] = 0` is what makes every formula work for subarrays that start at index 0.

### The one formula

```
   nums:   [ a0 | a1 | a2 | a3 | a4 | a5 ]
                     └─────────┘
                       i=2 .. j=4

   P[5] = a0 + a1 + a2 + a3 + a4      ████████████████████
   P[2] = a0 + a1                     ████████
                                      ─────────────────────
   P[5] − P[2] =        a2 + a3 + a4          ████████████

   ┌───────────────────────────────────────────┐
   │   sum(i .. j)  =  P[j+1]  −  P[i]         │
   └───────────────────────────────────────────┘
   Any range sum = ONE subtraction = O(1).
```

### Pattern 1: prefix + hash map ("how many earlier prefixes fit?")

```
  Question: how many subarrays end at j and have sum k?

     sum(i .. j) = P[j+1] − P[i] = k
                              ⟹  P[i] = P[j+1] − k

  So at each position, ask the map:
     "how many EARLIER prefixes equal (current − k)?"

     ┌─────────────┐    lookup (cur − k)    ┌────────────────────┐
     │ current P   │ ─────────────────────► │ map: prefix → count│
     └─────────────┘                        └────────────────────┘
                     then add cur to map

  Seed:  map = {0 : 1}   ← the empty prefix P[0] = 0
         (without it you miss subarrays that start at index 0)
```

### Pattern 2: the modular version

```
  "sum divisible by k"  ⟺  P[j+1] − P[i] ≡ 0 (mod k)
                        ⟺  P[j+1] mod k  ==  P[i] mod k

  → store REMAINDERS in the map, look up the SAME remainder.

  ⚠ Negative numbers:  in many languages  −1 % 5 = −1  (not 4)
     Fix:  r = ((P % k) + k) % k
```

### Pattern 3: 2D prefix

```
   P[r+1][c+1] = cell + up + left − diagonal
   rect sum    = big − top − left + corner

   (full walkthrough in ../dynammic programming/02-2D-Grid-DP.md,
    section "Range Sum Query 2D"; used again in problem 7 below)
```

### Pattern 4: prefix from the left × suffix from the right

```
   "answer[i] uses everything EXCEPT i"

   left[i]  = combine(nums[0 .. i-1])     ──────►
   right[i] = combine(nums[i+1 .. n-1])   ◄──────
   answer[i] = left[i] ⊕ right[i]
```

### When sliding window FAILS but prefix works

```
  Sliding window needs: "growing the window only moves the sum ONE way".
  With negatives that breaks:

     nums = [ 1, -1, 0 ],  k = 0

     window [1]       sum 1  → too big, shrink?
     window [1,-1]    sum 0  ✓  … but growing made it SMALLER
     window [1,-1,0]  sum 0  ✓
     window [0]       sum 0  ✓
                                 answer = 3

  You can't know whether to grow or shrink.
  Prefix + hash map doesn't care about signs → always correct.
```

### Complexity at a glance

```
   Build P         O(n) time, O(n) space
   Each query      O(1)
   Prefix + map    O(n) time, O(n) space (one pass)
```

---

## 1. Range Sum Query - Immutable (Easy)

### Problem
Given `nums`, answer many queries `sumRange(left, right)` (inclusive). The array never changes.

### Visualize it

```
  index:      0     1     2     3     4     5
  nums:    [ -2 ,  0 ,  3 , -5 ,  2 , -1 ]

  P:     [ 0 , -2 , -2 ,  1 , -4 , -2 , -3 ]
          P0   P1   P2   P3   P4   P5   P6
```

### The 4 steps

| Step | Answer |
|------|--------|
| What to precompute | `P` of size n+1, `P[0] = 0` |
| Build rule | `P[k+1] = P[k] + nums[k]` |
| Query | `sumRange(l, r) = P[r+1] − P[l]` |
| Cost | build O(n), query O(1) |

### Trace

```
  sumRange(0, 2) = P[3] − P[0] =  1 − 0    =  1   ✅  (-2 + 0 + 3)
  sumRange(2, 5) = P[6] − P[2] = -3 − (-2) = -1   ✅  (3 - 5 + 2 - 1)
  sumRange(0, 5) = P[6] − P[0] = -3 − 0    = -3   ✅
```

### Pseudocode

```
constructor(nums):
    P ← array of n+1, P[0] ← 0
    for k from 0 to n-1:
        P[k+1] ← P[k] + nums[k]

sumRange(l, r):
    return P[r+1] − P[l]
```

### Optimization ladder

| Approach | Build | Per query |
|---|---|---|
| Loop each query | — | O(n) |
| **Prefix array** | **O(n)** | **O(1)** ✅ |
| Array with updates (LC 307) | Fenwick / segment tree | O(log n) |

### 📌 Points to remember
- Size **n+1** with `P[0] = 0`. Off-by-one here is the #1 bug.
- Formula: **right + 1** minus **left**.
- If the array can change, prefix sums go stale. Use a Fenwick tree instead.

---

## 2. Find Pivot Index (Easy)

### Problem
Return the leftmost index where the sum of everything **to its left** equals the sum of everything **to its right** (the element itself is in neither side). Return −1 if none.

### Visualize it

```
  nums:   [ 1 , 7 , 3 , 6 , 5 , 6 ]
            └─────────┘ ▲ └──────┘
             left = 11  │  right = 11
                      pivot (index 3)
```

### The trick: you don't need a full prefix array

```
   right = total − left − nums[i]

   walk left → right, keep a running "left" sum:
     if left == total − left − nums[i]  → found
     left ← left + nums[i]
```

### Trace ([1,7,3,6,5,6], total = 28)

```
  i │ nums[i] │ left │ right = 28 − left − nums[i] │ equal?
  ──┼─────────┼──────┼─────────────────────────────┼────────
  0 │    1    │   0  │ 27                          │
  1 │    7    │   1  │ 20                          │
  2 │    3    │   8  │ 17                          │
  3 │    6    │  11  │ 11                          │ ✅ → 3
```

### Edge case: pivot at index 0

```
  nums = [ 2, 1, -1 ],  total = 2

  i=0: left = 0, right = 2 − 0 − 2 = 0   ✅ → 0
       (empty left side counts as sum 0)
```

### Pseudocode

```
function pivotIndex(nums):
    total ← sum(nums)
    left  ← 0
    for i from 0 to n-1:
        if left == total − left − nums[i]: return i
        left ← left + nums[i]
    return −1
```

### 📌 Points to remember
- The pivot element belongs to **neither** side.
- An empty side has sum 0, so index 0 or n−1 can be the pivot.
- Return the **leftmost** pivot: stop at the first match.
- Time O(n), space O(1).

---

## 3. Product of Array Except Self (Medium)

### Problem
Return `answer[i]` = product of all numbers except `nums[i]`. **No division.** O(n) time.

### Visualize it

```
  nums:     [ 1 ,  2 ,  3 ,  4 ]

  answer[2] =  (1 × 2)   ×   (4)
               ───────       ───
               LEFT of 2     RIGHT of 2
```

### Prefix product from the left × suffix product from the right

```
  left[i]  = product of nums[0 .. i-1]     (left[0]  = 1)
  right[i] = product of nums[i+1 .. n-1]   (right[n-1] = 1)
  answer[i] = left[i] × right[i]

   ──────► left pass fills answer[] with left products
   ◄────── right pass multiplies in a running "right" variable
   → O(1) extra space (the output array doesn't count)
```

### Trace ([1, 2, 3, 4])

```
  LEFT PASS (answer[i] = product of everything before i)

   i       :   0    1    2    3
   nums    :   1    2    3    4
   answer  :   1    1    2    6      1 · 1=1, 1 · 2=2, 2 · 3=6

  RIGHT PASS (R = product of everything after i)

   i=3: answer[3] = 6 × 1  = 6    then R = 1 × 4  = 4
   i=2: answer[2] = 2 × 4  = 8    then R = 4 × 3  = 12
   i=1: answer[1] = 1 × 12 = 12   then R = 12 × 2 = 24
   i=0: answer[0] = 1 × 24 = 24   then R = 24 × 1 = 24

   answer = [24, 12, 8, 6] ✅
```

### Trace with a zero ([-1, 1, 0, -3, 3])

```
  LEFT PASS
   i      :   0    1    2    3    4
   nums   :  -1    1    0   -3    3
   answer :   1   -1   -1    0    0

  RIGHT PASS
   i=4: 0 × 1   = 0     R = 3
   i=3: 0 × 3   = 0     R = −9
   i=2: −1 × −9 = 9     R = 0      ← the zero enters R here
   i=1: −1 × 0  = 0     R = 0
   i=0: 1 × 0   = 0     R = 0

   answer = [0, 0, 9, 0, 0] ✅
   Only the zero's own slot skips the zero → only it is non-zero.
```

### Pseudocode

```
function productExceptSelf(nums):
    answer ← array of n
    answer[0] ← 1
    for i from 1 to n-1:
        answer[i] ← answer[i-1] × nums[i-1]      // left products
    R ← 1
    for i from n-1 down to 0:
        answer[i] ← answer[i] × R                // times right product
        R ← R × nums[i]
    return answer
```

### Why not divide?

```
  total / nums[i] breaks on zeros:
     one zero  → every other slot is 0, the zero's slot = product of the rest
     two zeros → everything is 0
  Handling that is possible but fiddly. The two-pass method never divides.
```

### 📌 Points to remember
- Same shape as a prefix sum, with × instead of +, and identity **1** instead of 0.
- Update `answer[i]` **before** multiplying `nums[i]` into R.
- Time O(n), extra space O(1).

---

## 4. Subarray Sum Equals K (Medium)

### Problem
Count the contiguous subarrays whose sum is exactly `k`. Numbers may be negative.

### Visualize it

```
  nums = [ 1, 1, 1 ],  k = 2

   [1, 1] 1      ✓
    1 [1, 1]     ✓        → 2
```

### Brute force vs prefix + map

```
  Brute force: every (i, j) pair, sum with a prefix array → O(n²)

  Prefix + map:
     sum(i..j) = k   ⟺   P[i] = P[j+1] − k
     For each new prefix "cur", add map[cur − k] to the answer,
     THEN record cur in the map.                         → O(n)
```

### Trace ([1, 1, 1], k = 2)

```
  start: map = {0:1}, cur = 0, count = 0

  num │ cur │ look up cur−k │ found │ count │ map after
  ────┼─────┼───────────────┼───────┼───────┼─────────────────
   1  │  1  │      −1       │   0   │   0   │ {0:1, 1:1}
   1  │  2  │       0       │   1   │   1   │ {0:1, 1:1, 2:1}
   1  │  3  │       1       │   1   │   2   │ {0:1, 1:1, 2:1, 3:1}

  answer = 2 ✅
```

### Trace ([1, 2, 3], k = 3)

```
  num │ cur │ cur−k │ found │ count
  ────┼─────┼───────┼───────┼──────
   1  │  1  │  −2   │   0   │  0
   2  │  3  │   0   │   1   │  1      [1,2]
   3  │  6  │   3   │   1   │  2      [3]

  answer = 2 ✅
```

### Trace with negatives ([1, -1, 0], k = 0)

```
  start: map = {0:1}

  num │ cur │ cur−k │ found │ count │ map after
  ────┼─────┼───────┼───────┼───────┼─────────────
   1  │  1  │   1   │   0   │   0   │ {0:1, 1:1}
  −1  │  0  │   0   │   1   │   1   │ {0:2, 1:1}
   0  │  0  │   0   │   2   │   3   │ {0:3, 1:1}

  answer = 3 ✅    [1,-1], [1,-1,0], [0]

  ⚠ The same prefix value 0 appears twice → the COUNT in the map matters,
    not just "seen / not seen".
```

### Pseudocode

```
function subarraySum(nums, k):
    map ← {0 : 1}
    cur ← 0, count ← 0
    for each x in nums:
        cur   ← cur + x
        count ← count + map.get(cur − k, 0)
        map[cur] ← map.get(cur, 0) + 1
    return count
```

### 📌 Points to remember
- **Look up first, then insert.** Inserting first would count the empty subarray when k = 0.
- Seed `{0 : 1}` so subarrays starting at index 0 are counted.
- Store **counts**, not booleans.
- Works with negatives. A sliding window does not (see section 0).
- Time O(n), space O(n).

---

## 5. Subarray Sums Divisible by K (Medium)

### Problem
Count the subarrays whose sum is divisible by `k`.

### The idea: equal remainders

```
   sum(i..j) divisible by k
   ⟺ (P[j+1] − P[i]) mod k == 0
   ⟺ P[j+1] mod k == P[i] mod k

   → each new prefix pairs with EVERY earlier prefix that has the same remainder.

   remainder buckets:   r=0  r=1  r=2  r=3  r=4
                        ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐
                        │  │ │  │ │  │ │  │ │●●│ ← same bucket = valid pairs
                        └──┘ └──┘ └──┘ └──┘ └──┘
```

### Trace ([4, 5, 0, -2, -3, 1], k = 5)

```
  start: map = {0:1}

  num │ prefix │ r = prefix mod 5 │ map[r] before │ count │ map after
  ────┼────────┼──────────────────┼───────────────┼───────┼───────────────────
   4  │   4    │        4         │       0       │   0   │ {0:1, 4:1}
   5  │   9    │        4         │       1       │   1   │ {0:1, 4:2}
   0  │   9    │        4         │       2       │   3   │ {0:1, 4:3}
  −2  │   7    │        2         │       0       │   3   │ {0:1, 4:3, 2:1}
  −3  │   4    │        4         │       3       │   6   │ {0:1, 4:4, 2:1}
   1  │   5    │        0         │       1       │   7   │ {0:2, 4:4, 2:1}

  answer = 7 ✅
```

### The negative remainder trap ⚠️

```
  nums = [ −1, 2, 9 ],  k = 2      prefixes: −1, 1, 10

                      raw % (C, Java, JS)     fixed ((p % k) + k) % k
  prefix −1   →            −1                          1
  prefix  1   →             1                          1
  prefix 10   →             0                          0

  raw:   buckets −1, 1, 0 → −1 and 1 never match   → count = 1  ❌
  fixed: buckets  1, 1, 0 → they match             → count = 2  ✅
         ([2] and [−1, 2, 9])

  Python's % is already non-negative, but the fix is harmless there.
```

### Pseudocode

```
function subarraysDivByK(nums, k):
    map ← {0 : 1}
    prefix ← 0, count ← 0
    for each x in nums:
        prefix ← prefix + x
        r ← ((prefix mod k) + k) mod k
        count ← count + map.get(r, 0)
        map[r] ← map.get(r, 0) + 1
    return count
```

> 💡 Since remainders are 0..k−1, the map can be a plain array of size k.

### 📌 Points to remember
- Same skeleton as problem 4: look up the **same remainder** instead of `cur − k`.
- Always normalize negative remainders.
- Seed remainder 0 with count 1.
- Time O(n), space O(k).

---

## 6. Continuous Subarray Sum (Medium)

### Problem
Return true if there is a subarray of **length ≥ 2** whose sum is a multiple of `k` (0 counts as a multiple).

### What changes from problem 5

```
  Problem 5: COUNT pairs with equal remainders
  Problem 6: does a pair exist that is at least 2 apart?

  → store the FIRST index where each remainder appeared
  → when the remainder repeats at index j:  j − firstIndex ≥ 2 ?

  Seed: {0 : −1}   (the empty prefix sits "before index 0")
```

### Trace ([23, 2, 4, 6, 7], k = 6) → true

```
  i │ num │ prefix │ r = prefix mod 6 │ seen at │ j − seen │ action
  ──┼─────┼────────┼──────────────────┼─────────┼──────────┼──────────────
  0 │ 23  │   23   │        5         │    —    │    —     │ store 5 → 0
  1 │  2  │   25   │        1         │    —    │    —     │ store 1 → 1
  2 │  4  │   29   │        5         │    0    │    2     │ ≥ 2 → TRUE ✅

  subarray [2, 4] = 6 ✓
```

### Trace ([23, 2, 6, 4, 7], k = 13) → false

```
  prefix:  23   25   31   35   42
  mod 13:  10   12    5    9    3     all different, none is 0
                                     → no repeat → FALSE ✅
```

### Why keep the FIRST index (never overwrite) ⚠️

```
  nums = [5, 0, 0, 0], k = 3       prefixes 5, 5, 5, 5 → remainders 2, 2, 2, 2

  KEEP FIRST                         OVERWRITE (wrong)
  i=0: store 2 → 0                   i=0: store 2 → 0
  i=1: 1 − 0 = 1  too short          i=1: 1 − 0 = 1, overwrite 2 → 1
  i=2: 2 − 0 = 2  ✅ TRUE            i=2: 2 − 1 = 1, overwrite 2 → 2
                                     i=3: 3 − 2 = 1 → FALSE ❌

  [0, 0] has sum 0, a multiple of 3, so true is correct.
  The earliest index gives the LONGEST span → best chance of length ≥ 2.
```

### Pseudocode

```
function checkSubarraySum(nums, k):
    first ← {0 : −1}
    prefix ← 0
    for j from 0 to n-1:
        prefix ← prefix + nums[j]
        r ← prefix mod k               // nums are non-negative in LC 523
        if r in first:
            if j − first[r] ≥ 2: return true
        else:
            first[r] ← j               // only store the FIRST time
    return false
```

### 📌 Points to remember
- Store the **first** index per remainder. Never overwrite it.
- Seed `{0 : −1}` so a valid prefix starting at index 0 has length j + 1.
- The length check is `j − first ≥ 2`, which means at least 2 elements.
- Time O(n), space O(min(n, k)).

---

## 7. Matrix Block Sum (Medium)

### Problem
For every cell `(r, c)`, return the sum of all cells within distance `k` (the square `r−k..r+k`, `c−k..c+k`, clipped to the grid).

### Visualize it (k = 1)

```
     mat                 block for (0,0)        block for (1,1)
  ┌───┬───┬───┐         ┌───┬───┬───┐          ┌───┬───┬───┐
  │ 1 │ 2 │ 3 │         │▓1▓│▓2▓│ 3 │          │▓1▓│▓2▓│▓3▓│
  ├───┼───┼───┤         ├───┼───┼───┤          ├───┼───┼───┤
  │ 4 │ 5 │ 6 │         │▓4▓│▓5▓│ 6 │          │▓4▓│▓5▓│▓6▓│
  ├───┼───┼───┤         ├───┼───┼───┤          ├───┼───┼───┤
  │ 7 │ 8 │ 9 │         │ 7 │ 8 │ 9 │          │▓7▓│▓8▓│▓9▓│
  └───┴───┴───┘         └───┴───┴───┘          └───┴───┴───┘
                        sum = 12               sum = 45
```

### Step 1: build the 2D prefix table (padded)

```
  P[r+1][c+1] = mat[r][c] + P[r][c+1] + P[r+1][c] − P[r][c]

        ┌───┬────┬────┬────┐
        │ 0 │  0 │  0 │  0 │
        ├───┼────┼────┼────┤
        │ 0 │  1 │  3 │  6 │
        ├───┼────┼────┼────┤
        │ 0 │  5 │ 12 │ 21 │     12 = 5 + 3 + 5 − 1
        ├───┼────┼────┼────┤
        │ 0 │ 12 │ 27 │ 45 │     45 = 9 + 21 + 27 − 12
        └───┴────┴────┴────┘
```

### Step 2: clip the block, then 4 lookups

```
  r1 = max(0, r − k)     r2 = min(m−1, r + k)
  c1 = max(0, c − k)     c2 = min(n−1, c + k)

  sum = P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]
```

### Trace (k = 1)

```
  cell  │ r1..r2 │ c1..c2 │ lookups                          │ sum
  ──────┼────────┼────────┼──────────────────────────────────┼─────
  (0,0) │ 0..1   │ 0..1   │ P[2][2] − P[0][2] − P[2][0] + P[0][0] = 12 − 0 − 0 + 0 │ 12
  (0,2) │ 0..1   │ 1..2   │ P[2][3] − P[0][3] − P[2][1] + P[0][1] = 21 − 0 − 5 + 0 │ 16
  (1,1) │ 0..2   │ 0..2   │ P[3][3] − 0 − 0 + 0 = 45                               │ 45
  (1,2) │ 0..2   │ 1..2   │ P[3][3] − P[0][3] − P[3][1] + P[0][1] = 45 − 0 − 12 + 0│ 33
  (2,0) │ 1..2   │ 0..1   │ P[3][2] − P[1][2] − P[3][0] + P[1][0] = 27 − 3 − 0 + 0 │ 24

  result:
        ┌────┬────┬────┐
        │ 12 │ 21 │ 16 │
        ├────┼────┼────┤
        │ 27 │ 45 │ 33 │   ✅
        ├────┼────┼────┤
        │ 24 │ 39 │ 28 │
        └────┴────┴────┘
```

### Pseudocode

```
function matrixBlockSum(mat, k):
    build P ((m+1) × (n+1)) as above
    for r from 0 to m-1:
        for c from 0 to n-1:
            r1 ← max(0, r−k),  r2 ← min(m−1, r+k)
            c1 ← max(0, c−k),  c2 ← min(n−1, c+k)
            ans[r][c] ← P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]
    return ans
```

### Complexity

| Approach | Time |
|---|---|
| Sum each block directly | O(m · n · k²) |
| **2D prefix table** | **O(m · n)** ✅ |

### 📌 Points to remember
- **Clip first**, then look up. Out-of-range indices are the usual crash.
- Build: **+ up + left − diagonal**. Query: **− top − left + corner**.
- Full 2D prefix walkthrough: `../dynammic programming/02-2D-Grid-DP.md` (Range Sum Query 2D).

---

## 8. Count of Range Sum (Hard)

### Problem
Count pairs `(i, j)`, `i ≤ j`, with `lower ≤ sum(nums[i..j]) ≤ upper`.

> Also covered in `../dynammic programming/01-1D-Linear-DP.md`. Here is the full walk again from the prefix-sum angle.

### Step 1: turn it into a prefix-pair question

```
   nums  =      [ -2 ,  5 , -1 ]
   P     = [ 0 ,  -2 ,  3 ,  2 ]
            P0    P1    P2    P3

   sum(i..j) = P[j+1] − P[i]

   ┌───────────────────────────────────────────────────────────┐
   │ Count pairs a < b with   lower ≤ P[b] − P[a] ≤ upper      │
   │  ⟺   P[b] − upper  ≤  P[a]  ≤  P[b] − lower               │
   └───────────────────────────────────────────────────────────┘

   Like problem 4, but the hash map's "exact match" becomes a RANGE.
   A hash map can't answer ranges → we need sorted data.
```

### Brute force (lower = −2, upper = 2)

```
  (a,b) │ P[b] − P[a]  │ in [−2, 2]?
  ──────┼──────────────┼────────────
  (0,1) │ −2 − 0 = −2  │ ✅
  (0,2) │  3 − 0 =  3  │ ❌
  (0,3) │  2 − 0 =  2  │ ✅
  (1,2) │  3 + 2 =  5  │ ❌
  (1,3) │  2 + 2 =  4  │ ❌
  (2,3) │  2 − 3 = −1  │ ✅
                            answer = 3      O(n²)
```

### Step 2: merge sort counts the cross pairs

```
   Split P in halves. Pairs are:
     (1) both in left half    → recursion
     (2) both in right half   → recursion
     (3) a in left, b in right → count while both halves are SORTED

   Sorting a half doesn't change which side an element is on,
   so "a before b" still holds for every cross pair.

                 P = [ 0, −2 | 3, 2 ]
                 ┌──────┴──────┐
             [0, −2]         [3, 2]
             ┌──┴──┐         ┌──┴──┐
            [0]  [−2]       [3]   [2]
   cross: −2 − 0 = −2 ✅   cross: 2 − 3 = −1 ✅
              → 1                → 1
   sorted:   [−2, 0]         [2, 3]

   top-level cross (left [−2, 0], right [2, 3]):
     a = −2: need right in [−4, 0]   → none      (0)
     a =  0: need right in [−2, 2]   → {2}       (1)

   total = 1 + 1 + 1 = 3 ✅
```

### Two pointers in the cross step

```
  LEFT  (sorted):  l₀ ≤ l₁ ≤ l₂ ...
  RIGHT (sorted):  r₀ ≤ r₁ ≤ r₂ ≤ r₃ ...
                       ▲lo        ▲hi
                       └─ window ─┘   lower ≤ r − l ≤ upper

  lo = first right value with r − l ≥ lower
  hi = first right value with r − l > upper
  count += hi − lo

  As l grows, both lo and hi only move RIGHT → O(n) per level.
```

### Pseudocode

```
function countRangeSum(nums, lower, upper):
    P ← prefix sums, P[0] = 0           // use 64-bit integers
    return sortAndCount(P, 0, n+1)

function sortAndCount(P, left, right):  // half-open [left, right)
    if right − left ≤ 1: return 0
    mid ← (left + right) / 2
    count ← sortAndCount(P, left, mid) + sortAndCount(P, mid, right)
    lo ← mid, hi ← mid
    for a from left to mid−1:
        while lo < right and P[lo] − P[a] <  lower: lo ← lo + 1
        while hi < right and P[hi] − P[a] ≤ upper: hi ← hi + 1
        count ← count + (hi − lo)
    merge the two sorted halves of P[left .. right)
    return count
```

### Alternative: Fenwick tree (BIT)

```
  walk b left → right:
    1. count stored P[a] in [P[b] − upper, P[b] − lower]   (BIT range query)
    2. insert P[b]
  Values are huge / negative → coordinate-compress all P values first.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force | O(n²) | O(n) |
| **Merge sort counting** | **O(n log n)** | O(n) |
| BIT + compression | O(n log n) | O(n) |

### 📌 Points to remember
- Exact target → hash map (problem 4). **Range** target → sorted counting.
- Include `P[0] = 0`.
- Use **64-bit** prefix sums.
- Related: Count of Smaller Numbers After Self, Reverse Pairs.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────────────┬─────────────────────────────────────────────┬────────────────┐
│ Problem                      │ Core idea                                   │ Time / Space   │
├──────────────────────────────┼─────────────────────────────────────────────┼────────────────┤
│ Range Sum Query - Immutable  │ P[r+1] − P[l]                               │ O(1) / O(n)    │
│ Find Pivot Index             │ left == total − left − nums[i]              │ O(n) / O(1)    │
│ Product Except Self          │ left products, then × running right product │ O(n) / O(1)    │
│ Subarray Sum Equals K        │ map[prefix − k], seed {0:1}                 │ O(n) / O(n)    │
│ Subarray Sums Divisible by K │ map[same remainder], fix negatives          │ O(n) / O(k)    │
│ Continuous Subarray Sum      │ first index per remainder, gap ≥ 2          │ O(n) / O(k)    │
│ Matrix Block Sum             │ 2D prefix + clipped 4-lookup query          │ O(mn) / O(mn)  │
│ Count of Range Sum           │ prefix + merge-sort window count            │ O(n log n)     │
└──────────────────────────────┴─────────────────────────────────────────────┴────────────────┘
```

### Pattern family tree

```
                            PREFIX SUM
                                │
     ┌──────────────┬───────────┼──────────────┬──────────────────┐
     │              │           │              │                  │
  RANGE QUERY   LEFT/RIGHT   PREFIX + MAP   2D PREFIX      PREFIX + SORTED
  (O(1) each)   SPLIT        (count / exist)               (range target)
     │              │           │              │                  │
  └ Range Sum    ├ Pivot     ├ Sum = K       └ Matrix       └ Count of
    Query        └ Product   ├ Divisible       Block Sum      Range Sum
                   Except      by K
                   Self      └ Continuous
                               Subarray Sum
```

### What goes in the hash map?

```
   ┌──────────────────────────┬───────────────────┬──────────────┬───────────┐
   │ Question                 │ Key               │ Value        │ Seed      │
   ├──────────────────────────┼───────────────────┼──────────────┼───────────┤
   │ count sum == k           │ prefix            │ count        │ {0 : 1}   │
   │ count sum % k == 0       │ prefix mod k      │ count        │ {0 : 1}   │
   │ exists, length ≥ 2       │ prefix mod k      │ FIRST index  │ {0 : −1}  │
   │ longest subarray sum = k │ prefix            │ FIRST index  │ {0 : −1}  │
   │ sum in a range           │ (sorted / BIT, not a hash map)               │
   └──────────────────────────┴───────────────────┴──────────────┴───────────┘
```

### Prefix sum vs sliding window

```
   ┌──────────────────────────────┬───────────────┬────────────────────┐
   │ Situation                    │ Sliding window│ Prefix + map       │
   ├──────────────────────────────┼───────────────┼────────────────────┤
   │ all numbers ≥ 0              │ ✅ O(1) space │ ✅                 │
   │ negatives allowed            │ ❌            │ ✅                 │
   │ exact sum / divisibility     │ awkward       │ ✅ natural         │
   │ many range queries           │ —             │ ✅ O(1) each       │
   └──────────────────────────────┴───────────────┴────────────────────┘
```

### Optimization checklist

```
  ☐ Range sums asked repeatedly?                 → precompute P, O(1) per query
  ☐ "Everything except i"?                       → left pass + right pass
  ☐ Count subarrays with exact sum?              → prefix + count map, seed {0:1}
  ☐ Divisibility?                                → remainders as keys, normalize negatives
  ☐ Need a length constraint or longest span?    → store FIRST index, seed {0:−1}
  ☐ Rectangle sums?                              → 2D prefix with zero padding
  ☐ Sum must fall in a RANGE?                    → merge sort / BIT on prefixes
  ☐ Array changes over time?                     → Fenwick / segment tree instead
```

### 🚩 Common bugs to avoid

```
  ✗ P of size n instead of n+1 (missing P[0] = 0)
  ✗ Forgetting to seed the map ({0:1} or {0:−1})
  ✗ Inserting the current prefix BEFORE looking it up
  ✗ Storing booleans instead of counts
  ✗ Negative remainders not normalized
  ✗ Overwriting the first index (Continuous Subarray Sum)
  ✗ Not clipping block bounds in 2D
  ✗ 32-bit overflow on big prefix sums
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "If I know the running total NOW, what earlier running  ║
   ║   total would make the piece in between what I want?"    ║
   ╚══════════════════════════════════════════════════════════╝
      Exact value → hash map.  Same remainder → hash map on mod.
      A range of values → sorted structure.
```

---

### ✅ Progress tracker

- [ ] Range Sum Query - Immutable (Easy)
- [ ] Find Pivot Index (Easy)
- [ ] Product of Array Except Self (Medium)
- [ ] Subarray Sum Equals K (Medium)
- [ ] Subarray Sums Divisible by K (Medium)
- [ ] Continuous Subarray Sum (Medium)
- [ ] Matrix Block Sum (Medium)
- [ ] Count of Range Sum (Hard)
