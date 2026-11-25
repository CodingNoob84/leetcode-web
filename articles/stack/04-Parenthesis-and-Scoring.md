# Parenthesis & Scoring: A Visual Guide

> **Goal:** Learn to *see* bracket problems as a balance that goes up and down,
> know when a simple counter is enough and when you need a real stack.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Brackets Are a Mountain](#0-the-big-idea-brackets-are-a-mountain)
1. [Valid Parentheses (Easy)](#1-valid-parentheses-easy)
2. [Minimum Add to Make Parentheses Valid (Medium)](#2-minimum-add-to-make-parentheses-valid-medium)
3. [Score of Parentheses (Medium)](#3-score-of-parentheses-medium)
4. [Longest Valid Parentheses (Hard)](#4-longest-valid-parentheses-hard)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Valid Parentheses → Minimum Add → Score of Parentheses → Longest Valid Parentheses.
> Each one adds exactly one new idea: matching types → counting repairs → scoring by depth → measuring lengths with indices.

---

## 0. The Big Idea: Brackets Are a Mountain

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "BRACKET STACK"                         │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a string of ( ) [ ] { }                              │
│  • "Is it valid / balanced?"                                     │
│  • "Minimum additions / removals to make it valid"               │
│  • "Score" or "depth" of nesting                                 │
│  • "Longest valid substring"                                     │
│  • Anything where the LAST opened thing must be CLOSED FIRST     │
└──────────────────────────────────────────────────────────────────┘
```

### The mountain picture (one bracket type)

Walk the string. `(` = step **up**, `)` = step **down**. Track the **balance** (height).

```
  s       :   (   (   )   (   )   )
  balance : 1   2   1   2   1   0

  height
    2 │     /\/\
    1 │    /    \
    0 │___/      \___
         ( ( ) ( ) )

  ┌─────────────────────────────────────────────────────────────┐
  │  VALID  ⇔  the mountain NEVER dips below 0                  │
  │           AND it ENDS at height 0                           │
  └─────────────────────────────────────────────────────────────┘
```

### The two ways to fail

```
  FAIL 1: dips below ground          FAIL 2: doesn't come back down

   s = ( ) ) (                        s = ( ( )

    1 │  /\    /                       2 │   /\
    0 │_/  \  /                        1 │  /  \
   -1 │     \/   ← went below 0!       0 │_/    ← ends at 1, not 0!
       ( ) ) (                            ( ( )

   "a ')' with nothing to match"      "a '(' never got closed"
```

### Counter vs stack: which one do I need?

```
  ┌──────────────────────────────┬──────────────────────────────────┐
  │ Situation                    │ Tool                             │
  ├──────────────────────────────┼──────────────────────────────────┤
  │ ONE bracket type: ( )        │ a COUNTER (the balance) is enough│
  │ MANY types: ( ) [ ] { }      │ a STACK (must know WHICH opened) │
  │ Need positions / lengths     │ a STACK OF INDICES               │
  │ Need values per level        │ a STACK OF SCORES                │
  └──────────────────────────────┴──────────────────────────────────┘
```

Why a counter fails with many types:

```
   s = ( [ ) ]

   counter view:  ( up, [ up, ) down, ] down  → never < 0, ends at 0  → "valid"?  ✗ WRONG
   stack view:    push (, push [, see ) but top is [  → mismatch      → invalid   ✓

   The counter only knows HOW MANY are open, not WHICH ONE is on top.
```

### The stack picture: last opened, first closed

```
   s = { [ ( ) ] }

   read {   read [   read (   read )   read ]   read }
   ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐    ┌───┐
   │   │    │   │    │ ( │    │   │    │   │    │   │
   │   │    │ [ │    │ [ │    │ [ │    │   │    │   │
   │ { │    │ { │    │ { │    │ { │    │ { │    │   │   empty ✅
   └───┘    └───┘    └───┘    └───┘    └───┘    └───┘
                              pop (    pop [    pop {
```

### Why store INDICES instead of characters?

```
   s =  )  (  (  )  )
        0  1  2  3  4

   Stack of chars:    [ (, ( ]      → I know WHAT is open
   Stack of indices:  [ 1, 2 ]      → I know WHAT and WHERE

   When ')' at index 4 matches '(' at index 1:
       the valid piece is s[1..4], length = 4 − 1 + 1 = 4
   Only indices can give you LENGTHS.
```

### The 3-step recipe for bracket problems

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  What do I need to REMEMBER about open brackets?       │
 │         just how many → counter                               │
 │         which type    → stack of chars                        │
 │         where         → stack of indices                      │
 │         a value       → stack of scores                       │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 2  What happens on an OPENER?   (almost always: push)    │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 3  What happens on a CLOSER?                             │
 │         match → pop and do the problem's work                 │
 │         no match → it's the problem's "error" case            │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Valid Parentheses (Easy)

### Problem
String of `( ) [ ] { }`. Valid if every opener is closed by the **same type** in the **right order**.

### Visualize it

```
   "({[]})"   ✅      nested like boxes inside boxes
   ┌─────────────┐
   │ ( ┌───────┐ )│
   │   │ { [] }│  │
   │   └───────┘  │
   └─────────────┘

   "([)]"     ❌      boxes CROSS each other
     ( ───────┐
         [ ───┼───┐
              )   ]       ")" tries to close "(" but "[" is still open inside
```

### The decision at each character

```
                     read character c
             ┌──────────────┴───────────────┐
          OPENER                          CLOSER
        ( [ {                             ) ] }
            │                               │
         push c                   stack empty?  ──yes──► INVALID
                                            │ no
                                  top == matching opener of c?
                                     │yes             │no
                                    pop            INVALID

   At the end: stack must be EMPTY (no unclosed openers).
```

The trick: keep a map **closer → opener**:

```
   ┌─────┬─────┐
   │  )  │  (  │
   │  ]  │  [  │
   │  }  │  {  │
   └─────┴─────┘
```

### Trace 1: `"({[]})"` → true

```
  i │ char │ action                    │ stack (bottom → top)
  ──┼──────┼───────────────────────────┼─────────────────────
  0 │  (   │ opener → push             │ (
  1 │  {   │ opener → push             │ ( {
  2 │  [   │ opener → push             │ ( { [
  3 │  ]   │ top [ == match[]] → pop   │ ( {
  4 │  }   │ top { == match[}] → pop   │ (
  5 │  )   │ top ( == match[)] → pop   │ (empty)
  ──┴──────┴───────────────────────────┴─────────────────────
  end: stack empty → true ✅
```

### Trace 2: `"([)]"` → false

```
  i │ char │ action                          │ stack
  ──┼──────┼─────────────────────────────────┼────────
  0 │  (   │ push                            │ (
  1 │  [   │ push                            │ ( [
  2 │  )   │ top is [ but ) needs (  → FAIL  │ ( [
  ──┴──────┴─────────────────────────────────┴────────
  return false ❌
```

### Pseudocode

```
function isValid(s):
    match ← { ')':'(', ']':'[', '}':'{' }
    stack ← empty
    for each c in s:
        if c is an opener:
            push c
        else:
            if stack is empty or top(stack) ≠ match[c]:
                return false
            pop
    return stack is empty
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Repeatedly delete "()", "[]", "{}" pairs | O(n²) | O(n) |
| **Stack** | **O(n)** | **O(n)** ✅ |

### 📌 Points to remember
- **Odd length → instantly false.** Free early exit.
- Check **empty stack before peeking** on a closer, e.g. `")"`.
- Don't forget the **final check**: `"(("` never fails mid-way but is invalid.
- Many bracket types → you **must** use a stack. A counter is wrong here.

---

## 2. Minimum Add to Make Parentheses Valid (Medium)

### Problem
String of `(` and `)` only. Return the minimum number of brackets to **insert** to make it valid.

### Visualize it with the mountain

```
   s = ( ) )

    1 │  /\
    0 │_/  \___
   -1 │     ↓     ← dipped below ground: needs one '(' inserted earlier

   fix: ( ( ) )  or  ( ) ( )   → 1 insertion ✅


   s = ( ( (

    3 │     /
    2 │   /
    1 │ /
    0 │/          ← ended at height 3: needs three ')' at the end

   fix: ( ( ( ) ) )   → 3 insertions ✅
```

### The insight: two separate debts

```
  ┌──────────────────────────────────────────────────────────────┐
  │  open   = '(' still waiting for a ')'    (height of mountain)│
  │  needed = ')' that had NO '(' to match   (times we'd go < 0) │
  │                                                              │
  │  answer = needed + open                                      │
  └──────────────────────────────────────────────────────────────┘

   Each unmatched ')' needs a '(' inserted BEFORE it.
   Each unmatched '(' needs a ')' inserted AFTER it.
   Neither can cancel the other: a ')' BEFORE a '(' doesn't match it.
```

> Only one bracket type → a **counter** is enough. No stack needed.

### The decision at each character

```
          read c
     ┌──────┴───────┐
    '('            ')'
     │               │
  open++       open > 0 ?
              ┌──yes──┴──no──┐
            open--        needed++
          (matched)     (stranded ')')
```

### Trace 1: `"())"` → 1

```
  i │ char │ action                   │ open │ needed
  ──┼──────┼──────────────────────────┼──────┼───────
  0 │  (   │ open++                   │  1   │  0
  1 │  )   │ open > 0 → match, open-- │  0   │  0
  2 │  )   │ open = 0 → needed++      │  0   │  1
  ──┴──────┴──────────────────────────┴──────┴───────
  answer = 1 + 0 = 1 ✅
```

### Trace 2: `"((("` → 3

```
  i │ char │ open │ needed
  ──┼──────┼──────┼───────
  0 │  (   │  1   │  0
  1 │  (   │  2   │  0
  2 │  (   │  3   │  0
  answer = 0 + 3 = 3 ✅
```

### Trace 3: `"()))(("` → 4 (both debts)

```
  i │ char │ open │ needed
  ──┼──────┼──────┼───────
  0 │  (   │  1   │  0
  1 │  )   │  0   │  0     matched
  2 │  )   │  0   │  1     stranded
  3 │  )   │  0   │  2     stranded
  4 │  (   │  1   │  2
  5 │  (   │  2   │  2
  answer = 2 + 2 = 4 ✅      fix: ( ) ( ) ( ) ( ( ) )
```

### Pseudocode

```
function minAddToMakeValid(s):
    open ← 0
    needed ← 0
    for each c in s:
        if c == '(':
            open ← open + 1
        else if open > 0:
            open ← open − 1
        else:
            needed ← needed + 1
    return needed + open
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Stack (push '(' and unmatched ')', return final size) | O(n) | O(n) |
| **Two counters** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Two debts, never combined:** stranded `)` and unclosed `(`.
- Don't use `|balance|` at the end: `")("` has balance 0 but needs **2**.
- Same counters show up in Minimum Remove to Make Valid Parentheses (Stack + Greedy guide).

---

## 3. Score of Parentheses (Medium)

### Problem
A balanced string scores by these rules:
- `()` = **1**
- `AB` = score(A) + score(B)  (side by side → **add**)
- `(A)` = 2 × score(A)       (wrap → **double**)

### Visualize it

```
   "(()(()))"

   (                               )      ← outer wrap: × 2
     ()   (                   )           ← inside: () + ( () )
          ()                              ← innermost

   tree view:
                 (×2)
                /    \
              ()     (×2)
              =1       |
                      ()
                      =1
   inside = 1 + 2·1 = 3       outer = 2·3 = 6 ✅
```

### Approach A: stack of scores

Each stack slot holds **"score collected so far at this depth"**.

```
   on '(' : open a new level         → push 0
   on ')' : close the current level  → v ← pop
            its value is  max(2·v, 1)       (v = 0 means it was "()" → 1)
            add it to the level below → top += max(2·v, 1)

   Start with [0] as the outermost level (the answer lives there).
```

### Decision picture on `)`

```
            pop v (the level just closed)
                     │
           ┌─────────┴─────────┐
         v == 0              v > 0
     it was "()"         it was "(A)" with score(A) = v
         │                     │
      worth 1              worth 2·v
         └─────────┬───────────┘
        add to new top (the parent level)
```

### Trace: `"(()(()))"` → 6

```
  i │ char │ action                              │ stack (bottom → top)
  ──┼──────┼─────────────────────────────────────┼─────────────────────
    │      │ start                               │ [0]
  0 │  (   │ push 0                              │ [0, 0]
  1 │  (   │ push 0                              │ [0, 0, 0]
  2 │  )   │ pop 0 → worth 1 → top += 1          │ [0, 1]
  3 │  (   │ push 0                              │ [0, 1, 0]
  4 │  (   │ push 0                              │ [0, 1, 0, 0]
  5 │  )   │ pop 0 → worth 1 → top += 1          │ [0, 1, 1]
  6 │  )   │ pop 1 → worth 2 → top += 2          │ [0, 3]
  7 │  )   │ pop 3 → worth 6 → top += 6          │ [6]
  ──┴──────┴─────────────────────────────────────┴─────────────────────
  answer = 6 ✅
```

### Pseudocode (stack)

```
function scoreOfParentheses(s):
    stack ← [0]
    for each c in s:
        if c == '(':
            push 0
        else:
            v ← pop
            top(stack) ← top(stack) + max(2·v, 1)
    return top(stack)
```

---

### 🚀 Approach B: the depth trick, O(1) space

```
  Insight: only the innermost "()" pairs create points.
           Every wrap around a "()" doubles it.
           So a "()" at depth d (d wraps around it) is worth 2^d.

   "(()(()))"
     ()        sits inside 1 wrap   → 2^1 = 2
         ()    sits inside 2 wraps  → 2^2 = 4
                                      ─────
                                total   6 ✅

   (Matches approach A: 2·(1 + 2·1) = 2 + 4 by distributing the doubling.)
```

How to detect "a `()` pair": a `)` that comes **right after** a `(`.

### Trace (depth trick)

```
  i │ char │ depth after │ prev char │ add
  ──┼──────┼─────────────┼───────────┼──────────────
  0 │  (   │      1      │     —     │
  1 │  (   │      2      │     (     │
  2 │  )   │      1      │     (     │ 2^1 = 2   ← "()" found
  3 │  (   │      2      │     )     │
  4 │  (   │      3      │     (     │
  5 │  )   │      2      │     (     │ 2^2 = 4   ← "()" found
  6 │  )   │      1      │     )     │   —
  7 │  )   │      0      │     )     │   —
  ──┴──────┴─────────────┴───────────┴──────────────
  total = 2 + 4 = 6 ✅
```

### Pseudocode (depth trick)

```
function scoreOfParentheses(s):
    depth ← 0
    score ← 0
    for i from 0 to n−1:
        if s[i] == '(':
            depth ← depth + 1
        else:
            depth ← depth − 1
            if s[i−1] == '(':          // this ')' closes a "()" core
                score ← score + 2^depth
    return score
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Recursion: split into balanced parts | O(n²) worst | O(n) |
| Stack of scores | O(n) | O(n) |
| **Depth trick** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Stack of scores**: push 0 on `(`, on `)` pop and add `max(2v, 1)` to the new top.
- The `[0]` starting slot holds the answer and handles `AB` side-by-side adding for free.
- **Depth trick**: decrement depth **first**, then add `2^depth`.
- Only `)` right after `(` scores. Other `)` just close a wrap.

---

## 4. Longest Valid Parentheses (Hard)

### Problem
String of `(` and `)`. Return the length of the **longest valid (well-formed) substring**.

### Visualize it

```
   s =   )  (  )  (  )  )
         0  1  2  3  4  5
            └──────────┘
             "()()" length 4 ✅

   The bad ')' at 0 and 5 act as WALLS.
   A valid run can never cross a wall.
```

### Approach A: stack of indices with a "wall" sentinel

```
  ┌──────────────────────────────────────────────────────────────┐
  │  The BOTTOM of the stack always holds the index of the last  │
  │  "wall": the position just before the current valid run.     │
  │  Start with −1 (imaginary wall before the string).           │
  └──────────────────────────────────────────────────────────────┘

  on '(' : push i                     (remember where it opened)
  on ')' : pop                        (try to match)
           stack empty?  → this ')' is a NEW WALL → push i
           else          → valid run ends at i, starts after top
                           length = i − top(stack)
```

Why `i − top`? After popping the match, the top is the last position that is **not** part of the current valid run:

```
    wall         valid run
     │    ┌────────────────────┐
     ▼    ▼                    ▼
   [top] [top+1  ...  ...  ... i]
          length = i − top
```

### Trace: `")()())"` → 4

```
  i │ char │ action                                  │ stack     │ len │ best
  ──┼──────┼─────────────────────────────────────────┼───────────┼─────┼─────
    │      │ start with sentinel wall                │ [-1]      │     │  0
  0 │  )   │ pop -1 → empty → new wall, push 0       │ [0]       │  —  │  0
  1 │  (   │ push 1                                  │ [0, 1]    │  —  │  0
  2 │  )   │ pop 1 → top 0 → len = 2 − 0             │ [0]       │  2  │  2
  3 │  (   │ push 3                                  │ [0, 3]    │  —  │  2
  4 │  )   │ pop 3 → top 0 → len = 4 − 0             │ [0]       │  4  │  4
  5 │  )   │ pop 0 → empty → new wall, push 5        │ [5]       │  —  │  4
  ──┴──────┴─────────────────────────────────────────┴───────────┴─────┴─────
  answer = 4 ✅
```

> Notice at i = 4 the length is measured from wall 0, so it covers **both** `()` pairs
> (indices 1–4). That is how the stack joins neighbouring valid pieces.

### Pseudocode (stack)

```
function longestValidParentheses(s):
    stack ← [−1]
    best ← 0
    for i from 0 to n−1:
        if s[i] == '(':
            push i
        else:
            pop
            if stack is empty:
                push i                       // new wall
            else:
                best ← max(best, i − top(stack))
    return best
```

---

### 🚀 Approach B: two-pass counters, O(1) space

```
  Left → right:  count open, close
     close > open  → reset both to 0 (a wall)
     close == open → valid run of length 2·close

  Problem: "(()" never gets close == open going left → right
           (open stays ahead), so this pass misses it.

  Right → left:  same idea, mirrored
     open > close  → reset
     open == close → valid run of length 2·open

  answer = best of both passes
```

### Trace on `")()())"`

```
  LEFT → RIGHT
  i │ char │ open │ close │ event
  ──┼──────┼──────┼───────┼──────────────────────
  0 │  )   │  0   │   1   │ close > open → reset 0,0
  1 │  (   │  1   │   0   │
  2 │  )   │  1   │   1   │ equal → 2      best 2
  3 │  (   │  2   │   1   │
  4 │  )   │  2   │   2   │ equal → 4      best 4
  5 │  )   │  2   │   3   │ close > open → reset
  best so far = 4

  RIGHT → LEFT
  i │ char │ open │ close │ event
  ──┼──────┼──────┼───────┼──────────────────────
  5 │  )   │  0   │   1   │
  4 │  )   │  0   │   2   │
  3 │  (   │  1   │   2   │
  2 │  )   │  1   │   3   │
  1 │  (   │  2   │   3   │
  0 │  )   │  2   │   4   │ never equal → nothing new
  answer = 4 ✅
```

### Why the second pass matters: `"(()"` → 2

```
  LEFT → RIGHT:  (  o1 c0 │ (  o2 c0 │ )  o2 c1  → never equal → 0  ✗ missed!
  RIGHT → LEFT:  )  o0 c1 │ (  o1 c1 → equal → 2 ✓ │ (  o2 c1 → open > close → reset
  answer = 2 ✅
```

---

### Approach C: DP (`dp[i]` = longest valid substring **ending at** i)

> Same "ending at i" state as LIS in [01-1D-Linear-DP.md](../dynammic%20programming/01-1D-Linear-DP.md). Answer = max over all `dp[i]`.

```
  dp[i] = 0 if s[i] == '('          (a valid substring can't end with '(')

  if s[i] == ')':
    CASE 1: s[i−1] == '('        "...()"
            dp[i] = dp[i−2] + 2
                     ▲
                     glue the valid run just before this "()"

    CASE 2: s[i−1] == ')'        "...(  ...valid...  ))"
            j = i − dp[i−1] − 1   ← the char just before the inner valid run
            if j ≥ 0 and s[j] == '(':
                dp[i] = dp[i−1] + 2 + dp[j−1]
                         ▲         ▲      ▲
                       inner     this   glue whatever valid run
                       run       pair   ends right before j

      s:  ... [ dp[j−1] run ] (  [ inner run of dp[i−1] ]  )
                              j                            i
```

### DP trace: `"()(())"` → 6

```
  i     :  0   1   2   3   4   5
  s     :  (   )   (   (   )   )
         ┌───┬───┬───┬───┬───┬───┐
  dp    :│ 0 │ 2 │ 0 │ 0 │ 2 │ 6 │
         └───┴───┴───┴───┴───┴───┘

  i=1: CASE 1 → dp[−1] treated as 0 → 0 + 2 = 2
  i=4: CASE 1 → dp[2] + 2 = 0 + 2 = 2
  i=5: CASE 2 → j = 5 − dp[4] − 1 = 2, s[2] = '(' ✓
       dp[5] = dp[4] + 2 + dp[1] = 2 + 2 + 2 = 6
  answer = max(dp) = 6 ✅
```

### Pseudocode (DP)

```
function longestValidParentheses(s):
    dp ← array of n zeros
    best ← 0
    for i from 1 to n−1:
        if s[i] == ')':
            if s[i−1] == '(':
                dp[i] ← (i ≥ 2 ? dp[i−2] : 0) + 2
            else:
                j ← i − dp[i−1] − 1
                if j ≥ 0 and s[j] == '(':
                    dp[i] ← dp[i−1] + 2 + (j ≥ 1 ? dp[j−1] : 0)
            best ← max(best, dp[i])
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Check every substring | O(n³) | O(1) |
| **Stack of indices** | **O(n)** | O(n) |
| DP ending-at-i | O(n) | O(n) |
| **Two-pass counters** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Sentinel −1** at the bottom = "wall before the string". Without it, the first run has no left edge.
- An unmatched `)` **becomes the new wall**: push its index.
- Length = `i − top` **after** popping, not `i − popped index + 1`. The latter misses glued runs like `"()()"`.
- Two-pass trick: **one direction alone misses** cases like `"(()"`.
- DP CASE 2 must glue `dp[j−1]`, or `"()(())"` gives 4 instead of 6.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌──────────────────────────┬──────────────────────────────────────────┬───────────────┬──────────┐
│ Problem                  │ Core idea                                │ Memory        │ Best     │
├──────────────────────────┼──────────────────────────────────────────┼───────────────┼──────────┤
│ Valid Parentheses        │ push openers; closer must match top      │ stack of chars│ O(n),O(n)│
│ Min Add to Make Valid    │ open counter + stranded-')' counter      │ 2 counters    │ O(n),O(1)│
│ Score of Parentheses     │ stack of scores: max(2v,1) / 2^depth     │ stack / depth │ O(n),O(1)│
│ Longest Valid Parens     │ index stack with −1 wall; i − top        │ stack of idx  │ O(n),O(1)│
└──────────────────────────┴──────────────────────────────────────────┴───────────────┴──────────┘
```

### Pattern family tree

```
                          BRACKET PROBLEMS
                                 │
       ┌─────────────────┬───────┴─────────┬──────────────────────┐
       │                 │                 │                      │
    VALIDATE          REPAIR             SCORE                 MEASURE
   (which type?)   (how many fixes?)  (value per level)     (where / how long?)
       │                 │                 │                      │
  Valid Parens     Min Add to Make    Score of Parens      Longest Valid Parens
  (stack chars)    Valid (counters)   (stack of scores)    (stack of indices)

  Related elsewhere:
    • Minimum Remove to Make Valid Parentheses  → Stack + Greedy guide
    • Valid Parenthesis String ( * wildcard )   → ../greedy/02-Sorting-and-Local-Choice.md
    • Generate Parentheses (build them)         → ../backtracking/01-Choice-Based-Backtracking.md
    • Decode String / Basic Calculator (nesting)→ Expression Evaluation guide
```

### What to put on the stack

```
   ┌──────────────────────────┬───────────────────────────────────────┐
   │ You need to know...      │ Store                                 │
   ├──────────────────────────┼───────────────────────────────────────┤
   │ only HOW MANY are open   │ nothing, use a counter                │
   │ WHICH bracket type       │ the character                         │
   │ WHERE it opened (length) │ the index (plus a −1 sentinel)        │
   │ value built inside       │ a running score per level             │
   └──────────────────────────┴───────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Only one bracket type?                    → counter instead of stack, O(1)
  ☐ Odd length and asked "valid?"             → return false immediately
  ☐ Scoring by nesting?                       → depth trick, 2^depth per "()"
  ☐ Longest valid run?                        → two-pass counters, O(1) space
  ☐ Need positions to remove/repair later?    → stack of indices
```

### 🚩 Common bugs to avoid

```
  ✗ Peeking at an empty stack on a closer like ")"
  ✗ Forgetting the final "stack is empty?" check ("((" passes the loop)
  ✗ Using a counter when there are several bracket types ("([)]")
  ✗ Min Add: answering |balance| instead of needed + open (")(" → 2, not 0)
  ✗ Score: incrementing depth after adding, or adding on every ')'
  ✗ Longest: no −1 sentinel; not pushing the new wall on an unmatched ')'
  ✗ Longest: length = i − popped + 1 (misses glued runs)
  ✗ Two-pass: running only left → right ("(()" → 0 instead of 2)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "When a closer arrives, what do I need to know about    ║
   ║   the opener it matches: its TYPE, its POSITION,         ║
   ║   or the VALUE built inside it?"                         ║
   ╚══════════════════════════════════════════════════════════╝
      That answer tells you what to push on the stack.
```

---

### ✅ Progress tracker

- [ ] Valid Parentheses (Easy)
- [ ] Minimum Add to Make Parentheses Valid (Medium)
- [ ] Score of Parentheses (Medium)
- [ ] Longest Valid Parentheses (Hard)
