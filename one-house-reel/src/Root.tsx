import { Composition, Folder, Still } from "remotion";
import { SAMPLES, StudioPost } from "./posts/Studio";
import { EditorialPost, EPOST_H, EPOST_W, ESAMPLES } from "./posts/Editorial";
import { Avatar, Cover, COVER_H, COVER_W, Highlight, HIGHLIGHTS } from "./brand/Identity";
import { PAGE_H, PAGE_W, PROFILE_PAGES, ProfilePage } from "./brand/Profile";
import { FinishingReel } from "./finishing/FinishingReel";
import finishing from "./finishing/timeline.json";
import { OneHouseReel } from "./OneHouseReel";
import { SlabReel } from "./slab/SlabReel";
import { REELS } from "./reels";
import { ReelById } from "./reels/ReelById";
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
      <Folder name="Reels">
        {REELS.map((r) => (
          <Composition key={r.id} id={`reel-${r.id}`} component={ReelById} defaultProps={{ id: r.id }} durationInFrames={r.timeline.total} fps={r.timeline.fps} width={1080} height={1920} />
        ))}
      </Folder>
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
      <Folder name="StudioPosts">
        {Object.entries(SAMPLES).map(([id, post]) => (
          <Still key={id} id={`studio-${id}`} component={StudioPost} defaultProps={{ post }} width={FPOST_W} height={FPOST_H} />
        ))}
      </Folder>
      <Folder name="PageIdentity">
        <Still id="page-cover" component={Cover} width={COVER_W} height={COVER_H} />
        <Still id="page-avatar" component={Avatar} width={1080} height={1080} />
        {Object.keys(HIGHLIGHTS).map((id) => (
          <Still key={id} id={`highlight-${id}`} component={Highlight} defaultProps={{ id }} width={1080} height={1920} />
        ))}
      </Folder>
      <Folder name="CompanyProfile">
        {PROFILE_PAGES.map((_, i) => (
          <Still key={i} id={`profile-${i + 1}`} component={ProfilePage} defaultProps={{ n: i + 1 }} width={PAGE_W} height={PAGE_H} />
        ))}
      </Folder>
      <Folder name="EditorialPosts">
        {Object.entries(ESAMPLES).map(([id, post]) => (
          <Still key={id} id={`editorial-${id}`} component={EditorialPost} defaultProps={{ post }} width={EPOST_W} height={EPOST_H} />
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
