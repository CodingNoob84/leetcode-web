# Bitwise Trie / XOR: A Visual Guide

> **Goal:** Learn to think about numbers **bit by bit**, store them in a **binary trie**, and greedily build the largest XOR.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: XOR + Binary Trie](#0-the-big-idea-xor--binary-trie)
1. [Sum of All Subset XOR Totals (Easy)](#1-sum-of-all-subset-xor-totals-easy)
2. [Maximum XOR of Two Numbers in an Array (Medium)](#2-maximum-xor-of-two-numbers-in-an-array-medium)
3. [Maximum XOR With an Element From Array (Hard)](#3-maximum-xor-with-an-element-from-array-hard)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Subset XOR Totals → Max XOR of Two Numbers → Max XOR With an Element.
> The first one warms up XOR thinking and **does not need a trie** (honest note: it is a bit-math / backtracking problem).
> The second one introduces the binary trie. The third adds a constraint and solves it **offline**.

---

## 0. The Big Idea: XOR + Binary Trie

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BITWISE TRIE / XOR"                    │
├──────────────────────────────────────────────────────────────────┤
│  • "MAXIMUM XOR" of a pair, or of x with some array element      │
│  • Many XOR QUERIES against the same set of numbers              │
│  • A constraint like "element ≤ m" on top of max XOR             │
│  • "XOR total of every subset" → per-bit counting, no trie       │
│  • n up to 10⁵ → O(n²) pair checking is too slow                 │
└──────────────────────────────────────────────────────────────────┘
```

### XOR refresher

```
   a  b │ a ^ b              "XOR = are the bits DIFFERENT?"
  ──────┼──────
   0  0 │   0                     same      → 0
   0  1 │   1                     different → 1
   1  0 │   1
   1  1 │   0

   Example:   5 = 0 0 1 0 1
             25 = 1 1 0 0 1
             ───────────────
         5 ^ 25 = 1 1 1 0 0  = 28
```

| Property | Meaning |
|---|---|
| `a ^ a = 0` | a number cancels itself |
| `a ^ 0 = a` | 0 changes nothing |
| `a ^ b = b ^ a` | order doesn't matter (commutative) |
| `(a ^ b) ^ c = a ^ (b ^ c)` | grouping doesn't matter (associative) |
| `a ^ b = c  ⇒  a ^ c = b` | XOR undoes itself |

### Why the HIGHEST bit dominates

```
   1 0 0 0 0   = 16
   0 1 1 1 1   = 15     ← every lower bit set, still LOSES

   bit value:  2⁴  >  2³ + 2² + 2¹ + 2⁰    (16 > 15)

   ┌────────────────────────────────────────────────────────────┐
   │ To maximize a number, win the HIGHEST bit first.           │
   │ Whatever happens in lower bits can never make up for it.   │
   │ → GREEDY from the MOST significant bit (MSB) downward.     │
   └────────────────────────────────────────────────────────────┘
```

### The binary trie

A normal trie has 26 children per node (one per letter). A **binary trie** has **2 children**: one for bit `0`, one for bit `1`.
Each number is stored as a path from the root, reading its bits **from MSB down to LSB**.

```
   Node:   ┌──────────────┐
           │ child[0]  ───┼──► next node for bit 0
           │ child[1]  ───┼──► next node for bit 1
           └──────────────┘

   Insert 5 = 00101 (5 bits):

        root
         │0         bit 4
         ●
         │0         bit 3
         ●
          ╲1        bit 2
           ●
           │0       bit 1
           ●
            ╲1      bit 0
             ●  ← leaf (end of 5)
```

> **Fixed width matters.** Every number must use the **same number of bits** (pad with leading zeros),
> so bit 4 of every number sits at the same depth. Real problems use **31 bits** (values < 2³¹).
> **In traces below we use 5 bits (or fewer) only for readability.**

### The query: go OPPOSITE whenever you can

```
   Want to maximize  x ^ y  over all y in the trie.

   At each bit (MSB → LSB):
     x's bit = b
     ┌────────────────────────────────────────────────────────────┐
     │ Is there a child with bit (1 − b)?                         │
     │   YES → go there, this result bit = 1  ✅ (bits differ)    │
     │   NO  → go to child b, this result bit = 0                 │
     └────────────────────────────────────────────────────────────┘

        x bit = 0              x bit = 1
            ●                      ●
          ╱   ╲                  ╱   ╲
         0     1  ← prefer      0     1
                                ↑ prefer
```

### Templates

```
function insert(root, num):
    node ← root
    for bit from B−1 down to 0:
        b ← (num >> bit) & 1
        if node.child[b] is empty: node.child[b] ← new node
        node ← node.child[b]

function maxXor(root, x):            // trie must be non-empty
    node ← root, result ← 0
    for bit from B−1 down to 0:
        b ← (x >> bit) & 1
        if node.child[1 − b] exists:
            result ← result | (1 << bit)
            node ← node.child[1 − b]
        else:
            node ← node.child[b]
    return result
```

| Operation | Time | Space |
|---|---|---|
| insert | O(B) | O(B) new nodes worst case |
| maxXor query | O(B) | O(1) |
| n numbers total | O(n·B) | O(n·B) nodes |

`B` = number of bits (31 for LeetCode constraints).

---

## 1. Sum of All Subset XOR Totals (Easy)

### Problem
For every subset of `nums`, take the XOR of its elements (empty subset → 0). Return the **sum** of all these XOR totals.

> 🧭 **Honest note:** this one needs **no trie**. It sits in this group because it trains XOR thinking.
> Two solutions: brute force with backtracking, then a beautiful per-bit trick.

### Visualize it (nums = [1, 3])

```
   subset     XOR
   ──────     ───
   { }         0
   {1}         1
   {3}         3
   {1,3}   1^3 = 01 ^ 11 = 10 = 2
                          ─────
                   sum =   6  ✅
```

### Approach A: include / exclude backtracking

```
   At each element: INCLUDE it (xor it in) or EXCLUDE it.

                          i=0, x=0
                    ┌────────┴────────┐
               skip 5             take 5
                x=0                 x=5
             ┌───┴───┐          ┌───┴───┐
          skip1    take1     skip1    take1
           x=0      x=1       x=5      x=4
          ┌─┴─┐    ┌─┴─┐     ┌─┴─┐    ┌─┴─┐
         s6  t6   s6  t6    s6  t6   s6  t6
         0   6    1   7     5   3    4   2     ← leaves (nums = [5,1,6])

   sum of leaves = 0+6+1+7+5+3+4+2 = 28 ✅
```

### Trace table (nums = [5, 1, 6])

| Subset | Binary XOR | Value |
|---|---|---|
| {} | 000 | 0 |
| {5} | 101 | 5 |
| {1} | 001 | 1 |
| {6} | 110 | 6 |
| {5,1} | 101 ^ 001 = 100 | 4 |
| {5,6} | 101 ^ 110 = 011 | 3 |
| {1,6} | 001 ^ 110 = 111 | 7 |
| {5,1,6} | 100 ^ 110 = 010 | 2 |
| | **total** | **28** ✅ |

### Pseudocode (backtracking)

```
function subsetXORSum(nums):
    return dfs(nums, 0, 0)

function dfs(nums, i, x):
    if i == length(nums): return x
    return dfs(nums, i+1, x)              // exclude nums[i]
         + dfs(nums, i+1, x ^ nums[i])    // include nums[i]
```

Time O(2ⁿ), space O(n) recursion. Fine for n ≤ 12 (the actual constraint).

---

### 🚀 Approach B: the OR trick, O(n)

```
   ┌──────────────────────────────────────────────────────────┐
   │   answer = (nums[0] | nums[1] | ... | nums[n−1]) × 2ⁿ⁻¹   │
   └──────────────────────────────────────────────────────────┘
```

**Why? Look at one bit at a time.**

```
   Fix a bit position b.

   CASE 1: no element has bit b set
           → no subset XOR can have bit b → contributes 0.

   CASE 2: some element e has bit b set
           Pair up every subset S with S' = S toggled on e
           (add e if absent, remove it if present).

              S  ────── toggle e ──────►  S'
              XOR(S') = XOR(S) ^ e   → bit b FLIPS

           In every pair, EXACTLY ONE has bit b = 1.
           2ⁿ subsets → 2ⁿ⁻¹ pairs → 2ⁿ⁻¹ subsets have bit b set.
           Contribution = 2ᵇ × 2ⁿ⁻¹.

   Bits that appear in ANY element = bits of the OR.
   Sum over those bits:  OR × 2ⁿ⁻¹.
```

### Check both examples

```
   nums = [1, 3]       OR = 01 | 11 = 11 = 3     3 × 2¹ = 6   ✅
   nums = [5, 1, 6]    OR = 101 | 001 | 110 = 111 = 7
                                                 7 × 2² = 28  ✅
```

Per-bit check for [5,1,6]: bit 2 is set in the subset XORs 5, 6, 4, 7 (4 of 8 subsets ✓), bit 1 in 6, 3, 7, 2 (4 ✓), bit 0 in 5, 1, 3, 7 (4 ✓).
Total = 4·4 + 4·2 + 4·1 = 28 ✓.

### Pseudocode (O(n))

```
function subsetXORSum(nums):
    orAll ← 0
    for each x in nums: orAll ← orAll | x
    return orAll << (length(nums) − 1)
```

### 📌 Points to remember
- No trie here. It is **include/exclude backtracking** (see [../backtracking/01-Choice-Based-Backtracking.md](../backtracking/01-Choice-Based-Backtracking.md)) or **per-bit counting**.
- The toggle-pairing argument is a reusable trick: "a set bit appears in exactly half the subsets".
- Empty subset counts and contributes 0.

---

## 2. Maximum XOR of Two Numbers in an Array (Medium)

### Problem
Return the maximum `nums[i] ^ nums[j]` over all pairs (`0 ≤ i ≤ j < n`).

### Brute force first

```
   Check every pair → O(n²). With n = 2·10⁵ that's 2·10¹⁰ checks ❌
   Need: for each x, find its best partner in O(B) → trie.
```

### Visualize it: numbers in 5 bits

```
   nums  │ b4 b3 b2 b1 b0
   ──────┼───────────────
     3   │  0  0  0  1  1
    10   │  0  1  0  1  0
     5   │  0  0  1  0  1
    25   │  1  1  0  0  1
     2   │  0  0  0  1  0
     8   │  0  1  0  0  0
```

### The trie after inserting all six

```
                          root
                ┌───────────┴───────────┐
              0 (b4)                   1 (b4)
         ┌──────┴──────┐                │
       0 (b3)        1 (b3)           1 (b3)
      ┌──┴───┐          │               │
    0 (b2)  1 (b2)    0 (b2)          0 (b2)
      │       │       ┌─┴──┐            │
    1 (b1)  0 (b1)  0 (b1) 1 (b1)     0 (b1)
    ┌─┴─┐     │       │      │          │
   0   1      1       0      0          1
   2   3      5       8     10         25     ← numbers at leaves
```

### The plan

```
   for each x in nums:
       insert x                   (or insert all first; both work)
       best ← max(best, maxXor(trie, x))
```

### Trace: query x = 5 = 00101

| Bit | x's bit | Want | Child exists? | Go to | Result so far |
|---|---|---|---|---|---|
| b4 | 0 | 1 | ✅ (25's branch) | 1 | `1____` |
| b3 | 0 | 1 | ✅ | 1 | `11___` |
| b2 | 1 | 0 | ✅ | 0 | `111__` |
| b1 | 0 | 1 | ❌ only 0 | 0 | `1110_` |
| b0 | 1 | 0 | ❌ only 1 | 1 | `11100` |

```
   Path followed = 11001 = 25
   5 ^ 25 = 00101 ^ 11001 = 11100 = 28 ✅
```

### Trace: query x = 25 = 11001

| Bit | x's bit | Want | Child exists? | Go to | Result so far |
|---|---|---|---|---|---|
| b4 | 1 | 0 | ✅ | 0 | `1____` |
| b3 | 1 | 0 | ✅ (3, 5, 2) | 0 | `11___` |
| b2 | 0 | 1 | ✅ (5) | 1 | `111__` |
| b1 | 0 | 1 | ❌ only 0 | 0 | `1110_` |
| b0 | 1 | 0 | ❌ only 1 | 1 | `11100` |

```
   Path followed = 00101 = 5   → 28 again (same pair, seen from the other side)
```

### All queries

| x | binary | best partner | x ^ partner |
|---|---|---|---|
| 3 | 00011 | 25 (11001) | 11010 = 26 |
| 10 | 01010 | 25 (11001) | 10011 = 19 |
| 5 | 00101 | 25 (11001) | 11100 = **28** |
| 25 | 11001 | 5 (00101) | 11100 = **28** |
| 2 | 00010 | 25 (11001) | 11011 = 27 |
| 8 | 01000 | 25 (11001) | 10001 = 17 |

```
   answer = max = 28 ✅
```

### Pseudocode

```
function findMaximumXOR(nums):
    root ← new node
    for each x in nums: insert(root, x)          // B = 31
    best ← 0
    for each x in nums:
        best ← max(best, maxXor(root, x))
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| All pairs | O(n²) | O(1) |
| **Binary trie** | **O(n·B)** | **O(n·B)** |
| Prefix-set greedy (bonus) | O(n·B) | O(n) |

> **Bonus idea (no trie):** build the answer bit by bit. At bit `k`, guess `candidate = answer | (1 << k)`,
> put all prefixes `x >> k` in a set, and check whether any `p ^ (candidate >> k)` is in the set (XOR undoes itself).

### 📌 Points to remember
- Insert with a **fixed width** (31 bits), MSB first. Mixing widths breaks the alignment.
- Query: **opposite bit if possible**, else the same bit.
- Each `x` can pair with itself (`x ^ x = 0`), so a one-element array returns 0.
- Pairs are found from both sides; the max is the same.

---

## 3. Maximum XOR With an Element From Array (Hard)

### Problem
`queries[i] = [xᵢ, mᵢ]`. Answer = max of `xᵢ ^ nums[j]` over all `nums[j] ≤ mᵢ`, or **−1** if no `nums[j] ≤ mᵢ`.

### What's new: a FILTER on which numbers are allowed

```
   Problem 2: every number in the trie is allowed.
   Problem 3: only numbers ≤ m are allowed, and m changes per query.

   💡 OFFLINE trick: answer queries in increasing order of m.
      Then "allowed numbers" only GROWS → insert as you go, never delete.

     nums sorted:   0   1   2   3   4
                    ▲───▲       ▲───▲   ▲
     m = 1    ──────┘   │       │   │   │   insert 0, 1
     m = 3    ──────────────────┘───┘   │   insert 2, 3
     m = 6    ──────────────────────────┘   insert 4
```

### The 5 steps (offline version)

| Step | Action |
|---|---|
| 1 | Sort `nums` ascending |
| 2 | Attach the original index to each query, sort queries by `m` |
| 3 | For each query, insert every `nums[p] ≤ m` not yet inserted (pointer `p` only moves forward) |
| 4 | If nothing inserted yet → answer −1; else `maxXor(trie, x)` |
| 5 | Write the answer at the query's **original** index |

### Trace (nums = [0,1,2,3,4], queries = [[3,1],[1,3],[5,6]])

> Values are ≤ 6, so **3 bits** are enough for this trace. The real solution uses 31.

```
   sorted queries by m:   (x=3, m=1, idx 0)  (x=1, m=3, idx 1)  (x=5, m=6, idx 2)
```

**Query idx 0: x = 3 = 011, m = 1 → insert 0 (000), 1 (001)**

```
        root
         │0
         ●
         │0
         ●
        ╱ ╲
       0   1
       0   1      ← numbers
```

| Bit | x bit | Want | Exists? | Result |
|---|---|---|---|---|
| b2 | 0 | 1 | ❌ | `0__` |
| b1 | 1 | 0 | ✅ | `01_` |
| b0 | 1 | 0 | ✅ | `011` |

→ partner 000 = 0, answer **3** (3 ^ 0 = 3 ✓)

**Query idx 1: x = 1 = 001, m = 3 → insert 2 (010), 3 (011)**

| Bit | x bit | Want | Exists? | Result |
|---|---|---|---|---|
| b2 | 0 | 1 | ❌ | `0__` |
| b1 | 0 | 1 | ✅ (2, 3) | `01_` |
| b0 | 1 | 0 | ✅ (2) | `011` |

→ partner 010 = 2, answer **3** (1 ^ 2 = 3 ✓)

**Query idx 2: x = 5 = 101, m = 6 → insert 4 (100)**

```
              root
          ┌─────┴─────┐
          0           1
       ┌──┴──┐        │
       0     1        0
      ╱ ╲   ╱ ╲       │
     0   1 0   1      0
     0   1 2   3      4
```

| Bit | x bit | Want | Exists? | Result |
|---|---|---|---|---|
| b2 | 1 | 0 | ✅ | `1__` |
| b1 | 0 | 1 | ✅ (2, 3) | `11_` |
| b0 | 1 | 0 | ✅ (2) | `111` |

→ partner 010 = 2, answer **7** (5 ^ 2 = 7 ✓)

```
   write back by original index:  [3, 3, 7] ✅
```

### Second trace: the −1 case (nums = [5,2,4,6,6,3], queries = [[12,4],[8,1],[6,3]])

```
   sorted nums: [2, 3, 4, 5, 6, 6]       4 bits: 2=0010 3=0011 4=0100
   sorted queries: (8, m=1, idx1)  (6, m=3, idx2)  (12, m=4, idx0)

   idx1: m=1 → no num ≤ 1 → trie empty → −1
   idx2: m=3 → insert 2, 3.   x = 6 = 0110
         b3: want 1 ❌ → 0 │ b2: want 0 ✅ → 1 │ b1: want 0 ❌ → 0 │ b0: want 1 ✅ (3) → 1
         result 0101 = 5   (6 ^ 3 = 5 ✓)
   idx0: m=4 → insert 4.      x = 12 = 1100
         b3: want 0 ✅ → 1 │ b2: want 0 ✅ (2,3) → 1 │ b1: want 1 ✅ → 1 │ b0: want 1 ✅ (3) → 1
         result 1111 = 15  (12 ^ 3 = 15 ✓)

   answer by original index: [15, −1, 5] ✅
```

### Pseudocode (offline)

```
function maximizeXor(nums, queries):
    sort nums ascending
    order ← indices 0..q−1 sorted by queries[i].m
    ans   ← array of q
    root  ← new node, p ← 0
    for each i in order:
        (x, m) ← queries[i]
        while p < n and nums[p] ≤ m:
            insert(root, nums[p]); p ← p + 1
        if p == 0: ans[i] ← −1
        else:      ans[i] ← maxXor(root, x)
    return ans
```

### Online alternative (queries can't be reordered)

```
   Store at every node:  minVal = smallest number passing through it.

   During the query, only step into a child if child.minVal ≤ m.

        node
       ╱    ╲
   [min 2]  [min 9]      m = 6 → right child is FORBIDDEN even if it's the
                                 "opposite" bit; take the left one.

   If root.minVal > m → −1.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force per query | O(q·n) | O(1) |
| **Offline sort + trie** | **O(n log n + q log q + (n+q)·B)** | O(n·B) |
| Online trie with minVal | O(n·B + q·B) | O(n·B) |

### 📌 Points to remember
- **Offline = sort the queries** so the allowed set only grows. Remember the **original index**.
- Empty trie → **−1**. Check that before querying.
- Insert pointer `p` moves forward only → each number inserted once.
- Same `maxXor` routine as problem 2; only the "who is allowed" changes.

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌────────────────────────────────┬──────────────────────────────────────────┬────────────────────┐
│ Problem                        │ Core idea                                │ Best               │
├────────────────────────────────┼──────────────────────────────────────────┼────────────────────┤
│ Sum of All Subset XOR Totals   │ OR of all × 2ⁿ⁻¹ (bit in half of subsets)│ O(n)               │
│ Max XOR of Two Numbers         │ binary trie, go opposite bit from MSB    │ O(n·B)             │
│ Max XOR With an Element        │ offline: sort queries by m, insert ≤ m   │ O((n+q)·B + sorts) │
└────────────────────────────────┴──────────────────────────────────────────┴────────────────────┘
```

### Pattern family tree

```
                         XOR PROBLEMS
                              │
        ┌─────────────────────┼─────────────────────────┐
        │                     │                         │
  PER-BIT COUNTING       BINARY TRIE              TRIE + FILTER
  (no trie)              (max pair XOR)           (constraint per query)
        │                     │                         │
  └ Subset XOR Totals   └ Max XOR of Two       └ Max XOR With an Element
                                                   ├ offline: sort queries
                                                   └ online: minVal per node
```

### The query move card

```
   x's bit │ preferred child │ if missing
   ────────┼─────────────────┼───────────
      0    │       1         │   take 0 (result bit 0)
      1    │       0         │   take 1 (result bit 0)
   preferred found → result bit = 1
```

### Optimization checklist

```
  ☐ Pairs of numbers + XOR + n large?        → binary trie, O(n·B)
  ☐ "Sum/count over all subsets" with XOR?   → think per bit, not per subset
  ☐ Extra condition (≤ m) per query?         → sort queries offline, insert as allowed
  ☐ Queries must stay in order?              → store min value per node
  ☐ Need max XOR of a SUBARRAY?              → prefix XORs into the trie (pre[r] ^ pre[l])
```

### 🚩 Common bugs to avoid

```
  ✗ Inserting numbers with different bit widths (always loop from bit B−1)
  ✗ Reading bits LSB first (greedy must start at the MSB)
  ✗ Querying an empty trie (problem 3 → return −1)
  ✗ Losing the original query index after sorting
  ✗ Thinking Subset XOR needs a trie (it doesn't)
  ✗ Using 32 bits with signed values; LeetCode values are < 2³¹ → 31 bits
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "At this bit, can I make x and my partner DIFFER?"      ║
   ║   If yes, take it: one high bit beats all lower bits.    ║
   ╚══════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Sum of All Subset XOR Totals (Easy)
- [ ] Maximum XOR of Two Numbers in an Array (Medium)
- [ ] Maximum XOR With an Element From Array (Hard)
