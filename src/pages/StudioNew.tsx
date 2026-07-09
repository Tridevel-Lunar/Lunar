import { useEffect } from "react";

import StudioNewCollection from "@/components/studio/landing/StudioNewCollection";
import { useAuthUser } from "@/routes/useAuthUser";

export default function StudioNew() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Studio — New — LUNAR";
  }, []);

  return <StudioNewCollection user={user} />;
}
