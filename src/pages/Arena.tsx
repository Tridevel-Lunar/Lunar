import { useEffect } from "react";

import ArenaDemo from "@/components/arena/ArenaDemo";
import { useAuthUser } from "@/routes/useAuthUser";

export default function Arena() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Arena";
  }, []);

  return <ArenaDemo user={user} />;
}
