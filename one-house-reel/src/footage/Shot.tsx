import { chromaticAberration } from "@remotion/effects/chromatic-aberration";
import { colorCorrection } from "@remotion/effects/color-correction";
import { glow } from "@remotion/effects/glow";
import { invert } from "@remotion/effects/invert";
import { lut } from "@remotion/effects/lut";
import { noise } from "@remotion/effects/noise";
import { thermalVision } from "@remotion/effects/thermal-vision";
import { vignette } from "@remotion/effects/vignette";
import { zoomBlur } from "@remotion/effects/zoom-blur";
import { Video } from "@remotion/media";
import type { EffectDescriptor } from "remotion";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, easeOut, rand } from "../cues";
import { FILM_LUT } from "../grade/lut";
import shots from "../shots.json";

export type ShotInfo = (typeof shots)[number];
export const SHOTS: readonly ShotInfo[] = shots;
export const shot = (name: string) => {
  const s = SHOTS.find((x) => x.name === name);
  if (!s) throw new Error(`No shot "${name}"`);
  return s;
};

// How each shot is coloured. Everything shares the film LUT; looks shift temperature and contrast per scene.
export type Look = "film" | "warm" | "cold" | "night" | "xray" | "clean";
const LOOKS: Record<Exclude<Look, "xray">, Parameters<typeof colorCorrection>[0]> = {
  film: { contrast: 1.06, saturation: 0.95, vibrance: 0.1, highlights: -0.12, shadows: -0.04 },
  warm: { contrast: 1.1, saturation: 1.05, temperature: 0.22, highlights: -0.1, shadows: -0.06 },
  cold: { contrast: 1.08, saturation: 0.8, temperature: -0.35, tint: 0.03, highlights: -0.05, exposure: -0.1 },
  night: { contrast: 1.12, saturation: 0.85, temperature: -0.1, exposure: -0.35, shadows: -0.1 },
  clean: { contrast: 1.04, saturation: 1.0, vibrance: 0.12, highlights: -0.15, exposure: 0.05 },
};

// "Inside the wall": a scanned, blueprint-blue negative of the footage.
export const XRAY: EffectDescriptor<unknown>[] = [
  colorCorrection({ saturation: 0, contrast: 1.35 }),
  invert({}),
  thermalVision({ palette: ["#01050d", "#06244a", "#1b6fc0", "#6cc8ff", "#e8f8ff"] }),
  glow({ radius: 14, intensity: 0.8, threshold: 0.55, color: "#5fc8ff" }),
];

export type Move = "in" | "out" | "left" | "right" | "up" | "down";

export type ShotStyle = {
  readonly look?: Look;
  readonly move?: Move;
  // Cut-in energy: 0 = plain cut, 1 = punch-in with zoom blur and a fringe of chromatic aberration.
  readonly punch?: number;
  // Extra frames to keep playing past the next shot's start (for a dissolve or an effect on top).
  readonly tail?: number;
  // Optional extra effects (evaluated per frame of the shot).
  readonly effects?: (f: number, len: number) => EffectDescriptor<unknown>[];
  // Optional wrapper style per frame of the shot (e.g. a clip-path reveal).
  readonly wrap?: (f: number) => React.CSSProperties;
};

const MOVES: Move[] = ["in", "left", "right", "in", "up", "out"];

// One shot of footage: graded, with a slow camera drift and an optional punch-in on the cut.
export const Shot: React.FC<{ readonly name: string; readonly style?: ShotStyle; readonly index: number }> = ({ name, style = {}, index }) => {
  const s = shot(name);
  const tail = style.tail ?? 0;
  return (
    <Sequence name={`لقطة: ${name}`} from={s.from} durationInFrames={s.frames + tail} layout="none">
      <ShotFrame s={s} style={style} index={index} length={s.frames + tail} />
    </Sequence>
  );
};

const ShotFrame: React.FC<{ readonly s: ShotInfo; readonly style: ShotStyle; readonly index: number; readonly length: number }> = ({ s, style, index, length }) => {
  const f = useCurrentFrame();
  const move = style.move ?? MOVES[index % MOVES.length];
  const punch = style.punch ?? 0.6;
  const t = f / Math.max(1, length);
  // Camera drift over the whole shot.
  const drift = 40;
  const zoom = move === "out" ? interpolate(t, [0, 1], [1.16, 1.06]) : move === "in" ? interpolate(t, [0, 1], [1.05, 1.15]) : 1.1;
  const dx = move === "left" ? interpolate(t, [0, 1], [drift, -drift]) : move === "right" ? interpolate(t, [0, 1], [-drift, drift]) : 0;
  const dy = move === "up" ? interpolate(t, [0, 1], [drift, -drift]) : move === "down" ? interpolate(t, [0, 1], [-drift, drift]) : 0;
  // Punch-in on the cut: starts a little closer and settles.
  const settle = interpolate(f, [0, 9], [1, 0], { ...clamp, easing: easeOut });
  const scale = zoom * (1 + 0.1 * punch * settle);
  // Handheld micro-shake, deterministic.
  const shake = (k: number) => (Math.sin(f * 0.21 + index * 3 + k) + Math.sin(f * 0.13 + index + k * 2) * 0.6) * 2.2;
  const look = style.look ?? "film";
  const blurAmt = punch * settle * 70;
  const effects: EffectDescriptor<unknown>[] = [
    ...(look === "xray" ? XRAY : [colorCorrection(LOOKS[look]), lut({ content: FILM_LUT })]),
    ...(blurAmt > 1 ? [zoomBlur({ amount: blurAmt, samples: 16 })] : []),
    ...(punch * settle > 0.05 ? [chromaticAberration({ amount: punch * settle * 0.012 })] : []),
    ...(style.effects ? style.effects(f, length) : []),
    vignette({ amount: 0.45, radius: 0.62 }),
    noise({ amount: 0.06, seed: (f + index * 31) % 97 }),
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "black", ...style.wrap?.(f) }}>
      <AbsoluteFill style={{ transform: `translate(${dx + shake(0)}px, ${dy + shake(5)}px) scale(${scale})` }}>
        <Video
          name={s.name}
          src={staticFile(s.file)}
          trimBefore={s.pre}
          muted
          effects={effects}
          style={{ width: "100%", height: "100%" }}
          objectFit="cover"
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const shotRand = (name: string) => rand(SHOTS.findIndex((x) => x.name === name) + 1);
