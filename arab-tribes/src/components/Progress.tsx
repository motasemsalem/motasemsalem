import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "../anim";
import { C } from "../theme";

// Story-style progress segments; the current scene's segment fills over the scene.
export const Progress: React.FC<{
  readonly index: number;
  readonly count: number;
}> = ({ index, count }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fill = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: 50,
        right: 50,
        display: "flex",
        flexDirection: "row-reverse",
        gap: 8,
      }}
    >
      {new Array(count).fill(true).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 7,
            borderRadius: 4,
            background: "rgba(247,236,217,0.18)",
            overflow: "hidden",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              width: `${(i < index ? 1 : i === index ? fill : 0) * 100}%`,
              background: C.gold,
            }}
          />
        </div>
      ))}
    </div>
  );
};
