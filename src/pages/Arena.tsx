import ArenaDemo from "@/components/arena/ArenaDemo";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function Arena() {
  const user = useAuthUser();
  usePageTitle("Arena");

  return <ArenaDemo user={user} />;
}
