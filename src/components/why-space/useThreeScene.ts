import { useEffect, type DependencyList, type RefObject } from "react";
import type { BufferGeometry, Material, Scene, WebGLRenderer } from "three";

export function runThreeLoop(
  el: HTMLDivElement,
  animate: (delta: number) => void,
  render: () => void,
): () => void {
  let raf = 0;
  let last = performance.now();
  let pageVisible = true;
  let inView = true;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!pageVisible || !inView) {
      last = now;
      return;
    }
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    animate(delta);
    render();
  };

  raf = requestAnimationFrame(tick);

  const onVisibility = () => {
    pageVisible = !document.hidden;
  };
  document.addEventListener("visibilitychange", onVisibility);

  const observer = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
    },
    { rootMargin: "100px" },
  );
  observer.observe(el);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVisibility);
    observer.disconnect();
  };
}

export function disposeScene(scene: Scene, renderer: WebGLRenderer) {
  scene.traverse((obj) => {
    const mesh = obj as { geometry?: BufferGeometry; material?: Material | Material[] };
    mesh.geometry?.dispose();
    if (mesh.material) {
      if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
      else mesh.material.dispose();
    }
  });
  renderer.dispose();
}

export function useThreeScene(
  mountRef: RefObject<HTMLDivElement | null>,
  setup: (el: HTMLDivElement) => (() => void) | void,
  deps: DependencyList,
) {
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    return setup(el) ?? undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
