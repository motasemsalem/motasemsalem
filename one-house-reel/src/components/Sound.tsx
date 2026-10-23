import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { voiceLead } from "../anim";
import type { SceneId } from "../narration";

export const Voice: React.FC<{ readonly id: SceneId }> = ({ id }) => (
  <Audio
    name={`تعليق: ${id}`}
    src={staticFile(`voiceover/${id}.mp3`)}
    from={Math.round(voiceLead(id))}
  />
);

// A one-shot sound effect starting `at` frames into the scene.
export const Sfx: React.FC<{
  readonly name: string;
  readonly at?: number;
  readonly volume?: number;
}> = ({ name, at = 0, volume = 0.4 }) => (
  <Audio
    name={`مؤثر: ${name}`}
    src={staticFile(`sfx/${name}.wav`)}
    from={Math.max(0, Math.round(at))}
    volume={volume}
  />
);
