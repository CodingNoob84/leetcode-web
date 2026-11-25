# Stack-Based Design: A Visual Guide

> **Goal:** Learn to build stacks and queues that do *more* than push/pop. You'll
> answer "min", "max", "most frequent" or "add to the bottom k" fast, and you'll
> learn to fake one container with another.
> No real code here, only **pictures, intuition, class-style pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Stack-Based Design?](#0-the-big-idea-what-is-stack-based-design)
1. [Implement Queue using Stacks (Easy)](#1-implement-queue-using-stacks-easy)
2. [Implement Stack using Queues (Easy)](#2-implement-stack-using-queues-easy)
3. [Min Stack (Medium)](#3-min-stack-medium)
4. [Design Stack with Increment Operation (Medium)](#4-design-stack-with-increment-operation-medium)
5. [Max Stack (Medium)](#5-max-stack-medium)
6. [Maximum Frequency Stack (Hard)](#6-maximum-frequency-stack-hard)
7. [Master Cheat Sheet](#7-master-cheat-sheet)

> **Suggested order:** Queue using Stacks → Stack using Queues → Min Stack →
> Increment Stack → Max Stack → Max Frequency Stack.
> The first two teach **container conversion**. The next two teach **augmenting entries**
> and **lazy work**. The last two combine those ideas with maps.

---

## 0. The Big Idea: What Is Stack-Based Design?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "STACK-BASED DESIGN"                    │
├──────────────────────────────────────────────────────────────────┤
│  • "Design a class" with push / pop / top + ONE extra operation  │
│  • The extra operation must be fast: getMin, peekMax, popMax,    │
│    increment(k, val), pop-most-frequent                          │
│  • "Implement X using only Y" (queue from stacks, and so on)     │
│  • "Each operation in O(1)" or "amortized O(1)"                  │
└──────────────────────────────────────────────────────────────────┘
```

### Trick 1: augment each entry with extra info (a "snapshot")

```
   A stack only changes at the TOP. So whatever was true when an item was
   pushed is STILL true for everything below it, as long as it is there.

   Store the answer AT PUSH TIME next to each value:

        push 5     push 3     push 7     push 2
                                         ┌─────┬─────┐
                              ┌─────┬───┐│  2  │ min2│ ← top
                   ┌─────┬───┐│  7  │ 3 │├─────┼─────┤
        ┌─────┬───┐│  3  │ 3 │├─────┼───┤│  7  │ min3│
        │  5  │ 5 │├─────┼───┤│  3  │ 3 │├─────┼─────┤
        └─────┴───┘│  5  │ 5 │├─────┼───┤│  3  │ min3│
                   └─────┴───┘│  5  │ 5 │├─────┼─────┤
                              └─────┴───┘│  5  │ min5│
                                         └─────┴─────┘
                    value │ min-so-far

   pop → the entry below already KNOWS its own min. Nothing to recompute.
```

> 💡 **Key insight:** a stack is *history*. Popping = rewinding history.
> If you saved the answer at each moment, rewinding is free.

### Trick 2: two containers that cancel each other's order

```
   Stack = LIFO (reverses order)       Queue = FIFO (keeps order)

   Pour stack A into stack B:          Rotate a queue:
        A        B                         front → [1, 2, 3] → back
       [3]                                 move front to back, (size−1) times:
       [2]  ──►  [1]                       [2, 3, 1] → [3, 1, 2]
       [1]       [2]                       the LAST item is now at the FRONT
                 [3]
   Reversing twice = original order.   Rotating = putting the newest first.
```

### Trick 3: lazy work + amortized cost

```
   Don't do work until it is FORCED. Then charge it to the items involved.

   Each item's lifetime:   pushed ─► (maybe moved ONCE) ─► popped
                              1     +        1          +    1    = O(1) per item

   cost per operation:
     │                          █
     │                          █
     │          █               █
     │  ▁ ▁ ▁ ▁ █ ▁ ▁ ▁ ▁ ▁ ▁ ▁ █ ▁ ▁
     └──────────────────────────────────► operations
        cheap, cheap... one expensive spike... but the spikes are paid for
        by the cheap ops before them → AVERAGE (amortized) O(1)
```

### The design recipe (use this for EVERY problem)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  List the operations and the required complexities.    │
 │ STEP 2  Which operation is the HARD one? (getMin, popMax...)  │
 │ STEP 3  What extra info makes it easy?                        │
 │           • snapshot per entry?  • second container?          │
 │           • a map from value → positions?  • lazy counters?   │
 │ STEP 4  Check EVERY operation keeps that extra info correct.  │
 │ STEP 5  Trace a sequence of operations by hand.               │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Implement Queue using Stacks (Easy)

### Problem
Build a FIFO queue (`push`, `pop`, `peek`, `empty`) using **only** stack operations.

### Visualize it: two stacks, an "inbox" and an "outbox"

```
        push here                     pop / peek here
            │                               ▲
            ▼                               │
        ┌───────┐                       ┌───────┐
        │  in   │   ── pour when ──►    │  out  │
        │ stack │      out is EMPTY     │ stack │
        └───────┘                       └───────┘

   "in"  holds NEW items (newest on top).
   "out" holds OLD items (oldest on top) → ready to leave in FIFO order.
```

### The golden rule

```
   ┌────────────────────────────────────────────────────────────┐
   │ Move items from in → out ONLY when out is EMPTY.           │
   │ If out still has items, they are older than anything in    │
   │ "in", so they must leave first. Pouring now breaks order.  │
   └────────────────────────────────────────────────────────────┘
```

### Trace

```
  op         in (bottom→top)   out (bottom→top)   returns
  ─────────  ────────────────  ─────────────────  ───────
  push 1     [1]               []
  push 2     [1,2]             []
  push 3     [1,2,3]           []
  peek       []                [3,2,1]            1        ← out was empty → pour
  pop        []                [3,2]              1
  push 4     [4]               [3,2]
  pop        [4]               [3]                2        ← out NOT empty → no pour
  pop        [4]               []                 3
  pop        []                []                 4        ← pour [4], then pop
  empty      []                []                 true
```

### Pseudocode

```
class MyQueue:
    in  ← empty stack
    out ← empty stack

    push(x):
        in.push(x)

    shift():                         // helper
        if out is empty:
            while in not empty:
                out.push(in.pop())

    pop():
        shift()
        return out.pop()

    peek():
        shift()
        return out.top()

    empty():
        return in is empty and out is empty
```

### Complexity

| Operation | Worst case | Amortized |
|---|---|---|
| push | O(1) | O(1) |
| pop / peek | O(n) (when pouring) | **O(1)** ✅ |
| empty | O(1) | O(1) |

> Each item is pushed to `in` once, moved once, and popped from `out` once.
> That's ≤ 4 stack operations per item in total → amortized O(1).

### 📌 Points to remember
- **Pour only when `out` is empty.** This is the one rule that makes it correct.
- `empty()` must check **both** stacks.
- The naive version (pour everything back and forth on every op) is O(n) per op.

---

## 2. Implement Stack using Queues (Easy)

### Problem
Build a LIFO stack (`push`, `pop`, `top`, `empty`) using **only** queue operations.

### Visualize it: rotate the newest item to the front

```
   Goal: keep the queue ordered so that FRONT = stack TOP (newest).

   push x:  enqueue x at the back, then rotate the OLD items behind it.

        front                 back
        [ 2 , 1 ]   enqueue 3 → [ 2 , 1 , 3 ]
                    rotate 2×:  [ 1 , 3 , 2 ]
                                [ 3 , 2 , 1 ]   ← 3 is at the front ✅
```

### Trace

```
  op        queue (front→back)              returns
  ────────  ──────────────────────────────  ───────
  push 1    [1]                     (rotate 0×)
  push 2    [1,2] → [2,1]           (rotate 1×)
  push 3    [2,1,3] → [1,3,2] → [3,2,1]  (rotate 2×)
  top       [3,2,1]                          3
  pop       [2,1]                            3
  top       [2,1]                            2
  empty     [2,1]                            false
```

### Pseudocode (one queue)

```
class MyStack:
    q ← empty queue

    push(x):
        q.enqueue(x)
        repeat (q.size − 1) times:
            q.enqueue(q.dequeue())       // move old items behind x

    pop():   return q.dequeue()
    top():   return q.front()
    empty(): return q is empty
```

### Complexity

| Operation | Time |
|---|---|
| push | **O(n)** (rotation) |
| pop / top / empty | O(1) |

> The alternative is "cheap push, expensive pop": rotate on pop instead.
> Choose based on which operation is called more often.
> Unlike the queue-from-stacks trick, there is **no amortized O(1)** here.

### 📌 Points to remember
- Rotate `size − 1` times, **not** `size` times. Otherwise you undo the move.
- The two-queue version (move everything to q2, swap names) is the same idea with more bookkeeping.

---

## 3. Min Stack (Medium)

### Problem
A stack with `push`, `pop`, `top`, and `getMin`, **all in O(1)**.

### Why one "min" variable fails

```
   push 3, push 1   → min = 1
   pop              → removes 1. What is the min now?
                      A single variable FORGOT that it used to be 3. ✗
```

### Fix: snapshot the min with every entry

```
   Each entry = (value, min of everything at or below me)

   new entry's min = min( x , min of current top )
```

### Trace (LeetCode example)

```
  op          stack (bottom → top), each (val, min)       returns
  ──────────  ──────────────────────────────────────────   ───────
  push -2     (-2,-2)
  push 0      (-2,-2) (0,-2)
  push -3     (-2,-2) (0,-2) (-3,-3)
  getMin      ...                                 top.min →  -3
  pop         (-2,-2) (0,-2)
  top         ...                                 top.val →   0
  getMin      ...                                 top.min →  -2  ✅
```

```
        before pop            after pop
       ┌────┬────┐
       │ -3 │ -3 │  ← top
       ├────┼────┤           ┌────┬────┐
       │  0 │ -2 │           │  0 │ -2 │  ← top: min is already -2
       ├────┼────┤           ├────┼────┤
       │ -2 │ -2 │           │ -2 │ -2 │
       └────┴────┘           └────┴────┘
```

### Pseudocode

```
class MinStack:
    st ← empty stack of (val, curMin)

    push(x):
        if st is empty: st.push((x, x))
        else:           st.push((x, min(x, st.top().curMin)))

    pop():    st.pop()
    top():    return st.top().val
    getMin(): return st.top().curMin
```

### Space optimization (two stacks)

```
   main stack: every value
   min stack:  push x only when x ≤ current min   (note ≤, NOT <)
   pop:        if popped value == minStack.top → pop minStack too

   Why ≤?  push 1, push 1, pop → with "<", the min stack would lose
           the only 1 while another 1 is still in the main stack. ✗
```

### Complexity

| Operation | Time | Extra space |
|---|---|---|
| all four | **O(1)** | O(n) (O(n) worst case for the two-stack version too) |

### 📌 Points to remember
- **Snapshot at push time.** That is the whole trick.
- Two-stack variant: use **≤** when pushing to the min stack.
- Same pattern gives **Max Stack's** `peekMax` for free (but not `popMax`, see §5).

---

## 4. Design Stack with Increment Operation (Medium)

### Problem
`CustomStack(maxSize)` with `push(x)` (ignored if full), `pop()` (−1 if empty),
and `increment(k, val)`: add `val` to the **bottom k** elements (or all if fewer than k).

### Visualize it

```
   increment(2, 100) on stack [1, 2, 3]  (bottom → top)

        ┌─────┐
        │  3  │            untouched
        ├─────┤
        │  2  │  + 100  ┐
        ├─────┤         ├── bottom 2
        │  1  │  + 100  ┘
        └─────┘

   Naive: loop over k elements → O(k) per increment.
```

### Lazy trick: write the increment at ONE index, push it down on pop

```
   inc[i] = "amount to add to element i AND everything below it"

   increment(k, val):   i = min(k, size) − 1
                        inc[i] += val                     ← O(1)

   pop():   i = size − 1
            answer = stack[i] + inc[i]
            inc[i−1] += inc[i]    ← pass the debt down to the new top
            inc[i]   = 0          ← clean slot for future pushes
```

```
   Think of inc[i] as a "tag" hanging on element i that says
   "everything from here down gets +val".

        ┌─────┐
        │  3  │  tag +100     pop 3 → return 3+100
        ├─────┤                         and hand the tag down:
        │  2  │  tag +100                 2's tag becomes +200
        ├─────┤
        │  1  │  tag   0
        └─────┘
```

### Trace (LeetCode example, maxSize = 3)

```
  op                 stack     inc         returns
  ─────────────────  ────────  ──────────  ───────
  push 1             [1]       [0,0,0]
  push 2             [1,2]     [0,0,0]
  pop                [1]       [0,0,0]     2
  push 2             [1,2]     [0,0,0]
  push 3             [1,2,3]   [0,0,0]
  push 4             [1,2,3]   [0,0,0]              (full → ignored)
  increment(5,100)   [1,2,3]   [0,0,100]            i = min(5,3)−1 = 2
  increment(2,100)   [1,2,3]   [0,100,100]          i = min(2,3)−1 = 1
  pop                [1,2]     [0,200,0]   103      3+100; inc[1] += 100
  pop                [1]       [200,0,0]   202      2+200; inc[0] += 200
  pop                []        [0,0,0]     201      1+200
  pop                []        [0,0,0]     -1       empty  ✅
```

### Pseudocode

```
class CustomStack:
    st   ← array of capacity maxSize
    inc  ← array of maxSize zeros
    size ← 0

    push(x):
        if size == maxSize: return
        st[size] ← x
        size ← size + 1

    pop():
        if size == 0: return −1
        i ← size − 1
        result ← st[i] + inc[i]
        if i > 0: inc[i−1] ← inc[i−1] + inc[i]
        inc[i] ← 0
        size ← size − 1
        return result

    increment(k, val):
        i ← min(k, size) − 1
        if i ≥ 0: inc[i] ← inc[i] + val
```

### Complexity

| Operation | Naive | Lazy |
|---|---|---|
| push / pop | O(1) | O(1) |
| increment | O(k) | **O(1)** ✅ |

### 📌 Points to remember
- **Reset `inc[i] = 0` on pop**, or a later push at that slot inherits old increments.
- `increment` on an empty stack does nothing (`i = −1`).
- This is the stack version of a **difference array** / lazy propagation.

---

## 5. Max Stack (Medium)

### Problem (LeetCode Premium 716)
`push`, `pop`, `top`, `peekMax`, and `popMax`.
**Convention:** `popMax` removes the max; if several values tie, remove the **top-most** one
(the most recently pushed).

### Why it's harder than Min Stack

```
   peekMax → snapshot trick works (same as getMin).
   popMax  → removes from the MIDDLE of the stack!

        ┌───┐
        │ 3 │
        ├───┤
        │ 5 │ ← max, but it's NOT on top. Must dig it out.
        ├───┤
        │ 1 │
        └───┘
```

---

### Version A: two stacks, O(n) popMax (simple, good for interviews)

```
   st    = values
   maxSt = max-so-far snapshot (like Min Stack)

   popMax:
     1. m = maxSt.top
     2. pop items into a BUFFER until st.top == m
     3. pop m
     4. push buffer items back with the NORMAL push (snapshots recompute)
```

### Trace A1 (LeetCode example)

```
  op        st          maxSt       returns
  ────────  ──────────  ──────────  ───────
  push 5    [5]         [5]
  push 1    [5,1]       [5,5]
  push 5    [5,1,5]     [5,5,5]
  top       ...                     5
  popMax    [5,1]       [5,5]       5     ← top already equals max, buffer empty
  top       ...                     1
  peekMax   ...                     5
  pop       [5]         [5]         1
  top       ...                     5  ✅
```

The top-most 5 was removed, so the bottom 5 stays.

### Trace A2 (the buffer in action)

```
  start: push 1, push 5, push 3 → st [1,5,3]   maxSt [1,5,5]

  popMax:  m = 5
     st.top = 3 ≠ 5 → buffer [3]      st [1,5]  maxSt [1,5]
     st.top = 5 = m → pop it          st [1]    maxSt [1]
     push back 3 (normal push)        st [1,3]  maxSt [1,3]
     return 5 ✅
```

### Pseudocode A

```
class MaxStack:
    st, maxSt ← empty stacks

    push(x):
        st.push(x)
        maxSt.push( x if maxSt empty else max(x, maxSt.top()) )

    pop():     maxSt.pop(); return st.pop()
    top():     return st.top()
    peekMax(): return maxSt.top()

    popMax():
        m ← maxSt.top()
        buffer ← empty stack
        while st.top() ≠ m:
            buffer.push(pop())
        pop()                                // remove m
        while buffer not empty:
            push(buffer.pop())               // normal push rebuilds snapshots
        return m
```

---

### Version B: doubly linked list + sorted map, O(log n) everything

```
   DLL holds the stack in order (tail = top).
   Sorted map: value → list of DLL nodes with that value (in push order).

        DLL:   head ⇄ [1] ⇄ [5] ⇄ [3] ⇄ [5] ⇄ tail
                       a     b     c     d

        map:   1 → [a]
               3 → [c]
               5 → [b, d]       ← last in list = top-most 5

   pop():     node = tail.prev; unlink it; remove last from map[node.val]
   popMax():  m = largest key; node = map[m].removeLast(); unlink node from DLL
              (unlinking a DLL node from the middle is O(1))
   peekMax(): largest key in the map
```

### Trace B

```
  push 1, 5, 3, 5        DLL: 1 ⇄ 5(b) ⇄ 3 ⇄ 5(d)     map 5 → [b, d]
  popMax                 m = 5, removeLast → d (the top-most 5)
                         DLL: 1 ⇄ 5(b) ⇄ 3           map 5 → [b]   returns 5
  popMax                 m = 5, removeLast → b
                         DLL: 1 ⇄ 3                  map 5 removed  returns 5
  top                    3
  peekMax                3   ✅
```

### Pseudocode B

```
class MaxStack:
    list ← doubly linked list with sentinels head, tail
    map  ← sorted map: value → list of nodes

    push(x):
        node ← list.addBeforeTail(x)
        map[x].append(node)

    pop():
        node ← tail.prev
        list.unlink(node)
        map[node.val].removeLast()
        if map[node.val] empty: delete key node.val
        return node.val

    top():     return tail.prev.val
    peekMax(): return map.largestKey()

    popMax():
        m    ← map.largestKey()
        node ← map[m].removeLast()
        if map[m] empty: delete key m
        list.unlink(node)
        return m
```

### Version C: lazy deletion (stack + heap + "removed" set)

```
   Every push gets a unique id.
   stack: (val, id)        max-heap: (val, id), ties → bigger id first (top-most)
   removed: set of ids that are already gone

   pop():    skip stack tops whose id is in removed; pop one; add its id to removed
   popMax(): skip heap tops whose id is in removed; pop one; add its id to removed
   top() / peekMax(): clean the dead entries first, then peek

   Each entry is removed from each structure at most once → amortized O(log n).
```

### Complexity

| Version | push | pop | top | peekMax | popMax |
|---|---|---|---|---|---|
| A: two stacks | O(1) | O(1) | O(1) | O(1) | **O(n)** |
| B: DLL + sorted map | O(log n) | O(log n) | O(1) | O(log n)* | O(log n) |
| C: lazy heap | O(log n) | amortized O(log n) | amortized O(log n) | amortized O(log n) | amortized O(log n) |

\* O(1) if your sorted map caches its largest key.

### 📌 Points to remember
- **`popMax` removes the top-most max** when values tie. The DLL version gets this by removing the **last** node in `map[m]`.
- Version A rebuilds snapshots by re-pushing the buffer with the **normal** push.
- The general lesson: removing from the middle needs either a **linked list + index map** or **lazy deletion**.

---

## 6. Maximum Frequency Stack (Hard)

### Problem
`push(x)`, and `pop()` which removes the **most frequent** element.
If there is a tie, remove the one **closest to the top** (most recently pushed).

### The key insight: one stack per frequency level

```
   freq:  value → how many copies are in the stack now
   group: frequency f → a stack of values that REACHED count f
   maxF:  the highest frequency right now

   When x reaches count f, push x onto group[f].
   A value with count 3 lives in group[1], group[2] AND group[3].
   Each copy of x "lives" at the level it created.

   pop(): take group[maxF].top  → it is the most frequent, and the most
          recent among ties (stacks keep push order for free!)
```

### Trace: push 5, 7, 5, 7, 4, 5

```
  op        freq               groups                              maxF
  ────────  ─────────────────  ──────────────────────────────────  ────
  push 5    5:1                1:[5]                                1
  push 7    5:1 7:1            1:[5,7]                              1
  push 5    5:2 7:1            1:[5,7]  2:[5]                       2
  push 7    5:2 7:2            1:[5,7]  2:[5,7]                     2
  push 4    5:2 7:2 4:1        1:[5,7,4]  2:[5,7]                   2
  push 5    5:3 7:2 4:1        1:[5,7,4]  2:[5,7]  3:[5]            3
```

```
   The "frequency tower" after all pushes:

     level 3 │ 5
     level 2 │ 5  7
     level 1 │ 5  7  4
             └─────────── push order →

   pop always takes from the TOP-RIGHT of the tower.
```

### Pops

```
  pop   take from     returns   after                              maxF
  ───   ───────────   ───────   ─────────────────────────────────  ────
  1     group[3]      5         5:2   3:[] empty → maxF drops      2
  2     group[2]      7         7:1   2:[5]                        2
  3     group[2]      5         5:1   2:[] empty → maxF drops      1
  4     group[1]      4         4:0   1:[5,7]                      1

  pops → 5, 7, 5, 4  ✅
```

> Pop 2: 5 and 7 both have frequency 2. The 7 reached frequency 2 more recently,
> so it sits on top of `group[2]`.

### Pseudocode

```
class FreqStack:
    freq  ← map value → count
    group ← map count → stack of values
    maxF  ← 0

    push(x):
        freq[x] ← freq[x] + 1
        f ← freq[x]
        if f > maxF: maxF ← f
        group[f].push(x)

    pop():
        x ← group[maxF].pop()
        freq[x] ← freq[x] − 1
        if group[maxF] is empty:
            maxF ← maxF − 1
        return x
```

### Why `maxF − 1` is always safe

```
   If x reached frequency maxF, it ALSO passed through maxF − 1,
   so group[maxF − 1] is never empty when group[maxF] empties.
   No searching needed → O(1).
```

### Complexity

| Approach | push | pop |
|---|---|---|
| Heap of (freq, pushTime, val) | O(log n) | O(log n) |
| **freq map + group stacks** | **O(1)** | **O(1)** ✅ |

### 📌 Points to remember
- A value appears in **several** groups at once. That's intended, not a bug.
- Tie-breaking "closest to the top" comes for free from stack order inside each group.
- Decrement `maxF` only when `group[maxF]` becomes empty.

---

## 7. Master Cheat Sheet

### All 6 problems at a glance

```
┌──────────────────────────────┬──────────────────────────────────────────────┬──────────────────────┐
│ Problem                      │ Core idea                                    │ Key complexity       │
├──────────────────────────────┼──────────────────────────────────────────────┼──────────────────────┤
│ Queue using Stacks           │ in/out stacks, pour only when out is empty   │ amortized O(1)       │
│ Stack using Queues           │ enqueue, then rotate size−1 times            │ push O(n), pop O(1)  │
│ Min Stack                    │ store (val, minSoFar) per entry              │ all O(1)             │
│ Stack with Increment         │ lazy inc[] at index k−1, pass down on pop    │ all O(1)             │
│ Max Stack                    │ A: buffer dig-out  B: DLL + sorted map       │ A popMax O(n)        │
│                              │ C: lazy heap                                 │ B/C O(log n)         │
│ Maximum Frequency Stack      │ freq map + stack per frequency + maxF        │ all O(1)             │
└──────────────────────────────┴──────────────────────────────────────────────┴──────────────────────┘
```

### Pattern family tree

```
                          STACK-BASED DESIGN
                                 │
       ┌─────────────────────────┼─────────────────────────┐
       │                         │                         │
 CONTAINER CONVERSION      AUGMENTED ENTRIES         INDEX + MAP
 (fake one with another)   (snapshot / lazy tag)     (remove from middle,
       │                         │                    group by key)
 ├─ Queue using Stacks     ├─ Min Stack                   │
 └─ Stack using Queues     ├─ Max Stack (peekMax)    ├─ Max Stack (popMax)
                           └─ Increment Stack        └─ Max Frequency Stack
```

### Which trick do I need?

```
   ┌──────────────────────────────────────┬────────────────────────────────────┐
   │ The hard operation...                │ Try                                │
   ├──────────────────────────────────────┼────────────────────────────────────┤
   │ asks about ALL elements (min, max)   │ snapshot per entry                 │
   │ updates MANY elements at once        │ lazy tag, push it down on pop      │
   │ removes from the MIDDLE              │ DLL + map of nodes, or lazy delete │
   │ picks by a COUNT (most frequent)     │ map count → stack, track the max   │
   │ needs the opposite order             │ two containers / rotation          │
   └──────────────────────────────────────┴────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Can I store the answer at push time? (stack only changes at the top)
  ☐ Can I delay work until it is forced? (amortized O(1))
  ☐ Is a range update really "add to everything below index i"? → one lazy tag
  ☐ Do I need to delete from the middle? → linked list + map, or lazy deletion
  ☐ Is there a tie-break by recency? → let a stack's order handle it for free
```

### 🚩 Common bugs to avoid

```
  ✗ Queue using Stacks: pouring in → out while out is NOT empty (breaks order)
  ✗ Queue using Stacks: empty() checking only one stack
  ✗ Stack using Queues: rotating size times instead of size − 1
  ✗ Min Stack (two-stack): using < instead of ≤ for the min stack (duplicates)
  ✗ Increment Stack: forgetting inc[i] = 0 after pop; not passing inc down
  ✗ Max Stack: popMax removing the BOTTOM-most max instead of top-most
  ✗ Max Stack A: re-pushing buffer items without rebuilding maxSt snapshots
  ✗ Freq Stack: removing x from lower groups on push (it must stay there)
  ✗ Freq Stack: lowering maxF on every pop instead of only when the group empties
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "What extra information, saved at the right moment, makes   ║
   ║   the hard operation as cheap as reading the top?"           ║
   ╚══════════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Implement Queue using Stacks (Easy)
- [ ] Implement Stack using Queues (Easy)
- [ ] Min Stack (Medium)
- [ ] Design Stack with Increment Operation (Medium)
- [ ] Max Stack (Medium)
- [ ] Maximum Frequency Stack (Hard)
