import { Audio } from "@remotion/media";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { C, clamp, rand } from "./cues";
import { BrandMark, CutFlash, EndCard, Finish, Rewind, Sky, Subtitles } from "./overlay/Overlays";
import { Sfx } from "./overlay/Sound";
import { Story } from "./overlay/Story";
import { lightAt, World } from "./world/World";

export const OneHouseReel: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const l = lightAt(frame);
  const top = l.sky.clone().multiplyScalar(0.55).getStyle();
  const horizon = new THREE.Color(l.fog).lerp(l.sky, 0.3).getStyle();
  const stars = Math.max(interpolate(frame, [0, C.rewind], [0.35, 0.2], clamp) * (frame < C.brand ? 1 : 0), interpolate(frame, [C.closing, C.closing + 90], [0, 1], clamp));
  // Tape jitter while rewinding.
  const rewinding = frame >= C.rewind && frame < C.brand;
  const jitter = rewinding ? `translate(${(rand(frame) - 0.5) * 18}px, ${(rand(frame + 3) - 0.5) * 10}px) skewX(${(rand(frame + 7) - 0.5) * 4}deg)` : "none";
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Audio name="التعليق الصوتي" src={staticFile("voiceover/voiceover.mp3")} />
      <Audio
        name="موسيقى"
        src={staticFile("music/score.mp3")}
        durationInFrames={durationInFrames}
        volume={(f) => interpolate(f, [0, durationInFrames - 20, durationInFrames], [0.24, 0.24, 0], clamp)}
      />
      <Sky top={top} horizon={horizon} stars={stars} />
      <AbsoluteFill style={{ transform: jitter }}>
        <ThreeCanvas width={width} height={height} shadows gl={{ alpha: true, antialias: true }} camera={{ fov: 40, position: [0, 10, 20] }}>
          <World />
        </ThreeCanvas>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.55) 0%, transparent 26%, transparent 70%, rgba(2,13,28,0.7) 100%)" }} />
      <Story />
      <Subtitles hidden={(f) => (f >= C.brand - 4 && f < C.start) || f >= C.closing} />
      <Rewind />
      <BrandMark />
      <EndCard />
      <CutFlash />
      <Finish />
      <SoundDesign />
    </AbsoluteFill>
  );
};

// One-shot effects, each on its cue; they duck under the narrator automatically.
const SoundDesign: React.FC = () => (
  <>
    <Sfx name="subdrop" at={0} volume={0.45} />
    <Sfx name="stamp" at={C.flat} volume={0.4} />
    <Sfx name="riser" at={C.inside - 10} volume={0.3} />
    <Sfx name="glitch" at={C.inside} volume={0.25} />
    <Sfx name="blip" at={C.steel} volume={0.4} />
    <Sfx name="blip" at={C.concrete} volume={0.4} />
    <Sfx name="whoosh" at={C.base - 4} volume={0.4} />
    <Sfx name="glitch" at={C.rewind} volume={0.4} />
    <Sfx name="riser" at={C.rewind} volume={0.45} />
    <Sfx name="impact" at={C.brand} volume={0.6} />
    <Sfx name="chime" at={C.brandName} volume={0.25} />
    <Sfx name="whoosh" at={C.start - 6} volume={0.35} />
    <Sfx name="hammer" at={C.dig} volume={0.3} />
    <Sfx name="subdrop" at={C.dig + 4} volume={0.3} />
    <Sfx name="pop" at={C.lean} volume={0.35} />
    <Sfx name="impact" at={C.footings + 6} volume={0.3} />
    <Sfx name="typing" at={C.calc} volume={0.2} />
    <Sfx name="whoosh" at={C.strong - 8} volume={0.3} />
    <Sfx name="riser" at={C.columns - 14} volume={0.25} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <Sfx key={`h${i}`} name="hammer" at={C.rebar + 6 + i * 10} volume={0.14} />
    ))}
    <Sfx name="blip" at={C.check} volume={0.35} />
    <Sfx name="blip" at={C.check + 14} volume={0.3} />
    <Sfx name="subdrop" at={C.pourColumns} volume={0.3} />
    <Sfx name="whoosh" at={C.formwork - 6} volume={0.3} />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <Sfx key={`p${i}`} name="hammer" at={C.props + i * 6} volume={0.15} />
    ))}
    <Sfx name="whoosh" at={C.posts - 8} volume={0.35} />
    <Sfx name="blip" at={C.level} volume={0.35} />
    <Sfx name="subdrop" at={C.pourSlab} volume={0.3} />
    <Sfx name="chime" at={C.flatSlab + 4} volume={0.25} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={`f${i}`} name="impact" at={C.floors + 6 + i * 22} volume={0.18} />
    ))}
    <Sfx name="whoosh" at={C.cold - 6} volume={0.3} />
    <Sfx name="impact" at={C.bone} volume={0.35} />
    {[C.plumbing, C.electric, C.insulation, C.plaster, C.marble, C.paint].map((f) => (
      <Sfx key={`t${f}`} name="pop" at={f - 2} volume={0.35} />
    ))}
    <Sfx name="riser" at={C.design - 16} volume={0.25} />
    <Sfx name="glitch" at={C.design} volume={0.2} />
    <Sfx name="chime" at={C.see} volume={0.2} />
    <Sfx name="whoosh" at={C.bath + 2} volume={0.45} />
    <Sfx name="swoosh" at={C.units} volume={0.3} />
    <Sfx name="stamp" at={C.warranty + 2} volume={0.55} />
    <Sfx name="whoosh" at={C.stats - 12} volume={0.4} />
    <Sfx name="typing" at={C.projects - 6} volume={0.22} />
    <Sfx name="impact" at={C.projectsEnd + 10} volume={0.3} />
    <Sfx name="typing" at={C.years} volume={0.2} />
    <Sfx name="pop" at={C.contracts + 3} volume={0.35} />
    <Sfx name="pop" at={C.deadlines + 3} volume={0.35} />
    <Sfx name="whoosh" at={C.follow - 6} volume={0.4} />
    {[0, 1, 2].map((i) => (
      <Sfx key={`n${i}`} name="blip" at={C.follow + 6 + i * 9} volume={0.3} />
    ))}
    <Sfx name="impact" at={C.closing} volume={0.5} />
    <Sfx name="keys" at={C.key} volume={0.35} />
    <Sfx name="pop" at={C.cta - 4} volume={0.35} />
    <Sfx name="chime" at={C.right} volume={0.3} />
  </>
);
