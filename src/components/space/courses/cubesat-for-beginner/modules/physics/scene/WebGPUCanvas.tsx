import type { ComponentProps } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three/webgpu";

type WebGPUCanvasProps = Omit<ComponentProps<typeof Canvas>, "gl">;

/**
 * R3F Canvas backed by THREE.WebGPURenderer.
 * Falls back to WebGL2 automatically when the browser has no WebGPU
 * (TSL node materials compile on both backends).
 */
export default function WebGPUCanvas({ children, ...props }: WebGPUCanvasProps) {
  return (
    <Canvas
      {...props}
      gl={async (defaultProps) => {
        const renderer = new THREE.WebGPURenderer({
          ...(defaultProps as ConstructorParameters<typeof THREE.WebGPURenderer>[0]),
          forceWebGL: !("gpu" in navigator),
        });
        await renderer.init();
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        return renderer;
      }}
    >
      {children}
    </Canvas>
  );
}
