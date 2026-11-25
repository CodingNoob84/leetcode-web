# Dijkstra (Weighted Shortest Path): A Visual Guide

> **Goal:** Learn to *see* weighted shortest-path problems, run Dijkstra by hand, and adapt it
> when the "cost" is not a plain sum.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Dijkstra?](#0-the-big-idea-what-is-dijkstra)
1. [Implement Dijkstra (Easy)](#1-implement-dijkstra-easy)
2. [Shortest Path in Undirected Graph (Medium)](#2-shortest-path-in-undirected-graph-medium)
3. [Network Delay Time (Medium)](#3-network-delay-time-medium)
4. [Minimum Cost Path (Medium)](#4-minimum-cost-path-medium)
5. [Path With Minimum Effort (Medium)](#5-path-with-minimum-effort-medium)
6. [Swim in Rising Water (Hard)](#6-swim-in-rising-water-hard)
7. [Cheapest Flights Within K Stops (Medium)](#7-cheapest-flights-within-k-stops-medium)
8. [Master Cheat Sheet](#8-master-cheat-sheet)

> **Suggested order:** Implement Dijkstra → Shortest Path in Undirected Graph → Network Delay Time
> → Minimum Cost Path → Path With Minimum Effort → Swim in Rising Water → Cheapest Flights Within K Stops.
> The first three are the plain algorithm. The next three run it on a grid and change what "cost" means.
> The last one adds an extra limit to the state.

---

## 0. The Big Idea: What Is Dijkstra?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "DIJKSTRA"                              │
├──────────────────────────────────────────────────────────────────┤
│  • Edges (or cells) have WEIGHTS / COSTS / TIMES                 │
│  • "Shortest / cheapest / fastest / minimum ..." path            │
│  • All weights are NON-NEGATIVE                                  │
│  • One SOURCE (single-source shortest path)                      │
│  • Grid where stepping on a cell costs something                 │
│  • "Minimize the WORST step on the path" (minimax)               │
└──────────────────────────────────────────────────────────────────┘
```

### Why plain BFS fails when edges have weights

```
              10
        A ──────────► B          BFS thinks: B is 1 edge away → dist 10
        │             ▲
      1 │             │ 1        Truth:  A → C → B = 1 + 1 = 2 ✅
        ▼             │
        C ────────────┘

  BFS counts EDGES. Dijkstra counts COST.
  BFS = Dijkstra where every edge weight is 1.
```

### The core move: RELAXATION

```
   dist[u] = 5          weight 3
      (u) ─────────────────────► (v)   dist[v] = 10

   "Is going THROUGH u a better way to reach v?"

        dist[u] + w   <   dist[v] ?
           5 + 3 = 8  <   10        → YES → dist[v] ← 8  (and remember parent[v] = u)

   ┌──────────────────────────────────────────────────────┐
   │ relax(u, v, w):                                      │
   │     if dist[u] + w < dist[v]:                        │
   │         dist[v] ← dist[u] + w                        │
   │         push (dist[v], v) into the min-heap          │
   └──────────────────────────────────────────────────────┘
```

### The algorithm in one picture

```
   ┌─────────────┐   pop smallest   ┌──────────────┐   relax all    ┌─────────────┐
   │  MIN-HEAP   │ ───────────────► │  node u with │ ─────────────► │ neighbors v │
   │ (dist,node) │                  │  dist d      │   out-edges    │ push better │
   └─────────────┘                  └──────────────┘                └──────┬──────┘
          ▲                                                                │
          └────────────────────────────────────────────────────────────────┘

   Repeat until the heap is empty (or until you pop the target).
```

### Why "the first pop is final" (the greedy argument)

```
   Heap pops node u with distance d. d is the SMALLEST value in the heap.

   Could a cheaper path to u still exist?
   Such a path would leave the "settled" region through some node x
   that is still in the heap with dist[x] ≥ d ...

        settled region          heap frontier
      ┌───────────────┐
      │  S ──► ...    │──► x  (dist ≥ d) ──► ... ──► u
      └───────────────┘
                            ...and every edge after x adds ≥ 0.
                            So that path costs ≥ d. No improvement possible.

   ⇒ When u is popped the FIRST time, dist[u] is final.  ✅
   ⚠ This needs every weight ≥ 0.
```

### Lazy deletion: skip stale heap entries

```
  A node can be pushed SEVERAL times (once per improvement):

     push (4, B)   ← first found
     push (3, B)   ← found a better path later

  The heap now holds BOTH. (3, B) pops first and settles B.
  Later (4, B) pops: it is STALE because 4 > dist[B] = 3.

  ┌────────────────────────────────────────────┐
  │  pop (d, u)                                │
  │  if d > dist[u]:  skip it  ← stale entry   │
  └────────────────────────────────────────────┘

  Simpler than a "decrease-key" heap, same O(E log E) bound.
```

### Why negative edges break it

```
            2
      A ─────────► B         Dijkstra:  pop A (0)
      │            ▲                    pop B (2)  ← settled as FINAL
    3 │            │ −2                 pop C (3)  → relax C→B: 3 − 2 = 1 < 2 ...
      ▼            │                               but B was already "final" ❌
      C ───────────┘
                             True answer: A → C → B = 1.

  The greedy argument assumed "every edge after x adds ≥ 0". A −2 edge breaks that.
  → Negative weights: use BELLMAN-FORD (see 06-Bellman-Ford.md).
```

### The template (memorize this)

```
function dijkstra(graph, src):
    dist ← array of +∞;  dist[src] ← 0
    heap ← min-heap with (0, src)
    while heap not empty:
        (d, u) ← pop smallest
        if d > dist[u]: continue                 // stale entry
        for each (v, w) in graph[u]:
            if d + w < dist[v]:
                dist[v] ← d + w
                push (dist[v], v)
    return dist
```

### Generalization: what counts as "cost"?

Dijkstra works for any cost that **never gets smaller** when you extend a path.

```
┌───────────────────────┬─────────────────────────────┬──────────────────────────────┐
│ Cost of a path        │ Combine step                │ Problem here                 │
├───────────────────────┼─────────────────────────────┼──────────────────────────────┤
│ SUM of edge weights   │ newCost = d + w             │ Implement, Network Delay     │
│ SUM of cell values    │ newCost = d + grid[v]       │ Minimum Cost Path            │
│ MAX step on the path  │ newCost = max(d, |h_u−h_v|) │ Path With Minimum Effort     │
│ MAX cell on the path  │ newCost = max(d, grid[v])   │ Swim in Rising Water         │
│ SUM + extra limit     │ state = (node, stops)       │ Cheapest Flights (K stops)   │
└───────────────────────┴─────────────────────────────┴──────────────────────────────┘
```

> 💡 **Key insight:** `max(d, x) ≥ d` and `d + w ≥ d` when `w ≥ 0`. Both are "never decreasing",
> so the greedy "first pop is final" argument still holds.

### Complexity

| Version | Time | Space |
|---|---|---|
| Array scan for the min (dense graphs) | O(V²) | O(V) |
| **Binary heap + lazy deletion** | **O(E log E)** ≈ O(E log V) | O(V + E) |
| Grid of R×C cells (4 neighbors) | O(RC · log(RC)) | O(RC) |

---

## 1. Implement Dijkstra (Easy)

### Problem
Given an undirected weighted graph as an adjacency list and a source, return the shortest
distance from the source to every node.

### Visualize it

```
               4
        (0) ───────── (1)
         │           ╱ │
       1 │       2 ╱   │ 1
         │       ╱     │
        (2) ─────────(3) ───────── (4)
               5             3

  Edges:  0–1 (4)   0–2 (1)   2–1 (2)   1–3 (1)   2–3 (5)   3–4 (3)
  Source: 0
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[v]` = shortest known distance from the source to `v` |
| Transition | relax every edge `(u, v, w)`: `dist[v] = min(dist[v], dist[u] + w)` |
| Base | `dist[src] = 0`, everything else `+∞` |
| Order | always expand the unsettled node with the **smallest** dist (min-heap) |
| Answer | the whole `dist` array |

### Trace (source 0)

```
 step │ pop     │ stale? │ relaxations                         │ heap after (sorted)          │ dist [0,1,2,3,4]
 ─────┼─────────┼────────┼─────────────────────────────────────┼──────────────────────────────┼──────────────────
  0   │ —       │        │ start                               │ (0,0)                        │ [0, ∞, ∞, ∞, ∞]
  1   │ (0, 0)  │ no     │ 1: 0+4=4 ✓   2: 0+1=1 ✓             │ (1,2) (4,1)                  │ [0, 4, 1, ∞, ∞]
  2   │ (1, 2)  │ no     │ 1: 1+2=3<4 ✓  3: 1+5=6 ✓  0: no     │ (3,1) (4,1) (6,3)            │ [0, 3, 1, 6, ∞]
  3   │ (3, 1)  │ no     │ 3: 3+1=4<6 ✓  0,2: no               │ (4,1) (4,3) (6,3)            │ [0, 3, 1, 4, ∞]
  4   │ (4, 1)  │ YES    │ 4 > dist[1]=3 → skip                │ (4,3) (6,3)                  │ [0, 3, 1, 4, ∞]
  5   │ (4, 3)  │ no     │ 4: 4+3=7 ✓   1,2: no                │ (6,3) (7,4)                  │ [0, 3, 1, 4, 7]
  6   │ (6, 3)  │ YES    │ 6 > dist[3]=4 → skip                │ (7,4)                        │ [0, 3, 1, 4, 7]
  7   │ (7, 4)  │ no     │ 3: 7+3=10 > 4 no                    │ —                            │ [0, 3, 1, 4, 7] ✅

 Settled in order:  0 → 2 → 1 → 3 → 4
```

### Watch the "shortcut" happen

```
   First guess for node 1:   0 ──4──► 1                 = 4
   Better, found at step 2:  0 ──1──► 2 ──2──► 1        = 3   ← relaxation wins
   Node 3:                   0 → 2 → 1 ──1──► 3         = 4   (not 0 → 2 → 3 = 6)
   Node 4:                   0 → 2 → 1 → 3 ──3──► 4     = 7
```

### Pseudocode

```
function dijkstra(V, adj, src):
    dist ← array of V, all +∞
    dist[src] ← 0
    heap ← min-heap; push (0, src)
    while heap not empty:
        (d, u) ← pop min
        if d > dist[u]: continue
        for each (v, w) in adj[u]:
            if d + w < dist[v]:
                dist[v] ← d + w
                push (dist[v], v)
    return dist
```

### Optimization ladder

| Approach | Time | When |
|---|---|---|
| Bellman-Ford | O(V·E) | negative weights only |
| Dijkstra, array min-scan | O(V²) | very dense graphs (E ≈ V²) |
| **Dijkstra, binary heap** | **O(E log V)** ✅ | the default |
| BFS | O(V + E) | all weights equal |
| 0-1 BFS (deque) | O(V + E) | weights only 0 or 1 |

### 📌 Points to remember
- Heap entries are **(distance, node)**. The distance comes first so the heap orders by it.
- **Skip stale entries** (`d > dist[u]`). Forgetting this is still correct, but slower.
- Undirected graph → add each edge **in both directions**.
- Unreachable nodes stay `+∞`. Convert them to `-1` or `1e9` if the problem asks.

---

## 2. Shortest Path in Undirected Graph (Medium)

### Problem
GFG has two well-known versions. Learn **both**, because the only difference is the edge weight:

```
┌────────────────────────────────┬─────────────────────────────────────┐
│ Version A: UNIT weights        │ Version B: WEIGHTED edges           │
│ every edge costs 1             │ edges have different weights        │
│ → BFS, O(V + E)                │ → Dijkstra, O(E log V)              │
│ return dist to every node      │ return the actual PATH src → target │
└────────────────────────────────┴─────────────────────────────────────┘
```

---

### Version A: unit weights → BFS is enough

```
    (0) ─── (1) ─── (2)
     │               │
    (3)              │
     │               │
    (4) ─── (5) ─── (6) ─── (7)
                     │       │
                     └─ (8) ─┘

  Edges: 0-1, 0-3, 3-4, 4-5, 5-6, 1-2, 2-6, 6-7, 7-8, 6-8      source 0
```

> 💡 With equal weights, BFS visits nodes **in order of distance**, so the heap is unnecessary.
> A queue is a heap where every key arrives already sorted.

### Trace (BFS layers)

```
  layer 0:  {0}                           dist 0
  layer 1:  {1, 3}       from 0           dist 1
  layer 2:  {2, 4}       from 1, 3        dist 2
  layer 3:  {6, 5}       from 2, 4        dist 3
  layer 4:  {7, 8}       from 6           dist 4

  node : 0  1  2  3  4  5  6  7  8
  dist : 0  1  2  1  2  3  3  4  4   ✅
```

### Pseudocode (Version A)

```
function shortestPathUnit(V, adj, src):
    dist ← array of V, all −1
    dist[src] ← 0
    queue ← [src]
    while queue not empty:
        u ← pop front
        for each v in adj[u]:
            if dist[v] == −1:
                dist[v] ← dist[u] + 1
                push v to back
    return dist
```

---

### Version B: weighted → Dijkstra + a parent array

To return the **path** and not only its length, remember **who improved each node last**.

```
   relax(u → v) succeeds  ⇒  parent[v] ← u

   Then walk backward from the target:

     target → parent[target] → parent[parent[target]] → ... → src
     then REVERSE the list.
```

### Trace (same graph as problem 1, src 0, target 4)

```
  event                         parent changes
  ───────────────────────────   ─────────────────────────────
  pop 0: relax 1 (4), 2 (1)     parent[1]=0   parent[2]=0
  pop 2: relax 1 (3), 3 (6)     parent[1]=2   parent[3]=2     ← 1 improved, parent overwritten
  pop 1: relax 3 (4)            parent[3]=1                   ← 3 improved, parent overwritten
  pop 3: relax 4 (7)            parent[4]=3

  Final parent:  [ −, 2, 0, 1, 3 ]
                 node 0 1 2 3 4

  Walk back from 4:   4 → 3 → 1 → 2 → 0
  Reverse:            0 → 2 → 1 → 3 → 4      cost 1 + 2 + 1 + 3 = 7 ✅
```

### Pseudocode (Version B)

```
function shortestPathWeighted(V, adj, src, target):
    dist   ← array of V, all +∞;   dist[src] ← 0
    parent ← array of V, parent[i] ← i
    heap   ← [(0, src)]
    while heap not empty:
        (d, u) ← pop min
        if d > dist[u]: continue
        if u == target: break                     // optional early exit
        for each (v, w) in adj[u]:
            if d + w < dist[v]:
                dist[v]   ← d + w
                parent[v] ← u
                push (dist[v], v)

    if dist[target] == +∞: return [−1]
    path ← []
    node ← target
    while node ≠ src:
        append node to path
        node ← parent[node]
    append src to path
    return reverse(path)
```

### 📌 Points to remember
- **All weights equal → BFS.** Don't pay for a heap you don't need.
- Weights only 0 or 1 → **0-1 BFS**: push weight-0 edges to the front of a deque, weight-1 edges to the back.
- Set `parent[v]` **only inside a successful relaxation**, so it always matches `dist[v]`.
- **Early exit** when the target is popped (not when it is pushed). A pushed value may still improve.

---

## 3. Network Delay Time (Medium)

### Problem
`times[i] = (u, v, w)` means a signal takes `w` time from `u` to `v` (directed). A signal starts at `k`.
How long until **all** `n` nodes receive it? Return `-1` if some node never does.

### Visualize it

```
                4
       (1) ────────► (2)
        │            ▲  │
      1 │          2 │  │ 1
        ▼            │  ▼
       (3) ──────────┘ (4)
        │               ▲
        └───────5───────┘

  Edges: 1→2 (4)  1→3 (1)  3→2 (2)  2→4 (1)  3→4 (5)        k = 1, n = 4
```

### The key reframe

```
  "When does the LAST node hear the signal?"

   The signal spreads along shortest paths. Every node v hears it at time dist[v].
   The network is done when the SLOWEST node hears it:

        ┌─────────────────────────────────┐
        │  answer = max over v of dist[v] │
        │  (−1 if any dist[v] is +∞)      │
        └─────────────────────────────────┘
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[v]` = earliest time `v` receives the signal |
| Transition | standard relaxation on directed edges |
| Base | `dist[k] = 0` |
| Order | min-heap |
| Answer | `max(dist)`, or `-1` if any node is unreachable |

### Trace (k = 1)

```
 pop     │ stale? │ relaxations                    │ heap after             │ dist [1,2,3,4]
 ────────┼────────┼────────────────────────────────┼────────────────────────┼────────────────
 —       │        │ start                          │ (0,1)                  │ [0, ∞, ∞, ∞]
 (0, 1)  │ no     │ 2: 0+4=4 ✓   3: 0+1=1 ✓        │ (1,3) (4,2)            │ [0, 4, 1, ∞]
 (1, 3)  │ no     │ 2: 1+2=3<4 ✓  4: 1+5=6 ✓       │ (3,2) (4,2) (6,4)      │ [0, 3, 1, 6]
 (3, 2)  │ no     │ 4: 3+1=4<6 ✓                   │ (4,2) (4,4) (6,4)      │ [0, 3, 1, 4]
 (4, 2)  │ YES    │ skip (4 > 3)                   │ (4,4) (6,4)            │ [0, 3, 1, 4]
 (4, 4)  │ no     │ no out-edges                   │ (6,4)                  │ [0, 3, 1, 4]
 (6, 4)  │ YES    │ skip (6 > 4)                   │ —                      │ [0, 3, 1, 4]

 answer = max(0, 3, 1, 4) = 4 ✅      (node 4 hears it last, via 1 → 3 → 2 → 4)
```

### The −1 case

```
   (1) ──► (2)        (3)      k = 1
                       ▲
                       nobody points to 3 → dist[3] = ∞ → answer −1
```

### Pseudocode

```
function networkDelayTime(times, n, k):
    adj ← adjacency list from times (directed)
    dist ← array of n+1, all +∞          // nodes are 1-indexed
    dist[k] ← 0
    heap ← [(0, k)]
    while heap not empty:
        (d, u) ← pop min
        if d > dist[u]: continue
        for each (v, w) in adj[u]:
            if d + w < dist[v]:
                dist[v] ← d + w
                push (dist[v], v)
    ans ← max of dist[1..n]
    return (ans == +∞) ? −1 : ans
```

### 📌 Points to remember
- The answer is the **max** of shortest distances, not their sum.
- Edges are **directed**. Don't add the reverse edge.
- Nodes are **1-indexed**. Size arrays `n + 1` and ignore index 0 when taking the max.
- Small `n` (≤ 100): Bellman-Ford or Floyd-Warshall also pass. Dijkstra is the clean default.

---

## 4. Minimum Cost Path (Medium)

### Problem
*(GFG version, which this guide assumes.)* An `n × n` grid of positive integers. Start at the top-left cell,
end at the bottom-right cell. You may move **up, down, left, or right**. The cost of a path is the
**sum of all cells on it, including the start and end**. Return the minimum cost.

### Why grid DP is not enough here

```
  In 02-2D-Grid-DP.md, Minimum Path Sum allowed only RIGHT / DOWN.
  That made a clean fill order (up and left are always ready).

  With 4 directions, the best path may need to go LEFT or UP:

     S   1   1   1   1
     99  99  99  99  1          Best path (cost 16, all 1s):
     1   1   1   1   1             → → → → ↓ ↓ ← ← ← ← ↓ ↓ → → → →
     1   99  99  99  99
     1   1   1   1   E          Any right/down-only path must cross a 99.

  No fixed fill order works → treat the grid as a GRAPH and run Dijkstra.
```

### Grid as a graph

```
     each CELL = a node
     each move = an edge into the neighbor cell
     edge weight = value of the cell you step ONTO

        ┌─────┐
        │  ↑  │
   ┌────┼─────┼────┐       cost(u → v) = grid[v]
   │ ←  │  u  │  → │       start cost   = grid[0][0]  (you stand on it)
   └────┼─────┼────┘
        │  ↓  │
        └─────┘
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[r][c]` = cheapest sum to reach `(r, c)`, including both ends |
| Transition | `dist[nr][nc] = min(dist[nr][nc], dist[r][c] + grid[nr][nc])` |
| Base | `dist[0][0] = grid[0][0]` |
| Order | min-heap of `(cost, r, c)` |
| Answer | `dist[n-1][n-1]`, return as soon as it is popped |

### Trace

```
   grid
  ┌───┬───┬───┐
  │ 1 │ 3 │ 1 │
  ├───┼───┼───┤
  │ 1 │ 5 │ 1 │
  ├───┼───┼───┤
  │ 4 │ 2 │ 1 │
  └───┴───┴───┘

 pop            │ relaxations                         │ heap after
 ───────────────┼─────────────────────────────────────┼──────────────────────────────────
 (1, (0,0))     │ (0,1)=1+3=4   (1,0)=1+1=2           │ (2,(1,0)) (4,(0,1))
 (2, (1,0))     │ (1,1)=2+5=7   (2,0)=2+4=6           │ (4,(0,1)) (6,(2,0)) (7,(1,1))
 (4, (0,1))     │ (0,2)=4+1=5   (1,1)=4+5=9 ✗ (≥7)    │ (5,(0,2)) (6,(2,0)) (7,(1,1))
 (5, (0,2))     │ (1,2)=5+1=6                         │ (6,(1,2)) (6,(2,0)) (7,(1,1))
 (6, (1,2))     │ (2,2)=6+1=7   (1,1)=11 ✗            │ (6,(2,0)) (7,(1,1)) (7,(2,2))
 (6, (2,0))     │ (2,1)=6+2=8                         │ (7,(1,1)) (7,(2,2)) (8,(2,1))
 (7, (1,1))     │ (2,1)=9 ✗   others ✗                │ (7,(2,2)) (8,(2,1))
 (7, (2,2))     │ TARGET popped → return 7 ✅

   Final dist                Path: 1 → 3 → 1 → 1 → 1 = 7
  ┌───┬───┬───┐                    (0,0)(0,1)(0,2)(1,2)(2,2)
  │ 1 │ 4 │ 5 │
  ├───┼───┼───┤
  │ 2 │ 7 │ 6 │
  ├───┼───┼───┤
  │ 6 │ 8 │ 7 │
  └───┴───┴───┘
```

### Pseudocode

```
function minimumCostPath(grid):
    n ← size of grid
    dist ← n × n table of +∞
    dist[0][0] ← grid[0][0]
    heap ← [(grid[0][0], 0, 0)]
    while heap not empty:
        (d, r, c) ← pop min
        if d > dist[r][c]: continue
        if (r, c) == (n−1, n−1): return d
        for each (nr, nc) in 4 neighbors of (r, c):
            if inside grid:
                nd ← d + grid[nr][nc]
                if nd < dist[nr][nc]:
                    dist[nr][nc] ← nd
                    push (nd, nr, nc)
    return dist[n−1][n−1]
```

### 📌 Points to remember
- **Only right/down moves → grid DP. Four directions → Dijkstra.**
- The weight lives on the **cell you enter**. Start with `grid[0][0]`, not 0.
- Grid Dijkstra needs no adjacency list. Generate neighbors on the fly.
- Complexity: O(n² log n²) for an `n × n` grid.

---

## 5. Path With Minimum Effort (Medium)

### Problem
`heights` is a grid. Moving between neighboring cells (4 directions) costs `|height difference|`.
The **effort** of a path is the **largest single step** on it. Find the minimum effort from the
top-left to the bottom-right.

### Visualize it

```
  heights                      Two candidate paths
  ┌───┬───┬───┐
  │ 1 │ 2 │ 2 │     A: 1 → 2 → 2 → 2 → 5      steps: 1, 0, 0, 3    effort = 3
  ├───┼───┼───┤        (right, right, down, down)
  │ 3 │ 8 │ 2 │
  ├───┼───┼───┤     B: 1 → 3 → 5 → 3 → 5      steps: 2, 2, 2, 2    effort = 2 ✅
  │ 5 │ 3 │ 5 │        (down, down, right, right)
  └───┴───┴───┘
                    A has a smaller SUM, but B has a smaller WORST step.
```

### The change from normal Dijkstra: `+` becomes `max`

```
   Normal Dijkstra:   newCost = d + w
   Minimum Effort:    newCost = max(d, |h[u] − h[v]|)

   Still never decreasing (max(d, x) ≥ d) → "first pop is final" still holds ✅
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `effort[r][c]` = smallest possible "worst step" to reach `(r, c)` |
| Transition | `max(effort[r][c], |h[r][c] − h[nr][nc]|)` |
| Base | `effort[0][0] = 0` |
| Order | min-heap |
| Answer | value popped at the bottom-right cell |

### Trace

```
  cells:  a=(0,0)=1  b=(0,1)=2  c=(0,2)=2
          d=(1,0)=3  e=(1,1)=8  f=(1,2)=2
          g=(2,0)=5  h=(2,1)=3  i=(2,2)=5        target = i

 pop        │ relaxations (effort = max(d, |diff|))         │ heap after
 ───────────┼───────────────────────────────────────────────┼─────────────────────────
 (0, a)     │ b: max(0,1)=1 ✓    d: max(0,2)=2 ✓            │ (1,b) (2,d)
 (1, b)     │ c: max(1,0)=1 ✓    e: max(1,6)=6 ✓            │ (1,c) (2,d) (6,e)
 (1, c)     │ f: max(1,0)=1 ✓                               │ (1,f) (2,d) (6,e)
 (1, f)     │ i: max(1,3)=3 ✓    e: max(1,6)=6 ✗ (not <6)   │ (2,d) (3,i) (6,e)
 (2, d)     │ g: max(2,2)=2 ✓    e: max(2,5)=5 ✓ (<6)       │ (2,g) (3,i) (5,e) (6,e)
 (2, g)     │ h: max(2,2)=2 ✓                               │ (2,h) (3,i) (5,e) (6,e)
 (2, h)     │ i: max(2,2)=2 ✓ (<3)   e: max(2,5)=5 ✗        │ (2,i) (3,i) (5,e) (6,e)
 (2, i)     │ TARGET popped → return 2 ✅

  Note how i was first reached with effort 3 (via the top row),
  then improved to 2 via the left column. Relaxation at work.
```

### Pseudocode

```
function minimumEffortPath(heights):
    R, C ← dimensions
    effort ← R × C table of +∞
    effort[0][0] ← 0
    heap ← [(0, 0, 0)]
    while heap not empty:
        (d, r, c) ← pop min
        if d > effort[r][c]: continue
        if (r, c) == (R−1, C−1): return d
        for each (nr, nc) in 4 neighbors:
            if inside grid:
                nd ← max(d, |heights[r][c] − heights[nr][nc]|)
                if nd < effort[nr][nc]:
                    effort[nr][nc] ← nd
                    push (nd, nr, nc)
    return 0          // only reached for a 1×1 grid
```

### Alternative: binary search on the answer + BFS

```
  "Can I reach the end using only steps ≤ X?"   → BFS/DFS check, O(RC)

   X:     0    1    2    3    4    5 ...
          NO   NO   YES  YES  YES  YES          ← monotonic!
                    ▲
               smallest YES = answer

  Binary search X over [0, max height − min height] → O(RC · log(maxH)).
  Same idea as 03-Binary-Search-on-Answers.md.
```

### 📌 Points to remember
- **"Minimize the maximum step"** = minimax path → Dijkstra with `max` instead of `+`.
- The **sum** of steps does not matter. Only the single worst step counts.
- Start effort is **0**, not `heights[0][0]`.
- Three valid approaches: Dijkstra, binary search + BFS, or union-find on edges sorted by weight.

---

## 6. Swim in Rising Water (Hard)

### Problem
`grid[r][c]` is the elevation. At time `t` the water level is `t`, and you can swim between neighboring
cells (4 directions) only if **both** have elevation ≤ `t`. Swimming is instant.
What is the earliest `t` at which you can get from the top-left to the bottom-right?

### Visualize it

```
  grid                         Path along the outer ring:
  ┌───┬───┬───┐
  │ 0 │ 1 │ 2 │                 0 → 1 → 2 → 3 → 4          highest cell = 4  ✅
  ├───┼───┼───┤                 (top row, then down the right column)
  │ 7 │ 8 │ 3 │
  ├───┼───┼───┤                 0 → 7 → 6 → 5 → 4          highest cell = 7
  │ 6 │ 5 │ 4 │                 (down the left column, along the bottom)
  └───┴───┴───┘

  You must wait until the water covers the HIGHEST cell on your path.
  → answer = min over paths of ( max cell on the path )
```

### Same machine as Minimum Effort, with a different `max`

```
   Minimum Effort:   newCost = max(d, |h[u] − h[v]|)     ← worst STEP
   Swim in Water:    newCost = max(d, grid[v])           ← worst CELL

   Base: cost(start) = grid[0][0]   (you must wait for your own cell too)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `time[r][c]` = earliest time you can be standing at `(r, c)` |
| Transition | `max(time[r][c], grid[nr][nc])` |
| Base | `time[0][0] = grid[0][0]` |
| Order | min-heap |
| Answer | value popped at the bottom-right cell |

### Trace

```
 pop             │ relaxations                         │ heap after
 ────────────────┼─────────────────────────────────────┼─────────────────────────────
 (0, (0,0))      │ (0,1): max(0,1)=1   (1,0): max(0,7)=7 │ (1,(0,1)) (7,(1,0))
 (1, (0,1))      │ (0,2): 2            (1,1): 8          │ (2,(0,2)) (7,(1,0)) (8,(1,1))
 (2, (0,2))      │ (1,2): 3                              │ (3,(1,2)) (7,(1,0)) (8,(1,1))
 (3, (1,2))      │ (2,2): 4            (1,1): 8 ✗ (not <8)│ (4,(2,2)) (7,(1,0)) (8,(1,1))
 (4, (2,2))      │ TARGET popped → return 4 ✅
```

### Alternative: union-find, "flooding" in order

```
  Sort cells by elevation. Turn them "on" one by one (the water rises).
  When a cell turns on, union it with any neighbor that is already on.
  Stop the moment start and end are in the same set.

    level 0: on {0}
    level 1: on {0,1}         0–1 joined
    level 2: on {0,1,2}       joined
    level 3: on {..,3}        joined
    level 4: on {..,4}        start ↔ end connected → answer 4 ✅

  O(n² · α) after an O(n² log n) sort. Binary search on t + BFS also works.
```

### Pseudocode (Dijkstra)

```
function swimInWater(grid):
    n ← size
    best ← n × n table of +∞
    best[0][0] ← grid[0][0]
    heap ← [(grid[0][0], 0, 0)]
    while heap not empty:
        (t, r, c) ← pop min
        if t > best[r][c]: continue
        if (r, c) == (n−1, n−1): return t
        for each (nr, nc) in 4 neighbors:
            if inside grid:
                nt ← max(t, grid[nr][nc])
                if nt < best[nr][nc]:
                    best[nr][nc] ← nt
                    push (nt, nr, nc)
```

### 📌 Points to remember
- **Cost = highest cell on the path.** The path length does not matter.
- The start cell counts. The answer is at least `max(grid[0][0], grid[n−1][n−1])`.
- Minimum Effort and Swim are **twins**: both are minimax Dijkstra.
- Three ways: Dijkstra, union-find in elevation order, or binary search on `t` + BFS.

---

## 7. Cheapest Flights Within K Stops (Medium)

### Problem
`flights[i] = (from, to, price)`, directed. Find the cheapest price from `src` to `dst`
using **at most `k` stops** (at most `k + 1` flights). Return `-1` if impossible.

### Visualize the trap

```
                 1             1             1
        (0) ─────────► (1) ─────────► (2) ─────────► (3)
         │                             ▲
         └──────────────5──────────────┘

   src = 0, dst = 3, k = 1  (at most 1 stop → at most 2 flights)

   0 → 1 → 2 → 3    cost 3, stops 2   ✗ too many stops
   0 → 2 → 3        cost 6, stops 1   ✓  ← answer 6
```

### Why plain Dijkstra FAILS here 🚫

```
  Plain Dijkstra keeps ONE number per node: the cheapest cost.

   pop (0, node 0)  → push (1, node 1), (5, node 2)
   pop (1, node 1)  → push (2, node 2)       dist[2] = 2  (but it used 2 flights!)
   pop (2, node 2)  → wants to fly to 3 → that would be 3 flights > k+1 = 2 ✗
   pop (5, node 2)  → STALE (5 > dist[2] = 2) → thrown away ❌
   heap empty → returns −1   ✗ WRONG (answer is 6)

  The cheaper way into node 2 used up the stop budget.
  The pricier way (5) still had budget left, but plain Dijkstra discarded it.

  ┌──────────────────────────────────────────────────────────────────┐
  │ FIX: the state is (node, flights used), not just node.           │
  │      A pricier arrival can still be useful if it used FEWER stops.│
  └──────────────────────────────────────────────────────────────────┘
```

### Fixed Dijkstra: state = (cost, node, flights)

```
   heap entries:  (cost, node, flights)
   bestFlights[node] = fewest flights we have POPPED node with so far

   pop (c, u, f):
     • u == dst                → return c           (cheapest valid arrival)
     • f == k + 1              → can't fly further, skip
     • f ≥ bestFlights[u]      → an earlier pop was cheaper AND used ≤ flights → dominated, skip
     • otherwise bestFlights[u] ← f, push every (c + price, v, f + 1)
```

### Trace (the trap example, k = 1 → at most 2 flights)

```
 pop          │ decision                                  │ heap after
 ─────────────┼───────────────────────────────────────────┼─────────────────────────
 (0, 0, 0)    │ best[0]=0; push (1,1,1) (5,2,1)           │ (1,1,1) (5,2,1)
 (1, 1, 1)    │ best[1]=1; push (2,2,2)                   │ (2,2,2) (5,2,1)
 (2, 2, 2)    │ f = 2 = k+1 → can't fly on → skip         │ (5,2,1)
 (5, 2, 1)    │ 1 < best[2]=∞ → best[2]=1; push (6,3,2)   │ (6,3,2)
 (6, 3, 2)    │ node 3 is dst → return 6 ✅
```

### Alternative: K+1 rounds of edge relaxation (BFS by levels / Bellman-Ford)

```
   round 1 = best prices using ≤ 1 flight
   round 2 = best prices using ≤ 2 flights
   ...
   round k+1 → answer

   ⚠ Each round must read from a COPY of the previous round's prices,
     or one round could chain several flights together.

   Time O(K · E). Full trace and explanation in 06-Bellman-Ford.md.
```

### Pseudocode (stop-aware Dijkstra)

```
function findCheapestPrice(n, flights, src, dst, k):
    adj ← adjacency list (directed) from flights
    bestFlights ← array of n, all +∞
    heap ← [(0, src, 0)]
    while heap not empty:
        (c, u, f) ← pop min by cost
        if u == dst: return c
        if f == k + 1: continue
        if f ≥ bestFlights[u]: continue
        bestFlights[u] ← f
        for each (v, price) in adj[u]:
            push (c + price, v, f + 1)
    return −1
```

### Complexity

| Approach | Time | Notes |
|---|---|---|
| Plain Dijkstra | — | **wrong** ❌ |
| Stop-aware Dijkstra | O(E·K · log(E·K)) worst | usually much faster in practice |
| Bellman-Ford, K+1 rounds | **O(K·E)** | simplest to get right |
| BFS by levels with a price array | O(K·E) | same idea as Bellman-Ford |

### 📌 Points to remember
- `k` stops = **`k + 1` flights (edges)**. The #1 off-by-one.
- A cost-only `dist[]` **is not enough**. The state must include the stop count.
- Prune with "fewest flights popped so far" (pops come in cost order, so a later pop is never cheaper).
- If you're unsure, Bellman-Ford with K+1 rounds is the safest choice in an interview.

---

## 8. Master Cheat Sheet

### All 7 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────┬──────────────────────┬────────────────┐
│ Problem                  │ Cost / state                         │ Answer               │ Time           │
├──────────────────────────┼──────────────────────────────────────┼──────────────────────┼────────────────┤
│ Implement Dijkstra       │ d + w                                │ dist[] array         │ O(E log V)     │
│ Shortest Path Undirected │ unit → BFS; weighted → d + w, parent │ dist[] / path        │ O(V+E) / ElogV │
│ Network Delay Time       │ d + w (directed)                     │ max(dist) or −1      │ O(E log V)     │
│ Minimum Cost Path (grid) │ d + grid[v], 4 directions            │ dist[target]         │ O(n² log n)    │
│ Path With Minimum Effort │ max(d, |h[u] − h[v]|)                │ popped at target     │ O(RC log RC)   │
│ Swim in Rising Water     │ max(d, grid[v])                      │ popped at target     │ O(n² log n)    │
│ Cheapest Flights (K)     │ (cost, node, flights), prune by stops│ first dst pop or −1  │ O(K·E) via BF  │
└──────────────────────────┴──────────────────────────────────────┴──────────────────────┴────────────────┘
```

### Pattern family tree

```
                              DIJKSTRA
                                  │
     ┌────────────────┬───────────┴────────────┬─────────────────────┐
     │                │                        │                     │
  SUM COST        SUM ON GRID            MINIMAX COST          EXTRA STATE
  (d + w)         (d + grid[v])          (max(d, x))           (node, extra)
     │                │                        │                     │
  ├ Implement     └ Minimum Cost Path     ├ Min Effort          └ Cheapest Flights
  ├ Shortest Path                         └ Swim in Water          (K stops)
  └ Network Delay

  Related tools:
    all weights equal   → BFS             weights 0/1   → 0-1 BFS (deque)
    negative weights    → Bellman-Ford    all pairs     → Floyd-Warshall
```

### Which shortest-path tool?

```
   ┌────────────────────────────────┬───────────────────────────────┐
   │ Situation                      │ Use                           │
   ├────────────────────────────────┼───────────────────────────────┤
   │ unweighted / all weights equal │ BFS                    O(V+E) │
   │ weights 0 or 1                 │ 0-1 BFS (deque)        O(V+E) │
   │ non-negative weights           │ Dijkstra           O(E log V) │
   │ negative weights / ≤ K edges   │ Bellman-Ford           O(VE)  │
   │ all pairs, small V             │ Floyd-Warshall         O(V³)  │
   │ DAG (any weights)              │ topological order + relax     │
   └────────────────────────────────┴───────────────────────────────┘
```

### Optimization checklist

```
  ☐ Skip stale heap entries (d > dist[u])
  ☐ Early exit when the TARGET is POPPED (not pushed)
  ☐ All weights equal?               → BFS instead
  ☐ Cost is "worst step" or "max cell"? → max instead of +, same algorithm
  ☐ Grid?                            → neighbors on the fly, no adjacency list
  ☐ Extra constraint (stops, fuel)?  → add it to the state
  ☐ Dense graph (E ≈ V²)?            → O(V²) array version can beat the heap
```

### 🚩 Common bugs to avoid

```
  ✗ Using Dijkstra with negative weights
  ✗ Heap ordered by node instead of distance (put distance FIRST)
  ✗ Marking "visited" when PUSHED instead of when POPPED
  ✗ Undirected graph: adding the edge in one direction only
  ✗ Network Delay: summing distances instead of taking the max; 1-indexed nodes
  ✗ Minimum Cost Path: starting at 0 instead of grid[0][0]
  ✗ Minimum Effort: adding step costs instead of taking the max
  ✗ Cheapest Flights: k stops ≠ k flights; plain dist[] pruning
  ✗ Bellman-Ford rounds for Cheapest Flights without copying the previous array
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "Does extending a path EVER make its cost smaller?"          ║
   ║                                                              ║
   ║   NO  → Dijkstra works (the first pop is final).             ║
   ║   YES → negative edges → Bellman-Ford.                       ║
   ║   And: "Is one number per node enough to describe the state?"║
   ║   NO  → put the extra info (stops, fuel, ...) in the state.  ║
   ╚══════════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Implement Dijkstra (Easy)
- [ ] Shortest Path in Undirected Graph (Medium)
- [ ] Network Delay Time (Medium)
- [ ] Minimum Cost Path (Medium)
- [ ] Path With Minimum Effort (Medium)
- [ ] Swim in Rising Water (Hard)
- [ ] Cheapest Flights Within K Stops (Medium)
