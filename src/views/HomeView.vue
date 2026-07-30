<script setup lang="ts">
import { type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { FerrisWheel, LineChart as LineIcon, RefreshCw, ShoppingCart, Ticket } from 'lucide-vue-next'
import ProjectCard from '@/components/ProjectCard.vue'

const { t } = useI18n()

// import { useDailyStorage } from '@/composables/useDailyStorage'
// import { usePopupStore } from '@/stores/popup'

// const popupStore = usePopupStore()
// const { isMarkedToday } = useDailyStorage()

interface Project {
  titleKey: string
  descriptionKey: string
  name: string
  icon: Component
  color: string
}

const projects: Project[] = [
  {
    titleKey: 'products.title',
    descriptionKey: 'products.desc',
    name: 'products',
    icon: ShoppingCart,
    color: 'from-blue-600/20 to-blue-400/20',
  },
  {
    titleKey: 'currency.title',
    descriptionKey: 'currency.desc',
    name: 'currency',
    icon: RefreshCw,
    color: 'from-emerald-600/20 to-emerald-400/20',
  },
  {
    titleKey: 'crypto.title',
    descriptionKey: 'crypto.desc',
    name: 'chart',
    icon: LineIcon,
    color: 'from-purple-600/20 to-purple-400/20',
  },
  {
    titleKey: 'wheel.title',
    descriptionKey: 'wheel.desc',
    name: 'wheel',
    icon: FerrisWheel,
    color: 'from-red-600/20 to-red-400/20',
  },
  {
    titleKey: 'scratch.title',
    descriptionKey: 'scratch.desc',
    name: 'scratch',
    icon: Ticket,
    color: 'from-yellow-600/20 to-amber-400/20',
  },
  // {
  //   titleKey: 'templateDemo.title',
  //   descriptionKey: 'templateDemo.desc',
  //   name: 'templateDemo',
  //   icon: Layers3,
  //   color: 'from-cyan-600/20 to-cyan-400/20',
  // },
  // {
  //   titleKey: 'pcPlatform.title',
  //   descriptionKey: 'pcPlatform.desc',
  //   name: 'pcPlatform',
  //   icon: Monitor,
  //   color: 'from-orange-600/20 to-amber-400/20',
  // },
]

// onMounted(() => {
//   const STORAGE_KEY = 'hide_announcement_today'
//   if (!isMarkedToday(STORAGE_KEY)) {
//     popupStore.openPopup('announcement')
//   }
// })
</script>

<template>
  <div class="mainContent">
    <p class="px-4 text-center text-lg font-bold leading-relaxed text-white/90">
      {{ t('home.subtitle_1') }}
      <br />
      <span class="text-indigo-300">{{ t('home.subtitle_2') }}</span>
    </p>

    <div class="mx-auto my-6 mt-2 rounded-xl border border-white/5 bg-black/20 p-4">
      <p class="text-center font-mono text-sm leading-relaxed text-indigo-200/70">
        Vite • Vue 3 • TypeScript • Pinia • i18n • Tailwind • Vant • Canvas • ECharts • gsap
      </p>
    </div>
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
      <ProjectCard
        v-for="(project, index) in projects"
        :key="project.name"
        :project="project"
        :index="index"
      />
    </div>
  </div>
</template>
