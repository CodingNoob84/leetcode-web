# Monotonic Stack: A Visual Guide

> **Goal:** Learn to *see* "next greater / previous smaller" problems, run the stack by hand, and know which order and pop rule to use.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.

---

## Table of Contents

0. [The Big Idea: What Is a Monotonic Stack?](#0-the-big-idea-what-is-a-monotonic-stack)
1. [Next Greater Element I (Easy)](#1-next-greater-element-i-easy)
2. [Daily Temperatures (Medium)](#2-daily-temperatures-medium)
3. [Next Greater Element II (Medium)](#3-next-greater-element-ii-medium)
4. [Online Stock Span (Medium)](#4-online-stock-span-medium)
5. [Asteroid Collision (Medium)](#5-asteroid-collision-medium)
6. [Car Fleet (Medium)](#6-car-fleet-medium)
7. [Largest Rectangle in Histogram (Hard)](#7-largest-rectangle-in-histogram-hard)
8. [Maximal Rectangle (Hard)](#8-maximal-rectangle-hard)
9. [Master Cheat Sheet](#9-master-cheat-sheet)

> **Suggested order:** Next Greater I → Daily Temperatures → Next Greater II → Stock Span
> → Asteroid Collision → Car Fleet → Largest Rectangle → Maximal Rectangle.
> The first four teach the four lookup directions, the middle two use the stack as a "survivors" list,
> and the last two use the stack to find how far a bar can stretch.

---

## 0. The Big Idea: What Is a Monotonic Stack?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "MONOTONIC STACK"                       │
├──────────────────────────────────────────────────────────────────┤
│  • "NEXT greater / smaller element"                              │
│  • "PREVIOUS greater / smaller element"                          │
│  • "How many days until a warmer day?"   (distance to next)      │
│  • "Span" = how far back the values stay ≤ today                 │
│  • Bars / histogram / "largest rectangle" / "trapping"           │
│  • Things moving and COLLIDING / MERGING (asteroids, cars)       │
│  • Brute force is "for each i, scan right until..." → O(n²)      │
└──────────────────────────────────────────────────────────────────┘
```

### The picture: a waiting line of people who haven't found their answer yet

```
  Question: for each person, who is the first TALLER person to their right?

  Walk left → right. Everyone who hasn't found their answer waits in a line (the stack).

        waiting line (stack)              new person arrives
      ┌────────────────────────┐
      │  █                     │
      │  █   █                 │              █
      │  █   █   █             │              █
      │  █   █   █   █         │       ◄──    █   (height 3)
      │  9   7   4   2         │              3
      └────────────────────────┘
        bottom           top

   The new person (3) looks at the line from the TOP:
     • 2 is shorter → "3 is your answer!" → 2 leaves the line (POP)
     • 4 is taller  → stop. 4, 7, 9 keep waiting.
     • 3 joins the line (PUSH)

   Line after:   9   7   4   3        ← still sorted (decreasing)!
```

> 💡 **Key insight:** the line is always **sorted** (that's why it's called *monotonic*).
> A short person standing behind a taller newcomer can never be anyone's answer again,
> so we throw them out. Every element is pushed **once** and popped **at most once**:
> total work is **O(n)**, even with the inner `while` loop.

### The universal template

```
function nextGreater(nums):
    ans   ← array of n, all -1
    stack ← empty                         // holds INDICES, values decreasing
    for i from 0 to n-1:
        while stack not empty and nums[top] < nums[i]:
            j ← pop
            ans[j] ← nums[i]              // i is the first greater to the right of j
        push i
    return ans                            // whatever is left in the stack: no answer (-1)
```

### One scan answers TWO questions

```
  Scanning left → right, at each new element i:

     ┌──────────────────────────────────────────────────────────────┐
     │ Every element you POP          → its NEXT  answer is i       │
     │ The element left on TOP after  → it is the PREVIOUS answer   │
     │ popping (before you push i)       for i                       │
     └──────────────────────────────────────────────────────────────┘

        stack (bottom → top)      i
       [ 9 , 7 , 4 , 2 ]   ◄──   3
                     ▲
              popped: next greater of 2 is 3
                 ▲
              top after popping: previous greater of 3 is 4
```

### The 4-way table

```
┌──────────────────────┬───────────────────┬───────────────────────────┬──────────────────────┐
│ You want...          │ Stack order       │ Pop while (scan L → R)    │ Answer comes from    │
│                      │ (bottom → top)    │                           │                      │
├──────────────────────┼───────────────────┼───────────────────────────┼──────────────────────┤
│ NEXT greater         │ decreasing        │ nums[top] <  nums[i]      │ popped j gets i      │
│ NEXT smaller         │ increasing        │ nums[top] >  nums[i]      │ popped j gets i      │
│ PREVIOUS greater     │ decreasing        │ nums[top] <= nums[i]      │ top after popping    │
│ PREVIOUS smaller     │ increasing        │ nums[top] >= nums[i]      │ top after popping    │
└──────────────────────┴───────────────────┴───────────────────────────┴──────────────────────┘

  Memory trick:
    "GREATER" → stack is DECREASING (small things get kicked out by a big newcomer)
    "SMALLER" → stack is INCREASING (big things get kicked out by a small newcomer)
```

### Strict vs. non-strict: what happens with EQUAL values?

```
  nums = [ 2, 2, 3 ]

  "Next STRICTLY greater"     → pop while top <  cur → equal 2s wait together → both get 3
  "Next greater OR EQUAL"     → pop while top <= cur → the second 2 pops the first one

  Rule: put "=" in the pop condition exactly when an EQUAL value counts as an answer
        for the popped element.
```

### Store INDICES, not values

```
  Index gives you EVERYTHING:
     value    = nums[idx]
     distance = i − idx          (Daily Temperatures, Stock Span)
     width    = i − newTop − 1   (Histogram)

  Values alone lose the position. Default to indices.
```

### Circular arrays: loop twice

```
   nums = [ a, b, c ]        pretend it is   [ a, b, c, a, b, c ]
            0  1  2                            0  1  2  3  4  5
                                                        └─ i % n

   Loop i from 0 to 2n−1, use nums[i % n].
   Push only in the first pass (i < n), so every index has one entry.
```

### Optimization ladder (for the whole pattern)

| Approach | Time | Space |
|---|---|---|
| For each i, scan right/left | O(n²) | O(1) |
| **Monotonic stack** | **O(n)** amortized | O(n) |

---

## 1. Next Greater Element I (Easy)

### Problem
`nums1` is a subset of `nums2` (all values distinct). For each `x` in `nums1`, find the first element **to the right of x in nums2** that is greater than `x`, or `-1`.

### Visualize it

```
   nums2:   1    3    4    2
            │    │    │    │
            └─►3 └─►4 └─►? └─►?      next greater in nums2
                        -1    -1

   nums1 = [4, 1, 2]   →   look up   →   [-1, 3, -1]
```

### Two steps

```
   STEP 1: run the template on nums2, store answers in a MAP  value → next greater
   STEP 2: for each x in nums1, answer = map[x]  (or -1)

   Values are distinct, so the value itself can be the map key.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of nums2 values (decreasing), map `nge[value]` |
| Transition | while top < cur: `nge[pop] = cur`; then push cur |
| Base | empty stack, empty map |
| Order | left → right over nums2 |
| Answer | `[nge[x] or -1 for x in nums1]` |

### Trace (nums1 = [4,1,2], nums2 = [1,3,4,2])

```
  cur │ action                        │ stack (bottom→top) │ map
  ────┼───────────────────────────────┼────────────────────┼──────────────
   1  │ empty → push                  │ [1]                │ {}
   3  │ 1 < 3 → pop 1, nge[1]=3; push │ [3]                │ {1:3}
   4  │ 3 < 4 → pop 3, nge[3]=4; push │ [4]                │ {1:3, 3:4}
   2  │ 4 > 2 → just push             │ [4, 2]             │ {1:3, 3:4}
  end │ 4 and 2 never found an answer │                    │

  nums1:  4 → -1,  1 → 3,  2 → -1     answer = [-1, 3, -1] ✅
```

### Pseudocode

```
function nextGreaterElement(nums1, nums2):
    nge   ← empty map
    stack ← empty
    for each x in nums2:
        while stack not empty and top < x:
            nge[pop] ← x
        push x
    return [ nge[x] if x in nge else -1   for each x in nums1 ]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| For each x, find it in nums2 and scan right | O(m·n) | O(1) |
| **Stack + map** | **O(m + n)** | O(n) |

### 📌 Points to remember
- Solve the problem on the **big array once**, then answer the small one with lookups.
- Values are distinct, so a value can be a map key. With duplicates, key by **index**.
- Leftovers in the stack have no answer → `-1`.

---

## 2. Daily Temperatures (Medium)

### Problem
For each day, how many days until a **warmer** temperature? `0` if never.

### Visualize it

```
  temp:  73  74  75  71  69  72  76  73
  idx:    0   1   2   3   4   5   6   7

   76 │                         █
   75 │         █               █
   74 │     █   █               █
   73 │ █   █   █               █   █
   72 │ █   █   █           █   █   █
   71 │ █   █   █   █       █   █   █
   69 │ █   █   █   █   █   █   █   █
      └──────────────────────────────
        0   1   2   3   4   5   6   7

   day 2 (75) waits until day 6 (76) → 4 days
```

### Next greater, but store the DISTANCE

```
   Same template as problem 1. When j is popped by i:
        ans[j] = i − j          ← that's why we store INDICES
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of indices, temperatures decreasing |
| Transition | while `temp[top] < temp[i]`: `ans[pop] = i − popped`; push i |
| Base | `ans` all 0 |
| Order | left → right |
| Answer | `ans` |

### Trace

```
  i │ temp │ action                                   │ stack (indices) │ temps on stack
  ──┼──────┼──────────────────────────────────────────┼─────────────────┼───────────────
  0 │  73  │ push                                     │ [0]             │ 73
  1 │  74  │ pop 0 → ans[0]=1−0=1; push               │ [1]             │ 74
  2 │  75  │ pop 1 → ans[1]=1; push                   │ [2]             │ 75
  3 │  71  │ push                                     │ [2,3]           │ 75 71
  4 │  69  │ push                                     │ [2,3,4]         │ 75 71 69
  5 │  72  │ pop 4 → ans[4]=1; pop 3 → ans[3]=2;      │ [2,5]           │ 75 72
    │      │ 75 > 72 stop; push                       │                 │
  6 │  76  │ pop 5 → ans[5]=1; pop 2 → ans[2]=4; push │ [6]             │ 76
  7 │  73  │ push                                     │ [6,7]           │ 76 73
  end: 6 and 7 stay → ans = 0

  ans = [1, 1, 4, 2, 1, 1, 0, 0] ✅
```

### Pseudocode

```
function dailyTemperatures(temp):
    ans   ← array of n, all 0
    stack ← empty                     // indices
    for i from 0 to n-1:
        while stack not empty and temp[top] < temp[i]:
            j ← pop
            ans[j] ← i − j
        push i
    return ans
```

### 📌 Points to remember
- Strictly warmer → `<` in the pop condition (an equal day does NOT count).
- Answer is a **distance** → store indices.
- Default answer is `0` here, not `-1`. Read what "no answer" means in each problem.

---

## 3. Next Greater Element II (Medium)

### Problem
Same as Next Greater Element, but the array is **circular**: after the last element, search continues from the start.

### Visualize it

```
        ┌──────────────────────────┐
        ▼                          │
      [ 1 ,  2 ,  1 ]  ────────────┘     wrap around

   1 (idx 0) → 2
   2 (idx 1) → nothing bigger anywhere → -1
   1 (idx 2) → wrap → 1? no → 2 ✅  → 2
```

### Loop twice

```
   i:      0   1   2   3   4   5
   i % n:  0   1   2   0   1   2
           └ pass 1 ─┘ └ pass 2 ─┘
           push + pop   pop ONLY (gives late answers)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of indices, values decreasing |
| Transition | while `nums[top] < nums[i % n]`: `ans[pop] = nums[i % n]` |
| Base | `ans` all -1 |
| Order | i from 0 to 2n−1; push only when i < n |
| Answer | `ans` |

### Trace (nums = [1, 2, 1])

```
  i │ i%n │ val │ action                                   │ stack
  ──┼─────┼─────┼──────────────────────────────────────────┼────────
  0 │  0  │  1  │ push 0                                   │ [0]
  1 │  1  │  2  │ nums[0]=1 < 2 → ans[0]=2; push 1         │ [1]
  2 │  2  │  1  │ 2 > 1 → push 2                           │ [1,2]
  3 │  0  │  1  │ nums[2]=1 < 1? no. (2nd pass: no push)   │ [1,2]
  4 │  1  │  2  │ nums[2]=1 < 2 → ans[2]=2; nums[1]=2 < 2? │ [1]
    │     │     │ no → stop                                │
  5 │  2  │  1  │ nothing                                  │ [1]

  ans = [2, -1, 2] ✅      (index 1 is the maximum → stays → -1)
```

### Pseudocode

```
function nextGreaterElements(nums):
    ans   ← array of n, all -1
    stack ← empty
    for i from 0 to 2n − 1:
        x ← nums[i mod n]
        while stack not empty and nums[top] < x:
            ans[pop] ← x
        if i < n: push i
    return ans
```

### 📌 Points to remember
- **Circular → loop 2n, use i % n.** No need to copy the array.
- Push only in the first pass. Second pass is only for late answers.
- The maximum value never gets popped → always `-1`.
- Still O(n): at most 2n loop steps, n pushes, n pops.

---

## 4. Online Stock Span (Medium)

### Problem
Prices arrive one per day. The **span** of today = how many consecutive days (ending today, going back) had price **≤ today's price**.

### Visualize it

```
  price: 100  80  60  70  60  75  85
  span :   1   1   1   2   1   4   6

  100 │ █
   85 │ █                         █
   80 │ █   █                     █
   75 │ █   █               █     █
   70 │ █   █       █       █     █
   60 │ █   █   █   █   █   █     █
      └──────────────────────────────
       100  80  60  70  60  75   85
                ◄───────────────┤      75's span covers 60, 70, 60, 75 → 4
                                       (it stops at 80, the previous greater price)
```

### Previous GREATER, with a twist: carry the span along

```
   Span today = distance back to the PREVIOUS STRICTLY GREATER price.

   Online → no indices from the future. Store pairs (price, span):
   when today pops a smaller-or-equal day, ABSORB its span.

       stack: [ (100,1) (80,1) (70,2) (60,1) ]   ← today 75 arrives
                                └──┬──┘ └──┬──┘
                                 absorbed  absorbed
       span(75) = 1 + 1 + 2 = 4
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of `(price, span)`, prices strictly decreasing |
| Transition | `span = 1`; while `top.price ≤ price`: `span += pop.span`; push `(price, span)` |
| Base | empty stack |
| Order | one call per day |
| Answer | return `span` each call |

### Trace

```
 price │ pops (absorb span)        │ span │ stack after
 ──────┼───────────────────────────┼──────┼─────────────────────────────────
  100  │ —                         │  1   │ (100,1)
   80  │ —                         │  1   │ (100,1) (80,1)
   60  │ —                         │  1   │ (100,1) (80,1) (60,1)
   70  │ (60,1)                    │  2   │ (100,1) (80,1) (70,2)
   60  │ —                         │  1   │ (100,1) (80,1) (70,2) (60,1)
   75  │ (60,1), (70,2)            │  4   │ (100,1) (80,1) (75,4)
   85  │ (75,4), (80,1)            │  6   │ (100,1) (85,6)

  spans = [1, 1, 1, 2, 1, 4, 6] ✅
```

### Pseudocode

```
class StockSpanner:
    stack ← empty                      // pairs (price, span)

    function next(price):
        span ← 1
        while stack not empty and top.price ≤ price:
            span ← span + pop.span
        push (price, span)
        return span
```

### 📌 Points to remember
- `≤` in the pop condition: equal prices count inside the span.
- Popped days are "covered" by today forever. Their spans are folded into today's.
- Alternative: store `(price, dayIndex)` and use `span = today − prevGreaterIndex`.
- Each price pushed/popped once → amortized **O(1)** per call.

---

## 5. Asteroid Collision (Medium)

### Problem
Each asteroid: size = |value|, direction = sign (+ right, − left). Same speed.
When two meet, the smaller explodes; equal size → both explode. Return the survivors.

### Visualize it

```
   [ 5 , 10 , -5 ]

     5 →   10 →   ← 5        10 meets -5: 10 wins
                              survivors: [5, 10]

   ⚠ Who can collide?  ONLY a right-mover on the LEFT and a left-mover on the RIGHT:

       →  ←    collide ✅          ←  →    move apart ❌
       →  →    same way ❌         ←  ←    same way ❌
```

### The stack = survivors so far

```
   For each new asteroid cur:
     while  top > 0  and  cur < 0:          ← the ONLY collision case
         ┌─────────────────────────┬──────────────────────────────┐
         │ top < |cur|             │ top explodes → pop, continue │
         │ top == |cur|            │ both explode → pop, cur dies │
         │ top > |cur|             │ cur dies, stop               │
         └─────────────────────────┴──────────────────────────────┘
     if cur still alive: push cur
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of surviving asteroids (left → right) |
| Transition | collide while `top > 0 and cur < 0` (table above) |
| Base | empty stack |
| Order | left → right |
| Answer | the stack, bottom → top |

### Trace (asteroids = [3, 5, -6, 2, -1, 4])

```
  cur │ action                                       │ stack
  ────┼──────────────────────────────────────────────┼────────────
   3  │ push                                         │ [3]
   5  │ push                                         │ [3, 5]
  -6  │ top 5 → 5 < 6 → pop 5                        │ [3]
      │ top 3 → 3 < 6 → pop 3                        │ []
      │ empty → -6 survives → push                   │ [-6]
   2  │ push                                         │ [-6, 2]
  -1  │ top 2 → 2 > 1 → -1 explodes                  │ [-6, 2]
   4  │ push                                         │ [-6, 2, 4]

  answer = [-6, 2, 4] ✅
```

```
  More quick checks:
   [8, -8]      → equal → both explode       → []
   [10, 2, -5]  → 2 dies, then 10 beats -5   → [10]
   [-2, -1, 1, 2] → no → ← pair at all       → [-2, -1, 1, 2]
```

### Pseudocode

```
function asteroidCollision(asteroids):
    stack ← empty
    for each cur in asteroids:
        alive ← true
        while alive and stack not empty and top > 0 and cur < 0:
            if top < |cur|:        pop                    // top explodes, keep checking
            else if top == |cur|:  pop; alive ← false     // both explode
            else:                  alive ← false          // cur explodes
        if alive: push cur
    return stack
```

### 📌 Points to remember
- Collision **only** when the stack top moves right (`> 0`) and the new one moves left (`< 0`).
- A left-mover that survives everything sits at the bottom forever. Nothing to its left can hit it.
- The stack is "monotonic" in a looser sense: it never contains a `→ ←` pair.
- O(n) time: each asteroid pushed and popped at most once.

---

## 6. Car Fleet (Medium)

### Problem
Cars on a one-lane road drive to `target`. Car `i` starts at `position[i]` with `speed[i]`.
A faster car **can't pass**; it catches up and joins the slower car's fleet. How many fleets arrive?

### Visualize it

```
  target = 12

  position:  0     3     5          8    10   12 (target)
             C     C     C          C    C    🏁
  speed:     1     3     1          4    2
  time:     12     3     7          1    1      time = (target − pos) / speed

  Look from the car CLOSEST to the target backward:
     10 (t=1)  ── fleet A
      8 (t=1)  ── would arrive at t=1 too → catches A → joins A
      5 (t=7)  ── slower than A → fleet B
      3 (t=3)  ── would arrive before B, but can't pass → joins B
      0 (t=12) ── slower than B → fleet C

  fleets = 3 ✅
```

### The key observation

```
   Sort cars by position, closest to target FIRST.
   A car behind forms a NEW fleet only if it needs MORE time than the fleet ahead.

   stack of fleet arrival times (strictly increasing from bottom to top):

      time ≤ top  →  catches up, merges (don't push)
      time >  top  →  new fleet (push)
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of fleet arrival times |
| Transition | `t = (target − pos) / speed`; push only if stack empty or `t > top` |
| Base | empty stack |
| Order | cars sorted by position **descending** |
| Answer | stack size |

### Trace

```
  sorted by position desc:

  pos │ speed │ time │ compare with top        │ stack (times)
  ────┼───────┼──────┼─────────────────────────┼──────────────
  10  │   2   │  1   │ empty → new fleet       │ [1]
   8  │   4   │  1   │ 1 ≤ 1 → joins           │ [1]
   5  │   1   │  7   │ 7 > 1 → new fleet       │ [1, 7]
   3  │   3   │  3   │ 3 ≤ 7 → joins           │ [1, 7]
   0  │   1   │ 12   │ 12 > 7 → new fleet      │ [1, 7, 12]

  fleets = 3 ✅
```

### Pseudocode

```
function carFleet(target, position, speed):
    cars  ← pairs (position[i], speed[i]), sorted by position DESCENDING
    stack ← empty
    for each (pos, spd) in cars:
        t ← (target − pos) / spd                // use real division
        if stack empty or t > top:
            push t
        // else: catches the fleet ahead, merges
    return size of stack
```

### Complexity

| Step | Cost |
|---|---|
| Sort | O(n log n) |
| Scan | O(n) |
| Space | O(n) (only the top is ever needed → can be one variable) |

### 📌 Points to remember
- **Sort by position, closest to the target first.** This is the whole trick.
- Equal time → **merges** (they arrive together = one fleet). So push only on `>`.
- Use floating-point (or compare `(target−p1)·s2` vs `(target−p2)·s1`) to avoid integer division bugs.
- Since only `top` matters, a single variable "slowest time so far" works too.

---

## 7. Largest Rectangle in Histogram (Hard)

### Problem
Bars of width 1 with given heights. Find the area of the largest rectangle inside the histogram.

### Visualize it

```
  heights = [2, 1, 5, 6, 2, 3]

   6 │             █
   5 │         ▓   ▓
   4 │         ▓   ▓
   3 │         ▓   ▓       █
   2 │ █       ▓   ▓   █   █
   1 │ █   █   ▓   ▓   █   █
     └─────────────────────────
       2   1   5   6   2   3

   ▓ = height 5 × width 2 = 10 ✅
```

### The question to ask for every bar

```
   "If THIS bar is the SHORTEST in the rectangle, how wide can the rectangle be?"

        stretch left until a SHORTER bar      stretch right until a SHORTER bar
                   ◄──────────────── [ bar i ] ────────────────►

   left wall  = PREVIOUS SMALLER index
   right wall = NEXT SMALLER index
   width      = right − left − 1
   area       = height[i] × width
```

### One stack gives BOTH walls

```
   Increasing stack. When bar i is SHORTER than the top:

        stack: [ ... , L , T ]        ← T is popped by i
                       ▲    ▲
                       │    └─ the bar we measure
                       └─ new top after pop = PREVIOUS SMALLER of T  (left wall)
        i = NEXT SMALLER of T                                          (right wall)

        area(T) = height[T] × (i − L − 1)
        if stack becomes empty: width = i   (stretches to the very left)
```

### Sentinel: a 0 at the end

```
   heights + [0]  →  the 0 is shorter than everything → it pops ALL leftover bars.
   No separate "empty the stack" loop at the end.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | stack of indices, heights increasing |
| Transition | while `h[top] > h[i]`: pop T, `width = i − newTop − 1` (or `i` if empty), update best |
| Base | empty stack, best = 0 |
| Order | i from 0 to n (index n is the sentinel 0) |
| Answer | best |

### Trace (heights = [2, 1, 5, 6, 2, 3], sentinel 0 at i = 6)

```
  i │ h │ pops: height × (i − newTop − 1)          │ best │ stack (indices)
  ──┼───┼──────────────────────────────────────────┼──────┼────────────────
  0 │ 2 │ —                                        │   0  │ [0]
  1 │ 1 │ pop 0: h=2, empty → width 1 → 2          │   2  │ [1]
  2 │ 5 │ —                                        │   2  │ [1,2]
  3 │ 6 │ —                                        │   2  │ [1,2,3]
  4 │ 2 │ pop 3: h=6, top=2 → 6×(4−2−1)=6×1 = 6    │   6  │
    │   │ pop 2: h=5, top=1 → 5×(4−1−1)=5×2 = 10   │  10  │
    │   │ h[1]=1 > 2? no → push 4                  │      │ [1,4]
  5 │ 3 │ —                                        │  10  │ [1,4,5]
  6 │ 0 │ pop 5: h=3, top=4 → 3×(6−4−1)=3×1 = 3    │  10  │
    │   │ pop 4: h=2, top=1 → 2×(6−1−1)=2×4 = 8    │  10  │
    │   │ pop 1: h=1, empty → 1×6 = 6              │  10  │ [6]

  answer = 10 ✅
```

### Pseudocode

```
function largestRectangleArea(heights):
    h     ← heights + [0]                 // sentinel
    stack ← empty                         // indices, heights increasing
    best  ← 0
    for i from 0 to length(h) − 1:
        while stack not empty and h[top] > h[i]:
            T ← pop
            left  ← (stack empty) ? −1 : top
            width ← i − left − 1
            best  ← max(best, h[T] × width)
        push i
    return best
```

> 💡 Using `left = −1` when the stack is empty makes `width = i − (−1) − 1 = i`. One formula for both cases.

### Complexity

| Approach | Time | Space |
|---|---|---|
| Every pair (l, r), track min | O(n²) | O(1) |
| Divide & conquer on min | O(n log n) avg, O(n²) worst | O(n) |
| **Monotonic stack** | **O(n)** | O(n) |

### 📌 Points to remember
- Think **"each bar as the shortest bar"**. The stack finds its two walls.
- Width uses the **new top after popping**, not the popped index.
- Sentinel `0` at the end flushes the stack. (Some also put a sentinel at the start.)
- Equal heights: `>` or `≥` both give the right max. The last equal bar measures the full width.

---

## 8. Maximal Rectangle (Hard)

### Problem
A binary matrix of `'0'`/`'1'`. Find the largest rectangle containing only `1`s.

### Visualize it

```
         c0 c1 c2 c3 c4
   r0  [ 1  0  1  0  0 ]
   r1  [ 1  0  1  1  1 ]
   r2  [ 1  1  1  1  1 ]
   r3  [ 1  0  0  1  0 ]

   Best:            c2 c3 c4
             r1   [ ▓  ▓  ▓ ]
             r2   [ ▓  ▓  ▓ ]      2 × 3 = 6 ✅
```

### The trick: every row is the FLOOR of a histogram

```
   For each row, heights[c] = number of consecutive 1s going UP from this row.

        cell == '1'  →  heights[c] ← heights[c] + 1     (the bar grows)
        cell == '0'  →  heights[c] ← 0                  (the bar breaks)

   Then run Largest Rectangle in Histogram (problem 7) on that row.

   row 2 as a histogram:
                   c0 c1 c2 c3 c4
      heights  = [  3  1  3  2  2 ]

        █     █
        █     █  █  █
        █  █  █  █  █
       ──────────────────
        c0 c1 c2 c3 c4      best rectangle: height 2 over c2..c4 → 6
```

### Heights row by row

```
   row │ matrix row      │ heights          │ best in histogram
  ─────┼─────────────────┼──────────────────┼──────────────────
   r0  │ 1 0 1 0 0       │ [1, 0, 1, 0, 0]  │ 1
   r1  │ 1 0 1 1 1       │ [2, 0, 2, 1, 1]  │ 3   (height 1 × c2..c4)
   r2  │ 1 1 1 1 1       │ [3, 1, 3, 2, 2]  │ 6   (height 2 × c2..c4)
   r3  │ 1 0 0 1 0       │ [4, 0, 0, 3, 0]  │ 4   (height 4 × c0)

   answer = max = 6 ✅
```

### Histogram trace for row r2 (heights [3,1,3,2,2] + sentinel 0)

```
  i │ h │ pops: height × width                     │ best │ stack
  ──┼───┼──────────────────────────────────────────┼──────┼────────
  0 │ 3 │ —                                        │   0  │ [0]
  1 │ 1 │ pop 0: h=3, empty → 3×1 = 3              │   3  │ [1]
  2 │ 3 │ —                                        │   3  │ [1,2]
  3 │ 2 │ pop 2: h=3, top=1 → 3×(3−1−1) = 3        │   3  │ [1,3]
  4 │ 2 │ h[3]=2 > 2? no → push                    │   3  │ [1,3,4]
  5 │ 0 │ pop 4: h=2, top=3 → 2×(5−3−1) = 2        │   3  │
    │   │ pop 3: h=2, top=1 → 2×(5−1−1) = 6        │   6  │
    │   │ pop 1: h=1, empty → 1×5 = 5              │   6  │ [5]

  row best = 6 ✅
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `heights[c]` for the current row |
| Transition | grow on `'1'`, reset on `'0'`; then histogram max |
| Base | `heights` all 0 |
| Order | rows top → bottom |
| Answer | max over all rows |

### Pseudocode

```
function maximalRectangle(matrix):
    heights ← array of cols, all 0
    best    ← 0
    for each row in matrix:
        for c from 0 to cols − 1:
            if row[c] == '1': heights[c] ← heights[c] + 1
            else:             heights[c] ← 0
        best ← max(best, largestRectangleArea(heights))    // problem 7
    return best
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Every rectangle, check all 1s | O((R·C)³) | O(1) |
| **Row histograms + stack** | **O(R·C)** | O(C) |

### 📌 Points to remember
- **2D → many 1D problems:** each row is the floor of a histogram.
- A `'0'` resets the bar to 0. It does not just "skip" it.
- Reuse problem 7 as a helper. Don't rewrite it.
- Related: Maximal Square is a DP problem (see `../dynammic programming/02-2D-Grid-DP.md` for grid DP ideas); Count Submatrices With All Ones uses the same heights trick.

---

## 9. Master Cheat Sheet

### All 8 problems at a glance

```
┌──────────────────────────────┬──────────────────┬──────────────────────────────────────┬──────────┐
│ Problem                      │ Stack holds      │ Core move                            │ Time     │
├──────────────────────────────┼──────────────────┼──────────────────────────────────────┼──────────┤
│ Next Greater Element I       │ values, decr.    │ pop → nge[pop] = cur; map lookup     │ O(m+n)   │
│ Daily Temperatures           │ indices, decr.   │ pop → ans[j] = i − j                 │ O(n)     │
│ Next Greater Element II      │ indices, decr.   │ loop 2n, i % n, push only i < n      │ O(n)     │
│ Online Stock Span            │ (price, span)    │ pop ≤ price, absorb spans            │ O(1) am. │
│ Asteroid Collision           │ survivors        │ collide only when top>0 and cur<0    │ O(n)     │
│ Car Fleet                    │ fleet times      │ sort pos desc, push if t > top       │ O(nlogn) │
│ Largest Rect. in Histogram   │ indices, incr.   │ pop → h × (i − newTop − 1), sentinel │ O(n)     │
│ Maximal Rectangle            │ indices, incr.   │ row heights + histogram per row      │ O(R·C)   │
└──────────────────────────────┴──────────────────┴──────────────────────────────────────┴──────────┘
```

### Pattern family tree

```
                               MONOTONIC STACK
                                     │
       ┌─────────────────────────────┼──────────────────────────────┐
       │                             │                              │
  "WHO IS NEXT / PREVIOUS?"     "WHO SURVIVES?"            "HOW FAR CAN I STRETCH?"
  (lookup per element)          (stack = survivors)        (both walls at once)
       │                             │                              │
  ├─ Next Greater I             ├─ Asteroid Collision      ├─ Largest Rect. Histogram
  ├─ Daily Temperatures         └─ Car Fleet               └─ Maximal Rectangle
  ├─ Next Greater II (circular)                                 (2D → rows of 1D)
  └─ Online Stock Span (previous)
```

### Which stack? (quick card)

```
   WANT                    ORDER (bottom→top)   POP WHILE           ANSWER FROM
   ─────────────────────   ──────────────────   ─────────────────   ─────────────────
   next greater            decreasing           top <  cur          popped gets cur
   next smaller            increasing           top >  cur          popped gets cur
   previous greater        decreasing           top <= cur          top after popping
   previous smaller        increasing           top >= cur          top after popping
   both smaller walls      increasing           top >  cur          newTop (left), i (right)
```

### Optimization checklist

```
  ☐ Brute force scans right/left for each element?   → Monotonic stack, O(n)
  ☐ Need distance or width?                          → Store INDICES
  ☐ Circular array?                                  → Loop 2n with i % n
  ☐ Online stream, can't look ahead?                 → Store (value, aggregated info)
  ☐ Leftovers need handling at the end?              → Add a sentinel
  ☐ 2D grid of 0/1 and "largest rectangle"?          → Row heights → histogram
  ☐ Only the top is ever read?                       → Replace stack with one variable
```

### 🚩 Common bugs to avoid

```
  ✗ Wrong order: "greater" needs a DECREASING stack
  ✗ < vs <= mixed up → wrong answer when values are equal
  ✗ Storing values when you need distances/widths
  ✗ Histogram width: using the popped index instead of the NEW top
  ✗ Forgetting the sentinel → bars left in the stack are never measured
  ✗ Circular: pushing in the second pass → duplicate indices
  ✗ Asteroids: colliding ← with → (they move apart!)
  ✗ Car Fleet: sorting ascending, or integer division for time
  ✗ Maximal Rectangle: not resetting height to 0 on '0'
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════════╗
   ║  "When a new element arrives, which waiting elements can it  ║
   ║   ANSWER, and which ones can NEVER be useful again?"         ║
   ╚══════════════════════════════════════════════════════════════╝
     Those get popped. Whatever stays is sorted: that is your monotonic stack.
```

---

### ✅ Progress tracker

- [ ] Next Greater Element I (Easy)
- [ ] Daily Temperatures (Medium)
- [ ] Next Greater Element II (Medium)
- [ ] Online Stock Span (Medium)
- [ ] Asteroid Collision (Medium)
- [ ] Car Fleet (Medium)
- [ ] Largest Rectangle in Histogram (Hard)
- [ ] Maximal Rectangle (Hard)
