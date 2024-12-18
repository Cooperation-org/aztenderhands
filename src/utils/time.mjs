/**
 * @param {Date} date
 * @returns {Date}
 */
export function addHour(date) {
  return date.setHours(date.getHours() + 1);
}

export function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return [year, month, day, hour, minutes].join("");
}
