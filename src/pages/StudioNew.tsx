import StudioNewCollection from "@/components/studio/landing/StudioNewCollection";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function StudioNew() {
  const user = useAuthUser();
  usePageTitle("Studio");

  return <StudioNewCollection user={user} />;
}
