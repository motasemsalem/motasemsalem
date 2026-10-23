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
import { Brand } from "./scenes/Brand";
import { Closing } from "./scenes/Closing";
import { Columns } from "./scenes/Columns";
import { Floors } from "./scenes/Floors";
import { Formwork } from "./scenes/Formwork";
import { Foundation } from "./scenes/Foundation";
import { Hook } from "./scenes/Hook";
import { Process } from "./scenes/Process";
import { Values } from "./scenes/Values";
import timeline from "./timeline.json";

const T = timeline.transitionFrames;
const F = timeline.frames;
const timing = linearTiming({ durationInFrames: T });

export const OneHouseReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Audio
        name="موسيقى"
        src={staticFile("music/score.mp3")}
        durationInFrames={durationInFrames}
        volume={(f) => interpolate(f, [0, durationInFrames - 20, durationInFrames], [0.32, 0.32, 0], clamp)}
      />
      <TransitionSeries>
        <TransitionSeries.Sequence name="الهوك" durationInFrames={F.hook}>
          <Hook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence name="اللوجو" durationInFrames={F.brand}>
          <Brand />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={timing} />
        <TransitionSeries.Sequence name="الأساسات" durationInFrames={F.foundation}>
          <Foundation />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence name="الأعمدة" durationInFrames={F.columns}>
          <Columns />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={timing} />
        <TransitionSeries.Sequence name="الشدة الخشبية" durationInFrames={F.formwork}>
          <Formwork />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={timing} />
        <TransitionSeries.Sequence name="الأدوار" durationInFrames={F.floors}>
          <Floors />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={pushCut()} timing={timing} />
        <TransitionSeries.Sequence name="القيم" durationInFrames={F.values}>
          <Values />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-left" })} timing={timing} />
        <TransitionSeries.Sequence name="المراحل" durationInFrames={F.process}>
          <Process />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence name="الختام" durationInFrames={F.closing}>
          <Closing />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Hud />
      <Finish />
    </AbsoluteFill>
  );
};
