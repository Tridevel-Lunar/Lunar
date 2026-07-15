import BackofficeKnowledgePanel from "@/components/backoffice/BackofficeKnowledgePanel";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function BackofficeKnowledge() {
  const user = useAuthUser();
  usePageTitle("Backoffice");

  return <BackofficeKnowledgePanel user={user} />;
}
