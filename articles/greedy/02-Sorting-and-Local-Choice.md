# Greedy: Sorting and Local Choice: A Visual Guide

> **Goal:** Learn to spot when "take the best thing right now" is safe, prove it to yourself,
> and apply the handful of greedy moves that solve most of these problems.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is a Greedy Local Choice?](#0-the-big-idea-what-is-a-greedy-local-choice)
1. [Maximum Units on a Truck (Easy)](#1-maximum-units-on-a-truck-easy)
2. [Fractional Knapsack (Medium)](#2-fractional-knapsack-medium)
3. [Minimum Platforms (Medium)](#3-minimum-platforms-medium)
4. [Partition Labels (Medium)](#4-partition-labels-medium)
5. [Merge Triplets to Form Target Triplet (Medium)](#5-merge-triplets-to-form-target-triplet-medium)
6. [Hand of Straights (Medium)](#6-hand-of-straights-medium)
7. [Gas Station (Medium)](#7-gas-station-medium)
8. [Largest Number (Medium)](#8-largest-number-medium)
9. [Valid Parenthesis String (Medium)](#9-valid-parenthesis-string-medium)
10. [Task Scheduler (Medium)](#10-task-scheduler-medium)
11. [Candy (Hard)](#11-candy-hard)
12. [Next Permutation (Medium)](#12-next-permutation-medium)
13. [Master Cheat Sheet](#13-master-cheat-sheet)

> **Suggested order:** Max Units → Fractional Knapsack → Min Platforms → Partition Labels
> → Merge Triplets → Hand of Straights → Gas Station → Largest Number → Valid Parenthesis String
> → Task Scheduler → Candy → Next Permutation.
> It starts with "sort and take the best" and moves toward problems where the greedy rule is less obvious.

---

## 0. The Big Idea: What Is a Greedy Local Choice?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "GREEDY"                                │
├──────────────────────────────────────────────────────────────────┤
│  • "Maximize / minimize" a total, and items can be RANKED        │
│  • "Select elements optimally", "assign resources"               │
│  • "Arrange in a custom order" (largest number, schedule)        │
│  • A single pass with a running record seems enough              │
│  • Constraints are large (n up to 10⁵) → O(n log n) expected     │
│  • Trying all choices (DP) looks unnecessary: one choice is      │
│    obviously never worse than the others                         │
└──────────────────────────────────────────────────────────────────┘
```

### Greedy in one picture

```
   DP / backtracking:  explore EVERY branch, keep the best

                 start
              /    |    \
            a      b      c        ← try all, compare later
           /|\    /|\    /|\

   Greedy:  at each step, take the ONE branch that looks best now

                 start
                   │
                   b   ← best right now
                   │
                   e   ← best right now
                   │
                  done             ← never look back
```

> Greedy is fast because it never backtracks. It is **only correct** when the
> locally best choice is guaranteed to be part of some globally best answer.

### The greedy-choice property and the exchange argument

```
  How do you convince yourself a greedy rule is correct?
  Use the EXCHANGE ARGUMENT:

   1. Take ANY optimal answer OPT.
   2. Suppose OPT differs from greedy at the first choice:
      greedy picked G, OPT picked X instead.
   3. Swap X out, put G in.
   4. Show the new answer is STILL valid and NOT worse.
   5. Repeat → OPT can be turned into the greedy answer without loss.

        OPT:     [ X ][ ... rest ... ]
                   │ swap
                   ▼
        OPT':    [ G ][ ... rest ... ]      value(OPT') ≥ value(OPT)

  Example (Max Units on a Truck):
    OPT loads a box worth 2 units, while a box worth 3 units stays behind.
    Swap them: same number of boxes, +1 unit. So OPT wasn't better than greedy.
```

### Greedy vs DP: the same problem, two versions

```
   Items:     value  weight  value/weight
     A          60     10        6.0
     B         100     20        5.0
     C         120     30        4.0
   Capacity = 50

   ┌──────────────────────────────────┬──────────────────────────────────┐
   │ FRACTIONAL knapsack (can cut)    │ 0-1 knapsack (all or nothing)    │
   ├──────────────────────────────────┼──────────────────────────────────┤
   │ Greedy by ratio:                 │ Greedy by ratio:                 │
   │   A (10) → 60                    │   A (10) → 60                    │
   │   B (20) → 100                   │   B (20) → 100                   │
   │   20/30 of C → 80                │   C doesn't fit (30 > 20) ✗      │
   │   total = 240  ✅ optimal         │   total = 160  ❌                │
   │                                  │ True optimum: B + C = 220        │
   └──────────────────────────────────┴──────────────────────────────────┘

   Why the difference? With fractions, leftover capacity is NEVER wasted,
   so the best ratio always wins. With 0-1 items, a "good ratio" item can
   leave an awkward gap → you must try both choices → DP.
```

> For the DP version see [06-Knapsack-Subset-Sum.md](../dynammic%20programming/06-Knapsack-Subset-Sum.md).

### The common greedy moves

```
┌────────────────────────────┬──────────────────────────────────────┬─────────────────────────────┐
│ Move                       │ Idea                                 │ Used in                     │
├────────────────────────────┼──────────────────────────────────────┼─────────────────────────────┤
│ Sort by a key              │ best-first: units, ratio, time       │ Max Units, Fractional KS,   │
│                            │                                      │ Min Platforms               │
│ Custom comparator          │ "a before b if a+b > b+a"            │ Largest Number              │
│ Last occurrence / reach    │ extend the current block's end       │ Partition Labels            │
│ Filter, then combine       │ throw away anything that overshoots  │ Merge Triplets              │
│ Counting / frequency       │ consume the smallest or most common  │ Hand of Straights,          │
│                            │                                      │ Task Scheduler              │
│ Reset when sum < 0         │ a negative prefix never helps        │ Gas Station                 │
│ Track a range [lo, hi]     │ keep every possibility as an interval│ Valid Parenthesis String    │
│ Two passes (→ then ←)      │ satisfy left rule, then right rule   │ Candy                       │
│ Rightmost smallest change  │ change as little as possible         │ Next Permutation            │
└────────────────────────────┴──────────────────────────────────────┴─────────────────────────────┘
```

### The 4-step recipe for a greedy problem

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  NAME THE LOCAL CHOICE                                 │
 │         "At each step I will take ______."                    │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 2  FIND THE ORDER THAT MAKES IT EASY                     │
 │         Sort? Scan left→right? Two passes? Count first?       │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 3  CONVINCE YOURSELF (exchange argument / small cases)   │
 │         Try to build a counterexample. If you can → DP.       │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 4  HANDLE THE EDGES                                      │
 │         Ties, zeros, empty input, "impossible" answers.       │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Maximum Units on a Truck (Easy)

### Problem
`boxTypes[i] = [numberOfBoxes, unitsPerBox]`. The truck holds at most `truckSize` **boxes**.
Maximize the total **units** loaded.

### Visualize it

```
  boxTypes = [[1,3], [2,2], [3,1]],  truckSize = 4

   type A: ┌───┐                3 units each
           │ 3 │
           └───┘
   type B: ┌───┐┌───┐           2 units each
           │ 2 ││ 2 │
           └───┘└───┘
   type C: ┌───┐┌───┐┌───┐      1 unit each
           │ 1 ││ 1 ││ 1 │
           └───┘└───┘└───┘

   Truck (4 slots):  [ 3 ][ 2 ][ 2 ][ 1 ]   = 8 units ✅
```

### The local choice

```
   Every box costs exactly ONE slot.
   So the best slot-filler is simply the box with the MOST units.

   Sort types by units, descending → fill from the top until the truck is full.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | take boxes with the most units per box first |
| Order | sort by `unitsPerBox` descending |
| Why safe | swapping a lower-unit box for a higher-unit box never loses units |
| Edges | the last type may only partly fit → take `min(count, slotsLeft)` |

### Trace

```
  boxTypes = [[5,10],[2,5],[4,7],[3,9]],  truckSize = 10

  sorted by units ↓:  [5,10]  [3,9]  [4,7]  [2,5]

  type    │ take              │ units added │ slots left │ total
  ────────┼───────────────────┼─────────────┼────────────┼──────
  [5,10]  │ min(5, 10) = 5    │ 5 × 10 = 50 │     5      │  50
  [3,9]   │ min(3, 5)  = 3    │ 3 × 9  = 27 │     2      │  77
  [4,7]   │ min(4, 2)  = 2    │ 2 × 7  = 14 │     0      │  91
  [2,5]   │ truck full → stop │             │            │
                                                     answer = 91 ✅
```

### Pseudocode

```
function maximumUnits(boxTypes, truckSize):
    sort boxTypes by unitsPerBox descending
    total ← 0
    for each (count, units) in boxTypes:
        if truckSize == 0: break
        take       ← min(count, truckSize)
        total      ← total + take × units
        truckSize  ← truckSize − take
    return total
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort + greedy | O(n log n) | O(1) extra |
| Counting sort (units ≤ 1000) | O(n + 1000) | O(1000) |

### 📌 Points to remember
- Every box costs the same (1 slot) → rank purely by value. That's why greedy works.
- This is fractional knapsack where all weights are 1.
- Units are small (≤ 1000), so you can bucket by units instead of sorting.

---

## 2. Fractional Knapsack (Medium)

### Problem
Items have `value[i]` and `weight[i]`. A knapsack holds weight `W`.
You may take **any fraction** of an item. Maximize the total value.

> **Convention (GFG):** input is `val[]`, `wt[]`, capacity `W`; return the maximum value as a
> **double** (newer versions round to 6 decimal places).

### Visualize it

```
   Think of each item as a jar of liquid with a "richness" = value per kg.

   A ▓▓▓▓▓▓  6 per kg   (10 kg)
   B ▓▓▓▓▓   5 per kg   (20 kg)
   C ▓▓▓▓    4 per kg   (30 kg)

   Pour the richest liquid first until the bag is full.

   bag (50 kg):  [AAAAAAAAAA][BBBBBBBBBBBBBBBBBBBB][CCCCCCCCCCCCCCCCCCCC]
                   10 kg          20 kg                 20 of 30 kg
                    60     +       100      +              80       = 240 ✅
```

### The local choice

```
   value/weight ratio = "value per unit of capacity"
   Each unit of capacity should hold the richest material available.

   ┌─────────────────────────────────────────────┐
   │ Sort by ratio ↓, take whole items while     │
   │ they fit, then a FRACTION of the next one.  │
   └─────────────────────────────────────────────┘
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | fill capacity with the highest value/weight first |
| Order | sort by `value / weight` descending |
| Why safe | any kg of a lower-ratio item can be swapped for a kg of a higher-ratio item → value goes up |
| Edges | last item is cut: `value × (remaining / weight)`; return a double |

### Trace

```
  val = [60, 100, 120],  wt = [10, 20, 30],  W = 50

  item │ ratio │ fits?            │ take       │ value added    │ W left │ total
  ─────┼───────┼──────────────────┼────────────┼────────────────┼────────┼──────
   A   │  6.0  │ 10 ≤ 50 yes      │ all 10     │ 60             │   40   │  60
   B   │  5.0  │ 20 ≤ 40 yes      │ all 20     │ 100            │   20   │ 160
   C   │  4.0  │ 30 > 20 → cut    │ 20/30      │ 120 × 2/3 = 80 │    0   │ 240
                                                              answer = 240.0 ✅
```

### Pseudocode

```
function fractionalKnapsack(val, wt, W):
    items ← pairs (val[i], wt[i]) sorted by val[i]/wt[i] descending
    total ← 0.0
    for each (v, w) in items:
        if W == 0: break
        if w ≤ W:
            total ← total + v
            W     ← W − w
        else:
            total ← total + v × (W / w)      // the fractional piece
            W     ← 0
    return total
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort by ratio | O(n log n) | O(n) |
| Quickselect on ratio (advanced) | O(n) average | O(n) |

### 📌 Points to remember
- Works **only** because items can be cut. The 0-1 version needs DP (see section 0).
- Compare ratios safely: `v1 × w2 > v2 × w1` avoids floating-point surprises when sorting.
- Do the final division in floating point, not integer division.

---

## 3. Minimum Platforms (Medium)

### Problem
Given arrival times `arr[]` and departure times `dep[]` of trains at a station,
find the **minimum number of platforms** so no train waits.

> **Convention (GFG):** times are integers in `HHMM` form (e.g. `940` = 9:40).
> A train arriving at the **same minute** another departs **needs a new platform**
> (the platform can't be used for both). So overlap uses **`arr ≤ dep`**.

### Visualize it

```
  time →   900   940 950      1100 1120 1130  1200        1500        1800  1900  2000
  T1       ├─┤ (900–910)
  T2             ├───────────────────────────────┤ (940–1200)
  T3                 ├──────────────────┤ (950–1120)
  T4                          ├───────────┤ (1100–1130)
  T5                                                       ├────────────────────┤ (1500–1900)
  T6                                                                   ├──────────────┤ (1800–2000)

  At 1100: T2, T3, T4 are all at the station → 3 platforms needed ✅
```

### The local choice: only the ORDER of events matters

```
   We don't care WHICH train leaves, only WHEN a platform frees up.
   So sort arrivals and departures SEPARATELY and merge them like a timeline:

     next arrival ≤ next departure?  → a train arrives, platforms + 1
     otherwise                       → a train leaves,  platforms − 1

   Answer = the peak number of platforms in use.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | process the earliest event next |
| Order | sort `arr` and `dep` independently, two pointers |
| Why safe | platforms in use at time t = (# arrived by t) − (# departed before t); identity of trains is irrelevant |
| Edges | tie `arr == dep` → treat as arrival first (`≤`), per GFG |

### Trace

```
  arr = [900, 940, 950, 1100, 1500, 1800]
  dep = [910, 1200, 1120, 1130, 1900, 2000]

  sorted arr: 900  940  950  1100  1500  1800
  sorted dep: 910 1120 1130  1200  1900  2000

  i │ j │ arr[i] ≤ dep[j]? │ event        │ platforms │ max
  ──┼───┼──────────────────┼──────────────┼───────────┼────
  0 │ 0 │  900 ≤  910 yes  │ arrive       │     1     │  1
  1 │ 0 │  940 ≤  910 no   │ depart       │     0     │  1
  1 │ 1 │  940 ≤ 1120 yes  │ arrive       │     1     │  1
  2 │ 1 │  950 ≤ 1120 yes  │ arrive       │     2     │  2
  3 │ 1 │ 1100 ≤ 1120 yes  │ arrive       │     3     │  3  ◄ peak
  4 │ 1 │ 1500 ≤ 1120 no   │ depart       │     2     │  3
  4 │ 2 │ 1500 ≤ 1130 no   │ depart       │     1     │  3
  4 │ 3 │ 1500 ≤ 1200 no   │ depart       │     0     │  3
  4 │ 4 │ 1500 ≤ 1900 yes  │ arrive       │     1     │  3
  5 │ 4 │ 1800 ≤ 1900 yes  │ arrive       │     2     │  3
  6 │   │ all arrived → stop                                  answer = 3 ✅
```

### Pseudocode

```
function findPlatform(arr, dep):
    sort arr, sort dep
    i ← 0, j ← 0, platforms ← 0, best ← 0
    while i < n:
        if arr[i] ≤ dep[j]:          // arrival first (same minute = new platform)
            platforms ← platforms + 1
            best      ← max(best, platforms)
            i ← i + 1
        else:
            platforms ← platforms − 1
            j ← j + 1
    return best
```

### Alternative: sweep with a difference array

```
  Times are bounded (0000..2359), so:
     count[arr] += 1,   count[dep + 1] −= 1
  Prefix-sum the counts; the maximum prefix value is the answer. O(n + 2400).
  (dep + 1 keeps the departing train counted during its own departure minute.)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Check every pair of trains | O(n²) | O(1) |
| **Sort + two pointers** | **O(n log n)** | O(1) extra |
| Difference array over minutes | O(n + T) | O(T) |

### 📌 Points to remember
- Sorting `arr` and `dep` separately **breaks the pairing**, and that's fine: only event order matters.
- Read the tie rule. GFG uses `≤` (same minute needs a new platform). Some versions use `<`.
- This is the same problem as **Meeting Rooms II** (minimum rooms), covered in the intervals guide.

---

## 4. Partition Labels (Medium)

### Problem
Split string `s` into as **many parts as possible** so each letter appears in **at most one** part.
Return the sizes of the parts.

### Visualize it

```
  s = "ababcbacadefegdehijhklij"

   a b a b c b a c a │ d e f e g d e │ h i j h k l i j
  └──────── 9 ───────┘└───── 7 ──────┘└────── 8 ──────┘     answer = [9, 7, 8] ✅

  Every 'a' is in part 1, every 'e' in part 2, every 'j' in part 3.
```

### The local choice: "I can't cut until every letter I've seen is finished"

```
   Precompute last[c] = the last index where letter c appears.

   Walk left → right, keep   end = max(last[c]) for letters seen in this part.

     i reaches end?  → every letter in this part has finished → CUT here.

   Cutting as early as possible = as many parts as possible.

     start            i      end
       │              │       │
       ▼              ▼       ▼
     [ a b a b c b a c a ] ...
       a's last = 8 ──────────┘   end can only grow until i catches it
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | cut at the earliest index where all open letters have ended |
| Order | one left → right scan, after building `last[]` |
| Why safe | any cut earlier than `end` would split a letter; cutting later only merges parts |
| Edges | single-letter string → `[1]` |

### Trace

```
  last occurrence table:
   a:8  b:5  c:7  d:14  e:15  f:11  g:13  h:19  i:22  j:23  k:20  l:21

   i │ ch │ last[ch] │ end │ i == end?
  ───┼────┼──────────┼─────┼───────────────────────────────
   0 │ a  │    8     │  8  │
   1 │ b  │    5     │  8  │
   2 │ a  │    8     │  8  │
   3 │ b  │    5     │  8  │
   4 │ c  │    7     │  8  │
   5 │ b  │    5     │  8  │
   6 │ a  │    8     │  8  │
   7 │ c  │    7     │  8  │
   8 │ a  │    8     │  8  │ ✂ cut → size 8 − 0 + 1 = 9
   9 │ d  │   14     │ 14  │
  10 │ e  │   15     │ 15  │
  11 │ f  │   11     │ 15  │
  12 │ e  │   15     │ 15  │
  13 │ g  │   13     │ 15  │
  14 │ d  │   14     │ 15  │
  15 │ e  │   15     │ 15  │ ✂ cut → size 15 − 9 + 1 = 7
  16 │ h  │   19     │ 19  │
  17 │ i  │   22     │ 22  │
  18 │ j  │   23     │ 23  │
  19…22   (h, k, l, i all end ≤ 23)
  23 │ j  │   23     │ 23  │ ✂ cut → size 23 − 16 + 1 = 8

                                         answer = [9, 7, 8] ✅
```

### Pseudocode

```
function partitionLabels(s):
    last ← map letter → last index, filled by one pass
    result ← empty list
    start ← 0, end ← 0
    for i from 0 to n−1:
        end ← max(end, last[s[i]])
        if i == end:
            append (end − start + 1) to result
            start ← i + 1
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Two passes (last[] + scan) | O(n) | O(26) |

### 📌 Points to remember
- This is **Merge Intervals in disguise**: each letter is the interval `[first, last]`; merge them and output the lengths.
- `end` only grows inside a part, so a single variable is enough.
- Update `end` **before** checking `i == end`.

---

## 5. Merge Triplets to Form Target Triplet (Medium)

### Problem
You may "merge" two triplets into `[max(a1,a2), max(b1,b2), max(c1,c2)]`, as many times as you like.
Can you produce exactly `target = [x, y, z]`?

### Visualize it

```
  triplets = [[2,5,3], [1,8,4], [1,7,5]],  target = [2,7,5]

     [2, 5, 3]    ok  (no value above target)
     [1, 8, 4]    ✗   8 > 7 → merging it would push the 2nd value past 7 forever
     [1, 7, 5]    ok

     merge the "ok" ones:  [max(2,1), max(5,7), max(3,5)] = [2, 7, 5]  ✅
```

### The local choice: discard anything that overshoots

```
   Merging uses MAX, and max can only go UP, never down.

   ┌────────────────────────────────────────────────────────────┐
   │ A triplet with ANY value > target can NEVER be used.       │
   │ Every other triplet is safe to merge (it can't overshoot). │
   └────────────────────────────────────────────────────────────┘

   So: merge ALL safe triplets. If the result equals target → true.
   Equivalent check: among safe triplets, each target position must be hit
   exactly by at least one of them.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | use every triplet with `a ≤ x, b ≤ y, c ≤ z`; drop the rest |
| Order | any order (max is order-independent) |
| Why safe | a safe triplet can't raise any position past target; merging more only helps reach it |
| Edges | target must be **exactly** hit in all 3 positions |

### Trace

```
  Example 1: triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]

  triplet   │ safe? (all ≤ target)      │ found so far [x?, y?, z?]
  ──────────┼───────────────────────────┼──────────────────────────
  [2,5,3]   │ 2≤2, 5≤7, 3≤5  yes        │ [✓, ✗, ✗]   (2 == x)
  [1,8,4]   │ 8 > 7          NO → skip  │ [✓, ✗, ✗]
  [1,7,5]   │ 1≤2, 7≤7, 5≤5  yes        │ [✓, ✓, ✓]   (7 == y, 5 == z)
                                                      answer = true ✅

  Example 2: triplets = [[3,4,5],[4,5,6]], target = [3,2,5]

  [3,4,5]   │ 4 > 2  NO → skip
  [4,5,6]   │ 4 > 3  NO → skip
  nothing usable → [✗, ✗, ✗]                         answer = false ✅
```

### Pseudocode

```
function mergeTriplets(triplets, target):
    found ← [false, false, false]
    for each t in triplets:
        if t[0] > target[0] or t[1] > target[1] or t[2] > target[2]:
            continue                       // overshoots → useless
        for k in 0..2:
            if t[k] == target[k]: found[k] ← true
    return found[0] and found[1] and found[2]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| One pass with 3 flags | O(n) | O(1) |

### 📌 Points to remember
- **"Max only grows" ⇒ anything above target is poison.** That's the entire insight.
- You don't need to actually merge, just check that each position is hit by some safe triplet.
- Same filtering idea shows up whenever an operation is monotonic (max, OR, union).

---

## 6. Hand of Straights (Medium)

### Problem
Can you split `hand` into groups of size `groupSize`, where each group is
`groupSize` **consecutive** card values?
(Same problem as LC 1296 *Divide Array in Sets of K Consecutive Numbers*.)

### Visualize it

```
  hand = [1,2,3,6,2,3,4,7,8],  groupSize = 3

   counts:   1:■   2:■■   3:■■   4:■   6:■   7:■   8:■

   groups:   [1 2 3]   [2 3 4]   [6 7 8]     answer = true ✅
```

### The local choice: the SMALLEST card must START a group

```
   Look at the smallest remaining card, say v.
   Nothing smaller exists, so v can't be in the middle or end of a group.
   → v MUST be the first card of a group: v, v+1, ..., v+groupSize−1.

   If there are c copies of v, then c groups all start at v at once.

       v      v+1     v+2
     ■ ■    ■ ■ ■    ■ ■       c = 2 copies of v
     ▲ ▲    ▲ ▲      ▲ ▲       → remove 2 from each of v, v+1, v+2
     └─┴────┴─┴──────┴─┘          (fail if any has fewer than 2)
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | the smallest remaining value starts `count[v]` groups |
| Order | visit distinct values in increasing order |
| Why safe | the smallest card has no other place to go, so the choice is forced |
| Edges | `n % groupSize ≠ 0` → false immediately |

### Trace

```
  Example 1: hand = [1,2,3,6,2,3,4,7,8], groupSize = 3
  counts: {1:1, 2:2, 3:2, 4:1, 6:1, 7:1, 8:1}

  v │ c = count[v] │ need v..v+2 each ≥ c?       │ counts after
  ──┼──────────────┼─────────────────────────────┼────────────────────────────────
  1 │      1       │ 1:1 2:2 3:2  ✓              │ {1:0, 2:1, 3:1, 4:1, 6:1, 7:1, 8:1}
  2 │      1       │ 2:1 3:1 4:1  ✓              │ {2:0, 3:0, 4:0, 6:1, 7:1, 8:1}
  3 │      0       │ skip                        │
  4 │      0       │ skip                        │
  6 │      1       │ 6:1 7:1 8:1  ✓              │ all 0
                                                         answer = true ✅

  Example 2: hand = [1,1,2,3], groupSize = 2
  counts: {1:2, 2:1, 3:1}
  v = 1, c = 2 → need count[2] ≥ 2, but count[2] = 1  ✗   answer = false ✅
```

### Pseudocode

```
function isNStraightHand(hand, groupSize):
    if n mod groupSize ≠ 0: return false
    count ← frequency map of hand
    for each value v in count, in increasing order:
        c ← count[v]
        if c == 0: continue
        for w from v to v + groupSize − 1:
            if count[w] < c: return false
            count[w] ← count[w] − c
    return true
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort + remove one group at a time | O(n log n + n·k) | O(n) |
| **Sorted distinct keys, remove c groups at once** | **O(n log n)** sorting + O(m·k) | O(n) |

### 📌 Points to remember
- **The smallest card is forced.** Greedy works because there is no real choice.
- Remove all `c` groups starting at `v` in one step, not one at a time.
- Quick reject: `n % groupSize ≠ 0`.

---

## 7. Gas Station (Medium)

### Problem
Stations in a circle. `gas[i]` = fuel you get at station `i`, `cost[i]` = fuel to drive to `i+1`.
Return the starting index that lets you go all the way around, or `-1`. (The answer is unique if it exists.)

### Visualize it

```
  gas  = [1, 2, 3, 4, 5]
  cost = [3, 4, 5, 1, 2]
  diff = gas − cost = [−2, −2, −2, +3, +3]

              ┌──── (0) −2 ────┐
             (4) +3            (1) −2
               \               /
               (3) +3 ── (2) −2

   Start at 3:  tank 3 → 6 → 4 → 2 → 0   never negative ✅
```

### Two key facts

```
  FACT 1:  total = Σ(gas − cost) ≥ 0   ⇔   SOME start works.
           (If the circle as a whole has enough fuel, there's a good starting point.)

  FACT 2:  If you start at s and run dry arriving at j+1,
           then NO station between s and j can be the start either.

     s ─────────── k ─────────── j ✗ (tank < 0)
     └── tank ≥ 0 ─┘
         this prefix only HELPED you reach k.
         Starting at k removes that help → you fail at j even sooner.

     → Jump the candidate start straight to j + 1.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | when the tank goes negative at `i`, restart from `i + 1` |
| Order | one left → right scan |
| Why safe | Fact 2: every start in `[s, i]` is ruled out at once |
| Edges | `total < 0` → `-1` |

### Trace

```
  diff = [−2, −2, −2, +3, +3]

  i │ diff │ tank (before reset) │ tank < 0?      │ start │ total
  ──┼──────┼─────────────────────┼────────────────┼───────┼──────
  0 │  −2  │        −2           │ yes → reset 0  │   1   │  −2
  1 │  −2  │        −2           │ yes → reset 0  │   2   │  −4
  2 │  −2  │        −2           │ yes → reset 0  │   3   │  −6
  3 │  +3  │         3           │ no             │   3   │  −3
  4 │  +3  │         6           │ no             │   3   │   0

  total = 0 ≥ 0  → answer = start = 3 ✅

  Impossible case: gas = [2,3,4], cost = [3,4,3]
     diff = [−1, −1, +1], total = −1 < 0  → answer = −1 ✅
```

### Pseudocode

```
function canCompleteCircuit(gas, cost):
    total ← 0, tank ← 0, start ← 0
    for i from 0 to n−1:
        d     ← gas[i] − cost[i]
        total ← total + d
        tank  ← tank + d
        if tank < 0:
            start ← i + 1
            tank  ← 0
    return (total ≥ 0) ? start : −1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try every start, simulate | O(n²) | O(1) |
| **One pass with reset** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **A negative running sum never helps what comes after it.** Same idea as Kadane's algorithm.
- `total ≥ 0` decides *whether*; the reset scan decides *where*.
- You never need to wrap around in the scan. Fact 1 covers the circle.

---

## 8. Largest Number (Medium)

### Problem
Arrange non-negative integers so their concatenation is the **largest** number. Return it as a string.

### Visualize it

```
  nums = [3, 30, 34, 5, 9]

   sorting numerically ↓ :  34, 30, 9, 5, 3  → "3430953"  ✗ not largest
   sorting as text ↓     :  9, 5, 34, 30, 3  → "9534303"  ✗ close, but wrong
   correct               :  9, 5, 34, 3, 30  → "9534330"  ✅
```

### The local choice: compare two numbers by gluing them both ways

```
   Should a come before b?  Glue them both ways and compare:

        a + b   vs   b + a        (string concatenation)

     "3" vs "30":    "330" > "303"   → 3 goes first
     "34" vs "3":    "343" > "334"   → 34 goes first
     "9" vs "5":     "95"  > "59"    → 9 goes first

   Sort with this comparator → read off the answer.

   Why it's safe (exchange argument): if a+b > b+a but b sits right before a,
   swapping the neighbors makes the whole string bigger. So in the best
   answer, every adjacent pair already obeys the comparator.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | `a` before `b` if `a+b > b+a` |
| Order | sort with that comparator |
| Why safe | swapping a "wrong" adjacent pair always increases the result |
| Edges | all zeros → `"0"`, not `"000"` |

### Trace

```
  nums as strings: ["3", "30", "34", "5", "9"]

  pairwise decisions:
    9  vs 5   : "95"  > "59"   → 9 first
    5  vs 34  : "534" > "345"  → 5 first
    34 vs 3   : "343" > "334"  → 34 first
    3  vs 30  : "330" > "303"  → 3 first

  sorted:  9 │ 5 │ 34 │ 3 │ 30
  joined: "9534330"                                   answer ✅

  More:   [10, 2]  → "2"+"10" = "210" vs "102" → "210" ✅
          [0, 0]   → "00" → leading char is '0' → return "0" ✅
```

### Pseudocode

```
function largestNumber(nums):
    strs ← each num converted to string
    sort strs using: a before b  if  (a + b) > (b + a)
    if strs[0] == "0": return "0"        // everything is zero
    return concatenation of strs
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try all permutations | O(n! · L) | O(n · L) |
| **Comparator sort** | **O(n log n · L)** | O(n · L) |

(`L` = number of digits, at most 10.)

### 📌 Points to remember
- **Custom comparator** problems: define "should a come before b?" on a pair, then sort.
- Neither numeric nor plain lexicographic order works on its own.
- Remember the all-zero edge case.

---

## 9. Valid Parenthesis String (Medium)

### Problem
String of `(`, `)`, `*`. Each `*` may be `(`, `)`, or empty. Is there a choice that makes the string valid?

### Visualize it

```
  "(*))"

   choose * = "("  →  "(())"   ✅ valid
   choose * = ""   →  "())"    ✗
   choose * = ")"  →  "()))"   ✗

   Only need ONE working choice → answer = true
```

### The local choice: keep a RANGE of possible open counts

```
  Instead of trying every * choice (3^k), track:

     lo = fewest  unmatched '(' possible so far
     hi = most    unmatched '(' possible so far

   char  │  lo        │  hi
   ──────┼────────────┼──────────
    (    │  lo + 1    │  hi + 1
    )    │  lo − 1    │  hi − 1
    *    │  lo − 1    │  hi + 1      (* as ')' lowers, * as '(' raises)

   Rules:
     • hi < 0          → too many ')' even if every * is '('   → FALSE
     • lo < 0          → clamp lo to 0 (we can't have negative opens;
                         just don't use that * as ')')
     • end: lo == 0    → some choice closes everything          → TRUE

        0 ─── lo ════════════ hi ───►   every count in [lo, hi] is reachable
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | keep the whole range `[lo, hi]` of possible open counts |
| Order | left → right |
| Why safe | every value between `lo` and `hi` is reachable, so two numbers describe all possibilities |
| Edges | clamp `lo ≥ 0`; fail as soon as `hi < 0` |

### Trace

```
  s = "(*))"

  ch │ lo (raw → clamped) │ hi │ status
  ───┼────────────────────┼────┼────────
  (  │  1                 │  1 │
  *  │  0                 │  2 │
  )  │ −1 → 0             │  1 │
  )  │ −1 → 0             │  0 │
  end: lo == 0  → true ✅

  s = "(((*)"

  ch │ lo │ hi
  ───┼────┼────
  (  │  1 │  1
  (  │  2 │  2
  (  │  3 │  3
  *  │  2 │  4
  )  │  1 │  3
  end: lo = 1 ≠ 0  → false ✅   (3 opens, at most 2 closers)

  s = ")("
  )  │ lo −1→0 │ hi −1  → hi < 0 → false immediately ✅
```

### Pseudocode

```
function checkValidString(s):
    lo ← 0, hi ← 0
    for each ch in s:
        if ch == '(':       lo ← lo + 1;  hi ← hi + 1
        else if ch == ')':  lo ← lo − 1;  hi ← hi − 1
        else:               lo ← lo − 1;  hi ← hi + 1      // '*'
        if hi < 0: return false
        if lo < 0: lo ← 0
    return lo == 0
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try all `*` choices | O(3^k · n) | O(n) |
| DP over (index, open count) | O(n²) | O(n²) |
| Two stacks (indices of `(` and `*`) | O(n) | O(n) |
| **Range [lo, hi]** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **When choices create a contiguous set of states, track only the min and max.**
- Clamp `lo` at 0. A negative open count isn't a real state.
- `hi < 0` is the only early failure; `lo == 0` is the only end check.

---

## 10. Task Scheduler (Medium)

### Problem
CPU tasks (letters). Same tasks must be at least `n` intervals apart. Each interval runs one task or idles.
Return the minimum number of intervals.

### Visualize it: build the frame from the most frequent task

```
  tasks = [A,A,A,B,B,B],  n = 2

   The most frequent task (A, 3 times) needs gaps of n between its copies:

     A _ _ A _ _ A
     └n=2┘ └n=2┘

   Arrange as rows of width (n + 1):

        col: 0   1   2
      ┌───┬───┬───┐
      │ A │ B │ · │   row 1
      ├───┼───┼───┤
      │ A │ B │ · │   row 2
      ├───┼───┼───┤
      │ A │ B │       last row: only the max-frequency tasks
      └───┴───┘

   (maxFreq − 1) full rows × (n + 1) + countMax tasks in the last row
     = (3 − 1) × 3 + 2 = 8    → A B · A B · A B   answer = 8 ✅
```

### The local choice

```
   The most frequent task decides the skeleton.
   Every other task fits into the holes (·) of the frame.

   ┌───────────────────────────────────────────────────────────────┐
   │ frame = (maxFreq − 1) × (n + 1) + countMax                    │
   │ answer = max( frame, total number of tasks )                  │
   └───────────────────────────────────────────────────────────────┘

   Why the max with total?  If there are so many different tasks that the
   holes overflow, widen the rows. Then no idle time is needed at all, and
   the answer is just the number of tasks.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | schedule around the most frequent task(s) |
| Order | count frequencies; only `maxFreq` and `countMax` matter |
| Why safe | `maxFreq` copies need `maxFreq − 1` gaps of size `n` no matter what |
| Edges | many distinct tasks → answer = `len(tasks)` |

### Traces

```
  1) tasks = [A,A,A,B,B,B], n = 2
     maxFreq = 3, countMax = 2 (A and B)
     frame = (3−1)×(2+1) + 2 = 8,  len = 6  → max(8, 6) = 8 ✅

  2) tasks = [A,A,A,A,A,A,B,C,D,E,F,G], n = 2
     maxFreq = 6 (A), countMax = 1
     frame = (6−1)×3 + 1 = 16,  len = 12  → 16 ✅

        A B C
        A D E
        A F G
        A · ·
        A · ·
        A                 5 full rows × 3 + 1 = 16

  3) tasks = [A,A,A,B,B,B,C,C,C,D,D,E], n = 2
     maxFreq = 3, countMax = 3 (A, B, C)
     frame = (3−1)×3 + 3 = 9,  len = 12  → 12 ✅  (no idle needed)
```

### Pseudocode

```
function leastInterval(tasks, n):
    freq     ← count of each task letter
    maxFreq  ← max value in freq
    countMax ← number of letters whose freq == maxFreq
    frame    ← (maxFreq − 1) × (n + 1) + countMax
    return max(frame, length(tasks))
```

### Alternative: simulate with a max-heap

```
  Repeat in rounds of (n + 1) slots:
     pop up to n+1 most frequent tasks, run each once, push back if count > 0.
     add (n+1) to time, or only the tasks run if the heap is now empty.
  O(total · log 26). Useful when you must output the actual schedule.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Heap simulation | O(T log 26) | O(26) |
| **Formula** | **O(T)** | **O(26)** ✅ |

### 📌 Points to remember
- **The most frequent task builds the frame; others fill the holes.**
- Count **how many** tasks tie for the max frequency. They all go in the last row.
- Always take `max(frame, len(tasks))`.

---

## 11. Candy (Hard)

### Problem
Children in a line with `ratings`. Each child gets ≥ 1 candy.
A child with a **higher rating than a neighbor** must get **more candy than that neighbor**.
Minimize the total.

### Visualize it

```
  ratings = [1, 0, 2]

     rating:   1     0     2
               ▲           ▲
               │     ▼     │       middle child is a valley
     candy:    2     1     2       total = 5 ✅
```

### The local choice: satisfy each side separately, then combine

```
  Two rules per child i:
     LEFT rule:   ratings[i] > ratings[i−1]  ⇒ candy[i] > candy[i−1]
     RIGHT rule:  ratings[i] > ratings[i+1]  ⇒ candy[i] > candy[i+1]

  Pass 1 (left → right): fix the LEFT rule with the minimum needed.
  Pass 2 (right → left): fix the RIGHT rule, but never lower what pass 1 set.

       candy[i] = max( left[i], right[i] )

        left pass  →→→→→→→→→
        ←←←←←←←←←  right pass
        a child must satisfy BOTH → take the larger of the two answers
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | give the minimum that satisfies each side; take the max of both sides |
| Order | pass 1 left → right, pass 2 right → left |
| Why safe | each pass gives the smallest count for one rule; the max is the smallest that satisfies both |
| Edges | equal neighbors → no constraint between them |

### Traces

```
  1) ratings = [1, 0, 2]

     start        : [1, 1, 1]
     left pass    : i=1: 0 > 1? no          → 1
                    i=2: 2 > 0? yes → 1+1   → 2       [1, 1, 2]
     right pass   : i=1: 0 > 2? no          → 1
                    i=0: 1 > 0? yes → max(1, 1+1) = 2  [2, 1, 2]
     total = 5 ✅

  2) ratings = [1, 2, 2]

     left pass    : i=1: 2 > 1 yes → 2;  i=2: 2 > 2 no → 1     [1, 2, 1]
     right pass   : i=1: 2 > 2 no;       i=0: 1 > 2 no         [1, 2, 1]
     total = 4 ✅   (equal ratings don't need more candy)

  3) ratings = [1, 3, 4, 5, 2]        (a mountain)

     left pass    : [1, 2, 3, 4, 1]
     right pass   : i=3: 5 > 2 yes → max(4, 1+1) = 4
                    i=2: 4 > 5 no;  i=1: 3 > 4 no;  i=0: 1 > 3 no
                    [1, 2, 3, 4, 1]
     total = 11 ✅
```

### Pseudocode

```
function candy(ratings):
    candy ← array of n, all 1
    for i from 1 to n−1:                       // left rule
        if ratings[i] > ratings[i−1]:
            candy[i] ← candy[i−1] + 1
    for i from n−2 down to 0:                  // right rule
        if ratings[i] > ratings[i+1]:
            candy[i] ← max(candy[i], candy[i+1] + 1)
    return sum(candy)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Repeat fix-ups until stable | O(n²) | O(n) |
| **Two passes** | **O(n)** | O(n) |
| Count slopes (up/down run lengths) | O(n) | **O(1)** |

### 📌 Points to remember
- **Two-sided constraint → two one-sided passes + max.**
- Use `max` in the second pass. Overwriting would break the left rule.
- Equal ratings impose **no** constraint.

---

## 12. Next Permutation (Medium)

### Problem
Rearrange `nums` **in place** into the next lexicographically greater permutation.
If it's already the largest, wrap around to the smallest (sorted ascending).

### Visualize it

```
  All permutations of [1,2,3] in order:

     1 2 3 → 1 3 2 → 2 1 3 → 2 3 1 → 3 1 2 → 3 2 1 → (wrap) 1 2 3

  next([1,2,3]) = [1,3,2]
  next([3,2,1]) = [1,2,3]
```

### The local choice: change the RIGHTMOST position that can grow, by the SMALLEST amount

```
  nums = [1, 3, 5, 4, 2]

   Step 1: from the right, find the first i with nums[i] < nums[i+1]  (the PIVOT)

            1   3   5   4   2
                ▲   └───────┘
              pivot   decreasing suffix: already its largest arrangement,
                      so the change MUST happen at the pivot

   Step 2: from the right, find the first j with nums[j] > nums[i]
           (the smallest value in the suffix that is still bigger than the pivot)

            1   3   5   4   2
                ▲       ▲
                i       j (4 > 3)

   Step 3: swap them

            1   4   5   3   2

   Step 4: reverse the suffix after i (turn it from largest to smallest order)

            1   4 │ 2   3   5          answer = [1,4,2,3,5] ✅
```

### The 4 steps

| Step | Answer |
|------|--------|
| Local choice | bump the rightmost possible position by the smallest possible increase |
| Order | scan from the right |
| Why safe | changing a position further left would make a bigger jump; the reversed suffix is the smallest tail |
| Edges | no pivot (all decreasing) → reverse whole array |

### Traces

```
  1) [1, 2, 3]
     pivot: i=1 (2 < 3)
     j: from right, first > 2 → j=2 (3)
     swap → [1, 3, 2],  reverse suffix after i ([2]) → [1, 3, 2] ✅

  2) [3, 2, 1]
     pivot: 2 < 1? no, 3 < 2? no → no pivot
     reverse whole array → [1, 2, 3] ✅

  3) [1, 3, 5, 4, 2]
     pivot: 4<2? no, 5<4? no, 3<5? yes → i=1 (value 3)
     j: 2>3? no, 4>3? yes → j=3 (value 4)
     swap → [1, 4, 5, 3, 2]
     reverse [5, 3, 2] → [2, 3, 5]  → [1, 4, 2, 3, 5] ✅

  4) [1, 1, 5]   (duplicates)
     pivot: i=1 (1 < 5),  j=2 (5 > 1)
     swap → [1, 5, 1],  reverse [1] → [1, 5, 1] ✅
```

### Pseudocode

```
function nextPermutation(nums):
    i ← n − 2
    while i ≥ 0 and nums[i] ≥ nums[i+1]:
        i ← i − 1
    if i ≥ 0:
        j ← n − 1
        while nums[j] ≤ nums[i]:
            j ← j − 1
        swap nums[i], nums[j]
    reverse nums[i+1 .. n−1]
```

> Note the `≥` and `≤`. They skip equal values so duplicates work.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Generate all permutations, find the next | O(n! · n) | O(n! · n) |
| **Pivot + swap + reverse** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- A **decreasing suffix** can't get bigger by rearranging itself, so the pivot is just left of it.
- Swap with the **smallest larger** value in the suffix (the rightmost one bigger than the pivot).
- After the swap the suffix is still decreasing, so **reverse** it (don't sort, reversing is enough).
- Previous permutation: flip every comparison.

---

## 13. Master Cheat Sheet

### All 12 problems at a glance

```
┌────────────────────────────┬──────────────────────────────────────────────┬────────────────┐
│ Problem                    │ Greedy rule                                  │ Time           │
├────────────────────────────┼──────────────────────────────────────────────┼────────────────┤
│ Maximum Units on a Truck   │ sort by units ↓, fill slots                  │ O(n log n)     │
│ Fractional Knapsack        │ sort by value/weight ↓, cut the last item    │ O(n log n)     │
│ Minimum Platforms          │ sort arr & dep, two pointers, track peak     │ O(n log n)     │
│ Partition Labels           │ end = max(last[c]); cut when i == end        │ O(n)           │
│ Merge Triplets             │ drop triplets above target; check 3 hits     │ O(n)           │
│ Hand of Straights          │ smallest card starts count[v] groups         │ O(n log n)     │
│ Gas Station                │ total ≥ 0; reset start when tank < 0         │ O(n)           │
│ Largest Number             │ a before b if a+b > b+a; "0" edge case       │ O(n log n)     │
│ Valid Parenthesis String   │ track [lo, hi]; clamp lo; hi < 0 → false     │ O(n)           │
│ Task Scheduler             │ max((maxF−1)(n+1)+countMax, len)             │ O(T)           │
│ Candy                      │ left pass, right pass, take max              │ O(n)           │
│ Next Permutation           │ pivot, swap with smallest larger, reverse    │ O(n)           │
└────────────────────────────┴──────────────────────────────────────────────┴────────────────┘
```

### Pattern family tree

```
                          GREEDY: SORTING & LOCAL CHOICE
                                       │
     ┌─────────────────┬───────────────┼────────────────┬─────────────────┐
     │                 │               │                │                 │
  SORT BY A KEY    SCAN WITH A     COUNT & CONSUME   TWO PASSES       ORDERING
  (best first)     RUNNING RECORD  (forced choice)   (two rules)      TRICKS
     │                 │               │                │                 │
  ├ Max Units       ├ Partition     ├ Hand of        └ Candy          ├ Largest Number
  ├ Fractional KS   │  Labels       │  Straights                       │  (comparator)
  └ Min Platforms   ├ Gas Station   └ Task                             └ Next Permutation
                    ├ Valid Paren.     Scheduler                          (rightmost change)
                    │  String
                    └ Merge Triplets (filter)
```

### "Which move?" decision card

```
  Is every item the same "cost" (or divisible)?      → sort by value / ratio
  Is the answer about overlaps over time?            → sort events, sweep
  Must a group/segment contain all copies?           → last occurrence, extend end
  Does an operation only go UP (max / OR)?           → discard anything above target
  Is the smallest element forced into one role?      → process smallest first, count
  Does a negative running total doom the future?     → reset the start
  Are choices "wildcards" with a contiguous effect?  → track [lo, hi]
  Are there constraints from both neighbors?         → two passes + max
  Is it about ordering for a best concatenation?     → pairwise comparator
  "Next" arrangement?                                → rightmost pivot, minimal bump
```

### When greedy is NOT enough

```
   ┌─────────────────────────────────────────────────────────────────┐
   │ Greedy fails when a locally good choice can BLOCK a better      │
   │ future. Classic example: 0-1 knapsack (see section 0).          │
   │                                                                 │
   │ Test: try to build a small counterexample (3–4 items).          │
   │  • Can't break it, and an exchange argument works → greedy ✓    │
   │  • Broke it → you need DP or backtracking                       │
   └─────────────────────────────────────────────────────────────────┘
```

### 🚩 Common bugs to avoid

```
  ✗ Max Units: sorting by box count instead of units per box
  ✗ Fractional Knapsack: integer division on the last fraction
  ✗ Min Platforms: wrong tie rule (GFG: arrival == departure needs a new platform)
  ✗ Partition Labels: checking i == end before updating end
  ✗ Merge Triplets: merging overshooting triplets "just in case"
  ✗ Hand of Straights: forgetting n % groupSize check; starting from a non-smallest card
  ✗ Gas Station: returning start without checking total ≥ 0
  ✗ Largest Number: numeric sort; forgetting the "0" case for all zeros
  ✗ Valid Paren. String: not clamping lo at 0; checking hi only at the end
  ✗ Task Scheduler: forgetting countMax, or forgetting max(…, len(tasks))
  ✗ Candy: overwriting in the second pass instead of taking max
  ✗ Next Permutation: using > instead of ≥ when finding the pivot (breaks duplicates)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "If I take the best-looking option right now, can I SWAP    ║
   ║   it into any optimal answer without making it worse?"       ║
   ╚══════════════════════════════════════════════════════════════╝
      Yes → greedy is safe.   No (found a counterexample) → think DP.
```

---

### ✅ Progress tracker

- [ ] Maximum Units on a Truck (Easy)
- [ ] Fractional Knapsack (Medium)
- [ ] Minimum Platforms (Medium)
- [ ] Partition Labels (Medium)
- [ ] Merge Triplets to Form Target Triplet (Medium)
- [ ] Hand of Straights (Medium)
- [ ] Gas Station (Medium)
- [ ] Largest Number (Medium)
- [ ] Valid Parenthesis String (Medium)
- [ ] Task Scheduler (Medium)
- [ ] Candy (Hard)
- [ ] Next Permutation (Medium)
