<template>
  <div class="sticky top-0 z-10 p-4 bg-white backdrop-blur shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold flex items-center gap-2">商品列表</h1>
      <van-button icon="shopping-cart" size="small" type="primary" @click="toCartPage" />
    </div>

    <van-tabs v-model:active="activeType" swipeable animated background="#fff" line-width="0" class="mb-1">
      <van-tab v-for="t in productTypes" :key="t" :name="t" :title="t" />
    </van-tabs>

    <div class="flex items-center gap-2">
      <input v-model="keyword" type="text" placeholder="搜尋商品..."
        class="flex-1 p-2 leading-none border rounded border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400" />
      <select v-model="sortType"
        class="p-2 pr-6 text-sm rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-500">
        <option value="default">預設</option>
        <option value="asc">價格 ↑</option>
        <option value="desc">價格 ↓</option>
      </select>
    </div>
  </div>

  <div class="p-4 bg-slate-50">
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6 max-w-[1280px] mx-auto">
      <ProductCard
        v-for="item in paginatedProducts"
        :key="item.id"
        :product="item"
        @add-to-cart="openPopup(item)"
      />
    </div>

    <div class="text-center bg-white">
      <van-pagination v-model="currentPage" :total-items="filteredProducts.length" :items-per-page="pageSize"
        mode="multi" />
    </div>
  </div>

  <!-- 底部 Popup -->
  <van-popup v-model:show="showPopup" position="bottom">
    <div class="p-4">
      <div class="flex gap-4">
        <img :src="popupProduct?.image" class="w-24 h-24 object-cover rounded" />
        <div class="flex flex-col justify-around">
          <div class="font-bold text-lg mb-1">{{ popupProduct?.name }}</div>
          <div class="text-gray-700 font-medium text-sm mt-1">
            單價：NT ${{ popupProduct?.price }}
          </div>
          <div class="text-gray-700 font-medium text-sm mt-1">
            總價：NT ${{ popupProduct ? popupProduct.price * popupQty : 0 }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4 mt-4">
        <span class="text-sm">數量</span>
        <van-button size="small" @click="popupQty--" :disabled="popupQty <= 1">-</van-button>
        <span>{{ popupQty }}</span>
        <van-button size="small" @click="popupQty++">+</van-button>
      </div>

      <div class="mt-6">
        <van-button block type="primary" @click="confirmAddToCart">
          加入購物車
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import ProductCard from "../components/ProductCard.vue";
import { useRouter } from "vue-router";
import { useCartStore } from "../stores/cart";

const base = import.meta.env.BASE_URL;

const router = useRouter();
const cart = useCartStore();

const productTypes = ["全部", "衣服", "褲子", "裙子", "洋裝", "鞋子", "飾品", "包包"];
const activeType = ref("全部");
const products = ref([]);
const keyword = ref("");
const sortType = ref("default");
const currentPage = ref(1);
const pageSize = 10;

const showPopup = ref(false);
const popupProduct = ref(null);
const popupQty = ref(1);

const openPopup = (product) => {
  popupProduct.value = product;
  popupQty.value = 1;
  showPopup.value = true;
};

const confirmAddToCart = () => {
  const product = { ...popupProduct.value, quantity: popupQty.value };
  cart.addToCart(product);
  showPopup.value = false;
};

onMounted(async () => {
  const res = await axios.get(`${base}/data/products.json`);
  products.value = res.data;
});

watch([keyword, sortType], () => {
  currentPage.value = 1;
});

const filteredProducts = computed(() => {
  let result = products.value;

  if (activeType.value !== "全部") {
    result = result.filter((p) => p.type === activeType.value);
  }

  if (keyword.value.trim()) {
    result = result.filter((p) =>
      p.name.includes(keyword.value.trim())
    );
  }

  if (sortType.value === "asc") {
    result = result.slice().sort((a, b) => a.price - b.price);
  } else if (sortType.value === "desc") {
    result = result.slice().sort((a, b) => b.price - a.price);
  }

  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredProducts.value.slice(start, start + pageSize);
});

const toCartPage = () => {
  router.push("/cart");
};
</script>

<style>
.van-popup--bottom.van-popup--round {
  border-radius: 0;
}
.van-tab--active {
  color: #1989fa !important;
}
.van-tabs__nav {
  padding: 0 !important;
}
</style>
