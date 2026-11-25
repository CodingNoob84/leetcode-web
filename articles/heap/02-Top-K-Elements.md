# Top-K Elements (Heap): A Visual Guide

> **Goal:** Learn to *see* "top K" problems, pick the right heap (it's usually the opposite of what you'd guess), and know when a heap is overkill.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on `01-Implementation-of-Heap.md` (how a heap works inside). Here we use a heap as a tool.

---

## Table of Contents

0. [The Big Idea: Why a Heap for Top-K?](#0-the-big-idea-why-a-heap-for-top-k)
1. [Kth Largest Element in an Array (Medium)](#1-kth-largest-element-in-an-array-medium)
2. [Kth Largest Element in a Stream (Easy)](#2-kth-largest-element-in-a-stream-easy)
3. [K Closest Points to Origin (Medium)](#3-k-closest-points-to-origin-medium)
4. [Top K Frequent Elements (Medium)](#4-top-k-frequent-elements-medium)
5. [Sort Characters By Frequency (Medium)](#5-sort-characters-by-frequency-medium)
6. [Top K Frequent Words (Medium)](#6-top-k-frequent-words-medium)
7. [Reorganize String (Medium)](#7-reorganize-string-medium)
8. [Rearrange String k Distance Apart (Hard)](#8-rearrange-string-k-distance-apart-hard)
9. [Find Median from Data Stream (Hard)](#9-find-median-from-data-stream-hard)
10. [Sliding Window Median (Hard)](#10-sliding-window-median-hard)
11. [Master Cheat Sheet](#11-master-cheat-sheet)

> **Suggested order:** Kth Largest (Array) → Kth Largest (Stream) → K Closest Points → Top K Frequent Elements
> → Sort Characters By Frequency → Top K Frequent Words → Reorganize String → Rearrange String k Distance Apart
> → Find Median from Data Stream → Sliding Window Median.
> The first six are "keep the best K". The next two are "always use the most frequent next". The last two are "two heaps for the middle".

> **Reading the drawings:** heaps are drawn as `{ ... }` listed **root first, then the rest in sorted order**.
> A real heap array isn't fully sorted, but only the root matters for these problems, and sorted is easier to read.

---

## 0. The Big Idea: Why a Heap for Top-K?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TOP-K HEAP"                            │
├──────────────────────────────────────────────────────────────────┤
│  • "K-th largest / K-th smallest"                                │
│  • "top K", "K most frequent", "K closest"                       │
│  • "median" of a growing stream or a sliding window              │
│  • Data arrives ONE AT A TIME (stream) and you need the best     │
│    so far, cheaply, after every arrival                          │
│  • "always take the most frequent / largest next" (greedy +      │
│    heap: Reorganize String, Task Scheduler)                      │
└──────────────────────────────────────────────────────────────────┘
```

### A heap gives you ONE thing fast: the extreme

```
     MIN-HEAP                          MAX-HEAP
        1          root = smallest        9         root = largest
       / \                               / \
      3   2         peek   O(1)         7   8        peek   O(1)
     / \                                / \
    5   4           push   O(log n)    3   5         push   O(log n)
                    pop    O(log n)                  pop    O(log n)
```

### 🧠 The counter-intuitive rule: K LARGEST → MIN-heap

```
  You want the K LARGEST numbers. Keep a MIN-heap of size K.

        ┌──────────────── the club (holds K people) ───────────────┐
        │                                                          │
        │      [ 9 ]   [ 8 ]   [ 7 ]   [ 6 ]                       │
        │                                  ▲                       │
        │                              🚪 BOUNCER = root = 6        │
        │                              (the WEAKEST member)        │
        └──────────────────────────────────────────────────────────┘

   New arrival x:
     x = 4  →  4 < 6  → "you're weaker than my weakest member, go away"
     x = 10 →  10 > 6 → let 10 in, kick out 6. New bouncer = 7.

   The root is the weakest of the top K
          = exactly the K-th largest. 🎯
```

```
  ┌─────────────────────┬──────────────────────┬────────────────────────────┐
  │ You want            │ Use                  │ Why                        │
  ├─────────────────────┼──────────────────────┼────────────────────────────┤
  │ K largest / Kth lg. │ MIN-heap of size K   │ root = weakest survivor    │
  │ K smallest / Kth sm.│ MAX-heap of size K   │ root = biggest survivor    │
  │ K closest           │ MAX-heap by distance │ evict the FARTHEST         │
  │ K most frequent     │ MIN-heap by count    │ evict the LEAST frequent   │
  └─────────────────────┴──────────────────────┴────────────────────────────┘

   Rule of thumb: the heap's root is the one you'd KICK OUT next.
```

### The size-K template

```
function topK(items, k):
    heap ← empty heap, ordered so the root is the "worst" kept item
    for each x in items:
        push x into heap
        if size(heap) > k:
            pop heap                  // evict the worst
    return heap                       // holds the best k; root = k-th best
```

> 💡 Small speed-up: when the heap is full, only push if `x` beats the root. Otherwise skip it.

### Which tool? Cost comparison

```
  ┌─────────────────────────┬──────────────────┬──────────┬─────────────────────────────┐
  │ Approach                │ Time             │ Space    │ Best when                   │
  ├─────────────────────────┼──────────────────┼──────────┼─────────────────────────────┤
  │ Sort everything         │ O(n log n)       │ O(1)–O(n)│ simple, small n, one query  │
  │ Size-K heap             │ O(n log k)       │ O(k)     │ k ≪ n, STREAMS, online data │
  │ Quickselect             │ O(n) avg, O(n²)  │ O(1)     │ one-shot Kth, array in RAM  │
  │                         │ worst            │          │                             │
  │ Bucket sort by count    │ O(n)             │ O(n)     │ frequencies bounded by n    │
  └─────────────────────────┴──────────────────┴──────────┴─────────────────────────────┘
```

### The frequency map + heap combo

```
  Many problems are "top K by FREQUENCY":

    step 1: COUNT      [1,1,1,2,2,3]  ──►  {1:3, 2:2, 3:1}
    step 2: HEAP       push (count, value) pairs, size-k template
    step 3: OUTPUT     pop / read the heap

  The heap never sees the raw array, only the distinct values.
  If there are m distinct values: O(n + m log k).
```

### The two-heaps idea (for medians)

```
            LOW half                          HIGH half
         (MAX-heap)                         (MIN-heap)
    ┌────────────────────┐            ┌────────────────────┐
    │  1   2   3   [4]   │            │   [5]   6   7   8  │
    └───────────────▲────┘            └────▲───────────────┘
                    │                      │
             biggest of the low     smallest of the high

    The two roots sit right at the middle.
    Median = one root (odd count) or the average of both (even count).
```

### Comparator tie-breaking: say it out loud

```
  When two items tie on the main key, the problem usually says who wins.
  Write the rule as: "the root is the item I would kick out first".

   Top K Frequent Words: higher count wins; on a tie, the
   lexicographically SMALLER word wins.

   → in a MIN-heap of size k, the root must be the LOSER:
       lower count first; on a tie, the LARGER word first.

   ⚠ The tie-break flips direction compared to the main key.
     This is the #1 bug in heap problems.
```

---

## 1. Kth Largest Element in an Array (Medium)

### Problem
Return the **k-th largest** element of an unsorted array (counting duplicates, so `[3,3]` with k=2 is 3).

### Visualize it

```
   nums = [ 3, 2, 1, 5, 6, 4 ],  k = 2

   sorted descending:  6   5   4   3   2   1
                       1st 2nd
                           ▲
                        answer = 5
```

### Decision picture

```
   For each number:
                  push into min-heap
                         │
             size > k ?  ├── no ──► keep going
                         │
                        yes
                         │
                 pop the root (smallest)  ← it can't be in the top k
```

### The 4 steps

| Step | Answer |
|------|--------|
| Structure | min-heap, size at most `k` |
| Per element | push, then pop if size > k |
| Invariant | heap holds the `k` largest seen so far |
| Answer | root of the heap |

### Trace

```
  x   │ after push        │ size > 2? │ after pop    │ root
  ────┼───────────────────┼───────────┼──────────────┼──────
  3   │ {3}               │ no        │ {3}          │ 3
  2   │ {2, 3}            │ no        │ {2, 3}       │ 2
  1   │ {1, 2, 3}         │ yes       │ {2, 3}       │ 2
  5   │ {2, 3, 5}         │ yes       │ {3, 5}       │ 3
  6   │ {3, 5, 6}         │ yes       │ {5, 6}       │ 5
  4   │ {4, 5, 6}         │ yes       │ {5, 6}       │ 5   ✅ answer 5
```

### Pseudocode: heap

```
function findKthLargest(nums, k):
    heap ← empty MIN-heap
    for each x in nums:
        push x into heap
        if size(heap) > k:
            pop heap
    return top(heap)
```

### 🚀 Alternative: Quickselect (O(n) average)

```
  Idea: the k-th largest sits at index (n − k) in ASCENDING sorted order.
  Partition around a pivot. The pivot lands at its FINAL sorted index p.

     ┌───────── ≤ pivot ─────────┬─────┬──── > pivot ────┐
     │                           │  P  │                 │
     └───────────────────────────┴─────┴─────────────────┘
                                   p
       target < p → recurse LEFT only
       target > p → recurse RIGHT only
       target = p → done!

   Unlike quicksort, you only follow ONE side → n + n/2 + n/4 + ... ≈ 2n.
```

**Trace** (`[3,2,1,5,6,4]`, k = 2 → target index 6 − 2 = **4**), Lomuto partition, pivot = last element:

```
  Round 1: range [0..5], pivot = 4
     scan 3 (≤4 ✓) 2 (✓) 1 (✓) 5 (✗) 6 (✗)
     → [ 3, 2, 1, 4, 6, 5 ]     pivot lands at p = 3
     target 4 > 3 → go RIGHT, range [4..5]

  Round 2: range [4..5], pivot = 5
     scan 6 (≤5 ✗)
     → [ 3, 2, 1, 4, 5, 6 ]     pivot lands at p = 4
     target 4 = 4 → answer nums[4] = 5 ✅
```

```
function quickselect(nums, k):
    target ← n − k
    lo ← 0, hi ← n − 1
    loop:
        p ← partition(nums, lo, hi)        // pick a RANDOM pivot in practice
        if p == target: return nums[p]
        if p < target: lo ← p + 1
        else:          hi ← p − 1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort | O(n log n) | O(1) |
| **Min-heap size k** | **O(n log k)** | **O(k)** |
| Quickselect | O(n) avg, O(n²) worst | O(1) |

### 📌 Points to remember
- K **largest** → **min**-heap. The root is the K-th largest.
- Quickselect: always pick a **random** pivot, or sorted input becomes O(n²).
- Duplicates count separately (`[3,3,3]`, k = 2 → 3).

---

## 2. Kth Largest Element in a Stream (Easy)

### Problem
Design a class: built with `k` and an initial array, then `add(val)` inserts a number and returns the current **k-th largest**.

### Visualize it

```
   The stream keeps flowing. The bouncer keeps guarding.

   ──► 3 ──► 5 ──► 10 ──► 9 ──► 4 ──►
                                         ┌───────── min-heap, size k=3 ─┐
                                         │  root = k-th largest so far  │
                                         └──────────────────────────────┘
```

> This is Problem 1 turned into a class. The heap **persists between calls**.

### Pseudocode

```
class KthLargest:
    constructor(k, nums):
        this.k ← k
        this.heap ← empty MIN-heap
        for each x in nums: this.add(x)

    add(val):
        push val into heap
        if size(heap) > k: pop heap
        return top(heap)
```

### Trace (k = 3, initial `[4, 5, 8, 2]`)

```
  Build:
    add 4 → {4}
    add 5 → {4, 5}
    add 8 → {4, 5, 8}
    add 2 → {2, 4, 5, 8} → pop 2 → {4, 5, 8}

  op       │ after push          │ pop?   │ heap after    │ returns
  ─────────┼─────────────────────┼────────┼───────────────┼────────
  add(3)   │ {3, 4, 5, 8}        │ pop 3  │ {4, 5, 8}     │ 4
  add(5)   │ {4, 5, 5, 8}        │ pop 4  │ {5, 5, 8}     │ 5
  add(10)  │ {5, 5, 8, 10}       │ pop 5  │ {5, 8, 10}    │ 5
  add(9)   │ {5, 8, 9, 10}       │ pop 5  │ {8, 9, 10}    │ 8
  add(4)   │ {4, 8, 9, 10}       │ pop 4  │ {8, 9, 10}    │ 8

  Outputs: 4, 5, 5, 8, 8 ✅
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| constructor | O(n log k) | O(k) |
| add | **O(log k)** | — |

### 📌 Points to remember
- Sorting on every `add` would be O(n log n) per call. The heap is O(log k).
- The initial array may have **fewer than k** items. That's fine: the problem guarantees ≥ k items by the time you query.
- A stream is where the heap beats quickselect: quickselect needs the whole array again each time.

---

## 3. K Closest Points to Origin (Medium)

### Problem
Given points `(x, y)`, return the `k` closest to `(0, 0)` (Euclidean distance), in any order.

### Visualize it

```
          y
          │      • (3,3)  d² = 18
          │
     •(-2,4)       d² = 20
          │
   ───────┼──────────────── x
          │    • (5,−1)  d² = 26
          │

   k = 2 → keep the 2 closest: (3,3) and (−2,4)
```

### Key tricks

```
  ① Compare SQUARED distance:  x² + y²
     √ is monotonic, so ordering is the same. No square roots, no decimals.

  ② K closest = K SMALLEST distances → MAX-heap of size k
     The root is the FARTHEST of the kept points = the one to evict.
```

### Trace (points `[[3,3],[5,−1],[−2,4]]`, k = 2)

```
  point   │ d² │ max-heap after push (root = farthest) │ size > 2? │ after
  ────────┼────┼────────────────────────────────────────┼───────────┼──────────────
  (3,3)   │ 18 │ {18}                                   │ no        │ {18}
  (5,−1)  │ 26 │ {26, 18}                               │ no        │ {26, 18}
  (−2,4)  │ 20 │ {26, 20, 18}                           │ yes → pop │ {20, 18}
                                                                       26 evicted
  Answer: points with d² 18 and 20 → [(3,3), (−2,4)] ✅
```

### Pseudocode

```
function kClosest(points, k):
    heap ← empty MAX-heap keyed by d²
    for each (x, y) in points:
        push (x*x + y*y, (x, y)) into heap
        if size(heap) > k:
            pop heap                       // remove the farthest
    return all points left in heap
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort by d² | O(n log n) | O(n) |
| **Max-heap size k** | **O(n log k)** | **O(k)** |
| Quickselect on d² | O(n) avg | O(1) |

### 📌 Points to remember
- "Closest" = smallest → **max**-heap (keep the opposite of what you evict).
- Use squared distance. With big coordinates, use 64-bit integers.
- Output order doesn't matter, so no final sort is needed.

---

## 4. Top K Frequent Elements (Medium)

### Problem
Return the `k` most frequent values (any order). The answer is unique.

### Visualize it

```
   nums = [1, 1, 1, 2, 2, 3],  k = 2

   value │ count
   ──────┼──────────
     1   │ ███        3
     2   │ ██         2
     3   │ █          1

   top 2 → [1, 2]
```

### Approach A: count + min-heap of size k

```
   min-heap ordered by COUNT
   root = least frequent survivor = the one to evict
```

**Trace**

```
  counts: {1:3, 2:2, 3:1}

  push (count, val) │ heap (root first)        │ size > 2? │ after
  ──────────────────┼──────────────────────────┼───────────┼────────────────────
  (3, 1)            │ {(3,1)}                  │ no        │ {(3,1)}
  (2, 2)            │ {(2,2), (3,1)}           │ no        │ {(2,2), (3,1)}
  (1, 3)            │ {(1,3), (2,2), (3,1)}    │ yes → pop │ {(2,2), (3,1)}
                                                              (1,3) evicted
  Answer: [1, 2] ✅
```

### Approach B: bucket sort (O(n))

```
  A count can only be 1..n. Make n+1 buckets indexed BY COUNT.

   bucket index (count):  0    1     2     3     4    5    6
                         [ ] [ 3 ] [ 2 ] [ 1 ] [ ] [ ] [ ]

   Scan from the HIGHEST count down, collect until you have k:
     count 6, 5, 4: empty
     count 3: take 1     → [1]
     count 2: take 2     → [1, 2]   have k = 2, stop ✅
```

### Pseudocode

```
function topKFrequent(nums, k):          // heap version
    count ← frequency map of nums
    heap ← empty MIN-heap keyed by count
    for each (val, c) in count:
        push (c, val) into heap
        if size(heap) > k: pop heap
    return values in heap

function topKFrequentBuckets(nums, k):   // bucket version
    count ← frequency map of nums
    buckets ← array of n+1 empty lists
    for each (val, c) in count: append val to buckets[c]
    result ← empty list
    for c from n down to 1:
        for each val in buckets[c]:
            append val to result
            if size(result) == k: return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Count + sort | O(n + m log m) | O(m) |
| **Count + heap** | **O(n + m log k)** | O(m + k) |
| **Bucket sort** | **O(n)** | O(n) |

(m = number of distinct values)

### 📌 Points to remember
- The heap holds **(count, value) pairs**, not raw numbers.
- Bucket sort works because a count can never exceed n.
- The pattern "count → heap of size k" covers Problems 4, 5 and 6.

---

## 5. Sort Characters By Frequency (Medium)

### Problem
Rearrange a string so characters appear in **decreasing order of frequency** (equal-frequency groups in any order).

### Visualize it

```
   "tree"  →  counts {t:1, r:1, e:2}

     e e │ r │ t      → "eert"
     e e │ t │ r      → "eetr"     both are valid ✅
```

### Approach A: max-heap of (count, char)

```
  Pop the most frequent char, write it count times, repeat.
  (Here we need ALL chars in order, so the heap has no size limit.)
```

**Trace ("tree")**, ties broken alphabetically:

```
  max-heap: {(2,e), (1,r), (1,t)}

  pop (2,e) → output "ee"
  pop (1,r) → output "eer"
  pop (1,t) → output "eert"  ✅
```

### Approach B: buckets by count

```
   bucket index (count):   0    1        2       3    4
                          [ ] [ t, r ] [ e ]   [ ]  [ ]

   scan high → low:  count 2: e → "ee"
                     count 1: t, r → "eetr"  ✅
```

### Pseudocode

```
function frequencySort(s):
    count ← frequency map of s
    heap ← MAX-heap of (c, ch) for each (ch, c) in count
    result ← empty string builder
    while heap not empty:
        (c, ch) ← pop heap
        append ch, c times, to result
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Heap | O(n + m log m) | O(n) |
| Buckets | O(n) | O(n) |

(m ≤ number of distinct characters, at most 62 for letters + digits, so the heap is effectively O(n))

### 📌 Points to remember
- Case matters: `'A'` and `'a'` are different characters (`"Aabb"` → `"bbAa"` or `"bbaA"`).
- Build with a string builder / list, not repeated `+` on a string.
- Same "count first, order by count second" pattern as Problem 4.

---

## 6. Top K Frequent Words (Medium)

### Problem
Return the `k` most frequent words, sorted by **frequency high → low**, and for equal frequency by **lexicographic order (a → z)**.

### Visualize it

```
   words = ["i","love","leetcode","i","love","coding"],  k = 2

   word      │ count
   ──────────┼──────
   i         │ 2
   love      │ 2
   leetcode  │ 1
   coding    │ 1

   tie at 2: "i" < "love" alphabetically → ["i", "love"] ✅
```

### ⚠️ The comparator trap

```
  Ranking (who is BETTER):  higher count; on a tie, SMALLER word.

  MIN-heap of size k: the root must be the WORST kept word.
     worse = lower count
           OR same count and LARGER word   ← flips!

     (2,"love") vs (2,"i"):  same count, "love" > "i"
                             → "love" is WORSE → "love" sits above "i"
```

### Trace

```
  counts in the order seen: i:2, love:2, leetcode:1, coding:1

  push            │ heap (root = worst first)                 │ size>2? │ after
  ────────────────┼───────────────────────────────────────────┼─────────┼───────────────────────────
  (2,"i")         │ {(2,i)}                                   │ no      │ {(2,i)}
  (2,"love")      │ {(2,love), (2,i)}                         │ no      │ {(2,love), (2,i)}
  (1,"leetcode")  │ {(1,leetcode), (2,love), (2,i)}           │ yes     │ {(2,love), (2,i)}
  (1,"coding")    │ {(1,coding), (2,love), (2,i)}             │ yes     │ {(2,love), (2,i)}

  Pop all (worst first): "love", "i"
  Reverse              : ["i", "love"] ✅
```

### Pseudocode

```
function topKFrequentWords(words, k):
    count ← frequency map of words
    worse(a, b) ← a.count < b.count
                  OR (a.count == b.count AND a.word > b.word)
    heap ← MIN-heap ordered by "worse" (root = worst)
    for each (word, c) in count:
        push (c, word) into heap
        if size(heap) > k: pop heap
    result ← pop everything (worst → best)
    reverse result                         // best → worst
    return result
```

> Alternative: sort all distinct words by `(−count, word)` and take the first k. That's O(m log m) and often fine.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort | O(n + m log m) | O(m) |
| **Heap size k** | **O(n + m log k)** | O(m) |

### 📌 Points to remember
- The output **must be sorted**, unlike Problems 3 and 4. Pop and reverse at the end.
- The tie-break **flips** inside a min-heap. Write "root = worst" first, then derive the comparator.
- Second LeetCode example: `["the","day","is","sunny","the","the","the","sunny","is","is"]`, k = 4 → `["the","is","sunny","day"]`.

---

## 7. Reorganize String (Medium)

### Problem
Rearrange `s` so that **no two adjacent characters are the same**. Return any valid result, or `""` if impossible.

### Visualize it

```
   "aab" → a ? a  → fill the gap with b → "aba" ✅

   "aaab" → a _ a _ a       only one b to fill two gaps → impossible → "" ❌
```

### When is it impossible?

```
   The most frequent char needs a "separator" between each copy:

      a _ a _ a _ a          maxFreq copies need maxFreq − 1 separators
                              → total length ≥ 2·maxFreq − 1

   Impossible ⇔ maxFreq > (n + 1) / 2     (integer division)

    "aab":  n = 3, (3+1)/2 = 2, maxFreq 2 ≤ 2 → possible
    "aaab": n = 4, (4+1)/2 = 2, maxFreq 3 > 2 → impossible
```

### Greedy idea: always use the most frequent char that isn't the previous one

```
                 max-heap by count
                       │
             pop the most frequent ──► append it
                       │
          but HOLD IT BACK for one turn so it can't repeat immediately
                       │
     next round: put the held-back char (if count > 0) back into the heap
```

### Trace ("aab"), hold-back method

```
  heap = {(2,a), (1,b)},  held = none

  step │ pop    │ result │ push back held? │ new held
  ─────┼────────┼────────┼─────────────────┼──────────
  1    │ (2,a)  │ "a"    │ —               │ (1,a)
  2    │ (1,b)  │ "ab"   │ push (1,a)      │ (0,b) → dropped
  3    │ (1,a)  │ "aba"  │ —               │ (0,a) → dropped

  heap empty, length 3 = n → "aba" ✅
```

### Pseudocode

```
function reorganizeString(s):
    count ← frequency map of s
    if max(count) > (n + 1) / 2: return ""
    heap ← MAX-heap of (c, ch)
    held ← none
    result ← empty builder
    while heap not empty:
        (c, ch) ← pop heap
        append ch to result
        if held exists and held.count > 0:
            push held into heap
        held ← (c − 1, ch)
    return result
```

> Alternative ("top two at a time"): pop the two most frequent, append both, push them back with count − 1. If only one is left, append it once (it must have count 1, guaranteed by the check above).

### Complexity

| Time | Space |
|---|---|
| O(n log 26) = O(n) | O(26) |

### 📌 Points to remember
- Check `maxFreq > (n + 1) / 2` **first**. It's the whole feasibility test.
- Hold-back for **one** turn = "distance 2 apart". Problem 8 generalizes this to distance k with a queue.
- Another O(n) method: fill even indices 0, 2, 4, ... with the most frequent char first, then the rest.

---

## 8. Rearrange String k Distance Apart (Hard)

### Problem
*(LeetCode premium 358.)* Rearrange `s` so that **equal characters are at least `k` positions apart**. Return any valid result, or `""` if impossible.

**Convention used here:**
- "At least k apart" means equal characters have index difference ≥ k.
- `k ≤ 1` → no constraint, return `s` unchanged.
- On equal counts the heap pops the alphabetically smaller letter first (any valid answer is accepted).

### Visualize it

```
   "aabbcc", k = 3

    index:  0   1   2   3   4   5
            a   b   c   a   b   c
            └─────3─────┘
                  each letter repeats every 3 → valid ✅
```

### Max-heap + cooldown queue

```
   Reorganize String held ONE char back. Now hold k−1 chars back.

       ┌──────── HEAP (ready to use) ───────┐
       │   most frequent on top             │
       └───────────────┬────────────────────┘
                       │ pop & use
                       ▼
        ┌──── COOLDOWN QUEUE (just used) ───────┐
        │ front ◄─ [ x ] [ y ] [ z ] ◄─ rear    │
        └───────────────────────────────────────┘
                       │ when the queue holds k items,
                       │ the front has waited long enough
                       ▼
              back into the heap (if count > 0)

   If the heap runs empty while chars are still cooling down → stuck → "".
```

### Trace ("aabbcc", k = 3)

```
  heap {(2,a),(2,b),(2,c)},  queue empty

  step │ pop  │ result   │ queue after enqueue        │ size = k? → release front
  ─────┼──────┼──────────┼────────────────────────────┼──────────────────────────
  1    │ a,2  │ a        │ [a1]                       │ no
  2    │ b,2  │ ab       │ [a1, b1]                   │ no
  3    │ c,2  │ abc      │ [a1, b1, c1]               │ yes → a1 back to heap
  4    │ a,1  │ abca     │ [b1, c1, a0]               │ yes → b1 back to heap
  5    │ b,1  │ abcab    │ [c1, a0, b0]               │ yes → c1 back to heap
  6    │ c,1  │ abcabc   │ [a0, b0, c0]               │ yes → a0 (count 0, dropped)

  heap empty, length 6 = n → "abcabc" ✅
```

### Trace ("aaabc", k = 3), the impossible case

```
  heap {(3,a),(1,b),(1,c)}

  step │ pop  │ result │ queue after enqueue   │ release
  ─────┼──────┼────────┼───────────────────────┼─────────────────────────
  1    │ a,3  │ a      │ [a2]                  │ no
  2    │ b,1  │ ab     │ [a2, b0]              │ no
  3    │ c,1  │ abc    │ [a2, b0, c0]          │ a2 back to heap
  4    │ a,2  │ abca   │ [b0, c0, a1]          │ b0 dropped
  5    │ heap EMPTY, but a1 is still cooling down → stop

  length 4 ≠ 5 → "" ✅
```

### Pseudocode

```
function rearrangeString(s, k):
    if k ≤ 1: return s
    count ← frequency map of s
    heap ← MAX-heap of (c, ch)            // ties: smaller letter first
    queue ← empty FIFO
    result ← empty builder
    while heap not empty:
        (c, ch) ← pop heap
        append ch to result
        enqueue (c − 1, ch)
        if size(queue) == k:
            (c2, ch2) ← dequeue
            if c2 > 0: push (c2, ch2) into heap
    if length(result) == n: return result
    return ""
```

### Complexity

| Time | Space |
|---|---|
| O(n log 26) = O(n) | O(26 + k) |

### 📌 Points to remember
- k = 2 is exactly Reorganize String.
- The queue size is the cooldown: a char comes back only after k−1 others were placed.
- Success test = "did we place all n chars?" No separate feasibility formula needed.
- Close cousin: **Task Scheduler** (greedy guide), where idle slots are allowed instead of failing.

---

## 9. Find Median from Data Stream (Hard)

### Problem
Design `addNum(x)` and `findMedian()`. The median of an even count is the average of the two middle values.

### Visualize it

```
     stream: 1, 2, 3, ...

     after 1:      [1]          median 1
     after 2:      [1 2]        median (1+2)/2 = 1.5
     after 3:      [1 2 3]      median 2
```

### Two heaps that meet in the middle

```
          LOW = MAX-heap                 HIGH = MIN-heap
       (smaller half)                   (larger half)
     ┌───────────────────┐           ┌───────────────────┐
     │ ... ≤ ... ≤ [top] │  ≤  ≤  ≤  │ [top] ≤ ... ≤ ... │
     └───────────────────┘           └───────────────────┘

   Invariants:
     ① every value in LOW ≤ every value in HIGH
     ② size(LOW) == size(HIGH)  or  size(LOW) == size(HIGH) + 1

   Median:
     odd total  → LOW.top
     even total → (LOW.top + HIGH.top) / 2
```

### The add routine: "pass through LOW, then balance"

```
   addNum(x):
     ① push x into LOW
     ② move LOW.top to HIGH        ← guarantees invariant ①
     ③ if HIGH is bigger than LOW:
           move HIGH.top to LOW    ← restores invariant ②
```

### Trace (add 1, 2, 3)

```
  op        │ step                          │ LOW (max)  │ HIGH (min) │ median
  ──────────┼───────────────────────────────┼────────────┼────────────┼────────
  add 1     │ push 1 to LOW                 │ {1}        │ { }        │
            │ move LOW.top 1 → HIGH         │ { }        │ {1}        │
            │ HIGH bigger → move 1 → LOW    │ {1}        │ { }        │ 1
  add 2     │ push 2 to LOW                 │ {2, 1}     │ { }        │
            │ move LOW.top 2 → HIGH         │ {1}        │ {2}        │
            │ sizes equal, no move          │ {1}        │ {2}        │ 1.5
  add 3     │ push 3 to LOW                 │ {3, 1}     │ {2}        │
            │ move LOW.top 3 → HIGH         │ {1}        │ {2, 3}     │
            │ HIGH bigger → move 2 → LOW    │ {2, 1}     │ {3}        │ 2   ✅
```

### Pseudocode

```
class MedianFinder:
    LOW  ← empty MAX-heap
    HIGH ← empty MIN-heap

    addNum(x):
        push x into LOW
        push (pop LOW) into HIGH
        if size(HIGH) > size(LOW):
            push (pop HIGH) into LOW

    findMedian():
        if size(LOW) > size(HIGH): return LOW.top
        return (LOW.top + HIGH.top) / 2         // as a decimal
```

### Complexity

| Operation | Time |
|---|---|
| addNum | O(log n) |
| findMedian | O(1) |

### 📌 Points to remember
- LOW is a **max**-heap, HIGH is a **min**-heap. The two tops face each other.
- Decide which side holds the extra element (here LOW) and stay consistent.
- Average as a decimal. With huge values, compute `a + (b − a) / 2` or use 64-bit.
- Follow-up "all values in 0..100": use a count array of 101 slots and walk it, O(100) per query.

---

## 10. Sliding Window Median (Hard)

### Problem
Return the median of every window of size `k` as it slides across `nums`.

### Visualize it

```
   nums = [ 1, 3, −1, −3, 5, 3, 6, 7 ],  k = 3

   window             sorted          median
   [1 3 −1]           −1  1  3          1
     [3 −1 −3]        −3 −1  3         −1
        [−1 −3 5]     −3 −1  5         −1
            [−3 5 3]  −3  3  5          3
                [5 3 6]  3  5  6        5
                   [3 6 7]  3  6  7     6

   Answer: [1, −1, −1, 3, 5, 6] ✅
```

### The new difficulty: REMOVING the element that leaves

```
   Problem 9 only ADDED numbers. A window also REMOVES one each step.
   A heap can only remove its TOP cheaply. The leaving number may be buried.

   Fix: LAZY DELETION
     • Don't remove it now. Write it in a "to-delete" map: delayed[x]++.
     • Whenever a heap's TOP is in the map, pop it and decrement the map.
     • Only the tops are ever read, so buried garbage is harmless.
```

### Bookkeeping with a "balance" number

```
   LOW (max-heap) holds ⌈k/2⌉ VALID items, HIGH (min-heap) holds ⌊k/2⌋.

   Each slide:
     out leaves: if out ≤ LOW.top → LOW lost one   (balance −1)
                 else             → HIGH lost one  (balance +1)
     in arrives: if in ≤ LOW.top  → push into LOW  (balance +1)
                 else             → push into HIGH (balance −1)

     balance = −2 → LOW is short → move HIGH.top into LOW
     balance = +2 → LOW is long  → move LOW.top into HIGH
     balance =  0 → already fine

   Then prune both tops of anything in delayed.
```

### Trace (k = 3)

```
  Start: window [1, 3, −1]
    put all in LOW → {3, 1, −1}, move ⌊3/2⌋ = 1 top to HIGH
    LOW {1, −1}   HIGH {3}                              median LOW.top = 1

  out │ in │ out side / bal │ in side / bal │ rebalance       │ prune             │ LOW (valid)   │ HIGH (valid)│ med
  ────┼────┼────────────────┼───────────────┼─────────────────┼───────────────────┼───────────────┼─────────────┼─────
   1  │ −3 │ 1≤1 LOW   −1   │ −3≤1 LOW   0  │ —               │ LOW top 1 deleted │ {−1, −3}      │ {3}         │ −1
   3  │  5 │ 3>−1 HIGH +1   │ 5>−1 HIGH  0  │ —               │ HIGH top 3 deleted│ {−1, −3}      │ {5}         │ −1
  −1  │  3 │ −1≤−1 LOW −1   │ 3>−1 HIGH −2  │ HIGH 3 → LOW    │ tops clean        │ {3, −3}       │ {5}         │  3
  −3  │  6 │ −3≤3 LOW  −1   │ 6>3 HIGH  −2  │ HIGH 5 → LOW    │ tops clean        │ {5, 3}        │ {6}         │  5
   5  │  7 │ 5≤5 LOW   −1   │ 7>5 HIGH  −2  │ HIGH 6 → LOW    │ tops clean        │ {6, 3}        │ {7}         │  6

  Answer: [1, −1, −1, 3, 5, 6] ✅

  (Garbage still sitting inside LOW at the end: −1, −3, 5. Never read, never harmful.)
```

### Pseudocode

```
function medianSlidingWindow(nums, k):
    LOW ← MAX-heap, HIGH ← MIN-heap, delayed ← empty map
    insert nums[0..k−1] into LOW
    repeat ⌊k/2⌋ times: push (pop LOW) into HIGH
    result ← [ median() ]

    for i from k to n − 1:
        out ← nums[i − k], in ← nums[i], balance ← 0

        delayed[out] ← delayed[out] + 1
        if out ≤ LOW.top: balance ← balance − 1
        else:             balance ← balance + 1

        if LOW not empty and in ≤ LOW.top:
            push in into LOW;  balance ← balance + 1
        else:
            push in into HIGH; balance ← balance − 1

        if balance < 0: push (pop HIGH) into LOW
        if balance > 0: push (pop LOW) into HIGH

        prune(LOW); prune(HIGH)
        append median() to result
    return result

function prune(heap):
    while heap not empty and delayed[heap.top] > 0:
        delayed[heap.top] ← delayed[heap.top] − 1
        pop heap

function median():
    if k is odd: return LOW.top
    return (LOW.top + HIGH.top) / 2          // decimal, 64-bit safe
```

### Simpler alternative: a sorted container

```
   Keep the window in a sorted list / balanced BST / multiset:
     remove out  → O(log k) with a BST (O(k) with a plain sorted array)
     insert in   → O(log k)
     median      → element at index k/2 (or the average of two)

   Fewer moving parts. Use it when your language has a sorted multiset.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Re-sort every window | O(n · k log k) | O(k) |
| Sorted array + binary search | O(n · k) | O(k) |
| **Two heaps + lazy deletion** | **O(n log n)** | O(n) (garbage) |
| Balanced BST / multiset | O(n log k) | O(k) |

### 📌 Points to remember
- Lazy deletion = "mark now, pop when it reaches the top".
- Decide the side of `out` by comparing with `LOW.top` **before** inserting `in`.
- Only the **valid** counts must match ⌈k/2⌉ and ⌊k/2⌋. The raw heap sizes include garbage.
- Use 64-bit math for the average: values near ±2³¹ overflow when added.

---

## 11. Master Cheat Sheet

### All 10 problems at a glance

```
┌──────────────────────────────┬─────────────────────────────────────────┬────────────────────────┐
│ Problem                      │ Core idea                               │ Best time              │
├──────────────────────────────┼─────────────────────────────────────────┼────────────────────────┤
│ Kth Largest (Array)          │ min-heap size k; quickselect            │ O(n log k) / O(n) avg  │
│ Kth Largest (Stream)         │ persistent min-heap size k              │ O(log k) per add       │
│ K Closest Points             │ max-heap by d² size k                   │ O(n log k)             │
│ Top K Frequent Elements      │ count + min-heap size k; buckets        │ O(n)                   │
│ Sort Chars By Frequency      │ count + max-heap; buckets               │ O(n)                   │
│ Top K Frequent Words         │ count + min-heap, FLIPPED tie-break     │ O(n + m log k)         │
│ Reorganize String            │ max-heap + hold back 1                  │ O(n)                   │
│ Rearrange k Distance Apart   │ max-heap + cooldown queue of size k     │ O(n)                   │
│ Median from Data Stream      │ two heaps, LOW max / HIGH min           │ O(log n) add, O(1) med │
│ Sliding Window Median        │ two heaps + lazy deletion               │ O(n log n)             │
└──────────────────────────────┴─────────────────────────────────────────┴────────────────────────┘
```

### Pattern family tree

```
                               TOP-K / HEAP
                                    │
     ┌─────────────────────┬────────┴──────────┬───────────────────────┐
     │                     │                   │                       │
  KEEP THE BEST K     COUNT, THEN RANK    GREEDY "MOST FREQUENT    TWO HEAPS
  (size-k heap)       (freq map + heap)   NEXT" (max-heap)         (the middle)
     │                     │                   │                       │
  ├ Kth Largest        ├ Top K Frequent    ├ Reorganize String     ├ Median Stream
  ├ Kth Largest Stream ├ Sort Chars Freq   └ Rearrange k Apart     └ Sliding Window
  └ K Closest Points   └ Top K Freq Words                             Median
```

### Which heap? (the card to memorize)

```
   ┌───────────────────────────────┬──────────────────────────────────┐
   │ "I want the K ..."            │ Heap type (size k)               │
   ├───────────────────────────────┼──────────────────────────────────┤
   │ largest / most frequent       │ MIN-heap  (root = weakest kept)  │
   │ smallest / closest            │ MAX-heap  (root = worst kept)    │
   │ ALL items in rank order       │ heap of everything, pop repeatedly│
   │ the middle (median)           │ MAX-heap low  +  MIN-heap high   │
   └───────────────────────────────┴──────────────────────────────────┘
```

### Optimization checklist

```
  ☐ One-shot Kth element on an array?        → quickselect, O(n) average
  ☐ Data arrives as a stream?                 → size-k heap, O(log k) per item
  ☐ Ranking by frequency, counts ≤ n?         → bucket sort, O(n)
  ☐ Alphabet is small (26 letters)?           → heap ops are effectively O(1)
  ☐ Need to delete from the middle of a heap? → lazy deletion map
  ☐ Comparing distances?                      → squared distances, no sqrt
  ☐ Full heap and x can't beat the root?      → skip the push
```

### 🚩 Common bugs to avoid

```
  ✗ Using a MAX-heap for "k largest" (it keeps everything, O(n log n))
  ✗ Forgetting to pop when size exceeds k
  ✗ Top K Frequent Words: tie-break not flipped inside the min-heap
  ✗ Top K Frequent Words: returning heap order without reversing
  ✗ Reorganize String: missing the maxFreq > (n+1)/2 check
  ✗ Rearrange k Apart: k = 0 or 1 not handled (return s)
  ✗ Median: integer division instead of a decimal average; overflow on a + b
  ✗ Sliding Window Median: comparing raw heap sizes that include lazy garbage
  ✗ Quickselect: fixed pivot on sorted input → O(n²)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Which item would I KICK OUT next?"                     ║
   ║   Put THAT item at the root.                             ║
   ╚══════════════════════════════════════════════════════════╝
     The answer tells you min-heap vs max-heap AND the tie-break.
```

---

### ✅ Progress tracker

- [ ] Kth Largest Element in an Array (Medium)
- [ ] Kth Largest Element in a Stream (Easy)
- [ ] K Closest Points to Origin (Medium)
- [ ] Top K Frequent Elements (Medium)
- [ ] Sort Characters By Frequency (Medium)
- [ ] Top K Frequent Words (Medium)
- [ ] Reorganize String (Medium)
- [ ] Rearrange String k Distance Apart (Hard)
- [ ] Find Median from Data Stream (Hard)
- [ ] Sliding Window Median (Hard)
