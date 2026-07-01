export function centsFromDecimal(value) {
  const number = Number(value)

  if (!Number.isFinite(number)) {
    return 0
  }

  return Math.round(number * 100)
}

export function decimalFromCents(cents) {
  return (Number(cents || 0) / 100).toFixed(2)
}

export function multiplyMoney(priceCents, quantity) {
  const safeQuantity = Number(quantity)

  if (!Number.isFinite(safeQuantity)) {
    return 0
  }

  return Math.round(Number(priceCents || 0) * safeQuantity)
}

export function formatMoney(cents) {
  return decimalFromCents(cents)
}
