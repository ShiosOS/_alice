import { describe, expect, it } from 'vitest'
import {
  BOOTSTRAP_CHILD_TAKE,
  BOOTSTRAP_SEED_TAKE,
  DEFAULT_EXPAND_DAILY_BUDGET,
  EXPAND_TAKE_DEFAULT,
  RABBIT_HOLE_TITLE_MAX,
} from '../../server/services/expand/constants'

describe('expand constants', () => {
  it('exposes positive fan-out and budget knobs', () => {
    expect(BOOTSTRAP_SEED_TAKE).toBeGreaterThan(0)
    expect(BOOTSTRAP_CHILD_TAKE).toBeGreaterThan(0)
    expect(EXPAND_TAKE_DEFAULT).toBeGreaterThan(0)
    expect(DEFAULT_EXPAND_DAILY_BUDGET).toBeGreaterThan(0)
    expect(RABBIT_HOLE_TITLE_MAX).toBeGreaterThan(0)
  })
})
