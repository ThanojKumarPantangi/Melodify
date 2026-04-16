import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Search from "../pages/Search";
import Playlist from "../pages/Playlist";
import NotFound from "../pages/NotFound";
import Recent from "../pages/Recent";

import ProtectedRoute from "./ProtectedRoute";
import ProtectedLayout from "../components/layout/ProtectedLayout";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}