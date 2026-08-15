import SettingsView from "@/components/settings/SettingsView";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function Settings() {
  const user = useAuthUser();
  usePageTitle("Settings");

  return <SettingsView user={user} />;
}
