import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import PlayerBar from "../music/PlayerBar";

export default function ProtectedLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Top Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Persistent Player */}
      <PlayerBar />
    </div>
  );
}