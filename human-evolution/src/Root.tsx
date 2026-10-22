import { Composition } from "remotion";
import { HumanEvolution } from "./HumanEvolution";
import { calculateMetadata } from "./voiceover";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HumanEvolution"
      component={HumanEvolution}
      // Scene lengths and the total duration come from the voiceover in calculateMetadata.
      durationInFrames={2655}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ sceneFrames: {} }}
      calculateMetadata={calculateMetadata}
    />
  );
};
