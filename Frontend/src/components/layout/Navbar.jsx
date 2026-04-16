import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "Search", href: "/search" },
  { name: "Playlist", href: "/playlist" },
  { name: "Recent", href: "/recent" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white px-4 py-3 flex items-center justify-between">
      
      {/* Logo */}
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate(isAuthenticated ? "/home" : "/login")}
      >
        🎵 Melodify
      </h1>

      {/* Desktop Links */}
      {isAuthenticated && (
        <div className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className={`${
                location.pathname === link.href
                  ? "text-green-400"
                  : "text-gray-300"
              } hover:text-white`}
            >
              {link.name}
            </button>
          ))}
        </div>
      )}

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {!isAuthenticated ? (
          <>
            <button onClick={() => navigate("/login")}>Login</button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-green-500 px-3 py-1 rounded"
            >
              Signup
            </button>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2"
            >
              <User size={20} />
              <span>{user?.username || "User"}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white text-black rounded shadow w-40">
                <button
                  onClick={() => navigate("/playlist")}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  My Playlist
                </button>

                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  <LogOut size={16} className="inline mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && isAuthenticated && (
        <div className="absolute top-14 left-0 w-full bg-gray-800 flex flex-col p-4 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => {
                navigate(link.href);
                setMobileOpen(false);
              }}
              className="py-2 text-left"
            >
              {link.name}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="py-2 text-left text-red-400"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}