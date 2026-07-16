import { Route, Routes } from "react-router-dom";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";
import SpaceHome from "@/components/space/SpaceHome";
import SpaceCourse from "@/components/space/SpaceCourse";

export default function Space() {
  const user = useAuthUser();
  usePageTitle("Space");

  if (!user) return null;

  return (
    <Routes>
      <Route index element={<SpaceHome user={user} />} />
      <Route path="course/:courseId" element={<SpaceCourse user={user} />} />
    </Routes>
  );
}
