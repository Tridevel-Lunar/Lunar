import { useEffect } from "react";

import BackofficeKnowledgePanel from "@/components/backoffice/BackofficeKnowledgePanel";
import { useAuthUser } from "@/routes/useAuthUser";

export default function BackofficeKnowledge() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Backoffice — LUNAR";
  }, []);

  return <BackofficeKnowledgePanel user={user} />;
}
