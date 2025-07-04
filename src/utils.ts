// General Utility Functions

/**
 * Generates a random alphanumeric ID
 */
export function generateRandomId(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Formats a Date object to YYYY-MM-DD format
 */
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD format
}

/**
 * Creates a timestamped folder name in the format YYYY-MM-DD_HH:MM.SSS
 */
export function createTimestampedFolderName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day}_${hours}:${minutes}.${milliseconds}`;
}
