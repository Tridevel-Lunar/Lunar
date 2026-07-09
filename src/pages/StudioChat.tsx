import { useEffect } from "react";

import StudioChatView from "@/components/studio/chat/StudioChatView";
import { useAuthUser } from "@/routes/useAuthUser";

export default function StudioChat() {
  const user = useAuthUser();

  useEffect(() => {
    document.title = "Studio — Chat — LUNAR";
  }, []);

  return <StudioChatView user={user} />;
}
