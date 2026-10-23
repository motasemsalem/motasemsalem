import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import timeline from "../timeline.json";

// How far a sound effect dips while the narrator speaks, so it never covers a word.
const DUCK = 0.75;

// A one-shot sound effect at an absolute frame.
export const Sfx: React.FC<{
  readonly name: string;
  readonly at: number;
  readonly volume?: number;
}> = ({ name, at, volume = 0.4 }) => {
  const from = Math.max(0, Math.round(at));
  return (
    <Audio
      name={`مؤثر: ${name}`}
      src={staticFile(`sfx/${name}.wav`)}
      from={from}
      volume={(f) => volume * (1 - DUCK * (timeline.voice[from + f] ?? 0))}
    />
  );
};
