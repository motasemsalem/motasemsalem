import { Composition } from "remotion";
import { ArabTribes } from "./ArabTribes";
import { H, W } from "./theme";
import { calculateMetadata } from "./timing";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ArabTribes"
      component={ArabTribes}
      // Scene lengths and the total duration come from the voiceover in calculateMetadata.
      durationInFrames={3300}
      fps={30}
      width={W}
      height={H}
      defaultProps={{ sceneFrames: {}, words: {} }}
      calculateMetadata={calculateMetadata}
    />
  );
};
