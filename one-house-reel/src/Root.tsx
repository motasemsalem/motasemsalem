import { Composition } from "remotion";
import { OneHouseReel } from "./OneHouseReel";
import "./theme";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="OneHouseReel"
      component={OneHouseReel}
      // Scene lengths come from the voiceover; see scripts/generate-audio.py.
      durationInFrames={timeline.total}
      fps={timeline.fps}
      width={1080}
      height={1920}
    />
  );
};
