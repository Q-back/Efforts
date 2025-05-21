import type { RouteRecordRaw } from 'vue-router'

// Views
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/stats',
    name: 'statistics',
    component: () => import('../views/StatsView.vue'), // Lazy-loaded
  },
  {
    path: '/session',
    name: 'activeSession',
    component: () => import('../views/ActiveSessionView.vue'), // Lazy-loaded
  },
  {
    path: '/history',
    name: 'history',
    component: () => import('../views/HistoryView.vue'), // Lazy-loaded
  },
]

export default routes
