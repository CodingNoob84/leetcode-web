# DP on Trees / DAGs: A Visual Guide

> **Goal:** Learn to *see* tree DP problems, compute each node's answer from its children, and keep it linear.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-1D-Linear-DP.md](01-1D-Linear-DP.md) (House Robber) and [02-2D-Grid-DP.md](02-2D-Grid-DP.md) (Longest Increasing Path).

---

## Table of Contents

0. [The Big Idea: What Is Tree DP?](#0-the-big-idea-what-is-tree-dp)
1. [House Robber III (Medium)](#1-house-robber-iii-medium)
2. [Path Sum III (Medium)](#2-path-sum-iii-medium)
3. [Binary Tree Cameras (Hard)](#3-binary-tree-cameras-hard)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** House Robber III → Path Sum III → Binary Tree Cameras.
> House Robber III teaches "return two states per node". Path Sum III teaches "carry state DOWN and undo it".
> Binary Tree Cameras combines both ideas with three states and a greedy rule.

---

## 0. The Big Idea: What Is Tree DP?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TREE DP"                               │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a BINARY TREE / N-ary tree / DAG                     │
│  • "Max/min over a choice per node" (rob it? camera here?)       │
│  • A choice at a node RESTRICTS its parent or children           │
│    (can't rob adjacent nodes, a camera covers neighbors)         │
│  • "Count paths with sum K" going downward                       │
│  • The answer for a node depends on answers of its SUBTREES      │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: children report up to their parent

```
                         ┌───────┐
                         │ ROOT  │  ◄── combines both reports → final answer
                         └───┬───┘
                   ▲─────────┴─────────▲
                   │ report            │ report
               ┌───┴───┐           ┌───┴───┐
               │   A   │           │   B   │   ◄── each node waits for its
               └───┬───┘           └───┬───┘       children, then reports up
             ▲─────┴─────▲             ▲
             │           │             │
          ┌──┴──┐     ┌──┴──┐       ┌──┴──┐
          │  C  │     │  D  │       │  E  │   ◄── leaves report first
          └─────┘     └─────┘       └─────┘

   Visit order (POST-ORDER):  C → D → A → E → B → ROOT
   "Left subtree, right subtree, THEN me."
```

> In 1D DP you filled boxes left → right. In tree DP you fill nodes **bottom → up**.
> Post-order traversal gives you exactly that order for free.

### Why post-order?

```
   A node's answer needs its children's answers.
   Post-order = children are ALWAYS finished before the parent.

      pre-order   (me, left, right)  →  parent first  ✗ children not ready
      in-order    (left, me, right)  →  right child not ready  ✗
      post-order  (left, right, me)  →  both children ready  ✓
```

### The power move: return a TUPLE of states

```
   One number per node is often not enough.
   The parent needs to know "what if this child is in state X?"

         ┌─────────────────────────┐
         │ node returns:           │
         │   ( stateA , stateB )   │    e.g. (rob, skip)
         └─────────────────────────┘      or (no-cover, camera, covered)

   The parent picks the combination it can legally use.
   This replaces a memo table: each node is computed exactly ONCE.
```

### Memo on nodes vs. returning tuples

```
  NAIVE recursion that asks a node for ONE number often calls
  grandchildren again and again:

        f(root) calls f(child) AND f(grandchild)
        f(child) calls f(grandchild) again       ← repeated work, exponential

  FIX 1: memo table keyed by node     → hashmap[node] = answer      O(n)
  FIX 2: return all states at once    → no hashmap needed           O(n) ✅
```

### The 5-step recipe (tree version)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  STATE        f(node) = ______ for the SUBTREE at node │
 │                      (often a tuple: one value per state)     │
 │ STEP 2  TRANSITION   combine f(left) and f(right) + node.val  │
 │ STEP 3  BASE         f(null) = neutral value (0, or "covered")│
 │ STEP 4  ORDER        post-order DFS                           │
 │ STEP 5  ANSWER       usually built from f(root)               │
 └───────────────────────────────────────────────────────────────┘
```

### Two directions of information flow

```
   BOTTOM-UP (return values)              TOP-DOWN (parameters)
   children → parent                      parent → children

        ▲  ▲                                   │
        │  │                                   ▼  ▼
   "What's best in my subtree?"           "What's on the path above me?"

   House Robber III, Cameras              Path Sum III (prefix sums)
```

### DAG note: same idea, general graph

```
   A tree is a DAG where every node has one parent.
   For a general DAG:
      • DFS + memo on each node (a node may have many parents → memo is REQUIRED)
      • or process nodes in TOPOLOGICAL order (all dependencies first)

   You already did this in 02-2D-Grid-DP.md → Longest Increasing Path:
   the "strictly increasing" moves formed a DAG, so DFS + memo was safe.
```

---

## 1. House Robber III (Medium)

### Problem
Houses form a **binary tree**. You can't rob two **directly connected** houses (parent and child). Maximize the loot.

### Bridge from 01's House Robber

```
     House Robber (line)                    House Robber III (tree)

   [2]─[7]─[9]─[3]─[1]                            [3]
                                                 /   \
   neighbor = i-1 and i+1                      [2]   [3]
                                                 \     \
                                                 [3]   [1]

   dp[i] = max(dp[i-1], dp[i-2]+x)        neighbors = parent and children
                                          → each node returns (rob, skip)
```

### Why "rob every other level" FAILS 🚫

```
          [2]
         /   \
       [1]   [3]          levels: 2 | 1,3 | 4
         \                even levels: 2 + 4 = 6
         [4]              odd  levels: 1 + 3 = 4

   But 4 + 3 = 7 is legal (4 and 3 are NOT connected) ✅
   Levels are the wrong unit. Decide per NODE.
```

### The state: two numbers per node

```
               ┌──────────────────────────┐
               │ node returns (rob, skip) │
               └──────────────────────────┘

   rob  = best for this subtree IF this node IS robbed
        = node.val + left.skip + right.skip
                        ▲            ▲
                 children MUST be skipped

   skip = best for this subtree IF this node is NOT robbed
        = max(left.rob, left.skip) + max(right.rob, right.skip)
                 ▲
         each child is free to do whatever is best
```

### State diagram

```
                     ┌──────── node ────────┐
                     │                      │
                   ROB it                 SKIP it
                     │                      │
        children forced to SKIP     children choose freely
                     │                      │
       val + L.skip + R.skip      max(L.rob,L.skip) + max(R.rob,R.skip)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `f(node) = (rob, skip)` for the subtree at `node` |
| Transition | `rob = val + L.skip + R.skip`; `skip = max(L) + max(R)` |
| Base | `f(null) = (0, 0)` |
| Order | post-order |
| Answer | `max(root.rob, root.skip)` |

### Trace

```
             [3]
            /   \
         [2]     [3]
            \       \
            [3]     [1]

   node              rob                   skip                 (rob, skip)
   ───────────────── ───────────────────── ──────────────────── ───────────
   leaf 3 (under 2)  3 + 0 + 0 = 3         0 + 0 = 0            (3, 0)
   leaf 1            1 + 0 + 0 = 1         0 + 0 = 0            (1, 0)
   node 2            2 + 0 + 0 = 2         0 + max(3,0) = 3     (2, 3)
   node 3 (right)    3 + 0 + 0 = 3         0 + max(1,0) = 1     (3, 1)
   root 3            3 + 3 + 1 = 7         max(2,3)+max(3,1)=6  (7, 6)

   answer = max(7, 6) = 7 ✅      rob root 3 + leaf 3 + leaf 1
```

### Second trace (skipping the root wins)

```
              [3]
             /   \
          [4]     [5]
         /   \       \
       [1]   [3]     [1]

   leaves 1, 3, 1        → (1,0), (3,0), (1,0)
   node 4: rob = 4 + 0 + 0 = 4    skip = 1 + 3 = 4          → (4, 4)
   node 5: rob = 5 + 0     = 5    skip = 1                  → (5, 1)
   root 3: rob = 3 + 4 + 1 = 8    skip = max(4,4)+max(5,1)=9 → (8, 9)

   answer = 9 ✅      rob 4 and 5
```

### Pseudocode

```
function rob(root):
    (r, s) ← dfs(root)
    return max(r, s)

function dfs(node):                       // returns (rob, skip)
    if node is null: return (0, 0)
    (lRob, lSkip) ← dfs(node.left)
    (rRob, rSkip) ← dfs(node.right)
    robIt  ← node.val + lSkip + rSkip
    skipIt ← max(lRob, lSkip) + max(rRob, rSkip)
    return (robIt, skipIt)
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Naive: `max(val + grandchildren, children)` | exponential | O(h) |
| Same + memo by node (hashmap) | O(n) | O(n) |
| **Return (rob, skip) pair** | **O(n)** | **O(h)** stack ✅ |

> `h` = tree height. O(log n) for a balanced tree, O(n) for a skewed one.

### 📌 Points to remember
- **Two states per node** replaces the `dp[i-1]` / `dp[i-2]` look-back from the 1D version.
- If you rob a node, **both** children must be skipped.
- If you skip a node, each child picks **its own** best, independently.
- Pattern reused for: Maximum Independent Set on trees, "Employee party" problems.

---

## 2. Path Sum III (Medium)

### Problem
Count the paths whose node values sum to `targetSum`.
A path must go **downward** (parent → child), but it can start and end **anywhere**.

### Visualize it (target = 8)

```
                 [10]
                /    \
             [5]      [-3]
            /   \        \
          [3]   [2]      [11]
         /   \     \
       [3]  [-2]   [1]

   Paths that sum to 8:
     5 → 3            = 8
     5 → 2 → 1        = 8
    -3 → 11           = 8          → 3 paths ✅
```

### Brute force: start a walk from every node

```
   For each node X:
       walk down every path from X, count sums == target

   Number of starts × length of walk
   balanced tree: O(n log n)      skewed tree (a line): O(n²)
```

### Key idea: 1D prefix sums, on a root-to-node path

```
   Any downward path lies on ONE root-to-node line. Look at that line as an array:

   root ─► ... ─► A ─► ... ─► current
                   ▲              ▲
           prefix sum P(A)    prefix sum P(cur)

   sum of the path strictly below A down to cur = P(cur) − P(A)

   Want:  P(cur) − P(A) = target   ⟺   P(A) = P(cur) − target

   ┌─────────────────────────────────────────────────────────────┐
   │ Keep a hashmap: prefixSum → how many times it appears       │
   │ on the CURRENT root-to-node path.                           │
   │ At each node: count += map[ curr − target ]                 │
   └─────────────────────────────────────────────────────────────┘
```

> Same trick as "Subarray Sum Equals K" in arrays, and as the prefix sums in
> 01's Count of Range Sum. The tree only adds one twist: **backtracking**.

### The backtracking twist

```
   The map must hold ONLY the ancestors of the current node.

        going DOWN into a node   →  map[curr] += 1
        coming back UP           →  map[curr] −= 1   ← undo!

   Without undo, a prefix from the LEFT subtree would "leak" into the
   RIGHT subtree and count paths that bend through siblings (illegal).

             [5]
            /   \
          [3]   [2]      when visiting 2, prefix of 3 must be GONE
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `map[p]` = how many ancestors (plus a virtual start) have prefix sum `p` |
| Transition | `count += map[curr − target]`, then recurse into children |
| Base | `map = {0: 1}` (empty prefix, so paths starting at the root count) |
| Order | pre-order going down, undo on the way up |
| Answer | the total `count` |

### Trace (target = 8)

```
  node   curr   need = curr − 8   map has need?   found   map after adding curr
  ────── ────── ───────────────── ─────────────── ─────── ──────────────────────
  10      10         2               no             0     {0,10}
  5       15         7               no             0     {0,10,15}
  3       18        10               yes (10)       1 ◄   {0,10,15,18}   5→3
  3       21        13               no             0     add 21, then remove
  -2      16         8               no             0     add 16, then remove
  (back up from 3: remove 18)
  2       17         9               no             0     {0,10,15,17}
  1       18        10               yes (10)       1 ◄   add 18, remove   5→2→1
  (back up: remove 17, then 15)
  -3       7        -1               no             0     {0,10,7}
  11      18        10               yes (10)       1 ◄   -3→11

  total = 3 ✅
```

### Pseudocode

```
function pathSum(root, target):
    map ← { 0 : 1 }
    return dfs(root, 0)

function dfs(node, prefix):
    if node is null: return 0
    curr  ← prefix + node.val
    count ← map.get(curr − target, 0)         // paths ending HERE
    map[curr] ← map.get(curr, 0) + 1          // go down
    count ← count + dfs(node.left,  curr)
    count ← count + dfs(node.right, curr)
    map[curr] ← map[curr] − 1                 // come back up (undo)
    return count
```

> ⚠️ Look up `curr − target` **before** adding `curr`. Otherwise, with `target = 0`,
> the node would match itself and count an empty path.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Start a DFS from every node | O(n²) worst | O(h) |
| **Prefix sum + hashmap + backtrack** | **O(n)** | O(n) ✅ |

### 📌 Points to remember
- **Downward path = subarray of a root-to-node line** → prefix sums.
- Seed the map with `{0: 1}`.
- **Undo** on the way back up. This is what makes it a path, not any two nodes.
- Use **64-bit** sums: values up to 10⁹ overflow 32-bit.
- Information flows **top-down** here (passed as a parameter), unlike House Robber III.

---

## 3. Binary Tree Cameras (Hard)

### Problem
Place cameras on nodes. A camera covers **itself, its parent, and its children**.
Find the **minimum number of cameras** that cover every node.

### Visualize it

```
           [ ]                    [ ]  covered by 📷 below
           /                      /
         [ ]          ──►       [📷]   one camera covers all 4 nodes
        /   \                  /    \
      [ ]   [ ]              [ ]    [ ]

                     answer = 1 ✅
```

### Key insight: never put a camera on a leaf

```
   Camera on a LEAF covers: leaf + parent                  (2 nodes)
   Camera on its PARENT covers: leaf + siblings + parent + grandparent  (more!)

   ┌─────────────────────────────────────────────────────────────┐
   │ GREEDY: work from the leaves UP. Place a camera as LATE      │
   │ (as high) as possible, only when a child would be left       │
   │ uncovered otherwise.                                         │
   └─────────────────────────────────────────────────────────────┘
   Bottom-up = post-order again.
```

### The 3 states each node reports to its parent

```
   ┌────────────────┬────────────────────────────────────────────────┐
   │ NOT_COVERED    │ "Nobody covers me. Parent, YOU need a camera." │
   │ HAS_CAMERA     │ "I have a camera. Parent, you're covered."     │
   │ COVERED        │ "A child's camera covers me. I need nothing."  │
   └────────────────┴────────────────────────────────────────────────┘

   null child → COVERED   (it needs nothing, and it must not force a camera)
```

### The rules (check in THIS order)

```
   look at (left state, right state):

   ① ANY child NOT_COVERED   →  put a camera HERE,  cams += 1,  return HAS_CAMERA
   ② ANY child HAS_CAMERA    →  I'm covered,                    return COVERED
   ③ otherwise (both COVERED) → nobody covers me,              return NOT_COVERED

   ⚠ Rule ① must be checked first: a child that needs help beats
     a child that already has a camera.
```

### State diagram

```
             children states
     ┌────────────┼──────────────────┐
     │            │                  │
  any NOT_      any HAS_          both COVERED
  COVERED       CAMERA            (or null)
     │            │                  │
     ▼            ▼                  ▼
  📷 HAS_CAMERA  COVERED          NOT_COVERED
  (cams + 1)                      (ask parent)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `f(node)` ∈ {NOT_COVERED, HAS_CAMERA, COVERED} + a global counter |
| Transition | rules ① ② ③ above |
| Base | `f(null) = COVERED` |
| Order | post-order |
| Answer | `cams`, **plus 1 if the root is NOT_COVERED** |

### Trace 1

```
           [R]
           /
         [A]
        /   \
      [B]   [C]

   B: children null, null → both COVERED → ③ NOT_COVERED
   C: same                              → ③ NOT_COVERED
   A: a child NOT_COVERED → ① 📷, cams = 1 → HAS_CAMERA
   R: left HAS_CAMERA, right null (COVERED) → ② COVERED

   root covered → answer = 1 ✅
```

### Trace 2: the root special case

```
   A straight line of 4 nodes:

      [R] ── [A] ── [B] ── [C]
      top                  leaf

   C: leaf                         → NOT_COVERED
   B: child NOT_COVERED → 📷 cams=1 → HAS_CAMERA
   A: child HAS_CAMERA             → COVERED
   R: child COVERED                → NOT_COVERED   ← nobody above R to help!

   root is NOT_COVERED → cams + 1 = 2 ✅      cameras on B and R
```

> Compare a line of 5 nodes (root on the left): states from the leaf up are
> NOT_COVERED → 📷 → COVERED → NOT_COVERED → 📷 (root, via rule ①). The root already has a
> camera, so no extra step is needed. The answer is still 2.

### Pseudocode (greedy)

```
NOT_COVERED ← 0,  HAS_CAMERA ← 1,  COVERED ← 2
cams ← 0

function minCameraCover(root):
    if dfs(root) == NOT_COVERED:
        cams ← cams + 1                        // root special case
    return cams

function dfs(node):
    if node is null: return COVERED
    L ← dfs(node.left)
    R ← dfs(node.right)
    if L == NOT_COVERED or R == NOT_COVERED:
        cams ← cams + 1
        return HAS_CAMERA
    if L == HAS_CAMERA or R == HAS_CAMERA:
        return COVERED
    return NOT_COVERED
```

### Alternative: pure DP with 3 min-cost states (no greedy proof needed)

```
  Each node returns three numbers (min cameras in its subtree):

   d0 = node NOT covered, everything BELOW covered  (parent must cover it)
   d1 = node covered by a CHILD's camera, no camera here
   d2 = camera HERE

   d0 = L.d1 + R.d1
   d1 = min( L.d2 + min(R.d1, R.d2),  R.d2 + min(L.d1, L.d2) )
   d2 = 1 + min(L.d0, L.d1, L.d2) + min(R.d0, R.d1, R.d2)

   null → (d0 = 0, d1 = 0, d2 = ∞)     // a null can't hold a camera
   answer = min(root.d1, root.d2)      // root must end covered

   Check, single node: d0 = 0, d1 = ∞, d2 = 1 → answer 1 ✓
```

> Same idea as House Robber III's `(rob, skip)`, with one more state.
> Use this version when the cost per camera differs by node (greedy breaks then).

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try every subset of nodes | O(2ⁿ · n) | O(n) |
| 3-state DP | O(n) | O(h) |
| **Greedy from leaves** | **O(n)** | **O(h)** ✅ |

### 📌 Points to remember
- `null` returns **COVERED**, so leaves report NOT_COVERED and their parents get the camera.
- Check **NOT_COVERED before HAS_CAMERA** in the rules.
- **Root special case:** nothing sits above the root, so if it reports NOT_COVERED, add one camera.
- Greedy works because a parent's camera always covers at least as much as a leaf's camera.
- Related: Minimum Dominating Set on trees, "Distribute Coins in Binary Tree" (also post-order).

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────┬────────────────────────────────────────────┬────────────────────┬──────────┐
│ Problem              │ State / core idea                          │ Answer             │ Best     │
├──────────────────────┼────────────────────────────────────────────┼────────────────────┼──────────┤
│ House Robber III     │ (rob, skip) per node                       │ max(root pair)     │ O(n),O(h)│
│                      │ rob = val + L.skip + R.skip                │                    │          │
│                      │ skip = max(L) + max(R)                     │                    │          │
│ Path Sum III         │ prefix-sum hashmap on root-to-node path,   │ total count        │ O(n),O(n)│
│                      │ count map[curr − target], undo on return   │                    │          │
│ Binary Tree Cameras  │ 3 states, greedy from leaves               │ cams (+1 if root   │ O(n),O(h)│
│                      │ (or 3-state min-cost DP)                   │ NOT_COVERED)       │          │
└──────────────────────┴────────────────────────────────────────────┴────────────────────┴──────────┘
```

### Pattern family tree

```
                             TREE / DAG DP
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                            │                            │
  BOTTOM-UP TUPLES           TOP-DOWN STATE              DAG + MEMO
  (children → parent)        (parent → children,         (many parents,
                              undo on return)             topological order)
      │                            │                            │
  ├─ House Robber III        └─ Path Sum III             └─ Longest Increasing Path
  │   (2 states)                (prefix-sum map)             (see 02-2D-Grid-DP.md)
  └─ Binary Tree Cameras
      (3 states + greedy)
```

### Bottom-up vs. top-down cheat card

```
   ┌──────────────────────┬────────────────────────┬─────────────────────────┐
   │                      │ BOTTOM-UP              │ TOP-DOWN                │
   ├──────────────────────┼────────────────────────┼─────────────────────────┤
   │ info travels         │ child → parent         │ parent → child          │
   │ carried by           │ return value (tuple)   │ function parameter/map  │
   │ traversal            │ post-order             │ pre-order + undo        │
   │ question shape       │ "best in my subtree"   │ "what's above me"       │
   │ example              │ Robber III, Cameras    │ Path Sum III            │
   └──────────────────────┴────────────────────────┴─────────────────────────┘
```

### Optimization checklist

```
  ☐ Recursion calls grandchildren directly?      → return a tuple instead, O(n)
  ☐ A node's choice limits its neighbors?        → one state per choice (rob/skip)
  ☐ "Downward path with sum K"?                  → prefix-sum hashmap + backtrack
  ☐ Greedy from the leaves looks safe?           → post-order + state codes
  ☐ Costs differ per node?                       → replace greedy with min-cost DP
  ☐ Node has many parents (DAG)?                 → memo table is REQUIRED
  ☐ Very deep tree (n ~ 10⁵, skewed)?            → watch recursion depth; iterative post-order
```

### 🚩 Common bugs to avoid

```
  ✗ Robber III: "alternate levels" greedy; robbing a node AND its child
  ✗ Robber III: naive recursion without memo → exponential time
  ✗ Path Sum III: forgetting map = {0: 1}  → misses paths starting at the root
  ✗ Path Sum III: no undo on return        → counts paths through siblings
  ✗ Path Sum III: adding curr before lookup → wrong when target = 0
  ✗ Path Sum III: 32-bit overflow on prefix sums
  ✗ Cameras: null returning NOT_COVERED    → cameras placed on every leaf
  ✗ Cameras: checking HAS_CAMERA before NOT_COVERED
  ✗ Cameras: forgetting the root special case
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What does my PARENT need to know about my subtree      ║
   ║   to make its own decision?"                             ║
   ╚══════════════════════════════════════════════════════════╝
     Those facts are the states your function returns.
```

---

### ✅ Progress tracker

- [ ] House Robber III (Medium)
- [ ] Path Sum III (Medium)
- [ ] Binary Tree Cameras (Hard)
