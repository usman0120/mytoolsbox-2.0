"use client";

import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getItem, saveItem, updateItem, type SavedItem } from "./store";

/**
 * Editor ↔ account bridge: opens `?item=<id>` once signed in and saves back to the same item.
 * Signed-out users keep working locally (autosave); saving asks them to sign in.
 */
export function useSavedItem(kind: SavedItem["kind"], toolId: string, onOpen: (content: string, title: string) => void) {
  const { user } = useAuth();
  const [itemId, setItemId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const opened = useRef(false);
  const open = useEffectEvent(onOpen);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("item");
    if (!id || !user || opened.current) return;
    opened.current = true;
    getItem(user.uid, id)
      .then((item) => {
        if (!item || item.kind !== kind) return toast.error("That saved item couldn't be found.");
        setItemId(item.id);
        open(item.content, item.title);
      })
      .catch(() => toast.error("Couldn't open the saved item."));
  }, [user, kind]);

  const save = useCallback(
    async (title: string, content: string) => {
      if (!user) return toast("Sign in to save to your account", { description: "Your work is already kept in this browser." });
      setSaving(true);
      try {
        if (itemId) await updateItem(user.uid, itemId, { title, content });
        else setItemId(await saveItem(user.uid, { kind, title, toolId, content }));
        toast.success("Saved to your account");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save.");
      } finally {
        setSaving(false);
      }
    },
    [user, itemId, kind, toolId],
  );

  return { save, saving, signedIn: !!user };
}
