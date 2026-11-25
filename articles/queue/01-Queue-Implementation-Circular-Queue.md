# Queue Implementation & Circular Queue: A Visual Guide

> **Goal:** Build a queue (and a deque) on a fixed-size array **by hand**, understand the
> wrap-around trick, and never again confuse "full" with "empty".
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Queue built from two stacks lives in [../stack/05-Stack-Based-Design.md](../stack/05-Stack-Based-Design.md).

---

## Table of Contents

0. [The Big Idea: Queues on an Array](#0-the-big-idea-queues-on-an-array)
1. [Implement Queue using Array (Easy)](#1-implement-queue-using-array-easy)
2. [Design Circular Queue (Medium)](#2-design-circular-queue-medium)
3. [Design Circular Deque (Medium)](#3-design-circular-deque-medium)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Queue using Array → Circular Queue → Circular Deque.
> The simple array queue shows the problem (wasted space), the circular queue fixes it,
> and the deque adds "insert/delete at both ends" on top of the same ring.

---

## 0. The Big Idea: Queues on an Array

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "ARRAY / CIRCULAR QUEUE"                │
├──────────────────────────────────────────────────────────────────┤
│  • "Design a circular queue / deque / ring buffer"               │
│  • "Implement a queue using an array" (fixed capacity k)         │
│  • Methods like enQueue, deQueue, Front, Rear, isFull, isEmpty   │
│  • Every operation must be O(1)                                  │
│  • Streaming / buffering with a fixed memory budget              │
└──────────────────────────────────────────────────────────────────┘
```

### What a queue is: FIFO

```
          enqueue (join at the BACK)            dequeue (leave from the FRONT)
                    │                                       ▲
                    ▼                                       │
      back ──►  [ 7 ][ 5 ][ 9 ][ 2 ]  ──► front
                 last              first
                 in                in   → first out (FIFO)
```

### Problem 1: the naive array queue "drifts right" and wastes space

```
 capacity 5. Rule: push at rear, pop at front, both only move RIGHT.

 push 1..5:   [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]
               F                        R (rear = 5 = end)

 pop ×4:      [ · ][ · ][ · ][ · ][ 5 ]
                                  F    R

 push 6:      ✗ "FULL" — rear is at the end of the array…
              …but 4 slots on the LEFT are empty and wasted! 😢

 Fix A: shift everything left on every pop      → pop becomes O(n) ✗
 Fix B: let the indices WRAP AROUND to index 0  → everything O(1) ✓  (circular!)
```

### The ring: bend the array into a circle

```
   array view:   idx  0    1    2    3    4
                    [ 6 ][ · ][ · ][ · ][ 5 ]
                      ▲                   ▲
                    rear                front

   circle view:            ┌─────┐
                     ┌─────┤  0  ├─────┐            front = 4  (holds 5)
                     │     │  6  │     │            rear  = 0  (holds 6)
                  ┌──┴──┐  └─────┘  ┌──┴──┐
                  │  4  │           │  1  │         order: 5 → 6
                  │  5  │           │  ·  │         (walk clockwise from front)
                  └──┬──┘           └──┬──┘
                     │  ┌──┐     ┌──┐  │
                     └──┤3 ├─────┤2 ├──┘
                        │· │     │· │
                        └──┘     └──┘
        After index 4 comes index 0 again.
```

### The two formulas you need

```
   ┌────────────────────────────────────────────────────────────┐
   │  step FORWARD  (clockwise):   i  ←  (i + 1) % cap          │
   │  step BACKWARD (counter-cw):  i  ←  (i − 1 + cap) % cap    │
   └────────────────────────────────────────────────────────────┘

   cap = 5:   forward from 4 → (4+1)%5 = 0    ✓ wraps to start
              backward from 0 → (0−1+5)%5 = 4 ✓ wraps to end

   ⚠ Why "+ cap"? In C / C++ / Java / JavaScript, (−1) % 5 = −1 (not 4).
     Adding cap first keeps the number non-negative in every language.
```

### Problem 2: "front == rear" means FULL or EMPTY?

Suppose you track only `front` (first item) and `rear` (next free slot), cap = 3:

```
   EMPTY:                      FULL (after 3 pushes, rear wrapped):
   [ · ][ · ][ · ]             [ a ][ b ][ c ]
     F                           F
     R                           R
   front == rear               front == rear      ← SAME picture! 🤯
```

### Three fixes

```
 FIX 1: keep a SIZE counter  (used in this guide ✅)
   empty ⇔ size == 0        full ⇔ size == cap
   [ a ][ b ][ c ]   size = 3 → full, no doubt.

 FIX 2: WASTE ONE SLOT  (array of cap + 1)
   empty ⇔ front == rear    full ⇔ (rear + 1) % (cap+1) == front
   cap = 3 → array of 4:
   [ a ][ b ][ c ][ · ]     rear can never catch front; one slot always stays empty.
     F              R

 FIX 3: a FLAG  "was the last operation an insert?"
   front == rear and lastWasInsert → full
   front == rear and not           → empty
```

### Convention used in this whole guide

```
 ┌───────────────────────────────────────────────────────────────────┐
 │  front = index of the FIRST item                                  │
 │  size  = number of items                                          │
 │  rear item lives at       (front + size − 1) % cap                │
 │  next back slot is        (front + size)     % cap                │
 │  Nothing else to store. No full/empty ambiguity.                  │
 └───────────────────────────────────────────────────────────────────┘
```

> 💡 **Key insight:** with `front + size`, the rear is *computed*, not stored.
> One fewer variable means one fewer way to get out of sync.

### Alternative: a linked list

```
   head ──► [ 5 ] ──► [ 6 ] ──► [ 9 ] ◄── tail
   enqueue: tail.next = new node, tail = new node     O(1)
   dequeue: head = head.next                          O(1)
   deque version needs a DOUBLY linked list (prev pointers) for O(1) deleteLast.

   ✓ no fixed capacity     ✗ extra pointer memory per item, poor cache locality
   For "capacity k" design problems, the ring buffer is the expected answer.
```

---

## 1. Implement Queue using Array (Easy)

### Problem (GFG-style)
Implement `push(x)` and `pop()` using an array. `pop()` returns the front element,
or **−1 if the queue is empty**. (GFG's array is large enough for all queries, so there is
no "full" check.)

### Convention

```
   front = index of the first item
   rear  = index of the next FREE slot
   empty ⇔ front == rear          size = rear − front
```

### The simple version

```
   push(x):   arr[rear] ← x,  rear ← rear + 1
   pop():     if front == rear: return −1
              x ← arr[front], front ← front + 1, return x
```

### Trace 1: push 2, push 3, pop, push 4, pop

```
 op       │ array (idx 0..3)       │ front │ rear │ output
 ─────────┼────────────────────────┼───────┼──────┼────────
 start    │ [ · ][ · ][ · ][ · ]   │   0   │  0   │
 push 2   │ [ 2 ][ · ][ · ][ · ]   │   0   │  1   │
 push 3   │ [ 2 ][ 3 ][ · ][ · ]   │   0   │  2   │
 pop      │ [ ░ ][ 3 ][ · ][ · ]   │   1   │  2   │  2
 push 4   │ [ ░ ][ 3 ][ 4 ][ · ]   │   1   │  3   │
 pop      │ [ ░ ][ ░ ][ 4 ][ · ]   │   2   │  3   │  3
                                                    output: 2 3 ✅
   ░ = slot no longer used (stale)
```

### Trace 2: push 3, pop, pop, push 4

```
 op       │ array                  │ front │ rear │ output
 ─────────┼────────────────────────┼───────┼──────┼────────
 start    │ [ · ][ · ][ · ]        │   0   │  0   │
 push 3   │ [ 3 ][ · ][ · ]        │   0   │  1   │
 pop      │ [ ░ ][ · ][ · ]        │   1   │  1   │  3
 pop      │ [ ░ ][ · ][ · ]        │   1   │  1   │  −1   (front == rear → empty)
 push 4   │ [ ░ ][ 4 ][ · ]        │   1   │  2   │
                                                    output: 3 −1 ✅
```

### Pseudocode

```
class ArrayQueue:
    arr   ← big array
    front ← 0
    rear  ← 0

    push(x):
        arr[rear] ← x
        rear ← rear + 1

    pop():
        if front == rear: return −1
        x ← arr[front]
        front ← front + 1
        return x
```

### Why this leads to the circular queue

```
   With a FIXED capacity, both indices only move right → the "drift" problem:

   cap 4, push a b c d, pop pop pop:
   [ ░ ][ ░ ][ ░ ][ d ]
                    F   R = 4 = end of array → can't push, though 3 slots are free.

   Replace  i + 1  with  (i + 1) % cap  and the dead slots get reused  →  Problem 2.
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| push | O(1) | — |
| pop | O(1) | — |
| total | — | O(number of pushes) — slots are never reused |

### 📌 Points to remember
- `front == rear` ⇒ empty ⇒ `pop` returns **−1**.
- This version **never reuses** slots. Fine when the array is huge, wasteful otherwise.
- The fix for wasted space is wrap-around, not shifting elements.

---

## 2. Design Circular Queue (Medium)

### Problem (LeetCode 622)
Design a queue of capacity `k` with:
`enQueue(x)` → true/false, `deQueue()` → true/false, `Front()` → value or −1,
`Rear()` → value or −1, `isEmpty()`, `isFull()`. All O(1).

### Visualize it

```
   k = 3:   [ · ][ · ][ · ]       front = 0, size = 0

   enQueue goes to   (front + size) % k        ← the slot right after the last item
   deQueue moves     front ← (front + 1) % k   ← the old value is simply forgotten
   Front  reads      arr[front]
   Rear   reads      arr[(front + size − 1) % k]
```

### Decision picture for each method

```
   enQueue(x) ──► full? ──yes──► return false
                    │no
                    ▼
            arr[(front+size)%k] ← x ; size++ ; return true

   deQueue() ──► empty? ──yes──► return false
                    │no
                    ▼
            front ← (front+1)%k ; size-- ; return true

   Front()/Rear() ──► empty? ──yes──► return −1
                          │no
                          ▼
                    read arr[front] / arr[(front+size−1)%k]
```

### The 5 design decisions

| Decision | Choice |
|------|--------|
| Storage | array of length `k` |
| State | `front` (index of first item), `size` |
| Insert position | `(front + size) % k` |
| Remove | `front ← (front + 1) % k`, `size ← size − 1` |
| Full / empty | `size == k` / `size == 0` |

### Trace (LeetCode example, k = 3)

```
 op          │ array idx 0 1 2      │ front │ size │ returns │ note
 ────────────┼──────────────────────┼───────┼──────┼─────────┼─────────────────────────
 init(3)     │ [ · ][ · ][ · ]      │   0   │  0   │         │
 enQueue(1)  │ [ 1 ][ · ][ · ]      │   0   │  1   │ true    │ slot (0+0)%3 = 0
 enQueue(2)  │ [ 1 ][ 2 ][ · ]      │   0   │  2   │ true    │ slot (0+1)%3 = 1
 enQueue(3)  │ [ 1 ][ 2 ][ 3 ]      │   0   │  3   │ true    │ slot (0+2)%3 = 2
 enQueue(4)  │ [ 1 ][ 2 ][ 3 ]      │   0   │  3   │ false   │ size == 3 → full
 Rear()      │ [ 1 ][ 2 ][ 3 ]      │   0   │  3   │ 3       │ idx (0+3−1)%3 = 2
 isFull()    │ [ 1 ][ 2 ][ 3 ]      │   0   │  3   │ true    │
 deQueue()   │ [ ░ ][ 2 ][ 3 ]      │   1   │  2   │ true    │ front (0+1)%3 = 1
 enQueue(4)  │ [ 4 ][ 2 ][ 3 ]      │   1   │  3   │ true    │ slot (1+2)%3 = 0  ← WRAP!
 Rear()      │ [ 4 ][ 2 ][ 3 ]      │   1   │  3   │ 4       │ idx (1+3−1)%3 = 0
                                                   ✅ matches [true,true,true,false,3,true,true,true,4]
```

### The wrap-around moment, drawn

```
   before enQueue(4):            after enQueue(4):
   idx   0    1    2             idx   0    1    2
       [ ░ ][ 2 ][ 3 ]               [ 4 ][ 2 ][ 3 ]
              F                        R    F
   logical order: 2, 3               logical order: 2, 3, 4
                                     (start at F, walk right, wrap to 0)
```

### Pseudocode

```
class MyCircularQueue:
    init(k):
        arr ← array of size k
        cap ← k, front ← 0, size ← 0

    enQueue(x):
        if size == cap: return false
        arr[(front + size) % cap] ← x
        size ← size + 1
        return true

    deQueue():
        if size == 0: return false
        front ← (front + 1) % cap
        size ← size − 1
        return true

    Front():   return size == 0 ? −1 : arr[front]
    Rear():    return size == 0 ? −1 : arr[(front + size − 1) % cap]
    isEmpty(): return size == 0
    isFull():  return size == cap
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| every method | O(1) | O(k) total |

### Alternative state: `front` + `rear` (rear = index of last item) + `size`

```
   enQueue: rear ← (rear + 1) % cap ; arr[rear] ← x       (start with rear = −1 or cap − 1)
   This also works. Just never mix the two conventions in one class.
```

### 📌 Points to remember
- `deQueue` doesn't erase anything. Moving `front` is enough.
- Always check **full before insert** and **empty before read/remove**.
- `Front()` / `Rear()` on an empty queue return **−1**, not garbage from a stale slot.
- Test the wrap: fill, remove one, insert one, then call `Rear()`.

---

## 3. Design Circular Deque (Medium)

### Problem (LeetCode 641)
Capacity `k` double-ended queue with:
`insertFront`, `insertLast`, `deleteFront`, `deleteLast` (true/false),
`getFront`, `getRear` (value or −1), `isEmpty`, `isFull`. All O(1).

### Visualize it: the same ring, now both ends move

```
                insertFront: step front BACKWARD, write there
                deleteFront: step front FORWARD
                        ◄──┐            ┌──►
                           │            │
        idx    0    1    2 │            │
             [   ][   ][   ]
                  ▲     ▲
                front  rear = (front + size − 1) % k

                insertLast:  write at (front + size) % k
                deleteLast:  just size−−   (rear is computed!)
```

### The 4 moves

```
   ┌──────────────┬───────────────────────────────────────────────┐
   │ insertFront  │ front ← (front − 1 + k) % k ; arr[front] ← x  │
   │              │ size++                                        │
   ├──────────────┼───────────────────────────────────────────────┤
   │ insertLast   │ arr[(front + size) % k] ← x ; size++          │
   ├──────────────┼───────────────────────────────────────────────┤
   │ deleteFront  │ front ← (front + 1) % k ; size−−              │
   ├──────────────┼───────────────────────────────────────────────┤
   │ deleteLast   │ size−−                                        │
   └──────────────┴───────────────────────────────────────────────┘
   inserts: return false if full.  deletes: return false if empty.
```

### Trace (LeetCode example, k = 3)

```
 op              │ array idx 0 1 2   │ front │ size │ returns │ logical order (front → rear)
 ────────────────┼───────────────────┼───────┼──────┼─────────┼──────────────────────────────
 init(3)         │ [ · ][ · ][ · ]   │   0   │  0   │         │ (empty)
 insertLast(1)   │ [ 1 ][ · ][ · ]   │   0   │  1   │ true    │ 1            slot (0+0)%3 = 0
 insertLast(2)   │ [ 1 ][ 2 ][ · ]   │   0   │  2   │ true    │ 1, 2         slot (0+1)%3 = 1
 insertFront(3)  │ [ 1 ][ 2 ][ 3 ]   │   2   │  3   │ true    │ 3, 1, 2      front (0−1+3)%3 = 2
 insertFront(4)  │ [ 1 ][ 2 ][ 3 ]   │   2   │  3   │ false   │ full
 getRear()       │ [ 1 ][ 2 ][ 3 ]   │   2   │  3   │ 2       │ idx (2+3−1)%3 = 1 → 2
 isFull()        │ [ 1 ][ 2 ][ 3 ]   │   2   │  3   │ true    │
 deleteLast()    │ [ 1 ][ ░ ][ 3 ]   │   2   │  2   │ true    │ 3, 1
 insertFront(4)  │ [ 1 ][ 4 ][ 3 ]   │   1   │  3   │ true    │ 4, 3, 1      front (2−1+3)%3 = 1
 getFront()      │ [ 1 ][ 4 ][ 3 ]   │   1   │  3   │ 4       │ arr[1] = 4
                         ✅ matches [true,true,true,false,2,true,true,true,4]
```

### Reading the ring after the last step

```
   idx    0     1     2
        [ 1 ]  [ 4 ]  [ 3 ]
                 F
   Walk from F, wrapping: idx 1 → 2 → 0   gives   4, 3, 1
   rear = (1 + 3 − 1) % 3 = 0 → value 1 ✓
```

### Pseudocode

```
class MyCircularDeque:
    init(k):
        arr ← array of size k
        cap ← k, front ← 0, size ← 0

    insertFront(x):
        if size == cap: return false
        front ← (front − 1 + cap) % cap
        arr[front] ← x
        size ← size + 1
        return true

    insertLast(x):
        if size == cap: return false
        arr[(front + size) % cap] ← x
        size ← size + 1
        return true

    deleteFront():
        if size == 0: return false
        front ← (front + 1) % cap
        size ← size − 1
        return true

    deleteLast():
        if size == 0: return false
        size ← size − 1
        return true

    getFront(): return size == 0 ? −1 : arr[front]
    getRear():  return size == 0 ? −1 : arr[(front + size − 1) % cap]
    isEmpty():  return size == 0
    isFull():   return size == cap
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| every method | O(1) | O(k) total |

### Linked-list alternative

```
   null ◄─ [ 4 ] ⇄ [ 3 ] ⇄ [ 1 ] ─► null
            head              tail
   Doubly linked + a size counter. All 8 methods O(1).
   Sentinel (dummy) head and tail nodes remove the "empty list" special cases.
```

### 📌 Points to remember
- A deque is a circular queue plus one new move: **step front backward** with `(front − 1 + cap) % cap`.
- `deleteLast` is just `size − 1`, because the rear position is derived from `front + size`.
- Watch negative modulo: always add `cap` before `%`.
- Your circular deque also works as a stack (use one end) or a queue (use opposite ends).

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────────┬───────────────────────────────────────────┬──────────┬────────┐
│ Problem                  │ Core idea                                 │ Time/op  │ Space  │
├──────────────────────────┼───────────────────────────────────────────┼──────────┼────────┤
│ Queue using Array (GFG)  │ front/rear only move right; −1 if empty   │ O(1)     │ O(n)   │
│ Design Circular Queue    │ ring buffer, front + size, wrap with % k  │ O(1)     │ O(k)   │
│ Design Circular Deque    │ ring + step front backward for insertFront│ O(1)     │ O(k)   │
└──────────────────────────┴───────────────────────────────────────────┴──────────┴────────┘
```

### Formula card (front + size convention)

```
   ┌──────────────────────────┬──────────────────────────────────────┐
   │ first item               │ arr[front]                           │
   │ last item                │ arr[(front + size − 1) % cap]        │
   │ add at back              │ arr[(front + size) % cap] ← x        │
   │ add at front             │ front ← (front − 1 + cap) % cap      │
   │ remove from front        │ front ← (front + 1) % cap            │
   │ remove from back         │ size ← size − 1                      │
   │ empty / full             │ size == 0 / size == cap              │
   └──────────────────────────┴──────────────────────────────────────┘
```

### Family tree

```
                        ARRAY-BACKED QUEUES
                               │
           ┌───────────────────┼────────────────────┐
           │                   │                    │
     LINEAR ARRAY        CIRCULAR QUEUE       CIRCULAR DEQUE
     (indices drift)     (wrap with %)        (both ends move)
           │                   │                    │
     └ Queue using Array └ Design Circ. Queue └ Design Circ. Deque

     Related: Queue using Stacks / Stack using Queues → ../stack/05-Stack-Based-Design.md
```

### Full vs empty: pick one fix

```
   ┌───────────────────────┬────────────────────────┬──────────────────────────────┐
   │ Fix                   │ Empty test             │ Full test                    │
   ├───────────────────────┼────────────────────────┼──────────────────────────────┤
   │ size counter ✅       │ size == 0              │ size == cap                  │
   │ waste one slot        │ front == rear          │ (rear + 1) % (cap+1) == front│
   │ last-op flag          │ front == rear & !flag  │ front == rear & flag         │
   └───────────────────────┴────────────────────────┴──────────────────────────────┘
```

### 🚩 Common bugs to avoid

```
  ✗ Using (i − 1) % cap → negative index in C/C++/Java/JS. Use (i − 1 + cap) % cap.
  ✗ Tracking front AND rear with no size/flag → full and empty look identical.
  ✗ Reading Front()/Rear() without checking empty → returns a stale value.
  ✗ Mixing "rear = last item" and "rear = next free slot" in the same class.
  ✗ Forgetting to update size in one of the four methods.
  ✗ Clearing the slot on delete "for safety" and then off-by-one on the index.
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Where exactly do front and rear point, and how do I    ║
   ║   tell a full ring from an empty one?"                   ║
   ╚══════════════════════════════════════════════════════════╝
     Answer both before writing any method, and every method becomes one line.
```

---

### ✅ Progress tracker

- [ ] Implement Queue using Array (Easy)
- [ ] Design Circular Queue (Medium)
- [ ] Design Circular Deque (Medium)
