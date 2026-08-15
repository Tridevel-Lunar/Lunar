import { Route, Routes } from "react-router-dom";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";
import SpaceHome from "@/components/space/SpaceHome";
import SpaceCourse from "@/components/space/SpaceCourse";
import SpaceModuleRoute from "@/components/space/SpaceModuleRoute";
import PathSessionLayout from "@/components/space/path/PathSessionLayout";

export default function Space() {
  const user = useAuthUser();
  usePageTitle("Space");

  if (!user) return null;

  return (
    <Routes>
      <Route element={<SpaceHome user={user} />}>
        <Route index element={null} />
        <Route path="explore" element={null} />
        <Route path="path" element={null} />
      </Route>
      <Route path="path/session" element={<PathSessionLayout user={user} />} />
      <Route path="course/:courseId" element={<SpaceCourse user={user} />} />
      <Route
        path="course/:courseId/module/:moduleId"
        element={<SpaceModuleRoute user={user} />}
      />
    </Routes>
  );
}
