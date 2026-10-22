import { type CalculateMetadataFunction, staticFile } from "remotion";
import { NARRATION, type SceneId } from "./narration";

// Match the fps on the <Composition> registration.
const COMPOSITION_FPS = 30;
export const TRANSITION_FRAMES = 8;
// Seconds of silence before the voice starts and after its last word, per scene.
export const VOICE_LEAD = 0.15;
const voiceTail = (id: SceneId) => (id === "closing" ? 2.2 : 0.45);

export type Word = { text: string; start: number; end: number };

export type ArabTribesProps = {
  readonly sceneFrames: Record<string, number>;
  readonly words: Record<string, Word[]>;
};

// Each scene lasts as long as its voiceover, but never less than its animation needs.
export const calculateMetadata: CalculateMetadataFunction<
  ArabTribesProps
> = async () => {
  const entries = await Promise.all(
    NARRATION.map(async (scene) => {
      const res = await fetch(staticFile(`voiceover/${scene.id}.json`));
      const words = (await res.json()) as Word[];
      const spoken = words[words.length - 1].end;
      const frames = Math.max(
        Math.round(scene.minSeconds * COMPOSITION_FPS),
        Math.ceil(
          (VOICE_LEAD + spoken + voiceTail(scene.id)) * COMPOSITION_FPS,
        ),
      );
      return { id: scene.id, frames, words };
    }),
  );
  const total =
    entries.reduce((sum, e) => sum + e.frames, 0) -
    TRANSITION_FRAMES * (entries.length - 1);
  return {
    durationInFrames: total,
    props: {
      sceneFrames: Object.fromEntries(entries.map((e) => [e.id, e.frames])),
      words: Object.fromEntries(entries.map((e) => [e.id, e.words])),
    },
  };
};
