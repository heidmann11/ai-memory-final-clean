import React from "react";
import { useAuth } from "./AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user, login, logout } = useAuth();
  const router = useRouter();

  const handleDemoLogin = () => {
    login({
      id: "1",
      name: "Demo User",
      email: "demo@demo.com",
    });
    router.push("/dashboard");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div>
      {user ? (
        <div className="flex items-center space-x-3">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold">
            Welcome, {user.name}!
          </span>
          <button
            className="px-3 py-1 rounded bg-white/20 text-white hover:bg-white/40 transition"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition"
          onClick={handleDemoLogin}
        >
          Try Live Demo
        </button>
      )}
    </div>
  );
}
