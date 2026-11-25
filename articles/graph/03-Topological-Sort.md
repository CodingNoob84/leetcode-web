# Topological Sort: A Visual Guide

> **Goal:** Learn to *see* dependency problems, order nodes so every prerequisite comes first,
> and detect when no such order exists (a cycle).
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Topological Sort?](#0-the-big-idea-what-is-topological-sort)
1. [Course Schedule (Medium)](#1-course-schedule-medium)
2. [Course Schedule II (Medium)](#2-course-schedule-ii-medium)
3. [Find All Possible Recipes from Given Supplies (Medium)](#3-find-all-possible-recipes-from-given-supplies-medium)
4. [Find Eventual Safe States (Medium)](#4-find-eventual-safe-states-medium)
5. [Alien Dictionary (Hard)](#5-alien-dictionary-hard)
6. [Minimum Height Trees (Medium)](#6-minimum-height-trees-medium)
7. [Master Cheat Sheet](#7-master-cheat-sheet)

> **Suggested order:** Course Schedule → Course Schedule II → Recipes → Safe States
> → Alien Dictionary → Minimum Height Trees.
> First learn to detect a cycle, then to output the order, then to build the graph yourself,
> then to run the idea backward, and finally to "peel" an undirected tree.

---

## 0. The Big Idea: What Is Topological Sort?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TOPOLOGICAL SORT"                      │
├──────────────────────────────────────────────────────────────────┤
│  • "prerequisites", "depends on", "must come before"            │
│  • Course schedule, build order, task scheduling, recipes        │
│  • "Is it possible to finish everything?"  → cycle check        │
│  • "Return a valid order"                   → the order itself   │
│  • A hidden order between letters / items (Alien Dictionary)     │
│  • Graph is DIRECTED (or: peel leaves of an undirected tree)     │
└──────────────────────────────────────────────────────────────────┘
```

### What is a topological order?

```
   A line-up of ALL nodes where every arrow points FORWARD.

        ┌───┐        ┌───┐
        │ 0 │──────► │ 1 │──┐
        └───┘        └───┘  │      ┌───┐
          │                 └────► │ 3 │
          │          ┌───┐  ┌────► └───┘
          └────────► │ 2 │──┘
                     └───┘

   Valid line-ups:   0 → 1 → 2 → 3
                     0 → 2 → 1 → 3        (more than one can be valid!)

   Invalid:          1 → 0 → 2 → 3        (arrow 0→1 points BACKWARD)
```

### Arrow direction convention (pick it and never mix it up)

```
   "To take course 1 you must first take course 0"
   prerequisites entry:  [1, 0]   =  [course, prereq]

   Draw the arrow FROM the thing you do first TO the thing that waits:

            prereq ───────► course
               0   ───────►   1

   ┌──────────────────────────────────────────────────────────────┐
   │ Arrow = "must happen BEFORE".  In-degree = "how many things  │
   │ am I still waiting for?"                                     │
   └──────────────────────────────────────────────────────────────┘
```

> ⚠️ LeetCode gives `[course, prereq]`, so the edge is `prereq → course`.
> Reading it backward is the #1 bug. Reversed arrows give a reversed order.

### Why a cycle kills everything

```
         ┌───┐
         │ A │ ◄──────┐
         └───┘        │       A waits for C, C waits for B, B waits for A.
           │          │       Nobody can ever start.
           ▼          │
         ┌───┐      ┌───┐     ⇒  NO topological order exists.
         │ B │ ───► │ C │
         └───┘      └───┘

   Topological order exists  ⟺  the directed graph has NO cycle (it is a DAG)
```

### Method 1: Kahn's algorithm (BFS with in-degrees)

```
   Idea: "Start with everything that waits for nobody. Finish it,
          then tell everyone who was waiting on it."

   1. in-degree[v] = number of arrows coming INTO v
   2. Put every node with in-degree 0 in a queue
   3. Pop u, append to order
        for each arrow u → v:  in-degree[v] −= 1
                               if it hits 0 → push v
   4. If order has fewer than n nodes → a CYCLE blocked the rest

         in-degree   ┌───┬───┬───┬───┐
                     │ 0 │ 1 │ 1 │ 2 │    nodes 0..3
                     └───┴───┴───┴───┘
                       ▲
                    ready! goes into the queue
```

### Method 2: DFS post-order, reversed (3 colors)

```
   Idea: "A node is FINISHED only after everything it points to is finished.
          Finished-last = should come first."

   Colors:
      ⚪ WHITE = not visited
      🔘 GRAY  = on the current recursion path ("in progress")
      ⚫ BLACK = completely finished

   dfs(u):
      color u GRAY
      for each u → v:
          if v is GRAY   → 🚨 back edge → CYCLE
          if v is WHITE  → dfs(v)
      color u BLACK, push u to post-order list

   Answer = post-order list REVERSED

   Why GRAY means a cycle:
       0 ──► 1 ──► 2
       ▲           │        while inside dfs(0) → dfs(1) → dfs(2),
       └───────────┘        2 points back to 0, which is still GRAY
                            → we walked in a circle.
```

### Side-by-side comparison

```
┌──────────────────────┬────────────────────────────┬────────────────────────────┐
│                      │ KAHN (BFS)                 │ DFS POST-ORDER             │
├──────────────────────┼────────────────────────────┼────────────────────────────┤
│ Core data            │ in-degree array + queue    │ color array + recursion    │
│ Order produced       │ directly, front to back    │ post-order, then REVERSE   │
│ Cycle detection      │ processed count < n        │ hit a GRAY node            │
│ Recursion depth risk │ none                       │ deep graphs can overflow   │
│ Natural for          │ "levels", "peeling",       │ "is this node safe?",      │
│                      │ recipes, MHT               │ path-based reasoning       │
│ Time / Space         │ O(V + E) / O(V + E)        │ O(V + E) / O(V + E)        │
└──────────────────────┴────────────────────────────┴────────────────────────────┘
```

### Multiple valid orders

```
   Whenever the queue holds 2+ nodes at once, you may pick either one.
   → Many valid answers. LeetCode accepts ANY valid one (unless it asks
     for lexicographically smallest → use a MIN-HEAP instead of a queue).
```

> 💡 **Key insight:** every topological-sort problem is the same machine.
> The work is in **building the right graph**: what are the nodes, which way do the arrows point?

---

## 1. Course Schedule (Medium)

### Problem
`numCourses` courses labeled `0..n-1`. `prerequisites[i] = [a, b]` means *take b before a*.
Can you finish **all** courses?

### Visualize it

```
   n = 4,   prerequisites = [[1,0], [2,0], [3,1], [3,2]]

   edges (prereq → course):   0→1   0→2   1→3   2→3

              ┌───┐
         ┌──► │ 1 │ ───┐
   ┌───┐ │    └───┘    ▼  ┌───┐
   │ 0 │─┤                │ 3 │       No cycle → possible ✅
   └───┘ │    ┌───┐    ▲  └───┘
         └──► │ 2 │ ───┘
              └───┘
```

### The question in disguise

```
   "Can I finish all courses?"
          ⇓
   "Does the directed graph have a cycle?"
          ⇓
   Run Kahn. Count how many nodes come out of the queue.
   count == n → true      count < n → false
```

### The 5 steps

| Step | Answer |
|------|--------|
| Nodes | courses `0..n-1` |
| Edges | `prereq → course` for each `[course, prereq]` |
| Start | every course with in-degree 0 |
| Process | pop, count it, decrement neighbors' in-degrees |
| Answer | `count == n` |

### Kahn trace

```
  in-degree start:   0:0   1:1   2:1   3:2

  step │ pop │ updates                        │ queue after │ count
  ─────┼─────┼────────────────────────────────┼─────────────┼──────
  init │  -  │ in-degree 0 → push 0           │ [0]         │  0
   1   │  0  │ 1: 1→0 push,  2: 1→0 push      │ [1, 2]      │  1
   2   │  1  │ 3: 2→1                         │ [2]         │  2
   3   │  2  │ 3: 1→0 push                    │ [3]         │  3
   4   │  3  │ (no outgoing edges)            │ []          │  4

  count = 4 = n → true ✅
```

### Cycle trace

```
   n = 2,   prerequisites = [[1,0], [0,1]]     edges: 0→1, 1→0

        ┌───┐ ───► ┌───┐
        │ 0 │      │ 1 │
        └───┘ ◄─── └───┘

   in-degree:  0:1   1:1    → nobody is 0 → queue starts EMPTY
   count = 0 < 2 → false ❌
```

### Pseudocode (Kahn)

```
function canFinish(n, prerequisites):
    adj      ← n empty lists
    indegree ← array of n zeros
    for each [course, pre] in prerequisites:
        add course to adj[pre]
        indegree[course] ← indegree[course] + 1

    queue ← all v with indegree[v] == 0
    count ← 0
    while queue not empty:
        u ← pop front
        count ← count + 1
        for each v in adj[u]:
            indegree[v] ← indegree[v] − 1
            if indegree[v] == 0: push v
    return count == n
```

### Pseudocode (DFS, 3 colors)

```
function canFinish(n, prerequisites):
    build adj as above
    color ← array of n WHITE
    for v from 0 to n−1:
        if color[v] == WHITE and hasCycle(v): return false
    return true

function hasCycle(u):
    color[u] ← GRAY
    for each v in adj[u]:
        if color[v] == GRAY: return true
        if color[v] == WHITE and hasCycle(v): return true
    color[u] ← BLACK
    return false
```

### Complexity

| | Time | Space |
|---|---|---|
| Kahn or DFS | O(V + E) | O(V + E) |

### 📌 Points to remember
- This is **pure cycle detection** in a directed graph.
- Courses with no prerequisites are still nodes. Don't forget them in the count.
- In DFS, **GRAY** (on the path) means a cycle. **BLACK** (finished) is safe to skip.
- Using a plain `visited` boolean in DFS is **wrong**: it can't tell "on my path" from "finished earlier".

---

## 2. Course Schedule II (Medium)

### Problem
Same input. Return **one valid order** to take all courses, or `[]` if impossible.

### Only one change from Course Schedule

```
   Course Schedule I:   count the popped nodes   → true / false
   Course Schedule II:  RECORD the popped nodes  → the order itself

        pop order IS the topological order
        if length(order) < n → return []
```

### Kahn trace (same graph as problem 1)

```
   edges: 0→1  0→2  1→3  2→3

   pop │ order so far    │ queue after
   ────┼─────────────────┼────────────
    -  │ []              │ [0]
    0  │ [0]             │ [1, 2]
    1  │ [0, 1]          │ [2]
    2  │ [0, 1, 2]       │ [3]
    3  │ [0, 1, 2, 3]    │ []

   length 4 = n → return [0, 1, 2, 3] ✅
```

### DFS trace (post-order, then reverse)

```
   call stack (indent = depth)        color changes        post-order
   ───────────────────────────        ─────────────        ──────────
   dfs(0)                              0: GRAY
     dfs(1)                            1: GRAY
       dfs(3)                          3: GRAY
       3 has no edges → finish         3: BLACK             [3]
     1 done → finish                   1: BLACK             [3, 1]
     dfs(2)                            2: GRAY
       edge 2→3: 3 is BLACK → skip
     2 done → finish                   2: BLACK             [3, 1, 2]
   0 done → finish                     0: BLACK             [3, 1, 2, 0]

   reverse → [0, 2, 1, 3] ✅   (different from Kahn, but equally valid)
```

```
   Why reverse?  A node finishes only AFTER all its dependents finish.
   So the post-order lists dependents first:   3 ... 0
   Flip it so prerequisites come first:         0 ... 3
```

### Pseudocode (Kahn)

```
function findOrder(n, prerequisites):
    build adj, indegree (prereq → course)
    queue ← all v with indegree 0
    order ← []
    while queue not empty:
        u ← pop front
        append u to order
        for each v in adj[u]:
            indegree[v] ← indegree[v] − 1
            if indegree[v] == 0: push v
    if length(order) == n: return order
    return []
```

### Pseudocode (DFS)

```
function findOrder(n, prerequisites):
    build adj
    color ← n × WHITE,  post ← []
    for v from 0 to n−1:
        if color[v] == WHITE and dfs(v) found a cycle: return []
    return reverse(post)

function dfs(u):                     // returns true if a cycle is found
    color[u] ← GRAY
    for each v in adj[u]:
        if color[v] == GRAY: return true
        if color[v] == WHITE and dfs(v): return true
    color[u] ← BLACK
    append u to post
    return false
```

### 📌 Points to remember
- Kahn's pop order is already correct. **DFS needs a reverse.**
- Return `[]` on a cycle, not a partial order.
- Any valid order is accepted. Don't panic if yours differs from the example.

---

## 3. Find All Possible Recipes from Given Supplies (Medium)

### Problem
`recipes[i]` needs all of `ingredients[i]`. You start with infinite `supplies`.
An ingredient may itself be another recipe. Return every recipe you can make.

### Visualize it

```
   recipes     = ["bread", "sandwich", "burger"]
   ingredients = [["yeast","flour"], ["bread","meat"], ["sandwich","meat","bread"]]
   supplies    = ["yeast", "flour", "meat"]

     yeast ──┐
             ├──► bread ──┬──────────────┐
     flour ──┘            │              ▼
                          ├──► sandwich ──► burger
     meat ────────────────┴──────────────►  ▲
                                          (meat also → burger)
```

### Build the graph yourself

```
   NODES : every name (supplies, ingredients, recipes), as strings
   EDGES : ingredient ──► recipe        ("ingredient must exist BEFORE recipe")
   IN-DEG: indegree[recipe] = number of ingredients it needs

   QUEUE START: all SUPPLIES   (they exist from the beginning)

   ┌──────────────────────────────────────────────────────────────┐
   │ A recipe is makeable ⟺ its in-degree reaches 0 in Kahn       │
   │ An ingredient that is neither a supply nor a makeable recipe │
   │ NEVER enters the queue, so its recipes stay stuck. ✅        │
   └──────────────────────────────────────────────────────────────┘
```

### Kahn trace

```
   in-degree start:  bread 2   sandwich 2   burger 3

   pop       │ edges out                       │ in-degree changes         │ queue after
   ──────────┼─────────────────────────────────┼───────────────────────────┼──────────────────────
   init      │                                 │                           │ [yeast, flour, meat]
   yeast     │ → bread                         │ bread 2→1                 │ [flour, meat]
   flour     │ → bread                         │ bread 1→0 ✅ push         │ [meat, bread]
   meat      │ → sandwich, burger              │ sandwich 2→1, burger 3→2  │ [bread]
   bread     │ → sandwich, burger              │ sandwich 1→0 ✅, burger 2→1│ [sandwich]
   sandwich  │ → burger                        │ burger 1→0 ✅ push        │ [burger]
   burger    │ (none)                          │                           │ []

   recipes that reached 0: bread, sandwich, burger ✅
```

### Pseudocode

```
function findAllRecipes(recipes, ingredients, supplies):
    adj      ← map: name → list of recipes that need it
    indegree ← map: recipe → 0
    for i from 0 to length(recipes)−1:
        for each ing in ingredients[i]:
            append recipes[i] to adj[ing]
        indegree[recipes[i]] ← length(ingredients[i])

    queue  ← all supplies
    result ← []
    while queue not empty:
        item ← pop front
        for each r in adj[item]:
            indegree[r] ← indegree[r] − 1
            if indegree[r] == 0:
                append r to result
                push r
    return result
```

### Complexity

| | Time | Space |
|---|---|---|
| Kahn over names | O(R + total ingredients + S) | same |

(Hash-map lookups on strings; multiply by average string length if you count hashing.)

### 📌 Points to remember
- **Seed the queue with supplies**, not with "in-degree 0 nodes". Supplies are the starting facts.
- Nodes are **strings** → use hash maps for `adj` and `indegree`.
- Missing ingredients need no special handling. They simply never get popped.
- Recipes in a cycle (A needs B, B needs A) never reach 0 → correctly excluded.

---

## 4. Find Eventual Safe States (Medium)

### Problem
Directed graph. A **terminal** node has no outgoing edges.
A node is **safe** if *every* path from it ends at a terminal node. Return all safe nodes, sorted.

### Visualize it

```
   graph = [[1,2], [2,3], [5], [0], [5], [], []]

        ┌───┐ ───► ┌───┐ ───► ┌───┐
        │ 0 │      │ 1 │      │ 3 │
        └───┘ ◄─────────────── └───┘       0 → 1 → 3 → 0   is a CYCLE 🔁
          │          │
          ▼          ▼
        ┌───┐ ◄──────┘
        │ 2 │ ───► ┌───┐ ◄─── ┌───┐
        └───┘      │ 5 │      │ 4 │        ┌───┐
                   └───┘      └───┘        │ 6 │   5, 6 are terminal
                                           └───┘

   Safe: 2, 4, 5, 6        Unsafe: 0, 1, 3 (they can reach the cycle)
```

### Flip the point of view

```
   "Safe" = all my exits lead to safe nodes.

   Terminal nodes are safe for free.  Work BACKWARD from them:

     original:   u ──► v
     reversed:   v ──► u       ("v being safe helps u")

   Kahn on the REVERSED graph, using OUT-DEGREE as the counter:
     • start: nodes with out-degree 0 (terminals)
     • pop v: for each u that pointed to v → outdeg[u] −= 1
              if outdeg[u] hits 0 → all of u's exits are safe → push u

   Anything never pushed is stuck on or leading to a cycle → unsafe.
```

### Kahn trace (reverse graph)

```
   out-degree:  0:2  1:2  2:1  3:1  4:1  5:0  6:0

   reverse edges (who points to me):
       rev[0] = [3]     rev[1] = [0]    rev[2] = [0, 1]
       rev[3] = [1]     rev[5] = [2, 4]

   pop │ for each u in rev[pop]       │ queue after │ safe set
   ────┼──────────────────────────────┼─────────────┼──────────────
   init│                              │ [5, 6]      │ {5, 6}
    5  │ 2: 1→0 ✅ push, 4: 1→0 ✅ push│ [6, 2, 4]   │ {5, 6, 2, 4}
    6  │ (none)                       │ [2, 4]      │
    2  │ 0: 2→1,  1: 2→1              │ [4]         │
    4  │ (none)                       │ []          │

   sorted safe set → [2, 4, 5, 6] ✅      (0, 1, 3 never hit 0 → unsafe)
```

### Alternative: 3-color DFS

```
   Same colors as cycle detection, but the meaning is sharper:
      GRAY  that stays GRAY  → unsafe (part of / leads to a cycle)
      BLACK                  → safe

   dfs(0): 0 GRAY
     → 1: GRAY
         → 2: GRAY
             → 5: GRAY, no edges → BLACK ✅ safe
           2 → BLACK ✅ safe
         → 3: GRAY
             → 0 is GRAY 🚨 cycle → return unsafe (3 stays GRAY)
       1 returns unsafe (stays GRAY)
   0 returns unsafe (stays GRAY)
   dfs(4): → 5 BLACK → 4 BLACK ✅
   dfs(6): no edges → BLACK ✅

   BLACK nodes: 2, 4, 5, 6 ✅
```

### Pseudocode (reverse Kahn)

```
function eventualSafeNodes(graph):
    n      ← number of nodes
    rev    ← n empty lists
    outdeg ← array of n
    for u from 0 to n−1:
        outdeg[u] ← length(graph[u])
        for each v in graph[u]:
            append u to rev[v]

    queue ← all u with outdeg[u] == 0
    safe  ← n × false
    while queue not empty:
        v ← pop front
        safe[v] ← true
        for each u in rev[v]:
            outdeg[u] ← outdeg[u] − 1
            if outdeg[u] == 0: push u
    return all u with safe[u], in increasing order
```

### Pseudocode (DFS)

```
function eventualSafeNodes(graph):
    color ← n × WHITE
    return all u (0..n−1) where isSafe(u)

function isSafe(u):
    if color[u] != WHITE: return color[u] == BLACK
    color[u] ← GRAY
    for each v in graph[u]:
        if not isSafe(v): return false      // leave u GRAY = unsafe
    color[u] ← BLACK
    return true
```

### 📌 Points to remember
- **Reverse the graph** and count **out-degree**: that turns "all paths end safely" into plain Kahn.
- In DFS, **don't reset GRAY to WHITE** on failure. GRAY marks "unsafe" for later calls.
- Output must be **sorted**. Loop `0..n−1` at the end instead of returning pop order.
- Time O(V + E), space O(V + E).

---

## 5. Alien Dictionary (Hard)

> LeetCode Premium (269). Also on LintCode / NeetCode as "Alien Dictionary".

### Problem
A list of words is sorted in an unknown alien alphabet. Return a string of the letters in a valid order,
or `""` if the input is contradictory.

### Visualize it

```
   words = ["wrt", "wrf", "er", "ett", "rftt"]

   Compare each ADJACENT pair. Only the FIRST differing letter tells you anything:

     w r t           w r f            e r         e t t        r f t t
     w r f           e r              e t t       r f t t
         ▲           ▲                  ▲         ▲
       t < f        w < e             r < t     e < r

   edges:   t → f     w → e     r → t     e → r

      w ──► e ──► r ──► t ──► f          order: "wertf" ✅
```

### Why only the first difference?

```
   Like a real dictionary:  "cat" < "cow"  because  a < o.
   The letters AFTER that ('t' vs 'w') say NOTHING.
   → Find the first mismatch, add ONE edge, then STOP comparing this pair.
```

### The prefix trap 🚨

```
   words = ["abc", "ab"]

     a b c
     a b          no differing letter, yet the LONGER word came first
                  → impossible in any alphabet → return ""

   Rule: if word1 is longer and word2 is a prefix of word1 → invalid.
```

### Build the graph

```
   NODES: EVERY distinct letter that appears in ANY word
          (letters with no edges still must appear in the answer!)
   EDGES: first-difference letter pairs, deduplicated
   THEN : Kahn. If output length < number of letters → cycle → ""
```

### Kahn trace

```
   letters: w, r, t, f, e
   edges:   t→f, w→e, r→t, e→r

   in-degree:  w:0   e:1   r:1   t:1   f:1

   pop │ updates            │ queue after │ result
   ────┼────────────────────┼─────────────┼────────
   init│                    │ [w]         │ ""
    w  │ e: 1→0 push        │ [e]         │ "w"
    e  │ r: 1→0 push        │ [r]         │ "we"
    r  │ t: 1→0 push        │ [t]         │ "wer"
    t  │ f: 1→0 push        │ [f]         │ "wert"
    f  │ (none)             │ []          │ "wertf"

   length 5 = 5 letters → "wertf" ✅
```

### Cycle example

```
   words = ["z", "x", "z"]
      z vs x → z → x
      x vs z → x → z          z ⇄ x  cycle

   in-degree:  z:1  x:1   → queue empty → result "" (length 0 < 2) ❌
```

### Pseudocode

```
function alienOrder(words):
    letters  ← set of every character in every word
    adj      ← map: letter → set of letters
    indegree ← map: letter → 0   (for every letter)

    for i from 0 to length(words)−2:
        w1 ← words[i],  w2 ← words[i+1]
        if length(w1) > length(w2) and w2 is a prefix of w1:
            return ""                                  // prefix trap
        for j from 0 to min(len(w1), len(w2))−1:
            if w1[j] != w2[j]:
                if w2[j] not in adj[w1[j]]:            // dedupe edges
                    add w2[j] to adj[w1[j]]
                    indegree[w2[j]] ← indegree[w2[j]] + 1
                break                                  // only the FIRST difference

    queue  ← all letters with indegree 0
    result ← ""
    while queue not empty:
        c ← pop front
        result ← result + c
        for each d in adj[c]:
            indegree[d] ← indegree[d] − 1
            if indegree[d] == 0: push d

    if length(result) < size(letters): return ""
    return result
```

### Complexity

| | Time | Space |
|---|---|---|
| Build + Kahn | O(C) where C = total characters | O(1) extra: at most 26 letters, 26² edges |

### 📌 Points to remember
- Compare **adjacent** words only. Sorted order is transitive, so that's enough.
- **First differing letter only**, then `break`.
- **Prefix trap**: `["abc", "ab"]` → `""`.
- **Every letter is a node**, even ones with no edges.
- **Deduplicate edges**, or in-degrees get counted twice and never reach 0.

---

## 6. Minimum Height Trees (Medium)

> This problem also appears in `02-BFS-Pattern.md`. Here we focus on the
> **topological "leaf-peeling"** view, which is Kahn's algorithm on an undirected tree.

### Problem
An undirected tree with `n` nodes. Choosing node `r` as root gives height `h(r)`.
Return all roots that give the **minimum** height.

### Visualize it

```
   n = 6,  edges = [[3,0],[3,1],[3,2],[3,4],[5,4]]

        0   1   2
         \  |  /
           (3)
            |
           (4)
            |
            5

   Root at 3 → height 2.   Root at 4 → height 2.   Root at 0 → height 3.
   Answer: [3, 4] ✅
```

### The key insight: the answer is the CENTER of the tree

```
   The tallest root-to-leaf distance is decided by the LONGEST path.
   The best root sits in the MIDDLE of the longest path.

   longest path:   0 ── 3 ── 4 ── 5      (4 nodes)
                         ▲    ▲
                      two middle nodes → answer [3, 4]

   A path has 1 middle (odd length) or 2 middles (even length)
   → the answer ALWAYS has 1 or 2 nodes.
```

### Leaf peeling = Kahn on an undirected tree

```
   Like peeling an onion from the OUTSIDE in:

   round 1:  remove all leaves (degree 1)       0, 1, 2, 5
   round 2:  new leaves appear                  3, 4
   stop when ≤ 2 nodes remain → they are the centers

   ┌────────────────────────────────────────────────────────────┐
   │ Topological sort       │ Leaf peeling                      │
   │ in-degree 0 → ready    │ degree 1 → leaf                   │
   │ pop → decrement        │ remove leaf → decrement neighbor  │
   │ hits 0 → push          │ hits 1 → new leaf, push           │
   └────────────────────────────────────────────────────────────┘
```

### Trace

```
   degrees:  0:1  1:1  2:1  3:4  4:2  5:1
   remaining = 6

   round │ leaves removed │ degree updates                        │ new leaves │ remaining
   ──────┼────────────────┼───────────────────────────────────────┼────────────┼──────────
     1   │ 0, 1, 2, 5     │ 3: 4→3→2→1 (new leaf), 4: 2→1 (leaf)  │ [3, 4]     │ 6−4 = 2
         │                │                                       │            │
   remaining = 2 ≤ 2 → stop → answer [3, 4] ✅
```

### Second example (one center)

```
   n = 4, edges = [[1,0],[1,2],[1,3]]

         0
         |
         1 ── 2
         |
         3

   degrees: 0:1  1:3  2:1  3:1     remaining = 4

   round 1: remove 0, 2, 3 → 1: 3→2→1 (push as leaf) →0     remaining = 1
   stop → answer [1] ✅
```

### Pseudocode

```
function findMinHeightTrees(n, edges):
    if n == 1: return [0]                 // ⚠ edge case: no edges, no leaves
    adj    ← n empty lists
    degree ← n zeros
    for each [a, b] in edges:
        add b to adj[a], add a to adj[b]
        degree[a]++, degree[b]++

    leaves    ← all v with degree[v] == 1
    remaining ← n
    while remaining > 2:
        remaining ← remaining − length(leaves)
        next ← []
        for each leaf in leaves:
            for each nb in adj[leaf]:
                degree[nb] ← degree[nb] − 1
                if degree[nb] == 1: append nb to next
        leaves ← next
    return leaves
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| BFS from every node, take min height | O(n²) | O(n) |
| **Leaf peeling** | **O(n)** | **O(n)** ✅ |

### 📌 Points to remember
- The answer has **1 or 2** nodes. Stop peeling at **≤ 2 remaining**.
- Peel a **whole layer at a time** (process all current leaves, then switch to `next`).
- Push a neighbor when its degree hits **1**, not 0.
- `n == 1` → `[0]`. Without this the loop finds no leaves.

---

## 7. Master Cheat Sheet

### All 6 problems at a glance

```
┌───────────────────────────┬──────────────────────────────────┬─────────────────────────┬───────────┐
│ Problem                   │ Graph you build                  │ Answer                  │ Best      │
├───────────────────────────┼──────────────────────────────────┼─────────────────────────┼───────────┤
│ Course Schedule           │ prereq → course                  │ popped count == n       │ O(V+E)    │
│ Course Schedule II        │ prereq → course                  │ pop order, [] if cycle  │ O(V+E)    │
│ Recipes from Supplies     │ ingredient → recipe (strings)    │ recipes reaching 0      │ O(V+E)    │
│ Eventual Safe States      │ REVERSED graph, out-degree       │ nodes reaching 0, sorted│ O(V+E)    │
│ Alien Dictionary          │ first-diff letter pairs          │ pop order, "" if cycle  │ O(C)      │
│ Minimum Height Trees      │ undirected tree, degree 1 leaves │ last ≤ 2 nodes left     │ O(n)      │
└───────────────────────────┴──────────────────────────────────┴─────────────────────────┴───────────┘
```

### Pattern family tree

```
                           TOPOLOGICAL SORT
                                  │
      ┌──────────────────┬────────┴─────────┬───────────────────┐
      │                  │                  │                   │
  CYCLE CHECK        PRODUCE ORDER      BUILD THE GRAPH    VARIANT COUNTERS
  (count == n?)      (record pops)      (hidden edges)     (not in-degree)
      │                  │                  │                   │
  └ Course         └ Course           ├ Recipes          ├ Safe States
    Schedule         Schedule II      │  (seed with       │  (reverse + out-deg)
                                      │   supplies)       └ Min Height Trees
                                      └ Alien Dictionary     (degree-1 leaves)
                                         (first diff)
```

### Kahn template (memorize this)

```
   build adj + counter
   queue ← nodes whose counter is at the start value
   while queue not empty:
       u ← pop
       record u
       for each neighbor v:
           counter[v] −= 1
           if counter[v] hits the "ready" value: push v
   if recorded < total → cycle
```

### Which counter? Which start?

```
   ┌───────────────────────┬──────────────────┬────────────────────────┐
   │ Problem               │ Counter          │ Ready when             │
   ├───────────────────────┼──────────────────┼────────────────────────┤
   │ Course Schedule I/II  │ in-degree        │ 0                      │
   │ Recipes               │ # ingredients    │ 0 (seed: supplies)     │
   │ Safe States           │ out-degree       │ 0 (on reversed graph)  │
   │ Alien Dictionary      │ in-degree        │ 0                      │
   │ Minimum Height Trees  │ degree           │ 1                      │
   └───────────────────────┴──────────────────┴────────────────────────┘
```

### Kahn vs DFS: when to choose

```
  ☐ Need the order level by level / peeling?      → Kahn
  ☐ Graph can be very deep (10⁵ chain)?           → Kahn (no recursion)
  ☐ "Is THIS node safe / on a cycle?"             → 3-color DFS
  ☐ Need lexicographically smallest order?        → Kahn with a MIN-HEAP
  ☐ Just need a yes/no cycle answer?              → either
```

### 🚩 Common bugs to avoid

```
  ✗ Edge direction backward: [course, prereq] means prereq → course
  ✗ DFS with a plain visited flag (can't tell "on path" from "done")
  ✗ Forgetting to REVERSE the DFS post-order
  ✗ Returning a partial order instead of [] / "" on a cycle
  ✗ Recipes: seeding the queue with in-degree-0 recipes instead of supplies
  ✗ Safe States: not sorting the output; resetting GRAY nodes to WHITE
  ✗ Alien Dict: comparing past the first difference; missing the prefix trap;
               forgetting letters with no edges; duplicate edges
  ✗ MHT: stopping at 1 instead of ≤ 2; n == 1 edge case; pushing at degree 0
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What MUST happen before what?  Draw that arrow.        ║
   ║   Then: who is ready right now, with nothing to wait on?"║
   ╚══════════════════════════════════════════════════════════╝
     The first half builds the graph. The second half starts Kahn's queue.
```

---

### ✅ Progress tracker

- [ ] Course Schedule (Medium)
- [ ] Course Schedule II (Medium)
- [ ] Find All Possible Recipes from Given Supplies (Medium)
- [ ] Find Eventual Safe States (Medium)
- [ ] Alien Dictionary (Hard)
- [ ] Minimum Height Trees (Medium)
