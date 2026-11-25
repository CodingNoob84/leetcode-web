# Stack + Greedy: A Visual Guide

> **Goal:** Learn to build the **smallest / largest** string or number by removing characters,
> using a stack as a "regret buffer" plus a greedy rule for when you may still change your mind.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-Monotonic-Stack.md](01-Monotonic-Stack.md) and the greedy guides in [../greedy/](../greedy/).

---

## Table of Contents

0. [The Big Idea: Stack + Greedy](#0-the-big-idea-stack--greedy)
1. [Remove K Digits (Medium)](#1-remove-k-digits-medium)
2. [Remove Duplicate Letters (Medium)](#2-remove-duplicate-letters-medium)
3. [Smallest Subsequence of Distinct Characters (Medium)](#3-smallest-subsequence-of-distinct-characters-medium)
4. [Minimum Remove to Make Valid Parentheses (Medium)](#4-minimum-remove-to-make-valid-parentheses-medium)
5. [Create Maximum Number (Hard)](#5-create-maximum-number-hard)
6. [Master Cheat Sheet](#6-master-cheat-sheet)

> **Suggested order:** Remove K Digits → Remove Duplicate Letters → Smallest Subsequence of
> Distinct Characters → Minimum Remove to Make Valid Parentheses → Create Maximum Number.
> The first three share one template. The fourth uses the stack for matching instead of ordering.
> The last one combines the template with merging.

---

## 0. The Big Idea: Stack + Greedy

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "STACK + GREEDY"                        │
├──────────────────────────────────────────────────────────────────┤
│  • "SMALLEST / LARGEST possible number or string"                │
│  • "REMOVE k digits / characters"                                │
│  • "Lexicographically smallest SUBSEQUENCE"                      │
│  • "Each letter exactly once" + "smallest order"                 │
│  • "Remove the MINIMUM number of brackets to make it valid"      │
│  • Relative ORDER must be kept (subsequence, not rearrangement)  │
└──────────────────────────────────────────────────────────────────┘
```

### The key insight: the LEFT-most digit matters most

```
   Compare two numbers of the same length, left to right:

        1 2 9 9 9
        1 3 0 0 0
          ▲
          first difference decides everything:  2 < 3  →  12999 < 13000

   ┌──────────────────────────────────────────────────────────────┐
   │ To make a result SMALL, make its EARLY positions as small as │
   │ possible, even if that makes later positions bigger.         │
   └──────────────────────────────────────────────────────────────┘
```

### So when a smaller character arrives, regret the bigger ones before it

```
   building:   [ 1, 4 ]          next char: 3

   "4 sits before 3, and 4 > 3. If I'm allowed to delete 4,
    the result gets smaller at an EARLIER position."

        [ 1, 4 ]  ──pop 4──►  [ 1 ]  ──push 3──►  [ 1, 3 ]

   Keep doing this → the stack stays (mostly) INCREASING
   → a monotonic increasing stack (see 01-Monotonic-Stack.md)
```

### The "may I still pop?" budget: the only thing that changes between problems

```
   while stack not empty
     and top > current           ← popping makes the result better
     and I_AM_ALLOWED_TO_POP     ← THE BUDGET
   do pop

   ┌────────────────────────────────┬─────────────────────────────────────┐
   │ Problem                        │ "Allowed to pop" means...           │
   ├────────────────────────────────┼─────────────────────────────────────┤
   │ Remove K Digits                │ k > 0 (still have deletions left)   │
   │ Remove Duplicate Letters       │ top appears AGAIN later in string   │
   │ Smallest Subseq. of Distinct   │ (same as above)                     │
   │ Create Maximum Number          │ drops left > 0 (and pop if top < x) │
   └────────────────────────────────┴─────────────────────────────────────┘
```

### Why greedy is safe here (exchange argument in one picture)

```
   Final answer:   ... a  b ...        with a > b, and a could have been removed
   Swap choice:    ...    b ...        (remove a instead of something later)

   The second one is smaller at the EARLIEST differing position,
   so any answer that keeps a "removable bigger-before-smaller" pair
   can be improved → the optimal answer never has one → greedy pops are correct.
```

### The template

```
function greedyStack(s, canPop):
    stack ← empty
    for each char x in s:
        (optional) if x should be skipped: continue
        while stack not empty and top(stack) > x and canPop(top):
            pop (and update the budget)
        push x
    (optional) clean up leftovers
    return stack read bottom → top
```

> 💡 For the **largest** result, flip the comparison: pop while `top < x`.

---

## 1. Remove K Digits (Medium)

### Problem
Given a number as a string `num` and an integer `k`, remove exactly `k` digits so the remaining number is as **small** as possible.

### Visualize it

```
   num = "1432219",  k = 3

   index:  0  1  2  3  4  5  6
   digit:  1  4  3  2  2  1  9
              ✗  ✗     ✗          remove 4, 3, and the 2 at index 4
   keep:   1        2     1  9

   Answer: "1219"
```

### The decision at each digit

```
              new digit d arrives
                     │
        ┌────────────┴─────────────┐
   top > d and k > 0           otherwise
        │                          │
   pop top, k ← k−1           push d
   (repeat check)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | Stack = best prefix so far (increasing as much as budget allows) |
| Transition | pop while `top > d` and `k > 0`; then push `d` |
| Base | empty stack, budget `k` |
| Cleanup | if `k` is still > 0, remove `k` digits from the **end** |
| Answer | strip leading zeros; if empty → `"0"` |

### Trace (`"1432219"`, k = 3)

```
  digit │ action                         │ stack (bottom → top) │ k
  ──────┼────────────────────────────────┼──────────────────────┼───
    1   │ push                           │ [1]                  │ 3
    4   │ 4 > 1, push                    │ [1, 4]               │ 3
    3   │ 4 > 3 → pop 4 ; push 3         │ [1, 3]               │ 2
    2   │ 3 > 2 → pop 3 ; push 2         │ [1, 2]               │ 1
    2   │ 2 = 2, not >, push             │ [1, 2, 2]            │ 1
    1   │ 2 > 1 → pop 2 (k=0) ; push 1   │ [1, 2, 1]            │ 0
    9   │ k = 0, push                    │ [1, 2, 1, 9]         │ 0

  result = "1219"  ✅
```

Stack pictures at key moments:

```
   after "143":        after "1432":       after "14322":      after "1432219":
     │ 3 │               │ 2 │               │ 2 │               │ 9 │
     │ 1 │               │ 1 │               │ 2 │               │ 1 │
     └───┘               └───┘               │ 1 │               │ 2 │
                                             └───┘               │ 1 │
                                                                 └───┘
```

### Trace (`"10200"`, k = 1): the leading-zero case

```
  digit │ action                   │ stack         │ k
  ──────┼──────────────────────────┼───────────────┼───
    1   │ push                     │ [1]           │ 1
    0   │ 1 > 0 → pop 1 ; push 0   │ [0]           │ 0
    2   │ push                     │ [0, 2]        │ 0
    0   │ push                     │ [0, 2, 0]     │ 0
    0   │ push                     │ [0, 2, 0, 0]  │ 0

  raw = "0200"  →  strip leading zeros  →  "200"  ✅
```

### The two cleanup traps ⚠️

```
  TRAP 1: budget left over (digits already increasing)
     num = "12345", k = 2  →  stack = [1,2,3,4,5], k still 2
     → drop from the END (biggest digits are at the end)  →  "123"

  TRAP 2: everything removed or only zeros
     num = "10", k = 2  →  "" → return "0"
     num = "9",  k = 1  →  "" → return "0"
```

### Pseudocode

```
function removeKdigits(num, k):
    stack ← empty
    for each digit d in num:
        while stack not empty and top(stack) > d and k > 0:
            pop stack
            k ← k − 1
        push d
    while k > 0:                 // leftover budget → cut from the end
        pop stack
        k ← k − 1
    result ← stack (bottom → top) with leading zeros removed
    if result is empty: return "0"
    return result
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Try every way to remove k digits | O(C(n, k)) | — |
| Repeat k times: remove the first "peak" digit | O(n·k) | O(n) |
| **Monotonic stack** | **O(n)** (each digit pushed/popped once) | O(n) |

### 📌 Points to remember
- Pop only while `top > d`. Equal digits stay (popping them gains nothing).
- Leftover `k` → remove from the **end**.
- Strip leading zeros **after** building, and return `"0"` for empty.

---

## 2. Remove Duplicate Letters (Medium)

### Problem
Remove duplicate letters so every letter appears **exactly once**, and the result is the
**lexicographically smallest** possible (keeping original relative order).

### Visualize it

```
   s = "c b a c d c b c"
        0 1 2 3 4 5 6 7

   Letters present: a, b, c, d  → each must appear exactly once.
   Best answer: "acdb"
```

### Two new rules compared to Remove K Digits

```
   RULE 1: Already in the stack?  → SKIP it.
           (It's already placed at a better or equal position.)

   RULE 2: Pop budget = "will the top letter appear AGAIN later?"
           If yes → safe to remove it now and pick it up later.
           If no  → this is its LAST chance. Must keep it.

            top = 'd', current = 'b', but 'd' never appears again
            → popping 'd' would lose it forever ✗
```

### The decision at each character

```
                      char x at index i
                             │
              ┌──────────────┴──────────────┐
        x already in stack?              not in stack
              │                              │
            skip           while top > x AND lastIndex[top] > i:
                                pop top, mark it "not in stack"
                           push x, mark it "in stack"
```

### The 5 steps

| Step | Answer |
|------|--------|
| Precompute | `last[ch]` = last index where `ch` appears |
| State | stack of chosen letters + `inStack` set |
| Transition | skip if in stack; else pop while `top > x` and `last[top] > i`; push `x` |
| Base | empty stack |
| Answer | stack read bottom → top |

### Trace (`"cbacdcbc"`)

```
   last occurrence:   a → 2,  b → 6,  c → 7,  d → 4

  i │ x │ action                                         │ stack
  ──┼───┼────────────────────────────────────────────────┼───────────
  0 │ c │ push                                           │ [c]
  1 │ b │ c > b and last[c]=7 > 1 → pop c ; push b       │ [b]
  2 │ a │ b > a and last[b]=6 > 2 → pop b ; push a       │ [a]
  3 │ c │ a < c → push                                   │ [a, c]
  4 │ d │ c < d → push                                   │ [a, c, d]
  5 │ c │ c already in stack → skip                      │ [a, c, d]
  6 │ b │ d > b, but last[d]=4 < 6 → CAN'T pop ; push b  │ [a, c, d, b]
  7 │ c │ c already in stack → skip                      │ [a, c, d, b]

  result = "acdb"  ✅
```

The critical moment at i = 6:

```
     │ d │  ← d > b, I'd love to pop it...
     │ c │     ...but 'd' never appears after index 4.
     │ a │     Popping it would delete 'd' from the answer forever.
     └───┘     → keep d, push b on top.
```

### Pseudocode

```
function removeDuplicateLetters(s):
    last ← map: each char → its last index in s
    inStack ← empty set
    stack ← empty
    for i from 0 to length(s) − 1:
        x ← s[i]
        if x in inStack: continue
        while stack not empty and top(stack) > x and last[top(stack)] > i:
            remove top(stack) from inStack
            pop stack
        push x
        add x to inStack
    return stack (bottom → top) as a string
```

### Complexity

| | Time | Space |
|---|---|---|
| **Stack + last index** | **O(n)** | **O(1)** (at most 26 letters in stack/set) |

### 📌 Points to remember
- **Skip** letters already in the stack. Without this, you'd pop good letters for no reason.
- The budget is **"appears again later?"**, checked with `last[top] > i`.
- When you pop, remove the letter from `inStack` too, or it will be skipped later.

---

## 3. Smallest Subsequence of Distinct Characters (Medium)

### Problem
Return the lexicographically smallest **subsequence** of `s` that contains every distinct character exactly once.

> This is **exactly the same problem** as Remove Duplicate Letters (LeetCode 1081 = LeetCode 316).
> Same algorithm, same code. Reading the two problem statements side by side is good practice
> in spotting that two differently worded problems are identical.

### Side by side

```
   316 "Remove duplicate letters so every letter appears once,
        smallest lexicographic result."
   1081 "Smallest subsequence containing all distinct characters
        exactly once."

        Removing duplicates while keeping order  ==  choosing a subsequence
        "every letter once"                     ==  "all distinct chars once"
```

### Trace (`"bcabc"`)

```
   last occurrence:   a → 2,  b → 3,  c → 4

  i │ x │ action                                          │ stack
  ──┼───┼─────────────────────────────────────────────────┼──────────
  0 │ b │ push                                            │ [b]
  1 │ c │ b < c → push                                    │ [b, c]
  2 │ a │ c > a and last[c]=4 > 2 → pop c                 │ [b]
    │   │ b > a and last[b]=3 > 2 → pop b ; push a        │ [a]
  3 │ b │ a < b → push                                    │ [a, b]
  4 │ c │ b < c → push                                    │ [a, b, c]

  result = "abc"  ✅
```

The double pop at i = 2:

```
     │ c │  pop (c comes again at 4)
     │ b │  pop (b comes again at 3)        │ a │
     └───┘                           ──►    └───┘
```

### Pseudocode

Same as [Remove Duplicate Letters](#2-remove-duplicate-letters-medium).

### 📌 Points to remember
- Recognize duplicates of problems you already know. It saves real interview time.
- A **counter** variant also works: instead of `last[]`, keep `remaining[ch]` (how many are still ahead)
  and pop only if `remaining[top] > 0`.

---

## 4. Minimum Remove to Make Valid Parentheses (Medium)

### Problem
String `s` has letters, `(` and `)`. Remove the **minimum** number of parentheses so the result is valid. Return any valid result.

> Here the stack isn't keeping order **smallest**. It's matching brackets, and greedy
> says: **only remove what can never be matched.**

### Visualize it

```
   s = "lee(t(c)o)de)"
        0123456789...

        l e e ( t ( c ) o ) d e )
              │   └───┘   │     ✗  ← this ')' has no partner
              └───────────┘

   Remove index 12  →  "lee(t(c)o)de"
```

### Two kinds of bad brackets

```
   BAD ')'  — a closing bracket when NO '(' is waiting
              → detect immediately while scanning left → right

   BAD '('  — an opening bracket that NEVER gets closed
              → what's left in the stack at the end

   Stack stores INDICES of unmatched '(' (so we know what to delete).
```

### The decision at each character

```
              char at index i
                    │
     ┌──────────────┼───────────────────┐
    '('            ')'                letter
     │              │                   │
  push i      stack empty?            keep
              ├─ yes → mark i for removal
              └─ no  → pop (matched)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of indices of `(` not yet matched; `remove` set |
| Transition | `(` push index; `)` pop if possible else mark; letters ignored |
| Base | empty stack, empty remove set |
| Cleanup | every index still in the stack → add to remove set |
| Answer | build string skipping indices in remove set |

### Trace (`"lee(t(c)o)de)"`)

```
  i  │ ch │ action                 │ stack   │ remove
  ───┼────┼────────────────────────┼─────────┼────────
  0-2│ lee│ letters                │ []      │ {}
  3  │ (  │ push 3                 │ [3]     │ {}
  4  │ t  │ letter                 │ [3]     │ {}
  5  │ (  │ push 5                 │ [3, 5]  │ {}
  6  │ c  │ letter                 │ [3, 5]  │ {}
  7  │ )  │ pop 5 (matched)        │ [3]     │ {}
  8  │ o  │ letter                 │ [3]     │ {}
  9  │ )  │ pop 3 (matched)        │ []      │ {}
  10 │ d  │ letter                 │ []      │ {}
  11 │ e  │ letter                 │ []      │ {}
  12 │ )  │ stack empty → mark 12  │ []      │ {12}

  end: stack empty, nothing to add
  result = "lee(t(c)o)de"  ✅
```

### Trace (`"))(("`)

```
  i │ ch │ action                 │ stack    │ remove
  ──┼────┼────────────────────────┼──────────┼──────────
  0 │ )  │ stack empty → mark 0   │ []       │ {0}
  1 │ )  │ stack empty → mark 1   │ []       │ {0,1}
  2 │ (  │ push 2                 │ [2]      │ {0,1}
  3 │ (  │ push 3                 │ [2, 3]   │ {0,1}

  end: leftover [2, 3] → remove {0,1,2,3}
  result = ""  ✅
```

### Pseudocode

```
function minRemoveToMakeValid(s):
    stack ← empty            // indices of unmatched '('
    remove ← empty set
    for i from 0 to length(s) − 1:
        if s[i] == '(':
            push i
        else if s[i] == ')':
            if stack not empty: pop stack
            else: add i to remove
    add every index left in stack to remove
    return characters of s whose index is not in remove
```

> 💡 **O(1) extra space variant:** two passes. Left → right drop extra `)` using an `open` counter;
> then right → left drop extra `(` using a `close` counter.

### Complexity

| | Time | Space |
|---|---|---|
| **Index stack** | **O(n)** | O(n) |
| Two-pass counters | O(n) | O(n) for output, O(1) extra |

### 📌 Points to remember
- Store **indices**, not characters. You need to know *which* `(` to delete.
- Unmatched `)` are known immediately; unmatched `(` only at the end.
- Removing exactly these is minimal: each one has no possible partner.
- Related: Valid Parentheses, Minimum Add to Make Parentheses Valid (see 04-Parenthesis-and-Scoring.md).

---

## 5. Create Maximum Number (Hard)

### Problem
Given two digit arrays `nums1` (length m) and `nums2` (length n), build the **largest**
number of length `k` using digits from both. The relative order **within each array** must be kept.

### Visualize it

```
   nums1 = [3, 4, 6, 5]
   nums2 = [9, 1, 2, 5, 8, 3]
   k = 5

   Answer: [9, 8, 6, 5, 3]
             │  │  │  │  └── nums2
             │  │  │  └───── nums1
             │  │  └──────── nums1
             │  └─────────── nums2
             └────────────── nums2
```

### Break it into 3 simpler pieces

```
   ┌─────────────────────────────────────────────────────────────┐
   │ 1. SPLIT   take i digits from nums1, k − i from nums2       │
   │            (try every valid i)                              │
   │                                                             │
   │ 2. PICK    best i digits from nums1 keeping order           │
   │            best k−i digits from nums2 keeping order         │
   │            → "Remove K Digits" flipped to LARGEST           │
   │                                                             │
   │ 3. MERGE   interleave the two picks into the largest result │
   │            → compare REMAINING SUFFIXES, not just heads     │
   └─────────────────────────────────────────────────────────────┘

   answer = max over all i of merge(pick(nums1, i), pick(nums2, k−i))

   valid i:  max(0, k − n)  ≤  i  ≤  min(k, m)
```

### Piece 2: pick the largest subsequence of length t

```
   It's Remove K Digits with:
      • comparison flipped:  pop while top < x  (we want LARGE)
      • budget: drop = length − t  (how many digits we may throw away)
      • leftover budget → cut from the end (keep first t)

   pick([9,1,2,5,8,3], 3):   drop = 3

   x │ action                          │ stack      │ drop
   ──┼─────────────────────────────────┼────────────┼─────
   9 │ push                            │ [9]        │ 3
   1 │ push                            │ [9,1]      │ 3
   2 │ 1 < 2 → pop 1 ; push 2          │ [9,2]      │ 2
   5 │ 2 < 5 → pop 2 ; push 5          │ [9,5]      │ 1
   8 │ 5 < 8 → pop 5 ; push 8          │ [9,8]      │ 0
   3 │ drop = 0 → push                 │ [9,8,3]    │ 0
                                    → [9, 8, 3]  ✅
```

### Piece 3: merge, and why comparing just the HEADS is wrong ⚠️

```
   Normal case: heads differ → take the bigger head.

   TIE CASE:   a = [6, 7]      b = [6, 0, 4]      (k = 5)

     heads are both 6. Which 6 do I take first?

     Take from b first:  6(b) → then 6(a),7 vs 0,4 → 6, 7, 0, 4
                         result [6, 6, 7, 0, 4]   ✗

     Take from a first:  6(a) → then 7 vs 6 → 7 → then 6, 0, 4
                         result [6, 7, 6, 0, 4]   ✅  bigger!

   RULE: compare the whole remaining suffixes lexicographically:
         [6, 7] vs [6, 0, 4] → 6 = 6, then 7 > 0 → a is bigger → take from a.

   If one suffix is a prefix of the other, the LONGER one counts as bigger.
```

### Trace: every split (k = 5)

```
   valid i: max(0, 5−6) = 0  ...  min(5, 4) = 4

   i │ pick(nums1, i) │ pick(nums2, 5−i)  │ merged
   ──┼────────────────┼───────────────────┼──────────────────
   0 │ []             │ [9,2,5,8,3]       │ [9,2,5,8,3]
   1 │ [6]            │ [9,5,8,3]         │ [9,6,5,8,3]
   2 │ [6,5]          │ [9,8,3]           │ [9,8,6,5,3]   ← best
   3 │ [4,6,5]        │ [9,8]             │ [9,8,4,6,5]
   4 │ [3,4,6,5]      │ [9]               │ [9,3,4,6,5]

   max = [9, 8, 6, 5, 3]  ✅
```

Merge detail for i = 2:

```
   a = [6,5]   b = [9,8,3]
   compare [6,5] vs [9,8,3] → 9 bigger → take 9    result [9]
   compare [6,5] vs [8,3]   → 8 bigger → take 8    result [9,8]
   compare [6,5] vs [3]     → 6 bigger → take 6    result [9,8,6]
   compare [5]   vs [3]     → 5 bigger → take 5    result [9,8,6,5]
   a empty → take 3                                 result [9,8,6,5,3]
```

### Pseudocode

```
function maxNumber(nums1, nums2, k):
    best ← empty
    for i from max(0, k − len(nums2)) to min(k, len(nums1)):
        candidate ← merge( pick(nums1, i), pick(nums2, k − i) )
        if greater(candidate, 0, best, 0): best ← candidate
    return best

function pick(nums, t):                     // largest subsequence of length t
    drop  ← len(nums) − t
    stack ← empty
    for each x in nums:
        while stack not empty and top(stack) < x and drop > 0:
            pop stack
            drop ← drop − 1
        push x
    return first t elements of stack

function merge(a, b):
    result ← empty, i ← 0, j ← 0
    while i < len(a) or j < len(b):
        if greater(a, i, b, j): append a[i], i ← i + 1
        else:                   append b[j], j ← j + 1
    return result

function greater(a, i, b, j):               // is a[i..] > b[j..] ?
    while i < len(a) and j < len(b) and a[i] == b[j]:
        i ← i + 1, j ← j + 1
    return j == len(b) or (i < len(a) and a[i] > b[j])
```

### Complexity

| Part | Cost |
|---|---|
| Splits tried | up to k + 1 |
| `pick` for one split | O(m + n) |
| `merge` with suffix comparison | O(k²) worst case (usually much less) |
| **Total** | **O(k · (m + n + k²))** |

### 📌 Points to remember
- **Divide and conquer the idea:** split → pick → merge. Each piece is a problem you know.
- `pick` is Remove K Digits flipped to **largest**: pop while `top < x`.
- `merge` must compare **remaining suffixes** on ties. Comparing heads only is the classic bug.
- Restrict `i` to valid ranges, or `pick` gets asked for more digits than exist.

---

## 6. Master Cheat Sheet

### All 5 problems at a glance

```
┌──────────────────────────────┬───────────────────────────────────────────┬────────────┐
│ Problem                      │ Core rule                                 │ Time       │
├──────────────────────────────┼───────────────────────────────────────────┼────────────┤
│ Remove K Digits              │ pop while top > d and k > 0;              │ O(n)       │
│                              │ leftover k from end; strip zeros; "0"     │            │
│ Remove Duplicate Letters     │ skip if in stack; pop while top > x and   │ O(n)       │
│                              │ top appears later                         │            │
│ Smallest Subseq. Distinct    │ identical to Remove Duplicate Letters     │ O(n)       │
│ Min Remove Valid Parens      │ stack of '(' indices; mark lone ')';      │ O(n)       │
│                              │ leftover '(' removed                      │            │
│ Create Maximum Number        │ split i / k−i → pick largest (pop while   │ O(k(m+n+k²))│
│                              │ top < x) → merge by suffix comparison     │            │
└──────────────────────────────┴───────────────────────────────────────────┴────────────┘
```

### Pattern family tree

```
                          STACK + GREEDY
                                │
         ┌──────────────────────┼───────────────────────────┐
         │                      │                           │
   ORDER-OPTIMIZING        MATCHING / VALIDITY        COMPOSED
   (monotonic stack +      (stack of indices)         (pick + merge)
    pop budget)                 │                           │
         │                 └─ Min Remove to          └─ Create Maximum
   ├─ Remove K Digits         Make Valid Parens         Number
   │    budget = k
   ├─ Remove Duplicate Letters
   │    budget = "appears later"
   └─ Smallest Subsequence
        of Distinct Characters  (same as above)
```

### The budget card

```
   ┌──────────────────────┬────────────────────┬──────────────────────────┐
   │ Want                 │ Pop while          │ Budget                   │
   ├──────────────────────┼────────────────────┼──────────────────────────┤
   │ smallest, delete k   │ top > x            │ k > 0                    │
   │ smallest, each once  │ top > x            │ last[top] > i            │
   │ largest, keep t      │ top < x            │ drop = len − t > 0       │
   └──────────────────────┴────────────────────┴──────────────────────────┘
```

### Optimization checklist

```
  ☐ Need smallest/largest result keeping order?     → monotonic stack + budget
  ☐ Each element must appear exactly once?          → inStack set + last index
  ☐ Budget left at the end?                         → cut from the END
  ☐ Brackets to delete?                             → stack of INDICES
  ☐ Two sources to combine?                         → split, pick each, merge
  ☐ Merge with equal heads?                         → compare whole suffixes
```

### 🚩 Common bugs to avoid

```
  ✗ Remove K Digits: forgetting leftover k, leading zeros, or empty → "0"
  ✗ Remove K Digits: popping on EQUAL digits (wastes budget)
  ✗ Duplicate Letters: not skipping chars already in stack
  ✗ Duplicate Letters: forgetting to remove popped char from inStack
  ✗ Min Remove: pushing characters instead of indices
  ✗ Min Remove: forgetting the unmatched '(' left in the stack
  ✗ Create Max: merging by comparing heads only (tie bug)
  ✗ Create Max: i outside [max(0, k−n), min(k, m)]
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "Would removing the top make the result better at an    ║
   ║   EARLIER position, and am I still ALLOWED to remove it?"║
   ╚══════════════════════════════════════════════════════════╝
       The first half is the comparison. The second half is the budget.
```

---

### ✅ Progress tracker

- [ ] Remove K Digits (Medium)
- [ ] Remove Duplicate Letters (Medium)
- [ ] Smallest Subsequence of Distinct Characters (Medium)
- [ ] Minimum Remove to Make Valid Parentheses (Medium)
- [ ] Create Maximum Number (Hard)
