# Linked List with Stack / HashMap: A Visual Guide

> **Goal:** Learn what to do when a singly linked list "only goes forward" but the problem needs you to look **backward**, look **ahead**, or **jump** to a random node.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Related: [../stack/01-Monotonic-Stack.md](../stack/01-Monotonic-Stack.md) (next-greater idea) and [../stack/05-Stack-Based-Design.md](../stack/05-Stack-Based-Design.md).

---

## Table of Contents

0. [The Big Idea: Helping a One-Way List](#0-the-big-idea-helping-a-one-way-list)
1. [Add Two Numbers (Medium)](#1-add-two-numbers-medium)
2. [Add Two Numbers II (Medium)](#2-add-two-numbers-ii-medium)
3. [Next Greater Node in Linked List (Medium)](#3-next-greater-node-in-linked-list-medium)
4. [Remove Nodes From Linked List (Medium)](#4-remove-nodes-from-linked-list-medium)
5. [Copy List with Random Pointer (Medium)](#5-copy-list-with-random-pointer-medium)
6. [Master Cheat Sheet](#6-master-cheat-sheet)

> **Suggested order:** Add Two Numbers → Add Two Numbers II → Next Greater Node → Remove Nodes → Copy List with Random Pointer.
> Each one adds one new helper: carry → stack for backward walk → monotonic stack → "delete smaller ones on the left" → hash map / interleaving for cloning.

---

## 0. The Big Idea: Helping a One-Way List

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS FOR "LINKED LIST + STACK / HASHMAP"                 │
├──────────────────────────────────────────────────────────────────┤
│  • Numbers stored digit by digit in nodes → ADD them (carry)     │
│  • Digits stored MOST significant first → need to go BACKWARD    │
│  • "Next greater / smaller node" → monotonic stack               │
│  • "Remove nodes that have a bigger node to the right"           │
│  • "Deep copy" a list with extra pointers (random, child)        │
│    → map old node → new node                                     │
└──────────────────────────────────────────────────────────────────┘
```

### The core problem: you can only walk forward

```
   head
    │
    ▼
  ┌───┐    ┌───┐    ┌───┐    ┌───┐
  │ 7 │───►│ 2 │───►│ 4 │───►│ 3 │───► null
  └───┘    └───┘    └───┘    └───┘

  From 4 you can reach 3.  From 4 you can NOT get back to 2.
  There is no "prev" pointer.
```

### Three ways to go backward

```
 ┌─────────────────────┬──────────────────────────────────┬─────────────┐
 │ Fix                 │ Picture                          │ Extra space │
 ├─────────────────────┼──────────────────────────────────┼─────────────┤
 │ 1. STACK            │ push every node while walking,   │ O(n)        │
 │                     │ then pop = walk backward         │             │
 │                     │   push 7,2,4,3 → pop 3,4,2,7     │             │
 ├─────────────────────┼──────────────────────────────────┼─────────────┤
 │ 2. REVERSE the list │ 7→2→4→3  becomes  3→4→2→7        │ O(1)        │
 │                     │ (reverse back later if needed)   │             │
 ├─────────────────────┼──────────────────────────────────┼─────────────┤
 │ 3. RECURSION        │ recurse to the end first, do the │ O(n) call   │
 │                     │ work while returning             │ stack       │
 └─────────────────────┴──────────────────────────────────┴─────────────┘

   Recursion IS a stack: the call stack holds the nodes for you.
```

### The hash map trick for cloning

```
   Original:   A ───► B ───► C
               ╰──random──────╯     (A.random = C)

   Map:   ┌──────┬──────┐
          │ old  │ new  │
          ├──────┼──────┤
          │  A   │  A'  │      "Given any old node, where is its copy?"
          │  B   │  B'  │      → A'.random = map[A.random] = map[C] = C'
          │  C   │  C'  │
          └──────┴──────┘
```

### The dummy head (used in almost every problem here)

```
   Building a new list? Start with a fake node so "first node" is not a special case.

     dummy ──► (nothing yet)
       ▲
      tail

   append 7:   dummy ──► 7          tail moves to 7
   append 0:   dummy ──► 7 ──► 0    tail moves to 0
   answer = dummy.next
```

---

## 1. Add Two Numbers (Medium)

### Problem
Two non-empty lists hold non-negative numbers with digits in **reverse order** (ones digit first). Return their sum as a list in the same reverse order.

### Visualize it

```
   l1:  2 ──► 4 ──► 3          means 342
   l2:  5 ──► 6 ──► 4          means 465
                               ─────────
                                     807
   answer: 7 ──► 0 ──► 8       (reverse order again)
```

### Why reverse order is a gift

```
   Normal column addition starts from the ONES digit (right side).
   The list already starts with the ones digit (left side).

        3  4  2           list order:   2   4   3
      + 4  6  5                       + 5   6   4
      ─────────                       ──────────
        8  0  7                         7   0   8
                                        ──► walk forward = add right to left
```

### The decision at every step

```
     digit1 (or 0 if l1 ran out)
   + digit2 (or 0 if l2 ran out)
   + carry  (0 or 1)
   ───────────────────────
     total
        │
        ├── new node value = total % 10
        └── new carry      = total / 10   (integer division)

   Keep going while  l1 OR l2 OR carry  is not finished.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `carry` (0 or 1), pointers `p1`, `p2`, `tail` of the result |
| Transition | `total = d1 + d2 + carry`; append `total % 10`; `carry = total / 10` |
| Base | `carry = 0`, result starts as a dummy node |
| Order | walk both lists forward together |
| Answer | `dummy.next` |

### Trace 1: [2,4,3] + [5,6,4]

```
  step │ d1 │ d2 │ carry in │ total │ node │ carry out
  ─────┼────┼────┼──────────┼───────┼──────┼──────────
    1  │ 2  │ 5  │    0     │   7   │  7   │    0
    2  │ 4  │ 6  │    0     │  10   │  0   │    1
    3  │ 3  │ 4  │    1     │   8   │  8   │    0
  ─────┴────┴────┴──────────┴───────┴──────┴──────────
  result: 7 ──► 0 ──► 8   ✅  (342 + 465 = 807)
```

### Trace 2: different lengths and a final carry

```
  l1 = [9,9,9,9,9,9,9]   (9,999,999)
  l2 = [9,9,9,9]         (9,999)

  step │ d1 │ d2 │ carry in │ total │ node │ carry out
  ─────┼────┼────┼──────────┼───────┼──────┼──────────
    1  │ 9  │ 9  │    0     │  18   │  8   │    1
    2  │ 9  │ 9  │    1     │  19   │  9   │    1
    3  │ 9  │ 9  │    1     │  19   │  9   │    1
    4  │ 9  │ 9  │    1     │  19   │  9   │    1
    5  │ 9  │ -  │    1     │  10   │  0   │    1    ← l2 ran out: use 0
    6  │ 9  │ -  │    1     │  10   │  0   │    1
    7  │ 9  │ -  │    1     │  10   │  0   │    1
    8  │ -  │ -  │    1     │   1   │  1   │    0    ← only the carry is left!
  ─────┴────┴────┴──────────┴───────┴──────┴──────────
  result: [8,9,9,9,0,0,0,1]  ✅   (9,999,999 + 9,999 = 10,009,998)
```

### Pseudocode

```
function addTwoNumbers(l1, l2):
    dummy ← new Node(0)
    tail  ← dummy
    carry ← 0
    while l1 ≠ null or l2 ≠ null or carry ≠ 0:
        d1 ← (l1 ≠ null) ? l1.val : 0
        d2 ← (l2 ≠ null) ? l2.val : 0
        total ← d1 + d2 + carry
        carry ← total / 10
        tail.next ← new Node(total % 10)
        tail ← tail.next
        if l1 ≠ null: l1 ← l1.next
        if l2 ≠ null: l2 ← l2.next
    return dummy.next
```

### Complexity

| | Value |
|---|---|
| Time | O(max(m, n)) |
| Space | O(max(m, n)) for the answer, O(1) extra |

### 📌 Points to remember
- Put `carry ≠ 0` in the **loop condition**, or you lose the final `1` (Trace 2).
- Treat a finished list as digit **0**. No separate "copy the rest" loop needed.
- Never convert to an integer: the numbers can have 100 digits and overflow.

---

## 2. Add Two Numbers II (Medium)

### Problem
Same as above, but digits are stored **most significant first**. Return the sum in the same order.

### Visualize it

```
   l1:  7 ──► 2 ──► 4 ──► 3          means 7243
   l2:        5 ──► 6 ──► 4          means  564
                                     ──────────
                                          7807
   answer: 7 ──► 8 ──► 0 ──► 7
```

### The problem: the ones digit is at the END

```
   Addition must start from the ones digit (3 and 4),
   but the list starts from the thousands digit (7).
   We need to walk BACKWARD → use a STACK.

   push all of l1:        push all of l2:
     │ 3 │ ← top            │ 4 │ ← top
     │ 4 │                  │ 6 │
     │ 2 │                  │ 5 │
     │ 7 │                  └───┘
     └───┘
   Popping now gives digits from the ones place upward. ✓
```

### Second problem: the answer is built backward too

```
   We produce digits in the order 7, 0, 8, 7 (ones first)
   but the answer list must read 7 → 8 → 0 → 7.

   → INSERT EACH NEW NODE AT THE HEAD:

     produce 7:   7
     produce 0:   0 ──► 7
     produce 8:   8 ──► 0 ──► 7
     produce 7:   7 ──► 8 ──► 0 ──► 7     ✓ correct order, no reversing needed
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stacks `s1`, `s2`; `carry`; `head` of the result |
| Transition | pop digits (0 if empty), `total = d1 + d2 + carry`, new node with `total % 10` goes in **front** of `head` |
| Base | `carry = 0`, `head = null` |
| Order | pop until both stacks are empty and carry is 0 |
| Answer | `head` |

### Trace: [7,2,4,3] + [5,6,4]

```
  s1 (top on right): [7,2,4,3]      s2: [5,6,4]

  step │ pop s1 │ pop s2 │ carry in │ total │ digit │ carry out │ result list
  ─────┼────────┼────────┼──────────┼───────┼───────┼───────────┼──────────────
    1  │   3    │   4    │    0     │   7   │   7   │     0     │ 7
    2  │   4    │   6    │    0     │  10   │   0   │     1     │ 0→7
    3  │   2    │   5    │    1     │   8   │   8   │     0     │ 8→0→7
    4  │   7    │  (0)   │    0     │   7   │   7   │     0     │ 7→8→0→7
  ─────┴────────┴────────┴──────────┴───────┴───────┴───────────┴──────────────
  result: 7 ──► 8 ──► 0 ──► 7   ✅   (7243 + 564 = 7807)
```

### Pseudocode

```
function addTwoNumbersII(l1, l2):
    s1 ← empty stack;  s2 ← empty stack
    for each node in l1: push node.val to s1
    for each node in l2: push node.val to s2

    head  ← null
    carry ← 0
    while s1 not empty or s2 not empty or carry ≠ 0:
        d1 ← s1 not empty ? pop(s1) : 0
        d2 ← s2 not empty ? pop(s2) : 0
        total ← d1 + d2 + carry
        carry ← total / 10
        node ← new Node(total % 10)
        node.next ← head          // insert at the front
        head ← node
    return head
```

### Alternative: reverse both lists

```
   reverse l1, reverse l2  →  now it is problem 1  →  reverse the answer
   O(1) extra space, but it changes the input (unless you reverse back).
   The follow-up "do not modify the input lists" → use stacks.
```

### Complexity

| Approach | Time | Extra space |
|---|---|---|
| **Two stacks + head insertion** | O(m + n) | O(m + n) |
| Reverse, add, reverse | O(m + n) | O(1) (modifies input) |

### 📌 Points to remember
- Most significant first → **stack** (or reverse) to reach the ones digit.
- Build by **head insertion** so the answer comes out in the right order.
- Same three loop conditions as problem 1: `s1`, `s2`, **or carry**.

---

## 3. Next Greater Node in Linked List (Medium)

### Problem
For each node, find the value of the first node **after it** that is strictly larger. Use 0 if none. Return an array.

### Visualize it

```
   2 ──► 7 ──► 4 ──► 3 ──► 5

   2: next bigger is 7
   7: nothing bigger after it → 0
   4: next bigger is 5
   3: next bigger is 5
   5: nothing after → 0

   answer: [7, 0, 5, 5, 0]
```

### Two steps: array, then monotonic stack

```
   STEP 1: copy values into an array (so you can write answer[i]).

   STEP 2: walk left to right with a stack of INDICES still "waiting"
           for their next greater value. The stack values are decreasing.

        new value x arrives
              │
              ▼
     while stack top's value < x:
         pop it → its answer is x       ("x is the bigger one you waited for")
     push x's index (it starts waiting)

   Whoever is still waiting at the end → answer 0.
```

> This is exactly **Next Greater Element** from [../stack/01-Monotonic-Stack.md](../stack/01-Monotonic-Stack.md), applied to a list turned into an array.

### The 5 steps

| Step | Answer |
|------|--------|
| State | `vals[]`, `answer[]` (all 0), stack of waiting indices |
| Transition | pop every waiting index whose value `< vals[i]`, set its answer to `vals[i]`; push `i` |
| Base | empty stack, `answer` filled with 0 |
| Order | left → right |
| Answer | `answer` |

### Trace 1: [2, 1, 5]

```
  i │ val │ action                               │ stack (indices) │ answer
  ──┼─────┼──────────────────────────────────────┼─────────────────┼─────────
  0 │  2  │ push 0                               │ [0]             │ [0,0,0]
  1 │  1  │ 2 < 1? no → push 1                   │ [0,1]           │ [0,0,0]
  2 │  5  │ pop 1 (1<5) ans[1]=5                 │ [0]             │ [0,5,0]
    │     │ pop 0 (2<5) ans[0]=5                 │ []              │ [5,5,0]
    │     │ push 2                               │ [2]             │
  ──┴─────┴──────────────────────────────────────┴─────────────────┴─────────
  index 2 still waiting → stays 0.     answer = [5, 5, 0] ✅
```

### Trace 2: [2, 7, 4, 3, 5]

```
  i │ val │ action                               │ stack (indices) │ answer
  ──┼─────┼──────────────────────────────────────┼─────────────────┼─────────────
  0 │  2  │ push 0                               │ [0]             │ [0,0,0,0,0]
  1 │  7  │ pop 0 (2<7) ans[0]=7; push 1         │ [1]             │ [7,0,0,0,0]
  2 │  4  │ 7<4? no → push 2                     │ [1,2]           │ [7,0,0,0,0]
  3 │  3  │ 4<3? no → push 3                     │ [1,2,3]         │ [7,0,0,0,0]
  4 │  5  │ pop 3 (3<5) ans[3]=5                 │ [1,2]           │ [7,0,0,5,0]
    │     │ pop 2 (4<5) ans[2]=5                 │ [1]             │ [7,0,5,5,0]
    │     │ 7<5? no → push 4                     │ [1,4]           │
  ──┴─────┴──────────────────────────────────────┴─────────────────┴─────────────
  answer = [7, 0, 5, 5, 0] ✅

  Stack values stay decreasing from bottom to top:  7 > 5
```

### Pseudocode

```
function nextLargerNodes(head):
    vals ← empty list
    for each node from head: append node.val to vals
    n ← length(vals)
    answer ← array of n zeros
    stack ← empty stack                 // indices
    for i from 0 to n−1:
        while stack not empty and vals[top(stack)] < vals[i]:
            answer[pop(stack)] ← vals[i]
        push i to stack
    return answer
```

### Complexity

| | Value |
|---|---|
| Time | O(n): each index is pushed once and popped at most once |
| Space | O(n) for `vals`, `answer`, and the stack |

### 📌 Points to remember
- Strictly greater → pop while `top < x` (not `≤`). Equal values keep waiting.
- Store **indices** in the stack, so you know where to write the answer.
- You can skip the `vals` array by storing (index, value) pairs and growing `answer` as you walk.

---

## 4. Remove Nodes From Linked List (Medium)

### Problem
Remove every node that has a node with a **strictly greater** value anywhere to its right. Return the new head.

### Visualize it

```
   5 ──► 2 ──► 13 ──► 3 ──► 8

   5:  13 is to its right and bigger → REMOVE
   2:  13 is bigger                  → REMOVE
   13: nothing bigger to the right   → keep
   3:  8 is bigger                   → REMOVE
   8:  last node                     → keep

   answer: 13 ──► 8
```

### What survives?

```
   A node survives  ⇔  it is ≥ every node to its right.
   So the survivors form a NON-INCREASING sequence (read left to right).

     13 ≥ 8 ✓         and   1 ≥ 1 ≥ 1 ≥ 1 ✓ (equal is fine)
```

### Way A: monotonic stack (left to right)

```
   Keep a stack of survivors so far (non-increasing).
   When a new value arrives, it KILLS every smaller survivor on its left.

     new x arrives
        │
     while stack top < x:  pop      ← those had a bigger node (x) to the right
     push x

   At the end, the stack (bottom → top) is the answer list.
```

### Trace A: [5, 2, 13, 3, 8]

```
  x  │ action                     │ stack (bottom → top)
  ───┼────────────────────────────┼─────────────────────
  5  │ push                       │ [5]
  2  │ 5<2? no → push             │ [5, 2]
  13 │ pop 2, pop 5 → push        │ [13]
  3  │ 13<3? no → push            │ [13, 3]
  8  │ pop 3 → 13<8? no → push    │ [13, 8]
  ───┴────────────────────────────┴─────────────────────
  link the stack: 13 ──► 8  ✅
```

### Edge case: [1, 1, 1, 1]

```
  Pop condition is STRICTLY less (top < x). 1 < 1 is false → nothing is popped.
  stack: [1,1,1,1]  →  answer 1 ──► 1 ──► 1 ──► 1  ✅
```

### Way B: reverse, keep a running max, reverse back (O(1) space)

```
   reversed:  8 ──► 3 ──► 13 ──► 2 ──► 5
   Walk it, keeping the biggest value seen so far ("max").
   Keep a node only if node.val ≥ max.

   node │ max before │ keep? │ max after │ kept so far
   ─────┼────────────┼───────┼───────────┼────────────
    8   │     -∞     │  yes  │     8     │ 8
    3   │      8     │  no   │     8     │ 8
    13  │      8     │  yes  │    13     │ 8 → 13
    2   │     13     │  no   │    13     │ 8 → 13
    5   │     13     │  no   │    13     │ 8 → 13
   ─────┴────────────┴───────┴───────────┴────────────
   reverse back:  13 ──► 8  ✅
```

> **Why reverse?** "Bigger node to the RIGHT" means looking backward. Reversing turns "right" into "already seen", and a single running max answers it.

### Way C: recursion (the call stack does the backward walk)

```
   removeNodes(node):
       clean the REST first, then decide about node.

   The cleaned rest starts with the biggest value of the rest.
   If that head is bigger than node → node dies, return the rest.
   Else → keep node in front of the rest.

   returning from the end:
     8            → [8]
     3   rest=[8]     8 > 3  → drop 3   → [8]
     13  rest=[8]     8 > 13? no → keep → [13,8]
     2   rest=[13,8]  13 > 2 → drop     → [13,8]
     5   rest=[13,8]  13 > 5 → drop     → [13,8]   ✅
```

### Pseudocode (Way A: stack)

```
function removeNodes(head):
    stack ← empty stack                     // of nodes
    node ← head
    while node ≠ null:
        while stack not empty and top(stack).val < node.val:
            pop(stack)
        push node to stack
        node ← node.next

    // re-link the survivors in stack order
    dummy ← new Node(0);  tail ← dummy
    for each s in stack from bottom to top:
        tail.next ← s;  tail ← s
    tail.next ← null
    return dummy.next
```

### Pseudocode (Way C: recursion)

```
function removeNodes(node):
    if node == null: return null
    rest ← removeNodes(node.next)
    if rest ≠ null and rest.val > node.val:
        return rest              // node has a bigger one on its right
    node.next ← rest
    return node
```

### Complexity

| Approach | Time | Extra space |
|---|---|---|
| Monotonic stack | O(n) | O(n) |
| **Reverse + running max + reverse** | O(n) | **O(1)** |
| Recursion | O(n) | O(n) call stack (can overflow for 10⁵ nodes) |

### 📌 Points to remember
- Survivors are **non-increasing**. That is the shape every method builds.
- Use **strict** comparison: equal values survive.
- Remember `tail.next ← null` after re-linking, or the old links remain.
- Same idea as "Leaders in an array" and Remove K Digits in [../stack/06-Stack-plus-Greedy.md](../stack/06-Stack-plus-Greedy.md).

---

## 5. Copy List with Random Pointer (Medium)

### Problem
Each node has `next` and `random` (any node or null). Return a **deep copy**: brand-new nodes, where no pointer in the copy points into the original list.

### Visualize it (LeetCode example)

```
   input: [[7,null],[13,0],[11,4],[10,2],[1,0]]
          [value, index that random points to]

   index:    0        1        2        3        4
           ┌───┐    ┌────┐   ┌────┐   ┌────┐   ┌───┐
   next:   │ 7 │───►│ 13 │──►│ 11 │──►│ 10 │──►│ 1 │──► null
           └───┘    └────┘   └────┘   └────┘   └───┘
   random:  null     → 7      → 1      → 11     → 7
```

### Why it is tricky

```
   Copying `next` is easy: walk and create.
   But when you create 13' you must set 13'.random = 7'.
   And 11'.random must be 1', which you have NOT created yet!

   → You need a way to answer "where is the copy of node X?"
```

### Way A: hash map (two passes)

```
   PASS 1: create a copy of every node, remember old → new.

        map:  7 → 7'    13 → 13'    11 → 11'    10 → 10'    1 → 1'
        (copies exist but are not linked yet)

   PASS 2: for every old node X:
        X'.next   = map[X.next]
        X'.random = map[X.random]          (map[null] = null)
```

### Trace A: pass 2

```
  X  │ X.next │ X'.next = map[...] │ X.random │ X'.random = map[...]
  ───┼────────┼────────────────────┼──────────┼─────────────────────
  7  │ 13     │ 13'                │ null     │ null
  13 │ 11     │ 11'                │ 7        │ 7'
  11 │ 10     │ 10'                │ 1        │ 1'
  10 │ 1      │ 1'                 │ 11       │ 11'
  1  │ null   │ null               │ 7        │ 7'
  ───┴────────┴────────────────────┴──────────┴─────────────────────
  copy: 7' → 13' → 11' → 10' → 1'  with randoms null, 7', 1', 11', 7'  ✅
```

### Pseudocode (hash map)

```
function copyRandomList(head):
    if head == null: return null
    map ← empty hash map
    node ← head
    while node ≠ null:                       // pass 1
        map[node] ← new Node(node.val)
        node ← node.next
    node ← head
    while node ≠ null:                       // pass 2
        map[node].next   ← (node.next   ≠ null) ? map[node.next]   : null
        map[node].random ← (node.random ≠ null) ? map[node.random] : null
        node ← node.next
    return map[head]
```

---

### 🚀 Way B: O(1) extra space by interleaving (three passes)

**Idea:** instead of a map, put each copy **right after its original**.
Then "the copy of X" is simply `X.next`.

#### Pass 1: weave copies in

```
   before:  7 ──► 13 ──► 11 ──► 10 ──► 1 ──► null

   after:   7 ──► 7' ──► 13 ──► 13' ──► 11 ──► 11' ──► 10 ──► 10' ──► 1 ──► 1' ──► null
            ▲     ▲
          orig   its copy (always the very next node)
```

#### Pass 2: set the random pointers

```
   For every original X:     X'.random = X.random.next    (if X.random ≠ null)
                                          ▲         ▲
                                  original target   its copy sits right after it

  X  │ X.random │ X.random.next │ so X'.random =
  ───┼──────────┼───────────────┼───────────────
  7  │ null     │ -             │ null
  13 │ 7        │ 7'            │ 7'
  11 │ 1        │ 1'            │ 1'
  10 │ 11       │ 11'           │ 11'
  1  │ 7        │ 7'            │ 7'
```

#### Pass 3: unweave into two lists

```
   7 ──► 7' ──► 13 ──► 13' ──► 11 ──► 11' ──► 10 ──► 10' ──► 1 ──► 1'
   │     │      │      │
   │     └──────┼──────┴──► copies:    7' ──► 13' ──► 11' ──► 10' ──► 1' ──► null
   └────────────┴─────────► originals: 7  ──► 13  ──► 11  ──► 10  ──► 1  ──► null

   For each original X (with copy X' = X.next):
       X.next  ← X'.next                      (skip over the copy)
       X'.next ← (X'.next ≠ null) ? X'.next.next : null
```

> ⚠️ Set **all** randoms (pass 2) before you unweave (pass 3).
> If you unweave first, `X.random.next` no longer points to the copy.

### Pseudocode (interleaving)

```
function copyRandomList(head):
    if head == null: return null

    // pass 1: weave
    node ← head
    while node ≠ null:
        copy ← new Node(node.val)
        copy.next ← node.next
        node.next ← copy
        node ← copy.next

    // pass 2: randoms
    node ← head
    while node ≠ null:
        if node.random ≠ null:
            node.next.random ← node.random.next
        node ← node.next.next

    // pass 3: unweave
    newHead ← head.next
    node ← head
    while node ≠ null:
        copy ← node.next
        node.next ← copy.next
        copy.next ← (copy.next ≠ null) ? copy.next.next : null
        node ← node.next
    return newHead
```

### Complexity

| Approach | Time | Extra space |
|---|---|---|
| Hash map | O(n) | O(n) map |
| **Interleaving** | O(n) | **O(1)** (besides the copy itself) |

### 📌 Points to remember
- The whole problem is "**where is the copy of X?**". A map answers it, or placing the copy at `X.next` answers it.
- `random` can be **null** and can point **backward**, **forward**, or to **itself**.
- Restore the original list in pass 3. Judges check that the input is unchanged.
- Same map idea: Clone Graph in [../graph/01-DFS-Connectivity.md](../graph/01-DFS-Connectivity.md).

---

## 6. Master Cheat Sheet

### All 5 problems at a glance

```
┌──────────────────────────────┬────────────────────────────────────────────┬──────────────┬─────────────┐
│ Problem                      │ Core idea                                  │ Time         │ Extra space │
├──────────────────────────────┼────────────────────────────────────────────┼──────────────┼─────────────┤
│ Add Two Numbers              │ walk together; total%10, carry=total/10    │ O(max(m,n))  │ O(1)        │
│ Add Two Numbers II           │ two stacks + insert result at head         │ O(m+n)       │ O(m+n)      │
│ Next Greater Node            │ array + decreasing stack of indices        │ O(n)         │ O(n)        │
│ Remove Nodes From List       │ keep non-increasing survivors (stack /     │ O(n)         │ O(1)–O(n)   │
│                              │ reverse+max / recursion)                   │              │             │
│ Copy List w/ Random Pointer  │ map old→new, or weave copy after original  │ O(n)         │ O(n) / O(1) │
└──────────────────────────────┴────────────────────────────────────────────┴──────────────┴─────────────┘
```

### Pattern family tree

```
                   LINKED LIST + HELPER STRUCTURE
                               │
      ┌────────────────────────┼─────────────────────────┐
      │                        │                         │
  CARRY ARITHMETIC       LOOK BACKWARD / AHEAD       CLONE WITH EXTRA
  (walk digits)          (stack / reverse / rec.)    POINTERS (map)
      │                        │                         │
  ├ Add Two Numbers      ├ Add Two Numbers II        └ Copy List with
  └ Add Two Numbers II   ├ Next Greater Node            Random Pointer
                         └ Remove Nodes
```

### "Which helper?" card

```
  Need to...                               Use
  ───────────────────────────────────────  ─────────────────────────────────
  process from the END backward            stack  (or reverse, or recursion)
  build an answer in reverse order         insert at the HEAD
  find next bigger to the right            monotonic DECREASING stack
  drop nodes beaten by someone on right    keep a non-increasing stack
  find "the copy of X"                     hash map  (or X.next when woven)
  avoid special-casing the first node      dummy head
```

### Optimization checklist

```
  ☐ Stack uses O(n)? Can I reverse the list instead (O(1))?
  ☐ Am I allowed to modify the input? If not, reverse back or use a stack.
  ☐ Recursion on 10⁵ nodes? Risk of stack overflow → use iteration.
  ☐ Hash map for cloning? Interleaving gives O(1) extra space.
  ☐ Do I really need the values array? Store (index, value) in the stack.
```

### 🚩 Common bugs to avoid

```
  ✗ Add Two Numbers: forgetting `or carry ≠ 0` → final 1 is lost
  ✗ Add Two Numbers II: appending at the tail → answer comes out reversed
  ✗ Converting the list to an int → overflow on long numbers
  ✗ Next Greater: using ≤ instead of < (equal is NOT greater)
  ✗ Remove Nodes: popping equal values (they must survive)
  ✗ Remove Nodes: forgetting tail.next = null after re-linking
  ✗ Random copy: unweaving before all randoms are set
  ✗ Random copy: not restoring the original list
  ✗ Random copy: crashing on random == null
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "The list only goes forward. What do I need that it     ║
   ║   can't give me: the past, the future, or a shortcut?"   ║
   ╚══════════════════════════════════════════════════════════╝
     The past → stack / reverse.  The future → monotonic stack.
     A shortcut to any node → hash map.
```

---

### ✅ Progress tracker

- [ ] Add Two Numbers (Medium)
- [ ] Add Two Numbers II (Medium)
- [ ] Next Greater Node in Linked List (Medium)
- [ ] Remove Nodes From Linked List (Medium)
- [ ] Copy List with Random Pointer (Medium)
