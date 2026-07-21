import { OrbitControls } from "@react-three/drei";

import WebGPUCanvas from "@/components/space/courses/cubesat-for-beginner/modules/physics/scene/WebGPUCanvas";
import RealisticEarth from "@/components/space/courses/cubesat-for-beginner/modules/physics/scene/RealisticEarth";
import RealisticSun from "@/components/space/courses/cubesat-for-beginner/modules/physics/scene/RealisticSun";
import StarSphere from "@/components/space/courses/cubesat-for-beginner/modules/physics/scene/StarSphere";

/** Realistic Earth playground — same shared components used by the Space lessons. */
export default function Exp() {
  return (
    <div className="fixed inset-0 bg-black">
      <WebGPUCanvas camera={{ position: [4.5, 2, 3], fov: 25, near: 0.1, far: 100000 }}>
        <OrbitControls enableDamping minDistance={1.5} maxDistance={15} />
        <StarSphere />
        <RealisticSun lightIntensity={2} />
        <RealisticEarth />
      </WebGPUCanvas>
    </div>
  );
}
