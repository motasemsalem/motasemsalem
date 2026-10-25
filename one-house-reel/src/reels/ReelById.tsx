import { REELS } from ".";
import { Reel } from "./Reel";

export const ReelById: React.FC<{ readonly id: string }> = ({ id }) => {
  const reel = REELS.find((r) => r.id === id);
  if (!reel) throw new Error(`No reel ${id} in src/reels/index.ts`);
  return <Reel reel={reel} />;
};
