import { Route, Routes } from "react-router-dom";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";
import SpaceHome from "@/components/space/SpaceHome";
import SpaceCourse from "@/components/space/SpaceCourse";
import OrbitOverviewLesson from "@/features/orbit-overview/OrbitOverviewLesson";
import AnatomyLesson from "@/features/anatomy-of-cubesat/AnatomyLesson";

export default function Space() {
  const user = useAuthUser();
  usePageTitle("Space");

  if (!user) return null;

  return (
    <Routes>
      <Route index element={<SpaceHome user={user} />} />
      <Route path="course/:courseId" element={<SpaceCourse user={user} />} />
      <Route path="course/:courseId/lesson/overview" element={<OrbitOverviewLesson />} />
      <Route path="course/:courseId/lesson/anatomy" element={<AnatomyLesson />} />
    </Routes>
  );
}
