import { createRouter, createWebHashHistory } from 'vue-router'
import { getCurrentAccount } from '../services/wallet.service'
import homeView from '../views/home-view.vue'
import boardView from '../views/board-view.vue'
import aboutView from '../views/about-view.vue'
import playerView from '../views/player-view.vue'
import connectionView from '../views/connection-view.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'active',
  routes: [
    {
      path: '/',
      name: 'home',
      component: homeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/connect',
      name: 'connect',
      component: connectionView,
    },
    {
      path: '/board/:boardId',
      name: 'board',
      component: boardView,
      meta: { requiresAuth: true },
      children: [
        {
          path: ':playerId',
          component: playerView,
        },
      ],
    },
    {
      path: '/about',
      name: 'about',
      component: aboutView,
    },
  ],
})

// Navigation guard to check wallet connection
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const account = await getCurrentAccount()
      if (!account) {
        next('/connect')
        return
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
      next('/connect')
      return
    }
  }
  next()
})

export default router
