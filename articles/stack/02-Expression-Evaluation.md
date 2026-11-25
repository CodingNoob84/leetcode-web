# Expression Evaluation with Stacks: A Visual Guide

> **Goal:** Learn to *see* how a stack turns a flat string of tokens into a computed answer,
> and handle precedence, parentheses, signs, and nesting without getting lost.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: Why Stacks Evaluate Expressions](#0-the-big-idea-why-stacks-evaluate-expressions)
1. [Evaluate Reverse Polish Notation (Medium)](#1-evaluate-reverse-polish-notation-medium)
2. [Basic Calculator II (Medium)](#2-basic-calculator-ii-medium)
3. [Basic Calculator (Hard)](#3-basic-calculator-hard)
4. [Decode String (Medium)](#4-decode-string-medium)
5. [Master Cheat Sheet](#5-master-cheat-sheet)

> **Suggested order:** Evaluate RPN → Basic Calculator II → Basic Calculator → Decode String.
> RPN is the purest "stack evaluates expressions" problem. Calculator II adds **precedence**,
> Calculator adds **parentheses and signs**, and Decode String reuses the same
> "save state on `[`, restore on `]`" trick on strings instead of numbers.

---

## 0. The Big Idea: Why Stacks Evaluate Expressions

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "EXPRESSION STACK"                      │
├──────────────────────────────────────────────────────────────────┤
│  • Input is a formula: "3+2*2", "(1+(4+5))", ["2","1","+"]       │
│  • Operators with PRECEDENCE: * and / before + and -             │
│  • PARENTHESES / BRACKETS that nest: ( ( ) ), 3[a2[c]]           │
│  • "Evaluate", "calculate", "decode", "expand"                   │
│  • Something must be REMEMBERED until a later token finishes it  │
└──────────────────────────────────────────────────────────────────┘
```

### Three ways to write the same expression

```
   Expression:  (3 + 2) * 4

   INFIX    (how humans write)     (3 + 2) * 4        operator BETWEEN operands
                                                      needs parentheses + precedence
   POSTFIX  (Reverse Polish)       3 2 + 4 *          operator AFTER operands
                                                      NO parentheses ever needed
   PREFIX   (Polish)               * + 3 2 4          operator BEFORE operands
```

### The expression tree behind all three

```
                 ( * )
                /     \
             ( + )    ( 4 )
            /     \
         ( 3 )   ( 2 )

   Walk it in different orders:
     in-order   (left, ROOT, right)  →  3 + 2 * 4      (needs parens to be correct)
     post-order (left, right, ROOT)  →  3 2 + 4 *      ← postfix
     pre-order  (ROOT, left, right)  →  * + 3 2 4      ← prefix
```

### Why a stack evaluates postfix perfectly

```
  Rule:  number   → PUSH it
         operator → POP two, compute, PUSH the result

   token:   3        2        +         4        *
          ┌───┐    ┌───┐    ┌───┐     ┌───┐    ┌────┐
          │   │    │ 2 │    │   │     │ 4 │    │    │
          │ 3 │    │ 3 │    │ 5 │     │ 5 │    │ 20 │  ✅
          └───┘    └───┘    └───┘     └───┘    └────┘
                           3+2=5             5*4=20

  An operator always works on the MOST RECENT unfinished values.
  "Most recent first" = LIFO = STACK.
```

> 💡 **Key insight:** a stack remembers **unfinished work**. Each pushed value says
> "I'm waiting for something later to combine with me."

### Precedence: the "defer or do now" decision

```
   "2 + 3 * 4 - 5"

   +  and  −   → DEFER: push the signed number, add everything at the end
   *  and  /   → DO NOW: combine immediately with the stack's top

        push 2        push 3      3*4 → replace top     push −5
        ┌───┐         ┌───┐         ┌────┐              ┌────┐
        │   │         │ 3 │         │ 12 │              │ −5 │
        │ 2 │         │ 2 │         │  2 │              │ 12 │
        └───┘         └───┘         └────┘              │  2 │
                                                        └────┘
                                         sum = 2 + 12 − 5 = 9 ✅
```

### Parsing multi-digit numbers

```
   "123+4"
     '1' → num = 0*10 + 1  = 1
     '2' → num = 1*10 + 2  = 12
     '3' → num = 12*10 + 3 = 123
     '+' → number finished! use 123, then reset num = 0

   ⚠ Never treat each digit as its own number.
```

### Integer division: truncate TOWARD ZERO

```
     7 / 2  =  3.5  →  3
    −7 / 2  = −3.5  → −3      ✅ truncate toward zero (what these problems want)
                    → −4      ❌ floor division (rounds down)

   number line:   −4    −3.5   −3     ...     3    3.5    4
                   ◄──── floor        trunc ──►       (trunc moves toward 0)

   ⚠ Some languages' integer-division operator FLOORS (e.g. Python's //).
     Use a truncating division there.
```

### Bonus: Shunting-yard (infix → postfix), in one picture

```
  Dijkstra's algorithm with an OPERATOR stack and an OUTPUT list:
    • number         → output
    • operator op    → pop operators with ≥ precedence to output, then push op
    • '('            → push
    • ')'            → pop to output until '('

   "3 + 4 * 2"
     3 → out: 3
     + → push            ops: [+]
     4 → out: 3 4
     * → top '+' is lower, just push      ops: [+, *]
     2 → out: 3 4 2
     end → pop all       out: 3 4 2 * +   ✅ then evaluate like RPN
```

> You rarely need full Shunting-yard in interviews. The problems below use
> lighter "one-pass" tricks that do the same job.

### The 4-step recipe

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  TOKENIZE      What are the pieces? numbers (multi-    │
 │                       digit!), operators, brackets, spaces    │
 │ STEP 2  WHAT WAITS?   What can't be finished yet? That is     │
 │                       what goes on the stack.                 │
 │ STEP 3  WHAT TRIGGERS An operator? a ')'? a ']'? That token   │
 │         A COLLAPSE?   pops and combines.                      │
 │ STEP 4  FLUSH         At the end, apply the last pending      │
 │                       number/operator. (#1 forgotten step!)   │
 └───────────────────────────────────────────────────────────────┘
```

---

## 1. Evaluate Reverse Polish Notation (Medium)

### Problem
Evaluate an expression given as postfix tokens, e.g. `["2","1","+","3","*"]`.
Operators: `+ - * /`. Division truncates toward zero.

### Visualize it

```
   tokens:  [ "2", "1", "+", "3", "*" ]

            2 1 +  3 *      =  (2 + 1) * 3  =  9
            └─┬─┘
              3   3 *
              └─┬──┘
                9
```

### The decision at each token

```
                      token
              ┌─────────┴──────────┐
          a NUMBER             an OPERATOR
              │                     │
          PUSH it          b ← POP   (the RIGHT operand, pushed last)
                           a ← POP   (the LEFT operand)
                           PUSH (a op b)
```

### ⚠️ Order matters for `−` and `/`

```
   ["5", "3", "-"]   means   5 − 3 = 2

     stack after pushes:   ┌───┐
                           │ 3 │  ← top = b (popped FIRST)
                           │ 5 │  ← a       (popped SECOND)
                           └───┘
     result = a − b = 5 − 3 = 2   ✅
     result = b − a = 3 − 5 = −2  ❌ classic bug
```

### The 4 steps

| Step | Answer |
|------|--------|
| Tokenize | Already tokens. A token like `"-11"` is a NUMBER, not an operator |
| What waits | Operands not yet used |
| Collapse trigger | Any operator: pop 2, push 1 |
| Flush | The single value left on the stack is the answer |

### Trace `["4", "13", "5", "/", "+"]`

```
  token │ action                    │ stack (bottom → top)
  ──────┼───────────────────────────┼──────────────────────
  "4"   │ push                      │ [4]
  "13"  │ push                      │ [4, 13]
  "5"   │ push                      │ [4, 13, 5]
  "/"   │ b=5, a=13 → 13/5 = 2      │ [4, 2]
  "+"   │ b=2, a=4  → 4+2  = 6      │ [6]
                                         answer = 6 ✅
```

### Trace with truncation `["-7", "2", "/"]`

```
  "-7"  │ push (it's a number!)     │ [−7]
  "2"   │ push                      │ [−7, 2]
  "/"   │ b=2, a=−7 → −3.5 → −3     │ [−3]      ✅ (not −4)
```

### Pseudocode

```
function evalRPN(tokens):
    stack ← empty
    for each t in tokens:
        if t is one of "+", "-", "*", "/":
            b ← pop(stack)
            a ← pop(stack)
            if t == "+": push(stack, a + b)
            if t == "-": push(stack, a − b)
            if t == "*": push(stack, a * b)
            if t == "/": push(stack, truncateTowardZero(a / b))
        else:
            push(stack, toInteger(t))
    return pop(stack)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Stack | O(n) | O(n) |

### 📌 Points to remember
- **Pop `b` first, then `a`.** Compute `a op b`.
- `"-11"` is a number. Check for an operator by **exact match**, not by "starts with `-`".
- Truncate toward zero on division.
- Postfix needs no precedence rules and no parentheses. The order of tokens already encodes them.

---

## 2. Basic Calculator II (Medium)

### Problem
Evaluate a string with non-negative integers, `+ - * /` and spaces. **No parentheses.**
`*` and `/` bind tighter than `+` and `−`. Division truncates toward zero.

### Visualize it

```
   "3 + 2 * 2"

   human reading:   3 + (2 * 2)  =  3 + 4  =  7

   stack idea:      the stack holds TERMS that will be ADDED at the end
                    [ +3 ][ +4 ]   → 3 + 4 = 7
```

### The trick: remember the operator BEFORE the current number

```
   Each number is "owned" by the operator to its LEFT.

      + 3   + 2   * 2         (pretend there's a '+' before the first number)
      ───   ───   ───
       │     │     │
       │     │     └── '*' → pop top, multiply, push back
       │     └──────── '+' → push +2
       └────────────── '+' → push +3

   When do we apply it? When the number ENDS:
     at the next operator, or at the end of the string.
```

### The decision when a number ends

```
               prevSign (the operator before this number)
     ┌──────────┬───────────┴──────────┬───────────────────┐
    '+'        '−'                    '*'                 '/'
     │          │                      │                   │
  push num   push −num        push( pop() * num )   push( trunc(pop() / num) )

   + and − DEFER (just push a signed term)
   * and / DO NOW (combine with the most recent term)
   Answer = sum of the stack
```

### The 4 steps

| Step | Answer |
|------|--------|
| Tokenize | digits build `num`; spaces are skipped; operators end a number |
| What waits | Signed terms to be added at the end |
| Collapse trigger | `*` or `/` as the previous sign → combine with top immediately |
| Flush | After the loop, apply the last `prevSign` with the last `num` |

### Trace `"3+2*2"`

```
  char │ num │ prevSign │ action when number ends      │ stack
  ─────┼─────┼──────────┼──────────────────────────────┼──────────
  '3'  │  3  │   '+'    │                              │ []
  '+'  │  0  │   '+'    │ apply '+' with 3 → push 3    │ [3]
  '2'  │  2  │   '+'    │                              │ [3]
  '*'  │  0  │   '*'    │ apply '+' with 2 → push 2    │ [3, 2]
  '2'  │  2  │   '*'    │                              │ [3, 2]
  end  │     │          │ apply '*' with 2 → 2*2 = 4   │ [3, 4]
                                                    sum = 7 ✅
```

### Trace `" 3/2 "`

```
  ' '  │ skip
  '3'  │ num = 3
  '/'  │ apply '+' with 3 → push 3       │ [3]      prevSign = '/'
  '2'  │ num = 2
  ' '  │ skip  (spaces must NOT trigger anything)
  end  │ apply '/' with 2 → 3/2 = 1      │ [1]
                                    sum = 1 ✅
```

### Trace `"3+5 / 2"`

```
  '3'  │ num = 3
  '+'  │ apply '+' → push 3              │ [3]      prevSign = '+'
  '5'  │ num = 5
  ' '  │ skip
  '/'  │ apply '+' → push 5              │ [3, 5]   prevSign = '/'
  ' '  │ skip
  '2'  │ num = 2
  end  │ apply '/' → pop 5, 5/2 = 2      │ [3, 2]
                                    sum = 5 ✅
```

### Why truncation toward zero matters here: `"14-3/2"`

```
  '1','4' → num = 14
  '-'  │ apply '+' → push 14             │ [14]      prevSign = '-'
  '3'  │ num = 3
  '/'  │ apply '-' → push −3             │ [14, −3]  prevSign = '/'
  '2'  │ num = 2
  end  │ apply '/' → pop −3, −3/2        │
       │   trunc → −1  ✅  [14, −1] → 13
       │   floor → −2  ❌  [14, −2] → 12
```

> The negative term lives on the stack, so `/` sees `−3`, not `3`. Truncation keeps it correct.

### Pseudocode

```
function calculate(s):
    stack ← empty
    num ← 0
    prevSign ← '+'
    for each c in s:
        if c is a digit:
            num ← num * 10 + digitValue(c)
        else if c is one of '+', '-', '*', '/':
            apply(stack, prevSign, num)
            prevSign ← c
            num ← 0
        // spaces: do nothing
    apply(stack, prevSign, num)          // ⚠ flush the last number
    return sum of stack

function apply(stack, sign, num):
    if sign == '+': push(stack, num)
    if sign == '-': push(stack, −num)
    if sign == '*': push(stack, pop(stack) * num)
    if sign == '/': push(stack, truncateTowardZero(pop(stack) / num))
```

### 🚀 Optimization: O(1) space

```
  The stack only ever needs its TOP to be modified.
  Everything below the top is just waiting to be summed.

   stack:  [ 2, 12, −5 ]   ──►   result = 2 + 12  (finished terms)
                                 last   = −5      (the only term * or / can touch)

  When a '+' / '−' term ends:  result ← result + last;  last ← ±num
  When a '*' / '/' term ends:  last ← last * num   (or trunc(last / num))
  At the very end:             return result + last
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Stack of terms | O(n) | O(n) |
| **`result` + `last` variables** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- Store the **previous** operator. A number is applied when it **ends**.
- Spaces are just skipped. They must never trigger "apply".
- **Flush after the loop**, or the last number is lost.
- Push `−num` for subtraction, so the final step is always just a sum.
- Truncate toward zero; negative terms make this matter.

---

## 3. Basic Calculator (Hard)

### Problem
Evaluate a string with non-negative integers, `+`, `−`, **parentheses**, and spaces.
`−` may be **unary** (e.g. `"-(2+3)"`, `"-2+1"`). No `*` or `/`.

### Visualize it

```
   "(1+(4+5+2)-3)+(6+8)"

        ( 1 + ( 4 + 5 + 2 ) − 3 )  +  ( 6 + 8 )
              └─────┬─────┘
                   11
        └──────────┬──────────┘       └───┬───┘
            1 + 11 − 3 = 9                14
        └─────────────────┬──────────────────┘
                     9 + 14 = 23
```

### Only + and −, so keep a running total and a sign

```
   result = sum of finished terms at THIS parenthesis level
   sign   = +1 or −1, the sign for the NEXT number
   num    = the number being read

   On '+':  result += sign * num;  sign = +1;  num = 0
   On '−':  result += sign * num;  sign = −1;  num = 0
```

### Parentheses: save the outer world, start fresh, then merge

```
   On '(':                               On ')':
   ┌───────────────────────────┐         ┌──────────────────────────────────┐
   │ push (result, sign)       │         │ result += sign * num;  num = 0   │
   │ result = 0                │         │ (prevResult, prevSign) = pop     │
   │ sign   = +1               │         │ result = prevResult              │
   └───────────────────────────┘         │          + prevSign * result     │
                                         └──────────────────────────────────┘

        outer: result=9, sign=+         push (9, +)
        ─────────────────────── ( ────────────────────────
        inner world starts at 0                 6 + 8 = 14
        ─────────────────────── ) ────────────────────────
        merge: 9 + (+1)(14) = 23

   The SIGN BEFORE '(' is saved with the outer result, so "−( ... )"
   flips the whole group when merging.
```

### The 4 steps

| Step | Answer |
|------|--------|
| Tokenize | digits build `num`; `+`/`−` end a number; `(` `)` change level; spaces skipped |
| What waits | The outer `(result, sign)` for every open parenthesis |
| Collapse trigger | `)` → finish inner result, merge into outer |
| Flush | After the loop: `result += sign * num` |

### Trace `"(1+(4+5+2)-3)+(6+8)"`

```
  char │ action                                         │ result │ sign │ stack
  ─────┼────────────────────────────────────────────────┼────────┼──────┼──────────────
  '('  │ push (0,+); reset                              │   0    │  +   │ [(0,+)]
  '1'  │ num = 1                                        │   0    │  +   │ [(0,+)]
  '+'  │ result += 1                                    │   1    │  +   │ [(0,+)]
  '('  │ push (1,+); reset                              │   0    │  +   │ [(0,+),(1,+)]
  '4'  │ num = 4                                        │   0    │  +   │
  '+'  │ result += 4                                    │   4    │  +   │
  '5'  │ num = 5                                        │   4    │  +   │
  '+'  │ result += 5                                    │   9    │  +   │
  '2'  │ num = 2                                        │   9    │  +   │
  ')'  │ result += 2 → 11; pop (1,+) → 1 + 11           │  12    │  +   │ [(0,+)]
  '-'  │ result += 0 (num is 0); sign = −               │  12    │  −   │ [(0,+)]
  '3'  │ num = 3                                        │  12    │  −   │
  ')'  │ result += −3 → 9; pop (0,+) → 0 + 9            │   9    │  −*  │ []
  '+'  │ result += 0; sign = +                          │   9    │  +   │ []
  '('  │ push (9,+); reset                              │   0    │  +   │ [(9,+)]
  '6'  │ num = 6                                        │   0    │  +   │
  '+'  │ result += 6                                    │   6    │  +   │
  '8'  │ num = 8                                        │   6    │  +   │
  ')'  │ result += 8 → 14; pop (9,+) → 9 + 14           │  23    │  +   │ []
  end  │ result += sign * 0                             │  23    │      │
                                                                    answer = 23 ✅
  (* ')' does not reset sign, so it is still − here. That is harmless: num is 0,
     and the next '+' adds 0 and then sets sign = +)
```

### Trace `"-(2+3)"`, a unary minus

```
  char │ action                                │ result │ sign │ stack
  ─────┼───────────────────────────────────────┼────────┼──────┼─────────
  '-'  │ result += +1 * 0 = 0; sign = −        │   0    │  −   │ []
  '('  │ push (0, −); reset                    │   0    │  +   │ [(0,−)]
  '2'  │ num = 2                               │   0    │  +   │
  '+'  │ result += 2                           │   2    │  +   │
  '3'  │ num = 3                               │   2    │  +   │
  ')'  │ result += 3 → 5; pop (0,−) → 0 − 5    │  −5    │      │ []
  end  │                                       │  −5    │      │
                                                    answer = −5 ✅
```

> 💡 Unary minus needs **no special case**: it's just `0 − (...)`, because `result` starts at 0.

### Pseudocode

```
function calculate(s):
    result ← 0
    sign   ← +1
    num    ← 0
    stack  ← empty
    for each c in s:
        if c is a digit:
            num ← num * 10 + digitValue(c)
        else if c == '+' or c == '-':
            result ← result + sign * num
            num  ← 0
            sign ← (c == '+') ? +1 : −1
        else if c == '(':
            push(stack, result)
            push(stack, sign)
            result ← 0
            sign   ← +1
        else if c == ')':
            result ← result + sign * num
            num ← 0
            prevSign   ← pop(stack)
            prevResult ← pop(stack)
            result ← prevResult + prevSign * result
        // spaces: do nothing
    return result + sign * num
```

### Alternative: recursion (one call per parenthesis level)

```
   evaluate(i):  read tokens until ')' or end
                 on '(' → value, i ← evaluate(i+1)   (a recursive call)
                 return (total, index after ')')

   The call stack plays the role of the explicit stack.
   ⚠ Deep nesting → deep recursion. The explicit stack is safer.
```

> Follow-up **Basic Calculator III** (all of `+ − * /` and parentheses): use the recursive
> version, and inside each level run the **Calculator II** term-stack logic.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Explicit stack | O(n) | O(depth of nesting) |
| Recursion | O(n) | O(depth) call stack |

### 📌 Points to remember
- Push **both** the outer `result` and the **sign before `(`**.
- On `)`: first add the pending `num`, then merge `prevResult + prevSign * result`.
- Unary minus works for free because `result` starts at 0.
- Flush at the end: `result + sign * num`.
- Use 64-bit integers if intermediate values could exceed 32 bits.

---

## 4. Decode String (Medium)

### Problem
Decode strings like `"3[a2[c]]"` → `"accaccacc"`. `k[encoded]` means repeat `encoded` k times.
`k` can have **multiple digits**. Brackets nest.

### Visualize it

```
   3[ a 2[ c ] ]

          2[c]  →  "cc"
     a + "cc"   →  "acc"
   3["acc"]     →  "accaccacc"   ✅

   Inside-out, like parentheses in Basic Calculator.
```

### Same pattern as Basic Calculator, with strings

```
       Basic Calculator                    Decode String
   '('  → save (result, sign)       '['  → save (cur, k)
          start fresh                      start fresh: cur = "", k = 0
   ')'  → result =                  ']'  → cur =
          prevResult + sign·result         prevCur + cur repeated k times
```

### The decision at each character

```
                           char
     ┌──────────────┬────────┴───────┬──────────────────────────┐
   DIGIT          '['               ']'                       LETTER
     │              │                │                          │
  k = k*10+d    push k            times ← pop count          cur += c
                push cur          prev  ← pop string
                cur = ""          cur = prev + cur × times
                k = 0
```

### The 4 steps

| Step | Answer |
|------|--------|
| Tokenize | digits (multi-digit `k`), `[`, `]`, letters |
| What waits | The outer string built so far, and the repeat count for the inner group |
| Collapse trigger | `]` → repeat the inner string, append it to the outer one |
| Flush | `cur` holds the answer at the end |

### Trace `"3[a2[c]]"`

```
  char │ action                                   │ cur         │ k │ countStack │ strStack
  ─────┼──────────────────────────────────────────┼─────────────┼───┼────────────┼──────────
  '3'  │ k = 3                                    │ ""          │ 3 │ []         │ []
  '['  │ push 3, push ""; reset                   │ ""          │ 0 │ [3]        │ [""]
  'a'  │ cur += a                                 │ "a"         │ 0 │ [3]        │ [""]
  '2'  │ k = 2                                    │ "a"         │ 2 │ [3]        │ [""]
  '['  │ push 2, push "a"; reset                  │ ""          │ 0 │ [3, 2]     │ ["", "a"]
  'c'  │ cur += c                                 │ "c"         │ 0 │ [3, 2]     │ ["", "a"]
  ']'  │ times=2, prev="a" → "a" + "cc"           │ "acc"       │ 0 │ [3]        │ [""]
  ']'  │ times=3, prev=""  → "" + "accaccacc"     │ "accaccacc" │ 0 │ []         │ []
                                                      answer = "accaccacc" ✅
```

### Trace `"2[abc]3[cd]ef"` (groups side by side)

```
  '2' '['          → push 2, push "";        cur = ""
  'a' 'b' 'c'      → cur = "abc"
  ']'              → "" + "abc"×2            cur = "abcabc"
  '3' '['          → push 3, push "abcabc";  cur = ""
  'c' 'd'          → cur = "cd"
  ']'              → "abcabc" + "cd"×3       cur = "abcabccdcdcd"
  'e' 'f'          → cur = "abcabccdcdcdef"   ✅
```

### Multi-digit count `"10[a]"`

```
  '1' → k = 1
  '0' → k = 1*10 + 0 = 10      ← not "1" then "0"!
  '['  → push 10 ...
  ']'  → "a" × 10 = "aaaaaaaaaa"  ✅
```

### Pseudocode

```
function decodeString(s):
    countStack ← empty
    strStack   ← empty
    cur ← ""
    k   ← 0
    for each c in s:
        if c is a digit:
            k ← k * 10 + digitValue(c)
        else if c == '[':
            push(countStack, k)
            push(strStack, cur)
            cur ← ""
            k   ← 0
        else if c == ']':
            times ← pop(countStack)
            prev  ← pop(strStack)
            cur   ← prev + repeat(cur, times)
        else:                                  // a letter
            cur ← cur + c
    return cur
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Two stacks | O(output length) | O(output length) |
| Recursion (one call per `[`) | O(output length) | O(output length) |

> Use a **string builder** (or a list of characters) for `cur`. Repeated `+` on immutable
> strings can turn this into O(n²) copying.

### 📌 Points to remember
- Save **two** things on `[`: the outer string and the repeat count.
- Reset both `cur` and `k` after pushing.
- `k` can be multi-digit: `k = k*10 + d`.
- On `]`, the order is **prev + (cur × times)**, outer text first.
- The output can be much longer than the input. Time depends on the output size.

---

## 5. Master Cheat Sheet

### All 4 problems at a glance

```
┌──────────────────────┬─────────────────────────────────────────────┬──────────────┬──────────────┐
│ Problem              │ Core idea                                   │ Collapse on  │ Best         │
├──────────────────────┼─────────────────────────────────────────────┼──────────────┼──────────────┤
│ Evaluate RPN         │ number → push; op → pop b, pop a, push a∘b  │ operator     │ O(n), O(n)   │
│ Basic Calculator II  │ prevSign; push ±num; * / combine with top   │ end of num   │ O(n), O(1)   │
│ Basic Calculator     │ result + sign; '(' push (result,sign)       │ ')'          │ O(n), O(d)   │
│ Decode String        │ '[' push (cur, k); ']' prev + cur×k         │ ']'          │ O(output)    │
└──────────────────────┴─────────────────────────────────────────────┴──────────────┴──────────────┘
   d = nesting depth
```

### Pattern family tree

```
                        EXPRESSION EVALUATION
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
   POSTFIX                  PRECEDENCE                NESTING
   (operands stack)         (defer vs do now)         (save state, start fresh,
        │                        │                     merge on close)
   └ Evaluate RPN           └ Basic Calculator II          │
                                                     ├ Basic Calculator   ( )
                                                     └ Decode String      [ ]

   Combine PRECEDENCE + NESTING → Basic Calculator III
```

### The "save state on open, merge on close" card

```
   ┌──────────────┬──────────────────────┬─────────────────────────────────┐
   │ Problem      │ On OPEN, push...     │ On CLOSE, merge as...           │
   ├──────────────┼──────────────────────┼─────────────────────────────────┤
   │ Calculator   │ (result, sign)       │ prevResult + prevSign × inner   │
   │ Decode       │ (cur, k)             │ prevCur + inner × k             │
   │ Calculator III│ recursion call      │ return inner value to caller    │
   └──────────────┴──────────────────────┴─────────────────────────────────┘
```

### Checklist

```
  ☐ Are numbers multi-digit?                   → num = num*10 + d
  ☐ Is there a pending number at the end?      → FLUSH after the loop
  ☐ Is there division?                         → truncate toward zero
  ☐ Does operand order matter (−, /)?          → pop b first, then a
  ☐ Precedence without parentheses?            → stack of signed terms
  ☐ Parentheses / brackets?                    → push outer state, reset, merge on close
  ☐ Only the top of the stack is ever changed? → replace the stack with 1–2 variables
  ☐ Building long strings?                     → string builder
```

### 🚩 Common bugs to avoid

```
  ✗ RPN: computing b − a instead of a − b
  ✗ RPN: treating "-11" as the minus operator
  ✗ Calculator II: letting a space trigger "apply" (breaks " 3/2 ")
  ✗ Calculator II: forgetting to apply the last number after the loop
  ✗ Any: floor division instead of truncation (−3/2 must be −1)
  ✗ Calculator: pushing only result, losing the sign before '('
  ✗ Calculator: forgetting to add the pending num before merging on ')'
  ✗ Decode: reading "10" as two separate counts
  ✗ Decode: forgetting to reset k = 0 after '['
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What is still UNFINISHED when I read this token,       ║
   ║   and which later token will FINISH it?"                 ║
   ╚══════════════════════════════════════════════════════════╝
     The unfinished things go on the stack. The finishing token pops them.
```

---

### ✅ Progress tracker

- [ ] Evaluate Reverse Polish Notation (Medium)
- [ ] Basic Calculator II (Medium)
- [ ] Basic Calculator (Hard)
- [ ] Decode String (Medium)
