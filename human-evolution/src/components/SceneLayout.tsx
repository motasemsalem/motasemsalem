import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { clamp, progress } from "../anim";
import { bodyFont, C, headingFont } from "../theme";
import { Backdrop } from "./Backdrop";
import { Timeline } from "./Timeline";
import { Words } from "./Words";

export type SceneProps = {
  readonly era: string;
  readonly title: string;
  readonly subtitle: string;
  readonly fact: string;
  readonly yearsAgo: number;
  readonly prevYearsAgo: number;
  readonly children: React.ReactNode;
};

// Text on the right (start of an RTL line), illustration on the left, timeline at the bottom.
export const SceneLayout: React.FC<SceneProps> = ({
  era,
  title,
  subtitle,
  fact,
  yearsAgo,
  prevYearsAgo,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const chip = progress(frame, 0, 20);
  const factIn = progress(frame, 30, 26);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        dir="rtl"
        lang="ar"
        style={{ flexDirection: "row", padding: "90px 130px 230px", gap: 60 }}
      >
        <div
          style={{
            width: 820,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 26,
          }}
        >
          <div
            style={{
              alignSelf: "flex-start",
              fontFamily: bodyFont,
              fontWeight: 600,
              fontSize: 34,
              color: C.accent,
              border: `2px solid ${C.accent}66`,
              borderRadius: 999,
              padding: "8px 28px",
              opacity: chip,
              translate: `${(1 - chip) * -40}px 0`,
            }}
          >
            {era}
          </div>
          <Words
            text={title}
            start={6}
            style={{
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: 110,
              lineHeight: 1.2,
              color: C.text,
            }}
          />
          <Words
            text={subtitle}
            start={16}
            stagger={3}
            style={{
              fontFamily: headingFont,
              fontWeight: 500,
              fontSize: 48,
              lineHeight: 1.35,
              color: C.accent2,
            }}
          />
          <div
            style={{
              fontFamily: bodyFont,
              fontSize: 40,
              lineHeight: 1.6,
              color: C.muted,
              opacity: factIn,
              translate: `0 ${(1 - factIn) * 24}px`,
            }}
          >
            {fact}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // Slow push-in keeps longer narrated scenes alive.
            scale: interpolate(frame, [0, durationInFrames], [1, 1.06], clamp),
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
      <Timeline yearsAgo={yearsAgo} prevYearsAgo={prevYearsAgo} />
    </AbsoluteFill>
  );
};
