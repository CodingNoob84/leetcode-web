# Linked List: Reversal Pattern, A Visual Guide

> **Goal:** Learn to *see* pointer reversal, run the 3-pointer dance by hand, and reuse it for
> sub-ranges, pairs, groups, rotations and "compare the two halves" problems.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Flipping Arrows](#0-the-big-idea-flipping-arrows)
1. [Reverse Linked List (Easy)](#1-reverse-linked-list-easy)
2. [Reverse Linked List II (Medium)](#2-reverse-linked-list-ii-medium)
3. [Swap Nodes in Pairs (Medium)](#3-swap-nodes-in-pairs-medium)
4. [Reverse Nodes in k-Group (Hard)](#4-reverse-nodes-in-k-group-hard)
5. [Rotate List (Medium)](#5-rotate-list-medium)
6. [Palindrome Linked List (Easy)](#6-palindrome-linked-list-easy)
7. [Maximum Twin Sum of a Linked List (Medium)](#7-maximum-twin-sum-of-a-linked-list-medium)
8. [Master Cheat Sheet](#8-master-cheat-sheet)

> **Suggested order:** Reverse List → Reverse List II → Swap Pairs → k-Group → Rotate
> → Palindrome → Twin Sum.
> The first four grow one idea: reverse **everything**, then a **range**, then **blocks of 2**, then **blocks of k**.
> Rotate is the odd one out: it rewires instead of reversing.
> The last two combine **find the middle** with **reverse the second half**.

---

## 0. The Big Idea: Flipping Arrows

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "REVERSAL"                              │
├──────────────────────────────────────────────────────────────────┤
│  • "Reverse" the list, a part of it, or every k nodes            │
│  • "Swap" adjacent nodes (pairs = groups of 2)                   │
│  • Compare the list with ITSELF backwards (palindrome)           │
│  • Pair the i-th node with the i-th node FROM THE END (twins)    │
│  • "Rotate" / move the tail to the front                         │
│  • Must be O(1) extra space → you can't copy into an array       │
└──────────────────────────────────────────────────────────────────┘
```

### What reversal really is

You never move nodes. You only **turn every arrow around**.

```
   before:   [1] ──► [2] ──► [3] ──► null

   after:    null ◄── [1] ◄── [2] ◄── [3]
                                       ▲
                                    new head
```

### The danger: losing the rest of the list

```
   prev     curr
   null     [1] ──► [2] ──► [3]

   If you flip first:   curr.next = prev
                        null ◄── [1]     [2] ──► [3]
                                          ▲
                              nobody points here anymore → LOST 💀

   So SAVE the next node BEFORE you flip.
```

### The iterative template: the 3-pointer dance

```
 ┌──────────────────────────────────────────────────────────┐
 │  prev ← null                                             │
 │  curr ← head                                             │
 │  while curr ≠ null:                                      │
 │      ① next      ← curr.next     // save the rest        │
 │      ② curr.next ← prev          // flip the arrow       │
 │      ③ prev      ← curr          // step prev forward    │
 │      ④ curr      ← next          // step curr forward    │
 │  return prev                     // prev is the new head │
 └──────────────────────────────────────────────────────────┘

   Memory hook:  SAVE → FLIP → ADVANCE (prev first, then curr)
```

### The recursive template: "trust the rest, then fix one arrow"

```
 reverse(head):
     if head == null or head.next == null: return head
     newHead ← reverse(head.next)      // rest is reversed already
     head.next.next ← head             // my neighbour points back at me
     head.next ← null                  // I point at nothing (for now)
     return newHead

   Picture for head = [2] when [3]→[4]→[5] is already reversed:

     [2] ──► [3] ◄── [4] ◄── [5]        head.next is still [3]!
      ▲       │
      └───────┘   head.next.next = head  → [3] points back to [2]
     [2] ──► null                        → then cut [2]'s old arrow
```

> 💡 Recursion uses O(n) call-stack space. The iterative version is O(1). Interviewers
> usually want the iterative one, then ask for the recursive one as a follow-up.

### Reversing a SUB-RANGE: the two ends you must reconnect

```
   dummy ─► [1] ─► [2] ─► [3] ─► [4] ─► [5] ─► null
             ▲      └───── reverse ────┘    ▲
          before          this part        after

   After reversing the middle part, two arrows are wrong:

   dummy ─► [1]    [4] ─► [3] ─► [2]    [5]
             │      ▲               │     ▲
             └──────┘               └─────┘
          before.next = new first    old first (now LAST).next = after
```

> The old **first** node of the range becomes the range's **tail**. Keep a pointer to it.

### The dummy head trick

```
   dummy ─► [1] ─► [2] ─► ...

   • Gives every real node a "previous" node, even the head.
   • If the head itself changes (it often does when reversing), return dummy.next.
   • Removes the special case "what if the range starts at node 1?"
```

### The "middle + reverse second half" combo

Used by Palindrome, Twin Sum (and Reorder List in the Merge / Sort guide).

```
   Step 1: find the middle with slow/fast pointers   (see 02-Fast-and-Slow-Pointers.md)
   Step 2: reverse from the middle to the end
   Step 3: walk one pointer from the head and one from the reversed half, together

   [1] ─► [2] ─► [3] ─► [2] ─► [1]
                  ▲
                 mid
   reverse →   [1] ─► [2] ─► [3]  ◄── compare against  [1] ─► [2] ─► [3]
```

[02-Fast-and-Slow-Pointers.md](02-Fast-and-Slow-Pointers.md) covers finding the middle in detail.

---

## 1. Reverse Linked List (Easy)

### Problem
Reverse a singly linked list and return the new head.

### Visualize it

```
   input:    [1] ─► [2] ─► [3] ─► [4] ─► [5] ─► null
   output:   [5] ─► [4] ─► [3] ─► [2] ─► [1] ─► null
```

### The steps

| Step | Answer |
|------|--------|
| State | `prev` = head of the already-reversed part, `curr` = first node not yet reversed |
| Move | save next, flip `curr.next` to `prev`, advance both |
| Start | `prev = null`, `curr = head` |
| Stop | `curr == null` |
| Answer | `prev` |

### Iterative trace: every iteration ([1,2,3,4,5])

```
 START
   prev   curr
   null   [1] ─► [2] ─► [3] ─► [4] ─► [5] ─► null

 ITERATION 1   ① next=[2]  ② [1].next=null  ③ prev=[1]  ④ curr=[2]
   null ◄── [1]     [2] ─► [3] ─► [4] ─► [5] ─► null
            prev    curr

 ITERATION 2   ① next=[3]  ② [2].next=[1]   ③ prev=[2]  ④ curr=[3]
   null ◄── [1] ◄── [2]     [3] ─► [4] ─► [5] ─► null
                    prev    curr

 ITERATION 3   ① next=[4]  ② [3].next=[2]   ③ prev=[3]  ④ curr=[4]
   null ◄── [1] ◄── [2] ◄── [3]     [4] ─► [5] ─► null
                            prev    curr

 ITERATION 4   ① next=[5]  ② [4].next=[3]   ③ prev=[4]  ④ curr=[5]
   null ◄── [1] ◄── [2] ◄── [3] ◄── [4]     [5] ─► null
                                    prev    curr

 ITERATION 5   ① next=null ② [5].next=[4]   ③ prev=[5]  ④ curr=null
   null ◄── [1] ◄── [2] ◄── [3] ◄── [4] ◄── [5]
                                            prev     curr = null → STOP

 return prev = [5]   →   [5,4,3,2,1] ✅
```

### Recursive trace

```
 CALLS GOING DOWN                         RETURNS COMING UP
 ─────────────────                        ──────────────────────────────────────────
 reverse([1])                             [1]: [2].next=[1], [1].next=null  → 5,4,3,2,1
   reverse([2])                           [2]: [3].next=[2], [2].next=null  → 5,4,3,2
     reverse([3])                         [3]: [4].next=[3], [3].next=null  → 5,4,3
       reverse([4])                       [4]: [5].next=[4], [4].next=null  → 5,4
         reverse([5])  → base case,       returns [5]
                          [5].next = null

 newHead stays [5] all the way up ✅
```

### Pseudocode

```
function reverseList(head):            // iterative, O(1) space
    prev ← null
    curr ← head
    while curr ≠ null:
        next      ← curr.next
        curr.next ← prev
        prev      ← curr
        curr      ← next
    return prev
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy values into array, rebuild | O(n) | O(n) |
| Recursive | O(n) | O(n) call stack |
| **Iterative 3-pointer** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Save next before you flip.** Forgetting this loses the rest of the list.
- Return `prev`, not `curr` (`curr` is null at the end).
- Empty list and single node work without special cases.
- This 4-line loop is the building block for **every** other problem in this guide.

---

## 2. Reverse Linked List II (Medium)

### Problem
Reverse only the nodes from position `left` to position `right` (1-indexed), in one pass.

### Visualize it

```
   left = 2, right = 4

   [1] ─► [2] ─► [3] ─► [4] ─► [5]
          └───── reverse ────┘
   [1] ─► [4] ─► [3] ─► [2] ─► [5]   ✅
```

### Method: "head insertion" (one pass)

Freeze two pointers:
- `before` = the node just before position `left` (never moves)
- `curr` = the first node of the range (it slides toward the end of the range)

Then, `right − left` times, **pull the node after `curr` and insert it right after `before`**.

```
   before   curr   move
     │       │      │
     ▼       ▼      ▼
    [1] ─► [2] ─► [3] ─► [4] ─► [5]

   ① move       ← curr.next          // the node to pull out
   ② curr.next  ← move.next          // close the gap behind it
   ③ move.next  ← before.next        // move points at the current front of the range
   ④ before.next← move               // before points at move: move is now in front
```

### The steps

| Step | Answer |
|------|--------|
| State | `before` (fixed), `curr` (old first node, drifts right) |
| Move | pull `curr.next` to the front of the range |
| Start | `dummy → head`; walk `before` from dummy `left − 1` steps; `curr = before.next` |
| Repeat | `right − left` times |
| Answer | `dummy.next` |

### Trace (left = 2, right = 4)

```
 SETUP
   dummy ─► [1] ─► [2] ─► [3] ─► [4] ─► [5]
             ▲      ▲
          before   curr

 PULL 1   move=[3]
   ② [2].next = [4]     ③ [3].next = [2]     ④ [1].next = [3]
   dummy ─► [1] ─► [3] ─► [2] ─► [4] ─► [5]
             ▲             ▲
          before          curr     (curr is still [2], now one step further right)

 PULL 2   move=[4]
   ② [2].next = [5]     ③ [4].next = [3]     ④ [1].next = [4]
   dummy ─► [1] ─► [4] ─► [3] ─► [2] ─► [5]
             ▲                    ▲
          before                 curr

 2 pulls done (right − left = 2) → return dummy.next → [1,4,3,2,5] ✅
```

### Alternative: cut, reverse, reconnect

```
   1. walk to `before` and to the node at `right`
   2. remember `after` = node after `right`
   3. cut the range out, reverse it with the Problem-1 loop
   4. before.next = new first,   old first.next = after
```

Same O(n), slightly more bookkeeping. Head insertion is the cleaner one-pass version.

### Pseudocode

```
function reverseBetween(head, left, right):
    dummy ← new node, dummy.next ← head
    before ← dummy
    repeat (left − 1) times: before ← before.next
    curr ← before.next
    repeat (right − left) times:
        move        ← curr.next
        curr.next   ← move.next
        move.next   ← before.next
        before.next ← move
    return dummy.next
```

### 📌 Points to remember
- Use a **dummy** node. When `left = 1`, the head changes and `before` must exist.
- `before` and `curr` stay the **same nodes** the whole time; only the nodes between them change.
- Number of pulls is `right − left`, not `right − left + 1`.
- Time O(n), space O(1).

---

## 3. Swap Nodes in Pairs (Medium)

### Problem
Swap every two adjacent nodes. Change links, not values.

### Visualize it

```
   [1] ─► [2] ─► [3] ─► [4]        →   [2] ─► [1] ─► [4] ─► [3]
   [1] ─► [2] ─► [3]               →   [2] ─► [1] ─► [3]       (odd: last one stays)
```

### One swap = three arrows

```
    prev       a       b
     │         │       │
     ▼         ▼       ▼
   [ p ] ─► [ a ] ─► [ b ] ─► [rest]

   ① prev.next ← b            [ p ] ─► [ b ]
   ② a.next    ← b.next       [ a ] ─► [rest]
   ③ b.next    ← a            [ b ] ─► [ a ]

   result:  [ p ] ─► [ b ] ─► [ a ] ─► [rest]
   then:    prev ← a           (a is now the node before the next pair)
```

> This is "Reverse Nodes in k-Group" with **k = 2**, written out by hand.

### Trace ([1,2,3,4])

```
 START
   dummy ─► [1] ─► [2] ─► [3] ─► [4] ─► null
   prev

 PAIR 1   a=[1], b=[2]
   ① dummy.next=[2]   ② [1].next=[3]   ③ [2].next=[1]
   dummy ─► [2] ─► [1] ─► [3] ─► [4] ─► null
                   prev

 PAIR 2   a=[3], b=[4]
   ① [1].next=[4]     ② [3].next=null  ③ [4].next=[3]
   dummy ─► [2] ─► [1] ─► [4] ─► [3] ─► null
                                 prev

 prev.next = null → no pair left → STOP → [2,1,4,3] ✅

 Odd [1,2,3]: after pair 1 → dummy ─► [2] ─► [1] ─► [3];  prev=[1], prev.next.next = null → STOP → [2,1,3] ✅
```

### Pseudocode

```
function swapPairs(head):
    dummy ← new node, dummy.next ← head
    prev ← dummy
    while prev.next ≠ null and prev.next.next ≠ null:
        a ← prev.next
        b ← a.next
        prev.next ← b
        a.next    ← b.next
        b.next    ← a
        prev      ← a
    return dummy.next
```

### 📌 Points to remember
- Loop condition needs **two** nodes ahead: `prev.next` and `prev.next.next`.
- Order of the 3 assignments matters: do `a.next ← b.next` **before** `b.next ← a`.
- Recursive version: `swap(head)`: `b = head.next; head.next = swap(b.next); b.next = head; return b`. O(n) stack.
- Time O(n), space O(1).

---

## 4. Reverse Nodes in k-Group (Hard)

### Problem
Reverse the nodes `k` at a time. If fewer than `k` nodes remain at the end, leave them as they are.

### Visualize it

```
   k = 2:  [1 2] [3 4] [5]      →   [2 1] [4 3] [5]       = [2,1,4,3,5]
   k = 3:  [1 2 3] [4 5]        →   [3 2 1] [4 5]         = [3,2,1,4,5]
                    └ only 2 nodes < k → untouched
```

### The plan for each group

```
   groupPrev                          groupNext
      │      ┌──── k nodes ────┐         │
      ▼      ▼                 ▼         ▼
    [ p ] ─► [a] ─► [b] ─► [c] ─►       [n] ...
                           kth

   ① LOOK AHEAD: walk k steps from groupPrev. Reached null? → STOP, leave the rest.
   ② groupNext ← kth.next
   ③ REVERSE the group with the 3-pointer loop, but start prev = groupNext
      (so the group's old first node ends up pointing at groupNext automatically)
   ④ RECONNECT: oldFirst ← groupPrev.next
                 groupPrev.next ← kth           (kth is the new first node)
                 groupPrev ← oldFirst           (old first is the new last → next groupPrev)
```

> 💡 Starting the reversal with `prev = groupNext` instead of `null` is the trick that removes one reconnection step.

### Trace (k = 2, [1,2,3,4,5])

```
 START
   dummy ─► [1] ─► [2] ─► [3] ─► [4] ─► [5] ─► null
   groupPrev

 GROUP 1
   ① look ahead 2 from dummy → [1], [2]  → kth = [2]  ✓ enough nodes
   ② groupNext = [3]
   ③ reverse with prev=[3], curr=[1]:
        [1].next=[3], prev=[1], curr=[2]
        [2].next=[1], prev=[2], curr=[3] = groupNext → stop
   ④ oldFirst=[1];  dummy.next=[2];  groupPrev=[1]
   dummy ─► [2] ─► [1] ─► [3] ─► [4] ─► [5] ─► null
                   groupPrev

 GROUP 2
   ① look ahead 2 from [1] → [3], [4]  → kth = [4]  ✓
   ② groupNext = [5]
   ③ reverse with prev=[5]:  [3].next=[5],  [4].next=[3]
   ④ oldFirst=[3];  [1].next=[4];  groupPrev=[3]
   dummy ─► [2] ─► [1] ─► [4] ─► [3] ─► [5] ─► null
                                 groupPrev

 GROUP 3
   ① look ahead 2 from [3] → [5], null  → not enough → STOP

 answer: [2,1,4,3,5] ✅
```

### Trace (k = 3, [1,2,3,4,5])

```
 GROUP 1: look ahead 3 → [1],[2],[3] ✓  kth=[3], groupNext=[4]
          reverse with prev=[4]:  [1].next=[4], [2].next=[1], [3].next=[2]
          dummy.next=[3], groupPrev=[1]
          dummy ─► [3] ─► [2] ─► [1] ─► [4] ─► [5]

 GROUP 2: look ahead 3 from [1] → [4],[5],null → not enough → STOP

 answer: [3,2,1,4,5] ✅
```

### Pseudocode

```
function reverseKGroup(head, k):
    dummy ← new node, dummy.next ← head
    groupPrev ← dummy
    loop:
        kth ← groupPrev
        repeat k times:
            kth ← kth.next
            if kth == null: return dummy.next        // fewer than k left
        groupNext ← kth.next

        prev ← groupNext
        curr ← groupPrev.next
        while curr ≠ groupNext:
            next      ← curr.next
            curr.next ← prev
            prev      ← curr
            curr      ← next

        oldFirst       ← groupPrev.next
        groupPrev.next ← kth
        groupPrev      ← oldFirst
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy to array, reverse chunks | O(n) | O(n) |
| Recursive per group | O(n) | O(n/k) stack |
| **Iterative with look-ahead** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Look ahead first.** Never start reversing a group you can't finish.
- The old first node becomes the group's **last** node and the next `groupPrev`.
- Starting the inner loop with `prev = groupNext` stitches the group's tail for free.
- Each node is visited at most twice (look-ahead + reverse) → O(n).
- k = 2 is Swap Nodes in Pairs. k = n is Reverse Linked List.

---

## 5. Rotate List (Medium)

### Problem
Rotate the list to the **right** by `k` places.

### Visualize it

```
   [1,2,3,4,5], k = 2

   rotate 1:  [5,1,2,3,4]
   rotate 2:  [4,5,1,2,3]   ✅

   The last k nodes move to the front, in order.
```

> No reversal is needed here. It belongs in this family because, like reversal,
> it is solved by **rewiring a few arrows** instead of moving values.

### The ring trick

```
   ① Count length n, and remember the tail.
   ② k ← k mod n              (rotating by n changes nothing)
   ③ If k == 0 → return head.
   ④ tail.next ← head         → the list becomes a RING

          ┌─────────────────────────────┐
          ▼                             │
         [1] ─► [2] ─► [3] ─► [4] ─► [5]

   ⑤ Walk n − k − 1 steps from head → that node is the NEW TAIL
   ⑥ newHead ← newTail.next ;  newTail.next ← null   → cut the ring
```

### The steps

| Step | Answer |
|------|--------|
| Count | length `n`, `tail` |
| Reduce | `k = k mod n` |
| Ring | `tail.next = head` |
| Cut | new tail is node at index `n − k − 1`; new head is the one after it |
| Answer | `newHead` |

### Trace ([1,2,3,4,5], k = 2)

```
   ① n = 5, tail = [5]
   ② k = 2 mod 5 = 2
   ④ ring: [5].next = [1]
   ⑤ walk n − k − 1 = 2 steps from [1]:  [1] → [2] → [3]   → newTail = [3]
   ⑥ newHead = [4];  [3].next = null

   [4] ─► [5] ─► [1] ─► [2] ─► [3] ─► null   ✅
```

### Trace ([0,1,2], k = 4)

```
   ① n = 3, tail = [2]
   ② k = 4 mod 3 = 1
   ④ ring: [2].next = [0]
   ⑤ walk n − k − 1 = 1 step from [0]:  [0] → [1]   → newTail = [1]
   ⑥ newHead = [2];  [1].next = null

   [2] ─► [0] ─► [1] ─► null   ✅
```

### Pseudocode

```
function rotateRight(head, k):
    if head == null or head.next == null: return head
    n ← 1, tail ← head
    while tail.next ≠ null:
        tail ← tail.next
        n ← n + 1
    k ← k mod n
    if k == 0: return head
    tail.next ← head                    // make a ring
    newTail ← head
    repeat (n − k − 1) times: newTail ← newTail.next
    newHead ← newTail.next
    newTail.next ← null                 // cut
    return newHead
```

### 📌 Points to remember
- **Always `k mod n`.** `k` can be up to 2·10⁹; simulating would time out.
- Rotate **right** by k = new head is the node at index `n − k`.
- Check for empty / single-node lists before counting.
- Reversal alternative: reverse all, reverse first k, reverse the rest (the array-rotation trick). Works, but the ring is simpler.
- Time O(n), space O(1).

---

## 6. Palindrome Linked List (Easy)

### Problem
Return true if the list reads the same forwards and backwards. Follow-up: O(n) time, **O(1) space**.

### Visualize it

```
   [1] ─► [2] ─► [2] ─► [1]       → true
   [1] ─► [2]                     → false

   With an array you'd compare a[i] with a[n−1−i]. A singly linked list can't walk backwards...
   ...so make the second half walk backwards by REVERSING it.
```

### The plan

```
   ① Find the middle (slow/fast).
   ② Reverse from the middle to the end.
   ③ Compare the first half with the reversed second half, node by node.
   ④ (Optional, polite) reverse the second half back to restore the input.
```

### Which middle?

```
   slow ← head, fast ← head
   while fast ≠ null and fast.next ≠ null:
       slow ← slow.next ; fast ← fast.next.next

   even [1,2,2,1]   → slow stops at index 2 (the SECOND middle)
   odd  [1,2,3,2,1] → slow stops at index 2 (the exact middle, compared with itself: harmless)
```

### Trace ([1,2,2,1])

```
 ① MIDDLE
   slow=[1]a fast=[1]a
   step: slow=[2]b  fast=[2]c       fast.next=[1]d exists → continue
   step: slow=[2]c  fast=null       → stop.  mid = [2]c
   (letters a b c d tell the four nodes apart)

 ② REVERSE from [2]c:   [2]c ─► [1]d   becomes   [1]d ─► [2]c ─► null

   first half:  [1]a ─► [2]b ─► [2]c ─► null     ([2]b still points at [2]c)
   second:      [1]d ─► [2]c ─► null

 ③ COMPARE (until the second pointer hits null)
   p1=[1]a  p2=[1]d   1 = 1 ✓
   p1=[2]b  p2=[2]c   2 = 2 ✓
   p2 = null → STOP → true ✅
```

### Trace ([1,2])

```
 ① slow=[1], fast=[1] → step: slow=[2], fast=null → mid = [2]
 ② reverse [2] → [2]
 ③ p1=[1] vs p2=[2]: 1 ≠ 2 → false ✅
```

### Trace (odd: [1,2,3,2,1])

```
 ① slow ends at [3] (index 2)
 ② reverse [3]─►[2]─►[1]  →  [1]─►[2]─►[3]
 ③ 1=1 ✓, 2=2 ✓, 3=3 ✓ (the middle compared with itself) → true ✅
```

### Pseudocode

```
function isPalindrome(head):
    slow ← head, fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    second ← reverseList(slow)               // Problem 1
    p1 ← head, p2 ← second, ok ← true
    while p2 ≠ null:
        if p1.val ≠ p2.val: ok ← false; break
        p1 ← p1.next
        p2 ← p2.next
    reverseList(second)                       // optional: restore the input
    return ok
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy values to array, two pointers | O(n) | O(n) |
| Stack of first half | O(n) | O(n) |
| Recursion with a "front" pointer | O(n) | O(n) stack |
| **Middle + reverse second half** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Loop the comparison on the **second** half's pointer. It is never longer than the first.
- The first half's last node still points into the reversed part. That is fine for comparing.
- Restoring the list matters in real code (and some interviewers ask for it).

---

## 7. Maximum Twin Sum of a Linked List (Medium)

### Problem
The list has **even** length `n`. Node `i` and node `n − 1 − i` are **twins**.
Return the maximum of `node[i] + node[n−1−i]`.

### Visualize it

```
   [5] ─► [4] ─► [2] ─► [1]
    └──────┼──────┼──────┘     5 + 1 = 6
           └──────┘            4 + 2 = 6       → max = 6
```

### Same combo as Palindrome, but SUM instead of COMPARE

```
   ① find the middle (second middle, since n is even)
   ② reverse the second half
   ③ walk both halves together, track the max of p1.val + p2.val
```

### Trace ([5,4,2,1])

```
 ① mid = [2] (index 2)
 ② second half [2] ─► [1]  reversed  →  [1] ─► [2]
 ③ pairs:
      p1=[5]  p2=[1]   sum 6   best 6
      p1=[4]  p2=[2]   sum 6   best 6
    p2 = null → answer 6 ✅
```

### Trace ([4,2,2,3])

```
 ① mid = index 2 (the second [2])
 ② second half [2] ─► [3]  reversed  →  [3] ─► [2]
 ③ pairs:
      p1=[4]  p2=[3]   sum 7   best 7
      p1=[2]  p2=[2]   sum 4   best 7
    answer 7 ✅
```

### Pseudocode

```
function pairSum(head):
    slow ← head, fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    p2 ← reverseList(slow)
    p1 ← head
    best ← 0
    while p2 ≠ null:
        best ← max(best, p1.val + p2.val)
        p1 ← p1.next
        p2 ← p2.next
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Copy to array, two pointers | O(n) | O(n) |
| Push first half onto a stack | O(n) | O(n) |
| **Middle + reverse second half** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Even length is guaranteed, so the halves have equal size.
- Same skeleton as Palindrome. Only the work inside the loop changes (sum vs compare).
- Starting `best` at 0 is safe because node values are positive in this problem.

---

## 8. Master Cheat Sheet

### All 7 problems at a glance

```
┌──────────────────────────┬───────────────────────────────────────────────────┬──────┬───────┐
│ Problem                  │ Core move                                         │ Time │ Space │
├──────────────────────────┼───────────────────────────────────────────────────┼──────┼───────┤
│ Reverse Linked List      │ 3-pointer loop: save → flip → advance             │ O(n) │ O(1)  │
│ Reverse Linked List II   │ dummy + head insertion, right−left pulls          │ O(n) │ O(1)  │
│ Swap Nodes in Pairs      │ 3 arrow changes per pair, prev ← a                │ O(n) │ O(1)  │
│ Reverse Nodes in k-Group │ look ahead k, reverse with prev=groupNext, stitch │ O(n) │ O(1)  │
│ Rotate List              │ length, k mod n, ring, cut at n−k−1               │ O(n) │ O(1)  │
│ Palindrome Linked List   │ middle + reverse second half + compare            │ O(n) │ O(1)  │
│ Maximum Twin Sum         │ middle + reverse second half + sum pairs          │ O(n) │ O(1)  │
└──────────────────────────┴───────────────────────────────────────────────────┴──────┴───────┘
```

### Pattern family tree

```
                          REVERSAL PATTERN
                                │
        ┌───────────────────────┼─────────────────────────┐
        │                       │                         │
   REVERSE A SPAN          REWIRE ONLY             MIDDLE + REVERSE HALF
        │                       │                         │
  ├─ Whole list            └─ Rotate List          ├─ Palindrome Linked List
  ├─ Range [left, right]      (ring + cut)         └─ Maximum Twin Sum
  ├─ Pairs (k = 2)                                     (+ Reorder List in Merge / Sort)
  └─ Groups of k
```

### Pointer roles card

```
   prev        head of the part already reversed
   curr        first node not yet reversed
   next        saved copy of curr.next (so the rest isn't lost)
   dummy       fake node before head; return dummy.next
   before      node just before a range; never moves (Reverse II)
   groupPrev   node before the current k-group (k-Group)
   groupNext   node right after the current k-group
```

### Checklist

```
  ☐ Will the head change?                   → use a dummy node
  ☐ Reversing only part of the list?         → keep `before` and the range's old first node
  ☐ Groups of k?                             → look ahead k nodes BEFORE reversing
  ☐ Need to read the list backwards?         → reverse the second half (O(1) space)
  ☐ Shift by k?                              → k mod n, then ring + cut
  ☐ Need O(1) space?                         → iterative, never recursive
```

### 🚩 Common bugs to avoid

```
  ✗ Flipping curr.next before saving it → rest of the list lost
  ✗ Returning curr instead of prev after the reversal loop
  ✗ No dummy → crash or wrong answer when left = 1 / the head is swapped
  ✗ Reverse II: doing right − left + 1 pulls instead of right − left
  ✗ k-Group: reversing a short last group that should stay as-is
  ✗ k-Group: forgetting to move groupPrev to the old first node
  ✗ Rotate: not taking k mod n (TLE) or not handling n ≤ 1
  ✗ Palindrome: looping on the first half's pointer (it's longer for odd n)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Before I change this arrow, who else needs to know     ║
   ║   where it used to point?"                               ║
   ╚══════════════════════════════════════════════════════════╝
     Save that pointer first. Then flip. Then reconnect the ends.
```

---

### ✅ Progress tracker

- [ ] Reverse Linked List (Easy)
- [ ] Reverse Linked List II (Medium)
- [ ] Swap Nodes in Pairs (Medium)
- [ ] Reverse Nodes in k-Group (Hard)
- [ ] Rotate List (Medium)
- [ ] Palindrome Linked List (Easy)
- [ ] Maximum Twin Sum of a Linked List (Medium)
