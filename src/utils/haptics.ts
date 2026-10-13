/**
 * Haptic feedback utility for mobile and touch devices.
 * Uses the Web Vibration API when supported.
 */

let lastHapticTime = 0;

export const triggerHaptic = (durationMs: number = 10, minIntervalMs: number = 40): void => {
  if (typeof window === 'undefined') return;
  const now = performance.now();
  if (now - lastHapticTime < minIntervalMs) return; // Prevent spamming hardware motor
  lastHapticTime = now;

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      navigator.vibrate(durationMs);
    }
  } catch {
    // Ignore environments where vibrate is restricted or blocked
  }
};

export const triggerImpactHaptic = (): void => {
  triggerHaptic(18, 50);
};

export const triggerSubtleTickHaptic = (): void => {
  triggerHaptic(8, 30);
};
