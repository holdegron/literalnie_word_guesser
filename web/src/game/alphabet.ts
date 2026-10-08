export const POLISH_LETTERS = 'aąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż'

export const isLetter = (key: string): boolean =>
  key.length === 1 && POLISH_LETTERS.includes(key.toLowerCase())

export const KEYBOARD_ROWS: readonly (readonly string[])[] = [
  ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]
