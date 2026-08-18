// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import EmptyState from '../../app/components/EmptyState.vue'
import { showRabbitHoleListHeaderCta } from '../../app/utils/rabbit-hole-list-chrome'

const EMPTY_TITLE = 'No Rabbit Holes yet'
const FALLBACK_TITLE = 'Nothing here yet'
const START_CTA = 'Start a new Rabbit Hole'

describe('EmptyState', () => {
  it('shows only the provided title, not the fallback', () => {
    const wrapper = mount(EmptyState, {
      props: {
        title: EMPTY_TITLE,
        description: 'Start from a YouTube seed.',
      },
    })

    expect(wrapper.text()).toContain(EMPTY_TITLE)
    expect(wrapper.text()).not.toContain(FALLBACK_TITLE)
  })

  it('uses the fallback title when none is provided', () => {
    const wrapper = mount(EmptyState)
    expect(wrapper.text()).toContain(FALLBACK_TITLE)
  })
})

describe('empty Rabbit Holes library chrome', () => {
  it('hides the header CTA when the library has no holes', () => {
    expect(showRabbitHoleListHeaderCta({
      pending: false,
      error: '',
      holeCount: 0,
    })).toBe(false)
  })

  it('shows the header CTA when the library has holes', () => {
    expect(showRabbitHoleListHeaderCta({
      pending: false,
      error: '',
      holeCount: 1,
    })).toBe(true)
  })

  it('renders exactly one empty title and one start CTA when empty', () => {
    const ListEmptyHarness = defineComponent({
      name: 'ListEmptyHarness',
      setup() {
        const holeCount = 0
        const showHeaderCta = showRabbitHoleListHeaderCta({
          pending: false,
          error: '',
          holeCount,
        })

        return () => h('section', [
          h('header', [
            h('h1', 'Rabbit Holes'),
            showHeaderCta
              ? h('a', { href: '/rabbit-holes/new' }, START_CTA)
              : null,
          ]),
          holeCount === 0
            ? h(EmptyState, {
                title: EMPTY_TITLE,
                description: 'Start from a YouTube seed and grow a map of intentional forks.',
              }, {
                action: () => h('a', { href: '/rabbit-holes/new' }, START_CTA),
              })
            : null,
        ])
      },
    })

    const wrapper = mount(ListEmptyHarness)
    const text = wrapper.text()

    expect(text).toContain(EMPTY_TITLE)
    expect(text).not.toContain(FALLBACK_TITLE)
    expect(text.split(EMPTY_TITLE).length - 1).toBe(1)
    expect(text.split(START_CTA).length - 1).toBe(1)
  })
})
