# DP on Stocks: A Visual Guide

> **Goal:** See every "Best Time to Buy and Sell Stock" problem as **one state machine** with small tweaks.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-1D-Linear-DP.md](01-1D-Linear-DP.md). Stock DP is 1D DP where each day holds **a few states** instead of one number.

---

## Table of Contents

0. [The Big Idea: One State Machine](#0-the-big-idea-one-state-machine)
1. [Best Time to Buy and Sell Stock (Easy)](#1-best-time-to-buy-and-sell-stock-easy)
2. [Best Time to Buy and Sell Stock II (Medium)](#2-best-time-to-buy-and-sell-stock-ii-medium)
3. [Best Time to Buy and Sell Stock with Transaction Fee (Medium)](#3-best-time-to-buy-and-sell-stock-with-transaction-fee-medium)
4. [Best Time to Buy and Sell Stock with Cooldown (Medium)](#4-best-time-to-buy-and-sell-stock-with-cooldown-medium)
5. [Best Time to Buy and Sell Stock III (Hard)](#5-best-time-to-buy-and-sell-stock-iii-hard)
6. [Best Time to Buy and Sell Stock IV (Hard)](#6-best-time-to-buy-and-sell-stock-iv-hard)
7. [Master Cheat Sheet](#7-master-cheat-sheet)

> **Suggested order:** I (one transaction) → II (unlimited) → Fee → Cooldown → III (k = 2) → IV (any k).
> Each one changes exactly **one arrow** or **one counter** in the same machine.

---

## 0. The Big Idea: One State Machine

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "STOCK DP"                              │
├──────────────────────────────────────────────────────────────────┤
│  • An array of PRICES, one per day                               │
│  • You BUY and SELL to maximize PROFIT                           │
│  • Rules: at most 1 share held, limit of k transactions,         │
│    cooldown after selling, fee per transaction                   │
│  • Each day you are in a MODE: holding a share or not            │
└──────────────────────────────────────────────────────────────────┘
```

### The mental model: two rooms and three doors

```
                        BUY  (pay price)
              ┌──────────────────────────────┐
              │                              ▼
        ┌───────────┐                  ┌───────────┐
   ┌───►│   FREE    │                  │   HOLD    │◄───┐
   │    │ (no stock)│                  │ (1 share) │    │
   │    └───────────┘                  └───────────┘    │
   │          ▲                              │          │
   └─ REST ───┘                              └── REST ──┘
   (do nothing)  └──────────────────────────────┘  (keep holding)
                        SELL  (gain price)

   Every day, each room asks: "What is the MOST money I can have
   if I end today in this room?"
```

### The two equations behind every stock problem

```
   free[today] = max( free[yesterday],                  ← rest
                      hold[yesterday] + price )         ← sell

   hold[today] = max( hold[yesterday],                  ← rest
                      free[yesterday] − price )         ← buy
```

> 💡 **Key insight:** `hold` is "cash in hand while owning a share". It is usually **negative**,
> since you paid for the share. Selling adds the price back.

### The generic framework: `dp[day][k][holding]`

```
   day      = which day we are on               (0 .. n-1)
   k        = how many transactions are still allowed / used
   holding  = 0 (FREE) or 1 (HOLD)

   dp[i][k][0] = max( dp[i-1][k][0],  dp[i-1][k][1]   + price[i] )   rest / sell
   dp[i][k][1] = max( dp[i-1][k][1],  dp[i-1][k-1][0] − price[i] )   rest / buy
                                                   ▲
                                         a BUY uses one transaction
```

### Each variant just tweaks the machine

```
  ┌─────────────────┬──────────────────────────────────────────────────┐
  │ Variant         │ Tweak                                            │
  ├─────────────────┼──────────────────────────────────────────────────┤
  │ I   (k = 1)     │ BUY always starts from 0 cash (−price)           │
  │ II  (k = ∞)     │ drop k entirely: just FREE and HOLD              │
  │ Fee             │ SELL arrow pays the fee: + price − fee           │
  │ Cooldown        │ SELL goes to a COOLDOWN room for one day         │
  │ III (k = 2)     │ two copies of the machine, chained               │
  │ IV  (any k)     │ k copies of the machine, chained                 │
  └─────────────────┴──────────────────────────────────────────────────┘
```

### The 5-step recipe (same as before, with modes)

```
 ┌───────────────────────────────────────────────────────────────┐
 │ STEP 1  STATES       which "rooms" exist? (free, hold, cool…) │
 │ STEP 2  TRANSITIONS  draw the arrows: rest / buy / sell       │
 │ STEP 3  BASE         day 0: hold = −price[0], free = 0        │
 │ STEP 4  ORDER        day by day, left → right                 │
 │ STEP 5  ANSWER       a FREE-type state on the last day        │
 └───────────────────────────────────────────────────────────────┘
```

### The universal space optimization

```
  Each day only reads YESTERDAY → keep a few variables, not a table.

   O(n · k · 2) table  ──►  O(k) variables  ──►  O(1) for k = 1, 2, ∞
```

---

## 1. Best Time to Buy and Sell Stock (Easy)

### Problem
Buy **once**, sell **once** (sell after buying). Maximize profit, or return 0.

### Visualize it

```
  price
    7 ●
    6 │               ●
    5 │       ●       │
    4 │       │       │   ●
    3 │       │   ●   │
    2 │       │       │
    1 │   ●   │       │
      └───┴───┴───┴───┴───┴──► day
          0   1   2   3   4   5

   Buy at the LOWEST point BEFORE, sell at the HIGHEST point AFTER:
   buy day 1 (1) → sell day 4 (6) = 5 ✅
```

### State machine for k = 1

```
         BUY: 0 − price          SELL: hold + price
   ┌────────┐ ────────────► ┌────────┐ ────────────► ┌────────┐
   │ START  │               │  HOLD  │               │  DONE  │
   │ cash 0 │               │        │               │        │
   └────────┘               └────────┘               └────────┘
                              ↻ rest                   ↻ rest

   Only ONE buy is allowed, so buying always starts from 0 cash.
```

### Simpler view: track the cheapest price so far

```
   For each day as a SELL day:
       profit = price − (cheapest price before today)

   hold  ≡  −(cheapest price so far)
   free  ≡  best profit so far
```

### The 5 steps

| Step | Answer |
|------|--------|
| States | `hold` = best cash while holding, `free` = best cash after selling |
| Transitions | `hold = max(hold, −price)`, `free = max(free, hold + price)` |
| Base | `hold = −price[0]`, `free = 0` |
| Order | day by day |
| Answer | `free` |

### Trace (prices = [7, 1, 5, 3, 6, 4])

```
  day   price  │ minPrice │ price − min │ best
  ─────────────┼──────────┼─────────────┼──────
   0      7    │    7     │      0      │  0
   1      1    │    1     │      0      │  0
   2      5    │    1     │      4      │  4
   3      3    │    1     │      2      │  4
   4      6    │    1     │      5      │  5   ✅
   5      4    │    1     │      3      │  5
```

### Pseudocode

```
function maxProfit(prices):
    minPrice ← +∞
    best     ← 0
    for each p in prices:
        minPrice ← min(minPrice, p)
        best     ← max(best, p − minPrice)
    return best
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Try every (buy, sell) pair | O(n²) | O(1) |
| **One pass, track min** | **O(n)** | **O(1)** ✅ |

### 📌 Points to remember
- "Best sell today" only needs "**cheapest buy before today**". That's the DP state.
- The answer is never negative: you may choose not to trade.
- In the machine, the key detail is **buy from 0**, not from `free`. That is what limits it to one transaction.

---

## 2. Best Time to Buy and Sell Stock II (Medium)

### Problem
Unlimited transactions, but you can hold **at most one share** at a time.

### Visualize it

```
  price
    6 │               ●
    5 │       ●      ╱
    4 │      ╱ ╲    ╱  ╲●
    3 │     ╱   ●──╱
    2 │    ╱
    1 │   ●
      └───┴───┴───┴───┴───┴──► day
          0   1   2   3   4   5    (day 0 = 7, off the top)

   Ride EVERY upward slope:
      1 → 5  (+4)
      3 → 6  (+3)          total = 7 ✅
```

### State machine for k = ∞

```
                 BUY: free − price
          ┌──────────────────────────┐
          │                          ▼
     ┌────────┐                ┌────────┐
  ↻  │  FREE  │                │  HOLD  │  ↻
     └────────┘                └────────┘
          ▲                          │
          └──────────────────────────┘
                 SELL: hold + price

   Difference from I: BUY now starts from FREE (your earlier profits),
   not from 0. That is what allows many transactions.
```

### The 5 steps

| Step | Answer |
|------|--------|
| States | `free`, `hold` |
| Transitions | `free = max(free, hold + p)`, `hold = max(hold, free − p)` |
| Base | `hold = −price[0]`, `free = 0` |
| Order | day by day, using **yesterday's** values on the right side |
| Answer | `free` |

### Trace (prices = [7, 1, 5, 3, 6, 4])

```
  day  price │  free = max(free, hold+p)  │  hold = max(hold, free−p)
  ───────────┼────────────────────────────┼──────────────────────────
   0     7   │  0                         │  −7
   1     1   │  max(0, −7+1)  = 0         │  max(−7, 0−1)  = −1
   2     5   │  max(0, −1+5)  = 4         │  max(−1, 0−5)  = −1
   3     3   │  max(4, −1+3)  = 4         │  max(−1, 4−3)  =  1
   4     6   │  max(4,  1+6)  = 7         │  max( 1, 4−6)  =  1
   5     4   │  max(7,  1+4)  = 7  ✅     │  max( 1, 7−4)  =  3
```

### The greedy shortcut: sum of every rise

```
  prices:    7    1    5    3    6    4
  change:      −6   +4   −2   +3   −2
  keep +:           +4        +3          = 7 ✅

  Why it works: a long climb 1 → 3 → 5 equals (3−1) + (5−3).
  Buying and selling every day of a climb is the same as one big trade.
```

### Pseudocode (state machine)

```
function maxProfitII(prices):
    free ← 0
    hold ← −prices[0]
    for i from 1 to n−1:
        p ← prices[i]
        newFree ← max(free, hold + p)
        newHold ← max(hold, free − p)
        free ← newFree
        hold ← newHold
    return free
```

### Pseudocode (greedy)

```
function maxProfitIIGreedy(prices):
    profit ← 0
    for i from 1 to n−1:
        if prices[i] > prices[i−1]:
            profit ← profit + (prices[i] − prices[i−1])
    return profit
```

### 📌 Points to remember
- Unlimited k → **the k dimension disappears**.
- Greedy works here, but **learn the machine**. Fee and cooldown break the greedy; they don't break the machine.
- Using new `free` to compute `hold` on the same day only adds a "sell then rebuy at the same price" move, which is worth 0. It's harmless here, but using yesterday's values is the safe habit.

---

## 3. Best Time to Buy and Sell Stock with Transaction Fee (Medium)

### Problem
Unlimited transactions, but each **complete transaction costs a fee**.

### Visualize it

```
  price      fee = 2
    9 │                    ●
    8 │           ●       ╱
    4 │          ╱ ╲     ●
    3 │    ●    ╱   ╲   ╱
    2 │   ╱ ╲  ●     ╲ ╱
    1 │  ●   ╲╱       ●
      └──┴────┴────┴────┴────┴────┴──► day
         0    1    2    3    4    5

   Small wiggles (1→3, 4→9 vs 8→4) are not worth a fee each.
   Best: buy 1, sell 8 (7 − 2 = 5);  buy 4, sell 9 (5 − 2 = 3)  → 8 ✅
   Greedy "every rise" would pay the fee too many times.
```

### State machine with a fee on the SELL arrow

```
                 BUY: free − price
          ┌──────────────────────────┐
          │                          ▼
     ┌────────┐                ┌────────┐
  ↻  │  FREE  │                │  HOLD  │  ↻
     └────────┘                └────────┘
          ▲                          │
          └──────────────────────────┘
             SELL: hold + price − FEE        ← the only change from II
```

### The 5 steps

| Step | Answer |
|------|--------|
| States | `free`, `hold` |
| Transitions | `free = max(free, hold + p − fee)`, `hold = max(hold, free − p)` |
| Base | `hold = −price[0]`, `free = 0` |
| Order | day by day |
| Answer | `free` |

### Trace (prices = [1, 3, 2, 8, 4, 9], fee = 2)

```
  day  price │  free = max(free, hold+p−2) │  hold = max(hold, free−p)
  ───────────┼─────────────────────────────┼──────────────────────────
   0     1   │  0                          │  −1
   1     3   │  max(0, −1+3−2) = 0         │  max(−1, 0−3) = −1
   2     2   │  max(0, −1+2−2) = 0         │  max(−1, 0−2) = −1
   3     8   │  max(0, −1+8−2) = 5         │  max(−1, 0−8) = −1
   4     4   │  max(5, −1+4−2) = 5         │  max(−1, 5−4) =  1
   5     9   │  max(5,  1+9−2) = 8  ✅     │  max( 1, 5−9) =  1
```

### Pseudocode

```
function maxProfitFee(prices, fee):
    free ← 0
    hold ← −prices[0]
    for i from 1 to n−1:
        p ← prices[i]
        newFree ← max(free, hold + p − fee)
        newHold ← max(hold, free − p)
        free ← newFree
        hold ← newHold
    return free
```

### 📌 Points to remember
- Charge the fee **once per transaction**: on the sell **or** on the buy, never both.
  (Charging it on the buy: `hold = max(hold, free − p − fee)` and base `hold = −price[0] − fee`.)
- The fee makes "hold through a small dip" better than "sell and rebuy". The machine figures this out by itself.
- Time O(n), Space O(1).

---

## 4. Best Time to Buy and Sell Stock with Cooldown (Medium)

### Problem
Unlimited transactions, but after you **sell**, you must wait **one day** before buying again.

### Visualize it

```
  price
    3 │           ●
    2 │       ●       │       ●
    1 │   ●           │      ╱
    0 │               ●─────╱
      └───┴───┴───┴───┴───┴──► day
          0   1   2   3   4

   buy 1 (d0) → sell 2 (d1) → COOLDOWN (d2) → buy 0 (d3) → sell 2 (d4)
   profit = 1 + 2 = 3 ✅
   (buy 1 → sell 3 on d2 gives 2, then d3 is cooldown → only 2)
```

### State machine: a third room appears

```
                       BUY: rest − price
            ┌─────────────────────────────────┐
            │                                 ▼
       ┌─────────┐                       ┌─────────┐
    ↻  │  REST   │                       │  HOLD   │  ↻
       │ (free,  │                       │         │
       │ can buy)│                       └─────────┘
       └─────────┘                            │
            ▲                                 │ SELL: hold + price
            │       ┌─────────┐               │
            └───────│  SOLD   │◄──────────────┘
         (forced    │(cooling │
          rest)     │  down)  │
                    └─────────┘

   SOLD cannot BUY directly. It must pass through REST first.
   That one missing arrow IS the cooldown.
```

### The 5 steps

| Step | Answer |
|------|--------|
| States | `hold`, `sold` (sold today), `rest` (free, allowed to buy) |
| Transitions | `hold = max(hold, rest − p)`, `sold = hold + p`, `rest = max(rest, sold)` (all from yesterday) |
| Base | `hold = −price[0]`, `sold = −∞`, `rest = 0` |
| Order | day by day, all three from **yesterday's** values |
| Answer | `max(sold, rest)` |

### Trace (prices = [1, 2, 3, 0, 2])

```
  day price │ hold = max(hold, rest−p) │ sold = hold+p │ rest = max(rest, sold)
  ──────────┼──────────────────────────┼───────────────┼───────────────────────
   0    1   │ −1                       │ −∞            │ 0
   1    2   │ max(−1, 0−2) = −1        │ −1+2 = 1      │ max(0, −∞) = 0
   2    3   │ max(−1, 0−3) = −1        │ −1+3 = 2      │ max(0, 1)  = 1
   3    0   │ max(−1, 1−0) =  1        │ −1+0 = −1     │ max(1, 2)  = 2
   4    2   │ max( 1, 2−2) =  1        │  1+2 = 3      │ max(2, −1) = 2

  answer = max(sold, rest) = max(3, 2) = 3 ✅
```

> Look at day 3: `hold = rest − 0` uses `rest = 1` from day 2, which came from **selling on day 1**.
> The sale on day 2 (`sold = 2`) can't be used to buy on day 3. Cooldown enforced.

### Pseudocode

```
function maxProfitCooldown(prices):
    hold ← −prices[0]
    sold ← −∞
    rest ← 0
    for i from 1 to n−1:
        p ← prices[i]
        prevHold ← hold, prevSold ← sold, prevRest ← rest
        hold ← max(prevHold, prevRest − p)
        sold ← prevHold + p
        rest ← max(prevRest, prevSold)
    return max(sold, rest)
```

### Alternative 2-state form

```
   hold[i] = max( hold[i−1], free[i−2] − p )      ← buy uses the day BEFORE yesterday
   free[i] = max( free[i−1], hold[i−1] + p )
```

### 📌 Points to remember
- **Cooldown = an extra state with no BUY arrow out of it.**
- Save all of yesterday's values **before** overwriting. Mixing new and old values breaks the cooldown.
- Answer is the best **non-holding** state on the last day.
- Time O(n), Space O(1).

---

## 5. Best Time to Buy and Sell Stock III (Hard)

### Problem
At most **two** transactions (hold at most one share at a time).

### Visualize it

```
  price
    5 │       ●
    4 │       │                       ●
    3 ●───●   │           ●           │
    2 │       │           │           │
    1 │       │           │     ●     │
    0 │       │   ●───●   │           │
      └───┴───┴───┴───┴───┴───┴───┴───┴──► day
          0   1   2   3   4   5   6   7

   Trade 1: buy 0 (d3) → sell 3 (d5)   = 3
   Trade 2: buy 1 (d6) → sell 4 (d7)   = 3        total = 6 ✅
   (one trade 0 → 4 gives only 4)
```

### State machine: two copies, chained

```
       BUY₁            SELL₁            BUY₂            SELL₂
  ●  ───────►  [b1]  ───────►  [s1]  ───────►  [b2]  ───────►  [s2]
 start         ↻                ↻                ↻                ↻

   b1 = max(b1, 0  − p)     holding after 1st buy
   s1 = max(s1, b1 + p)     free after 1st sell
   b2 = max(b2, s1 − p)     holding after 2nd buy  (uses profit of trade 1)
   s2 = max(s2, b2 + p)     free after 2nd sell

   It is just the k = 1 machine (problem 1) followed by a second one
   that starts with s1 cash instead of 0.
```

### The 5 steps

| Step | Answer |
|------|--------|
| States | `b1, s1, b2, s2` |
| Transitions | see the picture above |
| Base | `b1 = b2 = −∞`, `s1 = s2 = 0` (or `b1 = b2 = −price[0]`) |
| Order | day by day; inside a day, update b1 → s1 → b2 → s2 |
| Answer | `s2` (it is always ≥ s1) |

> Updating in place (b1 → s1 → b2 → s2) on the same day is safe: it only allows
> "buy and sell on the same day", which gains 0.

### Trace (prices = [3, 3, 5, 0, 0, 3, 1, 4])

```
  day price │  b1  │  s1  │  b2  │  s2
  ──────────┼──────┼──────┼──────┼──────
   0    3   │  −3  │  0   │  −3  │  0
   1    3   │  −3  │  0   │  −3  │  0
   2    5   │  −3  │  2   │  −3  │  2      s1 = −3+5 ; s2 = −3+5
   3    0   │   0  │  2   │   2  │  2      b1 = −0 ; b2 = 2−0
   4    0   │   0  │  2   │   2  │  2
   5    3   │   0  │  3   │   2  │  5      s1 = 0+3 ; s2 = 2+3
   6    1   │   0  │  3   │   2  │  5      b2 = max(2, 3−1) = 2
   7    4   │   0  │  4   │   2  │  6 ✅   s2 = 2+4
```

### Pseudocode

```
function maxProfitIII(prices):
    b1 ← −∞, s1 ← 0
    b2 ← −∞, s2 ← 0
    for each p in prices:
        b1 ← max(b1, −p)
        s1 ← max(s1, b1 + p)
        b2 ← max(b2, s1 − p)
        s2 ← max(s2, b2 + p)
    return s2
```

### Alternative: split the array

```
   left[i]  = best ONE trade in days 0..i      (scan left → right, track min)
   right[i] = best ONE trade in days i..n−1    (scan right → left, track max)
   answer   = max over i of  left[i] + right[i]

       ┌──── trade 1 ────┐┌──── trade 2 ────┐
       [ 3  3  5  0  0  3 | 1  4 ]
                        split point i
```

### 📌 Points to remember
- **k = 2 → 4 variables.** b2 starts from s1, which chains the two trades.
- `s2` already covers "only one trade" (the second trade can be a 0-gain buy/sell).
- Time O(n), Space O(1).

---

## 6. Best Time to Buy and Sell Stock IV (Hard)

### Problem
At most **k** transactions.

### Visualize it

```
  price
    6 │       ●
    5 │       │   ●
    3 ●       │   │       ●
    2 │   ●   │   │       │
    0 │       │   │   ●   │
      └───┴───┴───┴───┴───┴──► day
          0   1   2   3   4   5

   k = 2:  buy 2 (d1) → sell 6 (d2)  = 4
           buy 0 (d4) → sell 3 (d5)  = 3       total = 7 ✅
```

### State machine: k copies, chained

```
     BUY₁       SELL₁       BUY₂       SELL₂             BUYₖ       SELLₖ
  ● ─────► [b1] ─────► [s1] ─────► [b2] ─────► [s2] ··· ─────► [bk] ─────► [sk]

   for j = 1..k:
       b[j] = max( b[j],  s[j−1] − p )      with  s[0] = 0
       s[j] = max( s[j],  b[j]   + p )
```

> III is just this with k = 2. I is this with k = 1.

### The k ≥ n/2 shortcut

```
   A transaction needs at least 2 days (buy day, sell day).
   With n days you can make at most n/2 useful transactions.

   if k ≥ n/2:   the limit never binds → it is problem II (unlimited)
                 → use the O(n) greedy "sum of every rise"

   This avoids an O(n·k) loop when k is huge (e.g. k = 10⁹).
```

### The 5 steps

| Step | Answer |
|------|--------|
| States | `b[1..k]`, `s[0..k]` |
| Transitions | `b[j] = max(b[j], s[j−1] − p)`, `s[j] = max(s[j], b[j] + p)` |
| Base | all `b = −∞`, all `s = 0` |
| Order | day by day; inside a day, j = 1 → k |
| Answer | `s[k]` |

### Trace (k = 2, prices = [3, 2, 6, 5, 0, 3])

```
  day price │  b1  │  s1  │  b2  │  s2
  ──────────┼──────┼──────┼──────┼──────
   0    3   │  −3  │  0   │  −3  │  0
   1    2   │  −2  │  0   │  −2  │  0
   2    6   │  −2  │  4   │  −2  │  4      s1 = −2+6 ; b2 = max(−2, 4−6) ; s2 = −2+6
   3    5   │  −2  │  4   │  −1  │  4      b2 = 4−5 = −1
   4    0   │   0  │  4   │   4  │  4      b1 = −0 ; b2 = 4−0
   5    3   │   0  │  4   │   4  │  7 ✅   s2 = 4+3
```

### Pseudocode

```
function maxProfitIV(k, prices):
    n ← length(prices)
    if k ≥ n / 2:
        return sum of every positive (prices[i] − prices[i−1])    // problem II

    b ← array [1..k] of −∞
    s ← array [0..k] of 0
    for each p in prices:
        for j from 1 to k:
            b[j] ← max(b[j], s[j−1] − p)
            s[j] ← max(s[j], b[j] + p)
    return s[k]
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Full table `dp[i][k][2]` | O(n·k) | O(n·k) |
| **Rolling arrays b[], s[]** | **O(n·k)** | **O(k)** ✅ |
| k ≥ n/2 shortcut | O(n) | O(1) |

### 📌 Points to remember
- **Count a transaction on the BUY** (or on the sell), consistently, never on both.
- Always add the **k ≥ n/2 shortcut**. Without it, huge k causes TLE or out-of-memory.
- `s[0] = 0` forever: with zero transactions you have zero profit.
- This one solution also solves I (k = 1) and III (k = 2).

---

## 7. Master Cheat Sheet

### All 6 problems at a glance

```
┌──────────────────┬──────────────┬────────────────────────────────────────────┬──────────────┬──────────┐
│ Problem          │ States       │ Transitions (per day, price p)             │ Answer       │ Best     │
├──────────────────┼──────────────┼────────────────────────────────────────────┼──────────────┼──────────┤
│ I   (k = 1)      │ hold, free   │ hold = max(hold, −p)                       │ free         │ O(n),O(1)│
│                  │              │ free = max(free, hold + p)                 │              │          │
├──────────────────┼──────────────┼────────────────────────────────────────────┼──────────────┼──────────┤
│ II  (k = ∞)      │ hold, free   │ hold = max(hold, free − p)                 │ free         │ O(n),O(1)│
│                  │              │ free = max(free, hold + p)                 │              │          │
├──────────────────┼──────────────┼────────────────────────────────────────────┼──────────────┼──────────┤
│ Fee              │ hold, free   │ hold = max(hold, free − p)                 │ free         │ O(n),O(1)│
│                  │              │ free = max(free, hold + p − fee)           │              │          │
├──────────────────┼──────────────┼────────────────────────────────────────────┼──────────────┼──────────┤
│ Cooldown         │ hold, sold,  │ hold = max(hold, rest − p)                 │ max(sold,    │ O(n),O(1)│
│                  │ rest         │ sold = hold + p ; rest = max(rest, sold)   │     rest)    │          │
├──────────────────┼──────────────┼────────────────────────────────────────────┼──────────────┼──────────┤
│ III (k = 2)      │ b1,s1,b2,s2  │ b1=max(b1,−p)   s1=max(s1,b1+p)            │ s2           │ O(n),O(1)│
│                  │              │ b2=max(b2,s1−p) s2=max(s2,b2+p)            │              │          │
├──────────────────┼──────────────┼────────────────────────────────────────────┼──────────────┼──────────┤
│ IV  (any k)      │ b[j], s[j]   │ b[j]=max(b[j], s[j−1]−p)                   │ s[k]         │ O(nk),   │
│                  │              │ s[j]=max(s[j], b[j]+p)                     │              │ O(k)     │
└──────────────────┴──────────────┴────────────────────────────────────────────┴──────────────┴──────────┘
```

### One machine to rule them all

```
                         BUY  (− price)
                  ┌───────────────────────────┐
                  │   uses 1 transaction (k)  │
                  │                           ▼
            ┌──────────┐                ┌──────────┐
        ↻   │   FREE   │                │   HOLD   │   ↻
            └──────────┘                └──────────┘
                  ▲                           │
                  │    ┌──────────────┐       │
                  └────│  COOLDOWN    │◄──────┘
                       │ (optional)   │   SELL (+ price − fee?)
                       └──────────────┘

   k = 1      → BUY only from cash 0
   k = ∞      → no counter
   k = 2 / k  → stack the machine 2 / k times
   fee        → subtract on SELL
   cooldown   → SELL lands in COOLDOWN, which only goes to FREE
```

### Family tree

```
                          STOCK DP  (state machine)
                                 │
          ┌──────────────────────┼───────────────────────────┐
          │                      │                           │
     LIMITED k               UNLIMITED k                 k COPIES
          │                      │                           │
   └ I (k = 1)            ├ II  (plain / greedy)        ├ III (k = 2)
                          ├ Fee (− fee on sell)         └ IV  (any k,
                          └ Cooldown (+ 1 state)              k ≥ n/2 → II)
```

### Optimization checklist

```
  ☐ Every day reads only yesterday?            → rolling variables, O(1) / O(k)
  ☐ k unlimited?                               → drop the k dimension
  ☐ k ≥ n/2?                                   → treat as unlimited (problem II)
  ☐ No fee, no cooldown, k = ∞?                → greedy "sum of rises" also works
  ☐ Extra rule (cooldown, fee)?                → add a state or change one arrow,
                                                 don't invent a new algorithm
```

### 🚩 Common bugs to avoid

```
  ✗ Problem I: buying from `free` instead of from 0 → becomes unlimited trades
  ✗ Fee charged on both buy and sell
  ✗ Cooldown: overwriting `hold` / `sold` / `rest` before the others read them
  ✗ Cooldown: allowing BUY directly from SOLD
  ✗ III / IV: initializing b with 0 instead of −∞ (or −price[0])
  ✗ IV: forgetting the k ≥ n/2 shortcut → TLE / memory blow-up
  ✗ Returning a HOLD state as the answer (you must end with no stock)
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What MODES can I be in at the end of a day, and which  ║
   ║   arrows (buy / sell / rest) connect them?"              ║
   ╚══════════════════════════════════════════════════════════╝
     Draw the machine first. The equations are just its arrows.
```

---

### ✅ Progress tracker

- [ ] Best Time to Buy and Sell Stock (Easy)
- [ ] Best Time to Buy and Sell Stock II (Medium)
- [ ] Best Time to Buy and Sell Stock with Transaction Fee (Medium)
- [ ] Best Time to Buy and Sell Stock with Cooldown (Medium)
- [ ] Best Time to Buy and Sell Stock III (Hard)
- [ ] Best Time to Buy and Sell Stock IV (Hard)
