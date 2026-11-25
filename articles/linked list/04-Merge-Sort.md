# Linked List: Merge / Sort, A Visual Guide

> **Goal:** Learn to build new lists out of old nodes: merge them, filter them, split them, sort them.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Uses the middle-finding trick from [02-Fast-and-Slow-Pointers.md](02-Fast-and-Slow-Pointers.md)
> and in-place reversal from [03-Reversal-Pattern.md](03-Reversal-Pattern.md).

---

## Table of Contents

0. [The Big Idea: Dummy + Tail](#0-the-big-idea-dummy--tail)
1. [Merge Two Sorted Lists (Easy)](#1-merge-two-sorted-lists-easy)
2. [Remove Duplicates from Sorted List (Easy)](#2-remove-duplicates-from-sorted-list-easy)
3. [Remove Duplicates from Sorted List II (Medium)](#3-remove-duplicates-from-sorted-list-ii-medium)
4. [Partition List (Medium)](#4-partition-list-medium)
5. [Sort List (Medium)](#5-sort-list-medium)
6. [Reorder List (Medium)](#6-reorder-list-medium)
7. [Merge K Sorted Lists (Hard)](#7-merge-k-sorted-lists-hard)
8. [Master Cheat Sheet](#8-master-cheat-sheet)

> **Suggested order:** Merge Two → Remove Duplicates → Remove Duplicates II → Partition
> → Sort List → Reorder List → Merge K.
> Merge Two is the building block. Sort List and Merge K are made of it, and Reorder List
> combines three tools you already have.

---

## 0. The Big Idea: Dummy + Tail

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "MERGE / SORT"                          │
├──────────────────────────────────────────────────────────────────┤
│  • Input is one or more SORTED lists → "merge", "combine"        │
│  • "Sort the list" (especially in O(n log n), O(1) space)        │
│  • "Remove duplicates" / "keep only distinct" from a sorted list │
│  • "Partition around x", "keep relative order"                   │
│  • "Reorder as L0, Ln, L1, Ln-1, ..." (weave two halves)         │
└──────────────────────────────────────────────────────────────────┘
```

### The zipper: dummy + tail

You never allocate new nodes. You **re-link** existing nodes onto a growing chain.

```
   dummy ──► (nothing yet)
     ▲
    tail          "tail" always points at the LAST node of the result

   step: pick a node X, then
        tail.next ← X        (hook X on)
        tail      ← X        (move tail forward)

   dummy ──► [1] ──► [1] ──► [2]
                              ▲
                             tail

   at the end:  answer = dummy.next     (skip the fake head)
```

> 💡 **Why a dummy?** Without it, the first node is a special case ("is the result empty?").
> With a dummy, **every** node is attached the same way. The head is just `dummy.next`.

### Splitting one list into two lists

```
  original:  [1]→[4]→[3]→[2]→[5]→[2]

  lessDummy ──► [1]→[2]→[2]            (values < 3)
  moreDummy ──► [4]→[3]→[5]            (values ≥ 3)

  re-join:   lessTail.next ← moreDummy.next
             moreTail.next ← null       ⚠ ALWAYS cut the end!
```

### Why merge sort is THE sort for linked lists

```
  ┌─────────────────────┬────────────────────────┬─────────────────────────┐
  │ Sort                │ Array                  │ Linked list             │
  ├─────────────────────┼────────────────────────┼─────────────────────────┤
  │ Quick sort          │ great (random access)  │ awkward, bad pivots     │
  │ Heap sort           │ in place               │ needs index math ✗      │
  │ Merge sort          │ needs O(n) extra array │ merge is just RE-LINKING│
  │                     │                        │ → O(1) extra per merge ✅│
  └─────────────────────┴────────────────────────┴─────────────────────────┘

  Merge sort only ever walks FORWARD. That is exactly what a list is good at.
```

### Finding the FIRST middle (for splitting)

```
  slow ← head, fast ← head
  while fast.next ≠ null and fast.next.next ≠ null:
      slow ← slow.next
      fast ← fast.next.next
  // slow = end of the LEFT half

  4 nodes:  [a]→[b]→[c]→[d]        slow stops at b   → left [a,b]   right [c,d]
  5 nodes:  [a]→[b]→[c]→[d]→[e]    slow stops at c   → left [a,b,c] right [d,e]
  2 nodes:  [a]→[b]                slow stops at a   → left [a]     right [b]  ✅
```

### ⚠️ Why the FIRST middle matters

```
  If you use the SECOND middle (while fast and fast.next) and split
  "left = head..slow, right = slow.next":

  2 nodes:  [a]→[b]   slow lands on b
            left  = [a, b]     ← same as the input!
            right = [ ]
            sort(left) → sort([a,b]) → sort([a,b]) → ... 💥 infinite recursion

  First middle always gives two NON-EMPTY halves when n ≥ 2.
```

### The 4 tools of this pattern

```
  ┌─────────────────┬───────────────────────────────────────────────┐
  │ Tool            │ Used in                                       │
  ├─────────────────┼───────────────────────────────────────────────┤
  │ dummy + tail    │ every problem here                            │
  │ merge two       │ Merge Two, Sort List, Merge K                 │
  │ first middle    │ Sort List, Reorder List                       │
  │ reverse         │ Reorder List                                  │
  └─────────────────┴───────────────────────────────────────────────┘
```

---

## 1. Merge Two Sorted Lists (Easy)

### Problem
Merge two sorted lists into one sorted list by splicing their nodes together.

### Visualize it

```
  A:  [1]→[2]→[4]
  B:  [1]→[3]→[4]

  result:  [1]→[1]→[2]→[3]→[4]→[4]
            A    B    A    B    A    B
```

### The decision at each step

```
           compare A.val and B.val
          ┌──────────┴──────────┐
     A.val ≤ B.val          A.val > B.val
          │                      │
    hook A, advance A       hook B, advance B

   When one list runs out → hook the WHOLE rest of the other list (one step!)
```

> Use `≤` (take from A on ties) to keep the merge **stable**: equal values keep their original order.

### Trace

```
  step │ A points to │ B points to │ compare │ hook │ result so far
  ─────┼─────────────┼─────────────┼─────────┼──────┼──────────────────
   1   │ 1           │ 1           │ 1 ≤ 1   │ A:1  │ 1
   2   │ 2           │ 1           │ 2 > 1   │ B:1  │ 1 1
   3   │ 2           │ 3           │ 2 ≤ 3   │ A:2  │ 1 1 2
   4   │ 4           │ 3           │ 4 > 3   │ B:3  │ 1 1 2 3
   5   │ 4           │ 4           │ 4 ≤ 4   │ A:4  │ 1 1 2 3 4
   6   │ null        │ 4           │ A done  │ rest │ 1 1 2 3 4 4  ✅
```

### Pseudocode: iterative

```
function mergeTwo(a, b):
    dummy ← new node
    tail  ← dummy
    while a ≠ null and b ≠ null:
        if a.val ≤ b.val:
            tail.next ← a;  a ← a.next
        else:
            tail.next ← b;  b ← b.next
        tail ← tail.next
    tail.next ← (a ≠ null) ? a : b      // attach the leftover in one step
    return dummy.next
```

### Pseudocode: recursive

```
function mergeTwo(a, b):
    if a == null: return b
    if b == null: return a
    if a.val ≤ b.val:
        a.next ← mergeTwo(a.next, b)
        return a
    else:
        b.next ← mergeTwo(a, b.next)
        return b
```

```
  Recursive picture: "the smaller head wins, and its next is the merge of the rest"

     mergeTwo([1,2,4], [1,3,4])
       = 1A → mergeTwo([2,4], [1,3,4])
                = 1B → mergeTwo([2,4], [3,4])
                         = 2 → mergeTwo([4], [3,4])
                                 = 3 → ...
```

### Complexity

| Version | Time | Space |
|---|---|---|
| Iterative | O(n + m) | **O(1)** ✅ |
| Recursive | O(n + m) | O(n + m) call stack |

### 📌 Points to remember
- **Dummy + tail.** Return `dummy.next`.
- Attach the leftover list **once**. Don't loop through it.
- Prefer iterative in interviews: no stack-overflow risk on long lists.
- This function is reused by Sort List and Merge K. Make it bulletproof.

---

## 2. Remove Duplicates from Sorted List (Easy)

### Problem
Sorted list. Delete duplicates so **each value appears once**.

### Visualize it

```
  [1]→[1]→[2]→[3]→[3]          sorted ⇒ duplicates sit NEXT to each other
       ✂             ✂
  [1]────→[2]→[3]────→ null
```

### The rule: compare with the next node

```
     cur
      ▼
     [1]→[1]→[2]
      │    ▲
      └────┘  cur.val == cur.next.val → SKIP the next node (cur stays!)

     cur.next ← cur.next.next

     different values → move cur forward
```

> ⚠️ After skipping, **don't move `cur`**. The new `cur.next` might be another duplicate (`[1,1,1]`).

### Trace ([1,1,2,3,3])

```
  cur │ cur.next │ equal? │ action                │ list now
  ────┼──────────┼────────┼───────────────────────┼─────────────────
   1  │ 1        │ yes    │ skip → cur.next = 2   │ 1→2→3→3
   1  │ 2        │ no     │ cur ← 2               │
   2  │ 3        │ no     │ cur ← 3               │
   3  │ 3        │ yes    │ skip → cur.next = null│ 1→2→3
   3  │ null     │ —      │ stop                  │ 1→2→3  ✅
```

### Pseudocode

```
function deleteDuplicates(head):
    cur ← head
    while cur ≠ null and cur.next ≠ null:
        if cur.val == cur.next.val:
            cur.next ← cur.next.next        // skip, stay put
        else:
            cur ← cur.next
    return head
```

### 📌 Points to remember
- No dummy needed: the head is never deleted (one copy always stays).
- Skip OR move, never both in the same step.
- Time O(n), space O(1).

---

## 3. Remove Duplicates from Sorted List II (Medium)

### Problem
Sorted list. Delete **every** node whose value appears more than once. Keep only values that were unique.

### Visualize it

```
  [1]→[2]→[3]→[3]→[4]→[4]→[5]
            ╰──✂──╯ ╰──✂──╯       remove ALL copies of 3 and 4

  [1]→[2]→[5]
```

### Why you now NEED a dummy

```
  [1]→[1]→[1]→[2]→[3]
   ╰─────✂─────╯          the HEAD itself is deleted!

  dummy →[1]→[1]→[1]→[2]→[3]
   prev                            prev = last node we are SURE to keep
                                   (dummy is always safe)
```

### The picture: prev stays outside the duplicate block

```
   prev       cur
    ▼          ▼
   [2] ──► [3]→[3]→[4]
             ╰─────╯
            duplicate block: walk cur to the LAST 3

   prev.next ← cur.next       (jump over the whole block)
   prev stays at [2]          (the next node might ALSO be a duplicate block!)
```

### Trace ([1,2,3,3,4,4,5])

```
  prev │ cur │ cur.next │ block? │ action                              │ list
  ─────┼─────┼──────────┼────────┼─────────────────────────────────────┼────────────────
  D    │ 1   │ 2        │ no     │ prev ← 1, cur ← 2                   │
  1    │ 2   │ 3        │ no     │ prev ← 2, cur ← 3                   │
  2    │ 3   │ 3        │ YES    │ cur → last 3; prev.next = 4; cur=4  │ 1→2→4→4→5
  2    │ 4   │ 4        │ YES    │ cur → last 4; prev.next = 5; cur=5  │ 1→2→5
  2    │ 5   │ null     │ no     │ prev ← 5, cur ← null                │
                                                    answer: 1→2→5  ✅
```

### Trace ([1,1,1,2,3]): head deleted

```
  prev │ cur │ block? │ action                                   │ list
  ─────┼─────┼────────┼──────────────────────────────────────────┼───────────
  D    │ 1   │ YES    │ cur → 3rd 1; D.next = 2; cur = 2         │ D→2→3
  D    │ 2   │ no     │ prev ← 2, cur ← 3                        │
  2    │ 3   │ no     │ prev ← 3, cur ← null                     │
                                          answer: dummy.next = 2→3  ✅
```

### Pseudocode

```
function deleteDuplicatesII(head):
    dummy ← new node; dummy.next ← head
    prev  ← dummy
    cur   ← head
    while cur ≠ null:
        if cur.next ≠ null and cur.val == cur.next.val:
            while cur.next ≠ null and cur.val == cur.next.val:
                cur ← cur.next               // walk to the LAST copy
            prev.next ← cur.next             // drop the whole block
        else:
            prev ← prev.next                 // cur is unique → keep it
        cur ← cur.next
    return dummy.next
```

### 📌 Points to remember
- **Head can be deleted → use a dummy.**
- `prev` only moves forward when the node is proven unique.
- Two adjacent duplicate blocks (`3,3,4,4`) work because `prev` doesn't move after a deletion.
- Time O(n), space O(1).

---

## 4. Partition List (Medium)

### Problem
Rearrange so all nodes `< x` come before nodes `≥ x`. **Keep the original relative order** in each group.

### Visualize it (x = 3)

```
  [1]→[4]→[3]→[2]→[5]→[2]
   <   ≥   ≥   <   ≥   <

  less : [1]→[2]→[2]
  more : [4]→[3]→[5]

  answer: [1]→[2]→[2]→[4]→[3]→[5]
```

### Two zippers, then glue

```
  lessDummy ──► ...  ◄ lessTail
  moreDummy ──► ...  ◄ moreTail

  for each node:  value < x ? hook on "less" : hook on "more"

  glue:   lessTail.next ← moreDummy.next
  cut:    moreTail.next ← null        ⚠
```

### Trace

```
  node │ < 3? │ less list   │ more list
  ─────┼──────┼─────────────┼────────────
   1   │ yes  │ 1           │
   4   │ no   │ 1           │ 4
   3   │ no   │ 1           │ 4 3
   2   │ yes  │ 1 2         │ 4 3
   5   │ no   │ 1 2         │ 4 3 5
   2   │ yes  │ 1 2 2       │ 4 3 5

  glue: 1→2→2→4→3→5,  then 5.next ← null   ✅
```

### ⚠️ Why the cut matters: the hidden cycle

```
  Node [5] still has its OLD next pointer → the last [2]

  without the cut:
     1 → 2 → 2 → 4 → 3 → 5
             ▲           │
             └───────────┘   5 → 2 → 4 → 3 → 5 → ...  🔁 infinite loop!
```

### Pseudocode

```
function partition(head, x):
    lessDummy ← new node; lessTail ← lessDummy
    moreDummy ← new node; moreTail ← moreDummy
    cur ← head
    while cur ≠ null:
        if cur.val < x:
            lessTail.next ← cur;  lessTail ← cur
        else:
            moreTail.next ← cur;  moreTail ← cur
        cur ← cur.next
    moreTail.next ← null                 // cut the old link
    lessTail.next ← moreDummy.next       // glue
    return lessDummy.next
```

### 📌 Points to remember
- Two dummies = no special cases, even when one group is empty.
- **Always null-terminate the last tail.** This is the #1 bug.
- Stable: nodes are hooked in the order they are met.
- Time O(n), space O(1).

---

## 5. Sort List (Medium)

### Problem
Sort a linked list in **O(n log n)** time. Follow-up: O(1) extra space.

### The plan: merge sort

```
   sort(list):
     1. if 0 or 1 node → already sorted
     2. split at the FIRST middle → left, right
     3. sort(left), sort(right)
     4. mergeTwo(left, right)          ← from problem 1
```

### Recursion tree ([4,2,1,3])

```
                       [4,2,1,3]
                      /         \          split (first middle = 2)
                 [4,2]           [1,3]
                 /   \           /   \     split
               [4]   [2]       [1]   [3]   base cases
                 \   /           \   /
                 [2,4]           [1,3]      merge
                      \         /
                       [1,2,3,4]  ✅        merge
```

### Splitting step by step ([4,2,1,3])

```
  slow=4, fast=4     fast.next=2, fast.next.next=1  → move
  slow=2, fast=1     fast.next=3, fast.next.next=null → stop

  mid = slow = [2]
  right ← mid.next   = [1]→[3]
  mid.next ← null      (cut!)  → left = [4]→[2]
```

### Trace 2 ([-1,5,3,4,0])

```
                         [-1,5,3,4,0]
                        /            \           first middle = 3
               [-1,5,3]                [4,0]
               /      \                /   \
          [-1,5]      [3]            [4]   [0]
          /    \        │              \   /
       [-1]    [5]      │              [0,4]
          \    /        │                │
          [-1,5]        │                │
               \       /                 │
              [-1,3,5]                   │
                     \                  /
                      [-1,0,3,4,5]  ✅
```

### Pseudocode (top-down)

```
function sortList(head):
    if head == null or head.next == null: return head

    // first middle
    slow ← head, fast ← head
    while fast.next ≠ null and fast.next.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next

    right     ← slow.next
    slow.next ← null                     // cut into two lists
    left      ← head

    return mergeTwo(sortList(left), sortList(right))
```

### 🚀 Bottom-up merge sort: O(1) extra space

```
  No recursion. Merge runs of size 1, then 2, then 4, ...

  size=1:  [4][2][1][3]   → [2,4][1,3]
  size=2:  [2,4][1,3]     → [1,2,3,4]
  size=4:  one run left   → done

  Each pass: walk the list, cut off two runs of length `size`,
  merge them, hook the result onto a tail. log n passes × O(n) each.
```

```
function sortListBottomUp(head):
    n ← length(head)
    dummy ← new node; dummy.next ← head
    size ← 1
    while size < n:
        tail ← dummy
        cur  ← dummy.next
        while cur ≠ null:
            left  ← cur
            right ← cut(left, size)          // cut after `size` nodes, return the rest
            cur   ← cut(right, size)
            tail.next ← mergeTwo(left, right)
            while tail.next ≠ null: tail ← tail.next
        size ← size × 2
    return dummy.next
```

### Complexity

| Version | Time | Space |
|---|---|---|
| Copy to array + sort | O(n log n) | O(n) |
| Top-down merge sort | O(n log n) | O(log n) recursion |
| **Bottom-up merge sort** | **O(n log n)** | **O(1)** ✅ |

### 📌 Points to remember
- **First middle**, or 2-node lists recurse forever.
- **Cut** `slow.next ← null` before recursing. Otherwise "left" still contains everything.
- Top-down is easiest to write. Bottom-up answers the O(1)-space follow-up.

---

## 6. Reorder List (Medium)

### Problem
`L0 → L1 → … → Ln` becomes `L0 → Ln → L1 → Ln-1 → L2 → …`, in place.

### Visualize it

```
  [1]→[2]→[3]→[4]→[5]

  take from the front, then the back, then the front, ...

  [1]→[5]→[2]→[4]→[3]
   F   B   F   B   F
```

### The plan: three tools you already have

```
  1. FIRST MIDDLE      (02-Fast-and-Slow-Pointers.md)
       [1]→[2]→[3] │ [4]→[5]

  2. REVERSE 2nd half  (03-Reversal-Pattern.md)
       [1]→[2]→[3]     [5]→[4]

  3. WEAVE (alternate merge, not by value!)
       1 ─┐   2 ─┐   3
          ▼      ▼
          5 ─┘   4 ─┘
       → [1]→[5]→[2]→[4]→[3]
```

### Trace ([1,2,3,4])

```
  first middle:   slow=1,fast=1 → slow=2,fast=3 → stop (fast.next.next = null)
  split:          first = [1]→[2]     second = [3]→[4]
  reverse:        second = [4]→[3]
  weave:
     p=1, q=4:  1.next=4, 4.next=2     → 1→4→2
     p=2, q=3:  2.next=3, 3.next=null  → 1→4→2→3     ✅
```

### Trace ([1,2,3,4,5])

```
  first middle:   slow=1 → slow=2 (fast=3) → slow=3 (fast=5) → stop
  split:          first = [1]→[2]→[3]   second = [4]→[5]
  reverse:        second = [5]→[4]
  weave:
     p=1, q=5:  1→5→2
     p=2, q=4:  1→5→2→4→3
     q = null → stop; 3 is already the tail       → 1→5→2→4→3  ✅
```

### Pseudocode

```
function reorderList(head):
    if head == null or head.next == null: return

    // 1. first middle
    slow ← head, fast ← head
    while fast.next ≠ null and fast.next.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next

    // 2. cut and reverse the second half
    second    ← reverse(slow.next)
    slow.next ← null

    // 3. weave
    first ← head
    while second ≠ null:
        n1 ← first.next
        n2 ← second.next
        first.next  ← second
        second.next ← n1
        first  ← n1
        second ← n2
```

### 📌 Points to remember
- The first half is always **equal or one longer**, so the loop runs while `second ≠ null`.
- Save **both** `next` pointers before relinking.
- Cut `slow.next ← null`, or the weave creates a cycle.
- Time O(n), space O(1). (A stack or array version is O(n) space.)

---

## 7. Merge K Sorted Lists (Hard)

### Problem
Merge `k` sorted lists into one sorted list.

### Two good approaches

```
  ┌──────────────────────────────┬───────────────────┬─────────────────┐
  │ Approach                     │ Time              │ Extra space     │
  ├──────────────────────────────┼───────────────────┼─────────────────┤
  │ Merge one by one into result │ O(k · N)  ✗ slow  │ O(1)            │
  │ Min-heap of k heads          │ O(N log k)        │ O(k)            │
  │ Divide & conquer pairs       │ O(N log k)        │ O(1) (iterative)│
  └──────────────────────────────┴───────────────────┴─────────────────┘
                                      N = total number of nodes
```

### Approach A: min-heap (brief)

```
  push the head of every list
  repeat: pop the smallest → hook on tail → push that node's next
```

> Full heap traces and pictures live in [../heap/03-Merge-K-Sorted.md](../heap/03-Merge-K-Sorted.md).
> Here we teach the approach that needs **only** `mergeTwo`.

### Why "one by one" is slow

```
  result = L1
  result = merge(result, L2)     result grows: n, 2n, 3n, ...
  result = merge(result, L3)     total work ≈ n + 2n + ... + kn ≈ k²n/2
  ...

  The early lists get re-walked k times. ✗
```

### Approach B: divide & conquer (tournament)

```
   Round 1:   L1   L2   L3   L4   L5   L6   L7   L8
               \   /     \   /     \   /     \   /
   Round 2:    M12       M34       M56       M78
                  \     /             \     /
   Round 3:        M1234               M5678
                        \             /
   Round 4:              M12345678

   Every node is touched once per round, and there are log₂ k rounds.
   → O(N log k)
```

### Trace ([[1,4,5],[1,3,4],[2,6]])

```
  Round 1 (pair up):   A=[1,4,5]  B=[1,3,4]  │  C=[2,6] has no partner → carried

     merge A + B:
       1A vs 1B → 1A │ 4 vs 1B → 1B │ 4 vs 3 → 3 │ 4A vs 4B → 4A │ 5 vs 4B → 4B │ rest 5
       → [1,1,3,4,4,5]

  Round 2:   [1,1,3,4,4,5] + [2,6]
       1,1 (from left) │ 2 < 3 → 2 │ 3,4,4,5 < 6 → take them │ rest 6
       → [1,1,2,3,4,4,5,6]  ✅
```

### Pseudocode (iterative, O(1) extra space)

```
function mergeKLists(lists):
    if lists is empty: return null
    k ← length(lists)
    gap ← 1
    while gap < k:
        for i from 0 to k-1 step 2·gap:
            if i + gap < k:
                lists[i] ← mergeTwo(lists[i], lists[i + gap])
        gap ← gap × 2
    return lists[0]
```

```
  gap=1:  merge (0,1) (2,3) (4,5) ...   results land in 0, 2, 4, ...
  gap=2:  merge (0,2) (4,6) ...         results land in 0, 4, ...
  gap=4:  merge (0,4) ...
  answer in lists[0]
```

### 📌 Points to remember
- Empty input or empty inner lists: `mergeTwo` handles `null` naturally.
- Divide & conquer and heap are both O(N log k). D&C reuses `mergeTwo`, no heap needed.
- One-by-one merging is the trap: O(k·N).

---

## 8. Master Cheat Sheet

### All 7 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────────────┬────────────┬───────────┐
│ Problem                  │ Core idea                                    │ Time       │ Space     │
├──────────────────────────┼──────────────────────────────────────────────┼────────────┼───────────┤
│ Merge Two Sorted Lists   │ dummy + tail, take smaller head, attach rest │ O(n+m)     │ O(1)      │
│ Remove Duplicates        │ equal next → skip it, else move              │ O(n)       │ O(1)      │
│ Remove Duplicates II     │ dummy + prev, drop whole duplicate blocks    │ O(n)       │ O(1)      │
│ Partition List           │ two zippers, glue, null-terminate            │ O(n)       │ O(1)      │
│ Sort List                │ first middle + merge sort                    │ O(n log n) │ O(log n)/1│
│ Reorder List             │ first middle + reverse half + weave          │ O(n)       │ O(1)      │
│ Merge K Sorted Lists     │ pairwise tournament (or heap)                │ O(N log k) │ O(1)/O(k) │
└──────────────────────────┴──────────────────────────────────────────────┴────────────┴───────────┘
```

### Pattern family tree

```
                            MERGE / SORT
                                 │
        ┌────────────────┬───────┴────────┬───────────────────┐
        │                │                │                   │
    BUILD BY ZIP     FILTER IN PLACE   SPLIT + GLUE       DIVIDE & CONQUER
   (dummy + tail)   (skip next node)  (two dummies)      (middle + merge)
        │                │                │                   │
   └ Merge Two      ├ Remove Dups     └ Partition        ├ Sort List
                    └ Remove Dups II                     ├ Merge K
                                                         └ Reorder List
                                                           (+ reverse + weave)
```

### Which middle?

```
  ┌───────────────────────────────────────┬─────────────────────────────┐
  │ Loop condition                        │ slow stops at               │
  ├───────────────────────────────────────┼─────────────────────────────┤
  │ fast.next ≠ null and fast.next.next   │ FIRST middle → use to SPLIT │
  │ fast ≠ null and fast.next ≠ null      │ SECOND middle → "return the │
  │                                       │ middle node" problems       │
  └───────────────────────────────────────┴─────────────────────────────┘
```

### Checklist

```
  ☐ Can the head change or be deleted?        → dummy node
  ☐ Building a new order from old nodes?      → dummy + tail zipper
  ☐ Splitting into groups?                    → one dummy per group, glue, cut
  ☐ Need to sort?                             → merge sort (first middle + mergeTwo)
  ☐ Need O(1) space sort?                     → bottom-up merge sort
  ☐ Many sorted lists?                        → pairwise D&C or heap, never one by one
  ☐ Front/back alternation?                   → middle + reverse + weave
```

### 🚩 Common bugs to avoid

```
  ✗ Returning dummy instead of dummy.next
  ✗ Forgetting to attach the leftover list after the merge loop
  ✗ Remove Dups: moving cur after a skip (misses triple duplicates)
  ✗ Remove Dups II: no dummy → can't delete the head
  ✗ Partition: not setting moreTail.next ← null → cycle
  ✗ Sort List: second middle → infinite recursion on 2 nodes
  ✗ Sort List / Reorder: forgetting slow.next ← null before recursing / reversing
  ✗ Reorder: losing a pointer because next wasn't saved first
  ✗ Merge K: merging one by one → O(k·N)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which node do I hook on NEXT, and does every chain I   ║
   ║   built end in null?"                                    ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Merge Two Sorted Lists (Easy)
- [ ] Remove Duplicates from Sorted List (Easy)
- [ ] Remove Duplicates from Sorted List II (Medium)
- [ ] Partition List (Medium)
- [ ] Sort List (Medium)
- [ ] Reorder List (Medium)
- [ ] Merge K Sorted Lists (Hard)
