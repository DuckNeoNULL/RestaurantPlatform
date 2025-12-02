// Utility helpers to deal with MySQL BIT(1) values returned as Buffer
export function bitToNumber(bitValue) {
  if (bitValue == null) return 0;
  try {
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(bitValue)) {
      return bitValue.length > 0 ? bitValue[0] : 0;
    }
  } catch (e) {
    // ignore
  }

  if (typeof bitValue === 'number') return bitValue;
  if (typeof bitValue === 'boolean') return bitValue ? 1 : 0;
  const n = Number(bitValue);
  return Number.isNaN(n) ? 0 : n;
}

export function bitToBoolean(bitValue) {
  return bitToNumber(bitValue) === 1;
}

export default { bitToNumber, bitToBoolean };
