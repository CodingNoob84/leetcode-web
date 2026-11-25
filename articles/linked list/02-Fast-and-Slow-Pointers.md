# Fast and Slow Pointers: A Visual Guide

> **Goal:** Learn to *see* two-speed pointer problems, trace them step by step, and know why they work.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Tortoise and Hare](#0-the-big-idea-tortoise-and-hare)
1. [Middle of the Linked List (Easy)](#1-middle-of-the-linked-list-easy)
2. [Linked List Cycle (Easy)](#2-linked-list-cycle-easy)
3. [Linked List Cycle II (Medium)](#3-linked-list-cycle-ii-medium)
4. [Remove Nth Node From End of List (Medium)](#4-remove-nth-node-from-end-of-list-medium)
5. [Find the Duplicate Number (Medium)](#5-find-the-duplicate-number-medium)
6. [Master Cheat Sheet](#6-master-cheat-sheet)

> **Suggested order:** Middle → Cycle → Cycle II → Remove Nth From End → Find the Duplicate.
> Each one adds one new idea: speeds 1 & 2 → meeting in a loop → finding the loop's door
> → fixed gap instead of different speeds → an array secretly being a linked list.

---

## 0. The Big Idea: Tortoise and Hare

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "FAST & SLOW POINTERS"                  │
├──────────────────────────────────────────────────────────────────┤
│  • "Find the MIDDLE" in one pass                                 │
│  • "Does the list have a CYCLE?" / "Where does the cycle start?" │
│  • "k-th / n-th node FROM THE END" in one pass                   │
│  • O(1) extra space required (no hash set, no array copy)        │
│  • An array where value → next index (i → nums[i]) forms a path  │
└──────────────────────────────────────────────────────────────────┘
```

### The picture: two runners on the same track

```
   S = slow (tortoise 🐢) moves 1 node per step
   F = fast (hare 🐇)     moves 2 nodes per step

   step 0:   [1] → [2] → [3] → [4] → [5] → null
             S,F
   step 1:   [1] → [2] → [3] → [4] → [5] → null
                    S     F
   step 2:   [1] → [2] → [3] → [4] → [5] → null
                          S           F

   When F reaches the END, S has gone exactly HALF as far  →  S is at the MIDDLE.
```

### Two kinds of "gap"

```
  ┌──────────────────────────────┬─────────────────────────────────────────┐
  │ DIFFERENT SPEEDS (1 and 2)   │ SAME SPEED, FIXED HEAD START (gap n)    │
  ├──────────────────────────────┼─────────────────────────────────────────┤
  │ gap GROWS by 1 each step     │ gap STAYS n forever                     │
  │ → middle, cycle detection,   │ → n-th from the end                     │
  │   cycle entry, duplicates    │   (when F hits the end, S is n behind)  │
  │                              │                                         │
  │  S→       F→→                │   S→            F→                      │
  │  ●────────●                  │   ●─── n nodes ─●                       │
  └──────────────────────────────┴─────────────────────────────────────────┘
```

### Why they MUST meet inside a cycle

```
   Once both are inside a loop of length L, look at it from the slow runner's view:
   fast is d steps BEHIND slow (going around the loop).

      each step:  slow moves +1,  fast moves +2   →   gap d shrinks by exactly 1

      d → d-1 → d-2 → ... → 1 → 0   ✅ they meet

   The gap shrinks by EXACTLY 1, so fast can never "jump over" slow.
   It takes at most L steps after slow enters the loop.

            ┌──→ ● ──→ ● ──┐
            │               ▼
     ●──→●──●               ●        F chases S around the ring,
            ▲               │        closing the gap 1 node per step
            └── ● ←── ● ←───┘
```

### The loop condition: `fast AND fast.next`

```
   fast jumps two nodes: fast ← fast.next.next
   So BOTH must exist before jumping:

      while fast ≠ null and fast.next ≠ null:      ← safe for odd AND even lengths
          slow ← slow.next
          fast ← fast.next.next

   odd length  (5):  fast stops ON the last node   (fast.next = null)
   even length (6):  fast stops PAST the last node (fast = null)
```

### Which middle do you get? (even length)

```
   [1] → [2] → [3] → [4] → [5] → [6]
                      ▲     ▲
                first middle  second middle

  ┌────────────────────────────────────┬─────────────────────────────────────┐
  │ SECOND middle (LeetCode 876)       │ FIRST middle (used to SPLIT a list) │
  ├────────────────────────────────────┼─────────────────────────────────────┤
  │ slow ← head, fast ← head           │ slow ← head, fast ← head            │
  │ while fast and fast.next:          │ while fast.next and fast.next.next: │
  │     move                           │     move                            │
  │ even 6 → node 4                    │ even 6 → node 3                     │
  │ odd  5 → node 3                    │ odd  5 → node 3                     │
  │                                    │                                     │
  │ Use: "return the middle"           │ Use: Sort List, Palindrome List,    │
  │                                    │      Reorder List (cut after slow)  │
  └────────────────────────────────────┴─────────────────────────────────────┘
```

> 💡 **Key insight:** to cut a list into two halves, you want slow to stop on the
> **last node of the first half**, so you can set `slow.next = null`. That's the first middle.

---

## 1. Middle of the Linked List (Easy)

### Problem
Return the middle node. If there are two middles, return the **second** one.

### Visualize it

```
   odd:   [1] → [2] → [3] → [4] → [5]          middle = 3
                       ▲

   even:  [1] → [2] → [3] → [4] → [5] → [6]    middle = 4 (second)
                             ▲
```

### The 5 steps

| Step | Answer |
|------|--------|
| Pointers | `slow` and `fast` both start at `head` |
| Move | slow +1, fast +2 |
| Stop | when `fast` is null or `fast.next` is null |
| Why it works | fast has gone 2k nodes, slow k nodes → slow is halfway |
| Answer | `slow` |

### Trace: [1, 2, 3, 4, 5]

```
  step │ slow │ fast │ check (fast and fast.next?)
  ─────┼──────┼──────┼──────────────────────────────
   0   │  1   │  1   │ yes → move
   1   │  2   │  3   │ yes → move
   2   │  3   │  5   │ 5.next = null → STOP
                                        answer = 3 ✅

   [1] → [2] → [3] → [4] → [5]
                S           F
```

### Trace: [1, 2, 3, 4, 5, 6]

```
  step │ slow │ fast │ check
  ─────┼──────┼──────┼────────────────────────
   0   │  1   │  1   │ yes → move
   1   │  2   │  3   │ yes → move
   2   │  3   │  5   │ 5.next = 6 → move
   3   │  4   │ null │ fast = null → STOP
                                        answer = 4 ✅  (second middle)

   [1] → [2] → [3] → [4] → [5] → [6] → null
                      S                   F
```

### Trace (first-middle variant): [1, 2, 3, 4, 5, 6]

```
  condition: fast.next and fast.next.next

  step │ slow │ fast │ check
  ─────┼──────┼──────┼──────────────────────────────
   0   │  1   │  1   │ 2 and 3 exist → move
   1   │  2   │  3   │ 4 and 5 exist → move
   2   │  3   │  5   │ 5.next = 6, 6.next = null → STOP
                                        slow = 3 (first middle)

   cut here → [1,2,3]  |  [4,5,6]      ← perfect halves for merge sort
```

### Pseudocode

```
function middleNode(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
    return slow
```

### Optimization ladder

| Approach | Time | Space | Passes |
|---|---|---|---|
| Copy to array, return `arr[n/2]` | O(n) | O(n) | 1 |
| Count length, then walk n/2 | O(n) | O(1) | 2 |
| **Fast & slow** | **O(n)** | **O(1)** | **1** ✅ |

### 📌 Points to remember
- `fast and fast.next` → **second** middle. `fast.next and fast.next.next` → **first** middle.
- Know which one your problem needs. Splitting a list needs the first.
- Empty list: return null. Both loop conditions handle one node safely (the first-middle one needs `head ≠ null` first).

---

## 2. Linked List Cycle (Easy)

### Problem
Does the list have a cycle (some node's `next` points back to an earlier node)?

### Visualize it: the ρ (rho) shape

```
        tail (straight part)          loop
   [3] ──→ [2] ──→ [0] ──→ [-4]
            ▲                │
            └────────────────┘

   It looks like the Greek letter ρ: a stick leading into a ring.
   Without a cycle, you eventually reach null. With a cycle, you never do.
```

### Two ways to detect it

```
  ┌──────────────────────────────────┬──────────────────────────────────┐
  │ HASH SET (simple)                │ FLOYD (tortoise & hare)          │
  ├──────────────────────────────────┼──────────────────────────────────┤
  │ walk; if node already seen → yes │ slow +1, fast +2                 │
  │ reach null → no                  │ they meet → yes                  │
  │                                  │ fast hits null → no              │
  │ O(n) time, O(n) space            │ O(n) time, O(1) space ✅         │
  └──────────────────────────────────┴──────────────────────────────────┘
```

### The 5 steps (Floyd)

| Step | Answer |
|------|--------|
| Pointers | slow, fast at head |
| Move | slow +1, fast +2 |
| Stop (no cycle) | fast or fast.next is null |
| Stop (cycle) | `slow == fast` (same NODE, not same value) |
| Answer | true if they meet |

### Trace: [3, 2, 0, -4], tail connects to index 1

```
   index:   0      1      2      3
           [3] → [2] → [0] → [-4]
                  ▲              │
                  └──────────────┘

  step │ slow     │ fast                    │ same?
  ─────┼──────────┼─────────────────────────┼──────
   0   │ idx0 (3) │ idx0 (3)                │ (start)
   1   │ idx1 (2) │ idx2 (0)                │ no
   2   │ idx2 (0) │ idx2→idx3→idx1 = idx1   │ no
   3   │ idx3(-4) │ idx1→idx2→idx3 = idx3   │ YES → cycle ✅
```

### Trace: no cycle, [1, 2]

```
  step │ slow │ fast │ check
  ─────┼──────┼──────┼──────────────────────
   0   │  1   │  1   │ fast.next = 2 → move
   1   │  2   │ null │ fast = null → STOP → false ✅
```

### Pseudocode

```
function hasCycle(head):
    slow ← head
    fast ← head
    while fast ≠ null and fast.next ≠ null:
        slow ← slow.next
        fast ← fast.next.next
        if slow == fast:           // compare node identity
            return true
    return false
```

### 📌 Points to remember
- Move **first**, then compare. Comparing before moving says "yes" at the start, when both are at head.
- Compare **nodes**, not values. Two different nodes can hold the same number.
- Speeds 1 and 2 are the standard. Any speeds work in theory, but 1 and 2 guarantee no skipping.

---

## 3. Linked List Cycle II (Medium)

### Problem
Return the node where the cycle **begins**, or null if there is no cycle. O(1) space.

### Visualize it

```
        a steps            entry
   head ──────────────────→ E ───── b steps ────→ M  (meeting point)
                            ▲                     │
                            └──── c steps ────────┘

     a = head → entry
     b = entry → meeting point (inside the loop)
     c = meeting point → back to entry
     L = b + c = loop length
```

### The two-phase method

```
   PHASE 1: run Floyd until slow and fast MEET (at M).
   PHASE 2: put one pointer back at HEAD, leave the other at M.
            Move BOTH one step at a time. Where they meet = ENTRY. ✅
```

### Why phase 2 lands on the entry (the math, in pictures)

```
   When they meet:
     slow walked:  a + b
     fast walked:  a + b + k·L        (fast lapped the loop k extra times, k ≥ 1)

   fast walks twice as far:
     2(a + b) = a + b + k·L
        a + b = k·L
            a = k·L − b
            a = (k−1)·L + (L − b)
            a = (k−1)·L + c          ◄── THE KEY EQUATION

   Meaning: walking a steps from HEAD reaches the entry.
            Walking a steps from M = c steps (reaches entry) + some full laps.
            → Both pointers arrive at the ENTRY at the same moment.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Phase 1 | Floyd: slow +1, fast +2 until equal (or null → no cycle) |
| Phase 2 | `p ← head`, `q ← meeting node`, both +1 until equal |
| Why | a = c + (k−1)·L |
| Answer | the node where `p == q` |

### Trace: [3, 2, 0, -4], pos = 1

```
   index:   0      1      2      3
           [3] → [2] → [0] → [-4]
                  ▲              │
                  └──────────────┘

   a = 1 (idx0 → idx1)     L = 3 (idx1, idx2, idx3)

  PHASE 1 (from section 2):  meet at idx3 after 3 steps
     b = 2 (idx1 → idx2 → idx3)
     c = 1 (idx3 → idx1)
     check: a + b = 3 = 1·L  → k = 1,  a = (k−1)·L + c = 0 + 1 = 1 ✓

  PHASE 2:
  step │ p (from head) │ q (from meeting) │ same?
  ─────┼───────────────┼──────────────────┼──────
   0   │ idx0          │ idx3             │ no
   1   │ idx1          │ idx1             │ YES → entry = idx1 (value 2) ✅
```

### Trace: [1, 2], pos = 0 (the whole list is the loop, a = 0)

```
           [1] → [2]
            ▲     │
            └─────┘

  PHASE 1:
  step │ slow │ fast              │ same?
  ─────┼──────┼───────────────────┼──────
   1   │ n1   │ n0 → n1 → n0 = n0 │ no
   2   │ n0   │ n0 → n1 → n0 = n0 │ YES (meet at n0)

  PHASE 2:  p = head = n0, q = n0 → already equal → entry = n0 (value 1) ✅
```

### Pseudocode

```
function detectCycle(head):
    slow ← head, fast ← head
    loop:
        if fast == null or fast.next == null: return null     // no cycle
        slow ← slow.next
        fast ← fast.next.next
        if slow == fast: break

    p ← head
    while p ≠ slow:
        p    ← p.next
        slow ← slow.next
    return p
```

### Bonus: cycle length

```
   After phase 1, keep one pointer at M and walk the other around until it returns.
   Number of steps = L.
```

### 📌 Points to remember
- **Phase 2 moves both at speed 1.** Using speed 2 in phase 2 breaks the math.
- If `a = 0` (cycle starts at head), they meet at head and phase 2 ends immediately.
- Hash-set alternative: the first node seen twice is the entry. O(n) space.
- Time O(n), Space O(1).

---

## 4. Remove Nth Node From End of List (Medium)

### Problem
Remove the n-th node from the end and return the head. Do it in **one pass**.

> The two-pass version (count the length, then remove node `length − n`) is in
> [01-Basic-Operations.md](01-Basic-Operations.md). This is the one-pass version.

### The idea: same speed, fixed gap

```
   Give fast a head start of n+1 nodes. Then move both 1 step at a time.
   When fast falls off the end (null), slow is right BEFORE the node to delete.

   D → [1] → [2] → [3] → [4] → [5] → null       n = 2 → delete 4
   ▲                ▲                   ▲
   slow             (delete slow.next)  fast
        └──────── gap = n+1 = 3 ────────┘
```

### Why a dummy node?

```
   If you must delete the HEAD itself (n = length), there is no node before it.
   A dummy node in front gives every real node a "previous" node.

      D → [1] → null     n = 1  →  delete [1]  →  D → null  →  return D.next = []
```

### The 5 steps

| Step | Answer |
|------|--------|
| Setup | `dummy.next = head`; slow = fast = dummy |
| Head start | move fast n+1 steps |
| Move together | both +1 until fast is null |
| Delete | `slow.next ← slow.next.next` |
| Answer | `dummy.next` |

### Trace: [1, 2, 3, 4, 5], n = 2

```
  Head start: fast moves 3 steps:  D → 1 → 2 → 3

   D → [1] → [2] → [3] → [4] → [5] → null
   S                F

  step │ slow │ fast  │
  ─────┼──────┼───────┤
   0   │  D   │  3    │
   1   │  1   │  4    │
   2   │  2   │  5    │
   3   │  3   │ null  │ STOP

   slow = 3 → slow.next = 4 is the target
   3.next ← 5

   result: [1] → [2] → [3] → [5]   ✅
```

### Trace: [1], n = 1

```
  Head start: fast moves 2 steps:  D → 1 → null

   slow = D, fast = null → loop never runs
   D.next ← D.next.next = null

   return D.next = []   ✅
```

### Pseudocode

```
function removeNthFromEnd(head, n):
    dummy ← new node, dummy.next ← head
    slow ← dummy, fast ← dummy
    repeat n + 1 times:
        fast ← fast.next
    while fast ≠ null:
        slow ← slow.next
        fast ← fast.next
    slow.next ← slow.next.next
    return dummy.next
```

### Optimization ladder

| Approach | Time | Space | Passes |
|---|---|---|---|
| Copy to array | O(n) | O(n) | 1 |
| Count length, then walk | O(n) | O(1) | 2 |
| **Gap of n+1 with dummy** | **O(n)** | **O(1)** | **1** ✅ |

### 📌 Points to remember
- Head start is **n + 1** (not n), so slow stops **before** the target.
- Start both at the **dummy**, not at head. That's what makes deleting the head work.
- Return `dummy.next`, never the old `head` (it might have been deleted).

---

## 5. Find the Duplicate Number (Medium)

### Problem
`nums` has n+1 integers, each in `[1, n]`. Exactly one value repeats (possibly many times).
Find it **without modifying** the array and with **O(1) extra space**.

### The disguise: the array IS a linked list

```
   Read each index i as a node, with an arrow  i → nums[i].

   nums  = [1, 3, 4, 2, 2]
   index:   0  1  2  3  4

   0 → 1      (nums[0] = 1)
   1 → 3      (nums[1] = 3)
   2 → 4      (nums[2] = 4)
   3 → 2      (nums[3] = 2)
   4 → 2      (nums[4] = 2)

   Start at 0 and follow the arrows:

     0 ──→ 1 ──→ 3 ──→ 2 ──→ 4
                       ▲     │
                       └─────┘

   A ρ shape! The cycle ENTRY is 2 = the duplicate.
```

### Why the entry is the duplicate

```
   The entry node has TWO arrows coming in:
     • one from the straight part  (3 → 2)
     • one from inside the loop    (4 → 2)

   Two different indices pointing to the same node means
   two cells hold the same VALUE → that value is the duplicate.

   Why start at index 0?  Values are in [1, n], so NOTHING points to 0.
   Index 0 is always outside the cycle: it's the "head" of the list.
```

### The 5 steps

| Step | Answer |
|------|--------|
| "next" | `next(i) = nums[i]` |
| Phase 1 | slow = nums[slow], fast = nums[nums[fast]] until equal |
| Phase 2 | p = 0, q = meeting; both one step until equal |
| Why | Cycle II math, exactly |
| Answer | the meeting index in phase 2 |

### Trace: [1, 3, 4, 2, 2]

```
  PHASE 1 (start slow = fast = 0)
  step │ slow = nums[slow] │ fast = nums[nums[fast]]      │ same?
  ─────┼───────────────────┼──────────────────────────────┼──────
   1   │ nums[0] = 1       │ nums[nums[0]] = nums[1] = 3  │ no
   2   │ nums[1] = 3       │ nums[nums[3]] = nums[2] = 4  │ no
   3   │ nums[3] = 2       │ nums[nums[4]] = nums[2] = 4  │ no
   4   │ nums[2] = 4       │ nums[nums[4]] = nums[2] = 4  │ YES (meet at 4)

  PHASE 2 (p = 0, q = 4)
  step │ p = nums[p]   │ q = nums[q]   │ same?
  ─────┼───────────────┼───────────────┼──────
   1   │ nums[0] = 1   │ nums[4] = 2   │ no
   2   │ nums[1] = 3   │ nums[2] = 4   │ no
   3   │ nums[3] = 2   │ nums[4] = 2   │ YES → duplicate = 2 ✅
```

### Trace: [3, 1, 3, 4, 2]

```
   index:   0  1  2  3  4
   nums  = [3, 1, 3, 4, 2]

   0 → 3,  1 → 1,  2 → 3,  3 → 4,  4 → 2

     0 ──→ 3 ──→ 4 ──→ 2          (1 → 1 is a separate self-loop,
           ▲           │           never reached from 0)
           └───────────┘

   Entry = 3 (arrows in from 0 and from 2) → duplicate = 3

  PHASE 1 (slow = fast = 0)
  step │ slow        │ fast                          │ same?
  ─────┼─────────────┼───────────────────────────────┼──────
   1   │ nums[0] = 3 │ nums[nums[0]] = nums[3] = 4   │ no
   2   │ nums[3] = 4 │ nums[nums[4]] = nums[2] = 3   │ no
   3   │ nums[4] = 2 │ nums[nums[3]] = nums[4] = 2   │ YES (meet at 2)

  PHASE 2 (p = 0, q = 2)
  step │ p           │ q           │ same?
  ─────┼─────────────┼─────────────┼──────
   1   │ nums[0] = 3 │ nums[2] = 3 │ YES → duplicate = 3 ✅
```

### Pseudocode

```
function findDuplicate(nums):
    slow ← 0, fast ← 0
    repeat:
        slow ← nums[slow]
        fast ← nums[nums[fast]]
    until slow == fast

    p ← 0
    while p ≠ slow:
        p    ← nums[p]
        slow ← nums[slow]
    return p
```

### Alternative: binary search on the VALUE

```
   For a guess mid, count how many numbers are ≤ mid.
   No duplicate below mid → count ≤ mid.  Duplicate ≤ mid → count > mid.

   [1,3,4,2,2]:  lo = 1, hi = 4
     mid = 2: count(≤2) = 3 (1,2,2) > 2  → hi = 2
     mid = 1: count(≤1) = 1, not > 1     → lo = 2
     lo == hi = 2  ✅
```

> This is "binary search on the answer". See
> [../binary search/03-Binary-Search-on-Answers.md](../binary%20search/03-Binary-Search-on-Answers.md).

### Approach comparison

| Approach | Time | Space | Modifies array? |
|---|---|---|---|
| Sort, check neighbors | O(n log n) | O(1)/O(n) | yes ❌ |
| Hash set | O(n) | O(n) ❌ | no |
| Mark visited by negating | O(n) | O(1) | yes ❌ |
| Binary search on value | O(n log n) | O(1) | no |
| **Floyd's cycle** | **O(n)** | **O(1)** | **no** ✅ |

### 📌 Points to remember
- `next(i) = nums[i]` turns the array into a linked list.
- Start at **index 0**. Nothing points to 0, so it's always on the straight part.
- The duplicate is the cycle **entry**, not the meeting point. You need phase 2.
- Works even when the duplicate appears 3+ times.

---

## 6. Master Cheat Sheet

### All 5 problems at a glance

```
┌───────────────────────────┬───────────────────────────────────────────┬───────────────────┬────────────┐
│ Problem                   │ Core move                                 │ Answer            │ Time/Space │
├───────────────────────────┼───────────────────────────────────────────┼───────────────────┼────────────┤
│ Middle of Linked List     │ slow +1, fast +2; stop at end             │ slow              │ O(n), O(1) │
│ Linked List Cycle         │ slow +1, fast +2; meet?                   │ true / false      │ O(n), O(1) │
│ Linked List Cycle II      │ meet, then head & meet both +1            │ entry node        │ O(n), O(1) │
│ Remove Nth From End       │ dummy; fast n+1 ahead; both +1            │ dummy.next        │ O(n), O(1) │
│ Find the Duplicate Number │ i → nums[i]; Cycle II on the array        │ entry index       │ O(n), O(1) │
└───────────────────────────┴───────────────────────────────────────────┴───────────────────┴────────────┘
```

### Pattern family tree

```
                        TWO POINTERS ON A LIST
                                  │
             ┌────────────────────┴────────────────────┐
             │                                         │
     DIFFERENT SPEEDS (1, 2)                  SAME SPEED, FIXED GAP
             │                                         │
   ┌─────────┼──────────────┐                 └─ Remove Nth From End
   │         │              │                    (k-th from end, any k)
 Middle   Cycle?      Cycle entry (2 phases)
           │                │
           │                └─ Find the Duplicate
           │                   (array disguised as a list)
           └─ also: Happy Number (digits-square sequence)
```

### Which loop condition?

```
   ┌──────────────────────────────────┬────────────────────────────────────┐
   │ Want                             │ Condition                          │
   ├──────────────────────────────────┼────────────────────────────────────┤
   │ second middle / cycle detection  │ fast ≠ null and fast.next ≠ null   │
   │ first middle (to split the list) │ fast.next ≠ null and               │
   │                                  │ fast.next.next ≠ null              │
   │ n-th from end                    │ fast ≠ null (after n+1 head start) │
   └──────────────────────────────────┴────────────────────────────────────┘
```

### Checklist

```
  ☐ Need the middle in one pass?               → speeds 1 and 2
  ☐ Splitting into halves?                     → FIRST middle, then cut slow.next
  ☐ Cycle yes/no with O(1) space?              → Floyd, compare nodes after moving
  ☐ Where does the cycle start?                → phase 2: head & meeting, both speed 1
  ☐ k-th from the end?                         → dummy + head start of k+1
  ☐ Values in [1, n], "find repeat", O(1)?     → treat i → nums[i] as a list
```

### 🚩 Common bugs to avoid

```
  ✗ Checking slow == fast BEFORE moving (true at step 0)
  ✗ fast.next.next without checking fast.next first → null crash
  ✗ Using the second middle when you need to split (unequal halves, infinite recursion in Sort List)
  ✗ Cycle II phase 2 at speed 2 instead of 1
  ✗ Returning the meeting point instead of the entry
  ✗ Remove Nth: head start of n instead of n+1; no dummy → can't delete the head
  ✗ Find the Duplicate: starting at nums[0] for slow but 0 for fast (mismatched starts)
  ✗ Comparing node VALUES instead of node identity
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "What do I know about where the FAST pointer is, at the     ║
   ║   moment it stops, compared to the SLOW one?"                ║
   ╚══════════════════════════════════════════════════════════════╝
     Twice as far → middle.   Same node → cycle.   n ahead → n-th from end.
```

---

### ✅ Progress tracker

- [ ] Middle of the Linked List (Easy)
- [ ] Linked List Cycle (Easy)
- [ ] Linked List Cycle II (Medium)
- [ ] Remove Nth Node From End of List (Medium)
- [ ] Find the Duplicate Number (Medium)
