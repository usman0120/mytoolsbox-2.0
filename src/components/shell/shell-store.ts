"use client";

import { create } from "zustand";

interface ShellState {
  askOpen: boolean;
  /** Text to pre-fill when the Ask palette opens (e.g. from the home page hero). */
  askQuery: string;
  openAsk: (query?: string) => void;
  trayOpen: boolean;
  spacesOpen: boolean;
  signInOpen: boolean;
  setAsk: (open: boolean) => void;
  setTray: (open: boolean) => void;
  setSpaces: (open: boolean) => void;
  setSignIn: (open: boolean) => void;
}

export const useShell = create<ShellState>((set) => ({
  askOpen: false,
  askQuery: "",
  openAsk: (query = "") => set({ askOpen: true, askQuery: query }),
  trayOpen: false,
  spacesOpen: false,
  signInOpen: false,
  setAsk: (askOpen) => set({ askOpen }),
  setTray: (trayOpen) => set({ trayOpen }),
  setSpaces: (spacesOpen) => set({ spacesOpen }),
  setSignIn: (signInOpen) => set({ signInOpen }),
}));
