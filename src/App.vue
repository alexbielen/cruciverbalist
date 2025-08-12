<script setup lang="ts">
// App-level logic can be added here if needed
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: 'DM Sans', 'Arial', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #000000;
  background-color: #ffffff;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

/* Mobile-friendly global styles */
@media (max-width: 768px) {
  /* Prevent text selection on interactive elements */
  button,
  input,
  textarea {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  /* Improve touch targets */
  button,
  input,
  textarea,
  select {
    min-height: 44px;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  /* Prevent zoom on input focus for iOS */
  input,
  textarea,
  select {
    font-size: 16px;
  }

  /* Smooth scrolling for mobile */
  html {
    scroll-behavior: smooth;
  }

  /* Prevent horizontal scrolling */
  body {
    overflow-x: hidden;
  }
}

/* Landscape orientation adjustments */
@media (max-width: 768px) and (orientation: landscape) {
  /* Reduce padding in landscape mode */
  #app {
    padding: 0;
  }
}
</style>
