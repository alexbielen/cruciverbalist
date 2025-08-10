# Clueless -- an online word game with dice.

In this game you roll twelve six-sided dice that all have different letters on them.

The object of the game is to move the dice around and form words, much like a crossword puzzle.

For example you might roll the die and get the following letters:

P, S, M, E
G, K, R, A
P, L, Y, T

And then you could move those into a grid like the following:

```
  P
G E M   S
  P A R K
    L   Y
    T
```

Ending up with the words PEP, GEM, SKY, MALT, PARK.

The dice have the following letters:

1: [C, J, T, D, B, C]
2: [K, G, P, P, F, V]
3: [R, W, L, W, F, D]
4: [R, G, R, G, L, D]
5: [C, M, C, T, T, S]
6: [W, H, P, T, T, H]
7: [E, O, U, A, I, U]
8: [R, N, N, R, H, H]
9: [N, I, I, N, O, Y]
10: [A, A, E, E, O, O]
11: [B, Z, K, X, S, N]
12: [L, L, M, M, Y, B]

There should be a button that says roll that re-rolls all of the dice.

When you click on a die you should be able to move it around on the gameboard.

## 🎯 **Fixed Issues:**

### **1. Proper Puzzle Completion Logic ✅**

- **All 12 dice must be used** in valid words for puzzle completion
- **Tracks dice positions** that are actually part of valid words
- **Only triggers "VALID PUZZLE!"** when every single die contributes to a word
- **No more false completions** just from having dice on the board

### **2. Constrained Random Initial Positions 🎲**

- **Initial dice positions are now random** but constrained to upper left area
- **6x4 grid area** in the upper left (roughly 360x240 pixels)
- **No overlapping** - each die gets its own spot
- **Clean starting layout** - dice are clustered but not in a rigid pattern

## 🔧 **How It Works Now:**

### **Puzzle Completion:**

```
❌ Before: Just having all dice placed = completion
✅ Now: All 12 dice must be part of valid words = completion
```

### **Example Valid Puzzle:**

```
C A T
H   O
E   G
W O R D S
```

- All 12 dice (C,A,T,H,O,E,G,W,O,R,D,S) form valid words
- Words: CAT, CHE, TOG, WORDS
- **Result: "VALID PUZZLE!" celebration**

### **Example Invalid (Even with words):**

```
C A T    [X]
H   O    [X]
E   G
```

- Only 6 dice used in words, 6 dice unused
- **Result: No completion, just individual word flashing**

### **Initial Layout:**

- Dice now start scattered randomly in the upper left corner
- Fresh, natural-looking starting position each time
- Easy to grab and start forming words

This makes the puzzle much more challenging and meaningful - you actually have to use every single die to achieve completion! The constrained random starting positions also give a more natural feel while keeping the dice easily accessible.
