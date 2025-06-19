<template>
    <div class="border rounded p-3 bg-white">
        <img :src="product.image" class="w-full object-cover mb-2 rounded cursor-pointer" @click="handlePreview" />
        <div class="font-bold mb-1 text-base truncate">{{ product.name }}</div>
        <div class="text-red-500 font-semibold mb-2">NT$ {{ product.price }}</div>
        <van-button type="primary" block size="small" @click="handleAdd">
            加入購物車
        </van-button>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { showImagePreview } from 'vant'

const props = defineProps({
    product: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['add-to-cart'])

const handleAdd = () => {
    emit('add-to-cart', props.product)
}

const handlePreview = () => {
  showImagePreview({
    images: [props.product.image],
    showIndex: false,
    closeable: true,
    closeIcon: 'close',
    loop: false,
  })
}
</script>

<style>
@media (min-width: 768px) {
  .van-image-preview__image {
    width: 50% !important;
    margin: 0 auto !important;
  }
}
</style>
