import { Composition, Folder, Still } from "remotion";
import { FinishingReel } from "./finishing/FinishingReel";
import finishing from "./finishing/timeline.json";
import { OneHouseReel } from "./OneHouseReel";
import { SlabReel } from "./slab/SlabReel";
import slab from "./slab/timeline.json";
import { ADS, type AdId, FacebookAd } from "./posts/Ads";
import { FinishingPost, FPOST_H, FPOST_W, FPOSTS, type FPostId, UnitPost, UPOSTS, type UPostId, StructurePost, SPOSTS, type SPostId } from "./posts/Finishing";
import { FacebookPost, POST_H, POST_W, POSTS, type PostId } from "./posts/Posts";
import "./theme";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OneHouseReel"
        component={OneHouseReel}
        // The length comes from the voiceover; see scripts/generate-audio.py.
        durationInFrames={timeline.total}
        fps={timeline.fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="FinishingReel"
        component={FinishingReel}
        // The length comes from the voiceover; see scripts/finishing-timeline.py.
        durationInFrames={finishing.total}
        fps={finishing.fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="SlabReel"
        component={SlabReel}
        // The length comes from the voiceover; see REEL=slab scripts/finishing-timeline.py.
        durationInFrames={slab.total}
        fps={slab.fps}
        width={1080}
        height={1920}
      />
      <Folder name="FacebookPosts">
        {(Object.keys(POSTS) as PostId[]).map((id, i) => (
          // As long as the reel, so the frozen reel frames inside resolve (a 1-frame Still clamps them to 0). Render frame 0.
          <Composition
            key={id}
            id={`post-${String(i + 1).padStart(2, "0")}-${id}`}
            component={FacebookPost}
            defaultProps={{ id }}
            durationInFrames={timeline.total}
            fps={timeline.fps}
            width={POST_W}
            height={POST_H}
          />
        ))}
      </Folder>
      <Folder name="FinishingPosts">
        {(Object.keys(FPOSTS) as FPostId[]).map((id, i) => (
          <Still key={id} id={`finishing-${String(i + 1).padStart(2, "0")}-${id}`} component={FinishingPost} defaultProps={{ id }} width={FPOST_W} height={FPOST_H} />
        ))}
      </Folder>
      <Folder name="StructurePosts">
        {(Object.keys(SPOSTS) as SPostId[]).map((id, i) => (
          <Still key={id} id={`structure-${String(i + 1).padStart(2, "0")}-${id}`} component={StructurePost} defaultProps={{ id }} width={FPOST_W} height={FPOST_H} />
        ))}
      </Folder>
      <Folder name="UnitPosts">
        {(Object.keys(UPOSTS) as UPostId[]).map((id, i) => (
          <Still key={id} id={`unit-${String(i + 1).padStart(2, "0")}-${id}`} component={UnitPost} defaultProps={{ id }} width={FPOST_W} height={FPOST_H} />
        ))}
      </Folder>
      <Folder name="FacebookAds">
        {(Object.keys(ADS) as AdId[]).map((id, i) => (
          <Composition
            key={id}
            id={`ad-${String(i + 1).padStart(2, "0")}-${id}`}
            component={FacebookAd}
            defaultProps={{ id }}
            durationInFrames={timeline.total}
            fps={timeline.fps}
            width={POST_W}
            height={POST_H}
          />
        ))}
      </Folder>
    </>
  );
};
