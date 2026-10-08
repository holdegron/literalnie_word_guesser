import { describe, expect, it } from 'vitest'
import { countWords } from './polish.ts'

describe('countWords', () => {
  it.each([
    [0, '0 słów'],
    [1, '1 słowo'],
    [3, '3 słowa'],
    [5, '5 słów'],
    [12, '12 słów'],
    [22, '22 słowa'],
    [114, '114 słów'],
  ])('%i → %s', (count, expected) => {
    expect(countWords(count)).toBe(expected)
  })
})
