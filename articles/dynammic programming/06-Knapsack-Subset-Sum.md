# Knapsack / Subset Sum DP: A Visual Guide

> **Goal:** Learn to *see* knapsack problems, recognize which of the 4 variants you face,
> and pick the right **loop direction** and **loop order** without guessing.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-1D-Linear-DP.md](01-1D-Linear-DP.md) and [02-2D-Grid-DP.md](02-2D-Grid-DP.md).

---

## Table of Contents

0. [The Big Idea: What Is Knapsack DP?](#0-the-big-idea-what-is-knapsack-dp)
1. [0-1 Knapsack Problem (Medium)](#1-0-1-knapsack-problem-medium)
2. [Subset Sum (Medium)](#2-subset-sum-medium)
3. [Partition Equal Subset Sum (Medium)](#3-partition-equal-subset-sum-medium)
4. [Partitions with Given Difference (Medium)](#4-partitions-with-given-difference-medium)
5. [Target Sum (Medium)](#5-target-sum-medium)
6. [Coin Change (Medium)](#6-coin-change-medium)
7. [Coin Change II (Medium)](#7-coin-change-ii-medium)
8. [Combination Sum IV (Medium)](#8-combination-sum-iv-medium)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** 0-1 Knapsack → Subset Sum → Partition Equal → Given Difference → Target Sum
> → Coin Change → Coin Change II → Combination Sum IV.
> The first five are **0-1** (each item once). The last three are **unbounded** (reuse allowed).
> Problems 3, 4 and 5 are each **Subset Sum in disguise**.

---

## 0. The Big Idea: What Is Knapsack DP?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "KNAPSACK"                              │
├──────────────────────────────────────────────────────────────────┤
│  • A list of ITEMS (numbers, coins, weights)                     │
│  • A TARGET / CAPACITY / AMOUNT (a number you must hit or stay   │
│    under)                                                        │
│  • You CHOOSE a subset: each item is IN or OUT                   │
│  • "Can we reach X?"  "How many ways to make X?"                 │
│    "Fewest items to make X?"  "Max value within weight W?"       │
│  • Target is small enough to be an array index (≈ 10⁴ or less)   │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: an items × capacity table

```
                    capacity / target  →
                c=0   c=1   c=2   c=3   c=4   ...   c=W
              ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐
  no items    │base │base │base │base │base │ ... │base │
              ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
  item 1      │     │     │     │     │     │     │     │
              ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
  item 2      │     │     │  ?  │     │     │     │     │
              ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
  ...         │     │     │     │     │     │     │     │
              ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
  item n      │     │     │     │     │     │     │ ANS │
              └─────┴─────┴─────┴─────┴─────┴─────┴─────┘

  dp[i][c] = best answer using only the FIRST i items, with capacity / target c
```

### The decision at every item: TAKE or SKIP

```
                     item i (weight w, value v), capacity c
                   ┌───────────────┴───────────────┐
                 SKIP it                        TAKE it   (only if w ≤ c)
                   │                               │
             dp[i-1][c]                    dp[i-1][c-w]  ⊕  v
        (same capacity, one row up)   (capacity shrinks by w, one row up)

   In the table:
                  c-w           c
              ┌────────┬───┬────────┐
     row i-1  │ TAKE ● │...│ SKIP ● │
              └────────┴───┴───┬────┘
                    ╲          │
                     ╲         ▼
              ┌────────┬───┬────────┐
     row i    │        │...│   ?    │
              └────────┴───┴────────┘

   ? reads from the row ABOVE: straight up (skip) and up-left by w (take)
```

### The 4 variants (two axes)

```
                     ┌──────────────────────┬──────────────────────────┐
                     │  0-1 (each item once) │  UNBOUNDED (reuse items) │
  ┌──────────────────┼──────────────────────┼──────────────────────────┤
  │ BOOLEAN (can?)   │ Subset Sum           │ (can coins make X?)      │
  │   combine: OR    │ Partition Equal      │                          │
  ├──────────────────┼──────────────────────┼──────────────────────────┤
  │ COUNT (# ways)   │ Given Difference     │ Coin Change II  (combos) │
  │   combine: +     │ Target Sum           │ Combination Sum IV (perm)│
  ├──────────────────┼──────────────────────┼──────────────────────────┤
  │ MIN (fewest)     │                      │ Coin Change              │
  │   combine: min   │                      │                          │
  ├──────────────────┼──────────────────────┼──────────────────────────┤
  │ MAX (best value) │ 0-1 Knapsack         │ (unbounded knapsack)     │
  │   combine: max   │                      │                          │
  └──────────────────┴──────────────────────┴──────────────────────────┘

  Two questions decide everything:
    1. Can an item be used more than once?   → loop DIRECTION
    2. What does the question ask?           → combine OPERATOR + base case
```

### ⭐ THE KEY VISUAL: loop direction in a 1D array

Row `i` only reads row `i-1`, so one array is enough (same trick as grid DP).
But the direction you sweep the capacity decides **whether an item can be reused**.

```
  1D array: dp[c].  Item with weight w = 2.  Update: dp[c] uses dp[c-2].

  ─────────────── 0-1: sweep RIGHT → LEFT (high c to low c) ───────────────

   c:      0     1     2     3     4
         ┌─────┬─────┬─────┬─────┬─────┐
         │  T  │  F  │  F  │  F  │  F  │   before the item (only 0 is reachable)
         └─────┴─────┴─────┴─────┴─────┘
   c=4:  dp[4] |= dp[2] → F     (dp[2] still OLD ✓)
   c=3:  dp[3] |= dp[1] → F
   c=2:  dp[2] |= dp[0] → T
         ┌─────┬─────┬─────┬─────┬─────┐
         │  T  │  F  │  T  │  F  │  F  │   ✅ item used at most once
         └─────┴─────┴─────┴─────┴─────┘
                          ◄─────────────── sweep

   When you write dp[c], the cell you read (dp[c-w], to the LEFT)
   has NOT been touched yet → it is still "row i-1" → no reuse.

  ─────────────── UNBOUNDED: sweep LEFT → RIGHT (low c to high c) ─────────

   c=2:  dp[2] |= dp[0] → T     (just updated: item used once)
   c=3:  dp[3] |= dp[1] → F
   c=4:  dp[4] |= dp[2] → T     (dp[2] is NEW → item used AGAIN!)
         ┌─────┬─────┬─────┬─────┬─────┐
         │  T  │  F  │  T  │  F  │  T  │   ✅ 4 = 2 + 2 (reuse allowed)
         └─────┴─────┴─────┴─────┴─────┘
          ───────────────►  sweep

   When you write dp[c], dp[c-w] was ALREADY updated in this pass
   → it may already contain this item → reuse.
```

```
   ┌────────────────────────────────────────────────────────────────┐
   │  0-1        →  capacity HIGH → LOW   ( ◄── )  "read the past"  │
   │  UNBOUNDED  →  capacity LOW → HIGH   ( ──► )  "read the present"│
   └────────────────────────────────────────────────────────────────┘
   Use the wrong direction on 0-1 and you silently reuse items.
```

### ⭐ The second key visual: combinations vs permutations

Only matters for **counting** with unbounded items.

```
   ITEMS OUTER, capacity inner          CAPACITY OUTER, items inner
   ───────────────────────────          ────────────────────────────
   for each coin:                       for each amount a:
       for each amount a:                   for each coin:
           dp[a] += dp[a − coin]                dp[a] += dp[a − coin]

   Coins are added in a FIXED order     Any coin can be the LAST one,
   (all 1s first, then all 2s...)       at every amount
         │                                      │
   1+2 is counted, 2+1 is NOT            1+2 AND 2+1 both counted
         │                                      │
   COMBINATIONS (order doesn't matter)  PERMUTATIONS (order matters)
   → Coin Change II                     → Combination Sum IV
```

### The 5-step recipe (knapsack version)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  STATE        dp[c] = ____ for target / capacity c     │
 │ STEP 2  TRANSITION   skip ⊕ take   (⊕ = OR, +, min or max)    │
 │ STEP 3  BASE         dp[0]: OR → true, + → 1, min → 0, max → 0│
 │                      others: OR → false, + → 0, min → +∞      │
 │ STEP 4  ORDER        0-1 → c high→low ; unbounded → c low→high│
 │                      count perms → capacity loop OUTSIDE      │
 │ STEP 5  ANSWER       dp[target]  (or dp[W] for max value)     │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. 0-1 Knapsack Problem (Medium)

### Problem
`n` items, each with a `weight` and a `value`. A bag holds at most `W` weight.
Each item can be taken **at most once**. Maximize the total value.

### Visualize it

```
   🎒 capacity W = 7

   item:      A       B       C       D
   weight:    1       3       4       5
   value:     1       4       5       7

   B + C  →  weight 3 + 4 = 7,  value 4 + 5 = 9   ✅ best
   A + D  →  weight 1 + 5 = 6,  value 1 + 7 = 8
   D alone→  weight 5,          value 7
```

### Why greedy fails 🚫

```
   "Take the best value-per-weight first":
      A: 1.00   B: 1.33   C: 1.25   D: 1.40   ← D looks best
   Take D (w=5, v=7) → 2 capacity left → take A (w=1, v=1) → total 8 ❌

   Items can't be split, so a locally "efficient" item can waste space.
   (Greedy only works for FRACTIONAL knapsack.)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][c]` = max value using the first `i` items with capacity `c` |
| Transition | `dp[i][c] = max(dp[i-1][c], dp[i-1][c-w] + v)` (take only if `w ≤ c`) |
| Base | `dp[0][c] = 0` (no items → no value) |
| Order | items top → bottom; any capacity order in 2D (high → low in 1D) |
| Answer | `dp[n][W]` |

### Trace (W = 7)

```
                       c:  0   1   2   3   4   5   6   7
                         ┌───┬───┬───┬───┬───┬───┬───┬───┐
  no items               │ 0 │ 0 │ 0 │ 0 │ 0 │ 0 │ 0 │ 0 │
                         ├───┼───┼───┼───┼───┼───┼───┼───┤
  A (w=1, v=1)           │ 0 │ 1 │ 1 │ 1 │ 1 │ 1 │ 1 │ 1 │
                         ├───┼───┼───┼───┼───┼───┼───┼───┤
  B (w=3, v=4)           │ 0 │ 1 │ 1 │ 4 │ 5 │ 5 │ 5 │ 5 │
                         ├───┼───┼───┼───┼───┼───┼───┼───┤
  C (w=4, v=5)           │ 0 │ 1 │ 1 │ 4 │ 5 │ 6 │ 6 │ 9 │
                         ├───┼───┼───┼───┼───┼───┼───┼───┤
  D (w=5, v=7)           │ 0 │ 1 │ 1 │ 4 │ 5 │ 7 │ 8 │ 9 │ ✅
                         └───┴───┴───┴───┴───┴───┴───┴───┘

  Row B, c=4:  max( skip=1 , take: row A[c=1] + 4 = 5 )    = 5
  Row C, c=7:  max( skip=5 , take: row B[c=3] + 5 = 9 )    = 9   ← B + C
  Row D, c=6:  max( skip=6 , take: row C[c=1] + 7 = 8 )    = 8   ← A + D
  Row D, c=7:  max( skip=9 , take: row C[c=2] + 7 = 8 )    = 9   ✅
```

### Pseudocode (1D, O(W) space)

```
function knapsack01(weights, values, W):
    dp ← array of W+1, all 0
    for each item (w, v):
        for c from W down to w:                // ◄── RIGHT → LEFT (0-1!)
            dp[c] ← max(dp[c], dp[c − w] + v)
    return dp[W]
```

### Recovering which items were taken

```
  Keep the 2D table. Start at (n, W) and walk up:
     if dp[i][c] == dp[i-1][c]  → item i was SKIPPED, go up
     else                        → item i was TAKEN, go up and left by w

  (4,7): 9 == 9 above  → skip D
  (3,7): 9 ≠ 5 above   → take C, c = 7−4 = 3
  (2,3): 4 ≠ 1 above   → take B, c = 3−3 = 0     → {B, C} ✅
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every subset | O(2ⁿ) | O(n) |
| Memo on (i, c) | O(n·W) | O(n·W) |
| 2D table | O(n·W) | O(n·W) |
| **1D array, c high → low** | **O(n·W)** | **O(W)** ✅ |

> ⚠️ O(n·W) is **pseudo-polynomial**: it depends on the *value* of W, not its size.
> If W is 10⁹, this DP is useless. Look for another angle (e.g., DP over value instead).

### 📌 Points to remember
- This is the **template** for every 0-1 problem in this file.
- 1D version: capacity loop goes **high → low**. Always.
- Inner loop stops at `w`, which skips capacities the item can't fit.
- Unbounded knapsack (reuse items) = the same code with capacity **low → high**.

---

## 2. Subset Sum (Medium)

### Problem
Given non-negative integers `nums` and a `target`, is there a subset whose sum is exactly `target`?

### Visualize it

```
   nums = [ 3,  4,  5,  2 ],   target = 6

            ✗   ✓   ✗   ✓      4 + 2 = 6   ✅ true
```

### 0-1 Knapsack with booleans

```
        0-1 Knapsack                           Subset Sum
   dp[c] = max( skip, take + v )     ──►   dp[c] = skip OR take
   "best value at capacity c"              "can I make EXACTLY c?"

   dp[c] = dp[c]  OR  dp[c − x]
            ▲            ▲
       reachable    reachable before, and x bridges the gap
       without x
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[c]` = true if some subset of items seen so far sums to `c` |
| Transition | `dp[c] = dp[c] OR dp[c − x]` |
| Base | `dp[0] = true` (empty subset), all others false |
| Order | for each number, `c` from target **down to** `x` |
| Answer | `dp[target]` |

### Trace (nums = [3, 4, 5, 2], target = 6)

```
                 c:   0    1    2    3    4    5    6
                    ┌────┬────┬────┬────┬────┬────┬────┐
  start             │ T  │ F  │ F  │ F  │ F  │ F  │ F  │
                    ├────┼────┼────┼────┼────┼────┼────┤
  after x = 3       │ T  │ F  │ F  │ T  │ F  │ F  │ F  │   3 ← 0
                    ├────┼────┼────┼────┼────┼────┼────┤
  after x = 4       │ T  │ F  │ F  │ T  │ T  │ F  │ F  │   4 ← 0
                    ├────┼────┼────┼────┼────┼────┼────┤
  after x = 5       │ T  │ F  │ F  │ T  │ T  │ T  │ F  │   5 ← 0
                    ├────┼────┼────┼────┼────┼────┼────┤
  after x = 2       │ T  │ F  │ T  │ T  │ T  │ T  │ T  │   6 ← 4, 5 ← 3, 2 ← 0
                    └────┴────┴────┴────┴────┴────┴────┘
                                                    ✅ dp[6] = true

  Think of it as "the set of reachable sums" growing:
     {0} → {0,3} → {0,3,4} → {0,3,4,5} → {0,2,3,4,5,6}
```

### Pseudocode

```
function subsetSum(nums, target):
    dp ← array of target+1, all false
    dp[0] ← true
    for each x in nums:
        for c from target down to x:           // ◄── 0-1
            dp[c] ← dp[c] OR dp[c − x]
        if dp[target]: return true             // optional early exit
    return dp[target]
```

### 📌 Points to remember
- `dp[0] = true`: the empty subset always sums to 0.
- Boolean DP → combine with **OR**.
- Bonus: a bitset makes this very fast: `bits ← bits OR (bits << x)`.
- This one problem is the engine behind problems 3, 4 and 5.

---

## 3. Partition Equal Subset Sum (Medium)

### Problem
Can `nums` be split into **two subsets with equal sums**?

### The reduction

```
   ┌───────────────────────────┬───────────────────────────┐
   │        subset S1          │        subset S2          │
   │        sum = s1           │        sum = s2           │
   └───────────────────────────┴───────────────────────────┘

        s1 = s2   and   s1 + s2 = total
        ⇒  s1 = total / 2

   ┌───────────────────────────────────────────────────────────┐
   │ "Equal partition?"  ≡  "Subset Sum with target total/2?"  │
   │  If total is ODD → impossible → false immediately.        │
   └───────────────────────────────────────────────────────────┘

   Why it's enough: if S1 sums to total/2, the LEFTOVER
   items automatically sum to total/2 too.
```

### Trace (nums = [1, 5, 11, 5])

```
   total = 22  → even → target = 11

                 c:  0  1  2  3  4  5  6  7  8  9 10 11
                   ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
  start            │T │  │  │  │  │  │  │  │  │  │  │  │
  after 1          │T │T │  │  │  │  │  │  │  │  │  │  │
  after 5          │T │T │  │  │  │T │T │  │  │  │  │  │
  after 11         │T │T │  │  │  │T │T │  │  │  │  │T │
  after 5          │T │T │  │  │  │T │T │  │  │  │T │T │
                   └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
                   (blank = F)                         ✅ dp[11] = true

   {11}  |  {1, 5, 5}      both sum to 11

   Counter-example: [1, 2, 3, 5] → total 11 is odd → false (no DP needed)
```

### Pseudocode

```
function canPartition(nums):
    total ← sum(nums)
    if total is odd: return false
    return subsetSum(nums, total / 2)          // problem 2, unchanged
```

### 📌 Points to remember
- **Odd total → false.** Check this first.
- If any single number is greater than `total/2` → false (quick exit).
- Time O(n · total/2), Space O(total/2).
- The pattern: **turn a "two groups" question into "one group hits a target"**.

---

## 4. Partitions with Given Difference (Medium)

### Problem
Count the ways to split `arr` into two subsets `S1` and `S2` such that `sum(S1) − sum(S2) = d` (with `sum(S1) ≥ sum(S2)`).

### The reduction (2 equations, 2 unknowns)

```
        s1 − s2 = d
        s1 + s2 = total
       ─────────────────  add them
        2·s1    = total + d

   ┌───────────────────────────────────────────────────────────┐
   │   s1 = (total + d) / 2                                    │
   │   "Count partitions with difference d"                    │
   │      ≡  "COUNT subsets with sum (total + d) / 2"          │
   └───────────────────────────────────────────────────────────┘

   Validity checks (otherwise answer = 0):
     • d ≤ total             (s2 can't be negative)
     • (total + d) is EVEN   (s1 must be an integer)
```

### Counting version of Subset Sum

```
        Subset Sum (can?)                  Count Subsets (how many?)
   dp[c] = dp[c] OR dp[c − x]      ──►   dp[c] = dp[c] + dp[c − x]
   dp[0] = true                          dp[0] = 1
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[c]` = number of subsets (of items seen so far) with sum `c` |
| Transition | `dp[c] = dp[c] + dp[c − x]` |
| Base | `dp[0] = 1` |
| Order | for each number, `c` from target **down to** `x` |
| Answer | `dp[(total + d) / 2]` |

### Trace (arr = [1, 1, 2, 3], d = 1)

```
   total = 7  →  s1 = (7 + 1) / 2 = 4

                 c:   0    1    2    3    4
                    ┌────┬────┬────┬────┬────┐
  start             │ 1  │ 0  │ 0  │ 0  │ 0  │
                    ├────┼────┼────┼────┼────┤
  after 1           │ 1  │ 1  │ 0  │ 0  │ 0  │
                    ├────┼────┼────┼────┼────┤
  after 1           │ 1  │ 2  │ 1  │ 0  │ 0  │   two different 1s → 2 ways to make 1
                    ├────┼────┼────┼────┼────┤
  after 2           │ 1  │ 2  │ 2  │ 2  │ 1  │   dp[4] += dp[2]=1, dp[3] += dp[1]=2
                    ├────┼────┼────┼────┼────┤
  after 3           │ 1  │ 2  │ 2  │ 3  │ 3  │   dp[4] += dp[1]=2, dp[3] += dp[0]=1
                    └────┴────┴────┴────┴────┘
                                          ✅ 3

   The 3 partitions (S1 sums to 4, S2 sums to 3):
     {1ₐ, 3}     | {1ᵦ, 2}
     {1ᵦ, 3}     | {1ₐ, 2}
     {1ₐ, 1ᵦ, 2} | {3}
```

### Pseudocode

```
function countPartitions(arr, d):
    total ← sum(arr)
    if d > total or (total + d) is odd: return 0
    target ← (total + d) / 2
    dp ← array of target+1, all 0
    dp[0] ← 1
    for each x in arr:
        for c from target down to x:           // ◄── 0-1 (x = 0 is fine, see below)
            dp[c] ← dp[c] + dp[c − x]
    return dp[target]
```

### 📌 Points to remember
- **Two equations → one target.** Then it is plain "count subsets with sum T".
- Equal numbers in different positions are **different items** (1ₐ vs 1ᵦ).
- **Zeros:** with `dp[0] = 1` and the loop going down to `c = x = 0`, `dp[c] += dp[c]` doubles the count. That is correct: each zero can go in either subset.
- Many versions ask for the answer modulo 10⁹+7.

---

## 5. Target Sum (Medium)

### Problem
Put a `+` or `−` in front of every number in `nums`. Count the ways the expression equals `target`.

### Visualize it

```
   nums = [1, 1, 1, 1, 1],  target = 3

   −1 +1 +1 +1 +1 = 3
   +1 −1 +1 +1 +1 = 3
   +1 +1 −1 +1 +1 = 3          5 ways ✅
   +1 +1 +1 −1 +1 = 3
   +1 +1 +1 +1 −1 = 3
```

### The reduction: it's Given Difference in disguise

```
   Split the numbers:  P = numbers with "+",  N = numbers with "−"

        sum(P) − sum(N) = target
        sum(P) + sum(N) = total
       ───────────────────────────
        sum(P) = (total + target) / 2

   ┌──────────────────────────────────────────────────────────┐
   │ "Count sign assignments"                                 │
   │   ≡ "COUNT subsets with sum (total + target) / 2"        │
   │   ≡ Partitions with Given Difference, with d = target    │
   └──────────────────────────────────────────────────────────┘

   Validity checks (otherwise answer = 0):
     • |target| ≤ total
     • (total + target) is EVEN
```

### Two ways to see it

```
  DIRECT (brute-force tree, 2ⁿ leaves)       REDUCED (count subsets)

            0                                 dp over sums 0 .. (total+target)/2
        +1/   \−1                             O(n · total) time, O(total) space
         1     −1
       /  \   /  \
      2    0 0   −2      ...
  Memo on (index, running sum) works too,
  with offset sums (they can be negative).
```

### Trace (nums = [1, 1, 1, 1, 1], target = 3)

```
   total = 5  →  P = (5 + 3) / 2 = 4

                 c:   0    1    2    3    4
                    ┌────┬────┬────┬────┬────┐
  start             │ 1  │ 0  │ 0  │ 0  │ 0  │
  after 1           │ 1  │ 1  │ 0  │ 0  │ 0  │
  after 1           │ 1  │ 2  │ 1  │ 0  │ 0  │
  after 1           │ 1  │ 3  │ 3  │ 1  │ 0  │
  after 1           │ 1  │ 4  │ 6  │ 4  │ 1  │
  after 1           │ 1  │ 5  │ 10 │ 10 │ 5  │   ← Pascal's triangle!
                    └────┴────┴────┴────┴────┘
                                          ✅ 5  (choose which 4 of 5 get "+")
```

### Zeros are handled for free

```
   nums = [0, 0, 1],  target = 1  →  total = 1, P = (1 + 1) / 2 = 1

                 c:   0    1
  start             │ 1  │ 0  │
  after 0           │ 2  │ 0  │   dp[0] += dp[0]   (+0 or −0)
  after 0           │ 4  │ 0  │   dp[0] += dp[0]
  after 1           │ 4  │ 4  │   dp[1] += dp[0]   ✅ 4  (±0, ±0, +1)
```

### Pseudocode

```
function findTargetSumWays(nums, target):
    total ← sum(nums)
    if |target| > total or (total + target) is odd: return 0
    P ← (total + target) / 2
    dp ← array of P+1, all 0
    dp[0] ← 1
    for each x in nums:
        for c from P down to x:                // ◄── 0-1, include c = x even when x = 0
            dp[c] ← dp[c] + dp[c − x]
    return dp[P]
```

### 📌 Points to remember
- **"+/− signs" → split into two groups → subset sum.** Learn to spot this disguise.
- Check `|target| ≤ total` **and** parity before building the array.
- A negative `target` is fine: `(total + target)/2` is still ≥ 0 after the check.
- Zeros double the count. The counting DP does that automatically.

---

## 6. Coin Change (Medium)

### Problem
Coins of given denominations, **unlimited supply** of each. Find the **fewest coins** that make `amount` (or −1 if impossible).

### Visualize it

```
   coins = [1, 2, 5],  amount = 11

   5 + 5 + 1         = 3 coins  ✅
   5 + 2 + 2 + 2     = 4 coins
   1 × 11            = 11 coins
```

### Why greedy fails 🚫

```
   coins = [1, 3, 4],  amount = 6

   Greedy (biggest first):  4 + 1 + 1  = 3 coins ❌
   Optimal:                 3 + 3      = 2 coins ✅
```

### Think in "last coin"

```
                         fewest(a)
           ┌─────────────────┼─────────────────┐
     last coin = 1     last coin = 2     last coin = 5
           │                 │                 │
     fewest(a−1)+1     fewest(a−2)+1     fewest(a−5)+1

        dp[a] = 1 + min( dp[a − coin] )   over coins ≤ a

   ← This is Climbing Stairs where the step sizes are the coins,
     and you minimize instead of count.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[a]` = fewest coins to make amount `a` |
| Transition | `dp[a] = min(dp[a], dp[a − coin] + 1)` |
| Base | `dp[0] = 0`; all others `+∞` (unreachable) |
| Order | amount **low → high** (unbounded: reuse coins) |
| Answer | `dp[amount]`, or −1 if still `+∞` |

### Trace (coins = [1, 2, 5], amount = 11)

```
  a     :  0   1   2   3   4   5   6   7   8   9   10  11
         ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
  dp[a] :│ 0 │ 1 │ 1 │ 2 │ 2 │ 1 │ 2 │ 2 │ 3 │ 3 │ 2 │ 3 │
         └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘

  dp[5]  = min( dp[4]+1, dp[3]+1, dp[0]+1 ) = min(3, 3, 1) = 1   (one 5)
  dp[8]  = min( dp[7]+1, dp[6]+1, dp[3]+1 ) = min(3, 3, 3) = 3
  dp[10] = min( dp[9]+1, dp[8]+1, dp[5]+1 ) = min(4, 4, 2) = 2   (5+5)
  dp[11] = min( dp[10]+1, dp[9]+1, dp[6]+1) = min(3, 4, 3) = 3   ✅ (5+5+1)
```

### Pseudocode

```
function coinChange(coins, amount):
    dp ← array of amount+1, all +∞
    dp[0] ← 0
    for each coin in coins:
        for a from coin to amount:             // ──► LOW → HIGH (unbounded)
            dp[a] ← min(dp[a], dp[a − coin] + 1)
    return (dp[amount] == +∞) ? −1 : dp[amount]
```

> For a **min** question, loop order (coins outer vs amount outer) doesn't matter.
> It only matters when **counting** (see problems 7 and 8).

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Plain recursion | exponential | O(amount) |
| Memo / table | O(n · amount) | O(amount) ✅ |
| BFS over amounts (each level = one more coin) | O(n · amount) | O(amount) |

### 📌 Points to remember
- **Unbounded → amount loop goes low → high.**
- Use `+∞` (or `amount + 1`) for "unreachable", and be careful that `+∞ + 1` doesn't overflow.
- `amount = 0` → answer 0, not −1.
- Min / max problems don't care about combination vs permutation.

---

## 7. Coin Change II (Medium)

### Problem
Coins with **unlimited supply**. Count the number of **combinations** that make `amount`.
`1+2` and `2+1` are the **same** combination.

### Visualize it

```
   coins = [1, 2, 5],  amount = 5

   5
   2 + 2 + 1
   2 + 1 + 1 + 1          4 combinations ✅
   1 + 1 + 1 + 1 + 1
```

### Why "coins outer" counts each combination once

```
   Process coins ONE TYPE AT A TIME.
   Every combination is built in sorted order: all 1s, then all 2s, then all 5s.

   pass coin=1:   ways using only {1}
   pass coin=2:   ways using only {1, 2}      ← 2s always come after 1s
   pass coin=5:   ways using only {1, 2, 5}   ← 5s always come last

   So "2 + 1" is never built separately from "1 + 2".
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[a]` = combinations making `a` using the coin types seen so far |
| Transition | `dp[a] = dp[a] + dp[a − coin]` |
| Base | `dp[0] = 1` (one way to make 0: no coins) |
| Order | **coins outer**, amount inner **low → high** |
| Answer | `dp[amount]` |

### Trace (coins = [1, 2, 5], amount = 5)

```
                 a:   0    1    2    3    4    5
                    ┌────┬────┬────┬────┬────┬────┐
  start             │ 1  │ 0  │ 0  │ 0  │ 0  │ 0  │
                    ├────┼────┼────┼────┼────┼────┤
  after coin 1      │ 1  │ 1  │ 1  │ 1  │ 1  │ 1  │   only 1s: one way each
                    ├────┼────┼────┼────┼────┼────┤
  after coin 2      │ 1  │ 1  │ 2  │ 2  │ 3  │ 3  │   dp[4] = 1 + dp[2](2) = 3
                    ├────┼────┼────┼────┼────┼────┤
  after coin 5      │ 1  │ 1  │ 2  │ 2  │ 3  │ 4  │   dp[5] = 3 + dp[0](1) = 4
                    └────┴────┴────┴────┴────┴────┘
                                               ✅ 4
```

### Pseudocode

```
function change(amount, coins):
    dp ← array of amount+1, all 0
    dp[0] ← 1
    for each coin in coins:                    // COINS OUTER → combinations
        for a from coin to amount:             // ──► LOW → HIGH (unbounded)
            dp[a] ← dp[a] + dp[a − coin]
    return dp[amount]
```

### 📌 Points to remember
- **Coins outer = combinations.** Swap the loops and you get problem 8 (a different answer!).
- `dp[0] = 1`, even when `amount = 0` → answer 1.
- Unbounded → amount **low → high**.
- 2D view: `dp[i][a] = dp[i-1][a] + dp[i][a − coin]`. Note "take" stays in **row i** (reuse), while 0-1 goes to row i-1.

---

## 8. Combination Sum IV (Medium)

### Problem
Distinct positive `nums`, unlimited reuse. Count the **ordered sequences** that sum to `target`.
Despite the name, `1+2` and `2+1` are **different** here. It counts permutations.

### Visualize it

```
   nums = [1, 2, 3],  target = 4

   1+1+1+1   1+1+2   1+2+1   2+1+1
   2+2       1+3     3+1                 7 sequences ✅
```

### Think in "last number": Climbing Stairs again!

```
                         ways(t)
           ┌────────────────┼────────────────┐
       last = 1         last = 2         last = 3
           │                │                │
       ways(t−1)        ways(t−2)        ways(t−3)

       dp[t] = Σ dp[t − x]   over x in nums, x ≤ t

   This is EXACTLY Climbing Stairs with step sizes {1, 2, 3}.
   Climbing Stairs counts ORDERED step sequences → permutations.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[t]` = number of ordered sequences that sum to `t` |
| Transition | `dp[t] = Σ dp[t − x]` over every `x ≤ t` |
| Base | `dp[0] = 1` |
| Order | **target outer** (low → high), nums inner |
| Answer | `dp[target]` |

### Trace (nums = [1, 2, 3], target = 4)

```
  t     :   0    1    2    3    4
          ┌────┬────┬────┬────┬────┐
  dp[t] : │ 1  │ 1  │ 2  │ 4  │ 7  │
          └────┴────┴────┴────┴────┘

  dp[1] = dp[0]                 = 1
  dp[2] = dp[1] + dp[0]         = 2
  dp[3] = dp[2] + dp[1] + dp[0] = 4
  dp[4] = dp[3] + dp[2] + dp[1] = 4 + 2 + 1 = 7  ✅
```

### Pseudocode

```
function combinationSum4(nums, target):
    dp ← array of target+1, all 0
    dp[0] ← 1
    for t from 1 to target:                    // TARGET OUTER → permutations
        for each x in nums:
            if x ≤ t:
                dp[t] ← dp[t] + dp[t − x]
    return dp[target]
```

### ⭐ Side by side: Coin Change II vs Combination Sum IV

Same items `[1, 2]`, same target `3`, same update line. Only the loop nesting differs.

```
  ┌──────────────────────────────────┬───────────────────────────────────┐
  │ COIN CHANGE II (combinations)    │ COMBINATION SUM IV (permutations) │
  │                                  │                                   │
  │ for each coin:                   │ for t from 1 to target:           │
  │     for a from coin to target:   │     for each x in nums:           │
  │         dp[a] += dp[a − coin]    │         if x ≤ t:                 │
  │                                  │             dp[t] += dp[t − x]    │
  ├──────────────────────────────────┼───────────────────────────────────┤
  │ a:        0   1   2   3          │ t:        0   1   2   3           │
  │ start   [ 1,  0,  0,  0 ]        │ dp[0] = 1                         │
  │ coin 1  [ 1,  1,  1,  1 ]        │ dp[1] = dp[0]         = 1         │
  │ coin 2  [ 1,  1,  2,  2 ]        │ dp[2] = dp[1] + dp[0] = 2         │
  │                                  │ dp[3] = dp[2] + dp[1] = 3         │
  ├──────────────────────────────────┼───────────────────────────────────┤
  │ answer = 2                       │ answer = 3                        │
  │   1 + 1 + 1                      │   1 + 1 + 1                       │
  │   1 + 2         (2+1 = same)     │   1 + 2                           │
  │                                  │   2 + 1         (counted apart!)  │
  └──────────────────────────────────┴───────────────────────────────────┘

   Rule:  COINS outside  → each coin type is "locked in" before the next
                           → one fixed order → COMBINATIONS
          TARGET outside → at every amount, ANY item can be last
                           → every order → PERMUTATIONS
```

### 📌 Points to remember
- **Target outer = permutations.** This is the one problem where you put the capacity loop outside.
- It's really Climbing Stairs with custom step sizes.
- Intermediate values can overflow 32-bit even when the final answer fits. Use 64-bit or unsigned.
- Follow-up: if negatives were allowed, sequences like `+1 −1 +1 −1 ...` give infinite answers unless the length is capped.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────┬────────────┬──────────────────────────────────┬────────────────────┬──────────┐
│ Problem              │ Variant    │ Core line                        │ Target / answer    │ Loop     │
├──────────────────────┼────────────┼──────────────────────────────────┼────────────────────┼──────────┤
│ 0-1 Knapsack         │ 0-1  max   │ dp[c] = max(dp[c], dp[c−w] + v)  │ dp[W]              │ c ◄──    │
│ Subset Sum           │ 0-1  bool  │ dp[c] = dp[c] OR dp[c−x]         │ dp[target]         │ c ◄──    │
│ Partition Equal      │ 0-1  bool  │ Subset Sum                       │ total/2 (odd→F)    │ c ◄──    │
│ Given Difference     │ 0-1  count │ dp[c] += dp[c−x]                 │ (total+d)/2        │ c ◄──    │
│ Target Sum           │ 0-1  count │ dp[c] += dp[c−x]                 │ (total+target)/2   │ c ◄──    │
│ Coin Change          │ unb. min   │ dp[a] = min(dp[a], dp[a−c] + 1)  │ dp[amount] or −1   │ a ──►    │
│ Coin Change II       │ unb. count │ dp[a] += dp[a−c]   (coins outer) │ dp[amount]         │ a ──►    │
│ Combination Sum IV   │ unb. count │ dp[t] += dp[t−x]   (target outer)│ dp[target]         │ t ──►    │
└──────────────────────┴────────────┴──────────────────────────────────┴────────────────────┴──────────┘
  All: O(n × target) time, O(target) space.
```

### Pattern family tree

```
                              KNAPSACK / SUBSET SUM
                                       │
               ┌───────────────────────┴───────────────────────┐
               │                                               │
        0-1  (each item once)                       UNBOUNDED (reuse items)
        capacity HIGH → LOW  ◄──                    capacity LOW → HIGH  ──►
               │                                               │
     ┌─────────┼──────────┐                      ┌─────────────┼──────────────┐
     │         │          │                      │             │              │
    MAX       BOOL      COUNT                   MIN          COUNT          COUNT
     │         │          │                      │       (coins outer)  (target outer)
  0-1 Knap. Subset Sum  Count subsets         Coin Change  Coin Change II  Comb. Sum IV
               │          │                                combinations   permutations
               │          ├─ Given Difference  s1 = (total + d) / 2
               │          └─ Target Sum        P  = (total + target) / 2
               └─ Partition Equal              target = total / 2
```

### Loop-order card

```
   ┌──────────────────────────────┬───────────────────────┬──────────────────────┐
   │ Situation                    │ Outer loop            │ Inner loop           │
   ├──────────────────────────────┼───────────────────────┼──────────────────────┤
   │ 0-1 (any question)           │ items                 │ capacity HIGH → LOW  │
   │ Unbounded, min / max / bool  │ either                │ capacity LOW → HIGH  │
   │ Unbounded, count COMBINATIONS│ items                 │ capacity LOW → HIGH  │
   │ Unbounded, count PERMUTATIONS│ capacity LOW → HIGH   │ items                │
   └──────────────────────────────┴───────────────────────┴──────────────────────┘
```

### Base-case card

```
   ┌──────────────┬──────────────┬──────────────────┐
   │ Question     │ dp[0]        │ all other dp[c]  │
   ├──────────────┼──────────────┼──────────────────┤
   │ can? (OR)    │ true         │ false            │
   │ # ways (+)   │ 1            │ 0                │
   │ fewest (min) │ 0            │ +∞               │
   │ best (max)   │ 0            │ 0  (≤ capacity)  │
   │              │              │ −∞ (EXACT fill)  │
   └──────────────┴──────────────┴──────────────────┘
```

### Reduction checklist

```
  ☐ "Split into two groups with equal sum"       → target = total / 2
  ☐ "Two groups with difference d"               → target = (total + d) / 2
  ☐ "Assign + / − signs"                         → target = (total + target) / 2
  ☐ Before any of these: parity even? within total? else → 0 / false
  ☐ "Fewest items to reach X" with reuse         → Coin Change (min, ──►)
  ☐ "How many ways", order doesn't matter        → items outer
  ☐ "How many ways", order matters               → capacity outer
  ☐ Target huge (10⁹)?                           → this DP won't fit; rethink
```

### 🚩 Common bugs to avoid

```
  ✗ 0-1 problem with capacity loop LOW → HIGH → items silently reused
  ✗ Coin Change II with target outer → counts permutations (too many)
  ✗ Combination Sum IV with coins outer → counts combinations (too few)
  ✗ Forgetting dp[0] = 1 (count) / true (bool) / 0 (min)
  ✗ Coin Change: +∞ + 1 overflow; returning +∞ instead of −1
  ✗ Partition Equal: not checking for an odd total
  ✗ Target Sum / Given Difference: skipping the parity or |target| ≤ total check
  ✗ Target Sum: stopping the inner loop at c > 0 → zeros are not doubled
  ✗ Using greedy (largest coin / best ratio first) on 0-1 or coin problems
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Can I use this item AGAIN, and does the ORDER of the   ║
   ║   chosen items matter?"                                  ║
   ╚══════════════════════════════════════════════════════════╝
     The first answer gives the loop direction.
     The second answer gives the loop nesting.
```

---

### ✅ Progress tracker

- [ ] 0-1 Knapsack Problem (Medium)
- [ ] Subset Sum (Medium)
- [ ] Partition Equal Subset Sum (Medium)
- [ ] Partitions with Given Difference (Medium)
- [ ] Target Sum (Medium)
- [ ] Coin Change (Medium)
- [ ] Coin Change II (Medium)
- [ ] Combination Sum IV (Medium)
