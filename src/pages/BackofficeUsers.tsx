import BackofficeUsersPanel from "@/components/backoffice/BackofficeUsersPanel";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function BackofficeUsers() {
  const user = useAuthUser();
  usePageTitle("Backoffice");

  return <BackofficeUsersPanel user={user} />;
}
