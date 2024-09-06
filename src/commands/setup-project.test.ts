import { shouldSkipOptionalCopy } from './setup-project'
import { describe, it, expect } from '@jest/globals'

describe('shouldSkipOptionalCopy', () => {
  it('Returns true if the file is not optional', () => {
    expect(
      shouldSkipOptionalCopy('something/somethingelse', ["doesn't matter"])
    ).toBe(true)
  })

  it('Returns true if the file is not in the array', () => {
    expect(
      shouldSkipOptionalCopy('something/somethingelse.optional', ['not_here'])
    ).toBe(true)
  })

  it('Returns false if the file is optional and in the array', () => {
    expect(
      shouldSkipOptionalCopy('something/somethingelse.optional', ['something'])
    ).toBe(false)
  })
})
