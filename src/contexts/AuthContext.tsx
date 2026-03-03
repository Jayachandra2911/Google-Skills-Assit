import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  role: "student" | "admin" | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"student" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setUser(user);
        if (user) {
          // Strictly enforce jayachandra2911@gmail.com as the one and only admin
          if (user.email === "jayachandra2911@gmail.com") {
            setRole("admin");
          } else {
            // For all other users, fetch role from Firestore but ensure it's not admin
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const fetchedRole = userDoc.data().role;
              setRole(fetchedRole === "admin" ? "student" : fetchedRole);
            } else {
              setRole("student");
            }
          }
        } else {
          setRole(null);
        }
      } catch (error: any) {
        if (error.code === 'unavailable' || error.message?.includes('offline')) {
          console.warn("AuthContext: Firestore is offline, using default student role.");
        } else {
          console.error("Error in AuthContext state change:", error);
        }
        // Still allow the user to be "logged in" even if role fetch fails
        setRole("student");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
