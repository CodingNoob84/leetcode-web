# Linked List Basic Operations: A Visual Guide

> **Goal:** Learn to *see* pointer rewiring, never lose a node, and handle the head without special cases.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Pointers Are Arrows](#0-the-big-idea-pointers-are-arrows)
1. [Search in Linked List (Easy)](#1-search-in-linked-list-easy)
2. [Linked List Insertion (Easy)](#2-linked-list-insertion-easy)
3. [Remove Linked List Elements (Easy)](#3-remove-linked-list-elements-easy)
4. [Remove Nth Node From End of List (Medium)](#4-remove-nth-node-from-end-of-list-medium)
5. [Odd Even Linked List (Medium)](#5-odd-even-linked-list-medium)
6. [Intersection of Two Linked Lists (Easy)](#6-intersection-of-two-linked-lists-easy)
7. [Design Linked List (Medium)](#7-design-linked-list-medium)
8. [Master Cheat Sheet](#8-master-cheat-sheet)

> **Suggested order:** Search → Insertion → Remove Elements → Remove Nth From End → Odd Even
> → Intersection → Design Linked List. Each one adds one new pointer skill.
> The last one, Design, puts every skill into a single class.

---

## 0. The Big Idea: Pointers Are Arrows

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS FOR "BASIC LINKED LIST OPERATIONS"                  │
├──────────────────────────────────────────────────────────────────┤
│  • Insert / delete at the head, tail, or k-th position           │
│  • Remove nodes that match a value                               │
│  • Traverse, count, search                                       │
│  • Regroup nodes (odd/even positions) without extra memory       │
│  • Two lists that might share a tail                             │
│  • "Implement / design a linked list"                            │
└──────────────────────────────────────────────────────────────────┘
```

### The node

```
   ┌───────┬──────┐
   │  val  │ next ─┼──►  (another node, or ∅ = null)
   └───────┴──────┘

   A list is just the first node (the HEAD). Everything else is reached by following arrows.

   head
    │
    ▼
   [1] ──► [2] ──► [3] ──► ∅
```

### Array vs linked list

| Operation | Array | Linked list |
|---|---|---|
| Access k-th item | **O(1)** | O(k), must walk |
| Insert / delete at front | O(n), shift everything | **O(1)** |
| Insert / delete in the middle (node already found) | O(n) shift | **O(1)** rewire |
| Search for a value | O(n) | O(n) |
| Extra memory per item | none | one pointer |
| Cache friendly | yes | no |

### Rule #1: never lose the rest of the list

```
   You want to put X between A and B.

   [A] ──► [B] ──► [C] ──► ∅          [X]

   ✗ WRONG ORDER:   A.next ← X  first
                    [A] ──► [X]        [B] ──► [C]   ← nobody points to B any more.
                                                       B and C are LOST.

   ✓ RIGHT ORDER:   ① X.next ← A.next      (X grabs B first)
                    ② A.next ← X           (then A lets go of B)

                    [A]     [B] ──► [C] ──► ∅
                     │       ▲
                     │  ①    │
                     └─►[X]──┘
                        ▲
                        └── ② A now points here

   Mantra: "NEW node grabs the rest FIRST, then the OLD node points to it."
```

### Rule #2: the DUMMY (sentinel) head

```
   Problem: deleting or inserting AT THE HEAD needs a special case,
            because the head has no "previous" node.

   Fix: put a fake node in front.

   dummy
     │
     ▼
   [ D ] ──► [1] ──► [2] ──► [3] ──► ∅
     ▲
     └── now EVERY real node has a previous node,
         including the head.

   At the end:  return dummy.next     (the real head, which may have changed)
```

> 💡 **Whenever the head might change, start with a dummy.** It turns 2 code paths into 1.

### Null-check checklist

```
  ☐ Is the list empty (head = ∅)?
  ☐ Before reading curr.next, is curr ≠ ∅?
  ☐ Before reading curr.next.next, is curr.next ≠ ∅?
  ☐ Am I returning dummy.next (not the old head)?
  ☐ Did I save next BEFORE changing curr.next?
  ☐ Does the last node point to ∅? (or did I create a cycle?)
```

### Recursion vs iteration

| | Iteration | Recursion |
|---|---|---|
| Extra space | **O(1)** | O(n) call stack |
| Risk | off-by-one | stack overflow on long lists (10⁵ nodes) |
| Best for | almost everything here | elegant "process the rest, then fix me" problems |

> In interviews, prefer **iteration** for basic operations. Mention recursion as an alternative.

---

## 1. Search in Linked List (Easy)

### Problem
Given the head of a list and a `key`, return **true** if some node holds `key`, else **false**.

> **Convention (GFG):** `searchKey(n, head, key)` returns a boolean.

### Visualize it

```
   key = 3

   head
    ▼
   [1] ──► [2] ──► [3] ──► [4] ──► ∅
    ▲       ▲       ▲
   curr    curr    curr = 3  ✅ found → true
   1≠3     2≠3
```

### The 4 steps

| Step | Answer |
|---|---|
| Start | `curr = head` |
| Loop condition | `curr ≠ ∅` |
| Body | if `curr.val == key` → return true; else `curr = curr.next` |
| End | walked off the end → return false |

### Trace

```
  list [1,2,3,4]

  key = 3:  curr=1 (no) → curr=2 (no) → curr=3 (YES) → true ✅
  key = 5:  curr=1 → 2 → 3 → 4 → ∅  (all no)       → false ✅
```

### Pseudocode

```
function search(head, key):
    curr ← head
    while curr ≠ ∅:
        if curr.val == key: return true
        curr ← curr.next
    return false
```

### Recursive version

```
function searchRec(node, key):
    if node == ∅:       return false
    if node.val == key: return true
    return searchRec(node.next, key)
```

### Complexity
Time O(n), space O(1) iterative, O(n) recursive.

### 📌 Points to remember
- `while curr ≠ ∅` visits **every** node. `while curr.next ≠ ∅` stops **at the last** node. Know which one you need.
- This walk is the skeleton of every other problem in this guide.

---

## 2. Linked List Insertion (Easy)

### Problem
Insert a value at the **beginning**, at the **end**, or at a **position**.

> **Conventions used here:**
> - GFG `insertAtBeginning(head, x)` and `insertAtEnd(head, x)` return the new head.
> - For "insert at position", positions are **0-based**: `pos = 0` makes the new node the head,
>   `pos = length` appends at the tail, and `pos > length` leaves the list unchanged.

### A. Insert at the beginning: O(1)

```
   BEFORE:   head
              ▼
             [5] ──► [20] ──► ∅

   ① new.next ← head
             [10] ──► [5] ──► [20] ──► ∅
   ② head ← new
             head
              ▼
             [10] ──► [5] ──► [20] ──► ∅
```

### B. Insert at the end: O(n)

```
   Walk to the LAST node (curr.next == ∅), then hang the new node there.

   [10] ──► [5] ──► [20] ──► ∅
                     ▲
                    curr   (curr.next is ∅ → stop)

   ① curr.next ← new
   [10] ──► [5] ──► [20] ──► [30] ──► ∅

   Edge case: empty list → the new node IS the head.
```

> 💡 Keep a `tail` pointer if you append a lot. That makes insert-at-end O(1).

### C. Insert at position `pos`: find the node BEFORE it

```
   Insert 15 at pos = 1 into [10, 5, 20]

   dummy
     ▼
   [ D ] ──► [10] ──► [5] ──► [20] ──► ∅
              ▲
             prev  (walked pos = 1 step from dummy)

   ① new.next  ← prev.next     [15] ──► [5]
   ② prev.next ← new           [10] ──► [15]

   [ D ] ──► [10] ──► [15] ──► [5] ──► [20] ──► ∅      ✅
```

> With a dummy, `pos = 0` works the same way (prev = dummy). No special case.

### Trace

```
  start: ∅
  insertAtEnd 5        → [5]
  insertAtBeginning 10 → [10, 5]
  insertAtEnd 20       → [10, 5, 20]
  insertAt pos=1, 15   → [10, 15, 5, 20]   ✅
  insertAt pos=9, 99   → [10, 15, 5, 20]   (pos > length → unchanged)
```

### Pseudocode

```
function insertAtBeginning(head, x):
    node ← new Node(x)
    node.next ← head
    return node

function insertAtEnd(head, x):
    node ← new Node(x)
    if head == ∅: return node
    curr ← head
    while curr.next ≠ ∅:
        curr ← curr.next
    curr.next ← node
    return head

function insertAtPosition(head, pos, x):
    dummy ← new Node(0); dummy.next ← head
    prev ← dummy
    repeat pos times:
        if prev == ∅: return head            // pos > length
        prev ← prev.next
    if prev == ∅: return head
    node ← new Node(x)
    node.next ← prev.next                    // ① grab the rest first
    prev.next ← node                         // ② then link in
    return dummy.next
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| At beginning | O(1) | O(1) |
| At end (no tail pointer) | O(n) | O(1) |
| At position pos | O(pos) | O(1) |

### 📌 Points to remember
- **To insert at a position, stop at the node BEFORE it.**
- Order matters: `new.next` first, then `prev.next`.
- Return the head. It changes when you insert at the front.

---

## 3. Remove Linked List Elements (Easy)

### Problem
Remove **every** node whose value equals `val`. Return the new head.

### Visualize it

```
   val = 6

   [1] ──► [2] ──► [6] ──► [3] ──► [4] ──► [5] ──► [6] ──► ∅
                    ✗                                ✗

   result: [1] ──► [2] ──► [3] ──► [4] ──► [5] ──► ∅
```

### The delete move: skip over the node

```
   prev     prev.next (to delete)
    ▼        ▼
   [2] ──► [6] ──► [3]

   prev.next ← prev.next.next

   [2] ─────────────► [3]        [6] is now unreachable (garbage)
             [6] ──┘
```

### Why the head is a problem, and the dummy fix

```
   [7] ──► [7] ──► [7] ──► [7] ──► ∅,   val = 7

   Without a dummy: the HEAD itself must be deleted, again and again → special loop.

   With a dummy:
   [ D ] ──► [7] ──► [7] ──► [7] ──► [7] ──► ∅
     ▲
    prev  → keeps skipping, never moves → [ D ] ──► ∅
   return dummy.next = ∅   ✅
```

### ⚠️ The key detail: do NOT advance `prev` after a delete

```
   After skipping, prev.next is a NEW node that hasn't been checked yet.
   Only move prev forward when you KEEP the next node.

   if prev.next.val == val:   prev.next ← prev.next.next     (stay)
   else:                      prev ← prev.next               (move)
```

### Trace ([1,2,6,3,4,5,6], val = 6)

```
  prev  │ prev.next │ action         │ list from dummy
  ──────┼───────────┼────────────────┼─────────────────────────
  D     │ 1         │ keep, move     │ D→1→2→6→3→4→5→6
  1     │ 2         │ keep, move     │
  2     │ 6         │ DELETE, stay   │ D→1→2→3→4→5→6
  2     │ 3         │ keep, move     │
  3     │ 4         │ keep, move     │
  4     │ 5         │ keep, move     │
  5     │ 6         │ DELETE, stay   │ D→1→2→3→4→5
  5     │ ∅         │ stop           │

  return dummy.next → [1,2,3,4,5] ✅
```

### Trace ([7,7,7,7], val = 7)

```
  prev = D: next 7 → delete, next 7 → delete, next 7 → delete, next 7 → delete, next ∅ → stop
  return dummy.next = ∅ → [] ✅
```

### Pseudocode

```
function removeElements(head, val):
    dummy ← new Node(0); dummy.next ← head
    prev ← dummy
    while prev.next ≠ ∅:
        if prev.next.val == val:
            prev.next ← prev.next.next      // skip; DON'T move prev
        else:
            prev ← prev.next
    return dummy.next
```

### Recursive version (elegant)

```
function removeRec(node, val):
    if node == ∅: return ∅
    node.next ← removeRec(node.next, val)   // clean the rest first
    return (node.val == val) ? node.next : node
```

### Complexity
Time O(n). Space O(1) iterative, O(n) recursive.

### 📌 Points to remember
- **Dummy head** makes "delete the head" a normal case.
- **Don't advance after a delete.** Consecutive matches (`6 → 6`) would otherwise be missed.
- Loop on `prev.next ≠ ∅`, because you always look one node ahead.

---

## 4. Remove Nth Node From End of List (Medium)

### Problem
Remove the **n-th node from the end** and return the head.

### Visualize it

```
   n = 2

   [1] ──► [2] ──► [3] ──► [4] ──► [5] ──► ∅
                            ▲
                   2nd from the end → remove

   result: [1] ──► [2] ──► [3] ──► [5] ──► ∅
```

### Turn "from the end" into "from the start"

```
   length L = 5

   position from the END:     5    4    3    2    1
   index from the START:      0    1    2    3    4
                             [1]  [2]  [3]  [4]  [5]

   n-th from end  =  index (L − n) from the start  =  index 3  → node [4]
   We need the node BEFORE it  → walk (L − n) steps from the DUMMY.
```

### Two-pass method (taught here)

```
   Pass 1: count L.
   Pass 2: from dummy, walk L − n steps → prev. Then prev.next ← prev.next.next.
```

> The **one-pass** version keeps two pointers n apart. See
> [02-Fast-and-Slow-Pointers.md](02-Fast-and-Slow-Pointers.md).

### Trace ([1,2,3,4,5], n = 2)

```
  Pass 1: L = 5
  Pass 2: steps = L − n = 3

  dummy → 1 → 2 → 3        (3 steps)
                  ▲
                 prev

  prev.next = [4]  → skip it:  3.next ← 5

  [ D ] ──► [1] ──► [2] ──► [3] ──► [5] ──► ∅
  return dummy.next → [1,2,3,5] ✅
```

### Trace ([1], n = 1): the head itself is removed

```
  L = 1, steps = 0 → prev = dummy
  dummy.next ← dummy.next.next = ∅
  return dummy.next → [] ✅          (this is exactly why the dummy exists)
```

### Pseudocode

```
function removeNthFromEnd(head, n):
    L ← 0; curr ← head
    while curr ≠ ∅: L ← L + 1; curr ← curr.next

    dummy ← new Node(0); dummy.next ← head
    prev ← dummy
    repeat (L − n) times:
        prev ← prev.next
    prev.next ← prev.next.next
    return dummy.next
```

### Complexity

| Approach | Passes | Time | Space |
|---|---|---|---|
| **Two-pass (count, then walk)** | 2 | O(L) | O(1) |
| One-pass gap pointers (guide 02) | 1 | O(L) | O(1) |
| Store nodes in an array | 1 | O(L) | O(L) |

### 📌 Points to remember
- **n-th from end = index L − n from the start.**
- Start the walk at the **dummy** so you land on the node **before** the target.
- LeetCode guarantees `1 ≤ n ≤ L`. If not guaranteed, check it.

---

## 5. Odd Even Linked List (Medium)

### Problem
Group all nodes at **odd positions** first, then all nodes at **even positions**, keeping the
relative order inside each group. Positions are **1-based indices**, **not values**.
Use O(1) extra space.

### Visualize it

```
   position:  1       2       3       4       5
             [1] ──► [2] ──► [3] ──► [4] ──► [5] ──► ∅
              odd     even    odd     even    odd

   result:   [1] ──► [3] ──► [5] ──► [2] ──► [4] ──► ∅
             └─── odd chain ──┘     └─ even chain ┘
```

### The idea: unzip into two chains, then glue

```
   odd  ──► takes every 2nd node starting at position 1
   even ──► takes every 2nd node starting at position 2
   evenHead remembers where the even chain starts

   Each round (two rewires, in this order):
     ① odd.next  ← even.next     odd jumps over even
     ②  odd      ← odd.next
     ③ even.next ← odd.next      even jumps over the NEW odd
     ④  even     ← even.next

   At the end:  odd.next ← evenHead   (glue the even chain behind the odd chain)
```

### Trace ([1,2,3,4,5])

```
  start: odd=1, even=2, evenHead=2

  Round 1 (even=2, even.next=3 exists):
     1.next ← 3 ; odd=3
     2.next ← 4 ; even=4
     odd chain: 1→3     even chain: 2→4

  Round 2 (even=4, even.next=5 exists):
     3.next ← 5 ; odd=5
     4.next ← ∅ ; even=∅
     odd chain: 1→3→5   even chain: 2→4

  Stop (even = ∅).
  Glue: 5.next ← evenHead(2)

  [1] ──► [3] ──► [5] ──► [2] ──► [4] ──► ∅   ✅
```

### Trace ([2,1,3,5,6,4,7])

```
  positions: 1:2  2:1  3:3  4:5  5:6  6:4  7:7

  odd positions  (1,3,5,7): 2, 3, 6, 7
  even positions (2,4,6):   1, 5, 4

  Rounds:
    odd=2,even=1 → 2.next←3, odd=3 ; 1.next←5, even=5
    odd=3,even=5 → 3.next←6, odd=6 ; 5.next←4, even=4
    odd=6,even=4 → 6.next←7, odd=7 ; 4.next←∅, even=∅
  Glue: 7.next ← evenHead(1)

  → [2,3,6,7,1,5,4] ✅
```

### Pseudocode

```
function oddEvenList(head):
    if head == ∅: return head
    odd ← head
    even ← head.next
    evenHead ← even
    while even ≠ ∅ and even.next ≠ ∅:
        odd.next  ← even.next
        odd       ← odd.next
        even.next ← odd.next
        even      ← even.next
    odd.next ← evenHead
    return head
```

### Why the loop condition is `even ≠ ∅ and even.next ≠ ∅`

```
  even = ∅            → list had an odd count;  odd is the last node     → stop
  even.next = ∅       → list had an even count; even is the last node    → stop
  Either way, odd is the LAST odd node, which is where we glue.
```

### Complexity
Time O(n), space O(1).

### 📌 Points to remember
- It's about **positions**, not values. `[2,1,3,…]`: the value 1 sits at an even position.
- **Save `evenHead`** before rewiring, or you lose the even chain's start.
- The even chain's tail ends at ∅ automatically (step ③ sets it).

---

## 6. Intersection of Two Linked Lists (Easy)

### Problem
Two lists may **merge** into a shared tail. Return the **first shared node** (same node object,
not just the same value), or ∅ if they never meet.

### Visualize it

```
   A:  [4a] ──► [1a] ─┐
                      ▼
                     [8] ──► [4] ──► [5] ──► ∅      ← shared tail (c = 3 nodes)
                      ▲
   B:  [5b] ──► [6b] ──► [1b] ─┘

   a = 2 (A's own part)   b = 3 (B's own part)   c = 3 (shared)
   Answer: node [8]

   ⚠ [1a] and [1b] have the SAME VALUE but are DIFFERENT nodes. Compare nodes, not values.
```

### Approach 1: hash set (simple, O(m) space)

```
   Walk A, put every NODE in a set.
   Walk B, return the first node already in the set.
```

### Approach 2: length difference (O(1) space)

```
   lenA = 5, lenB = 6 → B is 1 longer → advance B by 1 first.

   A:        [4a] [1a] [8] [4] [5]
   B:  [5b]  [6b] [1b] [8] [4] [5]
        skip  ▲
              start B here, now both have 5 nodes left

   Walk together:  (4a, 6b) → (1a, 1b) → (8, 8)  ✅ same node
```

### Approach 3: switch heads (the elegant trick)

```
   pA walks A, then jumps to the head of B.
   pB walks B, then jumps to the head of A.

   pA travels:  a + c  then  b  → reaches the meeting point after a + c + b
   pB travels:  b + c  then  a  → reaches the meeting point after b + c + a

           a + c + b  ==  b + c + a        ← same distance! They MUST arrive together.

   ┌───── a ─────┐┌──── c ────┐┌──── b ────┐
   pA: 4a 1a      8  4  5  ∅   5b 6b 1b     8 ◄── meet
   pB: 5b 6b 1b   8  4  5  ∅   4a 1a        8 ◄── meet
   └────── b ─────┘└─── c ───┘└── a ──┘

   No intersection (c = 0): both walk a + b and reach ∅ at the SAME time → return ∅.
```

### Trace: switch heads (with intersection)

> Rule: if the pointer is ∅, jump to the other head. Otherwise step forward.
> Note that the ∅ position counts as one step.

```
  step │ pA   │ pB   │ equal?
  ─────┼──────┼──────┼───────
   0   │ 4a   │ 5b   │
   1   │ 1a   │ 6b   │
   2   │ 8    │ 1b   │
   3   │ 4    │ 8    │
   4   │ 5    │ 4    │
   5   │ ∅    │ 5    │
   6   │ 5b   │ ∅    │        pA jumped to B's head
   7   │ 6b   │ 4a   │        pB jumped to A's head
   8   │ 1b   │ 1a   │        same value 1, different nodes → not equal
   9   │ 8    │ 8    │  YES → return [8] ✅
```

### Trace: switch heads (no intersection)

```
  A: [2] → [6] → [4] → ∅       B: [1] → [5] → ∅

  step │ pA  │ pB
  ─────┼─────┼─────
   0   │ 2   │ 1
   1   │ 6   │ 5
   2   │ 4   │ ∅
   3   │ ∅   │ 2     (pB jumped to A)
   4   │ 1   │ 6     (pA jumped to B)
   5   │ 5   │ 4
   6   │ ∅   │ ∅     both ∅ → equal → return ∅ ✅
```

### Pseudocode (switch heads)

```
function getIntersectionNode(headA, headB):
    pA ← headA
    pB ← headB
    while pA ≠ pB:                          // compares NODES (identity)
        pA ← (pA == ∅) ? headB : pA.next
        pB ← (pB == ∅) ? headA : pB.next
    return pA                               // meeting node, or ∅
```

### Pseudocode (length difference)

```
function getIntersectionByLength(headA, headB):
    lenA ← length(headA); lenB ← length(headB)
    pA ← headA; pB ← headB
    while lenA > lenB: pA ← pA.next; lenA ← lenA − 1
    while lenB > lenA: pB ← pB.next; lenB ← lenB − 1
    while pA ≠ pB:
        pA ← pA.next; pB ← pB.next
    return pA
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force (each A node vs each B node) | O(m·n) | O(1) |
| Hash set | O(m + n) | O(m) |
| Length difference | O(m + n) | O(1) |
| **Switch heads** | **O(m + n)** | **O(1)** ✅ |

### 📌 Points to remember
- Compare **nodes**, never values.
- Switch heads works because **a + c + b = b + c + a**.
- The loop ends in at most `m + n + 1` steps, even with no intersection, because both pointers hit ∅ together.
- Don't modify the lists. LeetCode checks that they're unchanged.

---

## 7. Design Linked List (Medium)

### Problem (LeetCode 707)
Build a singly linked list class with **0-based indices**:

| Method | Meaning |
|---|---|
| `get(index)` | value at index, or **−1** if index is invalid |
| `addAtHead(val)` | insert before the first node |
| `addAtTail(val)` | append at the end |
| `addAtIndex(index, val)` | insert **before** the node at `index`. `index == size` appends. `index > size` does nothing |
| `deleteAtIndex(index)` | delete the node at `index` if it's valid |

### The design: dummy head + size counter

```
   dummy (never holds data)
     ▼
   [ D ] ──► [n0] ──► [n1] ──► ... ──► ∅
   size = number of real nodes

   Every insert/delete at index i:  walk i steps from dummy → prev,
                                    then rewire prev.next.
   addAtHead  = addAtIndex(0, val)
   addAtTail  = addAtIndex(size, val)
```

> 💡 With a dummy and a size counter, **all five methods share one walk**. Validity checks are just comparisons with `size`.

### Trace (LeetCode example)

```
  ["MyLinkedList","addAtHead","addAtTail","addAtIndex","get","deleteAtIndex","get"]
  [[],            [1],        [3],        [1,2],       [1],  [1],            [1]]

  op                │ list (after dummy)   │ size │ returns
  ──────────────────┼──────────────────────┼──────┼────────
  MyLinkedList()    │ ∅                    │  0   │ null
  addAtHead(1)      │ 1                    │  1   │ null
  addAtTail(3)      │ 1 → 3                │  2   │ null
  addAtIndex(1, 2)  │ 1 → 2 → 3            │  3   │ null
  get(1)            │ 1 → 2 → 3            │  3   │ 2
  deleteAtIndex(1)  │ 1 → 3                │  2   │ null
  get(1)            │ 1 → 3                │  2   │ 3

  → [null,null,null,null,2,null,3] ✅
```

### Picture: `addAtIndex(1, 2)` on `1 → 3`

```
   walk 1 step from dummy:  prev = [1]

   [ D ] ──► [1] ──► [3] ──► ∅
              ▲
             prev

   ① new.next  ← prev.next        [2] ──► [3]
   ② prev.next ← new              [1] ──► [2]

   [ D ] ──► [1] ──► [2] ──► [3] ──► ∅   size = 3
```

### Picture: `deleteAtIndex(1)` on `1 → 2 → 3`

```
   prev = [1]
   prev.next ← prev.next.next

   [ D ] ──► [1] ─────────► [3] ──► ∅   size = 2
                    [2] ─┘ (gone)
```

### Pseudocode

```
class MyLinkedList:
    init():
        dummy ← new Node(0)
        size  ← 0

    get(index):
        if index < 0 or index ≥ size: return −1
        curr ← dummy.next
        repeat index times: curr ← curr.next
        return curr.val

    addAtHead(val):  addAtIndex(0, val)
    addAtTail(val):  addAtIndex(size, val)

    addAtIndex(index, val):
        if index > size: return                  // invalid: do nothing
        if index < 0: index ← 0                  // (LeetCode never sends this; safe default)
        prev ← dummy
        repeat index times: prev ← prev.next
        node ← new Node(val)
        node.next ← prev.next                    // ① grab the rest
        prev.next ← node                         // ② link in
        size ← size + 1

    deleteAtIndex(index):
        if index < 0 or index ≥ size: return
        prev ← dummy
        repeat index times: prev ← prev.next
        prev.next ← prev.next.next
        size ← size − 1
```

### Complexity per operation

| Method | Time | Note |
|---|---|---|
| `get(i)` | O(i) | walk |
| `addAtHead` | O(1) | prev = dummy |
| `addAtTail` | O(n) | O(1) with a tail pointer, or a doubly linked list |
| `addAtIndex(i)` | O(i) | |
| `deleteAtIndex(i)` | O(i) | |

### Upgrade: doubly linked list with two sentinels

```
   [HEAD] ⇄ [n0] ⇄ [n1] ⇄ ... ⇄ [TAIL]

   • addAtTail becomes O(1)
   • walk from whichever end is closer → O(min(i, n − i))
   • every insert/delete rewires 4 pointers instead of 2
```

### 📌 Points to remember
- `addAtIndex` allows `index == size` (append). `get` and `deleteAtIndex` do **not**.
- Keep `size` exact. Every validity check relies on it.
- Build `addAtHead` and `addAtTail` on top of `addAtIndex`. Less code means fewer bugs.

---

## 8. Master Cheat Sheet

### All 7 problems at a glance

```
┌──────────────────────────────┬───────────────────────────────────────────────┬────────────┐
│ Problem                      │ Core move                                     │ Time/Space │
├──────────────────────────────┼───────────────────────────────────────────────┼────────────┤
│ Search in Linked List        │ walk while curr ≠ ∅, compare                  │ O(n), O(1) │
│ Linked List Insertion        │ stop BEFORE position; new.next first          │ O(pos),O(1)│
│ Remove Linked List Elements  │ dummy; skip match, DON'T advance after delete │ O(n), O(1) │
│ Remove Nth From End          │ length L; walk L−n from dummy; skip           │ O(n), O(1) │
│ Odd Even Linked List         │ unzip odd/even chains; glue evenHead          │ O(n), O(1) │
│ Intersection of Two Lists    │ switch heads: a+c+b = b+c+a                   │ O(m+n),O(1)│
│ Design Linked List           │ dummy + size; one shared walk                 │ O(i) per op│
└──────────────────────────────┴───────────────────────────────────────────────┴────────────┘
```

### Pattern family tree

```
                       BASIC LINKED LIST OPERATIONS
                                   │
      ┌────────────────┬───────────┼────────────────┬──────────────────┐
      │                │           │                │                  │
   TRAVERSE         INSERT       DELETE          REGROUP          TWO LISTS
      │                │           │                │                  │
   └ Search       └ Insertion   ├ Remove        └ Odd Even        └ Intersection
                                │   Elements
                                └ Remove Nth
                                    From End
                              ALL OF THEM TOGETHER
                                └ Design Linked List
```

### The 3 pointer moves

```
   INSERT after prev:              DELETE after prev:           ADVANCE:
   ① new.next  ← prev.next         prev.next ← prev.next.next   curr ← curr.next
   ② prev.next ← new

   [p] ──► [x]                     [p] ──► [d] ──► [x]
     └─►[new]─┘                      └─────────────┘
```

### When to use which tool

```
   ┌──────────────────────────────────┬──────────────────────────────┐
   │ Situation                        │ Tool                         │
   ├──────────────────────────────────┼──────────────────────────────┤
   │ head might be deleted / replaced │ DUMMY head                   │
   │ need the node BEFORE a target    │ walk from dummy, look ahead  │
   │ "k-th from the end"              │ length, or gap pointers (02) │
   │ split into groups in place       │ two chains + saved heads     │
   │ two lists, find shared part      │ switch heads / length diff   │
   │ frequent appends                 │ keep a TAIL pointer          │
   └──────────────────────────────────┴──────────────────────────────┘
```

### Optimization checklist

```
  ☐ Can a dummy head remove my special cases?
  ☐ Do I really need a hash set, or can two pointers do it in O(1) space?
  ☐ Can I do it in one pass? (gap pointers → guide 02)
  ☐ Many tail inserts? Keep a tail pointer.
  ☐ Recursion on 10⁵ nodes? Switch to iteration.
```

### 🚩 Common bugs to avoid

```
  ✗ Setting prev.next ← new BEFORE new.next ← prev.next  (loses the rest of the list)
  ✗ Forgetting the head case → use a dummy, return dummy.next
  ✗ Advancing prev right after a delete (misses consecutive matches)
  ✗ Reading curr.next when curr is ∅
  ✗ Odd Even: grouping by VALUE instead of POSITION; not saving evenHead
  ✗ Intersection: comparing values instead of nodes
  ✗ Design: allowing get(size) or deleteAtIndex(size); not updating size
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which arrow am I about to change, and does something   ║
   ║   still point to everything I will need afterwards?"     ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Search in Linked List (Easy)
- [ ] Linked List Insertion (Easy)
- [ ] Remove Linked List Elements (Easy)
- [ ] Remove Nth Node From End of List (Medium)
- [ ] Odd Even Linked List (Medium)
- [ ] Intersection of Two Linked Lists (Easy)
- [ ] Design Linked List (Medium)
