"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useWorkspace } from "./store";

/** Loads (and on first sign-in, migrates) the workspace whenever the signed-in user changes. */
export function WorkspaceSync() {
  const { user, loading } = useAuth();
  const load = useWorkspace((s) => s.load);
  const uid = user && !user.isAnonymous ? user.uid : null;

  useEffect(() => {
    if (loading) return;
    void load(uid && user ? { uid, displayName: user.displayName, photoURL: user.photoURL } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the account changes
  }, [uid, loading, load]);

  return null;
}
