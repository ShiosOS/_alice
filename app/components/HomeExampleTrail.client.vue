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
  steps: ExampleStep[]
}

const HOLD_MS = 4200
const GAP_MS = 140

const examples: ExampleTrail[] = [
  {
    steps: [
      { kicker: 'Started from', title: 'Beginner guitar — first three chords' },
      { kicker: 'Went next because fretting hurt', title: 'Why fingertips hurt (and when it’s normal)' },
      { kicker: 'Now here', title: 'Easy songs with G, C, and D', current: true },
    ],
  },
  {
    steps: [
      { kicker: 'Started from', title: 'Weeknight pasta — garlic and oil' },
      { kicker: 'Went next because it was bland', title: 'How to salt pasta water (actually)' },
      { kicker: 'Now here', title: 'Finishing pasta in the pan', current: true },
    ],
  },
  {
    steps: [
      { kicker: 'Started from', title: 'Phone photos look flat outdoors' },
      { kicker: 'Went next for exposure', title: 'Tap to expose, then lock AE/AF' },
      { kicker: 'Now here', title: 'Golden hour without blowing highlights', current: true },
    ],
  },
  {
    steps: [
      { kicker: 'Started from', title: 'Why you wake up at 3am' },
      { kicker: 'Went next about caffeine', title: 'How long coffee actually lasts' },
      { kicker: 'Now here', title: 'Light in the evening and melatonin', current: true },
    ],
  },
]

const stageRef = ref<HTMLElement | null>(null)
const reduceMotion = ref(false)
let index = 0
let currentEl: HTMLElement | null = null
let running = false
let loopPromise: Promise<void> | null = null

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function buildTrail(example: ExampleTrail): HTMLElement {
  const root = document.createElement('div')
  root.className = 'ink-example-trail'
  root.setAttribute('aria-hidden', 'true')

  for (const step of example.steps) {
    const stepEl = document.createElement('div')
    stepEl.className = `ink-example-step ink-example-line${step.current ? ' is-now' : ''}`

    const kicker = document.createElement('div')
    kicker.className = 'ink-example-kicker'
    kicker.textContent = step.kicker

    const title = document.createElement('div')
    title.className = 'ink-example-title'
    title.textContent = step.title

    stepEl.append(kicker, title)
    root.append(stepEl)
  }

  return root
}

function animateLines(
  el: HTMLElement,
  options: {
    fromX: number
    toX: number
    fromOpacity: number
    toOpacity: number
    duration: number
    stagger: number
    easing: string
  },
) {
  const lines = [...el.querySelectorAll<HTMLElement>('.ink-example-line')]

  if (reduceMotion.value) {
    return Promise.all(lines.map((line) => {
      line.style.opacity = String(options.toOpacity)
      line.style.transform = 'none'
      return line.animate(
        [{ opacity: options.fromOpacity }, { opacity: options.toOpacity }],
        { duration: Math.min(options.duration, 200), fill: 'forwards', easing: 'linear' },
      ).finished
    }))
  }

  return Promise.all(lines.map((line, lineIndex) => {
    return line.animate(
      [
        { opacity: options.fromOpacity, transform: `translate3d(${options.fromX}px, 0, 0)` },
        { opacity: options.toOpacity, transform: `translate3d(${options.toX}px, 0, 0)` },
      ],
      {
        duration: options.duration,
        delay: lineIndex * options.stagger,
        fill: 'forwards',
        easing: options.easing,
      },
    ).finished
  }))
}

async function enter(example: ExampleTrail, options?: { instant?: boolean }) {
  const stage = stageRef.value
  if (!stage) return

  const el = buildTrail(example)
  stage.append(el)

  if (options?.instant) {
    for (const line of el.querySelectorAll<HTMLElement>('.ink-example-line')) {
      line.style.opacity = '1'
      line.style.transform = 'none'
    }
  }
  else {
    await animateLines(el, {
      fromX: 22,
      toX: 0,
      fromOpacity: 0,
      toOpacity: 1,
      duration: 480,
      stagger: 95,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
    })
  }

  el.removeAttribute('aria-hidden')
  currentEl = el
}

async function exit() {
  if (!currentEl) return
  const el = currentEl
  currentEl = null
  el.setAttribute('aria-hidden', 'true')
  await animateLines(el, {
    fromX: 0,
    toX: -18,
    fromOpacity: 1,
    toOpacity: 0,
    duration: 340,
    stagger: 55,
    easing: 'ease',
  })
  el.remove()
}

async function loop() {
  running = true
  await enter(examples[0]!, { instant: true })
  index = 0

  while (running) {
    await sleep(HOLD_MS)
    while (running && document.hidden) {
      await sleep(400)
    }
    if (!running) break
    await exit()
    if (!running) break
    await sleep(GAP_MS)
    index = (index + 1) % examples.length
    await enter(examples[index]!)
  }
}

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  loopPromise = loop()
})

onBeforeUnmount(() => {
  running = false
  currentEl = null
  void loopPromise
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
    <div
      ref="stageRef"
      class="ink-example-stage"
    />
  </aside>
</template>
