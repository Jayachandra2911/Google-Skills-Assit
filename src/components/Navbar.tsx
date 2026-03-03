import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { auth } from "../lib/firebase";
import { LogOut, User, Shield, BookOpen, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { user, role } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">G</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">GenAI Assist Pro</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#courses" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Courses</a>
            <Link to="/checkout" className="relative p-2 text-slate-600 hover:text-emerald-600 transition-colors">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                  <User size={16} /> Dashboard
                </Link>
                {role === "admin" && (
                  <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                    <Shield size={16} /> Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600">Login</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
