<template>
  <div class="obliques-container">
    <h1>Obliques</h1>

    <div class="coming-soon">
      <div class="icon">🧩</div>
      <h2>Coming Soon!</h2>
      <p>Obliques - the oblique metaphor guessing game is under development.</p>
      <p>Check back soon for this exciting new word puzzle experience!</p>

      <div class="features-preview">
        <h3>What to expect:</h3>
        <ul>
          <li>Creative metaphor guessing</li>
          <li>Expand your lateral thinking</li>
          <li>Word association challenges</li>
          <li>Multiple difficulty levels</li>
        </ul>
      </div>

      <router-link to="/" class="back-button"> ← Back to Games </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Obliques game logic will be implemented here
</script>

<style scoped>
.obliques-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'DM Sans', 'Arial', sans-serif;
}

h1 {
  text-align: center;
  color: #000000; /* Main/popo */
  margin-bottom: 40px;
  font-weight: 700;
  font-size: 48px;
  line-height: 56px;
}

.coming-soon {
  text-align: center;
  background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%); /* Main/gohan to Main/goku */
  border: 2px solid #000000; /* Main/popo */
  border-radius: 16px;
  padding: 60px 40px;
  box-shadow:
    0px 6px 6px -6px rgba(0, 0, 0, 0.16),
    0px 0px 1px 0px rgba(0, 0, 0, 0.4); /* shadow-sm */
}

.icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.coming-soon h2 {
  color: #000000; /* Main/popo */
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 32px;
  line-height: 40px;
}

.coming-soon p {
  color: #595d62; /* Main/trunks */
  margin-bottom: 12px;
  font-size: 18px;
  line-height: 26px;
}

.features-preview {
  margin: 40px 0;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.features-preview h3 {
  color: #000000; /* Main/popo */
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
}

.features-preview ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-preview li {
  color: #595d62; /* Main/trunks */
  margin-bottom: 8px;
  position: relative;
  padding-left: 20px;
  font-size: 16px;
  line-height: 24px;
}

.features-preview li::before {
  content: '✨';
  position: absolute;
  left: 0;
  top: 0;
}

.back-button {
  display: inline-block;
  margin-top: 30px;
  padding: 12px 24px;
  background-color: #4e46b4; /* Main/piccolo */
  color: #ffffff; /* Main/goten */
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  transition: all 0.2s ease;
}

.back-button:hover {
  background-color: #3a3280; /* Darker shade of piccolo */
  transform: translateY(-2px);
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
}

/* Responsive design */
@media (max-width: 768px) {
  .coming-soon {
    padding: 40px 20px;
  }

  .icon {
    font-size: 60px;
  }

  .coming-soon h2 {
    font-size: 24px;
    line-height: 32px;
  }

  .coming-soon p {
    font-size: 16px;
    line-height: 24px;
  }
}
</style>
