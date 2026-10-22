import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Fragment } from "react";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { clamp } from "./anim";
import type { SceneId } from "./narration";
import { NARRATION } from "./narration";
import { Voice } from "./components/Sound";
import {
  AbabdaScene,
  CanalScene,
  ClosingScene,
  ConquestScene,
  CustomsScene,
  HilalScene,
  IntroScene,
  MiddleScene,
  QaysScene,
  SaeedScene,
  type SceneProps,
  SinaiNorthScene,
  SinaiSouthScene,
  SiraScene,
  SouthScene,
  WestScene,
} from "./scenes";
import { type ArabTribesProps, TRANSITION_FRAMES } from "./timing";

const SCENES: Record<SceneId, React.FC<SceneProps>> = {
  intro: IntroScene,
  conquest: ConquestScene,
  qays: QaysScene,
  hilal: HilalScene,
  sira: SiraScene,
  saeed: SaeedScene,
  south: SouthScene,
  ababda: AbabdaScene,
  sinaiNorth: SinaiNorthScene,
  sinaiSouth: SinaiSouthScene,
  canal: CanalScene,
  west: WestScene,
  middle: MiddleScene,
  customs: CustomsScene,
  closing: ClosingScene,
};

export const ArabTribes: React.FC<ArabTribesProps> = ({
  sceneFrames,
  words,
}) => {
  const { durationInFrames } = useVideoConfig();
  return (
    <>
      <Audio
        name="موسيقى"
        src={staticFile("music/beat.mp3")}
        durationInFrames={durationInFrames}
        volume={(f) =>
          interpolate(
            f,
            [0, 15, durationInFrames - 60, durationInFrames],
            [0, 0.2, 0.2, 0],
            clamp,
          )
        }
      />
      <TransitionSeries>
        {NARRATION.map((scene, i) => {
          const Scene = SCENES[scene.id];
          return (
            <Fragment key={scene.id}>
              {/* Fast cuts, alternating a wipe from the right (Arabic reads right to left) with a vertical push. */}
              {i > 0 ? (
                i % 2 ? (
                  <TransitionSeries.Transition
                    presentation={wipe({ direction: "from-right" })}
                    timing={linearTiming({
                      durationInFrames: TRANSITION_FRAMES,
                    })}
                  />
                ) : (
                  <TransitionSeries.Transition
                    presentation={slide({ direction: "from-bottom" })}
                    timing={linearTiming({
                      durationInFrames: TRANSITION_FRAMES,
                    })}
                  />
                )
              ) : null}
              <TransitionSeries.Sequence
                name={scene.id}
                durationInFrames={sceneFrames[scene.id]}
              >
                <Scene words={words[scene.id]} index={i} />
                <Voice id={scene.id} />
              </TransitionSeries.Sequence>
            </Fragment>
          );
        })}
      </TransitionSeries>
    </>
  );
};
