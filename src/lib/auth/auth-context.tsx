"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  type User,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInAnonymously,
  linkWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/config";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAnonymous: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => Promise<void>;
  upgradeGuestToGoogle: () => Promise<void>;
  upgradeGuestToEmail: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Firebase not configured — skip auth entirely
      setLoading(false);
      return;
    }

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Set or clear session and UID cookies for server route protection
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const maxAge = 60 * 60 * 24 * 30; // 30 days
          document.cookie = `__session=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `__uid=${firebaseUser.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
        } catch {
          // Token retrieval failed — clear any stale cookies
          document.cookie = "__session=; path=/; max-age=0";
          document.cookie = "__uid=; path=/; max-age=0";
        }
      } else {
        document.cookie = "__session=; path=/; max-age=0";
        document.cookie = "__uid=; path=/; max-age=0";
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available");
      await signInWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available");
      await createUserWithEmailAndPassword(auth, email, password);
    },
    []
  );

  const signInAsGuest = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    await signInAnonymously(auth);
  }, []);

  const upgradeGuestToGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser || !auth.currentUser.isAnonymous) {
      throw new Error("No guest session to upgrade");
    }
    const provider = new GoogleAuthProvider();
    await linkWithCredential(
      auth.currentUser,
      GoogleAuthProvider.credentialFromResult(
        await signInWithPopup(auth, provider)
      )!
    );
  }, []);

  const upgradeGuestToEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser || !auth.currentUser.isAnonymous) {
        throw new Error("No guest session to upgrade");
      }
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(auth.currentUser, credential);
    },
    []
  );

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    await signOut(auth);
    document.cookie = "__session=; path=/; max-age=0";
    document.cookie = "__uid=; path=/; max-age=0";
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    await sendPasswordResetEmail(auth, email);
  }, []);

  const isAnonymous = user?.isAnonymous ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAnonymous,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAsGuest,
        upgradeGuestToGoogle,
        upgradeGuestToEmail,
        logOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}