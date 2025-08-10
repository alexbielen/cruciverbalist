import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import CluelessGame from '../views/CluelessGame.vue'
import ObliquesGame from '../views/ObliquesGame.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/clueless',
      name: 'clueless',
      component: CluelessGame,
    },
    {
      path: '/obliques',
      name: 'obliques',
      component: ObliquesGame,
    },
  ],
})

export default router
