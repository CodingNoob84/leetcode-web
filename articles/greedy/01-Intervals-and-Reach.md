# Greedy: Intervals and Reach: A Visual Guide

> **Goal:** Learn to *see* interval and reach problems on a timeline, pick the right sort, and trust the greedy choice.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Greedy on a Timeline](#0-the-big-idea-greedy-on-a-timeline)
1. [Activity Selection (Easy)](#1-activity-selection-easy)
2. [Meeting Rooms (Easy)](#2-meeting-rooms-easy)
3. [Non-overlapping Intervals (Medium)](#3-non-overlapping-intervals-medium)
4. [Minimum Number of Arrows to Burst Balloons (Medium)](#4-minimum-number-of-arrows-to-burst-balloons-medium)
5. [Merge Intervals (Medium)](#5-merge-intervals-medium)
6. [Insert Interval (Medium)](#6-insert-interval-medium)
7. [Interval List Intersections (Medium)](#7-interval-list-intersections-medium)
8. [Meeting Rooms II (Medium)](#8-meeting-rooms-ii-medium)
9. [Car Pooling (Medium)](#9-car-pooling-medium)
10. [Employee Free Time (Hard)](#10-employee-free-time-hard)
11. [Minimum Interval to Include Each Query (Hard)](#11-minimum-interval-to-include-each-query-hard)
12. [Jump Game (Medium)](#12-jump-game-medium)
13. [Jump Game II (Medium)](#13-jump-game-ii-medium)
14. [Minimum Number of Taps to Open to Water a Garden (Hard)](#14-minimum-number-of-taps-to-open-to-water-a-garden-hard)
15. [Master Cheat Sheet](#15-master-cheat-sheet)

> **Suggested order:** the problems are grouped by technique, not by the list you were given.
>
> ```
>  SORT BY END        Activity Selection → Meeting Rooms → Non-overlapping → Arrows
>  SORT BY START      Merge → Insert → Intersections
>  COUNT OVERLAPS     Meeting Rooms II → Car Pooling → Employee Free Time → Min Interval per Query
>  REACH              Jump Game → Jump Game II → Taps
> ```

---

## 0. The Big Idea: Greedy on a Timeline

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "INTERVAL / REACH GREEDY"               │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a list of [start, end] pairs: meetings, tasks, trips │
│  • "Maximum number of NON-overlapping ..."                       │
│  • "Minimum number to REMOVE / arrows / rooms / platforms"       │
│  • "Merge", "insert", "intersect", "free time"                   │
│  • "Can you reach the end?" / "minimum jumps / taps to cover"    │
└──────────────────────────────────────────────────────────────────┘
```

### Draw every interval on a number line

```
   time →   0    1    2    3    4    5    6    7    8    9
            ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼
   A [1,4]       ├──────────────┤
   B [2,6]            ├───────────────────┤
   C [5,7]                           ├─────────┤
   D [8,9]                                          ├────┤

   A and B overlap. B and C overlap. D is alone.
   Almost every interval problem becomes obvious once it is drawn like this.
```

### What "greedy" means

```
   DP:      try every choice, remember the results, take the best.
   GREEDY:  make ONE locally best choice, never look back.

   Greedy is fast (usually just a sort + one pass, O(n log n)),
   but it is only correct when you can PROVE the local choice is safe.
```

### The exchange argument (how to trust a greedy choice)

```
   Claim: "Picking the interval that ENDS FIRST is always safe."

   Take ANY optimal answer. Look at its first interval X.
   Let G be the interval that ends earliest overall.

     optimal:   X ├───────────┤   Y ├─────┤   Z ├───┤
     greedy:    G ├──────┤
                         ▲
                 G ends no later than X

   Swap X for G:
     • G ends earlier, so it can't clash with Y, Z, ...
     • the count stays the same
   → There is an optimal answer that starts with G.  Repeat for the rest. ∎

   ┌───────────────────────────────────────────────────────────────┐
   │ Exchange argument = "swap the optimal's choice for mine and   │
   │ show nothing gets worse."  If you can't do this, don't trust  │
   │ the greedy.                                                   │
   └───────────────────────────────────────────────────────────────┘
```

### Why the WRONG sort fails (counter-examples)

```
  Sort by START (pick earliest start):
        [1,10] ├─────────────────────────────┤
        [2,3]     ├──┤
        [4,5]           ├──┤
     greedy picks [1,10] → 1 interval.   best is [2,3],[4,5] → 2.  ❌

  Sort by LENGTH (pick shortest):
        [1,5]  ├───────────┤
        [4,7]           ├───────┤        ← shortest, but it blocks both others
        [6,10]                ├───────────┤
     greedy picks [4,7] → 1 interval.    best is [1,5],[6,10] → 2. ❌

  Sort by END: picks [1,5], then [6,10] → 2. ✅
```

### THE BIG SORTING DECISION TABLE

```
  ┌──────────────────────────────────────┬────────────┬─────────────────────────────┐
  │ Question                             │ Sort by    │ Problems                    │
  ├──────────────────────────────────────┼────────────┼─────────────────────────────┤
  │ Keep the MOST non-overlapping        │ END        │ Activity Selection,         │
  │ Remove the FEWEST to fix overlaps    │ END        │ Non-overlapping Intervals   │
  │ Fewest points that hit every interval│ END        │ Arrows                      │
  ├──────────────────────────────────────┼────────────┼─────────────────────────────┤
  │ Merge / insert / glue together       │ START      │ Merge, Insert, Free Time    │
  │ Any overlap at all?                  │ START      │ Meeting Rooms               │
  │ Cover a line with fewest pieces      │ START      │ Taps, Video Stitching       │
  ├──────────────────────────────────────┼────────────┼─────────────────────────────┤
  │ How many overlap at the busiest time?│ events     │ Meeting Rooms II,           │
  │                                      │ (sweep)    │ Car Pooling, Platforms      │
  └──────────────────────────────────────┴────────────┴─────────────────────────────┘

   Memory hook:  END  → "leave room for the future"  (selection)
                 START → "process left to right"       (combining)
```

### The overlap test

```
   Two intervals a and b overlap  ⇔   a.start ≤ b.end   AND   b.start ≤ a.end

        a ├──────────┤
                 b ├──────────┤          overlap ✅

        a ├────┤
                    b ├────┤             a.end < b.start → no overlap

   ⚠ TOUCHING ENDPOINTS: [1,5] and [5,8]
     ┌─────────────────────────┬──────────────────────────────────────┐
     │ CLOSED  [s, e]          │ 5 is in both → they OVERLAP          │
     │   use ≤                 │ (balloons, merge intervals)          │
     ├─────────────────────────┼──────────────────────────────────────┤
     │ HALF-OPEN  [s, e)       │ meeting ends at 5, next starts at 5  │
     │   use <                 │ → NO overlap (meetings, car pooling) │
     └─────────────────────────┴──────────────────────────────────────┘
   Always ask: "Does touching count as overlapping?"  Read the examples.
```

### Tool 1: sweep line (+1 / −1 events)

```
   Turn each interval into two events:  (start, +1)  and  (end, −1)
   Sort events by time, walk left to right, keep a running sum.
   The running sum = how many intervals are "open" right now.

   [1,4] [2,5] [3,6] [7,9]

   time:     1    2    3    4    5    6    7    9
   event:   +1   +1   +1   −1   −1   −1   +1   −1
   running:  1    2    3    2    1    0    1    0
                       ▲
                    peak = 3

   ⚠ Tie at the same time (half-open): process −1 BEFORE +1
     so a meeting ending at 5 frees its room for one starting at 5.
```

### Tool 2: min-heap of end times

```
   Sort by start. Keep a min-heap of the END times of "active" intervals.
   The top of the heap = the interval that frees up soonest.

     new interval starts at s
        │
        ▼
     heap top ≤ s ?  ── yes ──► pop it (that room is free again)
        │
        └──── then push the new end time

   heap size = number of intervals overlapping right now
```

### Tool 3: reach (farthest so far)

```
   Array where nums[i] = how far you can jump from i.

   index:   0   1   2   3   4
   nums:    2   3   1   1   4
            │───────►          from 0 you reach 2
                │───────────►  from 1 you reach 4

   farthest = max over every index you can stand on of (i + nums[i])

   BFS-LEVELS VIEW (for "minimum jumps"):
   ┌─────────┬───────────────┬─────────────┐
   │ level 0 │   level 1     │  level 2    │
   │  [0]    │  [1 .. 2]     │  [3 .. 4]   │
   └─────────┴───────────────┴─────────────┘
   Each level is the window of indices reachable with that many jumps.
   No queue needed: just track [currentEnd, farthest].
```

### The 4-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  DRAW it on a number line.                             │
 │ STEP 2  DECIDE: selection (sort END), combining (sort START), │
 │         counting overlaps (sweep / heap), or reach.           │
 │ STEP 3  DECIDE touching: closed (≤) or half-open (<)?         │
 │ STEP 4  ONE PASS, keeping a tiny state: lastEnd, current      │
 │         merged interval, heap, running count, or farthest.    │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Activity Selection (Easy)

### Problem
*(GFG version.)* Given `start[]` and `finish[]` of `n` activities, find the **maximum number** of activities one person can do, one at a time.

> **Convention used here (current GFG):** the next activity must start **strictly after** the previous one finishes (`start > lastFinish`).
> Some older versions allow `start ≥ lastFinish`. Only that one comparison changes.

### Visualize it

```
   start  = [1, 3, 0, 5, 8, 5]
   finish = [2, 4, 6, 7, 9, 9]

   time →   0    1    2    3    4    5    6    7    8    9
            ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼
   a0 [1,2]      ├────┤                                         ✅
   a1 [3,4]                ├────┤                               ✅
   a2 [0,6] ├──────────────────────────────┤                    ✗
   a3 [5,7]                          ├─────────┤                ✅
   a4 [8,9]                                         ├────┤      ✅
   a5 [5,9]                          ├───────────────────┤      ✗
```

### The greedy choice

```
   Always take the activity that FINISHES FIRST among those still allowed.
   (Exchange argument from section 0.)

         sort by finish
              │
              ▼
     ┌──────────────────────┐
     │ start > lastFinish ? │── yes ──► TAKE it, lastFinish = its finish
     └──────────────────────┘
              │ no
              ▼
            SKIP
```

### Trace

```
   sorted by finish:  (1,2) (3,4) (0,6) (5,7) (8,9) (5,9)

   activity │ start > lastFinish? │ action │ lastFinish │ count
   ─────────┼─────────────────────┼────────┼────────────┼──────
   (1,2)    │ 1 > −∞   ✅         │ take   │     2      │  1
   (3,4)    │ 3 > 2    ✅         │ take   │     4      │  2
   (0,6)    │ 0 > 4    ❌         │ skip   │     4      │  2
   (5,7)    │ 5 > 4    ✅         │ take   │     7      │  3
   (8,9)    │ 8 > 7    ✅         │ take   │     9      │  4
   (5,9)    │ 5 > 9    ❌         │ skip   │     9      │  4

   answer = 4 ✅
```

### Pseudocode

```
function activitySelection(start, finish):
    pairs ← zip(start, finish), sorted by finish
    count ← 0
    lastFinish ← −∞
    for each (s, f) in pairs:
        if s > lastFinish:          // use ≥ if touching is allowed
            count ← count + 1
            lastFinish ← f
    return count
```

### Complexity

| Step | Time | Space |
|---|---|---|
| Sort by finish | O(n log n) | O(n) for the pairs |
| One pass | O(n) | O(1) |

### 📌 Points to remember
- **Sort by END.** This is the mother problem of the whole "sort by end" family.
- Keep `start` and `finish` **paired** when sorting. Sorting the arrays separately is a classic bug.
- Check the touching rule (`>` vs `≥`) in the problem statement.

---

## 2. Meeting Rooms (Easy)

### Problem
*(LeetCode Premium 252.)* Given meeting intervals `[start, end]`, can **one person attend all** of them?
Meetings are half-open: one ending at 5 and another starting at 5 do **not** clash.

### Visualize it

```
   [[0,30],[5,10],[15,20]]

   time → 0    5    10   15   20   25   30
          ┼────┼────┼────┼────┼────┼────┼
   [0,30] ├─────────────────────────────┤
   [5,10]      ├────┤                         clash with [0,30] → false ❌
   [15,20]               ├────┤

   [[7,10],[2,4]]  → sorted [2,4],[7,10] → no clash → true ✅
```

### The idea

```
   After sorting by START, any clash must be between NEIGHBORS.

      prev ├──────────┤
                 next ├──────┤        next.start < prev.end → clash
```

### Trace

```
   sorted: [0,30] [5,10] [15,20]

   i │ prev.end │ curr.start │ curr.start < prev.end ? │
   ──┼──────────┼────────────┼─────────────────────────┤
   1 │   30     │     5      │  5 < 30  ✅ clash        │ → return false
```

### Pseudocode

```
function canAttendMeetings(intervals):
    sort intervals by start
    for i from 1 to n−1:
        if intervals[i].start < intervals[i−1].end:
            return false
    return true
```

### 📌 Points to remember
- Sort by start, then compare **adjacent pairs only**.
- Half-open meetings use `<`. A meeting ending at 10 and one starting at 10 is fine.
- O(n log n) time, O(1) extra space.
- This is the yes/no version. Meeting Rooms II (problem 8) asks **how many rooms**.

---

## 3. Non-overlapping Intervals (Medium)

### Problem
Return the **minimum number of intervals to remove** so the rest don't overlap.
Touching is fine: `[1,2]` and `[2,3]` do not overlap.

### Flip the question

```
   min removed  =  n  −  max kept (non-overlapping)

   "max kept" is exactly Activity Selection (touching allowed, so ≥).
```

### Visualize it

```
   [[1,2],[2,3],[3,4],[1,3]]

   time → 1    2    3    4
          ┼────┼────┼────┼
   [1,2]  ├────┤                keep
   [2,3]       ├────┤           keep
   [3,4]            ├────┤      keep
   [1,3]  ├─────────┤           REMOVE (overlaps [1,2] and [2,3])
```

### Trace

```
   sorted by end: [1,2] [2,3] [1,3] [3,4]

   interval │ start ≥ lastEnd ? │ action  │ lastEnd │ removed
   ─────────┼───────────────────┼─────────┼─────────┼────────
   [1,2]    │ 1 ≥ −∞   ✅        │ keep    │   2     │   0
   [2,3]    │ 2 ≥ 2    ✅        │ keep    │   3     │   0
   [1,3]    │ 1 ≥ 3    ❌        │ remove  │   3     │   1
   [3,4]    │ 3 ≥ 3    ✅        │ keep    │   4     │   1

   answer = 1 ✅
```

### Why "remove the one that ends LATER" is right

```
   When two intervals clash, keep the one that ends FIRST.

     kept    ├──────┤
     clash   ├────────────────┤       ← ends later, blocks more future
                                        intervals → remove THIS one

   Sorting by end makes that automatic: the kept one always ends first.
```

### Pseudocode

```
function eraseOverlapIntervals(intervals):
    sort intervals by end
    removed ← 0
    lastEnd ← −∞
    for each [s, e] in intervals:
        if s ≥ lastEnd:
            lastEnd ← e              // keep it
        else:
            removed ← removed + 1    // drop it
    return removed
```

### 📌 Points to remember
- **min remove = n − max non-overlapping.** Same algorithm as Activity Selection.
- Touching is allowed here → `≥`.
- O(n log n) time, O(1) extra space.

---

## 4. Minimum Number of Arrows to Burst Balloons (Medium)

### Problem
Each balloon spans `[xstart, xend]` on the x-axis. An arrow shot at `x` bursts every balloon with `xstart ≤ x ≤ xend`.
Find the **minimum arrows** to burst all balloons. Intervals are **closed**: touching balloons share a point.

### Visualize it

```
   [[10,16],[2,8],[1,6],[7,12]]

   x →    1    2    3    4    5    6    7    8    9   10   11   12  ...  16
          ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼       ┼
   [1,6]  ├─────────────────────────┤
   [2,8]       ├───────────────────────────────┤
   [7,12]                                ├────────────────────────┤
   [10,16]                                              ├───────────────────┤
                                   ↑                              ↑
                               arrow @6                       arrow @12

   answer = 2 ✅
```

### The greedy choice

```
   Shoot each arrow at the END of the balloon that ends first.
   That spot is as far right as possible while still hitting it,
   so it hits as many later balloons as possible.

     sorted by end
         │
         ▼
   balloon.start ≤ arrowX ? ── yes ──► already burst, skip
         │ no
         ▼
   new arrow at balloon.end
```

### Trace

```
   sorted by end: [1,6] [2,8] [7,12] [10,16]

   balloon  │ start ≤ arrowX ? │ action          │ arrowX │ arrows
   ─────────┼──────────────────┼─────────────────┼────────┼───────
   [1,6]    │ (no arrow yet)   │ new arrow @6    │   6    │   1
   [2,8]    │ 2 ≤ 6   ✅        │ burst already   │   6    │   1
   [7,12]   │ 7 ≤ 6   ❌        │ new arrow @12   │  12    │   2
   [10,16]  │ 10 ≤ 12 ✅        │ burst already   │  12    │   2

   answer = 2 ✅
```

### Pseudocode

```
function findMinArrowShots(points):
    sort points by end
    arrows ← 1
    arrowX ← points[0].end
    for i from 1 to n−1:
        if points[i].start > arrowX:     // not hit by the current arrow
            arrows ← arrows + 1
            arrowX ← points[i].end
    return arrows
```

### 📌 Points to remember
- This is "max non-overlapping" with **closed** intervals: touching balloons are hit by one arrow → use `>` for a new arrow.
- Coordinates can be near ±2³¹. Compare values directly, don't subtract them inside a comparator (overflow).
- O(n log n) time, O(1) extra space.

---

## 5. Merge Intervals (Medium)

### Problem
Merge all overlapping intervals (closed: touching intervals merge too).

### Visualize it

```
   [[1,3],[2,6],[8,10],[15,18]]

   x →     1    2    3    4    5    6    7    8    9   10  ...  15   16   17   18
           ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼       ┼────┼────┼────┼
   [1,3]   ├─────────┤
   [2,6]        ├───────────────────┤
   [8,10]                                  ├─────────┤
   [15,18]                                                      ├──────────────┤

   merged:
   [1,6]   ├────────────────────────┤
   [8,10]                                  ├─────────┤
   [15,18]                                                      ├──────────────┤
```

### The decision

```
   Sort by START. Keep the LAST merged interval as "current".

       current ├──────────┤
     next          ├──────────┤         next.start ≤ current.end
                                        → EXTEND: current.end = max(current.end, next.end)

       current ├──────┤
     next                 ├──────┤      next.start > current.end
                                        → GAP: push next as a new interval
```

### Trace

```
   sorted: [1,3] [2,6] [8,10] [15,18]

   next     │ next.start ≤ last.end ? │ action                 │ result so far
   ─────────┼─────────────────────────┼────────────────────────┼────────────────────────
   [1,3]    │ (first)                 │ push                   │ [1,3]
   [2,6]    │ 2 ≤ 3  ✅                │ last.end = max(3,6)=6  │ [1,6]
   [8,10]   │ 8 ≤ 6  ❌                │ push                   │ [1,6] [8,10]
   [15,18]  │ 15 ≤ 10 ❌               │ push                   │ [1,6] [8,10] [15,18] ✅
```

### Pseudocode

```
function merge(intervals):
    sort intervals by start
    result ← [ intervals[0] ]
    for i from 1 to n−1:
        last ← result.lastItem
        if intervals[i].start ≤ last.end:
            last.end ← max(last.end, intervals[i].end)
        else:
            append intervals[i] to result
    return result
```

### 📌 Points to remember
- Use `max(last.end, next.end)`. A short interval inside a long one must not shrink it: `[1,10]` + `[2,3]` → `[1,10]`.
- Touching (`[1,4]`, `[4,5]`) merges → `≤`.
- O(n log n) time; O(n) for the output.

---

## 6. Insert Interval (Medium)

### Problem
`intervals` is **sorted and non-overlapping**. Insert `newInterval`, merging where needed.

### Visualize it

```
   intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]],  new = [4,8]

   x →    1    2    3    4    5    6    7    8    9   10   11   12  ...  16
          ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼       ┼
          ├────┤    ├─────────┤    ├────┤    ├─────────┤         ├──────────┤
   new                   ├───────────────────┤
          ╰─ left ─╯ ╰────────── merges ───────────────╯         ╰ right ╯

   result: [1,2] [3,10] [12,16]
```

### Three phases (no sort needed, input is already sorted)

```
   ┌────────────────────────────────────────────────────────────────┐
   │ PHASE 1  intervals that END before new starts   (end < new.s)  │
   │          → copy as-is                                          │
   ├────────────────────────────────────────────────────────────────┤
   │ PHASE 2  intervals that START before new ends   (start ≤ new.e)│
   │          → absorb: new.s = min, new.e = max                    │
   │          then push the grown new interval                      │
   ├────────────────────────────────────────────────────────────────┤
   │ PHASE 3  everything left → copy as-is                          │
   └────────────────────────────────────────────────────────────────┘
```

### Trace

```
   new = [4,8]

   interval │ phase │ test                   │ action               │ new
   ─────────┼───────┼────────────────────────┼──────────────────────┼───────
   [1,2]    │  1    │ 2 < 4 ✅                │ copy                 │ [4,8]
   [3,5]    │  2    │ 3 ≤ 8 ✅                │ absorb → min 3 max 8 │ [3,8]
   [6,7]    │  2    │ 6 ≤ 8 ✅                │ absorb               │ [3,8]
   [8,10]   │  2    │ 8 ≤ 8 ✅                │ absorb → max 10      │ [3,10]
   [12,16]  │  2    │ 12 ≤ 10 ❌ → push [3,10]│ phase 3: copy        │
   ─────────┴───────┴────────────────────────┴──────────────────────┴───────
   result = [1,2] [3,10] [12,16] ✅
```

### Pseudocode

```
function insert(intervals, newI):
    result ← empty, i ← 0
    while i < n and intervals[i].end < newI.start:          // phase 1
        append intervals[i]; i ← i + 1
    while i < n and intervals[i].start ≤ newI.end:          // phase 2
        newI.start ← min(newI.start, intervals[i].start)
        newI.end   ← max(newI.end,   intervals[i].end)
        i ← i + 1
    append newI
    while i < n:                                            // phase 3
        append intervals[i]; i ← i + 1
    return result
```

### 📌 Points to remember
- Input is already sorted → **O(n)**, no sort.
- Always push `newI` after phase 2, even if it absorbed nothing (it might go at the very start, middle or end).
- Lazy alternative: append and run Merge Intervals → O(n log n). Works, but misses the point.

---

## 7. Interval List Intersections (Medium)

### Problem
Two lists of **closed**, sorted, disjoint intervals `A` and `B`. Return their intersection.

### Visualize it

```
   A = [[0,2],[5,10],[13,23],[24,25]]
   B = [[1,5],[8,12],[15,24],[25,26]]

   x →  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 ... 23 24 25 26
        ┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼──┼     ┼──┼──┼──┼
   A    ├─────┤        ├──────────────┤        ├─────────────────┤  ├──┤
   B       ├───────────┤        ├───────────┤        ├─────────────────┤  ├──┤
   ∩       ├──┤        ●        ├─────┤              ├────────────┤  ●  ●
         [1,2]      [5,5]       [8,10]              [15,23]     [24,24][25,25]
```

### Two pointers: the intersection formula

```
   lo = max(a.start, b.start)
   hi = min(a.end,   b.end)
   if lo ≤ hi → [lo, hi] is an intersection

   THEN advance the one that ENDS FIRST:
   it can't touch anything else in the other list.

     a ├───────┤               ← ends first → i++
     b      ├─────────────┤    ← may still hit A's next interval
```

### Trace

```
   i │ j │ A[i]    │ B[j]    │ lo │ hi │ lo ≤ hi? │ add     │ advance
   ──┼───┼─────────┼─────────┼────┼────┼──────────┼─────────┼────────
   0 │ 0 │ [0,2]   │ [1,5]   │ 1  │ 2  │ ✅        │ [1,2]   │ i (2<5)
   1 │ 0 │ [5,10]  │ [1,5]   │ 5  │ 5  │ ✅        │ [5,5]   │ j (5<10)
   1 │ 1 │ [5,10]  │ [8,12]  │ 8  │ 10 │ ✅        │ [8,10]  │ i (10<12)
   2 │ 1 │ [13,23] │ [8,12]  │ 13 │ 12 │ ❌        │ —       │ j (12<23)
   2 │ 2 │ [13,23] │ [15,24] │ 15 │ 23 │ ✅        │ [15,23] │ i (23<24)
   3 │ 2 │ [24,25] │ [15,24] │ 24 │ 24 │ ✅        │ [24,24] │ j (24<25)
   3 │ 3 │ [24,25] │ [25,26] │ 25 │ 25 │ ✅        │ [25,25] │ i → done

   result = [1,2] [5,5] [8,10] [15,23] [24,24] [25,25] ✅
```

### Pseudocode

```
function intervalIntersection(A, B):
    i ← 0, j ← 0, result ← empty
    while i < len(A) and j < len(B):
        lo ← max(A[i].start, B[j].start)
        hi ← min(A[i].end,   B[j].end)
        if lo ≤ hi: append [lo, hi]
        if A[i].end < B[j].end: i ← i + 1
        else:                   j ← j + 1
    return result
```

### 📌 Points to remember
- `lo = max of starts`, `hi = min of ends`. Valid only if `lo ≤ hi`.
- **Advance the pointer whose interval ends first.**
- Single points like `[5,5]` count (closed intervals).
- O(m + n) time, no sort needed.

---

## 8. Meeting Rooms II (Medium)

### Problem
*(LeetCode Premium 253.)* Given meeting intervals (half-open), return the **minimum number of rooms** needed.

### Key insight

```
   rooms needed = the MAXIMUM number of meetings happening at the same moment

   [1,4] [2,5] [3,6] [7,9]

   time → 1    2    3    4    5    6    7    8    9
          ┼────┼────┼────┼────┼────┼────┼────┼────┼
   [1,4]  ├──────────────┤
   [2,5]       ├──────────────┤
   [3,6]            ├──────────────┤
   [7,9]                               ├─────────┤
                    ▲
             at time 3 → 3 meetings → 3 rooms
```

### Method A: min-heap of end times

```
   Sort by start. The heap holds end times of rooms in use.

   for each meeting:
       if heap.top ≤ meeting.start → that room is free: pop it
       push meeting.end
   answer = largest heap size seen (= final heap size here)
```

```
   meeting │ heap before │ top ≤ start ? │ heap after   │ rooms
   ────────┼─────────────┼───────────────┼──────────────┼──────
   [1,4]   │ { }         │ —             │ {4}          │  1
   [2,5]   │ {4}         │ 4 ≤ 2 ❌       │ {4,5}        │  2
   [3,6]   │ {4,5}       │ 4 ≤ 3 ❌       │ {4,5,6}      │  3
   [7,9]   │ {4,5,6}     │ 4 ≤ 7 ✅ pop 4 │ {5,6,9}      │  3

   answer = 3 ✅
```

> Only one pop per meeting is needed: we only care that the heap never shrinks below the true answer.
> Popping just one keeps the heap size equal to the number of rooms allocated so far.

### Method B: two sorted arrays (sweep line without events)

```
   starts = [1, 2, 3, 7]      (sorted)
   ends   = [4, 5, 6, 9]      (sorted, separately!)

   For each start (in time order):
       if start < ends[e] → a NEW room is needed      → rooms++
       else               → some meeting ended: reuse → e++

   start │ ends[e] │ start < ends[e]? │ rooms │ e
   ──────┼─────────┼──────────────────┼───────┼───
     1   │   4     │ ✅ new room       │   1   │ 0
     2   │   4     │ ✅ new room       │   2   │ 0
     3   │   4     │ ✅ new room       │   3   │ 0
     7   │   4     │ ❌ reuse          │   3   │ 1

   answer = 3 ✅
```

> Why is sorting starts and ends **separately** OK? We don't care **which** meeting ended,
> only **that one did**. Any finished meeting frees a room.

### LeetCode example

```
   [[0,30],[5,10],[15,20]]
   starts = [0,5,15], ends = [10,20,30]
     0 < 10 → rooms 1
     5 < 10 → rooms 2
    15 < 10 ❌ → reuse (e=1)
   answer = 2 ✅
```

### Pseudocode (Method B)

```
function minMeetingRooms(intervals):
    starts ← sorted list of all starts
    ends   ← sorted list of all ends
    rooms ← 0, e ← 0
    for each s in starts:
        if s < ends[e]:
            rooms ← rooms + 1
        else:
            e ← e + 1
    return rooms
```

### 📌 Points to remember
- **Rooms = peak overlap.** Three equivalent tools: heap, two sorted arrays, sweep events.
- Half-open: a meeting ending at 5 frees the room for one starting at 5 → `start < end` means "new room".
- O(n log n) time, O(n) space.
- **Minimum Platforms** (in the next greedy guide) is this exact problem with trains.

---

## 9. Car Pooling (Medium)

### Problem
`trips[i] = [numPassengers, from, to]`. The car only drives east, capacity `capacity`.
Passengers get off at `to` **before** new ones get on there. Can all trips be done?

### Visualize it

```
   trips = [[2,1,5],[3,3,7]]

   location → 0    1    2    3    4    5    6    7
              ┼────┼────┼────┼────┼────┼────┼────┼
   2 people        ├───────────────────┤
   3 people                  ├───────────────────┤
   in car:    0    2    2    5    5    3    3    0
                             ▲
                       peak = 5 passengers

   capacity 4 → false ❌     capacity 5 → true ✅
```

### Difference array (sweep with buckets)

```
   For each trip:   diff[from] += p      diff[to] −= p
   Running sum over locations = passengers in the car.

   location:   0   1   2   3   4   5   6   7
   diff:       0  +2   0  +3   0  −2   0  −3
   running:    0   2   2   5   5   3   3   0
                           ▲
                     5 > 4 → false (capacity 4)
```

> `to` is **exclusive**: passengers leave at `to`. That's why `diff[to] −= p` and not `diff[to+1]`.

### Pseudocode

```
function carPooling(trips, capacity):
    diff ← array of size 1001, all 0      // locations are 0..1000
    for each [p, from, to] in trips:
        diff[from] ← diff[from] + p
        diff[to]   ← diff[to]   − p
    load ← 0
    for loc from 0 to 1000:
        load ← load + diff[loc]
        if load > capacity: return false
    return true
```

### 📌 Points to remember
- Small location range → **difference array**, O(n + range).
- Large range → sort events `(time, ±p)` and sweep, processing drop-offs before pick-ups at the same location. O(n log n).
- It's Meeting Rooms II with **weights** (passenger counts) and a capacity check.

---

## 10. Employee Free Time (Hard)

### Problem
*(LeetCode Premium 759.)* `schedule[i]` = sorted, non-overlapping working intervals of employee `i`.
Return the **finite** intervals when **everyone** is free, sorted. Zero-length gaps are not included.

### Visualize it

```
   schedule = [ [[1,3],[6,7]],   [[2,4]],   [[2,5],[9,12]] ]

   time →  1    2    3    4    5    6    7    8    9   10   11   12
           ┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼────┼
   emp 0   ├─────────┤                   ├────┤
   emp 1        ├─────────┤
   emp 2        ├──────────────┤                        ├──────────────┤
   ───────────────────────────────────────────────────────────────────────
   busy    ├───────────────────┤         ├────┤         ├──────────────┤
   FREE                        ░░░░░░            ░░░░░░░░░
                              [5,6]              [7,9]
```

### The idea

```
   1. Throw ALL intervals of ALL employees into one list.
   2. Merge Intervals (problem 5) → the "busy" timeline.
   3. The GAPS between consecutive busy blocks are the free time.

   free time = complement of the union of busy intervals
```

### Trace

```
   all intervals, sorted by start:
     [1,3] [2,4] [2,5] [6,7] [9,12]

   interval │ start > curEnd ? │ action                 │ curEnd │ free
   ─────────┼──────────────────┼────────────────────────┼────────┼─────────
   [1,3]    │ (first)          │ curEnd = 3             │   3    │
   [2,4]    │ 2 > 3 ❌          │ curEnd = max(3,4)      │   4    │
   [2,5]    │ 2 > 4 ❌          │ curEnd = max(4,5)      │   5    │
   [6,7]    │ 6 > 5 ✅          │ gap [5,6]; curEnd = 7  │   7    │ [5,6]
   [9,12]   │ 9 > 7 ✅          │ gap [7,9]; curEnd = 12 │  12    │ [7,9]

   answer = [[5,6],[7,9]] ✅

   LeetCode example 1:  [[[1,2],[5,6]],[[1,3]],[[4,10]]]
     sorted: [1,2] [1,3] [4,10] [5,6] → busy [1,3] [4,10] → free [[3,4]] ✅
```

### Pseudocode

```
function employeeFreeTime(schedule):
    all ← every interval from every employee, sorted by start
    result ← empty
    curEnd ← all[0].end
    for each [s, e] in all (from the 2nd):
        if s > curEnd:                      // strict: no zero-length gaps
            append [curEnd, s] to result
        curEnd ← max(curEnd, e)
    return result
```

### Heap upgrade (k-way merge)

```
   Each employee's list is ALREADY sorted.
   Put the first interval of each employee into a min-heap (by start).
   Pop the smallest, push that employee's next interval.
   → visits intervals in start order without a full sort.

   Full sort:  O(N log N)        N = total intervals
   Heap:       O(N log k)        k = number of employees
```

### 📌 Points to remember
- **Free time = gaps after merging everyone's busy time.**
- Only gaps **between** busy blocks count. Nothing before the first or after the last (those are infinite).
- Use `s > curEnd` so touching blocks `[1,3]`, `[3,5]` don't create a `[3,3]` gap.

---

## 11. Minimum Interval to Include Each Query (Hard)

### Problem
`intervals[i] = [left, right]` (closed), size = `right − left + 1`.
For each query `q`, return the **size of the smallest interval containing q**, or −1.

### Visualize it

```
   intervals = [[1,4],[2,4],[3,6],[4,4]]     queries = [2,3,4,5]

   x →     1    2    3    4    5    6
           ┼────┼────┼────┼────┼────┼
   [1,4]   ├──────────────┤             size 4
   [2,4]        ├─────────┤             size 3
   [3,6]             ├──────────────┤   size 4
   [4,4]                  ●             size 1
                ▲    ▲    ▲    ▲
               q=2  q=3  q=4  q=5
   answer:      3    3    1    4
```

### The offline trick

```
   Answering queries in the ORIGINAL order is hard.
   Answer them in SORTED order instead, then put answers back in place.

   As q grows left → right:
     • ADD every interval with left ≤ q        (it might contain q)
     • REMOVE intervals with right < q         (they're behind us forever)
     • the SMALLEST remaining interval is the answer

   "smallest remaining" → min-heap keyed by (size, right)

          sorted intervals by left ──►  push when left ≤ q
                                          │
                                          ▼
                              ┌────────────────────────┐
                              │ min-heap (size, right) │
                              └────────────────────────┘
                                          │
                               pop while top.right < q   (lazy delete)
                                          │
                                          ▼
                                 answer = top.size
```

### Trace

```
   intervals sorted by left: [1,4]s4 [2,4]s3 [3,6]s4 [4,4]s1
   queries sorted:           2, 3, 4, 5

   q │ push (left ≤ q)    │ pop expired (right < q)   │ heap (size,right)          │ ans
   ──┼────────────────────┼───────────────────────────┼────────────────────────────┼────
   2 │ [1,4], [2,4]       │ —                         │ (3,4) (4,4)                │  3
   3 │ [3,6]              │ —                         │ (3,4) (4,4) (4,6)          │  3
   4 │ [4,4]              │ —                         │ (1,4) (3,4) (4,4) (4,6)    │  1
   5 │ —                  │ (1,4) (3,4) (4,4)         │ (4,6)                      │  4

   answer (back in original query order) = [3, 3, 1, 4] ✅
```

> **Why is it safe to pop forever?** Queries only get bigger. An interval whose right end is
> behind the current query is behind every later query too.

### Pseudocode

```
function minInterval(intervals, queries):
    sort intervals by left
    order ← query indices sorted by query value
    heap ← empty min-heap of (size, right)
    ans ← array of len(queries), all −1
    i ← 0
    for each idx in order:
        q ← queries[idx]
        while i < n and intervals[i].left ≤ q:
            push (intervals[i].right − intervals[i].left + 1, intervals[i].right)
            i ← i + 1
        while heap not empty and heap.top.right < q:
            pop
        if heap not empty:
            ans[idx] ← heap.top.size
    return ans
```

### 📌 Points to remember
- **Offline queries:** sort them, remember original indices, write answers back.
- Heap key = **(size, right)**. Expired check uses `right < q`.
- Lazy deletion: only pop expired items when they reach the top.
- O((n + q) log n) time.

---

## 12. Jump Game (Medium)

### Problem
`nums[i]` = maximum jump length from index `i`. Starting at index 0, can you reach the last index?

### Visualize it

```
   [2,3,1,1,4]                         [3,2,1,0,4]

   idx: 0   1   2   3   4              idx: 0   1   2   3   4
        2   3   1   1   4                   3   2   1   0   4
        ├──────►                            ├──────────►
            ├──────────► reach 4 ✅              ├──────►
                                                    ├──►
                                                        ✖ stuck at 3
                                            every path lands on the 0 ❌
```

### The greedy idea: track the farthest reachable index

```
   farthest = 0
   walk i = 0, 1, 2, ...
       if i > farthest → you can't even stand here → false
       farthest = max(farthest, i + nums[i])
       if farthest ≥ last → true

   No need to choose WHERE to jump. Just remember how far ANY path could get.
```

### Trace

```
   [2,3,1,1,4], last = 4

   i │ i ≤ farthest? │ i + nums[i] │ farthest │ ≥ 4 ?
   ──┼───────────────┼─────────────┼──────────┼──────
   0 │ 0 ≤ 0 ✅       │ 0+2 = 2     │    2     │
   1 │ 1 ≤ 2 ✅       │ 1+3 = 4     │    4     │ ✅ true

   [3,2,1,0,4], last = 4

   i │ i ≤ farthest? │ i + nums[i] │ farthest
   ──┼───────────────┼─────────────┼─────────
   0 │ 0 ≤ 0 ✅       │ 3           │    3
   1 │ 1 ≤ 3 ✅       │ 3           │    3
   2 │ 2 ≤ 3 ✅       │ 3           │    3
   3 │ 3 ≤ 3 ✅       │ 3           │    3
   4 │ 4 ≤ 3 ❌       │             │          → false ✅
```

### Pseudocode

```
function canJump(nums):
    farthest ← 0
    for i from 0 to n−1:
        if i > farthest: return false
        farthest ← max(farthest, i + nums[i])
    return true
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every jump (recursion) | exponential | O(n) |
| DP: `canReach[i]` | O(n²) | O(n) |
| **Greedy farthest** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Reachable indices always form a prefix `[0, farthest]`.** That's why one number is enough.
- The only way to fail is a "0 trap" that the farthest reach can't jump over.
- Backward version: let `goal = last`; walking right to left, if `i + nums[i] ≥ goal` then `goal = i`. Answer: `goal == 0`.

---

## 13. Jump Game II (Medium)

### Problem
Same jumps, the last index is **guaranteed reachable**. Return the **minimum number of jumps**.

### BFS levels without a queue

```
   [2,3,1,1,4]

   idx:     0      1    2      3    4
   nums:    2      3    1      1    4
          ┌───┐ ┌─────────┐ ┌─────────┐
          │ 0 │ │  1   2  │ │  3   4  │
          └───┘ └─────────┘ └─────────┘
          jumps=0  jumps=1     jumps=2

   Level k = all indices reachable with exactly k jumps (at best).
   Each level is a contiguous WINDOW. The next window ends at the
   farthest reach from anywhere inside the current window.
```

### The rule

```
   walk i through the current window, update farthest
   when i hits currentEnd (end of this window):
        jumps++                 ← we must jump to go further
        currentEnd = farthest   ← the next window's end

   ⚠ Loop i only to n−2: standing ON the last index needs no more jumps.
```

### Trace

```
   [2,3,1,1,4], loop i = 0..3

   i │ i+nums[i] │ farthest │ i == currentEnd ? │ jumps │ currentEnd
   ──┼───────────┼──────────┼───────────────────┼───────┼───────────
   0 │    2      │    2     │ 0 == 0 ✅ jump     │   1   │    2
   1 │    4      │    4     │ 1 == 2 ❌          │   1   │    2
   2 │    3      │    4     │ 2 == 2 ✅ jump     │   2   │    4
   3 │    4      │    4     │ 3 == 4 ❌          │   2   │    4

   answer = 2 ✅    (0 → 1 → 4)
```

### Pseudocode

```
function jump(nums):
    jumps ← 0, currentEnd ← 0, farthest ← 0
    for i from 0 to n−2:
        farthest ← max(farthest, i + nums[i])
        if i == currentEnd:
            jumps ← jumps + 1
            currentEnd ← farthest
            if currentEnd ≥ n−1: break       // optional early exit
    return jumps
```

### 📌 Points to remember
- It's **BFS** where every level is a contiguous range → O(n) time, O(1) space.
- Loop to `n−2`, or you count one extra jump when `currentEnd` lands exactly on the last index.
- If reaching the end were not guaranteed: when `i == currentEnd` and `farthest ≤ i`, return −1. Taps (next) needs exactly this.

---

## 14. Minimum Number of Taps to Open to Water a Garden (Hard)

### Problem
Garden from `0` to `n`. Tap `i` (at position `i`, for `i = 0..n`) waters `[i − ranges[i], i + ranges[i]]`.
Return the **minimum taps** to water the whole garden, or −1.

### Step 1: turn taps into intervals

```
   n = 7, ranges = [1,2,1,0,2,1,0,1]

   x →        0    1    2    3    4    5    6    7
              ┼────┼────┼────┼────┼────┼────┼────┼
   tap0 [-1,1]├────┤
   tap1 [-1,3]├──────────────┤                      ✅ chosen
   tap2 [1,3]      ├─────────┤
   tap3 [3,3]                ●
   tap4 [2,6]           ├────────────────────┤      ✅ chosen
   tap5 [4,6]                     ├──────────┤
   tap6 [6,6]                                ●
   tap7 [6,8]                                ├────┤ ✅ chosen

   (left ends clamp to 0, right ends clamp to n)
```

### Step 2: it's Jump Game II

```
   reach[x] = farthest right end of any tap whose LEFT end is x
            = "from position x, how far can one tap take me?"

   x:       0   1   2   3   4   5   6   7
   reach:   3   3   6   3   6   0   7   0

   Now covering [0, n] with fewest intervals
   = jumping from 0 to n with fewest jumps, where reach[x] is your jump.
```

### Trace (Jump Game II with a "stuck" check)

```
   loop i = 0 .. n−1  (positions 0..6)

   i │ reach[i] │ farthest │ i == curEnd ? │ stuck (farthest ≤ i)? │ taps │ curEnd
   ──┼──────────┼──────────┼───────────────┼───────────────────────┼──────┼───────
   0 │    3     │    3     │ ✅             │ 3 ≤ 0 ❌               │  1   │   3
   1 │    3     │    3     │ ❌             │                       │  1   │   3
   2 │    6     │    6     │ ❌             │                       │  1   │   3
   3 │    3     │    6     │ ✅             │ 6 ≤ 3 ❌               │  2   │   6
   4 │    6     │    6     │ ❌             │                       │  2   │   6
   5 │    0     │    6     │ ❌             │                       │  2   │   6
   6 │    7     │    7     │ ✅             │ 7 ≤ 6 ❌               │  3   │   7

   answer = 3 ✅   (taps 1, 4, 7)

   Gap example: n = 3, ranges = [0,0,0,0]
     reach = [0,1,2,3]
     i=0: farthest = 0, i == curEnd, 0 ≤ 0 → stuck → −1 ✅
```

### Pseudocode

```
function minTaps(n, ranges):
    reach ← array of n+1, all 0
    for i from 0 to n:
        left  ← max(0, i − ranges[i])
        right ← min(n, i + ranges[i])
        reach[left] ← max(reach[left], right)

    taps ← 0, curEnd ← 0, farthest ← 0
    for i from 0 to n−1:
        farthest ← max(farthest, reach[i])
        if i == curEnd:
            if farthest ≤ i: return −1        // nothing extends past here: a gap
            taps ← taps + 1
            curEnd ← farthest
    return taps
```

### Alternative view: interval covering

```
   Sort taps by left end. Repeatedly, among intervals starting at or before
   the "covered so far" point, pick the one reaching farthest right.
   Same greedy, same answer. (LC 1024 Video Stitching is this exact problem.)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| DP: `dp[x]` = min taps to cover `[0,x]` | O(n · maxRange) | O(n) |
| Sort intervals + greedy cover | O(n log n) | O(n) |
| **reach array + Jump Game II** | **O(n)** | **O(n)** ✅ |

### 📌 Points to remember
- **Interval covering = Jump Game II** once you build `reach[left] = max right`.
- Clamp left to 0 and right to n.
- The −1 check: at a window boundary, if nothing reaches past `i`, there's a dry gap.
- Coverage is about the **segment** `[0, n]`, not points: tap 3 with range 0 waters nothing useful.

---

## 15. Master Cheat Sheet

### All 14 problems at a glance

```
┌──────────────────────────────┬──────────────┬──────────────────────────────────────────┬───────────┐
│ Problem                      │ Sort / tool  │ Core move                                │ Time      │
├──────────────────────────────┼──────────────┼──────────────────────────────────────────┼───────────┤
│ Activity Selection           │ END          │ take if start > lastEnd                  │ O(n log n)│
│ Meeting Rooms                │ START        │ clash if start < prev.end                │ O(n log n)│
│ Non-overlapping Intervals    │ END          │ n − max kept (start ≥ lastEnd)           │ O(n log n)│
│ Min Arrows                   │ END          │ new arrow if start > arrowX              │ O(n log n)│
│ Merge Intervals              │ START        │ extend if start ≤ last.end, else push    │ O(n log n)│
│ Insert Interval              │ (sorted)     │ 3 phases: before / absorb / after        │ O(n)      │
│ Interval List Intersections  │ two pointers │ [max starts, min ends]; advance 1st end  │ O(m+n)    │
│ Meeting Rooms II             │ heap / sweep │ peak overlap                             │ O(n log n)│
│ Car Pooling                  │ diff array   │ +p at from, −p at to, check running sum  │ O(n+R)    │
│ Employee Free Time           │ START (heap) │ merge all, gaps are free                 │ O(N log k)│
│ Min Interval per Query       │ offline+heap │ push left ≤ q, pop right < q, top size   │ O((n+q)log)│
│ Jump Game                    │ reach        │ fail if i > farthest                     │ O(n)      │
│ Jump Game II                 │ reach levels │ jump when i == curEnd                    │ O(n)      │
│ Min Taps                     │ reach levels │ reach[left]=max right, then Jump Game II │ O(n)      │
└──────────────────────────────┴──────────────┴──────────────────────────────────────────┴───────────┘
```

### Pattern family tree

```
                            INTERVALS & REACH
                                   │
     ┌──────────────────┬──────────┴─────────┬──────────────────────┐
     │                  │                    │                      │
  SELECTION          COMBINING          COUNTING OVERLAP          REACH
  (sort by END)      (sort by START)    (sweep / heap)            (farthest)
     │                  │                    │                      │
 ├ Activity Sel.    ├ Meeting Rooms     ├ Meeting Rooms II      ├ Jump Game
 ├ Non-overlapping  ├ Merge Intervals   ├ Car Pooling           ├ Jump Game II
 └ Min Arrows       ├ Insert Interval   ├ Min Interval / Query  └ Min Taps
                    ├ Intersections     │   (offline + heap)      (cover = jumps)
                    └ Employee Free Time
```

### Touching endpoints card

```
  ┌──────────────────────────────┬──────────────┬─────────────────────────┐
  │ Problem                      │ Touch counts │ Comparison              │
  │                              │ as overlap?  │                         │
  ├──────────────────────────────┼──────────────┼─────────────────────────┤
  │ Activity Selection (GFG)     │ yes          │ take if start > lastEnd │
  │ Meeting Rooms I / II         │ no           │ clash if start < end    │
  │ Non-overlapping Intervals    │ no           │ keep if start ≥ lastEnd │
  │ Min Arrows                   │ yes          │ new if start > arrowX   │
  │ Merge Intervals              │ yes          │ merge if start ≤ end    │
  │ Interval Intersections       │ yes          │ valid if lo ≤ hi        │
  │ Car Pooling                  │ no           │ drop at `to` first      │
  └──────────────────────────────┴──────────────┴─────────────────────────┘
```

### Optimization checklist

```
  ☐ Is the input already sorted?                → skip the sort, O(n) (Insert, Intersections)
  ☐ "Max non-overlapping" / "min remove"?       → sort by END, one pass
  ☐ "Peak overlap" / rooms / platforms?         → two sorted arrays or sweep events
  ☐ Small coordinate range?                     → difference array instead of sorting
  ☐ Many queries on intervals?                  → sort queries offline + heap
  ☐ k sorted lists?                             → k-way merge with a heap, O(N log k)
  ☐ "Reach the end" / "cover [0,n]"?            → farthest reach, BFS levels as windows
  ☐ Tempted to DP over jumps?                   → reach greedy is O(n), O(1)
```

### 🚩 Common bugs to avoid

```
  ✗ Sorting by START for max non-overlapping (or by length): wrong answer
  ✗ Wrong touching rule: ≤ vs < (check the examples!)
  ✗ Merge: last.end = next.end instead of max(last.end, next.end)
  ✗ Sorting start[] and finish[] separately in Activity Selection
  ✗ Comparator with a − b on values near ±2³¹: overflow
  ✗ Insert Interval: forgetting to push newInterval when nothing overlaps
  ✗ Intersections: advancing the wrong pointer (advance the one ending FIRST)
  ✗ Min Interval per Query: losing the original query order
  ✗ Jump Game II: looping to n−1 and counting an extra jump
  ✗ Taps: forgetting to clamp to [0, n], or missing the −1 gap check
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "If I draw this on a number line, am I SELECTING,       ║
   ║   COMBINING, COUNTING overlaps, or EXTENDING reach?"     ║
   ╚══════════════════════════════════════════════════════════╝
     The answer picks the sort key and the one-pass state.
```

---

### ✅ Progress tracker

- [ ] Activity Selection (Easy)
- [ ] Meeting Rooms (Easy)
- [ ] Non-overlapping Intervals (Medium)
- [ ] Minimum Number of Arrows to Burst Balloons (Medium)
- [ ] Merge Intervals (Medium)
- [ ] Insert Interval (Medium)
- [ ] Interval List Intersections (Medium)
- [ ] Meeting Rooms II (Medium)
- [ ] Car Pooling (Medium)
- [ ] Employee Free Time (Hard)
- [ ] Minimum Interval to Include Each Query (Hard)
- [ ] Jump Game (Medium)
- [ ] Jump Game II (Medium)
- [ ] Minimum Number of Taps to Open to Water a Garden (Hard)
