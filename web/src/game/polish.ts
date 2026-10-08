const numberFormat = new Intl.NumberFormat('pl-PL')

export const plural = (count: number, one: string, few: string, many: string): string => {
  if (count === 1) return one
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14) ? few : many
}

export const countWords = (count: number): string =>
  `${numberFormat.format(count)} ${plural(count, 'słowo', 'słowa', 'słów')}`
