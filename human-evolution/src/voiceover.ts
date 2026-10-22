import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { type CalculateMetadataFunction, staticFile } from "remotion";
import { NARRATION, type SceneId } from "./narration";

// Match the fps on the <Composition> registration.
const COMPOSITION_FPS = 30;
export const TRANSITION_FRAMES = 15;

export type HumanEvolutionProps = {
  readonly sceneFrames: Record<string, number>;
};

// Seconds of silence before the voice starts and after it ends, per scene.
export const voiceLeadSeconds = (id: SceneId) => (id === "intro" ? 1 : 0.6);
const voiceTailSeconds = (id: SceneId) => (id === "closing" ? 2.5 : 1.1);

const getAudioDuration = async (src: string) => {
  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(src) });
  try {
    return await input.computeDuration();
  } finally {
    input.dispose();
  }
};

// Each scene lasts as long as its voiceover (plus breathing room), but never less than its animation needs.
export const calculateMetadata: CalculateMetadataFunction<
  HumanEvolutionProps
> = async () => {
  const entries = await Promise.all(
    NARRATION.map(async (scene) => {
      const seconds = await getAudioDuration(
        staticFile(`voiceover/${scene.id}.mp3`),
      );
      const needed = Math.ceil(
        (voiceLeadSeconds(scene.id) + seconds + voiceTailSeconds(scene.id)) *
          COMPOSITION_FPS,
      );
      return [
        scene.id,
        Math.max(Math.round(scene.minSeconds * COMPOSITION_FPS), needed),
      ] as const;
    }),
  );
  const sceneFrames = Object.fromEntries(entries);
  const total =
    entries.reduce((sum, [, frames]) => sum + frames, 0) -
    TRANSITION_FRAMES * (entries.length - 1);
  return { durationInFrames: total, props: { sceneFrames } };
};
