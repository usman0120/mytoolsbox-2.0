"use client";

import "@excalidraw/excalidraw/index.css";
import { useMemo, useRef } from "react";
import { Excalidraw, MainMenu, WelcomeScreen } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI, ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";
import { kvGet, kvSet } from "@/lib/storage/idb-kv";


export const WHITEBOARD_KEY = "diagram:whiteboard";

export default function Whiteboard({ dark, onApi }: { dark: boolean; onApi: (api: ExcalidrawImperativeAPI) => void }) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initial = useMemo(() => kvGet<ExcalidrawInitialDataState>(WHITEBOARD_KEY).then((d) => d ?? null), []);

  return (
    <Excalidraw
      excalidrawAPI={onApi}
      initialData={initial}
      theme={dark ? "dark" : "light"}
      UIOptions={{ canvasActions: { toggleTheme: false, changeViewBackgroundColor: true } }}
      onChange={(elements, appState, files) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          void kvSet(WHITEBOARD_KEY, {
            elements: elements.filter((e) => !e.isDeleted),
            appState: { viewBackgroundColor: appState.viewBackgroundColor, gridSize: appState.gridSize, scrollX: appState.scrollX, scrollY: appState.scrollY, zoom: appState.zoom },
            files,
          });
        }, 800);
      }}
    >
      <MainMenu>
        <MainMenu.DefaultItems.LoadScene />
        <MainMenu.DefaultItems.SaveToActiveFile />
        <MainMenu.DefaultItems.Export />
        <MainMenu.DefaultItems.SaveAsImage />
        <MainMenu.DefaultItems.SearchMenu />
        <MainMenu.DefaultItems.Help />
        <MainMenu.DefaultItems.ClearCanvas />
        <MainMenu.Separator />
        <MainMenu.DefaultItems.ChangeCanvasBackground />
      </MainMenu>
      <WelcomeScreen>
        <WelcomeScreen.Hints.ToolbarHint />
        <WelcomeScreen.Hints.MenuHint />
        <WelcomeScreen.Center>
          <WelcomeScreen.Center.Heading>Draw boxes, arrows and notes. Everything saves in this browser.</WelcomeScreen.Center.Heading>
        </WelcomeScreen.Center>
      </WelcomeScreen>
    </Excalidraw>
  );
}
