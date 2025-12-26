/**
 * Safe number utilities to prevent type-related errors
 */

export type NumberLike = number | string | null | undefined;

/**
 * Safely converts any value to a number
 */
export function safeNumber(value: NumberLike, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
}

/**
 * Safely formats a number with fixed decimal places
 */
export function safeToFixed(value: NumberLike, decimals: number = 1, defaultValue: number = 0): string {
  const num = safeNumber(value, defaultValue);
  return num.toFixed(decimals);
}

/**
 * Formats weight with proper suffix and safety checks
 */
export function formatWeight(weight: NumberLike, unit: string = 'kg', decimals: number = 1): string {
  return `${safeToFixed(weight, decimals)}${unit}`;
}

/**
 * Safely sums an array of number-like values or an array of objects by property
 */
export function safeSum<T>(values: T[], property?: keyof T): number {
  if (!values || !Array.isArray(values)) return 0;
  if (property) {
    return values.reduce((sum, item) => sum + safeNumber(item[property] as any), 0);
  }
  return (values as any[]).reduce((sum, value) => sum + safeNumber(value), 0);
}

/**
 * Safely calculates average
 */
export function safeAverage(values: NumberLike[]): number {
  if (values.length === 0) return 0;
  return safeSum(values) / values.length;
}

/**
 * Formats currency with proper handling
 */
export function formatCurrency(amount: NumberLike, currency: string = 'UZS'): string {
  const num = safeNumber(amount);
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: currency
  }).format(num);
}

/**
 * Formats percentage with safety
 */
export function formatPercentage(value: NumberLike, decimals: number = 1): string {
  return `${safeToFixed(value, decimals)}%`;
}