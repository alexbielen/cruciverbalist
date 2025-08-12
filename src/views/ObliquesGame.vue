<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface Puzzle {
  id: number
  clues: string[]
  answers: string[]
}

// Sample puzzle data - in a real app this would come from an API
const currentPuzzle: Puzzle = {
  id: 1,
  clues: ['Flinch', 'coming out of', 'strikeout'],
  answers: ['start', 'from', 'scratch'],
}

const userAnswers = ref<string[][]>([
  ['', '', '', '', ''],
  ['', '', '', ''],
  ['', '', '', '', '', '', ''],
])
const isCorrect = ref(false)
const showAnimation = ref(false)
const isScratched = ref(false)
const isIncorrect = ref(false)
const hintsUsed = ref(0)
const hintsRevealed = ref<boolean[]>([false, false, false])
const showHowToPlay = ref(false)

const canSubmit = computed(() => {
  return userAnswers.value.every((word) => word.every((letter) => letter.trim() !== ''))
})

const hintsRemaining = computed(() => {
  return 3 - hintsUsed.value
})

const checkAnswer = () => {
  const isAllCorrect = userAnswers.value.every((word, index) => {
    const userWord = word.join('').toLowerCase().trim()
    return userWord === currentPuzzle.answers[index].toLowerCase()
  })

  if (isAllCorrect) {
    isCorrect.value = true
    showAnimation.value = true

    // Trigger scratch animation after answer animation completes
    setTimeout(() => {
      isScratched.value = true
    }, 2000)
  } else {
    // Incorrect answer - trigger shake and dissolve
    isIncorrect.value = true
    setTimeout(() => {
      isIncorrect.value = false
    }, 600)
  }
}

const useHint = () => {
  if (hintsUsed.value < 3 && !isCorrect.value) {
    hintsUsed.value++
    hintsRevealed.value[hintsUsed.value - 1] = true
  }
}

const handleLetterInput = (event: Event, wordIndex: number, letterIndex: number) => {
  const target = event.target as HTMLInputElement
  const value = target.value.toUpperCase()

  // Update the letter
  userAnswers.value[wordIndex][letterIndex] = value

  // Auto-advance to next input if a letter was entered
  if (value && letterIndex < currentPuzzle.answers[wordIndex].length - 1) {
    const nextInput = target.parentElement?.children[letterIndex + 1] as HTMLInputElement
    if (nextInput) nextInput.focus()
  }
}

const handleKeydown = (event: KeyboardEvent, wordIndex: number, letterIndex: number) => {
  const target = event.target as HTMLInputElement

  // Handle backspace
  if (event.key === 'Backspace') {
    if (target.value === '') {
      // If current input is empty, go to previous input
      if (letterIndex > 0) {
        const prevInput = target.parentElement?.children[letterIndex - 1] as HTMLInputElement
        if (prevInput) {
          prevInput.focus()
          prevInput.value = ''
          userAnswers.value[wordIndex][letterIndex - 1] = ''
        }
      }
    } else {
      // Clear current input
      target.value = ''
      userAnswers.value[wordIndex][letterIndex] = ''
    }
  }
}

const resetGame = () => {
  userAnswers.value = [
    ['', '', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '', '', '', ''],
  ]
  isCorrect.value = false
  showAnimation.value = false
  isScratched.value = false
  isIncorrect.value = false
  hintsUsed.value = 0
  hintsRevealed.value = [false, false, false]
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  // Initialize user answers arrays with empty strings for each letter
  userAnswers.value = currentPuzzle.answers.map((answer) => new Array(answer.length).fill(''))
})
</script>

<template>
  <div class="obliques-game">
    <!-- Navigation -->
    <div class="navigation">
      <button @click="goBack" class="back-button">← Back to Games</button>
    </div>

    <!-- Game Title -->
    <header class="game-header">
      <div class="title-row">
        <h1 class="game-title">Obliques #{{ currentPuzzle.id }}</h1>
        <button @click="showHowToPlay = true" class="how-to-play-btn">?</button>
      </div>
      <p class="game-author">by Alex Bielen</p>
    </header>

    <!-- Puzzle Interface -->
    <main class="puzzle-container">
      <!-- Puzzle Columns -->
      <div class="puzzle-columns">
        <div
          v-for="(clue, index) in currentPuzzle.clues"
          :key="`puzzle-column-${index}`"
          class="puzzle-column"
        >
          <!-- Clue -->
          <div class="clue-container">
            <span class="clue" :class="{ 'fade-out': showAnimation }">
              {{ clue }}
            </span>
          </div>

          <!-- Arrow -->
          <div class="arrow-container">
            <span class="arrow" :class="{ 'fade-out': showAnimation }"> ↓ </span>
          </div>

          <!-- Answer -->
          <div class="answer-container">
            <!-- Input fields (shown when not correct) -->
            <div v-if="!isCorrect" class="input-container">
              <div class="input-wrapper">
                <div class="letter-inputs" :class="{ dissolve: isIncorrect }">
                  <input
                    v-for="i in currentPuzzle.answers[index].length"
                    :key="i"
                    v-model="userAnswers[index][i - 1]"
                    type="text"
                    class="letter-input"
                    maxlength="1"
                    @input="handleLetterInput($event, index, i - 1)"
                    @keydown="handleKeydown($event, index, i - 1)"
                    :placeholder="
                      hintsRevealed[index] && i === 1
                        ? currentPuzzle.answers[index][0].toUpperCase()
                        : ''
                    "
                  />
                </div>
              </div>
            </div>

            <!-- Correct answer display (shown when correct) -->
            <div
              v-else
              class="correct-answer"
              :class="{
                'animate-in': showAnimation,
                scratched: isScratched && currentPuzzle.answers[index] === 'scratch',
              }"
            >
              <span
                v-for="(letter, letterIndex) in currentPuzzle.answers[index]"
                :key="`letter-${letterIndex}`"
                class="letter"
                :style="{ animationDelay: `${letterIndex * 0.1}s` }"
              >
                {{ letter }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Hint and Submit Row -->
      <div class="controls-row">
        <div class="hint-section">
          <button
            @click="useHint"
            :disabled="hintsUsed >= 3 || isCorrect"
            class="hint-button"
            :class="{ disabled: hintsUsed >= 3 || isCorrect }"
          >
            Hint ({{ hintsRemaining }})
          </button>
        </div>

        <div class="submit-container">
          <button
            @click="checkAnswer"
            :disabled="!canSubmit"
            class="submit-button"
            :class="{ enabled: canSubmit, shake: isIncorrect }"
          >
            Guess
          </button>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="isCorrect" class="success-message">
        <p>Correct! 🎉</p>
        <button @click="resetGame" class="reset-button">Play Again</button>
      </div>
    </main>

    <!-- How to Play Modal -->
    <div v-if="showHowToPlay" class="modal-overlay" @click="showHowToPlay = false">
      <div class="modal-content" @click.stop>
        <h2>How to Play</h2>
        <p>
          Obliques is a word game that uses oblique synonyms to obscure a common english expression.
          Each clue has an arrow pointing to a blank word that the player guesses. There are hints
          which will reveal the first letter of each word.
        </p>
        <button @click="showHowToPlay = false" class="modal-close">Got it!</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.obliques-game {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Georgia', 'Times New Roman', serif;
  text-align: center;
  min-height: 100vh;
  background-color: #ffffff;
}

.navigation {
  margin-bottom: 2rem;
  text-align: left;
}

.back-button {
  padding: 0.5rem 1rem;
  background-color: #4e46b4;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: 'DM Sans', 'Arial', sans-serif;
}

.back-button:hover {
  background-color: #3a3280;
  transform: translateY(-2px);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

.game-header {
  margin-bottom: 3rem;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.game-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.how-to-play-btn {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  border: 2px solid #666666;
  background: transparent;
  color: #666666;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.how-to-play-btn:hover {
  background-color: #666666;
  color: white;
}

.game-author {
  font-style: italic;
  font-size: 1rem;
  color: #666666;
  margin: 1rem 0 0 0;
  font-weight: 400;
}

.puzzle-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.puzzle-columns {
  display: flex;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
}

.puzzle-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 120px;
}

.clue-container {
  text-align: left;
}

.arrow-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 2rem;
  padding-left: 0.2rem;
}

.clue {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.3rem;
  font-weight: 500;
  color: #1a1a1a;
  transition: opacity 0.5s ease;
  line-height: 1.4;
}

.arrow {
  font-size: 1.8rem;
  color: #666666;
  transition: opacity 0.5s ease;
  font-weight: 400;
  line-height: 1;
  margin: 0.5rem 0;
}

.fade-out {
  opacity: 0;
}

.answer-container {
  min-width: 80px;
  display: flex;
  justify-content: flex-start;
}

.input-container {
  display: flex;
  justify-content: center;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.letter-inputs {
  display: flex;
  gap: 0.1rem;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: opacity 0.3s ease;
}

.letter-inputs.dissolve {
  opacity: 0.3;
}

.letter-input {
  width: 1.2rem;
  height: 1.8rem;
  text-align: center;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-bottom: 2px solid #666666;
  background: transparent;
  outline: none;
  color: #1a1a1a;
  transition: border-color 0.3s ease;
  margin: 0 0.05rem;
}

.letter-input:focus {
  border-bottom-color: #333333;
}

.letter-input::placeholder {
  color: #95a5a6;
  font-weight: bold;
}

.correct-answer {
  display: flex;
  justify-content: center;
  gap: 0.1rem;
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.letter {
  opacity: 0;
  transform: translateY(20px);
  animation: letterAppear 0.5s ease forwards;
}

@keyframes letterAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in .letter {
  animation: letterAppear 0.5s ease forwards;
}

.scratched {
  position: relative;
}

.scratched::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 3px;
  background: #e74c3c;
  transform: translateY(-50%);
  animation: scratchLine 0.8s ease 0.5s forwards;
}

@keyframes scratchLine {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.controls-row {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.hint-section {
  display: flex;
  align-items: center;
}

.hint-button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  background-color: #f0f0f0;
  color: #666666;
  border: 2px solid #d0d0d0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.hint-button:hover:not(.disabled) {
  background-color: #e0e0e0;
  border-color: #c0c0c0;
}

.hint-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.submit-container {
  margin-top: 0;
}

.submit-button {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  background-color: #f5f5f5;
  color: #666666;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: not-allowed;
  transition: all 0.3s ease;
  font-family: 'Georgia', 'Times New Roman', serif;
}

.submit-button.enabled {
  background-color: #549464;
  color: white;
  border-color: #0e3c2c;
  cursor: pointer;
}

.submit-button.enabled:hover {
  background-color: #549464;
  border-color: #0e3c2c;
  transform: translateY(-1px);
}

.submit-button.shake {
  animation: shake 0.6s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

.success-message {
  margin-top: 2rem;
  padding: 1rem;
  background-color: #2e8b57;
  border-radius: 8px;
  border: 2px solid #1b365d;
}

.success-message p {
  font-size: 1.5rem;
  color: #f4f4aa;
  margin: 0 0 1rem 0;
  font-weight: bold;
}

.reset-button {
  padding: 0.5rem 1rem;
  background-color: #1b365d;
  color: #f4f4aa;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.reset-button:hover {
  background-color: #2e8b57;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  margin: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h2 {
  margin: 0 0 1rem 0;
  color: #1a1a1a;
  font-size: 1.5rem;
}

.modal-content p {
  margin: 0 0 1.5rem 0;
  color: #666666;
  line-height: 1.6;
}

.modal-close {
  padding: 0.75rem 1.5rem;
  background-color: #549464;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background-color: #0e3c2c;
}

@media (max-width: 768px) {
  .obliques-game {
    padding: 1rem;
    max-width: 100%;
  }

  .navigation {
    margin-bottom: 1.5rem;
  }

  .back-button {
    padding: 0.75rem 1.5rem;
    font-size: 14px;
  }

  .game-header {
    margin-bottom: 2rem;
  }

  .game-title {
    font-size: 2rem;
    line-height: 1.1;
  }

  .how-to-play-btn {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 1rem;
  }

  .game-author {
    font-size: 0.9rem;
    margin: 0.75rem 0 0 0;
  }

  .puzzle-columns {
    gap: 1.5rem;
    flex-direction: column;
    align-items: center;
  }

  .puzzle-column {
    min-width: auto;
    width: 100%;
    max-width: 280px;
    align-items: center;
  }

  .clue-container {
    text-align: center;
    width: 100%;
  }

  .clue {
    font-size: 1.2rem;
    line-height: 1.3;
    text-align: center;
  }

  .arrow-container {
    justify-content: center;
    padding-left: 0;
  }

  .arrow {
    font-size: 1.5rem;
    margin: 0.25rem 0;
  }

  .answer-container {
    justify-content: center;
    min-width: auto;
    width: 100%;
  }

  .letter-inputs {
    gap: 0.15rem;
  }

  .letter-input {
    width: 1.4rem;
    height: 2rem;
    font-size: 1.1rem;
    margin: 0 0.1rem;
    /* Touch-friendly improvements */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .correct-answer {
    font-size: 1.1rem;
  }

  .controls-row {
    flex-direction: column;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .hint-button,
  .submit-button {
    width: 100%;
    max-width: 200px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  .success-message {
    margin-top: 1.5rem;
    padding: 0.75rem;
  }

  .success-message p {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }

  .reset-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }

  /* Modal improvements for mobile */
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
    max-width: 90%;
  }

  .modal-content h2 {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }

  .modal-content p {
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
  }

  .modal-close {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .obliques-game {
    padding: 0.75rem;
  }

  .game-title {
    font-size: 1.8rem;
  }

  .clue {
    font-size: 1.1rem;
  }

  .arrow {
    font-size: 1.3rem;
  }

  .letter-input {
    width: 1.3rem;
    height: 1.8rem;
    font-size: 1rem;
  }

  .correct-answer {
    font-size: 1rem;
  }

  .hint-button,
  .submit-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }

  .success-message p {
    font-size: 1.2rem;
  }

  .reset-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
  }
}

/* Landscape orientation adjustments */
@media (max-width: 768px) and (orientation: landscape) {
  .obliques-game {
    padding: 0.5rem;
  }

  .game-header {
    margin-bottom: 1rem;
  }

  .game-title {
    font-size: 1.6rem;
  }

  .puzzle-columns {
    flex-direction: row;
    gap: 1rem;
  }

  .puzzle-column {
    max-width: 200px;
  }

  .clue {
    font-size: 1rem;
  }

  .arrow {
    font-size: 1.2rem;
  }

  .letter-input {
    width: 1.2rem;
    height: 1.6rem;
    font-size: 0.9rem;
  }

  .controls-row {
    flex-direction: row;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .hint-button,
  .submit-button {
    max-width: 150px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}

/* Touch-friendly improvements for all mobile devices */
@media (hover: none) and (pointer: coarse) {
  .letter-input {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    font-size: 16px; /* Prevents zoom on iOS */
  }

  .hint-button,
  .submit-button,
  .back-button,
  .reset-button,
  .modal-close,
  .how-to-play-btn {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    min-height: 44px; /* iOS recommended touch target size */
  }

  .how-to-play-btn {
    min-width: 44px;
  }
}
</style>
