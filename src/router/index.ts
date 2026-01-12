import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'AI写作助手' }
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('../views/Editor.vue'),
    meta: { title: '编辑器' }
  },
  {
    path: '/books',
    name: 'BookManager',
    component: () => import('../views/BookManager.vue'),
    meta: { title: '书籍管理' }
  },
  {
    path: '/analysis',
    name: 'BookAnalysis',
    component: () => import('../views/BookAnalysis.vue'),
    meta: { title: 'AI拆书' }
  },
  {
    path: '/prompts',
    name: 'PromptManager',
    component: () => import('../views/PromptManager.vue'),
    meta: { title: '提示词管理' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = title
  }
  next()
})

export default router
