import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MainLayout from '@/layouts/MainLayout.vue'
import { routeSeo } from '@/config/site'
import { setSeo } from '@/composables/useSeo'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: routeSeo.Home
      },
      {
        path: '/articles',
        name: 'Articles',
        component: () => import('@/views/Articles.vue'),
        meta: routeSeo.Articles
      },
      {
        path: '/articles/:id',
        name: 'ArticleDetail',
        component: () => import('@/views/ArticleDetail.vue'),
        meta: { title: '文章详情', description: '阅读运维工程师的技术笔记文章详情。' }
      },
      {
        path: '/archive',
        name: 'Archive',
        component: () => import('@/views/Archive.vue'),
        meta: routeSeo.Archive
      },
      {
        path: '/notes/:tag?',
        name: 'Notes',
        component: () => import('@/views/Notes.vue'),
        meta: routeSeo.Notes
      },
      {
        path: '/guestbook',
        name: 'Guestbook',
        component: () => import('@/views/Guestbook.vue'),
        meta: routeSeo.Guestbook
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/About.vue'),
        meta: routeSeo.About
      },
      {
        path: '/stats',
        name: 'Stats',
        component: () => import('@/views/Stats.vue'),
        meta: routeSeo.Stats
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { ...routeSeo.Profile, requiresAuth: true }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: routeSeo.Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  setSeo({
    title: to.meta.title,
    description: to.meta.description,
    url: to.fullPath
  })

  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
