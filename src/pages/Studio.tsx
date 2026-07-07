import { useEffect } from "react";

import StudioDemo from "@/components/studio/StudioDemo";
import { useAuthUser } from "@/routes/useAuthUser";

export default function Studio() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Studio — LUNAR";
  }, []);

  return <StudioDemo user={user} />;
}
