import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Cart from '../pages/Cart.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/cart', name: 'Cart', component: Cart },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router