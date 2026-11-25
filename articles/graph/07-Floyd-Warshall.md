# Floyd-Warshall: A Visual Guide

> **Goal:** Learn to *see* all-pairs shortest-path problems, run Floyd-Warshall by hand, and know when it is the right tool.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Floyd-Warshall is **DP on a graph**: a 3D table squeezed into 2D, the same row trick as in the DP guides.

---

## Table of Contents

0. [The Big Idea: What Is Floyd-Warshall?](#0-the-big-idea-what-is-floyd-warshall)
1. [Floyd Warshall (Medium)](#1-floyd-warshall-medium)
2. [Transitive Closure of a Graph (Medium)](#2-transitive-closure-of-a-graph-medium)
3. [Detect Negative Cycle Using Floyd Warshall (Medium)](#3-detect-negative-cycle-using-floyd-warshall-medium)
4. [Bonus: Find the City With the Smallest Number of Neighbors](#4-bonus-find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Floyd Warshall → Transitive Closure → Detect Negative Cycle.
> First learn the engine, then swap its operators (min/+ → OR/AND), then read its diagonal for cycles.
> The bonus shows the engine solving a real LeetCode problem.

---

## 0. The Big Idea: What Is Floyd-Warshall?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "FLOYD-WARSHALL"                        │
├──────────────────────────────────────────────────────────────────┤
│  • "Shortest distance between EVERY pair of nodes"               │
│  • Input is (or easily becomes) an ADJACENCY MATRIX              │
│  • Small number of nodes: V ≤ ~400                               │
│  • "Can city i reach city j?" for all i, j (reachability)        │
│  • Negative edge weights allowed, maybe a negative cycle check   │
│  • Many queries "dist(u, v)?" after one precomputation           │
└──────────────────────────────────────────────────────────────────┘
```

### The one idea: route i → j through k

```
                       k
                     ╱   ╲
          dist[i][k]       dist[k][j]
                 ╱           ╲
               i ──────────────► j
                  dist[i][j]

   Is going THROUGH k shorter than what I already have?

   dist[i][j] = min( dist[i][j] ,  dist[i][k] + dist[k][j] )
                     ───────────   ─────────────────────────
                     don't use k        use k as a stop
```

### The DP meaning: "which stops am I allowed to use?"

```
  D_k[i][j] = shortest i → j path whose INTERMEDIATE stops
              all come from the set { 0, 1, ..., k }

  D_-1  : no stops allowed           → only direct edges
  D_0   : may stop at node 0
  D_1   : may stop at nodes 0, 1
  ...
  D_n-1 : may stop anywhere          → TRUE shortest paths ✅

  Each stage unlocks ONE more node:

   stage:   start      k=0        k=1        k=2      ...    k=n-1
          ┌──────┐   ┌──────┐   ┌──────┐   ┌──────┐        ┌──────┐
          │direct│ ► │ +{0} │ ► │+{0,1}│ ► │+{0..2}│ ...  ►│ all  │
          └──────┘   └──────┘   └──────┘   └──────┘        └──────┘

  Recurrence (the shortest path in stage k either avoids k or passes it ONCE):
     D_k[i][j] = min( D_k-1[i][j] ,  D_k-1[i][k] + D_k-1[k][j] )
```

> 💡 **It's 1D DP over k, where each "cell" is a whole V × V matrix.**
> Just like dropping a 2D DP to one row, we drop the k dimension and update **one matrix in place**.

### Why updating in place is safe

```
  During stage k, row k and column k NEVER change:

     dist[i][k] = min( dist[i][k], dist[i][k] + dist[k][k] )
                                               └── = 0
                = dist[i][k]          ← unchanged

  So the values we READ (dist[i][k], dist[k][j]) are the same
  whether or not we already overwrote other cells. → one matrix is enough.
  (Only a NEGATIVE CYCLE breaks this, because then dist[k][k] < 0. See §3.)
```

### Why k MUST be the outer loop 🚨

```
   CORRECT                         WRONG (k innermost)
   for k:                          for i:
     for i:                          for j:
       for j:                          for k:
         relax(i, k, j)                  relax(i, k, j)

  With k innermost, dist[i][j] is FINALIZED in one shot,
  using dist[i][k] and dist[k][j] that may not be finished yet.
```

**Counterexample.** Edges: `0 → 2 (1)`, `2 → 3 (1)`, `3 → 1 (1)`. The true `dist[0][1] = 3`.

```
        (0) ──1──► (2) ──1──► (3) ──1──► (1)

  WRONG order (i, j, k): computing dist[0][1] at i=0, j=1
     k=2: dist[0][2] + dist[2][1] = 1 + ∞   (row 2 not processed yet)
     k=3: dist[0][3] + dist[3][1] = ∞ + 1   (dist[0][3] is computed LATER, at j=3)
     → dist[0][1] stays ∞   ❌   and it is never revisited

  RIGHT order (k outer):
     k=0, k=1: nothing passes through 0 or 1 → no change
     k=2:  dist[0][3] = dist[0][2] + dist[2][3] = 2
           (dist[2][1] still ∞)
     k=3:  dist[0][1] = dist[0][3] + dist[3][1] = 3   ✅
           dist[2][1] = dist[2][3] + dist[3][1] = 2
```

> 🧠 **Memory hook:** "**K**ey goes outside." The k loop is the DP *stage*; i and j are just the cells.
> The order of `i` and `j` inside does not matter.

### INF handling: the silent bug

```
  "No edge" must be a value that never fakes a shortest path.

  ✗ INF = INT_MAX       INT_MAX + 5 → wraps to a NEGATIVE number
                        → "shortest path" of -2147483644  ❌

  ✓ Option A: skip when either half is INF
        if dist[i][k] == INF or dist[k][j] == INF: skip

  ✓ Option B: INF = a big safe number (e.g. 10^9) in 64-bit,
        so INF + INF never overflows (needs the INF check anyway
        if NEGATIVE edges exist: INF + (−5) < INF looks like a path!)

  → Always use Option A. It is correct with negative edges too.
```

### The 5-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  BUILD     V × V matrix: 0 on the diagonal, edge weight│
 │                   where an edge exists, INF elsewhere         │
 │                   (parallel edges → keep the MIN)             │
 │ STEP 2  LOOP      for k, for i, for j  (k OUTSIDE!)           │
 │ STEP 3  RELAX     dist[i][j] = min(dist[i][j], d[i][k]+d[k][j])│
 │                   skipping INF halves                         │
 │ STEP 4  CHECK     any dist[i][i] < 0 → negative cycle         │
 │ STEP 5  ANSWER    read dist[u][v] for any pair in O(1)        │
 └───────────────────────────────────────────────────────────────┘
```

### Cost, and when it is fine

```
   Time  O(V³)     Space O(V²)

   V = 100  →      1,000,000 steps   ✅ instant
   V = 400  →     64,000,000 steps   ✅ fine
   V = 1000 →  1,000,000,000 steps   ⚠️ usually too slow
```

### Floyd-Warshall vs. "run a single-source algorithm V times"

| Approach | Time | Negative edges? | Best when |
|---|---|---|---|
| **Floyd-Warshall** | **O(V³)** | ✅ yes (detects neg. cycles) | small V, dense graph, simplest code |
| Dijkstra × V | O(V · E log V) | ❌ no | sparse graph, non-negative weights |
| Bellman-Ford × V | O(V² · E) | ✅ yes | almost never (FW is simpler and faster) |
| BFS × V | O(V · (V + E)) | — (unweighted) | unweighted graphs |
| Johnson's (bonus) | O(V · E log V) | ✅ yes | large sparse graphs with negative edges |

> On a dense graph E ≈ V², so Dijkstra × V ≈ O(V³ log V), which is **worse** than Floyd-Warshall.

---

## 1. Floyd Warshall (Medium)

### Problem (GFG style)
Given an `n × n` matrix where `matrix[i][j]` is the weight of the edge `i → j`,
replace every entry with the **shortest distance** from `i` to `j`, **in place**.

> **Convention used here (GFG):** `matrix[i][j] = -1` means **no edge**, and it must stay `-1`
> if `j` is unreachable from `i`. `matrix[i][i] = 0`.
> (Some newer GFG versions use `10^8` instead of `-1` for "no edge". Then a plain `min` works,
> because `10^8 + 10^8` still fits in an int and is larger than any real path.)
> In the pictures below, `∞` means the `-1` / "no edge" value.

### Visualize it

```
   Edges (directed):
     0 → 1 (3)    0 → 3 (7)
     1 → 0 (8)    1 → 2 (2)
     2 → 0 (5)    2 → 3 (1)
     3 → 0 (2)

              ┌──── 3 ────►
           (0)              (1)
              ◄──── 8 ─────
           ▲ │ ▲              │
         2 │ │7 ╲ 5           │ 2
           │ ▼   ╲            ▼
           (3) ◄──── 1 ───── (2)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[i][j]` = shortest i → j using stops from `{0..k}` so far |
| Transition | `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])` |
| Base | the input matrix: direct edges, 0 on the diagonal, ∞ otherwise |
| Order | k outer, then i, then j |
| Answer | the whole matrix after k = n−1 |

### Trace (changed cells marked `*`)

```
  START (direct edges only)
          0    1    2    3
       ┌────┬────┬────┬────┐
    0  │  0 │  3 │  ∞ │  7 │
    1  │  8 │  0 │  2 │  ∞ │
    2  │  5 │  ∞ │  0 │  1 │
    3  │  2 │  ∞ │  ∞ │  0 │
       └────┴────┴────┴────┘

  k = 0   (may now stop at node 0)        uses row 0 = [0, 3, ∞, 7]
          0    1    2    3
       ┌────┬────┬────┬────┐
    0  │  0 │  3 │  ∞ │  7 │
    1  │  8 │  0 │  2 │ 15*│   1→0→3 = 8 + 7
    2  │  5 │  8*│  0 │  1 │   2→0→1 = 5 + 3
    3  │  2 │  5*│  ∞ │  0 │   3→0→1 = 2 + 3
       └────┴────┴────┴────┘

  k = 1   (stops from {0, 1})             uses row 1 = [8, 0, 2, 15]
          0    1    2    3
       ┌────┬────┬────┬────┐
    0  │  0 │  3 │  5*│  7 │   0→1→2 = 3 + 2
    1  │  8 │  0 │  2 │ 15 │
    2  │  5 │  8 │  0 │  1 │
    3  │  2 │  5 │  7*│  0 │   3→1→2 = 5 + 2   (5 = 3→0→1)
       └────┴────┴────┴────┘

  k = 2   (stops from {0, 1, 2})          uses row 2 = [5, 8, 0, 1]
          0    1    2    3
       ┌────┬────┬────┬────┐
    0  │  0 │  3 │  5 │  6*│   0→2→3 = 5 + 1   (beats 7)
    1  │  7*│  0 │  2 │  3*│   1→2→0 = 2 + 5 ; 1→2→3 = 2 + 1
    2  │  5 │  8 │  0 │  1 │
    3  │  2 │  5 │  7 │  0 │
       └────┴────┴────┴────┘

  k = 3   (all stops allowed)             uses row 3 = [2, 5, 7, 0]
          0    1    2    3
       ┌────┬────┬────┬────┐
    0  │  0 │  3 │  5 │  6 │
    1  │  5*│  0 │  2 │  3 │   1→3→0 = 3 + 2   (beats 7)
    2  │  3*│  6*│  0 │  1 │   2→3→0 = 1 + 2 ; 2→3→1 = 1 + 5
    3  │  2 │  5 │  7 │  0 │
       └────┴────┴────┴────┘   ✅ FINAL

  Spot check:  2 → 1 = 2→3→0→1 = 1 + 2 + 3 = 6 ✓
               1 → 0 = 1→2→3→0 = 2 + 1 + 2 = 5 ✓
```

> Notice: during stage k, **row k and column k never change** (look at the unmarked row/column each time).
> That is the in-place safety rule from §0, seen live.

### Pseudocode (GFG `-1` convention, in place)

```
function floydWarshall(d):              // n × n, d[i][j] = -1 means "no edge"
    for k from 0 to n-1:                // ⚠ k OUTSIDE
        for i from 0 to n-1:
            if d[i][k] == -1: continue  // i can't reach k → nothing to gain
            for j from 0 to n-1:
                if d[k][j] == -1: continue
                via ← d[i][k] + d[k][j]
                if d[i][j] == -1 or via < d[i][j]:
                    d[i][j] ← via
```

> 💡 Checking `d[i][k]` **before** the j loop skips a whole row of work. A free speedup.

### Extension: rebuild the actual path

```
  next[i][j] = the FIRST hop on the best i → j path

  init:     next[i][j] ← j          if an edge i → j exists
  improve:  when going via k wins, next[i][j] ← next[i][k]
            (to go i → j via k, first head toward k)

  walk:     u ← i
            while u ≠ j:  u ← next[u][j]   (record each u)

  Example 2 → 1:
     next[2][1] = 3  (set at k=3, copied from next[2][3] = 3)
     next[3][1] = 0  (set at k=0, copied from next[3][0] = 0)
     next[0][1] = 1  (direct edge)
     path: 2 → 3 → 0 → 1   cost 1 + 2 + 3 = 6 ✓
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every path (DFS over all routes) | exponential | O(V) |
| 3D DP `D[k][i][j]` | O(V³) | O(V³) |
| **2D in place** | **O(V³)** | **O(V²)** ✅ |
| + skip row when `d[i][k]` is ∞ | O(V³), faster in practice | O(V²) |

### 📌 Points to remember
- **k outside**, always. i and j inside, in any order.
- Never add INF to anything. **Skip** when either half is "no edge".
- Parallel edges: keep the **minimum**. Undirected edge: fill **both** `d[u][v]` and `d[v][u]`.
- After the run, the matrix answers every `dist(u, v)` query in O(1).

---

## 2. Transitive Closure of a Graph (Medium)

### Problem (GFG style)
Given a directed graph as an `n × n` 0/1 matrix, build the **reachability matrix**:
`reach[i][j] = 1` if there is a path from `i` to `j`, else `0`.

> **Convention used here (GFG):** every vertex reaches **itself**, so `reach[i][i] = 1`
> (set the diagonal to 1 before starting, even if the input has 0 there).

### Same engine, different operators

```
        Floyd-Warshall                    Transitive Closure
   d[i][j] = MIN( d[i][j],         ──►   r[i][j] = r[i][j]  OR
                  d[i][k] + d[k][j] )               ( r[i][k] AND r[k][j] )

   "shorter via k?"                      "reachable via k?"
     min   ↔  OR
      +    ↔  AND
```

```
              k
            ╱   ╲
     i reaches k    k reaches j
          ╲          ╱
        i ──────────► j      ⇒  i reaches j
```

### Visualize it

```
   Edges:  0 → 1,  0 → 3,  1 → 2,  2 → 3

        (0) ──────► (1)
         │           │
         │           ▼
         └────────► (3) ◄──── (2)

   Can 0 reach 2?  0 → 1 → 2  ✓  (no direct edge, so the closure must ADD it)
   Can 3 reach 0?  3 has no outgoing edges → ✗
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `r[i][j]` = 1 if j is reachable from i using stops from `{0..k}` |
| Transition | `r[i][j] = r[i][j] OR (r[i][k] AND r[k][j])` |
| Base | input matrix with the diagonal set to 1 |
| Order | k outer, then i, then j |
| Answer | the matrix after k = n−1 |

### Trace (changed cells marked `*`)

```
  START                          k = 0  (stop at 0)
       0  1  2  3                     0  1  2  3
    0 [1, 1, 0, 1]                 0 [1, 1, 0, 1]
    1 [0, 1, 1, 0]                 1 [0, 1, 1, 0]
    2 [0, 0, 1, 1]                 2 [0, 0, 1, 1]
    3 [0, 0, 0, 1]                 3 [0, 0, 0, 1]
                                   nobody else reaches 0 → no change

  k = 1  (stop at 1)             k = 2  (stop at 2)
       0  1  2  3                     0  1  2  3
    0 [1, 1, 1*,1]                 0 [1, 1, 1, 1]
    1 [0, 1, 1, 0]                 1 [0, 1, 1, 1*]   1→2→3
    2 [0, 0, 1, 1]                 2 [0, 0, 1, 1]
    3 [0, 0, 0, 1]                 3 [0, 0, 0, 1]
    0 reaches 1, and 1 reaches 2
    → 0 reaches 2

  k = 3  (stop at 3)
       0  1  2  3
    0 [1, 1, 1, 1]
    1 [0, 1, 1, 1]
    2 [0, 0, 1, 1]
    3 [0, 0, 0, 1]      3 reaches nothing new → no change   ✅ FINAL
```

### A handy shortcut: OR whole rows

```
  For a fixed k:  every row i that reaches k  inherits  ALL of row k.

     if r[i][k] == 1:   row i ← row i  OR  row k

     row 0:  [1, 1, 0, 1]
     row 1:  [0, 1, 1, 0]      (k = 1, and r[0][1] = 1)
             ─────────────
      OR  →  [1, 1, 1, 1]
```

> With **bitsets**, one row-OR is one machine operation per 64 columns → O(V³ / 64).

### Pseudocode

```
function transitiveClosure(graph):
    r ← copy of graph
    for i from 0 to n-1:  r[i][i] ← 1           // every vertex reaches itself
    for k from 0 to n-1:
        for i from 0 to n-1:
            if r[i][k] == 0: continue           // i can't reach k → skip the row
            for j from 0 to n-1:
                if r[k][j] == 1:  r[i][j] ← 1
    return r
```

### Optimization ladder

| Approach | Time | Space | Best when |
|---|---|---|---|
| Floyd-Warshall (boolean) | O(V³) | O(V²) | small dense graphs, simplest |
| **+ bitset row OR** | **O(V³ / 64)** | O(V²) | dense graphs, V up to a few thousand |
| BFS / DFS from every vertex | O(V · (V + E)) | O(V²) | **sparse** graphs |

### 📌 Points to remember
- **Swap `min, +` for `OR, AND`.** Same loops, same k-outside rule.
- Set the diagonal to 1 if "a vertex reaches itself" (check your problem's convention).
- No INF handling needed. Booleans can't overflow.
- `reach[i][j] = 1` and `reach[j][i] = 1` ⇔ i and j are in the same strongly connected component.

---

## 3. Detect Negative Cycle Using Floyd Warshall (Medium)

### Problem
Given a weighted **directed** graph (weights may be negative), report whether it contains a
**negative cycle**: a loop whose total weight is below 0.

> **Convention used here:** the input is an edge list `(u, v, w)` (or an adjacency matrix with INF for "no edge").
> Build the matrix with 0 on the diagonal. Return `true` / `1` if a negative cycle exists.

### Visualize it

```
        (0) ──── 1 ────► (1)
         ▲                │
         │               −1
        −1                │
         │                ▼
         └────────────── (2)

   Cycle 0 → 1 → 2 → 0  =  1 + (−1) + (−1)  =  −1   < 0   ⚠️
   Go around it again and again → the "shortest" path keeps shrinking forever.
```

### The key insight: read the DIAGONAL

```
  dist[i][i] starts at 0 ("stay home for free").

  If node i sits on a negative cycle, the run finds a way to
  leave i and come back with a NEGATIVE total:

        dist[i][i] = min( 0 , cost of best loop through i )  <  0

  ┌──────────────────────────────────────────────────────────┐
  │  After Floyd-Warshall:                                   │
  │     any dist[i][i] < 0   ⇔   a negative cycle exists     │
  └──────────────────────────────────────────────────────────┘
```

### Trace

```
  START
          0    1    2
       ┌────┬────┬────┐
    0  │  0 │  1 │  ∞ │
    1  │  ∞ │  0 │ −1 │
    2  │ −1 │  ∞ │  0 │
       └────┴────┴────┘

  k = 0                               uses row 0 = [0, 1, ∞]
          0    1    2
       ┌────┬────┬────┐
    0  │  0 │  1 │  ∞ │
    1  │  ∞ │  0 │ −1 │
    2  │ −1 │  0*│  0 │       2→0→1 = −1 + 1 = 0
       └────┴────┴────┘

  k = 1                               uses row 1 = [∞, 0, −1]
          0    1    2
       ┌────┬────┬────┐
    0  │  0 │  1 │  0*│       0→1→2 = 1 + (−1) = 0
    1  │  ∞ │  0 │ −1 │
    2  │ −1 │  0 │ −1*│  ◄─── 2→(0→)1→2 = 0 + (−1) = −1   DIAGONAL < 0 !
       └────┴────┴────┘

  k = 2   (now dist[2][2] < 0, so row/column 2 keep shrinking during this stage)
          0    1    2
       ┌────┬────┬────┐
    0  │ −1*│  0*│ −1*│
    1  │ −2*│ −1*│ −2*│
    2  │ −2*│ −1*│ −2*│
       └────┴────┴────┘
     (numbers from an in-place pass, i then j ascending; with a negative
      cycle the exact values depend on update order, only the SIGNS matter)

  Diagonal: −1, −1, −2  → all < 0 → NEGATIVE CYCLE ✅
  (every node is on the cycle, so every diagonal entry goes negative)
```

> Contrast: change the weights to `0 → 1 (4)`, `1 → 2 (−2)`, `2 → 0 (1)`.
> The cycle costs `4 − 2 + 1 = 3 ≥ 0`, so the diagonal stays `0, 0, 0` → **no** negative cycle,
> even though a negative edge exists. **Negative edge ≠ negative cycle.**

### Pseudocode

```
function hasNegativeCycle(n, edges):
    d ← n × n matrix filled with INF
    for i from 0 to n-1:      d[i][i] ← 0
    for each (u, v, w):       d[u][v] ← min(d[u][v], w)     // self-loop w<0 → d[u][u] < 0

    for k from 0 to n-1:
        for i from 0 to n-1:
            if d[i][k] == INF: continue
            for j from 0 to n-1:
                if d[k][j] == INF: continue
                d[i][j] ← min(d[i][j], d[i][k] + d[k][j])

    for i from 0 to n-1:
        if d[i][i] < 0: return true
    return false
```

### Extension: which pairs are "broken"?

```
  dist(i, j) is −∞ (no real shortest path) if you can go
     i ──► k ──► (negative loop at k) ──► j

  for each k with d[k][k] < 0:
      for each i, j with d[i][k] ≠ INF and d[k][j] ≠ INF:
          mark dist(i, j) = −∞
```

### Floyd-Warshall vs. Bellman-Ford for this job

| | Floyd-Warshall | Bellman-Ford |
|---|---|---|
| Time | O(V³) | O(V · E) |
| Finds a cycle reachable from... | **anywhere** in the graph | the **source** (unless you add a super-source) |
| Bonus output | all-pairs distances | one source's distances |
| Pick it when | V is small, you need all pairs anyway | V is large, graph is sparse |

> See `06-Bellman-Ford.md` for the "relax V−1 times, then one more round" method.

### 📌 Points to remember
- **Check the diagonal at the end.** `d[i][i] < 0` ⇔ i is on (or can loop through) a negative cycle.
- A **negative self-loop** `u → u` is already a negative cycle. Keep the `min` when loading edges.
- **Undirected** graph: one negative edge `u — v` is a negative cycle (`u → v → u`).
- With a negative cycle, values can shrink **very fast** (exponentially). Use 64-bit, or stop as soon as any `d[k][k] < 0`.
- The INF skip is **mandatory** here: `INF + (−5)` would look like a real path.

---

## 4. Bonus: Find the City With the Smallest Number of Neighbors at a Threshold Distance

> This problem lives in `06-Bellman-Ford.md`'s list, but Floyd-Warshall is its most natural solution.

### Problem (LeetCode 1334)
`n` cities, **undirected** weighted edges, and a `distanceThreshold`.
For each city, count the cities reachable with distance `≤ threshold`.
Return the city with the **smallest** count. **Ties → the largest index.**

### Why Floyd-Warshall fits

```
  n ≤ 100           → V³ = 10⁶, trivially fast
  need EVERY pair   → all-pairs shortest paths
  then just COUNT   → one pass over the matrix
```

### Trace: n = 4, edges `0–1 (3)`, `1–2 (1)`, `1–3 (4)`, `2–3 (1)`, threshold = 4

```
        (0) ──3── (1) ──1── (2)
                    ╲        │
                     4       1
                      ╲      │
                        ─── (3)

  START                       after k=1                   after k=2  (= FINAL, k=0 and k=3 change nothing)
       0  1  2  3                  0  1  2  3                  0  1  2  3
    0 [0, 3, ∞, ∞]              0 [0, 3, 4*,7*]             0 [0, 3, 4, 5*]
    1 [3, 0, 1, 4]              1 [3, 0, 1, 4]              1 [3, 0, 1, 2*]
    2 [∞, 1, 0, 1]              2 [4*,1, 0, 1]              2 [4, 1, 0, 1]
    3 [∞, 4, 1, 0]              3 [7*,4, 1, 0]              3 [5*,2*,1, 0]

  Count neighbors with dist ≤ 4 (excluding itself):

    city 0: {1:3, 2:4}           → 2   (3 is at 5 ✗)
    city 1: {0:3, 2:1, 3:2}      → 3
    city 2: {0:4, 1:1, 3:1}      → 3
    city 3: {1:2, 2:1}           → 2   (0 is at 5 ✗)

  Smallest count = 2, tied between cities 0 and 3 → pick the LARGER → 3 ✅
```

### Pseudocode

```
function findTheCity(n, edges, threshold):
    d ← n × n of INF, d[i][i] ← 0
    for each (u, v, w):  d[u][v] ← w;  d[v][u] ← w        // undirected: both ways
    run Floyd-Warshall on d (k outside, skip INF)

    bestCity ← -1, bestCount ← +∞
    for i from 0 to n-1:
        count ← number of j ≠ i with d[i][j] ≤ threshold
        if count ≤ bestCount:                             // "≤" makes ties pick the larger i
            bestCount ← count
            bestCity  ← i
    return bestCity
```

### 📌 Points to remember
- **Undirected → fill both directions.**
- Use `≤` while scanning i upward so a tie goes to the **larger** index.
- Alternatives: Dijkstra from every city (O(V · E log V)) also works. Bellman-Ford from every city works but is the slowest.

---

## 5. Master Cheat Sheet

### All problems at a glance

```
┌──────────────────────────┬───────────────────────────────────────────┬──────────────────────┬────────┐
│ Problem                  │ Core update                               │ Answer               │ Time   │
├──────────────────────────┼───────────────────────────────────────────┼──────────────────────┼────────┤
│ Floyd Warshall           │ d[i][j] = min(d[i][j], d[i][k] + d[k][j]) │ whole matrix         │ O(V³)  │
│ Transitive Closure       │ r[i][j] = r[i][j] OR (r[i][k] AND r[k][j])│ whole 0/1 matrix     │ O(V³)  │
│ Detect Negative Cycle    │ same as FW, then scan the diagonal        │ any d[i][i] < 0      │ O(V³)  │
│ City w/ Fewest Neighbors │ FW, then count d[i][j] ≤ threshold        │ min count, max index │ O(V³)  │
└──────────────────────────┴───────────────────────────────────────────┴──────────────────────┴────────┘
```

### Shortest-path family tree

```
                          SHORTEST PATHS
                                │
          ┌─────────────────────┴──────────────────────┐
     SINGLE SOURCE                                 ALL PAIRS
          │                                            │
   ┌──────┼───────────────┐                  ┌─────────┴──────────┐
 BFS   Dijkstra     Bellman-Ford        Floyd-Warshall     run single-source
(unweighted) (w ≥ 0)  (w < 0 ok,        (DP over k,         V times
               │       neg. cycles)      O(V³))             (sparse graphs)
               │                             │
     see 05-Dijkstra    see 06-Bellman-Ford  ├─ min / +   → distances
                                             ├─ OR / AND  → reachability
                                             └─ diagonal  → negative cycles
```

### Swap the operators, keep the loops

```
   ┌──────────────────────┬──────────────┬────────────────┬─────────────────┐
   │ Question             │ "combine"    │ "choose best"  │ Empty value     │
   ├──────────────────────┼──────────────┼────────────────┼─────────────────┤
   │ shortest distance    │   +          │   min          │ INF             │
   │ reachable?           │   AND        │   OR           │ 0 (false)       │
   │ widest path (bonus)  │   min        │   max          │ 0               │
   │ count of ≤ T (city)  │ FW, then count each row         │                 │
   └──────────────────────┴──────────────┴────────────────┴─────────────────┘
```

### Checklist

```
  ☐ V small (≤ ~400) and need all pairs?            → Floyd-Warshall
  ☐ Is k the OUTERMOST loop?                         → must be
  ☐ Skipping when d[i][k] or d[k][j] is "no edge"?   → must be
  ☐ Parallel edges → kept the min?
  ☐ Undirected → filled both directions?
  ☐ Diagonal initialized (0 for distances, 1 for reachability)?
  ☐ Negative weights → need to check d[i][i] < 0 afterwards?
  ☐ Large sparse graph instead?                      → Dijkstra / BFS from each node
```

### 🚩 Common bugs to avoid

```
  ✗ k as the inner loop → some paths never get found
  ✗ INF = INT_MAX → INF + w overflows to a negative "shortest path"
  ✗ No INF check with negative edges → INF + (−5) looks like a real path
  ✗ GFG: forgetting that −1 means "no edge" and taking min(−1, x) = −1
  ✗ Overwriting a parallel edge with a heavier one instead of keeping the min
  ✗ Undirected graph filled in only one direction
  ✗ Transitive closure: diagonal left as 0 when the problem says i reaches itself
  ✗ Trusting distances when a negative cycle exists (they are meaningless)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "If I'm allowed to stop at node k, does going           ║
   ║   i → k → j beat what I already have for i → j?"         ║
   ╚══════════════════════════════════════════════════════════╝
      Ask it for every k (outside), every i, every j. That's the whole algorithm.
```

---

### ✅ Progress tracker

- [ ] Floyd Warshall (Medium)
- [ ] Transitive Closure of a Graph (Medium)
- [ ] Detect Negative Cycle Using Floyd Warshall (Medium)
