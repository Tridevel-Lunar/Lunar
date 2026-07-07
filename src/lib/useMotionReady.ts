import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

/**
 * Defers reduced-motion preference until after hydration so SSR and the first
 * client render use the same animation variants (avoids hydration mismatches).
 */
export function useMotionReady() {
  const prefersReducedMotion = useReducedMotion();
  const hydrated = useHydrated();

  return {
    hydrated,
    reduceMotion: hydrated && Boolean(prefersReducedMotion),
  };
}
