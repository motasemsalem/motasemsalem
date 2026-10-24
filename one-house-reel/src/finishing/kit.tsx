import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut } from "../cues";
import { VOICE } from "./cues";
import media from "./media.json";

// Footage for the finishing reel: graded photos with a slow camera move, Mixkit clips, and the cross-dissolve between shots.
// Photos come from scripts/prepare-finishing.py (public/finishing/<name>.jpg, sizes in media.json).

export type Move = "in" | "out" | "left" | "right" | "up" | "down";
// warm: finished interiors · site: work in progress · xray: "inside the wall" scan
export type Look = "warm" | "site" | "xray";

const FILTERS: Record<Look, string> = {
  warm: "contrast(1.06) saturate(1.1) sepia(0.1) brightness(1.03)",
  site: "contrast(1.1) saturate(0.82) brightness(0.96)",
  xray: "grayscale(1) invert(1) contrast(1.45) brightness(0.85) sepia(1) hue-rotate(175deg) saturate(4.5)",
};

// Clips cut by scripts/prepare-finishing.py; `trim` is the in-point in seconds.
const CLIPS: Record<string, { trim: number }> = {
  plumbing: { trim: 2 },
  paint: { trim: 3 },
  tablet: { trim: 0.5 },
};

export type ShotDef = {
  readonly media: string;
  readonly from: number;
  readonly move?: Move;
  readonly look?: Look;
  // Horizontal centre of the crop for wide photos, 0 (left) … 1 (right).
  readonly focus?: number;
};

const FADE = 8;

// The shots play back to back; each one dissolves in over the previous during its first frames.
export const Shots: React.FC<{ readonly shots: readonly ShotDef[]; readonly end: number }> = ({ shots, end }) => (
  <>
    {shots.map((s, i) => {
      const until = i + 1 < shots.length ? shots[i + 1].from + FADE : end;
      return (
        <Sequence key={i} name={`لقطة: ${s.media}`} from={s.from} durationInFrames={until - s.from} layout="none">
          <Shot shot={s} length={until - s.from} first={i === 0} index={i} />
        </Sequence>
      );
    })}
  </>
);

const Shot: React.FC<{ readonly shot: ShotDef; readonly length: number; readonly first: boolean; readonly index: number }> = ({ shot, length, first, index }) => {
  const f = useCurrentFrame();
  const fade = first ? 1 : interpolate(f, [0, FADE], [0, 1], clamp);
  // A slight settle on the cut, so every new shot lands.
  const settle = 1 + 0.05 * (1 - interpolate(f, [0, 14], [0, 1], { ...clamp, easing: easeOut }));
  const look = shot.look ?? "warm";
  return (
    <AbsoluteFill style={{ opacity: fade, overflow: "hidden", backgroundColor: "black" }}>
      <AbsoluteFill style={{ transform: `scale(${settle})` }}>
        {shot.media in CLIPS ? (
          <Video
            name={shot.media}
            src={staticFile(`finishing/${shot.media}.mp4`)}
            trimBefore={Math.round(CLIPS[shot.media].trim * 30)}
            muted
            objectFit="cover"
            style={{ width: "100%", height: "100%", filter: FILTERS[look], transform: `scale(${interpolate(f, [0, length], [1.04, 1.12])})` }}
          />
        ) : (
          <Photo name={shot.media} move={shot.move ?? (["in", "left", "out", "right"] as Move[])[index % 4]} look={look} focus={shot.focus} t={f / length} />
        )}
      </AbsoluteFill>
      <Grade look={look} />
    </AbsoluteFill>
  );
};

type MediaInfo = { file: string; w: number; h: number };
const MEDIA: Record<string, MediaInfo> = media;

// A still with a camera move across it. Wide photos pan, tall ones push in or out.
export const Photo: React.FC<{ readonly name: string; readonly move: Move; readonly look: Look; readonly focus?: number; readonly t: number }> = ({ name, move, look, focus = 0.5, t }) => {
  const m = MEDIA[name];
  if (!m) throw new Error(`No photo "${name}" in media.json`);
  const p = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, t)));
  const zoom = move === "in" ? 1 + 0.12 * p : move === "out" ? 1.12 - 0.12 * p : 1.06;
  const base = Math.max(1080 / m.w, 1920 / m.h);
  const w = m.w * base * zoom;
  const h = m.h * base * zoom;
  const spanX = (w - 1080) / 2;
  const spanY = (h - 1920) / 2;
  // Centre on the focus point, then travel for pans.
  const cx = Math.max(-spanX, Math.min(spanX, (0.5 - focus) * 2 * spanX));
  const travelX = Math.min(spanX * 0.85, 260);
  const travelY = Math.min(spanY * 0.85, 160);
  let dx = cx;
  let dy = 0;
  if (move === "left") dx = Math.max(-spanX, Math.min(spanX, cx + travelX * (1 - 2 * p)));
  if (move === "right") dx = Math.max(-spanX, Math.min(spanX, cx - travelX * (1 - 2 * p)));
  if (move === "up") dy = travelY * (1 - 2 * p);
  if (move === "down") dy = -travelY * (1 - 2 * p);
  return (
    <Img
      src={staticFile(m.file)}
      style={{ position: "absolute", left: (1080 - w) / 2 + dx, top: (1920 - h) / 2 + dy, width: w, height: h, filter: FILTERS[look] }}
    />
  );
};

// Colour wash per look on top of the filter: warm light for interiors, a cooler cast on site, a scan grid on x-ray.
const Grade: React.FC<{ readonly look: Look }> = ({ look }) => {
  if (look === "warm") {
    return <AbsoluteFill style={{ background: "radial-gradient(circle at 20% 15%, rgba(255,190,120,0.22), rgba(255,170,90,0) 55%)", mixBlendMode: "soft-light" }} />;
  }
  if (look === "site") {
    return <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,36,72,0.25), rgba(6,36,72,0.05) 50%, rgba(6,36,72,0.3))", mixBlendMode: "multiply" }} />;
  }
  return (
    <AbsoluteFill
      style={{
        backgroundImage: "linear-gradient(rgba(95,200,255,0.12) 2px, transparent 2px), linear-gradient(90deg, rgba(95,200,255,0.12) 2px, transparent 2px)",
        backgroundSize: "90px 90px",
      }}
    />
  );
};

// Dark at the top and bottom so the logo and headlines read, plus a soft vignette and film grain.
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,10,22,0.55) 0%, rgba(2,10,22,0) 16%, rgba(2,10,22,0) 44%, rgba(2,10,22,0.7) 66%, rgba(2,10,22,0.9) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay" }}>
        <svg width="1080" height="1920">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 30} />
          </filter>
          <rect width="1080" height="1920" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

// A warm streak of light that sweeps across on a transition.
export const LightLeak: React.FC<{ readonly at: number; readonly length?: number }> = ({ at, length = 26 }) => {
  const f = useCurrentFrame();
  if (f < at - 2 || f > at + length) return null;
  const p = interpolate(f, [at, at + length], [0, 1], clamp);
  const o = Math.sin(p * Math.PI);
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(115deg, rgba(255,180,90,0) ${p * 140 - 60}%, rgba(255,200,130,0.85) ${p * 140 - 30}%, rgba(255,240,220,0.95) ${p * 140 - 20}%, rgba(255,160,70,0) ${p * 140 + 10}%)`,
        opacity: o,
        mixBlendMode: "screen",
      }}
    />
  );
};

// How far a sound effect dips while the narrator speaks.
const DUCK = 0.7;

// A one-shot sound effect at an absolute frame ("mk/…" are Mixkit recordings, the rest synthesized).
export const Sfx: React.FC<{ readonly name: string; readonly at: number; readonly volume?: number }> = ({ name, at, volume = 0.4 }) => {
  const from = Math.max(0, Math.round(at));
  return (
    <Audio
      name={`مؤثر: ${name}`}
      src={staticFile(name.startsWith("mk/") ? `sfx/${name}.mp3` : `sfx/${name}.wav`)}
      from={from}
      volume={(f) => volume * (1 - DUCK * (VOICE[from + f] ?? 0))}
    />
  );
};
