# BFS Pattern: A Visual Guide

> **Goal:** Learn to *see* BFS problems, run the queue by hand, and spot when to start from many sources at once.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is BFS?](#0-the-big-idea-what-is-bfs)
1. [Keys and Rooms (Medium)](#1-keys-and-rooms-medium)
2. [Shortest Path in Binary Matrix (Medium)](#2-shortest-path-in-binary-matrix-medium)
3. [Rotting Oranges (Medium)](#3-rotting-oranges-medium)
4. [Walls and Gates (Medium)](#4-walls-and-gates-medium)
5. [01 Matrix (Medium)](#5-01-matrix-medium)
6. [Snakes and Ladders (Medium)](#6-snakes-and-ladders-medium)
7. [Word Ladder (Hard)](#7-word-ladder-hard)
8. [Minimum Height Trees (Medium)](#8-minimum-height-trees-medium)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** Keys and Rooms → Shortest Path in Binary Matrix → Rotting Oranges → Walls and Gates
> → 01 Matrix → Snakes and Ladders → Word Ladder → Minimum Height Trees.
> Plain reachability first, then shortest path, then many sources, then graphs you have to build yourself.

---

## 0. The Big Idea: What Is BFS?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BFS"                                   │
├──────────────────────────────────────────────────────────────────┤
│  • "SHORTEST path / MINIMUM number of steps / moves / minutes"   │
│  • Every move costs the SAME (unweighted graph or grid)          │
│  • "Level by level", "spreads every minute", "nearest X"         │
│  • MANY starting points spreading at once (rot, fire, gates)     │
│  • States you can turn into nodes: words, board squares, locks   │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: ripples in a pond

```
   Drop a stone at S. The ripple reaches every cell at distance 1,
   then every cell at distance 2, and so on.

              3
           3  2  3
        3  2  1  2  3
     3  2  1  S  1  2  3        ← wave 0 = S
        3  2  1  2  3             wave 1 = all "1"s
           3  2  3                wave 2 = all "2"s
              3                   ...

   The FIRST time the ripple touches a cell = its SHORTEST distance.
```

### Why BFS gives the shortest path (unweighted graphs only)

```
   The queue always holds nodes in order of distance:

     front ─► [ d, d, d, d+1, d+1 ] ◄─ back

   • Every node at distance d is taken out before any node at d+1.
   • So when a node is reached for the first time, no shorter way exists.

   ⚠ Only true when every edge has the SAME cost.
     Different weights → Dijkstra.  Weights 0 or 1 → 0-1 BFS (deque).
```

### The template: mark visited on ENQUEUE

```
function bfs(start):
    queue ← [start]
    visited ← {start}               // mark when you ADD, not when you POP
    dist[start] ← 0
    while queue not empty:
        node ← pop front of queue
        for each neighbor of node:
            if neighbor not in visited:
                visited.add(neighbor)   ← here!
                dist[neighbor] ← dist[node] + 1
                push neighbor to queue
```

```
  Why mark on ENQUEUE?

      A ── B
      │    │        Mark on POP: D gets pushed by B AND by C → duplicates,
      C ── D        and in big grids the queue can blow up.

      Mark on PUSH: D is pushed once, by whichever node reaches it first.
```

### Level-by-level loop (when you need "which level am I on?")

```
function bfsLevels(start):
    queue ← [start], visited ← {start}
    level ← 0
    while queue not empty:
        size ← length(queue)          // SNAPSHOT: exactly this level's nodes
        repeat size times:
            node ← pop front
            for each unvisited neighbor:
                mark visited, push it
        level ← level + 1             // finished one full ring
```

```
   queue:  [ A ]            ← level 0, size = 1
           [ B  C ]         ← level 1, size = 2
           [ D  E  F ]      ← level 2, size = 3

   The snapshot "size" draws the line between rings.
```

### Multi-source BFS: many stones dropped at once

```
   Put ALL sources in the queue at distance 0 before starting.

     S . . . S            Each cell gets the distance to its
     . . . . .            NEAREST source, in one pass.
     . . S . .
                          Running one BFS per source = O(k · V).
                          One multi-source BFS       = O(V).  ✅

   Think of it as a "super source" connected to every real source:

            [super]
           /   |   \
          S1   S2   S3   → then normal BFS
```

### BFS vs DFS

| | BFS (queue) | DFS (stack / recursion) |
|---|---|---|
| Explores | ring by ring | one branch to the end, then backs up |
| Shortest path (unweighted) | ✅ yes | ❌ no |
| Memory | widest level | deepest path |
| Good for | min steps, nearest, spreading | components, cycles, all paths, backtracking |
| Grid flood fill | ✅ works | ✅ works |
| Risk | big queue on wide graphs | stack overflow on deep graphs |

> 💡 **Key insight:** "minimum number of steps" + "every step costs 1" → **BFS**. Always.

---

## 1. Keys and Rooms (Medium)

### Problem
`n` rooms, all locked except room 0. Room `i` contains keys `rooms[i]` (room numbers).
Can you visit **every** room?

### Visualize it

```
   rooms = [[1,3], [3,0,1], [2], [0]]

      ┌───────┐  key 1   ┌───────┐
      │ Room 0│ ───────► │ Room 1│
      └───────┘          └───────┘
        │  ▲  key 3        │  key 3, 0, 1
        │  │               ▼
        │  └────────── ┌───────┐
        └────────────► │ Room 3│      ┌───────┐
              key 3    └───────┘      │ Room 2│ ← nobody has key 2!
                                      └───────┘
```

### The idea: it is plain reachability

```
   Rooms = nodes.  Keys = directed edges.
   Question = "Is every node reachable from node 0?"

   → BFS (or DFS) from 0, then check: visited count == n ?
```

### The 5 steps

| Step | Answer |
|------|--------|
| Graph | node = room, edge `i → k` for each key `k` in room `i` |
| Start | room 0 |
| Visit | push every key's room that is not yet visited |
| Stop | queue empty |
| Answer | `visitedCount == n` |

### Trace

```
  step │ pop │ keys found │ new rooms pushed │ queue   │ visited
  ─────┼─────┼────────────┼──────────────────┼─────────┼──────────
  init │  —  │     —      │        —         │ [0]     │ {0}
   1   │  0  │ 1, 3       │ 1, 3             │ [1, 3]  │ {0,1,3}
   2   │  1  │ 3, 0, 1    │ (all visited)    │ [3]     │ {0,1,3}
   3   │  3  │ 0          │ (visited)        │ []      │ {0,1,3}

  visited = 3 rooms, n = 4  →  false ✅  (room 2 is never opened)
```

### Pseudocode

```
function canVisitAllRooms(rooms):
    visited ← {0}
    queue   ← [0]
    while queue not empty:
        room ← pop front
        for each key in rooms[room]:
            if key not in visited:
                visited.add(key)
                push key
    return size(visited) == n
```

### 📌 Points to remember
- No shortest path is needed, so DFS works just as well. BFS is shown here as the warm-up template.
- Keys are **directed** edges: a key in room 1 for room 0 doesn't mean room 0 has a key for room 1.
- Time O(V + E): every room once, every key once.

---

## 2. Shortest Path in Binary Matrix (Medium)

### Problem
`n × n` grid of `0` (open) and `1` (blocked). Go from top-left to bottom-right through `0`s,
moving in **8 directions**. Return the path length in **cells** (start and end included), or `-1`.

### Visualize it

```
       ┌───┬───┬───┐
       │ S │ 0 │ 0 │
       ├───┼───┼───┤          8 moves from any cell:
       │ 1 │ 1 │ 0 │
       ├───┼───┼───┤              ↖  ↑  ↗
       │ 1 │ 1 │ E │              ←  ●  →
       └───┴───┴───┘              ↙  ↓  ↘
```

### Why BFS

```
   Every move costs 1, and we want the FEWEST moves → BFS.
   dist(start) = 1, because the length counts cells, not moves.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Node | a cell `(r, c)` with value 0 |
| Edges | the 8 neighbors that are inside the grid and 0 |
| Start | `(0,0)` with distance 1 (if it is 0) |
| Stop | when `(n-1, n-1)` is popped |
| Answer | its distance, or `-1` if never reached |

### Trace: the distance grid fills wave by wave

```
  grid                 wave 1          wave 2          wave 3          wave 4
 ┌───┬───┬───┐       ┌───┬───┬───┐   ┌───┬───┬───┐   ┌───┬───┬───┐   ┌───┬───┬───┐
 │ 0 │ 0 │ 0 │       │ 1 │   │   │   │ 1 │ 2 │   │   │ 1 │ 2 │ 3 │   │ 1 │ 2 │ 3 │
 ├───┼───┼───┤       ├───┼───┼───┤   ├───┼───┼───┤   ├───┼───┼───┤   ├───┼───┼───┤
 │ 1 │ 1 │ 0 │  ──►  │ # │ # │   │   │ # │ # │   │   │ # │ # │ 3 │   │ # │ # │ 3 │
 ├───┼───┼───┤       ├───┼───┼───┤   ├───┼───┼───┤   ├───┼───┼───┤   ├───┼───┼───┤
 │ 1 │ 1 │ 0 │       │ # │ # │   │   │ # │ # │   │   │ # │ # │   │   │ # │ # │ 4 │
 └───┴───┴───┘       └───┴───┴───┘   └───┴───┴───┘   └───┴───┴───┘   └───┴───┴───┘

  queue per level:
    level 1: [(0,0)]
    level 2: [(0,1)]                (1,0),(1,1) blocked
    level 3: [(0,2), (1,2)]         (1,2) is a DIAGONAL step from (0,1)
    level 4: [(2,2)]                ← target  →  answer 4 ✅
```

### Pseudocode

```
function shortestPathBinaryMatrix(grid):
    if grid[0][0] == 1 or grid[n-1][n-1] == 1: return -1
    queue ← [(0, 0)], mark (0,0) visited, dist ← 1
    while queue not empty:
        size ← length(queue)
        repeat size times:
            (r, c) ← pop front
            if (r, c) == (n-1, n-1): return dist
            for each (dr, dc) in the 8 directions:
                nr ← r+dr, nc ← c+dc
                if inside grid and grid[nr][nc] == 0 and not visited:
                    mark visited, push (nr, nc)
        dist ← dist + 1
    return -1
```

### 📌 Points to remember
- **Check start and end first.** If either is blocked → `-1`.
- 8 directions, not 4. The diagonal steps are the whole trick.
- Length counts **cells**: a 1 × 1 grid `[[0]]` → answer 1.
- You may mark visited by writing `1` into the grid (if you're allowed to change the input).
- Faster on big grids: A* with the Chebyshev distance `max(|dr|, |dc|)` as the estimate.

---

## 3. Rotting Oranges (Medium)

### Problem
Grid: `0` empty, `1` fresh orange, `2` rotten orange. Every minute, each rotten orange rots its
**4-direction** fresh neighbors. Return the minutes until no fresh orange is left, or `-1` if impossible.

### Visualize it

```
   minute 0          minute 1          minute 2          minute 3          minute 4
  ┌───┬───┬───┐    ┌───┬───┬───┐    ┌───┬───┬───┐    ┌───┬───┬───┐    ┌───┬───┬───┐
  │ ☠ │ 🍊│ 🍊│    │ ☠ │ ☠ │ 🍊│    │ ☠ │ ☠ │ ☠ │    │ ☠ │ ☠ │ ☠ │    │ ☠ │ ☠ │ ☠ │
  ├───┼───┼───┤    ├───┼───┼───┤    ├───┼───┼───┤    ├───┼───┼───┤    ├───┼───┼───┤
  │ 🍊│ 🍊│   │ ─► │ ☠ │ 🍊│   │ ─► │ ☠ │ ☠ │   │ ─► │ ☠ │ ☠ │   │ ─► │ ☠ │ ☠ │   │
  ├───┼───┼───┤    ├───┼───┼───┤    ├───┼───┼───┤    ├───┼───┼───┤    ├───┼───┼───┤
  │   │ 🍊│ 🍊│    │   │ 🍊│ 🍊│    │   │ 🍊│ 🍊│    │   │ ☠ │ 🍊│    │   │ ☠ │ ☠ │
  └───┴───┴───┘    └───┴───┴───┘    └───┴───┴───┘    └───┴───┴───┘    └───┴───┴───┘
```

### The idea: multi-source BFS, one level = one minute

```
   • All rotten oranges start in the queue together (minute 0).
   • Each BFS LEVEL = one minute of spreading.
   • Count fresh oranges first. Each time one rots, fresh − 1.
   • End: fresh == 0 → return minutes.  fresh > 0 → −1 (some are cut off).
```

### The 5 steps

| Step | Answer |
|------|--------|
| Sources | every cell with value 2 |
| Edges | 4 neighbors that are fresh (1) |
| Level | one minute |
| Track | `fresh` counter |
| Answer | minutes used, or `-1` if `fresh > 0` at the end |

### Trace (grid = [[2,1,1],[1,1,0],[0,1,1]])

```
  rot time of each cell:
  ┌───┬───┬───┐
  │ 0 │ 1 │ 2 │
  ├───┼───┼───┤
  │ 1 │ 2 │ · │      · = empty
  ├───┼───┼───┤
  │ · │ 3 │ 4 │
  └───┴───┴───┘

  minute │ queue at start of minute  │ newly rotten     │ fresh left
  ───────┼───────────────────────────┼──────────────────┼───────────
    —    │ [(0,0)]                   │ —                │ 6
    1    │ [(0,0)]                   │ (0,1), (1,0)     │ 4
    2    │ [(0,1), (1,0)]            │ (0,2), (1,1)     │ 2
    3    │ [(0,2), (1,1)]            │ (2,1)            │ 1
    4    │ [(2,1)]                   │ (2,2)            │ 0

  fresh = 0  →  answer 4 ✅
```

### The `-1` case

```
   [[2,1,1],          ┌───┬───┬───┐
    [0,1,1],          │ ☠ │ 🍊│ 🍊│
    [1,0,1]]          ├───┼───┼───┤
                      │   │ 🍊│ 🍊│
                      ├───┼───┼───┤
                      │ 🍊│   │ 🍊│  ← (2,0) has no neighbor that can rot it
                      └───┴───┴───┘
                      fresh stays 1  →  −1
```

### Pseudocode

```
function orangesRotting(grid):
    queue ← all cells with value 2
    fresh ← count of cells with value 1
    minutes ← 0
    while queue not empty and fresh > 0:
        size ← length(queue)
        repeat size times:
            (r, c) ← pop front
            for each 4-neighbor (nr, nc) with grid[nr][nc] == 1:
                grid[nr][nc] ← 2            // mark on enqueue
                fresh ← fresh − 1
                push (nr, nc)
        minutes ← minutes + 1
    return (fresh == 0) ? minutes : −1
```

### 📌 Points to remember
- Loop condition `fresh > 0` stops you from counting one extra empty minute at the end.
- No fresh oranges at the start → answer **0** (even if there is no rotten one).
- One BFS from all rotten oranges, **not** one BFS per rotten orange.

---

## 4. Walls and Gates (Medium)

### Problem (LeetCode premium)
Grid values: `-1` = wall, `0` = gate, `INF = 2³¹ − 1` = empty room.
Fill every empty room with the distance to its **nearest gate** (4 directions). Leave unreachable rooms as `INF`.

### Visualize it

```
   input                          output
  ┌─────┬─────┬─────┬─────┐      ┌─────┬─────┬─────┬─────┐
  │ INF │  ▓  │ 🚪  │ INF │      │  3  │  ▓  │  0  │  1  │
  ├─────┼─────┼─────┼─────┤      ├─────┼─────┼─────┼─────┤
  │ INF │ INF │ INF │  ▓  │  ──► │  2  │  2  │  1  │  ▓  │
  ├─────┼─────┼─────┼─────┤      ├─────┼─────┼─────┼─────┤
  │ INF │  ▓  │ INF │  ▓  │      │  1  │  ▓  │  2  │  ▓  │
  ├─────┼─────┼─────┼─────┤      ├─────┼─────┼─────┼─────┤
  │ 🚪  │  ▓  │ INF │ INF │      │  0  │  ▓  │  3  │  4  │
  └─────┴─────┴─────┴─────┘      └─────┴─────┴─────┴─────┘
   ▓ = wall (-1),  🚪 = gate (0)
```

### Flip the direction

```
   ❌ "From every room, search for a gate"   → one BFS per room: O((mn)²)
   ✅ "From ALL gates at once, spread out"   → one multi-source BFS: O(mn)

   A room's first visit comes from its nearest gate, so that value is final.
```

### Trace (waves)

```
  dist │ cells reached in this wave
  ─────┼─────────────────────────────────────────────────────────
   0   │ gates (0,2), (3,0)
   1   │ (0,3), (1,2)        from (0,2)
       │ (2,0)               from (3,0)
   2   │ (1,1), (2,2)        from (1,2)
       │ (1,0)               from (2,0)
   3   │ (3,2)               from (2,2)
       │ (0,0)               from (1,0)
   4   │ (3,3)               from (3,2)

  Matches the output grid above ✅
```

### Pseudocode

```
function wallsAndGates(rooms):
    queue ← all cells with value 0
    while queue not empty:
        (r, c) ← pop front
        for each 4-neighbor (nr, nc):
            if inside and rooms[nr][nc] == INF:      // INF also means "not visited"
                rooms[nr][nc] ← rooms[r][c] + 1
                push (nr, nc)
```

### 📌 Points to remember
- `INF` doubles as the "unvisited" marker. Once a room gets a number, it is never changed again.
- No level loop needed: the distance is stored in the cell itself.
- This is the template for any "distance to the nearest X" grid problem.

---

## 5. 01 Matrix (Medium)

### Problem
Binary matrix. For every cell, return the distance to the **nearest 0** (4 directions).

### Visualize it

```
   input            output
  ┌───┬───┬───┐    ┌───┬───┬───┐
  │ 0 │ 0 │ 0 │    │ 0 │ 0 │ 0 │
  ├───┼───┼───┤    ├───┼───┼───┤
  │ 0 │ 1 │ 0 │ ─► │ 0 │ 1 │ 0 │
  ├───┼───┼───┤    ├───┼───┼───┤
  │ 1 │ 1 │ 1 │    │ 1 │ 2 │ 1 │
  └───┴───┴───┘    └───┴───┴───┘
```

### Same as Walls and Gates

```
     Walls and Gates               01 Matrix
     sources = gates (0)    ──►    sources = cells with 0
     targets = INF rooms           targets = cells with 1
     walls   = -1                  no walls
```

### Trace (waves)

```
  start: dist = 0 for every 0-cell, dist = ∞ for every 1-cell

  queue level 0: (0,0) (0,1) (0,2) (1,0) (1,2)

   wave 1                       wave 2
  ┌───┬───┬───┐               ┌───┬───┬───┐
  │ 0 │ 0 │ 0 │               │ 0 │ 0 │ 0 │
  ├───┼───┼───┤               ├───┼───┼───┤
  │ 0 │ 1 │ 0 │   (1,1) from  │ 0 │ 1 │ 0 │
  ├───┼───┼───┤   (0,1)       ├───┼───┼───┤
  │ 1 │ ∞ │ 1 │   (2,0),(2,2) │ 1 │ 2 │ 1 │   (2,1) from (1,1) ✅
  └───┴───┴───┘               └───┴───┴───┘
```

### Pseudocode

```
function updateMatrix(mat):
    dist ← m × n table of ∞
    queue ← empty
    for every cell (r, c) with mat[r][c] == 0:
        dist[r][c] ← 0, push (r, c)
    while queue not empty:
        (r, c) ← pop front
        for each 4-neighbor (nr, nc):
            if dist[nr][nc] > dist[r][c] + 1:
                dist[nr][nc] ← dist[r][c] + 1
                push (nr, nc)
    return dist
```

### Alternative: two DP passes (links to grid DP)

```
  Pass 1 (top-left → bottom-right):   dist = min(dist, up + 1, left + 1)
  Pass 2 (bottom-right → top-left):   dist = min(dist, down + 1, right + 1)

  Same O(mn) time, no queue. Works because a shortest 4-direction path
  can be split into a part from above/left and a part from below/right.
```

### 📌 Points to remember
- **Don't** BFS from every 1 to find a 0. Start from **all the 0s**.
- Multi-source BFS = one pass, O(m·n).
- In the pseudocode, `dist > dist + 1` acts as the visited check.

---

## 6. Snakes and Ladders (Medium)

### Problem
`n × n` board labeled `1` to `n²` in a **zig-zag** (boustrophedon) order starting from the bottom-left.
From square `s` you roll a die and move to `s+1 … s+6`. If that square has a ladder or snake
(`board ≠ -1`), you **must** go to its destination. Find the fewest rolls to reach `n²`, or `-1`.

### The label → cell mapping (the tricky part)

```
   6 × 6 board labels:

   r=0 │ 36  35  34  33  32  31 │  ← right-to-left
   r=1 │ 25  26  27  28  29  30 │  ← left-to-right
   r=2 │ 24  23  22  21  20  19 │  ← right-to-left
   r=3 │ 13  14  15  16  17  18 │  ← left-to-right
   r=4 │ 12  11  10   9   8   7 │  ← right-to-left
   r=5 │  1   2   3   4   5   6 │  ← left-to-right (start here)
        c=0  1   2   3   4   5

   For label s:
       q   ← (s − 1) / n          // which row from the bottom
       rem ← (s − 1) % n
       row ← n − 1 − q
       col ← (q is even) ? rem : n − 1 − rem

   Check: s = 14 → q=2, rem=1 → row 3, col 1 ✓
          s = 17 → q=2, rem=4 → row 3, col 4 ✓
```

### Example board

```
   board[5][1] = 15   → square  2 has a LADDER to 15
   board[3][1] = 35   → square 14 has a LADDER to 35
   board[3][4] = 13   → square 17 has a SNAKE  to 13
   all other cells = -1
```

### Trace (BFS over square numbers)

```
  roll │ squares first reached on this roll
  ─────┼──────────────────────────────────────────────────────────
   0   │ 1
   1   │ 2→15 (ladder), 3, 4, 5, 6, 7
   2   │ from 15:    16, 17→13 (snake), 18, 19, 20, 21
       │ from 3..7:  8, 9, 10, 11, 12   (13 already reached via the snake)
   3   │ from 8..13: 14→35 (ladder), ...
       │ from 16..21: 22 … 27
   4   │ from 35: 36  ← TARGET  →  answer 4 ✅

  One shortest route:  1 →(2⇒15) → (17⇒13) → (14⇒35) → 36
```

### Pseudocode

```
function snakesAndLadders(board):
    target ← n * n
    visited ← {1}, queue ← [1], rolls ← 0
    while queue not empty:
        size ← length(queue)
        repeat size times:
            s ← pop front
            if s == target: return rolls
            for d from 1 to 6:
                next ← s + d
                if next > target: break
                (r, c) ← labelToCell(next)
                if board[r][c] ≠ -1: next ← board[r][c]   // forced jump
                if next not in visited:
                    visited.add(next), push next
        rolls ← rolls + 1
    return -1
```

### 📌 Points to remember
- Mark visited on the square you **land on after** the jump, not the square you rolled to.
- You take only **one** ladder/snake per roll. If its destination also has a ladder, you don't take that one in the same move.
- Write `labelToCell` first and test it on square 1, `n`, `n+1`, and `n²`.
- The board is just a graph with up to 6 edges per node, so BFS gives the fewest rolls.

---

## 7. Word Ladder (Hard)

### Problem
Transform `beginWord` into `endWord`, changing **one letter** at a time. Every middle word must be in
`wordList`. Return the number of **words** in the shortest sequence, or 0.

### Visualize it

```
   hit → hot → dot → dog → cog          5 words ✅
                ╲         ↗
                 lot → log

   Each word is a node. Two words are connected if they differ by one letter.
```

### How to find neighbors quickly

```
   Option A: 26-letter swap
     For each position, try 'a'..'z', look it up in a word SET.
     Cost per word: L × 26 lookups.

   Option B: wildcard buckets
     "hot" belongs to buckets  *ot,  h*t,  ho*
     Words in the same bucket are neighbors.

       h*t → [hot]           *ot → [hot, dot, lot]
       do* → [dot, dog]      lo* → [lot, log]
       *og → [dog, log, cog] ...
```

### Trace (BFS by level)

```
  level │ queue               │ how they were found
  ──────┼─────────────────────┼─────────────────────────────
    1   │ [hit]               │ start
    2   │ [hot]               │ h*t
    3   │ [dot, lot]          │ *ot
    4   │ [dog, log]          │ do*, lo*
    5   │ [cog]               │ *og  ← endWord  →  answer 5 ✅
```

### Pseudocode (26-letter swap)

```
function ladderLength(beginWord, endWord, wordList):
    words ← set of wordList
    if endWord not in words: return 0
    queue ← [beginWord], remove beginWord from words, level ← 1
    while queue not empty:
        size ← length(queue)
        repeat size times:
            word ← pop front
            if word == endWord: return level
            for each position i in word:
                for ch from 'a' to 'z':
                    cand ← word with position i set to ch
                    if cand in words:
                        remove cand from words      // mark visited
                        push cand
        level ← level + 1
    return 0
```

### 🚀 Optimization: bidirectional BFS

```
   Grow from BOTH ends and stop when they meet.

     begin ●───●───●──►  ◄──●───●───● end
                     meet!

   Always expand the SMALLER frontier.
   A branching factor b and depth d: b^d  →  about 2 · b^(d/2).
```

### 📌 Points to remember
- If `endWord` isn't in the list → **0** immediately.
- The answer counts **words**, so start at level 1.
- Removing words from the set when you enqueue them is the "visited" mark.
- Word Ladder II (all shortest paths) = BFS to build parent links + DFS to list paths.

---

## 8. Minimum Height Trees (Medium)

### Problem
A tree with `n` nodes. Pick a root so the tree's height is as small as possible.
Return **all** such roots.

> This problem also appears in [03-Topological-Sort.md](03-Topological-Sort.md).
> The leaf-peeling idea is Kahn's algorithm run on an undirected tree.

### Visualize it

```
   n = 6, edges = [3,0] [3,1] [3,2] [3,4] [5,4]

        0   1   2
         ╲  │  ╱
            3
            │
            4
            │
            5

   Rooted at 3 → height 2.   Rooted at 4 → height 2.
   Rooted at 0 → height 3.   ...
   Answer: [3, 4]
```

### The idea: peel leaves like an onion

```
   The best roots are the CENTER of the longest path.
   Cut off all leaves, then the new leaves, and so on, until ≤ 2 nodes are left.

   A tree has either 1 center or 2 neighboring centers:

     ●─●─●─●─●        odd-length longest path  → 1 center (the middle ●)
     ●─●─●─●          even-length longest path → 2 centers
```

### Trace

```
  degrees: 0:1  1:1  2:1  3:4  4:2  5:1

  round │ leaves removed │ degree changes        │ nodes left
  ──────┼────────────────┼───────────────────────┼───────────
    —   │ —              │ —                     │ 6
    1   │ 0, 1, 2, 5     │ 3: 4→1, 4: 2→1        │ 2  → STOP
                                                   (≤ 2 left)

  remaining = [3, 4] ✅
```

```
   Second example: n = 4, edges [1,0] [1,2] [1,3]

        0
        │
    2 ─ 1 ─ 3        leaves 0, 2, 3 removed → only 1 left → [1]
```

### Pseudocode

```
function findMinHeightTrees(n, edges):
    if n == 1: return [0]
    build adjacency lists and degree[]
    leaves ← all nodes with degree 1
    remaining ← n
    while remaining > 2:
        remaining ← remaining − length(leaves)
        newLeaves ← empty
        for each leaf in leaves:
            for each neighbor of leaf:
                degree[neighbor] ← degree[neighbor] − 1
                if degree[neighbor] == 1:
                    add neighbor to newLeaves
        leaves ← newLeaves
    return leaves
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| BFS from every node, measure height | O(n²) | O(n) |
| **Leaf peeling** | **O(n)** | **O(n)** ✅ |

### 📌 Points to remember
- `n == 1` → answer `[0]`. There are no edges and no leaves.
- Stop when **≤ 2** nodes remain, not when 1 remains.
- Peel **one full layer at a time**, like the level loop in BFS.
- The answer always has 1 or 2 nodes.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────────┬───────────────────────────────────────────┬───────────────────────┬──────────┐
│ Problem                  │ Core idea                                 │ Answer                │ Time     │
├──────────────────────────┼───────────────────────────────────────────┼───────────────────────┼──────────┤
│ Keys and Rooms           │ reachability from room 0                  │ visited == n          │ O(V+E)   │
│ Shortest Path Bin. Matrix│ single-source BFS, 8 directions           │ level of target       │ O(n²)    │
│ Rotting Oranges          │ multi-source BFS, level = minute          │ minutes or −1         │ O(mn)    │
│ Walls and Gates          │ multi-source BFS from gates               │ fill grid in place    │ O(mn)    │
│ 01 Matrix                │ multi-source BFS from 0s                  │ distance grid         │ O(mn)    │
│ Snakes and Ladders       │ BFS over squares, forced jumps            │ rolls to n²           │ O(n²)    │
│ Word Ladder              │ BFS over words, 1-letter edges            │ words in path or 0    │ O(N·L·26)│
│ Minimum Height Trees     │ peel leaves layer by layer                │ 1 or 2 centers        │ O(n)     │
└──────────────────────────┴───────────────────────────────────────────┴───────────────────────┴──────────┘
```

### Pattern family tree

```
                                  BFS
                                   │
      ┌──────────────┬─────────────┼───────────────┬───────────────────┐
      │              │             │               │                   │
 REACHABILITY   SINGLE-SOURCE  MULTI-SOURCE    IMPLICIT GRAPH     LEAF PEELING
 (any order)    SHORTEST PATH  (nearest X)     (build edges       (outside → in)
      │              │             │            yourself)              │
 └ Keys and     └ Shortest     ├ Rotting       ├ Snakes and       └ Minimum
   Rooms          Path Binary  │ Oranges       │ Ladders            Height Trees
                  Matrix       ├ Walls and     └ Word Ladder
                               │ Gates
                               └ 01 Matrix
```

### Which BFS do I need?

```
   ┌─────────────────────────────────────┬────────────────────────────────┐
   │ Question                            │ Use                            │
   ├─────────────────────────────────────┼────────────────────────────────┤
   │ "Can I reach ...?"                  │ plain BFS or DFS               │
   │ "Fewest steps from A to B"          │ single-source BFS              │
   │ "Distance to the NEAREST X"         │ multi-source BFS from all X    │
   │ "How many minutes until all ..."    │ multi-source BFS, level loop   │
   │ "Fewest moves" on states/words      │ BFS on an implicit graph       │
   │ "Find the center / middle of tree"  │ leaf peeling                   │
   │ Edges have DIFFERENT weights        │ ❌ not BFS → Dijkstra          │
   └─────────────────────────────────────┴────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Marking visited on ENQUEUE (not on dequeue)?
  ☐ Many sources? Put them ALL in the queue first (one pass, not k passes)
  ☐ Need the level number? Snapshot the queue size each round
  ☐ Can I store distance in the grid itself? (INF / ∞ = unvisited)
  ☐ Huge search space with a known goal? Bidirectional BFS
  ☐ Edge weights only 0 or 1? 0-1 BFS with a deque
  ☐ Neighbor generation slow? Precompute buckets / adjacency lists
```

### 🚩 Common bugs to avoid

```
  ✗ Marking visited when popping → duplicates in the queue, TLE
  ✗ Shortest Path Binary Matrix: forgetting diagonals; not checking a blocked start/end
  ✗ Rotting Oranges: counting one extra minute after the last orange rots
  ✗ Rotting Oranges: forgetting the "fresh left → −1" check
  ✗ 01 Matrix / Walls and Gates: running BFS from every target instead of from all sources
  ✗ Snakes and Ladders: wrong zig-zag mapping; marking the pre-jump square as visited
  ✗ Word Ladder: counting edges instead of words; not checking endWord is in the list
  ✗ Minimum Height Trees: stopping at 1 node; forgetting n == 1
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What is a NODE, what is ONE STEP, and does every step  ║
   ║   cost the same?"                                        ║
   ╚══════════════════════════════════════════════════════════╝
     Same cost → BFS. Then ask: one start, or many starts?
```

---

### ✅ Progress tracker

- [ ] Keys and Rooms (Medium)
- [ ] Shortest Path in Binary Matrix (Medium)
- [ ] Rotting Oranges (Medium)
- [ ] Walls and Gates (Medium)
- [ ] 01 Matrix (Medium)
- [ ] Snakes and Ladders (Medium)
- [ ] Word Ladder (Hard)
- [ ] Minimum Height Trees (Medium)
