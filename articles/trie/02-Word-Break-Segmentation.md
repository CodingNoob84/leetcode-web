# Trie: Word Break / Segmentation: A Visual Guide

> **Goal:** Learn to *see* "cut this string into dictionary words" problems, and use a **trie** to make every cut check fast.
> No real code here, only **pictures, intuition, pseudocode, and checklists**.
> Builds on [01-Basic-Trie-Operations.md](01-Basic-Trie-Operations.md) (insert / search / prefix walk).

---

## Table of Contents

0. [The Big Idea: Segmentation + Trie](#0-the-big-idea-segmentation--trie)
1. [Replace Words (Medium)](#1-replace-words-medium)
2. [Word Break (Medium)](#2-word-break-medium)
3. [Concatenated Words (Hard)](#3-concatenated-words-hard)
4. [Master Cheat Sheet](#4-master-cheat-sheet)

> **Suggested order:** Replace Words → Word Break → Concatenated Words.
> Replace Words needs **one** trie walk per word. Word Break chains walks with a **DP array**.
> Concatenated Words runs Word Break **once per word** while the trie grows.

---

## 0. The Big Idea: Segmentation + Trie

### How to spot it

```
┌──────────────────────────────────────────────────────────────────┐
│  🔍  SIGNALS THAT SCREAM "TRIE + SEGMENTATION"                   │
├──────────────────────────────────────────────────────────────────┤
│  • A STRING plus a DICTIONARY of words                           │
│  • "Can s be split into dictionary words?"                       │
│  • "Replace each word with its shortest root / prefix"           │
│  • "Which words are made of OTHER words in the list?"            │
│  • Many lookups of the form "is s[i..j] a word?"                 │
└──────────────────────────────────────────────────────────────────┘
```

### The "cut positions" picture

```
   s =   c   a   t   s   a   n   d   d   o   g
       ↑   ↑   ↑   ↑   ↑   ↑   ↑   ↑   ↑   ↑   ↑
       0   1   2   3   4   5   6   7   8   9   10      ← cut positions (n+1 of them)

   A segmentation = a set of cuts so that EVERY piece is a dictionary word.

       c a t s │ a n d │ d o g        cuts at 4, 7   →  "cats" "and" "dog"
       c a t │ s a n d │ d o g        cuts at 3, 7   →  "cat" "sand" "dog"

   Position i is "reachable" if s[0..i) can be fully cut into words.
```

### The DP state

```
  ┌──────────────────────────────────────────────────────────────┐
  │ dp[i] = TRUE  if the prefix of length i (s[0..i)) can be     │
  │               split entirely into dictionary words           │
  └──────────────────────────────────────────────────────────────┘

  dp[0] = TRUE   (the empty prefix needs zero words)

  dp[j] = TRUE   if some i < j has dp[i] = TRUE  AND  s[i..j) is a word

         reachable                 a word
        ┌────────┐┌────────────────────────┐
   s =  ████████ i ░░░░░░░░░░░░░░░░░░░░░░░░ j ...
                          ⇒ j is reachable too

  Answer: dp[n]
```

> This is **1D DP** from `../dynammic programming/01-1D-Linear-DP.md`:
> "the last word ended at j; where did it start?"

### Why a trie helps

```
  HASH-SET way: from every reachable i, try EVERY end j and ask "is s[i..j) a word?"

     i
     ▼
     c a t s a n d o g
     [c]                 "c"        in set? no
     [c a]               "ca"       in set? no
     [c a t]             "cat"      in set? YES
     [c a t s]           "cats"     in set? YES
     [c a t s a]         "catsa"    in set? no     ← keeps going to the END
     [c a t s a n]       ...            even though NO word starts with "catsa"
     ...
     Each check builds + hashes a substring → O(length) work each time.

  TRIE way: from i, walk DOWN the trie one character at a time.

     i
     ▼
     c ─► a ─► t ─► s ─► a ✗   ← no child 'a' under "cats" → STOP immediately
               ▲     ▲
             [end] [end]       every end-of-word node we pass = a valid cut

     • One step per character, no substring copies.
     • The walk dies as soon as the prefix leaves the dictionary.
```

| From each start i | Hash set | Trie |
|---|---|---|
| Ends tried | all j up to n (or up to maxLen) | only while a trie path exists |
| Cost per end | O(len) to slice + hash | O(1) to step one child |
| Total (n = string, L = longest word) | O(n² · L) worst, O(n · L²) if capped at L | **O(n · L)** |

### The combined template: DP + trie walk

```
  for i from 0 to n-1:
      if dp[i] is FALSE: skip           ← can't start a word here
      node ← root
      for j from i to n-1:
          node ← node.child[s[j]]
          if node is NONE: break        ← no dictionary word continues → stop early
          if node.isEnd:
              dp[j+1] ← TRUE            ← s[i..j] is a word → cut after j
```

> 💡 **Key insight:** the inner loop is not "for every possible word".
> It is "follow the trie as far as the string allows". Every `isEnd` you pass is a free cut.

---

## 1. Replace Words (Medium)

### Problem
A dictionary of **roots** and a sentence. Replace every word in the sentence with the
**shortest root** that is a prefix of it. Words with no root stay unchanged.

### Visualize it

```
   roots:     cat   bat   rat

   sentence:  the  cattle  was  rattled  by  the  battery
               │     │      │      │      │    │     │
               ▼     ▼      ▼      ▼      ▼    ▼     ▼
   result:    the   cat    was    rat    by   the   bat
```

### The trie for [cat, bat, rat]

```
              (root)
           ┌────┼────┐
           c    b    r
           │    │    │
           a    a    a
           │    │    │
          [t]  [t]  [t]        [ ] = end of a root
```

### The decision: walk until the FIRST end node, or until you fall off

```
   For each word w:
        walk the trie with w's letters
          │
          ├── hit an END node first       → replace w with the prefix walked so far
          │                                  (shortest root, because it is the first)
          ├── missing child               → no root fits → keep w
          └── ran out of letters          → no root fits → keep w
```

### The 5 steps

| Step | Answer |
|------|--------|
| Structure | Trie of all roots, `isEnd` marks a full root |
| Per word | Walk letter by letter from the root |
| Stop rule | First `isEnd` → answer is that prefix. Missing child → keep the word |
| Why shortest | The walk visits prefixes from short to long, so the first end found is the shortest |
| Output | Join the replaced words with spaces |

### Trace

```
  word       walk                                   result
  ─────────  ─────────────────────────────────────  ──────────
  the        t ✗ (root has no 't')                  "the"
  cattle     c → a → [t] END after 3 letters        "cat"
  was        w ✗                                    "was"
  rattled    r → a → [t] END after 3 letters        "rat"
  by         b → y ✗ (only 'a' under 'b')           "by"
  the        t ✗                                    "the"
  battery    b → a → [t] END after 3 letters        "bat"

  answer: "the cat was rat by the bat" ✅
```

### Shortest-root example

```
  roots: [a, aa, aaa]        word: "aaaa"

         (root)
           │
          [a]   ← END after 1 letter → STOP here → "a"
           │
          [a]
           │
          [a]

  We never look at "aa" or "aaa". The first end node wins.
```

### Pseudocode

```
function replaceWords(roots, sentence):
    root ← new trie node
    for each r in roots: insert(root, r)

    output ← empty list
    for each word w in split(sentence, " "):
        node ← root
        replacement ← w
        for k from 0 to length(w) - 1:
            node ← node.child[w[k]]
            if node is NONE: break                 // no root fits
            if node.isEnd:
                replacement ← w[0..k]             // first end = shortest root
                break
        append replacement to output
    return join(output, " ")
```

### Complexity

| Approach | Time | Space |
|---|---|---|
| For each word, try every prefix in a hash set | O(Σ len(w)²) | O(dict chars) |
| **Trie walk, stop at first end** | **O(dict chars + sentence length)** | O(dict chars) |

### 📌 Points to remember
- **Stop at the first `isEnd`.** That is what makes it the *shortest* root.
- A missing child means no root can match → keep the original word.
- Building the trie costs O(total root letters) once. Each sentence word is then one short walk.

---

## 2. Word Break (Medium)

### Problem
Given a string `s` and a dictionary, return **true** if `s` can be split into one or more dictionary words (words may be reused).

### Visualize it

```
   s = "leetcode"      dict = [leet, code]

        l e e t │ c o d e
        └─leet─┘ └─code─┘     → true ✅

   s = "catsandog"     dict = [cats, dog, sand, and, cat]

        c a t s │ a n d │ o g     "og" is not a word ✗
        c a t │ s a n d │ o g     "og" is not a word ✗
                                   → false ❌
```

### The decision at each reachable position

```
                 position i is reachable (dp[i] = TRUE)
                              │
           which dictionary words START at i?
          ┌───────────────────┼───────────────────┐
       word of length a    word of length b     ...
          │                   │
     dp[i+a] = TRUE      dp[i+b] = TRUE

   The trie answers "which words start at i?" in ONE walk.
```

### The 5 steps

| Step | Answer |
|------|--------|
| State | `dp[i]` = prefix `s[0..i)` can be fully segmented |
| Transition | if `dp[i]` and `s[i..j)` is a word → `dp[j] = TRUE` |
| Base | `dp[0] = TRUE` |
| Order | i from 0 to n-1 (push forward) |
| Answer | `dp[n]` |

### Trace 1: "leetcode", dict = [leet, code]

```
  trie:      (root)
            ┌──┴──┐
            l     c
            │     │
            e     o
            │     │
            e     d
            │     │
           [t]   [e]

  s:    l   e   e   t   c   o   d   e
  idx:  0   1   2   3   4   5   6   7

  i=0 (dp TRUE):  l → e → e → [t] END at j=3 → dp[4] = TRUE
                  next char 'c': no child under "leet" → stop
  i=1,2,3:        dp FALSE → skip
  i=4 (dp TRUE):  c → o → d → [e] END at j=7 → dp[8] = TRUE
  i=5,6,7:        dp FALSE → skip

  i     :  0   1   2   3   4   5   6   7   8
         ┌───┬───┬───┬───┬───┬───┬───┬───┬───┐
  dp    :│ T │ F │ F │ F │ T │ F │ F │ F │ T │
         └───┴───┴───┴───┴───┴───┴───┴───┴───┘
                         ▲                   ▲
                       "leet"             "code"    dp[8] = TRUE ✅
```

### Trace 2: "catsandog", dict = [cats, dog, sand, and, cat]

```
  trie:          (root)
         ┌───────┬───┴───┬───────┐
         c       d       s       a
         │       │       │       │
         a       o       a       n
         │       │       │       │
        [t]     [g]      n      [d]
         │               │
        [s]             [d]

  s:    c   a   t   s   a   n   d   o   g
  idx:  0   1   2   3   4   5   6   7   8

  i=0 (T):  c → a → [t] END at j=2 → dp[3] = TRUE
                     → [s] END at j=3 → dp[4] = TRUE
                     next 'a': no child under "cats" → stop
  i=1, 2:   F → skip
  i=3 (T):  s → a → n → [d] END at j=6 → dp[7] = TRUE
                     next 'o': no child under "sand" → stop
  i=4 (T):  a → n → [d] END at j=6 → dp[7] = TRUE (already)
                     next 'o': no child → stop
  i=5, 6:   F → skip
  i=7 (T):  'o': root has no child 'o' → stop immediately
  i=8:      F → skip

  i     :  0   1   2   3   4   5   6   7   8   9
         ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬───┐
  dp    :│ T │ F │ F │ T │ T │ F │ F │ T │ F │ F │
         └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                                     ▲           ▲
                         "cats|and" or "cat|sand"  dp[9] = FALSE ❌
                         reach 7, but "og" is not a word
```

### Pseudocode A: hash set (the classic O(n²) loops)

```
function wordBreak(s, dict):
    words ← set(dict)
    n ← length(s)
    dp ← array of n+1, all FALSE
    dp[0] ← TRUE
    for j from 1 to n:
        for i from 0 to j-1:
            if dp[i] and s[i..j) in words:
                dp[j] ← TRUE
                break
    return dp[n]
```

### Pseudocode B: trie walk (push forward, stop early)

```
function wordBreak(s, dict):
    root ← new trie node
    for each w in dict: insert(root, w)
    n ← length(s)
    dp ← array of n+1, all FALSE
    dp[0] ← TRUE
    for i from 0 to n-1:
        if not dp[i]: continue
        node ← root
        for j from i to n-1:
            node ← node.child[s[j]]
            if node is NONE: break
            if node.isEnd: dp[j+1] ← TRUE
    return dp[n]
```

### Optimization ladder

| Approach | Time | Space |
|---|---|---|
| Plain recursion (try every cut) | O(2ⁿ) | O(n) |
| Memo on start index | O(n² · L) | O(n) |
| DP + hash set | O(n² · L) (O(n · L²) if j − i ≤ maxLen) | O(n + dict) |
| **DP + trie walk** | **O(n · L)** | O(n + dict chars) |

> L = length of the longest dictionary word. The trie walk from `i` never goes deeper than L.

### 📌 Points to remember
- `dp` has **n+1** cells. `dp[0] = TRUE` is the empty prefix.
- Words may be **reused**. Nothing marks a word as "used".
- Skip any `i` where `dp[i]` is FALSE. A word can't start at an unreachable cut.
- With a hash set, cap `j − i` at the longest word length. Longer pieces can't be words.
- Want **all** sentences, not just true/false? That is **Word Break II**, taught in
  `../backtracking/04-Decision-Tree-Sequence-Generation.md`. Check `dp[n]` first so you don't
  enumerate hopeless strings like `"aaaa…ab"`.
- More string DP patterns: `../dynammic programming/03-DP-on-Strings.md`.

---

## 3. Concatenated Words (Hard)

### Problem
Given a list of **unique** words, return every word that is made of **at least two** shorter words from the same list.

### Visualize it

```
   words: cat, cats, catsdogcats, dog, dogcatsdog, hippopotamuses, rat, ratcatdogcat

   catsdogcats   = cats │ dog │ cats          ✅
   dogcatsdog    = dog │ cats │ dog            ✅
   ratcatdogcat  = rat │ cat │ dog │ cat       ✅
   hippopotamuses: no split works              ❌
   cat, cats, dog, rat: no shorter pieces      ❌

   answer: ["catsdogcats", "dogcatsdog", "ratcatdogcat"]
```

### The key idea: sort by length, then Word Break against a growing trie

```
   A word can only be built from SHORTER words.

   Sort by length ──►  cat  dog  rat  cats  dogcatsdog  catsdogcats  ratcatdogcat  hippopotamuses
                       (3)  (3)  (3)  (4)     (10)          (11)         (12)          (14)

   For each word, in order:
      1. CHECK: can it be word-broken using only words ALREADY in the trie?
      2. INSERT it into the trie (so longer words can use it later)

   ┌──────────────────────────────────────────────────────────────────┐
   │ Why "at least 2 words" comes for free:                           │
   │ the word is checked BEFORE it is inserted, so the trie can't     │
   │ match the whole word as a single piece. Any successful split     │
   │ must use 2 or more shorter words.                                │
   └──────────────────────────────────────────────────────────────────┘
```

### The 5 steps (per word w)

| Step | Answer |
|------|--------|
| State | `dp[i]` = `w[0..i)` can be split into words already in the trie |
| Transition | from each reachable `i`, walk the trie; every `isEnd` at j → `dp[j+1] = TRUE` |
| Base | `dp[0] = TRUE` |
| Order | words by increasing length; inside a word, i from 0 to n-1 |
| Answer | collect w if `dp[len(w)]` is TRUE, then insert w |

### Trace (sorted order)

```
  word            trie before check          check result                       insert
  ──────────────  ─────────────────────────  ─────────────────────────────────  ──────
  cat             (empty)                    'c' ✗ → not concatenated           ✓
  dog             {cat}                      'd' ✗                              ✓
  rat             {cat, dog}                 'r' ✗                              ✓
  cats            {cat, dog, rat}            cat|  then "s": 's' ✗ → FALSE      ✓
```

```
  dogcatsdog   trie = {cat, dog, rat, cats}

  d o g c a t s d o g
  0 1 2 3 4 5 6 7 8 9

  i=0: d→o→[g] END → dp[3]=T              ; next 'c' ✗ under "dog"
  i=3: c→a→[t] END → dp[6]=T
              →[s] END → dp[7]=T           ; next 'd' ✗ under "cats"
  i=6: 's' ✗ at root
  i=7: d→o→[g] END → dp[10]=T  ✅           dog | cats | dog
```

```
  catsdogcats   trie = {cat, dog, rat, cats, dogcatsdog}

  c a t s d o g c a t s
  0 1 2 3 4 5 6 7 8 9 10

  i=0: c→a→[t] → dp[3]=T, →[s] → dp[4]=T  ; next 'd' ✗ under "cats"
  i=3: 's' ✗
  i=4: d→o→[g] → dp[7]=T                  ; next 'c' → "dogc" exists (dogcatsdog path!)
                                             walk continues d→o→g→c→a→t→s (no end nodes)
                                             then the word runs out of letters → stop
  i=7: c→a→[t] → dp[10]=T, →[s] → dp[11]=T  ✅    cats | dog | cats
```

> Notice at i=4 the walk keeps going into the **dogcatsdog** branch (`dogcats…`).
> That is fine. It only marks cuts at `isEnd` nodes, and that branch runs out of letters first.

```
  ratcatdogcat   trie = {cat, dog, rat, cats, dogcatsdog, catsdogcats}

  r→a→[t] → dp[3]=T
  i=3: c→a→[t] → dp[6]=T  (next 'd': "catd" ✗)
  i=6: d→o→[g] → dp[9]=T  (next 'c': "dogc" exists; "dogca", "dogcat" exist; then end of word)
  i=9: c→a→[t] → dp[12]=T  ✅     rat | cat | dog | cat
```

```
  hippopotamuses: 'h' ✗ at root → dp stays FALSE everywhere → ❌

  RESULT: ["dogcatsdog", "catsdogcats", "ratcatdogcat"]
          (LeetCode accepts any order) ✅
```

### Pseudocode

```
function findAllConcatenatedWords(words):
    sort words by length (shortest first)
    root ← new trie node
    result ← empty list
    for each w in words:
        if w is empty: continue                  // ⚠ would make the root an end node
        if canBreak(w, root):
            append w to result
        insert(root, w)
    return result

function canBreak(w, root):
    n ← length(w)
    dp ← array of n+1, all FALSE
    dp[0] ← TRUE
    for i from 0 to n-1:
        if not dp[i]: continue
        node ← root
        for j from i to n-1:
            node ← node.child[w[j]]
            if node is NONE: break
            if node.isEnd: dp[j+1] ← TRUE
        if dp[n]: return TRUE                    // early exit
    return dp[n]
```

### Alternative: no sorting (DFS with a word count)

```
  Insert ALL words first. Then for each word run a DFS that splits it
  and counts how many pieces it used. Accept only if count ≥ 2.
  Memoize on the start index per word.

  Sorting is simpler: "check before insert" guarantees ≥ 2 pieces automatically.
```

### Complexity

| Part | Cost |
|---|---|
| Sort | O(W log W) |
| Check one word of length n | O(n · L) with the trie walk |
| Insert one word | O(n) |
| **Total** | **O(W log W + Σ n · L)** |

> W = number of words, n = length of each word, L = longest word that can appear as a piece.

### 📌 Points to remember
- **Sort by length, check before insert.** That gives "≥ 2 words" for free.
- **Skip the empty string.** Inserting `""` marks the root as an end, and then every split looks valid.
- Inserting every word (even concatenated ones) is fine. A concatenated word is made of smaller words that are already there.
- The per-word check is exactly **Word Break**. Reuse the same function.
- Early exit as soon as `dp[n]` becomes TRUE.

---

## 4. Master Cheat Sheet

### All 3 problems at a glance

```
┌──────────────────────┬──────────────────────────────────────────────┬────────────────────┬──────────────┐
│ Problem              │ Core idea                                    │ Answer             │ Best         │
├──────────────────────┼──────────────────────────────────────────────┼────────────────────┼──────────────┤
│ Replace Words        │ walk each word, stop at FIRST end node       │ joined sentence    │ O(total len) │
│ Word Break           │ dp[i] reachable; trie walk marks dp[j+1]     │ dp[n]              │ O(n · L)     │
│ Concatenated Words   │ sort by length; Word Break before insert     │ words with dp[n]   │ O(Σ n · L)   │
└──────────────────────┴──────────────────────────────────────────────┴────────────────────┴──────────────┘
```

### Pattern family tree

```
                     TRIE + SEGMENTATION
                             │
        ┌────────────────────┼─────────────────────────┐
        │                    │                         │
   ONE WALK PER WORD    DP OVER CUT POSITIONS     DP PER WORD + GROWING TRIE
   (prefix match)       (chain the walks)         (dictionary built from input)
        │                    │                         │
   └─ Replace Words     ├─ Word Break             └─ Concatenated Words
                        └─ Word Break II  (all sentences → backtracking + memo)
```

### Hash set vs trie: when to bother

```
   ┌───────────────────────────────┬─────────────────────────────────────┐
   │ Use a HASH SET when...        │ Use a TRIE when...                  │
   ├───────────────────────────────┼─────────────────────────────────────┤
   │ the dictionary is small       │ many words share prefixes           │
   │ words are short (cap at L)    │ you need "stop as soon as no word"  │
   │ you just need exact lookups   │ you need shortest / all prefixes    │
   │                               │ the dictionary grows while you scan │
   └───────────────────────────────┴─────────────────────────────────────┘
```

### Optimization checklist

```
  ☐ Many "is s[i..j) a word?" checks?        → trie walk from i, break on missing child
  ☐ Using a hash set anyway?                  → cap j − i at the longest word length
  ☐ Only need true/false?                     → boolean dp, not a list of sentences
  ☐ Need all sentences?                       → check dp[n] first, then backtrack with memo
  ☐ Dictionary comes from the input itself?   → sort by length, check before insert
  ☐ Need the shortest matching prefix?        → stop at the FIRST isEnd node
```

### 🚩 Common bugs to avoid

```
  ✗ dp array of size n instead of n+1; forgetting dp[0] = TRUE
  ✗ Starting a trie walk from an i where dp[i] is FALSE
  ✗ Not breaking when the child is missing (walk keeps going on a null node)
  ✗ Replace Words: continuing past the first end node (returns a LONGER root)
  ✗ Concatenated Words: inserting before checking (every word matches itself)
  ✗ Concatenated Words: inserting "" (root becomes an end node)
  ✗ Word Break II without a feasibility check → exponential blowup
```

### 🧠 The one question to always ask

```
   ╔══════════════════════════════════════════════════════════╗
   ║  "From this cut position, which dictionary words can     ║
   ║   start here, and how far does each one reach?"          ║
   ╚══════════════════════════════════════════════════════════╝
     One trie walk answers it, and every end node is a new cut.
```

---

### ✅ Progress tracker

- [ ] Replace Words (Medium)
- [ ] Word Break (Medium)
- [ ] Concatenated Words (Hard)
