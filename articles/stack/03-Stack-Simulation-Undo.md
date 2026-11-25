# Stack Simulation / Undo: A Visual Guide

> **Goal:** Learn to *see* "cancel with the neighbour" problems and solve them with one stack pass.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Why a Stack Simulates Undo](#0-the-big-idea-why-a-stack-simulates-undo)
1. [Backspace String Compare (Easy)](#1-backspace-string-compare-easy)
2. [Remove All Adjacent Duplicates in String (Easy)](#2-remove-all-adjacent-duplicates-in-string-easy)
3. [Make the String Great (Easy)](#3-make-the-string-great-easy)
4. [Minimum String Length After Removing Substrings (Easy)](#4-minimum-string-length-after-removing-substrings-easy)
5. [Bonus: Remove All Adjacent Duplicates II (Medium)](#5-bonus-remove-all-adjacent-duplicates-ii-medium)
6. [Master Cheat Sheet](#6-master-cheat-sheet)

> **Suggested order:** Backspace → Adjacent Duplicates → Make the String Great → Removing Substrings → (bonus) Adjacent Duplicates II.
> Each one changes only the **"does it cancel?"** rule. The loop stays the same.

---

## 0. The Big Idea: Why a Stack Simulates Undo

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "STACK SIMULATION"                      │
├──────────────────────────────────────────────────────────────────┤
│  • Keystrokes: '#' or backspace deletes the previous character   │
│  • "Remove ADJACENT pairs that ..."                              │
│  • "Repeat until no more removals are possible"                  │
│  • Neighbours COLLAPSE / CANCEL / ANNIHILATE each other          │
│  • The final string after all removals is asked                  │
└──────────────────────────────────────────────────────────────────┘
```

### The key picture: the stack top is my surviving left neighbour

```
   Input read left → right:   x  y  z  [ c ]  ...
                                          ▲
                                     current char

   The STACK holds everything to my left that has SURVIVED so far:

        │     │
        │  z  │  ← top = my nearest surviving LEFT neighbour
        │  y  │
        │  x  │
        └─────┘

   Only the TOP can cancel with me. Everything below it is "shielded" by it.
```

### The template (one rule changes per problem)

```
function simulate(s):
    stack ← empty
    for each char c in s:
        if stack not empty and CANCELS(stack.top, c):
            stack.pop()             // both disappear (c is never pushed)
        else:
            stack.push(c)
    return stack read bottom → top
```

| Problem | `CANCELS(top, c)` |
|---|---|
| Backspace String Compare | `c == '#'` (pops top if any; `#` itself is never pushed) |
| Remove Adjacent Duplicates | `top == c` |
| Make the String Great | `top ≠ c` and same letter ignoring case (`|top − c| == 32`) |
| Removing Substrings | `top + c` is `"AB"` or `"CD"` |

### Chain reactions come for free

```
  "Repeat until no more removals" sounds like many passes over the string...

     abbaca  →  aaca  →  ca          (2 passes, naive: O(n²) worst case)

  ...but a stack does it in ONE pass, because after a pop the NEW top
  is exactly the character that just became my neighbour.

     read a      [a]
     read b      [a b]
     read b      [a]        b,b cancel  → 'a' is exposed again
     read a      [ ]        a,a cancel  ← the chain reaction, automatically
     read c      [c]
     read a      [c a]      → "ca"
```

> 💡 **Key insight:** a removal can only create a NEW adjacent pair between
> "the stack top" and "the next character". The stack always has that pair ready.

### Use the result string itself as the stack

```
   Most languages have a growable string / string builder:
        push  = append char at the end
        pop   = delete last char
        top   = last char
   → no separate stack + no final reverse needed. Same O(n).
```

---

## 1. Backspace String Compare (Easy)

### Problem
Two strings `s` and `t`; `'#'` means backspace. Return true if both type the same final text.
Backspace on empty text does nothing.

### Visualize it

```
   s = "ab#c"           t = "ad#c"
        a  b  #  c           a  d  #  c
           └─┘                  └─┘
         b erased             d erased
   final: "ac"          final: "ac"         → equal ✅
```

### Approach A: build both strings with a stack

```
  for each char:
     '#'   → pop (if not empty)      ← the "undo"
     other → push
```

### Trace (`"ab#c"` vs `"ad#c"`)

```
   s:  char   stack           t:  char   stack
       a      [a]                 a      [a]
       b      [a b]               d      [a d]
       #      [a]                 #      [a]
       c      [a c]               c      [a c]
       ─────────────              ─────────────
       "ac"                       "ac"          → "ac" == "ac" → true ✅
```

### Trace (`"a#c"` vs `"b"`)

```
   s:  a → [a]   # → [ ]   c → [c]      → "c"
   t:  b → [b]                          → "b"      "c" ≠ "b" → false ✅
```

### Pseudocode (stack)

```
function build(s):
    st ← empty
    for each c in s:
        if c == '#':
            if st not empty: st.pop()
        else:
            st.push(c)
    return st as string

function backspaceCompare(s, t):
    return build(s) == build(t)
```

---

### 🚀 Optimization: O(1) space with two pointers from the END

```
  Why from the end?  A '#' only affects characters BEFORE it.
  Walking right → left, you SEE the '#' before the char it deletes.
  Keep a "skip" counter: each '#' adds 1; each normal char with skip > 0 is eaten.

        a   b   #   c
                ◄───── read this way
            skip=1 → 'b' eaten
```

### Trace (`"ab#c"` vs `"ad#c"`)

```
   s = a b # c        t = a d # c
       0 1 2 3            0 1 2 3

   step │ s side                          │ t side                          │ compare
   ─────┼─────────────────────────────────┼─────────────────────────────────┼─────────
    1   │ i=3 'c' (skip 0) → real char    │ j=3 'c' (skip 0) → real char    │ c == c ✓
    2   │ i=2 '#' skip=1                  │ j=2 '#' skip=1                  │
        │ i=1 'b' eaten, skip=0           │ j=1 'd' eaten, skip=0           │
        │ i=0 'a' → real char             │ j=0 'a' → real char             │ a == a ✓
    3   │ i=-1 done                       │ j=-1 done                       │ both done → true ✅
```

### Trace (`"a#c"` vs `"b"`)

```
   step 1:  s: i=2 'c' real     t: j=0 'b' real     'c' ≠ 'b' → false ✅
```

### Pseudocode (two pointers)

```
function backspaceCompare(s, t):
    i ← len(s) − 1,  j ← len(t) − 1
    loop:
        i ← nextReal(s, i)
        j ← nextReal(t, j)
        if i < 0 and j < 0:  return true        // both exhausted together
        if i < 0 or  j < 0:  return false       // one ran out first
        if s[i] ≠ t[j]:      return false
        i ← i − 1,  j ← j − 1

function nextReal(str, k):            // index of next surviving char at or left of k
    skip ← 0
    while k ≥ 0:
        if str[k] == '#':     skip ← skip + 1
        else if skip > 0:     skip ← skip − 1
        else:                 return k
        k ← k − 1
    return −1
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Stack (build both) | O(n + m) | O(n + m) |
| **Two pointers from end** | **O(n + m)** | **O(1)** ✅ |

### 📌 Points to remember
- `'#'` on an empty stack does **nothing**. Guard the pop.
- Two-pointer version: **both** must run out together, or one string has extra chars.
- Reading backward turns "future deletes past" into "I already know how many to skip".

---

## 2. Remove All Adjacent Duplicates in String (Easy)

### Problem
Repeatedly remove two **adjacent equal** letters until none remain. Return the final string.

### Visualize it

```
     a  b  b  a  c  a
        └──┘              remove "bb"
     a  ─  ─  a  c  a
     └────────┘           now 'a','a' are neighbours → remove
              c  a        → "ca"
```

### The rule

```
   CANCELS(top, c)  ⇔  top == c
```

### Trace (`"abbaca"`)

```
   char │ action              │ stack (bottom → top)
   ─────┼─────────────────────┼──────────────────────
    a   │ push                │ [a]
    b   │ push                │ [a, b]
    b   │ top b == b → pop    │ [a]
    a   │ top a == a → pop    │ [ ]           ← chain reaction
    c   │ push                │ [c]
    a   │ push                │ [c, a]

   result: "ca" ✅
```

### Stack drawings

```
   after a   after b   after b   after a   after c   after a
                │ b │                                 │ a │
    │ a │      │ a │    │ a │     │   │     │ c │     │ c │
    └───┘      └───┘    └───┘     └───┘     └───┘     └───┘
```

### Pseudocode

```
function removeDuplicates(s):
    res ← empty string builder            // used as the stack
    for each c in s:
        if res not empty and last(res) == c:
            delete last char of res
        else:
            append c to res
    return res
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Repeat scans until stable | O(n²) | O(n) |
| **Stack, one pass** | **O(n)** | **O(n)** ✅ |

### 📌 Points to remember
- Only **pairs** cancel here. "abba" → "" but "aaa" → "a" (first two cancel, third survives).
- The order of removals never changes the final answer, so one left→right pass is safe.

---

## 3. Make the String Great (Easy)

### Problem
A pair is "bad" if two adjacent chars are the **same letter in different cases** (`'a'` next to `'A'`).
Remove bad pairs until none remain.

### The rule

```
   CANCELS(top, c)  ⇔  top ≠ c  and  lower(top) == lower(c)
                    ⇔  |code(top) − code(c)| == 32        (ASCII: 'a'=97, 'A'=65)

   'e' & 'E'  → 101 − 69 = 32 → cancel ✓
   'e' & 'e'  → 0             → keep  ✗   (same case is NOT bad)
```

### Trace (`"leEeetcode"`)

```
   char │ action                       │ stack
   ─────┼──────────────────────────────┼──────────────────────
    l   │ push                         │ [l]
    e   │ push                         │ [l, e]
    E   │ top e vs E: diff 32 → pop    │ [l]
    e   │ push                         │ [l, e]
    e   │ top e vs e: same case → push │ [l, e, e]
    t   │ push                         │ [l, e, e, t]
    c   │ push                         │ [l, e, e, t, c]
    o   │ push                         │ [l, e, e, t, c, o]
    d   │ push                         │ [l, e, e, t, c, o, d]
    e   │ push                         │ [l, e, e, t, c, o, d, e]

   result: "leetcode" ✅
```

### Trace (`"abBAcC"`): a full chain reaction

```
   char │ action                 │ stack
   ─────┼────────────────────────┼─────────
    a   │ push                   │ [a]
    b   │ push                   │ [a, b]
    B   │ b vs B → pop           │ [a]
    A   │ a vs A → pop           │ [ ]      ← chain: 'a' re-exposed, then cancelled
    c   │ push                   │ [c]
    C   │ c vs C → pop           │ [ ]

   result: "" ✅
```

### Pseudocode

```
function makeGood(s):
    res ← empty string builder
    for each c in s:
        if res not empty and |code(last(res)) − code(c)| == 32:
            delete last char of res
        else:
            append c to res
    return res
```

### Complexity
Time **O(n)**, space **O(n)**.

### 📌 Points to remember
- `"ee"` is **not** bad. The difference must be exactly 32, not 0.
- Same template as problem 2. Only the cancel test changed.

---

## 4. Minimum String Length After Removing Substrings (Easy)

### Problem
String of uppercase letters. You may repeatedly remove any occurrence of `"AB"` or `"CD"`.
Return the **minimum possible length**.

### Visualize it

```
   A B F C A C D B
   └─┘                       remove "AB"
       F C A C D B
             └─┘             remove "CD"
       F C A ─ ─ B           now 'A','B' are neighbours
           └─────┘           remove "AB"
       F C                   → length 2
```

### The rule

```
   CANCELS(top, c)  ⇔  (top == 'A' and c == 'B')  or  (top == 'C' and c == 'D')

   ⚠ Order matters inside the pair: "BA" and "DC" do NOT cancel.
```

### Trace (`"ABFCACDB"`)

```
   char │ action                   │ stack
   ─────┼──────────────────────────┼──────────────
    A   │ push                     │ [A]
    B   │ top A + B = "AB" → pop   │ [ ]
    F   │ push                     │ [F]
    C   │ push                     │ [F, C]
    A   │ push                     │ [F, C, A]
    C   │ push                     │ [F, C, A, C]
    D   │ top C + D = "CD" → pop   │ [F, C, A]
    B   │ top A + B = "AB" → pop   │ [F, C]      ← chain reaction

   answer = size of stack = 2 ✅
```

### Pseudocode

```
function minLength(s):
    st ← empty
    for each c in s:
        if st not empty and ((st.top == 'A' and c == 'B') or
                             (st.top == 'C' and c == 'D')):
            st.pop()
        else:
            st.push(c)
    return size(st)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Repeated find-and-replace | O(n²) | O(n) |
| **Stack** | **O(n)** | **O(n)** ✅ |

### 📌 Points to remember
- Greedy removal is safe: removing a pair can only help other pairs meet.
- Answer is the **length**, so you never even need to build the string.

---

## 5. Bonus: Remove All Adjacent Duplicates II (Medium)

> Not in your list. It is the natural next step after problem 2: remove **k** equal adjacent chars at once.

### Problem
Repeatedly remove `k` adjacent equal letters. Return the final string.

### Idea: store (char, count) on the stack

```
   Pushing the same char again doesn't add a new box; it bumps the counter.
   When the counter hits k, the whole box disappears.

        │ (e, 3) │  ← count reached k=3 → pop the whole box
        │ (d, 1) │
        └────────┘
```

### Trace (`"deeedbbcccbdaa"`, k = 3)

```
   char │ action                         │ stack of (char, count)
   ─────┼────────────────────────────────┼────────────────────────────
    d   │ new                            │ (d,1)
    e   │ new                            │ (d,1) (e,1)
    e   │ same → count 2                 │ (d,1) (e,2)
    e   │ same → count 3 = k → pop       │ (d,1)
    d   │ same as top → count 2          │ (d,2)
    b   │ new                            │ (d,2) (b,1)
    b   │ same → count 2                 │ (d,2) (b,2)
    c   │ new                            │ (d,2) (b,2) (c,1)
    c   │ count 2                        │ (d,2) (b,2) (c,2)
    c   │ count 3 = k → pop              │ (d,2) (b,2)
    b   │ count 3 = k → pop              │ (d,2)
    d   │ count 3 = k → pop              │ [ ]
    a   │ new                            │ (a,1)
    a   │ count 2                        │ (a,2)

   expand: "aa" ✅
```

### Pseudocode

```
function removeDuplicatesK(s, k):
    st ← empty stack of (char, count)
    for each c in s:
        if st not empty and st.top.char == c:
            st.top.count ← st.top.count + 1
            if st.top.count == k: st.pop()
        else:
            st.push((c, 1))
    return concatenation of char × count, bottom → top
```

### 📌 Points to remember
- Storing counts avoids re-scanning the last k−1 characters each time.
- With k = 2 this is exactly problem 2.
- Time **O(n)**, space **O(n)**.

---

## 6. Master Cheat Sheet

### All problems at a glance

```
┌─────────────────────────────────┬────────────────────────────────────┬───────────────┬──────────┐
│ Problem                         │ CANCELS(top, c)                    │ Return        │ Best     │
├─────────────────────────────────┼────────────────────────────────────┼───────────────┼──────────┤
│ Backspace String Compare        │ c == '#'  (pop if non-empty)       │ s' == t'      │ O(n),O(1)│
│ Remove Adjacent Duplicates      │ top == c                           │ string        │ O(n),O(n)│
│ Make the String Great           │ |top − c| == 32                    │ string        │ O(n),O(n)│
│ Min Length After Removing Subs  │ top+c ∈ {"AB","CD"}                │ stack size    │ O(n),O(n)│
│ Bonus: Adjacent Duplicates II   │ top.char == c, pop at count k      │ expanded str  │ O(n),O(n)│
└─────────────────────────────────┴────────────────────────────────────┴───────────────┴──────────┘
```

### Pattern family tree

```
                     STACK SIMULATION / UNDO
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                     │
     UNDO KEY             PAIR CANCEL            GROUP CANCEL
   ('#' pops top)     (top & c annihilate)     ((char,count) box)
          │                    │                     │
   └ Backspace Compare  ├ Adjacent Duplicates  └ Adjacent Duplicates II
     (+ O(1) two-ptr)   ├ Make the String Great
                        └ Removing "AB"/"CD"
```

### Optimization checklist

```
  ☐ "Repeat until no change"?           → one stack pass handles chain reactions
  ☐ Only the final length needed?       → return stack size, don't build the string
  ☐ Can the answer be built in place?   → use the string builder as the stack
  ☐ Deletions only affect the LEFT?     → scan from the END with a skip counter, O(1) space
  ☐ Groups of k instead of pairs?       → store (char, count) per stack entry
```

### 🚩 Common bugs to avoid

```
  ✗ Popping an empty stack on '#' (backspace at the start)
  ✗ Two-pointer compare: returning true when only ONE string is exhausted
  ✗ Make Great: cancelling "ee" (same case) — the diff must be exactly 32
  ✗ Removing Substrings: cancelling "BA" or "DC" (order inside the pair matters)
  ✗ Rescanning the whole string after each removal (O(n²))
  ✗ Forgetting to reverse when you pop the stack into a string
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "When I read this character, does it cancel with the    ║
   ║   nearest SURVIVING character to its left?"              ║
   ╚══════════════════════════════════════════════════════════╝
        Yes → pop.  No → push.  The stack top IS that character.
```

---

### ✅ Progress tracker

- [ ] Backspace String Compare (Easy)
- [ ] Remove All Adjacent Duplicates in String (Easy)
- [ ] Make the String Great (Easy)
- [ ] Minimum String Length After Removing Substrings (Easy)
