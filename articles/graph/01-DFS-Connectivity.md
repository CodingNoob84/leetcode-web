# DFS (Connectivity): A Visual Guide

> **Goal:** Learn to *see* graph problems as "walk until you can't, then back up",
> and to choose the right DFS variant: plain visited, 3-color, 2-color, or disc/low.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is DFS?](#0-the-big-idea-what-is-dfs)

**Part A: Grids (implicit graphs)**

1. [Flood Fill (Easy)](#1-flood-fill-easy)
2. [Number of Islands (Medium)](#2-number-of-islands-medium)
3. [Max Area of Island (Medium)](#3-max-area-of-island-medium)
4. [Surrounded Regions (Medium)](#4-surrounded-regions-medium)
5. [Pacific Atlantic Water Flow (Medium)](#5-pacific-atlantic-water-flow-medium)

**Part B: Components**

6. [Number of Connected Components (Medium)](#6-number-of-connected-components-medium)
7. [Graph Valid Tree (Medium)](#7-graph-valid-tree-medium)
8. [Clone Graph (Medium)](#8-clone-graph-medium)
9. [All Paths From Source to Target (Medium)](#9-all-paths-from-source-to-target-medium)

**Part C: Cycles & Coloring**

10. [Undirected Graph Cycle (Easy)](#10-undirected-graph-cycle-easy)
11. [Directed Graph Cycle (Medium)](#11-directed-graph-cycle-medium)
12. [Is Graph Bipartite (Medium)](#12-is-graph-bipartite-medium)
13. [Longest Cycle in a Graph (Hard)](#13-longest-cycle-in-a-graph-hard)

**Part D: Advanced DFS**

14. [Reconstruct Itinerary (Hard)](#14-reconstruct-itinerary-hard)
15. [Critical Connections in a Network (Medium)](#15-critical-connections-in-a-network-medium)
16. [Articulation Point (Hard)](#16-articulation-point-hard)

17. [Master Cheat Sheet](#17-master-cheat-sheet)

> **Suggested order:** follow the numbers. The four parts are grouped by idea:
> **Grid → Components → Cycles & Coloring → Advanced.**
> Each part reuses the DFS template from section 0 and adds exactly one new piece of state.

> **Source notes:**
> - *Undirected Graph Cycle*, *Directed Graph Cycle* and *Articulation Point* are **GeeksforGeeks-style** problems.
>   The definitions used here are stated in each section.
> - *Number of Connected Components* (LC 323) and *Graph Valid Tree* (LC 261) are **LeetCode Premium** problems.

---

## 0. The Big Idea: What Is DFS?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "DFS"                                   │
├──────────────────────────────────────────────────────────────────┤
│  • "connected", "component", "island", "region", "group"         │
│  • "is there a CYCLE?", "safe states", "valid tree"              │
│  • "can it be split into two groups?" (bipartite)                │
│  • "list ALL paths" (backtracking)                               │
│  • "which edge / node, if removed, disconnects the graph?"       │
│    (bridges, articulation points)                                │
│  • You need to explore EVERYTHING reachable, order doesn't matter│
│                                                                  │
│  ⚠ If the problem says SHORTEST / minimum steps → that's BFS.    │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: walk until stuck, then back up

```
          A ─── B ─── C
          │           │
          D           E ─── F

   DFS from A:   A → B → C → E → F   (stuck: F has nothing new)
                             ↩ E     (back up: nothing new)
                         ↩ C ↩ B ↩ A
                 A → D               (A still had D)
                 ↩ A                  done

   Visit order: A, B, C, E, F, D

   Like exploring a maze with one hand on the wall:
   go as DEEP as possible, and only turn back at a dead end.
```

### Three ways to store a graph

```
  ┌───────────────────────┬───────────────────────────┬─────────────────────────────┐
  │ ADJACENCY LIST        │ ADJACENCY MATRIX          │ IMPLICIT GRID               │
  ├───────────────────────┼───────────────────────────┼─────────────────────────────┤
  │  0: [1, 2]            │      0  1  2              │   ┌───┬───┬───┐             │
  │  1: [0, 2]            │  0 [ 0  1  1 ]            │   │ 1 │ 1 │ 0 │             │
  │  2: [0, 1]            │  1 [ 1  0  1 ]            │   ├───┼───┼───┤  neighbors  │
  │                       │  2 [ 1  1  0 ]            │   │ 0 │ 1 │ 1 │  = 4 deltas │
  │                       │                           │   └───┴───┴───┘             │
  ├───────────────────────┼───────────────────────────┼─────────────────────────────┤
  │ space O(V + E)        │ space O(V²)               │ no storage: compute         │
  │ ✅ default choice     │ dense graphs, O(1) "is    │ neighbors on the fly        │
  │                       │ there an edge u–v?"       │                             │
  └───────────────────────┴───────────────────────────┴─────────────────────────────┘

  Grid neighbors with the 4 direction deltas:

                 (r-1, c)
                    ▲
       (r, c-1) ◄ (r,c) ► (r, c+1)          DIRS = [(-1,0), (1,0), (0,-1), (0,1)]
                    ▼
                 (r+1, c)                    always check: 0 ≤ nr < rows, 0 ≤ nc < cols
```

### The DFS template: recursive

```
function dfs(node):
    visited[node] ← true
    // ── do the "visit" work here (count, color, copy, ...) ──
    for each nb in neighbors(node):
        if not visited[nb]:
            dfs(nb)

function solve():
    for each node in graph:            // outer loop catches EVERY component
        if not visited[node]:
            dfs(node)
```

### The DFS template: iterative (explicit stack)

```
function dfsIterative(start):
    stack ← [start]
    visited[start] ← true              // mark when PUSHING
    while stack not empty:
        node ← pop(stack)
        // ── visit node ──
        for each nb in neighbors(node):
            if not visited[nb]:
                visited[nb] ← true     // mark on push → never pushed twice
                push(stack, nb)
```

### Mark-on-push vs mark-on-pop

```
   Graph:   A ── B
             \  /
              C          A's neighbors: B, C      B's neighbors: A, C

   MARK ON POP (late):                 MARK ON PUSH (early):  ✅
   push A                              push A  (mark A)
   pop A → push B, C                   pop A  → push B, C (mark both)
   pop C → push B  (B not marked yet!) pop C  → B already marked, skip
   stack: [B, B]  ← duplicate          stack: [B]
   ...wasted work, may double-count    each node enters the stack ONCE
```

> 💡 For counting and flooding, **mark on push**. The visit order is then not a "true" DFS order,
> but for connectivity that doesn't matter. Problems that need the exact DFS order
> (cycles in directed graphs, disc/low) are written **recursively**.

### Visited states: 2 vs 3 colors

```
   ┌────────────────────────────────┬───────────────────────────────────────────┐
   │ 2 STATES (bool)                │ 3 STATES (color)                          │
   ├────────────────────────────────┼───────────────────────────────────────────┤
   │ false = never seen             │ WHITE = never seen                        │
   │ true  = seen                   │ GRAY  = on the current recursion path     │
   │                                │ BLACK = fully finished                    │
   ├────────────────────────────────┼───────────────────────────────────────────┤
   │ Enough for: islands,           │ Needed for: DIRECTED cycle detection,     │
   │ components, flood fill,        │ safe states, topological sort             │
   │ undirected cycles (+ parent)   │ (GRAY → GRAY edge = cycle)                │
   └────────────────────────────────┴───────────────────────────────────────────┘
```

### ⚠️ Recursion depth

```
   A 1000 × 1000 grid that is ALL land → one DFS chain can be 1,000,000 deep.
   Many languages overflow the call stack long before that.

   Fixes:  • use the iterative stack version
           • or use BFS (same answer for connectivity)
           • or Union-Find (see the MST / Union-Find guide)
```

### Complexity (almost every problem here)

```
   Every node visited once, every edge looked at once (twice if undirected):

        Adjacency list:  O(V + E)        Grid:  O(rows × cols)
```

---

# Part A: Grids (implicit graphs)

---

## 1. Flood Fill (Easy)

### Problem
Given an image (grid of colors), a start pixel `(sr, sc)` and a `color`, repaint the start pixel and every pixel
**connected 4-directionally with the same original color**.

### Visualize it

```
   image, start (1,1), new color 2

     before               after
   ┌───┬───┬───┐       ┌───┬───┬───┐
   │ 1 │ 1 │ 1 │       │ 2 │ 2 │ 2 │
   ├───┼───┼───┤       ├───┼───┼───┤
   │ 1 │[1]│ 0 │  ──►  │ 2 │ 2 │ 0 │
   ├───┼───┼───┤       ├───┼───┼───┤
   │ 1 │ 0 │ 1 │       │ 2 │ 0 │ 1 │   ← (2,2) is a 1 but NOT connected
   └───┴───┴───┘       └───┴───┴───┘     (blocked by 0s) → unchanged
```

### The decision at each cell

```
               dfs(r, c)
                   │
      ┌────────────┴────────────┐
   out of bounds,             same as original color
   or a different color         │
      │                    repaint it, then dfs on
    STOP                   all 4 neighbors
```

> 💡 **Repainting IS the visited mark.** Once a cell has the new color it no longer matches
> the original, so DFS never re-enters it. No separate visited array needed.

### The 5 steps

| Step | Answer |
|------|--------|
| Node | a grid cell `(r, c)` |
| Neighbors | the 4 adjacent cells |
| Visit work | set `image[r][c] = color` |
| Visited mark | the new color itself |
| Stop when | out of bounds or `image[r][c] ≠ original` |

### Trace (direction order: up, down, left, right)

```
  call                     action
  ─────────────────────    ────────────────────────────────────────────
  dfs(1,1)                 paint. up → (0,1)
   dfs(0,1)                paint. up: out. down (1,1): already 2. left → (0,0)
    dfs(0,0)               paint. up: out. down → (1,0)
     dfs(1,0)              paint. up (0,0): done. down → (2,0)
      dfs(2,0)             paint. down: out. left: out. right (2,1)=0: stop
     ↩ (1,0)               left: out. right (1,1): done
    ↩ (0,0)                left: out. right (0,1): done
   ↩ (0,1)                 right → (0,2)
    dfs(0,2)               paint. down (1,2)=0: stop. right: out
  ↩ (1,1)                  down (2,1)=0, left (1,0) done, right (1,2)=0

  painted in order: (1,1) (0,1) (0,0) (1,0) (2,0) (0,2)   → 6 cells ✅
```

### Pseudocode

```
function floodFill(image, sr, sc, color):
    original ← image[sr][sc]
    if original == color: return image          // ⚠ else infinite recursion
    dfs(sr, sc)
    return image

function dfs(r, c):
    if r, c out of bounds: return
    if image[r][c] ≠ original: return
    image[r][c] ← color
    for each (dr, dc) in DIRS:
        dfs(r + dr, c + dc)
```

### Complexity
Time O(rows × cols), Space O(rows × cols) for the recursion in the worst case.

### 📌 Points to remember
- **Guard `original == color`.** Otherwise repainted cells still "match" and DFS loops forever.
- Check bounds **first**, then the color.
- Flood fill is the **base move** for every grid problem below.

---

## 2. Number of Islands (Medium)

### Problem
A grid of `'1'` (land) and `'0'` (water). Count the islands (groups of land connected 4-directionally).

### Visualize it

```
   ┌───┬───┬───┬───┬───┐
   │ 1 │ 1 │ 0 │ 0 │ 0 │        island A = top-left 2×2 block
   ├───┼───┼───┼───┼───┤        island B = the single 1 in the middle
   │ 1 │ 1 │ 0 │ 0 │ 0 │        island C = bottom-right pair
   ├───┼───┼───┼───┼───┤
   │ 0 │ 0 │ 1 │ 0 │ 0 │        answer = 3
   ├───┼───┼───┼───┼───┤
   │ 0 │ 0 │ 0 │ 1 │ 1 │
   └───┴───┴───┴───┴───┘
```

### The idea: scan + sink

```
   Scan every cell, row by row.

   ┌──────────────────────────────────────────────────────────┐
   │ Found an unvisited '1'?                                  │
   │   1. count ← count + 1        (a NEW island starts here) │
   │   2. flood-fill it away       (sink the whole island)    │
   │ Later cells of the same island are already sunk → skip.  │
   └──────────────────────────────────────────────────────────┘

   Number of islands = number of times the OUTER loop starts a DFS.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Node | a land cell |
| Neighbors | 4 adjacent land cells |
| Visit work | sink it: set `'1' → '0'` (or mark visited) |
| Outer loop | every cell; a fresh `'1'` means a new island |
| Answer | number of DFS starts |

### Trace

```
  scan (0,0) = 1  →  count = 1, sink (0,0) (0,1) (1,0) (1,1)
  scan (0,1) … (2,1): all 0 now
  scan (2,2) = 1  →  count = 2, sink (2,2)
  scan (2,3) … (3,2): 0
  scan (3,3) = 1  →  count = 3, sink (3,3) (3,4)
  scan (3,4): already 0

  answer = 3 ✅

   after sinking:            ┌───┬───┬───┬───┬───┐
   whole grid is water       │ 0 │ 0 │ 0 │ 0 │ 0 │  ...
```

### Pseudocode

```
function numIslands(grid):
    count ← 0
    for r from 0 to rows-1:
        for c from 0 to cols-1:
            if grid[r][c] == '1':
                count ← count + 1
                sink(r, c)
    return count

function sink(r, c):
    if out of bounds or grid[r][c] ≠ '1': return
    grid[r][c] ← '0'
    for each (dr, dc) in DIRS: sink(r + dr, c + dc)
```

### Complexity
Time O(rows × cols), each cell sunk once. Space O(rows × cols) recursion worst case.

### 📌 Points to remember
- **Count = number of DFS launches from the outer loop.** This is the "components" pattern on a grid.
- Sinking modifies the input. If that's not allowed, use a separate `visited` grid.
- Diagonals don't connect (unless the problem says 8 directions).
- Alternatives: BFS (same complexity) or Union-Find (useful when land is added over time, LC 305).

---

## 3. Max Area of Island (Medium)

### Problem
Grid of `0`/`1`. Return the **size** of the largest island (0 if none).

### Visualize it

```
   ┌───┬───┬───┬───┐
   │ A │ A │ 0 │ 0 │      island A: 3 cells
   ├───┼───┼───┼───┤
   │ A │ 0 │ 0 │ B │      island B: 4 cells
   ├───┼───┼───┼───┤
   │ 0 │ 0 │ B │ B │      answer = max(3, 4) = 4
   ├───┼───┼───┼───┤
   │ 0 │ 0 │ 0 │ B │
   └───┴───┴───┴───┘
```

### The only change: DFS RETURNS a number

```
   Number of Islands:   dfs returns nothing, outer loop counts launches
   Max Area:            dfs RETURNS the size of what it sank

        area(r, c) = 1  +  area(up) + area(down) + area(left) + area(right)
                     ▲
                  this cell             (water / out of bounds / visited → 0)
```

### Trace

```
  scan (0,0) → area = 1 (0,0)
                    + area(1,0) = 1
                    + area(0,1) = 1         → 3     best = 3
  scan (1,3) → area = 1 (1,3)
                    + area(2,3) = 1 + area(3,3) = 1 + area(2,2) = 1
                                                    → 4     best = 4
  other 1s already sunk

  answer = 4 ✅
```

### Pseudocode

```
function maxAreaOfIsland(grid):
    best ← 0
    for every cell (r, c):
        if grid[r][c] == 1:
            best ← max(best, area(r, c))
    return best

function area(r, c):
    if out of bounds or grid[r][c] ≠ 1: return 0
    grid[r][c] ← 0                         // sink BEFORE recursing
    total ← 1
    for each (dr, dc) in DIRS:
        total ← total + area(r + dr, c + dc)
    return total
```

### 📌 Points to remember
- **Sink before recursing.** Otherwise a neighbor walks back and counts this cell again.
- "Return a value from DFS" is the pattern for: size, sum, perimeter (LC 463), etc.
- Time O(rows × cols).

---

## 4. Surrounded Regions (Medium)

### Problem
Board of `'X'` and `'O'`. Capture every region of `'O'` that is **completely surrounded** by `'X'`
(flip it to `'X'`). An `'O'` region touching the **border** is safe.

### Visualize it

```
     before                  after
   ┌───┬───┬───┬───┐      ┌───┬───┬───┬───┐
   │ X │ X │ X │ X │      │ X │ X │ X │ X │
   ├───┼───┼───┼───┤      ├───┼───┼───┼───┤
   │ X │ O │ O │ X │ ──►  │ X │ X │ X │ X │   inner region: captured
   ├───┼───┼───┼───┤      ├───┼───┼───┼───┤
   │ X │ X │ O │ X │      │ X │ X │ X │ X │
   ├───┼───┼───┼───┤      ├───┼───┼───┼───┤
   │ X │ O │ X │ X │      │ X │ O │ X │ X │   border O: SAFE
   └───┴───┴───┴───┘      └───┴───┴───┴───┘
```

### The trick: think in REVERSE

```
   ✗ Hard question:  "Is this region surrounded?"
                     (you only know after exploring the WHOLE region)

   ✓ Easy question:  "Which O's can reach the border?"
                     → start DFS FROM the border, mark everything reachable as SAFE

   ┌──────────────────────────────────────────────────────────┐
   │ STEP 1  DFS from every border 'O' → mark as 'S' (safe)   │
   │ STEP 2  sweep the board:   'O' → 'X'   (not safe)        │
   │                            'S' → 'O'   (restore)         │
   └──────────────────────────────────────────────────────────┘
```

### Trace

```
   border cells that are 'O':  only (3,1)

   STEP 1: dfs(3,1) → mark S. neighbors: (2,1)=X, (3,0)=X, (3,2)=X → stop

          ┌───┬───┬───┬───┐
          │ X │ X │ X │ X │
          ├───┼───┼───┼───┤
          │ X │ O │ O │ X │     O's not reached from the border
          ├───┼───┼───┼───┤
          │ X │ X │ O │ X │
          ├───┼───┼───┼───┤
          │ X │ S │ X │ X │     S = safe
          └───┴───┴───┴───┘

   STEP 2: (1,1) (1,2) (2,2): O → X        (3,1): S → O        ✅
```

### Pseudocode

```
function solve(board):
    for each cell (r, c) on the border:
        if board[r][c] == 'O': markSafe(r, c)
    for every cell (r, c):
        if board[r][c] == 'O': board[r][c] ← 'X'
        else if board[r][c] == 'S': board[r][c] ← 'O'

function markSafe(r, c):
    if out of bounds or board[r][c] ≠ 'O': return
    board[r][c] ← 'S'
    for each (dr, dc) in DIRS: markSafe(r + dr, c + dc)
```

### 📌 Points to remember
- **"Surrounded / enclosed" → DFS from the border inward.** Reuse it in Number of Enclaves (LC 1020) and Closed Islands (LC 1254).
- Use a temporary third marker (`'S'`) so one sweep can do both flips.
- Time O(rows × cols).

---

## 5. Pacific Atlantic Water Flow (Medium)

### Problem
`heights` grid. Rain flows from a cell to a neighbor with **equal or lower** height.
The **Pacific** touches the top and left edges, the **Atlantic** the bottom and right edges.
Return every cell from which water can reach **both** oceans.

### Visualize it

```
             Pacific ~ ~ ~ ~ ~
           ~ ┌───┬───┬───┐
           ~ │ 1 │ 2 │ 3 │ *
           ~ ├───┼───┼───┤ *
           ~ │ 8 │ 9 │ 4 │ *
           ~ ├───┼───┼───┤ *
           ~ │ 7 │ 6 │ 5 │ *
             └───┴───┴───┘ *
               * * * * * Atlantic
```

### The trick: run water UPHILL from each ocean

```
   ✗ Forward: from EACH cell, simulate flowing down → O((mn)²)
   ✓ Reverse: from each OCEAN edge, climb to neighbors that are ≥ current height

        forward rule:   a → b  if  h(b) ≤ h(a)     (flows down)
        reverse rule:   b → a  if  h(a) ≥ h(b)     (climbs up)

   ┌───────────────────────────────────────────────────────────┐
   │ pac = cells reached climbing from top row + left column   │
   │ atl = cells reached climbing from bottom row + right col  │
   │ answer = pac ∩ atl                                        │
   └───────────────────────────────────────────────────────────┘
```

### Trace

```
  PACIFIC (start: top row 1,2,3 and left column 1,8,7)
     from 3 (0,2) climb to 4 (1,2)        4 ≥ 3 ✓
     from 4       climb to 9 (1,1), 5 (2,2)
     from 5       climb to 6 (2,1)
     → every cell reached

          pac                 atl                 both
     ┌───┬───┬───┐       ┌───┬───┬───┐       ┌───┬───┬───┐
     │ ✓ │ ✓ │ ✓ │       │ · │ · │ ✓ │       │ · │ · │ ✓ │
     ├───┼───┼───┤       ├───┼───┼───┤       ├───┼───┼───┤
     │ ✓ │ ✓ │ ✓ │   ∩   │ ✓ │ ✓ │ ✓ │   =   │ ✓ │ ✓ │ ✓ │
     ├───┼───┼───┤       ├───┼───┼───┤       ├───┼───┼───┤
     │ ✓ │ ✓ │ ✓ │       │ ✓ │ ✓ │ ✓ │       │ ✓ │ ✓ │ ✓ │
     └───┴───┴───┘       └───┴───┴───┘       └───┴───┴───┘

  ATLANTIC (start: bottom row 7,6,5 and right column 3,4,5)
     from 7 (2,0) climb to 8 (1,0); from 8 climb to 9 (1,1)
     1 (0,0) and 2 (0,1): every neighbor that could climb to them is HIGHER → unreachable

  answer: 7 cells, all except (0,0) and (0,1) ✅
     check (0,2)=3: flows up into the Pacific and right into the Atlantic ✓
```

### Pseudocode

```
function pacificAtlantic(heights):
    pac ← rows × cols all false
    atl ← rows × cols all false
    for c in 0..cols-1:  climb(0, c, pac);        climb(rows-1, c, atl)
    for r in 0..rows-1:  climb(r, 0, pac);        climb(r, cols-1, atl)
    return every (r, c) with pac[r][c] and atl[r][c]

function climb(r, c, seen):
    seen[r][c] ← true
    for each neighbor (nr, nc) in bounds:
        if not seen[nr][nc] and heights[nr][nc] ≥ heights[r][c]:
            climb(nr, nc, seen)
```

### Complexity
Two DFS passes, each cell visited at most once per ocean: **O(rows × cols)**.

### 📌 Points to remember
- **"Can X reach the boundary?" for many X → start from the boundary and reverse the edges.**
- Reverse rule is `≥` (water flows to *equal* heights too).
- Use one visited grid **per ocean**. That's what makes it linear.

---

# Part B: Components

---

## 6. Number of Connected Components (Medium)

> LeetCode 323 (Premium). Given `n` nodes labeled `0..n-1` and an undirected edge list, return the number of connected components.

### Visualize it

```
   n = 5, edges = [[0,1], [1,2], [3,4]]

      0 ─── 1 ─── 2          3 ─── 4

      └── component 1 ──┘    └ comp 2 ┘           answer = 2
```

### Same as Number of Islands, on an explicit graph

```
   Islands:     cells,  4 grid neighbors,  outer loop over cells
   Components:  nodes,  adjacency list,    outer loop over 0..n-1

   ┌──────────────────────────────────────────────────────┐
   │ components = number of DFS launches from the outer   │
   │              loop over all nodes                     │
   └──────────────────────────────────────────────────────┘
   Isolated nodes (no edges) still count, because the loop covers ALL n.
```

### Trace

```
  adjacency:  0:[1]   1:[0,2]   2:[1]   3:[4]   4:[3]

  i=0: not visited → count=1, dfs visits 0, 1, 2
  i=1: visited      i=2: visited
  i=3: not visited → count=2, dfs visits 3, 4
  i=4: visited

  visited: [T, T, T, T, T]     answer = 2 ✅
```

### Pseudocode

```
function countComponents(n, edges):
    adj ← build undirected adjacency list
    visited ← array of n, all false
    count ← 0
    for i from 0 to n-1:
        if not visited[i]:
            count ← count + 1
            dfs(i)
    return count
```

### 📌 Points to remember
- **Add both directions** when building an undirected adjacency list.
- Union-Find alternative: start with `n` components, each successful `union` subtracts 1.
- Time O(V + E).

---

## 7. Graph Valid Tree (Medium)

> LeetCode 261 (Premium). Given `n` nodes and an undirected edge list, is the graph a valid **tree**?

### What is a tree?

```
   TREE  =  CONNECTED  +  NO CYCLE
         =  CONNECTED  +  exactly n − 1 edges       ← the easy test

      ✅ tree                    ❌ cycle                  ❌ not connected
        0                         0 ─ 1                     0 ─ 1    2
      / | \                       │ ╲ │
     1  2  3                      3 ─ 2                     n = 3, only 1 edge:
     │                                                      node 2 is cut off
     4
```

### The two checks

```
   ┌─────────────────────────────────────────────────────────────┐
   │ CHECK 1  edges == n − 1 ?          no → false immediately   │
   │ CHECK 2  DFS from 0 reaches all n?  no → false              │
   │                                    yes → true               │
   └─────────────────────────────────────────────────────────────┘

   Why that's enough: a connected graph with n − 1 edges CANNOT contain a cycle.
   (A cycle would mean an extra edge beyond the n − 1 a tree needs.)
```

### Trace

```
  Example 1: n=5, edges=[[0,1],[0,2],[0,3],[1,4]]
     edges = 4 = n − 1 ✓
     adjacency: 0:[1,2,3]  1:[0,4]  2:[0]  3:[0]  4:[1]
     DFS from 0: 0 → 1 → 4 → 2 → 3    visited 5 = n ✓    → true ✅

  Example 2: n=5, edges=[[0,1],[1,2],[2,3],[1,3],[1,4]]
     edges = 5 ≠ 4                                        → false ✅
     (1–2–3–1 is a cycle)
```

### Pseudocode

```
function validTree(n, edges):
    if length(edges) ≠ n − 1: return false
    adj ← build undirected adjacency list
    visited ← array of n, all false
    dfs(0)
    return number of visited nodes == n
```

### 📌 Points to remember
- **Tree ⇔ connected and E = V − 1.** Memorize this.
- Without the edge-count shortcut you need cycle detection (parent check, problem 10).
- Union-Find version: if any `union(u, v)` finds `u` and `v` already connected → cycle → false.

---

## 8. Clone Graph (Medium)

### Problem
Given a reference to one node of a connected undirected graph, return a **deep copy**.
Each node has a `val` and a list of `neighbors`.

### Visualize it

```
     original                      clone (brand-new objects)
     1 ─── 2                       1'─── 2'
     │     │           ──►         │     │
     4 ─── 3                       4'─── 3'

   ⚠ The clone's neighbors must point to CLONES, never to originals.
```

### The key tool: a map from old node → new node

```
   ┌──────────────────────────────────────────────────────────────┐
   │ map[old] = its clone                                         │
   │                                                              │
   │ This map does TWO jobs at once:                              │
   │   1. visited set: "have I already cloned this node?"         │
   │   2. lookup:      "which new node should my edge point to?"  │
   └──────────────────────────────────────────────────────────────┘

   ⚠ Put the clone in the map BEFORE recursing into neighbors.
     Otherwise the cycle 1 → 2 → 1 creates a second copy of 1, forever.
```

### Trace

```
  neighbors:  1:[2,4]   2:[1,3]   3:[2,4]   4:[3,1]

  clone(1): create 1', map={1}
     nb 2 → clone(2): create 2', map={1,2}
              nb 1 → in map → 2'.neighbors += 1'
              nb 3 → clone(3): create 3', map={1,2,3}
                        nb 2 → in map → 3'.neighbors += 2'
                        nb 4 → clone(4): create 4', map={1,2,3,4}
                                  nb 3 → in map → 4'.neighbors += 3'
                                  nb 1 → in map → 4'.neighbors += 1'
                               ↩ returns 4'
                        3'.neighbors += 4'
                     ↩ returns 3'
              2'.neighbors += 3'
           ↩ returns 2'
     1'.neighbors += 2'
     nb 4 → in map → 1'.neighbors += 4'

  result: 1':[2',4']  2':[1',3']  3':[2',4']  4':[3',1']  ✅
```

### Pseudocode

```
map ← empty dictionary

function clone(node):
    if node is null: return null
    if node in map: return map[node]
    copy ← new Node(node.val)
    map[node] ← copy                         // register FIRST
    for each nb in node.neighbors:
        append clone(nb) to copy.neighbors
    return copy
```

### 📌 Points to remember
- **Register before recursing.** That single line prevents infinite loops on cycles.
- The same "old → new map" pattern solves Copy List with Random Pointer (LC 138).
- Time O(V + E), Space O(V).

---

## 9. All Paths From Source to Target (Medium)

### Problem
A **DAG** with nodes `0..n-1` (`graph[i]` = nodes `i` points to). Return **all** paths from `0` to `n-1`.

### Visualize it

```
   graph = [[1,2], [3], [3], []]

          ┌──► 1 ──┐
          │        ▼
          0        3        paths: [0,1,3]
          │        ▲               [0,2,3]
          └──► 2 ──┘
```

### Backtracking DFS: choose → explore → un-choose

```
                       [0]
                    /       \
                choose 1   choose 2
                  │            │
               [0,1]        [0,2]
                  │            │
              choose 3     choose 3
                  │            │
              [0,1,3] ✅    [0,2,3] ✅
                  │            │
              un-choose    un-choose      ← pop so the path is clean
                                            for the next branch
```

### Why no visited set?

```
   It's a DAG: following edges can never loop back.
   And we WANT to revisit nodes on different paths (3 appears in both answers).
   A visited set would wrongly cut the second path.
```

### Trace

```
  path=[0]
    → 1: path=[0,1]
        → 3: path=[0,1,3]   3 == target → save [0,1,3]
        ← pop 3:  [0,1]
    ← pop 1: [0]
    → 2: path=[0,2]
        → 3: path=[0,2,3]   save [0,2,3]
        ← pop 3:  [0,2]
    ← pop 2: [0]

  answer: [[0,1,3], [0,2,3]] ✅
```

### Pseudocode

```
function allPathsSourceTarget(graph):
    result ← empty list
    path ← [0]
    explore(0)
    return result

function explore(node):
    if node == n − 1:
        append a COPY of path to result
        return
    for each next in graph[node]:
        append next to path
        explore(next)
        remove last element of path            // backtrack
```

### Complexity
There can be up to 2^(n−2) paths, each of length up to n → **O(2ⁿ · n)**. You can't do better, because the output itself is that large.

### 📌 Points to remember
- **Save a copy** of the path, not the path object that keeps changing.
- DAG → no visited set needed. A general graph with cycles **does** need an "on current path" set.
- Choose / explore / un-choose is the backtracking template.

---

# Part C: Cycles & Coloring

---

## 10. Undirected Graph Cycle (Easy)

> GFG-style: given `V` vertices and an undirected adjacency list (may be disconnected), return `true` if the graph contains a cycle.

### Visualize it

```
        0 ─── 1
         ╲   ╱
          ╲ ╱           cycle 0 – 1 – 2 – 0
           2 ─── 3
```

### The trap: every undirected edge looks like a cycle

```
   Undirected edge 0 ─ 1 is stored as 0→1 AND 1→0.

   dfs(0) → dfs(1) → sees 0 is visited → "cycle!"  ✗ WRONG
                     but 0 is just where we CAME FROM

   ┌──────────────────────────────────────────────────────────────┐
   │ FIX: remember the PARENT. While at node u:                   │
   │      neighbor v visited  AND  v ≠ parent(u)  →  CYCLE ✓      │
   └──────────────────────────────────────────────────────────────┘
```

### Trace

```
  adjacency:  0:[1,2]   1:[0,2]   2:[1,0,3]   3:[2]

  dfs(0, parent=-1)        visited {0}
    nb 1 unvisited → dfs(1, parent=0)          visited {0,1}
       nb 0: visited, but it IS the parent → ignore
       nb 2 unvisited → dfs(2, parent=1)       visited {0,1,2}
          nb 1: parent → ignore
          nb 0: visited AND not parent  →  CYCLE ✅
```

### Pseudocode

```
function hasCycle(V, adj):
    visited ← array of V, all false
    for i from 0 to V-1:                      // graph may be disconnected
        if not visited[i] and dfs(i, -1): return true
    return false

function dfs(u, parent):
    visited[u] ← true
    for each v in adj[u]:
        if not visited[v]:
            if dfs(v, u): return true
        else if v ≠ parent:
            return true
    return false
```

### 📌 Points to remember
- **Undirected cycle = visited neighbor that isn't my parent.**
- Loop over **all** vertices. A cycle may sit in another component.
- Parallel edges (two edges between the same pair) form a cycle that the parent-node check misses. If they can appear, track the parent **edge id** instead of the parent node.
- Alternatives: BFS with parent, or Union-Find (an edge joining an already-connected pair closes a cycle).

---

## 11. Directed Graph Cycle (Medium)

> GFG-style: given `V` vertices and a directed adjacency list, return `true` if there is a cycle.

### Why the parent trick no longer works

```
   Diamond (NO cycle):          0 ──► 1
                                │     │
                                ▼     ▼
                                2 ◄───┘      edges 0→1, 0→2, 1→2

   dfs(0) → dfs(1) → dfs(2) finishes
          → back at 0, neighbor 2 is "visited" → plain-visited check says CYCLE ✗

   2 was visited on a DIFFERENT branch that already finished.
   That's not a cycle. A cycle needs an edge back to a node ON THE CURRENT PATH.
```

### The fix: 3 colors

```
   WHITE  never visited
   GRAY   on the current recursion path (entered, not finished)
   BLACK  finished, all its descendants explored

   ┌───────────────────────────────────────────────────────────┐
   │ Edge u → v where v is GRAY  ⇒  back edge  ⇒  CYCLE        │
   │ Edge u → v where v is BLACK ⇒  safe, already explored     │
   └───────────────────────────────────────────────────────────┘

        call stack (gray):   0 → 1 → 2 → 3
                                  ▲         │
                                  └─────────┘  3 → 1 hits GRAY → cycle
```

### Trace (edges 0→1, 1→2, 2→3, 3→1)

```
  step                color array [0, 1, 2, 3]
  ─────────────────   ────────────────────────
  enter 0             [G, W, W, W]
  enter 1             [G, G, W, W]
  enter 2             [G, G, G, W]
  enter 3             [G, G, G, G]
  3 → 1: 1 is GRAY    CYCLE ✅

  Diamond trace (0→1, 0→2, 1→2):
  enter 0 [G,W,W] → enter 1 [G,G,W] → enter 2 [G,G,G] → finish 2 [G,G,B]
  → finish 1 [G,B,B] → 0 → 2: BLACK, skip → finish 0 [B,B,B]   no cycle ✅
```

### Pseudocode

```
function isCyclic(V, adj):
    color ← array of V, all WHITE
    for i from 0 to V-1:
        if color[i] == WHITE and dfs(i): return true
    return false

function dfs(u):
    color[u] ← GRAY
    for each v in adj[u]:
        if color[v] == GRAY: return true
        if color[v] == WHITE and dfs(v): return true
    color[u] ← BLACK
    return false
```

### 📌 Points to remember
- **Directed cycle = edge into a GRAY node.** Visited alone is not enough.
- Equivalent: `visited[]` + `onPath[]` (set on entry, clear on exit).
- Alternative: Kahn's topological sort. If not all nodes get processed, there's a cycle (see the Topological Sort guide).
- Same 3-color idea solves **Find Eventual Safe States** (LC 802): safe nodes are those that finish BLACK.

---

## 12. Is Graph Bipartite (Medium)

### Problem
Can the nodes of an undirected graph be split into two groups so that **every edge connects the two groups**?

### Visualize it

```
     ✅ bipartite (square)              ❌ not bipartite (triangle inside)

     0 ─── 1        A: {0, 2}            0 ─── 1
     │     │        B: {1, 3}            │ ╲   │
     3 ─── 2                             3 ─ 2 ┘     0–1–2 is a triangle
                                                     (odd cycle)
```

### The idea: 2-coloring

```
   Color the start A. Every neighbor must be the OPPOSITE color.

        A ──► B ──► A ──► B ...

   ┌──────────────────────────────────────────────────────────┐
   │ neighbor uncolored         → give it the opposite color  │
   │ neighbor has opposite color → fine                       │
   │ neighbor has SAME color    → conflict → NOT bipartite    │
   └──────────────────────────────────────────────────────────┘

   Fact: bipartite  ⇔  no ODD-length cycle.
   (Walking around an odd cycle, the colors can't alternate back to the start.)
```

### Trace (not bipartite: graph = [[1,2,3],[0,2],[0,1,3],[0,2]])

```
  color: [−, −, −, −]       (− = uncolored, 0 / 1 = the two groups)

  dfs(0, color 0)            [0, −, −, −]
    nb 1 uncolored → dfs(1, color 1)         [0, 1, −, −]
       nb 0: color 0 ≠ 1 ✓
       nb 2 uncolored → dfs(2, color 0)      [0, 1, 0, −]
          nb 0: color 0 == my color 0  →  CONFLICT  →  false ✅

  Bipartite check on the square [[1,3],[0,2],[1,3],[0,2]]:
  colors become [0, 1, 0, 1], no conflict → true ✅
```

### Pseudocode

```
function isBipartite(graph):
    color ← array of n, all −1
    for i from 0 to n-1:                       // may be disconnected
        if color[i] == −1 and not paint(i, 0): return false
    return true

function paint(u, c):
    color[u] ← c
    for each v in graph[u]:
        if color[v] == −1:
            if not paint(v, 1 − c): return false
        else if color[v] == c:
            return false
    return true
```

### 📌 Points to remember
- **Bipartite ⇔ 2-colorable ⇔ no odd cycle.**
- The color array doubles as the visited array.
- Check every component (outer loop).
- Applications: Possible Bipartition (LC 886), splitting people into two rival teams.
- BFS and Union-Find versions also work.

---

## 13. Longest Cycle in a Graph (Hard)

### Problem
Directed graph with `n` nodes where **each node has at most one outgoing edge**: `edges[i]` is the target of `i`, or `-1`.
Return the length of the longest cycle, or `-1` if there is none.

### Visualize it

```
   edges = [3, 3, 4, 2, 3]

      0 ──┐
          ▼
      1 ─► 3 ──► 2
           ▲     │
           │     ▼
           └──── 4            cycle: 3 → 2 → 4 → 3   (length 3)
```

### Why it's simpler than a general graph

```
   Each node has ≤ 1 out-edge → from any start there is exactly ONE walk.
   The walk either ends at −1, or runs into a node seen before.

      start ─► ─► ─► ┌─► ─► ─┐
                     │       │      a "rho" shape: a tail, then a loop
                     └─◄─ ◄──┘
```

### The trick: timestamps

```
   Give every node the global time at which it was first visited.
   For each new walk, remember startTime = the time when this walk began.

   Walk until you hit a visited node v:
     visitTime[v] ≥ startTime  →  v was visited IN THIS WALK  →  cycle!
                                   length = currentTime − visitTime[v]
     visitTime[v] <  startTime →  v belongs to an OLD walk → no new cycle
```

### Trace (edges = [3, 3, 4, 2, 3])

```
  time starts at 1

  walk from 0:  startTime = 1
     visit 0 at t=1
     visit 3 at t=2
     visit 2 at t=3
     visit 4 at t=4                time is now 5
     next is 3: visited at 2 ≥ startTime 1 → cycle, length 5 − 2 = 3

  walk from 1:  startTime = 5
     visit 1 at t=5                time is now 6
     next is 3: visited at 2 < 5 → old walk, no new cycle

  nodes 2, 3, 4: already visited, skip

  visitTime = [1, 5, 3, 2, 4]     answer = 3 ✅

  edges = [2, -1, 3, 1]:  0→2→3→1→−1, walk ends at −1 → answer −1 ✅
```

### Pseudocode

```
function longestCycle(edges):
    visitTime ← array of n, all 0           // 0 = unvisited
    time ← 1
    best ← −1
    for i from 0 to n-1:
        if visitTime[i] ≠ 0: continue
        startTime ← time
        node ← i
        while node ≠ −1 and visitTime[node] == 0:
            visitTime[node] ← time
            time ← time + 1
            node ← edges[node]
        if node ≠ −1 and visitTime[node] ≥ startTime:
            best ← max(best, time − visitTime[node])
    return best
```

### Complexity
Every node is visited once in total: **O(n)** time, O(n) space.

### 📌 Points to remember
- **≤ 1 out-edge per node → a simple walk, no recursion needed.**
- The `≥ startTime` test separates "cycle in this walk" from "ran into an old walk".
- Never reset `visitTime`. That's what keeps it linear.
- Related: Find Closest Node to Given Two Nodes (LC 2359), Maximum Employees to Be Invited (LC 2127).

---

# Part D: Advanced DFS

---

## 14. Reconstruct Itinerary (Hard)

### Problem
Given airline tickets `[from, to]`, rebuild the trip starting at `"JFK"` that uses **every ticket exactly once**.
If several trips work, return the **lexically smallest**. A valid trip is guaranteed.

### Visualize it

```
   tickets: JFK→KUL, JFK→NRT, NRT→JFK

          ┌──────► KUL      (dead end: nothing leaves KUL)
          │
         JFK ◄──────┐
          │         │
          └──► NRT ─┘

   Greedy "always take the smallest": JFK → KUL → stuck  ✗ (NRT tickets unused)
   Correct:                           JFK → NRT → JFK → KUL ✅
```

### This is an Euler path

```
   "Use every EDGE exactly once" = Euler path.
   Hierholzer's algorithm:

   ┌────────────────────────────────────────────────────────────────┐
   │ 1. From the current airport, always take the smallest unused   │
   │    ticket (pop it, so it's never reused).                      │
   │ 2. When an airport has NO tickets left, add it to the route.   │
   │    (post-order: added AFTER its outgoing tickets are used)     │
   │ 3. Reverse the route at the end.                               │
   └────────────────────────────────────────────────────────────────┘

   Why post-order fixes the dead end: the dead end (KUL) gets added FIRST,
   so after reversing it lands at the END of the trip, where it belongs.
```

### Trace

```
  outgoing (sorted, pop smallest first):
     JFK: [KUL, NRT]      NRT: [JFK]      KUL: []

  visit(JFK)
     pop KUL → visit(KUL)
                 no tickets → route = [KUL]
     pop NRT → visit(NRT)
                 pop JFK → visit(JFK)
                             no tickets left → route = [KUL, JFK]
                 no tickets → route = [KUL, JFK, NRT]
     no tickets → route = [KUL, JFK, NRT, JFK]

  reverse → JFK → NRT → JFK → KUL ✅

  Classic example: [MUC→LHR, JFK→MUC, SFO→SJC, LHR→SFO]
  → JFK → MUC → LHR → SFO → SJC
```

### Pseudocode

```
function findItinerary(tickets):
    out ← map from airport → min-heap (or sorted list) of destinations
    for each [from, to] in tickets: add to to out[from]
    route ← empty list
    visit("JFK")
    return reverse(route)

function visit(airport):
    while out[airport] not empty:
        next ← pop smallest from out[airport]
        visit(next)
    append airport to route                    // post-order
```

### Complexity
Sorting / heap operations: **O(E log E)**. Each ticket is popped exactly once.

### 📌 Points to remember
- **"Use every edge once" → Euler path → Hierholzer (post-order + reverse).**
- **Pop** the ticket, so the same ticket isn't used twice. That replaces a visited set.
- Greedy smallest-first alone fails at dead ends. Post-order fixes it.
- Recursion depth = number of tickets. Can be written with an explicit stack.

---

## 15. Critical Connections in a Network (Medium)

### Problem
`n` servers and undirected `connections`. A **critical connection** (bridge) is an edge whose removal disconnects some servers.
Return all of them.

### Visualize it

```
   LC example: n = 4, connections = [[0,1],[1,2],[2,0],[1,3]]

        0 ─── 1 ═══ 3        ═══ = bridge
         ╲   ╱
          ╲ ╱                0–1–2 is a cycle: removing one of its
           2                 edges still leaves the others connected

   answer: [[1,3]]
```

### Key idea: an edge in a cycle is never a bridge

```
   Remove u–v. Is there another way back from v's side to u (or above)?
     yes (a cycle goes around)  →  not a bridge
     no                         →  BRIDGE
```

### Tarjan's tools: disc and low

```
   disc[u] = the time DFS first reached u (0, 1, 2, ...)
   low[u]  = the smallest disc reachable from u's subtree
             using tree edges down + ONE back edge up

            u   disc = 1
            │
            │  tree edge
            ▼
            v   low[v] = smallest disc v's subtree can "reach back" to

   ┌───────────────────────────────────────────────────────────┐
   │ BRIDGE  u–v   ⇔   low[v] > disc[u]                        │
   │ (v's subtree can't reach u or anything above it)          │
   └───────────────────────────────────────────────────────────┘

   Updating low[u]:
     after returning from a child v:   low[u] = min(low[u], low[v])
     back edge to a visited v ≠ parent: low[u] = min(low[u], disc[v])
```

### Trace: a 5-node graph (also used for articulation points)

```
   edges: 0-1, 1-2, 2-0, 1-3, 3-4

        0 ─── 1 ─── 3 ─── 4
         ╲   ╱
          ╲ ╱
           2

   adjacency:  0:[1,2]  1:[0,2,3]  2:[1,0]  3:[1,4]  4:[3]

  step                                   disc            low
  ───────────────────────────────────    ─────────────   ─────────────
  enter 0                                0:0             0:0
  enter 1 (from 0)                       1:1             1:1
    1 → 0: parent, skip
  enter 2 (from 1)                       2:2             2:2
    2 → 1: parent, skip
    2 → 0: back edge                                     2: min(2, disc0=0) = 0
  back at 1 from 2                                       1: min(1, low2=0) = 0
    check low[2]=0 > disc[1]=1 ? no
  enter 3 (from 1)                       3:3             3:3
    3 → 1: parent, skip
  enter 4 (from 3)                       4:4             4:4
    4 → 3: parent, skip
  back at 3 from 4                                       3: min(3, 4) = 3
    check low[4]=4 > disc[3]=3 ? YES → bridge 3–4
  back at 1 from 3                                       1: min(0, 3) = 0
    check low[3]=3 > disc[1]=1 ? YES → bridge 1–3
  back at 0 from 1                                       0: min(0, 0) = 0
    check low[1]=0 > disc[0]=0 ? no
    0 → 2: back edge                                     0: min(0, 2) = 0

  final:     node:  0  1  2  3  4
             disc:  0  1  2  3  4
             low :  0  0  0  3  4

  bridges: [1,3], [3,4] ✅
  (LC example, 4 nodes: the same trace without node 4 gives [[1,3]] ✅)
```

### Pseudocode

```
function criticalConnections(n, connections):
    adj ← undirected adjacency list
    disc ← array of n, all −1          // −1 = unvisited
    low  ← array of n
    timer ← 0
    bridges ← empty list
    for i from 0 to n-1:
        if disc[i] == −1: dfs(i, −1)
    return bridges

function dfs(u, parent):
    disc[u] ← low[u] ← timer
    timer ← timer + 1
    for each v in adj[u]:
        if v == parent: continue
        if disc[v] == −1:                       // tree edge
            dfs(v, u)
            low[u] ← min(low[u], low[v])
            if low[v] > disc[u]: add [u, v] to bridges
        else:                                   // back edge
            low[u] ← min(low[u], disc[v])
```

### Complexity
One DFS: **O(V + E)**.

### 📌 Points to remember
- **Bridge test is strict: `low[v] > disc[u]`.**
- Back edges use `disc[v]`, tree edges use `low[v]`.
- Skip only the edge back to the parent. With parallel edges, skip by edge id instead.
- Brute force (remove each edge, check connectivity) is O(E · (V + E)). Tarjan is one pass.

---

## 16. Articulation Point (Hard)

> GFG-style: given an undirected graph with `V` vertices, return all **articulation points** in sorted order
> (vertices whose removal increases the number of connected components), or `[-1]` if none exist.

### Visualize it

```
        0 ─── 1 ─── 3 ─── 4
         ╲   ╱
          ╲ ╱
           2

   remove 1 → {0, 2} and {3, 4} split apart      → 1 is an articulation point
   remove 3 → {4} is cut off                     → 3 is an articulation point
   remove 0 or 2 or 4 → still connected          → not
```

### Same disc/low as bridges, different test

```
   ┌──────────────────────────────────────────────────────────────────┐
   │ NON-ROOT u is an articulation point if it has a DFS child v with │
   │        low[v] ≥ disc[u]                                          │
   │ (v's subtree can't get ABOVE u without passing through u)        │
   │                                                                  │
   │ ROOT is an articulation point if it has ≥ 2 DFS children         │
   └──────────────────────────────────────────────────────────────────┘

   Bridge:     low[v] >  disc[u]     (can't even reach u)
   Art. point: low[v] ≥  disc[u]     (reaching u itself doesn't help: u is removed)
```

### Why the root is special

```
   Root has no "above". low[v] ≥ disc[root] = 0 is ALWAYS true,
   so the normal test would flag every root.

        root                     root
         │                      /    \
         A        not AP       A      B       AP!
         │                     (DFS needed two separate launches
         B                      from the root → removing it splits them)
```

### Trace (same disc/low as section 15)

```
  node:  0  1  2  3  4
  disc:  0  1  2  3  4
  low :  0  0  0  3  4

  u = 1 (non-root), child 2:  low[2]=0 ≥ disc[1]=1 ? no
                    child 3:  low[3]=3 ≥ disc[1]=1 ? YES → 1 is AP
  u = 3 (non-root), child 4:  low[4]=4 ≥ disc[3]=3 ? YES → 3 is AP
  u = 2: no DFS children        u = 4: no DFS children
  u = 0 (root): DFS children = {1} only (2 was reached through 1) → 1 child → not AP

  answer: [1, 3] ✅

  Root example:  1 ─── 0 ─── 2,  DFS from 0
     dfs(0) launches dfs(1), then must launch dfs(2) separately → 2 children → 0 is AP ✅
```

### Pseudocode

```
function articulationPoints(V, adj):
    disc ← array of V, all −1
    low  ← array of V
    isAP ← array of V, all false
    timer ← 0
    for i from 0 to V-1:
        if disc[i] == −1: dfs(i, −1)
    result ← every u with isAP[u], in sorted order
    return result if not empty, else [−1]

function dfs(u, parent):
    disc[u] ← low[u] ← timer
    timer ← timer + 1
    children ← 0
    for each v in adj[u]:
        if v == parent: continue
        if disc[v] == −1:
            children ← children + 1
            dfs(v, u)
            low[u] ← min(low[u], low[v])
            if parent ≠ −1 and low[v] ≥ disc[u]: isAP[u] ← true
        else:
            low[u] ← min(low[u], disc[v])
    if parent == −1 and children ≥ 2: isAP[u] ← true
```

### Complexity
One DFS: **O(V + E)**.

### 📌 Points to remember
- **AP test is `≥`, bridge test is `>`.** That's the whole difference.
- **Root rule:** count DFS children, not neighbors.
- Use a boolean `isAP` array. The same node can pass the test for several children; don't add it twice.
- Run from every unvisited vertex. The graph may be disconnected.

---

## 17. Master Cheat Sheet

### All 16 problems at a glance

```
┌─────────────────────────────┬─────────────────────────────────────────────┬──────────────┐
│ Problem                     │ Core idea                                   │ Time         │
├─────────────────────────────┼─────────────────────────────────────────────┼──────────────┤
│ Flood Fill                  │ repaint = visited; guard same color         │ O(mn)        │
│ Number of Islands           │ count DFS launches; sink land               │ O(mn)        │
│ Max Area of Island          │ DFS RETURNS 1 + sum of neighbors            │ O(mn)        │
│ Surrounded Regions          │ DFS from BORDER, mark safe, then flip       │ O(mn)        │
│ Pacific Atlantic            │ climb UPHILL from each ocean, intersect     │ O(mn)        │
│ # Connected Components      │ count DFS launches over all nodes           │ O(V+E)       │
│ Graph Valid Tree            │ E == V−1 and connected                      │ O(V+E)       │
│ Clone Graph                 │ old→new map, register before recursing     │ O(V+E)       │
│ All Paths Source→Target     │ backtracking, no visited (DAG)              │ O(2ⁿ·n)      │
│ Undirected Cycle            │ visited neighbor ≠ parent                   │ O(V+E)       │
│ Directed Cycle              │ edge into GRAY node                         │ O(V+E)       │
│ Is Graph Bipartite          │ 2-color, same color neighbor = fail         │ O(V+E)       │
│ Longest Cycle               │ ≤1 out-edge, timestamps, ≥ startTime        │ O(n)         │
│ Reconstruct Itinerary       │ Hierholzer: pop smallest, post-order, rev   │ O(E log E)   │
│ Critical Connections        │ Tarjan: low[v] > disc[u]                    │ O(V+E)       │
│ Articulation Point          │ low[v] ≥ disc[u]; root needs ≥ 2 children   │ O(V+E)       │
└─────────────────────────────┴─────────────────────────────────────────────┴──────────────┘
```

### Pattern family tree

```
                               DFS (CONNECTIVITY)
                                       │
     ┌─────────────────┬───────────────┼─────────────────┬──────────────────┐
     │                 │               │                 │                  │
   FLOOD /          COMPONENTS      CYCLES           COLORING          LOW-LINK /
   GRID             (count launches) (state)          (2 colors)        EULER
     │                 │               │                 │                  │
 ├ Flood Fill      ├ # Components  ├ Undirected     └ Bipartite      ├ Bridges
 ├ # Islands       ├ Valid Tree    │   (parent)                       ├ Articulation Pt
 ├ Max Area        ├ Clone Graph   ├ Directed                         └ Itinerary
 ├ Surrounded *    └ All Paths     │   (3 colors)                        (Hierholzer)
 └ Pac. Atlantic *    (backtrack)  └ Longest Cycle
                                       (timestamps)
   * = start from the BORDER / reverse the direction
```

### Which "visited" do I need?

```
   ┌──────────────────────────────────┬────────────────────────────────────┐
   │ Situation                        │ State to track                     │
   ├──────────────────────────────────┼────────────────────────────────────┤
   │ reachability, counting, flooding │ bool visited (or modify the grid)  │
   │ undirected cycle                 │ visited + parent                   │
   │ directed cycle / safe states     │ 3 colors (white / gray / black)    │
   │ bipartite                        │ color 0 / 1 (doubles as visited)   │
   │ copying a graph                  │ map old → new                      │
   │ all paths in a DAG               │ nothing (backtrack the path)       │
   │ cycle length, ≤1 out-edge        │ visit timestamps                   │
   │ bridges / articulation points    │ disc[] + low[]                     │
   │ use every edge once              │ pop edges (no node visited)        │
   └──────────────────────────────────┴────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Need to explore from MANY sources toward a boundary?   → reverse: start at the boundary
  ☐ Grid can be modified?                                  → mark in place, no visited grid
  ☐ Recursion could be 10⁵+ deep?                          → iterative stack or BFS
  ☐ Only counting components / detecting a cycle?         → Union-Find also works
  ☐ Testing for a tree?                                    → E == V − 1 shortcut first
  ☐ Each node has ≤ 1 out-edge?                            → simple while-walk, no recursion
  ☐ "Remove one edge / node, does it disconnect?"          → Tarjan, one pass, not brute force
```

### 🚩 Common bugs to avoid

```
  ✗ Flood Fill: new color == old color → infinite recursion
  ✗ Islands / Area: marking visited AFTER recursing → double counting
  ✗ Forgetting the outer loop → missing other components
  ✗ Undirected adjacency built in one direction only
  ✗ Undirected cycle without the parent check (every edge looks like a cycle)
  ✗ Directed cycle with plain visited (diamond gives a false cycle)
  ✗ Clone Graph: adding to the map AFTER recursing → infinite loop
  ✗ All Paths: saving the path reference instead of a copy
  ✗ Longest Cycle: counting a cycle found in an OLD walk
  ✗ Itinerary: greedy without post-order → stuck at dead ends
  ✗ Bridges `>` vs articulation `≥` mixed up; root rule forgotten
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "What do I need to remember about a node I've ALREADY seen  ║
   ║   to decide what seeing it again means?"                     ║
   ╚══════════════════════════════════════════════════════════════╝
     Just "seen"? → bool.   On my current path? → gray.   Which side? → color.
     When did I see it? → timestamp.   How high can it reach? → low.
```

---

### ✅ Progress tracker

**Part A: Grids**
- [ ] Flood Fill (Easy)
- [ ] Number of Islands (Medium)
- [ ] Max Area of Island (Medium)
- [ ] Surrounded Regions (Medium)
- [ ] Pacific Atlantic Water Flow (Medium)

**Part B: Components**
- [ ] Number of Connected Components (Medium)
- [ ] Graph Valid Tree (Medium)
- [ ] Clone Graph (Medium)
- [ ] All Paths From Source to Target (Medium)

**Part C: Cycles & Coloring**
- [ ] Undirected Graph Cycle (Easy)
- [ ] Directed Graph Cycle (Medium)
- [ ] Is Graph Bipartite (Medium)
- [ ] Longest Cycle in a Graph (Hard)

**Part D: Advanced**
- [ ] Reconstruct Itinerary (Hard)
- [ ] Critical Connections in a Network (Medium)
- [ ] Articulation Point (Hard)
