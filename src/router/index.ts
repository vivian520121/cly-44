import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '@/pages/GamePage.vue'
import HistoryPage from '@/pages/HistoryPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: GamePage,
  },
  {
    path: '/game',
    name: 'game',
    component: GamePage,
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryPage,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
