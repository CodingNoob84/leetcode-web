# Bellman-Ford: A Visual Guide

> **Goal:** Understand *why* relaxing every edge V-1 times gives shortest paths, how one extra round exposes negative cycles, and when to choose Bellman-Ford over Dijkstra or Floyd-Warshall.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Related guides: [05-Dijkstra.md](05-Dijkstra.md) · [07-Floyd-Warshall.md](07-Floyd-Warshall.md)

---

## Table of Contents

0. [The Big Idea: What Is Bellman-Ford?](#0-the-big-idea-what-is-bellman-ford)
1. [Negative Weight Cycle (Medium)](#1-negative-weight-cycle-medium)
2. [Cheapest Flights Within K Stops (Medium)](#2-cheapest-flights-within-k-stops-medium)
3. [Find the City With the Smallest Number of Neighbors at a Threshold Distance (Medium)](#3-find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance-medium)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Negative Weight Cycle → Cheapest Flights Within K Stops → Find the City.
> The first teaches the core algorithm and the cycle check. The second limits the number of rounds. The third runs the algorithm from every node.

---

## 0. The Big Idea: What Is Bellman-Ford?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BELLMAN-FORD"                          │
├──────────────────────────────────────────────────────────────────┤
│  • Edge weights can be NEGATIVE                                  │
│  • "Detect a negative cycle"                                     │
│  • "Shortest path using AT MOST k edges / k stops"               │
│  • Input is a plain EDGE LIST  [u, v, w]                         │
│  • Single source, and V·E is small enough (≈ 10⁶–10⁷)            │
└──────────────────────────────────────────────────────────────────┘
```

### The one operation: RELAX an edge

```
        dist[u] = 3            w = 2          dist[v] = 10
          ( u ) ─────────────────────────────► ( v )

   "Is going THROUGH u a cheaper way to reach v?"

        if dist[u] + w < dist[v]:
            dist[v] ← dist[u] + w          3 + 2 = 5 < 10  →  dist[v] = 5 ✅
```

Dijkstra relaxes edges in a **smart order** (closest node first).
Bellman-Ford relaxes **every edge, again and again**, with no order at all. It is slower, but it is never fooled by negative weights.

### The whole algorithm

```
   dist[source] ← 0, every other dist ← ∞

   repeat V-1 times:                     ◄── "rounds"
       for each edge (u, v, w):
           relax(u, v, w)

   one more round:
       if ANY edge can still be relaxed  →  NEGATIVE CYCLE 🚨
```

### Why exactly V-1 rounds?

```
  A shortest path never repeats a node (if there is no negative cycle).
  With V nodes, a simple path has at most V-1 EDGES.

     s ──► a ──► b ──► c ──► t          5 nodes → at most 4 edges

  After round 1: every node whose best path has ≤ 1 edge is correct
  After round 2: every node whose best path has ≤ 2 edges is correct
     ...
  After round V-1: every best path (≤ V-1 edges) is correct  ✅

        round 1     round 2     round 3     round 4
     s ──► a  ─────► b  ───────► c  ───────► t
     ✓     ✓         ✓           ✓           ✓
          "the correct distances spread one edge further each round"
```

> 💡 Each round is **guaranteed** to fix at least one more edge of every shortest path.
> In practice it often fixes more, because a round can reuse values it updated earlier in the same round. The guarantee is only a lower bound.

### Trace: why multiple rounds are needed

```
   Graph (4 nodes, source = 0):

              4
      (0) ─────────► (1)
       │           ╱   │
     5 │     -3   ╱    │ 7
       ▼         ╱     ▼
      (2) ◄─────╯     (3)
       │               ▲
       └───────4───────┘

   edges: 0→1 = 4, 0→2 = 5, 1→2 = -3, 1→3 = 7, 2→3 = 4

   Edge list, in a deliberately BAD order:
      (2→3, 4)  (1→2, -3)  (0→2, 5)  (0→1, 4)  (1→3, 7)
```

```
  node        :    0     1     2     3
               ┌─────┬─────┬─────┬─────┐
  start       │  0  │  ∞  │  ∞  │  ∞  │
               ├─────┼─────┼─────┼─────┤
  round 1     │  0  │  4  │  5  │ 11  │   2→3 skip (∞), 1→2 skip (∞),
               │     │     │     │     │   0→2 = 5, 0→1 = 4, 1→3 = 4+7 = 11
               ├─────┼─────┼─────┼─────┤
  round 2     │  0  │  4  │  1  │  9  │   2→3: 5+4 = 9 < 11, 1→2: 4-3 = 1 < 5
               ├─────┼─────┼─────┼─────┤
  round 3     │  0  │  4  │  1  │  5  │   2→3: 1+4 = 5 < 9
               └─────┴─────┴─────┴─────┘
  round 4 (check): nothing changes → no negative cycle ✅

  Final: 0 → 1 → 2 → 3  =  4 − 3 + 4 = 5
```

Dist[3] needed **three rounds** because its best path has three edges and the edge order was unlucky.

### The V-th round: catching negative cycles

```
             -2
      (a) ───────► (b)
       ▲            │
       │ 1          │ -1          cycle sum = -2 - 1 + 1 = -2  < 0
       │            ▼
       └────────── (c)

   Each lap around the cycle makes every distance 2 cheaper.
   The distances NEVER settle → "shortest path" does not exist.

   After V-1 rounds, all real shortest paths are final.
   So if round V can STILL improve something → there must be a negative cycle.
```

### Early stop

```
   If a whole round makes ZERO changes, the next round would also make
   zero changes (same inputs → same result). Stop immediately.

   round 1: changed ✓   round 2: changed ✓   round 3: no change ✗  → STOP
```

> Early stop is the reason Bellman-Ford is often much faster than its O(V·E) worst case.

### The DP view (why this is really dynamic programming)

```
   dist_k[v] = cheapest cost to reach v using AT MOST k edges

   dist_k[v] = min( dist_{k-1}[v] ,                    ← use ≤ k-1 edges
                    min over edges (u→v, w):
                        dist_{k-1}[u] + w )            ← last edge is u→v

   dist_0  : [ 0, ∞, ∞, ∞ ]    only the source
   dist_1  : paths with ≤ 1 edge
   dist_2  : paths with ≤ 2 edges
     ...
   dist_V-1: all shortest paths
```

> ⚠️ The standard algorithm updates **in place**, so it may run ahead of `dist_k`.
> For "at most k edges" problems you must use the **strict** DP version (copy the array each round). See problem 2.

### Bellman-Ford vs Dijkstra vs Floyd-Warshall

```
┌────────────────────┬────────────────┬──────────────────┬──────────────────┐
│                    │ Bellman-Ford   │ Dijkstra         │ Floyd-Warshall   │
├────────────────────┼────────────────┼──────────────────┼──────────────────┤
│ Answers            │ single source  │ single source    │ ALL pairs        │
│ Negative edges     │ ✅ yes         │ ❌ no            │ ✅ yes           │
│ Detects neg. cycle │ ✅ round V     │ ❌ no            │ ✅ dist[i][i] < 0│
│ Limit # of edges   │ ✅ k rounds    │ needs extra state│ ❌ no            │
│ Time               │ O(V·E)         │ O((V+E) log V)   │ O(V³)            │
│ Space              │ O(V)           │ O(V+E)           │ O(V²)            │
│ Input              │ edge list      │ adjacency list   │ matrix           │
└────────────────────┴────────────────┴──────────────────┴──────────────────┘
```

### Bonus: SPFA (Shortest Path Faster Algorithm)

```
   Observation: an edge u→v can only improve v if dist[u] CHANGED recently.

   SPFA = Bellman-Ford with a QUEUE of "nodes whose dist just changed".
     • Pop u, relax only u's outgoing edges
     • Any node that improves goes into the queue (if not already there)

   Average: much faster.  Worst case: still O(V·E).
   Negative cycle: a node is pushed into the queue ≥ V times.
```

### Pseudocode (the core template)

```
function bellmanFord(V, edges, source):
    dist ← array of V, all ∞
    dist[source] ← 0
    repeat V-1 times:
        changed ← false
        for each (u, v, w) in edges:
            if dist[u] ≠ ∞ and dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
                changed ← true
        if not changed: break                    // early stop
    for each (u, v, w) in edges:                 // round V: the check
        if dist[u] ≠ ∞ and dist[u] + w < dist[v]:
            return "NEGATIVE CYCLE"
    return dist
```

> ⚠️ The `dist[u] ≠ ∞` guard matters. Without it, `∞ + (−5)` can look smaller than `∞`
> and an unreachable node would get a fake distance.

---

## 1. Negative Weight Cycle (Medium)

### Problem
*(GFG version, assumed definition)* Given `n` nodes `0..n-1` and a list of **directed** edges `[u, v, w]`, return **1** if the graph contains a negative-weight cycle anywhere, otherwise **0**. The graph may be **disconnected**.

### Visualize it

```
   Example A                          Example B

        -1                                 -1
   (0) ─────► (1)                     (0) ─────► (1)
    ▲          │                       ▲          │
    │ -3       │ -2                    │ +3       │ -2
    │          ▼                       │          ▼
    └──────── (2)                      └──────── (2)

   cycle = -1 - 2 - 3 = -6  🚨          cycle = -1 - 2 + 3 = 0
   answer = 1                          answer = 0  (zero is NOT negative)
```

### The trap: a single source can't see everything

```
   Source = 0

        2
   (0) ─────► (1)            (2) ⇄ (3)     edges 2→3 = -1, 3→2 = -1
                               └─────┘      cycle sum = -2 🚨

   From node 0, nodes 2 and 3 are unreachable → dist stays ∞
   → the ∞ guard skips every edge of the cycle
   → round V finds nothing → WRONG answer 0 ❌
```

### The fix: a virtual source (start every dist at 0)

```
                    ┌──── 0 ────► (0)
                    ├──── 0 ────► (1)
        ( S* ) ─────┼──── 0 ────► (2)        an imaginary node with a
                    └──── 0 ────► (3)        0-weight edge to EVERY node

   After S*'s first round, every dist = 0.
   So simply START with   dist = [0, 0, 0, ..., 0]   and skip S* entirely.

   Now every node is "reachable" → every cycle gets relaxed → found ✅
```

> 💡 The distances you get are no longer "real" shortest paths from one node.
> That doesn't matter: we only care **whether round V still improves something**.

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[v]` = shortest distance from the virtual source |
| Transition | relax every edge: `dist[v] = min(dist[v], dist[u] + w)` |
| Base | `dist[v] = 0` for **all** v |
| Order | n-1 rounds over the edge list, then 1 check round |
| Answer | check round improves anything → 1, else 0 |

### Trace: Example A (edges in order: 0→1 −1, 1→2 −2, 2→0 −3)

```
  node        :    0      1      2
               ┌──────┬──────┬──────┐
  start       │   0  │   0  │   0  │
               ├──────┼──────┼──────┤
  round 1     │  -6  │  -1  │  -3  │   0→1: 0-1 = -1
               │      │      │      │   1→2: -1-2 = -3
               │      │      │      │   2→0: -3-3 = -6
               ├──────┼──────┼──────┤
  round 2     │ -12  │  -7  │  -9  │   0→1: -6-1 = -7
               │      │      │      │   1→2: -7-2 = -9
               │      │      │      │   2→0: -9-3 = -12
               └──────┴──────┴──────┘
  n-1 = 2 rounds done.

  CHECK round: 0→1: -12 - 1 = -13 < -7  → still improving 🚨  → return 1 ✅

  Notice: the values keep dropping by 6 each round (the cycle weight).
          They would fall forever.
```

### Trace: Example B (edges: 0→1 −1, 1→2 −2, 2→0 +3)

```
  node        :    0      1      2
               ┌──────┬──────┬──────┐
  start       │   0  │   0  │   0  │
               ├──────┼──────┼──────┤
  round 1     │   0  │  -1  │  -3  │   0→1: -1,  1→2: -3,  2→0: -3+3 = 0 (not < 0)
               ├──────┼──────┼──────┤
  round 2     │   0  │  -1  │  -3  │   nothing improves → early stop
               └──────┴──────┴──────┘

  CHECK round: nothing improves → return 0 ✅
```

### Pseudocode

```
function isNegativeWeightCycle(n, edges):
    dist ← array of n, all 0                     // virtual source trick
    repeat n-1 times:
        changed ← false
        for each (u, v, w) in edges:
            if dist[u] + w < dist[v]:
                dist[v] ← dist[u] + w
                changed ← true
        if not changed: return 0                 // settled → no cycle
    for each (u, v, w) in edges:
        if dist[u] + w < dist[v]:
            return 1
    return 0
```

> No `∞` guard is needed, because nothing starts at ∞.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Bellman-Ford from every node | O(V² · E) | O(V) |
| **Virtual source (all zeros)** | **O(V · E)** | **O(V)** ✅ |
| Floyd-Warshall, check `dist[i][i] < 0` | O(V³) | O(V²) |

### 📌 Points to remember
- **Disconnected graph → start every dist at 0.** This is the whole trick.
- A cycle of total weight **exactly 0** is not negative.
- An **undirected** edge with negative weight is already a negative cycle (`u → v → u`).
- If a whole round changes nothing, you can stop early and answer 0.

---

## 2. Cheapest Flights Within K Stops (Medium)

### Problem
`n` cities and directed flights `[from, to, price]`. Find the cheapest price from `src` to `dst` using **at most `k` stops**. Return −1 if impossible.

### Visualize it

```
          ┌─────────── 100 (2→0) ───────────┐
          ▼                                 │
         (0) ───100───► (1) ───100───► (2) ─┘
                         │              │
                     600 │              │ 200
                         ▼              │
                        (3) ◄───────────┘

   flights: 0→1 100, 1→2 100, 2→0 100, 1→3 600, 2→3 200
   src = 0, dst = 3, k = 1

   0 → 1 → 3        = 700   (1 stop)   ✅ allowed
   0 → 1 → 2 → 3    = 400   (2 stops)  ❌ too many stops
```

### Stops → edges → rounds

```
   k stops  =  k+1 flights  =  k+1 EDGES

   Bellman-Ford DP view: after round i, dist = cheapest using ≤ i edges
   → run EXACTLY k+1 rounds, then read dist[dst]
```

### ⚠️ The big bug: in-place updates chain edges inside one round

```
   Round 1, IN PLACE (wrong):
     0→1: dist[1] = 100
     1→2: dist[1] is ALREADY 100 → dist[2] = 200      ← 2nd edge, same round!
     1→3: dist[3] = 700
     2→3: dist[2] is ALREADY 200 → dist[3] = 400      ← 3rd edge, same round!

   After 1 round we already used a 3-edge path → "≤ i edges" is broken.
   Final answer 400  ❌  (expected 700)
```

```
   THE FIX: each round reads from the OLD array and writes to a COPY.

        old dist (read only)            new dist (write)
       ┌─────┬─────┬─────┬─────┐       ┌─────┬─────┬─────┬─────┐
       │  0  │ 100 │  ∞  │  ∞  │  ───► │  0  │ 100 │ 200 │ 700 │
       └─────┴─────┴─────┴─────┘       └─────┴─────┴─────┴─────┘
        a value written this round can't be READ until next round
        → each round adds exactly ONE more edge
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[v]` after round i = cheapest price to v using ≤ i flights |
| Transition | `next[v] = min(next[v], dist[u] + price)` reading **old** dist |
| Base | `dist[src] = 0`, others ∞ |
| Order | exactly k+1 rounds, copying the array each round |
| Answer | `dist[dst]`, or −1 if still ∞ |

### Trace (with the copy, k = 1 → 2 rounds)

```
  node          :    0      1      2      3
                  ┌──────┬──────┬──────┬──────┐
  start          │   0  │   ∞  │   ∞  │   ∞  │
                  ├──────┼──────┼──────┼──────┤
  round 1        │   0  │  100 │   ∞  │   ∞  │   0→1: 0+100 = 100
  (≤ 1 flight)   │      │      │      │      │   1→2, 1→3, 2→0, 2→3: old source ∞ → skip
                  ├──────┼──────┼──────┼──────┤
  round 2        │   0  │  100 │  200 │  700 │   1→2: 100+100 = 200
  (≤ 2 flights)  │      │      │      │      │   1→3: 100+600 = 700
                  │      │      │      │      │   2→3: OLD dist[2] = ∞ → skip ✋
                  └──────┴──────┴──────┴──────┘

  answer = dist[3] = 700 ✅
  (A third round would allow 2 stops: 200 + 200 = 400.)
```

### Second example: k decides the answer

```
        100        100
   (0) ─────► (1) ─────► (2)          src = 0, dst = 2
    │                     ▲
    └─────────500─────────┘

   k = 0 → 1 round  → only the direct flight   → 500
   k = 1 → 2 rounds → 0 → 1 → 2 = 200 becomes allowed → 200
```

### Pseudocode

```
function findCheapestPrice(n, flights, src, dst, k):
    dist ← array of n, all ∞
    dist[src] ← 0
    repeat k+1 times:
        next ← copy of dist                      // ⚠ the critical line
        for each (u, v, price) in flights:
            if dist[u] ≠ ∞ and dist[u] + price < next[v]:
                next[v] ← dist[u] + price        // read OLD, write NEW
        dist ← next
    return dist[dst] if dist[dst] ≠ ∞ else −1
```

### Why not plain Dijkstra?

```
   Dijkstra finalizes a node the FIRST time it pops, by cheapest cost.
   But the cheapest way to reach a city may use too many stops,
   and a pricier way with fewer stops might be the only one that fits.

   Plain Dijkstra keeps only one value per city → it throws the
   pricier-but-shorter route away.

   Dijkstra CAN work if the state is (city, stops used) instead of
   just city. See 05-Dijkstra.md for that version.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| DFS over all routes | exponential | O(n) |
| **Bellman-Ford, k+1 rounds** | **O(k · E)** | **O(n)** ✅ |
| BFS by levels (stops) with pruning | O(k · E) | O(n + E) |
| Dijkstra on (city, stops) | O(E·k · log(E·k)) | O(n·k) |

### 📌 Points to remember
- **k stops = k+1 edges = k+1 rounds.** Off-by-one here is the most common bug.
- **Copy the array every round.** In-place updates break the edge limit.
- Read from the old array, write to the new one. Never read what you just wrote.
- Early stop still works: if a round changes nothing, later rounds won't either.

---

## 3. Find the City With the Smallest Number of Neighbors at a Threshold Distance (Medium)

### Problem
`n` cities, **undirected** weighted edges `[a, b, w]`, and a `distanceThreshold`.
For each city, count how many **other** cities are reachable with total distance ≤ threshold.
Return the city with the **smallest** count. On a tie, return the city with the **largest index**.

### Visualize it

```
              3
       (0) ───────── (1)
                    ╱    ╲
                 1 ╱      ╲ 4
                  ╱        ╲
               (2) ──────── (3)
                      1

   edges: 0-1 = 3, 1-2 = 1, 1-3 = 4, 2-3 = 1      threshold = 4
```

### The plan: shortest paths from EVERY city

```
   for each city c:
       compute shortest distances from c       ← Bellman-Ford (or Dijkstra)
       count = number of other cities with dist ≤ threshold

   pick the city with the smallest count (ties → largest index)

   ┌──────────────────────────────────────────────────────────────┐
   │ "From EVERY city" = all-pairs shortest paths.                │
   │ Floyd-Warshall is the natural fit here → 07-Floyd-Warshall.md│
   │ This guide shows the Bellman-Ford way, so you see both.      │
   └──────────────────────────────────────────────────────────────┘
```

### Undirected → two directed edges

```
   a ──w── b      becomes      a ──w──► b   and   b ──w──► a

   (Weights here are positive, so this does NOT create negative cycles.)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dist[v]` = shortest distance from the current city to v |
| Transition | relax every edge in both directions |
| Base | `dist[city] = 0`, others ∞ |
| Order | for each city: up to n-1 rounds with early stop |
| Answer | city with min count of `dist ≤ threshold`; tie → larger index |

### Trace: Bellman-Ford from city 0

Edge list processed in order, each edge in both directions:

```
  node        :    0     1     2     3
               ┌─────┬─────┬─────┬─────┐
  start       │  0  │  ∞  │  ∞  │  ∞  │
               ├─────┼─────┼─────┼─────┤
  round 1     │  0  │  3  │  4  │  5  │   0→1: 3
               │     │     │     │     │   1→2: 3+1 = 4
               │     │     │     │     │   1→3: 3+4 = 7
               │     │     │     │     │   2→3: 4+1 = 5 < 7 → 5
               ├─────┼─────┼─────┼─────┤
  round 2     │  0  │  3  │  4  │  5  │   no change → early stop
               └─────┴─────┴─────┴─────┘

  ≤ 4 from city 0:  city 1 (3), city 2 (4)  → count = 2
```

### All cities (same process from each source)

```
  from \ to     0     1     2     3      reachable (≤ 4)      count
              ┌─────┬─────┬─────┬─────┐
     0        │  0  │  3  │  4  │  5  │   {1, 2}                 2
     1        │  3  │  0  │  1  │  2  │   {0, 2, 3}              3
     2        │  4  │  1  │  0  │  1  │   {0, 1, 3}              3
     3        │  5  │  2  │  1  │  0  │   {1, 2}                 2
              └─────┴─────┴─────┴─────┘

   smallest count = 2 → cities 0 and 3 tie → pick the LARGER index → 3 ✅
```

> Note the path 1 → 3: the direct edge costs 4, but 1 → 2 → 3 costs only 2.

### Pseudocode

```
function findTheCity(n, edges, threshold):
    directed ← empty list
    for each (a, b, w) in edges:
        add (a, b, w) and (b, a, w) to directed

    bestCity ← -1, bestCount ← +∞
    for city from 0 to n-1:
        dist ← bellmanFord(n, directed, city)    // core template, early stop
        count ← number of v ≠ city with dist[v] ≤ threshold
        if count ≤ bestCount:                    // "≤" makes ties pick the larger index
            bestCount ← count
            bestCity  ← city
    return bestCity
```

> 💡 Looping cities in increasing order and using `≤` handles the tie rule for free:
> a later (larger) city with an equal count overwrites the earlier one.

### Complexity

| Approach | Time | Space | Notes |
|---|---|---|---|
| Bellman-Ford from each city | O(V² · E) | O(V + E) | fine for small n |
| Dijkstra from each city | O(V · (V+E) log V) | O(V + E) | weights are positive |
| **Floyd-Warshall** | **O(V³)** | **O(V²)** | simplest, n ≤ 100 ✅ |

### 📌 Points to remember
- "From every node" → think **all-pairs**: Floyd-Warshall first.
- Undirected graph → add **both** directions.
- Don't count the city itself.
- Tie → **largest index**. Use `≤` while scanning in increasing order.
- The threshold check is `≤`, not `<`.

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────────┬─────────────────────┬──────────────┐
│ Problem                  │ Core idea                                │ Answer              │ Time         │
├──────────────────────────┼──────────────────────────────────────────┼─────────────────────┼──────────────┤
│ Negative Weight Cycle    │ all dist = 0, V-1 rounds, check round V  │ round V improves?   │ O(V·E)       │
│ Cheapest Flights K Stops │ exactly k+1 rounds, COPY array each round│ dist[dst] or -1     │ O(k·E)       │
│ Find the City            │ shortest paths from every city, count    │ min count, tie →    │ O(V²·E) BF / │
│                          │ ≤ threshold                              │ largest index       │ O(V³) FW     │
└──────────────────────────┴──────────────────────────────────────────┴─────────────────────┴──────────────┘
```

### Pattern family tree

```
                               BELLMAN-FORD
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
  NEGATIVE CYCLE              LIMITED EDGES               SHORTEST PATHS
  (round V still              (k rounds, copy             (from one or
   improves)                   the array)                  many sources)
        │                           │                           │
  └ Negative Weight Cycle     └ Cheapest Flights        └ Find the City
                                 Within K Stops             (or Floyd-Warshall)
```

### The two versions of a round

```
   IN-PLACE round (standard)              COPY round (edge-limited)
   ─────────────────────────              ─────────────────────────
   read & write the same array            read OLD array, write NEW array
   may use MANY edges per round           uses EXACTLY ≤ 1 more edge per round
   converges faster                       needed for "at most k edges/stops"
   use for: plain shortest path,          use for: Cheapest Flights,
            negative-cycle check                   any "≤ k edges" question
```

### Which algorithm?

```
   Negative edges?
     ├── no  ──► single source?  ──► Dijkstra
     │                └── all pairs, small V ──► Floyd-Warshall
     └── yes ──► single source / cycle check / ≤ k edges ──► Bellman-Ford
                  └── all pairs, small V ──► Floyd-Warshall
```

### Optimization checklist

```
  ☐ A full round changed nothing?            → stop early
  ☐ Graph may be disconnected (cycle check)? → start every dist at 0
  ☐ "At most k edges / stops"?               → exactly k+1 (or k) rounds + copy array
  ☐ Many relaxations wasted?                 → SPFA (queue of changed nodes)
  ☐ No negative edges at all?                → switch to Dijkstra
  ☐ Need every pair, V ≤ ~400?               → Floyd-Warshall
```

### 🚩 Common bugs to avoid

```
  ✗ Missing the dist[u] ≠ ∞ guard → unreachable nodes get fake distances
  ✗ Negative cycle check from ONE source → misses cycles in other components
  ✗ Treating a zero-weight cycle as negative
  ✗ Cheapest Flights: updating in place → one round chains several flights
  ✗ Cheapest Flights: running k rounds instead of k+1
  ✗ Find the City: forgetting the reverse edge, counting the city itself,
    or breaking ties toward the SMALLER index
  ✗ Undirected graph + a negative edge: that edge alone is a negative cycle
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "After round i, which paths are guaranteed correct,     ║
   ║   and do I need EXACTLY that guarantee or just the end?" ║
   ╚══════════════════════════════════════════════════════════╝
     Just the end → in-place rounds. Exactly ≤ i edges → copy the array.
```

---

### ✅ Progress tracker

- [ ] Negative Weight Cycle (Medium)
- [ ] Cheapest Flights Within K Stops (Medium)
- [ ] Find the City With the Smallest Number of Neighbors at a Threshold Distance (Medium)
