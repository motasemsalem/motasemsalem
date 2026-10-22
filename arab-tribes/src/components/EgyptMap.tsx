import type { ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { clamp, easeInOut, progress } from "../anim";
import {
  CANAL,
  CITIES,
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
// How thick the extruded land slab looks, in screen pixels.
const DEPTH = 26;

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
export const sampleCurve = (path: Arrow["path"]) => {
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
        strokeWidth={24 / zoom}
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
          <circle r={26} fill={color} opacity={0.25} />
          <path d="M 20 0 L -15 -18 L -6 0 L -15 18 Z" fill={color} />
        </g>
      ) : null}
    </g>
  );
};

const LABEL_OFFSET = {
  top: [0, -62],
  bottom: [0, 74],
  left: [-1, 0],
  right: [1, 0],
} as const;

const PinMark: React.FC<{ pin: Pin; zoom: number }> = ({ pin, zoom }) => {
  const frame = useCurrentFrame();
  const local = frame - pin.delay;
  if (local < 0) return null;
  const [x, y] = project(pin.at);
  const pop = interpolate(local, [0, 6, 12], [0, 1.4, 1], clamp);
  const shock = progress(frame, pin.delay, 18);
  const pulse = (local % 40) / 40;
  const color = pin.color ?? C.gold;
  const labelP = progress(frame, pin.delay + 3, 12);
  const fontSize = pin.big ? 44 : 36;
  const textW = (pin.label?.length ?? 0) * fontSize * 0.56 + 46;
  const side = pin.side ?? "top";
  const [ox, oy] = LABEL_OFFSET[side];
  const cx = side === "left" || side === "right" ? ox * (textW / 2 + 34) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${1 / zoom})`}>
      {/* A beam of light dropping onto the spot, then a shockwave. */}
      <rect
        x={-5}
        y={-260}
        width={10}
        height={260}
        fill={color}
        opacity={interpolate(local, [0, 4, 16], [0, 0.7, 0], clamp)}
      />
      <circle
        r={20 + shock * 110}
        fill="none"
        stroke={color}
        strokeWidth={6 * (1 - shock)}
        opacity={1 - shock}
      />
      <circle
        r={14 + pulse * 46}
        fill="none"
        stroke={color}
        strokeWidth={3}
        opacity={(1 - pulse) * 0.7}
      />
      <circle r={18 * pop} fill={color} opacity={0.3} />
      <circle r={10 * pop} fill={color} stroke={C.bg} strokeWidth={3} />
      {pin.label ? (
        <g
          opacity={labelP}
          transform={`translate(${cx} ${oy + (1 - labelP) * 16})`}
        >
          <rect
            x={-textW / 2}
            y={-fontSize * 0.86}
            width={textW}
            height={fontSize * 1.62}
            rx={fontSize * 0.5}
            fill="rgba(15,11,9,0.88)"
            stroke={color}
            strokeWidth={3}
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
  { at: [35.6, 31.0], text: "فلسطين" },
];

// Wind-blown dune ridges, drawn as short arcs scattered over the desert.
const DUNES = new Array(140).fill(true).map((_, i) => {
  const lon = 25.2 + ((i * 7.31) % 11.4);
  const lat = 22.3 + ((i * 3.77) % 8.6);
  return { at: [lon, lat] as LonLat, w: 10 + ((i * 13) % 14) };
});

export const EgyptMap: React.FC<{
  readonly camera: readonly CameraKey[];
  readonly pins?: readonly Pin[];
  readonly arrows?: readonly Arrow[];
  readonly regions?: readonly Region[];
  // Frames over which the outline draws itself; 0 shows it immediately.
  readonly drawFrames?: number;
  // Vertical screen position of the camera's focus inside the 940px map frame.
  readonly centerY?: number;
  readonly showCities?: boolean;
  // Extra artwork in map units, drawn above the regions.
  readonly layers?: (zoom: number) => ReactNode;
}> = ({
  camera,
  pins = [],
  arrows = [],
  regions = [],
  drawFrames = 0,
  centerY = VIEW_H / 2,
  showCities = true,
  layers,
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
  const land = toPath(EGYPT, true);

  return (
    <svg
      width={VIEW_W}
      height={VIEW_H}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="land" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#5a4029" />
          <stop offset="55%" stopColor="#433021" />
          <stop offset="100%" stopColor="#33251a" />
        </linearGradient>
        {[C.red, C.gold, C.nile].map((color) => (
          <radialGradient key={color} id={`region-${color.slice(1)}`}>
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={color} stopOpacity={0.06} />
          </radialGradient>
        ))}
        <clipPath id="land-clip">
          <path d={land} />
        </clipPath>
      </defs>
      <g
        transform={`translate(${VIEW_W / 2} ${centerY}) scale(${zoom}) translate(${-fx} ${-fy})`}
      >
        {[22, 24, 26, 28, 30, 32].map((lat) => (
          <path
            key={`lat${lat}`}
            d={toPath([
              [16, lat],
              [42, lat],
            ])}
            stroke={C.landEdge}
            strokeOpacity={0.08}
            strokeWidth={1.5 * sw}
          />
        ))}
        {[22, 25, 28, 31, 34, 37].map((lon) => (
          <path
            key={`lon${lon}`}
            d={toPath([
              [lon, 16],
              [lon, 36],
            ])}
            stroke={C.landEdge}
            strokeOpacity={0.08}
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
        {/* Extruded slab under the land, for depth. */}
        <g opacity={fill}>
          {[1, 0.75, 0.5, 0.25].map((k) => (
            <path
              key={k}
              d={land}
              transform={`translate(0 ${(DEPTH * k) / zoom})`}
              fill={k === 1 ? "#000" : "#1d140e"}
              opacity={k === 1 ? 0.55 : 1}
            />
          ))}
        </g>
        <path
          d={land}
          fill="url(#land)"
          fillOpacity={fill}
          stroke={C.sand}
          strokeWidth={2.5 * sw}
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
        <g clipPath="url(#land-clip)" opacity={fill * 0.5}>
          {DUNES.map((d, i) => {
            const [x, y] = project(d.at);
            return (
              <path
                key={i}
                d={`M ${x - d.w} ${y} q ${d.w} ${-d.w * 0.45} ${d.w * 2} 0`}
                fill="none"
                stroke={C.sand}
                strokeOpacity={0.35}
                strokeWidth={1.6 * sw}
              />
            );
          })}
        </g>
        {/* Green ribbon of the valley and delta. */}
        <g opacity={fill}>
          {[NILE, ROSETTA, DAMIETTA].map((river, i) => (
            <path
              key={`v${i}`}
              d={toPath(river)}
              fill="none"
              stroke="#3d6b35"
              strokeOpacity={0.55}
              strokeWidth={(i === 0 ? 18 : 26) * sw}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          <path
            d={toPath(LAKE)}
            fill="none"
            stroke={C.nile}
            strokeWidth={16 * sw}
            strokeLinecap="round"
            strokeOpacity={0.55}
          />
          {[NILE, ROSETTA, DAMIETTA, CANAL].map((river, i) => (
            <g key={i}>
              <path
                d={toPath(river)}
                fill="none"
                stroke={C.nile}
                strokeWidth={4.5 * sw}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d={toPath(river)}
                fill="none"
                stroke="#bdf2ff"
                strokeWidth={2.4 * sw}
                strokeDasharray={`${10 * sw} ${30 * sw}`}
                strokeDashoffset={-frame * 1.4 * sw}
                strokeLinecap="round"
                opacity={0.8}
              />
            </g>
          ))}
        </g>
        {showCities
          ? CITIES.map((c) => {
              const [x, y] = project(c.at);
              return (
                <g
                  key={c.name}
                  transform={`translate(${x} ${y}) scale(${sw})`}
                  opacity={0.7 * fill}
                >
                  <rect
                    x={-5}
                    y={-5}
                    width={10}
                    height={10}
                    fill={C.text}
                    transform="rotate(45)"
                  />
                  <text
                    y={-14}
                    textAnchor="middle"
                    fontFamily={bodyFont}
                    fontWeight={600}
                    fontSize={24}
                    fill={C.muted}
                    direction="rtl"
                  >
                    {c.name}
                  </text>
                </g>
              );
            })
          : null}
        {regions.map((r, i) => (
          <RegionGlow key={i} region={r} />
        ))}
        {layers?.(zoom)}
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
export const toScreen = (
  at: LonLat,
  focus: LonLat,
  zoom: number,
  centerY = VIEW_H / 2,
) => {
  const [x, y] = project(at);
  const [fx, fy] = project(focus);
  return { x: VIEW_W / 2 + (x - fx) * zoom, y: centerY + (y - fy) * zoom };
};
