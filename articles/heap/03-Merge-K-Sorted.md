# Heap: Merge K Sorted: A Visual Guide

> **Goal:** Learn to *see* "merge K sorted things" problems, run the heap by hand, and know when the trick applies even if the input doesn't look like lists.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is "Merge K Sorted"?](#0-the-big-idea-what-is-merge-k-sorted)
1. [Merge K Sorted Lists (Hard)](#1-merge-k-sorted-lists-hard)
2. [Find K Pairs with Smallest Sums (Medium)](#2-find-k-pairs-with-smallest-sums-medium)
3. [Smallest Range Covering Elements from K Lists (Hard)](#3-smallest-range-covering-elements-from-k-lists-hard)
4. [Design Twitter (Medium)](#4-design-twitter-medium)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Merge K Sorted Lists → Find K Pairs with Smallest Sums → Smallest Range → Design Twitter.
> The first problem is the pure template. Each later problem reuses it with one twist:
> pairs (hidden lists), a "max" tracked beside the heap, and a real-world design wrapper.

---

## 0. The Big Idea: What Is "Merge K Sorted"?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "MERGE K SORTED"                        │
├──────────────────────────────────────────────────────────────────┤
│  • You get K lists / arrays / streams, EACH already sorted       │
│  • You need one combined sorted output, or the first k of it     │
│  • "k smallest pairs / sums" built from two sorted arrays        │
│  • "a range that includes one element from EACH list"            │
│  • "newest 10 items across many users' feeds"                    │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: K runners at the front of K lines

```
   Line 0:  [ 1 ]  4   5
   Line 1:  [ 1 ]  3   4         Only the FRONT person of each line
   Line 2:  [ 2 ]  6             can be the next smallest overall.
              ▲
              └── head pointers

              ┌─────────────────────────┐
              │   HEAP of the K fronts  │   → always hands you
              │      { 1, 1, 2 }        │     the smallest front
              └─────────────────────────┘

   Loop:
     1. pop the smallest front       → append it to the output
     2. that line steps forward       → push its NEW front (if any)
     3. repeat until the heap is empty
```

> 💡 **Key insight:** you never need to look past the front of any list.
> Everything behind a front is ≥ that front, because each list is sorted.

### What goes in the heap?

```
   Not just the value. You must know WHERE it came from, to push its successor.

        ┌─────────┬────────────┬──────────────┐
        │  value  │ listIndex  │ elementIndex │
        └─────────┴────────────┴──────────────┘
           sort      which line   position in
           key                    that line

   For linked lists, (value, node) is enough: node.next is the successor.
   Tie on value? Break it by listIndex, so the heap never compares nodes.
```

### Why O(N log K)?

```
   N = total number of elements across all lists
   K = number of lists

   The heap never holds more than K items (one front per list).
   Every element is pushed once and popped once:

        N pushes × O(log K)  +  N pops × O(log K)   =   O(N log K)

   Compare:
     • dump everything and sort          → O(N log N)
     • merge lists one by one into result → O(N · K)   (re-walks the result K times)
     • heap of fronts                    → O(N log K)  ✅
```

### Alternative: divide and conquer (tournament)

```
   Merge lists in PAIRS, like a knockout tournament:

   round 0:   L0   L1   L2   L3   L4   L5   L6   L7      8 lists
               └─┬─┘     └─┬─┘     └─┬─┘     └─┬─┘
   round 1:     M01       M23       M45       M67        4 lists
                 └───┬─────┘         └────┬────┘
   round 2:        M0123               M4567             2 lists
                     └────────┬──────────┘
   round 3:                 FINAL                        1 list

   • Each round touches every element once  → O(N) per round
   • Number of rounds = log₂ K               → O(N log K) total
   • Same complexity as the heap, no heap needed, O(1) extra for linked lists
```

### The "implicit sorted matrix" idea (for pairs)

```
   Two sorted arrays A and B. Every pair (i, j) has sum A[i] + B[j].
   Lay the sums out as a grid:

              B:   2    4    6
           A  ┌────┬────┬────┐
           1  │  3 │  5 │  7 │   ← row 0 is SORTED (B is sorted)
              ├────┼────┼────┤
           7  │  9 │ 11 │ 13 │   ← row 1 is SORTED
              ├────┼────┼────┤
          11  │ 13 │ 15 │ 17 │   ← row 2 is SORTED
              └────┴────┴────┘

   Each ROW is a sorted list you never built.
   → "k smallest pairs" = "merge these K sorted rows, stop after k outputs".
```

### The universal template

```
function mergeK(lists):
    heap ← empty min-heap
    for i from 0 to K-1:
        if lists[i] is not empty:
            push (lists[i][0], i, 0)
    output ← empty
    while heap is not empty:
        (val, i, j) ← pop min
        append val to output
        if j + 1 < length(lists[i]):
            push (lists[i][j+1], i, j+1)
    return output
```

---

## 1. Merge K Sorted Lists (Hard)

### Problem
Given an array of `K` sorted linked lists, merge them into one sorted linked list.

### Visualize it

```
   L0:  1 ──► 4 ──► 5
   L1:  1 ──► 3 ──► 4
   L2:  2 ──► 6

   Result:  1 ──► 1 ──► 2 ──► 3 ──► 4 ──► 4 ──► 5 ──► 6
```

### The decision at each step

```
           Which node goes next in the result?
                         │
          ┌──────────────┴──────────────┐
     Only one of the K heads.     Never anything behind a head.
                         │
              heap.pop() gives the smallest head
                         │
          attach it to tail; push that node's .next (if not null)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | heap holds the current head of each non-empty list |
| Transition | pop smallest → attach to tail → push its `next` |
| Base | push every non-null head; `dummy` node as result start |
| Order | until heap is empty |
| Answer | `dummy.next` |

### Trace (heap shown sorted, tie broken by list index)

```
  step │ pop       │ push        │ heap after                 │ result so far
  ─────┼───────────┼─────────────┼────────────────────────────┼─────────────────
  init │    —      │ 1L0,1L1,2L2 │ { 1L0, 1L1, 2L2 }           │ (empty)
   1   │ 1 (L0)    │ 4 (L0)      │ { 1L1, 2L2, 4L0 }           │ 1
   2   │ 1 (L1)    │ 3 (L1)      │ { 2L2, 3L1, 4L0 }           │ 1 1
   3   │ 2 (L2)    │ 6 (L2)      │ { 3L1, 4L0, 6L2 }           │ 1 1 2
   4   │ 3 (L1)    │ 4 (L1)      │ { 4L0, 4L1, 6L2 }           │ 1 1 2 3
   5   │ 4 (L0)    │ 5 (L0)      │ { 4L1, 5L0, 6L2 }           │ 1 1 2 3 4
   6   │ 4 (L1)    │ — (L1 done) │ { 5L0, 6L2 }                │ 1 1 2 3 4 4
   7   │ 5 (L0)    │ — (L0 done) │ { 6L2 }                     │ 1 1 2 3 4 4 5
   8   │ 6 (L2)    │ — (L2 done) │ { }                         │ 1 1 2 3 4 4 5 6 ✅
```

### Head pointers moving (snapshot after step 4)

```
   L0:  ✓1   [4]   5          ✓ = already emitted
   L1:  ✓1   ✓3   [4]         [x] = current head (in heap)
   L2:  ✓2   [6]
```

### The dummy-head trick

```
   Without dummy: "is result empty? then set head, else attach to tail" → messy.

   With dummy:
       dummy ──► (nothing yet)
         ▲
        tail

       each step:  tail.next ← popped node;  tail ← tail.next

   At the end, return dummy.next. No special case for the first node.
```

### Pseudocode (heap)

```
function mergeKLists(lists):
    heap ← empty min-heap ordered by (node.val, listIndex)
    for i from 0 to K-1:
        if lists[i] ≠ null: push (lists[i].val, i, lists[i])
    dummy ← new node
    tail  ← dummy
    while heap is not empty:
        (val, i, node) ← pop min
        tail.next ← node
        tail      ← node
        if node.next ≠ null:
            push (node.next.val, i, node.next)
    return dummy.next
```

### Pseudocode (divide and conquer)

```
function mergeKLists(lists):
    if lists is empty: return null
    step ← 1
    while step < K:
        for i from 0 to K-1-step, jumping by 2·step:
            lists[i] ← mergeTwo(lists[i], lists[i + step])
        step ← step · 2
    return lists[0]

function mergeTwo(a, b):          // classic two-pointer merge
    dummy ← new node; tail ← dummy
    while a ≠ null and b ≠ null:
        if a.val ≤ b.val: tail.next ← a; a ← a.next
        else:             tail.next ← b; b ← b.next
        tail ← tail.next
    tail.next ← (a ≠ null) ? a : b
    return dummy.next
```

### Complexity

| Approach | Time | Extra space |
|---|---|---|
| Collect all values, sort, rebuild | O(N log N) | O(N) |
| Merge into result one list at a time | O(N · K) | O(1) |
| **Min-heap of heads** | **O(N log K)** | **O(K)** ✅ |
| **Divide and conquer** | **O(N log K)** | **O(1)** (iterative) ✅ |

### 📌 Points to remember
- Skip `null` lists when seeding. Empty input → return `null`.
- Ties on value: compare `listIndex` (or a counter) so the heap never tries to compare two nodes.
- The heap never holds more than `K` items. That's where `log K` comes from.
- Reuse the existing nodes. No need to allocate new ones.

---

## 2. Find K Pairs with Smallest Sums (Medium)

### Problem
Two sorted arrays `nums1`, `nums2` and an integer `k`.
Return the `k` pairs `[u, v]` (u from nums1, v from nums2) with the smallest sums.

### Visualize it: the hidden sorted rows

```
   nums1 = [1, 7, 11]      nums2 = [2, 4, 6]      k = 3

                 j=0   j=1   j=2
                  2     4     6
            ┌─────┬─────┬─────┐
   i=0   1  │  3  │  5  │  7  │   ← row 0 (a sorted "list")
            ├─────┼─────┼─────┤
   i=1   7  │  9  │ 11  │ 13  │   ← row 1
            ├─────┼─────┼─────┤
   i=2  11  │ 13  │ 15  │ 17  │   ← row 2
            └─────┴─────┴─────┘

   This is Merge K Sorted Lists where the lists are the rows.
   Stop after k pops.
```

### Why seed ONLY column 0?

```
   Each cell (i, j) can be reached from two neighbors: (i-1, j) and (i, j-1).
   If both of them push it → the same pair enters the heap TWICE ❌
   (you would need a visited set to fix it).

   Rule: seed (i, 0) for every row, then only ever move RIGHT.

          (i, 0) ──► (i, 1) ──► (i, 2) ──► ...

   Now every cell has exactly ONE parent (its left neighbor)
   → no duplicates, no visited set needed ✅

   Also: only seed the first min(k, len(nums1)) rows.
   Rows below row k-1 can't contribute to the top k (each of rows 0..k-1
   already offers a smaller-or-equal first element).
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | heap of `(sum, i, j)`: one "front" per row |
| Transition | pop smallest → record `[nums1[i], nums2[j]]` → push `(i, j+1)` if it exists |
| Base | push `(nums1[i] + nums2[0], i, 0)` for `i < min(k, n1)` |
| Order | until `k` pairs are recorded or heap is empty |
| Answer | the recorded pairs |

### Trace 1: nums1 = [1, 7, 11], nums2 = [2, 4, 6], k = 3

```
  step │ pop (sum,i,j) │ record  │ push (sum,i,j)   │ heap after
  ─────┼───────────────┼─────────┼──────────────────┼──────────────────────────
  init │      —        │   —     │ (3,0,0) (9,1,0)  │ { 3·(0,0), 9·(1,0), 13·(2,0) }
       │               │         │ (13,2,0)         │
   1   │ (3, 0, 0)     │ [1, 2]  │ (1+4=5, 0, 1)    │ { 5·(0,1), 9·(1,0), 13·(2,0) }
   2   │ (5, 0, 1)     │ [1, 4]  │ (1+6=7, 0, 2)    │ { 7·(0,2), 9·(1,0), 13·(2,0) }
   3   │ (7, 0, 2)     │ [1, 6]  │ (stop: k found)  │
                                                         answer: [1,2] [1,4] [1,6] ✅
```

```
   Grid view of what was popped:

            2     4     6
      1  [ ✓3 ] [ ✓5 ] [ ✓7 ]      all three from row 0
      7  [  9 ]   11     13        9 was waiting in the heap the whole time
     11  [ 13 ]   15     17
```

### Trace 2: nums1 = [1, 1, 2], nums2 = [1, 2, 3], k = 2

```
  seed only i < min(k=2, 3) = 2 rows:

  step │ pop (sum,i,j) │ record  │ push           │ heap after
  ─────┼───────────────┼─────────┼────────────────┼─────────────────────────
  init │      —        │   —     │ (2,0,0) (2,1,0)│ { 2·(0,0), 2·(1,0) }
   1   │ (2, 0, 0)     │ [1, 1]  │ (1+2=3, 0, 1)  │ { 2·(1,0), 3·(0,1) }
   2   │ (2, 1, 0)     │ [1, 1]  │ (stop: k found)│
                                                       answer: [1,1] [1,1] ✅

   Both [1,1] pairs are DIFFERENT pairs (index 0 vs index 1 in nums1),
   so both count. Duplicates by VALUE are fine; duplicates by INDEX are not.
```

### Pseudocode

```
function kSmallestPairs(nums1, nums2, k):
    result ← empty
    if nums1 or nums2 is empty: return result
    heap ← empty min-heap ordered by sum
    for i from 0 to min(k, len(nums1)) - 1:
        push (nums1[i] + nums2[0], i, 0)
    while heap not empty and size(result) < k:
        (s, i, j) ← pop min
        append [nums1[i], nums2[j]] to result
        if j + 1 < len(nums2):
            push (nums1[i] + nums2[j+1], i, j+1)
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Build all n1·n2 pairs, sort | O(n1·n2 · log(n1·n2)) | O(n1·n2) |
| **Heap, seed column 0** | **O(k log min(k, n1))** | **O(min(k, n1))** ✅ |

### 📌 Points to remember
- **Two sorted arrays → a grid of sorted rows.** Merge rows, stop at k.
- Seed column 0, move right only → each pair is pushed at most once.
- Seed only `min(k, n1)` rows. More is wasted work.
- `k` may exceed `n1 · n2` → stop when the heap empties.

---

## 3. Smallest Range Covering Elements from K Lists (Hard)

### Problem
`K` sorted lists. Find the smallest range `[a, b]` that contains **at least one number from each list**.
Range `[a, b]` is smaller than `[c, d]` if `b - a < d - c`, or if equal widths and `a < c`.

### Visualize it

```
   L0:  4  10  15  24  26
   L1:  0   9  12  20
   L2:  5  18  22  30

   Number line, one pick per list:

   0    5    10   15   20   25   30
   ├────┼────┼────┼────┼────┼────┤
                        ●L1 ●L0     L1=20, L0=24
                          ●L2       L2=22
                        [───────]   range [20, 24], width 4 ✅
```

### The key idea: K pointers, always move the smallest

```
   Keep ONE current element from each list (the "fronts").
   Range of the fronts = [ min of fronts , max of fronts ]

   To shrink the range, you must raise the MIN.
   (Raising anything else only pushes the max up or does nothing useful.)

   So: pop the min, advance THAT list, repeat.
   The heap gives the min. A plain variable tracks the max
   (the max only ever goes UP, because we only push larger values).

        ┌──────────────┐          ┌──────────┐
        │ min-heap of  │          │  curMax  │
        │  K fronts    │          │ variable │
        └──────┬───────┘          └────┬─────┘
               └──── range = [heap.min, curMax] ───┘

   STOP when the popped list has no next element:
   without that list, we can't cover all K lists anymore.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | heap of one `(value, list, index)` per list + `curMax` |
| Transition | check range `[heap.min, curMax]` → pop min → push its successor, update `curMax` |
| Base | push every list's first element; `curMax` = max of them |
| Order | until the popped list is exhausted |
| Answer | best range seen |

### Trace: LC example

```
  L0 = [4, 10, 15, 24, 26]   L1 = [0, 9, 12, 20]   L2 = [5, 18, 22, 30]

  row │ heap (fronts)     │ curMax │ range     │ width │ best         │ pop → push
  ────┼───────────────────┼────────┼───────────┼───────┼──────────────┼──────────────────
   1  │ {0L1, 4L0, 5L2}   │   5    │ [0, 5]    │   5   │ [0,5] ★      │ 0L1 → 9L1,  max 9
   2  │ {4L0, 5L2, 9L1}   │   9    │ [4, 9]    │   5   │ [0,5] (tie)  │ 4L0 → 10L0, max 10
   3  │ {5L2, 9L1, 10L0}  │  10    │ [5, 10]   │   5   │ [0,5] (tie)  │ 5L2 → 18L2, max 18
   4  │ {9L1, 10L0, 18L2} │  18    │ [9, 18]   │   9   │ [0,5]        │ 9L1 → 12L1
   5  │ {10L0,12L1,18L2}  │  18    │ [10, 18]  │   8   │ [0,5]        │ 10L0 → 15L0
   6  │ {12L1,15L0,18L2}  │  18    │ [12, 18]  │   6   │ [0,5]        │ 12L1 → 20L1, max 20
   7  │ {15L0,18L2,20L1}  │  20    │ [15, 20]  │   5   │ [0,5] (tie)  │ 15L0 → 24L0, max 24
   8  │ {18L2,20L1,24L0}  │  24    │ [18, 24]  │   6   │ [0,5]        │ 18L2 → 22L2
   9  │ {20L1,22L2,24L0}  │  24    │ [20, 24]  │   4   │ [20,24] ★    │ 20L1 → L1 EMPTY → STOP

  answer = [20, 24] ✅

  Ties (width 5) keep [0,5] because a smaller start wins on equal width,
  and we only replace on a STRICTLY smaller width.
```

### Pseudocode

```
function smallestRange(lists):
    heap   ← empty min-heap
    curMax ← -∞
    for i from 0 to K-1:
        push (lists[i][0], i, 0)
        curMax ← max(curMax, lists[i][0])
    bestA ← -∞, bestB ← +∞
    loop:
        (minVal, i, j) ← top of heap
        if curMax - minVal < bestB - bestA:
            bestA ← minVal; bestB ← curMax
        pop
        if j + 1 == len(lists[i]): break           // list i used up
        next ← lists[i][j+1]
        push (next, i, j+1)
        curMax ← max(curMax, next)
    return [bestA, bestB]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try every pair of (a, b) values | way too slow | — |
| Merge all into (value, list) + sliding window | O(N log N) | O(N) |
| **Heap of fronts + curMax** | **O(N log K)** | **O(K)** ✅ |

### 📌 Points to remember
- **Only the min can be improved** → always advance the list holding the min.
- `curMax` needs no heap: it never decreases.
- Stop the moment any list runs out. Every later range would miss that list.
- Replace best only on a **strictly** smaller width → ties keep the earlier (smaller start) range.

---

## 4. Design Twitter (Medium)

### Problem
Design a simplified Twitter:
- `postTweet(userId, tweetId)`
- `getNewsFeed(userId)` → the 10 most recent tweet IDs from the user **and** the people they follow, newest first
- `follow(followerId, followeeId)`
- `unfollow(followerId, followeeId)`

### Visualize it

```
   Each user owns a list of tweets, newest at the end (sorted by time):

   user 1:  (t0, 5)
   user 2:  (t1, 6)
   user 3:  (t2, 7) (t5, 9)

   follows[1] = { 2, 3 }

   News feed for user 1 = merge the lists of { 1, 2, 3 },
                          NEWEST first, stop after 10.

   → Merge K Sorted Lists, but:
       • max-heap by time (newest first)
       • walk each list BACKWARD (from its newest tweet)
       • stop after 10 pops
```

### Data layout

```
   ┌──────────────────────────────────────────────────────────┐
   │ time      : global counter, +1 on every post             │
   │ tweets    : userId → list of (time, tweetId)             │
   │ follows   : userId → set of followeeIds                  │
   └──────────────────────────────────────────────────────────┘

   Why a global counter instead of tweetId?
   Tweet IDs are not guaranteed to increase. Time order must be explicit.
```

### The getNewsFeed decision

```
        Who could own the next newest tweet in the feed?
                           │
           Only the NEWEST unseen tweet of each relevant user.
                           │
          ┌────────────────┴────────────────┐
     seed heap with each user's          pop newest → record it →
     last tweet (time, user, idx)        push that user's idx-1 tweet
```

### Pseudocode

```
class Twitter:
    time    ← 0
    tweets  ← map userId → list of (time, tweetId)
    follows ← map userId → set of userIds

    method postTweet(userId, tweetId):
        append (time, tweetId) to tweets[userId]
        time ← time + 1

    method follow(followerId, followeeId):
        add followeeId to follows[followerId]

    method unfollow(followerId, followeeId):
        remove followeeId from follows[followerId]     // no error if absent

    method getNewsFeed(userId):
        users ← follows[userId] ∪ { userId }           // always see your own tweets
        heap  ← empty max-heap ordered by time
        for u in users:
            if tweets[u] not empty:
                idx ← len(tweets[u]) - 1
                (t, id) ← tweets[u][idx]
                push (t, id, u, idx)
        feed ← empty
        while heap not empty and size(feed) < 10:
            (t, id, u, idx) ← pop max
            append id to feed
            if idx > 0:
                (t2, id2) ← tweets[u][idx-1]
                push (t2, id2, u, idx-1)
        return feed
```

### Trace: LC example

```
  operation              │ state after                                │ output
  ───────────────────────┼────────────────────────────────────────────┼────────
  Twitter()              │ time=0, no tweets, no follows              │ null
  postTweet(1, 5)        │ tweets[1] = [(t0,5)], time=1               │ null
  getNewsFeed(1)         │ users = {1}; heap {(t0,5)} → pop 5         │ [5]
  follow(1, 2)           │ follows[1] = {2}                           │ null
  postTweet(2, 6)        │ tweets[2] = [(t1,6)], time=2               │ null
  getNewsFeed(1)         │ users = {1, 2}                             │ [6, 5]
                         │   heap {(t1,6), (t0,5)}                    │
                         │   pop (t1,6) → user 2 idx 0, nothing older │
                         │   pop (t0,5) → user 1 idx 0, nothing older │
  unfollow(1, 2)         │ follows[1] = {}                            │ null
  getNewsFeed(1)         │ users = {1}; heap {(t0,5)} → pop 5         │ [5]

  outputs: [null, null, [5], null, null, [6, 5], null, [5]] ✅
```

### Complexity

| Operation | Time | Notes |
|---|---|---|
| `postTweet` | O(1) | append |
| `follow` / `unfollow` | O(1) | set add / remove |
| `getNewsFeed` | O(F + 10 log F) | F = followees + 1; heapify F seeds, ≤ 10 pops |
| Space | O(users + tweets + follow edges) | |

### 📌 Points to remember
- **Always include the user in their own feed**, even if they never "follow" themselves.
- `unfollow` of self must not hide your own tweets. Adding yourself at query time (not in the set) handles that.
- Use a **global timestamp**, not tweet IDs, for recency.
- Feed = Merge K Sorted, newest-first, **stop at 10**.
- Optional: keep only each user's latest 10 tweets, since older ones can never appear.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌──────────────────────────────┬─────────────────────────────────────────────┬──────────────────┬────────────────────┐
│ Problem                      │ What's in the heap / twist                  │ Stop when        │ Time               │
├──────────────────────────────┼─────────────────────────────────────────────┼──────────────────┼────────────────────┤
│ Merge K Sorted Lists         │ (val, listIdx, node); push node.next        │ heap empty       │ O(N log K)         │
│ K Pairs with Smallest Sums   │ (sum, i, j); seed column 0, move right only │ k pairs found    │ O(k log min(k,n1)) │
│ Smallest Range (K lists)     │ (val, list, idx) + curMax variable          │ a list runs out  │ O(N log K)         │
│ Design Twitter               │ max-heap (time, tweet, user, idx); go back  │ 10 tweets found  │ O(F + 10 log F)    │
└──────────────────────────────┴─────────────────────────────────────────────┴──────────────────┴────────────────────┘
```

### Pattern family tree

```
                         MERGE K SORTED
                               │
        ┌──────────────────────┼───────────────────────┐
        │                      │                       │
  REAL LISTS              HIDDEN LISTS           LISTS + EXTRA STATE
  (given directly)        (rows of a grid)       (track more than min)
        │                      │                       │
  ├─ Merge K Sorted Lists └─ K Pairs w/        └─ Smallest Range
  └─ Design Twitter          Smallest Sums        (min from heap,
     (newest-first,                                max in a variable)
      stop at 10)
```

### Heap entry card

```
   ┌────────────────────────┬───────────────────────────────────────┐
   │ Problem                │ Heap entry                            │
   ├────────────────────────┼───────────────────────────────────────┤
   │ Merge K Lists          │ (value, listIndex, node)              │
   │ K Pairs                │ (sum, i, j)                           │
   │ Smallest Range         │ (value, listIndex, elementIndex)      │
   │ Twitter                │ (time, tweetId, userId, tweetIndex)   │
   └────────────────────────┴───────────────────────────────────────┘
   Rule: store enough to find the SUCCESSOR of the popped element.
```

### Optimization checklist

```
  ☐ Are the inputs K sorted sequences?            → heap of fronts, O(N log K)
  ☐ No heap allowed / want O(1) extra space?      → pairwise divide & conquer
  ☐ Only need the first k outputs?                → stop after k pops
  ☐ Two sorted arrays, "pairs"?                   → grid of sorted rows
  ☐ A cell reachable from 2 directions?           → seed one edge, move one way
  ☐ Need both min and max of the fronts?          → heap for min, variable for max
  ☐ Newest-first?                                 → max-heap on time, walk lists backward
```

### 🚩 Common bugs to avoid

```
  ✗ Pushing null / empty lists into the heap
  ✗ Heap comparing two list nodes on a value tie (crash in some languages)
  ✗ K Pairs: pushing both (i+1, j) and (i, j+1) → duplicate pairs
  ✗ K Pairs: seeding all n1 rows when k is small → wasted work
  ✗ Smallest Range: continuing after a list runs out
  ✗ Smallest Range: replacing best on equal width (breaks the tie rule)
  ✗ Twitter: forgetting the user's own tweets; using tweetId as time
  ✗ Twitter: returning more than 10 tweets
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What are the K sorted 'lines', and when I take the     ║
   ║   front of one line, what is its successor?"             ║
   ╚══════════════════════════════════════════════════════════╝
     Name the lines and the successor, and the heap loop writes itself.
```

---

### ✅ Progress tracker

- [ ] Merge K Sorted Lists (Hard)
- [ ] Find K Pairs with Smallest Sums (Medium)
- [ ] Smallest Range Covering Elements from K Lists (Hard)
- [ ] Design Twitter (Medium)
