import { describe, expect, it } from 'vitest'
import { ErrorMessage } from '../../server/utils/errors'

describe('ErrorMessage', () => {
  it('exposes stable domain error strings', () => {
    expect(ErrorMessage.rabbitHoleNotFound).toBeTruthy()
    expect(ErrorMessage.invalidYoutubeUrl).toBeTruthy()
    expect(ErrorMessage.expandDisabled).toBeTruthy()
    expect(ErrorMessage.expandBudgetExhausted).toBeTruthy()
    expect(ErrorMessage.acceptTermsCreate).toBeTruthy()
  })
})
