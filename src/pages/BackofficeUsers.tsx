import { useEffect } from "react";

import BackofficeUsersPanel from "@/components/backoffice/BackofficeUsersPanel";
import { useAuthUser } from "@/routes/useAuthUser";

export default function BackofficeUsers() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Backoffice — Users — LUNAR";
  }, []);

  return <BackofficeUsersPanel user={user} />;
}
