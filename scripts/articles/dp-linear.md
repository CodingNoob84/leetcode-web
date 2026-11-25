# Linear DP: One-Dimensional Decisions

Linear DP is the smallest complete DP shape: the state is indexed by one variable, and every cell is built from a fixed window of earlier cells. Once you can name the state and the last decision, the recurrence usually writes itself.

The eight problems in this pattern look different, but they reduce to six recurrence shapes:

- a two-step window (Climbing Stairs, Min Cost Climbing Stairs)
- take-or-skip over adjacent items (House Robber, House Robber II)
- splitting a prefix into valid pieces (Decode Ways)
- anchoring a sequence at its last element (Longest Increasing Subsequence)
- carrying a count beside the optimum (Number of Longest Increasing Subsequence)
- prefix sums plus order statistics (Count of Range Sum)

## The one question that drives 1D DP

Ask: **what does the last decision look like?**

Every 1D recurrence is a statement about the final step. If the last step was a 1-step or a 2-step, the answer is a sum of two earlier states. If the last item was robbed or skipped, the answer is a maximum of two earlier states. If the last digit was read alone or paired, the answer is a sum of two prefix states.

```
state:   dp[0]   dp[1]   dp[2]   dp[3]   ...   dp[n]
           |       |       |       |
           +-------+-------+-------+------>  each cell is built from
                                               a bounded window behind it
```

The recipe:

1. Define the state in one sentence: "dp[i] is the best/count for the prefix ending at i".
2. Write the transition from the last decision.
3. Set the base cases for the smallest prefixes.
4. Fill left to right, because every dependency points backwards.
5. Read the answer from the last cell, or from all cells if the state is "ending here".

## Shape 1: The two-step window

### Climbing Stairs

**Basic logic.** To stand on step `i`, the last move was either a 1-step from `i-1` or a 2-step from `i-2`. So the number of ways is the sum of the ways to stand on those two steps.

**Intuition.** The staircase has no other choices. Every path is a sequence of 1s and 2s, and the final symbol is either a 1 or a 2. Removing that final symbol leaves a smaller path that must already be counted.

**Common patterns.** Fibonacci-style counting; rolling two variables; the same recurrence appears in tiling, jump games, and path counting with fixed step sizes.

**Approach.** Start with `ways(0) = 1` (the empty path) and `ways(1) = 1`. Fill forward. Keep only the last two values.

**Pseudocode.**

```
ways[0] = 1
ways[1] = 1
for i from 2 to n:
    ways[i] = ways[i-1] + ways[i-2]
return ways[n]
```

**Points to remember.** Base cases are not optional: `ways(0)` represents the empty path, not "no way". The rolling version uses two variables and is `O(1)` space.

```
n = 4

step:     0     1     2     3     4
ways:     1     1     2     3     5
                 ^     ^     ^     ^
                 |     |     |     |
                 +--+--+--+--+--+--+
                    sum of previous two
```

### Min Cost Climbing Stairs

**Basic logic.** Each step has a cost. To leave step `i`, pay `cost[i]` and then take one or two steps. The cheapest way to reach the top is the minimum over the last one or two steps.

**Intuition.** This is the same two-step window as Climbing Stairs, but the operation is `min` instead of `+`, and the cost belongs to the step you leave, not the step you enter.

**Common patterns.** Minimum-cost path with fixed jumps; paying at the source; a virtual top just past the last step.

**Approach.** Let `dp[i]` be the minimum cost to stand on step `i`. Either arrive from `i-1` or `i-2`, then pay `cost[i]`. The answer is the cheaper of standing on the last two steps, because from either one you can step off the top.

**Pseudocode.**

```
dp[0] = cost[0]
dp[1] = cost[1]
for i from 2 to n-1:
    dp[i] = cost[i] + min(dp[i-1], dp[i-2])
return min(dp[n-1], dp[n-2])
```

**Points to remember.** You may start at step 0 or step 1, so both are base cases. The answer is not necessarily `dp[n-1]`; you can jump from `n-2` straight to the top.

```
cost:     10    15    20

dp[0] = 10
dp[1] = 15
dp[2] = 20 + min(15, 10) = 30
answer = min(dp[2], dp[1]) = min(30, 15) = 15

path: start at step 1, pay 15, jump two steps to the top
```

## Shape 2: Take or skip

### House Robber

**Basic logic.** At house `i` you either rob it or skip it. If you rob it, you add its money to the best total from houses up to `i-2`. If you skip it, you keep the best total up to `i-1`. Take the maximum.

**Intuition.** The only restriction is adjacency. The decision at the current house is binary, and each branch refers to a smaller prefix. That is exactly a 1D DP.

**Common patterns.** Weighted independent set on a path; take-or-skip with a one-house cooldown; the same shape with a "not two in a row" rule.

**Approach.** Track `best2` (best up to two houses back) and `best1` (best up to the previous house). For each house, compute `current = max(best1, best2 + money)`.

**Pseudocode.**

```
best2 = 0
best1 = 0
for money in houses:
    current = max(best1, best2 + money)
    best2 = best1
    best1 = current
return best1
```

**Points to remember.** The empty prefix has value 0, which makes the base cases clean. Do not compare against the house value alone; the best plan may skip the current house.

```
houses:      2     7     9     3     1

rob:         2     7    11    11    12
skip:        0     2     7    11    11
best:        2     7    11    11    12

at house 9:  rob  = 2 + 9 = 11
             skip = 7
             best = 11
```

### House Robber II

**Basic logic.** The houses now form a circle, so the first and last houses are adjacent. Split the circle into two linear cases: one that excludes the first house, and one that excludes the last house. Run the linear solution on both and take the maximum.

**Intuition.** A circle is only hard because of one extra adjacency. If you decide the first house is out, the rest is a line. If you decide the last house is out, the rest is also a line. Every valid plan falls into at least one of those cases.

**Common patterns.** Circular arrays; cutting a cycle at one edge; running the same linear DP twice on overlapping ranges.

**Approach.** Handle the single-house case directly. Then reuse the House Robber helper on `houses[1..n-1]` and `houses[0..n-2]`.

**Pseudocode.**

```
if n == 1: return houses[0]
return max(robLine(houses without first),
           robLine(houses without last))

robLine(list):
    best2 = 0
    best1 = 0
    for money in list:
        current = max(best1, best2 + money)
        best2 = best1
        best1 = current
    return best1
```

**Points to remember.** The two runs must both exclude an endpoint; otherwise you could rob the first and last together. The single-house case avoids passing an empty list.

```
circle:      2 --- 3
             |     |
             7 --- 9

case A: exclude 2  -> line [3, 7, 9] -> best 10 (3 + 7)
case B: exclude 9  -> line [2, 3, 7] -> best 9  (2 + 7)
answer = max(10, 9) = 10
```

## Shape 3: Split a prefix into valid pieces

### Decode Ways

**Basic logic.** A digit string can be decoded by reading the last character alone or the last two characters together. `dp[i]` is the number of decodings of the first `i` characters. Add `dp[i-1]` when the last digit is valid alone, and add `dp[i-2]` when the last two digits form a number from 10 to 26.

**Intuition.** The final token is either one character or two. Each valid token extends a valid decoding of the remaining prefix. This is a partition DP: every split point is a state boundary.

**Common patterns.** String segmentation with a dictionary of valid pieces; prefix partitions; zero forcing a pairing; two-digit windows with an upper bound.

**Approach.** Use rolling variables. A `0` cannot stand alone. A two-digit token is valid only if it starts with `1`, or starts with `2` and the second digit is at most `6`.

**Pseudocode.**

```
if s[0] == '0': return 0
prev2 = 1        # empty prefix
prev1 = 1        # first character
for i from 2 to n:
    current = 0
    if s[i-1] != '0':
        current += prev1
    if s[i-2] == '1' or (s[i-2] == '2' and s[i-1] <= '6'):
        current += prev2
    prev2 = prev1
    prev1 = current
return prev1
```

**Points to remember.** `"0"` has zero decodings. `"06"` is invalid. `"10"` and `"20"` are valid pairs, but `"30"` is not. The empty prefix is 1 so that a valid two-digit token at the start has something to extend.

```
s = 2 2 6

i = 1: "2"      -> 1
i = 2: "22"     -> 2   (2 | 2, 22)
i = 3: "226"    -> 3   (2 | 2 | 6, 2 | 26, 22 | 6)

last digit alone: 6  -> extends "22"  (2 ways)
last two digits : 26 -> extends "2"   (1 way)
total: 3
```

## Shape 4: Anchor at the last element

### Longest Increasing Subsequence

**Basic logic.** Let `dp[i]` be the length of the longest increasing subsequence that ends exactly at index `i`. Then `dp[i]` is one plus the best `dp[j]` among earlier indices with a smaller value. The answer is the maximum over all `i`.

**Intuition.** Every increasing subsequence has a last element. If you anchor on that element, the previous element must be smaller and earlier. That makes `i` a complete state: it says "I end here", not "I have seen this much".

**Common patterns.** Anchor-at-end states; `O(n^2)` pair transitions; patience sorting with a `tails` array for `O(n log n)` length; parent pointers to reconstruct.

**Approach.** The direct DP uses a nested loop. The faster version maintains `tails[k]`, the smallest possible tail of an increasing subsequence of length `k+1`. Replace the first tail that is at least the current value.

**Pseudocode.**

```
# O(n^2)
dp = array of 1s, length n
for i from 0 to n-1:
    for j from 0 to i-1:
        if nums[j] < nums[i]:
            dp[i] = max(dp[i], dp[j] + 1)
return max(dp)

# O(n log n), length only
tails = empty list
for x in nums:
    pos = first index in tails with tails[pos] >= x
    if pos == length(tails):
        append x to tails
    else:
        tails[pos] = x
return length(tails)
```

**Points to remember.** `dp[i]` means "ending at `i`", so the answer is `max(dp)`, not `dp[n-1]`. The `tails` array is not the subsequence itself; it only tracks lengths. Use strict comparison for strictly increasing, and non-strict for non-decreasing.

```
nums:   10   9   2   5   3   7   101   18

dp:      1   1   1   2   2   3    4    4

tails evolution:
10  -> [10]
 9  -> [9]
 2  -> [2]
 5  -> [2, 5]
 3  -> [2, 3]
 7  -> [2, 3, 7]
101 -> [2, 3, 7, 101]
18  -> [2, 3, 7, 18]

length = 4
```

## Shape 5: Carry a count beside the optimum

### Number of Longest Increasing Subsequence

**Basic logic.** Track two arrays: `len[i]`, the best length ending at `i`, and `count[i]`, how many subsequences achieve that length. When a predecessor gives a longer subsequence, replace both. When it ties the current best length, add its count.

**Intuition.** The optimum alone is not enough. Several different subsequences can end at the same index with the same best length, and each one is a distinct way to reach the global optimum. The count is part of the state.

**Common patterns.** Optimum plus number of ways; reset on improvement; sum on a tie; final aggregation over all states that reach the global best.

**Approach.** Run the same `O(n^2)` loop as LIS, but compare `len[j] + 1` with `len[i]`. At the end, sum `count[i]` over every index whose `len[i]` equals the global maximum.

**Pseudocode.**

```
len = array of 1s, length n
count = array of 1s, length n

for i from 0 to n-1:
    for j from 0 to i-1:
        if nums[j] < nums[i]:
            if len[j] + 1 > len[i]:
                len[i] = len[j] + 1
                count[i] = count[j]
            else if len[j] + 1 == len[i]:
                count[i] += count[j]

best = max(len)
answer = 0
for i from 0 to n-1:
    if len[i] == best:
        answer += count[i]
return answer
```

**Points to remember.** A longer predecessor resets the count; an equal one adds to it. Do not sum counts for indices that are not at the global best length. Counts can exceed 32-bit range.

```
nums:   1   3   5   4   7

len:    1   2   3   3   4
count:  1   1   1   1   2

two longest subsequences:
  1 -> 3 -> 5 -> 7
  1 -> 3 -> 4 -> 7

answer = 2
```

## Shape 6: Prefix sums plus order statistics

### Count of Range Sum

**Basic logic.** Let `prefix[i]` be the sum of the first `i` elements. A subarray from `j` to `i-1` has sum `prefix[i] - prefix[j]`. The condition `lower <= prefix[i] - prefix[j] <= upper` becomes `prefix[i] - upper <= prefix[j] <= prefix[i] - lower`. Count earlier prefix values inside that window.

**Intuition.** The subarray condition is a difference of two prefix sums. Counting valid pairs is an order-statistics problem, not a simple "best so far" DP. Divide and conquer counts pairs across the midpoint while both halves are sorted.

**Common patterns.** Prefix sums; counting pairs in a value range; merge sort with two moving pointers; coordinate compression plus a Fenwick tree.

**Approach.** Recursively sort the prefix array. Before merging, count pairs with `j` in the left half and `i` in the right half. Two pointers move only forward because both halves are sorted. Then merge as usual.

**Pseudocode.**

```
prefix[0] = 0
for i from 0 to n-1:
    prefix[i+1] = prefix[i] + nums[i]

answer = 0

countPairs(lo, hi):          # inclusive range
    if lo >= hi: return
    mid = (lo + hi) / 2
    countPairs(lo, mid)
    countPairs(mid+1, hi)

    left = lo
    right = lo
    for i from mid+1 to hi:
        while left <= mid and prefix[left] < prefix[i] - upper:
            left += 1
        while right <= mid and prefix[right] <= prefix[i] - lower:
            right += 1
        answer += right - left

    merge prefix[lo..hi] in sorted order

countPairs(0, n)
return answer
```

**Points to remember.** Use 64-bit sums. The prefix array has `n+1` entries. The bounds are inclusive, which is why one pointer uses `<` and the other uses `<=`. A sliding window is wrong when negative numbers are allowed.

```
nums   = [-2, 5, -1]
lower  = -2
upper  = 2

prefix = [0, -2, 3, 2]

pairs (j < i):
  (0,1) -> -2        valid
  (0,2) ->  3        too large
  (0,3) ->  2        valid
  (1,2) ->  5        too large
  (1,3) ->  4        too large
  (2,3) -> -1        valid

valid ranges: [-2], [-2,5,-1], [-1]
answer = 3
```

## Choosing the state

Before writing a recurrence, answer these four questions:

- What does the index mean: a prefix length, a position, a house, or a digit boundary?
- What is the last decision: step size, take or skip, one or two digits, extend or start, or a pair boundary?
- What do you need from the past: one previous value, two previous values, the best so far, or a count?
- Where is the answer: the last cell, the maximum over all cells, or a sum over the cells that reach the best value?

If the answers are clear, the transition is usually one line.

## Points to remember

- 1D DP is last-step thinking. Write the recurrence from the final decision, not from the whole problem.
- Count, optimize, and count-the-optimum are different state payloads. Do not reuse a length state for a counting problem.
- Roll the array when only a fixed window of the past is needed.
- A circle becomes a line by cutting one edge and running the linear case twice.
- For LIS, `dp[i]` ends at `i`; the answer is the maximum, and `tails` gives length only.
- Counting LIS needs a `(length, count)` pair, with reset on improvement and addition on ties.
- Range-sum counting is prefix sums plus order statistics, not a plain DP over values.
- Always check zeros, duplicates, negative values, empty inputs, and 64-bit sums.

## The practice set

- Climbing Stairs (Easy): the pure two-step count.
- Min Cost Climbing Stairs (Easy): the same window with a cost and a minimum.
- House Robber (Medium): take or skip over a line.
- House Robber II (Medium): the same choice over a circle.
- Decode Ways (Medium): partition a prefix into one- and two-digit tokens.
- Longest Increasing Subsequence (Medium): anchor the state at the last element.
- Number of Longest Increasing Subsequence (Medium): carry a count with the optimum.
- Count of Range Sum (Hard): prefix sums and pair counting.

Work them in that order. The first two build the window, the next two add a decision, the next two move the state to a boundary, and the last two turn the state into a count.
