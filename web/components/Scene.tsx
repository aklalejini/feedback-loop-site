"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Torchlight, type SceneName } from "./Torchlight";

// Scene = which backdrop the page shows. The dungeon is the default everywhere;
// the cellar swaps in only while a screen asks for it (the batch form). The
// fixed backdrop + the torch-fire canvas both react to the current scene, and a
// descendant screen sets the scene for as long as it's mounted via useScene().

const SCENE_BG: Record<SceneName, { img: string; scrim: [number, number] }> = {
  dungeon: { img: "/bg-dungeon.png", scrim: [0.34, 0.32] },
  // the cellar art is already very dark, so a lighter scrim keeps it from going
  // muddy while still seating the content panels.
  cellar: { img: "/cellar-bg.png", scrim: [0.18, 0.16] },
};

const SceneCtx = createContext<(scene: SceneName) => void>(() => {});

function PageBackground({ scene }: { scene: SceneName }) {
  const { img, scrim } = SCENE_BG[scene];
  return (
    <div
      className="page-bg"
      aria-hidden
      style={{
        backgroundImage: `linear-gradient(rgba(12,9,5,${scrim[0]}), rgba(12,9,5,${scrim[1]})), url("${img}")`,
        backgroundPosition: "center top, center top",
        backgroundSize: "cover, cover",
        backgroundRepeat: "no-repeat, no-repeat",
      }}
    />
  );
}

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [scene, setScene] = useState<SceneName>("dungeon");
  return (
    <SceneCtx.Provider value={setScene}>
      <PageBackground scene={scene} />
      <Torchlight scene={scene} />
      {children}
    </SceneCtx.Provider>
  );
}

// Call inside a screen to make that scene active while the component is mounted;
// it reverts to the dungeon on unmount.
export function useScene(scene: SceneName) {
  const setScene = useContext(SceneCtx);
  useEffect(() => {
    setScene(scene);
    return () => setScene("dungeon");
  }, [scene, setScene]);
}
