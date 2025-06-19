<template>
  <div class="flex flex-col h-screen">
    <!-- 頂部標題固定 -->
    <div class="shrink-0 p-2 bg-white shadow-sm z-10">
      <div class="relative h-10 flex items-center justify-center text-xl font-bold">
        <div class="absolute left-0 pl-2 cursor-pointer" @click="router.push('/')">
          <van-icon name="arrow-left" />
        </div>
        購物車
      </div>
    </div>

    <!-- 中間可滾動商品區域 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="cart.items.length === 0" class="text-gray-500 text-center">
        購物車是空的
      </div>

      <div v-else class="space-y-4">
        <div v-for="item in cart.items" :key="item.id" class="flex items-center gap-4 border-b pb-3">
          <img :src="item.image" class="w-16 h-16 object-cover rounded" />
          <div class="flex-1">
            <div class="font-bold">{{ item.name }}</div>
            <div class="text-sm text-gray-500">單價：NT$ {{ item.price }}</div>
            <div class="text-sm text-gray-500">小計：NT$ {{ item.price * item.quantity }}</div>
            <div class="flex items-center gap-2 mt-1">
              <van-button size="mini" class="w-6" @click="handleChangeQuantity(item, 'minus')">-</van-button>
              <span>{{ item.quantity }}</span>
              <van-button size="mini" class="w-6" @click="handleChangeQuantity(item, 'plus')">+</van-button>
            </div>
          </div>
          <van-button size="small" type="danger" @click="cart.removeFromCart(item.id)">
            移除
          </van-button>
        </div>
      </div>
    </div>

    <!-- 底部結帳區固定 -->
    <div class="shrink-0 p-3 bg-white shadow-inner z-10">
      <div class="text-right font-bold text-lg">
        總計：NT$ {{ cart.totalPrice }}
      </div>
      <div class="text-right mt-4 flex justify-end gap-2">
        <van-button type="danger" plain size="small" @click="handleClear">
          清空購物車
        </van-button>
        <van-button type="primary" size="small" @click="handleCheckout">
          結 帳
        </van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()
const cart = useCartStore()

const handleChangeQuantity = (item, type) => {
  const newQty = type === 'plus' ? item.quantity + 1 : item.quantity - 1
  if (newQty > 0) {
    cart.updateQuantity(item.id, newQty)
  }
}

const handleClear = () => {
  showConfirmDialog({
    title: '清空購物車',
    message: '確定要清空所有商品嗎？'
  }).then(() => {
    cart.clearCart()
  })
}

const handleCheckout = () => {
  showConfirmDialog({
    title: '確認結帳',
    message: `總金額：NT$ ${cart.totalPrice}，確定要結帳嗎？`
  }).then(() => {
    cart.clearCart()
    showToast({
      message: '結帳成功',
      duration: 1500,
      onClose: () => {
        router.push('/')
      }
    })
  })
}
</script>