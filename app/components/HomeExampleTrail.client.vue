<script setup lang="ts">
/**
 * Ambient home Example trail — decorative teaching panel, not interactive chrome.
 * Fly-out left, then fly-in from the right; respects prefers-reduced-motion.
 */

type ExampleStep = {
  kicker: string
  title: string
  current?: boolean
}

type ExampleTrail = {
  id: string
  steps: ExampleStep[]
}

const HOLD_MS = 4200
const GAP_MS = 140

const examples: ExampleTrail[] = [
  {
    id: 'guitar',
    steps: [
      { kicker: 'Started from', title: 'Beginner guitar — first three chords' },
      { kicker: 'Went next because fretting hurt', title: 'Why fingertips hurt (and when it’s normal)' },
      { kicker: 'Now here', title: 'Easy songs with G, C, and D', current: true },
    ],
  },
  {
    id: 'pasta',
    steps: [
      { kicker: 'Started from', title: 'Weeknight pasta — garlic and oil' },
      { kicker: 'Went next because it was bland', title: 'How to salt pasta water (actually)' },
      { kicker: 'Now here', title: 'Finishing pasta in the pan', current: true },
    ],
  },
  {
    id: 'photos',
    steps: [
      { kicker: 'Started from', title: 'Phone photos look flat outdoors' },
      { kicker: 'Went next for exposure', title: 'Tap to expose, then lock AE/AF' },
      { kicker: 'Now here', title: 'Golden hour without blowing highlights', current: true },
    ],
  },
  {
    id: 'sleep',
    steps: [
      { kicker: 'Started from', title: 'Why you wake up at 3am' },
      { kicker: 'Went next about caffeine', title: 'How long coffee actually lasts' },
      { kicker: 'Now here', title: 'Light in the evening and melatonin', current: true },
    ],
  },
]

const activeIndex = ref(0)
const phase = ref<'shown' | 'exiting' | 'hidden' | 'entering'>('shown')
const reduceMotion = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
let running = false

const activeExample = computed(() => examples[activeIndex.value]!)

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function schedule(ms: number, fn: () => void) {
  clearTimer()
  timer = setTimeout(fn, ms)
}

async function wait(ms: number) {
  await new Promise<void>((resolve) => {
    schedule(ms, resolve)
  })
}

async function cycleOnce() {
  const exitMs = reduceMotion.value ? 220 : 560
  const enterMs = reduceMotion.value ? 240 : 900
  const gapMs = reduceMotion.value ? 80 : GAP_MS

  phase.value = 'exiting'
  await wait(exitMs)
  if (!running) return

  activeIndex.value = (activeIndex.value + 1) % examples.length
  phase.value = 'hidden'
  await nextTick()
  await wait(gapMs)
  if (!running) return

  phase.value = 'entering'
  await wait(enterMs)
  if (!running) return

  phase.value = 'shown'
}

async function loop() {
  running = true
  while (running) {
    await wait(HOLD_MS)
    while (running && typeof document !== 'undefined' && document.hidden) {
      await wait(400)
    }
    if (!running) break
    await cycleOnce()
  }
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  void loop()
})

onBeforeUnmount(() => {
  running = false
  clearTimer()
})
</script>

<template>
  <aside
    class="ink-example-panel"
    aria-live="polite"
    aria-label="Example rabbit hole"
  >
    <p class="ink-example-label">
      Example
    </p>
    <div class="ink-example-stage">
      <div
        :key="activeExample.id"
        class="ink-example-trail"
        :class="{
          'is-shown': phase === 'shown',
          'is-entering': phase === 'entering',
          'is-exiting': phase === 'exiting',
          'is-hidden': phase === 'hidden',
        }"
      >
        <div
          v-for="(step, stepIndex) in activeExample.steps"
          :key="`${activeExample.id}-${stepIndex}`"
          class="ink-example-step ink-example-line"
          :class="{ 'is-now': step.current }"
        >
          <div class="ink-example-kicker">
            {{ step.kicker }}
          </div>
          <div class="ink-example-title">
            {{ step.title }}
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
