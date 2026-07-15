import StudioChatView from "@/components/studio/chat/StudioChatView";
import { useAuthUser } from "@/routes/useAuthUser";
import { usePageTitle } from "@/lib/use-page-title";

export default function StudioChat() {
  const user = useAuthUser();
  usePageTitle("Studio");

  return <StudioChatView user={user} />;
}
