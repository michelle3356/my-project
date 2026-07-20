<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock, RefreshCw } from 'lucide-vue-next'
import { showDialog } from 'vant'
import { usePopupStore } from '@/stores/popup'
import { useScratchStore } from '@/stores/scratch'
import { useUserStore } from '@/stores/user'

const { t, locale } = useI18n()
const userStore = useUserStore()
const popupStore = usePopupStore()
const scratchStore = useScratchStore()

const CARD_W = 240
const CARD_H = 160
const SCRATCH_RADIUS = 22
const REVEAL_THRESHOLD = 0.55

interface Card {
  prize: string
  isWin: boolean
  color: string
  revealed: boolean
  isScratching: boolean
}

const PRIZE_POOL = computed(() => [
  { name: '$100', isWin: true, color: 'from-yellow-500 to-amber-400', weight: 3 },
  { name: '$50', isWin: true, color: 'from-purple-500 to-indigo-500', weight: 7 },
  { name: '$20', isWin: true, color: 'from-blue-500 to-cyan-400', weight: 15 },
  { name: '$10', isWin: true, color: 'from-emerald-500 to-teal-400', weight: 25 },
  { name: t('scratch.miss'), isWin: false, color: 'from-slate-600 to-slate-500', weight: 50 },
])

const cards = ref<Card[]>([])
const canvasRefs = ref<(HTMLCanvasElement | null)[]>([])
const gameOver = ref(false)
const gameReady = ref(false)

const getRandomPrize = () => {
  const pool = PRIZE_POOL.value
  const total = pool.reduce((sum, p) => sum + p.weight, 0)
  let rand = Math.random() * total
  for (const p of pool) {
    rand -= p.weight
    if (rand <= 0) return p
  }
  return pool[pool.length - 1]!
}

const drawScratchLayer = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, CARD_W, CARD_H)

  const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H)
  grad.addColorStop(0, '#9ca3af')
  grad.addColorStop(0.45, '#d1d5db')
  grad.addColorStop(0.55, '#e5e7eb')
  grad.addColorStop(1, '#9ca3af')
  ctx.fillStyle = grad
  ctx.roundRect(0, 0, CARD_W, CARD_H, 12)
  ctx.fill()

  // coin-like circles pattern
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  for (let r = 0; r < CARD_H; r += 20) {
    for (let c = 0; c < CARD_W; c += 20) {
      ctx.beginPath()
      ctx.arc(c + 10, r + 10, 8, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.fillStyle = 'rgba(60,60,60,0.55)'
  ctx.font = 'bold 13px "Noto Sans TC", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(t('scratch.scratchHint'), CARD_W / 2, CARD_H / 2)
}

const initGame = () => {
  gameReady.value = false
  gameOver.value = false
  canvasRefs.value = [null, null, null]
  cards.value = Array.from({ length: 3 }, () => {
    const p = getRandomPrize()
    return { prize: p.name, isWin: p.isWin, color: p.color, revealed: false, isScratching: false }
  })
  nextTick(() => {
    canvasRefs.value.forEach((canvas) => {
      if (canvas) drawScratchLayer(canvas)
    })
    gameReady.value = true
  })
}

watch(locale, () => {
  // 如果遊戲還沒結束且正在顯示刮刮層，則重新繪製
  canvasRefs.value.forEach((canvas, index) => {
    const card = cards.value[index]
    // 只有還沒被刮開的卡片需要重繪刮刮層文字
    if (canvas && card && !card.revealed) {
      drawScratchLayer(canvas)
    }
  })
})

onMounted(() => initGame())

const setCanvasRef = (el: HTMLCanvasElement | null, index: number) => {
  if (!el) return
  const isNew = canvasRefs.value[index] !== el
  canvasRefs.value[index] = el
  if (isNew) drawScratchLayer(el)
}

const getEventPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  if ('touches' in e) {
    const t = e.touches[0] ?? e.changedTouches[0]!
    return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
  }
  return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
}

const getScratchedPercent = (canvas: HTMLCanvasElement): number => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  let transparent = 0
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 128) transparent++
  }
  return transparent / (canvas.width * canvas.height)
}

const doScratch = (canvas: HTMLCanvasElement, x: number, y: number) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 3)
  ctx.fill()
}

const revealCard = (index: number) => {
  const card = cards.value[index]
  if (!card || card.revealed) return
  card.revealed = true
  const canvas = canvasRefs.value[index]
  if (canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    ctx.clearRect(0, 0, CARD_W, CARD_H)
  }
  if (cards.value.every((c) => c.revealed)) onAllRevealed()
}

const onAllRevealed = () => {
  gameOver.value = true
  const prizes = cards.value.map((c) => c.prize)
  const winPrizes = cards.value.filter((c) => c.isWin).map((c) => c.prize)
  scratchStore.addRecord(prizes, winPrizes.length)

  const message = winPrizes.length > 0 ? `${t('scratch.congrats')}\n${winPrizes.join('  +  ')}` : t('scratch.noWin')

  showDialog({
    className: 'scratch-result-dialog',
    message,
    theme: 'round-button',
    confirmButtonColor: '#4f46e5',
  })
}

const onStart = (e: MouseEvent | TouchEvent, index: number) => {
  e.preventDefault()
  if (cards.value[index]?.revealed || gameOver.value) return
  cards.value[index]!.isScratching = true
}

const onMove = (e: MouseEvent | TouchEvent, index: number) => {
  e.preventDefault()
  const card = cards.value[index]
  if (!card?.isScratching || card.revealed) return
  const canvas = canvasRefs.value[index]
  if (!canvas) return
  const pos = getEventPos(e, canvas)
  doScratch(canvas, pos.x, pos.y)
  if (getScratchedPercent(canvas) >= REVEAL_THRESHOLD) revealCard(index)
}

const onEnd = (e: MouseEvent | TouchEvent, index: number) => {
  e.preventDefault()
  if (cards.value[index]) cards.value[index]!.isScratching = false
}

const handleRevealAll = () => {
  cards.value.forEach((_, i) => revealCard(i))
}

const handlePlayAgain = () => {
  if (!userStore.isLogin) {
    popupStore.openPopup('login')
  } else {
    initGame()
  }
}

const handleShowRecords = () => {
  if (!userStore.isLogin) {
    popupStore.openPopup('login')
  } else {
    popupStore.openPopup('scratchRecords')
  }
}

const allRevealed = computed(() => cards.value.length > 0 && cards.value.every((c) => c.revealed))
</script>

<template>
  <div class="mainContent flex min-h-screen flex-col items-center py-10">
    <!-- Title -->
    <div class="mb-8 text-center">
      <h1
        class="scratch-title bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 bg-clip-text text-4xl font-black italic tracking-widest text-transparent drop-shadow-lg"
      >
        {{ t('scratch.title') }}
      </h1>
      <p class="mt-2 text-sm tracking-wide text-gray-400">{{ t('scratch.subtitle') }}</p>
    </div>

    <!-- Cards -->
    <div class="flex flex-wrap justify-center gap-6">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="scratch-card-wrap relative select-none"
        :style="{ width: CARD_W + 'px', height: CARD_H + 'px' }"
      >
        <!-- Prize layer underneath -->
        <div
          :class="[
            'absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-gradient-to-br',
            card.color,
            !gameReady && !card.revealed ? 'invisible' : '',
          ]"
        >
          <span
            class="text-2xl font-black tracking-wide text-white drop-shadow-lg"
            :class="{ 'scale-110 transition-transform duration-300': card.revealed }"
          >
            {{ card.prize }}
          </span>
          <span
            v-if="card.revealed && card.isWin"
            class="mt-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white"
          >
            {{ t('scratch.win') }}
          </span>
        </div>

        <!-- Scratch canvas -->
        <canvas
          :ref="(el) => setCanvasRef(el as HTMLCanvasElement | null, index)"
          :width="CARD_W"
          :height="CARD_H"
          class="relative z-10 cursor-crosshair touch-none rounded-xl"
          :class="{ 'pointer-events-none': card.revealed }"
          @mousedown="onStart($event, index)"
          @mousemove="onMove($event, index)"
          @mouseup="onEnd($event, index)"
          @mouseleave="onEnd($event, index)"
          @touchstart="onStart($event, index)"
          @touchmove="onMove($event, index)"
          @touchend="onEnd($event, index)"
        />
      </div>
    </div>

    <!-- Action buttons -->
    <div class="mt-10 flex flex-col items-center gap-4">
      <button
        v-if="!allRevealed"
        @click="handleRevealAll"
        class="reveal-btn rounded-full px-8 py-3 font-bold text-white transition-all active:scale-95"
      >
        {{ t('scratch.revealAll') }}
      </button>

      <button
        v-if="allRevealed"
        @click="handlePlayAgain"
        class="play-again-btn flex items-center gap-2 rounded-full px-8 py-3 font-bold text-white transition-all active:scale-95"
      >
        <RefreshCw :size="18" />
        {{ t('scratch.playAgain') }}
      </button>

      <button
        @click="handleShowRecords"
        class="record-btn flex items-center gap-2 rounded-full px-8 py-3 font-bold text-white transition-all active:scale-95"
      >
        <Clock
          :size="18"
          class="text-yellow-400"
        />
        {{ t('scratch.historyTitle') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.scratch-title {
  text-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);
}

.scratch-card-wrap {
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.5));
  transition: transform 0.2s ease;
}
.scratch-card-wrap:hover {
  transform: translateY(-2px);
}

.reveal-btn {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}
.reveal-btn:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
}

.play-again-btn {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
}
.play-again-btn:hover {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6);
}

.record-btn {
  background-color: #1a1d29;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}
.record-btn:hover {
  background-color: #24283b;
  border-color: rgba(253, 216, 53, 0.3);
}
</style>

<style>
.scratch-result-dialog .van-dialog__message {
  font-size: 16px;
  font-weight: bold;
  white-space: pre-line;
}
</style>
