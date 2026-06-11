import { createRouter, createWebHistory } from 'vue-router'
import GamePage from '@/pages/GamePage.vue'
import HistoryPage from '@/pages/HistoryPage.vue'
import CollectionPage from '@/pages/CollectionPage.vue'
import TypoBookPage from '@/pages/TypoBookPage.vue'

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
    props: (route) => ({ practiceChar: route.query.practiceChar as string || undefined }),
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryPage,
  },
  {
    path: '/collection',
    name: 'collection',
    component: CollectionPage,
  },
  {
    path: '/typo-book',
    name: 'typo-book',
    component: TypoBookPage,
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
