import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { ShieldCheck, Lock, Mail, LogIn, ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Strictly enforce jayachandra2911@gmail.com as the one and only admin
      if (user.email === "jayachandra2911@gmail.com") {
        navigate("/admin");
      } else {
        setError("Access denied. This account does not have administrator privileges.");
      }
    } catch (err: any) {
      console.error("Admin Login error:", err);
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // 1. Verify if the email is the one and only admin email
      if (email !== "jayachandra2911@gmail.com") {
        setError("No administrator account found with this email address.");
        setLoading(false);
        return;
      }

      // 2. Send reset email
      await sendPasswordResetEmail(auth, email);
      setSuccess("Password reset email sent! Please check your inbox.");
      setTimeout(() => setResetMode(false), 5000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError("Failed to send reset email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-slate-900">
      <div className="w-full max-w-md">
        <button 
          onClick={() => resetMode ? setResetMode(false) : navigate("/login")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> {resetMode ? "Back to Admin Login" : "Back to Student Login"}
        </button>

        <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              {resetMode ? (
                <RefreshCw className="text-emerald-500" size={32} />
              ) : (
                <ShieldCheck className="text-emerald-500" size={32} />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {resetMode ? "Reset Admin Password" : "Admin Portal"}
            </h1>
            <p className="text-slate-400 text-sm">
              {resetMode ? "Enter your admin email to receive a reset link" : "Secure access for administrators only"}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-xs mb-6 border border-red-500/20 text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl text-xs mb-6 border border-emerald-500/20 text-center font-medium">
              {success}
            </div>
          )}

          {!resetMode ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="admin@genaiassist.pro"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  <button 
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Access Dashboard"} <LogIn size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                    placeholder="admin@genaiassist.pro"
                    required
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Send Reset Link"} <RefreshCw size={18} />
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-700">
            <p className="text-[10px] text-center text-slate-500 leading-relaxed uppercase tracking-widest font-bold">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
