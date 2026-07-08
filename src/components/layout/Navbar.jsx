import { useState } from "react";
import { Home, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/properties", label: "Listings" },
  { to: "/matches", label: "Matches" },
  { to: "/applications", label: "Applications" },
  { to: "/chat", label: "Chat" },
  { to: "/profile", label: "Profile" },
];

const activeLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "text-primary-600 bg-primary-50"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
  }`;

// Mobile layout adjustments for full width links
const mobileActiveLinkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium transition-colors w-full ${
    isActive
      ? "text-primary-600 bg-primary-50"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
  }`;

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false); // Close menu if open
      navigate("/login", { replace: true });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 group"
              onClick={() => setIsOpen(false)}
            >
              <div className="p-2 rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                <Home className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                Tenants.io
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={activeLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-4 space-y-3 shadow-lg">
          {isAuthenticated ? (
            <>
              {/* Mobile Auth Links */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={mobileActiveLinkClass}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <hr className="border-gray-100" />
              {/* Mobile Logout */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2.5 text-base font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            // Mobile Guest Links
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex justify-center w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-base font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="flex justify-center w-full rounded-md bg-primary-600 px-3 py-2.5 text-base font-medium text-white transition hover:bg-primary-700"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
