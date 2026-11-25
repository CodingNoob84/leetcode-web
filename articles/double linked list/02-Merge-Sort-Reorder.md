# Doubly Linked List: Merge / Sort / Reorder, A Visual Guide

> **Goal:** Learn to merge, flatten and restructure doubly linked lists by rewiring pointers, never by copying values.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on the Basic DLL Operations guide in this folder and on [../linked list/04-Merge-Sort.md](../linked%20list/04-Merge-Sort.md) (the singly linked versions).

---

## Table of Contents

0. [The Big Idea: What Changes With Two Pointers?](#0-the-big-idea-what-changes-with-two-pointers)
1. [Merge Two Sorted DLLs (Easy)](#1-merge-two-sorted-dlls-easy)
2. [Flatten Multilevel DLL (Medium)](#2-flatten-multilevel-dll-medium)
3. [Convert DLL to Binary Tree (Medium)](#3-convert-dll-to-binary-tree-medium)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Merge Two Sorted DLLs → Flatten Multilevel DLL → Convert DLL to Binary Tree.
> Merge teaches "every `next` needs a matching `prev`". Flatten adds a third pointer (`child`) that you splice in.
> Convert reuses `prev` / `next` as `left` / `right`, so the same node becomes a tree node.

---

## 0. The Big Idea: What Changes With Two Pointers?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS FOR "DLL MERGE / SORT / REORDER"                    │
├──────────────────────────────────────────────────────────────────┤
│  • Input nodes have BOTH prev and next (sometimes also child)    │
│  • "Merge two sorted ...", "sort the list", "flatten"            │
│  • "Convert in place" → reuse the same nodes, don't allocate     │
│  • "Balanced BST from a sorted list" → prev/next become          │
│     left/right                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### The node

```
        ┌──────┬──────┬──────┐
  ◄──── │ prev │ data │ next │ ────►
        └──────┴──────┴──────┘
                  │
                child             (only in multilevel lists)
                  ▼
```

### The extra duty: every `next` needs a matching `prev`

In a singly linked list, attaching a node is one arrow. In a DLL it is **two**, and forgetting the second one
leaves a list that looks fine going forward but is broken going backward.

```
  Singly:   A ───► B                          1 write:  A.next = B

  Doubly:   A ⇄ B                             2 writes: A.next = B
                                                        B.prev = A

  ✅ The two-way handshake checklist:
  ┌─────────────────────────────────────────────────────────────┐
  │ After EVERY "x.next ← y", ask: did I also do "y.prev ← x"?  │
  │ (guard it: only if y ≠ null)                                │
  └─────────────────────────────────────────────────────────────┘
```

#### Insert X between A and B: 4 writes

```
   before:   A ⇄ B

             ┌───┐        ┌───┐
             │ A │ ⇄      │ B │
             └───┘        └───┘
                   ┌───┐
                   │ X │
                   └───┘

   ① X.prev ← A      ② X.next ← B      (X points out first: nothing is lost)
   ③ A.next ← X      ④ B.prev ← X      (then neighbours point in)

   after:    A ⇄ X ⇄ B
```

#### Remove X from between A and B: 2 writes

```
   before:   A ⇄ X ⇄ B

   ① A.next ← B   (guard: A ≠ null, else head moves to B)
   ② B.prev ← A   (guard: B ≠ null, else tail moves to A)

   after:    A ⇄ B          X is detached (optionally clear X.prev / X.next)
```

#### The head and tail rules

```
   head.prev must be null          tail.next must be null
        ∅ ◄── [head] ⇄ ... ⇄ [tail] ──► ∅

   When you build with a DUMMY node, the real head's prev points to the dummy.
   Fix it at the end:   head ← dummy.next ;  head.prev ← null
```

### The DLL ↔ tree duality

A DLL node and a binary tree node have the **same shape**: one value and two pointers. Only the names differ.

```
     DLL view                                  Tree view

   ┌──────┬──────┬──────┐                   ┌──────┬──────┬──────┐
   │ prev │  4   │ next │         ≡         │ left │  4   │ right│
   └──────┴──────┴──────┘                   └──────┴──────┴──────┘

   A sorted DLL read left → right            A BST read IN-ORDER
     1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6 ⇄ 7               gives the same sequence:
                                                      4
                                                    /   \
                                                   2     6
                                                  / \   / \
                                                 1   3 5   7

   Sorted DLL  ──(pick middles as roots)──►  balanced BST     (problem 3)
   BST         ──(in-order walk, link)───►   sorted DLL       (bonus, LC 426)
```

> 💡 **Key insight:** "in-order of a BST" and "left-to-right of a sorted DLL" are the same order.
> Converting between them is just re-labelling the two pointers while walking in that order.

### The 4-step recipe for every pointer problem

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  DRAW the before and after pictures                    │
 │ STEP 2  SAVE anything you are about to overwrite (next, child)│
 │ STEP 3  REWIRE: every next ↔ prev in pairs, null-guarded      │
 │ STEP 4  FIX THE ENDS: head.prev = null, tail.next = null,     │
 │         child = null (flatten)                                │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Merge Two Sorted DLLs (Easy)

### Problem
Given the heads of two doubly linked lists, each sorted in non-decreasing order, merge them **in place**
(reuse the nodes) into one sorted DLL and return its head.

> **Convention used here (GFG-style):** both inputs are sorted ascending; either may be empty; on equal values
> take the node from the **first** list (stable); return the head of the merged list with `head.prev = null`.

### Visualize it

```
   A:  1 ⇄ 3 ⇄ 5
   B:  2 ⇄ 4 ⇄ 6

   Result (same 6 nodes, new arrows):
       1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6
```

### The zipper picture

```
   dummy ⇄ (tail)                       a ──► 1 ⇄ 3 ⇄ 5
                                        b ──► 2 ⇄ 4 ⇄ 6

   Each step:  pick the smaller front node,
               stitch it to tail in BOTH directions,
               move tail and that list's pointer forward.

        tail ──next──► pick
        tail ◄──prev── pick          ← the step the singly linked version doesn't have
```

### Decision at each step

```
                 a.data ≤ b.data ?
                 /               \
              yes                 no
               │                   │
         take a (stable)         take b
               │                   │
     tail.next ← a            tail.next ← b
     a.prev    ← tail         b.prev    ← tail
     tail ← a; a ← a.next     tail ← b; b ← b.next

   When one list runs out: attach the other in one shot
     tail.next ← rest ;  rest.prev ← tail     (rest keeps its own internal prev/next)
```

### The 4 steps

| Step | Answer |
|------|--------|
| Draw | two sorted chains → one chain, same nodes |
| Save | `a` and `b` are the fronts; moving them forward is the "save" |
| Rewire | `tail.next ← pick`, `pick.prev ← tail`, advance |
| Fix ends | attach leftover, then `head ← dummy.next`, `head.prev ← null` |

### Trace (A = [1,3,5], B = [2,4,6])

```
 step │ a │ b │ compare  │ take │ new links made          │ merged so far
 ─────┼───┼───┼──────────┼──────┼─────────────────────────┼──────────────────────
  1   │ 1 │ 2 │ 1 ≤ 2    │  1   │ D.next=1, 1.prev=D      │ D ⇄ 1
  2   │ 3 │ 2 │ 3 > 2    │  2   │ 1.next=2, 2.prev=1      │ D ⇄ 1 ⇄ 2
  3   │ 3 │ 4 │ 3 ≤ 4    │  3   │ 2.next=3, 3.prev=2      │ D ⇄ 1 ⇄ 2 ⇄ 3
  4   │ 5 │ 4 │ 5 > 4    │  4   │ 3.next=4, 4.prev=3      │ D ⇄ 1 ⇄ 2 ⇄ 3 ⇄ 4
  5   │ 5 │ 6 │ 5 ≤ 6    │  5   │ 4.next=5, 5.prev=4      │ D ⇄ 1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5
  6   │ ∅ │ 6 │ a empty  │ rest │ 5.next=6, 6.prev=5      │ D ⇄ 1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6

 Fix ends: head = D.next = 1 ;  1.prev = ∅   (it pointed to the dummy D)

 Result:  ∅ ◄ 1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6 ► ∅   ✅
          (6.next was already ∅ from list B)
```

### Pseudocode (iterative, O(1) extra space)

```
function mergeSortedDLL(a, b):
    dummy ← new node
    tail  ← dummy
    while a ≠ null and b ≠ null:
        if a.data ≤ b.data:
            pick ← a ;  a ← a.next
        else:
            pick ← b ;  b ← b.next
        tail.next ← pick
        pick.prev ← tail
        tail      ← pick
    rest ← (a ≠ null) ? a : b
    tail.next ← rest
    if rest ≠ null: rest.prev ← tail
    head ← dummy.next
    if head ≠ null: head.prev ← null       // detach from dummy
    return head
```

### Pseudocode (recursive)

```
function mergeRec(a, b):
    if a == null: return b
    if b == null: return a
    if a.data ≤ b.data:
        a.next ← mergeRec(a.next, b)
        a.next.prev ← a                    // a.next is non-null here (b was non-null)
        a.prev ← null                      // caller re-sets it if a is not the head
        return a
    else:
        b.next ← mergeRec(a, b.next)
        b.next.prev ← b
        b.prev ← null
        return b
```

> The recursive version uses O(n + m) call-stack space. Prefer the iterative one for long lists.

### Bonus: sorting a DLL

Merge sort works on a DLL exactly as on a singly linked list (see [../linked list/04-Merge-Sort.md](../linked%20list/04-Merge-Sort.md)).
Split at the first middle, sort both halves, and merge with the function above. The only extra work is in the split:

```
   left half … ⇄ mid ⇄ right half …
   cut:  second ← mid.next ;  mid.next ← null ;  second.prev ← null
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy values into array, sort, rebuild | O((n+m) log(n+m)) | O(n+m) |
| **Iterative zipper** | **O(n + m)** | **O(1)** ✅ |
| Recursive merge | O(n + m) | O(n + m) stack |

### 📌 Points to remember
- Every `tail.next ← pick` is followed by `pick.prev ← tail`.
- The dummy makes the first attach look like every other attach. Clean up `head.prev` at the end.
- The leftover list attaches in **one** step, and its inner `prev` links are already correct.
- Use `≤` (not `<`) to keep equal values stable, first list first.

---

## 2. Flatten Multilevel DLL (Medium)

### Problem (LC 430)
Each node has `prev`, `next` and `child`. A child pointer leads to a separate DLL, which can have children of its own.
Flatten everything into one single-level DLL. A node's child list must come **right after** the node and **before**
the node's original `next`. Set every `child` to null.

### Visualize it (LC example)

```
   Input  [1,2,3,4,5,6,null,null,null,7,8,9,10,null,null,11,12]

   level 1:   1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6
                      │
                    child
                      ▼
   level 2:           7 ⇄ 8 ⇄ 9 ⇄ 10
                          │
                        child
                          ▼
   level 3:               11 ⇄ 12

   Output:   1 ⇄ 2 ⇄ 3 ⇄ 7 ⇄ 8 ⇄ 11 ⇄ 12 ⇄ 9 ⇄ 10 ⇄ 4 ⇄ 5 ⇄ 6
```

> 💡 This order is a **pre-order DFS**, treating `child` as the "left" branch and `next` as the "right" branch.
> Tilt the picture 45° and it is a binary tree.

### The splice: one child list into the main list

```
   before:   curr ⇄ nxt                    childHead ⇄ … ⇄ childTail
               │
             child

   ① curr.next      ← childHead        ② childHead.prev ← curr
   ③ childTail.next ← nxt              ④ nxt.prev       ← childTail   (only if nxt ≠ null)
   ⑤ curr.child     ← null

   after:    curr ⇄ childHead ⇄ … ⇄ childTail ⇄ nxt
```

> The catch: `childTail` is only known **after** the child list (and all of ITS children) is flattened.
> That is why the recursion returns the **tail**.

### The decision at each node

```
              does curr have a child?
              /                     \
            no                      yes
             │                       │
     last ← curr             save nxt ← curr.next
     move to next            childTail ← flatten(child)   (recursion)
                             splice ①–⑤
                             last ← childTail
                             continue from nxt
```

### The 4 steps

| Step | Answer |
|------|--------|
| Draw | the multilevel picture and the flat output (pre-order) |
| Save | `nxt = curr.next` **before** splicing, because ① overwrites it |
| Rewire | the 4 two-way links of the splice |
| Fix ends | `curr.child ← null`; the overall tail's `next` stays null |

### Pseudocode: recursion that returns the tail

```
function flatten(head):
    flattenDFS(head)
    return head

function flattenDFS(node):           // flattens the list starting at node, returns its TAIL
    curr ← node
    last ← null
    while curr ≠ null:
        nxt ← curr.next
        if curr.child ≠ null:
            childTail ← flattenDFS(curr.child)
            curr.next ← curr.child                 // ①
            curr.child.prev ← curr                 // ②
            curr.child ← null                      // ⑤
            if nxt ≠ null:
                childTail.next ← nxt               // ③
                nxt.prev ← childTail               // ④
            last ← childTail
        else:
            last ← curr
        curr ← nxt
    return last
```

### Trace (recursive)

```
 call flattenDFS(1)
 │  curr=1  no child  last=1
 │  curr=2  no child  last=2
 │  curr=3  child=7, nxt=4
 │  │
 │  │  call flattenDFS(7)
 │  │  │  curr=7  no child  last=7
 │  │  │  curr=8  child=11, nxt=9
 │  │  │  │
 │  │  │  │  call flattenDFS(11)
 │  │  │  │  │  curr=11 last=11 ; curr=12 last=12
 │  │  │  │  └─ returns 12
 │  │  │  │
 │  │  │  splice: 8.next=11, 11.prev=8, 8.child=∅, 12.next=9, 9.prev=12
 │  │  │  level 2 now: 7 ⇄ 8 ⇄ 11 ⇄ 12 ⇄ 9 ⇄ 10
 │  │  │  last=12 ; curr=9  last=9 ; curr=10  last=10
 │  │  └─ returns 10
 │  │
 │  splice: 3.next=7, 7.prev=3, 3.child=∅, 10.next=4, 4.prev=10
 │  last=10 ; curr=4  last=4 ; curr=5  last=5 ; curr=6  last=6
 └─ returns 6

 Result:  1 ⇄ 2 ⇄ 3 ⇄ 7 ⇄ 8 ⇄ 11 ⇄ 12 ⇄ 9 ⇄ 10 ⇄ 4 ⇄ 5 ⇄ 6   ✅
```

### Alternative: explicit stack (no recursion)

```
   Push order matters: push NEXT first, then CHILD,
   so the child is popped first (pre-order: child before next).

        stack (top on the right)
```

```
function flattenStack(head):
    if head == null: return null
    stack ← [head]
    prev  ← null
    while stack not empty:
        curr ← pop(stack)
        if prev ≠ null:
            prev.next ← curr
            curr.prev ← prev
        if curr.next  ≠ null: push(stack, curr.next)     // read BEFORE it is overwritten
        if curr.child ≠ null:
            push(stack, curr.child)
            curr.child ← null
        prev ← curr
    return head
```

### Trace (stack)

```
 pop │ pushes (next, then child) │ stack after   │ flat list so far
 ────┼───────────────────────────┼───────────────┼───────────────────────────────
  1  │ 2                          │ [2]           │ 1
  2  │ 3                          │ [3]           │ 1 2
  3  │ 4, 7                       │ [4, 7]        │ 1 2 3
  7  │ 8                          │ [4, 8]        │ 1 2 3 7
  8  │ 9, 11                      │ [4, 9, 11]    │ 1 2 3 7 8
  11 │ 12                         │ [4, 9, 12]    │ 1 2 3 7 8 11
  12 │ —                          │ [4, 9]        │ 1 2 3 7 8 11 12
  9  │ 10                         │ [4, 10]       │ 1 2 3 7 8 11 12 9
  10 │ —                          │ [4]           │ 1 2 3 7 8 11 12 9 10
  4  │ 5                          │ [5]           │ … 9 10 4
  5  │ 6                          │ [6]           │ … 9 10 4 5
  6  │ —                          │ []            │ … 9 10 4 5 6   ✅
```

> Why reading `curr.next` before linking is safe: `prev.next ← curr` changes **prev's** next, not curr's.
> curr's own `next` is still the original when we push it.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Recursion returning tail | O(n) | O(depth) call stack |
| Explicit stack | O(n) | O(depth) in practice, O(n) worst |
| Iterative "walk the child's level to its tail, splice, keep walking" | O(n) | O(1) |

> In the first two versions each node is visited once. In the O(1)-space version, finding a tail walks only
> that child's own level, so each node is walked at most twice: once to find the tail, once in the main walk.

### 📌 Points to remember
- Output order = **pre-order**: node, then its whole child subtree, then its next.
- Save `nxt` before you overwrite `curr.next`.
- The recursion must **return the tail** so you know where to reconnect `nxt`.
- Always set `child ← null`, or the judge sees a multilevel list.
- Guard `nxt.prev` when `nxt` is null (the child list may become the new tail).

---

## 3. Convert DLL to Binary Tree (Medium)

### Problem
> **Assumption (the name is ambiguous, so this guide fixes one meaning):**
> You are given a **sorted** doubly linked list. Convert it **in place** into a **height-balanced BST**,
> reusing each node: `prev` becomes `left` and `next` becomes `right`. Return the root.
> This matches the common GFG "Sorted DLL to Balanced BST" task. The reverse direction (BST → sorted DLL)
> is covered as a bonus at the end.

### Visualize it

```
   Sorted DLL:   1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5 ⇄ 6 ⇄ 7

   Balanced BST (same 7 nodes):
                  4
                /   \
               2     6
              / \   / \
             1   3 5   7

   prev → left,  next → right
```

### Why "pick the middle as root" gives balance

```
   1 2 3 [4] 5 6 7          middle = root → 3 nodes left, 3 nodes right
   └─┬─┘      └─┬─┘
   1 [2] 3    5 [6] 7       recurse: middle of each half
```

Each half has about half the nodes, so the height is about log₂ n.

### Method A: find the middle recursively (simple, O(n log n))

```
   buildMid(start, n):            n = number of nodes in this range
       walk n/2 steps from start  → mid
       mid is the root
       left  subtree = buildMid(start,    n/2)
       right subtree = buildMid(mid.next, n − n/2 − 1)
```

```
function buildMid(start, n):
    if n ≤ 0: return null
    mid ← start
    repeat n/2 times: mid ← mid.next          // floor division
    rightStart ← mid.next                     // SAVE before anything is rewired
    leftRoot   ← buildMid(start, n/2)
    rightRoot  ← buildMid(rightStart, n − n/2 − 1)
    mid.prev ← leftRoot                       // prev  = left
    mid.next ← rightRoot                      // next  = right
    return mid

function sortedDLLToBST_slow(head):
    n ← count nodes
    return buildMid(head, n)
```

> Each level of recursion walks a total of about n/2 steps, and there are log n levels → **O(n log n)**.

### Method B: in-order simulation (optimal, O(n))

Instead of searching for the middle, **build the tree in in-order**. In-order visits nodes in sorted order,
which is exactly the order the DLL hands them out. So keep one global pointer `head` that walks the list once.

```
   build(n):                          "build a balanced tree from the next n list nodes"
       left  ← build(n/2)             ① first consume the n/2 nodes that go on the left
       root  ← head                   ② the very next list node is this subtree's root
       root.prev ← left
       head  ← head.next              ③ advance BEFORE overwriting root.next
       root.next ← build(n − n/2 − 1) ④ the rest go on the right
       return root
```

```
   The list is consumed strictly left → right, one node per call:

       head ──► 1 ──► 2 ──► 3 ──► 4 ──► 5 ──► 6 ──► 7
                ▲     ▲     ▲     ▲     ▲     ▲     ▲
              1st   2nd   3rd   4th   5th   6th   7th node to become a root
```

### Pseudocode

```
global head

function sortedDLLToBST(listHead):
    n ← count nodes from listHead
    head ← listHead
    return build(n)

function build(n):
    if n ≤ 0: return null
    leftRoot ← build(n / 2)                  // floor
    root ← head
    root.prev ← leftRoot                     // prev = left
    head ← head.next                         // read next BEFORE overwriting it
    root.next ← build(n − n/2 − 1)           // next = right
    return root
```

### Trace (Method B, [1,2,3,4,5,6,7], n = 7)

```
 call            │ action                                              │ head after
 ────────────────┼─────────────────────────────────────────────────────┼───────────
 build(7)        │ left = build(3)                                     │
 ├ build(3)      │ left = build(1)                                     │
 │ ├ build(1)    │ left = build(0) = ∅ ; root = 1 ; 1.prev = ∅         │ 2
 │ │             │ right = build(0) = ∅ ; 1.next = ∅ ; return 1        │
 │ │             │ root = 2 ; 2.prev = 1                               │ 3
 │ ├ build(1)    │ root = 3 ; 3.prev = ∅ ; 3.next = ∅ ; return 3       │ 4
 │ │             │ 2.next = 3 ; return 2          → subtree 2(1, 3)    │
 │               │ root = 4 ; 4.prev = 2                               │ 5
 ├ build(3)      │ (7 − 3 − 1 = 3 nodes on the right)                  │
 │ ├ build(1)    │ root = 5 ; return 5                                 │ 6
 │ │             │ root = 6 ; 6.prev = 5                               │ 7
 │ ├ build(1)    │ root = 7 ; return 7                                 │ ∅
 │ │             │ 6.next = 7 ; return 6          → subtree 6(5, 7)    │
 │               │ 4.next = 6 ; return 4                               │
 └───────────────┴─────────────────────────────────────────────────────┴───────────

 Result:            4
                  /   \
                 2     6          prev = left, next = right
                / \   / \
               1   3 5   7      ✅  root 4, height 3, in-order 1..7
```

### Even length check ([1,2,3,4,5,6], n = 6)

```
 build(6): left = build(3) → 2(1,3) ; root = 4 ; right = build(6−3−1 = 2)
           build(2): left = build(1) → 5 ; root = 6 ; right = build(0) = ∅

                  4
                /   \
               2     6
              / \   /
             1   3 5            ✅ balanced (heights of children differ by 1)
```

### Why reading `head.next` before writing `root.next` matters

```
   root = 4,  original 4.next = 5

   ✗ wrong order:  root.next ← build(…)   …  head ← head.next
                   by then 4.next is the subtree root 6, so head jumps to 6 and skips 5

   ✓ right order:  head ← head.next  (= 5)  …  root.next ← build(…)
```

### Bonus: the reverse direction, BST → sorted circular DLL (LC 426)

Walk the BST **in order** and link each node to the previous one. Then close the circle.

```
        4                     in-order: 1, 2, 3, 4, 5
       / \
      2   5          link:   1 ⇄ 2 ⇄ 3 ⇄ 4 ⇄ 5
     / \             close:  5.right = 1 ,  1.left = 5     (circular)
    1   3
```

```
function treeToDoublyList(root):
    if root == null: return null
    first ← null ; last ← null
    inorder(root):
        inorder(node.left)
        if last ≠ null:
            last.right ← node
            node.left  ← last
        else:
            first ← node
        last ← node
        inorder(node.right)
    last.right ← first        // make it circular
    first.left ← last
    return first
```

> Writing `node.left` during in-order is safe: the left subtree has already been fully visited.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy to array, build tree from array | O(n) | O(n) extra |
| Method A: find middle each time | O(n log n) | O(log n) stack |
| **Method B: in-order simulation** | **O(n)** ✅ | **O(log n)** stack |
| Bonus BST → DLL | O(n) | O(height) stack |

### 📌 Points to remember
- In-order of a BST = sorted order of a DLL. That is the whole trick.
- Method B consumes list nodes **in order**, one per call, so it never searches.
- Advance `head` **before** overwriting `root.next`.
- Use floor `n/2` for the left size, and `n − n/2 − 1` for the right size.
- State your interpretation if a problem name is ambiguous ("binary tree" here means "balanced BST").

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────────┬───────────────────────────────────────────────┬────────────┬──────────┐
│ Problem                  │ Core idea                                     │ Time       │ Space    │
├──────────────────────────┼───────────────────────────────────────────────┼────────────┼──────────┤
│ Merge Two Sorted DLLs    │ dummy + tail zipper, set prev on every attach │ O(n + m)   │ O(1)     │
│ Flatten Multilevel DLL   │ pre-order DFS, recursion returns child tail   │ O(n)       │ O(depth) │
│ Convert DLL to BST       │ in-order build, global head pointer           │ O(n)       │ O(log n) │
└──────────────────────────┴───────────────────────────────────────────────┴────────────┴──────────┘
```

### Pattern family tree

```
                        DLL POINTER REWIRING
                                │
          ┌─────────────────────┼──────────────────────┐
          │                     │                      │
     ZIP TWO LISTS         SPLICE A SUBLIST      RELABEL POINTERS
     (dummy + tail)        (save next, splice,   (prev/next ↔ left/right)
          │                 reconnect)                 │
     ├ Merge Two Sorted         │                 ├ Sorted DLL → BST
     └ Sort a DLL          └ Flatten Multilevel   └ BST → DLL (LC 426)
       (merge sort)
```

### The two-way handshake card

```
   ┌─────────────────────────────┬──────────────────────────────────────┐
   │ Operation                   │ Writes (in a safe order)             │
   ├─────────────────────────────┼──────────────────────────────────────┤
   │ attach y after x            │ x.next ← y ;  y.prev ← x             │
   │ insert X between A and B    │ X.prev ← A ; X.next ← B ;            │
   │                             │ A.next ← X ; B.prev ← X              │
   │ remove X                    │ A.next ← B ; B.prev ← A  (guards)    │
   │ splice [h..t] after x       │ save n ← x.next ; x.next ← h ;       │
   │                             │ h.prev ← x ; t.next ← n ;            │
   │                             │ n.prev ← t (if n ≠ null)             │
   │ finish with a dummy         │ head ← dummy.next ; head.prev ← null │
   └─────────────────────────────┴──────────────────────────────────────┘
```

### Checklist

```
  ☐ Did every "a.next ← b" get its "b.prev ← a"?
  ☐ Did I save the pointer I'm about to overwrite (next / child)?
  ☐ Null guards before touching x.prev or x.next of a neighbour?
  ☐ head.prev = null and tail.next = null at the end?
  ☐ Flatten: every child set to null?
  ☐ Tree build: advanced head before overwriting root.next?
  ☐ Can I reuse the nodes instead of allocating new ones?
```

### 🚩 Common bugs to avoid

```
  ✗ Merge: forgetting pick.prev ← tail (list breaks going backward)
  ✗ Merge: leaving head.prev pointing at the dummy
  ✗ Merge: forgetting rest.prev ← tail when attaching the leftover
  ✗ Flatten: overwriting curr.next before saving it
  ✗ Flatten: not returning the child's tail, so nxt can't be reconnected
  ✗ Flatten: leaving child pointers set
  ✗ Flatten (stack): pushing child before next (wrong order)
  ✗ BST build: reading head.next after root.next was overwritten
  ✗ BST build: wrong split sizes (use n/2 and n − n/2 − 1)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "For every arrow I just drew, did I also draw the arrow ║
   ║   coming back, and did I save what that arrow replaced?" ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Merge Two Sorted DLLs (Easy)
- [ ] Flatten Multilevel DLL (Medium)
- [ ] Convert DLL to Binary Tree (Medium)
