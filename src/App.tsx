import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Arena from "@/pages/Arena";
import ArenaMission from "@/pages/ArenaMission";
import Space from "@/pages/Space";
import Studio from "@/pages/Studio";
import StudioChat from "@/pages/StudioChat";
import StudioNew from "@/pages/StudioNew";
import BackofficeKnowledge from "@/pages/BackofficeKnowledge";
import BackofficeUsers from "@/pages/BackofficeUsers";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/space/*" element={<Space />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/arena/mission/:missionId" element={<ArenaMission />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/studio/new" element={<StudioNew />} />
        <Route path="/studio/chat/:collectionId" element={<StudioChat />} />
        <Route path="/backoffice/users" element={<BackofficeUsers />} />
        <Route path="/backoffice/knowledge" element={<BackofficeKnowledge />} />
      </Route>
      <Route path="/dashboard" element={<Navigate to="/space" replace />} />
    </Routes>
  );
}
