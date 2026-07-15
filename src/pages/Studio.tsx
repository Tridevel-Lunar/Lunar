import StudioLanding from "@/components/studio/landing/StudioLanding";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function Studio() {
  const user = useAuthUser();
  usePageTitle("Studio");

  return <StudioLanding user={user} />;
}
