import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { pushCut } from "@remotion/transitions/push-cut";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { clamp } from "./anim";
import { Finish } from "./components/Backdrop";
import { Hud } from "./components/Hud";
import { SceneStart } from "./components/Sound";
import { Bathroom } from "./scenes/Bathroom";
import { Brand } from "./scenes/Brand";
import { Closing } from "./scenes/Closing";
import { Columns } from "./scenes/Columns";
import { Finishing } from "./scenes/Finishing";
import { Floors } from "./scenes/Floors";
import { Formwork } from "./scenes/Formwork";
import { Foundation } from "./scenes/Foundation";
import { Hook } from "./scenes/Hook";
import { Stats } from "./scenes/Stats";
import timeline from "./timeline.json";

const F = timeline.frames;
const timing = linearTiming({ durationInFrames: timeline.transitionFrames });

export const OneHouseReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Audio name="التعليق الصوتي" src={staticFile("voiceover/voiceover.mp3")} />
      <Audio
        name="موسيقى"
        src={staticFile("music/score.mp3")}
        durationInFrames={durationInFrames}
        volume={(f) => interpolate(f, [0, durationInFrames - 20, durationInFrames], [0.24, 0.24, 0], clamp)}
      />
      <TransitionSeries>
        <TransitionSeries.Sequence name="الهوك" durationInFrames={F.hook}>
          <SceneStart.Provider value={timeline.starts.hook}>
            <Hook />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence name="اللوجو" durationInFrames={F.brand}>
          <SceneStart.Provider value={timeline.starts.brand}>
            <Brand />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={timing} />
        <TransitionSeries.Sequence name="الأساسات" durationInFrames={F.foundation}>
          <SceneStart.Provider value={timeline.starts.foundation}>
            <Foundation />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence name="الأعمدة" durationInFrames={F.columns}>
          <SceneStart.Provider value={timeline.starts.columns}>
            <Columns />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence name="الشدة الخشب" durationInFrames={F.formwork}>
          <SceneStart.Provider value={timeline.starts.formwork}>
            <Formwork />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence name="الأدوار" durationInFrames={F.floors}>
          <SceneStart.Provider value={timeline.starts.floors}>
            <Floors />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={timing} />
        <TransitionSeries.Sequence name="التشطيب" durationInFrames={F.finishing}>
          <SceneStart.Provider value={timeline.starts.finishing}>
            <Finishing />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />
        <TransitionSeries.Sequence name="وحدات الحمام" durationInFrames={F.bathroom}>
          <SceneStart.Provider value={timeline.starts.bathroom}>
            <Bathroom />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence name="الأرقام" durationInFrames={F.stats}>
          <SceneStart.Provider value={timeline.starts.stats}>
            <Stats />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence name="الختام" durationInFrames={F.closing}>
          <SceneStart.Provider value={timeline.starts.closing}>
            <Closing />
          </SceneStart.Provider>
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Hud />
      <Finish />
    </AbsoluteFill>
  );
};
