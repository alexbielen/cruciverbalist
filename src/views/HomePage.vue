<template>
  <div class="homepage">
    <div class="hero">
      <h1>Cruciverbalist</h1>
      <p class="tagline">Word puzzles for the curious mind</p>
    </div>

    <div class="games-grid">
      <div class="game-card" @click="navigateToGame('clueless')">
        <div class="game-icon">🎲</div>
        <h2>Clueless</h2>
        <p>Roll the dice and move them around to form words like a crossword puzzle!</p>
        <div class="game-features">
          <span class="feature">Dice Rolling</span>
          <span class="feature">Word Formation</span>
          <span class="feature">Crossword Style</span>
        </div>
      </div>

      <div class="game-card" @click="navigateToGame('obliques')">
        <div class="game-icon">🧩</div>
        <h2>Obliques</h2>
        <p>Guess the oblique metaphors and expand your creative thinking!</p>
        <div class="game-features">
          <span class="feature">Metaphor Guessing</span>
          <span class="feature">Creative Thinking</span>
          <span class="feature">Word Association</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>More games coming soon...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateToGame = (gameName: string) => {
  router.push({ name: gameName })
}
</script>

<style scoped>
.homepage {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'DM Sans', 'Arial', sans-serif;
}

.hero {
  text-align: center;
  margin-bottom: 60px;
}

.hero h1 {
  color: #000000; /* Main/popo */
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 64px;
  line-height: 72px;
}

.tagline {
  color: #595d62; /* Main/trunks */
  font-size: 20px;
  line-height: 28px;
  margin: 0;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 40px;
  margin-bottom: 60px;
}

.game-card {
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%); /* Main/gohan to Main/goku */
  border: 2px solid #000000; /* Main/popo */
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow:
    0px 6px 6px -6px rgba(0, 0, 0, 0.16),
    0px 0px 1px 0px rgba(0, 0, 0, 0.4); /* shadow-sm */
}

.game-card:hover {
  transform: translateY(-8px);
  box-shadow:
    0px 32px 32px -8px rgba(0, 0, 0, 0.08),
    0px 0px 32px -8px rgba(0, 0, 0, 0.12),
    0px 0px 1px 0px rgba(0, 0, 0, 0.2); /* shadow-xl */
  border-color: #4e46b4; /* Main/piccolo */
}

.game-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.game-card h2 {
  color: #000000; /* Main/popo */
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 32px;
  line-height: 40px;
}

.game-card p {
  color: #595d62; /* Main/trunks */
  margin-bottom: 24px;
  font-size: 16px;
  line-height: 24px;
}

.game-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.feature {
  background-color: #4e46b4; /* Main/piccolo */
  color: #ffffff; /* Main/goten */
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.footer {
  text-align: center;
  color: #595d62; /* Main/trunks */
  font-size: 14px;
  line-height: 20px;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .hero h1 {
    font-size: 48px;
    line-height: 56px;
  }

  .tagline {
    font-size: 18px;
    line-height: 26px;
  }

  .games-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .game-card {
    padding: 24px;
  }

  .game-icon {
    font-size: 48px;
  }

  .game-card h2 {
    font-size: 24px;
    line-height: 32px;
  }
}
</style>
