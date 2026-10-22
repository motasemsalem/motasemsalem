import { interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, progress } from "../anim";
import {
  DAMIETTA,
  EGYPT,
  LAKE,
  type LonLat,
  NILE,
  project,
  ROSETTA,
  toPath,
} from "../geo";
import { bodyFont, C, headingFont } from "../theme";

const VIEW_W = 1080;
const VIEW_H = 940;

export type CameraKey = {
  readonly frame: number;
  readonly at: LonLat;
  readonly zoom: number;
};
export type Pin = {
  readonly at: LonLat;
  readonly label?: string;
  readonly delay: number;
  readonly color?: string;
  // Where the label sits relative to the dot.
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly big?: boolean;
};
export type Arrow = {
  readonly path: readonly [LonLat, LonLat, LonLat];
  readonly delay: number;
  readonly duration?: number;
  readonly color?: string;
};
export type Region = {
  readonly at: LonLat;
  readonly rx: number;
  readonly ry: number;
  readonly rotate?: number;
  readonly delay: number;
  readonly color?: string;
};

// Samples a quadratic Bézier through three projected points.
const sampleCurve = (path: Arrow["path"]) => {
  const [a, b, c] = path.map(project);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const u = 1 - t;
    pts.push([
      u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
      u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
    ]);
  }
  const lengths = [0];
  for (let i = 1; i < pts.length; i++) {
    lengths.push(
      lengths[i - 1] +
        Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]),
    );
  }
  return { pts, lengths };
};

const ArrowPath: React.FC<{ arrow: Arrow; zoom: number }> = ({
  arrow,
  zoom,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, arrow.delay, arrow.duration ?? 26, easeInOut);
  if (p <= 0) return null;
  const { pts, lengths } = sampleCurve(arrow.path);
  const target = p * lengths[lengths.length - 1];
  const shown = pts.filter((_, i) => lengths[i] <= target);
  const tip = shown[shown.length - 1];
  const prev = shown[Math.max(0, shown.length - 4)];
  const angle =
    (Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) * 180) / Math.PI;
  const color = arrow.color ?? C.gold;
  const d = shown
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt[0]} ${pt[1]}`)
    .join(" ");
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeOpacity={0.25}
        strokeWidth={22 / zoom}
        strokeLinecap="round"
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={7 / zoom}
        strokeLinecap="round"
        strokeDasharray={`${18 / zoom} ${12 / zoom}`}
        strokeDashoffset={-frame * (2.4 / zoom)}
      />
      {shown.length > 3 ? (
        <g
          transform={`translate(${tip[0]} ${tip[1]}) rotate(${angle}) scale(${1 / zoom})`}
        >
          <path d="M 18 0 L -14 -16 L -6 0 L -14 16 Z" fill={color} />
        </g>
      ) : null}
    </g>
  );
};

const LABEL_OFFSET = {
  top: [0, -58],
  bottom: [0, 70],
  left: [-1, 0],
  right: [1, 0],
} as const;

const PinMark: React.FC<{ pin: Pin; zoom: number }> = ({ pin, zoom }) => {
  const frame = useCurrentFrame();
  const local = frame - pin.delay;
  if (local < 0) return null;
  const [x, y] = project(pin.at);
  const pop = interpolate(local, [0, 6, 12], [0, 1.35, 1], clamp);
  const pulse = (local % 40) / 40;
  const color = pin.color ?? C.gold;
  const labelP = progress(frame, pin.delay + 4, 14);
  const fontSize = pin.big ? 46 : 36;
  const textW = (pin.label?.length ?? 0) * fontSize * 0.58 + 44;
  const side = pin.side ?? "top";
  const [ox, oy] = LABEL_OFFSET[side];
  const cx = side === "left" || side === "right" ? ox * (textW / 2 + 34) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / zoom})`}>
      <circle
        r={14 + pulse * 46}
        fill="none"
        stroke={color}
        strokeWidth={3}
        opacity={(1 - pulse) * 0.8}
      />
      <circle r={16 * pop} fill={color} opacity={0.3} />
      <circle r={9 * pop} fill={color} stroke={C.bg} strokeWidth={3} />
      {pin.label ? (
        <g
          opacity={labelP}
          transform={`translate(${cx} ${oy + (1 - labelP) * 16})`}
        >
          <rect
            x={-textW / 2}
            y={-fontSize * 0.85}
            width={textW}
            height={fontSize * 1.6}
            rx={fontSize * 0.5}
            fill="rgba(15,11,9,0.82)"
            stroke={color}
            strokeWidth={2.5}
          />
          <text
            textAnchor="middle"
            y={fontSize * 0.28}
            fontFamily={headingFont}
            fontWeight={700}
            fontSize={fontSize}
            fill={C.text}
            direction="rtl"
          >
            {pin.label}
          </text>
        </g>
      ) : null}
    </g>
  );
};

const RegionGlow: React.FC<{ region: Region }> = ({ region }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, region.delay, 20);
  const [x, y] = project(region.at);
  const color = region.color ?? C.red;
  const breathe = 1 + 0.04 * Math.sin((frame - region.delay) / 8);
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${region.rotate ?? 0}) scale(${p * breathe})`}
      opacity={p}
    >
      <ellipse
        rx={region.rx}
        ry={region.ry}
        fill={`url(#region-${color.slice(1)})`}
      />
      <ellipse
        rx={region.rx}
        ry={region.ry}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="10 8"
        strokeDashoffset={frame * 0.6}
        opacity={0.9}
      />
    </g>
  );
};

// Neighbours and seas, faint context labels in map units.
const CONTEXT: { at: LonLat; text: string }[] = [
  { at: [29.6, 32.6], text: "البحر المتوسط" },
  { at: [36.0, 25.6], text: "البحر الأحمر" },
  { at: [23.0, 27.0], text: "ليبيا" },
  { at: [29.0, 21.0], text: "السودان" },
];

export const EgyptMap: React.FC<{
  readonly camera: readonly CameraKey[];
  readonly pins?: readonly Pin[];
  readonly arrows?: readonly Arrow[];
  readonly regions?: readonly Region[];
  // Frames over which the outline draws itself; 0 shows it immediately.
  readonly drawFrames?: number;
  readonly height?: number;
}> = ({
  camera,
  pins = [],
  arrows = [],
  regions = [],
  drawFrames = 0,
  height = VIEW_H,
}) => {
  const frame = useCurrentFrame();
  const frames = camera.map((k) => k.frame);
  const keyed = (values: number[]) =>
    camera.length === 1
      ? values[0]
      : interpolate(frame, frames, values, { ...clamp, easing: easeInOut });
  const [fx, fy] = project([
    keyed(camera.map((k) => k.at[0])),
    keyed(camera.map((k) => k.at[1])),
  ]);
  const zoom = keyed(camera.map((k) => k.zoom));
  const draw = drawFrames ? progress(frame, 0, drawFrames, easeInOut) : 1;
  const fill = drawFrames ? progress(frame, drawFrames * 0.6, drawFrames) : 1;
  const sw = 1 / zoom;

  return (
    <svg
      width={VIEW_W}
      height={height}
      viewBox={`0 ${(VIEW_H - height) / 2} ${VIEW_W} ${height}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <radialGradient id="land" cx="45%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#523b28" />
          <stop offset="100%" stopColor={C.land} />
        </radialGradient>
        {[C.red, C.gold].map((color) => (
          <radialGradient key={color} id={`region-${color.slice(1)}`}>
            <stop offset="0%" stopColor={color} stopOpacity={0.55} />
            <stop offset="100%" stopColor={color} stopOpacity={0.08} />
          </radialGradient>
        ))}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={6 * sw} />
        </filter>
      </defs>
      <g
        transform={`translate(${VIEW_W / 2} ${VIEW_H / 2}) scale(${zoom}) translate(${-fx} ${-fy})`}
      >
        {[22, 24, 26, 28, 30, 32].map((lat) => (
          <path
            key={`lat${lat}`}
            d={toPath([
              [18, lat],
              [40, lat],
            ])}
            stroke={C.landEdge}
            strokeOpacity={0.07}
            strokeWidth={1.5 * sw}
          />
        ))}
        {[22, 25, 28, 31, 34, 37].map((lon) => (
          <path
            key={`lon${lon}`}
            d={toPath([
              [lon, 18],
              [lon, 35],
            ])}
            stroke={C.landEdge}
            strokeOpacity={0.07}
            strokeWidth={1.5 * sw}
          />
        ))}
        {CONTEXT.map((c) => {
          const [x, y] = project(c.at);
          return (
            <text
              key={c.text}
              x={x}
              y={y}
              textAnchor="middle"
              fontFamily={bodyFont}
              fontSize={30 * sw}
              fill={C.muted}
              opacity={0.45 * fill}
              direction="rtl"
            >
              {c.text}
            </text>
          );
        })}
        <path
          d={toPath(EGYPT, true)}
          fill="url(#land)"
          fillOpacity={fill}
          stroke={C.landEdge}
          strokeWidth={8 * sw}
          strokeOpacity={0.35}
          filter="url(#glow)"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <path
          d={toPath(EGYPT, true)}
          fill="none"
          stroke={C.sand}
          strokeWidth={2.5 * sw}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <g opacity={fill}>
          <path
            d={toPath(LAKE)}
            fill="none"
            stroke={C.nile}
            strokeWidth={16 * sw}
            strokeLinecap="round"
            strokeOpacity={0.55}
          />
          {[NILE, ROSETTA, DAMIETTA].map((river, i) => (
            <path
              key={i}
              d={toPath(river)}
              fill="none"
              stroke={C.nile}
              strokeWidth={4.5 * sw}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </g>
        {regions.map((r, i) => (
          <RegionGlow key={i} region={r} />
        ))}
        {arrows.map((a, i) => (
          <ArrowPath key={i} arrow={a} zoom={zoom} />
        ))}
        {pins.map((p, i) => (
          <PinMark key={i} pin={p} zoom={zoom} />
        ))}
      </g>
    </svg>
  );
};

// Where a place lands inside the map's 1080×940 frame for a fixed camera.
export const toScreen = (at: LonLat, focus: LonLat, zoom: number) => {
  const [x, y] = project(at);
  const [fx, fy] = project(focus);
  return { x: VIEW_W / 2 + (x - fx) * zoom, y: VIEW_H / 2 + (y - fy) * zoom };
};
