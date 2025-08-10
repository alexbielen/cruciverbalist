# Refactor

The refactor is to make this into a site that can support multiple games.

The site is Cruciverbalist and has word puzzles.

So far there are two games:

1. Clueless (the game that is already here)
2. Obliques -- a game that I have in a different repository.

What I would like to do is the following:

Create a cruciverbalist homepage that has links to:

Clueless -- the dice rolling crossword game
Obliques -- the oblique metaphor guessing game

the URL paths should be

`/clueless`
`/obliques`

Obliques will also have a serverless backend component as a part of this monorepo.
