# General / Math Drills: A Visual Guide

> **Goal:** Learn to handle "pure number" problems with no fancy data structure behind them: peel digits,
> carry, detect cycles, move indices with `%`, and count with a hash map, while guarding every overflow, zero, and sign trap.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Digits, Formulas, and Edge Cases](#0-the-big-idea-digits-formulas-and-edge-cases)
1. [Plus One (Easy)](#1-plus-one-easy)
2. [Reverse Integer (Medium)](#2-reverse-integer-medium)
3. [Happy Number (Easy)](#3-happy-number-easy)
4. [Multiply Strings (Medium)](#4-multiply-strings-medium)
5. [Rotate Array (Medium)](#5-rotate-array-medium)
6. [Valid Sudoku (Medium)](#6-valid-sudoku-medium)
7. [Detect Squares (Medium)](#7-detect-squares-medium)
8. [3Sum Closest (Medium)](#8-3sum-closest-medium)
9. [Factor Combinations (Medium)](#9-factor-combinations-medium)
10. [Maximum Binary Tree (Medium)](#10-maximum-binary-tree-medium)
11. [Master Cheat Sheet](#11-master-cheat-sheet)

> **Suggested order:** Plus One → Reverse Integer → Happy Number → Multiply Strings → Rotate Array
> → Valid Sudoku → Detect Squares → 3Sum Closest → Factor Combinations → Maximum Binary Tree.
> The first four are **digit work** (carry, peel, cycle, digit grid). The next two are **index arithmetic**
> (`% n`, `r/3`). Detect Squares is **hashing as counting**. The last three are **formula + a classic tool**
> (two pointers, factor recursion, monotonic stack).

---

## 0. The Big Idea: Digits, Formulas, and Edge Cases

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "MATH DRILL"                            │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a NUMBER, or a number written as digits / a string   │
│  • "Reverse", "add one", "multiply", "sum of digit squares"      │
│  • "Rotate / shift by k", "wrap around"  → index arithmetic % n  │
│  • Fixed tiny grid (9×9) or coordinates  → formula for the index │
│  • "Count how many ..." of exact shapes  → hash map of counts    │
│  • Constraints mention 32-bit, "no BigInteger", "no 64-bit"      │
└──────────────────────────────────────────────────────────────────┘

  The trick is rarely a data structure. It is a FORMULA plus careful EDGES.
  Strategy: work digit by digit (or formula-first), then walk the edge checklist.
```

### Picture 1: digit peeling (n % 10, n / 10)

```
   n = 4721

   step   n       n % 10   (last digit)   n / 10   (drop last digit)
   ────   ─────   ──────                  ──────
    1     4721      1                      472
    2      472      2                       47
    3       47      7                        4
    4        4      4                        0   ← stop when n == 0

   Digits come out RIGHT to LEFT:  1, 2, 7, 4

   Rebuild in reverse:  rev = rev × 10 + digit
        0 → 1 → 12 → 127 → 1274
```

### Picture 2: carry propagation

```
       1   9   9          adding 1 at the far right
     +             1
     ──────────────
   i=2:  9 + 1 = 10 → write 0, carry 1   ──┐
   i=1:  9 + 1 = 10 → write 0, carry 1   ◄─┘──┐
   i=0:  1 + 1 =  2 → write 2, carry 0   ◄────┘   STOP, carry died

       2   0   0

   Carry only travels LEFT while the digit is 9.
   If the carry survives past index 0 (all 9s), the number GROWS by one digit.
```

### Picture 3: cycle detection

```
   Repeatedly apply f(x). Values live in a finite range, so either you
   reach a FIXED POINT (like 1 → 1) or you fall into a LOOP (the "rho" shape):

        start ─► a ─► b ─► c ─► d
                             ▲     │
                             │     ▼
                             g ◄── e      ← loop

   Detect it two ways:
     • hash set:  "have I seen this value before?"        O(steps) space
     • Floyd:     slow moves 1, fast moves 2; in a loop    O(1) space
                  they MUST meet (fast gains 1 per step)
   (Same idea as Linked List Cycle, see ../linked list/02-Fast-and-Slow-Pointers.md)
```

### Picture 4: index arithmetic and the reversal trick

```
   Wrap-around move by k:     new index = (i + k) % n

      i   :  0  1  2  3  4  5  6
      +3  :  3  4  5  6  0  1  2      ← 4+3 = 7 → 7 % 7 = 0

   Reversal trick (rotate right by k without extra space):

      [ A A A A | B B B ]     want  [ B B B | A A A A ]
       reverse ALL       →    [ B' B' B' | A' A' A' A' ]   (each block backwards)
       reverse each block →   [ B B B | A A A A ]  ✅

   Grid "which box?" formula:  box = (r / 3) × 3 + (c / 3)
```

### Picture 5: hashing as counting

```
   Instead of searching, KEEP A TALLY:

     added points:  (3,10) (11,2) (3,2) (11,2)

     count map:     (3,10) → 1
                    (11,2) → 2      ← duplicates are multiplicity, not noise
                    (3,2)  → 1

   "How many ways?" = product of counts of the pieces you need.
   "Seen before?"   = a set (a count map whose counts are 0 or 1).
```

### ⚠ Edge-case checklist (run it on EVERY problem in this guide)

```
  ☐ OVERFLOW   32-bit range is [−2147483648, 2147483647].
               Check BEFORE you multiply:  rev > MAX/10  → will overflow.
               |MIN| does not fit in a positive int, so never write abs(MIN).
  ☐ ZERO       n = 0, "0" × anything, k = 0, k a multiple of n, empty input.
  ☐ NEGATIVES  In C/Java, −7 % 10 = −7 and −7 / 10 = 0 (truncate toward zero).
               In Python, −7 % 10 = 3 and −7 // 10 = −1 (floor). Know your language.
  ☐ ALL 9s     999 + 1 = 1000: the result is LONGER than the input.
  ☐ LEADING ZEROS  "0045" must print as "45"; but "0" must stay "0".
  ☐ k > n      rotate by k = k mod n first.
  ☐ DUPLICATES the same point/number added twice counts twice.
```

### Complexity at a glance

```
   Digit loop on an integer n        O(number of digits) = O(log n)
   Digit loop on a string of length m O(m)
   Grade-school multiply m × n       O(m · n)
   Index-arithmetic pass on array    O(n) time, O(1) extra
   Fixed 9×9 board                   O(81) = O(1)
   Hash-map counting                 O(1) per add, O(distinct keys) per query
```

---

## 1. Plus One (Easy)

### Problem
A non-negative integer is given as an array of digits, most significant first (no leading zeros except the number 0 itself). Add one and return the new digit array.

### Visualize it

```
   digits:   [ 1 ,  2 ,  9 ]       = 129
                          ▲
                        add 1 here (the LAST digit)

   result:   [ 1 ,  3 ,  0 ]       = 130
```

### Key decision at each digit

```
                    look at digits[i]   (walking right → left)
                            │
            ┌───────────────┴────────────────┐
       digits[i] < 9                     digits[i] == 9
            │                                │
     digits[i] += 1                    digits[i] = 0
     RETURN immediately               carry continues LEFT
     (carry is absorbed)                     │
                                   fell off the left end?
                                             │
                                   all were 9 → answer = [1, 0, 0, ..., 0]
```

### The steps

| Step | Answer |
|------|--------|
| Walk | from the last index to index 0 |
| Digit < 9 | add 1, return the array right away |
| Digit = 9 | set it to 0, keep going left |
| Loop ends | every digit was 9 → new array of length n+1, `[1, 0, ..., 0]` |

### Trace 1 (digits = [1, 2, 9])

```
  i   digits[i]   decision        array after
  ─   ─────────   ─────────────   ───────────
  2       9       9 → 0, carry    [1, 2, 0]
  1       2       2 < 9 → 3       [1, 3, 0]   RETURN

  answer = [1, 3, 0] ✅   (129 + 1 = 130)
```

### Trace 2 (digits = [9, 9, 9]): the all-9s case

```
  i   digits[i]   decision        array after
  ─   ─────────   ─────────────   ───────────
  2       9       9 → 0, carry    [9, 9, 0]
  1       9       9 → 0, carry    [9, 0, 0]
  0       9       9 → 0, carry    [0, 0, 0]
  loop ended with carry still alive → build [1, 0, 0, 0]

  answer = [1, 0, 0, 0] ✅   (999 + 1 = 1000)
```

### Pseudocode

```
function plusOne(digits):
    for i from n-1 down to 0:
        if digits[i] < 9:
            digits[i] ← digits[i] + 1
            return digits              // carry absorbed, done
        digits[i] ← 0                  // 9 + 1 = 10 → write 0, carry on
    // only reached when every digit was 9
    result ← array of n+1 zeros
    result[0] ← 1
    return result
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Convert to an integer, add 1, convert back | O(n) | O(n) ❌ overflows for 100 digits |
| Full add with a `carry` variable over every digit | O(n) | O(1) |
| **Early return when the carry dies** | **O(n) worst, O(1) typical** | **O(1)** (O(n) only for all 9s) ✅ |

### 📌 Points to remember
- Never convert to a built-in integer: the array can be longer than any 64-bit number.
- The carry stops at the first digit that is **not** 9.
- All 9s is the only case where the length changes: the answer is always `1` followed by n zeros.

---

## 2. Reverse Integer (Medium)

### Problem
Given a signed 32-bit integer `x`, return its digits reversed. If the result falls outside `[−2³¹, 2³¹ − 1]`, return 0. You may not use 64-bit integers.

### Visualize it

```
   x =  123        →    321
   x = -123        →   -321
   x =  120        →     21        (trailing zero becomes a leading zero, which vanishes)
   x =  1534236469 →  9646324351 > 2147483647  →  0
```

### Key decision: check BEFORE you multiply

```
   rev ← rev × 10 + d      ← this line is where overflow happens

   MAX = 2147483647,  MAX / 10 = 214748364,  last digit 7
   MIN = −2147483648, MIN / 10 = −214748364, last digit −8

                    about to do rev × 10 + d
                              │
          ┌───────────────────┼───────────────────────────┐
   rev > 214748364     rev == 214748364            rev < −214748364
   → already too big    and d > 7 → too big        (or == and d < −8)
   → return 0          → return 0                  → return 0
                              │
                      otherwise SAFE: do the update

   You test the OLD rev against MAX/10 so the multiply never runs when it would overflow.
```

### The steps

| Step | Answer |
|------|--------|
| Peel | `d = x % 10`, `x = x / 10` (truncate toward zero, so `d` keeps the sign of `x`) |
| Guard | if `rev` would leave the 32-bit range after `× 10 + d`, return 0 |
| Push | `rev = rev × 10 + d` |
| Stop | when `x == 0` |

### Trace 1 (x = -123)

```
  x      d = x % 10   x / 10   guard   rev = rev×10 + d
  ────   ──────────   ──────   ─────   ────────────────
  -123      -3         -12      ok      0×10 − 3   =   -3
   -12      -2          -1      ok     -3×10 − 2   =  -32
    -1      -1           0      ok    -32×10 − 1   = -321

  answer = -321 ✅   (sign handled for free: every digit is negative)
```

### Trace 2 (x = 1534236469): overflow caught

```
  step   d   rev before    guard (rev > 214748364 ?)   rev after
  ────   ─   ──────────    ─────────────────────────   ─────────
   1     9            0     no                                  9
   2     6            9     no                                 96
   3     4           96     no                                964
   4     6          964     no                               9646
   5     3         9646     no                              96463
   6     2        96463     no                             964632
   7     4       964632     no                            9646324
   8     3      9646324     no                           96463243
   9     5     96463243     no                          964632435
  10     1    964632435     YES → 964632435 > 214748364   return 0

  answer = 0 ✅   (true reverse 9646324351 does not fit)
```

### Pseudocode

```
function reverse(x):
    MAX ← 2147483647
    MIN ← −2147483648
    rev ← 0
    while x ≠ 0:
        d ← x % 10                   // truncating: −123 % 10 = −3
        x ← x / 10                   // truncating: −123 / 10 = −12
        if rev > MAX / 10 or (rev == MAX / 10 and d > 7):
            return 0
        if rev < MIN / 10 or (rev == MIN / 10 and d < −8):
            return 0
        rev ← rev × 10 + d
    return rev
```

> 💡 Python note: `%` and `//` floor instead of truncating. There, peel `abs(x)` and re-apply the sign at the end,
> then do the range check.

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Convert to string, reverse, parse, compare to the range | O(d) | O(d) |
| Build `rev` in a 64-bit integer, compare at the end | O(d) | O(1) ❌ breaks the "no 64-bit" rule |
| **32-bit peel with the pre-multiply guard** | **O(d) = O(log x)** | **O(1)** ✅ |

### 📌 Points to remember
- **Guard before multiply.** After the overflow happens it is too late to detect it in 32 bits.
- `MAX / 10 = 214748364`, `MIN / 10 = −214748364`. The tie cases use the last digits 7 and −8.
- (Fun fact: for a valid 32-bit input the `== MAX/10` tie can never actually overflow, but writing it costs nothing.)
- Trailing zeros disappear naturally: `120 → 0, 2, 1 → 21`.

---

## 3. Happy Number (Easy)

### Problem
Start with `n`. Replace it by the sum of the squares of its digits, and repeat. If this reaches 1, `n` is happy. If it loops forever without reaching 1, it is not.

### Visualize it

```
   n = 19   (happy)                         n = 2   (not happy)

   19 → 1² + 9² = 82                        2 → 4 → 16 → 37 → 58
   82 → 8² + 2² = 68                                ▲             │
   68 → 6² + 8² = 100                               │             ▼
   100 → 1² + 0² + 0² = 1  ✅                       20 ◄ 42 ◄ 145 ◄ 89
                                                  (8-step loop, never hits 1)
```

### Key decision: why it must end or loop

```
   next(n) is SMALL: a 3-digit number gives at most 9²+9²+9² = 243.
   Any big n quickly falls below 243 and then STAYS below 243.
   Finite values + deterministic f  →  either reach 1, or repeat a value.

             compute next(n)
                   │
       ┌───────────┼──────────────────┐
     == 1      seen before?          new value
   HAPPY ✅    LOOP → not happy ❌    keep going
```

### The steps

| Step | Answer |
|------|--------|
| Helper | `next(n)` = peel digits with `% 10` and `/ 10`, add up `d²` |
| Option A | hash set of seen values; stop on 1 or on a repeat |
| Option B | Floyd: `slow = next(slow)`, `fast = next(next(fast))`; stop on 1 or when they meet |
| Answer | `true` exactly when the stopping value is 1 |

### Trace 1: hash set (n = 2)

```
  current   seen before?   next(current)
  ───────   ────────────   ─────────────
     2         no          4
     4         no          16
    16         no          1 + 36 = 37
    37         no          9 + 49 = 58
    58         no          25 + 64 = 89
    89         no          64 + 81 = 145
   145         no          1 + 16 + 25 = 42
    42         no          16 + 4 = 20
    20         no          4 + 0 = 4
     4         YES  → loop, return false

  answer = false ✅   (seen = {2, 4, 16, 37, 58, 89, 145, 42, 20})
```

### Trace 2: Floyd fast/slow (n = 2)

```
  Sequence: s0=2, s1=4, s2=16, s3=37, s4=58, s5=89, s6=145, s7=42, s8=20, s9=4, ...
  Start: slow = s0, fast = s1. Each round: slow +1 step, fast +2 steps.

  round   slow          fast           fast == 1?   slow == fast?
  ─────   ───────────   ────────────   ──────────   ─────────────
    0     s0  = 2       s1  = 4         no           no
    1     s1  = 4       s3  = 37        no           no
    2     s2  = 16      s5  = 89        no           no
    3     s3  = 37      s7  = 42        no           no
    4     s4  = 58      s9  = 4         no           no
    5     s5  = 89      s11 = 37        no           no
    6     s6  = 145     s13 = 89        no           no
    7     s7  = 42      s15 = 42        no           YES → stop

  fast = 42 ≠ 1  →  answer = false ✅
```

### Trace 3: Floyd (n = 19)

```
  Sequence: 19, 82, 68, 100, 1, 1, 1, ...

  round   slow   fast   stop?
  ─────   ────   ────   ─────
    0      19     82    no
    1      82    100    no
    2      68      1    fast == 1 → stop

  answer = true ✅
```

### Pseudocode

```
function next(n):
    total ← 0
    while n > 0:
        d ← n % 10
        total ← total + d × d
        n ← n / 10
    return total

// Option A: hash set
function isHappySet(n):
    seen ← empty set
    while n ≠ 1 and n not in seen:
        add n to seen
        n ← next(n)
    return n == 1

// Option B: Floyd, O(1) space
function isHappyFloyd(n):
    slow ← n
    fast ← next(n)
    while fast ≠ 1 and slow ≠ fast:
        slow ← next(slow)
        fast ← next(next(fast))
    return fast == 1
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Iterate a fixed large number of times and hope | unbounded guess | O(1) ❌ not a proof |
| **Hash set of seen values** | **O(log n)** | **O(log n)** |
| **Floyd fast/slow** | **O(log n)** | **O(1)** ✅ |
| Math shortcut: every unhappy number enters the loop containing 4 → stop at 1 or 4 | O(log n) | O(1) (relies on a memorized fact) |

> 💡 This is exactly **Linked List Cycle** where `next(n)` plays the role of `node.next`.
> See [../linked list/02-Fast-and-Slow-Pointers.md](../linked%20list/02-Fast-and-Slow-Pointers.md).

### 📌 Points to remember
- 1 is a fixed point (`next(1) = 1`), so in Floyd the loop also "meets" at 1; that is why we check `fast == 1` at the end.
- Digit peeling is the same `% 10`, `/ 10` loop as Reverse Integer.
- Start Floyd with `fast = next(n)`, not `n`, or the `slow ≠ fast` test fails before the first round.

---

## 4. Multiply Strings (Medium)

### Problem
Given two non-negative integers as strings `num1` and `num2`, return their product as a string. No big-integer libraries, no converting the whole string to a number.

### Visualize it: digit i × digit j lands at positions i+j and i+j+1

```
   num1 = "123"  (indices 0 1 2)         num2 = "45"  (indices 0 1)
   Result has at most 3 + 2 = 5 digits:  pos = [ _ , _ , _ , _ , _ ]
                                                 0   1   2   3   4

                         num2[j]
                       j=0   j=1
                        4     5
                  ┌─────┬─────┐
    num1[i]  i=0  1 │  4  │  5  │   → lands at pos[0..1] and pos[1..2]
             i=1  2 │  8  │ 10  │   → lands at pos[1..2] and pos[2..3]
             i=2  3 │ 12  │ 15  │   → lands at pos[2..3] and pos[3..4]
                  └─────┴─────┘

   product num1[i] × num2[j]:   TENS digit → pos[i + j]
                                ONES digit → pos[i + j + 1]
```

### Key decision: fold each product into the grid

```
        mul = d1 × d2
        p1 = i + j        (tens / carry slot)
        p2 = i + j + 1    (ones slot)

        sum = mul + pos[p2]           ← include what is already there
        pos[p2] = sum % 10            ← keep one digit
        pos[p1] = pos[p1] + sum / 10  ← push the carry one slot LEFT

   Walk i and j from RIGHT to LEFT so carries always move toward slots you
   will still visit (pos[p1] may temporarily hold ≥ 10; it gets folded later).
```

### The steps

| Step | Answer |
|------|--------|
| Zero check | if either string is `"0"`, return `"0"` |
| Grid | `pos` of length `m + n`, all zeros |
| Double loop | `i` from m-1 down to 0, `j` from n-1 down to 0, fold `d1 × d2` into `p1 = i+j`, `p2 = i+j+1` |
| Output | skip leading zeros in `pos`, join the rest |

### Trace ("123" × "45")

```
  i  j  d1×d2  p1 p2   sum = mul + pos[p2]   pos[p2]   pos[p1] +=   pos after
  ─  ─  ─────  ── ──   ──────────────────    ───────   ──────────   ───────────────
  2  1  3×5=15  3  4   15 + 0 = 15             5         +1         [0, 0, 0, 1, 5]
  2  0  3×4=12  2  3   12 + 1 = 13             3         +1         [0, 0, 1, 3, 5]
  1  1  2×5=10  2  3   10 + 3 = 13             3         +1         [0, 0, 2, 3, 5]
  1  0  2×4=8   1  2    8 + 2 = 10             0         +1         [0, 1, 0, 3, 5]
  0  1  1×5=5   1  2    5 + 0 =  5             5         +0         [0, 1, 5, 3, 5]
  0  0  1×4=4   0  1    4 + 1 =  5             5         +0         [0, 5, 5, 3, 5]

  skip leading 0 → "5535"
  answer = "5535" ✅   (123 × 45 = 5535)
```

### Pseudocode

```
function multiply(num1, num2):
    if num1 == "0" or num2 == "0":
        return "0"
    m ← length(num1), n ← length(num2)
    pos ← array of m + n zeros
    for i from m-1 down to 0:
        for j from n-1 down to 0:
            mul ← digit(num1[i]) × digit(num2[j])
            p1 ← i + j
            p2 ← i + j + 1
            sum ← mul + pos[p2]
            pos[p2] ← sum % 10
            pos[p1] ← pos[p1] + sum / 10
    result ← ""
    for each value v in pos:
        if result is empty and v == 0: skip      // leading zeros
        append v to result
    return result
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Parse both to integers and multiply | — | ❌ overflow, and forbidden |
| School method: one partial product string per digit of num2, then add strings | O(m · n) | O(m · (m + n)) |
| **Position grid `pos[i+j]`, `pos[i+j+1]`** | **O(m · n)** | **O(m + n)** ✅ |
| Karatsuba / FFT (huge inputs only) | O(n^1.585) / O(n log n) | O(n) |

### 📌 Points to remember
- The product of an m-digit and an n-digit number has **at most m + n** digits.
- `i + j` and `i + j + 1` is the whole trick: it is where the column of the paper method lives.
- Handle `"0"` up front, otherwise stripping leading zeros leaves an empty string.
- Add `pos[p2]` **before** splitting into digit and carry.

---

## 5. Rotate Array (Medium)

### Problem
Rotate `nums` to the right by `k` steps, in place if possible. (`k` can be larger than n.)

### Visualize it

```
   nums = [ 1  2  3  4  5  6  7 ],  k = 3

   right by 1:  [ 7  1  2  3  4  5  6 ]
   right by 2:  [ 6  7  1  2  3  4  5 ]
   right by 3:  [ 5  6  7  1  2  3  4 ]  ✅

   Element at index i moves to index (i + k) % n.
   The last k elements jump to the front as a block.
```

### Key decision: which of three tools?

```
                      need to move every element by k
                                  │
          ┌───────────────────────┼─────────────────────────────┐
     extra space OK?       move one element at a time      flip blocks
          │                in place along its "cycle"            │
   copy into new[(i+k)%n]  CYCLIC REPLACEMENTS            TRIPLE REVERSAL
   O(n) time, O(n) space   O(n) time, O(1) space          O(n) time, O(1) space
                           (gcd(n, k) separate cycles)    (easiest to get right)

   First, ALWAYS:  k ← k mod n    (rotating by n does nothing)
```

### The steps (triple reversal)

| Step | Answer |
|------|--------|
| Normalize | `k = k mod n` |
| Reverse all | `reverse(0, n-1)` |
| Reverse front | `reverse(0, k-1)` (the k elements that belong in front) |
| Reverse back | `reverse(k, n-1)` |

### Trace 1: triple reversal (nums = [1, 2, 3, 4, 5, 6, 7], k = 3)

```
  step                 array
  ──────────────────   ─────────────────────────
  start                [1, 2, 3, 4, 5, 6, 7]
  reverse(0, 6)        [7, 6, 5, 4, 3, 2, 1]
  reverse(0, 2)        [5, 6, 7, 4, 3, 2, 1]
  reverse(3, 6)        [5, 6, 7, 1, 2, 3, 4]

  answer = [5, 6, 7, 1, 2, 3, 4] ✅
```

### Trace 2: extra array (same input)

```
  i         :   0   1   2   3   4   5   6
  nums[i]   :   1   2   3   4   5   6   7
  (i+3) % 7 :   3   4   5   6   0   1   2

  new       :  [5, 6, 7, 1, 2, 3, 4]  ✅  then copy back into nums
```

### Trace 3: cyclic replacements (nums = [1, 2, 3, 4, 5, 6], k = 2)

```
  n = 6, k = 2 → gcd = 2 → two cycles:  0 → 2 → 4 → 0  and  1 → 3 → 5 → 1

  cycle   carry   to idx   saved   array after              moved
  ─────   ─────   ──────   ─────   ──────────────────────   ─────
  start 0   1       2        3     [1, 2, 1, 4, 5, 6]         1
            3       4        5     [1, 2, 1, 4, 3, 6]         2
            5       0        1     [5, 2, 1, 4, 3, 6]         3   back at start → next cycle
  start 1   2       3        4     [5, 2, 1, 2, 3, 6]         4
            4       5        6     [5, 2, 1, 2, 3, 4]         5
            6       1        2     [5, 6, 1, 2, 3, 4]         6   moved == n → done

  answer = [5, 6, 1, 2, 3, 4] ✅
```

### Pseudocode

```
function rotateReverse(nums, k):
    n ← length(nums)
    k ← k mod n
    reverse(nums, 0, n-1)
    reverse(nums, 0, k-1)
    reverse(nums, k, n-1)

function reverse(nums, lo, hi):
    while lo < hi:
        swap nums[lo], nums[hi]
        lo ← lo + 1, hi ← hi - 1

function rotateExtra(nums, k):
    n ← length(nums)
    tmp ← array of n
    for i from 0 to n-1:
        tmp[(i + k) mod n] ← nums[i]
    copy tmp into nums

function rotateCyclic(nums, k):
    n ← length(nums)
    k ← k mod n
    moved ← 0
    start ← 0
    while moved < n:
        cur ← start
        carry ← nums[start]
        repeat:
            nxt ← (cur + k) mod n
            saved ← nums[nxt]
            nums[nxt] ← carry
            carry ← saved
            cur ← nxt
            moved ← moved + 1
        until cur == start
        start ← start + 1
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Rotate by one, k times | O(n · k) | O(1) |
| Extra array, `new[(i+k) % n] = nums[i]` | O(n) | O(n) |
| Cyclic replacements | O(n) | O(1) |
| **Triple reversal** | **O(n)** | **O(1)** ✅ simplest in-place |

### 📌 Points to remember
- `k = k mod n` first. With k = 10 and n = 7, rotate by 3.
- Rotate RIGHT: reverse all, then the first k, then the rest. (Rotate LEFT: first k, the rest, then all.)
- Cyclic replacements need a `moved` counter, because there may be several cycles (gcd(n, k) of them).
- Each element moves exactly once in the cyclic method and at most twice in the reversal method.

---

## 6. Valid Sudoku (Medium)

### Problem
Given a partially filled 9×9 board (`'.'` for empty), decide whether the filled cells are valid: no digit repeats in any row, any column, or any of the nine 3×3 boxes. (You do not have to check whether it is solvable.)

### Visualize it: every cell belongs to exactly one row, one column, one box

```
   box index = (r / 3) × 3 + (c / 3)        (integer division)

        c: 0 1 2   3 4 5   6 7 8
   r 0     0 0 0 │ 1 1 1 │ 2 2 2
     1     0 0 0 │ 1 1 1 │ 2 2 2
     2     0 0 0 │ 1 1 1 │ 2 2 2
           ──────┼───────┼──────
     3     3 3 3 │ 4 4 4 │ 5 5 5
     4     3 3 3 │ 4 4 4 │ 5 5 5
     5     3 3 3 │ 4 4 4 │ 5 5 5
           ──────┼───────┼──────
     6     6 6 6 │ 7 7 7 │ 8 8 8
     7     6 6 6 │ 7 7 7 │ 8 8 8
     8     6 6 6 │ 7 7 7 │ 8 8 8

   examples:  (2,5) → 0×3 + 1 = 1     (4,7) → 1×3 + 2 = 5     (8,8) → 2×3 + 2 = 8
   r / 3 picks the BAND (0, 1, 2), c / 3 picks the STACK (0, 1, 2).
```

### Key decision at each filled cell

```
                     cell (r, c) holds digit v
                               │
        ┌──────────────────────┼────────────────────────┐
   v in rows[r] ?        v in cols[c] ?          v in boxes[b] ?
        │                      │                        │
        └────────── any YES → return false ─────────────┘
                               │
                         all NO → add v to rows[r], cols[c], boxes[b]

   27 small sets (9 rows + 9 columns + 9 boxes). This is hashing as "seen before?".
```

### The steps

| Step | Answer |
|------|--------|
| Storage | `rows[9]`, `cols[9]`, `boxes[9]`, each a set (or a 9-bit mask) |
| Scan | every cell, skip `'.'` |
| Box | `b = (r / 3) × 3 + (c / 3)` |
| Check | duplicate in any of the three sets → false |
| End | no duplicate found → true |

### Trace (LeetCode example 2: top-left cell changed from 5 to 8)

```
   Top three rows of the board:
     r0:  8 3 . │ . 7 . │ . . .
     r1:  6 . . │ 1 9 5 │ . . .
     r2:  . 9 8 │ . . . │ . 6 .

  cell    v   box   rows[r] before   cols[c] before   boxes[b] before    result
  ─────   ─   ───   ──────────────   ──────────────   ────────────────   ──────
  (0,0)   8    0    {}               {}               {}                 add
  (0,1)   3    0    {8}              {}               {8}                add
  (0,4)   7    1    {8,3}            {}               {}                 add
  (1,0)   6    0    {}               {8}              {8,3}              add
  (1,3)   1    1    {6}              {}               {7}                add
  (1,4)   9    1    {6,1}            {7}              {7,1}              add
  (1,5)   5    1    {6,1,9}          {}               {7,1,9}            add
  (2,1)   9    0    {}               {3}              {8,3,6}            add
  (2,2)   8    0    {9}              {}               {8,3,6,9}          8 FOUND in box 0 ❌

  answer = false ✅   (two 8s in the top-left box)
```

### Pseudocode

```
function isValidSudoku(board):
    rows  ← 9 empty sets
    cols  ← 9 empty sets
    boxes ← 9 empty sets
    for r from 0 to 8:
        for c from 0 to 8:
            v ← board[r][c]
            if v == '.': continue
            b ← (r / 3) × 3 + (c / 3)
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return false
            add v to rows[r], cols[c], boxes[b]
    return true
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Three separate passes (all rows, all columns, all boxes) | O(81 × 3) | O(9) per pass |
| **One pass, 27 sets with the box formula** | **O(81) = O(1)** | **O(81) = O(1)** ✅ |
| One pass, 27 integers as bitmasks (`bit = 1 << v`) | O(1) | 27 ints, fastest in practice |

### 📌 Points to remember
- `(r / 3) × 3 + (c / 3)` uses **integer** division. `r / 3` alone is the band, not the box.
- Skip `'.'` cells; they never conflict.
- "Valid" is not "solvable": only check what is filled.

---

## 7. Detect Squares (Medium)

### Problem
Design a structure with:
- `add(point)`: add a point (duplicates allowed, each counts separately).
- `count(query)`: how many ways can you pick 3 stored points that form, together with `query`, an **axis-aligned square with positive area**?

### Visualize it: the diagonal point decides the whole square

```
        (px, qy) ●───────────● q = (qx, qy)     ← the query
                 │           │
                 │  side d   │
                 │           │
     p = (px, py)●───────────● (qx, py)

   Pick p as the point DIAGONALLY opposite q.
   Then the other two corners are FORCED: (px, qy) and (qx, py).

   p is a valid diagonal iff  |px − qx| == |py − qy|  and  px ≠ qx  (positive area).
```

### Key decision: for each stored point, is it a diagonal?

```
                    stored point p with count cnt[p]
                               │
           ┌───────────────────┴──────────────────────┐
   |px−qx| == |py−qy| and px ≠ qx ?               otherwise
           │                                          │
   ways += cnt[p] × cnt[(px, qy)] × cnt[(qx, py)]   skip
           ▲          ▲              ▲
       duplicates multiply: each copy is a different choice

   Hashing as counting: a missing corner has count 0, so the product is 0 automatically.
```

### The steps

| Step | Answer |
|------|--------|
| Storage | `cnt`: map from point to how many times it was added |
| add | `cnt[p] += 1` |
| count | loop over distinct stored points `p`, keep only diagonals of `q` |
| Combine | add `cnt[p] × cnt[(px, qy)] × cnt[(qx, py)]` |

### Trace (LeetCode example)

```
  add(3,10), add(11,2), add(3,2)      cnt = {(3,10):1, (11,2):1, (3,2):1}

  count(11,10):
    p        |px−qx|  |py−qy|  diagonal?   cnt[p] × cnt[(px,qy)] × cnt[(qx,py)]
    ──────   ───────  ───────  ─────────   ──────────────────────────────────────
    (3,10)      8        0      no (dy=0)
    (11,2)      0        8      no (dx=0)
    (3,2)       8        8      YES         cnt(3,2)=1 × cnt(3,10)=1 × cnt(11,2)=1 = 1
    → 1 ✅

  count(14,8):
    (3,10)     11        2      no
    (11,2)      3        6      no
    (3,2)      11        6      no
    → 0 ✅

  add(11,2)                           cnt = {(3,10):1, (11,2):2, (3,2):1}

  count(11,10):
    (3,2)       8        8      YES         1 × cnt(3,10)=1 × cnt(11,2)=2 = 2
    → 2 ✅   (either copy of (11,2) can be the bottom-right corner)

  outputs: 1, 0, 2 ✅
```

### Pseudocode

```
class DetectSquares:
    cnt ← empty map  (point → count)

    add(p):
        cnt[p] ← cnt[p] + 1

    count(q):
        (qx, qy) ← q
        ways ← 0
        for each distinct point (px, py) in cnt:
            if abs(px − qx) ≠ abs(py − qy) or px == qx:
                continue
            ways ← ways + cnt[(px, py)] × cnt[(px, qy)] × cnt[(qx, py)]   // missing → 0
        return ways
```

### Optimization ladder

| Approach | Time per `count` | Space |
|---|---|---|
| Try every triple of stored points | O(P³) | O(P) |
| Try every pair (side neighbor + diagonal) | O(P²) | O(P) |
| **Iterate distinct points as the diagonal, look up the other 2 corners** | **O(P)** | **O(P)** ✅ |
| Also index by x: only scan points in column `qx`, side `d = py − qy`, try the square to the left and to the right | O(points in that column) | O(P) |

### 📌 Points to remember
- **Fix the diagonal**, the other two corners follow. That is the formula-first step.
- Use **counts**, not a set: duplicates multiply the answer.
- `px ≠ qx` rules out zero-area "squares" (the query itself).
- Read missing keys as 0, never insert them by accident while reading.

---

## 8. 3Sum Closest (Medium)

### Problem
Given `nums` and `target`, choose three numbers whose sum is **closest** to `target` and return that sum. Exactly one answer exists.

> This is the "closest" cousin of 3Sum. The two-pointer engine is taught in depth in
> [01-Two-Pointer.md](01-Two-Pointer.md); here we focus on the "track the best difference" twist.

### Visualize it

```
   sorted nums:  [ -4 , -1 ,  1 ,  2 ]       target = 1
                    ▲     ▲          ▲
                    i     L          R

   Fix nums[i]. Then L and R squeeze toward each other:
      sum too SMALL → move L right (bigger number)
      sum too BIG   → move R left  (smaller number)
      sum == target → can't do better, return it
```

### Key decision at each (i, L, R)

```
                      sum = nums[i] + nums[L] + nums[R]
                                     │
                 if |sum − target| < |best − target|:  best ← sum
                                     │
           ┌─────────────────────────┼──────────────────────────┐
     sum < target              sum == target               sum > target
     L ← L + 1                 return sum (distance 0)     R ← R − 1
```

### The steps

| Step | Answer |
|------|--------|
| Sort | ascending, so pointer moves are monotone |
| Init | `best = nums[0] + nums[1] + nums[2]` (a real triple, never infinity) |
| Outer | `i` from 0 to n-3 |
| Inner | `L = i+1`, `R = n-1`, update best, move L or R |
| Answer | `best` |

### Trace (nums = [-1, 2, 1, -4], target = 1)

```
  sorted = [-4, -1, 1, 2],   best = -4 + -1 + 1 = -4   (distance 5)

  i   nums[i]   L   R   sum              |sum − 1|   best   move
  ─   ───────   ─   ─   ──────────────   ─────────   ────   ─────────────
  0     -4      1   3   -4 −1 +2 = -3        4        -3    sum < 1 → L++
  0     -4      2   3   -4 +1 +2 = -1        2        -1    sum < 1 → L++  (L = R, stop)
  1     -1      2   3   -1 +1 +2 =  2        1         2    sum > 1 → R--  (L = R, stop)

  answer = 2 ✅   (-1 + 1 + 2)
```

### Pseudocode

```
function threeSumClosest(nums, target):
    sort nums
    best ← nums[0] + nums[1] + nums[2]
    for i from 0 to n-3:
        L ← i + 1
        R ← n − 1
        while L < R:
            sum ← nums[i] + nums[L] + nums[R]
            if abs(sum − target) < abs(best − target):
                best ← sum
            if sum < target:
                L ← L + 1
            else if sum > target:
                R ← R − 1
            else:
                return sum              // exact hit, distance 0
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Three nested loops over all triples | O(n³) | O(1) |
| Sort, fix two numbers, binary search for the third | O(n² log n) | O(1) |
| **Sort, fix one, two pointers for the other two** | **O(n²)** | **O(1)** (plus sort) ✅ |

### 📌 Points to remember
- Initialize `best` with a **real** triple sum. Starting from "infinity" invites overflow when you compute `|best − target|`.
- Exact hit → return immediately.
- Skipping duplicate `nums[i]` is optional here (it only saves time; it does not change the answer).
- Same engine as 3Sum: see [01-Two-Pointer.md](01-Two-Pointer.md).

---

## 9. Factor Combinations (Medium)

### Problem
(LeetCode #254, premium.) Given `n`, return **all combinations of factors** of `n`.

**Convention used here:** each combination is a list of integers in **[2, n−1]** whose **product is n**, written in **non-decreasing** order, so each multiset appears once. `n` itself (the list `[n]`) is not included. `n = 1` or a prime `n` gives `[]`.

```
   n = 12  →  [ [2, 6], [2, 2, 3], [3, 4] ]
   n = 37  →  [ ]          (prime)
   n = 1   →  [ ]
```

### Visualize it: a factor tree

```
                          12
              ┌───────────┴───────────┐
          f = 2 (rest 6)          f = 3 (rest 4)
          record [2, 6]           record [3, 4]
              │                        │
          f = 2 (rest 3)           f ≥ 3 and 3×3 > 4
          record [2, 2, 3]          → stop
              │
          f ≥ 2 and 2×2 > 3 → stop

   Each edge "pick f, recurse on n / f with factors ≥ f".
```

### Key decision: which next factors are allowed?

```
       dfs(remaining, start, path)
                     │
       for f = start, start+1, ... while f × f ≤ remaining:
                     │
          ┌──────────┴────────────┐
   remaining % f ≠ 0          remaining % f == 0
       skip                       │
                     ┌────────────┴─────────────────┐
           RECORD path + [f, remaining / f]    RECURSE dfs(remaining / f, f, path + [f])
           (stop splitting here)               (keep splitting the rest)

   f ≥ start          → non-decreasing → no duplicates like [6, 2]
   f × f ≤ remaining  → the partner remaining / f is ≥ f, so the record is non-decreasing too
```

### The steps

| Step | Answer |
|------|--------|
| Choice | the next factor `f`, from `start` up to `√remaining` |
| Record | every time `f` divides: `path + [f, remaining / f]` |
| Recurse | on `remaining / f`, with `start = f` |
| Base | the loop simply runs out (no explicit base case needed) |

### Trace (n = 12)

```
  call                      f    f×f ≤ rem?   rem % f   action
  ───────────────────────   ─    ──────────   ───────   ───────────────────────────────
  dfs(12, 2, [])            2    4 ≤ 12 ✓       0       record [2, 6];  dfs(6, 2, [2])
    dfs(6, 2, [2])          2    4 ≤ 6  ✓       0       record [2, 2, 3]; dfs(3, 2, [2,2])
      dfs(3, 2, [2,2])      2    4 ≤ 3  ✗       —       loop ends
    dfs(6, 2, [2])          3    9 ≤ 6  ✗       —       loop ends
  dfs(12, 2, [])            3    9 ≤ 12 ✓       0       record [3, 4];  dfs(4, 3, [3])
    dfs(4, 3, [3])          3    9 ≤ 4  ✗       —       loop ends
  dfs(12, 2, [])            4   16 ≤ 12 ✗       —       loop ends

  answer = [ [2, 6], [2, 2, 3], [3, 4] ] ✅
```

> Bigger check: `n = 32` gives 6 lists: `[2,16] [2,2,8] [2,2,2,4] [2,2,2,2,2] [2,4,4] [4,8]`.

### Pseudocode

```
function getFactors(n):
    result ← empty list
    dfs(n, 2, [], result)
    return result

function dfs(remaining, start, path, result):
    f ← start
    while f × f ≤ remaining:
        if remaining % f == 0:
            add (path + [f, remaining / f]) to result
            dfs(remaining / f, f, path + [f], result)
        f ← f + 1
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every f in [2, n−1] at each level, generate in any order, dedupe by sorting each list | very slow, O(n) per level + dedupe | O(results) |
| Factors in non-decreasing order (`start` parameter), f up to n−1 | O(n) per call | O(log n) depth |
| **Non-decreasing + stop at f × f ≤ remaining** | **O(√n) per call**, output-sensitive overall | **O(log n)** depth ✅ |

> 💡 This is choice-based backtracking with a "start index" to avoid permutations of the same combination.
> See [../backtracking/01-Choice-Based-Backtracking.md](../backtracking/01-Choice-Based-Backtracking.md).

### 📌 Points to remember
- **Non-decreasing** (`f ≥ start`) is what kills duplicates like `[2, 6]` vs `[6, 2]`.
- **`f × f ≤ remaining`** guarantees the partner `remaining / f ≥ f`, so the recorded list stays sorted.
- The recursion depth is at most log₂ n (every factor is at least 2).
- Use `f × f ≤ remaining` (or `f ≤ remaining / f` to dodge overflow), not a floating-point square root.

---

## 10. Maximum Binary Tree (Medium)

### Problem
Given an array of **distinct** integers, build a tree: the root is the maximum element, the left subtree is built (the same way) from the part to the left of it, and the right subtree from the part to the right of it.

### Visualize it

```
   nums = [ 3 , 2 , 1 , 6 , 0 , 5 ]
                        ▲ max
            └ left ─┘       └right┘

                     6
                  ┌──┴──┐
                  3     5
                   └┐  ┌┘
                    2  0
                     └┐
                      1

   Every node = the max of its own range; the index split decides left vs right.
```

### Key decision: two ways to see the parent of x

```
   RECURSION view:  split at the max, recurse on both sides.

   STACK view (left → right):  keep a DECREASING stack.
                     new value x arrives
                            │
        pop everything SMALLER than x  ──► the LAST popped node becomes x.left
                            │                (it is the max of the run just left of x)
        if the stack is not empty      ──► top.right = x
                            │                (x is the newest thing to the right of a bigger value)
                        push x

   When done, the BOTTOM of the stack is the root (the global max).
```

### The steps

| Step | Recursion | Monotonic stack |
|------|-----------|-----------------|
| Range | `build(lo, hi)` | the whole array, one pass |
| Pick | index of max in `lo..hi` | pop smaller values |
| Link | `left = build(lo, m−1)`, `right = build(m+1, hi)` | `x.left = lastPopped`, `top.right = x` |
| Root | the max of the whole array | bottom of the stack |

### Trace 1: recursion (nums = [3, 2, 1, 6, 0, 5])

```
  call            max (index)   left call       right call
  ─────────────   ───────────   ─────────────   ─────────────
  build(0, 5)       6  (3)      build(0, 2)     build(4, 5)
  build(0, 2)       3  (0)      build(0, −1)    build(1, 2)
  build(1, 2)       2  (1)      build(1, 0)     build(2, 2)
  build(2, 2)       1  (2)      empty           empty
  build(4, 5)       5  (5)      build(4, 4)     build(6, 5)
  build(4, 4)       0  (4)      empty           empty

  root 6: left 3 (right 2 (right 1)), right 5 (left 0)  ✅
```

### Trace 2: monotonic stack (same input)

```
  x   popped (smaller than x)   x.left   top.right = x        stack after
  ─   ───────────────────────   ──────   ──────────────────   ───────────
  3   —                          null    (stack empty)        [3]
  2   —                          null    3.right = 2          [3, 2]
  1   —                          null    2.right = 1          [3, 2, 1]
  6   1, 2, 3                    3       (stack empty)        [6]
  0   —                          null    6.right = 0          [6, 0]
  5   0                          0       6.right = 5          [6, 5]
                                         (overwrites 0)

  root = bottom = 6
  6.left = 3, 3.right = 2, 2.right = 1, 6.right = 5, 5.left = 0  ✅  same tree
```

### Pseudocode

```
// Recursion
function construct(nums):
    return build(nums, 0, n−1)

function build(nums, lo, hi):
    if lo > hi: return null
    m ← index of the maximum in nums[lo..hi]
    node ← new Node(nums[m])
    node.left  ← build(nums, lo, m − 1)
    node.right ← build(nums, m + 1, hi)
    return node

// Monotonic decreasing stack, O(n)
function constructStack(nums):
    stack ← empty
    for each x in nums:
        node ← new Node(x)
        last ← null
        while stack not empty and top(stack).val < x:
            last ← pop(stack)
        node.left ← last
        if stack not empty:
            top(stack).right ← node
        push node
    return bottom of stack          // first element
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| **Recursion, linear scan for the max** | **O(n²)** worst (sorted input), O(n log n) average | O(n) recursion |
| Recursion with a sparse table / segment tree for range max | O(n log n) | O(n log n) / O(n) |
| **Monotonic decreasing stack** | **O(n)** | **O(n)** ✅ |

> 💡 The stack version is the classic "nearest greater to the left/right" idea.
> See [../stack/01-Monotonic-Stack.md](../stack/01-Monotonic-Stack.md).

### 📌 Points to remember
- Parent of x = the **smaller** of (nearest greater on the left, nearest greater on the right).
- Stack: last popped → `x.left`; remaining top → `top.right = x` (later values may overwrite it, that is correct).
- Each element is pushed once and popped once → O(n).
- Distinct values make the max unique; no tie-breaking needed.

---

## 11. Master Cheat Sheet

### All 10 problems at a glance

```
┌──────────────────────┬──────────────────────────────────────────┬────────────────────────────┬──────────────┬──────────┐
│ Problem              │ Core trick                               │ Edge case                  │ Time         │ Space    │
├──────────────────────┼──────────────────────────────────────────┼────────────────────────────┼──────────────┼──────────┤
│ Plus One             │ carry right→left, return when < 9        │ all 9s → length n+1        │ O(n)         │ O(1)     │
│ Reverse Integer      │ peel % 10, guard before × 10             │ 32-bit overflow → 0        │ O(log x)     │ O(1)     │
│ Happy Number         │ next = Σ d²; set or Floyd                │ 1 is a fixed point         │ O(log n)     │ O(1)     │
│ Multiply Strings     │ pos[i+j], pos[i+j+1] grid                │ "0", leading zeros         │ O(m·n)       │ O(m+n)   │
│ Rotate Array         │ reverse all, first k, rest               │ k mod n, k = 0             │ O(n)         │ O(1)     │
│ Valid Sudoku         │ 27 sets, box = (r/3)·3 + c/3             │ skip '.'                   │ O(81)        │ O(81)    │
│ Detect Squares       │ count map, fix the diagonal point        │ duplicates, zero area      │ O(P) / count │ O(P)     │
│ 3Sum Closest         │ sort + fix i + two pointers, track best  │ init best with real triple │ O(n²)        │ O(1)     │
│ Factor Combinations  │ dfs(rem, start), f·f ≤ rem               │ n = 1, prime n → []        │ output-sens. │ O(log n) │
│ Maximum Binary Tree  │ decreasing stack; last pop = left        │ sorted input (O(n²) rec.)  │ O(n)         │ O(n)     │
└──────────────────────┴──────────────────────────────────────────┴────────────────────────────┴──────────────┴──────────┘
```

### Family tree

```
                               MATH DRILLS
                                    │
     ┌──────────────┬───────────────┼────────────────┬──────────────────────┐
     │              │               │                │                      │
  DIGIT WORK    INDEX MATH      HASH COUNTING     FORMULA + TOOL      CYCLE DETECTION
  (% 10, / 10,  (% n, r/3)      (seen / tally)                        (finite states)
   carry)           │               │                │                      │
     │          ├ Rotate Array  ├ Valid Sudoku   ├ 3Sum Closest          └ Happy Number
  ├ Plus One    └ Valid Sudoku  └ Detect Squares │  (two pointers)          (set / Floyd)
  ├ Reverse       (box index)                    ├ Factor Combinations
  │  Integer                                     │  (backtracking)
  ├ Happy Number                                 └ Maximum Binary Tree
  └ Multiply                                        (monotonic stack)
     Strings
```

### Recognition checklist

```
  ☐ Input is a number / digit array / digit string?      → digit loop, think about carry
  ☐ "Reverse" or "no 64-bit allowed"?                    → guard BEFORE rev × 10 + d
  ☐ "Repeat a process, does it end?"                     → cycle detection (set or Floyd)
  ☐ Multiply / add big numbers as strings?               → column grid pos[i+j(+1)]
  ☐ "Shift / rotate by k", circular?                     → (i + k) % n, or triple reversal
  ☐ Fixed grid with blocks?                              → index formula (r/3)·3 + c/3
  ☐ "How many shapes / ways from stored points"?         → count map, fix one anchor point
  ☐ "Closest sum of 3"?                                  → sort + two pointers, track best
  ☐ "All ways to write n as a product"?                  → dfs with start, f·f ≤ rem
  ☐ "Root = max, split left/right"?                      → monotonic decreasing stack
```

### 🚩 Common bugs to avoid

```
  ✗ Converting a digit array/string to a built-in int (overflow)
  ✗ Checking overflow AFTER rev × 10 + d (the damage is done)
  ✗ Using abs(INT_MIN) (does not fit in 32 bits)
  ✗ Forgetting that −7 % 10 differs between languages
  ✗ Plus One: not growing the array for all 9s
  ✗ Multiply Strings: returning "" for a zero product, or keeping leading zeros
  ✗ Rotate: forgetting k mod n; cyclic version without a moved counter
  ✗ Sudoku: box = r/3 + c/3 (wrong!) instead of (r/3)·3 + c/3
  ✗ Detect Squares: using a set (loses duplicates) or counting zero-area squares
  ✗ 3Sum Closest: best = infinity, then |best − target| overflows
  ✗ Factor Combinations: allowing f < start (duplicates) or including [n] itself
  ✗ Max Binary Tree: linking popped nodes as RIGHT children instead of x.left
  ✗ Floyd: starting slow == fast, so the loop exits before it starts
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "What is the FORMULA that moves me one step (one digit,     ║
   ║   one index, one factor), and which EDGE breaks it:          ║
   ║   overflow, zero, a negative sign, or all 9s?"               ║
   ╚══════════════════════════════════════════════════════════════╝
      Write the formula first, then walk the edge checklist before you trust it.
```

---

### ✅ Progress tracker

- [ ] Plus One (Easy)
- [ ] Reverse Integer (Medium)
- [ ] Happy Number (Easy)
- [ ] Multiply Strings (Medium)
- [ ] Rotate Array (Medium)
- [ ] Valid Sudoku (Medium)
- [ ] Detect Squares (Medium)
- [ ] 3Sum Closest (Medium)
- [ ] Factor Combinations (Medium)
- [ ] Maximum Binary Tree (Medium)
