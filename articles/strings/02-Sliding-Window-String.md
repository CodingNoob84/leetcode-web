# Sliding Window on Strings: A Visual Guide

> **Goal:** Learn to *see* a window moving over a string, know when to grow it and when to shrink it, and keep the counts right.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is a Sliding Window?](#0-the-big-idea-what-is-a-sliding-window)
1. [Is Subsequence (Easy)](#1-is-subsequence-easy)
2. [Index Pairs of a String (Easy)](#2-index-pairs-of-a-string-easy)
3. [Longest Substring Without Repeating Characters (Medium)](#3-longest-substring-without-repeating-characters-medium)
4. [Longest Substring with K Uniques (Medium)](#4-longest-substring-with-k-uniques-medium)
5. [Longest Repeating Character Replacement (Medium)](#5-longest-repeating-character-replacement-medium)
6. [Permutation in String (Medium)](#6-permutation-in-string-medium)
7. [Find All Anagrams in a String (Medium)](#7-find-all-anagrams-in-a-string-medium)
8. [Minimum Window Substring (Hard)](#8-minimum-window-substring-hard)
9. [Substring with Concatenation of All Words (Hard)](#9-substring-with-concatenation-of-all-words-hard)
10. [Count Unique Characters of All Substrings (Hard)](#10-count-unique-characters-of-all-substrings-hard)
11. [Master Cheat Sheet](#11-master-cheat-sheet)

> **Suggested order:**
> - **Warm-ups:** Is Subsequence → Index Pairs. Both use two pointers, but neither is really a window.
> - **Variable window, longest:** No-Repeat → K Uniques → Char Replacement.
> - **Fixed window:** Permutation → All Anagrams.
> - **Variable window, shortest:** Minimum Window.
> - **Window of words:** Concatenation of All Words.
> - **Contribution counting:** Count Unique Characters. This one is not a window, and the guide says so.
>
> Each problem adds one new idea to the previous one.

---

## 0. The Big Idea: What Is a Sliding Window?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "SLIDING WINDOW"                        │
├──────────────────────────────────────────────────────────────────┤
│  • "SUBSTRING" (contiguous!) - not subsequence                   │
│  • "LONGEST / SHORTEST substring such that ..."                  │
│  • "at most K distinct", "no repeating", "replace at most K"     │
│  • "ANAGRAM", "PERMUTATION of p inside s"                        │
│  • "contains all characters of t" (coverage)                     │
│  • Brute force would check all O(n²) substrings                  │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: a frame sliding over the string

```
   s =   a  b  c  a  b  c  b  b
         0  1  2  3  4  5  6  7
            [──────]
             L     R

   • R moves RIGHT to ADD a character to the window
   • L moves RIGHT to REMOVE a character from the window
   • Neither pointer ever moves LEFT  →  each char added once, removed once
   • Total work: O(n), not O(n²)
```

### Why it is O(n): the "two pointers only go forward" argument

```
   R: 0 → 1 → 2 → ... → n-1        (n steps total)
   L: 0 → ... → at most n-1          (n steps total, across the WHOLE run)

   Even if one R step triggers many L steps, L can only ever
   move n times in total.  →  2n steps  →  O(n)
```

### The two kinds of windows

```
 ┌────────────────────────────────┬────────────────────────────────────┐
 │ FIXED-SIZE window              │ VARIABLE-SIZE window               │
 ├────────────────────────────────┼────────────────────────────────────┤
 │ Size is given (|p| = m)        │ Size depends on a rule             │
 │ Each step: add R, remove R-m   │ Grow with R; shrink L when needed  │
 │                                │                                    │
 │   [a b c] d e                  │   [a b] c a      grow              │
 │    a [b c d] e                 │   [a b c] a      grow              │
 │    a b [c d e]                 │    a [b c a]     invalid → shrink  │
 │                                │                                    │
 │ Used in: Permutation,          │ Used in: No-Repeat, K Uniques,     │
 │          All Anagrams          │   Char Replacement, Min Window     │
 └────────────────────────────────┴────────────────────────────────────┘
```

### Variable window: "longest" vs "shortest"

```
  LONGEST valid window                    SHORTEST valid window
  ──────────────────────                  ──────────────────────
  for R in 0..n-1:                        for R in 0..n-1:
      add s[R]                                add s[R]
      while window is INVALID:                while window is VALID:
          remove s[L]; L++                        record (R-L+1)   ← record INSIDE
      record (R-L+1)   ← record AFTER             remove s[L]; L++
                                                  
  "Shrink until it's OK again,            "It's OK - can I make it
   then measure."                          smaller and still be OK?"
```

### The two templates side by side

```
 FIXED WINDOW (size m)                     VARIABLE WINDOW
 ─────────────────────                     ───────────────
 for R from 0 to n-1:                      L ← 0
     add s[R] to counts                    for R from 0 to n-1:
     if R ≥ m:                                 add s[R] to counts
         remove s[R-m] from counts             while (window breaks the rule):
     if R ≥ m-1 and counts match:                  remove s[L]; L ← L+1
         record answer at R-m+1                update answer with window L..R
```

### Counters that avoid re-checking the whole map

```
  Comparing two 26-letter count arrays every step costs O(26).
  Instead keep ONE number that says how close you are:

  ┌──────────────┬──────────────────────────────────────────────────┐
  │ missing      │ how many required chars are still not covered    │
  │              │ (Permutation, Anagrams)          → found if 0    │
  ├──────────────┼──────────────────────────────────────────────────┤
  │ formed /     │ how many DISTINCT chars already meet their need  │
  │ required     │ (Min Window)         → valid if formed==required │
  ├──────────────┼──────────────────────────────────────────────────┤
  │ distinct     │ how many keys in the map have count > 0          │
  │              │ (K Uniques)                                      │
  └──────────────┴──────────────────────────────────────────────────┘

  Update the counter ONLY when a count crosses a threshold
  (0 → 1, or need → need-1).  That keeps each step O(1).
```

### ⚠ When a sliding window does NOT work

```
  The window needs MONOTONIC validity:
     "if window [L..R] is invalid, any bigger window [L..R+1] is invalid too"
     (or the mirror: valid stays valid when you grow)

  ✓ "no repeated char"     - adding chars can only add repeats
  ✓ "at most K distinct"   - adding chars can only add distinct ones
  ✗ "sum == K" with NEGATIVE numbers - adding a negative can fix it again
       → use prefix sums + hash map instead
  ✗ "exactly K distinct" (count of substrings) → use atMost(K) − atMost(K−1)
  ✗ subsequence problems (not contiguous) → two pointers / DP
```

---

## 1. Is Subsequence (Easy)

### Problem
Is `s` a **subsequence** of `t`? (Characters of `s` appear in `t` in order, not necessarily next to each other.)

> Not a window. It's the simplest **two-pointer scan** on strings, and a good warm-up.
> The DP view lives in [../dynammic programming/03-DP-on-Strings.md](../dynammic%20programming/03-DP-on-Strings.md).

### Visualize it

```
   s =  a   b   c
        │    ╲    ╲
   t =  a h  b  g d c
        ✓    ✓      ✓     → all of s matched in order → TRUE
```

### Decision at each step

```
              look at t[j]
             /           \
   t[j] == s[i]       t[j] != s[i]
        │                   │
   i++, j++              j++ only
   (matched one)       (skip t's char)

   Done when i == len(s)  → TRUE
   Ran out of t first     → FALSE
```

### The 4 steps

| Step | Answer |
|------|--------|
| Pointers | `i` on `s`, `j` on `t` |
| Move | always `j++`; also `i++` on a match |
| Stop | `i == len(s)` → true, `j == len(t)` → false |
| Why greedy is safe | matching the **earliest** possible char in `t` leaves the most room for the rest |

### Trace (s = "abc", t = "ahbgdc")

```
  j  │ t[j] │ s[i] │ match? │ i after
 ────┼──────┼──────┼────────┼────────
  0  │  a   │  a   │   ✓    │   1
  1  │  h   │  b   │        │   1
  2  │  b   │  b   │   ✓    │   2
  3  │  g   │  c   │        │   2
  4  │  d   │  c   │        │   2
  5  │  c   │  c   │   ✓    │   3  = len(s) → TRUE ✅

  s = "axc":  a ✓, then 'x' never appears → i stops at 1 → FALSE
```

### Pseudocode

```
function isSubsequence(s, t):
    i ← 0
    for j from 0 to len(t)-1:
        if i < len(s) and t[j] == s[i]:
            i ← i + 1
    return i == len(s)
```

### 🚀 Follow-up: many `s` queries against one big `t`

```
  Precompute, for each letter, the sorted list of positions in t:

     t = a h b g d c
         0 1 2 3 4 5

     a: [0]   h: [1]   b: [2]   g: [3]   d: [4]   c: [5]

  For each char of s, binary-search the FIRST position > prev.

     s = "abc":
        a → first in [0] > -1 → 0
        b → first in [2] >  0 → 2
        c → first in [5] >  2 → 5     → TRUE ✅

  Per query: O(|s| · log |t|)  instead of  O(|t|)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Two pointers | O(\|t\|) | O(1) |
| Index lists + binary search (many queries) | O(\|t\|) build, O(\|s\| log \|t\|) per query | O(\|t\|) |

### 📌 Points to remember
- Subsequence = **in order, gaps allowed**. Substring = **contiguous**. Don't mix them up.
- Greedy "match as early as possible" is always safe here.
- Many queries → index lists + binary search ("first index > prev" is an upper-bound search).

---

## 2. Index Pairs of a String (Easy)

### Problem (LeetCode Premium 1065)
Given `text` and a list of `words`, return every pair `[i, j]` such that `text[i..j]` is one of the words.
Sort the pairs by `i`, then by `j`.

> Also not a true window: windows here have **many possible lengths** per start.
> The fast version walks a **trie**. See [../trie/01-Basic-Trie-Operations.md](../trie/01-Basic-Trie-Operations.md).

### Visualize it

```
  text = t h e s t o r y o f l e e t c o d e a n d m e
         0 1 2 3 4 5 6 7 8 9 ...
               [story  ]                → [3, 7]
                         [fleet  ]      → [9, 13]
                           [leetcode     ]  → [10, 17]
```

### Approach 1: brute force (check every substring)

```
  for each start i:
      for each end j ≥ i:
          if text[i..j] is in the word set → record [i, j]

  O(n² · L) for building/hashing substrings. Fine for small n, but wasteful:
  if no word starts with "th", why keep checking "the", "thes", "thest"...?
```

### Approach 2: trie walk (stop as soon as no word can match)

```
  Build a trie of words. For each start i, walk the trie along text[i], text[i+1], ...
     • node marked ● (end of word) → record [i, j]
     • no child for the next char   → STOP this start early ✂
```

### Trace (text = "ababa", words = ["aba", "ab"])

```
  Trie:
        (root)
          │ a
          ○
          │ b
          ● "ab"
          │ a
          ● "aba"

  i=0:  a → ○,  b → ● record [0,1],  a → ● record [0,2],  b → no child ✂
  i=1:  b → root has no 'b' child ✂
  i=2:  a → ○,  b → ● record [2,3],  a → ● record [2,4],  (text ends)
  i=3:  b → ✂
  i=4:  a → ○, (text ends)

  Result: [[0,1], [0,2], [2,3], [2,4]]  ✅
  (already sorted: i grows, and j grows within each i)
```

### Pseudocode (trie version)

```
function indexPairs(text, words):
    root ← build trie from words (mark end nodes)
    result ← empty list
    for i from 0 to len(text)-1:
        node ← root
        for j from i to len(text)-1:
            node ← node.child[text[j]]
            if node is null: break             // ✂ no word continues
            if node.isEnd: append [i, j] to result
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Brute force with a set | O(n² · L) | O(total word chars) |
| **Trie walk** | **O(n · maxWordLen)** | O(total word chars) |

### 📌 Points to remember
- Overlapping matches are allowed (`[0,1]` and `[0,2]` both count).
- Walking `i` outer and `j` inner already gives the sorted order.
- Trie lets you **stop early**. That's the whole speed-up.

---

## 3. Longest Substring Without Repeating Characters (Medium)

### Problem
Length of the longest substring with **all distinct** characters.

### Visualize it

```
   a  b  c  a  b  c  b  b
  [a  b  c]                 len 3 ✓
      [b  c  a]             len 3 ✓
                    [b]     after the "bb", only 1
   Best = 3
```

### The rule and the fix

```
  Window is VALID if no char repeats inside it.

  New char s[R] already inside the window at position p?
      → every window that still contains p is broken
      → JUMP L to p + 1   (no need to step one by one)

       a  b  c  a
      [a  b  c] a      'a' was at 0
          [b  c  a]    L jumps to 0+1 = 1
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window | `s[L..R]`, all distinct |
| Memory | `last[c]` = last index where `c` was seen |
| Add `s[R]` | if `last[s[R]] ≥ L` → `L = last[s[R]] + 1` |
| Record | `best = max(best, R - L + 1)` after fixing L |
| Answer | `best` |

### Trace ("abcabcbb")

```
  R │ s[R] │ last[s[R]] before │ L after │ window      │ len │ best
 ───┼──────┼───────────────────┼─────────┼─────────────┼─────┼─────
  0 │  a   │   –               │   0     │ [a]         │  1  │  1
  1 │  b   │   –               │   0     │ [ab]        │  2  │  2
  2 │  c   │   –               │   0     │ [abc]       │  3  │  3
  3 │  a   │   0  (≥ L=0)      │   1     │ [bca]       │  3  │  3
  4 │  b   │   1  (≥ L=1)      │   2     │ [cab]       │  3  │  3
  5 │  c   │   2  (≥ L=2)      │   3     │ [abc]       │  3  │  3
  6 │  b   │   4  (≥ L=3)      │   5     │ [cb]        │  2  │  3
  7 │  b   │   6  (≥ L=5)      │   7     │ [b]         │  1  │  3  ✅
```

### Trace ("pwwkew")

```
  R │ s[R] │ last before │ L after │ window │ len │ best
 ───┼──────┼─────────────┼─────────┼────────┼─────┼─────
  0 │  p   │   –         │   0     │ [p]    │  1  │  1
  1 │  w   │   –         │   0     │ [pw]   │  2  │  2
  2 │  w   │   1         │   2     │ [w]    │  1  │  2
  3 │  k   │   –         │   2     │ [wk]   │  2  │  2
  4 │  e   │   –         │   2     │ [wke]  │  3  │  3
  5 │  w   │   2  (≥ 2)  │   3     │ [kew]  │  3  │  3  ✅
```

### ⚠ The "abba" trap: never move L backward

```
   a  b  b  a
   0  1  2  3

   R=2 'b': last b = 1 → L = 2          window [b]
   R=3 'a': last a = 0 → 0 + 1 = 1 ... but L is already 2!
            moving L back to 1 would bring the duplicate 'b' back in ✗

   Fix:  L ← max(L, last[s[R]] + 1)     → L stays 2, window [ba], len 2 ✅
```

### Pseudocode

```
function lengthOfLongestSubstring(s):
    last ← empty map
    L ← 0, best ← 0
    for R from 0 to len(s)-1:
        c ← s[R]
        if c in last:
            L ← max(L, last[c] + 1)        // jump, never backward
        last[c] ← R
        best ← max(best, R - L + 1)
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Check all substrings | O(n³) | O(k) |
| Window + set (shrink one by one) | O(n) | O(k) |
| **Window + last-index jump** | **O(n)** | O(k) (k = alphabet size) |

### 📌 Points to remember
- `L = max(L, last + 1)`. The `max` matters (the "abba" case).
- Update `last[c] = R` **after** fixing L.
- Measure **after** the window is valid again.

---

## 4. Longest Substring with K Uniques (Medium)

### Problem (GFG convention)
Length of the longest substring with **exactly K distinct** characters. Return **−1** if no substring has exactly K distinct characters.

> **Convention used here:** GeeksforGeeks "Longest K unique characters substring". The LeetCode cousin (340, premium) asks for **at most** K. The same window works for both. Only *when you record* changes.

### Visualize it

```
   a a b a c b e b e b e         k = 3
             [c b e b e b e]     distinct {c, b, e} = 3, len 7 ✅
```

### The rule

```
   distinct > k  → INVALID → shrink from the left
   distinct == k → record length
   distinct < k  → keep growing (don't record for "exactly k")

   Monotonic? Yes: adding chars never REDUCES the distinct count,
   so "too many distinct" stays broken as the window grows → window is safe.
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window | `s[L..R]` with ≤ k distinct |
| Memory | `count[c]` per char, plus `distinct` = number of keys with count > 0 |
| Shrink | while `distinct > k`: decrement `count[s[L]]` (if it hits 0, `distinct--`), `L++` |
| Record | if `distinct == k`: `best = max(best, R-L+1)` |
| Answer | `best`, or −1 if never recorded |

### Trace ("aabacbebebe", k = 3)

```
  index: a0 a1 b2 a3 c4 b5 e6 b7 e8 b9 e10

  R │ add │ counts after add             │ distinct │ shrink?                      │ L │ len │ best
 ───┼─────┼──────────────────────────────┼──────────┼──────────────────────────────┼───┼─────┼─────
  0 │  a  │ a1                           │    1     │                              │ 0 │  –  │  –
  1 │  a  │ a2                           │    1     │                              │ 0 │  –  │  –
  2 │  b  │ a2 b1                        │    2     │                              │ 0 │  –  │  –
  3 │  a  │ a3 b1                        │    2     │                              │ 0 │  –  │  –
  4 │  c  │ a3 b1 c1                     │    3     │                              │ 0 │  5  │  5
  5 │  b  │ a3 b2 c1                     │    3     │                              │ 0 │  6  │  6
  6 │  e  │ a3 b2 c1 e1                  │    4 ✗   │ drop a0→a2, a1→a1,           │ 4 │  3  │  6
    │     │                              │          │ b2→b1, a3→a0 (distinct 3)    │   │     │
  7 │  b  │ b2 c1 e1                     │    3     │                              │ 4 │  4  │  6
  8 │  e  │ b2 c1 e2                     │    3     │                              │ 4 │  5  │  6
  9 │  b  │ b3 c1 e2                     │    3     │                              │ 4 │  6  │  6
 10 │  e  │ b3 c1 e3                     │    3     │                              │ 4 │  7  │  7 ✅

  Window 4..10 = "cbebebe"
```

```
  Edge: s = "aaaa", k = 2 → distinct never reaches 2 → return −1
```

### Pseudocode

```
function longestKUnique(s, k):
    count ← empty map
    L ← 0, distinct ← 0, best ← −1
    for R from 0 to len(s)-1:
        if count[s[R]] == 0: distinct ← distinct + 1
        count[s[R]] ← count[s[R]] + 1
        while distinct > k:
            count[s[L]] ← count[s[L]] − 1
            if count[s[L]] == 0: distinct ← distinct − 1
            L ← L + 1
        if distinct == k:
            best ← max(best, R − L + 1)
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| All substrings | O(n²) | O(k) |
| **Variable window** | **O(n)** | O(alphabet) |

### 📌 Points to remember
- **Exactly K** → record only when `distinct == k`. **At most K** → record every time.
- Decrement `distinct` only when a count drops to **0**.
- Start `best` at −1 so "never found" is reported correctly.

---

## 5. Longest Repeating Character Replacement (Medium)

### Problem
You may replace **at most k** characters. Return the length of the longest substring that can be made of **one repeated letter**.

### Visualize it

```
   A A B A B B A       k = 1
  [A A B A]            replace the one B → "AAAA", len 4 ✅
```

### The key formula

```
   In a window, keep the MOST frequent letter, replace everything else.

        replacements needed  =  windowLength − maxFreq

   ┌─────────────────────────────┐
   │ VALID  ⇔  len − maxFreq ≤ k │
   └─────────────────────────────┘

   window "AABA": len 4, maxFreq (A) = 3, 4 − 3 = 1 ≤ 1 ✓
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window | `s[L..R]` |
| Memory | `count[26]`, `maxFreq` = highest count ever seen in a window |
| Grow | add `s[R]`, update `maxFreq` |
| Fix | if `len − maxFreq > k`: remove `s[L]`, `L++` (just **once**, see below) |
| Answer | largest `R − L + 1` seen |

### Trace ("AABABBA", k = 1)

```
  index: A0 A1 B2 A3 B4 B5 A6

  R │ add │ counts      │ maxFreq │ len │ len−maxF │ action                │ L │ best
 ───┼─────┼─────────────┼─────────┼─────┼──────────┼───────────────────────┼───┼─────
  0 │  A  │ A1          │   1     │  1  │    0     │ ok                    │ 0 │  1
  1 │  A  │ A2          │   2     │  2  │    0     │ ok                    │ 0 │  2
  2 │  B  │ A2 B1       │   2     │  3  │    1     │ ok                    │ 0 │  3
  3 │  A  │ A3 B1       │   3     │  4  │    1     │ ok                    │ 0 │  4
  4 │  B  │ A3 B2       │   3     │  5  │    2 ✗   │ drop A0 → A2          │ 1 │  4
  5 │  B  │ A2 B3       │   3     │  5  │    2 ✗   │ drop A1 → A1          │ 2 │  4
  6 │  A  │ A2 B3       │   3     │  5  │    2 ✗   │ drop B2 → B2          │ 3 │  4

  Answer = 4 ✅
```

### 🤯 Why `maxFreq` never needs to go DOWN

```
  After dropping s[L], the true max frequency in the window may be smaller.
  We DON'T recompute it. Why is that safe?

   • The answer only improves when a window of size  best+1  is valid.
   • That needs  (best+1) − maxFreq ≤ k  →  maxFreq must EXCEED the old record.
   • So only a NEW, HIGHER maxFreq can ever grow the answer.
   • A stale (too-high) maxFreq just lets the window SLIDE at the same size;
     it can never make it bigger than a real valid window.

   That's also why "if" (shrink once) is enough instead of "while":
   the window never shrinks, it either grows by 1 or slides by 1.

          size: 1 → 2 → 3 → 4 → 4 → 4 → 4
                            ▲ grows only when maxFreq rises
```

### Pseudocode

```
function characterReplacement(s, k):
    count ← array of 26 zeros
    L ← 0, maxFreq ← 0, best ← 0
    for R from 0 to len(s)-1:
        count[s[R]] ← count[s[R]] + 1
        maxFreq ← max(maxFreq, count[s[R]])
        if (R − L + 1) − maxFreq > k:
            count[s[L]] ← count[s[L]] − 1
            L ← L + 1
        best ← max(best, R − L + 1)
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try each target letter with a window | O(26 · n) | O(1) |
| **One window, stale maxFreq** | **O(n)** | O(26) |

### 📌 Points to remember
- `len − maxFreq ≤ k` is the whole problem.
- `maxFreq` only goes up. Using a stale value is safe because it can't create a fake longer answer.
- The window size never shrinks. It only grows or slides.

---

## 6. Permutation in String (Medium)

### Problem
Does `s2` contain any **permutation** of `s1` as a substring?

### Visualize it

```
   s1 = "ab"     → need {a:1, b:1}
   s2 =  e i d b a o o o
               [b a]        same letters as "ab" → TRUE ✅
```

### Fixed window of size m = |s1|

```
   A permutation has the SAME LENGTH and the SAME LETTER COUNTS.
   So slide a window of exactly m chars and compare counts.

     [e i] d b a o o o
      e [i d] b a o o o
      e i [d b] a o o o
      e i d [b a] o o o   ← counts match!
```

### The `missing` counter (O(1) per step)

```
  need[c] starts as the count of c in s1.  missing = len(s1).

  ADD c (enters on the right):            REMOVE c (leaves on the left):
     if need[c] > 0: missing −1               need[c] + 1
     need[c] − 1                              if need[c] > 0: missing +1

  need[c] can go NEGATIVE: that means "extra c's in the window".
  missing == 0 with window size m  →  permutation found.
```

### Trace (s1 = "ab", s2 = "eidbaooo")

```
  start: need a1 b1, missing 2

  R │ add │ effect of add            │ remove (if size > 2)  │ window │ missing
 ───┼─────┼──────────────────────────┼───────────────────────┼────────┼────────
  0 │  e  │ e 0→−1                   │                       │ [e]    │   2
  1 │  i  │ i 0→−1                   │                       │ [ei]   │   2
  2 │  d  │ d 0→−1                   │ e: −1→0 (not > 0)     │ [id]   │   2
  3 │  b  │ b 1→0, missing −1        │ i: −1→0               │ [db]   │   1
  4 │  a  │ a 1→0, missing −1        │ d: −1→0               │ [ba]   │   0  → TRUE ✅
```

### Pseudocode

```
function checkInclusion(s1, s2):
    m ← len(s1)
    if m > len(s2): return false
    need ← counts of s1
    missing ← m
    for R from 0 to len(s2)-1:
        c ← s2[R]
        if need[c] > 0: missing ← missing − 1
        need[c] ← need[c] − 1
        if R ≥ m:                          // drop the char leaving the window
            d ← s2[R − m]
            need[d] ← need[d] + 1
            if need[d] > 0: missing ← missing + 1
        if missing == 0: return true
    return false
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort every window | O(n · m log m) | O(m) |
| Compare 26-count arrays each step | O(26 · n) | O(26) |
| **`missing` counter** | **O(n)** | O(26) |

### 📌 Points to remember
- Permutation / anagram ⇒ **fixed** window of size `|s1|`.
- Let `need[c]` go negative. It just means "surplus".
- Change `missing` only when a count crosses the 0 line.

---

## 7. Find All Anagrams in a String (Medium)

### Problem
Return every start index in `s` where an **anagram of `p`** begins.

> Same machine as Permutation in String. Instead of returning on the first hit, **collect every hit**.

### Visualize it

```
   p = "abc"
   s =  c b a e b a b a c d
       [c b a]                 index 0 ✅
                   [b a c]     index 6 ✅
```

### Trace (s = "cbaebabacd", p = "abc")

```
  start: need a1 b1 c1, missing 3       window size m = 3

  R │ add │ effect on need/missing       │ remove s[R−3]          │ window │ missing │ record
 ───┼─────┼──────────────────────────────┼────────────────────────┼────────┼─────────┼───────
  0 │  c  │ c 1→0, missing 2             │                        │ c      │   2     │
  1 │  b  │ b 1→0, missing 1             │                        │ cb     │   1     │
  2 │  a  │ a 1→0, missing 0             │                        │ cba    │   0     │  0 ✅
  3 │  e  │ e 0→−1                       │ c: 0→1 (>0) missing 1  │ bae    │   1     │
  4 │  b  │ b 0→−1                       │ b: −1→0                │ aeb    │   1     │
  5 │  a  │ a 0→−1                       │ a: −1→0                │ eba    │   1     │
  6 │  b  │ b 0→−1                       │ e: −1→0                │ bab    │   1     │
  7 │  a  │ a 0→−1                       │ b: −1→0                │ aba    │   1     │
  8 │  c  │ c 1→0, missing 0             │ a: −1→0                │ bac    │   0     │  6 ✅
  9 │  d  │ d 0→−1                       │ b: 0→1 (>0) missing 1  │ acd    │   1     │

  Result = [0, 6] ✅   (the recorded start is R − m + 1)
```

### Pseudocode

```
function findAnagrams(s, p):
    m ← len(p)
    need ← counts of p
    missing ← m
    result ← empty list
    for R from 0 to len(s)-1:
        c ← s[R]
        if need[c] > 0: missing ← missing − 1
        need[c] ← need[c] − 1
        if R ≥ m:
            d ← s[R − m]
            need[d] ← need[d] + 1
            if need[d] > 0: missing ← missing + 1
        if missing == 0:
            append (R − m + 1) to result
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Sort each window and compare | O(n · m log m) | O(m) |
| **Fixed window + `missing`** | **O(n)** | O(26) |

### 📌 Points to remember
- The start of the window ending at R is `R − m + 1`.
- Remove the leaving char **before** checking `missing`.
- Same template solves Permutation in String. Only the return changes.

---

## 8. Minimum Window Substring (Hard)

### Problem
Shortest substring of `s` that contains **every character of `t`** (with multiplicity).

### Visualize it

```
   s = A D O B E C O D E B A N C        t = "ABC"
                           [B A N C]    shortest window with A, B, C → "BANC" ✅
```

### Variable window, SHORTEST flavor

```
   1. Grow R until the window covers t        (VALID)
   2. While VALID:
        record the window if it's the smallest so far
        shrink L by one
   3. Repeat

        [A D O B E C]                  valid → record 6, shrink
           [D O B E C ... A]           grow until valid again, shrink...
                         [B A N C]     valid, record 4 ✅
```

### `need`, `have`, `formed`

```
   need[c]   = how many c's t requires          A1 B1 C1
   have[c]   = how many c's the window holds
   required  = number of DISTINCT chars in t    3
   formed    = how many distinct chars have have[c] ≥ need[c]

   VALID  ⇔  formed == required

   formed changes only when have[c] crosses need[c]:
     add:    have[c] becomes == need[c]  → formed + 1
     remove: have[c] drops below need[c] → formed − 1
```

### The 5 steps

| Step | Answer |
|------|--------|
| Window | `s[L..R]` |
| Grow | add `s[R]`, maybe `formed++` |
| Shrink | while `formed == required`: record, remove `s[L]`, maybe `formed--`, `L++` |
| Record | inside the shrink loop (window is valid there) |
| Answer | best `(L, R)` → substring, or `""` if never valid |

### Trace (s = "ADOBECODEBANC", t = "ABC")

```
  index: A0 D1 O2 B3 E4 C5 O6 D7 E8 B9 A10 N11 C12

  R  │ add │ formed │ shrink loop (record while valid)                        │ L after │ best
 ────┼─────┼────────┼─────────────────────────────────────────────────────────┼─────────┼──────────
  0  │  A  │   1    │                                                         │   0     │
  1  │  D  │   1    │                                                         │   0     │
  2  │  O  │   1    │                                                         │   0     │
  3  │  B  │   2    │                                                         │   0     │
  4  │  E  │   2    │                                                         │   0     │
  5  │  C  │   3 ✓  │ [0..5] "ADOBEC" len 6 → record; drop A → formed 2       │   1     │ ADOBEC(6)
  6  │  O  │   2    │                                                         │   1     │
  7  │  D  │   2    │                                                         │   1     │
  8  │  E  │   2    │                                                         │   1     │
  9  │  B  │   2    │ (B now 2, already met)                                  │   1     │
 10  │  A  │   3 ✓  │ [1..10] len 10; drop D → [2..10] len 9; drop O →        │   6     │ ADOBEC(6)
     │     │        │ [3..10] len 8; drop B (B 2→1, still ok) → [4..10] len 7;│         │
     │     │        │ drop E → [5..10] "CODEBA" len 6 (tie, keep first);      │         │
     │     │        │ drop C → formed 2                                       │         │
 11  │  N  │   2    │                                                         │   6     │
 12  │  C  │   3 ✓  │ [6..12] len 7; drop O → [7..12] len 6; drop D →         │  10     │ BANC(4) ✅
     │     │        │ [8..12] "EBANC" len 5 → record; drop E → [9..12]        │         │
     │     │        │ "BANC" len 4 → record; drop B → formed 2                │         │
```

### Pseudocode

```
function minWindow(s, t):
    if t is empty: return ""
    need ← counts of t
    required ← number of distinct chars in t
    have ← empty map
    formed ← 0
    L ← 0
    bestLen ← ∞, bestL ← 0
    for R from 0 to len(s)-1:
        c ← s[R]
        have[c] ← have[c] + 1
        if c in need and have[c] == need[c]:
            formed ← formed + 1
        while formed == required:
            if R − L + 1 < bestLen:
                bestLen ← R − L + 1, bestL ← L
            d ← s[L]
            have[d] ← have[d] − 1
            if d in need and have[d] < need[d]:
                formed ← formed − 1
            L ← L + 1
    return (bestLen == ∞) ? "" : s[bestL .. bestL + bestLen − 1]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| All substrings + check | O(n² · \|t\|) | O(alphabet) |
| **Variable window + `formed`** | **O(\|s\| + \|t\|)** | O(alphabet) |

### 📌 Points to remember
- **Record inside** the shrink loop. The window is valid there.
- `formed` counts **distinct** chars that are satisfied, not total chars.
- Duplicates in `t` matter: `t = "AA"` needs two A's in the window.
- Store `(bestL, bestLen)`, not the substring itself, to avoid copying every time.

---

## 9. Substring with Concatenation of All Words (Hard)

### Problem
`words` all have the **same length** `wl`. Find every start index in `s` where a substring is a concatenation of **all** the words, each used exactly once, in any order.

### Visualize it

```
   s = bar foo the foo bar man       words = ["foo", "bar"]
       ─── ───                       index 0: "barfoo" ✅
                   ─── ───           index 9: "foobar" ✅
```

### The trick: treat each WORD as one "character"

```
   Every word has length wl = 3, so cut s into 3-letter chunks.
   But a match could start at offset 0, 1 or 2!

   offset 0:  bar|foo|the|foo|bar|man
   offset 1:   arf|oot|hef|oob|arm
   offset 2:    rfo|oth|efo|oba|rma

   For EACH offset, run a sliding window over chunks.
   Now it's "Find All Anagrams", where each letter is a word.
```

### Window rules (per offset)

```
   need[w]  = how many times w is in words
   seen[w]  = how many times w is in the window
   k        = number of words

   Next chunk w:
     • w NOT in need          → reset window: clear seen, L jumps past w
     • w in need              → seen[w]++, count++
         while seen[w] > need[w]:   (too many w's)
             drop the leftmost chunk, L += wl, count−−
     • count == k             → record L
                                then drop the leftmost chunk to keep sliding
```

### Trace (s = "barfoothefoobarman", words = ["foo","bar"], wl = 3, k = 2)

```
  Offset 0: chunks at  0 bar | 3 foo | 6 the | 9 foo | 12 bar | 15 man

  chunk │ word │ action                                  │ L  │ seen          │ count │ record
 ───────┼──────┼─────────────────────────────────────────┼────┼───────────────┼───────┼───────
    0   │ bar  │ add                                     │ 0  │ bar1          │   1   │
    3   │ foo  │ add                                     │ 0  │ bar1 foo1     │   2   │  0 ✅
        │      │ drop "bar" at 0 to slide on             │ 3  │ foo1          │   1   │
    6   │ the  │ not a word → reset                      │ 9  │ –             │   0   │
    9   │ foo  │ add                                     │ 9  │ foo1          │   1   │
   12   │ bar  │ add                                     │ 9  │ foo1 bar1     │   2   │  9 ✅
        │      │ drop "foo" at 9                         │ 12 │ bar1          │   1   │
   15   │ man  │ not a word → reset                      │ 18 │ –             │   0   │

  Offset 1: arf, oot, hef, oob, arm → none are words → nothing
  Offset 2: rfo, oth, efo, oba, rma → nothing

  Result = [0, 9] ✅
```

### Trace with the "too many" case (s = "barfoofoobarthefoobarman", words = ["bar","foo","the"])

```
  Offset 0 chunks: 0 bar | 3 foo | 6 foo | 9 bar | 12 the | 15 foo | 18 bar | 21 man

  chunk │ word │ action                                          │ L  │ seen              │ record
 ───────┼──────┼─────────────────────────────────────────────────┼────┼───────────────────┼───────
    0   │ bar  │ add                                             │ 0  │ bar1              │
    3   │ foo  │ add                                             │ 0  │ bar1 foo1         │
    6   │ foo  │ foo2 > 1 → drop bar(0), drop foo(3)             │ 6  │ foo1              │
    9   │ bar  │ add                                             │ 6  │ foo1 bar1         │
   12   │ the  │ add, count 3                                    │ 6  │ foo1 bar1 the1    │  6 ✅
        │      │ drop foo(6)                                     │ 9  │ bar1 the1         │
   15   │ foo  │ add, count 3                                    │ 9  │ bar1 the1 foo1    │  9 ✅
        │      │ drop bar(9)                                     │ 12 │ the1 foo1         │
   18   │ bar  │ add, count 3                                    │ 12 │ the1 foo1 bar1    │ 12 ✅
        │      │ drop the(12)                                    │ 15 │ foo1 bar1         │
   21   │ man  │ reset                                           │ 24 │ –                 │

  Offsets 1 and 2 give nothing.  Result = [6, 9, 12] ✅
```

### Pseudocode

```
function findSubstring(s, words):
    wl ← len(words[0]), k ← len(words)
    need ← counts of each word
    result ← empty list
    for offset from 0 to wl − 1:
        L ← offset, count ← 0, seen ← empty map
        for R from offset to len(s) − wl step wl:
            w ← s[R .. R + wl − 1]
            if w not in need:
                seen ← empty map, count ← 0, L ← R + wl
                continue
            seen[w] ← seen[w] + 1, count ← count + 1
            while seen[w] > need[w]:                    // too many copies of w
                left ← s[L .. L + wl − 1]
                seen[left] ← seen[left] − 1, count ← count − 1
                L ← L + wl
            if count == k:
                append L to result
                left ← s[L .. L + wl − 1]               // slide on
                seen[left] ← seen[left] − 1, count ← count − 1
                L ← L + wl
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Check every start, chop k words each time | O(n · k · wl) | O(k) |
| **wl offsets × chunk window** | **O(n · wl)** (each chunk added/removed once per offset; hashing a word costs wl) | O(k) |

### 📌 Points to remember
- Run the window **once per offset** `0 .. wl−1`. Missing an offset misses answers.
- A non-word chunk **resets** the window completely.
- "Too many copies" → shrink until the count is OK again (like No-Repeat).
- Duplicate words in the list are allowed. `need` handles them.

---

## 10. Count Unique Characters of All Substrings (Hard)

### Problem (LeetCode 828)
`countUniqueChars(t)` = number of characters that appear **exactly once** in `t`.
Return the **sum** of `countUniqueChars` over **every substring** of `s`.

> **Honest note:** This is listed under sliding window, but it is **not** a window problem.
> Windows can't do it efficiently. The clean solution is **contribution counting**: ask "how many substrings does each character count in?" and add those up.

### Flip the question

```
   Instead of:  for each substring, count its unique chars      O(n²) substrings
   Ask:         for each character s[i], in how many substrings
                is it the UNIQUE copy of its letter?            O(n) total
```

### The picture

```
   s[i] counts as unique in a substring  ⇔  the substring contains i
                                             but NOT the previous or next
                                             occurrence of the same letter.

       prev            i            next
        │              │             │
   ... A ... ... ... ..A.. ... ... . A ...
          └────────────┘└────────────┘
          start can be   end can be
          (prev, i]      [i, next)

        choices for start = i − prev
        choices for end   = next − i

   ┌─────────────────────────────────────────────┐
   │ contribution(i) = (i − prev) × (next − i)   │
   └─────────────────────────────────────────────┘
   With prev = −1 if none before, next = n if none after.
```

### Trace ("ABC", n = 3)

```
  i │ ch │ prev │ next │ (i−prev) × (next−i) │ contribution
 ───┼────┼──────┼──────┼─────────────────────┼─────────────
  0 │ A  │  −1  │  3   │   1 × 3             │     3
  1 │ B  │  −1  │  3   │   2 × 2             │     4
  2 │ C  │  −1  │  3   │   3 × 1             │     3
                                               total = 10 ✅
```

### Trace ("ABA", n = 3), with a brute-force check

```
  i │ ch │ prev │ next │ formula   │ contribution
 ───┼────┼──────┼──────┼───────────┼─────────────
  0 │ A  │  −1  │  2   │ 1 × 2     │     2
  1 │ B  │  −1  │  3   │ 2 × 2     │     4
  2 │ A  │   0  │  3   │ 2 × 1     │     2
                                    total = 8 ✅

  Brute force:  A→1  B→1  A→1  AB→2  BA→2  ABA→1 (only B)   = 8 ✓
```

### Trace ("LEETCODE", n = 8)

```
  index: L0 E1 E2 T3 C4 O5 D6 E7

  i │ ch │ prev │ next │ formula   │ contribution
 ───┼────┼──────┼──────┼───────────┼─────────────
  0 │ L  │  −1  │  8   │ 1 × 8     │      8
  1 │ E  │  −1  │  2   │ 2 × 1     │      2
  2 │ E  │   1  │  7   │ 1 × 5     │      5
  3 │ T  │  −1  │  8   │ 4 × 5     │     20
  4 │ C  │  −1  │  8   │ 5 × 4     │     20
  5 │ O  │  −1  │  8   │ 6 × 3     │     18
  6 │ D  │  −1  │  8   │ 7 × 2     │     14
  7 │ E  │   2  │  8   │ 5 × 1     │      5
                                    total = 92 ✅
```

### Pseudocode

```
function uniqueLetterString(s):
    n ← len(s)
    prev ← array of n, next ← array of n
    lastSeen ← map letter → −1
    for i from 0 to n−1:                    // previous occurrence
        prev[i] ← lastSeen[s[i]]
        lastSeen[s[i]] ← i
    lastSeen ← map letter → n
    for i from n−1 down to 0:               // next occurrence
        next[i] ← lastSeen[s[i]]
        lastSeen[s[i]] ← i
    total ← 0
    for i from 0 to n−1:
        total ← total + (i − prev[i]) × (next[i] − i)
    return total
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Every substring, count uniques | O(n³) or O(n²) with running counts | O(26) |
| **Contribution counting** | **O(n)** | O(n) (or O(26) with a one-pass variant) |

### 📌 Points to remember
- "Sum over all substrings of X" → think **contribution of each element**, not windows.
- Unique ⇔ the substring sits strictly between the previous and next copy.
- Boundaries: `prev = −1`, `next = n`.
- Same idea solves "Sum of Subarray Minimums" (with a monotonic stack for prev/next smaller).

---

## 11. Master Cheat Sheet

### All 10 problems at a glance

```
┌───────────────────────────────┬────────────┬──────────────────────────────────────────┬──────────┐
│ Problem                       │ Window?    │ Core idea                                │ Time     │
├───────────────────────────────┼────────────┼──────────────────────────────────────────┼──────────┤
│ Is Subsequence                │ no (2-ptr) │ advance i on match; many queries → BS    │ O(|t|)   │
│ Index Pairs of a String       │ no (trie)  │ walk trie from each start, stop early    │ O(n·L)   │
│ Longest No-Repeat             │ variable ↑ │ L = max(L, last[c]+1)                    │ O(n)     │
│ Longest K Uniques             │ variable ↑ │ shrink while distinct > k; record if ==k │ O(n)     │
│ Char Replacement              │ variable ↑ │ len − maxFreq ≤ k; maxFreq never drops   │ O(n)     │
│ Permutation in String         │ fixed      │ need[] + missing counter                 │ O(n)     │
│ Find All Anagrams             │ fixed      │ same, collect every start                │ O(n)     │
│ Minimum Window Substring      │ variable ↓ │ formed == required → record & shrink     │ O(n+m)   │
│ Concatenation of All Words    │ fixed-ish  │ wl offsets, words as "letters"           │ O(n·wl)  │
│ Count Unique Chars (828)      │ no         │ (i − prev) × (next − i)                  │ O(n)     │
└───────────────────────────────┴────────────┴──────────────────────────────────────────┴──────────┘
   ↑ = longest (record after shrinking)    ↓ = shortest (record while shrinking)
```

### Pattern family tree

```
                          STRING SCANNING
                                │
     ┌──────────────┬───────────┼──────────────┬────────────────────┐
     │              │           │              │                    │
  TWO POINTERS   FIXED       VARIABLE       VARIABLE           CONTRIBUTION
  (not window)   WINDOW      LONGEST        SHORTEST           (not window)
     │              │           │              │                    │
  ├ Is Subseq.   ├ Permutation ├ No-Repeat    └ Min Window       └ Count Unique
  └ Index Pairs  ├ Anagrams    ├ K Uniques                          Chars
    (+ trie)     └ Concat of   └ Char Replace
                   All Words
```

### Which template? decision card

```
   Is the answer about a CONTIGUOUS piece?
        │
        ├─ no ─────────────► two pointers / DP / contribution
        │
        yes
        │
   Is the window length FIXED (= |p|, or k·wl)?
        │
        ├─ yes ────────────► FIXED window: add R, remove R−m
        │
        no
        │
   Asking for LONGEST?  ───► grow R; while invalid shrink L; record after
   Asking for SHORTEST? ───► grow R; while valid record & shrink L
```

### Counter toolbox

```
  ┌───────────────┬───────────────────────────────┬─────────────────────────────┐
  │ Counter       │ Changes when...               │ Used in                     │
  ├───────────────┼───────────────────────────────┼─────────────────────────────┤
  │ last[c]       │ every time c is seen          │ No-Repeat                   │
  │ distinct      │ a count goes 0→1 or 1→0       │ K Uniques                   │
  │ maxFreq       │ a count beats the record      │ Char Replacement            │
  │ missing       │ need[c] crosses 0             │ Permutation, Anagrams       │
  │ formed        │ have[c] reaches/leaves need[c]│ Min Window                  │
  │ count (words) │ word added/dropped            │ Concatenation of All Words  │
  └───────────────┴───────────────────────────────┴─────────────────────────────┘
```

### Optimization checklist

```
  ☐ Brute force checks all substrings?            → window: each char in/out once
  ☐ Comparing two count maps every step?          → keep ONE counter (missing/formed)
  ☐ Shrinking one step at a time to drop a dup?   → jump L with last-seen index
  ☐ Recomputing max frequency after each shrink?  → keep the stale maxFreq (safe)
  ☐ Words of equal length?                        → chunk by wl, one pass per offset
  ☐ Many subsequence queries on one string?       → index lists + binary search
  ☐ "Sum over ALL substrings"?                    → contribution per character
```

### 🚩 Common bugs to avoid

```
  ✗ No-Repeat: L = last[c] + 1 without max() → L moves backward ("abba")
  ✗ K Uniques: recording when distinct < k for the "exactly K" version
  ✗ K Uniques: returning 0 instead of −1 when no window has k distinct
  ✗ Char Replacement: trying to decrease maxFreq (unneeded, easy to get wrong)
  ✗ Anagrams: checking before removing the leaving char (window one too big)
  ✗ Min Window: recording outside the shrink loop (window already invalid)
  ✗ Min Window: counting total chars instead of DISTINCT satisfied chars
  ✗ Concatenation: only scanning offset 0; forgetting to reset on a non-word
  ✗ Using a window on a SUBSEQUENCE problem (not contiguous!)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "If the window [L..R] breaks the rule, does growing it      ║
   ║   ever fix it?"                                              ║
   ║     NO  → sliding window works: shrink from the left.        ║
   ║     YES → the window won't work; think prefix sums, DP or    ║
   ║           contribution counting.                             ║
   ╚══════════════════════════════════════════════════════════════╝
```

---

### ✅ Progress tracker

- [ ] Is Subsequence (Easy)
- [ ] Index Pairs of a String (Easy)
- [ ] Longest Substring Without Repeating Characters (Medium)
- [ ] Longest Substring with K Uniques (Medium)
- [ ] Longest Repeating Character Replacement (Medium)
- [ ] Permutation in String (Medium)
- [ ] Find All Anagrams in a String (Medium)
- [ ] Minimum Window Substring (Hard)
- [ ] Substring with Concatenation of All Words (Hard)
- [ ] Count Unique Characters of All Substrings of a Given String (Hard)
