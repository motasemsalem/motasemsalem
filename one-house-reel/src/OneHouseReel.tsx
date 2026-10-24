import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { C, cue, section } from "./cues";
import { Columns, Concrete, Foundation, Slab } from "./ad/Build";
import { Closing, Review, Studio } from "./ad/Finale";
import { Backdrop, Finish, Wipe } from "./ad/kit";
import { Brand, Hook, Pain } from "./ad/Open";
import { Flash } from "./overlay/Cine";
import { Sfx } from "./overlay/Sound";
import { Subtitles } from "./overlay/Subtitles";

// Cuts that get the red brand wipe.
const WIPES = [section("pain"), C.brand, C.foundation, C.columns, C.slab, C.concrete, C.review, C.studio, C.closing];

export const OneHouseReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#040f1d" }}>
      <Audio name="التعليق الصوتي" src={staticFile("voiceover/voiceover.mp3")} />
      <Audio name="موسيقى" src={staticFile("music/score.mp3")} durationInFrames={durationInFrames} volume={0.85} />
      <Backdrop />

      <Hook />
      <Pain />
      <Brand />
      <Foundation />
      <Columns />
      <Slab />
      <Concrete />
      <Review />
      <Studio />
      <Closing />

      {WIPES.map((f) => (
        <Wipe key={f} at={f} />
      ))}
      <Flash at={C.notUs} color="#ff2a2a" peak={0.35} length={8} />
      <Flash at={C.brand + 8} peak={0.6} length={12} />
      <Subtitles hidden={(f) => (f >= C.brand - 4 && f < C.foundation) || f >= C.closing - 4} />
      <Finish />
      <SoundDesign />
    </AbsoluteFill>
  );
};

// Sound effects on their cues; they dip under the narrator automatically.
const SoundDesign: React.FC = () => (
  <>
    <Sfx name="mk/impact-deep-whoosh" at={0} volume={0.45} />
    <Sfx name="mk/ui-zoom-in" at={C.wall - 4} volume={0.4} />
    <Sfx name="mk/data-scan" at={C.wall} volume={0.35} />
    <Sfx name="mk/glass-debris-sweep" at={C.paint + 4} volume={0.4} />
    <Sfx name="mk/gravel-fall-hit" at={C.paint + 16} volume={0.35} />
    <Sfx name="mk/bass-hit-short" at={C.base + 2} volume={0.4} />
    {C.pain.map((f) => (
      <Sfx key={f} name="mk/hit-fast-exciting" at={f - 2} volume={0.35} />
    ))}
    <Sfx name="mk/stomp-apocalyptic" at={C.notUs - 2} volume={0.6} />
    <Sfx name="riser" at={C.brand - 40} volume={0.3} />
    <Sfx name="mk/impact-epic-trailer" at={C.brand} volume={0.75} />
    <Sfx name="mk/shimmer-sparkle-sweep" at={C.brand + 8} volume={0.3} />
    <Sfx name="mk/metal-spring-hit" at={C.brick} volume={0.35} />
    {WIPES.slice(2).map((f) => (
      <Sfx key={f} name="mk/whoosh-fast" at={f - 8} volume={0.4} />
    ))}
    <Sfx name="mk/data-compute" at={C.soil} volume={0.25} />
    <Sfx name="mk/bass-hit-short" at={C.footing + 14} volume={0.3} />
    <Sfx name="mk/ui-confirm-tone" at={C.drawings + 8} volume={0.35} />
    <Sfx name="mk/metal-spring-hit" at={C.columns + 6} volume={0.3} />
    <Sfx name="mk/ui-confirm-tone" at={C.bars + 10} volume={0.3} />
    {Array.from({ length: 10 }, (_, i) => (
      <Sfx key={i} name="mk/lock-quick" at={C.stirrups - 4 + Math.round(i * 2.2) + 8} volume={0.12} />
    ))}
    <Sfx name="mk/gear-lock-metallic" at={C.forms} volume={0.3} />
    <Sfx name="mk/sweep-scifi-fast" at={C.level - 2} volume={0.3} />
    <Sfx name="mk/sand-swish" at={C.pour + 2} volume={0.45} />
    <Sfx name="mk/machine-activate-short" at={C.vibrator} volume={0.3} />
    <Sfx name="mk/bass-hit-short" at={C.cubes} volume={0.3} />
    <Sfx name="mk/mech-tech-movement" at={C.lab - 2} volume={0.3} />
    <Sfx name="mk/ui-confirm-tone" at={C.lab + 22} volume={0.3} />
    <Sfx name="mk/water-splash" at={C.cure} volume={0.4} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="mk/ui-select-click" at={C.review + 4 + i * 7} volume={0.3} />
    ))}
    <Sfx name="mk/pen-write-paper" at={C.sign - 2} volume={0.4} />
    <Sfx name="mk/stomp-apocalyptic" at={C.sign + 10} volume={0.3} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="mk/ui-message-pop" at={C.photos - 6 + i * 6} volume={0.3} />
    ))}
    <Sfx name="mk/ui-popup-dry" at={C.studioName - 4} volume={0.35} />
    <Sfx name="mk/ui-select-click" at={C.draw - 2} volume={0.4} />
    {[0, 1, 2, 3].map((i) => (
      <Sfx key={i} name="pop" at={C.draw + 10 + i * 7} volume={0.3} />
    ))}
    <Sfx name="mk/ui-select-click" at={C.exportPdf + 2} volume={0.4} />
    <Sfx name="mk/paper-slide" at={cue("PDF") - 4} volume={0.45} />
    <Sfx name="mk/air-woosh-quick" at={C.send} volume={0.4} />
    <Sfx name="mk/impact-zoom-quick" at={C.free - 2} volume={0.45} />
    <Sfx name="mk/shimmer-sparkle-sweep" at={C.closing + 4} volume={0.3} />
    <Sfx name="mk/ui-confirm-tone" at={C.cta} volume={0.35} />
  </>
);
