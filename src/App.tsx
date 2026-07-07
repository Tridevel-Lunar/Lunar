import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/routes/ProtectedRoute";
import GuestRoute from "@/routes/GuestRoute";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Space from "@/pages/Space";
import Studio from "@/pages/Studio";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/space" element={<Space />} />
        <Route path="/studio" element={<Studio />} />
      </Route>
      <Route path="/dashboard" element={<Navigate to="/space" replace />} />
    </Routes>
  );
}
