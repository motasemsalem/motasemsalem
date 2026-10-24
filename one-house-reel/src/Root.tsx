import { Composition, Folder } from "remotion";
import { OneHouseReel } from "./OneHouseReel";
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
    </>
  );
};
