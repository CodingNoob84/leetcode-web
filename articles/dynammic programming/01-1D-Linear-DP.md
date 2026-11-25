# 1D / Linear Dynamic Programming: A Visual Guide

> **Goal:** Learn to *see* 1D DP problems, build the recurrence by hand, and then optimize it.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is 1D DP?](#0-the-big-idea-what-is-1d-dp)
1. [Climbing Stairs (Easy)](#1-climbing-stairs-easy)
2. [Min Cost Climbing Stairs (Easy)](#2-min-cost-climbing-stairs-easy)
3. [House Robber (Medium)](#3-house-robber-medium)
4. [House Robber II (Medium)](#4-house-robber-ii-medium)
5. [Decode Ways (Medium)](#5-decode-ways-medium)
6. [Longest Increasing Subsequence (Medium)](#6-longest-increasing-subsequence-medium)
7. [Number of Longest Increasing Subsequence (Medium)](#7-number-of-longest-increasing-subsequence-medium)
8. [Count of Range Sum (Hard)](#8-count-of-range-sum-hard)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** the problems are ordered by how much each one builds on the last, not by the list you were given.
> Stairs, then Min Cost, then Robber, then Robber II, then Decode, then LIS, then # of LIS, then Range Sum.

---

## 0. The Big Idea: What Is 1D DP?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "1D DP"                                 │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a LINE: an array, a string, steps, houses            │
│  • "How many WAYS ...?"           → counting DP  (add)           │
│  • "MIN / MAX cost / sum / ..."   → optimization DP (min / max)  │
│  • "LONGEST / SHORTEST ..."       → length DP                    │
│  • Each step makes a small CHOICE: take / skip, 1 step / 2 steps │
│  • The answer at position i depends only on EARLIER positions    │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: a row of boxes

```
 index:    0     1     2     3     4     5
        ┌─────┬─────┬─────┬─────┬─────┬─────┐
  dp:   │  ?  │  ?  │  ?  │  ?  │  ?  │  ?  │
        └─────┴─────┴─────┴─────┴─────┴─────┘
          ▲                             ▲
       base case                     answer
       (known)                      (usually)

  You fill boxes LEFT → RIGHT.
  Each box is computed from boxes that are ALREADY filled.
```

### The 5-step recipe (use this for EVERY problem)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  DEFINE THE STATE                                      │
 │         "dp[i] = ______ considering the first i items / up    │
 │          to index i / ending at index i"                      │
 │         ⚠ This sentence is 80% of the work. Write it down!    │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 2  FIND THE TRANSITION (recurrence)                      │
 │         "To reach state i, what was my LAST choice?"          │
 │         dp[i] = combine( dp[i-1], dp[i-2], ... )              │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 3  BASE CASES                                            │
 │         The smallest inputs you can answer without thinking.  │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 4  ORDER OF FILLING                                      │
 │         Usually left → right (small i before big i).          │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 5  WHERE IS THE ANSWER?                                  │
 │         dp[n]? dp[n-1]? max over ALL dp[i]?                   │
 └───────────────────────────────────────────────────────────────┘
```

### The two "flavors" of state definition

```
   FLAVOR A: "PREFIX" state              FLAVOR B: "ENDING AT" state
   dp[i] = best for items 0..i           dp[i] = best for something that
                                                 ENDS EXACTLY at i

   ┌──┬──┬──┬──┬──┐                      ┌──┬──┬──┬──┬──┐
   │██│██│██│██│  │  dp[3] covers        │  │  │  │██│  │  dp[3] must
   └──┴──┴──┴──┴──┘  everything so far   └──┴──┴──┴──┴──┘  USE item 3

   Answer = dp[last]                     Answer = max over all dp[i]

   Used in: Stairs, Robber, Decode       Used in: LIS, # of LIS
```

### The universal optimization path

```
   Brute-force recursion   ──►   Memoization    ──►   Tabulation   ──►   Space-optimized
   (exponential, O(2^n))         (top-down,           (bottom-up,        (keep only the
                                  O(n) space)          dp array)          last k values)

   "Try every choice"            "Cache answers"      "Fill a table"     "Rolling variables"
```

> 💡 **Key insight:** if `dp[i]` only looks back at `dp[i-1]` and `dp[i-2]`,
> you never need the whole array. **Two variables are enough → O(1) space.**

---

## 1. Climbing Stairs (Easy)

### Problem
You climb `n` stairs. Each move is **1 or 2 steps**. How many **distinct ways** reach the top?

### Visualize it

```
                                    ┌───┐  ← step 4 (TOP)
                              ┌───┐ │   │
                        ┌───┐ │   │ │   │
                  ┌───┐ │   │ │   │ │   │
   ground ────────┘   └─┘   └─┘   └─┘   │
     0              1     2     3     4

   How did I land on step 4?
       • I came from step 3 (took a 1-step)   ──┐
       • I came from step 2 (took a 2-step)   ──┴──► ways(4) = ways(3) + ways(2)
```

### Think in "last move"

```
             ways(i)
            /       \
     last move=1   last move=2
          │              │
     ways(i-1)      ways(i-2)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i]` = number of ways to reach step `i` |
| Transition | `dp[i] = dp[i-1] + dp[i-2]` |
| Base | `dp[0] = 1` (one way to stand still), `dp[1] = 1` |
| Order | i from 2 up to n |
| Answer | `dp[n]` |

### Trace (n = 5)

```
  i     :   0    1    2    3    4    5
         ┌────┬────┬────┬────┬────┬────┐
  dp[i] :│ 1  │ 1  │ 2  │ 3  │ 5  │ 8  │
         └────┴────┴────┴────┴────┴────┘
                └──┬─┘ ▲
                   └───┘   1 + 1 = 2
                     └──┬─┘ ▲
                        └───┘ 1 + 2 = 3   ... it is FIBONACCI!
```

### Recursion tree: why brute force is slow

```
                         f(5)
                     /          \
                 f(4)            f(3)        ◄── f(3) computed twice
               /     \          /    \
            f(3)     f(2)     f(2)   f(1)    ◄── f(2) computed three times
           /   \     /  \     /  \
        f(2)  f(1) f(1) f(0) f(1) f(0)
        ...
   Overlapping subproblems → O(2^n). Cache them → O(n).
```

### Pseudocode (space-optimized)

```
function climbStairs(n):
    prev2 ← 1        // dp[i-2]
    prev1 ← 1        // dp[i-1]
    for i from 2 to n:
        curr  ← prev1 + prev2
        prev2 ← prev1
        prev1 ← curr
    return prev1
```

### Rolling-variable animation

```
  start:   prev2=1  prev1=1
  i=2  :   curr=2   → slide window →  prev2=1  prev1=2
  i=3  :   curr=3   → slide window →  prev2=2  prev1=3
  i=4  :   curr=5   → slide window →  prev2=3  prev1=5
  i=5  :   curr=8   → slide window →  prev2=5  prev1=8   ✅ answer 8

        [prev2][prev1] ──► [prev2][prev1] ──► ...
          the "window" of size 2 slides right
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Plain recursion | O(2ⁿ) | O(n) stack |
| Memo / table | O(n) | O(n) |
| **Two variables** | **O(n)** | **O(1)** ✅ |
| Matrix exponentiation (bonus) | O(log n) | O(1) |

### 📌 Points to remember
- "Count the ways" → **add** the sub-results.
- `dp[0] = 1` feels strange, but "doing nothing" counts as one way.
- Variant: steps `{1, 2, 3}` → `dp[i] = dp[i-1] + dp[i-2] + dp[i-3]`. Same pattern.

---

## 2. Min Cost Climbing Stairs (Easy)

### Problem
`cost[i]` = price to **step on** stair `i`. You may start at index 0 or 1. Each move is 1 or 2 steps.
Find the minimum cost to reach the **top**, which is index `n`, one past the last stair.

### Visualize it

```
  cost:     10     15     20
          ┌────┐ ┌────┐ ┌────┐  ┌─────┐
          │ 0  │ │ 1  │ │ 2  │  │ TOP │  ← index n = 3 (free)
          └────┘ └────┘ └────┘  └─────┘
            ▲      ▲
         start   start   (both FREE to begin at)

   Best: start at 1 (pay 15) ──2 steps──► TOP      total = 15 ✅
```

### Same shape as Climbing Stairs: just swap `+` for `min`

```
        Climbing Stairs                   Min Cost Climbing Stairs
   dp[i] = dp[i-1] + dp[i-2]     ──►   dp[i] = min( dp[i-1] + cost[i-1],
         (count → ADD)                              dp[i-2] + cost[i-2] )
                                              (optimize → MIN)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i]` = min cost to **arrive** at index `i` |
| Transition | `dp[i] = min(dp[i-1] + cost[i-1], dp[i-2] + cost[i-2])` |
| Base | `dp[0] = 0`, `dp[1] = 0` (starting is free) |
| Order | i from 2 to n |
| Answer | `dp[n]` |

### Trace (cost = [10, 15, 20])

```
  i       :    0      1      2       3(TOP)
            ┌──────┬──────┬──────┬────────┐
  dp[i]   : │  0   │  0   │  10  │   15   │
            └──────┴──────┴──────┴────────┘

  dp[2] = min( dp[1]+cost[1], dp[0]+cost[0] ) = min(0+15, 0+10) = 10
  dp[3] = min( dp[2]+cost[2], dp[1]+cost[1] ) = min(10+20, 0+15) = 15 ✅
```

### Pseudocode (O(1) space)

```
function minCostClimbing(cost):
    n ← length(cost)
    a ← 0     // dp[i-2]
    b ← 0     // dp[i-1]
    for i from 2 to n:
        c ← min(b + cost[i-1], a + cost[i-2])
        a ← b
        b ← c
    return b
```

### 📌 Points to remember
- The **top is index n**, not `n-1`. This is the #1 bug.
- There are two valid state definitions. Pick one and stay consistent:
  - "cost to **arrive** at i" (above), answer `dp[n]`
  - "cost to **leave from** i" → `dp[i] = cost[i] + min(dp[i-1], dp[i-2])`, answer `min(dp[n-1], dp[n-2])`
- Same skeleton as Climbing Stairs. **Recognize templates!**

---

## 3. House Robber (Medium)

### Problem
Houses in a row, `nums[i]` = money. You **can't rob two adjacent** houses. Maximize the loot.

### Visualize it

```
   🏠      🏠      🏠      🏠      🏠
  [ 2 ]   [ 7 ]   [ 9 ]   [ 3 ]   [ 1 ]
    ✅      ❌      ✅      ❌      ✅     = 2 + 9 + 1 = 12  ✅ best

    ❌      ✅      ❌      ✅      ❌     = 7 + 3     = 10
```

### The decision at every house: ROB or SKIP

```
                    At house i, I either...
                  ┌─────────────┴─────────────┐
               ROB it                       SKIP it
                  │                             │
     nums[i] + best up to (i-2)        best up to (i-1)
     (i-1 is forbidden!)               (take whatever was best)

        dp[i] = max( dp[i-2] + nums[i] ,  dp[i-1] )
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i]` = max money from houses `0..i` |
| Transition | `dp[i] = max(dp[i-1], dp[i-2] + nums[i])` |
| Base | `dp[0] = nums[0]`, `dp[1] = max(nums[0], nums[1])` |
| Order | left → right |
| Answer | `dp[n-1]` |

### Trace (nums = [2, 7, 9, 3, 1])

```
  i      :    0     1      2      3      4
  nums   :    2     7      9      3      1
            ┌────┬─────┬──────┬──────┬──────┐
  dp     :  │ 2  │  7  │  11  │  11  │  12  │
            └────┴─────┴──────┴──────┴──────┘

  dp[2] = max( dp[1]=7 , dp[0]+9 = 11 )  → 11   (rob)
  dp[3] = max( dp[2]=11, dp[1]+3 = 10 )  → 11   (skip)
  dp[4] = max( dp[3]=11, dp[2]+1 = 12 )  → 12   (rob) ✅
```

### Pseudocode (O(1) space)

```
function rob(nums):
    prev2 ← 0      // best up to i-2
    prev1 ← 0      // best up to i-1
    for each x in nums:
        curr  ← max(prev1, prev2 + x)
        prev2 ← prev1
        prev1 ← curr
    return prev1
```

> 💡 Starting both at 0 means you need **no special base cases**. Treat them as imaginary empty houses before the array.

### 📌 Points to remember
- The **"take / skip"** pattern shows up everywhere (Delete and Earn, Paint Fence, ...).
- `dp[i]` is "best **so far**" (prefix), so the answer is the last cell.
- Taking the bigger of "odd houses vs. even houses" is **wrong**. Example: `[2,1,1,2]` → answer is 4 (houses 0 and 3).

---

## 4. House Robber II (Medium)

### Problem
Same as House Robber, but the houses are in a **circle**: the first and last are neighbors.

### Visualize it

```
                 [ 2 ]
              ╱         ╲
          [ 1 ]         [ 3 ]
             │            │
          [ 1 ] ─────── [ 2 ]

   First and last are adjacent → you can't rob BOTH.
```

### The trick: break the circle into two lines

```
   Circle: [ h0, h1, h2, ..., h(n-2), h(n-1) ]
                                       ↑ adjacent to h0

   CASE A: exclude the LAST house   →  [ h0, h1, ..., h(n-2) ]   (straight line)
   CASE B: exclude the FIRST house  →  [ h1, h2, ..., h(n-1) ]   (straight line)

   ┌──────────────────────────────┐
   │ answer = max( rob(A), rob(B) )│
   └──────────────────────────────┘

   Why it works: any valid circle plan skips at least one of {h0, h(n-1)},
   so it fits entirely inside case A or case B.
```

### Trace (nums = [1, 2, 3, 1])

```
   Case A: [1, 2, 3]    → rob 1 + 3      = 4
   Case B: [2, 3, 1]    → rob 3          = 3   (or 2 + 1 = 3)
                                            ───────
                                    answer = 4 ✅
```

### Pseudocode

```
function robCircle(nums):
    n ← length(nums)
    if n == 1: return nums[0]           // ⚠ edge case!
    return max( robLine(nums, 0, n-2),
                robLine(nums, 1, n-1) )

function robLine(nums, lo, hi):
    prev2 ← 0, prev1 ← 0
    for i from lo to hi:
        curr  ← max(prev1, prev2 + nums[i])
        prev2 ← prev1
        prev1 ← curr
    return prev1
```

### 📌 Points to remember
- **Circular problem → split into 2 linear problems.** This trick is reusable.
- Handle `n == 1` separately, or both ranges become empty and you return 0.
- Reuse your House Robber solution as a helper. Don't rewrite it.
- Time O(n), Space O(1).

---

## 5. Decode Ways (Medium)

### Problem
`'A'→1, 'B'→2, ..., 'Z'→26`. Given a digit string, count how many ways to decode it.

### Visualize it

```
   "226"
     │
     ├── 2 | 2 | 6     → B B F
     ├── 22 | 6        → V F
     └── 2 | 26        → B Z           → 3 ways ✅
```

### At each position: take 1 digit or 2 digits

```
   s =  ... [ s[i-2] ][ s[i-1] ]  │  (i chars consumed so far)
                                  │
         ┌────────────────────────┴──────────────────────┐
     LAST piece is 1 digit                    LAST piece is 2 digits
     s[i-1] must be '1'..'9'                  s[i-2..i-1] must be "10".."26"
         │                                               │
       dp[i-1]                                         dp[i-2]

   dp[i] = (valid1 ? dp[i-1] : 0) + (valid2 ? dp[i-2] : 0)
```

> This is **Climbing Stairs with gates**: a 1-step or 2-step move is only allowed if the digits form a valid letter.

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i]` = ways to decode the first `i` characters |
| Transition | see the picture above |
| Base | `dp[0] = 1` (empty string: 1 way), `dp[1] = (s[0] != '0') ? 1 : 0` |
| Order | i from 2 to n |
| Answer | `dp[n]` |

### Trace ("226")

```
  i       :   0     1      2      3
  prefix  :  ""    "2"   "22"   "226"
            ┌─────┬─────┬──────┬──────┐
  dp[i]   : │  1  │  1  │  2   │  3   │
            └─────┴─────┴──────┴──────┘

  dp[2]: single '2' valid  → +dp[1]=1 ; pair "22" valid → +dp[0]=1 → 2
  dp[3]: single '6' valid  → +dp[2]=2 ; pair "26" valid → +dp[1]=1 → 3 ✅
```

### The ZERO danger zone ⚠️

```
  '0' can NEVER stand alone.  It must be part of "10" or "20".

   "10"  →  "J"                   → 1 way
   "06"  →  '0' alone ✗, "06" ✗  → 0 ways
   "100" →  "10" then '0' ✗, "00" ✗ → 0 ways
   "30"  →  '0' ✗, "30" > 26 ✗   → 0 ways
```

### Pseudocode (O(1) space)

```
function numDecodings(s):
    if s[0] == '0': return 0
    prev2 ← 1      // dp[i-2]
    prev1 ← 1      // dp[i-1]
    for i from 2 to n:
        curr ← 0
        if s[i-1] != '0':                     curr ← curr + prev1
        two  ← number formed by s[i-2], s[i-1]
        if 10 ≤ two ≤ 26:                     curr ← curr + prev2
        prev2 ← prev1
        prev1 ← curr
    return prev1
```

### 📌 Points to remember
- Two-digit check is `10..26`, **not** `1..26`. A leading zero is not a valid pair.
- If `dp` becomes 0 at some point, it can stay 0. That's correct, because the string is undecodable.
- Use `dp[i]` = "first i characters" (size n+1). It avoids messy index math.

---

## 6. Longest Increasing Subsequence (Medium)

### Problem
Find the length of the longest **strictly increasing subsequence**. Elements don't need to be contiguous, but order is kept.

### Visualize it

```
  nums:  10   9   2   5   3   7   101   18
                  ●       ●   ●    ●            2 → 3 → 7 → 101   (length 4)
                  ●   ●       ●         ●       2 → 5 → 7 → 18    (length 4)
```

### Why "prefix" state fails → use "ENDING AT" state

```
   To extend a subsequence, I need to know its LAST element.
   So:   dp[i] = length of the LIS that ENDS EXACTLY at index i

   For each i, look BACK at every j < i:
       if nums[j] < nums[i]  →  I can glue nums[i] after the chain ending at j

          j₀   j₁   j₂ ...  i
          ●────●────●──────►●
                             dp[i] = 1 + max( dp[j] : j < i, nums[j] < nums[i] )
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i]` = LIS length ending at `i` |
| Transition | `dp[i] = 1 + max(dp[j])` over `j < i` with `nums[j] < nums[i]` |
| Base | every `dp[i] = 1` (the element alone) |
| Order | left → right |
| Answer | **max of all** `dp[i]` ⚠ not `dp[n-1]` |

### Trace (O(n²) version)

```
  i     :   0    1    2    3    4    5    6     7
  nums  :  10    9    2    5    3    7   101   18
          ┌────┬────┬────┬────┬────┬────┬─────┬────┐
  dp    : │ 1  │ 1  │ 1  │ 2  │ 2  │ 3  │  4  │ 4  │
          └────┴────┴────┴────┴────┴────┴─────┴────┘
                         ▲    ▲    ▲     ▲
                         │    │    │     └─ 101 > 7  → dp[5]+1 = 4
                         │    │    └─ 7 > 5 (or 3)   → 2+1 = 3
                         │    └─ 3 > 2               → 1+1 = 2
                         └─ 5 > 2                    → 1+1 = 2

   answer = max(dp) = 4 ✅
```

### Pseudocode: O(n²)

```
function LIS(nums):
    dp ← array of size n, all 1
    for i from 1 to n-1:
        for j from 0 to i-1:
            if nums[j] < nums[i]:
                dp[i] ← max(dp[i], dp[j] + 1)
    return max(dp)
```

---

### 🚀 Optimization: O(n log n) with "tails" (Patience Sorting)

**New state:** `tails[k]` = the **smallest possible tail value** of any increasing subsequence of length `k+1`.

```
  Intuition: a smaller tail is ALWAYS better, because it leaves more room
             for future numbers to extend it.

             [2, 5]  vs  [2, 3]     → keep [2, 3]: 3 < 5, easier to extend
```

**Rule for each number x:**

```
   ┌──────────────────────────────────────────────────────────────┐
   │ Binary-search the FIRST tail that is ≥ x                     │
   │   • none found       → APPEND x   (the LIS got longer!)      │
   │   • found at pos k   → REPLACE tails[k] with x (better tail) │
   └──────────────────────────────────────────────────────────────┘
```

### Trace

```
  x = 10  →  [10]
  x =  9  →  [ 9]                 replace 10 (9 is a smaller tail)
  x =  2  →  [ 2]                 replace 9
  x =  5  →  [ 2,  5]             append
  x =  3  →  [ 2,  3]             replace 5
  x =  7  →  [ 2,  3,  7]         append
  x = 101 →  [ 2,  3,  7, 101]    append
  x = 18  →  [ 2,  3,  7,  18]    replace 101

  length(tails) = 4 ✅
```

> ⚠️ `tails` is **not** the actual LIS. Only its **length** is the answer.
> `tails` is always sorted, which is why binary search works.

### Pseudocode: O(n log n)

```
function LIS_fast(nums):
    tails ← empty list
    for each x in nums:
        k ← lowerBound(tails, x)     // first index with tails[k] ≥ x
        if k == length(tails):
            append x to tails
        else:
            tails[k] ← x
    return length(tails)
```

### 📌 Points to remember
- **"Ending at i"** state → answer is the **max over all i**.
- Strictly increasing → `lowerBound` (≥ x). Non-decreasing → `upperBound` (> x).
- O(n²) is fine for n ≤ ~2500. Go O(n log n) beyond that.
- Family: Russian Doll Envelopes, Longest Chain, Box Stacking.

---

## 7. Number of Longest Increasing Subsequence (Medium)

### Problem
Return **how many** LIS's exist (all with the maximum length).

### Idea: track TWO arrays

```
   len[i]  = LIS length ending at i          (same as problem 6)
   cnt[i]  = HOW MANY LIS's of length len[i] end at i

   Like LIS, but every cell also carries a counter:

        ┌───────────┐
        │ len │ cnt │   ← each cell holds a pair
        └───────────┘
```

### The update rule (the heart of it)

```
  For each j < i with nums[j] < nums[i]:

    candidate = len[j] + 1

    ┌─────────────────────────────┬─────────────────────────────────┐
    │ candidate > len[i]          │ NEW record!                     │
    │                             │   len[i] ← candidate            │
    │                             │   cnt[i] ← cnt[j]   (reset)     │
    ├─────────────────────────────┼─────────────────────────────────┤
    │ candidate == len[i]         │ ANOTHER way to tie the record   │
    │                             │   cnt[i] ← cnt[i] + cnt[j] (add)│
    ├─────────────────────────────┼─────────────────────────────────┤
    │ candidate < len[i]          │ ignore                          │
    └─────────────────────────────┴─────────────────────────────────┘
```

### Trace (nums = [1, 3, 5, 4, 7])

```
  i     :   0      1      2      3      4
  nums  :   1      3      5      4      7
          ┌──────┬──────┬──────┬──────┬──────┐
  len   : │  1   │  2   │  3   │  3   │  4   │
  cnt   : │  1   │  1   │  1   │  1   │  2   │
          └──────┴──────┴──────┴──────┴──────┘

  i=4 (7):  j=0 (1): cand=2 > 1  → len=2, cnt=1
            j=1 (3): cand=3 > 2  → len=3, cnt=1
            j=2 (5): cand=4 > 3  → len=4, cnt=cnt[2]=1
            j=3 (4): cand=4 == 4 → cnt += cnt[3] → 2

  maxLen = 4  → sum of cnt where len == 4 → 2 ✅
      1 → 3 → 5 → 7
      1 → 3 → 4 → 7
```

### Pseudocode: O(n²)

```
function findNumberOfLIS(nums):
    len ← array of n, all 1
    cnt ← array of n, all 1
    for i from 0 to n-1:
        for j from 0 to i-1:
            if nums[j] < nums[i]:
                if len[j] + 1 > len[i]:
                    len[i] ← len[j] + 1
                    cnt[i] ← cnt[j]
                else if len[j] + 1 == len[i]:
                    cnt[i] ← cnt[i] + cnt[j]
    maxLen ← max(len)
    return sum of cnt[i] where len[i] == maxLen
```

### 📌 Points to remember
- **Reset on a new record, add on a tie.** This "best + count of best" pattern is reusable.
- Final answer sums over **every** index with the max length, not only the last.
- Edge: `[2,2,2,2,2]` → every element is an LIS of length 1 → answer **5**.
- Advanced: O(n log n) is possible with a Segment Tree / BIT storing `(maxLen, count)` pairs.

---

## 8. Count of Range Sum (Hard)

### Problem
Count pairs `(i, j)` with `i ≤ j` such that `lower ≤ sum(nums[i..j]) ≤ upper`.

> This one sits in the "linear" family because it is built on a **1D prefix-sum array**.
> The hard part is **counting fast**, which needs divide and conquer.

### Step 1: turn range sums into prefix-sum differences

```
   nums   =      [ -2 ,  5 , -1 ]
   P      = [ 0 ,  -2 ,  3 ,  2 ]       P[k] = sum of first k numbers
             P0    P1    P2    P3

   sum(nums[i..j])  =  P[j+1] − P[i]

   So the question becomes:
   ┌─────────────────────────────────────────────────────────┐
   │ Count pairs a < b where   lower ≤ P[b] − P[a] ≤ upper   │
   └─────────────────────────────────────────────────────────┘
```

### Brute force (to understand it)

```
  lower = -2, upper = 2

  pair (a,b) │ P[b]−P[a]  │ in [-2,2]?
  ───────────┼────────────┼───────────
   (0,1)     │ -2 − 0 = -2│   ✅
   (0,2)     │  3 − 0 =  3│   ❌
   (0,3)     │  2 − 0 =  2│   ✅
   (1,2)     │  3 + 2 =  5│   ❌
   (1,3)     │  2 + 2 =  4│   ❌
   (2,3)     │  2 − 3 = -1│   ✅
                             answer = 3  ✅

  O(n²) → too slow for n = 10⁵.
```

### Step 2: rearrange the inequality

```
   For a fixed b, I want how many earlier a satisfy:

       P[b] − upper  ≤  P[a]  ≤  P[b] − lower

   → "How many earlier values fall inside a WINDOW?"
   → This is a RANGE-COUNT query. Sorted data + two pointers / BIT does it fast.
```

### Step 3: Merge Sort counting (the classic solution)

```
   Split P in halves. Count pairs:
     (1) both in LEFT half    → recursion
     (2) both in RIGHT half   → recursion
     (3) a in LEFT, b in RIGHT → count while both halves are SORTED

            P = [ 0, -2 | 3, 2 ]
                ┌───────┴───────┐
           [0, -2]           [3, 2]
           ┌──┴──┐           ┌──┴──┐
          [0]  [-2]        [3]   [2]
          cross: -2−0=-2 ✅  cross: 2−3=-1 ✅
                 → 1                → 1
           sorted: [-2, 0]    sorted: [2, 3]

   Top-level cross count (left sorted [-2, 0], right sorted [2, 3]):

      left = -2 → need right in [-2-2, -2+2] = [-4, 0]  → none   (0)
      left =  0 → need right in [ 0-2,  0+2] = [-2, 2]  → {2}    (1)

   total = 1 + 1 + 1 = 3 ✅
```

### Why two pointers work in the cross step

```
  LEFT  (sorted):  l₀ ≤ l₁ ≤ l₂ ≤ ...
  RIGHT (sorted):  r₀ ≤ r₁ ≤ r₂ ≤ r₃ ≤ r₄ ...
                       ▲lo         ▲hi
                       └── window ──┘   r − l in [lower, upper]

  As l grows, the valid window on the right only slides RIGHT.
  → lo and hi never move backward → O(n) per merge level.
```

### Pseudocode

```
function countRangeSum(nums, lower, upper):
    P ← prefix sums with P[0] = 0      (size n+1, use 64-bit!)
    return sortAndCount(P, 0, n+1)

function sortAndCount(P, left, right):         // half-open [left, right)
    if right − left ≤ 1: return 0
    mid   ← (left + right) / 2
    count ← sortAndCount(P, left, mid) + sortAndCount(P, mid, right)

    lo ← mid, hi ← mid
    for a from left to mid−1:                  // left half is sorted
        while lo < right and P[lo] − P[a] <  lower: lo ← lo + 1
        while hi < right and P[hi] − P[a] ≤ upper: hi ← hi + 1
        count ← count + (hi − lo)

    merge the two sorted halves of P[left..right)
    return count
```

### Alternative: Fenwick Tree (BIT)

```
  Walk b from left to right:
     1. query BIT: how many stored P[a] lie in [P[b]−upper, P[b]−lower]
     2. insert P[b] into the BIT
  Values can be huge/negative → COORDINATE COMPRESS first (sort + rank).
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force | O(n²) | O(1) |
| **Merge sort** | **O(n log n)** | O(n) |
| BIT + compression | O(n log n) | O(n) |

### 📌 Points to remember
- **Range sum → prefix-sum difference.** This is the universal first move.
- Include `P[0] = 0`, or you miss subarrays that start at index 0.
- Use **64-bit** integers. Prefix sums overflow 32-bit.
- "Count pairs with a condition" + "order matters" → think **merge sort** or **BIT**.
- Related: Count of Smaller Numbers After Self, Reverse Pairs.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌────────────────────────┬───────────────────────────────────────────┬──────────────┬──────────┐
│ Problem                │ Recurrence / Core idea                    │ Answer       │ Best     │
├────────────────────────┼───────────────────────────────────────────┼──────────────┼──────────┤
│ Climbing Stairs        │ dp[i] = dp[i-1] + dp[i-2]                 │ dp[n]        │ O(n),O(1)│
│ Min Cost Climbing      │ dp[i] = min(dp[i-1]+c[i-1], dp[i-2]+c[i-2])│ dp[n]       │ O(n),O(1)│
│ House Robber           │ dp[i] = max(dp[i-1], dp[i-2]+nums[i])     │ dp[n-1]      │ O(n),O(1)│
│ House Robber II        │ max(rob[0..n-2], rob[1..n-1])             │ max of 2     │ O(n),O(1)│
│ Decode Ways            │ dp[i] = gate1·dp[i-1] + gate2·dp[i-2]     │ dp[n]        │ O(n),O(1)│
│ LIS                    │ dp[i] = 1 + max dp[j], nums[j] < nums[i]  │ max(dp)      │ O(nlogn) │
│ # of LIS               │ (len, cnt): reset on new max, add on tie  │ Σcnt@maxLen  │ O(n²)    │
│ Count of Range Sum     │ prefix sums + merge-sort window count     │ total count  │ O(nlogn) │
└────────────────────────┴───────────────────────────────────────────┴──────────────┴──────────┘
```

### Pattern family tree

```
                          1D / LINEAR DP
                                │
        ┌───────────────────────┼────────────────────────┐
        │                       │                        │
  "LOOK BACK k STEPS"     "LOOK BACK ALL j < i"    "PREFIX SUM + COUNT"
  (Fibonacci-like)        (Ending-at-i state)      (range queries)
        │                       │                        │
  ├─ Climbing Stairs      ├─ LIS                   └─ Count of Range Sum
  ├─ Min Cost Climbing    └─ Number of LIS
  ├─ House Robber
  ├─ House Robber II  (circle → 2 lines)
  └─ Decode Ways      (stairs with gates)

  Look-back k  → O(n) time,  O(1) space (rolling vars)
  Look-back all→ O(n²) time, optimize with binary search / BIT
```

### The operator tells you the question type

```
   ┌──────────────┬──────────────┬──────────────────────────┐
   │ Question     │ Combine with │ Example                  │
   ├──────────────┼──────────────┼──────────────────────────┤
   │ # of ways    │   +  (sum)   │ Stairs, Decode Ways      │
   │ min cost     │   min        │ Min Cost Climbing        │
   │ max value    │   max        │ House Robber, LIS        │
   │ possible?    │   OR         │ Word Break, Jump Game    │
   └──────────────┴──────────────┴──────────────────────────┘
```

### Optimization checklist

```
  ☐ Does dp[i] use only dp[i-1], dp[i-2]?      → Rolling variables, O(1) space
  ☐ Is it a circle?                            → Split into two linear runs
  ☐ Inner loop searches a SORTED structure?    → Binary search (LIS → n log n)
  ☐ Inner loop counts values in a range?       → BIT / Segment tree / Merge sort
  ☐ Is it a range-sum question?                → Prefix sums first
  ☐ Is recursion recomputing the same calls?   → Memoize
```

### 🚩 Common bugs to avoid

```
  ✗ Off-by-one: "top" is index n (Min Cost Climbing)
  ✗ Forgetting dp[0] = 1 for counting problems
  ✗ Returning dp[n-1] for "ending-at-i" problems (should be max over all)
  ✗ Decode Ways: treating '0' as valid or "05" as a valid pair
  ✗ House Robber II: n == 1 edge case
  ✗ # of LIS: overwriting cnt on a tie instead of adding
  ✗ Range Sum: missing P[0] = 0, or 32-bit overflow
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What was the LAST decision that got me to state i,     ║
   ║   and which smaller state was I in before it?"           ║
   ╚══════════════════════════════════════════════════════════╝
         Answer this, and the recurrence writes itself.
```

---

### ✅ Progress tracker

- [ ] Climbing Stairs (Easy)
- [ ] Min Cost Climbing Stairs (Easy)
- [ ] House Robber (Medium)
- [ ] House Robber II (Medium)
- [ ] Decode Ways (Medium)
- [ ] Longest Increasing Subsequence (Medium)
- [ ] Number of Longest Increasing Subsequence (Medium)
- [ ] Count of Range Sum (Hard)
