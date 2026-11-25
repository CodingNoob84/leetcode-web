# General String Parsing: A Visual Guide

> **Goal:** Learn to scan, build and frame strings cleanly, without missing edge cases.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> These problems aren't about a clever pattern like a sliding window. They are about **careful single-pass scanning**, **building output efficiently**, and **designing formats that can't be misread**.

---

## Table of Contents

0. [The Big Idea: What Is "General String Parsing"?](#0-the-big-idea-what-is-general-string-parsing)
1. [Find Smallest Letter Greater Than Target (Easy)](#1-find-smallest-letter-greater-than-target-easy)
2. [Letter Case Permutation (Medium)](#2-letter-case-permutation-medium)
3. [Encode and Decode Strings (Medium)](#3-encode-and-decode-strings-medium)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Smallest Letter → Letter Case Permutation → Encode and Decode Strings.
> The first is a single scan with one wrap-around edge case, the second builds many strings, and the third designs a format that must survive any input.

---

## 0. The Big Idea: What Is "General String Parsing"?

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "GENERAL STRING PARSING"                │
├──────────────────────────────────────────────────────────────────┤
│  • "Encode / decode", "serialize / deserialize", "codec"         │
│  • "Build all strings where each char can be X or Y"             │
│  • "Parse", "split", "tokenize", "convert format"                │
│  • No window, no DP table: just read left → right carefully      │
│  • The hard part is EDGE CASES, not the algorithm                │
└──────────────────────────────────────────────────────────────────┘
```

### The single-pass scanner

```
   s =  [ h ][ e ][ l ][ l ][ o ][ , ][   ][ w ][ o ][ r ][ l ][ d ]
          ▲
          i  ──────────────────────────────────────────────────►

   One pointer i walks the string ONCE.
   At each step, ask: "What kind of character is this, and what
   should I do with it?"

     digit?      → accumulate a number      (num = num·10 + d)
     letter?     → append / transform
     delimiter?  → finish the current token
     anything else → decide explicitly (skip? error? keep?)
```

### ✅ The edge-case checklist (run this before you submit)

```
  ☐ Empty input:              ""   or   []
  ☐ One element:              "a"  or   [""]   (a list holding an empty string!)
  ☐ Spaces:                   leading / trailing / multiple in a row
  ☐ Delimiter INSIDE the data: a word that contains "#", ",", or "|"
  ☐ Case:                     'a' vs 'A', digits that have no case
  ☐ Multi-digit numbers:      "12#..." is twelve, not one then two
  ☐ Wrap-around / not found:  what do I return when nothing matches?
  ☐ Unicode / non-ASCII:      does "a letter" mean a–z only?
```

> 💡 Most wrong answers on these problems come from one unchecked box above, not from a wrong idea.

### Building strings efficiently

```
  ❌ Repeated concatenation (strings are immutable in most languages):

     result = ""
     result = result + "a"      → copy 1 char
     result = result + "b"      → copy 2 chars
     result = result + "c"      → copy 3 chars
       ...
     result = result + "z"      → copy n chars

     total copies = 1 + 2 + 3 + ... + n  =  n(n+1)/2  →  O(n²)  🐢

  ✅ Collect pieces in a LIST, join once at the end:

     parts = [ "a", "b", "c", ..., "z" ]     ← each append is O(1)
     result = join(parts)                    ← one pass, O(n)  🚀

  ✅ Or use a mutable buffer (char array / string builder)
```

### "Unambiguous framing": the codec problem

When you squash many strings into one, the reader must be able to tell **where each piece ends**.

```
  ❌ Delimiter-only framing (join with "#"):

     ["a#b"]       →  "a#b"
     ["a", "b"]    →  "a#b"        ← SAME output, two different inputs!

     []            →  ""
     [""]          →  ""           ← SAME output again!

     If two inputs encode to the same string, decoding is impossible.
```

Two classic fixes:

```
  FIX 1: ESCAPING                        FIX 2: LENGTH PREFIX  ✅ (simplest)
  ────────────────                       ──────────────────────
  Pick an escape char, e.g. '/'.         Write the length first, then a
  Inside data:  '#' → '/#'               separator, then the raw string.
                '/' → '//'
  Separator:    a lone '#'               "lint" → "4#lint"
                                         "#love" → "5##love"
  Decoder must track "am I right
  after an escape?" → fiddly.            Decoder reads digits up to the first
                                         '#', then jumps exactly len chars.
                                         The data is NEVER scanned for '#'.
```

> 💡 **Key insight:** with a length prefix, the decoder **doesn't look inside** the data, so the data may contain anything, including the separator itself.

---

## 1. Find Smallest Letter Greater Than Target (Easy)

### Problem
`letters` is sorted (non-decreasing) and contains at least two different letters.
Return the **smallest letter strictly greater than `target`**. If none exists, **wrap around** and return `letters[0]`.

### Visualize it

```
   letters:   [ c ][ f ][ j ]
               0    1    2

   target 'a'  →  first letter > 'a' is 'c'          → 'c'
   target 'c'  →  'c' is NOT > 'c', next is 'f'      → 'f'
   target 'z'  →  nothing > 'z'  →  wrap to start    → 'c'

     a  b [c] d  e [f] g  h  i [j] k ... z
     ▲                                   ▲
   target a → walk right to c        target z → fell off the end,
                                      wrap around ↺ to c
```

### The decision

```
                   for each letter (in sorted order)
                              │
               ┌──────────────┴──────────────┐
          letter > target?              letter ≤ target?
               │                              │
        ✅ answer (first one wins)       keep going
                                              │
                                 reached the end? → wrap: letters[0]
```

### Approach A: linear scan

| Step | Answer |
|---|---|
| Scan | left → right |
| Stop | at the first `letter > target` |
| Not found | return `letters[0]` |
| Time / Space | O(n) / O(1) |

```
function nextGreatestLetter(letters, target):
    for each ch in letters:
        if ch > target:
            return ch
    return letters[0]                 // wrap-around
```

### Approach B: binary search (upper bound)

This is exactly **upper_bound**: the first index with `letters[i] > target`.
See [../binary search/02-Lower-Upper-Bound.md](../binary%20search/02-Lower-Upper-Bound.md) for the full lower/upper bound story.

```
  Predicate "letters[i] > target" is  F F F … T T T  over a sorted array
                                            ▲
                                    find the FIRST T

  If there is no T at all, lo ends at n → wrap with  lo % n
```

```
function nextGreatestLetter(letters, target):
    lo ← 0
    hi ← n                            // n, not n-1: answer may be "past the end"
    while lo < hi:
        mid ← lo + (hi - lo) / 2
        if letters[mid] > target:
            hi ← mid                  // mid could be the answer, keep it
        else:
            lo ← mid + 1              // mid is too small, discard it
    return letters[lo % n]            // lo == n means "none" → wraps to 0
```

### Traces (letters = ["c","f","j"], n = 3)

```
  target = 'a'
  ┌──────┬──────┬──────┬────────────┬─────────────────────┐
  │  lo  │  hi  │ mid  │ letters[mid]│ action              │
  ├──────┼──────┼──────┼────────────┼─────────────────────┤
  │  0   │  3   │  1   │    'f'     │ 'f' > 'a' → hi = 1  │
  │  0   │  1   │  0   │    'c'     │ 'c' > 'a' → hi = 0  │
  │  0   │  0   │  —   │     —      │ stop, lo = 0        │
  └──────┴──────┴──────┴────────────┴─────────────────────┘
  answer letters[0 % 3] = 'c' ✅

  target = 'c'
  ┌──────┬──────┬──────┬────────────┬──────────────────────────┐
  │  lo  │  hi  │ mid  │ letters[mid]│ action                   │
  ├──────┼──────┼──────┼────────────┼──────────────────────────┤
  │  0   │  3   │  1   │    'f'     │ 'f' > 'c' → hi = 1       │
  │  0   │  1   │  0   │    'c'     │ 'c' > 'c'? NO → lo = 1   │
  │  1   │  1   │  —   │     —      │ stop, lo = 1             │
  └──────┴──────┴──────┴────────────┴──────────────────────────┘
  answer letters[1 % 3] = 'f' ✅      (strictly greater, so 'c' is skipped)

  target = 'z'
  ┌──────┬──────┬──────┬────────────┬──────────────────────────┐
  │  lo  │  hi  │ mid  │ letters[mid]│ action                   │
  ├──────┼──────┼──────┼────────────┼──────────────────────────┤
  │  0   │  3   │  1   │    'f'     │ 'f' > 'z'? NO → lo = 2   │
  │  2   │  3   │  2   │    'j'     │ 'j' > 'z'? NO → lo = 3   │
  │  3   │  3   │  —   │     —      │ stop, lo = 3 = n         │
  └──────┴──────┴──────┴────────────┴──────────────────────────┘
  answer letters[3 % 3] = letters[0] = 'c' ✅   (wrap-around)
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| Linear scan | O(n) | O(1) |
| **Binary search** | **O(log n)** | **O(1)** ✅ |

### 📌 Points to remember
- **Strictly greater** → `>` (upper bound), not `≥` (lower bound). With `≥`, target `'c'` would wrongly return `'c'`.
- `hi = n`, not `n - 1`, because the answer can be "nothing", which becomes the wrap-around.
- `lo % n` handles the wrap in one expression.
- Letters compare by their character codes, so `'a' < 'b' < … < 'z'` works directly.

---

## 2. Letter Case Permutation (Medium)

### Problem
Given a string `s` of letters and digits, return **every string** you can make by changing each **letter** to lowercase or uppercase. Digits stay as they are.

### Visualize it

```
   s = "a1b2"

   position:   a     1     b     2
   choices:   a/A    1    b/B    2
              ───         ───
              2   ×  1 ×  2   ×  1   =  4 strings

   a1b2   a1B2   A1b2   A1B2
```

### The decision at each character

```
                     character c
              ┌──────────┴──────────┐
          is a LETTER            is a DIGIT
              │                      │
        TWO branches:            ONE branch:
        lower(c), upper(c)       c itself
```

> 💡 Toggle a letter's case in ASCII with `c XOR 32`: `'a'` (97) ↔ `'A'` (65), because they differ only in bit 5 (value 32).

### Approach A: iterative doubling (BFS-style build)

Keep a list of all partial strings. Each letter **doubles** the list; each digit just extends every string.

```
function letterCasePermutation(s):
    results ← [ "" ]
    for each c in s:
        next ← empty list
        for each partial in results:
            if c is a letter:
                add partial + lower(c) to next
                add partial + upper(c) to next
            else:
                add partial + c to next
        results ← next
    return results
```

### Trace ("a1b2")

```
  start        : [ "" ]
  c = 'a'      : [ "a", "A" ]                               ← doubled
  c = '1'      : [ "a1", "A1" ]                             ← extended
  c = 'b'      : [ "a1b", "a1B", "A1b", "A1B" ]             ← doubled
  c = '2'      : [ "a1b2", "a1B2", "A1b2", "A1B2" ]         ← extended

  4 results ✅
```

### Approach B: backtracking on a character array

Walk positions left → right. At a letter, try one case, recurse, then try the other case. This is the include/exclude tree from [../backtracking/01-Choice-Based-Backtracking.md](../backtracking/01-Choice-Based-Backtracking.md).

```
                              "a1b2"   i=0
                     ┌──────────┴──────────┐
                  'a'                     'A'
                   │ i=1 ('1': one way)    │ i=1
                  "a1"                    "A1"
                   │ i=2                   │ i=2
             ┌─────┴─────┐           ┌─────┴─────┐
           'b'          'B'        'b'          'B'
            │ i=3        │ i=3      │ i=3        │ i=3
          "a1b2"      "a1B2"     "A1b2"      "A1B2"
            ✔            ✔          ✔            ✔
```

```
function letterCasePermutation(s):
    chars ← s as a mutable array
    results ← empty list
    backtrack(0)
    return results

function backtrack(i):
    if i == length(chars):
        add join(chars) to results          // record a COPY
        return
    if chars[i] is a digit:
        backtrack(i + 1)
        return
    chars[i] ← lower(chars[i]);  backtrack(i + 1)
    chars[i] ← upper(chars[i]);  backtrack(i + 1)
    // no undo needed: the next call overwrites chars[i] anyway,
    // and callers above never read positions ≥ i again
```

### Complexity

Let `L` = number of letters, `n` = length of `s`.

| Approach | Time | Extra space |
|---|---|---|
| Iterative doubling | O(2^L · n) | O(2^L · n) (the output itself) |
| Backtracking | O(2^L · n) | O(n) recursion + output |

> The output has `2^L` strings of length `n`, so **no** method can beat O(2^L · n). Just writing the answer costs that much.

### 📌 Points to remember
- **Digits don't branch.** `"12345"` → exactly 1 result. `"abc"` → 8.
- Build into a **mutable array** and join only at the leaf, instead of creating a new string at every level.
- Any order of results is accepted on LeetCode.
- Same family: Subsets, Generalized Abbreviation (every position has a fixed small set of choices).

---

## 3. Encode and Decode Strings (Medium)

### Problem (LeetCode Premium 271)
Design `encode(list of strings) → one string` and `decode(one string) → list of strings`, such that `decode(encode(x)) == x` for **every** list.

> **Convention used here:** strings may contain **any** character, including `#`, digits and spaces. You may not use language-specific serializers. The format is **length-prefix**: each string becomes `<length>#<string>`.

### Why the obvious idea fails

```
  Attempt: join with "#", split on "#"

     encode(["lint", "code"])  →  "lint#code"   → split → ["lint","code"]  ✓
     encode(["#love"])         →  "#love"       → split → ["", "love"]     ✗
     encode(["a#b"])           →  "a#b"         → split → ["a", "b"]       ✗
     encode([])                →  ""            → split → [""]             ✗
     encode([""])              →  ""            → ???                      ✗

  Any delimiter you pick can appear INSIDE a string.
```

### The fix: length-prefix framing

```
   encode:  for each word, write   LENGTH  #  WORD

     "lint"   →  "4#lint"
     "code"   →  "4#code"
     "#love"  →  "5##love"        ← the 2nd '#' is DATA, and that's fine
     "you:"   →  "4#you:"

   joined:   "4#lint4#code5##love4#you:"

   decode:  read digits up to the FIRST '#'  →  that's the length
            skip the '#'
            take EXACTLY length chars, without looking at them
            repeat from where you stopped
```

Why this is always safe:

```
   ┌────┬───┬──────────────────────┐
   │ 5  │ # │  # l o v e            │
   └────┴───┴──────────────────────┘
    digits  ▲   exactly 5 chars, copied blindly
    only    │
            first '#' after the digits is ALWAYS the separator,
            because the length part contains only digits
```

### Pseudocode

```
function encode(strs):
    parts ← empty list
    for each s in strs:
        add toString(length(s)) to parts
        add "#" to parts
        add s to parts
    return join(parts)                       // one O(total) join

function decode(data):
    result ← empty list
    i ← 0
    while i < length(data):
        j ← i
        while data[j] != '#':                // scan the digits only
            j ← j + 1
        len ← toInt(data[i .. j-1])
        word ← data[j+1 .. j+len]            // exactly len chars
        add word to result
        i ← j + 1 + len                      // jump past this word
    return result
```

### Trace: decode "4#lint4#code5##love4#you:"

```
  index:  0 1 2 3 4 5 6 7 8 9 ...
  data:   4 # l i n t 4 # c o d e 5 # # l o v e 4 # y o u :
          └─────┬───┘ └─────┬───┘ └──────┬──────┘ └─────┬───┘
              6 chars     6 chars      7 chars        6 chars     total 25

  ┌──────┬────────┬───────┬──────────────────────┬──────────┬────────────┐
  │  i   │ '#' at │  len  │ word = data[j+1..]   │  word    │ next i     │
  ├──────┼────────┼───────┼──────────────────────┼──────────┼────────────┤
  │  0   │   1    │   4   │ data[2..5]           │ "lint"   │ 1+1+4 = 6  │
  │  6   │   7    │   4   │ data[8..11]          │ "code"   │ 7+1+4 = 12 │
  │ 12   │  13    │   5   │ data[14..18]         │ "#love"  │ 13+1+5 = 19│
  │ 19   │  20    │   4   │ data[21..24]         │ "you:"   │ 20+1+4 = 25│
  │ 25   │   —    │   —   │ i == length → stop   │          │            │
  └──────┴────────┴───────┴──────────────────────┴──────────┴────────────┘

  result = ["lint", "code", "#love", "you:"]  ✅
```

Look at row 3: at `i = 12` the scan finds `'#'` at index 13 (right after the digit `5`). The **next** `'#'` at index 14 belongs to the word and is copied blindly. The decoder never confuses them.

### Edge-case traces

```
  [""]   (a list with ONE empty string)
     encode → "0#"
     decode: i=0, '#' at 1, len=0, word = "" , i = 1+1+0 = 2 = length → stop
             → [""] ✅

  []     (an EMPTY list)
     encode → ""
     decode: i=0, 0 < 0 is false → loop never runs
             → [] ✅

  [] and [""] now encode differently ("" vs "0#"), which the
  delimiter approach could not do.

  Multi-digit length: a 12-char word "abcdefghijkl"
     encode → "12#abcdefghijkl"
     decode reads "12" (all digits up to '#'), then takes 12 chars ✅
```

### Alternative: fixed-width length header

```
   Write the length as exactly 4 bytes / 4 chars, no '#' needed:
     "lint" → "0004lint"
   Decoder reads 4 chars → length → that many chars → repeat.
   Works too, but caps the max length and wastes space on short words.
```

### Complexity

| Operation | Time | Space |
|---|---|---|
| encode | O(total chars) | O(total chars) |
| decode | O(total chars) | O(total chars) |

### 📌 Points to remember
- **Never** rely on a delimiter that could appear in the data. Prefix with the length instead.
- Find the **first** `'#'` starting at `i`. The length part has only digits, so that `'#'` is always the separator.
- After reading the length, **jump** `len` characters. Don't scan the word.
- Test `[]`, `[""]`, `["", ""]`, a word that is just `"#"`, and a word with digits like `"3#x"`.
- Same idea is used in real network protocols (HTTP `Content-Length`, length-prefixed binary messages).

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────────────┬──────────────────────────────────────────┬──────────────────┐
│ Problem                      │ Core idea                                │ Best             │
├──────────────────────────────┼──────────────────────────────────────────┼──────────────────┤
│ Smallest Letter > Target     │ upper_bound (first > target), lo % n wrap│ O(log n), O(1)   │
│ Letter Case Permutation      │ letters branch ×2, digits don't; build   │ O(2^L · n)       │
│                              │ by doubling or backtracking              │                  │
│ Encode and Decode Strings    │ length-prefix "len#word", jump len chars │ O(total), O(total)│
└──────────────────────────────┴──────────────────────────────────────────┴──────────────────┘
```

### Pattern family tree

```
                        GENERAL STRING PARSING
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
   SCAN + LOOKUP             GENERATE STRINGS          FRAME / CODEC
   (find a char)             (each char has choices)   (pack many → one)
        │                         │                         │
   └ Smallest Letter         └ Letter Case             └ Encode / Decode
     (binary search,           Permutation               Strings
      wrap-around)             (doubling /               (length prefix)
                                backtracking)
   Related:                  Related:                  Related:
   ../binary search/         ../backtracking/          Serialize / Deserialize
   02-Lower-Upper-Bound      01-Choice-Based           Binary Tree
```

### Building strings: quick card

```
   ┌──────────────────────────────┬──────────────┐
   │ Method                       │ Cost for n   │
   ├──────────────────────────────┼──────────────┤
   │ s = s + c   (in a loop)      │ O(n²)   🐢   │
   │ list.append(c) then join     │ O(n)    🚀   │
   │ string builder / char array  │ O(n)    🚀   │
   └──────────────────────────────┴──────────────┘
```

### Framing: quick card

```
   ┌──────────────────┬─────────────────────────────┬──────────────────────┐
   │ Method           │ Safe with any data?         │ Notes                │
   ├──────────────────┼─────────────────────────────┼──────────────────────┤
   │ delimiter only   │ ❌ no                       │ breaks on "#" in data│
   │ escaping         │ ✅ yes                      │ decoder is fiddly    │
   │ length prefix    │ ✅ yes                      │ simplest ✅          │
   │ fixed-width len  │ ✅ yes (up to the cap)      │ wastes space         │
   └──────────────────┴─────────────────────────────┴──────────────────────┘
```

### 🚩 Common bugs to avoid

```
  ✗ Smallest Letter: using ≥ instead of >  (target 'c' returns 'c')
  ✗ Smallest Letter: hi = n-1, so "none found" can't be expressed
  ✗ Smallest Letter: forgetting the wrap-around to letters[0]
  ✗ Letter Case: branching on digits (creates duplicate strings)
  ✗ Letter Case: building a new string at every level instead of at the leaf
  ✗ Codec: splitting on a delimiter that can appear in the data
  ✗ Codec: reading only ONE digit of the length ("12#..." read as 1)
  ✗ Codec: scanning the word for '#' instead of jumping len chars
  ✗ Codec: [] and [""] decoding to the same thing
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "What is the WEIRDEST input this could get: empty,     ║
   ║   one item, the delimiter inside the data, no match?"   ║
   ╚══════════════════════════════════════════════════════════╝
     Handle those first, and the main loop is usually easy.
```

---

### ✅ Progress tracker

- [ ] Find Smallest Letter Greater Than Target (Easy)
- [ ] Letter Case Permutation (Medium)
- [ ] Encode and Decode Strings (Medium)
