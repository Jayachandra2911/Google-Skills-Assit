import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Checkout from "./pages/Checkout";
import Feedback from "./pages/Feedback";
import Success from "./pages/Success";
import { db } from "./lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, role, loading } = useAuth();

  React.useEffect(() => {
    const ensureAdmin = async () => {
      if (user && user.email === "jayachandra2911@gmail.com") {
        try {
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              email: user.email,
              role: "admin",
              createdAt: new Date().toISOString()
            });
          } else if (userDoc.data().role !== "admin") {
            await updateDoc(userRef, { role: "admin" });
          }
        } catch (err) {
          console.error("Failed to ensure admin status:", err);
        }
      }
    };
    ensureAdmin();
  }, [user]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && role !== "admin") return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                <Route path="/success" element={
                  <ProtectedRoute>
                    <Success />
                  </ProtectedRoute>
                } />

                <Route path="/feedback/:orderId" element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
