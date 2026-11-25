# Two-Pointer (Palindrome): A Visual Guide

> **Goal:** Learn to *see* palindrome problems as two pointers walking toward (or away from) each other.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> For the DP side of palindromes (Longest Palindromic **Subsequence**, Min Insertions, Partitioning),
> see [../dynammic programming/03-DP-on-Strings.md](../dynammic%20programming/03-DP-on-Strings.md).

---

## Table of Contents

0. [The Big Idea: Two Pointers on a String](#0-the-big-idea-two-pointers-on-a-string)
1. [Reverse String (Easy)](#1-reverse-string-easy)
2. [Valid Palindrome (Easy)](#2-valid-palindrome-easy)
3. [Valid Palindrome II (Easy)](#3-valid-palindrome-ii-easy)
4. [Palindromic Substrings (Medium)](#4-palindromic-substrings-medium)
5. [Longest Palindromic Substring (Medium)](#5-longest-palindromic-substring-medium)
6. [Master Cheat Sheet](#6-master-cheat-sheet)

> **Suggested order:** Reverse String → Valid Palindrome → Valid Palindrome II
> → Palindromic Substrings → Longest Palindromic Substring.
> The first three use **outside-in** pointers. The last two switch to **center-out** pointers.

---

## 0. The Big Idea: Two Pointers on a String

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TWO-POINTER PALINDROME"                │
├──────────────────────────────────────────────────────────────────┤
│  • "palindrome", "reads the same forward and backward"           │
│  • "reverse" in place, "symmetric", "mirror"                     │
│  • compare the FIRST char with the LAST, then move inward        │
│  • "delete at most one character" and still a palindrome         │
│  • count / find palindromic SUBSTRINGS (contiguous!)             │
└──────────────────────────────────────────────────────────────────┘
```

### What a palindrome looks like

```
     r   a   c   e   c   a   r
     │   │   │   │   │   │   │
     │   │   │   ▼   │   │   │
     │   │   └─ mirror ──┘   │       every char equals its mirror
     │   └───── mirror ──────┘       around the CENTER
     └───────── mirror ──────────┘
```

### The two pointer shapes

```
  SHAPE A: OUTSIDE-IN (converging)          SHAPE B: CENTER-OUT (expanding)
  "Is THIS string a palindrome?"            "Which substrings are palindromes?"

     r   a   c   e   c   a   r                 b   a   b   a   d
     L→                    ←R                          ↑
         L→            ←R                         ←L   ↑   R→
             L→    ←R                         ←L       ↑       R→
                 ▲                                  center
            L meets R → done                 grow while s[L] == s[R]

  Used in: Reverse String,                   Used in: Palindromic Substrings,
           Valid Palindrome I / II                    Longest Palindromic Substring
```

### Outside-in template

```
L ← 0
R ← n − 1
while L < R:
    (optional) skip characters that don't count
    compare / swap s[L] and s[R]
    L ← L + 1
    R ← R − 1
```

### Center-out template

```
function expand(s, L, R):            // start with L, R at the center
    while L ≥ 0 and R < n and s[L] == s[R]:
        L ← L − 1
        R ← R + 1
    return (L + 1, R − 1)            // last VALID window (the loop overshot by 1)
```

### Odd vs. even centers: there are 2n − 1 of them

```
  A palindrome's center is either ON a character (odd length)
  or BETWEEN two characters (even length).

   string:      a     b     b     a
   index:       0     1     2     3

   odd  centers:  (0,0)   (1,1)   (2,2)   (3,3)       → n   centers
                   ▲       ▲       ▲       ▲
   even centers:      (0,1)   (1,2)   (2,3)           → n−1 centers
                        ▲       ▲       ▲
                                ▲
                       "abba" grows from HERE (even center 1|2)

   total = n + (n − 1) = 2n − 1 centers
```

> ⚠️ Forgetting the **even** centers is the #1 bug. `"abba"` has **no** odd center that
> grows to the full string.

### Skip / normalize rules

```
  ┌─────────────────────────────┬───────────────────────────────────────┐
  │ Problem says...             │ Do this                               │
  ├─────────────────────────────┼───────────────────────────────────────┤
  │ "ignore non-alphanumeric"   │ move the pointer past it, don't compare│
  │ "case-insensitive"          │ compare lowercase(s[L]), lowercase(s[R])│
  │ "may delete one char"       │ on first mismatch, branch into 2 checks│
  │ "in place, O(1) memory"     │ swap; never build a reversed copy     │
  └─────────────────────────────┴───────────────────────────────────────┘

  💡 Skip IN PLACE with the pointers instead of building a cleaned copy:
     same O(n) time, but O(1) extra space.
```

### Two pointers vs. DP: which one?

```
  ┌───────────────────────────────────────┬─────────────────────────────┐
  │ Question                              │ Tool                        │
  ├───────────────────────────────────────┼─────────────────────────────┤
  │ Is the whole string a palindrome?     │ outside-in, O(n), O(1)      │
  │ Palindromic SUBSTRINGS (contiguous)   │ center-out, O(n²), O(1)     │
  │ Palindromic SUBSEQUENCE (gaps allowed)│ DP table (see DP on Strings)│
  │ Delete up to k chars (k > 1)          │ DP: n − LPS ≤ k             │
  └───────────────────────────────────────┴─────────────────────────────┘
```

---

## 1. Reverse String (Easy)

### Problem
Reverse an array of characters **in place** with O(1) extra memory.

### Visualize it

```
   before:   h   e   l   l   o
             ▲               ▲
             └──── swap ─────┘

   after:    o   l   l   e   h
```

### The decision: swap the mirrors, move both inward

```
   ┌──────────────────────────────────────────────┐
   │ swap s[L] and s[R]                           │
   │ L moves right, R moves left                  │
   │ stop when they MEET (odd n) or CROSS (even n)│
   └──────────────────────────────────────────────┘
```

### The 4 steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n − 1` (outside-in) |
| Action | swap `s[L]`, `s[R]` |
| Move | `L++`, `R--` |
| Stop | `L ≥ R` (the middle char of an odd string stays put) |

### Trace: `["h","e","l","l","o"]`

```
  step │  L  R │ swap      │  array
  ─────┼───────┼───────────┼─────────────────────────
   0   │  0  4 │ h ↔ o     │  o  e  l  l  h
   1   │  1  3 │ e ↔ l     │  o  l  l  e  h
   2   │  2  2 │ L == R    │  stop  ✅  "olleh"

        o   l   l   e   h
                ▲
            middle 'l' never moves
```

### Pseudocode

```
function reverseString(s):
    L ← 0
    R ← length(s) − 1
    while L < R:
        swap s[L], s[R]
        L ← L + 1
        R ← R − 1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Build a reversed copy | O(n) | O(n) ✗ not in place |
| Recursion (swap ends, recurse inside) | O(n) | O(n) stack |
| **Two pointers** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- `while L < R`, not `L ≤ R`. Swapping a char with itself is harmless but useless.
- Only n/2 swaps happen.
- This swap loop is a building block: "reverse a sub-range" appears in Next Permutation,
  Rotate Array, and Reverse Words in a String.

---

## 2. Valid Palindrome (Easy)

### Problem
After lowercasing and **ignoring non-alphanumeric characters**, does the string read the same both ways?

### Visualize it

```
   "A man, a plan, a canal: Panama"

    cleaned:  a m a n a p l a n a c a n a l p a n a m a     ✅ palindrome
    (but we will NOT build this copy, we skip in place)

   "race a car"

    cleaned:  r a c e a c a r
              ✓ ✓ ✓ ✗ ...                                     ❌
                    e ≠ a
```

### The decision at each step

```
                 look at s[L] and s[R]
                          │
        ┌─────────────────┼──────────────────┐
   s[L] is junk     s[R] is junk        both are letters/digits
        │                 │                   │
      L++               R--          lower(s[L]) == lower(s[R]) ?
                                       │                │
                                      yes               no
                                       │                │
                                  L++, R--         return false
```

### The 4 steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n − 1` |
| Skip | advance `L` / retreat `R` past non-alphanumeric chars |
| Compare | lowercase both; mismatch → `false` |
| Stop | `L ≥ R` → `true` |

### Trace: `"A man, a plan, a canal: Panama"` (length 30)

```
  index:  0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29
  char :  A _ m a n , _ a _ p l  a  n  ,  _  a  _  c  a  n  a  l  :  _  P  a  n  a  m  a
          (_ = space)

  L  │ R  │ what happens
  ───┼────┼─────────────────────────────────────────
   0 │ 29 │ 'A' vs 'a' → a == a ✓
   1 │ 28 │ ' ' junk → L=2;  'm' vs 'm' ✓
   3 │ 27 │ 'a' vs 'a' ✓
   4 │ 26 │ 'n' vs 'n' ✓
   5 │ 25 │ ',' junk, ' ' junk → L=7;  'a' vs 'a' ✓
   8 │ 24 │ ' ' junk → L=9;  'p' vs 'P' → p == p ✓
  10 │ 23 │ ' ' junk, ':' junk → R=21;  'l' vs 'l' ✓
  11 │ 20 │ 'a' vs 'a' ✓
  12 │ 19 │ 'n' vs 'n' ✓
  13 │ 18 │ ',' junk, ' ' junk → L=15;  'a' vs 'a' ✓
  16 │ 17 │ ' ' junk → L=17; now L == R → stop

  → true ✅
```

### Trace: `"race a car"`

```
  index:  0 1 2 3 4 5 6 7 8 9
  char :  r a c e _ a _ c a r

  L │ R │ what happens
  ──┼───┼─────────────────────────────
  0 │ 9 │ 'r' vs 'r' ✓
  1 │ 8 │ 'a' vs 'a' ✓
  2 │ 7 │ 'c' vs 'c' ✓
  3 │ 6 │ ' ' junk → R=5;  'e' vs 'a' ✗

  → false ❌
```

### Pseudocode

```
function isPalindrome(s):
    L ← 0
    R ← length(s) − 1
    while L < R:
        while L < R and not isAlphaNum(s[L]):  L ← L + 1
        while L < R and not isAlphaNum(s[R]):  R ← R − 1
        if lower(s[L]) ≠ lower(s[R]):
            return false
        L ← L + 1
        R ← R − 1
    return true
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Clean into a new string, compare with its reverse | O(n) | O(n) |
| **Two pointers, skip in place** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- The inner skip loops **must** also check `L < R`. Otherwise a string of only junk
  (like `".,"`) runs a pointer off the end.
- **Digits count** as alphanumeric: `"0P"` → `'0'` vs `'p'` → false.
- An empty string, or a string with only junk, is a palindrome → `true`.

---

## 3. Valid Palindrome II (Easy)

### Problem
Can the string become a palindrome after deleting **at most one** character?

### Visualize it

```
   "abca"
    a  b  c  a
    ✓        ✓       outer pair matches
       b  c          mismatch! delete one of them:

       delete 'b' → "aca"  ✅ palindrome
       delete 'c' → "aba"  ✅ palindrome

   "abc"
    a     c          mismatch immediately:
       delete 'a' → "bc"   ❌
       delete 'c' → "ab"   ❌     → false
```

### The decision: one free "skip", used at the first mismatch

```
           walk outside-in while s[L] == s[R]
                          │
                  first mismatch at (L, R)
                          │
          ┌───────────────┴────────────────┐
     DELETE s[L]                        DELETE s[R]
  is s[L+1 .. R] a palindrome?     is s[L .. R−1] a palindrome?
          │                                │
          └──────────── OR ────────────────┘
                     answer

   No mismatch at all → already a palindrome → true
```

> Why only the **first** mismatch? Every pair outside it already matched, so deleting
> anything out there can't help. The fix must happen at L or at R.

### The 4 steps

| Step | Answer |
|------|--------|
| Pointers | `L = 0`, `R = n − 1` |
| Match | `L++`, `R--` |
| First mismatch | return `isPal(L+1, R) OR isPal(L, R−1)` |
| Stop | `L ≥ R` → `true` |

### Trace: `"abca"`

```
  L │ R │ s[L] s[R] │ action
  ──┼───┼───────────┼──────────────────────────────────
  0 │ 3 │  a    a   │ match → L=1, R=2
  1 │ 2 │  b    c   │ mismatch!
    │   │           │   skip L: isPal(2,2) = "c"  → true ✅
    │   │           │   (skip R: isPal(1,1) = "b" → true, not needed)
  → true
```

### Trace: `"abc"`

```
  L │ R │ s[L] s[R] │ action
  ──┼───┼───────────┼──────────────────────────────────
  0 │ 2 │  a    c   │ mismatch!
    │   │           │   skip L: isPal(1,2) = "bc" → false
    │   │           │   skip R: isPal(0,1) = "ab" → false
  → false ❌
```

### ⚠️ The tricky case: you MUST try both sides

```
   s = "ebcbbececabbacecbbcbe"   (length 21)

   index: 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
   char : e b c b b e c e c a b  b  a  c  e  c  b  b  c  b  e

   (0,20) e=e ✓  (1,19) b=b ✓  (2,18) c=c ✓  (3,17) b=b ✓  (4,16) b=b ✓
   (5,15) e vs c  ✗  first mismatch at L=5, R=15

   Lookahead is a TRAP here:
     s[L+1] = 'c' == s[R]   → "skip left looks good"
     s[L]   = 'e' == s[R−1] → "skip right ALSO looks good"

   skip RIGHT: isPal(5,14) = e c e c a b b a c e
               (5,14) e=e ✓ (6,13) c=c ✓ (7,12) e vs a ✗   → false
   skip LEFT : isPal(6,15) = c e c a b b a c e c
               (6,15) c=c ✓ (7,14) e=e ✓ (8,13) c=c ✓
               (9,12) a=a ✓ (10,11) b=b ✓                  → true ✅

   → true. A greedy "pick one side by peeking 1 char" can choose wrong.
     Always check BOTH sub-ranges fully.
```

### Pseudocode

```
function validPalindrome(s):
    L ← 0
    R ← length(s) − 1
    while L < R:
        if s[L] ≠ s[R]:
            return isPal(s, L + 1, R) or isPal(s, L, R − 1)
        L ← L + 1
        R ← R − 1
    return true

function isPal(s, L, R):
    while L < R:
        if s[L] ≠ s[R]: return false
        L ← L + 1
        R ← R − 1
    return true
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try deleting every index, check each | O(n²) | O(n) |
| **Two pointers + one branch** | **O(n)** | **O(1)** ✅ |

> The branch happens **once**, and each side is at most one linear scan → O(n) total.

### 📌 Points to remember
- Branch only at the **first** mismatch, and check **both** sides with OR.
- Don't recurse with "deletions left" counters for k = 1. A plain helper is simpler.
- Follow-up **Valid Palindrome III** (delete up to k chars): two pointers no longer work.
  Use DP: the string works if `n − LPS(s) ≤ k` (LPS = Longest Palindromic Subsequence, see the DP on Strings guide).

---

## 4. Palindromic Substrings (Medium)

### Problem
Count how many **substrings** (contiguous) are palindromes. Same text at different positions counts separately.

### Visualize it

```
   "aaa"
    a  .  .      "a"   ✓
    .  a  .      "a"   ✓
    .  .  a      "a"   ✓
    a  a  .      "aa"  ✓
    .  a  a      "aa"  ✓
    a  a  a      "aaa" ✓        → 6
```

### Switch shapes: from "check one string" to "grow from every center"

```
   Checking all O(n²) substrings with outside-in → O(n³)  ✗ too slow

   Instead: every palindrome has a CENTER. Grow from each one.
   Each successful growth step = one more palindrome found.

             ←L  center  R→
       ...  [ x  [ y  [ z ]  y ]  x ]  ...
                     ▲
            z, yzy, xyzyx: 3 palindromes from ONE center
            (stop at the first mismatch: nothing bigger can work)
```

### The 4 steps

| Step | Answer |
|------|--------|
| Centers | all `2n − 1`: `(i, i)` for odd, `(i, i+1)` for even |
| Grow | while in bounds and `s[L] == s[R]`: count++, `L--`, `R++` |
| Stop growing | first mismatch or boundary |
| Answer | total count over all centers |

### Trace: `"abc"`

```
  center   │ start (L,R) │ growth                       │ found
  ─────────┼─────────────┼──────────────────────────────┼──────
  odd  0   │ (0,0)       │ "a" ✓ → (−1,1) out           │  1
  even 0|1 │ (0,1)       │ a vs b ✗                     │  0
  odd  1   │ (1,1)       │ "b" ✓ → (0,2) a vs c ✗       │  1
  even 1|2 │ (1,2)       │ b vs c ✗                     │  0
  odd  2   │ (2,2)       │ "c" ✓ → (1,3) out            │  1
                                                  total =  3 ✅
```

### Trace: `"aaa"`

```
  center   │ start (L,R) │ growth                              │ found
  ─────────┼─────────────┼─────────────────────────────────────┼──────
  odd  0   │ (0,0)       │ "a" ✓ → (−1,1) out                  │  1
  even 0|1 │ (0,1)       │ "aa" ✓ → (−1,2) out                 │  1
  odd  1   │ (1,1)       │ "a" ✓ → (0,2) "aaa" ✓ → (−1,3) out  │  2
  even 1|2 │ (1,2)       │ "aa" ✓ → (0,3) out                  │  1
  odd  2   │ (2,2)       │ "a" ✓ → (1,3) out                   │  1
                                                         total =  6 ✅
```

### Pseudocode

```
function countSubstrings(s):
    count ← 0
    for i from 0 to n − 1:
        count ← count + countFrom(s, i, i)       // odd length
        count ← count + countFrom(s, i, i + 1)   // even length
    return count

function countFrom(s, L, R):
    c ← 0
    while L ≥ 0 and R < n and s[L] == s[R]:
        c ← c + 1
        L ← L − 1
        R ← R + 1
    return c
```

### Alternative: DP table

```
  pal[i][j] = true  if  s[i] == s[j]  and  (j − i < 2  or  pal[i+1][j−1])
                                            ▲               ▲
                              length 1 or 2: ends     inside must be a
                              matching is enough      palindrome too

  Fill i from n−1 DOWN to 0 (pal[i+1] must be ready), j from i UP to n−1.

  "abba":        j=0  j=1  j=2  j=3
          i=0  │  T    F    F    T   ← (0,3): a==a and pal[1][2]
          i=1  │       T    T    F   ← (1,2): b==b, length 2
          i=2  │            T    F
          i=3  │                 T

  count of T = 4 + 1 + 1 = 6   ("a","b","b","a","bb","abba")
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Check every substring | O(n³) | O(1) |
| DP table | O(n²) | O(n²) |
| **Expand around center** | **O(n²)** | **O(1)** ✅ |
| Manacher's (see problem 5) | O(n) | O(n) |

### 📌 Points to remember
- **2n − 1 centers.** Do both `(i, i)` and `(i, i+1)` for every `i`.
- Stop growing at the **first** mismatch: if the inner part isn't a palindrome, no outer one can be.
- Each growth step is a **distinct** substring (different start/end), so just add 1.
- DP version: fill **i backward**, because `pal[i][j]` reads `pal[i+1][j−1]`.

---

## 5. Longest Palindromic Substring (Medium)

### Problem
Return the **longest** palindromic substring.

### Visualize it

```
   "babad"
    b a b . .     "bab"  length 3  ✅
    . a b a .     "aba"  length 3  ✅ (also valid)

   "cbbd"
    . b b .       "bb"   length 2  ✅  (an EVEN center)
```

### Same engine as problem 4, but keep the best window

```
   For every center:
       (lo, hi) ← expand(s, center)
       if hi − lo + 1 > bestLen:
           best ← (lo, hi)

   Problem 4 COUNTS the growth steps.
   Problem 5 keeps the WIDEST final window.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Centers | all `2n − 1` |
| Grow | `expand` returns the widest valid window `(L+1, R−1)` |
| Keep | update `best` when the new window is longer |
| Answer | `s[bestLo .. bestHi]` |

### Trace: `"babad"`

```
  index: 0 1 2 3 4
  char : b a b a d

  center   │ growth                              │ window  │ len │ best
  ─────────┼─────────────────────────────────────┼─────────┼─────┼──────────
  odd  0   │ b ✓, (−1,1) out                     │ (0,0)   │  1  │ "b"
  even 0|1 │ b vs a ✗                            │  —      │  0  │ "b"
  odd  1   │ a ✓, (0,2) b=b ✓, (−1,3) out        │ (0,2)   │  3  │ "bab" ★
  even 1|2 │ a vs b ✗                            │  —      │  0  │ "bab"
  odd  2   │ b ✓, (1,3) a=a ✓, (0,4) b vs d ✗    │ (1,3)   │  3  │ "bab" (tie)
  even 2|3 │ b vs a ✗                            │  —      │  0  │ "bab"
  odd  3   │ a ✓, (2,4) b vs d ✗                 │ (3,3)   │  1  │ "bab"
  even 3|4 │ a vs d ✗                            │  —      │  0  │ "bab"
  odd  4   │ d ✓, (3,5) out                      │ (4,4)   │  1  │ "bab"

  → "bab" ✅   ("aba" is equally correct; strict ">" keeps the first one found)
```

### Trace: `"cbbd"`

```
  center   │ growth                              │ window  │ len │ best
  ─────────┼─────────────────────────────────────┼─────────┼─────┼──────
  odd  0   │ c ✓, out                            │ (0,0)   │  1  │ "c"
  even 0|1 │ c vs b ✗                            │  —      │  0  │ "c"
  odd  1   │ b ✓, (0,2) c vs b ✗                 │ (1,1)   │  1  │ "c"
  even 1|2 │ b=b ✓, (0,3) c vs d ✗               │ (1,2)   │  2  │ "bb" ★
  odd  2   │ b ✓, (1,3) b vs d ✗                 │ (2,2)   │  1  │ "bb"
  even 2|3 │ b vs d ✗                            │  —      │  0  │ "bb"
  odd  3   │ d ✓, out                            │ (3,3)   │  1  │ "bb"

  → "bb" ✅   only an EVEN center finds it
```

### Pseudocode

```
function longestPalindrome(s):
    bestLo ← 0, bestHi ← 0
    for i from 0 to n − 1:
        for (L, R) in [ (i, i), (i, i + 1) ]:
            (lo, hi) ← expand(s, L, R)
            if hi − lo > bestHi − bestLo:
                bestLo ← lo, bestHi ← hi
    return s[bestLo .. bestHi]

function expand(s, L, R):
    while L ≥ 0 and R < n and s[L] == s[R]:
        L ← L − 1
        R ← R + 1
    return (L + 1, R − 1)        // for a failed even start, hi < lo → length 0
```

> 💡 Returning `(L + 1, R − 1)` avoids the messy `start = i − (len − 1) / 2` arithmetic.
> For an even center that fails immediately, `(i+1, i)` has length 0 and never wins.

### Alternative: DP table

```
  Same pal[i][j] table as problem 4; track the longest (i, j) that is true.

  "cbbd":        j=0  j=1  j=2  j=3
          i=0  │  T    F    F    F
          i=1  │       T    T    F      ← (1,2) "bb", length 2  ★
          i=2  │            T    F
          i=3  │                 T

  → "bb". Correct, but O(n²) memory vs O(1) for expand-around-center.
```

### 🚀 Bonus: Manacher's algorithm, O(n)

```
  Intuition only (rarely needed in interviews):

  1. Insert '#' between chars so every palindrome has an ODD length:
        "abba"  →  "#a#b#b#a#"        (no more even/odd split)

  2. Keep the palindrome reaching FARTHEST right: center C, right edge R.

  3. For a new center i inside [C, R], its MIRROR i' = 2C − i was already
     computed. Inside the big palindrome, i sees the same thing i' saw:

        ◄─────────── big palindrome around C ───────────►
           [ i' radius ]        C        [ i radius ≥ ? ]
                         mirror image

     So start i's radius at min(radius[i'], R − i) instead of 0,
     and only expand PAST R. R only moves right → O(n) total.
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Check every substring | O(n³) | O(1) |
| DP table | O(n²) | O(n²) |
| **Expand around center** | **O(n²)** | **O(1)** ✅ interview default |
| Manacher's | O(n) | O(n) |

### 📌 Points to remember
- **Substring ≠ subsequence.** Substring → expand around center. Subsequence → DP (LPS).
- Try **both** odd and even centers for every `i`.
- Track the window as `(lo, hi)`, not as `(center, length)`.
- Ties: the problem accepts any longest answer.

---

## 6. Master Cheat Sheet

### All 5 problems at a glance

```
┌───────────────────────────────┬──────────────┬──────────────────────────────────────┬─────────────┐
│ Problem                       │ Shape        │ Core idea                            │ Best        │
├───────────────────────────────┼──────────────┼──────────────────────────────────────┼─────────────┤
│ Reverse String                │ outside-in   │ swap s[L], s[R]; move inward         │ O(n), O(1)  │
│ Valid Palindrome              │ outside-in   │ skip junk, compare lowercase         │ O(n), O(1)  │
│ Valid Palindrome II           │ outside-in   │ 1st mismatch → isPal(L+1,R) OR       │ O(n), O(1)  │
│                               │              │                isPal(L,R−1)          │             │
│ Palindromic Substrings        │ center-out   │ 2n−1 centers, +1 per growth step     │ O(n²), O(1) │
│ Longest Palindromic Substring │ center-out   │ 2n−1 centers, keep widest window     │ O(n²), O(1) │
└───────────────────────────────┴──────────────┴──────────────────────────────────────┴─────────────┘
```

### Pattern family tree

```
                        PALINDROME TWO POINTERS
                                  │
            ┌─────────────────────┴──────────────────────┐
       OUTSIDE-IN                                    CENTER-OUT
   "is THIS a palindrome?"                     "which pieces are palindromes?"
            │                                             │
   ├─ Reverse String       (swap)               ├─ Palindromic Substrings (count)
   ├─ Valid Palindrome     (skip junk)          └─ Longest Palindromic Substring (max)
   └─ Valid Palindrome II  (one branch)
                                                    + Manacher's (O(n) upgrade)

            Gaps allowed (SUBSEQUENCE)? → leave two pointers, go to DP
            → ../dynammic programming/03-DP-on-Strings.md
```

### Which shape? Decision card

```
   Is the question about the WHOLE string?
        │
       yes ──► outside-in:  L = 0, R = n−1, move toward each other
        │
       no, about SUBSTRINGS ──► center-out: 2n−1 centers, grow outward
        │
       about SUBSEQUENCES ──► DP table (two pointers won't work)
```

### Optimization checklist

```
  ☐ Building a cleaned / reversed copy?      → skip in place, O(1) space
  ☐ Checking every substring (O(n³))?        → expand around center, O(n²)
  ☐ Using a DP table just to find one answer?→ expand around center, O(1) space
  ☐ Need O(n) for longest palindrome?        → Manacher's
  ☐ "Delete one char"?                       → branch ONCE at first mismatch
  ☐ "Delete k chars"?                        → DP: n − LPS ≤ k
```

### 🚩 Common bugs to avoid

```
  ✗ Forgetting EVEN centers (i, i+1) → misses "bb", "abba"
  ✗ Inner skip loops without the L < R guard → index out of range
  ✗ Treating digits as junk in Valid Palindrome (they count!)
  ✗ Valid Palindrome II: peeking one char to pick a side instead of checking both
  ✗ Valid Palindrome II: allowing more than one deletion
  ✗ expand(): returning (L, R) instead of (L+1, R−1); the loop overshoots by 1
  ✗ DP table: filling i forward when pal[i][j] needs pal[i+1][j−1]
  ✗ Confusing substring (contiguous) with subsequence (gaps allowed)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Do I already KNOW the boundaries (whole string), or    ║
   ║   am I SEARCHING for them (substrings)?"                 ║
   ╚══════════════════════════════════════════════════════════╝
     Known → walk inward from both ends.
     Searching → grow outward from every center.
```

---

### ✅ Progress tracker

- [ ] Reverse String (Easy)
- [ ] Valid Palindrome (Easy)
- [ ] Valid Palindrome II (Easy)
- [ ] Palindromic Substrings (Medium)
- [ ] Longest Palindromic Substring (Medium)
