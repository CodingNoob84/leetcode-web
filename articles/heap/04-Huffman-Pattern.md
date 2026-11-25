# Huffman Pattern (Heap): A Visual Guide

> **Goal:** Learn to spot "combine things pairwise at minimum cost" problems, see *why* merging the
> two smallest is always right, and know the one case where it is **wrong**.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is the Huffman Pattern?](#0-the-big-idea-what-is-the-huffman-pattern)
1. [Minimum Cost of Ropes (Easy)](#1-minimum-cost-of-ropes-easy)
2. [Minimum Cost to Connect Sticks (Medium)](#2-minimum-cost-to-connect-sticks-medium)
3. [Merge Files with Minimum Cost (Medium)](#3-merge-files-with-minimum-cost-medium)
4. [Combine Numbers with Minimum Cost (Medium)](#4-combine-numbers-with-minimum-cost-medium)
5. [Last Stone Weight (Easy)](#5-last-stone-weight-easy)
6. [Master Cheat Sheet](#6-master-cheat-sheet)

> **Suggested order:** Ropes → Sticks → Files → Combine Numbers → Last Stone Weight.
> The first four are **the same algorithm in four costumes**. Learn it once on Ropes, then
> recognize it three more times. Last Stone Weight is a twist: it uses a **max**-heap.

---

## 0. The Big Idea: What Is the Huffman Pattern?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "HUFFMAN"                               │
├──────────────────────────────────────────────────────────────────┤
│  • You COMBINE two items into one, again and again               │
│  • Combining costs (size of A + size of B)                       │
│  • The new item goes BACK into the pool and can be combined again│
│  • Repeat until ONE item is left                                 │
│  • Asked: MINIMUM total cost                                     │
│  • ANY two items may be combined (not just neighbors!)  ⚠        │
└──────────────────────────────────────────────────────────────────┘
```

### The strategy in one line

```
   ┌────────────────────────────────────────────────────────────┐
   │  Always combine the TWO SMALLEST items. Use a MIN-HEAP.    │
   └────────────────────────────────────────────────────────────┘
```

### Every merge history is a TREE

Draw each merge as a parent node over its two children. Leaves = original items,
internal nodes = merge results. **The cost of one merge = the value of the new internal node.**

```
   items: 4, 3, 2, 6          one possible merge history

                  (15)        ← merge 3: 6 + 9   cost 15
                 /    \
               (9)     6      ← merge 2: 4 + 5   cost  9
              /   \
             4    (5)         ← merge 1: 2 + 3   cost  5
                 /   \
                2     3
                                  total = 5 + 9 + 15 = 29

   TOTAL COST = SUM OF ALL INTERNAL NODES
```

### The key insight: an item is paid for once per level it sits under

```
   Item 2 is inside (5), (9) and (15)  → paid 3 times  (depth 3)
   Item 3 is inside (5), (9) and (15)  → paid 3 times  (depth 3)
   Item 4 is inside (9) and (15)       → paid 2 times  (depth 2)
   Item 6 is inside (15)               → paid 1 time   (depth 1)

   total = 2·3 + 3·3 + 4·2 + 6·1 = 6 + 9 + 8 + 6 = 29 ✓

   ┌───────────────────────────────────────────────────────────┐
   │  TOTAL = Σ ( item × its depth in the merge tree )         │
   │                                                           │
   │  → BIG items should sit HIGH  (small depth, paid rarely)  │
   │  → SMALL items can sit DEEP   (paid often, but cheap)     │
   └───────────────────────────────────────────────────────────┘
```

This is exactly **Huffman coding**: frequent letters get short codes (sit near the root),
rare letters get long codes (sit deep). Same math, same greedy.

### Why "merge the two smallest" is optimal (exchange argument)

```
   Claim: in SOME optimal tree, the two smallest items are siblings at the DEEPEST level.

   Suppose an optimal tree has a bigger item B deep and a small item s higher up:

            ...                              ...
           /                                /
         s          (depth d1, shallow)   B           ← swap them
         ...                              ...
            B       (depth d2, deeper)       s

   Swapping changes the cost by:  (B − s) · (d1 − d2)
                                   ▲          ▲
                                 ≥ 0        ≤ 0  (d1 is shallower)
   → the cost does NOT go up. So pushing the small items down never hurts.

   Then: merge those two smallest siblings into one item, and the
   remaining problem is the same problem with one fewer item → repeat.
```

### Why a heap?

```
   Each step: take the 2 smallest, push 1 new item.

   ┌────────────────────┬──────────────────┬───────────────┐
   │ Structure          │ per step         │ total         │
   ├────────────────────┼──────────────────┼───────────────┤
   │ re-sort every time │ O(n log n)       │ O(n² log n)   │
   │ unsorted list scan │ O(n)             │ O(n²)         │
   │ MIN-HEAP           │ O(log n)         │ O(n log n) ✅ │
   └────────────────────┴──────────────────┴───────────────┘
```

### The universal template

```
function huffmanCost(items):
    heap ← min-heap built from items          // O(n) heapify
    total ← 0
    while size(heap) > 1:
        a ← pop(heap)                          // smallest
        b ← pop(heap)                          // second smallest
        total ← total + (a + b)                // pay for this merge
        push(heap, a + b)                      // the merged item goes back
    return total
```

> Edge cases: 0 or 1 item → cost **0** (nothing to merge).
> Use 64-bit totals: the sum of internal nodes can be much larger than any single item.

---

### ⚠ The crucial contrast: ANY pair vs ADJACENT pairs only

```
   ┌──────────────────────────────┬───────────────────────────────────────┐
   │ You may merge ANY two items  │ You may merge only NEIGHBORS          │
   │ (order doesn't matter)       │ (items sit in a fixed row)            │
   ├──────────────────────────────┼───────────────────────────────────────┤
   │ GREEDY + MIN-HEAP ✅         │ greedy FAILS ❌ → INTERVAL DP         │
   │ O(n log n)                   │ O(n³)                                 │
   │ this guide                   │ Merge Stones / Merge Intervals w/ Cost│
   └──────────────────────────────┴───────────────────────────────────────┘
```

**Counterexample for "greedy on neighbors":** row `[6, 4, 4, 6]`, merge only adjacent piles.

```
   Greedy "merge the cheapest adjacent pair":
     [6, 4, 4, 6]   pairs: 10, 8, 10  → merge 4+4 = 8
     [6, 8, 6]      pairs: 14, 14     → merge 6+8 = 14
     [14, 6]                          → merge     = 20
                                         total    = 8 + 14 + 20 = 42 ❌

   Better plan:
     [6, 4, 4, 6]   merge 6+4 = 10  → [10, 4, 6]
     [10, 4, 6]     merge 4+6 = 10  → [10, 10]
     [10, 10]       merge     = 20
                                         total    = 10 + 10 + 20 = 40 ✅
```

The cheap local merge (4+4) created a big middle pile that then had to be paid for again.
When neighbors are forced, you must try every split → see
[Merge Stones in the Interval DP guide](../dynammic%20programming/04-DP-on-Intervals.md).

> For more "sort / pick the locally best" problems, see the [greedy folder](../greedy/).

---

## 1. Minimum Cost of Ropes (Easy)

### Problem (GFG)
Given `n` ropes with lengths `arr[]`, connect them into one rope.
Connecting two ropes costs the **sum of their lengths**. Return the minimum total cost.

### Visualize it

```
   ropes:   ════ (4)    ═══ (3)    ══ (2)    ══════ (6)

   connect 2 + 3  →  ═════ (5)       pay 5
   connect 4 + 5  →  ═════════ (9)   pay 9
   connect 6 + 9  →  ═══════════════ (15)  pay 15
                                     ─────────
                                     total 29 ✅
```

### The 4 steps

| Step | Answer |
|------|--------|
| What is an "item"? | one rope (its length) |
| What does a merge cost? | `a + b` |
| Greedy choice | always connect the two **shortest** ropes |
| Answer | sum of all merge costs |

### Trace (arr = [4, 3, 2, 6])

```
  step │ heap (min first)  │ pop a, b │ merge │ total
  ─────┼───────────────────┼──────────┼───────┼──────
   0   │ [2, 3, 4, 6]      │          │       │   0
   1   │ [2, 3, 4, 6]      │  2, 3    │   5   │   5
       │ → [4, 5, 6]       │          │       │
   2   │ [4, 5, 6]         │  4, 5    │   9   │  14
       │ → [6, 9]          │          │       │
   3   │ [6, 9]            │  6, 9    │  15   │  29
       │ → [15]            │          │       │
                                     answer = 29 ✅
```

### The merge tree

```
                (15)
               /    \
              6     (9)
                   /   \
                  4    (5)
                      /   \
                     2     3

   internal nodes: 5 + 9 + 15 = 29 ✓
```

### Pseudocode

```
function minCostRopes(arr):
    if length(arr) ≤ 1: return 0
    heap ← min-heap of arr
    total ← 0
    while size(heap) > 1:
        a ← pop(heap)
        b ← pop(heap)
        total ← total + a + b
        push(heap, a + b)
    return total
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Re-sort after every merge | O(n² log n) | O(n) |
| Scan for two minimums each time | O(n²) | O(1) |
| **Min-heap** | **O(n log n)** | **O(n)** ✅ |

### 📌 Points to remember
- **Min-heap**, not max-heap: you want the two **shortest**.
- The merged rope goes **back** into the heap. That's what makes it Huffman.
- One rope → cost 0.
- Use a 64-bit total (GFG lengths can be large).

---

## 2. Minimum Cost to Connect Sticks (Medium)

### Problem (LeetCode premium 1167)
`sticks[]` are positive integer lengths. Connecting sticks of lengths `x` and `y` costs `x + y`
and produces one stick of length `x + y`. Connect all into one stick at minimum cost.

> **This is Minimum Cost of Ropes with "rope" renamed to "stick".** Same code, word for word.

### Trace 1 (sticks = [2, 4, 3])

```
  heap           │ pop a, b │ merge │ total
  ───────────────┼──────────┼───────┼──────
  [2, 3, 4]      │  2, 3    │   5   │   5
  [4, 5]         │  4, 5    │   9   │  14
  [9]            │  done    │       │
                               answer = 14 ✅

          (9)
         /   \
        4    (5)
            /   \
           2     3
```

### Trace 2 (sticks = [1, 8, 3, 5])

```
  heap            │ pop a, b │ merge │ total
  ────────────────┼──────────┼───────┼──────
  [1, 3, 5, 8]    │  1, 3    │   4   │   4
  [4, 5, 8]       │  4, 5    │   9   │  13
  [8, 9]          │  8, 9    │  17   │  30
  [17]            │  done    │       │
                               answer = 30 ✅

             (17)
            /    \
           8     (9)
                /   \
              (4)    5
             /   \
            1     3

   check by depth: 1·3 + 3·3 + 5·2 + 8·1 = 3 + 9 + 10 + 8 = 30 ✓
```

### Why not "always add the next stick to the big one"?

```
   [1, 8, 3, 5] in the given order, chaining left to right:
     1+8 = 9 (9) → 9+3 = 12 (21) → 12+5 = 17 (38)        total 38 ❌

   The 8 got paid 3 times. Huffman pays for it only once (it sits at depth 1).
```

### Pseudocode

```
function connectSticks(sticks):
    return huffmanCost(sticks)       // the template from Section 0
```

### 📌 Points to remember
- Premium definition: `1 ≤ sticks.length`, all lengths positive, one stick → 0.
- If you recognize the pattern, this problem is **one line**.
- The "depth" check (`Σ item × depth`) is a great way to verify a trace by hand.

---

## 3. Merge Files with Minimum Cost (Medium)

### Problem (Optimal File Merge Pattern)
You have `n` sorted files with sizes `files[]`. Merging two files of sizes `x` and `y`
takes `x + y` operations (every record is read and written once) and produces one file of
size `x + y`. Merge all files into one with the fewest total operations.

> Again the same algorithm. A merged file goes back into the pool, and **any** two files
> may be merged (files don't sit in a fixed row).

### Visualize it

```
   files:  [20]  [30]  [10]  [5]  [30]

   Merging two files = walking through both of them once:

      file A ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  (20 records)
      file B ▓▓▓▓▓▓▓▓▓▓            (10 records)
                    ↓ merge (30 operations)
      file AB ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

### Trace (files = [20, 30, 10, 5, 30])

```
  step │ heap (min first)        │ pop a, b │ merge │ total
  ─────┼─────────────────────────┼──────────┼───────┼──────
   0   │ [5, 10, 20, 30, 30]     │          │       │    0
   1   │ [5, 10, 20, 30, 30]     │  5, 10   │  15   │   15
       │ → [15, 20, 30, 30]      │          │       │
   2   │ [15, 20, 30, 30]        │ 15, 20   │  35   │   50
       │ → [30, 30, 35]          │          │       │
   3   │ [30, 30, 35]            │ 30, 30   │  60   │  110
       │ → [35, 60]              │          │       │
   4   │ [35, 60]                │ 35, 60   │  95   │  205
       │ → [95]                  │          │       │
                                           answer = 205 ✅
```

### The merge tree

```
                    (95)
                  /      \
               (35)       (60)
              /    \      /   \
           (15)    20   30    30
          /    \
         5     10

   check by depth:
     5·3 + 10·3 + 20·2 + 30·2 + 30·2
   = 15  + 30   + 40   + 60   + 60    = 205 ✓
```

> Notice the two 30s merged with **each other** in step 3, not with the 35.
> The heap always grabs the two smallest, whatever they are.

### Pseudocode

```
function optimalFileMerge(files):
    return huffmanCost(files)
```

### 📌 Points to remember
- Classic textbook name: **Optimal Merge Pattern**. Same as Huffman, same as Ropes.
- Total operations = sum of the internal nodes = Σ size × depth.
- If an interviewer says the files must stay **in order** and only neighbors merge → that's
  the interval DP version (Section 0), not this.

---

## 4. Combine Numbers with Minimum Cost (Medium)

### Problem (definition assumed here)
Given a list of positive integers, repeatedly pick **any two** numbers, remove them, and add
their **sum** back to the list. Each combination costs that sum. Continue until one number
remains. Return the minimum total cost.

> This name is used by a few problem sets for the same idea. If your version only allows
> combining **adjacent** numbers, use interval DP instead (Section 0).

### Trace (nums = [1, 2, 3, 4, 5])

```
  step │ heap (min first)     │ pop a, b │ merge │ total
  ─────┼──────────────────────┼──────────┼───────┼──────
   0   │ [1, 2, 3, 4, 5]      │          │       │   0
   1   │ [1, 2, 3, 4, 5]      │  1, 2    │   3   │   3
       │ → [3, 3, 4, 5]       │          │       │
   2   │ [3, 3, 4, 5]         │  3, 3    │   6   │   9
       │ → [4, 5, 6]          │          │       │
   3   │ [4, 5, 6]            │  4, 5    │   9   │  18
       │ → [6, 9]             │          │       │
   4   │ [6, 9]               │  6, 9    │  15   │  33
       │ → [15]               │          │       │
                                         answer = 33 ✅
```

### The merge tree

```
                  (15)
                /      \
              (6)       (9)
             /   \     /   \
           (3)    3   4     5
          /   \
         1     2

   check by depth: 1·3 + 2·3 + 3·2 + 4·2 + 5·2 = 3 + 6 + 6 + 8 + 10 = 33 ✓
```

> Ties (two 3s in step 2) don't matter. Any choice among equal values gives the same total.

### The four problems are ONE algorithm

```
┌──────────────────────────────┬──────────┬──────────────┬─────────────────┐
│ Problem                      │ "item"   │ merge cost   │ new item        │
├──────────────────────────────┼──────────┼──────────────┼─────────────────┤
│ Minimum Cost of Ropes        │ rope     │ len a + len b│ rope of a + b   │
│ Min Cost to Connect Sticks   │ stick    │ a + b        │ stick of a + b  │
│ Merge Files with Min Cost    │ file     │ size a + b   │ file of a + b   │
│ Combine Numbers w/ Min Cost  │ number   │ a + b        │ number a + b    │
├──────────────────────────────┴──────────┴──────────────┴─────────────────┤
│  ALL FOUR = huffmanCost(items):  min-heap, pop 2, add, push sum back     │
└──────────────────────────────────────────────────────────────────────────┘
```

### 📌 Points to remember
- When a problem says "combine any two, cost = their sum, until one remains" → stop reading,
  it's Huffman.
- Check the word **"adjacent"**. Its presence changes the whole solution.

---

## 5. Last Stone Weight (Easy)

### Problem (LeetCode 1046)
Stones have weights `stones[]`. Each turn, take the **two heaviest** stones `x ≤ y` and smash them:
- if `x == y`, both are destroyed;
- otherwise `x` is destroyed and `y` becomes `y − x`.

Return the weight of the last stone, or `0` if none are left.

### The twist

```
   Huffman:           take TWO SMALLEST → push their SUM       → MIN-heap
   Last Stone Weight: take TWO LARGEST  → push their DIFFERENCE → MAX-heap

   Same "pop two, push one back" loop, different heap and different combine.
   There is no "cost" to minimize here — you just simulate.
```

> Languages with only a min-heap: store **negated** weights, so the smallest stored value
> is the largest stone.

### Visualize it

```
   💎8  vs  💎7   → 8 − 7 = 1 survives

        ┌───┐  ┌───┐               ┌───┐
        │ 8 │  │ 7 │    ──smash──► │ 1 │
        └───┘  └───┘               └───┘
```

### Trace (stones = [2, 7, 4, 1, 8, 1])

```
  step │ max-heap (largest first) │ pop y, x │ y − x │ push?
  ─────┼──────────────────────────┼──────────┼───────┼───────
   0   │ [8, 7, 4, 2, 1, 1]       │          │       │
   1   │ [8, 7, 4, 2, 1, 1]       │  8, 7    │   1   │ push 1
       │ → [4, 2, 1, 1, 1]        │          │       │
   2   │ [4, 2, 1, 1, 1]          │  4, 2    │   2   │ push 2
       │ → [2, 1, 1, 1]           │          │       │
   3   │ [2, 1, 1, 1]             │  2, 1    │   1   │ push 1
       │ → [1, 1, 1]              │          │       │
   4   │ [1, 1, 1]                │  1, 1    │   0   │ nothing
       │ → [1]                    │          │       │
                                         answer = 1 ✅
```

### Pseudocode

```
function lastStoneWeight(stones):
    heap ← max-heap of stones
    while size(heap) > 1:
        y ← pop(heap)                // heaviest
        x ← pop(heap)                // second heaviest
        if y ≠ x:
            push(heap, y − x)
    return size(heap) == 1 ? top(heap) : 0
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort every round | O(n² log n) | O(1) |
| **Max-heap** | **O(n log n)** | O(n) ✅ |
| Counting sort (weights ≤ 1000) | O(n + W) | O(W) |

### ⚠ Don't confuse it with Last Stone Weight II

```
   Last Stone Weight II (LC 1049): you CHOOSE which stones to smash, and want the
   SMALLEST possible final weight.

   That is NOT a heap problem. Any smashing order splits the stones into two groups
   (+ and −), so the answer = min |sum(A) − sum(B)|
   → a 0-1 KNAPSACK / subset sum to total/2.
```

See the [Knapsack / Subset Sum guide](../dynammic%20programming/06-Knapsack-Subset-Sum.md).

### 📌 Points to remember
- **Max**-heap, and push the **difference**, only if it is non-zero.
- Empty heap at the end → return **0**.
- Simulation problem: no optimization, no proof needed. The rules tell you exactly what to do.

---

## 6. Master Cheat Sheet

### All 5 problems at a glance

```
┌────────────────────────────┬────────────┬───────────────────────────────┬────────────┐
│ Problem                    │ Heap       │ Each step                     │ Example    │
├────────────────────────────┼────────────┼───────────────────────────────┼────────────┤
│ Minimum Cost of Ropes      │ min        │ pop 2 smallest, cost += sum,  │ [4,3,2,6]  │
│                            │            │ push sum                      │   → 29     │
│ Min Cost to Connect Sticks │ min        │ same                          │ [1,8,3,5]  │
│                            │            │                               │   → 30     │
│ Merge Files w/ Min Cost    │ min        │ same                          │ [20,30,10, │
│                            │            │                               │  5,30]→205 │
│ Combine Numbers w/ Min Cost│ min        │ same                          │ [1..5]→ 33 │
│ Last Stone Weight          │ MAX        │ pop 2 largest, push diff ≠ 0  │ [2,7,4,1,  │
│                            │            │                               │  8,1] → 1  │
└────────────────────────────┴────────────┴───────────────────────────────┴────────────┘
   All: O(n log n) time, O(n) space.
```

### Pattern family tree

```
                        "POP TWO, PUSH ONE BACK"
                                  │
            ┌─────────────────────┴─────────────────────┐
            │                                           │
    MINIMIZE TOTAL MERGE COST                     SIMULATE RULES
    (min-heap, push the SUM)                (max-heap, push the DIFF)
            │                                           │
    ├─ Minimum Cost of Ropes                    └─ Last Stone Weight
    ├─ Min Cost to Connect Sticks
    ├─ Merge Files with Min Cost
    └─ Combine Numbers with Min Cost

    Cousins elsewhere:
      • ADJACENT merges only  → Interval DP (Merge Stones)
      • choose signs ±        → Knapsack (Last Stone Weight II)
      • Huffman coding        → same greedy, builds the code tree
```

### Decision card

```
   "Combine two into one, repeat until one remains"
                        │
           Can ANY two be combined?
             │                   │
            YES                  NO (only neighbors)
             │                   │
   Is it "minimize cost"?    Interval DP, O(n³)
     │            │
    YES           NO, fixed rules
     │            │
  MIN-HEAP,     Simulate with the
  pop 2 smallest heap the rules ask for
```

### Optimization checklist

```
  ☐ Build the heap with heapify (O(n)), not n pushes (O(n log n)) — small win
  ☐ Total can overflow 32-bit → use 64-bit
  ☐ Only a min-heap available? Negate values for a max-heap
  ☐ Small bounded weights? Counting buckets can replace the heap
  ☐ Verify a trace with Σ item × depth in the merge tree
```

### 🚩 Common bugs to avoid

```
  ✗ Using a max-heap for the cost problems (you'd merge the BIG items first)
  ✗ Forgetting to push the merged item back (then it's not Huffman)
  ✗ Sorting once and adding left to right (the merged item may not stay smallest)
  ✗ Applying greedy when only ADJACENT items may merge
  ✗ Last Stone Weight: pushing 0 when stones are equal, or not returning 0 on empty
  ✗ Not handling n = 1 (answer 0 for the cost problems)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Is every item paid for once per merge it ends up in,   ║
   ║   and may I merge ANY two items?"                        ║
   ╚══════════════════════════════════════════════════════════╝
      Yes to both → min-heap, always merge the two smallest.
```

---

### ✅ Progress tracker

- [ ] Minimum Cost of Ropes (Easy)
- [ ] Minimum Cost to Connect Sticks (Medium)
- [ ] Merge Files with Minimum Cost (Medium)
- [ ] Combine Numbers with Minimum Cost (Medium)
- [ ] Last Stone Weight (Easy)
