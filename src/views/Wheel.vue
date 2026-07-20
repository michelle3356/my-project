<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock } from 'lucide-vue-next'
import { showDialog } from 'vant'
import { usePopupStore } from '@/stores/popup'
import { useUserStore } from '@/stores/user'
import { useWheelStore } from '@/stores/wheel'

const { t } = useI18n()
const userStore = useUserStore()
const popupStore = usePopupStore()
const wheelStore = useWheelStore()
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isSpinning = ref(false)
const canvasSize = ref(300)

interface Prize {
  name: string
  color: string
}

const prizes = computed<Prize[]>(() => [
  { name: `$100`, color: '#FF6B6B' },
  { name: t('wheel.betterLuck'), color: '#4ECDC4' },
  { name: `$50`, color: '#FFE66D' },
  { name: t('wheel.betterLuck'), color: '#1A535C' },
  { name: `$20`, color: '#F7FFF7' },
  { name: t('wheel.betterLuck'), color: '#FF9F1C' },
  { name: `$10`, color: '#7067CF' },
  { name: t('wheel.betterLuck'), color: '#FF9F1C' },
])

const numSectors = computed(() => prizes.value.length)
const arc = computed(() => (2 * Math.PI) / numSectors.value)

// 初始角度
let currentRotation = -Math.PI / 2 - (2 * Math.PI) / 8 / 2

const updateCanvasSize = () => {
  const padding = 60
  const screenWidth = window.innerWidth - padding
  canvasSize.value = Math.min(screenWidth, 500)
}

const getLines = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  // 判斷是否為英文（含空格），決定斷行策略
  const isEnglish = text.includes(' ')
  const parts = isEnglish ? text.split(' ') : text.split('')

  const lines: string[] = []
  let currentLine = ''

  parts.forEach((part) => {
    // 英文需要補空格，中文不需要
    const spacer = isEnglish && currentLine !== '' ? ' ' : ''
    const testLine = currentLine + spacer + part
    const metrics = ctx.measureText(testLine)

    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine)
      currentLine = part
    } else {
      currentLine = testLine
    }
  })

  if (currentLine) lines.push(currentLine)
  return lines
}

const drawWheel = (): void => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) return

  const cw: number = canvas.width
  const ch: number = canvas.height
  const rad: number = cw / 2

  ctx.clearRect(0, 0, cw, ch)

  const colorThemes: [string, string][] = [
    ['#e62e4d', '#7a1425'],
    ['#ffffff', '#d9c9a3'],
  ]

  prizes.value.forEach((prize: Prize, i: number) => {
    const startAngle: number = currentRotation + i * arc.value
    const endAngle: number = startAngle + arc.value
    const centerAngle: number = startAngle + arc.value / 2

    ctx.save()
    const [colorStart, colorEnd] = colorThemes[i % 2]!
    const gradient = ctx.createRadialGradient(rad, rad, rad * 0.1, rad, rad, rad)
    gradient.addColorStop(0, colorStart)
    gradient.addColorStop(1, colorEnd)

    ctx.beginPath()
    ctx.fillStyle = gradient
    ctx.moveTo(rad, rad)
    ctx.arc(rad, rad, rad, startAngle, endAngle)
    ctx.lineTo(rad, rad)
    ctx.fill()
    ctx.strokeStyle = '#785323'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    // --- 2. 繪製多行文字 ---
    ctx.save()
    ctx.translate(rad, rad)
    ctx.rotate(centerAngle + Math.PI / 2) // 合併旋轉

    const fontSize: number = Math.max(10, canvasSize.value / 25)
    ctx.font = `900 ${fontSize}px 'Inter', 'Noto Sans TC', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#961e31'

    // 計算斷行：源頭即確定為 string[]
    const maxWidth: number = arc.value * rad * 0.8
    const lines: string[] = getLines(ctx, prize.name, maxWidth)

    const textOffset: number = rad * 0.75
    const lineHeight: number = fontSize * 1.1

    lines.forEach((line: string, index: number) => {
      const yOffset: number = (index - (lines.length - 1) / 2) * lineHeight
      ctx.fillText(line, 0, -textOffset + yOffset)
    })

    ctx.restore()
  })
}

const spin = () => {
  if (isSpinning.value) return
  isSpinning.value = true

  const extraDegree = Math.random() * 2 * Math.PI
  const totalRotation = 10 * 2 * Math.PI + extraDegree
  const startRotation = currentRotation
  const duration = 4000
  const startTime = performance.now()

  const animate = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    currentRotation = startRotation + totalRotation * easeOut

    drawWheel()

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      isSpinning.value = false

      const pointerAngle = -Math.PI / 2
      const actualRotation = currentRotation % (2 * Math.PI)
      let relativeAngle = pointerAngle - actualRotation

      while (relativeAngle < 0) relativeAngle += 2 * Math.PI
      const prizeIndex = Math.floor(relativeAngle / arc.value) % numSectors.value

      const winningPrizeObj = prizes.value[prizeIndex]

      if (winningPrizeObj) {
        // t('wheel.betterLuck') 的就是沒中
        const isWin = !winningPrizeObj.name.includes(t('wheel.betterLuck'))
        wheelStore.addRecord(winningPrizeObj.name, isWin)
        showDialog({
          className: 'lucky-wheel-dialog',
          message: winningPrizeObj.name,
          theme: 'round-button',
          confirmButtonColor: '#4f46e5',
        })
      }
    }
  }
  requestAnimationFrame(animate)
}

const handleGoToRecords = () => {
  if (!userStore.isLogin) {
    popupStore.openPopup('login')
  } else {
    spin()
  }
}

const handleShowRecords = () => {
  if (!userStore.isLogin) {
    popupStore.openPopup('login')
  } else {
    popupStore.openPopup('wheelRecords')
  }
}

watch(canvasSize, () => {
  nextTick(() => {
    drawWheel()
  })
})

onMounted(async () => {
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)
  await document.fonts.ready
  drawWheel()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
})

watch(
  prizes,
  () => {
    drawWheel()
  },
  { deep: true },
)
</script>

<template>
  <div class="mainContent flex min-h-screen flex-col items-center py-10">
    <div class="mb-8 text-center">
      <img
        src="@/assets/images/luckySpin/luck_spin.png"
        class="max-w-[300px] md:max-w-[500px]"
        alt="Lucky Spin"
      />
    </div>

    <div
      class="wheel-golden-frame relative flex items-center justify-center rounded-full"
      :class="{ 'is-spinning-active': isSpinning }"
    >
      <img
        src="@/assets/images/luckySpin/pointer_center.png"
        class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer drop-shadow-xl transition-transform hover:scale-110 active:scale-95"
        :style="{ width: canvasSize * 0.22 + 'px' }"
        @click="handleGoToRecords()"
        alt="spin"
      />

      <canvas
        ref="canvasRef"
        :width="canvasSize"
        :height="canvasSize"
        class="relative z-0 overflow-hidden rounded-full transition-all duration-300"
      ></canvas>
    </div>

    <div class="mt-10 flex flex-col items-center">
      <button
        @click="handleShowRecords"
        class="record-btn flex items-center gap-2 rounded-full px-8 py-3 font-bold text-white transition-all active:scale-95"
      >
        <Clock
          :size="18"
          class="text-yellow-400"
        />
        {{ t('wheel.historyTitle') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.wheel-golden-frame {
  padding: 15px;
  background: linear-gradient(135deg, #fff9c4 0%, #fdd835 25%, #fbc02d 50%, #fdd835 75%, #fff9c4 100%);
  box-shadow:
    0 0 25px rgba(253, 216, 53, 0.4),
    0 10px 25px rgba(0, 0, 0, 0.6),
    inset 0 0 12px rgba(255, 255, 255, 0.8),
    inset 0 0 18px rgba(0, 0, 0, 0.4);
  border: 2px solid #fff176;
  animation: shine-pulse 1.5s infinite ease-in-out;
}
@media (max-width: 500px) {
  .wheel-golden-frame {
    padding: 10px;
  }
}
@keyframes shine-pulse {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(253, 216, 53, 0.4),
      0 10px 20px rgba(0, 0, 0, 0.6),
      inset 0 0 12px rgba(255, 255, 255, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 45px rgba(253, 216, 53, 0.8),
      0 15px 30px rgba(0, 0, 0, 0.4),
      inset 0 0 18px rgba(255, 255, 255, 1);
    transform: scale(1.005);
  }
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
.record-text {
  font-size: 18px;
  letter-spacing: 1px;
  text-shadow:
    2px 2px 0px #000,
    -1px -1px 0px #000,
    1px -1px 0px #000,
    -1px 1px 0px #000,
    1px 1px 0px #000;
  color: #ffffff;
}
:deep(.lucide-clock) {
  filter: drop-shadow(0 0 2px rgba(253, 216, 53, 0.5));
}
</style>

<style>
.lucky-wheel-dialog .van-dialog__message {
  font-size: 16px;
  font-weight: bold;
}
</style>
