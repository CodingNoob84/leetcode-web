# DP on Intervals: A Visual Guide

> **Goal:** Learn to *see* interval DP problems, fill the triangle table by hand, and pick the right split.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [02-2D-Grid-DP.md](02-2D-Grid-DP.md). The table is 2D, but the meaning is different:
> `dp[i][j]` is about a **range** `i..j`, not a cell.

---

## Table of Contents

0. [The Big Idea: What Is Interval DP?](#0-the-big-idea-what-is-interval-dp)
1. [Matrix Chain Multiplication (Hard)](#1-matrix-chain-multiplication-hard)
2. [Merge Intervals with Cost (Medium)](#2-merge-intervals-with-cost-medium)
3. [Minimum Cost to Cut a Stick (Hard)](#3-minimum-cost-to-cut-a-stick-hard)
4. [Burst Balloons (Hard)](#4-burst-balloons-hard)
5. [Evaluate Expression to True / Boolean Parenthesization (Hard)](#5-evaluate-expression-to-true--boolean-parenthesization-hard)
6. [Minimum Cost to Merge Stones (Hard)](#6-minimum-cost-to-merge-stones-hard)
7. [Master Cheat Sheet](#7-master-cheat-sheet)

> **Suggested order:** Matrix Chain → Merge with Cost → Cut a Stick → Burst Balloons
> → Boolean Parenthesization → Merge Stones.
> Matrix Chain is the template. Every other problem changes the cost, the split rule, or what each cell stores.

---

## 0. The Big Idea: What Is Interval DP?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "INTERVAL DP"                           │
├──────────────────────────────────────────────────────────────────┤
│  • A sequence you SPLIT, MERGE, CUT, BURST, or PARENTHESIZE      │
│  • The ORDER of operations changes the total cost                │
│  • An action on the middle CHANGES the neighbors (balloons)      │
│  • "Minimum cost to combine everything into one"                 │
│  • "How many ways to parenthesize ..."                           │
│  • n is small: usually ≤ 100–500 (hint: O(n³) is expected)       │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: a range and a split point

```
   dp[i][j] = best answer for the piece  i .. j  of the sequence

        i                 k   k+1               j
       ┌───┬───┬───┬───┬───┐ ┌───┬───┬───┬───┬───┐
       │   │   │   │   │   │ │   │   │   │   │   │
       └───┴───┴───┴───┴───┘ └───┴───┴───┴───┴───┘
        └──── dp[i][k] ────┘ └──── dp[k+1][j] ───┘
               LEFT                 RIGHT

   dp[i][j] = best over every split k of:
                 dp[i][k]  +  dp[k+1][j]  +  cost of joining the two halves
```

### "Try every split" picture

```
   range [a b c d]

   k after a:   [a] | [b c d]
   k after b:   [a b] | [c d]          ← try ALL of them,
   k after c:   [a b c] | [d]            keep the best

   Each half is a SMALLER interval → already solved.
```

### The fill order: by interval LENGTH (diagonals)

```
   Rows = i (start), columns = j (end). Only j ≥ i matters (upper triangle).

          j=0   j=1   j=2   j=3
        ┌─────┬─────┬─────┬─────┐
  i=0   │ L1  │ L2  │ L3  │ L4  │  ← answer lives here: dp[0][n-1]
        ├─────┼─────┼─────┼─────┤
  i=1   │  ╳  │ L1  │ L2  │ L3  │
        ├─────┼─────┼─────┼─────┤
  i=2   │  ╳  │  ╳  │ L1  │ L2  │
        ├─────┼─────┼─────┼─────┤
  i=3   │  ╳  │  ╳  │  ╳  │ L1  │
        └─────┴─────┴─────┴─────┘

   L1 = length 1 (base cases, the main diagonal)
   then L2 diagonal, then L3 ... toward the top-right corner.

   Why? dp[i][j] needs dp[i][k] (same ROW, to its LEFT) and
        dp[k+1][j] (same COLUMN, BELOW it). Both are shorter intervals,
        so filling short → long guarantees they are ready.
```

> ⚠️ Filling row by row, top to bottom (like a grid) does **not** work here.
> Always loop over **length first**, then the start `i`, then derive `j = i + len - 1`.

### The general loop skeleton

```
for len from 2 to n:                 // interval length
    for i from 0 to n − len:         // start
        j ← i + len − 1              // end
        dp[i][j] ← worst value
        for k from i to j − 1:       // split point
            dp[i][j] ← best( dp[i][j],
                             dp[i][k] + dp[k+1][j] + joinCost(i, k, j) )
```

### "FIRST action" vs "LAST action": the trick that unlocks the hard ones

```
   Two ways to choose k:

   ┌──────────────────────────────┬────────────────────────────────────┐
   │ k = FIRST thing you do       │ k = LAST thing you do              │
   ├──────────────────────────────┼────────────────────────────────────┤
   │ After the action, the two    │ Before the action, the left and    │
   │ sides may INTERACT (e.g. a   │ right sides were solved SEPARATELY │
   │ burst balloon makes its two  │ and k was still standing as a      │
   │ neighbors touch)             │ fixed WALL between them            │
   │ → subproblems NOT independent│ → subproblems INDEPENDENT ✅       │
   └──────────────────────────────┴────────────────────────────────────┘

   Matrix Chain / Merge:  k = the LAST multiply / merge (the top of the tree)
   Burst Balloons:        k = the LAST balloon to burst
   Cut a Stick:           k = the FIRST cut (it's fine here: the two pieces
                              really are independent once cut)
```

> 💡 **Key insight:** ask "if I pick k this way, are the left and right parts
> independent?" If yes, that choice of k works. If not, flip from first to last.

### The 5-step recipe (interval version)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  STATE        dp[i][j] = best for range i..j           │
 │                      (decide: inclusive? open (i, j)?)        │
 │ STEP 2  SPLIT        what does k mean? first or LAST action?  │
 │ STEP 3  BASE         length 1 (or 0) intervals                │
 │ STEP 4  ORDER        by increasing length                     │
 │ STEP 5  ANSWER       dp[0][n-1] (or dp[0][n+1] with padding)  │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Matrix Chain Multiplication (Hard)

### Problem
Matrices `A1, A2, ..., An`, where `Ai` has size `p[i-1] × p[i]`.
Multiplying an `a × b` matrix by a `b × c` matrix costs `a·b·c` scalar multiplications.
Find the parenthesization with the **minimum total cost**. (You only choose the order, not the result.)

### Visualize it: the order matters a lot

```
   p = [1, 2, 3, 4]   →   A: 1×2,  B: 2×3,  C: 3×4

   (A·B)·C :  A·B  = 1·2·3 =  6   → result 1×3
              ·C   = 1·3·4 = 12                  total = 18 ✅
   A·(B·C) :  B·C  = 2·3·4 = 24   → result 2×4
              A·   = 1·2·4 =  8                  total = 32

   Same answer matrix, almost double the work.
```

### The decision: where is the LAST multiplication?

```
              (A_i ... A_k) · (A_k+1 ... A_j)
               └── p[i-1] × p[k] ──┘ └── p[k] × p[j] ──┘

   Left result:  p[i-1] × p[k]
   Right result: p[k]   × p[j]
   Final multiply cost = p[i-1] · p[k] · p[j]

   dp[i][j] = min over k in [i, j-1] of
                dp[i][k] + dp[k+1][j] + p[i-1]·p[k]·p[j]
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = min cost to multiply `Ai..Aj` (1-indexed) |
| Split | `k` = where the **last** multiplication happens |
| Base | `dp[i][i] = 0` (one matrix, nothing to multiply) |
| Order | by length 2, 3, ..., n |
| Answer | `dp[1][n]` |

### Trace (p = [40, 20, 30, 10, 30])

```
   A1: 40×20   A2: 20×30   A3: 30×10   A4: 10×30

   Length 2:
     dp[1][2] = 40·20·30 = 24000
     dp[2][3] = 20·30·10 =  6000
     dp[3][4] = 30·10·30 =  9000

   Length 3:
     dp[1][3]:  k=1: 0 + 6000 + 40·20·10 = 14000  ◄ min
                k=2: 24000 + 0 + 40·30·10 = 36000
     dp[2][4]:  k=2: 0 + 9000 + 20·30·30 = 27000
                k=3: 6000 + 0 + 20·10·30 = 12000  ◄ min

   Length 4:
     dp[1][4]:  k=1: 0 + 12000 + 40·20·30     = 36000
                k=2: 24000 + 9000 + 40·30·30  = 69000
                k=3: 14000 + 0 + 40·10·30     = 26000  ◄ min ✅

           j=1     j=2     j=3     j=4
        ┌───────┬───────┬───────┬───────┐
  i=1   │   0   │ 24000 │ 14000 │ 26000 │
        ├───────┼───────┼───────┼───────┤
  i=2   │       │   0   │  6000 │ 12000 │
        ├───────┼───────┼───────┼───────┤
  i=3   │       │       │   0   │  9000 │
        ├───────┼───────┼───────┼───────┤
  i=4   │       │       │       │   0   │
        └───────┴───────┴───────┴───────┘

   Best order: (A1·(A2·A3))·A4 = 26000
```

### Pseudocode

```
function matrixChain(p):              // n = length(p) − 1 matrices
    dp ← (n+1) × (n+1) table of 0
    for len from 2 to n:
        for i from 1 to n − len + 1:
            j ← i + len − 1
            dp[i][j] ← +∞
            for k from i to j − 1:
                cost ← dp[i][k] + dp[k+1][j] + p[i−1]·p[k]·p[j]
                dp[i][j] ← min(dp[i][j], cost)
    return dp[1][n]
```

### Recover the parenthesization

```
   Store split[i][j] = the winning k. Then:

   print(i, j):
       if i == j: print "A" + i
       else: print "(" ; print(i, split[i][j]) ; print(split[i][j]+1, j) ; print ")"
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every parenthesization | Catalan(n), exponential | O(n) |
| Memo recursion | O(n³) | O(n²) |
| **Bottom-up by length** | **O(n³)** | **O(n²)** ✅ |
| Hu–Shing algorithm (research-level) | O(n log n) | — |

### 📌 Points to remember
- **This is the template** for the whole chapter: range, split k, join cost.
- `p` has `n + 1` numbers for `n` matrices. Matrix `i` is `p[i-1] × p[i]`.
- Join cost uses the **outer** dimensions `p[i-1]`, `p[j]` and the split dimension `p[k]`.
- Loop over **length first**.

---

## 2. Merge Intervals with Cost (Medium)

> **Assumption:** this is not a standard LeetCode problem. It is taught here as the classic
> **"merge adjacent piles"** problem: you have piles in a row, you may merge **two adjacent**
> piles into one, and each merge costs the **total size of the merged pile**.
> Find the min cost to end with one pile.
> This is exactly **Minimum Cost to Merge Stones with K = 2**, so it is the bridge to problem 6.

### Problem
`stones = [3, 2, 4, 1]`. Merge two neighbors at a time, paying their sum. Minimize the total.

### Visualize it

```
   Plan A:  [3, 2, 4, 1]
            merge 3+2 = 5   → [5, 4, 1]        cost  5
            merge 4+1 = 5   → [5, 5]           cost  5
            merge 5+5 = 10  → [10]             cost 10     total = 20 ✅

   Plan B:  [3, 2, 4, 1]
            merge 2+4 = 6   → [3, 6, 1]        cost  6
            merge 3+6 = 9   → [9, 1]           cost  9
            merge 9+1 = 10  → [10]             cost 10     total = 25
```

### The decision: where is the LAST merge?

```
   The very last merge joins ONE pile made from i..k
   with ONE pile made from k+1..j.

        [ i ........ k ] + [ k+1 ........ j ]
          └ dp[i][k] ┘       └ dp[k+1][j] ┘
                    └──── last merge ────┘
                     costs sum(i..j), ALWAYS

   dp[i][j] = min over k of ( dp[i][k] + dp[k+1][j] ) + sum(i..j)
```

> 💡 The last merge always costs the **whole range sum**, no matter where you split.
> So the sum sits **outside** the min. Use prefix sums to get it in O(1).

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = min cost to merge piles `i..j` into one |
| Split | `k` = boundary of the **last** merge |
| Base | `dp[i][i] = 0` (already one pile) |
| Order | by length |
| Answer | `dp[0][n-1]` |

### Trace (stones = [3, 2, 4, 1])

```
   sum(i..j) via prefix sums  P = [0, 3, 5, 9, 10]

   Length 2:  dp[0][1] = 0 + 0 + 5 = 5
              dp[1][2] = 0 + 0 + 6 = 6
              dp[2][3] = 0 + 0 + 5 = 5

   Length 3:  dp[0][2]: min(k=0: 0+6, k=1: 5+0) = 5   + sum 9 = 14
              dp[1][3]: min(k=1: 0+5, k=2: 6+0) = 5   + sum 7 = 12

   Length 4:  dp[0][3]: k=0: 0 + 12 = 12
                        k=1: 5 + 5  = 10  ◄ min
                        k=2: 14 + 0 = 14
                        10 + sum 10 = 20 ✅

          j=0   j=1   j=2   j=3
        ┌─────┬─────┬─────┬─────┐
  i=0   │  0  │  5  │ 14  │ 20  │
        ├─────┼─────┼─────┼─────┤
  i=1   │     │  0  │  6  │ 12  │
        ├─────┼─────┼─────┼─────┤
  i=2   │     │     │  0  │  5  │
        ├─────┼─────┼─────┼─────┤
  i=3   │     │     │     │  0  │
        └─────┴─────┴─────┴─────┘
```

### Pseudocode

```
function mergeCost(stones):
    P ← prefix sums, P[0] = 0
    dp ← n × n table of 0
    for len from 2 to n:
        for i from 0 to n − len:
            j ← i + len − 1
            best ← +∞
            for k from i to j − 1:
                best ← min(best, dp[i][k] + dp[k+1][j])
            dp[i][j] ← best + (P[j+1] − P[i])
    return dp[0][n−1]
```

### Optimization

| Approach | Time | Space |
|---|---|---|
| Interval DP | O(n³) | O(n²) |
| **Knuth optimization** (the best k is monotonic) | **O(n²)** | O(n²) |
| Garsia–Wachs (advanced) | O(n log n) | O(n) |

> Knuth: `opt[i][j-1] ≤ opt[i][j] ≤ opt[i+1][j]`, so the k loop only scans that window.

### 📌 Points to remember
- Only **adjacent** piles may merge. If any two piles could merge, it becomes Huffman coding (greedy with a min-heap).
- The join cost is the **range sum**, so it is independent of k. Prefix sums make it O(1).
- Same skeleton as Matrix Chain. Only the join cost changed.

---

## 3. Minimum Cost to Cut a Stick (Hard)

### Problem
A stick of length `n` and a list of cut positions. Each cut costs the **current length of the piece being cut**.
You choose the order of cuts. Minimize the total cost.

### Visualize it

```
   n = 7, cuts = [1, 3, 4, 5]

   0───1───2───3───4───5───6───7
       ✂       ✂   ✂   ✂

   Order [1, 3, 4, 5]:  7 + 6 + 4 + 3 = 20
   Order [3, 5, 1, 4]:  7 + 4 + 3 + 2 = 16  ✅ (one of the best)
```

### This is MERGE in reverse

```
   Cutting a stick into pieces  ⇄  merging the pieces back together

      cut cost = length of the piece   ⇄   merge cost = size of the merged pile

   Same tree, read upside down.
```

### Key move: index the CUTS, not the stick

```
   Add both ends as fake cuts and sort:

   c = [ 0, 1, 3, 4, 5, 7 ]
         ▲                ▲
       stick start     stick end

   dp[i][j] = min cost to make all cuts strictly between c[i] and c[j]

        c[i]                c[k]                 c[j]
         ├────────────────────┼────────────────────┤
         └──── dp[i][k] ──────┘└──── dp[k][j] ─────┘
         └─────────── first cut costs c[j] − c[i] ──┘

   dp[i][j] = min over i < k < j of  dp[i][k] + dp[k][j] + (c[j] − c[i])
```

> Note the split shares the point `k` (both halves contain `c[k]` as an end).
> This is the **open-interval** style, the same one Burst Balloons uses.

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = min cost of all cuts strictly between `c[i]` and `c[j]` |
| Split | `k` = the **first** cut made inside this piece |
| Base | `dp[i][i+1] = 0` (no cut in between) |
| Order | by gap `j − i` = 2, 3, ... |
| Answer | `dp[0][m+1]` where m = number of cuts |

### Trace (c = [0, 1, 3, 4, 5, 7])

```
   Gap 2 (one cut inside):
     dp[0][2] = 3 − 0 = 3        dp[1][3] = 4 − 1 = 3
     dp[2][4] = 5 − 3 = 2        dp[3][5] = 7 − 4 = 3

   Gap 3:
     dp[0][3]: min(k=1: 0+3, k=2: 3+0) = 3  + 4 =  7
     dp[1][4]: min(k=2: 0+2, k=3: 3+0) = 2  + 4 =  6
     dp[2][5]: min(k=3: 0+3, k=4: 2+0) = 2  + 4 =  6

   Gap 4:
     dp[0][4]: k=1: 0+6=6, k=2: 3+2=5, k=3: 7+0=7      → 5 + 5 = 10
     dp[1][5]: k=2: 0+6=6, k=3: 3+3=6, k=4: 6+0=6      → 6 + 6 = 12

   Gap 5:
     dp[0][5]: k=1: 0 + 12 = 12
               k=2: 3 + 6  =  9  ◄ min   (first cut at position 3)
               k=3: 7 + 3  = 10
               k=4: 10 + 0 = 10
               → 9 + 7 = 16 ✅

           j=0  j=1  j=2  j=3  j=4  j=5
        ┌────┬────┬────┬────┬────┬────┐
  i=0   │  · │  0 │  3 │  7 │ 10 │ 16 │
  i=1   │    │  · │  0 │  3 │  6 │ 12 │
  i=2   │    │    │  · │  0 │  2 │  6 │
  i=3   │    │    │    │  · │  0 │  3 │
  i=4   │    │    │    │    │  · │  0 │
        └────┴────┴────┴────┴────┴────┘
```

### Pseudocode

```
function minCostCut(n, cuts):
    c ← sort( [0] + cuts + [n] )
    m ← length(c)
    dp ← m × m table of 0
    for gap from 2 to m − 1:
        for i from 0 to m − 1 − gap:
            j ← i + gap
            best ← +∞
            for k from i + 1 to j − 1:
                best ← min(best, dp[i][k] + dp[k][j])
            dp[i][j] ← best + (c[j] − c[i])
    return dp[0][m−1]
```

### 📌 Points to remember
- **Sort the cuts** and **add 0 and n**. Forgetting either breaks everything.
- DP over **cut indices** (≤ 100 of them), never over stick length (up to 10⁶).
- Cost `c[j] − c[i]` doesn't depend on k → add it outside the min.
- Complexity: O(m³) time, O(m²) space, with m = number of cuts + 2.

---

## 4. Burst Balloons (Hard)

### Problem
Balloons `nums`. Bursting balloon `i` earns `left · nums[i] · right`, where `left` and `right`
are its **current** neighbors (missing neighbor = 1). Burst all of them. Maximize the coins.

### Visualize it: neighbors CHANGE as you burst

```
   [3, 1, 5, 8]

   burst 1 → 3·1·5  =  15     [3, 5, 8]     ← 3 and 5 are now NEIGHBORS
   burst 5 → 3·5·8  = 120     [3, 8]
   burst 3 → 1·3·8  =  24     [8]
   burst 8 → 1·8·1  =   8     []
                      ─────
                       167 ✅
```

### Why "k = FIRST balloon burst" fails 🚫

```
   Burst k first:   [ a  b ]  k  [ c  d ]   →   [ a  b  c  d ]
                                                       ▲ ▲
                                    b and c are now neighbors!
   The left and right halves now AFFECT each other → not independent.
```

### The fix: k = the LAST balloon burst in (i, j)

```
   Pad with 1s on both ends:   a = [1, 3, 1, 5, 8, 1]
                                    ▲              ▲
                                  fake walls (never burst)

   dp[i][j] = max coins from bursting everything STRICTLY between i and j
              (i and j are still standing)

      a[i]   ( ... left part ... )   a[k]   ( ... right part ... )   a[j]
       ║     └──── dp[i][k] ────┘     ║     └──── dp[k][j] ─────┘     ║
       ║                              ║                               ║
     wall                     burst LAST, so when                   wall
                              it pops its neighbors
                              are exactly a[i] and a[j]

   dp[i][j] = max over i < k < j of  dp[i][k] + dp[k][j] + a[i]·a[k]·a[j]
```

> 💡 While `k` is alive, it is a **wall**: nothing on its left can touch anything on its right.
> That makes the two halves independent. This "last action" trick is the heart of the problem.

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = max coins bursting all balloons strictly between `i` and `j` (open interval) |
| Split | `k` = the **last** balloon burst in `(i, j)` |
| Base | `dp[i][i+1] = 0` (nothing in between) |
| Order | by gap `j − i` = 2, 3, ... |
| Answer | `dp[0][n+1]` |

### Trace (a = [1, 3, 1, 5, 8, 1], indices 0..5)

```
   Gap 2 (one balloon inside):
     dp[0][2] = 1·3·1 =  3        dp[1][3] = 3·1·5 = 15
     dp[2][4] = 1·5·8 = 40        dp[3][5] = 5·8·1 = 40

   Gap 3:
     dp[0][3]: k=1: 0 + 15 + 1·3·5 = 30  ◄     k=2: 3 + 0 + 1·1·5 =   8   → 30
     dp[1][4]: k=2: 0 + 40 + 3·1·8 = 64        k=3: 15 + 0 + 3·5·8 = 135 ◄ → 135
     dp[2][5]: k=3: 0 + 40 + 1·5·1 = 45        k=4: 40 + 0 + 1·8·1 =  48 ◄ → 48

   Gap 4:
     dp[0][4]: k=1: 0 + 135 + 1·3·8 = 159 ◄
               k=2: 3 + 40  + 1·1·8 =  51
               k=3: 30 + 0  + 1·5·8 =  70                               → 159
     dp[1][5]: k=2: 0 + 48  + 3·1·1 =  51
               k=3: 15 + 40 + 3·5·1 =  70
               k=4: 135 + 0 + 3·8·1 = 159 ◄                             → 159

   Gap 5:
     dp[0][5]: k=1: 0 + 159 + 1·3·1 = 162
               k=2: 3 + 48  + 1·1·1 =  52
               k=3: 30 + 40 + 1·5·1 =  75
               k=4: 159 + 0 + 1·8·1 = 167 ◄  (8 is burst LAST)          → 167 ✅

           j=0  j=1  j=2  j=3  j=4  j=5
        ┌────┬────┬────┬────┬────┬────┐
  i=0   │  · │  0 │  3 │ 30 │159 │167 │
  i=1   │    │  · │  0 │ 15 │135 │159 │
  i=2   │    │    │  · │  0 │ 40 │ 48 │
  i=3   │    │    │    │  · │  0 │ 40 │
  i=4   │    │    │    │    │  · │  0 │
        └────┴────┴────┴────┴────┴────┘
```

### Pseudocode

```
function maxCoins(nums):
    a ← [1] + nums + [1]
    m ← length(a)                           // n + 2
    dp ← m × m table of 0
    for gap from 2 to m − 1:
        for i from 0 to m − 1 − gap:
            j ← i + gap
            for k from i + 1 to j − 1:
                dp[i][j] ← max(dp[i][j],
                               dp[i][k] + dp[k][j] + a[i]·a[k]·a[j])
    return dp[0][m−1]
```

### 📌 Points to remember
- **k = LAST balloon** in the open interval. Its neighbors at that moment are `a[i]` and `a[j]`.
- **Pad with 1s.** They are walls that are never burst, so the edges need no special case.
- Open interval `(i, j)`: `i` and `j` are **not** burst inside `dp[i][j]`.
- Same shape as Cut a Stick, but with **max** and a **product** cost.
- O(n³) time, O(n²) space. With n ≤ 300 that is fine.

---

## 5. Evaluate Expression to True / Boolean Parenthesization (Hard)

### Problem
An expression of `T` / `F` symbols joined by `&`, `|`, `^`.
Count the ways to add parentheses so that the expression evaluates to **True**.

### Visualize it

```
   T | T & F ^ T

   Every full parenthesization is a binary tree, so there are Catalan(3) = 5 of them:

   ((T|T)&F)^T    =  (T&F)^T  =  F^T  =  T   ✅
   (T|(T&F))^T    =  (T|F)^T  =  T^T  =  F
   (T|T)&(F^T)    =   T & T           =  T   ✅
   T|((T&F)^T)    =  T|(F^T)  =  T|T  =  T   ✅
   T|(T&(F^T))    =  T|(T&T)  =  T|T  =  T   ✅
                                         ──────
                                         4 ways ✅
```

### The new idea: each cell stores TWO counts

```
   To count TRUE results for AND / OR / XOR, you need to know how many ways
   each side can be TRUE *and* how many ways it can be FALSE.

        ┌─────────────────────┐
        │  T[i][j]  │ F[i][j] │   ← ways sub-expression i..j is True / False
        └─────────────────────┘
```

### Split on each OPERATOR

```
     operand i  op  ...  operand k   OP_k   operand k+1  ...  operand j
     └────── left: (lt, lf) ──────┘   ▲     └────── right: (rt, rf) ────┘
                                      │
                         this operator is applied LAST
```

### The combine table (memorize this)

```
   ┌─────┬─────────────────────────────────┬─────────────────────────────────┐
   │ op  │ ways to be TRUE                 │ ways to be FALSE                │
   ├─────┼─────────────────────────────────┼─────────────────────────────────┤
   │  &  │ lt·rt                           │ lf·rf + lt·rf + lf·rt           │
   │  |  │ lt·rt + lt·rf + lf·rt           │ lf·rf                           │
   │  ^  │ lt·rf + lf·rt                   │ lt·rt + lf·rf                   │
   └─────┴─────────────────────────────────┴─────────────────────────────────┘

   Shortcut: total = (lt+lf)·(rt+rf). Compute the easy side, subtract for the other.
     &  TRUE  needs both true            → everything else is FALSE
     |  FALSE needs both false           → everything else is TRUE
     ^  TRUE  needs them to differ
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `T[i][j]`, `F[i][j]` = ways operands `i..j` evaluate to True / False |
| Split | operator `k` (between operand k and k+1) applied **last** |
| Base | `T[i][i] = 1, F[i][i] = 0` for `T`; reversed for `F` |
| Order | by length (in operands) |
| Answer | `T[0][n-1]` |

### Trace: `T | T & F ^ T`

```
   operands:  0:T   1:T   2:F   3:T
   operators:    |     &     ^
               op0   op1   op2

   Length 1:   T:(1,0)  T:(1,0)  F:(0,1)  T:(1,0)       written as (True, False)

   Length 2:
     [0,1]  T | T   →  OR : F = 0·0 = 0, total 1   → (1, 0)
     [1,2]  T & F   →  AND: T = 1·0 = 0, total 1   → (0, 1)
     [2,3]  F ^ T   →  XOR: T = 0·0 + 1·1 = 1      → (1, 0)

   Length 3:
     [0,2]  T | T & F
            split op0 (|):  L=(1,0)  R=[1,2]=(0,1)  → OR  → (1, 0)
            split op1 (&):  L=[0,1]=(1,0)  R=(0,1)  → AND → (0, 1)
                                                      sum   (1, 1)
     [1,3]  T & F ^ T
            split op1 (&):  L=(1,0)  R=[2,3]=(1,0)  → AND → (1, 0)
            split op2 (^):  L=[1,2]=(0,1)  R=(1,0)  → XOR → (1, 0)
                                                      sum   (2, 0)

   Length 4:
     [0,3]  T | T & F ^ T
            split op0 (|):  L=(1,0)  R=[1,3]=(2,0)  → OR : T = 2 , F = 0
            split op1 (&):  L=[0,1]=(1,0) R=[2,3]=(1,0) → AND: T = 1 , F = 0
            split op2 (^):  L=[0,2]=(1,1) R=(1,0)   → XOR: T = 1·0+1·1 = 1 , F = 1·1+1·0 = 1
                                                      sum   (4, 1)

   True = 4 ✅      (check: 4 + 1 = 5 = Catalan(3) ✓)
```

### Pseudocode

```
function countTrue(symbols, ops):        // n symbols, n−1 operators
    T, F ← n × n tables of 0
    for i from 0 to n−1:
        if symbols[i] == 'T': T[i][i] ← 1 else F[i][i] ← 1
    for len from 2 to n:
        for i from 0 to n − len:
            j ← i + len − 1
            for k from i to j − 1:                 // operator ops[k] is applied last
                lt, lf ← T[i][k],   F[i][k]
                rt, rf ← T[k+1][j], F[k+1][j]
                total ← (lt + lf) · (rt + rf)
                if ops[k] == '&':  t ← lt·rt
                if ops[k] == '|':  t ← total − lf·rf
                if ops[k] == '^':  t ← lt·rf + lf·rt
                T[i][j] ← T[i][j] + t
                F[i][j] ← F[i][j] + (total − t)
    return T[0][n−1]          (usually modulo some big prime)
```

### 📌 Points to remember
- **Store both True and False counts.** You can't compute AND/OR/XOR counts from True alone.
- Split on **operators**, not on characters. If the input is one string like `"T|T&F^T"`,
  operands are at even positions and operators at odd positions.
- Counting → **multiply** the left and right ways, then **add** over all splits.
- Sanity check: `T + F` for the full range = Catalan(n−1).
- O(n³) time, O(n²) space.

---

## 6. Minimum Cost to Merge Stones (Hard)

### Problem
Piles in a row. One move merges **exactly K consecutive** piles into one, costing their total.
Return the min cost to end with one pile, or `-1` if impossible.

> With `K = 2` this is exactly problem 2 (Merge Intervals with Cost). The new difficulty is K > 2.

### Step 1: is it even possible?

```
   Each merge turns K piles into 1 → removes exactly (K − 1) piles.
   Start with n piles, must end with 1 → remove (n − 1) piles.

   ┌──────────────────────────────────────────┐
   │  possible  ⇔  (n − 1) % (K − 1) == 0     │
   └──────────────────────────────────────────┘

   stones = [3, 2, 4, 1], K = 3:  (4 − 1) % 2 = 1   → −1 ❌
   stones = [3, 5, 1, 2, 6], K = 3:  (5 − 1) % 2 = 0 → possible ✅
```

### Step 2: the state, and why splits jump by K − 1

```
   dp[i][j] = min cost to merge range i..j into AS FEW piles AS POSSIBLE
              (that is, ((len − 1) % (K − 1)) + 1 piles)

   Split: the LEFT part i..m must collapse to exactly ONE pile.
          That's only possible when (m − i) % (K − 1) == 0
          → m = i, i + (K−1), i + 2(K−1), ...

        [ i ..... m ] [ m+1 ............... j ]
          └ 1 pile ┘   └ the remaining piles ┘

   dp[i][j] = min over m = i, i+K−1, i+2(K−1), ... (m < j) of
                 dp[i][m] + dp[m+1][j]

   Then, IF the range can now become one pile:
      (len − 1) % (K − 1) == 0   →   dp[i][j] += sum(i..j)    ← the final K-merge
```

```
   Picture with K = 3 for a range that reduces to 1 pile:

     [ ■ ] [ ■ ■ ■ → ■ ] [ ■ ]        some sub-merges first...
       └──────┬──────────┘
         3 piles left  →  one final merge, cost = sum(i..j)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = min cost to reduce `i..j` to as few piles as possible |
| Split | `m` steps by `K − 1`, so the left part is exactly one pile |
| Base | `dp[i][i] = 0` |
| Order | by length |
| Answer | `dp[0][n-1]` if `(n − 1) % (K − 1) == 0`, else `-1` |

### Trace (stones = [3, 5, 1, 2, 6], K = 3)

```
   Prefix P = [0, 3, 8, 9, 11, 17]

   Length 2:  can't reach 1 pile ((2−1)%2 = 1) → no sum added
              dp[0][1] = dp[1][2] = dp[2][3] = dp[3][4] = 0

   Length 3:  (3−1)%2 = 0 → add sum
              dp[0][2] = 0 + sum(3,5,1) = 9
              dp[1][3] = 0 + sum(5,1,2) = 8
              dp[2][4] = 0 + sum(1,2,6) = 9

   Length 4:  (4−1)%2 = 1 → no sum added
              dp[0][3]: m=0: 0 + dp[1][3] = 8 ◄     m=2: dp[0][2] + 0 = 9    → 8
              dp[1][4]: m=1: 0 + dp[2][4] = 9       m=3: dp[1][3] + 0 = 8 ◄  → 8

   Length 5:  (5−1)%2 = 0 → add sum
              dp[0][4]: m=0: 0 + dp[1][4]         = 8 ◄
                        m=2: dp[0][2] + dp[3][4]  = 9
                        → 8 + sum 17 = 25 ✅

   Real moves:  merge [5,1,2] → 8   (cost 8)    piles [3, 8, 6]
                merge [3,8,6] → 17  (cost 17)   piles [17]        total 25
```

### Pseudocode

```
function mergeStones(stones, K):
    n ← length(stones)
    if (n − 1) % (K − 1) ≠ 0: return −1
    P ← prefix sums
    dp ← n × n table of 0
    for len from K to n:
        for i from 0 to n − len:
            j ← i + len − 1
            dp[i][j] ← +∞
            for m from i to j − 1 step (K − 1):
                dp[i][j] ← min(dp[i][j], dp[i][m] + dp[m+1][j])
            if (len − 1) % (K − 1) == 0:
                dp[i][j] ← dp[i][j] + (P[j+1] − P[i])
    return dp[0][n−1]
```

> Lengths below K stay 0: you can't merge anything yet, so it costs nothing.

### Complexity

| Approach | Time | Space |
|---|---|---|
| 3D `dp[i][j][piles]` (classic first solution) | O(n³ · K) | O(n² · K) |
| **2D with K−1 step splits** | **O(n³ / K)** | **O(n²)** ✅ |

### 📌 Points to remember
- **Check feasibility first:** `(n − 1) % (K − 1) == 0`.
- Splits step by **K − 1** so the left part is always exactly one pile.
- Add `sum(i..j)` **only when** `(len − 1) % (K − 1) == 0`.
- K = 2 gives back the simple adjacent-merge problem (every length gets the sum).

---

## 7. Master Cheat Sheet

### All 6 problems at a glance

```
┌──────────────────────┬────────────────────────────────────────────────┬────────────┬──────────┐
│ Problem              │ Recurrence / core idea                         │ Answer     │ Time     │
├──────────────────────┼────────────────────────────────────────────────┼────────────┼──────────┤
│ Matrix Chain         │ min dp[i][k]+dp[k+1][j] + p[i-1]·p[k]·p[j]     │ dp[1][n]   │ O(n³)    │
│ Merge with Cost      │ min dp[i][k]+dp[k+1][j]  + sum(i..j)           │ dp[0][n-1] │ O(n³)*   │
│ Cut a Stick          │ min dp[i][k]+dp[k][j]    + c[j]−c[i]           │ dp[0][m+1] │ O(m³)    │
│ Burst Balloons       │ max dp[i][k]+dp[k][j]    + a[i]·a[k]·a[j]      │ dp[0][n+1] │ O(n³)    │
│ Boolean Parenth.     │ Σ over ops: combine (T,F) via &,|,^ table      │ T[0][n-1]  │ O(n³)    │
│ Merge Stones (K)     │ min, m steps by K−1; +sum if (len−1)%(K−1)==0  │ dp[0][n-1] │ O(n³/K)  │
└──────────────────────┴────────────────────────────────────────────────┴────────────┴──────────┘
  * O(n²) with Knuth optimization
```

### Pattern family tree

```
                              INTERVAL DP
                    dp[i][j] = best over split k
                                   │
       ┌───────────────────────────┼──────────────────────────────┐
       │                           │                              │
  CLOSED SPLIT                 OPEN SPLIT                    MULTI-VALUE
  [i..k] + [k+1..j]            (i..k) + (k..j)                CELL
  k = LAST join                k is a shared wall             (count T and F)
       │                           │                              │
  ├─ Matrix Chain              ├─ Cut a Stick  (first cut)    └─ Boolean
  ├─ Merge with Cost (K=2)     └─ Burst Balloons (LAST burst)    Parenthesization
  └─ Merge Stones (K)
       (split step K−1)
```

### Closed vs open interval (the most confusing part)

```
   CLOSED  [i .. j]                        OPEN  (i .. j)
   both ends are part of the problem       ends are walls / fake boundaries

   split: [i..k] and [k+1..j]              split: (i..k) and (k..j)
   k from i to j−1                         k from i+1 to j−1
   base:  dp[i][i]                         base:  dp[i][i+1] = 0
   used:  Matrix Chain, Merge, Boolean     used:  Cut a Stick, Burst Balloons
                                           (needs padding: 0 & n, or 1 & 1)
```

### The cost tells you which trick you need

```
   ┌──────────────────────────────┬────────────────────────────────────────┐
   │ join cost depends on...      │ what to do                             │
   ├──────────────────────────────┼────────────────────────────────────────┤
   │ only i and j (a range sum)   │ add it OUTSIDE the min; prefix sums    │
   │ i, k and j (dimensions)      │ add it INSIDE the loop                 │
   │ neighbors that change        │ make k the LAST action + pad the ends  │
   │ True/False of each side      │ store (T, F) per cell, combine table   │
   │ "K at a time"                │ feasibility check + step by K−1        │
   └──────────────────────────────┴────────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Looping by LENGTH first (not by row)?           → required for correctness
  ☐ Join cost independent of k?                     → pull it out of the k loop
  ☐ Range sums needed?                              → prefix sums, O(1) each
  ☐ Action changes neighbors?                       → k = LAST action
  ☐ Edges need special cases?                       → pad (1s, or 0 and n)
  ☐ Best k is monotonic (merge-type cost)?          → Knuth: O(n³) → O(n²)
  ☐ Only some splits are valid (Merge Stones)?      → step k by K−1
  ☐ DP over huge values (stick length)?             → DP over indices instead
```

### 🚩 Common bugs to avoid

```
  ✗ Filling row by row instead of by interval length
  ✗ Matrix Chain: using p[i] instead of p[i-1] for the left dimension
  ✗ Cut a Stick: forgetting to sort cuts, or to add 0 and n
  ✗ Burst Balloons: choosing k as the FIRST burst; forgetting the 1-padding
  ✗ Boolean: storing only the True count; splitting on operands, not operators
  ✗ Merge Stones: skipping the (n−1)%(K−1) check; adding the sum at every length
  ✗ Mixing open and closed intervals in the same solution
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "If k is the LAST thing that happens in [i..j], are the     ║
   ║   left part and the right part completely independent?"      ║
   ╚══════════════════════════════════════════════════════════════╝
      If yes, the recurrence is: left + right + cost of that last step.
```

---

### ✅ Progress tracker

- [ ] Matrix Chain Multiplication (Hard)
- [ ] Merge Intervals with Cost (Medium)
- [ ] Minimum Cost to Cut a Stick (Hard)
- [ ] Burst Balloons (Hard)
- [ ] Evaluate Expression to True / Boolean Parenthesization (Hard)
- [ ] Minimum Cost to Merge Stones (Hard)
