# Decision Tree / Sequence Generation: A Visual Guide

> **Goal:** Learn to build answers **one choice at a time**, draw the decision tree by hand,
> and know when the same subtree repeats so you can cache it.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Branch on Every Option](#0-the-big-idea-branch-on-every-option)
1. [Letter Combinations of a Phone Number (Medium)](#1-letter-combinations-of-a-phone-number-medium)
2. [Word Break II (Hard)](#2-word-break-ii-hard)
3. [All Possible Full Binary Trees (Medium)](#3-all-possible-full-binary-trees-medium)
4. [Expression Add Operators (Hard)](#4-expression-add-operators-hard)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Letter Combinations → Word Break II → All Possible Full Binary Trees → Expression Add Operators.
> Pure branching first, then branching with memo, then branching on tree shapes, then branching with running arithmetic.

---

## 0. The Big Idea: Branch on Every Option

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "DECISION TREE GENERATION"              │
├──────────────────────────────────────────────────────────────────┤
│  • "Return ALL possible ..." (strings, sentences, trees, exprs)  │
│  • The answer is BUILT step by step: char by char, word by word, │
│    operator by operator, subtree by subtree                      │
│  • Each step has a small, fixed menu of options                  │
│    (letters on a key, words in a dict, +  -  *, left-size)       │
│  • Input is small (n ≤ 10–20) because the OUTPUT can be huge     │
└──────────────────────────────────────────────────────────────────┘
```

### The picture: one level per decision

```
                         start  (empty answer)
                 ┌─────────┼─────────┐
              option A  option B  option C        ← decision #1
             ┌──┴──┐    ┌──┴──┐   ┌──┴──┐
             A1   A2    B1   B2   C1   C2         ← decision #2
             ...                                     ...
             ▼
          LEAF = one complete answer → add to results

   Every ROOT-TO-LEAF path = one answer.
   Depth of the tree = number of decisions.
   Width at each level = number of options.
```

### Building a string by position

```
  position:    0     1     2     3
             ┌─────┬─────┬─────┬─────┐
  path:      │  c  │  a  │  _  │  _  │     ← fill slot 2 next
             └─────┴─────┴─────┴─────┘
                          ▲
                   try every option here,
                   recurse to slot 3,
                   UNDO (pop) before trying the next option
```

### The universal template

```
function generate(state, path):
    if state is complete:
        add copy of path to results
        return
    for each option allowed at this state:
        if option is invalid: continue          // prune early
        apply option to path                    // choose
        generate(next state, path)              // explore
        undo option                             // un-choose
```

### When subtrees REPEAT → memoize (backtracking meets DP)

```
   Word Break II on "catsanddog":

            start=0
           /       \
       "cat"       "cats"
         │            │
      start=3      start=4
         │            │
      "sand"        "and"
         │            │
      start=7 ◄──── start=7      ← SAME subproblem reached twice!
       "dog"         "dog"

   If solve(start) depends ONLY on start (not on the path so far),
   cache its RESULT LIST:   memo[start] = all sentences of s[start..]
```

> 💡 Rule: **if the future depends only on "where I am", not "how I got here",**
> return results instead of pushing to a global path, and cache them.
> That is exactly the DP idea from [03-DP-on-Strings.md](../dynammic%20programming/03-DP-on-Strings.md).

### Complexity is bounded by the OUTPUT

```
   You cannot do better than "size of the answer".
   If there are 3^n strings of length n, writing them out is already O(n · 3^n).

   ┌─────────────────────────────────────────┐
   │ time ≈ (number of leaves) × (cost per   │
   │        leaf to copy/build the answer)   │
   └─────────────────────────────────────────┘
   Pruning and memo help with the wasted branches,
   not with the answers you must print.
```

---

## 1. Letter Combinations of a Phone Number (Medium)

### Problem
Given a string of digits `2–9`, return all letter strings the number could spell on a phone keypad.

### Visualize it

```
   ┌───────┬───────┬───────┐
   │   1   │   2   │   3   │
   │       │  abc  │  def  │
   ├───────┼───────┼───────┤
   │   4   │   5   │   6   │
   │  ghi  │  jkl  │  mno  │
   ├───────┼───────┼───────┤
   │   7   │   8   │   9   │
   │ pqrs  │  tuv  │ wxyz  │
   └───────┴───────┴───────┘

   Each digit = one position in the answer.
   Each letter on that key = one option for that position.
```

### The decision tree for "23"

```
                          ""
              ┌───────────┼───────────┐
   digit '2': a           b           c
           ┌──┼──┐     ┌──┼──┐     ┌──┼──┐
   digit '3': d  e  f   d  e  f     d  e  f
           │  │  │     │  │  │     │  │  │
          ad ae af    bd be bf    cd ce cf     → 9 results ✅

   3 options × 3 options = 9 leaves
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `index` = which digit we are filling next |
| Options | every letter on the key for `digits[index]` |
| Base | `index == length(digits)` → record the path |
| Undo | pop the last letter |
| Edge | empty input → return `[]` (not `[""]`) |

### Trace ("23")

```
  call                    path    action
  ─────────────────────   ─────   ──────────────────────
  gen(0)                  ""      try 'a','b','c'
    gen(1)                "a"     try 'd','e','f'
      gen(2)              "ad"    complete → record "ad"
      gen(2)              "ae"    complete → record "ae"
      gen(2)              "af"    complete → record "af"
    gen(1)                "b"     → "bd","be","bf"
    gen(1)                "c"     → "cd","ce","cf"

  results = [ad, ae, af, bd, be, bf, cd, ce, cf]   (9) ✅
```

### Pseudocode

```
KEYS ← {2:"abc", 3:"def", 4:"ghi", 5:"jkl", 6:"mno", 7:"pqrs", 8:"tuv", 9:"wxyz"}

function letterCombinations(digits):
    if digits is empty: return []
    results ← []
    gen(0, "")
    return results

function gen(index, path):
    if index == length(digits):
        add path to results
        return
    for each letter in KEYS[digits[index]]:
        path.push(letter)
        gen(index + 1, path)
        path.pop()
```

### Alternative: iterative "grow the list"

```
  start:      [""]
  digit '2':  ["a", "b", "c"]                         each old × each letter
  digit '3':  ["ad","ae","af","bd","be","bf","cd","ce","cf"]
```

### Complexity

| Measure | Value |
|---|---|
| Leaves | up to 4ⁿ (keys 7 and 9 have 4 letters) |
| Time | O(n · 4ⁿ): each leaf copies a string of length n |
| Space | O(n) recursion depth, plus the output |

### 📌 Points to remember
- **One digit = one level.** Number of results = product of key sizes.
- Empty input → `[]`. This is the most common wrong answer.
- No pruning is possible: every leaf is a valid answer.

---

## 2. Word Break II (Hard)

### Problem
Given a string `s` and a dictionary, add spaces to make sentences where every word is in the dictionary.
Return **all** such sentences.

### Visualize it

```
   s    = "catsanddog"
   dict = { cat, cats, and, sand, dog }

   c a t s a n d d o g
   └─┬─┘ └──┬──┘ └─┬─┘        "cat sand dog"
   └──┬──┘ └─┬─┘ └─┬─┘        "cats and dog"
```

### The decision at each position: which word comes next?

```
   At position start, try EVERY end:

       s[start .. end-1]  in dict?
          │
          ├── yes → word + (all sentences of s[end ..])
          └── no  → skip this end

   The menu of options = every dictionary word that is a PREFIX of s[start..].
```

### Decision tree for "catsanddog"

```
                        start=0  "catsanddog"
                   ┌────────────┴─────────────┐
                "cat"                       "cats"
                   │                           │
             start=3 "sanddog"           start=4 "anddog"
                   │                           │
                "sand"                       "and"
                   │                           │
             start=7 "dog"  ◄──── same ────  start=7 "dog"
                   │                           │
                "dog"                        "dog"
                   │                           │
             start=10 (end) ✅            start=10 (end) ✅

   results = ["cat sand dog", "cats and dog"]  ✅
```

### Memo: return lists, cache by `start`

```
  memo[10] = [""]                      (empty tail: one way, no words)
  memo[7]  = ["dog"]
  memo[4]  = ["and dog"]
  memo[3]  = ["sand dog"]
  memo[0]  = ["cat sand dog", "cats and dog"]

  Each start is solved ONCE; later visits reuse the list.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `start` = index where the next word must begin |
| Options | every `end` such that `s[start..end-1]` is in the dictionary |
| Base | `start == n` → `[""]` (one empty sentence) |
| Combine | for each tail sentence `t`: `word` if `t` is empty, else `word + " " + t` |
| Answer | `solve(0)` |

### Trace (with memo)

```
  solve(0):
    end=3  "cat"  ✓ → solve(3)
        solve(3):
          end=7  "sand" ✓ → solve(7)
              solve(7):
                end=10 "dog" ✓ → solve(10) = [""]  → ["dog"]
              memo[7] = ["dog"]
          → ["sand dog"]                          memo[3] = ["sand dog"]
    end=4  "cats" ✓ → solve(4)
        solve(4):
          end=7  "and"  ✓ → solve(7) = memo hit ["dog"]   ← reused!
          → ["and dog"]                           memo[4] = ["and dog"]
  solve(0) = ["cat sand dog", "cats and dog"] ✅
```

### Pseudocode

```
function wordBreak(s, wordDict):
    dict ← set(wordDict)
    memo ← empty map
    return solve(0)

function solve(start):
    if start == n: return [""]
    if start in memo: return memo[start]
    sentences ← []
    for end from start+1 to n:
        word ← s[start .. end-1]
        if word in dict:
            for each tail in solve(end):
                if tail is empty: add word to sentences
                else:             add word + " " + tail to sentences
    memo[start] ← sentences
    return sentences
```

### ⚠️ The "aaaa...ab" blowup

```
   s    = "aaaaaaaaaaaaaaaaaaaab"      dict = { a, aa, aaa }

   Without memo: every way to split the a's is explored
                 (exponentially many), and EVERY one dies at 'b'.

   Fixes:
     1. memo on start: memo[i] = [] is cached too, so dead ends
        are discovered once per index  → polynomial here.
     2. Run boolean Word Break I first (can[i] = s[i..] is breakable).
        If can[0] is false → return [] immediately.
        During search, only recurse into end where can[end] is true.
```

### Complexity

| Measure | Value |
|---|---|
| Distinct states | n + 1 (one per start index) |
| Work per state | O(n) prefixes + building its sentences |
| Worst case | exponential, because the OUTPUT can be exponential (e.g. `"aaaa"` with `{a, aa, aaa, aaaa}`) |
| Space | memo of all partial sentence lists |

> Tip: cap prefix length at the longest dictionary word to skip hopeless `end` values.

### 📌 Points to remember
- Base case returns `[""]`, **not** `[]`. `[]` means "no way"; `[""]` means "one way, done".
- Memo **lists**, keyed by `start`. The path so far never affects the tail answers.
- Check feasibility (Word Break I) first when inputs are adversarial.
- Order of results usually doesn't matter on LeetCode.

---

## 3. All Possible Full Binary Trees (Medium)

### Problem
Return all **full** binary trees with `n` nodes (every node has 0 or 2 children). All node values are 0.

### Visualize it: what "full" means

```
     full ✅            full ✅               NOT full ❌
        o                  o                     o
                          / \                   /
                         o   o                 o      ← one child only
```

### Key facts

```
  • A full tree always has an ODD number of nodes:
       n = 1 (leaf), or n = 1 (root) + left + right, both odd → odd.
  • So: n even → return [].

  • Decision at the root: how many nodes go LEFT?
       left = i  (odd),  right = n − 1 − i  (also odd)
       i ∈ {1, 3, 5, ..., n−2}
```

### Decision tree on SIZES (n = 7)

```
                         n = 7
           ┌───────────────┼───────────────┐
     left=1, right=5  left=3, right=3  left=5, right=1
        1 × 2            1 × 1            2 × 1
        = 2              = 1              = 2          → total 5 ✅

   Count(n) = Σ  Count(i) × Count(n−1−i)   over odd i
   Count: n=1 → 1,  n=3 → 1,  n=5 → 2,  n=7 → 5
```

### All 5 trees for n = 7

```
 ① left=1, right=5 (A)    ② left=1, right=5 (B)    ③ left=3, right=3

        o                        o                        o
       / \                      / \                     /   \
      o   o                    o   o                   o     o
         / \                      / \                 / \   / \
        o   o                    o   o               o   o o   o
       / \                          / \
      o   o                        o   o

 ④ left=5 (A), right=1    ⑤ left=5 (B), right=1

          o                        o
         / \                      / \
        o   o                    o   o
       / \                      / \
      o   o                    o   o
     / \                          / \
    o   o                        o   o
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `n` = number of nodes left to arrange |
| Options | odd left size `i` from 1 to n−2 |
| Base | `n == 1` → one single leaf; `n` even → `[]` |
| Combine | every left tree × every right tree, under a new root |
| Memo | `memo[n]` = list of trees (sub-trees can be shared) |

### Trace (memo builds bottom-up)

```
  build(1) = [ o ]                                  → 1 tree
  build(3): i=1 → build(1) × build(1) = 1 × 1       → 1 tree
  build(5): i=1 → build(1) × build(3) = 1 × 1 = 1
            i=3 → build(3) × build(1) = 1 × 1 = 1   → 2 trees
  build(7): i=1 → 1 × 2 = 2
            i=3 → 1 × 1 = 1
            i=5 → 2 × 1 = 2                         → 5 trees ✅
```

### Pseudocode

```
function allPossibleFBT(n):
    if n is even: return []
    if n in memo: return memo[n]
    if n == 1:    return [ new leaf ]
    trees ← []
    for left from 1 to n−2 step 2:
        right ← n − 1 − left
        for each L in allPossibleFBT(left):
            for each R in allPossibleFBT(right):
                root ← new node
                root.left  ← L
                root.right ← R
                add root to trees
    memo[n] ← trees
    return trees
```

> Sharing sub-trees between results is fine here (values never change).
> If your language or judge needs independent trees, clone L and R.

### Complexity

| Measure | Value |
|---|---|
| Number of trees | Catalan((n−1)/2): 1, 1, 2, 5, 14, 42, ... |
| Time | proportional to the number of trees built (output-bound) |
| Space | memo of all lists for odd sizes ≤ n |

### 📌 Points to remember
- **Even n → empty list.** Check before anything else.
- Branch on **sizes**, not on individual nodes.
- Same pattern as "Unique Binary Search Trees II": pick the root split, combine left × right.
- Memo by `n` turns repeated subtree generation into reuse.

---

## 4. Expression Add Operators (Hard)

### Problem
Given a digit string `num` and an integer `target`, insert `+`, `-`, or `*` between digits so the expression equals `target`.
Return all such expressions. Operands may have several digits, but **no leading zeros** (`"05"` is invalid, `"0"` is fine).

### Visualize it

```
   num = "1 2 3",  target = 6

   between each pair of digits you choose one of 4 things:
       +    -    *    (nothing = glue digits into a bigger number)

       1 [ ] 2 [ ] 3
            ▲     ▲
         4 ways × 4 ways = 16 expressions to check
```

### The decision at each step: next operand + which operator

```
   pos = where the next operand starts
   choose end → operand cur = num[pos..end]
   then choose op ∈ { +, -, * }   (first operand: no operator)

   Track TWO numbers along the path:
     value = value of the expression so far
     last  = the last operand added (with its sign)   ← needed for '*'
```

### Why `last` is needed: `*` binds tighter

```
   expression so far:  1 + 2         value = 3, last = 2
   now append "* 3":   1 + 2 * 3     correct value = 1 + 6 = 7

   Wrong:   value * 3  = 9   ❌
   Right:   undo the last operand, then add last * cur:

            value − last + last × cur
            = 3 − 2 + 2 × 3 = 7     ✅
            new last = last × cur = 6
```

### Update rules

```
   ┌──────┬──────────────────────────────┬───────────────┐
   │ op   │ new value                    │ new last      │
   ├──────┼──────────────────────────────┼───────────────┤
   │  +   │ value + cur                  │  +cur         │
   │  −   │ value − cur                  │  −cur         │
   │  *   │ value − last + last × cur    │  last × cur   │
   └──────┴──────────────────────────────┴───────────────┘
```

### Decision tree ("123", target 6), showing (value, last)

```
                                start
              ┌───────────────────┼──────────────────┐
           "1"(1,1)            "12"(12,12)       "123"(123,123) ✗
         ┌────┴────────────┐       │
       "2"                 "23"    "3": +15 −9 *36   ✗
   ┌────┼──────┐       +24 −22 *23  ✗
  +2    −2     *2
 (3,2) (−1,−2) (2,2)
   │      │      │
  "3"    "3"    "3"
 +:6 ✅  +:2    +:5
 −:0     −:−4   −:−1
 *:7     *:−5   *:6 ✅

  "1+2+3" = 6 ✅      "1*2*3" = 6 ✅
```

### Trace ("123", target 6)

```
  path        value  last   next op  →  value check
  ─────────   ─────  ────   ──────────────────────────────────
  "1"           1      1
  "1+2"         3      2    +3 → 6 ✅ "1+2+3"
                            −3 → 0
                            *3 → 3 − 2 + 2·3 = 7
  "1-2"        −1     −2    +3 → 2
                            −3 → −4
                            *3 → −1 + 2 + (−2)·3 = −5
  "1*2"         2      2    +3 → 5
                            −3 → −1
                            *3 → 2 − 2 + 2·3 = 6 ✅ "1*2*3"
  "1+23" 24, "1-23" −22, "1*23" 23
  "12+3" 15, "12-3" 9,   "12*3" 36
  "123"  123

  results = ["1*2*3", "1+2+3"] ✅
```

### Trace ("105", target 5): the leading-zero rule

```
  path        value  last   next
  ─────────   ─────  ────   ─────────────────────────────────
  "1"           1      1    next operand "0" or "05"
                              "05" ✗ leading zero → never tried
  "1+0"         1      0    +5 → 6     −5 → −4    *5 → 1−0+0 = 1
  "1-0"         1      0    +5 → 6     −5 → −4    *5 → 1−0+0 = 1
  "1*0"         0      0    +5 → 5 ✅   −5 → −5    *5 → 0−0+0 = 0
  "10"         10     10    +5 → 15    −5 → 5 ✅   *5 → 50
  "105"       105    105    ✗

  results = ["1*0+5", "10-5"] ✅
```

### Pseudocode

```
function addOperators(num, target):
    results ← []
    search(0, "", 0, 0)
    return results

function search(pos, expr, value, last):
    if pos == length(num):
        if value == target: add expr to results
        return
    for end from pos to length(num) − 1:
        if end > pos and num[pos] == '0': break     // no leading zeros
        text ← num[pos .. end]
        cur  ← integer(text)                        // use 64-bit
        if pos == 0:
            search(end+1, text, cur, cur)           // first operand, no operator
        else:
            search(end+1, expr + "+" + text, value + cur,               cur)
            search(end+1, expr + "-" + text, value − cur,              −cur)
            search(end+1, expr + "*" + text, value − last + last * cur, last * cur)
```

### Complexity

| Measure | Value |
|---|---|
| Choices | n − 1 gaps, each one of 4 (`+`, `-`, `*`, glue) |
| Time | O(n · 4ⁿ): each leaf builds a string of length O(n) |
| Space | O(n) recursion depth, plus the output |
| No memo | the result depends on (value, last, expr), which almost never repeat |

### 📌 Points to remember
- **Carry `last`** so `*` can undo the previous operand. This is the whole trick.
- `break` (not `continue`) on a leading zero: every longer operand also starts with `0`.
- The first operand has **no operator** in front of it.
- Use **64-bit** integers. Ten-digit operands overflow 32-bit.
- No memo here: the state is too rich to repeat. Pure backtracking.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌─────────────────────────────┬──────────────────────────────────┬───────────────────┬──────────────┐
│ Problem                     │ One step = choose ...            │ Extra state       │ Memo?        │
├─────────────────────────────┼──────────────────────────────────┼───────────────────┼──────────────┤
│ Letter Combinations         │ a letter for the next digit      │ index             │ no           │
│ Word Break II               │ the next dictionary word         │ start             │ yes, by start│
│ All Possible Full Bin. Trees│ the left subtree size (odd)      │ n                 │ yes, by n    │
│ Expression Add Operators    │ next operand + operator          │ pos, value, last  │ no           │
└─────────────────────────────┴──────────────────────────────────┴───────────────────┴──────────────┘
```

### Pattern family tree

```
                     DECISION TREE / SEQUENCE GENERATION
                                   │
        ┌──────────────────────────┼──────────────────────────────┐
        │                          │                              │
  PURE BRANCHING            BRANCH + MEMO                   BRANCH + RUNNING STATE
  (every leaf valid)        (tail depends only on           (path carries numbers
                             position / size)                 that decide validity)
        │                          │                              │
  └ Letter Combinations     ├ Word Break II  (by start)     └ Expression Add Operators
                            └ All Possible FBT (by n)          (value, last)
```

### Should I memoize? A quick test

```
   ┌──────────────────────────────────────────────────────────────┐
   │ Does the answer for the REST depend only on a small key      │
   │ (index, size), and NOT on the choices made so far?           │
   │                                                              │
   │      YES → return lists, memo by that key  (Word Break II,   │
   │            Full Binary Trees)                                │
   │      NO  → push/pop a shared path, no memo (Letter Combos,   │
   │            Expression Add Operators)                         │
   └──────────────────────────────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Can a branch be rejected early?          → prune before recursing
  ☐ Same sub-call reached many times?        → memo its result list
  ☐ Could the whole search be hopeless?      → cheap feasibility check first (Word Break I)
  ☐ Options limited by a known max length?   → cap the loop (longest dict word)
  ☐ Building strings at every level?         → use a mutable path, copy only at leaves
  ☐ Impossible inputs by math?               → return early (even n for full trees)
```

### 🚩 Common bugs to avoid

```
  ✗ Letter Combos: returning [""] for empty input (should be [])
  ✗ Word Break II: base case [] instead of [""] → every sentence disappears
  ✗ Word Break II: no memo → timeout on "aaaa...ab"
  ✗ Full Trees: not returning [] for even n; splitting with even left sizes
  ✗ Add Operators: multiplying the whole value instead of using last
  ✗ Add Operators: allowing "05"; using continue instead of break on '0'
  ✗ Add Operators: 32-bit overflow on long operands
  ✗ Forgetting to UNDO the choice (pop) after recursing
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "At this step, what is my MENU of options, and does     ║
   ║   the rest of the answer depend on how I got here?"      ║
   ╚══════════════════════════════════════════════════════════╝
     The menu gives the branches. The second half tells you whether to memoize.
```

---

### ✅ Progress tracker

- [ ] Letter Combinations of a Phone Number (Medium)
- [ ] Word Break II (Hard)
- [ ] All Possible Full Binary Trees (Medium)
- [ ] Expression Add Operators (Hard)
