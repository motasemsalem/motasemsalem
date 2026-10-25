import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, pop } from "../cues";
import { BRAND, headingFont } from "../theme";
import { VOICE } from "./cues";
import media from "./media.json";

// Footage for the finishing reel: Pexels clips with a slow push, and the
// dissolve between shots. Files come from scripts/prepare-finishing.py (public/finishing, sizes in media.json).
// The camera barely moves and every shot holds for a whole phrase, so the viewer has time to take it in.

export type Move = "in" | "out";
// warm: finished interiors · site: work in progress · xray: "inside the wall" scan
export type Look = "warm" | "site" | "xray";

const FILTERS: Record<Look, string> = {
  warm: "contrast(1.04) saturate(1.06) sepia(0.06) brightness(1.02)",
  site: "contrast(1.06) saturate(0.9) brightness(0.98)",
  xray: "grayscale(1) invert(1) contrast(1.45) brightness(0.85) sepia(1) hue-rotate(175deg) saturate(4.5)",
};

export type ShotDef = {
  readonly media: string;
  readonly from: number;
  readonly move?: Move;
  readonly look?: Look;
  // Centre of the crop, 0 … 1 across (x) and down (y).
  readonly focus?: number;
  readonly focusY?: number;
};

const FADE = 14;
// How far the camera pushes over a shot.
const PUSH = 0.045;

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
  const fade = first ? 1 : interpolate(f, [0, FADE], [0, 1], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const look = shot.look ?? "warm";
  return (
    <AbsoluteFill style={{ opacity: fade, overflow: "hidden", backgroundColor: "black" }}>
      <Media name={shot.media} move={shot.move ?? (index % 2 ? "out" : "in")} look={look} focus={shot.focus} focusY={shot.focusY} t={f / length} />
      <Grade look={look} />
    </AbsoluteFill>
  );
};

type MediaInfo = { file: string; w: number; h: number };
const MEDIA: Record<string, MediaInfo> = media;

// A clip covering a box (the frame by default), with a slow push in or out.
export const Media: React.FC<{
  readonly name: string;
  readonly move: Move;
  readonly look: Look;
  readonly focus?: number;
  readonly focusY?: number;
  readonly t: number;
  readonly width?: number;
  readonly height?: number;
}> = ({ name, move, look, focus = 0.5, focusY = 0.5, t, width = 1080, height = 1920 }) => {
  const m = MEDIA[name];
  if (!m) throw new Error(`No media "${name}" in media.json`);
  const p = Easing.inOut(Easing.sin)(Math.min(1, Math.max(0, t)));
  const zoom = move === "in" ? 1 + PUSH * p : 1 + PUSH * (1 - p);
  const base = Math.max(width / m.w, height / m.h);
  const w = m.w * base * zoom;
  const h = m.h * base * zoom;
  // Keep the focus point in the middle of the box, without showing past the edges.
  const left = Math.min(0, Math.max(width - w, width / 2 - focus * w));
  const top = Math.min(0, Math.max(height - h, height / 2 - focusY * h));
  const style: React.CSSProperties = { position: "absolute", left, top, width: w, height: h, filter: FILTERS[look] };
  return <Video name={name} src={staticFile(m.file)} muted style={style} />;
};

// Colour wash per look on top of the filter: warm light for interiors, a cooler cast on site, a scan grid on x-ray.
const Grade: React.FC<{ readonly look: Look }> = ({ look }) => {
  if (look === "warm") {
    return <AbsoluteFill style={{ background: "radial-gradient(circle at 20% 15%, rgba(255,190,120,0.16), rgba(255,170,90,0) 55%)", mixBlendMode: "soft-light" }} />;
  }
  if (look === "site") {
    return <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(6,36,72,0.18), rgba(6,36,72,0.02) 50%, rgba(6,36,72,0.22))", mixBlendMode: "multiply" }} />;
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

export type PanelDef = { readonly media: string; readonly at: number; readonly label: string; readonly focus?: number; readonly focusY?: number };

// A list section as a split screen: the frame is cut into one band per item, and each band slides in on its
// word with its own clip and label, so every item gets a picture and the screen stays calm.
export const Panels: React.FC<{ readonly from: number; readonly to: number; readonly heading: string; readonly rows: readonly PanelDef[] }> = ({ from, to, heading, rows }) => {
  const f = useCurrentFrame();
  if (f < from - 2 || f > to + 2) return null;
  const top = 300;
  const gap = 8;
  const bandH = (1920 - top - gap * (rows.length - 1)) / rows.length;
  // Gone by the time the next section's title comes in.
  const out = interpolate(f, [to - 6, to + 2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: BRAND.deep, opacity: pop(f, from - 2, 10) }} />
      <div dir="rtl" style={{ position: "absolute", top: 160, left: 0, right: 0, textAlign: "center", fontFamily: headingFont, fontWeight: 800, fontSize: 76, color: "white", opacity: pop(f, from - 2, 14, easeOut), transform: `translateY(${(1 - pop(f, from - 2, 14, easeOut)) * 24}px)` }}>
        {heading}
      </div>
      {rows.map((r, i) => {
        const p = pop(f, r.at - 4, 16, easeOut);
        const y = top + i * (bandH + gap);
        return (
          <Sequence key={r.media} from={r.at - 4} durationInFrames={to + FADE - r.at + 4} layout="none">
            <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: bandH, overflow: "hidden", opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
              <PanelClip row={r} height={bandH} length={to + FADE - r.at} />
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: bandH * 0.55, background: "linear-gradient(180deg, rgba(2,10,22,0), rgba(2,10,22,0.75))" }} />
              <div dir="rtl" style={{ position: "absolute", right: 48, bottom: 30, display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 14, height: 54, borderRadius: 7, background: BRAND.red }} />
                <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: rows.length > 3 ? 64 : 72, color: "white", textShadow: "0 3px 16px rgba(0,0,0,0.6)" }}>{r.label}</div>
              </div>
            </div>
          </Sequence>
        );
      })}
      {/* Thin gold rules between the bands. */}
      {rows.slice(1).map((r, i) => (
        <div key={r.media} style={{ position: "absolute", left: 0, right: 0, top: top + (i + 1) * (bandH + gap) - gap, height: gap, background: "linear-gradient(90deg, rgba(232,197,138,0), rgba(232,197,138,0.8), rgba(232,197,138,0))", opacity: pop(f, r.at - 4, 12) }} />
      ))}
    </AbsoluteFill>
  );
};

const PanelClip: React.FC<{ readonly row: PanelDef; readonly height: number; readonly length: number }> = ({ row, height, length }) => {
  const f = useCurrentFrame();
  return <Media name={row.media} move="in" look="warm" focus={row.focus} focusY={row.focusY} t={f / length} width={1080} height={height} />;
};

// Dark at the top and bottom so the logo and headlines read, plus a soft vignette and film grain.
export const Finish: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,10,22,0.5) 0%, rgba(2,10,22,0) 14%, rgba(2,10,22,0) 48%, rgba(2,10,22,0.65) 68%, rgba(2,10,22,0.88) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.05, mixBlendMode: "overlay" }}>
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
export const LightLeak: React.FC<{ readonly at: number; readonly length?: number }> = ({ at, length = 34 }) => {
  const f = useCurrentFrame();
  if (f < at - 2 || f > at + length) return null;
  const p = interpolate(f, [at, at + length], [0, 1], clamp);
  const o = Math.sin(p * Math.PI) * 0.75;
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
// `voice` is the reel's narrator envelope (the finishing reel's by default).
export const Sfx: React.FC<{ readonly name: string; readonly at: number; readonly volume?: number; readonly voice?: readonly number[] }> = ({ name, at, volume = 0.4, voice = VOICE }) => {
  const from = Math.max(0, Math.round(at));
  return (
    <Audio
      name={`مؤثر: ${name}`}
      src={staticFile(name.startsWith("mk/") ? `sfx/${name}.mp3` : `sfx/${name}.wav`)}
      from={from}
      volume={(f) => volume * (1 - DUCK * (voice[from + f] ?? 0))}
    />
  );
};

