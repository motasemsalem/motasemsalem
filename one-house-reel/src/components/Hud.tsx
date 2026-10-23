import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { clamp } from "../anim";
import { SCENES } from "../narration";
import timeline from "../timeline.json";
import { bodyFont, C } from "../theme";

const CHAPTERS = SCENES.slice(2, -1).map((s) => s.id);

// Story-style chapter progress bar, small logo and a site label — shown between the logo and the end card.
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const from = timeline.starts.foundation;
  const to = timeline.starts.closing + timeline.transitionFrames;
  const visible =
    interpolate(frame, [from, from + 15], [0, 1], clamp) *
    interpolate(frame, [to - 15, to], [1, 0], clamp);
  if (visible <= 0) return null;
  const blink = Math.floor(frame / 18) % 2 === 0;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: visible }}>
      <div style={{ position: "absolute", top: 70, left: 60, right: 60, display: "flex", flexDirection: "row-reverse", gap: 10 }}>
        {CHAPTERS.map((id) => {
          const start = timeline.starts[id];
          const p = interpolate(frame, [start, start + timeline.frames[id]], [0, 1], clamp);
          return (
            <div key={id} style={{ flex: 1, height: 7, borderRadius: 4, background: "rgba(255,255,255,0.22)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p * 100}%`, marginLeft: "auto", background: "white" }} />
            </div>
          );
        })}
      </div>
      <Img
        src={staticFile("brand/logo-white.png")}
        style={{ position: "absolute", top: 104, left: 60, width: 150 }}
      />
      <div
        dir="rtl"
        style={{
          position: "absolute",
          top: 112,
          right: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 30,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 8, background: C.red, opacity: blink ? 1 : 0.35, boxShadow: `0 0 16px ${C.red}` }} />
        من موقع العمل
      </div>
    </div>
  );
};
