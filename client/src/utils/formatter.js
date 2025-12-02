export function formatCompactCurrency(value) {
    if (value == null || isNaN(value)) return "0 ₫";

    const formatValue = (num, divisor, suffix) => {
      const result = num / divisor;
      return Number.isInteger(result)
        ? `${result}${suffix} ₫`
        : `${result.toFixed(2).replace(/\.00$/, '')}${suffix} ₫`;
    };

    if (value >= 1_000_000_000) return formatValue(value, 1_000_000_000, "B");
    if (value >= 1_000_000) return formatValue(value, 1_000_000, "M");
    if (value >= 1_000) return formatValue(value, 1_000, "K");
    return `${value.toLocaleString("vi-VN")} ₫`;
  }
  
  export function formatFullCurrency(value) {
    if (value == null || isNaN(value)) return "0 ₫";
    return value.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
  
