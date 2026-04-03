/**
 * toastBridge — allows non-React code (Zustand store, api.js, etc.)
 * to show toast notifications without being coupled to React context.
 *
 * Usage:
 *   1. ToastProvider calls setToastFn(showToast) on mount.
 *   2. Any module imports { toast } and calls toast('message', 'success').
 */

let _showToast = null;

export function setToastFn(fn) {
  _showToast = fn;
}

export function toast(message, type = 'info', duration = 2800) {
  if (_showToast) _showToast(message, type, duration);
}
