# Recursive Stack: A Visual Guide

> **Goal:** Learn to change a stack **using only recursion**, with no extra array, list or second stack.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: The Call Stack Is a Hidden Second Stack](#0-the-big-idea-the-call-stack-is-a-hidden-second-stack)
1. [Insert at Bottom of Stack (Medium)](#1-insert-at-bottom-of-stack-medium)
2. [Reverse a Stack (Recursive)](#2-reverse-a-stack-recursive)
3. [Delete Middle Element of Stack (Easy)](#3-delete-middle-element-of-stack-easy)
4. [Bonus: Sort a Stack (Recursive)](#4-bonus-sort-a-stack-recursive)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Insert at Bottom → Reverse → Delete Middle → (bonus) Sort.
> Insert at Bottom is the helper that Reverse is built on, and Sort uses the same shape with one extra check.
> That's why it comes first, even though it's listed as Medium.

> **Drawing convention used everywhere below:** stacks are drawn standing up, **top at the top**.
> In text, a stack is written bottom → top, e.g. `[1, 2, 3]` means 3 is on top.

---

## 0. The Big Idea: The Call Stack Is a Hidden Second Stack

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "RECURSIVE STACK"                       │
├──────────────────────────────────────────────────────────────────┤
│  • "Use ONLY recursion" / "no extra data structure"              │
│  • You must touch the BOTTOM or the MIDDLE of a stack            │
│  • Operations allowed: push, pop, top/peek, isEmpty, size        │
│  • Typical tasks: insert at bottom, reverse, delete middle, sort │
│  • Mostly GeeksforGeeks-style problems                           │
└──────────────────────────────────────────────────────────────────┘
```

### The problem: a stack only lets you see the top

```
        ┌─────┐
        │  4  │  ◄── you can only reach THIS one
        ├─────┤
        │  3  │
        ├─────┤
        │  2  │      to reach the bottom you must
        ├─────┤      pop everything above it...
        │  1  │  ◄── ...but where do the popped items GO?
        └─────┘
```

### The trick: each recursive call holds one item in its local variable

```
   Your stack              The CALL STACK (hidden)
   ┌─────┐                 ┌───────────────────┐
   │     │                 │ call 4: top = 1   │  ← deepest call
   │     │                 ├───────────────────┤
   │     │     pops        │ call 3: top = 2   │
   │     │  ─────────►     ├───────────────────┤
   │     │                 │ call 2: top = 3   │
   │     │                 ├───────────────────┤
   └─────┘                 │ call 1: top = 4   │  ← first call
    empty!                 └───────────────────┘

   Going DOWN  (calling deeper)    = popping items into local variables
   Coming UP   (returning)         = pushing items back, in reverse order
```

> 💡 **Key insight:** "No extra data structure" really means "no extra one *you* create".
> The call stack is a free second stack. Every pending call is one parked item.

### The template (every problem in this file)

```
function solve(stack, ...):
    if BASE CASE:                    // usually: stack is empty, or we reached the target
        do the special action
        return
    top ← pop(stack)                 // 1. park the top in this call
    solve(stack, ...)                // 2. let recursion handle the rest
    ...do work here...               // 3. optional: insert something before restoring
    push(stack, top)                 // 4. put the parked item back
```

```
  Timeline of one call:

   ──── pop ────► [ recurse on the smaller stack ] ──── push back ────►
        ▲                                                   ▲
    item leaves                                        item returns
    the stack                                          ON TOP of whatever
                                                       the recursion built
```

### The 5-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  WHAT DOES ONE CALL PROMISE?                           │
 │         "After solve(stack) returns, the stack is ______."    │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 2  BASE CASE: when can I act directly?                   │
 │         (empty stack, or the top is the element I want)       │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 3  TRUST THE RECURSION on the smaller stack              │
 │         (one item parked in this call)                        │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 4  ON THE WAY BACK, where does my parked item go?        │
 │         simple push? or a helper that places it carefully?    │
 ├───────────────────────────────────────────────────────────────┤
 │ STEP 5  COUNT THE COST: one pass = O(n); a helper inside a    │
 │         pass = O(n²). Space = recursion depth = O(n).         │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Insert at Bottom of Stack (Medium)

### Problem
Given a stack and a value `x`, put `x` at the **bottom**. Every other element keeps its order.

> GFG convention: the function receives the stack and `x`, and returns (or modifies) the stack.

### Visualize it

```
     before            after (x = 0)
     ┌─────┐             ┌─────┐
     │  3  │ top         │  3  │ top
     ├─────┤             ├─────┤
     │  2  │             │  2  │
     ├─────┤             ├─────┤
     │  1  │             │  1  │
     └─────┘             ├─────┤
                         │  0  │ ◄── new bottom
                         └─────┘
```

### The decision picture

```
                 insertAtBottom(stack, x)
                 ┌──────────┴───────────┐
          stack is EMPTY?          stack has items
                 │                       │
           push x. DONE.         park top, recurse,
          (x is the bottom       then push top back
           because nothing       on top of the stack
           is below it)          that now has x at its bottom
```

### The 5 steps

| Step | Answer |
|------|--------|
| Promise | after `insertAtBottom(s, x)`, `s` has `x` at the bottom and the old items in the same order |
| Base | `s` is empty → `push(x)` |
| Recurse | pop `top`, call `insertAtBottom(s, x)` on the smaller stack |
| Way back | `push(top)` |
| Cost | O(n) time, O(n) recursion space |

### Trace: stack `[1, 2, 3]`, x = 0

```
  GOING DOWN (popping into calls)

   call A: stack [1,2,3]  → park 3 → recurse
   call B: stack [1,2]    → park 2 → recurse
   call C: stack [1]      → park 1 → recurse
   call D: stack [ ]      → EMPTY → push 0  → stack [0]

  COMING UP (pushing back)

   call C: push 1  → stack [0, 1]
   call B: push 2  → stack [0, 1, 2]
   call A: push 3  → stack [0, 1, 2, 3]   ✅
```

```
   call D       call C       call B       call A
   ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐
   │     │      │     │      │     │      │  3  │
   │     │      │     │      │  2  │      │  2  │
   │     │      │  1  │      │  1  │      │  1  │
   │  0  │  ──► │  0  │  ──► │  0  │  ──► │  0  │
   └─────┘      └─────┘      └─────┘      └─────┘
   base case    push 1       push 2       push 3
```

### Pseudocode

```
function insertAtBottom(stack, x):
    if isEmpty(stack):
        push(stack, x)
        return
    top ← pop(stack)
    insertAtBottom(stack, x)
    push(stack, top)
```

### 📌 Points to remember
- The base case is **the empty stack**, not "size 1". Only at empty is `x` truly the bottom.
- Order is preserved because items come back in **exact reverse** of how they left (LIFO of the call stack).
- This helper is the building block for **Reverse a Stack**. Make sure you can write it from memory.

---

## 2. Reverse a Stack (Recursive)

### Problem
Reverse the stack in place using only recursion: the old top becomes the bottom.

### Visualize it

```
     before                after
     ┌─────┐               ┌─────┐
     │  4  │ top           │  1  │ top
     ├─────┤               ├─────┤
     │  3  │               │  2  │
     ├─────┤      ──►      ├─────┤
     │  2  │               │  3  │
     ├─────┤               ├─────┤
     │  1  │               │  4  │
     └─────┘               └─────┘
```

### The idea: the old top must end at the bottom

```
   reverse(stack):
      1. park the top (call it T)
      2. reverse everything below it      ← trust recursion
      3. T must now go UNDER all of it    ← insertAtBottom(stack, T)

     ┌───┐
     │ T │ ── park ──┐
     ├───┤           │
     │ … │  reverse  │                 ┌─────────────┐
     │ … │  ───────► │ reversed rest   │ reversed    │
     │ … │           │                 │ rest        │
     └───┘           └──── insert ───► ├─────────────┤
                           at bottom   │      T      │
                                       └─────────────┘
```

> ⚠️ A plain `push(T)` after recursing would put T back on **top**, giving the original stack.
> That's the difference from Insert at Bottom: here the way-back step **is** `insertAtBottom`.

### The 5 steps

| Step | Answer |
|------|--------|
| Promise | after `reverse(s)`, `s` is reversed |
| Base | `s` is empty → nothing to do |
| Recurse | pop `top`, call `reverse(s)` |
| Way back | `insertAtBottom(s, top)` |
| Cost | O(n²) time (n inserts, each up to O(n)), O(n) recursion space |

### Trace: stack `[1, 2, 3, 4]`, top = 4

```
  GOING DOWN (reverse calls)

   reverse([1,2,3,4])  park 4
   reverse([1,2,3])    park 3
   reverse([1,2])      park 2
   reverse([1])        park 1
   reverse([ ])        EMPTY → return

  COMING UP (each level calls insertAtBottom with its parked item)

   level park=1: insertAtBottom([ ], 1)        → [1]
   level park=2: insertAtBottom([1], 2)        → [2, 1]
   level park=3: insertAtBottom([2,1], 3)      → [3, 2, 1]
   level park=4: insertAtBottom([3,2,1], 4)    → [4, 3, 2, 1]   ✅  top is now 1
```

```
   after T=1    after T=2    after T=3    after T=4
   ┌─────┐      ┌─────┐      ┌─────┐      ┌─────┐
   │     │      │     │      │     │      │  1  │ top
   │     │      │     │      │  1  │      │  2  │
   │     │      │  1  │      │  2  │      │  3  │
   │  1  │      │  2  │      │  3  │      │  4  │ bottom
   └─────┘      └─────┘      └─────┘      └─────┘
                   ▲            ▲            ▲
             2 slid under  3 slid under  4 slid under
```

### One inner insertAtBottom, zoomed in (last step: insert 4 under [3,2,1])

```
   stack [3,2,1] (top = 1)
     park 1 → [3,2]
       park 2 → [3]
         park 3 → [ ]
           EMPTY → push 4 → [4]
         push 3 → [4,3]
       push 2 → [4,3,2]
     push 1 → [4,3,2,1]   ✅
```

### Counting the work

```
   insertAtBottom on a stack of size k does k pops + k pushes + 1 push.

   sizes when inserting:  0, 1, 2, ..., n-1
   total ≈ 0 + 1 + 2 + ... + (n-1)  =  n(n-1)/2   →  O(n²)
```

### Pseudocode

```
function reverse(stack):
    if isEmpty(stack):
        return
    top ← pop(stack)
    reverse(stack)
    insertAtBottom(stack, top)

function insertAtBottom(stack, x):      // from problem 1
    if isEmpty(stack):
        push(stack, x)
        return
    t ← pop(stack)
    insertAtBottom(stack, x)
    push(stack, t)
```

### Optimization ladder

| Approach | Time | Extra space | Allowed? |
|---|---|---|---|
| Pop all into an array, push back in the same order | O(n) | O(n) array | ❌ if "recursion only" |
| Pop into a second stack (then swap) | O(n) | O(n) stack | ❌ if "recursion only" |
| **Recursion + insertAtBottom** | **O(n²)** | O(n) call stack | ✅ |

> The O(n²) is the price of the rule "no extra data structure". In a real program you'd use the O(n) way.

### 📌 Points to remember
- **Two recursions:** `reverse` walks down the stack; `insertAtBottom` walks down again for each item.
- Way-back step is `insertAtBottom`, **not** `push`.
- O(n²) time, O(n) space (recursion depth reaches n inside `insertAtBottom` too, never more than about 2n frames).
- Same skeleton as Sort a Stack (section 4): swap `insertAtBottom` for `sortedInsert`.

---

## 3. Delete Middle Element of Stack (Easy)

### Problem
Delete the **middle** element of a stack of size `N` using only recursion. Every other element keeps its order.

### The GFG convention for "middle" (state it before you code!)

```
┌──────────────────────────────────────────────────────────────────┐
│  Middle = the (⌊N/2⌋ + 1)-th element counting FROM THE TOP      │
│                                                                  │
│  Equivalently: skip k = ⌊N/2⌋ elements from the top, then the    │
│  element now on top is the middle. Delete it.                    │
└──────────────────────────────────────────────────────────────────┘
```

Check on both sizes (stack written bottom → top):

```
  ODD  N = 5:  [10, 20, 30, 40, 50]   top = 50
               k = ⌊5/2⌋ = 2 → skip 50, 40 → delete 30
               result [10, 20, 40, 50]                     ✅ the true center

  EVEN N = 4:  [10, 20, 30, 40]       top = 40
               k = ⌊4/2⌋ = 2 → skip 40, 30 → delete 20
               result [10, 30, 40]
               (of the two centers 20 and 30, the one CLOSER TO THE BOTTOM)
```

```
     N = 5                         N = 4
     ┌────┐                        ┌────┐
     │ 50 │ 1st from top  skip     │ 40 │ 1st  skip
     ├────┤                        ├────┤
     │ 40 │ 2nd           skip     │ 30 │ 2nd  skip
     ├────┤                        ├────┤
     │ 30 │ 3rd  ◄── DELETE        │ 20 │ 3rd  ◄── DELETE
     ├────┤                        ├────┤
     │ 20 │ 4th                    │ 10 │ 4th
     ├────┤                        └────┘
     │ 10 │ 5th
     └────┘
```

> Tiny cases: `N = 1` → k = 0 → delete the only element. `N = 2` `[a, b]` → k = 1 → skip b, delete a → `[b]`.
> If your judge counts the middle differently (e.g. from the bottom), only k changes; the recursion stays the same.

### The decision picture

```
              deleteMid(stack, k)       k = how many still to skip
              ┌──────────┴───────────┐
           k == 0                  k > 0
              │                       │
      the top IS the middle    park top, deleteMid(stack, k-1),
      → pop it, DON'T push     then push top back
      → return
```

### The 5 steps

| Step | Answer |
|------|--------|
| Promise | after `deleteMid(s, k)`, the element `k` below the top is gone; others unchanged |
| Base | `k == 0` → `pop` and throw it away |
| Recurse | pop `top`, call `deleteMid(s, k - 1)` |
| Way back | `push(top)` |
| Cost | O(N) time (only ⌊N/2⌋ calls), O(N) recursion space |

### Trace (odd): `[10, 20, 30, 40, 50]`, N = 5, k = 2

```
  GOING DOWN
   deleteMid(k=2): park 50 → stack [10,20,30,40]
   deleteMid(k=1): park 40 → stack [10,20,30]
   deleteMid(k=0): BASE → pop 30 (discarded) → stack [10,20]

  COMING UP
   push 40 → [10, 20, 40]
   push 50 → [10, 20, 40, 50]   ✅
```

### Trace (even): `[10, 20, 30, 40]`, N = 4, k = 2

```
  GOING DOWN
   deleteMid(k=2): park 40 → stack [10,20,30]
   deleteMid(k=1): park 30 → stack [10,20]
   deleteMid(k=0): BASE → pop 20 (discarded) → stack [10]

  COMING UP
   push 30 → [10, 30]
   push 40 → [10, 30, 40]   ✅
```

```
   before          down to base        after
   ┌────┐                              ┌────┐
   │ 40 │  parked (call 1)             │ 40 │
   ├────┤                              ├────┤
   │ 30 │  parked (call 2)             │ 30 │
   ├────┤                              ├────┤
   │ 20 │  ✗ popped & dropped          │ 10 │
   ├────┤                              └────┘
   │ 10 │
   └────┘
```

### Pseudocode

```
function deleteMiddle(stack):
    N ← size(stack)
    deleteMid(stack, ⌊N / 2⌋)

function deleteMid(stack, k):          // k = elements left to skip
    if k == 0:
        pop(stack)                     // this is the middle: drop it
        return
    top ← pop(stack)
    deleteMid(stack, k - 1)
    push(stack, top)
```

> Some GFG versions pass `sizeOfStack` as a parameter and count up with a `current` index instead
> (`if current == ⌊N/2⌋: pop; return`). Same idea, counting up instead of down.

### 📌 Points to remember
- **Write down the middle convention first.** Odd N has one center. Even N needs a rule (GFG: the lower one, ⌊N/2⌋ + 1 from top).
- The base case is "reached the target", not "stack empty". You stop halfway.
- The deleted element is the one you **don't** push back. That's the whole trick.
- Only ⌊N/2⌋ calls → O(N) time, unlike Reverse.

---

## 4. Bonus: Sort a Stack (Recursive)

> Not in your list, but it's the natural next step: **Reverse** with a smarter helper.

### Problem
Sort the stack so the **largest element is on top**, using only recursion (GFG convention).

### Same skeleton as Reverse, different helper

```
        Reverse a Stack                       Sort a Stack
   park top, reverse(rest),         park top, sort(rest),
   insertAtBottom(top)      ──►     sortedInsert(top)
   (always goes to the bottom)      (goes to its CORRECT place in a sorted stack)
```

### The helper: sortedInsert(stack, x), with the stack already sorted (largest on top)

```
              sortedInsert(stack, x)
          ┌──────────┴───────────────┐
   stack empty OR top ≤ x       top > x
          │                          │
     push x. DONE.           park top, sortedInsert(stack, x),
     (x belongs on top)      push top back (it's bigger, stays above x)
```

### Trace: stack `[3, 1, 4, 2]`, top = 2

```
  sort GOING DOWN: park 2, park 4, park 1, park 3 → stack [ ]

  sort COMING UP (each level calls sortedInsert)

   sortedInsert([ ], 3)       → empty → push        → [3]
   sortedInsert([3], 1)       → top 3 > 1: park 3
                                 → [ ] empty → push 1 → [1]
                                 → push 3            → [1, 3]
   sortedInsert([1,3], 4)     → top 3 ≤ 4 → push    → [1, 3, 4]
   sortedInsert([1,3,4], 2)   → top 4 > 2: park 4
                                 → top 3 > 2: park 3
                                 → top 1 ≤ 2: push 2 → [1, 2]
                                 → push 3            → [1, 2, 3]
                                 → push 4            → [1, 2, 3, 4]   ✅ largest on top
```

```
     before           after
     ┌───┐            ┌───┐
     │ 2 │ top        │ 4 │ top (largest)
     ├───┤            ├───┤
     │ 4 │            │ 3 │
     ├───┤    ──►     ├───┤
     │ 1 │            │ 2 │
     ├───┤            ├───┤
     │ 3 │            │ 1 │
     └───┘            └───┘
```

### Pseudocode

```
function sortStack(stack):
    if isEmpty(stack):
        return
    top ← pop(stack)
    sortStack(stack)
    sortedInsert(stack, top)

function sortedInsert(stack, x):       // stack is sorted, largest on top
    if isEmpty(stack) or peek(stack) ≤ x:
        push(stack, x)
        return
    t ← pop(stack)
    sortedInsert(stack, x)
    push(stack, t)
```

### 📌 Points to remember
- It's **insertion sort** done with the call stack. O(n²) time, O(n) recursion space.
- Want smallest on top? Flip the comparison to `peek ≥ x`.
- `≤` vs `<` only matters for where equal values sit. Both give a sorted stack.

---

## 5. Master Cheat Sheet

### All problems at a glance

```
┌───────────────────────┬────────────────────┬─────────────────────────┬───────────────┬────────┐
│ Problem               │ Base case          │ Way-back step           │ Time          │ Space  │
├───────────────────────┼────────────────────┼─────────────────────────┼───────────────┼────────┤
│ Insert at Bottom      │ empty → push x     │ push(top)               │ O(n)          │ O(n)   │
│ Reverse a Stack       │ empty → return     │ insertAtBottom(top)     │ O(n²)         │ O(n)   │
│ Delete Middle         │ k == 0 → pop, drop │ push(top)               │ O(n)          │ O(n)   │
│ (bonus) Sort a Stack  │ empty → return     │ sortedInsert(top)       │ O(n²)         │ O(n)   │
└───────────────────────┴────────────────────┴─────────────────────────┴───────────────┴────────┘
```

### Family tree

```
                        RECURSIVE STACK
                              │
            ┌─────────────────┴──────────────────┐
     ONE PASS (push back as-is)          PASS + HELPER (place carefully)
            │                                    │
     ├─ Insert at Bottom                  ├─ Reverse  = pass + insertAtBottom
     └─ Delete Middle (stop at k)         └─ Sort     = pass + sortedInsert
            │                                    │
          O(n)                                 O(n²)
```

### The template card

```
   ┌──────────────────────────────────────────────┐
   │  if BASE: act, return                        │
   │  top ← pop                                   │
   │  recurse on the smaller stack                │
   │  WAY-BACK STEP  (push / insertAtBottom /     │
   │                  sortedInsert / drop it)     │
   └──────────────────────────────────────────────┘
       Only the BASE CASE and the WAY-BACK STEP change between problems.
```

### Checklist

```
  ☐ What does one call promise about the stack when it returns?
  ☐ Is the base case "empty" or "reached the target" (k == 0, top ≤ x)?
  ☐ On the way back: plain push, or a helper that walks down again?
  ☐ Helper inside a full pass?            → O(n²)
  ☐ Middle problem: which convention for even N? Write it down.
  ☐ Deep stacks: recursion depth = n → stack overflow risk for very large n
```

### 🚩 Common bugs to avoid

```
  ✗ Insert at Bottom: base case at size 1 instead of empty
  ✗ Reverse: pushing `top` back instead of insertAtBottom (stack unchanged!)
  ✗ Delete Middle: pushing the middle back (nothing deleted)
  ✗ Delete Middle: wrong k for even N (deletes the upper center instead of GFG's)
  ✗ Delete Middle: recomputing size inside the recursion (it shrinks as you pop)
  ✗ Sort: comparing with the wrong direction → smallest ends on top
  ✗ Using an extra array/stack when the problem says "recursion only"
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "If I park the top and let recursion fix the rest,      ║
   ║   where does my parked item belong when I come back?"    ║
   ╚══════════════════════════════════════════════════════════╝
       On top → push.  At the bottom → insertAtBottom.
       In order → sortedInsert.  Nowhere → it was the one to delete.
```

---

### ✅ Progress tracker

- [ ] Insert at Bottom of Stack (Medium)
- [ ] Reverse a Stack (Recursive)
- [ ] Delete Middle Element of Stack (Easy)
- [ ] Bonus: Sort a Stack (Recursive)
