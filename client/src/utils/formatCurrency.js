export function formatCompactCurrency(value) {
    const formatValue = (num, divisor, suffix) => {
      const result = num / divisor
      // Nếu là số nguyên (vd: 3.00) → không hiển thị thập phân
      return Number.isInteger(result)
        ? `${result}${suffix} ₫`
        : `${result.toFixed(2).replace(/\.00$/, '')}${suffix} ₫`
    }
  
    if (value >= 1_000_000_000) return formatValue(value, 1_000_000_000, "B")
    if (value >= 1_000_000) return formatValue(value, 1_000_000, "M")
    if (value >= 1_000) return formatValue(value, 1_000, "K")
    return `${value} ₫`
  }
  