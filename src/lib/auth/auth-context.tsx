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
  onIdTokenChanged,
  signInWithPopup,
  linkWithPopup,
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

async function syncSessionCookies(firebaseUser: User | null) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  if (!firebaseUser) {
    document.cookie = `__session=; path=/; max-age=0; SameSite=Lax${secure}`;
    document.cookie = `__uid=; path=/; max-age=0; SameSite=Lax${secure}`;
    return;
  }
  const token = await firebaseUser.getIdTokenResult();
  if (getFirebaseAuth()?.currentUser !== firebaseUser) return;
  // ID tokens expire hourly; don't leave an expired token cookie for 30 days.
  const maxAge = Math.max(0, Math.floor((Date.parse(token.expirationTime) - Date.now()) / 1000));
  document.cookie = `__session=${token.token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `__uid=${firebaseUser.uid}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Firebase not configured — skip auth entirely
      queueMicrotask(() => setLoading(false));
      return;
    }

    let active = true;
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      try {
        await syncSessionCookies(firebaseUser);
      } catch {
        if (auth.currentUser === firebaseUser) await syncSessionCookies(null);
      }
      if (active && auth.currentUser === firebaseUser) {
        setUser(firebaseUser);
        setLoading(false);
      }
    });

    // Keep server cookies current even when the user remains on one page.
    const refreshSession = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try { await currentUser.getIdToken(true); await syncSessionCookies(currentUser); }
      catch { if (auth.currentUser === currentUser) await syncSessionCookies(null); }
    };
    const refresh = window.setInterval(() => { void refreshSession(); }, 45 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === "visible") void refreshSession(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; unsubscribe(); window.clearInterval(refresh); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await syncSessionCookies(result.user);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available");
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncSessionCookies(result.user);
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Auth not available");
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await syncSessionCookies(result.user);
    },
    []
  );

  const signInAsGuest = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    const result = await signInAnonymously(auth);
    await syncSessionCookies(result.user);
  }, []);

  const upgradeGuestToGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth?.currentUser || !auth.currentUser.isAnonymous) {
      throw new Error("No guest session to upgrade");
    }
    const provider = new GoogleAuthProvider();
    const result = await linkWithPopup(auth.currentUser, provider);
    await syncSessionCookies(result.user);
  }, []);

  const upgradeGuestToEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth?.currentUser || !auth.currentUser.isAnonymous) {
        throw new Error("No guest session to upgrade");
      }
      const credential = EmailAuthProvider.credential(email.trim(), password);
      const result = await linkWithCredential(auth.currentUser, credential);
      await syncSessionCookies(result.user);
    },
    []
  );

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    await signOut(auth);
    await syncSessionCookies(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not available");
    await sendPasswordResetEmail(auth, email.trim());
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
