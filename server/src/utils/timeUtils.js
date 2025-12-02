// Time utility functions
export function normalizeTime(inputTime) {
  if (!inputTime) return inputTime;
  if (inputTime.split(':').length === 2) {
    return `${inputTime}:00`; // Convert '10:30' to '10:30:00'
  }
  return inputTime;
}