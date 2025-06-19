import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: []  // 每項格式：{ id, name, price, image, quantity }
  }),
  actions: {
    addToCart(product) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
    },
    removeFromCart(productId) {
      this.items = this.items.filter(item => item.id !== productId)
    },
    updateQuantity(productId, quantity) {
      const item = this.items.find(item => item.id === productId)
      if (item && quantity > 0) {
        item.quantity = quantity
      }
    },
    clearCart() {
      this.items = []
    }
  },
  getters: {
    totalCount: state => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: state => state.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }
})