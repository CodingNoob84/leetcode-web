# Implementation of Heap: A Visual Guide

> **Goal:** Build a binary heap from scratch in your head. See the tree, see the array, and watch every swap.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Every later heap pattern (Top-K, Merge K Sorted, Huffman) uses the structure you build here.

---

## Table of Contents

0. [The Big Idea: What Is a Heap?](#0-the-big-idea-what-is-a-heap)
1. [Implement Max Heap (Easy)](#1-implement-max-heap-easy)
2. [Implement Min Heap (Easy)](#2-implement-min-heap-easy)
3. [Implement Priority Queue (Easy)](#3-implement-priority-queue-easy)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Max Heap → Min Heap → Priority Queue.
> Max Heap teaches the mechanics. Min Heap is the same code with one comparison flipped (plus two bonus operations).
> Priority Queue generalizes "compare numbers" to "compare (priority, tie-breaker) pairs".

### Conventions used in this guide (GFG-style)

```
  • Arrays are 0-indexed.
  • getMax / getMin on an EMPTY heap      → returns −1
  • extractMax / extractMin on EMPTY heap → returns −1
  • Duplicates are allowed.
  • "Max heap" = largest value at the root; "min heap" = smallest at the root.
```

---

## 0. The Big Idea: What Is a Heap?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "HEAP"                                  │
├──────────────────────────────────────────────────────────────────┤
│  • "Design a priority queue / min heap / max heap"               │
│  • You repeatedly need the SMALLEST or LARGEST item              │
│  • Items keep ARRIVING while you keep REMOVING the best one      │
│  • You do NOT need the whole collection sorted, only its top     │
└──────────────────────────────────────────────────────────────────┘
```

### The heap property (and how it differs from a BST)

```
        MAX HEAP                         BINARY SEARCH TREE
   parent ≥ both children           left < parent < right

          50                                 50
        /    \                             /    \
      30      40                         30      70
     /  \    /                          /  \    /
    10  20  35                        10   40  60

   ✔ root = maximum                  ✔ in-order walk = sorted
   ✘ siblings are NOT ordered        ✔ search for any value: O(log n)
   ✘ search for any value: O(n)      ✘ may become unbalanced
   ✔ always perfectly balanced
     (a COMPLETE tree)

   A heap only promises:  "the top is the best."  Nothing more.
   That weaker promise is why it is cheap to maintain.
```

### Complete tree → array (no pointers needed!)

A heap is a **complete binary tree**: every level is full except possibly the last, which fills **left to right**.
That shape lets us store it in a plain array, reading the tree level by level.

```
                 index 0
                  [50]
              /          \
        idx 1               idx 2
        [30]                [40]
       /     \             /
   idx 3    idx 4      idx 5
   [10]     [20]       [35]

   array:   ┌────┬────┬────┬────┬────┬────┐
            │ 50 │ 30 │ 40 │ 10 │ 20 │ 35 │
            └────┴────┴────┴────┴────┴────┘
     index:   0    1    2    3    4    5
```

```
  ┌───────────────────────── 0-INDEXED FORMULAS ─────────────────────────┐
  │   parent(i) = (i − 1) / 2      (integer division)                    │
  │   left(i)   = 2i + 1                                                  │
  │   right(i)  = 2i + 2                                                  │
  └───────────────────────────────────────────────────────────────────────┘

  Check:  node 30 is at i=1 → left = 3 (10) ✓, right = 4 (20) ✓, parent = 0 (50) ✓
          node 35 is at i=5 → parent = (5−1)/2 = 2 (40) ✓

  1-INDEXED variant (slot 0 unused): parent = i/2, left = 2i, right = 2i+1.
  Same idea, slightly prettier math. Pick ONE and never mix them.
```

### The two repair moves

Every operation breaks the heap property in **one spot** and then repairs it by moving that one value.

```
     SIFT-UP (bubble up)                      SIFT-DOWN (sink down)
     used after PUSH                          used after POP

     new value placed at the BOTTOM           new value placed at the TOP
     while it beats its parent:               while a child beats it:
         swap with parent                         swap with the BEST child
                                                  (larger in max heap,
            ▲                                      smaller in min heap)
            │                                         │
          [ x ]                                       ▼
```

### PUSH = append + sift-up

```
  1. Put the new value in the first free slot (end of array).
     → The tree stays complete.
  2. It might be bigger than its parent (max heap). Sift it UP.

        50                    50                    55
       /  \                  /  \                  /  \
     30    40      →       30    40      →       30    50
    / \   / \             / \   / \             / \   / \
   10 20 35 [55]         10 20 35 [40]?        10 20 35  40
            new           55 vs 40: swap        55 vs 50: swap → root, stop
```

### POP = swap root with last, remove last, sift-down

```
  1. Save the root (the answer).
  2. Move the LAST element to the root (keeps the tree complete).
  3. Remove the last slot.
  4. The new root is probably too small. Sift it DOWN,
     always swapping with the LARGER child (max heap).

   Why the larger child?   If you swap with the smaller one,
   the larger one ends up BELOW a smaller parent → property broken.

          ?                         ✘ swap with 30           ✔ swap with 40
        /   \                         30                         40
      30     40                     /    \                     /    \
                                  [x]     40   ← 40 > 30!    30     [x]
```

### PEEK = look at index 0. O(1).

### HEAPIFY: build a heap from an array in O(n)

Pushing n items one by one costs O(n log n). **Bottom-up heapify** is faster:
run sift-down on every non-leaf node, from the **last non-leaf** back to the root.

```
  last non-leaf index = n/2 − 1     (every index after it is a leaf)

  Why O(n)? Most nodes are near the bottom, and they barely move:

   level            nodes      max sift-down distance
   ─────────────    ───────    ──────────────────────
   root               1               h
   ...               ...             ...
   2nd-to-last       n/4               1
   last (leaves)     n/2               0   ← half the nodes do NO work!

   total work ≈ n/4·1 + n/8·2 + n/16·3 + ...  ≤  n     → O(n)

   Pushing one by one is the opposite: the many bottom nodes
   each may travel ALL the way up (log n) → O(n log n).
```

**Trace: heapify `[3, 9, 2, 1, 4, 5]` into a max heap** (n = 6, last non-leaf = 2)

```
  start:            3                     array: [3, 9, 2, 1, 4, 5]
                  /   \
                9       2
               / \     /
              1   4   5

  i = 2 (value 2): children = idx5 (5).  5 > 2 → swap
                                          [3, 9, 5, 1, 4, 2]

  i = 1 (value 9): children = 1, 4.       9 is largest → stay
                                          [3, 9, 5, 1, 4, 2]

  i = 0 (value 3): children = 9, 5.       9 largest → swap
                                          [9, 3, 5, 1, 4, 2]
         keep sinking 3 at i = 1: children = 1, 4.  4 > 3 → swap
                                          [9, 4, 5, 1, 3, 2]

  result:           9
                  /   \
                4       5          9 ≥ 4,5 ✓   4 ≥ 1,3 ✓   5 ≥ 2 ✓
               / \     /
              1   3   2
```

### Bonus: heap sort in one picture

```
  1. Heapify the array into a MAX heap                       O(n)
  2. Repeat n times: swap root with the last unsorted slot,
     shrink the heap by one, sift-down the new root          O(n log n)

     [ ── heap ── | sorted ascending → ]
        shrinks ◄─┘   grows

  In-place, O(1) extra space, O(n log n) always, but NOT stable.
```

### Min heap ↔ max heap

```
  Option A: flip every comparison ( > becomes < ).
  Option B: keep a min heap and store NEGATED values:
            push(−x),  answer = −pop()
            (A common trick when a language only ships a min heap.)
```

---

## 1. Implement Max Heap (Easy)

### Problem
Support `insert(x)`, `extractMax()` (remove and return the largest), and `getMax()` (peek), all on an array-backed binary heap.

### Visualize it

```
   The array IS the tree. The biggest value always sits at index 0.

        idx: 0    1    2    3    4
           ┌────┬────┬────┬────┬────┐
           │ 30 │ 20 │  5 │ 10 │ 15 │   ←── after inserting 10,20,5,30,15
           └────┴────┴────┴────┴────┘
             ▲
           getMax() reads this. O(1).
```

### The decision at every step

```
   SIFT-UP (after insert)                 SIFT-DOWN (after extract)
   ──────────────────────                 ─────────────────────────
   i = new index                          i = 0
   while i > 0:                           loop:
     p = parent(i)                          big = index of largest among
     if a[i] > a[p]:  swap, i = p                 i, left(i), right(i)
     else: stop                             if big == i: stop
                                            swap a[i], a[big];  i = big
```

### The 4 steps

| Step | Answer |
|------|--------|
| Storage | array `a`, plus `size` |
| Invariant | `a[parent(i)] ≥ a[i]` for every `i > 0` |
| Insert | append at `size`, sift-up |
| Extract | save `a[0]`, move `a[size−1]` to 0, shrink, sift-down |

### Trace: insert 10, 20, 5, 30, 15

```
  insert 10:  [10]                               10

  insert 20:  [10, 20]        20 at i=1, parent 10 → 20 > 10 swap
              [20, 10]                           20
                                                /
                                              10

  insert 5:   [20, 10, 5]     5 at i=2, parent 20 → 5 < 20 stop
                                                 20
                                                /  \
                                              10    5

  insert 30:  [20, 10, 5, 30]   30 at i=3, parent i=1 (10) → swap
              [20, 30, 5, 10]   30 at i=1, parent i=0 (20) → swap
              [30, 20, 5, 10]   30 at root → stop
                                                 30
                                                /  \
                                              20    5
                                             /
                                           10

  insert 15:  [30, 20, 5, 10, 15]   15 at i=4, parent i=1 (20) → 15 < 20 stop
                                                 30
                                                /  \
                                              20    5
                                             /  \
                                           10    15
```

### Trace: extractMax twice

```
  extractMax #1   →  returns 30

    move last (15) to root, remove last slot:
              [15, 20, 5, 10]
                    15
                   /  \
                 20    5
                /
              10

    sift-down 15 at i=0: children 20, 5 → larger is 20 > 15 → swap
              [20, 15, 5, 10]
    sift-down 15 at i=1: child 10 (i=3) → 10 < 15 → stop
                    20
                   /  \
                 15    5
                /
              10

  extractMax #2   →  returns 20

    move last (10) to root, remove last slot:
              [10, 15, 5]
    sift-down 10 at i=0: children 15, 5 → larger is 15 > 10 → swap
              [15, 10, 5]
    i=1 has no children → stop
                    15
                   /  \
                 10    5

  getMax() → 15
```

### Pseudocode

```
class MaxHeap:
    a    ← empty array
    size ← 0

    method insert(x):
        a[size] ← x
        size ← size + 1
        siftUp(size − 1)

    method getMax():
        if size == 0: return −1
        return a[0]

    method extractMax():
        if size == 0: return −1
        top  ← a[0]
        a[0] ← a[size − 1]
        size ← size − 1
        if size > 0: siftDown(0)
        return top

    method siftUp(i):
        while i > 0:
            p ← (i − 1) / 2
            if a[i] > a[p]:
                swap a[i], a[p]
                i ← p
            else:
                stop

    method siftDown(i):
        loop:
            big ← i
            L ← 2i + 1,  R ← 2i + 2
            if L < size and a[L] > a[big]:  big ← L
            if R < size and a[R] > a[big]:  big ← R
            if big == i: stop
            swap a[i], a[big]
            i ← big
```

### Complexity

| Operation | Time | Why |
|---|---|---|
| `getMax` | O(1) | read index 0 |
| `insert` | O(log n) | sift-up climbs at most the tree height |
| `extractMax` | O(log n) | sift-down sinks at most the tree height |
| build from array (heapify) | O(n) | see section 0 |
| Space | O(n) | the array |

### 📌 Points to remember
- **Always compare against `size`, not the array's capacity**, when checking if a child exists.
- In sift-down, swap with the **larger** child. Swapping with the smaller one breaks the heap.
- Check `size > 0` after shrinking before calling sift-down (extracting the last element).
- A heap is **not sorted**. `[30, 20, 5, 10, 15]` is a valid heap, even though 5 sits before 10.

---

## 2. Implement Min Heap (Easy)

### Problem
Same as the max heap, but the **smallest** value lives at the root: `insert(x)`, `extractMin()`, `getMin()`.
GFG's version also asks for `decreaseKey(i, newVal)` and `deleteKey(i)`, covered as a bonus below.

### The one change

```
          MAX HEAP                          MIN HEAP
   sift-up:   a[i] > a[parent]    ──►   a[i] < a[parent]
   sift-down: pick the LARGER child ──►  pick the SMALLER child

   Everything else (array layout, formulas, size checks) is identical.
```

### Trace: insert 7, 3, 9, 1, 5, 2

```
  insert 7:  [7]

  insert 3:  [7, 3]          3 < parent 7 → swap
             [3, 7]

  insert 9:  [3, 7, 9]       9 > parent 3 → stop

  insert 1:  [3, 7, 9, 1]    1 at i=3, parent i=1 (7) → swap
             [3, 1, 9, 7]    1 at i=1, parent i=0 (3) → swap
             [1, 3, 9, 7]    root → stop

  insert 5:  [1, 3, 9, 7, 5]       5 at i=4, parent i=1 (3) → 5 > 3 stop

  insert 2:  [1, 3, 9, 7, 5, 2]    2 at i=5, parent i=2 (9) → swap
             [1, 3, 2, 7, 5, 9]    2 at i=2, parent i=0 (1) → 2 > 1 stop

                     1
                   /   \
                  3     2              array: [1, 3, 2, 7, 5, 9]
                 / \   /
                7   5 9
```

### Trace: extractMin

```
  extractMin  →  returns 1

    move last (9) to root, remove last:
              [9, 3, 2, 7, 5]
    sift-down 9 at i=0: children 3, 2 → smaller is 2 < 9 → swap
              [2, 3, 9, 7, 5]
    9 at i=2: children would be i=5, 6 → both ≥ size (5) → stop

                     2
                   /   \
                  3     9              array: [2, 3, 9, 7, 5]
                 / \
                7   5
```

### Bonus 1: decreaseKey(i, newVal)

The value at index `i` gets **smaller**, so it can only need to move **up**.

```
  decreaseKey(3, 0)      heap: [2, 3, 9, 7, 5]   (7 at i=3 becomes 0)

              [2, 3, 9, 0, 5]   0 at i=3, parent i=1 (3) → swap
              [2, 0, 9, 3, 5]   0 at i=1, parent i=0 (2) → swap
              [0, 2, 9, 3, 5]   root → stop

                     0
                   /   \
                  2     9
                 / \
                3   5

  (In a min heap, INCREASING a key is the mirror case: it can only move DOWN.)
```

### Bonus 2: deleteKey(i), two ways

```
  WAY A (GFG classic):   decreaseKey(i, −∞)   → it rises to the root
                         extractMin()         → it is removed
                         Cost: O(log n) + O(log n)

  WAY B (direct):        swap a[i] with the last element, shrink size,
                         then sift-UP or sift-DOWN at i (whichever is needed).
                         The replacement can be smaller than its new parent
                         OR larger than its children, so check both.
```

```
  deleteKey(2) with WAY B      heap: [0, 2, 9, 3, 5]   (removing 9 at i=2)

     swap with last (5):       [0, 2, 5, 3, 9]
     shrink:                   [0, 2, 5, 3]
     5 at i=2: parent is 0 → no sift-up needed
               children i=5, 6 → none → no sift-down needed

                     0
                   /   \
                  2     5           array: [0, 2, 5, 3]
                 /
                3
```

### Pseudocode

```
class MinHeap:
    a ← empty array,  size ← 0

    method insert(x):
        a[size] ← x;  size ← size + 1
        siftUp(size − 1)

    method getMin():
        if size == 0: return −1
        return a[0]

    method extractMin():
        if size == 0: return −1
        top ← a[0]
        a[0] ← a[size − 1];  size ← size − 1
        if size > 0: siftDown(0)
        return top

    method decreaseKey(i, newVal):        // assumes newVal ≤ a[i]
        a[i] ← newVal
        siftUp(i)

    method deleteKey(i):                  // WAY B
        if i ≥ size: return
        a[i] ← a[size − 1];  size ← size − 1
        if i < size:
            siftUp(i)
            siftDown(i)                   // at most one of them moves it

    method siftUp(i):
        while i > 0 and a[i] < a[(i − 1) / 2]:
            swap a[i], a[(i − 1) / 2]
            i ← (i − 1) / 2

    method siftDown(i):
        loop:
            small ← i
            L ← 2i + 1,  R ← 2i + 2
            if L < size and a[L] < a[small]:  small ← L
            if R < size and a[R] < a[small]:  small ← R
            if small == i: stop
            swap a[i], a[small]
            i ← small
```

### Complexity

| Operation | Time |
|---|---|
| `getMin` | O(1) |
| `insert`, `extractMin` | O(log n) |
| `decreaseKey` | O(log n) |
| `deleteKey` | O(log n) |
| Find an arbitrary value | O(n) ⚠ heaps don't support search |

### 📌 Points to remember
- Min heap = max heap with the comparisons flipped. Write it once, flip one symbol.
- `decreaseKey` in a min heap only ever **sifts up**.
- In `deleteKey`, the replacement from the end may need to go **up or down**. Calling both is safe because at most one actually moves it.
- `deleteKey` needs the **index**. If you only know the value, finding it costs O(n), unless you also keep a value → index map.

---

## 3. Implement Priority Queue (Easy)

### Problem
Build a priority queue: `push(item, priority)`, `pop()` returns the item with the **best** priority, `peek()`.
It is a heap, but the things you compare are **entries**, not plain numbers.

### From numbers to entries

```
   Plain heap stores:          Priority queue stores:
     5                           (priority, counter, item)
                                 (2, 0, "write")

   Compare entries by:
     1. priority          (smaller = more urgent, for a MIN priority queue)
     2. counter           (insertion order, breaks ties → FIFO among equals)

   The item itself is NEVER compared. It can be anything.
```

### Why the insertion counter?

```
   Heaps are NOT stable. Two entries with the same priority can come out
   in either order, depending on the swaps that happened.

   push(write, 2) then push(review, 2)
     without counter →  maybe "review" first   ✘ surprising
     with counter    →  (2,0) < (2,3) → "write" first ✔ first-come, first-served

   Bonus: some languages can't compare the items at all
   (e.g. two tasks objects). The counter guarantees comparison
   never reaches the item.
```

### The comparator

```
   less(A, B):
       if A.priority ≠ B.priority:  return A.priority < B.priority
       return A.counter < B.counter

   Want a MAX priority queue?  Flip the priority comparison only
   (keep the counter rule so ties stay FIFO).
```

### Trace (min priority queue)

```
   ops: push(write,2)  push(test,1)  push(deploy,3)  push(review,2)
        pop  pop  pop  pop

   entries:  A = (2,0,write)   B = (1,1,test)   C = (3,2,deploy)   D = (2,3,review)

   push A:   [A]

   push B:   [A, B]        B at i=1 vs parent A: 1 < 2 → swap
             [B, A]

   push C:   [B, A, C]     C at i=2 vs parent B: 3 > 1 → stop

   push D:   [B, A, C, D]  D at i=3 vs parent A (i=1):
                           priority 2 = 2, counter 3 > 0 → D is NOT less → stop

                    B(1,1)
                   /      \
              A(2,0)      C(3,2)
               /
          D(2,3)

   pop → test (B)
             last D to root:  [D, A, C]
             D vs children A(2,0), C(3,2): smaller child is A
             A less than D?  priority tie, counter 0 < 3 → yes → swap
             [A, D, C]

   pop → write (A)
             last C to root:  [C, D]
             child D(2,3) less than C(3,2)? 2 < 3 → yes → swap
             [D, C]

   pop → review (D)
             [C]

   pop → deploy (C)
             []

   order: test, write, review, deploy ✅  (write before review: FIFO tie-break)
```

### Pseudocode

```
class PriorityQueue:
    heap    ← empty array of entries
    counter ← 0

    method less(A, B):
        if A.priority ≠ B.priority: return A.priority < B.priority
        return A.counter < B.counter

    method push(item, priority):
        append (priority, counter, item) to heap
        counter ← counter + 1
        siftUp(last index)             // uses less()

    method peek():
        if heap is empty: return none
        return heap[0].item

    method pop():
        if heap is empty: return none
        top ← heap[0]
        heap[0] ← heap[last];  remove last
        if heap not empty: siftDown(0) // uses less()
        return top.item
```

### Changing an item's priority: lazy deletion

```
   A heap can't find an item quickly, so "update priority" is awkward.

   LAZY DELETION trick:
     • To change priority: just PUSH a new entry with the new priority,
       and record the item's CURRENT priority in a map.
     • On pop: if the popped entry's priority ≠ map[item], it is STALE
       → throw it away and pop again.

        heap:  (5,task1)  (2,task1)  (7,task2)
        map:   task1 → 2,  task2 → 7

        pop → (2,task1) ✓ current
        pop → (5,task1) ✗ stale (map says 2, already handled) → skip
        pop → (7,task2) ✓

   This is exactly how Dijkstra skips outdated distances
   (see ../graph/05-Dijkstra.md).

   Alternative: an "indexed heap" that keeps item → array position,
   so you can decreaseKey in O(log n). More code, less memory.
```

### Complexity

| Operation | Time |
|---|---|
| `push` | O(log n) |
| `pop` | O(log n) |
| `peek` | O(1) |
| change priority (lazy) | O(log n) per push; stale entries cost extra pops |

### 📌 Points to remember
- A priority queue is an **interface**; a binary heap is the usual **implementation**.
- Compare by `(priority, counter)`, **never** by the item.
- The counter makes equal priorities come out in **insertion order**.
- Updating priorities → **lazy deletion** (push again, skip stale on pop) or an indexed heap.

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────┬──────────────────────────────────────────────┬──────────────────┐
│ Problem              │ Core idea                                    │ Key ops          │
├──────────────────────┼──────────────────────────────────────────────┼──────────────────┤
│ Implement Max Heap   │ array tree; sift-up / sift-down (larger kid) │ O(log n), peek O(1)│
│ Implement Min Heap   │ same, comparisons flipped (smaller kid)      │ + decreaseKey,   │
│                      │                                              │   deleteKey      │
│ Implement Priority Q │ heap of (priority, counter, item)            │ stable ties,     │
│                      │                                              │   lazy updates   │
└──────────────────────┴──────────────────────────────────────────────┴──────────────────┘
```

### The array ↔ tree card

```
   0-indexed:   parent = (i−1)/2     left = 2i+1     right = 2i+2
   1-indexed:   parent = i/2         left = 2i       right = 2i+1
   last non-leaf (0-indexed) = n/2 − 1
   leaves = indices n/2 … n−1   (about half the nodes)
```

### Which repair after which operation?

```
   ┌──────────────────────────────┬────────────────────────┐
   │ Operation                    │ Repair                 │
   ├──────────────────────────────┼────────────────────────┤
   │ push / insert                │ sift-UP the new last   │
   │ pop / extract                │ sift-DOWN the new root │
   │ decreaseKey (min heap)       │ sift-UP                │
   │ increaseKey (min heap)       │ sift-DOWN              │
   │ delete at index i            │ sift-UP and sift-DOWN  │
   │ build from array (heapify)   │ sift-DOWN, i = n/2−1→0 │
   └──────────────────────────────┴────────────────────────┘
```

### Complexity summary

```
   peek        O(1)
   push        O(log n)
   pop         O(log n)
   heapify     O(n)          ← not O(n log n)!
   heap sort   O(n log n), in-place, not stable
   search      O(n)          ← heaps are not for searching
```

### Optimization checklist

```
  ☐ Building from a full array?        → heapify bottom-up, O(n)
  ☐ Only have a min heap?              → push −x for max behavior
  ☐ Ties must be FIFO / items uncomparable? → add an insertion counter
  ☐ Need to change priorities?         → lazy deletion or indexed heap
  ☐ Need delete-by-value?              → keep value → index map (indexed heap)
```

### 🚩 Common bugs to avoid

```
  ✗ Mixing 0-indexed and 1-indexed formulas
  ✗ Checking children against capacity instead of size
  ✗ Swapping with the WRONG child in sift-down (must be larger / smaller)
  ✗ Forgetting size > 0 check before sift-down after removing the last item
  ✗ Not handling extract/peek on an empty heap (return −1 here)
  ✗ deleteKey: only sifting down (the replacement might need to go UP)
  ✗ Thinking the heap array is sorted
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which ONE spot did this operation break, and does the  ║
   ║   value there need to move UP or DOWN?"                  ║
   ╚══════════════════════════════════════════════════════════╝
      Every heap operation is: break one spot → sift it home.
```

---

### ✅ Progress tracker

- [ ] Implement Max Heap (Easy)
- [ ] Implement Min Heap (Easy)
- [ ] Implement Priority Queue (Easy)
