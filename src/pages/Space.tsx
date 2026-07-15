import SpaceDemo from "@/components/space/SpaceDemo";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function Space() {
  const user = useAuthUser();
  usePageTitle("Space");

  return <SpaceDemo user={user} />;
}
