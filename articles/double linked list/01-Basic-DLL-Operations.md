# Basic Doubly Linked List Operations: A Visual Guide

> **Goal:** Learn to *see* every `prev` / `next` rewire in a doubly linked list (DLL), then use the DLL
> as the engine inside O(1) caches (LRU, LFU).
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [../linked list/01-Basic-Operations.md](../linked%20list/01-Basic-Operations.md).

---

## Table of Contents

0. [The Big Idea: What Is a Doubly Linked List?](#0-the-big-idea-what-is-a-doubly-linked-list)
1. [Implement Doubly Linked List (Easy)](#1-implement-doubly-linked-list-easy)
2. [Doubly Linked List Insertion (Easy)](#2-doubly-linked-list-insertion-easy)
3. [Delete Node in Doubly Linked List (Easy)](#3-delete-node-in-doubly-linked-list-easy)
4. [Reverse Doubly Linked List (Easy)](#4-reverse-doubly-linked-list-easy)
5. [LRU Cache (Medium)](#5-lru-cache-medium)
6. [LFU Cache (Hard)](#6-lfu-cache-hard)
7. [Master Cheat Sheet](#7-master-cheat-sheet)

> **Suggested order:** Implement → Insert → Delete → Reverse → LRU Cache → LFU Cache.
> The first four teach the pointer moves. LRU uses them inside a design. LFU uses LRU's idea many times over.

---

## 0. The Big Idea: What Is a Doubly Linked List?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "DOUBLY LINKED LIST"                    │
├──────────────────────────────────────────────────────────────────┤
│  • "Insert / delete in a DLL", "print forward AND backward"      │
│  • You must delete a node you ALREADY HOLD in O(1)               │
│  • "Most recently used", "least recently used", "evict"          │
│  • Design a cache with O(1) get and put                          │
│  • Move an item to the front / back many times                   │
└──────────────────────────────────────────────────────────────────┘
```

### The node: two arrows instead of one

```
          ┌──────┬───────┬──────┐
          │ prev │  val  │ next │
          └──────┴───────┴──────┘
             ◄──            ──►

   A list of 3 nodes:

   ∅ ◄── [1] ⇄ [2] ⇄ [3] ──► ∅
         head          tail

   [1].prev = ∅      [1].next = [2]
   [2].prev = [1]    [2].next = [3]
   [3].prev = [2]    [3].next = ∅
```

### Singly vs doubly linked list

| | Singly (SLL) | Doubly (DLL) |
|---|---|---|
| Pointers per node | 1 (`next`) | 2 (`prev`, `next`) |
| Walk backward | ✗ | ✓ |
| Delete a node you hold | O(n): you must find its predecessor | **O(1)**: `node.prev` is right there |
| Insert before a node you hold | O(n) | **O(1)** |
| Memory | less | one extra pointer per node |
| Pointer updates per insert / delete | 2 / 1 | **4 / 2** (more places to make mistakes) |

> 💡 **Key insight:** the DLL's superpower is **O(1) delete of a node you already have a reference to**.
> Pair it with a hash map (key → node) and you can find *and* unlink any item in O(1). That is every cache design.

### The sentinel trick: dummy nodes at BOTH ends

```
   Without sentinels, every operation asks:
     "Is this the head? Is this the tail? Is the list empty?"   → many if-checks, many bugs

   With sentinels:

   [HEAD] ⇄ [1] ⇄ [2] ⇄ [3] ⇄ [TAIL]
    dummy                      dummy

   Empty list:   [HEAD] ⇄ [TAIL]

   Every REAL node always has a real prev and a real next.
   → No null checks. Ever.
```

### The two helpers every design reuses

```
  ① remove(node)                         ② insertAfter(a, n)

  before:  [A] ⇄ [X] ⇄ [B]               before:  [A] ⇄ [B]
                                                        (n is loose)
  1. X.prev.next = X.next   (A → B)
  2. X.next.prev = X.prev   (A ← B)      1. n.prev = a           n's own arrows first
                                         2. n.next = a.next      (nothing breaks yet)
  after:   [A] ⇄ [B]                     3. a.next.prev = n      B ← n
           X is unlinked                 4. a.next = n           A → n   (LAST: it overwrites a.next)

                                         after:   [A] ⇄ [n] ⇄ [B]
```

```
function remove(node):
    node.prev.next ← node.next
    node.next.prev ← node.prev

function insertAfter(a, n):
    n.prev ← a
    n.next ← a.next
    a.next.prev ← n
    a.next ← n
```

> ⚠️ **The safe-order rule:** set the NEW node's own pointers first. Change `a.next` LAST,
> because steps 2 and 3 still need the old `a.next`.

### Pointer-update checklist (no sentinels)

```
  INSERT touches up to 4 arrows:   new.prev, new.next, left.next, right.prev
  DELETE touches up to 2 arrows:   left.next, right.prev

  For every arrow that touches a neighbour, ask: "Does that neighbour exist?"
     left  missing → you are changing the HEAD
     right missing → you are at the TAIL
```

---

## 1. Implement Doubly Linked List (Easy)

### Problem
**GFG-style convention used here:** given an array `arr`, build a DLL with the same values in order and return its head.
Then print it **forward** (head → tail) and **backward** (tail → head).

### Visualize it

```
   arr = [1, 2, 3]

   step 1:   ∅ ◄─ [1] ─► ∅                     head = tail = [1]

   step 2:   ∅ ◄─ [1] ⇄ [2] ─► ∅               tail = [2]

   step 3:   ∅ ◄─ [1] ⇄ [2] ⇄ [3] ─► ∅         tail = [3]
```

### The decision: "append to tail" needs exactly two links

```
       old tail          new node
        [ T ]  ───────►   [ N ]        T.next = N
        [ T ]  ◄───────   [ N ]        N.prev = T
                                       tail ← N
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `head`, `tail` pointers |
| Transition | for each value: link `tail ⇄ new`, move `tail` |
| Base | first node becomes both head and tail |
| Order | left → right through `arr` |
| Answer | `head` (and print both directions) |

### Trace (arr = [1, 2, 3])

| i | value | action | list | head | tail |
|---|---|---|---|---|---|
| 0 | 1 | create, head = tail = [1] | `∅⇄[1]⇄∅` | 1 | 1 |
| 1 | 2 | tail.next = [2], [2].prev = tail | `∅⇄[1]⇄[2]⇄∅` | 1 | 2 |
| 2 | 3 | tail.next = [3], [3].prev = tail | `∅⇄[1]⇄[2]⇄[3]⇄∅` | 1 | 3 |

```
  Forward  (follow next from head):  1 → 2 → 3
  Backward (follow prev from tail):  3 → 2 → 1
```

### Pseudocode

```
function constructDLL(arr):
    if arr is empty: return null
    head ← new Node(arr[0])
    tail ← head
    for i from 1 to n-1:
        node      ← new Node(arr[i])
        tail.next ← node
        node.prev ← tail
        tail      ← node
    return head

function printForward(head):
    curr ← head
    while curr ≠ null:
        print curr.val
        curr ← curr.next

function printBackward(head):
    curr ← head
    if curr == null: return
    while curr.next ≠ null: curr ← curr.next     // walk to the tail
    while curr ≠ null:
        print curr.val
        curr ← curr.prev
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| Build from array | O(n) | O(n) nodes |
| Print forward | O(n) | O(1) |
| Print backward (from head) | O(n) | O(1) |

### 📌 Points to remember
- Keep a `tail` pointer while building, or each append costs O(n).
- Backward printing is the quickest **test that your `prev` pointers are right**. Forward printing alone cannot catch a broken `prev`.
- An empty array returns `null`.

---

## 2. Doubly Linked List Insertion (Easy)

### Problem
**GFG convention used here:** given the head of a DLL, a position `p` (**0-based**) and a value `x`,
insert a new node with value `x` **after** the `p`-th node.

```
   2 ⇄ 4 ⇄ 5,  p = 2, x = 6    →   2 ⇄ 4 ⇄ 5 ⇄ 6        (after index 2 = the tail)
   1 ⇄ 2 ⇄ 3 ⇄ 4,  p = 0, x = 44 → 1 ⇄ 44 ⇄ 2 ⇄ 3 ⇄ 4  (after the head)
```

### Visualize the middle case (the general one)

```
   Insert N after C:

   BEFORE:    [C] ⇄ [R]                     R = C.next
                         [N] (loose)

   1. N.prev = C            [C] ◄── [N]
   2. N.next = R            [C] ◄── [N] ──► [R]
   3. R.prev = N            [C] ◄── [N] ⇄ [R]      ⚠ needs C.next, so do it BEFORE step 4
   4. C.next = N            [C] ⇄ [N] ⇄ [R]

   AFTER:     [C] ⇄ [N] ⇄ [R]
```

### Three cases

```
  ┌──────────────────────┬────────────────────────────────────────────────┐
  │ Case                 │ What changes                                   │
  ├──────────────────────┼────────────────────────────────────────────────┤
  │ After a middle node  │ all 4 arrows                                   │
  │ After the TAIL       │ R doesn't exist → skip step 3; N.next = ∅      │
  │ Empty list (bonus)   │ N becomes the head (GFG never passes this)     │
  └──────────────────────┴────────────────────────────────────────────────┘

  Note: "after position p" can never make N the new head, because N always
  comes after an existing node. Inserting BEFORE the head is a different task
  (N.next = head, head.prev = N, head = N).
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `curr` = the p-th node |
| Transition | walk `p` steps from head, then do the 4 numbered updates |
| Base | `p = 0` → `curr = head` |
| Order | walk first, then link |
| Answer | the unchanged `head` |

### Trace 1 (2 ⇄ 4 ⇄ 5, p = 2, x = 6): the tail case

| step | action | result |
|---|---|---|
| walk | curr: [2] → [4] → [5] (2 steps) | curr = [5] |
| 1 | N.prev = [5] | |
| 2 | N.next = [5].next = ∅ | |
| 3 | [5].next is ∅ → **skip** | |
| 4 | [5].next = N | `2 ⇄ 4 ⇄ 5 ⇄ 6` ✅ |

### Trace 2 (1 ⇄ 2 ⇄ 3 ⇄ 4, p = 0, x = 44): the middle case

| step | action | result |
|---|---|---|
| walk | 0 steps | curr = [1], R = [2] |
| 1 | N.prev = [1] | |
| 2 | N.next = [2] | |
| 3 | [2].prev = N | |
| 4 | [1].next = N | `1 ⇄ 44 ⇄ 2 ⇄ 3 ⇄ 4` ✅ |

```
  Backward check:  4 → 3 → 2 → 44 → 1   ✓  ([2].prev was updated to 44)
```

### Pseudocode

```
function addNode(head, p, x):
    curr ← head
    repeat p times:
        curr ← curr.next
    node ← new Node(x)
    node.prev ← curr                        // 1
    node.next ← curr.next                   // 2
    if curr.next ≠ null:
        curr.next.prev ← node               // 3 (skip at the tail)
    curr.next ← node                        // 4 (always last)
    return head
```

### Complexity

| Case | Time | Space |
|---|---|---|
| Walk to position p | O(p) | O(1) |
| The link itself | **O(1)** | O(1) |

### 📌 Points to remember
- **0-based** `p`: walk exactly `p` steps.
- Order: new node's arrows → right neighbour's `prev` → left neighbour's `next`.
- The tail case is the only `if`. Sentinels would remove even that.
- Forgetting step 3 leaves a list that prints fine forward but breaks backward.

---

## 3. Delete Node in Doubly Linked List (Easy)

### Problem
**GFG convention used here:** given the head of a DLL and a position `x` (**1-based**), delete the `x`-th node and return the (possibly new) head.

```
   1 ⇄ 3 ⇄ 4,  x = 3       →   1 ⇄ 3            (delete the tail)
   1 ⇄ 5 ⇄ 2 ⇄ 9,  x = 1   →   5 ⇄ 2 ⇄ 9        (delete the head)
```

### Visualize the middle case

```
   Delete D:

   BEFORE:    [L] ⇄ [D] ⇄ [R]

   1. L.next = R        [L] ──────────► [R]
                        [L] ◄── [D] ⇄ [R]     (R still points back at D)
   2. R.prev = L        [L] ⇄ [R]

   AFTER:     [L] ⇄ [R]          D is unreachable (garbage)
```

> Only **2 arrows** change. D's own arrows don't matter once nobody points to it.
> (Clearing `D.prev` / `D.next` is optional tidiness, and helps catch bugs.)

### Three cases

```
  ┌─────────────┬────────────────────────────────────┬──────────────────────────┐
  │ Case        │ Picture                            │ Updates                  │
  ├─────────────┼────────────────────────────────────┼──────────────────────────┤
  │ HEAD (x=1)  │ ∅ ◄ [D] ⇄ [R] ...                  │ head = R ; R.prev = ∅    │
  │ MIDDLE      │ ... [L] ⇄ [D] ⇄ [R] ...            │ L.next = R ; R.prev = L  │
  │ TAIL        │ ... [L] ⇄ [D] ► ∅                  │ L.next = ∅               │
  │ only node   │ ∅ ◄ [D] ► ∅                        │ head = ∅                 │
  └─────────────┴────────────────────────────────────┴──────────────────────────┘

  Unified rule:  if D.prev exists → D.prev.next = D.next   else head = D.next
                 if D.next exists → D.next.prev = D.prev
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `del` = the x-th node |
| Transition | walk `x − 1` steps, then unlink with the unified rule |
| Base | `x = 1` → `del = head` |
| Order | walk first, then unlink |
| Answer | `head` (changes only when deleting the first node) |

### Trace 1 (1 ⇄ 3 ⇄ 4, x = 3): the tail

| step | action | result |
|---|---|---|
| walk | 2 steps: [1] → [3] → [4] | del = [4], L = [3], R = ∅ |
| left | [3].next = ∅ | |
| right | R is ∅ → skip | `1 ⇄ 3` ✅ |

### Trace 2 (1 ⇄ 5 ⇄ 2 ⇄ 9, x = 1): the head

| step | action | result |
|---|---|---|
| walk | 0 steps | del = [1], L = ∅, R = [5] |
| left | L is ∅ → head = [5] | |
| right | [5].prev = ∅ | `5 ⇄ 2 ⇄ 9` ✅ |

### Trace 3 (1 ⇄ 5 ⇄ 2 ⇄ 9, x = 3): the middle

| step | action | result |
|---|---|---|
| walk | 2 steps | del = [2], L = [5], R = [9] |
| left | [5].next = [9] | |
| right | [9].prev = [5] | `1 ⇄ 5 ⇄ 9` ✅ (backward: 9 → 5 → 1 ✓) |

### Pseudocode

```
function deleteNode(head, x):
    del ← head
    repeat (x − 1) times:
        del ← del.next
    if del.prev ≠ null:
        del.prev.next ← del.next
    else:
        head ← del.next                    // deleting the head
    if del.next ≠ null:
        del.next.prev ← del.prev
    return head
```

### Complexity

| Case | Time | Space |
|---|---|---|
| Walk to position x | O(x) | O(1) |
| Unlink (node already held) | **O(1)** | O(1) |

### 📌 Points to remember
- **1-based** `x`: walk `x − 1` steps. Compare with insertion, which is 0-based. Read each problem's convention!
- The head case is the only one that changes `head`. Always **return** the head.
- If you already hold the node (as caches do), deletion is O(1). No search needed.

---

## 4. Reverse Doubly Linked List (Easy)

### Problem
Reverse a DLL and return the new head.

### Visualize it

```
   BEFORE:   ∅ ◄── [3] ⇄ [4] ⇄ [5] ──► ∅
                  head

   AFTER:    ∅ ◄── [5] ⇄ [4] ⇄ [3] ──► ∅
                  head
```

### The insight: just SWAP each node's two arrows

```
   In an SLL you need prev/curr/next juggling.
   In a DLL every node already knows both neighbours, so:

        ┌──────┬─────┬──────┐            ┌──────┬─────┬──────┐
        │ prev │  4  │ next │    swap    │ next │  4  │ prev │
        │ [3]  │     │ [5]  │   ─────►   │ [5]  │     │ [3]  │
        └──────┴─────┴──────┘            └──────┴─────┴──────┘

   After swapping, the OLD next is stored in .prev,
   so "move forward" means  curr ← curr.prev .
   The last node you visit is the new head.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `curr`, `last` (the last node processed) |
| Transition | swap `curr.prev` and `curr.next`; `last ← curr`; `curr ← curr.prev` |
| Base | `curr = head` |
| Order | original front → back |
| Answer | `last` |

### Trace ([3, 4, 5])

| curr | before (prev, next) | after swap (prev, next) | last | next curr = curr.prev |
|---|---|---|---|---|
| [3] | (∅, [4]) | ([4], ∅) | [3] | [4] |
| [4] | ([3], [5]) | ([5], [3]) | [4] | [5] |
| [5] | ([4], ∅) | (∅, [4]) | [5] | ∅ → stop |

```
  new head = [5]
  Forward:  5 → 4 → 3   ✅     Backward from [3]: 3 → 4 → 5  ✓
```

### Pseudocode

```
function reverseDLL(head):
    curr ← head
    last ← null
    while curr ≠ null:
        swap(curr.prev, curr.next)
        last ← curr
        curr ← curr.prev           // the OLD next
    return last                    // null if the list was empty
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Copy values to an array, write back reversed | O(n) | O(n) |
| Stack of values | O(n) | O(n) |
| **Swap prev/next in place** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- After the swap, advance with `curr.prev`. Using `curr.next` walks backward forever (or returns to where you came from).
- Return the **last processed** node, not `curr` (which ends as `null`).
- Empty list and single node work without special cases.

---

## 5. LRU Cache (Medium)

### Problem
**LeetCode 146.** Design a cache of fixed `capacity`:
- `get(key)` → value, or `-1` if absent. Counts as a **use**.
- `put(key, value)` → insert or update. Counts as a **use**. If the cache is over capacity, evict the **least recently used** key.

Both must run in **O(1)** average time.

### Why two data structures?

```
  ┌──────────────────────┬──────────────────────────┬──────────────────────────┐
  │ Need                 │ Hash map alone           │ DLL alone                │
  ├──────────────────────┼──────────────────────────┼──────────────────────────┤
  │ find key             │ O(1) ✅                  │ O(n) ✗                   │
  │ know usage order     │ ✗                        │ O(1) ✅ (position = age) │
  │ move to "recent"     │ ✗                        │ O(1) ✅ if node is held  │
  │ evict oldest         │ ✗                        │ O(1) ✅ (tail.prev)      │
  └──────────────────────┴──────────────────────────┴──────────────────────────┘

   Together:  map: key ──► node        DLL: ordered by recency
```

### The picture

```
   map:  { 1 → ●, 3 → ● }
                │       │
                ▼       ▼
   [HEAD] ⇄ [3:3] ⇄ [1:1] ⇄ [TAIL]
     ▲                        ▲
   MOST recent           LEAST recent  (evict tail.prev)
```

### The rules

```
  get(key):
     not in map           → return -1
     in map               → remove(node); insertAfter(HEAD, node); return node.val

  put(key, value):
     in map               → node.val = value; remove(node); insertAfter(HEAD, node)
     not in map:
         if size == cap   → lru = TAIL.prev; remove(lru); delete map[lru.key]
         node = new(key, value); insertAfter(HEAD, node); map[key] = node
```

> 💡 Each node stores its **key** as well as its value. When you evict `TAIL.prev`,
> you need its key to delete it from the map.

### Trace (capacity = 2)

Expected output: `[null, null, null, 1, null, -1, null, -1, 3, 4]`

| op | action | list (HEAD … TAIL) | map keys | output |
|---|---|---|---|---|
| LRUCache(2) | empty | `H ⇄ T` | {} | null |
| put(1,1) | insert | `H ⇄ [1] ⇄ T` | {1} | null |
| put(2,2) | insert | `H ⇄ [2] ⇄ [1] ⇄ T` | {1,2} | null |
| get(1) | found → move to front | `H ⇄ [1] ⇄ [2] ⇄ T` | {1,2} | **1** |
| put(3,3) | full → evict TAIL.prev = [2]; insert 3 | `H ⇄ [3] ⇄ [1] ⇄ T` | {1,3} | null |
| get(2) | not found | `H ⇄ [3] ⇄ [1] ⇄ T` | {1,3} | **-1** |
| put(4,4) | full → evict TAIL.prev = [1]; insert 4 | `H ⇄ [4] ⇄ [3] ⇄ T` | {3,4} | null |
| get(1) | not found | `H ⇄ [4] ⇄ [3] ⇄ T` | {3,4} | **-1** |
| get(3) | found → move to front | `H ⇄ [3] ⇄ [4] ⇄ T` | {3,4} | **3** |
| get(4) | found → move to front | `H ⇄ [4] ⇄ [3] ⇄ T` | {3,4} | **4** |

```
  Output: [null, null, null, 1, null, -1, null, -1, 3, 4]  ✅
```

### Pseudocode

```
class LRUCache:
    constructor(capacity):
        cap  ← capacity
        map  ← empty hash map            // key → node
        HEAD ← new Node(),  TAIL ← new Node()
        HEAD.next ← TAIL,   TAIL.prev ← HEAD

    get(key):
        if key not in map: return -1
        node ← map[key]
        remove(node)
        insertAfter(HEAD, node)
        return node.val

    put(key, value):
        if key in map:
            node ← map[key]
            node.val ← value
            remove(node)
            insertAfter(HEAD, node)
            return
        if size(map) == cap:
            lru ← TAIL.prev
            remove(lru)
            delete map[lru.key]
        node ← new Node(key, value)
        insertAfter(HEAD, node)
        map[key] ← node
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| get | **O(1)** | — |
| put | **O(1)** | — |
| Total | — | O(capacity) |

### Alternatives

| Approach | get | put | Note |
|---|---|---|---|
| Array + timestamps, scan for oldest | O(1) | O(n) | eviction scans everything |
| Hash map + min-heap of timestamps | O(log n) | O(log n) | needs lazy deletion |
| **Hash map + DLL** | **O(1)** | **O(1)** | the standard answer ✅ |
| Built-in ordered map (e.g. "linked hash map") | O(1) | O(1) | fine in practice; interviewers usually want you to build it |

### 📌 Points to remember
- **Update = use.** `put` on an existing key must also move the node to the front.
- Store the **key inside the node** so eviction can clean the map.
- Sentinels at both ends mean `remove` and `insertAfter` never check for `null`.
- Evict **before** inserting the new key when the cache is full (or insert then evict; just don't evict the node you just added).

---

## 6. LFU Cache (Hard)

### Problem
**LeetCode 460.** Design a cache of fixed `capacity`:
- `get(key)` → value, or `-1`. Increases that key's **use count** by 1.
- `put(key, value)` → insert or update. Updating also increases the use count. A new key starts with count **1**.
- When full, evict the key with the **lowest use count**. Ties → evict the **least recently used** among them.

Both in **O(1)**.

### The idea: one LRU list per frequency

```
   keyMap:  key → node (node holds key, val, freq)
   freqMap: freq → DLL of nodes with that freq (front = most recent)
   minFreq: the smallest freq that currently has a node

     freq 1:  [HEAD] ⇄ [4] ⇄ [TAIL]
     freq 2:  [HEAD] ⇄ [3] ⇄ [1] ⇄ [TAIL]      ← tie broken by recency
     freq 3:  [HEAD] ⇄ [TAIL]                  (empty)

   minFreq = 1   →   victim = freqMap[1].TAIL.prev = [4]
```

```
   LRU = ONE recency list.
   LFU = MANY recency lists, one per frequency, plus a pointer to the lowest one.
```

### The "touch" operation (used by get and by put-update)

```
   touch(node):                              node has freq f
     1. remove(node) from freqMap[f]
     2. if freqMap[f] is now empty AND f == minFreq:
            minFreq ← f + 1
     3. node.freq ← f + 1
     4. insertAfter(freqMap[f+1].HEAD, node)   (create that list if missing)

   freq f   : [H] ⇄ [a] ⇄ [X] ⇄ [b] ⇄ [T]          freq f   : [H] ⇄ [a] ⇄ [b] ⇄ [T]
   freq f+1 : [H] ⇄ [c] ⇄ [T]            ──►       freq f+1 : [H] ⇄ [X] ⇄ [c] ⇄ [T]
```

> Why can `minFreq` only rise by exactly 1 here? The node moved from `f` to `f + 1`,
> so `f + 1` is guaranteed non-empty.

### The rules

```
  get(key):
     not in keyMap → -1
     else          → touch(node); return node.val

  put(key, value):
     if cap == 0   → do nothing
     in keyMap     → node.val = value; touch(node)
     not in keyMap:
         if size == cap:
             victim = freqMap[minFreq].TAIL.prev      // least freq, then least recent
             remove(victim); delete keyMap[victim.key]
         node = new(key, value, freq = 1)
         insertAfter(freqMap[1].HEAD, node); keyMap[key] = node
         minFreq ← 1                                   // a brand-new key always has freq 1
```

### Trace (capacity = 2)

Expected output: `[null, null, null, 1, null, -1, 3, null, -1, 3, 4]`

Lists are written front (most recent) → back (least recent).

| op | action | freq lists | minFreq | output |
|---|---|---|---|---|
| LFUCache(2) | empty | — | 0 | null |
| put(1,1) | new, f=1 | f1: [1] | 1 | null |
| put(2,2) | new, f=1 | f1: [2, 1] | 1 | null |
| get(1) | touch 1: f1 → f2; f1 still has [2] | f1: [2] · f2: [1] | 1 | **1** |
| put(3,3) | full → victim = back of f1 = **2**; insert 3 | f1: [3] · f2: [1] | 1 | null |
| get(2) | not found | f1: [3] · f2: [1] | 1 | **-1** |
| get(3) | touch 3: f1 → f2; f1 now empty and 1 == minFreq → minFreq = 2 | f2: [3, 1] | 2 | **3** |
| put(4,4) | full → victim = back of f2 = **1**; insert 4; minFreq = 1 | f1: [4] · f2: [3] | 1 | null |
| get(1) | not found | f1: [4] · f2: [3] | 1 | **-1** |
| get(3) | touch 3: f2 → f3; f2 empty but 2 ≠ minFreq → no change | f1: [4] · f3: [3] | 1 | **3** |
| get(4) | touch 4: f1 → f2; f1 empty and 1 == minFreq → minFreq = 2 | f2: [4] · f3: [3] | 2 | **4** |

```
  Output: [null, null, null, 1, null, -1, 3, null, -1, 3, 4]  ✅

  Key moment (put(4,4)): keys 3 and 1 both have freq 2.
  The tie goes to recency: 1 was used before 3, so 1 sits at the BACK of f2 → evicted.
```

### Pseudocode

```
class LFUCache:
    constructor(capacity):
        cap     ← capacity
        keyMap  ← empty map           // key  → node
        freqMap ← empty map           // freq → DLL with HEAD/TAIL sentinels
        minFreq ← 0

    listFor(f):
        if f not in freqMap: freqMap[f] ← new empty DLL with sentinels
        return freqMap[f]

    touch(node):
        f ← node.freq
        remove(node)
        if freqMap[f] is empty and f == minFreq:
            minFreq ← f + 1
        node.freq ← f + 1
        insertAfter(listFor(f + 1).HEAD, node)

    get(key):
        if key not in keyMap: return -1
        node ← keyMap[key]
        touch(node)
        return node.val

    put(key, value):
        if cap == 0: return
        if key in keyMap:
            node ← keyMap[key]
            node.val ← value
            touch(node)
            return
        if size(keyMap) == cap:
            victim ← freqMap[minFreq].TAIL.prev
            remove(victim)
            delete keyMap[victim.key]
        node ← new Node(key, value, freq = 1)
        insertAfter(listFor(1).HEAD, node)
        keyMap[key] ← node
        minFreq ← 1
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| get | **O(1)** | — |
| put | **O(1)** | — |
| Total | — | O(capacity) nodes + lists |

### Alternatives

| Approach | get / put | Note |
|---|---|---|
| Scan all keys for min (freq, time) | O(n) | simple but too slow |
| Min-heap on (freq, lastUsedTime) | O(log n) | needs lazy deletion or index tracking |
| Balanced tree / sorted set | O(log n) | clean, not O(1) |
| **keyMap + freqMap of DLLs + minFreq** | **O(1)** | the standard answer ✅ |

### 📌 Points to remember
- Two tie-breakers: **frequency first, then recency**. Each frequency list is an LRU list.
- `minFreq` changes in exactly **two** places: it becomes `f + 1` when the min list empties during `touch`, and it resets to **1** on every new insert.
- `minFreq` never needs a search, because it only ever goes up by 1 or resets to 1.
- `put` on an existing key **increments** its frequency. It's a use.
- **Capacity 0** is a real test case: `put` must do nothing.
- Empty frequency lists can be left in `freqMap` or deleted. Either way, check emptiness, not existence.

---

## 7. Master Cheat Sheet

### All 6 problems at a glance

```
┌───────────────────────┬──────────────────────────────────────────────┬──────────────┬────────────┐
│ Problem               │ Core move                                    │ Convention   │ Time       │
├───────────────────────┼──────────────────────────────────────────────┼──────────────┼────────────┤
│ Implement DLL         │ append at tail: tail.next=N, N.prev=tail     │ from array   │ O(n)       │
│ DLL Insertion         │ N.prev, N.next, R.prev, C.next (in order)    │ after p,0-b  │ O(p)       │
│ Delete Node in DLL    │ L.next=R ; R.prev=L (head/tail: skip a side) │ pos x, 1-b   │ O(x)       │
│ Reverse DLL           │ swap prev/next, advance via curr.prev        │ —            │ O(n), O(1) │
│ LRU Cache             │ map + one DLL, front = most recent           │ LC 146       │ O(1) ops   │
│ LFU Cache             │ map + DLL per freq + minFreq                 │ LC 460       │ O(1) ops   │
└───────────────────────┴──────────────────────────────────────────────┴──────────────┴────────────┘
```

### Pattern family tree

```
                            DOUBLY LINKED LIST
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          │                         │                         │
     BUILD / WALK             LOCAL REWIRES              DLL + HASH MAP
          │                         │                   (O(1) caches)
   └─ Implement DLL         ├─ Insertion                ├─ LRU Cache
                            ├─ Delete                   │    (1 recency list)
                            └─ Reverse (swap arrows)    └─ LFU Cache
                                                             (1 recency list per freq)
```

### The two helpers (memorize these)

```
   remove(X):                     insertAfter(A, N):
     X.prev.next ← X.next           N.prev ← A
     X.next.prev ← X.prev           N.next ← A.next
                                    A.next.prev ← N
                                    A.next ← N          ← always last

   "Move to front"  = remove(X); insertAfter(HEAD, X)
   "Evict oldest"   = X ← TAIL.prev; remove(X)
```

### Optimization checklist

```
  ☐ Lots of head/tail if-checks?           → sentinel HEAD and TAIL
  ☐ Need O(1) delete of a known node?       → DLL (SLL can't find the predecessor)
  ☐ Need O(1) lookup by key?                → hash map key → node
  ☐ Need "oldest" / "newest" in O(1)?       → keep order by position in the DLL
  ☐ Need "least frequent, then oldest"?     → one DLL per frequency + minFreq
  ☐ Reversing?                              → swap prev/next in place, O(1) space
```

### 🚩 Common bugs to avoid

```
  ✗ Insert: setting A.next = N before A.next.prev = N  (loses the right neighbour)
  ✗ Insert/delete: forgetting the prev arrow → forward print OK, backward print broken
  ✗ Delete: not returning the new head when deleting the first node
  ✗ Mixing 0-based (insertion) and 1-based (deletion) GFG positions
  ✗ Reverse: advancing with curr.next after the swap
  ✗ LRU: put on an existing key doesn't move it to the front
  ✗ LRU/LFU: node doesn't store its key → can't delete it from the map on eviction
  ✗ LFU: forgetting minFreq = 1 after inserting a new key
  ✗ LFU: put-update not increasing the frequency
  ✗ LFU: capacity 0 → put must be a no-op
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which arrows point AT this node, which arrows point    ║
   ║   OUT of it, and in what order can I change them         ║
   ║   without losing a neighbour?"                           ║
   ╚══════════════════════════════════════════════════════════╝
      Draw the 4 arrows, number them, then write the code.
```

---

### ✅ Progress tracker

- [ ] Implement Doubly Linked List (Easy)
- [ ] Doubly Linked List Insertion (Easy)
- [ ] Delete Node in Doubly Linked List (Easy)
- [ ] Reverse Doubly Linked List (Easy)
- [ ] LRU Cache (Medium)
- [ ] LFU Cache (Hard)
