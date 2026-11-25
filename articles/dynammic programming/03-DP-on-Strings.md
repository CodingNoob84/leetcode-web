# DP on Strings: A Visual Guide

> **Goal:** Learn to *see* string DP problems, fill the `(i, j)` table by hand, and then shrink it.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-1D-Linear-DP.md](01-1D-Linear-DP.md) and [02-2D-Grid-DP.md](02-2D-Grid-DP.md).
> A string DP table **is** a grid: rows = characters of one string, columns = characters of the other.

---

## Table of Contents

0. [The Big Idea: What Is String DP?](#0-the-big-idea-what-is-string-dp)
1. [Is Subsequence (Easy)](#1-is-subsequence-easy)
2. [Longest Common Subsequence (Medium)](#2-longest-common-subsequence-medium)
3. [Minimum Insertions and Deletions A → B (Medium)](#3-minimum-insertions-and-deletions-a--b-medium)
4. [Shortest Common Supersequence (Hard)](#4-shortest-common-supersequence-hard)
5. [Longest Palindromic Subsequence (Medium)](#5-longest-palindromic-subsequence-medium)
6. [Minimum Insertions to Make a String Palindrome (Hard)](#6-minimum-insertions-to-make-a-string-palindrome-hard)
7. [Edit Distance (Medium)](#7-edit-distance-medium)
8. [Distinct Subsequences (Hard)](#8-distinct-subsequences-hard)
9. [Interleaving String (Medium)](#9-interleaving-string-medium)
10. [Palindrome Partitioning II (Hard)](#10-palindrome-partitioning-ii-hard)
11. [Regular Expression Matching (Hard)](#11-regular-expression-matching-hard)
12. [Scramble String (Hard)](#12-scramble-string-hard)
13. [Master Cheat Sheet](#13-master-cheat-sheet)

> **Suggested order:** the problems are ordered by how much each one builds on the last, not by the list you were given.
> Is Subsequence → LCS → Min Ins/Del → Shortest Common Supersequence → Longest Palindromic Subsequence
> → Min Insertions Palindrome → Edit Distance → Distinct Subsequences → Interleaving String
> → Palindrome Partitioning II → Regex Matching → Scramble String.
> Problems 3–6 are all **LCS in disguise**. Learn LCS deeply and you get four problems almost free.

---

## 0. The Big Idea: What Is String DP?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "STRING DP"                             │
├──────────────────────────────────────────────────────────────────┤
│  • "SUBSEQUENCE" (skip chars, keep order) or "SUBSTRING"         │
│  • "LONGEST COMMON ..." between two strings                      │
│  • "PALINDROME" (subsequence, partition, insertions)             │
│  • "Convert A to B" with insert / delete / replace               │
│  • "Does pattern MATCH text?" (wildcards, '.', '*')              │
│  • "How many WAYS does t appear in s?"                           │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: two pointers become a table

```
   Two strings:  A = "a b c d e"     B = "a c e"
                       ▲ i                 ▲ j

   dp[i][j] = answer for the PREFIXES  A[0..i)  and  B[0..j)
              (the first i chars of A, the first j chars of B)

              ""   a    c    e        ← B prefixes (j)
           ┌────┬────┬────┬────┐
      ""   │ 0  │ 0  │ 0  │ 0  │     row 0 / col 0 = EMPTY string
           ├────┼────┼────┼────┤     (the base cases)
      a    │ 0  │    │    │    │
           ├────┼────┼────┼────┤
      b    │ 0  │    │    │    │
           ├────┼────┼────┼────┤
      c    │ 0  │    │    │    │
           ├────┼────┼────┼────┤
      d    │ 0  │    │    │    │
           ├────┼────┼────┼────┤
      e    │ 0  │    │    │ ★  │  ★ = answer for the full strings
           └────┴────┴────┴────┘
      ↑ A prefixes (i)

   Size is (n+1) × (m+1). The extra row/col for "" removes edge cases.
```

### The core decision: compare the LAST characters

```
              A[0..i)  ends with  A[i-1]
              B[0..j)  ends with  B[j-1]

                    A[i-1] == B[j-1] ?
                ┌────────┴────────┐
              MATCH            MISMATCH
                │                  │
     use both chars, go      drop one char from A or B
     DIAGONAL ↖              (or edit it), go UP ↑ or LEFT ←
     dp[i-1][j-1]            dp[i-1][j],  dp[i][j-1]

            ┌──────────┬──────────┐
            │ i-1, j-1 │ i-1, j   │
            │    ↖     │    ↑     │
            ├──────────┼──────────┤
            │ i, j-1 ← │  i, j    │
            └──────────┴──────────┘

   ↖ diagonal = consume a char from BOTH strings
   ↑ up       = consume a char from A only
   ← left     = consume a char from B only
```

> 💡 **Almost every two-string DP is these three arrows.**
> The problems differ only in *when* each arrow is allowed and *how* you combine them (+, min, max, OR).

### Two shapes of string DP

```
  SHAPE A: TWO STRINGS, PREFIX PAIR      SHAPE B: ONE STRING, INTERVAL
  dp[i][j] = A[0..i) vs B[0..j)          dp[i][j] = substring s[i..j]

  ┌──┬──┬──┬──┐                          ┌──┬──┬──┬──┐
  │  │  │  │  │  fill top-left →         │██│  │  │  │  only the upper
  ├──┼──┼──┼──┤  bottom-right            ├──┼──┼──┼──┤  triangle (i ≤ j)
  │  │  │  │  │  (like grid DP)          │  │██│  │  │  matters
  ├──┼──┼──┼──┤                          ├──┼──┼──┼──┤
  │  │  │  │ ★│  answer at (n, m)        │  │  │██│  │  answer at (0, n-1)
  └──┴──┴──┴──┘                          └──┴──┴──┴──┘ ★ = top-right corner

  LCS, Edit Distance, Distinct Subseq,   Palindromic Subsequence,
  Interleaving, Regex                    Min Insertions Palindrome,
                                         isPalindrome table
```

### Fill-order rules

```
  ┌──────────────────────────────────┬────────────────────────────────────┐
  │ Cell depends on...               │ Fill order                         │
  ├──────────────────────────────────┼────────────────────────────────────┤
  │ ↖ ↑ ← (prefix pair)              │ i = 0..n, j = 0..m (row by row)    │
  │ s[i+1..j-1], s[i+1..j], s[i..j-1]│ i from n-1 DOWN to 0,              │
  │ (interval / palindrome)          │ j from i UP to n-1                 │
  │                                  │ (or: by increasing length)         │
  │ smaller lengths (scramble)       │ len = 1..n                         │
  └──────────────────────────────────┴────────────────────────────────────┘
```

### The 5-step recipe (same as before, now with two indices)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  STATE        dp[i][j] = ______ for A[0..i), B[0..j)   │
 │                      (or for substring s[i..j])               │
 │ STEP 2  TRANSITION   "Do the last chars match? If not, what   │
 │                       are my options?"                        │
 │ STEP 3  BASE         row 0 / col 0 = one string is EMPTY      │
 │ STEP 4  ORDER        so ↖ ↑ ← are ready                       │
 │ STEP 5  ANSWER       usually dp[n][m] or dp[0][n-1]           │
 └───────────────────────────────────────────────────────────────┘
```

### Space optimization: 2D → 1D (with a diagonal temp)

```
  Row i only reads row i-1 → keep ONE row array.

   row (old = row i-1):  [ a ][ b ][ c ][ d ]
   computing row i, at column j:

        row[j]   (not yet overwritten) = UP        ↑
        row[j-1] (just overwritten)    = LEFT      ←
        DIAGONAL ↖ = the OLD row[j-1]  → it is gone! Save it in a temp first.

   for each j:
       temp   ← row[j]           // old value = next step's diagonal
       row[j] ← f(diag, row[j], row[j-1])
       diag   ← temp

   O(n·m) space  ──►  O(m) space
```

> ⚠️ This is the one difference from grid DP: string problems almost always need the **diagonal**,
> so you need that `diag` temp variable.

---

## 1. Is Subsequence (Easy)

### Problem
Is `s` a **subsequence** of `t`? (Delete some chars of `t`, without reordering, to get `s`.)

### Visualize it

```
   s =  a     b        c
        │     │        │
   t =  a  h  b  g  d  c         ✅ true: a, b, c appear in order
        ▲     ▲        ▲
```

### The decision: greedy two pointers (DP not needed)

```
     i → s        j → t

     s[i] == t[j] ?
        ├── yes → match it, advance BOTH  (i+1, j+1)
        └── no  → skip t[j], advance j    (i,   j+1)

     Done when i reaches the end of s → true.
     Ran out of t first → false.

   Why greedy is safe: matching s[i] with the EARLIEST possible t[j]
   leaves the most room in t for the rest of s.
```

### The 5 steps (DP view, for the LCS connection)

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = is `s[0..i)` a subsequence of `t[0..j)`? |
| Transition | match → `dp[i-1][j-1]`; else → `dp[i][j-1]` (skip a char of t) |
| Base | `dp[0][j] = true` (empty s), `dp[i][0] = false` for i > 0 |
| Order | row by row |
| Answer | `dp[n][m]` |

### Trace (s = "abc", t = "ahbgdc")

```
  t index :  0   1   2   3   4   5
  t       :  a   h   b   g   d   c
  i (s)   :  0→1 1   1→2 2   2   2→3
  matched :  a       b           c        i == 3 == len(s) → true ✅
```

### Pseudocode

```
function isSubsequence(s, t):
    i ← 0
    for each char ch in t:
        if i < length(s) and s[i] == ch:
            i ← i + 1
    return i == length(s)
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| DP table | O(n·m) | O(n·m) |
| **Two pointers** | **O(m)** | **O(1)** ✅ |
| Many queries `s₁, s₂, ...` vs the same `t` | O(len(s) · log m) each | O(m) |

> Follow-up (many `s` queries): store, for each letter, the sorted list of its positions in `t`.
> For each char of `s`, binary-search the next position after the previous match.

### 📌 Points to remember
- Equivalent check: `LCS(s, t) == length(s)`. That's the bridge to problem 2.
- Greedy works here because there is only one string to match fully.
- Empty `s` is always a subsequence.

---

## 2. Longest Common Subsequence (Medium)

### Problem
Length of the longest subsequence common to `text1` and `text2`.

### Visualize it

```
   text1 =  a  b  c  d  e
            │     │     │
   text2 =  a     c     e          LCS = "ace", length 3 ✅
```

### The decision

```
                 text1[i-1] == text2[j-1] ?
              ┌──────────┴───────────┐
            MATCH                 MISMATCH
              │                       │
   this char is in the LCS    one of the two chars is NOT in it.
   1 + dp[i-1][j-1]  ↖        Try dropping each, keep the better:
                              max( dp[i-1][j] ↑ , dp[i][j-1] ← )
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = LCS length of `text1[0..i)` and `text2[0..j)` |
| Transition | match → `1 + dp[i-1][j-1]`; else → `max(dp[i-1][j], dp[i][j-1])` |
| Base | row 0 and col 0 = 0 (empty string shares nothing) |
| Order | row by row, left → right |
| Answer | `dp[n][m]` |

### Trace (text1 = "abcde", text2 = "ace")

```
             ""   a    c    e
          ┌────┬────┬────┬────┐
     ""   │ 0  │ 0  │ 0  │ 0  │
          ├────┼────┼────┼────┤
     a    │ 0  │ 1↖ │ 1  │ 1  │   a == a → 1 + 0
          ├────┼────┼────┼────┤
     b    │ 0  │ 1  │ 1  │ 1  │   no matches, copy best of ↑ ←
          ├────┼────┼────┼────┤
     c    │ 0  │ 1  │ 2↖ │ 2  │   c == c → 1 + dp[b][a] = 2
          ├────┼────┼────┼────┤
     d    │ 0  │ 1  │ 2  │ 2  │
          ├────┼────┼────┼────┤
     e    │ 0  │ 1  │ 2  │ 3↖ │   e == e → 1 + dp[d][c] = 3  ✅
          └────┴────┴────┴────┘
```

### Recover the actual LCS: walk back from the corner

```
  start at (n, m):
     chars match           → this char is in the LCS, go ↖
     else, ↑ ≥ ←           → go ↑
     else                  → go ←
  stop at row 0 or col 0. Read the collected chars in reverse.

  (5,3) e==e ✓ → (4,2) d≠c, ↑=2 ≥ ←=1 → (3,2) c==c ✓ → (2,1) b≠a, ↑=1 → (1,1) a==a ✓
  collected: e, c, a  → reversed: "ace" ✅
```

### Pseudocode (1D row + diagonal temp)

```
function LCS(A, B):
    row ← array of m+1, all 0
    for i from 1 to n:
        diag ← 0                          // dp[i-1][0]
        for j from 1 to m:
            temp ← row[j]                 // dp[i-1][j], next diagonal
            if A[i-1] == B[j-1]:
                row[j] ← diag + 1
            else:
                row[j] ← max(row[j], row[j-1])
            diag ← temp
    return row[m]
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Recursion | O(2^(n+m)) | O(n+m) |
| Memo / 2D table | O(n·m) | O(n·m) |
| **1D row + diag** | **O(n·m)** | **O(min(n,m))** ✅ (put the shorter string on columns) |

> ⚠️ The 1D version gives only the **length**. To rebuild the string itself, keep the full table.

### 📌 Points to remember
- **LCS is the mother problem.** Problems 3, 4, 5 and 6 reduce to it.
- Subsequence (skip allowed) → mismatch takes `max(↑, ←)`.
- Longest Common **Substring** (contiguous) is different: mismatch → **0**, answer = max over all cells.

---

## 3. Minimum Insertions and Deletions A → B (Medium)

### Problem
Convert string `A` into string `B` using only **insert** and **delete**. Find the minimum number of operations.
(LeetCode 583 "Delete Operation for Two Strings" is the same idea.)

### Visualize it: keep the LCS, fix everything else

```
   A = "heap"        B = "pea"        LCS = "ea" (length 2)

   A:   h   e   a   p             B:   p   e   a
        ✗   ✓   ✓   ✗                  +   ✓   ✓
      delete keep keep delete        insert keep keep

   ┌──────────────────────────────────────────────────┐
   │ deletions  = len(A) − LCS = 4 − 2 = 2  (h, p)     │
   │ insertions = len(B) − LCS = 3 − 2 = 1  (p)        │
   │ total      = n + m − 2·LCS = 3 ✅                  │
   └──────────────────────────────────────────────────┘

   heap → eap → ea → pea
```

### Why LCS is optimal

```
   Everything you DON'T delete from A survives into B in the same order
   → the survivors form a COMMON SUBSEQUENCE.
   More survivors = fewer operations → keep the LONGEST common subsequence.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | reuse LCS: `dp[i][j]` = LCS of `A[0..i)`, `B[0..j)` |
| Transition | LCS recurrence |
| Base | LCS base |
| Order | row by row |
| Answer | deletions `n − L`, insertions `m − L`, total `n + m − 2L` |

### Trace: LCS table for "heap" vs "pea"

```
             ""   p    e    a
          ┌────┬────┬────┬────┐
     ""   │ 0  │ 0  │ 0  │ 0  │
     h    │ 0  │ 0  │ 0  │ 0  │
     e    │ 0  │ 0  │ 1↖ │ 1  │
     a    │ 0  │ 0  │ 1  │ 2↖ │
     p    │ 0  │ 1↖ │ 1  │ 2  │   L = 2  →  4 + 3 − 4 = 3 ✅
          └────┴────┴────┴────┘
```

### Pseudocode

```
function minInsDel(A, B):
    L ← LCS(A, B)
    return (length(A) − L) + (length(B) − L)
```

### 📌 Points to remember
- **Insert/delete only → LCS.** Add **replace** and it becomes Edit Distance (problem 7).
- Interviewers often ask for the two counts separately. Give both.
- Weighted variant (LC 712, min ASCII delete sum): same table, but store the max ASCII sum kept instead of the count.

---

## 4. Shortest Common Supersequence (Hard)

### Problem
Shortest string that has **both** `str1` and `str2` as subsequences. Return the string itself.

### Visualize it: merge the two strings, sharing the LCS once

```
   str1 = "abac"      str2 = "cab"      LCS = "ab"

   str2:  c   a   b
   str1:      a   b   a   c
              ↑   ↑
            shared (LCS)

   SCS  = "c a b a c"  → length 5 = 4 + 3 − 2 ✅

   ┌────────────────────────────────────────────┐
   │ length(SCS) = n + m − LCS                   │
   │ (write every char once, LCS chars only once)│
   └────────────────────────────────────────────┘
```

### Trace: LCS table for "abac" vs "cab"

```
             ""   c    a    b
          ┌────┬────┬────┬────┐
     ""   │ 0  │ 0  │ 0  │ 0  │
     a    │ 0  │ 0  │ 1  │ 1  │
     b    │ 0  │ 0  │ 1  │ 2  │
     a    │ 0  │ 0  │ 1  │ 2  │
     c    │ 0  │ 1  │ 1  │ 2  │   LCS = 2
          └────┴────┴────┴────┘
```

### Build the string: walk back from (n, m)

```
  RULES (walking from the bottom-right corner):
    • chars match         → emit it ONCE, go ↖
    • ↑ ≥ ←               → emit str1[i-1], go ↑
    • else                → emit str2[j-1], go ←
    • one string used up  → emit the rest of the other
  Then REVERSE what you emitted.

  pos    str1[i-1] str2[j-1]   decision                 emit
  (4,3)     c         b        ↑=2 ≥ ←=1 → go ↑          c
  (3,3)     a         b        ↑=2 ≥ ←=1 → go ↑          a
  (2,3)     b         b        match → go ↖              b
  (1,2)     a         a        match → go ↖              a
  (0,1)     —         c        str1 used up → rest of str2  c

  emitted: c a b a c  → reversed: "cabac" ✅
```

> 💡 The walk is the same as recovering the LCS. The only difference is that you also emit the
> chars you **skip**, because a supersequence must contain them.

### Pseudocode

```
function shortestCommonSupersequence(A, B):
    dp ← full LCS table (n+1) × (m+1)          // need the full table to walk
    i ← n, j ← m, out ← empty list
    while i > 0 and j > 0:
        if A[i-1] == B[j-1]:
            append A[i-1];  i ← i−1;  j ← j−1
        else if dp[i-1][j] ≥ dp[i][j-1]:
            append A[i-1];  i ← i−1
        else:
            append B[j-1];  j ← j−1
    while i > 0: append A[i-1]; i ← i−1
    while j > 0: append B[j-1]; j ← j−1
    return reverse(out)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Length only | O(n·m) | O(min(n,m)) |
| **Actual string** | **O(n·m)** | **O(n·m)** (the walk needs the full table) |

### 📌 Points to remember
- **Length = n + m − LCS.** Instant once you know LCS.
- Don't forget the leftovers when one string runs out.
- Several answers can be valid. Any shortest one is accepted.

---

## 5. Longest Palindromic Subsequence (Medium)

### Problem
Length of the longest subsequence of `s` that reads the same both ways.

### Visualize it

```
   s =  b  b  b  a  b
        ●  ●  ●     ●          "bbbb" → length 4 ✅
```

### Two ways to see it

```
   WAY 1 (reduction):  LPS(s) = LCS( s, reverse(s) )
       s       = b b b a b
       rev(s)  = b a b b b         LCS = "bbbb" = 4
       A palindrome reads the same forward and backward,
       so it's a common subsequence of s and its reverse.

   WAY 2 (interval DP, the native form):
       dp[i][j] = LPS of the substring s[i..j]

                   s[i] == s[j] ?
             ┌──────────┴──────────┐
           MATCH                MISMATCH
             │                     │
   wrap the inner part:     drop one end:
   2 + dp[i+1][j-1]         max( dp[i+1][j], dp[i][j-1] )

        [ s[i]   ( inner s[i+1..j-1] )   s[j] ]
           ▲                               ▲
           └──── equal → both join ────────┘
```

### The 5 steps (interval form)

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = LPS length inside `s[i..j]` |
| Transition | match → `2 + dp[i+1][j-1]`; else → `max(dp[i+1][j], dp[i][j-1])` |
| Base | `dp[i][i] = 1`; empty range (`i > j`) = 0 |
| Order | **i from n-1 down to 0**, j from i+1 up to n-1 |
| Answer | `dp[0][n-1]` |

### Trace (s = "bbbab")

```
   j →       0    1    2    3    4
   i ↓       b    b    b    a    b
          ┌────┬────┬────┬────┬────┐
   0  b   │ 1  │ 2  │ 3  │ 3  │ 4★ │   (0,4): b==b → 2 + dp[1][3] = 2 + 2
          ├────┼────┼────┼────┼────┤
   1  b   │    │ 1  │ 2  │ 2  │ 3  │   (1,4): b==b → 2 + dp[2][3] = 2 + 1
          ├────┼────┼────┼────┼────┤
   2  b   │    │    │ 1  │ 1  │ 3  │   (2,4): b==b → 2 + dp[3][3] = 3
          ├────┼────┼────┼────┼────┤
   3  a   │    │    │    │ 1  │ 1  │   (3,4): a≠b → max(1, 1)
          ├────┼────┼────┼────┼────┤
   4  b   │    │    │    │    │ 1  │
          └────┴────┴────┴────┴────┘
     fill direction: bottom row first ↑, each row left → right

   (0,3): b≠a → max(dp[1][3]=2, dp[0][2]=3) = 3
   answer dp[0][4] = 4 ✅
```

### Pseudocode (1D: one row, diagonal temp)

```
function longestPalindromeSubseq(s):
    row ← array of n, all 0          // row[j] holds dp[i+1][j] before update
    for i from n-1 down to 0:
        row[i] ← 1
        diag ← 0                     // dp[i+1][i] (empty range)
        for j from i+1 to n-1:
            temp ← row[j]            // dp[i+1][j]
            if s[i] == s[j]:
                row[j] ← diag + 2
            else:
                row[j] ← max(row[j], row[j-1])
            diag ← temp
    return row[n-1]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Recursion on (i, j) | O(2ⁿ) | O(n) |
| Interval table / LCS with reverse | O(n²) | O(n²) |
| **1D row** | **O(n²)** | **O(n)** ✅ |

### 📌 Points to remember
- **Interval DP fill order:** `i` goes **down**, `j` goes **up**. You need the row below.
- Two routes, same answer: interval DP, or LCS of s and its reverse.
- Don't confuse it with Longest Palindromic **Substring** (contiguous). That one uses expand-around-center.

---

## 6. Minimum Insertions to Make a String Palindrome (Hard)

### Problem
Minimum number of characters to **insert** (anywhere) to make `s` a palindrome.

### Visualize it: keep the LPS, mirror everything else

```
   s = "m b a d m"        LPS = "mam" (or "mbm", "mdm"), length 3

        m   b   a   d   m
        ●       ●       ●        LPS chars stay as the palindrome's "spine"
            ✗       ✗            the others each need a MIRROR partner inserted

   result: m b d a d b m   (inserted 2: one 'd', one 'b')

   ┌──────────────────────────────────────────┐
   │ min insertions = n − LPS(s) = 5 − 3 = 2 ✅│
   └──────────────────────────────────────────┘
```

### Direct recurrence (if you prefer not to reduce)

```
   ins[i][j] = min insertions to make s[i..j] a palindrome

                    s[i] == s[j] ?
              ┌──────────┴──────────┐
            MATCH                MISMATCH
   ins[i+1][j-1]            1 + min( ins[i+1][j],     ← insert a copy of s[i] near j
                                     ins[i][j-1] )    ← insert a copy of s[j] near i
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `LPS` table from problem 5 (or `ins[i][j]` above) |
| Transition | LPS recurrence |
| Base | `dp[i][i] = 1` |
| Order | i down, j up |
| Answer | `n − dp[0][n-1]` |

### Trace: LPS table for "mbadm"

```
   j →       0    1    2    3    4
   i ↓       m    b    a    d    m
          ┌────┬────┬────┬────┬────┐
   0  m   │ 1  │ 1  │ 1  │ 1  │ 3★ │   m==m → 2 + dp[1][3] = 2 + 1
   1  b   │    │ 1  │ 1  │ 1  │ 1  │
   2  a   │    │    │ 1  │ 1  │ 1  │   no inner pairs match
   3  d   │    │    │    │ 1  │ 1  │
   4  m   │    │    │    │    │ 1  │
          └────┴────┴────┴────┴────┘
   LPS = 3 → insertions = 5 − 3 = 2 ✅     ("leetcode": LPS 3 → 8 − 3 = 5)
```

### Pseudocode

```
function minInsertionsPalindrome(s):
    return length(s) − longestPalindromeSubseq(s)
```

### 📌 Points to remember
- **n − LPS** answers both "min insertions" **and** "min deletions" to make a palindrome.
- Chain of reductions: Min Insertions → LPS → LCS(s, reverse s).
- O(n²) time, O(n) space with the 1D LPS.

---

## 7. Edit Distance (Medium)

### Problem
Minimum operations to turn `word1` into `word2`. Each op: **insert**, **delete**, or **replace** one char.

### Visualize it

```
   horse → rorse   (replace h → r)
   rorse → rose    (delete r)
   rose  → ros     (delete e)            3 operations ✅
```

### The decision: the three arrows ARE the three operations

```
                    word1[i-1] == word2[j-1] ?
              ┌──────────────┴──────────────┐
            MATCH                        MISMATCH
     free! dp[i-1][j-1]  ↖        1 + min of three options:

          ┌───────────────┬───────────────┐
          │ ↖ REPLACE     │ ↑ DELETE      │
          │ dp[i-1][j-1]  │ dp[i-1][j]    │   delete word1[i-1]
          │ fix this char │               │
          ├───────────────┼───────────────┤
          │ ← INSERT      │   (i, j)      │
          │ dp[i][j-1]    │               │   insert word2[j-1]
          └───────────────┴───────────────┘
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = min ops to turn `word1[0..i)` into `word2[0..j)` |
| Transition | match → `dp[i-1][j-1]`; else `1 + min(↖, ↑, ←)` |
| Base | `dp[i][0] = i` (delete all), `dp[0][j] = j` (insert all) |
| Order | row by row |
| Answer | `dp[n][m]` |

### Trace (word1 = "horse", word2 = "ros")

```
             ""   r    o    s
          ┌────┬────┬────┬────┐
     ""   │ 0  │ 1  │ 2  │ 3  │   insert j chars
          ├────┼────┼────┼────┤
     h    │ 1  │ 1  │ 2  │ 3  │   h≠r → 1 + min(0,1,1) = 1 (replace)
          ├────┼────┼────┼────┤
     o    │ 2  │ 2  │ 1↖ │ 2  │   o==o → dp[h][r] = 1 (free)
          ├────┼────┼────┼────┤
     r    │ 3  │ 2↖ │ 2  │ 2  │   r==r → dp[ho][""] = 2
          ├────┼────┼────┼────┤
     s    │ 4  │ 3  │ 3  │ 2↖ │   s==s → dp[hor][ro] = 2
          ├────┼────┼────┼────┤
     e    │ 5  │ 4  │ 4  │ 3  │   e≠s → 1 + min(3, 2↑, 4) = 3  ✅ (delete e)
          └────┴────┴────┴────┘
     ↑ delete i chars
```

### Pseudocode (1D row + diagonal)

```
function editDistance(A, B):
    row ← [0, 1, 2, ..., m]               // dp[0][j] = j
    for i from 1 to n:
        diag   ← row[0]                   // dp[i-1][0]
        row[0] ← i                        // dp[i][0]
        for j from 1 to m:
            temp ← row[j]                 // dp[i-1][j]
            if A[i-1] == B[j-1]:
                row[j] ← diag
            else:
                row[j] ← 1 + min(diag, row[j], row[j-1])
                                //  replace  delete  insert
            diag ← temp
    return row[m]
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Recursion | O(3^(n+m)) | O(n+m) |
| Memo / table | O(n·m) | O(n·m) |
| **1D row + diag** | **O(n·m)** | **O(m)** ✅ |

### 📌 Points to remember
- **Base cases are NOT zero.** Row 0 = `j`, column 0 = `i`.
- ↖ replace, ↑ delete, ← insert. Draw the 2×2 box when you forget.
- Remove "replace" and you get problem 3 (`n + m − 2·LCS`).
- Used in spell-checkers, DNA alignment, `diff` tools.

---

## 8. Distinct Subsequences (Hard)

### Problem
Count how many **distinct ways** `t` appears as a subsequence of `s`.

### Visualize it

```
   s = "babgbag",  t = "bag"   → 5 ways

   b a b g b a g
   ●─●───●           1: positions 0,1,3
   ●─●─────────●     2: positions 0,1,6
   ●─────────●─●     3: positions 0,5,6
       ●─────●─●     4: positions 2,5,6
           ●─●─●     5: positions 4,5,6
```

### The decision: use s's last char, or skip it

```
   dp[i][j] = ways to form t[0..j) from s[0..i)

                   s[i-1] == t[j-1] ?
              ┌──────────┴──────────┐
            MATCH                MISMATCH
              │                     │
   USE it:  dp[i-1][j-1]         must SKIP it:
     +                           dp[i-1][j]
   SKIP it: dp[i-1][j]

   Counting → ADD the two choices.
   (Even on a match you may skip it and use a later copy.)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = # ways `t[0..j)` appears in `s[0..i)` |
| Transition | match → `dp[i-1][j-1] + dp[i-1][j]`; else → `dp[i-1][j]` |
| Base | `dp[i][0] = 1` (empty t: one way), `dp[0][j] = 0` for j > 0 |
| Order | row by row |
| Answer | `dp[n][m]` |

### Trace (s = "babgbag", t = "bag")

```
                   ""   b    a    g
                ┌────┬────┬────┬────┐
     ""         │ 1  │ 0  │ 0  │ 0  │
     b  (i=1)   │ 1  │ 1  │ 0  │ 0  │   b==b: 1 + 0
     a  (i=2)   │ 1  │ 1  │ 1  │ 0  │   a==a: 1 + 0
     b  (i=3)   │ 1  │ 2  │ 1  │ 0  │   b==b: 1 + 1 = 2
     g  (i=4)   │ 1  │ 2  │ 1  │ 1  │   g==g: 1 + 0
     b  (i=5)   │ 1  │ 3  │ 1  │ 1  │   b==b: 1 + 2 = 3
     a  (i=6)   │ 1  │ 3  │ 4  │ 1  │   a==a: 3 + 1 = 4
     g  (i=7)   │ 1  │ 3  │ 4  │ 5★ │   g==g: 4 + 1 = 5 ✅
                └────┴────┴────┴────┘
```

### Pseudocode (1D, iterate j RIGHT → LEFT)

```
function numDistinct(s, t):
    row ← array of m+1, all 0
    row[0] ← 1
    for i from 1 to n:
        for j from m down to 1:            // ⚠ right to left!
            if s[i-1] == t[j-1]:
                row[j] ← row[j] + row[j-1]
    return row[m]
```

> 💡 Going **right → left** means `row[j-1]` is still the OLD value (= the diagonal).
> No temp needed. This is the same trick as 0-1 knapsack.

### 📌 Points to remember
- Counting → **add**. Even a matching char can be **skipped**.
- `dp[i][0] = 1`: there is exactly one way to form the empty string.
- Counts can get large. Use 64-bit (LeetCode guarantees the answer fits in 32-bit, but intermediates may not).
- If `len(t) > len(s)` → 0.

---

## 9. Interleaving String (Medium)

### Problem
Can `s3` be formed by **interleaving** `s1` and `s2`, keeping each one's internal order?

### Visualize it: a path through the grid

```
   s1 = "aa"   s2 = "ab"   s3 = "aaba"

   Think of a grid: DOWN = take next char of s1, RIGHT = take next char of s2.
   s3 is spelled out along the path.

              ""     a      b      ← s2
           ┌──────┬──────┬──────┐
     ""    │ START│  →a  │      │
           ├──────┼──────┼──────┤
     a     │      │  ↓a  │  →b  │     path: right(a from s2), down(a from s1),
           ├──────┼──────┼──────┤           right(b from s2), down(a from s1)
     a     │      │      │  ↓a  │     spells: a a b a  ✅
           └──────┴──────┴──────┘
     ↑ s1

   Cell (i, j) has used i chars of s1 and j chars of s2
   → it has spelled s3[0..i+j).  The next char to match is s3[i+j-1].
```

### The decision

```
   dp[i][j] = can s1[0..i) and s2[0..j) interleave into s3[0..i+j)?

   came from ABOVE ↑ (last char was s1's):  dp[i-1][j] AND s1[i-1] == s3[i+j-1]
                        OR
   came from LEFT  ← (last char was s2's):  dp[i][j-1] AND s2[j-1] == s3[i+j-1]
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = boolean above |
| Transition | `(↑ and s1 char fits) OR (← and s2 char fits)` |
| Base | `dp[0][0] = true`; row 0 / col 0 = prefix checks against s3 |
| Order | row by row |
| Answer | `dp[n][m]`, but **first check** `n + m == len(s3)` |

### Trace (s1 = "aa", s2 = "ab", s3 = "aaba")

```
               ""     a      b        s3 = a a b a
            ┌──────┬──────┬──────┐         0 1 2 3
     ""     │  T   │  T   │  F   │   (0,2): s2[1]='b' vs s3[1]='a' ✗
            ├──────┼──────┼──────┤
     a      │  T   │  T   │  T   │   (1,2): ← T and 'b' == s3[2] ✓
            ├──────┼──────┼──────┤
     a      │  T   │  F   │  T★  │   (2,1): ↑ 'a' vs s3[2]='b' ✗, ← 'a' vs 'b' ✗
            └──────┴──────┴──────┘   (2,2): ↑ T and s1[1]='a' == s3[3] ✓  → true ✅
```

> The classic example `s1="aabcc", s2="dbbca", s3="aadbbcbcac"` → true, with the same table on a 6×6 grid.

### Pseudocode (1D row)

```
function isInterleave(s1, s2, s3):
    if n + m ≠ length(s3): return false
    row ← array of m+1
    row[0] ← true
    for j from 1 to m:
        row[j] ← row[j-1] and s2[j-1] == s3[j-1]
    for i from 1 to n:
        row[0] ← row[0] and s1[i-1] == s3[i-1]
        for j from 1 to m:
            k ← i + j − 1
            row[j] ← (row[j]   and s1[i-1] == s3[k])     // from above
                  or (row[j-1] and s2[j-1] == s3[k])     // from left
    return row[m]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Plain recursion (three pointers) | O(2^(n+m)) | O(n+m) |
| Memo on (i, j) (k = i + j is derived) | O(n·m) | O(n·m) |
| **1D row** | **O(n·m)** | **O(m)** ✅ |

### 📌 Points to remember
- **Length check first.** `n + m ≠ len(s3)` → false immediately.
- Only two indices: the s3 index is always `i + j`. (Same trick as Cherry Pickup's `c = t − r`.)
- Greedy "take from s1 whenever it matches" fails when both strings offer the same char.

---

## 10. Palindrome Partitioning II (Hard)

### Problem
Cut `s` so that **every piece is a palindrome**. Return the **minimum number of cuts**.

### Visualize it

```
   s = "a b a c c"

   a | b | a | c | c      4 cuts
   aba | c | c            2 cuts
   aba | cc               1 cut  ✅
```

### Two DPs working together

```
   DP #1  isPal[j][i] = is s[j..i] a palindrome?      (interval DP)
          isPal[j][i] = s[j] == s[i]  AND  (i − j < 2  OR  isPal[j+1][i-1])

   DP #2  cuts[i] = min cuts for the prefix s[0..i]   (1D DP!)

                       s[0..i] itself a palindrome?
                   ┌──────────────┴──────────────┐
                  YES                            NO
              cuts[i] = 0         try every LAST piece s[j..i] that is a palindrome:
                                  cuts[i] = min( cuts[j-1] + 1 )

      ┌──────────────────────┬─────────────────┐
      │  s[0..j-1]           │  s[j..i]        │
      │  (best: cuts[j-1])   │  palindrome ✓   │
      └──────────────────────┴─────────────────┘
                            ▲
                        one more cut
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `cuts[i]` = min cuts for `s[0..i]` |
| Transition | `0` if whole prefix is a palindrome, else `min(cuts[j-1] + 1)` over palindromic `s[j..i]` |
| Base | `cuts[0] = 0` |
| Order | i left → right |
| Answer | `cuts[n-1]` |

### Trace (s = "abacc")

```
  i   prefix    whole pal?   palindromic last pieces s[j..i]       cuts[i]
  ─   ───────   ──────────   ───────────────────────────────────   ───────
  0   a         yes          —                                     0
  1   ab        no           "b" (j=1) → cuts[0]+1 = 1             1
  2   aba       yes          —                                     0
  3   abac      no           "c" (j=3) → cuts[2]+1 = 1             1
  4   abacc     no           "cc" (j=3) → cuts[2]+1 = 1            1 ✅
                             "c"  (j=4) → cuts[3]+1 = 2

             ┌───┬───┬───┬───┬───┐
   cuts:     │ 0 │ 1 │ 0 │ 1 │ 1 │      answer: "aba | cc"
             └───┴───┴───┴───┴───┘
```

### Pseudocode

```
function minCut(s):
    isPal ← n × n table of false
    cuts  ← array of n
    for i from 0 to n-1:
        cuts[i] ← i                          // worst case: cut before every char
        for j from 0 to i:
            if s[j] == s[i] and (i − j < 2 or isPal[j+1][i-1]):
                isPal[j][i] ← true
                if j == 0: cuts[i] ← 0
                else:      cuts[i] ← min(cuts[i], cuts[j-1] + 1)
    return cuts[n-1]
```

> Order check: `isPal[j+1][i-1]` was set while processing `i-1`, so it's ready in time.

### 🚀 Optimization: expand around centers (O(n) extra space)

```
  For every center (each char, and each gap between chars):
      expand l ← left, r ← right while s[l] == s[r]:
          s[l..r] is a palindrome →
          cuts[r] = min( cuts[r], (l == 0 ? 0 : cuts[l-1] + 1) )

     . a . b . a . c . c .      ← 2n − 1 centers
       ▲   ▲   ▲   ▲   ▲
   No n × n isPal table needed.
```

| Approach | Time | Space |
|---|---|---|
| Try all partitions (backtracking) | O(n · 2ⁿ) | O(n) |
| isPal table + cuts | O(n²) | O(n²) |
| **Expand around center + cuts** | **O(n²)** | **O(n)** ✅ |

### 📌 Points to remember
- Answer is **cuts**, not pieces. Pieces = cuts + 1.
- The cuts array is a **1D DP**. The palindrome check is a **2D interval DP**.
- Palindrome Partitioning I (list all partitions) is backtracking. II (min cuts) is DP.

---

## 11. Regular Expression Matching (Hard)

### Problem
Does pattern `p` match **all** of `s`? `.` matches any single char. `x*` matches **zero or more** of `x`.

### Visualize it

```
   s = "aab"     p = "c*a*b"

   c*  → zero c's      ""
   a*  → two a's       "aa"
   b   → one b         "b"       →  "aab" ✅ match
```

### The decision: is the pattern's last token a star?

```
   dp[i][j] = does s[0..i) match p[0..j)?

                          p[j-1] == '*' ?
              ┌──────────────────┴──────────────────┐
             NO                                     YES  (token is "x*", x = p[j-2])
              │                                     │
   single char must match:           ┌──────────────┴──────────────┐
   match(s[i-1], p[j-1])          ZERO copies                 ONE MORE copy
   AND dp[i-1][j-1]  ↖            drop "x*" entirely:         s[i-1] matches x
                                  dp[i][j-2]  ← ←             AND dp[i-1][j]  ↑
                                                              (stay on "x*": it may
                                                               eat even more)

   match(c, x) = (x == '.' or x == c)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i][j]` = `s[0..i)` matches `p[0..j)` |
| Transition | see the picture above |
| Base | `dp[0][0] = true`; `dp[0][j] = (p[j-1] == '*') and dp[0][j-2]` (patterns like `a*b*` match "") |
| Order | row by row |
| Answer | `dp[n][m]` |

### Trace (s = "aab", p = "c*a*b")

```
              ""    c     *     a     *     b
           ┌─────┬─────┬─────┬─────┬─────┬─────┐
     ""    │  T  │  F  │  T  │  F  │  T  │  F  │   c* and c*a* can be empty
           ├─────┼─────┼─────┼─────┼─────┼─────┤
     a     │  F  │  F  │  F  │  T  │  T  │  F  │   (1,3): 'a'=='a' and dp[0][2]=T
           ├─────┼─────┼─────┼─────┼─────┼─────┤   (1,4): a* eats 'a': dp[0][4]=T
     a     │  F  │  F  │  F  │  F  │  T  │  F  │   (2,4): a* eats 'a': dp[1][4]=T
           ├─────┼─────┼─────┼─────┼─────┼─────┤
     b     │  F  │  F  │  F  │  F  │  F  │  T★ │   (3,5): 'b'=='b' and dp[2][4]=T ✅
           └─────┴─────┴─────┴─────┴─────┴─────┘
```

### Pseudocode

```
function isMatch(s, p):
    dp ← (n+1) × (m+1) table of false
    dp[0][0] ← true
    for j from 2 to m:
        if p[j-1] == '*': dp[0][j] ← dp[0][j-2]
    for i from 1 to n:
        for j from 1 to m:
            if p[j-1] == '*':
                dp[i][j] ← dp[i][j-2]                                   // zero copies
                if p[j-2] == '.' or p[j-2] == s[i-1]:
                    dp[i][j] ← dp[i][j] or dp[i-1][j]                   // one more copy
            else if p[j-1] == '.' or p[j-1] == s[i-1]:
                dp[i][j] ← dp[i-1][j-1]
    return dp[n][m]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Plain recursion (backtracking) | exponential | O(n+m) |
| Memo / table | O(n·m) | O(n·m) |
| 1D (two rows) | O(n·m) | O(m) |

### 📌 Points to remember
- `*` is **never alone**. It always belongs to the char before it. Treat `x*` as one token.
- "One more copy" goes ↑ (`dp[i-1][j]`), **not** ↖. The star stays available for more chars.
- Row 0 is not all false: `a*b*c*` matches the empty string.
- Sibling problem: **Wildcard Matching** (LC 44), where `*` alone matches any sequence: `dp[i][j-1] or dp[i-1][j]`.

---

## 12. Scramble String (Hard)

### Problem
A scramble: split a string into two non-empty parts, **optionally swap** them, and recursively scramble each part.
Is `s2` a scramble of `s1`?

### Visualize it

```
   s1 = "great"                         s2 = "rgeat"

            great                              rgeat
           /     \                            /     \
         gr       eat          ──►          rg       eat
        /  \     /   \                     /  \     /   \
       g    r   e    at                   r    g   e    at
                                         (swapped!)
                                                  → true ✅
```

### The decision: try every split, with and without a swap

```
   For a split point k (left part has k chars), length n:

   NO SWAP:                         SWAP:
   s1 = [  A (k)  |   B (n−k)  ]    s1 = [  A (k)  |   B (n−k)  ]
   s2 = [  C (k)  |   D (n−k)  ]    s2 = [  D (n−k) |   C (k)    ]

   scr(A, C) AND scr(B, D)          scr(A, s2's last k) AND scr(B, s2's first n−k)

   scramble(s1, s2) = OR over all k in 1..n−1 of (no-swap OR swap)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[len][i][j]` = is `s1[i..i+len)` a scramble of `s2[j..j+len)`? |
| Transition | OR over split `k` of the no-swap and swap cases |
| Base | `len = 1`: `s1[i] == s2[j]` |
| Order | **by increasing length** |
| Answer | `dp[n][0][0]` |

### Trace (recursion tree, s1 = "great", s2 = "rgeat")

```
  scr("great", "rgeat")
   ├─ k=1 no swap: scr("g","r") ✗ → skip
   ├─ k=1 swap:    scr("g","t") ✗ → skip
   ├─ k=2 no swap: scr("gr","rg") AND scr("eat","eat")
   │                 │                    └─ identical → ✓
   │                 └─ k=1 swap: scr("g","g") ✓ AND scr("r","r") ✓ → ✓
   │               → ✓  TRUE ✅  (stop, no more splits needed)

  Negative example: scr("abcde", "caebd") → false
```

### Pseudocode (top-down with memo + pruning)

```
function isScramble(a, b):
    if a == b: return true
    if sorted(a) ≠ sorted(b): return false        // ✂ prune: different letters
    if memo has (a, b): return memo[(a, b)]
    n ← length(a)
    for k from 1 to n-1:
        if isScramble(a[0..k), b[0..k)) and isScramble(a[k..n), b[k..n)):
            memo[(a, b)] ← true; return true                 // no swap
        if isScramble(a[0..k), b[n-k..n)) and isScramble(a[k..n), b[0..n-k)):
            memo[(a, b)] ← true; return true                 // swap
    memo[(a, b)] ← false
    return false
```

> Use index triples `(i, j, len)` instead of substrings as memo keys to avoid copying strings.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Plain recursion | exponential | O(n) |
| **3D DP `dp[len][i][j]`** | **O(n⁴)** (n³ states × n splits) | **O(n³)** |
| Memo + letter-count pruning | O(n⁴) worst, much faster in practice | O(n³) |

### 📌 Points to remember
- State is a **pair of equal-length substrings**: start in s1, start in s2, and length (3 numbers).
- The letter-count check is a cheap, powerful prune. Always do it first.
- This is really **interval DP on two strings**. It previews the next pattern (DP on Intervals).

---

## 13. Master Cheat Sheet

### All 12 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────────────┬────────────────┬──────────────┐
│ Problem                  │ Recurrence / core idea                       │ Answer         │ Best         │
├──────────────────────────┼──────────────────────────────────────────────┼────────────────┼──────────────┤
│ Is Subsequence           │ greedy two pointers                          │ i == len(s)    │ O(m), O(1)   │
│ LCS                      │ match: 1+↖ ; else max(↑, ←)                  │ dp[n][m]       │ O(nm), O(m)  │
│ Min Ins/Del A → B        │ n + m − 2·LCS                                │ formula        │ O(nm), O(m)  │
│ Shortest Common Superseq │ n + m − LCS ; walk back the LCS table        │ built string   │ O(nm), O(nm) │
│ Longest Palindromic Subs │ s[i]==s[j]: 2+inner ; else max(drop an end)  │ dp[0][n-1]     │ O(n²), O(n)  │
│ Min Insertions Palindrome│ n − LPS                                      │ formula        │ O(n²), O(n)  │
│ Edit Distance            │ match: ↖ ; else 1 + min(↖, ↑, ←)             │ dp[n][m]       │ O(nm), O(m)  │
│ Distinct Subsequences    │ match: ↖ + ↑ ; else ↑                        │ dp[n][m]       │ O(nm), O(m)  │
│ Interleaving String      │ (↑ and s1 fits) OR (← and s2 fits)           │ dp[n][m]       │ O(nm), O(m)  │
│ Palindrome Partition II  │ isPal table + cuts[i] = min(cuts[j-1]+1)     │ cuts[n-1]      │ O(n²), O(n)  │
│ Regex Matching           │ '*': zero (←←) OR one more (↑) ; else ↖      │ dp[n][m]       │ O(nm), O(m)  │
│ Scramble String          │ OR over splits k, swap or no swap            │ dp[n][0][0]    │ O(n⁴), O(n³) │
└──────────────────────────┴──────────────────────────────────────────────┴────────────────┴──────────────┘
```

### Pattern family tree

```
                                  DP ON STRINGS
                                        │
   ┌───────────────────┬────────────────┼──────────────────┬───────────────────┐
   │                   │                │                  │                   │
  LCS FAMILY       EDIT FAMILY     PALINDROME FAMILY   MATCHING FAMILY    SPLIT FAMILY
  (max, ↖/↑/←)     (min ops)       (interval i..j)     (boolean / count)  (try every k)
   │                   │                │                  │                   │
 ├ Is Subsequence   └ Edit Distance  ├ Longest Pal.     ├ Distinct Subseq. └ Scramble String
 ├ LCS                               │   Subsequence    ├ Interleaving
 ├ Min Ins/Del ──── n+m−2·LCS        ├ Min Insertions   └ Regex Matching
 └ Shortest Common  n+m−LCS          │   Palindrome ─── n − LPS
   Supersequence                     └ Palindrome
                                         Partitioning II

  LPS = LCS(s, reverse s)  ← the bridge between the LCS and palindrome families
```

### The reduction chain (learn LCS → get 4 more)

```
                     ┌──────────────────────┐
                     │   LCS(A, B) = L      │
                     └──────────┬───────────┘
        ┌───────────────────────┼─────────────────────────┐
        ▼                       ▼                         ▼
  Min Ins/Del A→B        Shortest Common            LPS(s) = LCS(s, rev s)
  = n + m − 2L           Supersequence = n + m − L             │
                                                               ▼
                                                    Min Insertions Palindrome
                                                    = n − LPS
```

### The operator tells you the question type

```
   ┌──────────────────────────┬───────────────┬────────────────────────────────┐
   │ Question                 │ Combine with  │ Example                        │
   ├──────────────────────────┼───────────────┼────────────────────────────────┤
   │ longest common / pal.    │ max           │ LCS, LPS                       │
   │ min operations           │ min (+1)      │ Edit Distance, Partition II    │
   │ number of ways           │ + (sum)       │ Distinct Subsequences          │
   │ yes / no                 │ OR / AND      │ Interleaving, Regex, Scramble  │
   └──────────────────────────┴───────────────┴────────────────────────────────┘
```

### Fill order cheat card

```
  state type                 fill order                         picture
  ────────────────────────   ────────────────────────────────   ─────────
  prefix pair (i, j)         i = 0..n, j = 0..m                   ┌──►
                                                                  ▼
  interval s[i..j]           i = n-1 down to 0, j = i..n-1        ◄──┘ ↑ rows
                             (or by length)                         bottom-up
  equal-length substrings    len = 1..n                           small → big
  1D on top of a 2D check    i left → right                       ═══►
```

### Optimization checklist

```
  ☐ Row i only reads row i-1?                 → 1D row + `diag` temp, O(m) space
  ☐ Only need ↖ and ↑ (no ←)?                 → 1D, iterate j RIGHT → LEFT, no temp
  ☐ Can one string be the shorter "column"?   → O(min(n, m)) space
  ☐ Need the actual string, not just length?  → keep the full table and walk back
  ☐ Reducible to LCS / LPS?                   → don't write a new DP, use the formula
  ☐ Palindrome check inside another DP?       → precompute isPal, or expand around center
  ☐ Exponential recursion over substrings?    → memo on (i, j) or (i, j, len)
  ☐ Can cheap pruning kill branches?          → length check, letter-count check
```

### 🚩 Common bugs to avoid

```
  ✗ Table size n × m instead of (n+1) × (m+1): no room for the empty-string row
  ✗ Off-by-one: dp[i][j] compares A[i-1] and B[j-1], not A[i], B[j]
  ✗ 1D LCS / Edit Distance: losing the diagonal (forgot the `diag` temp)
  ✗ Edit Distance: base row/col set to 0 instead of i / j
  ✗ Distinct Subsequences: going left → right in 1D (double counts)
  ✗ Interleaving: skipping the n + m == len(s3) check
  ✗ Interval DP: filling i upward (inner range not ready yet)
  ✗ Regex: treating '*' as a standalone char; "one more" going ↖ instead of ↑
  ✗ Regex: row 0 all false (forgets a*b* matching "")
  ✗ Palindrome Partitioning II: returning pieces instead of cuts
  ✗ SCS: forgetting to append the leftover chars, or forgetting to reverse
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Look at the LAST character(s). Do they match?          ║
   ║   If yes, what does that allow? If no, which one do I    ║
   ║   drop or edit, and what smaller (i, j) does that leave?"║
   ╚══════════════════════════════════════════════════════════╝
      Match → ↖.  Drop from A → ↑.  Drop from B → ←.
      Pick the operator (max / min / + / OR) from the question.
```

---

### ✅ Progress tracker

- [ ] Is Subsequence (Easy)
- [ ] Longest Common Subsequence (Medium)
- [ ] Minimum Insertions and Deletions A → B (Medium)
- [ ] Shortest Common Supersequence (Hard)
- [ ] Longest Palindromic Subsequence (Medium)
- [ ] Minimum Insertions to Make a String Palindrome (Hard)
- [ ] Edit Distance (Medium)
- [ ] Distinct Subsequences (Hard)
- [ ] Interleaving String (Medium)
- [ ] Palindrome Partitioning II (Hard)
- [ ] Regular Expression Matching (Hard)
- [ ] Scramble String (Hard)
