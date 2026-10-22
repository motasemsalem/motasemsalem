import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { clamp } from "../anim";
import type { SceneId } from "../narration";
import { voiceLeadSeconds } from "../voiceover";

export const Voice: React.FC<{ readonly id: SceneId }> = ({ id }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio
      name={`تعليق: ${id}`}
      src={staticFile(`voiceover/${id}.mp3`)}
      from={Math.round(voiceLeadSeconds(id) * fps)}
    />
  );
};

const LONG_SOUNDS = new Set(["crackle", "wind", "gears"]);
const sfxFile = (name: string) =>
  staticFile(`sfx/${name}.${LONG_SOUNDS.has(name) ? "mp3" : "wav"}`);

// A one-shot sound effect starting `at` frames into the scene.
export const Sfx: React.FC<{
  readonly name: string;
  readonly at?: number;
  readonly volume?: number;
}> = ({ name, at = 0, volume = 0.5 }) => (
  <Audio
    name={`مؤثر: ${name}`}
    src={sfxFile(name)}
    from={Math.round(at)}
    volume={volume}
  />
);

// A looping ambience that fades in and out over the rest of the scene.
export const Ambience: React.FC<{
  readonly name: string;
  readonly at?: number;
  readonly volume?: number;
}> = ({ name, at = 0, volume = 0.35 }) => {
  const { durationInFrames } = useVideoConfig();
  const length = durationInFrames - at;
  return (
    <Audio
      name={`خلفية: ${name}`}
      src={sfxFile(name)}
      from={at}
      durationInFrames={length}
      loop
      volume={(f) =>
        interpolate(
          f,
          [0, 20, length - 25, length],
          [0, volume, volume, 0],
          clamp,
        )
      }
    />
  );
};
