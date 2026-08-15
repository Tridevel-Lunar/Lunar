import ArenaView from "@/components/arena/Arena";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function Arena() {
  const user = useAuthUser();
  usePageTitle("Arena");

  return <ArenaView user={user} />;
}
