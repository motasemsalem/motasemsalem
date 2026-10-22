import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeOut, progress } from "../anim";
import { bodyFont, C, headingFont } from "../theme";
import { Backdrop } from "./Backdrop";
import { Words } from "./Words";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const years = Math.round(
    interpolate(frame, [0, 70], [0, 7_000_000], { ...clamp, easing: easeOut }),
  );
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill
        dir="rtl"
        lang="ar"
        style={{ justifyContent: "center", alignItems: "center", gap: 30 }}
      >
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 64,
            color: C.accent,
            opacity: progress(frame, 0, 15),
          }}
        >
          {`${years.toLocaleString("en-US")} سنة`}
        </div>
        <Words
          text="رحلة الإنسان"
          start={14}
          stagger={6}
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 190,
            lineHeight: 1.4,
            color: C.text,
          }}
        />
        <div
          style={{
            width: interpolate(progress(frame, 34, 40), [0, 1], [0, 900]),
            height: 4,
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
          }}
        />
        <Words
          text="كيف تطوّر البشر من أسلافنا الأوائل إلى اليوم"
          start={46}
          stagger={3}
          style={{ fontFamily: bodyFont, fontSize: 52, color: C.muted }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
