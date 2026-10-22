import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, progress } from "../anim";
import { NARRATION } from "../narration";
import { ar, bodyFont, C, headingFont } from "../theme";
import type { Word } from "../timing";
import { Backdrop, SaduBand } from "./Backdrop";
import { Captions } from "./Captions";
import { Progress } from "./Progress";
import { Sfx } from "./Sound";
import { Grain, Tally, type TimedTribe, TribeCards } from "./Tribes";

export type Chip = { readonly text: string; readonly at: number };
export type Kicker =
  | { readonly text: string }
  | {
      readonly count: number;
      readonly suffix?: string;
      readonly prefix?: string;
    };

const KickerBadge: React.FC<{ kicker: Kicker }> = ({ kicker }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, 2, 12);
  const label =
    "count" in kicker
      ? `${kicker.prefix ?? ""}${ar(
          interpolate(frame, [2, 20], [0, kicker.count], {
            ...clamp,
            easing: Easing.out(Easing.cubic),
          }),
        )}${kicker.suffix ?? ""}`
      : kicker.text;
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 120,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        translate: `0 ${(1 - p) * -30}px`,
      }}
    >
      <div
        style={{
          background: C.red,
          color: C.text,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 44,
          padding: "6px 34px 10px",
          borderRadius: 999,
          boxShadow: `0 0 0 4px ${C.bg}, 0 0 0 7px ${C.red}`,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const Title: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        position: "absolute",
        top: 205,
        left: 40,
        right: 40,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "0 26px",
        fontFamily: headingFont,
        fontWeight: 900,
        fontSize: text.length > 18 ? 80 : text.length > 14 ? 92 : 108,
        lineHeight: 1.25,
        color: C.text,
        textShadow: "0 10px 40px rgba(0,0,0,0.7)",
      }}
    >
      {words.map((w, i) => {
        const start = 5 + i * 3;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: i === words.length - 1 ? C.gold : C.text,
              opacity: progress(frame, start, 6),
              scale: interpolate(
                frame,
                [start, start + 6, start + 11],
                [1.8, 0.94, 1],
                clamp,
              ),
              filter: `blur(${(1 - progress(frame, start, 7)) * 14}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Chips: React.FC<{ chips: readonly Chip[] }> = ({ chips }) => {
  const frame = useCurrentFrame();
  return (
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 372,
        left: 50,
        right: 50,
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      {chips.map((chip) => {
        const p = interpolate(
          frame,
          [chip.at, chip.at + 5, chip.at + 9],
          [0, 1.15, 1],
          clamp,
        );
        return (
          <div
            key={chip.text}
            style={{
              scale: p,
              opacity: Math.min(1, p),
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: 38,
              color: C.sand,
              padding: "6px 26px 10px",
              borderRadius: 999,
              border: `3px solid ${C.gold}`,
              background: "rgba(242,179,61,0.12)",
            }}
          >
            {chip.text}
          </div>
        );
      })}
    </div>
  );
};

// Shared reel layout: progress, kicker, title, art, fact chips and captions, with a punch-in on entry.
export const Shell: React.FC<{
  readonly index: number;
  readonly kicker?: Kicker;
  readonly title?: string;
  readonly chips?: readonly Chip[];
  readonly words: Word[];
  // Tribes introduced in this scene, shown as cards, and how many came before.
  readonly tribes?: readonly TimedTribe[];
  readonly tallyBefore?: number;
  readonly cards?: boolean;
  readonly children: ReactNode;
}> = ({
  index,
  kicker,
  title,
  chips = [],
  words,
  tribes = [],
  tallyBefore,
  cards = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const flash = interpolate(frame, [0, 5], [0.35, 0], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Backdrop />
      <AbsoluteFill
        style={{
          scale: interpolate(
            frame,
            [0, 10, durationInFrames],
            [1.12, 1, 1.04],
            {
              ...clamp,
              easing: Easing.out(Easing.cubic),
            },
          ),
        }}
      >
        <AbsoluteFill style={{ top: 380, height: 940 }}>
          {children}
        </AbsoluteFill>
        {/* Let the art bleed to the edges while keeping the title and captions legible. */}
        <AbsoluteFill
          style={{
            background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg}f0 14%, ${C.bg}00 27%, ${C.bg}00 62%, ${C.bg}e6 74%, ${C.bg} 90%)`,
          }}
        />
        {kicker ? <KickerBadge kicker={kicker} /> : null}
        {title ? <Title text={title} /> : null}
        <Chips chips={chips} />
        {cards ? <TribeCards tribes={tribes} /> : null}
      </AbsoluteFill>
      <Captions words={words} />
      <SaduBand y={1820} />
      <Progress index={index} count={NARRATION.length} />
      {tallyBefore === undefined ? null : (
        <Tally before={tallyBefore} frames={tribes.map((t) => t.frame)} />
      )}
      <Grain />
      <AbsoluteFill style={{ background: C.sand, opacity: flash }} />
      <Sfx name="swoosh" volume={0.5} />
      {kicker && "count" in kicker ? (
        <Sfx name="typing" at={2} volume={0.3} />
      ) : null}
      {chips.map((chip) => (
        <Sfx key={chip.text} name="pop" at={chip.at} volume={0.3} />
      ))}
      {tribes.map((t) => (
        <Sfx key={t.name} name="hit-soft" at={t.frame} volume={0.45} />
      ))}
    </AbsoluteFill>
  );
};
