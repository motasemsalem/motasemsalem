import { Audio } from "@remotion/media";
import { createContext, useContext } from "react";
import { staticFile } from "remotion";
import timeline from "../timeline.json";

// Absolute frame where the current scene starts; set by OneHouseReel around each scene.
export const SceneStart = createContext(0);

// How far a sound effect dips while the narrator speaks, so it never covers a word.
const DUCK = 0.75;

// A one-shot sound effect starting `at` frames into the scene.
export const Sfx: React.FC<{
  readonly name: string;
  readonly at?: number;
  readonly volume?: number;
}> = ({ name, at = 0, volume = 0.4 }) => {
  const sceneStart = useContext(SceneStart);
  const from = Math.max(0, Math.round(at));
  return (
    <Audio
      name={`مؤثر: ${name}`}
      src={staticFile(`sfx/${name}.wav`)}
      from={from}
      volume={(f) => volume * (1 - DUCK * (timeline.voice[sceneStart + from + f] ?? 0))}
    />
  );
};
