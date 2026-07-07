import { useEffect } from "react";

import SpaceDemo from "@/components/space/SpaceDemo";
import { useAuthUser } from "@/routes/useAuthUser";

export default function Space() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Space — LUNAR";
  }, []);

  return <SpaceDemo user={user} />;
}
