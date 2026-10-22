import { Audio } from "@remotion/media";
import { staticFile, useVideoConfig } from "remotion";
import type { SceneId } from "../narration";
import { VOICE_LEAD } from "../timing";

export const Voice: React.FC<{ readonly id: SceneId }> = ({ id }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name={`تعليق: ${id}`}
      src={staticFile(`voiceover/${id}.mp3`)}
      from={Math.round(VOICE_LEAD * fps)}
    />
  );
};

const LONG_SOUNDS = new Set(["wind"]);

// A one-shot sound effect starting `at` frames into the scene.
export const Sfx: React.FC<{
  readonly name: string;
  readonly at?: number;
  readonly volume?: number;
}> = ({ name, at = 0, volume = 0.5 }) => (
  <Audio
    name={`مؤثر: ${name}`}
    src={staticFile(`sfx/${name}.${LONG_SOUNDS.has(name) ? "mp3" : "wav"}`)}
    from={Math.round(at)}
    volume={volume}
  />
);
