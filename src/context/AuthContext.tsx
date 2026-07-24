import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
import { auth, db, googleProvider, firebaseStatus } from "../firebase";
import { UserProfile, UserRole } from "../types";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  setDemoRole: (role: UserRole) => void;
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
  allUsers: UserProfile[];
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(!firebaseStatus.isConfigured);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Demo user initial state
  const [demoRoleState, setDemoRoleState] = useState<UserRole>("admin");

  // Default demo user profile
  const getDemoProfile = (role: UserRole): UserProfile => ({
    uid: "demo-user-123",
    email: "operador.industrial@empresa.com",
    displayName: "Operador Demostración",
    role,
    createdAt: Date.now(),
    lastLogin: Date.now(),
  });

  // Listen to Auth State
  useEffect(() => {
    if (!auth || !db || !firebaseStatus.isConfigured) {
      setIsDemoMode(true);
      setUserProfile(getDemoProfile(demoRoleState));
      setAllUsers([
        getDemoProfile("admin"),
        {
          uid: "demo-user-456",
          email: "mantenimiento@empresa.com",
          displayName: "Ing. Carlos Mendoza (Mantenimiento)",
          role: "maintenance_manager",
          createdAt: Date.now() - 86400000,
          lastLogin: Date.now() - 3600000,
        },
        {
          uid: "demo-user-789",
          email: "tecnico1@empresa.com",
          displayName: "Técnico Luis Torres",
          role: "technician",
          createdAt: Date.now() - 172800000,
          lastLogin: Date.now() - 7200000,
        },
        {
          uid: "demo-user-101",
          email: "produccion@empresa.com",
          displayName: "Jefe Producción Elena Ríos",
          role: "production_manager",
          createdAt: Date.now() - 259200000,
          lastLogin: Date.now() - 18000000,
        },
      ]);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        setIsDemoMode(false);
        try {
          const userDocRef = doc(db!, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            const updatedProfile: UserProfile = {
              ...data,
              lastLogin: Date.now(),
              displayName: user.displayName || data.displayName || "Usuario Industrial",
              email: user.email || data.email,
              photoURL: user.photoURL || undefined,
            };
            await updateDoc(userDocRef, {
              lastLogin: Date.now(),
              displayName: updatedProfile.displayName,
              photoURL: user.photoURL || null,
            });
            setUserProfile(updatedProfile);
          } else {
            // First time login - assign default role (or admin if first registered user)
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || "usuario@empresa.com",
              displayName: user.displayName || "Usuario Industrial",
              photoURL: user.photoURL || undefined,
              role: "admin", // Default initial role
              createdAt: Date.now(),
              lastLogin: Date.now(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err: unknown) {
          console.error("Error fetching user profile from Firestore:", err);
          setError("Error al cargar perfil de Firestore. Revisa reglas de seguridad o conexión.");
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [demoRoleState]);

  // Subscribe to all users list in Firestore if authenticated
  useEffect(() => {
    if (!db || !firebaseUser || isDemoMode) return;

    try {
      const usersColRef = collection(db, "users");
      const unsubUsers = onSnapshot(
        usersColRef,
        (snapshot) => {
          const list: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as UserProfile);
          });
          setAllUsers(list);
        },
        (err) => {
          console.error("Firestore users snapshot error:", err);
        }
      );
      return () => unsubUsers();
    } catch (err) {
      console.error("Users list sub error:", err);
    }
  }, [firebaseUser, isDemoMode]);

  const signInWithGoogle = async () => {
    setError(null);
    if (!auth || !firebaseStatus.isConfigured) {
      setError("Firebase no está configurado con variables de entorno. Usando modo demostración.");
      setIsDemoMode(true);
      setUserProfile(getDemoProfile(demoRoleState));
      return;
    }

    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error durante el inicio de sesión con Google";
      console.error("Google Auth error:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setError(null);
    if (auth && firebaseStatus.isConfigured) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
    setFirebaseUser(null);
    if (isDemoMode) {
      setUserProfile(null);
    }
  };

  const setDemoRole = (role: UserRole) => {
    setDemoRoleState(role);
    setUserProfile(getDemoProfile(role));
    if (isDemoMode) {
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === "demo-user-123" ? { ...u, role } : u))
      );
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    setError(null);
    if (isDemoMode) {
      setAllUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
      if (userProfile && userProfile.uid === uid) {
        setUserProfile({ ...userProfile, role: newRole });
      }
      return;
    }

    if (!db) {
      setError("Firestore no está disponible.");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { role: newRole });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar rol";
      console.error("Error updating user role:", err);
      setError("Error al actualizar el rol en Firestore: " + msg);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        error,
        isDemoMode,
        signInWithGoogle,
        signOutUser,
        setDemoRole,
        updateUserRole,
        allUsers,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};
