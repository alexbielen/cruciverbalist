<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useGameStore, type Die } from '../stores/game'

const gameStore = useGameStore()
const dragOffset = reactive({ x: 0, y: 0 })
const isSelecting = ref(false)
const selectionStart = reactive({ x: 0, y: 0 })
const isDraggingSelection = ref(false)
const selectionDragStart = reactive({ x: 0, y: 0 })
const copySuccess = ref(false)

// Handle copy puzzle
const handleCopyPuzzle = async () => {
  const success = await gameStore.copyPuzzleToClipboard()
  if (success) {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }
}

// Handle mouse down on a die
const handleMouseDown = (event: MouseEvent, die: Die) => {
  // If clicking on a die, handle individual die dragging
  gameStore.setDragging(die.id, true)
  gameStore.setDraggedDie(die)

  // Calculate offset from mouse position to die position
  dragOffset.x = event.clientX - die.position.x
  dragOffset.y = event.clientY - die.position.y

  event.preventDefault()
  event.stopPropagation()
}

// Handle mouse down on gameboard (for selection)
const handleGameboardMouseDown = (event: MouseEvent) => {
  // Only start selection if clicking on empty space
  if (event.target === event.currentTarget) {
    isSelecting.value = true

    // Get the gameboard element to calculate relative position
    const gameboard = event.currentTarget as HTMLElement
    const rect = gameboard.getBoundingClientRect()
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top

    selectionStart.x = relativeX
    selectionStart.y = relativeY

    gameStore.updateSelectionBox(relativeX, relativeY, relativeX, relativeY, true)

    // Clear previous selection
    gameStore.clearSelection()
  }
}

// Handle mouse down on selected die (for group movement)
const handleSelectedDieMouseDown = (event: MouseEvent, die: Die) => {
  if (die.isSelected && gameStore.selectedDice.length > 1) {
    // Start group dragging
    isDraggingSelection.value = true
    selectionDragStart.x = event.clientX
    selectionDragStart.y = event.clientY

    // Calculate offset for the group
    const avgX =
      gameStore.selectedDice.reduce((sum, d) => sum + d.position.x, 0) /
      gameStore.selectedDice.length
    const avgY =
      gameStore.selectedDice.reduce((sum, d) => sum + d.position.y, 0) /
      gameStore.selectedDice.length

    dragOffset.x = event.clientX - avgX
    dragOffset.y = event.clientY - avgY

    event.preventDefault()
    event.stopPropagation()
  } else {
    // Handle individual die dragging
    handleMouseDown(event, die)
  }
}

// Handle mouse move
const handleMouseMove = (event: MouseEvent) => {
  if (gameStore.draggedDie && gameStore.draggedDie.isDragging) {
    // Handle individual die dragging
    const newX = event.clientX - dragOffset.x
    const newY = event.clientY - dragOffset.y

    // Keep die within gameboard bounds
    const maxX = 740 // 800 - 60 (die width)
    const maxY = 540 // 600 - 60 (die height)

    gameStore.updateDiePosition(
      gameStore.draggedDie.id,
      Math.max(0, Math.min(newX, maxX)),
      Math.max(0, Math.min(newY, maxY)),
    )
  } else if (isSelecting.value) {
    // Handle selection box - get relative position within gameboard
    const gameboard = document.querySelector('.gameboard') as HTMLElement
    if (gameboard) {
      const rect = gameboard.getBoundingClientRect()
      const currentX = event.clientX - rect.left
      const currentY = event.clientY - rect.top

      gameStore.updateSelectionBox(selectionStart.x, selectionStart.y, currentX, currentY, true)

      // Check which dice are in the selection box
      gameStore.dice.forEach((die) => {
        if (gameStore.isDieInSelectionBox(die)) {
          gameStore.selectDie(die.id)
        } else {
          gameStore.deselectDie(die.id)
        }
      })
    }
  } else if (isDraggingSelection.value && gameStore.selectedDice.length > 0) {
    // Handle moving selected dice as a group
    const newAvgX = event.clientX - dragOffset.x
    const newAvgY = event.clientY - dragOffset.y

    // Calculate current average position
    const currentAvgX =
      gameStore.selectedDice.reduce((sum, d) => sum + d.position.x, 0) /
      gameStore.selectedDice.length
    const currentAvgY =
      gameStore.selectedDice.reduce((sum, d) => sum + d.position.y, 0) /
      gameStore.selectedDice.length

    // Calculate the offset to move all dice
    const offsetX = newAvgX - currentAvgX
    const offsetY = newAvgY - currentAvgY

    gameStore.moveSelectedDice(offsetX, offsetY)
  }
}

// Handle mouse up
const handleMouseUp = () => {
  if (gameStore.draggedDie) {
    gameStore.setDragging(gameStore.draggedDie.id, false)
    gameStore.setDraggedDie(null)
  }

  if (isSelecting.value) {
    isSelecting.value = false
    gameStore.updateSelectionBox(0, 0, 0, 0, false)
  }

  if (isDraggingSelection.value) {
    isDraggingSelection.value = false
    // Snap selected dice to grid when done dragging
    gameStore.snapSelectedDiceToGrid()
  }
}

// Initialize the game
onMounted(async () => {
  gameStore.initializeDice()

  // Load words dictionary
  await gameStore.loadWords()

  // Add global mouse event listeners
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="game-container">
    <h1>Clueless</h1>

    <p class="description">
      Roll the dice and move them around to form words like a crossword puzzle!
    </p>

    <button @click="gameStore.rollDice" class="roll-button">Roll Dice</button>

    <div v-if="!gameStore.wordsLoaded" class="loading-indicator">Loading word dictionary...</div>

    <div class="gameboard" @mousedown="handleGameboardMouseDown">
      <!-- Grid lines -->
      <div class="grid-lines">
        <div
          v-for="col in gameStore.GRID_COLS"
          :key="`col-${col}`"
          class="grid-line-vertical"
          :style="{ left: (col - 1) * gameStore.GRID_SIZE + gameStore.GRID_OFFSET_X + 'px' }"
        ></div>
        <div
          v-for="row in gameStore.GRID_ROWS"
          :key="`row-${row}`"
          class="grid-line-horizontal"
          :style="{ top: (row - 1) * gameStore.GRID_SIZE + gameStore.GRID_OFFSET_Y + 'px' }"
        ></div>
      </div>

      <div
        v-for="die in gameStore.dice"
        :key="die.id"
        class="die"
        :class="{
          dragging: die.isDragging,
          selected: die.isSelected,
        }"
        :style="{
          left: die.position.x + 'px',
          top: die.position.y + 'px',
        }"
        @mousedown="handleSelectedDieMouseDown($event, die)"
      >
        {{ die.currentLetter }}
      </div>

      <!-- Selection box overlay -->
      <div
        v-if="gameStore.selectionBox.isActive"
        class="selection-box"
        :style="{
          left: Math.min(gameStore.selectionBox.startX, gameStore.selectionBox.endX) + 'px',
          top: Math.min(gameStore.selectionBox.startY, gameStore.selectionBox.endY) + 'px',
          width: Math.abs(gameStore.selectionBox.endX - gameStore.selectionBox.startX) + 'px',
          height: Math.abs(gameStore.selectionBox.endY - gameStore.selectionBox.startY) + 'px',
        }"
      ></div>
    </div>

    <!-- Found words display -->
    <div
      class="found-words"
      v-if="gameStore.foundWords.length > 0 || gameStore.puzzleState.isComplete"
    >
      <!-- Puzzle completion message -->
      <div v-if="gameStore.puzzleState.isComplete" class="puzzle-complete">
        <div class="completion-message">🎉 VALID PUZZLE! 🎉</div>
        <div class="all-words">Words: {{ gameStore.puzzleState.allWords.join(', ') }}</div>
        <button @click="handleCopyPuzzle" class="copy-button" :class="{ success: copySuccess }">
          {{ copySuccess ? '✅ Copied!' : '📋 Copy Puzzle' }}
        </button>
      </div>

      <!-- New word discoveries -->
      <div v-else>
        <div
          v-for="foundWord in gameStore.foundWords.filter((fw) => fw.isNew)"
          :key="`${foundWord.word}-${foundWord.timestamp}`"
          class="found-word"
          :class="{ flashing: Date.now() - foundWord.timestamp < 1000 }"
        >
          {{ foundWord.word }}
        </div>
      </div>
    </div>

    <div class="instructions">
      <h3>How to play:</h3>
      <ul>
        <li>Click "Roll Dice" to get new letters and reset positions</li>
        <li>Click and drag dice to move them around</li>
        <li>Dice snap to grid when you release them</li>
        <li>Click and drag on empty space to select multiple dice</li>
        <li>Move selected dice by dragging them</li>
        <li>Form real words horizontally or vertically (3+ letters)</li>
        <li>Valid words will flash below the board!</li>
        <li>Only dictionary words count - random letters won't flash</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'DM Sans', 'Arial', sans-serif;
}

h1 {
  text-align: center;
  color: #000000; /* Main/popo */
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 48px;
  line-height: 56px;
}

.description {
  text-align: center;
  color: #595d62; /* Main/trunks */
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 24px;
}

.roll-button {
  display: block;
  margin: 0 auto 30px;
  padding: 12px 16px; /* p-3 p-4 from Figma */
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  background-color: #4e46b4; /* Main/piccolo */
  color: #ffffff; /* Main/goten */
  border: none;
  border-radius: 8px; /* --radius-i-sm */
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', 'Arial', sans-serif;
  box-shadow: none;
}

.roll-button:hover {
  background-color: #3a3280; /* Darker shade of piccolo */
  box-shadow: 0px 0px 0px 4px rgba(78, 70, 180, 0.2); /* Focus ring */
}

.roll-button:focus {
  outline: none;
  box-shadow: 0px 0px 0px 4px rgba(78, 70, 180, 0.2); /* Focus ring */
}

.roll-button:disabled {
  opacity: 0.32;
  cursor: not-allowed;
}

.loading-indicator {
  text-align: center;
  padding: 10px;
  color: #595d62; /* Main/trunks */
  font-style: italic;
  margin-bottom: 20px;
  font-size: 12px;
  line-height: 16px;
}

.gameboard {
  position: relative;
  width: 800px;
  height: 600px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f5f5 0%, #e2e2e2 100%); /* Main/goku to Main/beerus */
  border-radius: 12px;
  border: 3px solid #000000; /* Main/popo */
  overflow: hidden;
  cursor: crosshair;
}

.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.grid-line-vertical {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background-color: #0000000a; /* Main/heles */
}

.grid-line-horizontal {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #0000000a; /* Main/heles */
}

.die {
  position: absolute;
  width: 60px;
  height: 60px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5); /* Main/gohan to Main/goku */
  border: 2px solid #000000; /* Main/popo */
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #000000; /* Main/popo */
  cursor: grab;
  user-select: none;
  box-shadow:
    0px 6px 6px -6px rgba(0, 0, 0, 0.16),
    0px 0px 1px 0px rgba(0, 0, 0, 0.4); /* shadow-sm */
  transition:
    transform 0.1s,
    box-shadow 0.1s;
  z-index: 10;
}

.die:hover {
  transform: scale(1.05);
  box-shadow:
    0px 12px 12px -6px rgba(0, 0, 0, 0.16),
    0px 0px 1px 0px rgba(0, 0, 0, 0.4); /* shadow-md */
}

.die.dragging {
  cursor: grabbing;
  z-index: 1000;
  transform: scale(1.1);
  box-shadow:
    0px 32px 32px -8px rgba(0, 0, 0, 0.08),
    0px 0px 32px -8px rgba(0, 0, 0, 0.12),
    0px 0px 1px 0px rgba(0, 0, 0, 0.2); /* shadow-xl */
}

.die.selected {
  border: 3px solid #40a69f; /* Main/hit */
  box-shadow: 0 0 0 2px #40a69f1f; /* Semi-transparent hit */
}

.die.selected:hover {
  border-color: #2d7a75; /* Darker shade of hit */
}

.selection-box {
  position: absolute;
  background-color: #4e46b41f; /* Main/jiren */
  border: 2px solid #4e46b4; /* Main/piccolo */
  border-radius: 4px;
  pointer-events: none;
  z-index: 5;
}

.found-words {
  margin: 20px auto;
  text-align: center;
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  align-items: center;
}

.puzzle-complete {
  background-color: #40a69f; /* Main/hit */
  color: #ffffff; /* Main/goten */
  padding: 15px 25px;
  border-radius: 20px;
  box-shadow:
    0px 32px 32px -8px rgba(0, 0, 0, 0.08),
    0px 0px 32px -8px rgba(0, 0, 0, 0.12),
    0px 0px 1px 0px rgba(0, 0, 0, 0.2); /* shadow-xl */
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.completion-message {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff; /* Main/goten */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.all-words {
  font-size: 18px;
  color: #ffffff; /* Main/goten */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.copy-button {
  background-color: #ffffff; /* Main/gohan */
  color: #000000; /* Main/bulma */
  padding: 12px 16px; /* p-3 p-4 from Figma */
  border: 1px solid #595d62; /* Main/trunks border */
  border-radius: 8px; /* --radius-i-sm */
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: none;
  font-family: 'DM Sans', 'Arial', sans-serif;
  position: relative;
}

.copy-button:hover {
  background-color: rgba(0, 0, 0, 0.04); /* Light background on hover */
  box-shadow: 0px 0px 0px 4px rgba(0, 0, 0, 0.2); /* Focus ring */
}

.copy-button:focus {
  outline: none;
  box-shadow: 0px 0px 0px 4px rgba(0, 0, 0, 0.2); /* Focus ring */
}

.copy-button.success {
  background-color: rgba(78, 70, 180, 0.12); /* Main/jiren background */
  color: #000000; /* Main/bulma */
  border-color: transparent;
}

.copy-button.success:hover {
  background-color: rgba(72, 64, 166, 0.2); /* Darker jiren */
  box-shadow: 0px 0px 0px 4px rgba(72, 64, 166, 0.2); /* Focus ring */
}

.copy-button.success:focus {
  outline: none;
  box-shadow: 0px 0px 0px 4px rgba(72, 64, 166, 0.2); /* Focus ring */
}

.found-word {
  padding: 8px 16px;
  background-color: #4e46b4; /* Main/piccolo */
  color: #ffffff; /* Main/goten */
  border-radius: 20px;
  font-weight: bold;
  font-size: 18px;
  text-transform: uppercase;
  animation: fadeOut 3s ease-in-out forwards;
}

.found-word.flashing {
  animation:
    flash 1s ease-in-out,
    fadeOut 3s ease-in-out forwards;
}

@keyframes flash {
  0%,
  50%,
  100% {
    background-color: #4e46b4; /* Main/piccolo */
    transform: scale(1);
  }
  25%,
  75% {
    background-color: #40a69f; /* Main/hit */
    transform: scale(1.1);
  }
}

@keyframes fadeOut {
  0% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.instructions {
  margin-top: 30px;
  text-align: center;
  color: #595d62; /* Main/trunks */
  font-size: 16px;
  line-height: 24px;
  padding: 20px;
  background-color: #f5f5f5; /* Main/goku to Main/beerus */
  border-radius: 12px;
  border: 1px solid #e2e2e2; /* Main/goku to Main/beerus */
  box-shadow:
    0px 6px 6px -6px rgba(0, 0, 0, 0.16),
    0px 0px 1px 0px rgba(0, 0, 0, 0.4); /* shadow-sm */
}

.instructions h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #000000; /* Main/popo */
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}

.instructions ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #595d62; /* Main/trunks */
}

.instructions li {
  margin-bottom: 8px;
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  line-height: 20px;
}

.instructions li::before {
  content: '•';
  color: #4e46b4; /* Main/piccolo */
  font-size: 16px;
  position: absolute;
  left: 0;
  top: 0;
}
</style>
