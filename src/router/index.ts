import { createRouter, createWebHistory } from 'vue-router'
import ChinaMarket from '@/views/ChinaMarket.vue'
import USMarket from '@/views/USMarket.vue'
import HKMarket from '@/views/HKMarket.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/cn'
    },
    {
      path: '/cn',
      name: 'ChinaMarket',
      component: ChinaMarket
    },
    {
      path: '/us',
      name: 'USMarket',
      component: USMarket
    },
    {
      path: '/hk',
      name: 'HKMarket',
      component: HKMarket
    }
  ]
})

export default router