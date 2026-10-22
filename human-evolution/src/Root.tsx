import {Composition} from 'remotion';
import {HumanEvolution} from './HumanEvolution';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="HumanEvolution"
      component={HumanEvolution}
      // 16 scenes (96 s at 30 fps) minus 15 fade transitions of 15 frames each.
      durationInFrames={2655}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
