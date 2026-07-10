import { useEffect } from "react";

import StudioLanding from "@/components/studio/landing/StudioLanding";
import { useAuthUser } from "@/routes/useAuthUser";

export default function Studio() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Studio";
  }, []);

  return <StudioLanding user={user} />;
}
