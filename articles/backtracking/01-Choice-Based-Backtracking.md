# Choice-Based Backtracking: A Visual Guide

> **Goal:** Learn to *see* the recursion tree, know exactly which knob to turn
> (start index, used[], duplicate skip, pruning), and generate every answer without misses or repeats.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Choice-Based Backtracking?](#0-the-big-idea-what-is-choice-based-backtracking)
1. [Subsets (Medium)](#1-subsets-medium)
2. [Subsets II (Medium)](#2-subsets-ii-medium)
3. [Combinations (Medium)](#3-combinations-medium)
4. [Combination Sum (Medium)](#4-combination-sum-medium)
5. [Combination Sum II (Medium)](#5-combination-sum-ii-medium)
6. [Combination Sum III (Medium)](#6-combination-sum-iii-medium)
7. [Permutations (Medium)](#7-permutations-medium)
8. [Permutations II (Medium)](#8-permutations-ii-medium)
9. [Letter Case Permutation (Medium)](#9-letter-case-permutation-medium)
10. [Generate Parentheses (Medium)](#10-generate-parentheses-medium)
11. [Palindrome Partitioning (Medium)](#11-palindrome-partitioning-medium)
12. [Restore IP Addresses (Medium)](#12-restore-ip-addresses-medium)
13. [Factor Combinations (Medium)](#13-factor-combinations-medium)
14. [Generalized Abbreviation (Medium)](#14-generalized-abbreviation-medium)
15. [Master Cheat Sheet](#15-master-cheat-sheet)

> **Suggested order:** Subsets → Subsets II → Combinations → Combination Sum → Combination Sum II
> → Combination Sum III → Permutations → Permutations II → Letter Case Permutation → Generate Parentheses
> → Palindrome Partitioning → Restore IP Addresses → Factor Combinations → Generalized Abbreviation.
> Each problem turns exactly one new knob on the same template.

---

## 0. The Big Idea: What Is Choice-Based Backtracking?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BACKTRACKING"                          │
├──────────────────────────────────────────────────────────────────┤
│  • "Return ALL ..." / "generate every ..." / "list all possible" │
│  • subsets, combinations, permutations, partitions               │
│  • build a string / expression one character or piece at a time │
│  • input is SMALL (n ≤ 10..20) → exponential output is expected  │
│  • a partial answer can be judged early ("already too big")      │
└──────────────────────────────────────────────────────────────────┘

  Count / min / max only?  → usually DP.
  Need the actual LIST of every answer?  → backtracking.
```

### The template: choose → explore → un-choose

```
                    path = [1]
                       │
         ┌─────────────┼─────────────┐
     CHOOSE 2       CHOOSE 3       ...
   path=[1,2]      path=[1,3]
         │              │
     EXPLORE        EXPLORE         (recurse deeper)
         │              │
    UN-CHOOSE      UN-CHOOSE        (pop → path is [1] again)

  One shared "path" list grows going DOWN the tree and shrinks coming UP.
  Like walking a maze with chalk: draw a mark, explore, erase the mark.
```

```
function backtrack(state, path):
    if path is a complete answer:
        record COPY of path
        return                       // (some problems keep going instead)
    for each choice in choices(state):
        if choice is invalid: continue        // pruning
        make choice   (push to path)
        backtrack(next state, path)
        undo choice   (pop from path)
```

### The two tree shapes

```
 SHAPE A: INCLUDE / EXCLUDE (binary)       SHAPE B: "PICK THE NEXT ONE" (for-loop)
 one level per ELEMENT                     one level per PICK

              {}                                       []
         +1 /    \ -1                         ┌───────┼───────┐
          {1}     {}                         [1]     [2]     [3]
        +2/ \-2  +2/ \-2                    ┌─┴─┐     │
       {1,2}{1} {2} {}                  [1,2] [1,3] [2,3]
        ...  leaves = answers               │
                                        [1,2,3]
 depth = n always                          EVERY node = an answer (subsets)
 answers only at leaves                    or only nodes of size k (combinations)

 Good for: letter case, abbreviation,      Good for: subsets, combinations,
           "each item: yes or no"                    combination sums
```

> Both shapes give the same set of answers for Subsets. Shape B is easier to add
> duplicate-skipping and pruning to, so most problems here use it.

### The 3 knobs (memorize this table)

```
┌───────────────────────────┬──────────────────────────────┬───────────────────────────┐
│ KNOB                      │ WHAT IT CONTROLS             │ USE IN                    │
├───────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ start index               │ ORDER doesn't matter         │ subsets, combinations     │
│   recurse with i + 1      │   → never look back          │   (each item once)        │
│   recurse with i          │   → may reuse the same item  │ Combination Sum (reuse)   │
├───────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ used[] array              │ ORDER matters                │ permutations              │
│   loop from 0 every time  │   → any unused item may come │                           │
│   skip if used[i]         │     next                     │                           │
├───────────────────────────┼──────────────────────────────┼───────────────────────────┤
│ sort + skip duplicates    │ input has REPEATED values    │ Subsets II, Comb. Sum II, │
│   i > start and           │   → don't start two equal    │ Permutations II           │
│   a[i] == a[i-1] → skip   │     branches at one level    │                           │
└───────────────────────────┴──────────────────────────────┴───────────────────────────┘
```

### Same-level vs same-branch duplicates (the #1 confusing idea)

```
  sorted input [1, 2, 2']  (2 and 2' are equal values)

                       []
            ┌──────────┼──────────┐
           [1]        [2]        [2']   ✂ SAME LEVEL: 2' would start the exact
         ┌──┴──┐       │                   same subtree as 2 → SKIP
      [1,2] [1,2'] ✂ [2,2']  ◄── SAME BRANCH: 2 then 2' going DOWN is fine,
        │                        it makes a genuinely new answer [2,2]
     [1,2,2']

  Rule: skip a[i] only when i > start (a sibling, not the first child)
        and a[i] == a[i-1].
        "i > start" is what allows 2' DOWN the branch but not BESIDE 2.
```

### Pruning: cut dead branches early

```
  candidates sorted [2, 3, 6, 7], remaining = 1

     for i ...:
        if a[i] > remaining: BREAK     ← sorted, so every later a[i] is bigger too
                                         (break, not continue!)

         rem=1
       ┌──┴──┬──────┬──────┐
      2 ✂   3 ✂    6 ✂    7 ✂        one comparison kills the whole fan
```

### Copy the path when recording ⚠️

```
  WRONG: result.add(path)          → stores a REFERENCE; path is later popped to [] 
                                     and every saved answer becomes []
  RIGHT: result.add(copy of path)  → snapshot of this moment
```

### Complexity intuition

```
  Work ≈ (number of nodes in the tree) × (cost to copy an answer)

  subsets of n         → 2ⁿ answers   × n    = O(n·2ⁿ)
  permutations of n    → n! answers   × n    = O(n·n!)
  combinations C(n,k)  → C(n,k)       × k
  Pruning doesn't change the worst case, but it can cut real running time hugely.
```

---

## 1. Subsets (Medium)

### Problem
Given distinct integers, return **all possible subsets** (the power set).

### Visualize it (Shape B: every node is an answer)

```
  nums = [1, 2, 3]

                         []                 ← record
              ┌──────────┼──────────┐
             [1]        [2]        [3]      ← record each
           ┌──┴──┐       │
        [1,2]  [1,3]   [2,3]                ← record each
          │
       [1,2,3]                              ← record

  Children of a node only use indices AFTER the last one picked (start index).
  That's why [2,1] never appears: order doesn't matter.
```

### Decision picture

```
   backtrack(start, path):
       record path                    ← every node is a subset
       for i from start to n-1:
           pick nums[i] → recurse with start = i + 1
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, path)`: next index allowed, current subset |
| Choices | any index `i ≥ start` |
| Record | at **every** call (before the loop) |
| Stop | loop simply ends when `start == n` |
| Knob | start index, recurse with `i + 1` |

### Trace

```
  call                 path        action
  ───────────────────  ──────────  ─────────────────────
  bt(0)                []          record []
   pick 1 → bt(1)      [1]         record [1]
    pick 2 → bt(2)     [1,2]       record [1,2]
     pick 3 → bt(3)    [1,2,3]     record [1,2,3]  (loop empty)
     pop 3             [1,2]
    pop 2              [1]
    pick 3 → bt(3)     [1,3]       record [1,3]
    pop 3              [1]
   pop 1               []
   pick 2 → bt(2)      [2]         record [2]
    pick 3 → bt(3)     [2,3]       record [2,3]
   pop / pick 3        [3]         record [3]

  result: [], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]     (8 = 2³) ✅
```

### Pseudocode

```
function subsets(nums):
    result ← []
    backtrack(0, [])
    return result

function backtrack(start, path):
    result.add(copy of path)
    for i from start to n-1:
        path.push(nums[i])
        backtrack(i + 1, path)
        path.pop()
```

### Alternatives

```
  Shape A (include/exclude):   at index i, recurse once WITH nums[i], once WITHOUT.
  Bitmask: for mask from 0 to 2ⁿ-1: subset = { nums[i] : bit i of mask is 1 }

     mask  000 001 010 011 100 101 110 111
     set   []  [1] [2] [1,2][3][1,3][2,3][1,2,3]
```

### Complexity
O(n·2ⁿ) time, O(n) recursion depth (output space aside).

### 📌 Points to remember
- Record at **every node**, not just leaves.
- `i + 1` (not `start + 1`) when recursing. This is a very common slip.
- This is the parent template for the entire file.

---

## 2. Subsets II (Medium)

### Problem
Same as Subsets, but `nums` **may contain duplicates**. No duplicate subsets in the output.

### Visualize it

```
  nums = [1, 2, 2]   (sorted already; call the second one 2')

                         []
              ┌──────────┼──────────┐
             [1]        [2]        [2'] ✂  same level as [2] → skip
           ┌──┴──┐       │
        [1,2] [1,2'] ✂ [2,2']             [1,2'] is a sibling of [1,2] → skip
          │
       [1,2,2']

  Without skipping we'd output [2] twice, [1,2] twice.
```

### The new knob: sort + skip same-level duplicates

```
   for i from start to n-1:
       if i > start and nums[i] == nums[i-1]: continue   ← NEW
       ...
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, path)` |
| Choices | `i ≥ start`, skipping equal siblings |
| Record | every node |
| Pre-step | **sort** so equal values sit next to each other |
| Knob | start index + duplicate skip |

### Trace

```
  sorted = [1, 2, 2]   (index 0, 1, 2)

  call         loop i   check                         path       record
  ──────────   ──────   ───────────────────────────   ────────   ─────────
  bt(0)                                               []         []
               i=0      first child, take              [1]        [1]
    bt(1)      i=1      first child, take              [1,2]      [1,2]
      bt(2)    i=2      i == start → allowed, take     [1,2,2]    [1,2,2]
    bt(1)      i=2      i>start, 2 == 2 → SKIP ✂
               i=1      take                           [2]        [2]
    bt(2)      i=2      i == start → allowed, take     [2,2]      [2,2]
  bt(0)        i=2      i>start, 2 == 2 → SKIP ✂

  result: [], [1], [1,2], [1,2,2], [2], [2,2]     (6 subsets) ✅
```

### Pseudocode

```
function subsetsWithDup(nums):
    sort nums
    result ← []
    backtrack(0, [])
    return result

function backtrack(start, path):
    result.add(copy of path)
    for i from start to n-1:
        if i > start and nums[i] == nums[i-1]: continue
        path.push(nums[i])
        backtrack(i + 1, path)
        path.pop()
```

### Complexity
O(n·2ⁿ) worst case (all distinct). Sorting adds O(n log n).

### 📌 Points to remember
- **Sort first.** The skip only works when duplicates are adjacent.
- `i > start`, **not** `i > 0`. With `i > 0` you'd also wrongly kill `[2,2]`.
- This exact skip line reappears in Combination Sum II.

---

## 3. Combinations (Medium)

### Problem
Return all combinations of `k` numbers chosen from `1..n`.

### Visualize it

```
  n = 4, k = 2

                           []
          ┌──────────┬─────┴─────┬──────────┐
         [1]        [2]         [3]        [4] ✂ (only 0 numbers left after 4,
       ┌──┼──┐     ┌─┴─┐         │              can't reach size 2)
    [1,2][1,3][1,4][2,3][2,4]  [3,4]

  Record only when size == k  (leaves of depth k).
```

### Pruning: don't start a branch that can't be finished

```
  need = k − len(path)   more numbers
  the last useful starting value i must leave room:  i ≤ n − need + 1

   n=4, k=2, path=[]  → need 2 → i ≤ 3   → 4 is cut ✂
   n=4, k=2, path=[1] → need 1 → i ≤ 4
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, path)` |
| Choices | `i` from `start` to `n − (k − len) + 1` |
| Record | when `len(path) == k`, then return |
| Knob | start index (`i + 1`) + size pruning |

### Trace

```
  path       action
  ─────────  ────────────────────────────
  [1]        → [1,2] ✓  → [1,3] ✓  → [1,4] ✓
  [2]        → [2,3] ✓  → [2,4] ✓
  [3]        → [3,4] ✓
  [4]        ✂ pruned at root (i ≤ 3)

  result: [1,2], [1,3], [1,4], [2,3], [2,4], [3,4]    (C(4,2) = 6) ✅
```

### Pseudocode

```
function combine(n, k):
    result ← []
    backtrack(1, [])
    return result

function backtrack(start, path):
    if len(path) == k:
        result.add(copy of path); return
    need ← k − len(path)
    for i from start to n − need + 1:
        path.push(i)
        backtrack(i + 1, path)
        path.pop()
```

### Complexity
O(k · C(n, k)).

### 📌 Points to remember
- Combinations = Subsets that only **record at size k**.
- The `n − need + 1` bound is optional for correctness but a big speedup.

---

## 4. Combination Sum (Medium)

### Problem
Distinct positive `candidates`, a `target`. Return all unique combinations summing to `target`.
Each number may be used **unlimited** times.

### Visualize it

```
  candidates = [2, 3, 6, 7], target = 7

                               rem 7
         ┌───────────┬───────────┼────────────┐
        +2          +3          +6           +7
       rem 5       rem 4       rem 1        rem 0 ✅ [7]
     ┌──┼──┐       ┌─┴─┐        ✂(6>1)
    +2 +3  +6✂   +3   +6✂
  rem3 rem2      rem1
  ┌─┴─┐  ✂(3>2)   ✂(3>1)
 +2  +3
rem1 rem0 ✅ [2,2,3]
 ✂

  Children start at the SAME index i (reuse allowed), never before it
  → [2,2,3] appears, but [3,2,2] never does.
```

### The new knob: recurse with `i`, not `i + 1`

```
   pick candidates[i]  →  backtrack(i, rem − candidates[i])
                                   ▲
                          same i = "you may pick me again"
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, rem, path)` |
| Choices | `i ≥ start` with `candidates[i] ≤ rem` |
| Record | `rem == 0` |
| Prune | sort; `break` when `candidates[i] > rem` |
| Knob | start index, recurse with **`i`** (reuse) |

### Trace

```
  path       rem   action
  ─────────  ───   ───────────────────────────────────
  [2]         5    go deeper (start 0)
  [2,2]       3
  [2,2,2]     1    next 2 > 1 → break ✂, pop
  [2,2,3]     0    ✅ record
  [2,2]       3    next 6 > 3 → break ✂
  [2,3]       2    start 1: 3 > 2 → break ✂
  [2]         5    6 > 5 → break ✂
  [3]         4
  [3,3]       1    3 > 1 → break ✂
  [3]         4    6 > 4 → break ✂
  [6]         1    6 > 1 → break ✂
  [7]         0    ✅ record

  result: [2,2,3], [7] ✅
```

### Pseudocode

```
function combinationSum(candidates, target):
    sort candidates
    result ← []
    backtrack(0, target, [])
    return result

function backtrack(start, rem, path):
    if rem == 0: result.add(copy of path); return
    for i from start to n-1:
        if candidates[i] > rem: break
        path.push(candidates[i])
        backtrack(i, rem − candidates[i], path)     // i, not i+1
        path.pop()
```

### Complexity
Exponential; roughly O(N^(T/M + 1)) where T = target, M = smallest candidate.

### 📌 Points to remember
- Reuse → recurse with `i`. Each-once → `i + 1`.
- Sorting turns `continue` into `break`, which prunes whole fans at once.
- Counting the number of ways (not listing) is Coin Change II, a DP problem.

---

## 5. Combination Sum II (Medium)

### Problem
`candidates` **may contain duplicates**, each element used **at most once**. Return unique combinations summing to `target`.

### It's two earlier knobs combined

```
   Combination Sum      → sum target, pruning
 + Subsets II           → sort + skip same-level duplicates
 + each once            → recurse with i + 1
```

### Visualize it (first level)

```
  sorted = [1, 1', 2, 5, 6, 7, 10], target = 8

                          rem 8
    ┌──────┬──────┬──────┬──────┬──────┬──────┐
   +1    +1' ✂   +2     +5     +6     +7    +10 ✂ (10>8)
         same level
         as +1 → skip
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, rem, path)` |
| Choices | `i ≥ start`, skip `i > start and a[i] == a[i-1]` |
| Record | `rem == 0` |
| Prune | `break` when `a[i] > rem` |
| Knob | `i + 1` + duplicate skip + pruning |

### Trace

```
  sorted = [1, 1, 2, 5, 6, 7, 10]  (indices 0..6), target 8

  path        rem   notes
  ──────────  ───   ────────────────────────────────────────
  [1]          7    i=0
  [1,1]        6    i=1 (i == start → allowed: same BRANCH)
  [1,1,2]      4    next 5 > 4 → break ✂
  [1,1,5]      1    next 6 > 1 → break ✂
  [1,1,6]      0    ✅
  [1,1] → 7 > 6 → break ✂
  [1,2]        5
  [1,2,5]      0    ✅          then 6 > 5 → break ✂
  [1,5]        2    6 > 2 → break ✂
  [1,6]        1    7 > 1 → break ✂
  [1,7]        0    ✅          then 10 > 7 → break ✂
  root i=1     —    i > start, 1 == 1 → SKIP ✂ (would repeat everything above)
  [2]          6
  [2,5]        1    6 > 1 → break ✂
  [2,6]        0    ✅          then 7 > 6 → break ✂
  [5]          3    6 > 3 → break ✂
  [6]          2    7 > 2 → break ✂
  [7]          1    10 > 1 → break ✂
  root i=6     —    10 > 8 → break ✂

  result: [1,1,6], [1,2,5], [1,7], [2,6] ✅
```

### Pseudocode

```
function combinationSum2(candidates, target):
    sort candidates
    result ← []
    backtrack(0, target, [])
    return result

function backtrack(start, rem, path):
    if rem == 0: result.add(copy of path); return
    for i from start to n-1:
        if i > start and candidates[i] == candidates[i-1]: continue
        if candidates[i] > rem: break
        path.push(candidates[i])
        backtrack(i + 1, rem − candidates[i], path)
        path.pop()
```

### Complexity
O(n·2ⁿ) worst case.

### 📌 Points to remember
- Order of checks: duplicate skip (`continue`), then overshoot (`break`).
- Never dedupe with a set of sorted results. It works but wastes exponential time generating duplicates first.

---

## 6. Combination Sum III (Medium)

### Problem
Find all combinations of **exactly k** distinct numbers from **1..9** that sum to **n**.

### It's Combinations + a target sum

```
   candidates fixed: 1..9, each once (i + 1)
   two stop conditions together: size == k AND rem == 0

            rem 7, need 3
      ┌───────┼────────┐
     +1      +2       +3 ...
   rem 6    rem 5
   ┌──┴──┐
  +2     +3
 rem 4  rem 3
 ┌─┴─┐   ✂ (4>3)
+3  +4
rem1 rem0
 ✗    ✅ [1,2,4]
(size 3 but rem ≠ 0)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, rem, path)` |
| Choices | `i` from `start` to 9, break when `i > rem` |
| Record | `len(path) == k and rem == 0` |
| Stop | `len(path) == k` (return whether or not it matched) |
| Knob | `i + 1`, pruning on value and size |

### Trace (k = 3, n = 7)

```
  path       rem   len   action
  ─────────  ───   ───   ──────────────────────────────
  [1,2,3]     1    3     full but rem ≠ 0 → ✗ return
  [1,2,4]     0    3     ✅ record
  [1,2,5]     —          5 > 4 → break ✂
  [1,3]       3    2     next 4 > 3 → break ✂
  [1,4]       2    2     next 5 > 2 → break ✂
  [1,5],[1,6] ...        next value > rem → break ✂
  [2,3]       2    2     4 > 2 → break ✂
  [2,4],[2,5] ...        dead ✂
  [3,4]       0    2     size 2, rem 0 → loop: 5 > 0 break ✂
  ...                    no more answers

  result: [1,2,4] ✅        (k=3, n=9 → [1,2,6], [1,3,5], [2,3,4])
```

### Pseudocode

```
function combinationSum3(k, n):
    result ← []
    backtrack(1, n, [])
    return result

function backtrack(start, rem, path):
    if len(path) == k:
        if rem == 0: result.add(copy of path)
        return
    for i from start to 9:
        if i > rem: break
        path.push(i)
        backtrack(i + 1, rem − i, path)
        path.pop()
```

### Complexity
At most C(9, k) leaves, tiny: O(k · C(9, k)).

### 📌 Points to remember
- Two conditions at once: **size** and **sum**. Return at size k either way.
- Quick reject: if `n > 9+8+…` (sum of the k largest) or `n < 1+2+…+k`, the answer is empty.

---

## 7. Permutations (Medium)

### Problem
Given distinct integers, return **all orderings**.

### Visualize it: order matters → no start index

```
  nums = [1, 2, 3]

                              []
            ┌─────────────────┼─────────────────┐
           [1]               [2]               [3]
        ┌───┴───┐         ┌───┴───┐         ┌───┴───┐
     [1,2]   [1,3]     [2,1]   [2,3]     [3,1]   [3,2]
       │       │         │       │         │       │
   [1,2,3] [1,3,2]   [2,1,3] [2,3,1]   [3,1,2] [3,2,1]

  Every level loops over ALL indices from 0 and skips the ones already used.
```

### The new knob: used[]

```
   used = [F, F, F]
   pick index 1 → used = [F, T, F] → recurse → used[1] = F  (un-choose!)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(path, used[])` |
| Choices | every `i` with `used[i] == false` |
| Record | `len(path) == n` |
| Knob | `used[]`, loop from 0 every level |

### Trace

```
  path       used        action
  ─────────  ──────────  ─────────────────────
  [1]        T F F
  [1,2]      T T F
  [1,2,3]    T T T       ✅ record
  [1,3]      T F T       (after popping 3, 2)
  [1,3,2]    T T T       ✅ record
  [2]        F T F
  [2,1,3]                ✅
  [2,3,1]                ✅
  [3]        F F T
  [3,1,2]                ✅
  [3,2,1]                ✅

  6 = 3! results ✅
```

### Pseudocode

```
function permute(nums):
    result ← [], used ← all false
    backtrack([])
    return result

function backtrack(path):
    if len(path) == n: result.add(copy of path); return
    for i from 0 to n-1:
        if used[i]: continue
        used[i] ← true;  path.push(nums[i])
        backtrack(path)
        path.pop();      used[i] ← false
```

### Alternative: swap in place

```
   fix position p: for i from p to n-1: swap(p, i) → recurse(p+1) → swap back
   No used[] and no path list, but output order differs.
```

### Complexity
O(n · n!) time, O(n) extra space.

### 📌 Points to remember
- Permutations: loop from **0** + `used[]`. Combinations: loop from **start**.
- Un-choose **both** the path and `used[i]`.

---

## 8. Permutations II (Medium)

### Problem
`nums` may contain **duplicates**. Return all **unique** permutations.

### Visualize it

```
  sorted [1, 1', 2]

                              []
            ┌─────────────────┼────────────────┐
           [1]              [1'] ✂            [2]
        ┌───┴───┐        (1' before 1:     ┌───┴───┐
     [1,1']   [1,2]       same as [1]     [2,1]   [2,1'] ✂
       │        │          subtree)          │
   [1,1',2] [1,2,1']                     [2,1,1']
```

### The duplicate rule for permutations

```
   skip i  if  i > 0 and nums[i] == nums[i-1] and NOT used[i-1]

   Meaning: equal copies must be used in LEFT-TO-RIGHT order.
            1' may only be placed if 1 is already in the path.

   used[i-1] == false  → 1 is free at this level, so picking 1' here
                          would be a sibling duplicate → ✂
   used[i-1] == true   → 1 is already above us in the branch → fine
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(path, used[])` |
| Choices | unused `i`, minus the duplicate rule |
| Record | `len(path) == n` |
| Pre-step | sort |

### Trace

```
  sorted [1, 1, 2] (indices 0,1,2)

  level   path      i   check                                    result
  ─────   ───────   ─   ──────────────────────────────────────   ────────
  0       []        0   take
  1       [1]       1   nums[1]==nums[0], used[0]=T → allowed
  2       [1,1]     2   take                                     [1,1,2] ✅
  1       [1]       2   take
  2       [1,2]     1   nums[1]==nums[0], used[0]=T → allowed    [1,2,1] ✅
  0       []        1   nums[1]==nums[0], used[0]=F → SKIP ✂
  0       []        2   take
  1       [2]       0   take
  2       [2,1]     1   used[0]=T → allowed                      [2,1,1] ✅
  1       [2]       1   used[0]=F → SKIP ✂

  result: [1,1,2], [1,2,1], [2,1,1]   (3 = 3!/2!) ✅
```

### Pseudocode

```
function permuteUnique(nums):
    sort nums
    result ← [], used ← all false
    backtrack([])
    return result

function backtrack(path):
    if len(path) == n: result.add(copy of path); return
    for i from 0 to n-1:
        if used[i]: continue
        if i > 0 and nums[i] == nums[i-1] and not used[i-1]: continue
        used[i] ← true;  path.push(nums[i])
        backtrack(path)
        path.pop();      used[i] ← false
```

### Alternative
Count map: `{1: 2, 2: 1}`. At each level loop over **distinct values** with count > 0. Duplicates can't happen at all.

### Complexity
O(n · n!) worst case.

### 📌 Points to remember
- Subsets II skip uses `i > start`. Permutations II skip uses `not used[i-1]`. Don't mix them up.
- (`used[i-1]` instead of `not used[i-1]` also produces the right answer, but prunes far later. Prefer `not used`.)

---

## 9. Letter Case Permutation (Medium)

### Problem
Given a string of letters and digits, return every string formed by changing each **letter** to lower or upper case.

### Visualize it (Shape A: include/exclude style)

```
  s = "a1b2"

                         index 0 'a'
                    ┌───────┴───────┐
                  'a'              'A'
                   │                │
               index 1 '1'      index 1 '1'     digit: only one way
                   │                │
               index 2 'b'      index 2 'b'
              ┌────┴────┐      ┌────┴────┐
            'b'        'B'   'b'        'B'
             │          │     │          │
          "a1b2"   "a1B2"  "A1b2"   "A1B2"
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(index, current chars)` |
| Choices | digit: 1 way; letter: lower or upper |
| Record | `index == length` |
| Depth | always n |

### Trace

```
  index  char  branches   partial strings after step
  ─────  ────  ─────────  ─────────────────────────────
  0      'a'   2          a, A
  1      '1'   1          a1, A1
  2      'b'   2          a1b, a1B, A1b, A1B
  3      '2'   1          a1b2, a1B2, A1b2, A1B2

  result: ["a1b2", "a1B2", "A1b2", "A1B2"]  (2^letters = 4) ✅
```

### Pseudocode

```
function letterCasePermutation(s):
    chars ← s as a mutable array
    result ← []
    backtrack(0)
    return result

function backtrack(i):
    if i == n: result.add(string of chars); return
    if chars[i] is a digit:
        backtrack(i + 1)
    else:
        chars[i] ← lowercase(chars[i]);  backtrack(i + 1)
        chars[i] ← uppercase(chars[i]);  backtrack(i + 1)
```

> Overwriting `chars[i]` each time is its own "un-choose": the next branch sets it again.

### Complexity
O(n · 2^L), L = number of letters.

### 📌 Points to remember
- Digits don't branch. Only letters double the count.
- Iterative alternative: start with `[""]`; for each char, every string branches into 1 or 2 strings.

---

## 10. Generate Parentheses (Medium)

### Problem
Generate all **well-formed** strings of `n` pairs of parentheses.

### The two rules that keep a string valid

```
   add '('   if  open  < n        (still have '(' to place)
   add ')'   if  close < open     (there's an unmatched '(' to close)

   These two checks ARE the pruning: invalid prefixes are never built.
```

### Visualize it (n = 2)

```
                      ""  (o=0,c=0)
                      │  ')' ✂ (close<open fails)
                     "("  (1,0)
              ┌───────┴───────┐
            "(("             "()"
            (2,0)            (1,1)
     '(' ✂ │                 │ ')' ✂
          "(()"             "()("
           (2,1)            (2,1)
             │                │
          "(())" ✅        "()()" ✅
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(path, open, close)` |
| Choices | `(` if `open < n`; `)` if `close < open` |
| Record | `len(path) == 2n` |

### Trace (n = 3), results in generation order

```
  ((()))   ← always try '(' first
  (()())
  (())()
  ()(())
  ()()()

  5 results = Catalan(3) ✅
```

### Pseudocode

```
function generateParenthesis(n):
    result ← []
    backtrack("", 0, 0)
    return result

function backtrack(path, open, close):
    if len(path) == 2n: result.add(path); return
    if open < n:      backtrack(path + "(", open + 1, close)
    if close < open:  backtrack(path + ")", open, close + 1)
```

### Complexity
O(4ⁿ / √n), the Catalan number of results times length.

### 📌 Points to remember
- The condition is `close < open`, **not** `close < n`.
- No need to validate at the end: the rules guarantee every leaf is valid.

---

## 11. Palindrome Partitioning (Medium)

### Problem
Split `s` so that **every piece is a palindrome**. Return all such splits.

### Visualize it: choose where the next cut goes

```
  s = "aab"

               start 0
       ┌──────────┼───────────┐
     "a" ✓      "aa" ✓      "aab" ✗ ✂
       │          │
    start 1    start 2
    ┌──┴───┐      │
  "a" ✓  "ab" ✗✂ "b" ✓
    │             │
  start 2      start 3 → ✅ ["aa","b"]
    │
  "b" ✓
    │
  start 3 → ✅ ["a","a","b"]
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, path of pieces)` |
| Choices | end index `e` from `start` to `n-1`, piece = `s[start..e]` |
| Valid | piece must be a palindrome |
| Record | `start == n` |

### Trace

```
  start  piece   palindrome?  path after       action
  ─────  ─────   ───────────  ───────────────  ─────────────
  0      "a"     yes          [a]              recurse(1)
  1      "a"     yes          [a,a]            recurse(2)
  2      "b"     yes          [a,a,b]          start=3 → ✅
  1      "ab"    no           —                ✂
  0      "aa"    yes          [aa]             recurse(2)
  2      "b"     yes          [aa,b]           start=3 → ✅
  0      "aab"   no           —                ✂

  result: [["a","a","b"], ["aa","b"]] ✅
```

### Optimization: precompute a palindrome table

```
  isPal[i][j] = (s[i] == s[j]) and (j − i < 2 or isPal[i+1][j-1])
  Fill i from n-1 down to 0 → every check becomes O(1).

        j→  0   1   2
   i=0    [ T   T   F ]      "a", "aa", "aab"
   i=1    [     T   F ]      "a", "ab"
   i=2    [         T ]      "b"
```

### Pseudocode

```
function partition(s):
    build isPal table (optional)
    result ← []
    backtrack(0, [])
    return result

function backtrack(start, path):
    if start == n: result.add(copy of path); return
    for e from start to n-1:
        if not isPal[start][e]: continue
        path.push(s[start..e])
        backtrack(e + 1, path)
        path.pop()
```

### Complexity
O(n · 2ⁿ): there are up to 2^(n-1) ways to cut.

### 📌 Points to remember
- "Partition a string" = **choose the end of the next piece**.
- Want only the **minimum number of cuts**? That's Palindrome Partitioning II, a DP problem (see `../dynammic programming/03-DP-on-Strings.md`).

---

## 12. Restore IP Addresses (Medium)

### Problem
Insert 3 dots into a digit string to form **all valid IPv4 addresses**.

### Rules for each of the 4 parts

```
  ✓ 1 to 3 digits
  ✓ value 0..255
  ✓ no leading zero unless the part is exactly "0"   ("01" ✗, "0" ✓)
```

### Length pruning (the big speedup)

```
  remaining chars must fit the remaining parts:

      partsLeft ≤ remaining length ≤ 3 × partsLeft

  "25525511135" has 11 chars. First part "2" leaves 10 chars for 3 parts,
  but 3 parts hold at most 9 → ✂ immediately.
```

### Visualize it

```
  s = "25525511135"

                       part 1
         ┌───────────────┼────────────────┐
        "2" ✂           "25"             "255"
    (10 left > 9)         │                 │
                    part 2 all ✂         part 2
                  "5","52" too much  ┌───────┼────────┐
                  left; "525">255  "2" ✂   "25"     "255"
                                 (7>6)     │          │
                                       part 3 all ✂  part 3
                                       ("511">255,   ┌──┼──────┐
                                        others too  "1"✂ "11"  "111"
                                        long)      (4>3)  │       │
                                                       "135"✓   "35"✓
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(start, parts so far)` |
| Choices | next part length 1, 2, or 3 |
| Valid | value ≤ 255, no leading zero, length fits remaining parts |
| Record | 4 parts **and** `start == n` |

### Trace

```
  parts                 remaining   action
  ───────────────────   ─────────   ─────────────────────────────────
  [2]                   10 for 3    10 > 9 → ✂
  [25]                  9 for 3
  [25,5]                8 for 2     8 > 6 → ✂
  [25,52]               7 for 2     ✂
  [25,525]              —           525 > 255 → ✂
  [255]                 8 for 3
  [255,2]               7 for 2     ✂
  [255,25]              6 for 2     part3 must be 3 digits: "511" > 255 ✂
  [255,255]             5 for 2
  [255,255,1]           4 for 1     4 > 3 → ✂
  [255,255,11]          3 for 1     part4 "135" ✓ → ✅ 255.255.11.135
  [255,255,111]         2 for 1     part4 "35" ✓  → ✅ 255.255.111.35

  result: ["255.255.11.135", "255.255.111.35"] ✅
  (edge: "0000" → ["0.0.0.0"])
```

### Pseudocode

```
function restoreIpAddresses(s):
    result ← []
    backtrack(0, [])
    return result

function backtrack(start, parts):
    left ← n − start
    need ← 4 − len(parts)
    if need == 0:
        if left == 0: result.add(join parts with ".")
        return
    if left < need or left > 3 × need: return          // length pruning
    for len from 1 to 3:
        if start + len > n: break
        piece ← s[start .. start+len−1]
        if len > 1 and piece[0] == '0': break           // leading zero
        if value(piece) > 255: break
        parts.push(piece)
        backtrack(start + len, parts)
        parts.pop()
```

### Complexity
At most 3⁴ = 81 leaves: effectively **O(1)** (input is ≤ 12 digits).

### 📌 Points to remember
- Leading zero: `"0"` is fine, `"0x"` is not → `break` (longer pieces start with 0 too).
- `break` on `> 255`, since longer pieces only get bigger.
- Must use **all** digits: record only when `start == n` with exactly 4 parts.

---

## 13. Factor Combinations (Medium)

> **LeetCode Premium (254).** Definition used here: given `n`, return all combinations of
> factors **greater than 1 and less than n** whose product is `n`. Factors in each list are
> non-decreasing; `n` itself is never a factor. `n = 1` or a prime → `[]`.

### Visualize it

```
  n = 12

                         12  (start 2)
            ┌─────────────┴───────────────┐
         try 2                          try 3              try 4: 4·4 > 12 → stop
       12 = 2·6                       12 = 3·4
     record [2,6]                   record [3,4]
          │                               │
     6 (start 2)                     4 (start 3)
          │                          3·3 > 4 → stop
       try 2
     6 = 2·3
  record [2,2,3]
          │
     3 (start 2)
   2·2 > 3 → stop
```

### Key ideas

```
  • Only try factors i with i × i ≤ remaining. The partner (remaining / i) is ≥ i,
    so the list stays non-decreasing and no duplicate orderings appear.
  • Every time i divides remaining, the pair [... , i, remaining/i] is an answer.
  • Then recurse on remaining/i, starting from i (factor may repeat).
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(remaining, start, path)` |
| Choices | `i` from `start` while `i·i ≤ remaining`, `remaining % i == 0` |
| Record | `path + [i, remaining / i]` at each divisor |
| Recurse | `(remaining / i, i, path + [i])` |

### Trace (n = 12)

```
  call               i    i·i ≤ rem?   divides?   record           recurse
  ─────────────────  ─    ──────────   ────────   ──────────────   ───────────────
  (12, 2, [])        2    4 ≤ 12       yes        [2,6]            (6, 2, [2])
   (6, 2, [2])       2    4 ≤ 6        yes        [2,2,3]          (3, 2, [2,2])
    (3, 2, [2,2])    2    4 > 3        stop
   (6, 2, [2])       3    9 > 6        stop
  (12, 2, [])        3    9 ≤ 12       yes        [3,4]            (4, 3, [3])
   (4, 3, [3])       3    9 > 4        stop
  (12, 2, [])        4    16 > 12      stop

  result: [2,6], [2,2,3], [3,4] ✅
```

### Pseudocode

```
function getFactors(n):
    result ← []
    backtrack(n, 2, [])
    return result

function backtrack(rem, start, path):
    i ← start
    while i × i ≤ rem:
        if rem mod i == 0:
            result.add(path + [i, rem / i])
            path.push(i)
            backtrack(rem / i, i, path)
            path.pop()
        i ← i + 1
```

### Complexity
Bounded by the number of factorizations; each level loops up to √rem.

### 📌 Points to remember
- `i × i ≤ rem` is the pruning **and** the duplicate guard.
- Start the child at `i` (repeat allowed), like Combination Sum.
- Never record `[n]` alone.

---

## 14. Generalized Abbreviation (Medium)

> **LeetCode Premium (320).** Definition used here: for each character, either **keep** it or
> **abbreviate** it. Consecutive abbreviated characters merge into one number
> (`"word"` → `"w2d"` means "o" and "r" were abbreviated). Return all `2ⁿ` abbreviations.

### Visualize it (Shape A: keep or abbreviate)

```
  word = "ab"

                         i=0, cur="", count=0
                ┌──────────────┴──────────────┐
           ABBREV 'a'                     KEEP 'a'
         cur="", count=1               cur="a", count=0
           ┌────┴─────┐                 ┌────┴─────┐
      ABBREV 'b'   KEEP 'b'        ABBREV 'b'   KEEP 'b'
      count=2      cur="1b"        count=1      cur="ab"
         │            │               │            │
        "2"         "1b"            "a1"         "ab"

  The pending count is only written out when a KEPT char arrives, or at the end.
  That's what makes "1" + "1" merge into "2".
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `(i, cur, count)`: position, built string, pending abbreviated run |
| Choice 1 | abbreviate: `(i+1, cur, count+1)` |
| Choice 2 | keep: `(i+1, cur + (count if >0) + word[i], 0)` |
| Record | `i == n`: `cur + (count if > 0)` |

### Trace ("ab")

```
  path of choices     cur    count   at end → result
  ─────────────────   ────   ─────   ───────────────
  abbrev, abbrev      ""     2       "2"
  abbrev, keep        "1b"   0       "1b"
  keep,   abbrev      "a"    1       "a1"
  keep,   keep        "ab"   0       "ab"

  result: ["2", "1b", "a1", "ab"]  (2² = 4) ✅

  "word" → 16 results:
  4, 3d, 2r1, 2rd, 1o2, 1o1d, 1or1, 1ord, w3, w2d, w1r1, w1rd, wo2, wo1d, wor1, word
```

### Pseudocode

```
function generateAbbreviations(word):
    result ← []
    backtrack(0, "", 0)
    return result

function backtrack(i, cur, count):
    if i == n:
        result.add(cur + (count > 0 ? toString(count) : ""))
        return
    backtrack(i + 1, cur, count + 1)                                       // abbreviate
    backtrack(i + 1, cur + (count > 0 ? toString(count) : "") + word[i], 0) // keep
```

### Alternative
Bitmask: for each mask in `0..2ⁿ-1`, bit = 1 means abbreviate; walk the word merging runs of 1s.

### Complexity
O(n · 2ⁿ).

### 📌 Points to remember
- Carry the **count**, not the digits. Flush it only on keep or at the end.
- Same skeleton as Letter Case Permutation: two choices per character.

---

## 15. Master Cheat Sheet

### All 14 problems at a glance

```
┌───────────────────────────┬──────────────┬──────────────────────────────────────┬──────────────┐
│ Problem                   │ Tree shape   │ Knobs                                │ Record when  │
├───────────────────────────┼──────────────┼──────────────────────────────────────┼──────────────┤
│ Subsets                   │ for-loop     │ start, i+1                           │ every node   │
│ Subsets II                │ for-loop     │ sort + skip (i>start), i+1           │ every node   │
│ Combinations              │ for-loop     │ start, i+1, size prune               │ size == k    │
│ Combination Sum           │ for-loop     │ sort, recurse with i (reuse), break  │ rem == 0     │
│ Combination Sum II        │ for-loop     │ sort + skip, i+1, break              │ rem == 0     │
│ Combination Sum III       │ for-loop     │ 1..9, i+1, break                     │ size k, rem 0│
│ Permutations              │ for-loop 0..n│ used[]                               │ size == n    │
│ Permutations II           │ for-loop 0..n│ used[] + sort + skip (!used[i-1])    │ size == n    │
│ Letter Case Permutation   │ binary       │ letter: 2 ways, digit: 1             │ i == n       │
│ Generate Parentheses      │ binary       │ open < n, close < open               │ len == 2n    │
│ Palindrome Partitioning   │ cut position │ piece must be palindrome             │ start == n   │
│ Restore IP Addresses      │ cut 1..3     │ ≤255, no lead 0, length prune        │ 4 parts, end │
│ Factor Combinations       │ for-loop     │ i·i ≤ rem, start at i                │ each divisor │
│ Generalized Abbreviation  │ binary       │ keep / abbreviate, carry count       │ i == n       │
└───────────────────────────┴──────────────┴──────────────────────────────────────┴──────────────┘
```

### Pattern family tree

```
                         CHOICE-BASED BACKTRACKING
                                    │
       ┌────────────────────┬───────┴─────────┬──────────────────────┐
       │                    │                 │                      │
  SUBSET / COMBO        PERMUTATION       BINARY CHOICE         PARTITION / CUT
  (start index)         (used[])          per position          (where's the next cut)
       │                    │                 │                      │
 ├ Subsets            ├ Permutations    ├ Letter Case Perm    ├ Palindrome Partitioning
 ├ Subsets II (dup)   └ Permutations II ├ Generate Parens     └ Restore IP Addresses
 ├ Combinations           (dup)         └ Generalized Abbrev
 ├ Combination Sum (reuse)
 ├ Combination Sum II (dup)
 ├ Combination Sum III
 └ Factor Combinations (reuse, i·i ≤ n)
```

### Knob decision card

```
   Does ORDER matter?
        ├── no  → start index
        │          ├── may reuse an item?   yes → recurse(i)     no → recurse(i + 1)
        │          └── input has duplicates? → sort + skip (i > start and a[i]==a[i-1])
        └── yes → used[] and loop from 0
                   └── input has duplicates? → sort + skip (a[i]==a[i-1] and not used[i-1])

   Is there a target / limit?   → sort + BREAK when the candidate overshoots
   Building a string by position? → binary / per-position choices, record at the end
   Splitting a string?          → loop over the END of the next piece
```

### Optimization checklist

```
  ☐ Sorted candidates + break (not continue) on overshoot
  ☐ Size pruning: not enough items left to finish? stop early
  ☐ Length pruning (IP): remaining chars must fit remaining parts
  ☐ Precompute validity tables (palindrome isPal[i][j])
  ☐ Skip duplicates at generation time, never dedupe the output with a set
  ☐ Mutate one shared path + undo, instead of copying at every level
```

### 🚩 Common bugs to avoid

```
  ✗ result.add(path) without copying → all answers end up empty
  ✗ recursing with start + 1 instead of i + 1
  ✗ i > 0 instead of i > start in the Subsets II / Comb Sum II skip
  ✗ forgetting to sort before the duplicate skip
  ✗ using continue instead of break after sorting (correct but slow)
  ✗ forgetting to reset used[i] = false on the way back
  ✗ Generate Parens: close < n instead of close < open
  ✗ Restore IP: allowing "01", or not requiring all digits to be used
  ✗ Abbreviation: writing "11" instead of "2" for adjacent abbreviations
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "At this node, what are my CHOICES, which ones would    ║
   ║   repeat a sibling, and which ones can never succeed?"   ║
   ╚══════════════════════════════════════════════════════════╝
     Choices → the loop.  Repeats → the duplicate skip.  Never succeed → the prune.
```

---

### ✅ Progress tracker

- [ ] Subsets (Medium)
- [ ] Subsets II (Medium)
- [ ] Combinations (Medium)
- [ ] Combination Sum (Medium)
- [ ] Combination Sum II (Medium)
- [ ] Combination Sum III (Medium)
- [ ] Permutations (Medium)
- [ ] Permutations II (Medium)
- [ ] Letter Case Permutation (Medium)
- [ ] Generate Parentheses (Medium)
- [ ] Palindrome Partitioning (Medium)
- [ ] Restore IP Addresses (Medium)
- [ ] Factor Combinations (Medium)
- [ ] Generalized Abbreviation (Medium)
