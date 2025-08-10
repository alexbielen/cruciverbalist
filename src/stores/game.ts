import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Die {
  id: number
  letters: string[]
  currentLetter: string
  position: { x: number; y: number }
  gridPosition: { row: number; col: number }
  isDragging: boolean
  isSelected: boolean
}

export interface SelectionBox {
  startX: number
  startY: number
  endX: number
  endY: number
  isActive: boolean
}

export interface FoundWord {
  word: string
  timestamp: number
  isNew: boolean
}

export interface PuzzleState {
  isComplete: boolean
  allWords: string[]
  completionTime: number
}

// Grid configuration
const GRID_SIZE = 60 // Match dice size for proper adjacency
const GRID_COLS = 13 // 800px / 60px ≈ 13
const GRID_ROWS = 10 // 600px / 60px = 10
const GRID_OFFSET_X = 10 // Smaller offset since dice are bigger
const GRID_OFFSET_Y = 10

export const useGameStore = defineStore('game', () => {
  // Dice configuration from the spec
  const diceConfig = [
    { id: 1, letters: ['C', 'J', 'T', 'D', 'B', 'C'] },
    { id: 2, letters: ['K', 'G', 'P', 'P', 'F', 'V'] },
    { id: 3, letters: ['R', 'W', 'L', 'W', 'F', 'D'] },
    { id: 4, letters: ['R', 'G', 'R', 'G', 'L', 'D'] },
    { id: 5, letters: ['C', 'M', 'C', 'T', 'T', 'S'] },
    { id: 6, letters: ['W', 'H', 'P', 'T', 'T', 'H'] },
    { id: 7, letters: ['E', 'O', 'U', 'A', 'I', 'U'] },
    { id: 8, letters: ['R', 'N', 'N', 'R', 'H', 'H'] },
    { id: 9, letters: ['N', 'I', 'I', 'N', 'O', 'Y'] },
    { id: 10, letters: ['A', 'A', 'E', 'E', 'O', 'O'] },
    { id: 11, letters: ['B', 'Z', 'K', 'X', 'S', 'N'] },
    { id: 12, letters: ['L', 'L', 'M', 'M', 'Y', 'B'] },
  ]

  const dice = ref<Die[]>([])
  const draggedDie = ref<Die | null>(null)
  const selectedDice = ref<Die[]>([])
  const selectionBox = ref<SelectionBox>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isActive: false,
  })
  const foundWords = ref<FoundWord[]>([])
  const validWords = ref<Set<string>>(new Set())
  const wordsLoaded = ref(false)
  const discoveredWords = ref<Set<string>>(new Set())
  const puzzleState = ref<PuzzleState>({
    isComplete: false,
    allWords: [],
    completionTime: 0,
  })

  // Load words from words.txt file
  const loadWords = async () => {
    try {
      const response = await fetch('/words.txt')
      const text = await response.text()
      const allWords = text.split('\n').map((word) => word.trim().toLowerCase())

      // Filter for words between 3-12 letters
      const filteredWords = allWords.filter((word) => {
        return word.length >= 3 && word.length <= 12 && word.match(/^[a-z]+$/)
      })

      validWords.value = new Set(filteredWords)
      wordsLoaded.value = true
    } catch (error) {
      console.error('❌ Failed to load words:', error)
      // Fallback: use a small set of common words
      const fallbackWords = [
        'cat',
        'dog',
        'the',
        'and',
        'but',
        'car',
        'bat',
        'hat',
        'mat',
        'rat',
        'get',
        'set',
        'pet',
        'net',
        'bet',
        'let',
        'met',
        'wet',
        'yet',
        'jet',
        'big',
        'pig',
        'fig',
        'dig',
        'wig',
        'jig',
        'rig',
        'bag',
        'tag',
        'rag',
        'run',
        'fun',
        'sun',
        'gun',
        'bun',
        'nun',
        'pun',
        'cut',
        'but',
        'hut',
        'game',
        'time',
        'play',
        'word',
        'make',
        'take',
        'give',
        'love',
        'home',
      ]
      validWords.value = new Set(fallbackWords)
      wordsLoaded.value = true
    }
  }

  // Check if a word is valid
  const isValidWord = (word: string): boolean => {
    return validWords.value.has(word.toLowerCase())
  }

  // Snap position to grid
  const snapToGrid = (x: number, y: number) => {
    const col = Math.round((x - GRID_OFFSET_X) / GRID_SIZE)
    const row = Math.round((y - GRID_OFFSET_Y) / GRID_SIZE)

    const clampedCol = Math.max(0, Math.min(col, GRID_COLS - 1))
    const clampedRow = Math.max(0, Math.min(row, GRID_ROWS - 1))

    return {
      x: clampedCol * GRID_SIZE + GRID_OFFSET_X,
      y: clampedRow * GRID_SIZE + GRID_OFFSET_Y,
      col: clampedCol,
      row: clampedRow,
    }
  }

  // Generate random positions constrained to upper left area
  const generateConstrainedRandomPositions = () => {
    const positions: { x: number; y: number; row: number; col: number }[] = []
    const usedPositions = new Set<string>()

    // Constrain to upper left area (roughly 6x4 area)
    const maxCol = Math.min(6, GRID_COLS)
    const maxRow = Math.min(4, GRID_ROWS)

    for (let i = 0; i < 12; i++) {
      let attempts = 0
      let position

      do {
        const col = Math.floor(Math.random() * maxCol)
        const row = Math.floor(Math.random() * maxRow)
        const key = `${row},${col}`

        if (!usedPositions.has(key)) {
          position = {
            x: col * GRID_SIZE + GRID_OFFSET_X,
            y: row * GRID_SIZE + GRID_OFFSET_Y,
            col,
            row,
          }
          usedPositions.add(key)
          break
        }
        attempts++
      } while (attempts < 100) // Prevent infinite loop

      if (position) {
        positions.push(position)
      } else {
        // Fallback to a basic grid pattern in upper left
        const col = i % 4
        const row = Math.floor(i / 4)
        positions.push({
          x: col * GRID_SIZE + GRID_OFFSET_X,
          y: row * GRID_SIZE + GRID_OFFSET_Y,
          col,
          row,
        })
      }
    }

    return positions
  }

  // Initialize dice with random letters and constrained random positions
  const initializeDice = () => {
    const initialPositions = generateConstrainedRandomPositions()
    dice.value = diceConfig.map((config, index) => ({
      ...config,
      currentLetter: config.letters[Math.floor(Math.random() * config.letters.length)],
      position: {
        x: initialPositions[index].x,
        y: initialPositions[index].y,
      },
      gridPosition: {
        row: initialPositions[index].row,
        col: initialPositions[index].col,
      },
      isDragging: false,
      isSelected: false,
    }))
  }

  // Roll all dice to constrained random positions
  const rollDice = () => {
    const randomPositions = generateConstrainedRandomPositions()
    dice.value.forEach((die, index) => {
      die.currentLetter = die.letters[Math.floor(Math.random() * die.letters.length)]
      die.position = {
        x: randomPositions[index].x,
        y: randomPositions[index].y,
      }
      die.gridPosition = {
        row: randomPositions[index].row,
        col: randomPositions[index].col,
      }
      die.isSelected = false
      die.isDragging = false
    })
    selectedDice.value = []

    // Reset word tracking for new puzzle
    discoveredWords.value.clear()
    foundWords.value = []
    puzzleState.value = {
      isComplete: false,
      allWords: [],
      completionTime: 0,
    }
  }

  // Update die position with grid snapping
  const updateDiePosition = (id: number, x: number, y: number, shouldSnap: boolean = false) => {
    const die = dice.value.find((d) => d.id === id)
    if (die) {
      if (shouldSnap) {
        const snapped = snapToGrid(x, y)
        die.position = { x: snapped.x, y: snapped.y }
        die.gridPosition = { row: snapped.row, col: snapped.col }
      } else {
        die.position = { x, y }
      }
    }
  }

  // Set dragging state
  const setDragging = (id: number, isDragging: boolean) => {
    const die = dice.value.find((d) => d.id === id)
    if (die) {
      die.isDragging = isDragging
      // Snap to grid when done dragging
      if (!isDragging) {
        const snapped = snapToGrid(die.position.x, die.position.y)
        die.position = { x: snapped.x, y: snapped.y }
        die.gridPosition = { row: snapped.row, col: snapped.col }
        checkForWords()
      }
    }
  }

  // Set dragged die
  const setDraggedDie = (die: Die | null) => {
    draggedDie.value = die
  }

  // Clear all selections
  const clearSelection = () => {
    dice.value.forEach((die) => {
      die.isSelected = false
    })
    selectedDice.value = []
  }

  // Select a die
  const selectDie = (id: number) => {
    const die = dice.value.find((d) => d.id === id)
    if (die) {
      die.isSelected = true
      if (!selectedDice.value.find((d) => d.id === id)) {
        selectedDice.value.push(die)
      }
    }
  }

  // Deselect a die
  const deselectDie = (id: number) => {
    const die = dice.value.find((d) => d.id === id)
    if (die) {
      die.isSelected = false
      selectedDice.value = selectedDice.value.filter((d) => d.id !== id)
    }
  }

  // Update selection box
  const updateSelectionBox = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    isActive: boolean,
  ) => {
    selectionBox.value = { startX, startY, endX, endY, isActive }
  }

  // Check if a die is within selection box
  const isDieInSelectionBox = (die: Die) => {
    if (!selectionBox.value.isActive) return false

    const dieCenterX = die.position.x + 30 // die width / 2
    const dieCenterY = die.position.y + 30 // die height / 2

    const left = Math.min(selectionBox.value.startX, selectionBox.value.endX)
    const right = Math.max(selectionBox.value.startX, selectionBox.value.endX)
    const top = Math.min(selectionBox.value.startY, selectionBox.value.endY)
    const bottom = Math.max(selectionBox.value.startY, selectionBox.value.endY)

    return dieCenterX >= left && dieCenterX <= right && dieCenterY >= top && dieCenterY <= bottom
  }

  // Move all selected dice by offset with grid snapping
  const moveSelectedDice = (offsetX: number, offsetY: number) => {
    selectedDice.value.forEach((die) => {
      const newX = die.position.x + offsetX
      const newY = die.position.y + offsetY

      // Keep within bounds
      const maxX = 740
      const maxY = 540

      die.position.x = Math.max(0, Math.min(newX, maxX))
      die.position.y = Math.max(0, Math.min(newY, maxY))
    })
  }

  // Snap all selected dice to grid
  const snapSelectedDiceToGrid = () => {
    selectedDice.value.forEach((die) => {
      const snapped = snapToGrid(die.position.x, die.position.y)
      die.position = { x: snapped.x, y: snapped.y }
      die.gridPosition = { row: snapped.row, col: snapped.col }
    })
    checkForWords()
  }

  // Word detection with dictionary validation
  const checkForWords = () => {
    if (!wordsLoaded.value) {
      return
    }

    const grid: { [key: string]: string } = {}

    // Create grid map
    dice.value.forEach((die) => {
      const key = `${die.gridPosition.row},${die.gridPosition.col}`
      grid[key] = die.currentLetter
    })

    const foundWordsList: string[] = []

    // Check horizontal words
    for (let row = 0; row < GRID_ROWS; row++) {
      let word = ''
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${row},${col}`
        if (grid[key]) {
          word += grid[key]
        } else {
          if (word.length >= 3) {
            if (isValidWord(word)) {
              foundWordsList.push(word.toUpperCase())
            }
          }
          word = ''
        }
      }
      if (word.length >= 3) {
        if (isValidWord(word)) {
          foundWordsList.push(word.toUpperCase())
        }
      }
    }

    // Check vertical words
    for (let col = 0; col < GRID_COLS; col++) {
      let word = ''
      for (let row = 0; row < GRID_ROWS; row++) {
        const key = `${row},${col}`
        if (grid[key]) {
          word += grid[key]
        } else {
          if (word.length >= 3) {
            if (isValidWord(word)) {
              foundWordsList.push(word.toUpperCase())
            }
          }
          word = ''
        }
      }
      if (word.length >= 3) {
        if (isValidWord(word)) {
          foundWordsList.push(word.toUpperCase())
        }
      }
    }

    // Add new words to found words list
    foundWordsList.forEach((word) => {
      const isNewDiscovery = !discoveredWords.value.has(word)

      if (isNewDiscovery) {
        discoveredWords.value.add(word)
        foundWords.value.push({ word, timestamp: Date.now(), isNew: true })
      }
    })

    // Clean up old words
    foundWords.value = foundWords.value.filter((fw) => Date.now() - fw.timestamp < 3000)

    // Check for puzzle completion - all 12 dice must be used in valid words
    const diceInWords = new Set<string>()

    // Collect all dice positions that are part of valid words
    for (let row = 0; row < GRID_ROWS; row++) {
      let word = ''
      let wordPositions: string[] = []
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${row},${col}`
        if (grid[key]) {
          word += grid[key]
          wordPositions.push(key)
        } else {
          if (word.length >= 3 && isValidWord(word)) {
            wordPositions.forEach((pos) => diceInWords.add(pos))
          }
          word = ''
          wordPositions = []
        }
      }
      if (word.length >= 3 && isValidWord(word)) {
        wordPositions.forEach((pos) => diceInWords.add(pos))
      }
    }

    // Check vertical words
    for (let col = 0; col < GRID_COLS; col++) {
      let word = ''
      let wordPositions: string[] = []
      for (let row = 0; row < GRID_ROWS; row++) {
        const key = `${row},${col}`
        if (grid[key]) {
          word += grid[key]
          wordPositions.push(key)
        } else {
          if (word.length >= 3 && isValidWord(word)) {
            wordPositions.forEach((pos) => diceInWords.add(pos))
          }
          word = ''
          wordPositions = []
        }
      }
      if (word.length >= 3 && isValidWord(word)) {
        wordPositions.forEach((pos) => diceInWords.add(pos))
      }
    }

    // Check if all 12 dice are used in valid words
    const allDiceUsedInWords = diceInWords.size === 12

    if (allDiceUsedInWords && foundWordsList.length > 0) {
      puzzleState.value.isComplete = true
      puzzleState.value.allWords = foundWordsList
      puzzleState.value.completionTime = Date.now()
    } else {
      puzzleState.value.isComplete = false
    }
  }

  // Generate a text representation of the puzzle for sharing
  const generatePuzzleText = (): string => {
    if (!puzzleState.value.isComplete) return ''

    const grid: { [key: string]: string } = {}

    // Create grid map
    dice.value.forEach((die) => {
      const key = `${die.gridPosition.row},${die.gridPosition.col}`
      grid[key] = die.currentLetter
    })

    // Find the bounds of the actual puzzle
    let minRow = GRID_ROWS,
      maxRow = -1,
      minCol = GRID_COLS,
      maxCol = -1

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const key = `${row},${col}`
        if (grid[key]) {
          minRow = Math.min(minRow, row)
          maxRow = Math.max(maxRow, row)
          minCol = Math.min(minCol, col)
          maxCol = Math.max(maxCol, col)
        }
      }
    }

    // Generate the text grid
    let puzzleText = '🎲 Clueless Puzzle Solution 🎲\n\n'

    for (let row = minRow; row <= maxRow; row++) {
      let line = ''
      for (let col = minCol; col <= maxCol; col++) {
        const key = `${row},${col}`
        line += grid[key] ? ` ${grid[key]} ` : '   '
      }
      puzzleText += line.trimEnd() + '\n'
    }

    puzzleText += '\nWords found: ' + puzzleState.value.allWords.join(', ')
    puzzleText += '\n\nSolved in Clueless - the word dice game!'

    return puzzleText
  }

  // Copy puzzle to clipboard
  const copyPuzzleToClipboard = async (): Promise<boolean> => {
    try {
      const puzzleText = generatePuzzleText()
      await navigator.clipboard.writeText(puzzleText)
      return true
    } catch (error) {
      console.error('Failed to copy puzzle:', error)
      return false
    }
  }

  return {
    dice,
    draggedDie,
    selectedDice,
    selectionBox,
    foundWords,
    validWords,
    wordsLoaded,
    discoveredWords,
    puzzleState,
    GRID_SIZE,
    GRID_OFFSET_X,
    GRID_OFFSET_Y,
    GRID_COLS,
    GRID_ROWS,
    initializeDice,
    rollDice,
    updateDiePosition,
    setDragging,
    setDraggedDie,
    clearSelection,
    selectDie,
    deselectDie,
    updateSelectionBox,
    isDieInSelectionBox,
    moveSelectedDice,
    snapSelectedDiceToGrid,
    snapToGrid,
    checkForWords,
    loadWords,
    isValidWord,
    generatePuzzleText,
    copyPuzzleToClipboard,
  }
})
