"use client";

import { create } from "zustand";

interface ShellState {
  askOpen: boolean;
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
  trayOpen: false,
  spacesOpen: false,
  signInOpen: false,
  setAsk: (askOpen) => set({ askOpen }),
  setTray: (trayOpen) => set({ trayOpen }),
  setSpaces: (spacesOpen) => set({ spacesOpen }),
  setSignIn: (signInOpen) => set({ signInOpen }),
}));
