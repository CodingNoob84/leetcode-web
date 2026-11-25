# Queue Simulation / FIFO Processing: A Visual Guide

> **Goal:** Learn to *see* "line of people" problems, simulate them with a queue by hand,
> and then replace the simulation with a math shortcut.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is Queue Simulation?](#0-the-big-idea-what-is-queue-simulation)
1. [Time Needed to Buy Tickets (Easy)](#1-time-needed-to-buy-tickets-easy)
2. [Find the Winner of the Circular Game (Medium)](#2-find-the-winner-of-the-circular-game-medium)
3. [Josephus Problem (Easy)](#3-josephus-problem-easy)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Tickets → Circular Game → Josephus.
> Tickets teaches "send to the back". The Circular Game adds "remove every k-th".
> Josephus is **the same problem as the Circular Game**, solved with a formula instead of a queue.

---

## 0. The Big Idea: What Is Queue Simulation?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "QUEUE SIMULATION"                      │
├──────────────────────────────────────────────────────────────────┤
│  • People / items stand in a LINE or a CIRCLE                    │
│  • Process them in ARRIVAL ORDER (first in, first out)           │
│  • Each step: the front one is either FINISHED or goes to BACK   │
│  • "Every k-th person is removed", "who is left at the end?"     │
│  • "How long until person k is done?"                            │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: one move, two outcomes

```
            front                              rear
              ▼                                  ▼
            ┌─────┬─────┬─────┬─────┬─────┐
  queue:    │  a  │  b  │  c  │  d  │  e  │
            └─────┴─────┴─────┴─────┴─────┘
              │
              │  take the FRONT element
              ▼
       ┌──────────────┐
       │  process it  │
       └──────┬───────┘
         ┌────┴─────────────────┐
       DONE?                  NOT DONE?
         │                        │
     drop it ✗            send it to the REAR ↻

              ┌─────┬─────┬─────┬─────┬─────┐
              │  b  │  c  │  d  │  e  │  a  │   ← a went to the back
              └─────┴─────┴─────┴─────┴─────┘
```

> 💡 A queue that keeps sending its front to the back **is a circle**.
> That's why "circle of people" problems are queue problems.

```
     A circle of 5 people ...            ... is a queue that rotates

             1                     front → [ 1 | 2 | 3 | 4 | 5 ] ← rear
         5       2
                                   rotate: [ 2 | 3 | 4 | 5 | 1 ]
          4     3                  rotate: [ 3 | 4 | 5 | 1 | 2 ]
```

### The template

```
function simulate(items):
    queue ← all items in order
    while the stop condition is not met:
        x ← queue.popFront()
        process x
        if x is not finished:
            queue.pushBack(x)
    return the answer
```

### Simulation cost vs. math shortcut

```
  ┌──────────────────────────┬──────────────────────┬──────────────────────┐
  │ Problem                  │ Simulate with queue  │ Math shortcut        │
  ├──────────────────────────┼──────────────────────┼──────────────────────┤
  │ Time to Buy Tickets      │ O(n · max(t))        │ O(n)  one formula    │
  │ Circular Game / Josephus │ O(n · k)             │ O(n)  recurrence     │
  └──────────────────────────┴──────────────────────┴──────────────────────┘

  Recipe:  1. SIMULATE first, so you understand the process.
           2. LOOK for a pattern in who survives / when someone finishes.
           3. REPLACE the simulation with the formula.
```

### ⚠️ 0-indexed vs 1-indexed: the #1 bug in this topic

```
  people:          1    2    3    4    5        ← how the problem NAMES them
  array index:     0    1    2    3    4        ← how you STORE them

  • LeetCode Tickets uses 0-indexed k.
  • LeetCode Circular Game numbers friends 1..n.
  • GFG Josephus returns a 1-indexed position.
  • The Josephus formula works in 0-indexed, so add 1 at the end.
```

---

## 1. Time Needed to Buy Tickets (Easy)

### Problem
`tickets[i]` = how many tickets person `i` wants. Each person buys **one ticket per second**,
then goes to the **back of the line** if they still need more. A person who is done leaves.
How many seconds until person `k` (0-indexed) **finishes**?

### Visualize it

```
  tickets = [2, 3, 2],  k = 2

    person:    P0    P1    P2 ★     ★ = the person we care about
    wants:      2     3     2
```

### Approach 1: Simulate with a queue

Store `(index, remaining)` pairs. Each second: pop the front, buy one ticket, push back if not done.

### Trace (tickets = [2, 3, 2], k = 2)

```
  time │ front buys      │ queue AFTER this second              │ note
  ─────┼─────────────────┼──────────────────────────────────────┼─────────────
   0   │  —              │ [ P0:2 | P1:3 | P2:2 ]               │ start
   1   │ P0: 2 → 1       │ [ P1:3 | P2:2 | P0:1 ]               │ P0 to back
   2   │ P1: 3 → 2       │ [ P2:2 | P0:1 | P1:2 ]               │ P1 to back
   3   │ P2: 2 → 1       │ [ P0:1 | P1:2 | P2:1 ]               │ P2 to back
   4   │ P0: 1 → 0  ✗    │ [ P1:2 | P2:1 ]                      │ P0 leaves
   5   │ P1: 2 → 1       │ [ P2:1 | P1:1 ]                      │ P1 to back
   6   │ P2: 1 → 0  ★    │ [ P1:1 ]                             │ P2 DONE → 6 ✅
```

### Pseudocode (simulation)

```
function timeRequiredToBuy(tickets, k):
    queue ← [(i, tickets[i]) for each i]
    time  ← 0
    loop:
        (i, left) ← queue.popFront()
        left ← left − 1
        time ← time + 1
        if left == 0:
            if i == k: return time
            // person leaves the line
        else:
            queue.pushBack((i, left))
```

Cost: up to `sum(tickets)` steps → **O(n · max(t))**.

---

### 🚀 Approach 2: Count each person's purchases directly (O(n))

Ask: **"How many tickets does each person buy before P_k finishes?"**

```
  Person k buys tickets in rounds 1, 2, ..., t[k].
  P_k finishes during ROUND t[k].

            ┌──────────── round 1 ────────────┬──── round 2 ──── ...
  line:      P0  P1  ...  Pk  ...  P(n-1)      P0  P1 ... Pk ★ STOP

  • Someone BEFORE or AT k (i ≤ k):
      stands ahead of P_k in every round, including the last one
      → buys in up to t[k] rounds        → contributes  min(t[i], t[k])

  • Someone AFTER k (i > k):
      in the final round, P_k finishes FIRST and the clock stops
      → buys in only t[k] − 1 rounds     → contributes  min(t[i], t[k] − 1)
```

```
  ┌──────────────────────────────────────────────────────────────────────┐
  │ answer = Σ_{i ≤ k} min(t[i], t[k])  +  Σ_{i > k} min(t[i], t[k] − 1) │
  └──────────────────────────────────────────────────────────────────────┘
```

### Trace (formula)

```
  Example A:  tickets = [2, 3, 2],  k = 2,  t[k] = 2

    i │ t[i] │ i ≤ k? │ contribution
   ───┼──────┼────────┼──────────────────
    0 │  2   │  yes   │ min(2, 2) = 2
    1 │  3   │  yes   │ min(3, 2) = 2
    2 │  2   │  yes   │ min(2, 2) = 2
                        ───────────────
                        total = 6 ✅      (matches the simulation)

  Example B:  tickets = [5, 1, 1, 1],  k = 0,  t[k] = 5

    i │ t[i] │ i ≤ k? │ contribution
   ───┼──────┼────────┼──────────────────
    0 │  5   │  yes   │ min(5, 5) = 5
    1 │  1   │  no    │ min(1, 4) = 1
    2 │  1   │  no    │ min(1, 4) = 1
    3 │  1   │  no    │ min(1, 4) = 1
                        ───────────────
                        total = 8 ✅
```

> Check Example B by simulation: P0 buys (1s), P1, P2, P3 each buy and leave (3s),
> then P0 buys its remaining 4 alone (4s). Total 1 + 3 + 4 = **8** ✓.

### Pseudocode (formula)

```
function timeRequiredToBuy(tickets, k):
    total ← 0
    for i from 0 to n−1:
        if i ≤ k: total ← total + min(tickets[i], tickets[k])
        else:     total ← total + min(tickets[i], tickets[k] − 1)
    return total
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Queue simulation | O(n · max(t)) | O(n) |
| **Per-person formula** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- People **after** k get one round fewer: `t[k] − 1`, because the clock stops the moment P_k finishes.
- `min(...)` handles people who finish early and leave the line.
- `k` is **0-indexed** in the LeetCode version.

---

## 2. Find the Winner of the Circular Game (Medium)

### Problem
`n` friends sit in a circle, numbered `1..n`. Start at friend 1. Count `k` friends
clockwise (including the one you start on). The k-th friend **leaves**.
Restart counting from the friend right after them. The last friend left wins.

### Visualize it (n = 5, k = 2)

```
              1                       count 1, 2 → friend 2 leaves
          5       2  ✗
                                      next count starts at 3
           4     3
```

### Queue version of "count k"

```
  Counting k friends = rotate (k − 1) friends to the back, then remove the front.

     front → [ 1 | 2 | 3 | 4 | 5 ]
     rotate 1 →  [ 2 | 3 | 4 | 5 | 1 ]      ← 1 survives this count, goes to back
     remove 2 →  [ 3 | 4 | 5 | 1 ]          ← counting restarts at 3 automatically ✓
```

> 💡 The queue keeps the "restart from the next friend" rule for free:
> after removing the front, the new front IS the next friend.

### Trace (n = 5, k = 2) → rotate 1, remove 1

```
  round │ rotate (k−1 = 1)           │ remove front │ queue after
  ──────┼────────────────────────────┼──────────────┼──────────────────
    —   │                            │              │ [ 1 | 2 | 3 | 4 | 5 ]
    1   │ 1 → back: [2,3,4,5,1]      │ ✗ 2          │ [ 3 | 4 | 5 | 1 ]
    2   │ 3 → back: [4,5,1,3]        │ ✗ 4          │ [ 5 | 1 | 3 ]
    3   │ 5 → back: [1,3,5]          │ ✗ 1          │ [ 3 | 5 ]
    4   │ 3 → back: [5,3]            │ ✗ 5          │ [ 3 ]

  winner = 3 ✅      (removal order: 2, 4, 1, 5)
```

### Trace (n = 6, k = 5) → rotate 4, remove 1

```
  round │ rotate 4 to the back                  │ remove │ queue after
  ──────┼───────────────────────────────────────┼────────┼──────────────────
    —   │                                       │        │ [1|2|3|4|5|6]
    1   │ 1,2,3,4 → back: [5,6,1,2,3,4]         │ ✗ 5    │ [6|1|2|3|4]
    2   │ 6,1,2,3 → back: [4,6,1,2,3]           │ ✗ 4    │ [6|1|2|3]
    3   │ 6,1,2,3 → back: [6,1,2,3] (full turn) │ ✗ 6    │ [1|2|3]
    4   │ 1,2,3,1 → back: [2,3,1]               │ ✗ 2    │ [3|1]
    5   │ 3,1,3,1 → back: [3,1]                 │ ✗ 3    │ [1]

  winner = 1 ✅      (removal order: 5, 4, 6, 2, 3)
```

> ⚠️ When k > queue size, the rotation wraps all the way around (round 3 and later).
> That's correct, and it's also why simulation costs O(n · k).

### Pseudocode (queue simulation)

```
function findTheWinner(n, k):
    queue ← [1, 2, ..., n]
    while size(queue) > 1:
        repeat (k − 1) times:
            queue.pushBack(queue.popFront())     // survives this count
        queue.popFront()                         // the k-th friend leaves
    return queue.front()
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Queue simulation | O(n · k) | O(n) |
| Array + index jump `(idx + k − 1) % size` | O(n²) (removal shifts) | O(n) |
| **Josephus recurrence** (next section) | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Rotate **k − 1**, then remove **1**. Rotating k is an off-by-one bug.
- Friends are numbered **1..n**, so the answer is 1-indexed.
- This is exactly the **Josephus problem**. Section 3 gives the O(n) solution.

---

## 3. Josephus Problem (Easy)

### Problem
`n` people stand in a circle. Starting from person 1, count `k` people and remove the k-th.
Keep going from the next person until one remains. Return the survivor's **position (1-indexed)**.

> **Convention (GFG):** `josephus(n, k)` returns the 1-indexed safe position.
> Counting starts at person 1, and the person who is counted k-th is removed.

### 🔗 Same problem as "Find the Winner of the Circular Game"

```
   Find the Winner (LC 1823)         Josephus (GFG)
   ──────────────────────────        ──────────────────────────
   n friends, numbered 1..n    ═══   n people, positions 1..n
   count k, k-th leaves        ═══   count k, k-th is removed
   return the winner's number  ═══   return the safe position

   findTheWinner(n, k) == josephus(n, k)      ✓ identical
```

### Simulation (n = 7, k = 3)

```
                1
           7         2            count 1,2,3 from 1   → ✗ 3
                                  count 4,5,6          → ✗ 6
          6           3           count 7,1,2          → ✗ 2
                                  count 4,5,7          → ✗ 7
            5       4             count 1,4,5          → ✗ 5
                                  count 1,4,1          → ✗ 1

   survivor = 4 ✅
```

### The key insight: renumber after each removal

Work in **0-indexed** positions `0..n−1`. Let `J(n)` = survivor's index in a circle of `n`.

```
  Circle of n = 5, k = 2 (0-indexed: 0 1 2 3 4)

  Step 1: the first removed person is index (k − 1) % n = 1.

     old index:   0   [1]   2   3   4
                       ✗

  Step 2: counting restarts at old index 2. RENUMBER so it becomes 0:

     old index:   2   3   4   0
     new index:   0   1   2   3        ← a fresh circle of size n − 1 = 4

  Step 3: in the smaller circle, the survivor is at new index J(4).
          Convert back:  old = (new + k) % n

     J(4) = 0  →  old = (0 + 2) % 5 = 2      ✓
```

```
  ┌────────────────────────────────────────────────────────┐
  │   J(1) = 0                                             │
  │   J(n) = ( J(n − 1) + k ) % n                          │
  │   answer (1-indexed) = J(n) + 1                        │
  └────────────────────────────────────────────────────────┘

  Why "+ k"? Renumbering shifted everyone left by k (the k people we
  counted past). Adding k shifts them back. "% n" wraps around the circle.
```

### Table: n = 1..5, k = 2

```
   n │ J(n) = (J(n−1) + 2) % n │ J(n) │ 1-indexed
  ───┼─────────────────────────┼──────┼──────────
   1 │ base case               │  0   │   1
   2 │ (0 + 2) % 2             │  0   │   1
   3 │ (0 + 2) % 3             │  2   │   3
   4 │ (2 + 2) % 4             │  0   │   1
   5 │ (0 + 2) % 5             │  2   │   3   ✅  (matches Circular Game n=5, k=2)
```

### Table: n = 1..7, k = 3

```
   n │ J(n) = (J(n−1) + 3) % n │ J(n) │ 1-indexed
  ───┼─────────────────────────┼──────┼──────────
   1 │ base case               │  0   │   1
   2 │ (0 + 3) % 2             │  1   │   2
   3 │ (1 + 3) % 3             │  1   │   2
   4 │ (1 + 3) % 4             │  0   │   1
   5 │ (0 + 3) % 5             │  3   │   4
   6 │ (3 + 3) % 6             │  0   │   1
   7 │ (0 + 3) % 7             │  3   │   4   ✅  (matches the simulation)
```

> Bonus check, n = 6, k = 5: J = 0, 1, 0, 1, 1, 0 → survivor 1 ✓ (matches the Circular Game trace).

### Pseudocode (iterative, O(1) space)

```
function josephus(n, k):
    j ← 0                        // J(1) = 0
    for size from 2 to n:
        j ← (j + k) % size
    return j + 1                 // convert to 1-indexed
```

### Recursive form (same math)

```
function J(n, k):
    if n == 1: return 0
    return (J(n − 1, k) + k) % n
```

> The recursive form uses O(n) call-stack space. The loop is safer for large n.

### Bonus: closed form when k = 2

```
  Write n = 2^m + L   with 0 ≤ L < 2^m   (2^m = largest power of 2 ≤ n)

  survivor (1-indexed) = 2L + 1

   n = 5 = 4 + 1  →  2·1 + 1 = 3   ✓
   n = 7 = 4 + 3  →  2·3 + 1 = 7   ✓   (recurrence: J(6)=4, J(7)=6 → 7)
   n = 8 = 8 + 0  →  2·0 + 1 = 1   ✓

  Intuition: in the first lap every even person is removed. When n is a
  power of 2, each lap halves the circle and person 1 always starts the
  next lap, so person 1 survives.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Queue simulation | O(n · k) | O(n) |
| **Recurrence (loop)** | **O(n)** | **O(1)** ✅ |
| Closed form (k = 2 only) | O(1) / O(log n) | O(1) |

### 📌 Points to remember
- The recurrence is **0-indexed**. Add 1 at the end.
- The loop runs `size` from **2** to **n**, and you take `% size`, not `% n`.
- Renumbering is the whole idea: after one removal, it's the same problem with `n − 1` people, shifted by `k`.
- Find the Winner of the Circular Game is this exact problem.

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────────┬──────────────┬───────────┐
│ Problem                  │ Core idea                                │ Shortcut     │ Best      │
├──────────────────────────┼──────────────────────────────────────────┼──────────────┼───────────┤
│ Time to Buy Tickets      │ pop front, buy 1, push back if not done  │ Σ min(t[i],  │ O(n),O(1) │
│                          │                                          │  t[k] or −1) │           │
│ Find the Winner          │ rotate k−1 to back, remove front         │ Josephus     │ O(n),O(1) │
│ Josephus Problem         │ same as above                            │ J(n)=(J+k)%n │ O(n),O(1) │
└──────────────────────────┴──────────────────────────────────────────┴──────────────┴───────────┘
```

### Pattern family tree

```
                       QUEUE SIMULATION (FIFO)
                                 │
            ┌────────────────────┴────────────────────┐
            │                                         │
   "FINISH or SEND TO BACK"               "REMOVE EVERY k-th" (circle)
            │                                         │
   └─ Time to Buy Tickets                 ├─ Find the Winner of the Circular Game
      shortcut: count each person's       └─ Josephus Problem
      purchases with min(...)                shortcut: J(n) = (J(n−1) + k) % n
```

### The two queue moves

```
   SEND TO BACK                         REMOVE
   front → [ a | b | c ]                front → [ a | b | c ]
           popFront a                           popFront a
           pushBack a                           (drop it)
   result: [ b | c | a ]                result: [ b | c ]
```

### Optimization checklist

```
  ☐ Simulated it by hand? Now look for a per-person count     → Tickets formula
  ☐ "Every k-th removed in a circle"?                         → Josephus recurrence
  ☐ k == 2?                                                   → closed form 2L + 1
  ☐ n huge (10^5+) and k huge?                                → never simulate O(n·k)
  ☐ Need the full removal ORDER, not just the survivor?       → simulate (or order-statistic tree)
```

### 🚩 Common bugs to avoid

```
  ✗ Tickets: using t[k] (not t[k] − 1) for people AFTER k
  ✗ Tickets: treating k as 1-indexed
  ✗ Circular Game: rotating k instead of k − 1 before removing
  ✗ Josephus: forgetting "+ 1" when the answer must be 1-indexed
  ✗ Josephus: using "% n" in every step instead of "% size"
  ✗ Josephus: starting the loop at size 1 (J(1) = 0 is already the base)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "When I take the front, does it FINISH or go to the     ║
   ║   BACK, and can I count the result without simulating?"  ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Time Needed to Buy Tickets (Easy)
- [ ] Find the Winner of the Circular Game (Medium)
- [ ] Josephus Problem (Easy)
