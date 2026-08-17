import { describe, expect, it } from 'vitest'
import {
  createRabbitHoleBodySchema,
  holeStatuses,
  pathKinds,
  renameRabbitHoleBodySchema,
} from '../../shared/types/rabbit-holes'

describe('shared rabbit-hole contracts', () => {
  it('exposes domain enums', () => {
    expect(holeStatuses).toContain('ready')
    expect(pathKinds).toContain('visited')
  })

  it('validates create and rename bodies', () => {
    expect(createRabbitHoleBodySchema.parse({ url: 'https://youtu.be/dQw4w9WgXcQ' }).url)
      .toContain('youtu.be')
    expect(renameRabbitHoleBodySchema.parse({ title: 'New title' }).title).toBe('New title')
    expect(() => createRabbitHoleBodySchema.parse({ url: '' })).toThrow()
    expect(() => renameRabbitHoleBodySchema.parse({ title: '' })).toThrow()
  })
})
