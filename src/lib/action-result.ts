/**
 * Standardized Server Action Result Pattern
 * Provides a type-safe discriminated union for all Next.js Server Actions.
 *
 * @module @/lib/action-result
 */

export type ActionResult<T = void> =
  | { success: true; data: T; error?: never; message?: string }
  | { success: false; error: string; code?: string; data?: never; message?: never };

/**
 * Helper to construct a successful ActionResult
 */
export function successResult<T>(data: T, message?: string): ActionResult<T> {
  return { success: true, data, message };
}

/**
 * Helper to construct a failure ActionResult
 */
export function errorResult<T = void>(error: string, code?: string): ActionResult<T> {
  return { success: false, error, code };
}
