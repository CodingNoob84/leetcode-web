# MST / Union-Find: A Visual Guide

> **Goal:** Learn to *see* "group things together" and "connect everything cheaply" problems,
> trace the parent array by hand, and pick between Kruskal and Prim.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Union-Find and MST](#0-the-big-idea-union-find-and-mst)
1. [Redundant Connection (Medium)](#1-redundant-connection-medium)
2. [Number of Operations to Make Network Connected (Medium)](#2-number-of-operations-to-make-network-connected-medium)
3. [Most Stones Removed with Same Row or Column (Medium)](#3-most-stones-removed-with-same-row-or-column-medium)
4. [Lexicographically Smallest Equivalent String (Medium)](#4-lexicographically-smallest-equivalent-string-medium)
5. [Accounts Merge (Medium)](#5-accounts-merge-medium)
6. [Minimum Spanning Tree (Medium)](#6-minimum-spanning-tree-medium)
7. [Connecting Cities with Minimum Cost (Medium)](#7-connecting-cities-with-minimum-cost-medium)
8. [Min Cost to Connect All Points (Medium)](#8-min-cost-to-connect-all-points-medium)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** the first five problems are pure Union-Find (grouping).
> The last three are MST (cheapest way to connect everything), which reuses Union-Find inside Kruskal.
> Redundant Connection → Network Connected → Most Stones → Equivalent String → Accounts Merge
> → Minimum Spanning Tree → Connecting Cities → Connect All Points.

---

## 0. The Big Idea: Union-Find and MST

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "UNION-FIND / MST"                      │
├──────────────────────────────────────────────────────────────────┤
│  • "Are a and b in the same group / connected?"                  │
│  • "How many groups / components / provinces?"                   │
│  • Edges arrive one by one and you must react to each            │
│  • "Which edge creates a cycle / is redundant?"                  │
│  • Things are "equivalent" and equivalence is TRANSITIVE         │
│      (a ~ b and b ~ c  ⇒  a ~ c)                                 │
│  • "MINIMUM COST to connect ALL nodes"           → MST           │
│  • Weighted edges, no start/end node, connect everyone → MST     │
└──────────────────────────────────────────────────────────────────┘
```

### Union-Find (DSU) = a forest of trees

```
  Every group is a TREE. The ROOT is the group's "name tag".
  Each node only remembers its PARENT.

        Group A            Group B        Group C

          1                  5               7
        ↗   ↖               ↑
       2     3              6
       ↑
       4

  parent:  node : 1  2  3  4  5  6  7
           par  : 1  1  1  2  5  5  7      (a root is its own parent)

  "Are 4 and 3 in the same group?"
     find(4) → 4 → 2 → 1        root 1
     find(3) → 3 → 1            root 1     same root ✅
```

### The two operations

```
  ┌──────────────┬──────────────────────────────────────────────────┐
  │ find(x)      │ Walk up parents until you hit the root.          │
  │              │ Returns the group's name tag.                    │
  ├──────────────┼──────────────────────────────────────────────────┤
  │ union(a, b)  │ ra = find(a), rb = find(b)                       │
  │              │ if ra == rb → already together (return false)    │
  │              │ else hang one root under the other (return true) │
  └──────────────┴──────────────────────────────────────────────────┘
```

### Speed-up 1: path compression (inside find)

```
  BEFORE find(4)                 AFTER find(4)

        1                              1
        ↑                          ↗  ↑  ↖
        2                         2   3   4
        ↑
        3                  Every node on the path now points
        ↑                  DIRECTLY at the root.
        4                  The next find(4) takes 1 step.

  find(x):
      if parent[x] ≠ x:
          parent[x] ← find(parent[x])     // re-point to root on the way back
      return parent[x]
```

### Speed-up 2: union by rank (or size)

```
  Always hang the SHORTER tree under the TALLER one.

     WRONG (tall under short)         RIGHT (short under tall)

        5                                  1
        ↑                               ↗  ↑  ↖
        1          height grows          2   3   5
      ↗ ↑ ↖                              ↑
     2  3  4                             4

  rank[r] ≈ height of the tree rooted at r.
  If ranks are equal, pick either root and increase its rank by 1.
```

> 💡 With **both** speed-ups, each operation costs **α(n)** (inverse Ackermann), which is
> at most 4 for any realistic n. Treat it as **O(1)**.

### The key insight: same root ⇒ cycle

```
   Adding edge (a, b):

   find(a) ≠ find(b)                  find(a) == find(b)
   ┌───┐        ┌───┐                 ┌─────────────┐
   │ a │ ─────► │ b │                 │  a ···· b   │
   └───┘        └───┘                 │   ╲    ╱    │  a and b are ALREADY
   two groups merge into one          │    root     │  connected → this new edge
   components − 1                     └─────────────┘  closes a CYCLE (redundant)
```

### The components counter

```
   components ← n                      (everyone starts alone)
   every SUCCESSFUL union → components ← components − 1
   a FAILED union (same root) → nothing changes, edge is "extra"
```

### MST: Minimum Spanning Tree

```
   Given: a connected, weighted, undirected graph.
   Want:  a subset of edges that
            • connects ALL V nodes              (spanning)
            • has NO cycle → exactly V−1 edges  (tree)
            • has the SMALLEST total weight     (minimum)

          Graph (5 edges)                MST (3 edges, total 7)

        0 ───1─── 1                      0 ───1─── 1
         ╲       ╱ ╲                              ╱
          3     2   5                            2
           ╲   ╱     ╲                          ╱
             2 ───4─── 3                      2 ───4─── 3

        dropped: 0-2 (3) and 1-3 (5), both would close a cycle
```

### Kruskal vs Prim side by side

```
  ┌───────────────────────────────┬───────────────────────────────────┐
  │ KRUSKAL  (edge-centric)       │ PRIM  (node-centric)              │
  ├───────────────────────────────┼───────────────────────────────────┤
  │ Sort ALL edges by weight.     │ Start from any node.              │
  │ Walk cheapest → expensive.    │ Grow ONE tree outward.            │
  │ Take an edge if it joins two  │ Always add the CHEAPEST edge that │
  │ DIFFERENT groups (DSU).       │ leaves the tree (min-heap).       │
  │ Skip it if same group (cycle).│ Skip popped nodes already inside. │
  │                               │                                   │
  │  many small trees MERGE       │  one tree GROWS                   │
  │   ●─●   ●   ●─●   →  ●─●─●─●  │   ●  →  ●─●  →  ●─●─●  → ...      │
  ├───────────────────────────────┼───────────────────────────────────┤
  │ O(E log E)                    │ heap:  O(E log V)                 │
  │                               │ array: O(V²)                      │
  ├───────────────────────────────┼───────────────────────────────────┤
  │ Best when you are GIVEN an    │ Best for DENSE / COMPLETE graphs  │
  │ edge list, graph is SPARSE    │ (every pair is an edge, E ≈ V²)   │
  │                               │ → use the O(V²) array version     │
  └───────────────────────────────┴───────────────────────────────────┘
```

> 💡 **Why greedy works (cut property):** split the nodes into any two sides. The cheapest
> edge crossing between the sides is always safe to put in the MST. Both Kruskal and Prim
> just keep picking such "cheapest crossing" edges.

### The DSU template (you will reuse this in every problem)

```
init(n):
    parent[i] ← i  for all i
    rank[i]   ← 0  for all i
    components ← n

find(x):
    if parent[x] ≠ x:
        parent[x] ← find(parent[x])
    return parent[x]

union(a, b):
    ra ← find(a), rb ← find(b)
    if ra == rb: return false               // already connected
    if rank[ra] < rank[rb]: swap(ra, rb)    // ra is the taller root
    parent[rb] ← ra
    if rank[ra] == rank[rb]: rank[ra] ← rank[ra] + 1
    components ← components − 1
    return true
```

> In every trace below, on a rank tie the **first** argument's root becomes the parent.

---

## 1. Redundant Connection (Medium)

### Problem
A tree with `n` nodes (labelled 1..n) had **one extra edge** added. Given the edges in order,
return the edge that can be removed so the result is a tree. If several answers exist,
return the one that appears **last** in the input.

### Visualize it

```
   edges = [1,2] [2,3] [3,4] [1,4] [1,5]

        1 ─── 2
        │     │
        4 ─── 3          [1,4] closes the loop 1-2-3-4-1
        │
   (1)──5   (5 hangs off 1)
```

### The decision at every edge

```
                 Edge (a, b) arrives
                        │
            find(a) == find(b) ?
             ┌──────────┴──────────┐
            YES                    NO
             │                      │
   a and b already connected   union(a, b)
   → THIS edge makes a cycle   keep going
   → return (a, b)
```

> Why "the first edge that fails" is also "the last one in the input that could be removed":
> the cycle only exists once its final edge arrives, so that edge is the latest cycle edge.

### The 5 steps

| Step | Answer |
|------|--------|
| State | DSU over nodes 1..n |
| Transition | for each edge: if same root → answer, else union |
| Base | every node is its own parent |
| Order | edges in input order |
| Answer | the first edge whose endpoints already share a root |

### Trace

```
  node      :  1  2  3  4  5
  start     :  1  2  3  4  5      parent array

  edge [1,2]: roots 1,2 differ → parent[2]=1         →  1  1  3  4  5
  edge [2,3]: roots 1,3 differ → parent[3]=1         →  1  1  1  4  5
  edge [3,4]: roots 1,4 differ → parent[4]=1         →  1  1  1  1  5
  edge [1,4]: find(1)=1, find(4)=1  SAME ROOT        →  return [1,4] ✅

  Forest after 3 unions:       1
                             ↗ ↑ ↖
                            2  3  4      5 (alone)
```

> Smaller example: `[1,2] [1,3] [2,3]` → `[2,3]` is the first edge whose ends share root 1.

### Pseudocode

```
function findRedundantConnection(edges):
    n ← number of edges            // a tree on n nodes + 1 edge has n edges
    init DSU over 1..n
    for each (a, b) in edges:
        if not union(a, b):
            return (a, b)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| For each edge, DFS to check if a, b already connected | O(n²) | O(n) |
| **DSU** | **O(n · α(n))** | **O(n)** ✅ |

### 📌 Points to remember
- `union` returning **false** is the cycle detector. This is the most used DSU trick.
- Nodes are 1-indexed here. Size the parent array `n + 1`.
- Directed version (Redundant Connection II, LC 685) is harder: a node may have two parents.

---

## 2. Number of Operations to Make Network Connected (Medium)

### Problem
`n` computers, `connections[i] = [a, b]` are cables. You may **unplug any cable and re-plug it**
between any two computers. Return the minimum number of moves to connect all computers, or **−1**.

### Visualize it

```
   n = 6, cables: 0-1 0-2 0-3 1-2 1-3

        0 ──── 1
        │ ╲  ╱ │             4      5
        │  ╳   │           (alone) (alone)
        2    3
     (1-2 and 1-3 are SPARE: the group was already connected without them)

   3 groups: {0,1,2,3}  {4}  {5}
   Need 2 bridges between groups, and we have 2 spare cables → answer 2
```

### Two facts decide everything

```
  ┌──────────────────────────────────────────────────────────────────┐
  │ FACT 1: connecting n computers needs at least n − 1 cables.      │
  │         cables < n − 1  →  impossible  →  return −1              │
  ├──────────────────────────────────────────────────────────────────┤
  │ FACT 2: k groups need exactly k − 1 bridges.                     │
  │         Every move uses one spare cable to make one bridge.      │
  │         answer = components − 1                                  │
  └──────────────────────────────────────────────────────────────────┘

   Why enough spare cables always exist when cables ≥ n − 1:
     spare = cables − (n − components)        (cables not needed inside groups)
     cables ≥ n − 1  ⇒  spare ≥ components − 1 ✓
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | DSU with a components counter |
| Transition | union every cable |
| Base | `components = n` |
| Order | any order |
| Answer | `−1` if cables < n−1, else `components − 1` |

### Trace (n = 6)

```
  cable   │ result                       │ components
  ────────┼──────────────────────────────┼───────────
  start   │                              │    6
  0-1     │ merge                        │    5
  0-2     │ merge                        │    4
  0-3     │ merge                        │    3
  1-2     │ same root → spare cable      │    3
  1-3     │ same root → spare cable      │    3

  cables = 5 ≥ n−1 = 5 ✓   →   answer = 3 − 1 = 2 ✅

  Other examples:
    n=4, [0-1, 0-2, 1-2]         → cables 3 ≥ 3, groups {0,1,2},{3} → 1
    n=6, [0-1, 0-2, 0-3, 1-2]    → cables 4 < 5                     → −1
```

### Pseudocode

```
function makeConnected(n, connections):
    if length(connections) < n − 1: return −1
    init DSU over 0..n−1          // components ← n
    for each (a, b) in connections:
        union(a, b)
    return components − 1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| DFS/BFS to count components | O(n + E) | O(n + E) |
| **DSU** | **O(n + E · α(n))** | **O(n)** ✅ |

### 📌 Points to remember
- Check `cables < n − 1` **first**. It is the only way to get −1.
- You never need to know *which* cables are spare, just that there are enough.
- "Count the groups" problems → DSU components counter or DFS. Both work.

---

## 3. Most Stones Removed with Same Row or Column (Medium)

### Problem
Stones sit on a 2D grid. You may remove a stone if **another stone shares its row or column**.
Return the maximum number of stones you can remove.

### Visualize it

```
   stones = (0,0) (0,1) (1,0) (1,2) (2,1) (2,2)

          col 0  col 1  col 2
   row 0    ●      ●      ·
   row 1    ●      ·      ●
   row 2    ·      ●      ●

   Stones that share a row or column are "linked".
   Linking is TRANSITIVE → it forms groups.
   Here every stone ends up in ONE group.
```

### The key insight: each group shrinks to 1 stone

```
   A group of k linked stones → you can always remove k − 1 of them.
   (Remove leaves of a spanning tree first; the last stone stays.)

   group:  ●──●──●──●      remove from the ends inward
           ●──●──●         ...
           ●                1 stone left

   ┌──────────────────────────────────────────────────┐
   │  answer = (number of stones) − (number of groups)│
   └──────────────────────────────────────────────────┘
```

### The trick: union ROWS with COLUMNS, not stones with stones

```
   Comparing every pair of stones is O(n²).
   Instead, treat each ROW and each COLUMN as a node.
   A stone at (r, c) is an EDGE joining node "R r" and node "C c".

        R0 ──(0,0)── C0
        R0 ──(0,1)── C1
        R1 ──(1,0)── C0
        R1 ──(1,2)── C2
        R2 ──(2,1)── C1
        R2 ──(2,2)── C2

   Keep row and column keys apart: e.g. column c → key (c + 10001), or ~c.
   Count groups only among keys that some stone actually touched.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | DSU over row keys and column keys (a hash map is easiest) |
| Transition | for each stone `(r, c)`: `union(R r, C c)` |
| Base | a key joins the DSU the first time a stone touches it (components + 1) |
| Order | any order |
| Answer | `stones − components` |

### Trace 1 (6 stones → 5)

```
  stone  │ union        │ new keys added │ components after
  ───────┼──────────────┼────────────────┼─────────────────
  (0,0)  │ R0 – C0      │ R0, C0  (+2)   │ 2 → merge → 1
  (0,1)  │ R0 – C1      │ C1      (+1)   │ 2 → merge → 1
  (1,0)  │ R1 – C0      │ R1      (+1)   │ 2 → merge → 1
  (1,2)  │ R1 – C2      │ C2      (+1)   │ 2 → merge → 1
  (2,1)  │ R2 – C1      │ R2      (+1)   │ 2 → merge → 1
  (2,2)  │ R2 – C2      │ —              │ same root → 1

  answer = 6 − 1 = 5 ✅
```

### Trace 2 (5 stones → 3)

```
   stones = (0,0) (0,2) (1,1) (2,0) (2,2)

          col 0  col 1  col 2
   row 0    ●      ·      ●
   row 1    ·      ●      ·
   row 2    ●      ·      ●

   unions: R0–C0, R0–C2, R1–C1, R2–C0, R2–C2
   groups: {R0, C0, C2, R2}   {R1, C1}   → 2

   answer = 5 − 2 = 3 ✅     (the middle stone is alone in its group)
```

### Pseudocode

```
function removeStones(stones):
    DSU with a hash map, components ← 0
    add(key):  if key not in parent: parent[key] ← key, components ← components + 1
    for each (r, c) in stones:
        add(r), add(c + OFFSET)
        union(r, c + OFFSET)          // a successful union does components − 1
    return length(stones) − components
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| DSU over stones, compare all pairs | O(n² · α) | O(n) |
| **DSU over row/col keys** | **O(n · α)** | **O(n)** ✅ |

### 📌 Points to remember
- Big idea: **answer = items − groups.** Each group keeps exactly one survivor.
- Model **rows and columns as nodes**, stones as edges. This pattern reappears often.
- Use an offset so row 3 and column 3 don't collide.

---

## 4. Lexicographically Smallest Equivalent String (Medium)

### Problem
`s1[i]` and `s2[i]` are **equivalent** characters. Equivalence is reflexive, symmetric and
**transitive**. Rewrite `baseStr` replacing each character with the **smallest** equivalent character.

### Visualize it

```
   s1 = "parker"
   s2 = "morris"
         ││││││
   pairs: p~m  a~o  r~r  k~r  e~i  r~s

   groups:  {m, p}   {a, o}   {k, r, s}   {e, i}
   smallest:   m        a          k         e

   baseStr = "parser"
               p→m  a→a  r→k  s→k  e→e  r→k   →  "makkek" ✅
```

### The twist: the ROOT is always the smallest letter

```
   Normal union-by-rank picks the root by height.
   Here we pick the root by LETTER:  the smaller letter becomes the root.

   union(a, b):
       ra ← find(a), rb ← find(b)
       if ra == rb: return
       if ra < rb: parent[rb] ← ra        // smaller letter stays root
       else:       parent[ra] ← rb

   Then find(c) IS the answer for character c.
   (Only 26 nodes, so trees stay tiny even without rank.)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | DSU over 26 letters, root = smallest letter of the group |
| Transition | union every pair `(s1[i], s2[i])` |
| Base | each letter is its own parent |
| Order | pairs in any order |
| Answer | `find(c)` for each `c` in `baseStr` |

### Trace

```
  pair   │ roots        │ action               │ groups so far
  ───────┼──────────────┼──────────────────────┼─────────────────────────
  p ~ m  │ p, m         │ m < p → parent[p]=m  │ {m,p}
  a ~ o  │ a, o         │ a < o → parent[o]=a  │ {m,p} {a,o}
  r ~ r  │ r, r         │ same, skip           │
  k ~ r  │ k, r         │ k < r → parent[r]=k  │ {m,p} {a,o} {k,r}
  e ~ i  │ e, i         │ e < i → parent[i]=e  │ ... {e,i}
  r ~ s  │ find(r)=k, s │ k < s → parent[s]=k  │ {m,p} {a,o} {k,r,s} {e,i}

  baseStr "parser":
     p → m,  a → a,  r → k,  s → k,  e → e,  r → k     →  "makkek" ✅
```

### Pseudocode

```
function smallestEquivalentString(s1, s2, baseStr):
    parent[c] ← c for each letter c
    for i from 0 to length(s1) − 1:
        unionSmallest(s1[i], s2[i])
    result ← ""
    for each c in baseStr:
        result ← result + find(c)
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Build graph, DFS per letter for min | O(26 · (26 + n)) | O(26 + n) |
| **DSU with min-root** | **O(n + m)** (α(26) is tiny) | **O(26)** ✅ |

### 📌 Points to remember
- You can choose **any rule** for which root wins. Here "smallest letter" makes `find` return the answer directly.
- Always union **roots**, not the raw characters. `parent[s] = r` would be wrong when r is not a root.
- Transitive "equivalence" in the statement = DSU.

---

## 5. Accounts Merge (Medium)

### Problem
Each account is `[name, email1, email2, ...]`. Two accounts belong to the same person if they
**share any email**. Merge them. Output each person as `[name, sorted emails...]`.

### Visualize it

```
   acct 0: John  johnsmith@mail.com   john_newyork@mail.com
   acct 1: John  johnsmith@mail.com   john00@mail.com
   acct 2: Mary  mary@mail.com
   acct 3: John  johnnybravo@mail.com

   acct 0 ──(johnsmith@mail.com)── acct 1      → same person
   acct 2   alone
   acct 3   alone (same NAME is NOT enough!)
```

### The approach: union ACCOUNT INDICES through shared emails

```
   owner = map  email → first account index that had it

   for each account i, for each email e in it:
       if e not in owner:  owner[e] ← i
       else:               union(i, owner[e])      ← shared email links accounts

   Then group every email under find(owner[e]), sort, prepend the name.

   ┌──────────┐   shared email   ┌──────────┐
   │ acct 0   │ ───────────────► │ acct 1   │    union(1, 0)
   └──────────┘                  └──────────┘
```

> Alternative: make **emails** the DSU nodes and union every email in an account with its first
> email. It gives the same groups. The index version needs a smaller DSU (one node per account).

### The 5 steps

| Step | Answer |
|------|--------|
| State | DSU over account indices + map `email → owner index` |
| Transition | when an email is seen again → `union(current, owner)` |
| Base | each account is its own group |
| Order | accounts in input order |
| Answer | for each root: name of root account + sorted emails of the group |

### Trace

```
  account │ email                    │ owner map action       │ union
  ────────┼──────────────────────────┼────────────────────────┼──────────────
  0       │ johnsmith@mail.com       │ new → 0                │
  0       │ john_newyork@mail.com    │ new → 0                │
  1       │ johnsmith@mail.com       │ SEEN, owner 0          │ union(1, 0)
  1       │ john00@mail.com          │ new → 1                │
  2       │ mary@mail.com            │ new → 2                │
  3       │ johnnybravo@mail.com     │ new → 3                │

  parent:  0→0   1→0   2→2   3→3        groups: {0,1} {2} {3}

  collect by root:
     root 0: johnsmith, john_newyork, john00
     root 2: mary
     root 3: johnnybravo

  sort emails (ASCII order: '0' < '_' < 's'):
     ["John", "john00@mail.com", "john_newyork@mail.com", "johnsmith@mail.com"]
     ["Mary", "mary@mail.com"]
     ["John", "johnnybravo@mail.com"]   ✅
```

### Pseudocode

```
function accountsMerge(accounts):
    init DSU over 0..n−1
    owner ← empty map
    for i from 0 to n−1:
        for each email e in accounts[i] (skip the name):
            if e in owner: union(i, owner[e])
            else:          owner[e] ← i
    groups ← map root → list of emails
    for each (e, i) in owner:
        append e to groups[find(i)]
    result ← []
    for each (root, emails) in groups:
        sort emails
        append [accounts[root][0]] + emails to result
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Email graph + DFS | O(N log N) | O(N) |
| **DSU over accounts** | **O(N log N)** (sorting dominates) | **O(N)** ✅ |

`N` = total number of emails across all accounts.

### 📌 Points to remember
- Link by **email**, never by name. Two different "John"s stay separate.
- Iterate the `owner` map at the end, so every email is listed once (no duplicates).
- Sort each group's emails before output.

---

## 6. Minimum Spanning Tree (Medium)

### Problem
(GFG version.) Given a connected, weighted, undirected graph with `V` nodes, return the
**total weight** of its Minimum Spanning Tree.

### The example graph (used for both algorithms)

```
   edges:  0-1 (1)   1-2 (2)   0-2 (3)   2-3 (4)   1-3 (5)

             1
        0 ───────── 1
         ╲         ╱ ╲
        3 ╲     2 ╱   ╲ 5
           ╲     ╱     ╲
             2 ──────── 3
                  4

   MST: 0-1 (1) + 1-2 (2) + 2-3 (4) = 7
```

### Kruskal trace: sort edges, take if different groups

```
  sorted edge │ find(a), find(b) │ action          │ parent [0,1,2,3] │ total
  ────────────┼──────────────────┼─────────────────┼──────────────────┼──────
  0-1 (1)     │ 0, 1             │ TAKE            │ [0, 0, 2, 3]     │  1
  1-2 (2)     │ 0, 2             │ TAKE            │ [0, 0, 0, 3]     │  3
  0-2 (3)     │ 0, 0             │ SKIP (cycle!)   │ [0, 0, 0, 3]     │  3
  2-3 (4)     │ 0, 3             │ TAKE            │ [0, 0, 0, 0]     │  7
              │                  │ 3 edges = V−1 → STOP                │
  1-3 (5)     │ (never looked at)│                 │                  │

  MST weight = 7 ✅
```

```
  How the forest evolves:

   start      after 0-1     after 1-2      after 2-3
   0 1 2 3    0─1  2  3     0─1─2  3       0─1─2─3
                               (0-2 skipped: 0 and 2 already joined)
```

### Prim trace: grow from node 0 with a min-heap

```
  heap holds (weight, node). Pop the cheapest; skip if already in the tree.

  pop      │ in tree?  │ action                         │ push (new neighbours) │ total
  ─────────┼───────────┼────────────────────────────────┼───────────────────────┼──────
  (0, 0)   │ no        │ add 0                          │ (1,1) (3,2)           │  0
  (1, 1)   │ no        │ add 1                          │ (2,2) (5,3)           │  1
  (2, 2)   │ no        │ add 2                          │ (4,3)                 │  3
  (3, 2)   │ YES       │ skip (old, worse entry for 2)  │                       │  3
  (4, 3)   │ no        │ add 3                          │                       │  7
  (5, 3)   │ YES       │ skip                           │                       │  7

  MST weight = 7 ✅     (same answer, different route)
```

```
  How the tree grows:

   {0}  →  {0,1}  →  {0,1,2}  →  {0,1,2,3}
    ●       ●─●       ●─●─●        ●─●─●─●
```

### Pseudocode: Kruskal

```
function kruskal(V, edges):
    sort edges by weight
    init DSU over 0..V−1
    total ← 0, used ← 0
    for each (u, v, w) in edges:
        if union(u, v):
            total ← total + w
            used  ← used + 1
            if used == V − 1: break
    return total
```

### Pseudocode: Prim (heap)

```
function prim(V, adj):
    inTree ← array of V, all false
    heap ← {(0, start=0)}
    total ← 0
    while heap not empty:
        (w, u) ← pop min
        if inTree[u]: continue
        inTree[u] ← true
        total ← total + w
        for each (v, wt) in adj[u]:
            if not inTree[v]: push (wt, v)
    return total
```

### Complexity

| Algorithm | Time | Space | Best for |
|---|---|---|---|
| Kruskal | O(E log E) | O(V + E) | edge list given, sparse graph |
| Prim (heap) | O(E log V) | O(V + E) | adjacency list |
| Prim (array) | O(V²) | O(V) | dense / complete graph |

### 📌 Points to remember
- An MST always has exactly **V − 1 edges**. Stop Kruskal early when you have them.
- Kruskal **skips** edges that close a cycle. Prim **skips** popped nodes already in the tree.
- Prim's heap can hold stale entries (like `(3, 2)` above). The "already in tree?" check handles them.
- If the MST is not unique, the **total weight** still is.

---

## 7. Connecting Cities with Minimum Cost (Medium)

### Problem
(LeetCode premium, LC 1135.) `n` cities labelled 1..n, `connections[i] = [a, b, cost]`.
Return the minimum cost to connect **all** cities, or **−1** if impossible.

> This is **problem 6 with a feasibility check**: a plain Kruskal that also counts edges used.

### Visualize it

```
   n = 3, connections: [1,2,5] [1,3,6] [2,3,1]

         5
     1 ───── 2
      ╲     ╱
     6 ╲   ╱ 1
        ╲ ╱
         3

   MST: 2-3 (1) + 1-2 (5) = 6 ✅
```

### When is it impossible?

```
   After processing ALL edges:
       edges used == n − 1   →  everyone connected  →  return total
       edges used <  n − 1   →  some city unreachable →  return −1

   n = 4, connections: [1,2,3] [3,4,4]
       1 ── 2        3 ── 4       two islands, used = 2 < 3  →  −1
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | DSU over 1..n, `total`, `used` |
| Transition | sorted edges: take if `union` succeeds |
| Base | `total = 0`, `used = 0` |
| Order | cheapest edge first |
| Answer | `used == n−1 ? total : −1` |

### Trace (n = 3)

```
  sorted edge │ roots   │ action │ used │ total
  ────────────┼─────────┼────────┼──────┼──────
  2-3 (1)     │ 2, 3    │ TAKE   │  1   │  1
  1-2 (5)     │ 1, 2    │ TAKE   │  2   │  6      used = n−1 → stop
  1-3 (6)     │ —       │ —      │      │

  answer = 6 ✅
```

### Pseudocode

```
function minimumCost(n, connections):
    sort connections by cost
    init DSU over 1..n
    total ← 0, used ← 0
    for each (a, b, cost) in connections:
        if union(a, b):
            total ← total + cost
            used  ← used + 1
            if used == n − 1: return total
    return −1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| **Kruskal** | **O(E log E)** | **O(n)** ✅ |
| Prim (heap) | O(E log n) | O(n + E) |

### 📌 Points to remember
- Return the total **only if** `used == n − 1`. Otherwise the graph is disconnected.
- Cities are 1-indexed. Size the parent array `n + 1`.
- Alternatively: check `components == 1` at the end.

---

## 8. Min Cost to Connect All Points (Medium)

### Problem
Points on a 2D plane. Cost to connect two points = **Manhattan distance** `|x1−x2| + |y1−y2|`.
Return the minimum cost to connect all points.

### Visualize it

```
   P0 (0,0)   P1 (2,2)   P2 (3,10)   P3 (5,2)   P4 (7,0)

     y
    10 ┤        P2
       │
     2 ┤   P1      P3
     0 ┤P0            P4
       └──────────────────── x

   EVERY pair is an edge → complete graph, E = V(V−1)/2.
```

### Why Prim with an array (not Kruskal)

```
   Kruskal: build all V²/2 edges, sort them   → O(V² log V) time, O(V²) memory
   Prim (heap):  pushes up to V² entries       → O(V² log V)
   Prim (array): no heap, no edge list         → O(V²) time, O(V) memory ✅

   For a COMPLETE graph, the plain-array Prim is the cleanest and fastest.
```

### Array Prim, the idea

```
   dist[v] = cheapest known edge from the tree to v   (∞ at start)

   repeat V times:
       1. pick the non-tree point u with the smallest dist[u]   (linear scan)
       2. add u to the tree, total += dist[u]
       3. for every non-tree v: dist[v] = min(dist[v], manhattan(u, v))
```

### Distance table (computed by hand)

```
         P0   P1   P2   P3   P4
   P0     -    4   13    7    7
   P1     4    -    9    3    7
   P2    13    9    -   10   14
   P3     7    3   10    -    4
   P4     7    7   14    4    -
```

### Trace (start at P0)

```
  step │ pick (dist) │ total │ dist after update  [P0, P1, P2, P3, P4]
  ─────┼─────────────┼───────┼─────────────────────────────────────────
  1    │ P0  (0)     │   0   │ [ ✓,  4, 13,  7,  7 ]
  2    │ P1  (4)     │   4   │ [ ✓,  ✓,  9,  3,  7 ]   P2: min(13,9)  P3: min(7,3)
  3    │ P3  (3)     │   7   │ [ ✓,  ✓,  9,  ✓,  4 ]   P4: min(7,4)
  4    │ P4  (4)     │  11   │ [ ✓,  ✓,  9,  ✓,  ✓ ]   P2: min(9,14) = 9
  5    │ P2  (9)     │  20   │ done

  answer = 20 ✅

  MST edges:  P0─P1 (4),  P1─P3 (3),  P3─P4 (4),  P1─P2 (9)
```

### Pseudocode

```
function minCostConnectPoints(points):
    n ← length(points)
    dist   ← array of n, all ∞
    inTree ← array of n, all false
    dist[0] ← 0
    total ← 0
    repeat n times:
        u ← index of min dist[] among non-tree points
        inTree[u] ← true
        total ← total + dist[u]
        for v from 0 to n−1:
            if not inTree[v]:
                dist[v] ← min(dist[v], |xu − xv| + |yu − yv|)
    return total
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Kruskal on all pairs | O(n² log n) | O(n²) |
| Prim with heap | O(n² log n) | O(n²) heap entries |
| **Prim with array** | **O(n²)** | **O(n)** ✅ |

### 📌 Points to remember
- **Complete graph ⇒ array Prim.** Don't build the edge list at all.
- `dist[v]` stores the cheapest edge from the **whole tree** to v, not from the last node.
- Starting point doesn't matter. The MST weight is the same.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────────────┬─────────────────────────────────────────────┬────────────────────┬───────────────┐
│ Problem                      │ Core idea                                   │ Answer             │ Time          │
├──────────────────────────────┼─────────────────────────────────────────────┼────────────────────┼───────────────┤
│ Redundant Connection         │ first edge whose ends share a root          │ that edge          │ O(n·α)        │
│ Network Connected            │ components counter                          │ −1 or comps − 1    │ O(n + E·α)    │
│ Most Stones Removed          │ union row-key with col-key                  │ stones − comps     │ O(n·α)        │
│ Smallest Equivalent String   │ root = smallest letter                      │ find(c) per char   │ O(n + m)      │
│ Accounts Merge               │ union accounts via shared email             │ groups, sorted     │ O(N log N)    │
│ Minimum Spanning Tree        │ Kruskal or Prim                             │ MST weight         │ O(E log E)    │
│ Connecting Cities            │ Kruskal + count used edges                  │ total or −1        │ O(E log E)    │
│ Connect All Points           │ array Prim on complete graph                │ MST weight         │ O(n²)         │
└──────────────────────────────┴─────────────────────────────────────────────┴────────────────────┴───────────────┘
```

### Pattern family tree

```
                          UNION-FIND / MST
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
  CYCLE DETECTION          GROUP COUNTING /           MINIMUM SPANNING
  (union fails)            GROUPING                    TREE
        │                        │                         │
  └─ Redundant           ├─ Network Connected        ├─ Minimum Spanning Tree
     Connection          ├─ Most Stones Removed      │    (Kruskal & Prim)
                         ├─ Smallest Equiv. String   ├─ Connecting Cities
                         └─ Accounts Merge           │    (Kruskal + −1 check)
                                                     └─ Connect All Points
                                                          (array Prim)
```

### What to union? (the modelling step)

```
   ┌──────────────────────────────┬──────────────────────────────────────┐
   │ Problem                      │ DSU nodes / what gets unioned        │
   ├──────────────────────────────┼──────────────────────────────────────┤
   │ Redundant Connection         │ graph nodes, each edge               │
   │ Network Connected            │ computers, each cable                │
   │ Most Stones Removed          │ ROW keys + COLUMN keys, each stone   │
   │ Smallest Equivalent String   │ 26 letters, each (s1[i], s2[i])      │
   │ Accounts Merge               │ account indices, via shared emails   │
   │ MST / Cities                 │ graph nodes, cheapest edges first    │
   └──────────────────────────────┴──────────────────────────────────────┘
```

### Kruskal or Prim?

```
   Given an EDGE LIST, sparse graph          → Kruskal  (sort + DSU)
   Given an ADJACENCY LIST                   → Prim     (heap)
   COMPLETE graph (points, all pairs)        → Prim     (array, O(V²))
   Need "is it even connected?" too          → Kruskal, check used == V−1
```

### Optimization checklist

```
  ☐ Path compression in find?                → near O(1) per operation
  ☐ Union by rank / size?                    → keeps trees flat
  ☐ Is there a natural "winner" root?        → pick it (smallest letter, etc.)
  ☐ Keys are not 0..n−1?                     → DSU on a hash map
  ☐ Comparing all pairs of items?            → find a shared key to union on instead
  ☐ Complete graph MST?                      → array Prim, skip building edges
  ☐ Kruskal has V−1 edges already?           → stop early
```

### 🚩 Common bugs to avoid

```
  ✗ Union the RAW nodes instead of their ROOTS  (parent[b] = a  ✗   parent[rb] = ra  ✓)
  ✗ Forgetting path compression → TLE on long chains
  ✗ 1-indexed nodes with a size-n parent array (Redundant Connection, Cities)
  ✗ Network Connected: forgetting the cables < n−1 → −1 check
  ✗ Most Stones: row 3 and column 3 colliding (no offset)
  ✗ Accounts Merge: merging by NAME, or not sorting emails
  ✗ Kruskal: returning total without checking used == n−1
  ✗ Prim: not skipping already-in-tree nodes popped from the heap
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What are the THINGS, and what makes two of them        ║
   ║   belong to the SAME GROUP?"                             ║
   ╚══════════════════════════════════════════════════════════╝
     Things = DSU nodes. "Same group" rule = what you union.
     Add "...as cheaply as possible?" and it becomes MST.
```

---

### ✅ Progress tracker

- [ ] Redundant Connection (Medium)
- [ ] Number of Operations to Make Network Connected (Medium)
- [ ] Most Stones Removed with Same Row or Column (Medium)
- [ ] Lexicographically Smallest Equivalent String (Medium)
- [ ] Accounts Merge (Medium)
- [ ] Minimum Spanning Tree (Medium)
- [ ] Connecting Cities with Minimum Cost (Medium)
- [ ] Min Cost to Connect All Points (Medium)
