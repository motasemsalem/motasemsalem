import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { Flash, Title } from "../overlay/Cine";
import { Finish, LightLeak, type Look, type ShotDef, Sfx, Shots } from "../finishing/kit";
import { EndCard, Trade, Watermark } from "../finishing/overlays";
import { Bubble, Depth, Scan, Stages, Stamp } from "./signatures";

// Short voiced reels (1080x1920) built from a plain description: which clip plays on which word, and which card
// comes up on which line. Each reel lives in src/reels/<name>/ (narration.ts + timeline.json from
// REEL=reels/<name> scripts/finishing-timeline.py), with its voice in public/reels/<name>-vo and its music in
// public/music/reels/<name>-score.mp3 (scripts/finishing-music.py). The list is in src/reels/index.ts.

type Word = { text: string; start: number; end: number };
export type Timeline = { fps: number; total: number; sections: Record<string, number>; voice: number[]; words: Word[] };

const bare = (w: string) => w.replace(/[.,،:!؟?…]/g, "");

export const cuesFor = (tl: Timeline, scenes: readonly { readonly id: string }[]) => {
  const section = (id: string) => {
    const s = tl.sections[id];
    if (s === undefined) throw new Error(`No section ${id}`);
    return s;
  };
  // Frame where the narrator starts `word` (the `nth` match at or after section `id`); without a word, the section start.
  const at = (id: string, word?: string, nth = 0) => {
    if (!word) return section(id);
    const from = section(id) / tl.fps - 0.01;
    const hit = tl.words.filter((w) => w.start >= from && bare(w.text).startsWith(word))[nth];
    if (!hit) throw new Error(`"${word}" (#${nth}) is not in section ${id}`);
    return Math.round(hit.start * tl.fps);
  };
  const next = (id: string) => {
    const i = scenes.findIndex((s) => s.id === id);
    return i + 1 < scenes.length ? section(scenes[i + 1].id) : tl.total;
  };
  return { at, section, next };
};

// A clip from `scene` (or from `word` inside it).
export type ReelShot = { readonly media: string; readonly scene: string; readonly word?: string; readonly look?: Look; readonly focus?: number; readonly focusY?: number };
// A headline over a line, or a numbered check ("2 من 4") with its point ticking in on `on`.
export type ReelCard =
  | { readonly type: "title"; readonly scene: string; readonly word?: string; readonly text: string; readonly accent?: string; readonly kicker?: string; readonly sub?: string; readonly subWord?: string; readonly size?: number }
  | {
      readonly type: "check";
      readonly scene: string;
      readonly n: number;
      readonly of: number;
      readonly name: string;
      readonly point?: string;
      readonly on?: string;
      // Signature extras: the gauge depth in metres ("depth"), the step's short name ("stages").
      readonly depth?: number;
      readonly short?: string;
    };

// Each reel's own graphic, see ./signatures.tsx. "stamp" also stamps «الصح» on the scene named "fix".
export type Signature = "scan" | "stamp" | "depth" | "stages" | "chat";

export type ReelDef = {
  readonly id: string;
  readonly timeline: Timeline;
  readonly scenes: readonly { readonly id: string; readonly from: string }[];
  readonly shots: readonly ReelShot[];
  readonly cards: readonly ReelCard[];
  readonly signature: Signature;
  readonly end: { readonly media: string; readonly line: string };
};

export const Reel: React.FC<{ readonly reel: ReelDef }> = ({ reel }) => {
  const { at, section, next } = cuesFor(reel.timeline, reel.scenes);
  const voice = reel.timeline.voice;
  const shots: ShotDef[] = reel.shots.map((s) => ({ media: s.media, from: at(s.scene, s.word), look: s.look ?? "site", focus: s.focus, focusY: s.focusY }));
  const sounds = [
    ...reel.scenes.slice(1, -1).map((s) => ({ name: "mk/whoosh-fast", at: section(s.id) - 6, volume: 0.16 })),
    ...reel.cards.flatMap((c) => (c.type === "check" ? [{ name: "mk/ui-select-click", at: at(c.scene, c.on) + 2, volume: 0.3 }] : [])),
    { name: "mk/impact-deep-whoosh", at: at("brand") - 4, volume: 0.45 },
    { name: "mk/ui-confirm-tone", at: at("cta") + 10, volume: 0.4 },
  ];
  const checks = reel.cards.filter((c): c is Extract<ReelCard, { type: "check" }> => c.type === "check");
  const span = checks.length ? { from: at(checks[0].scene), to: next(checks[checks.length - 1].scene) } : { from: 0, to: 0 };
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Shots shots={shots} end={section("cta") + 8} />
      <Finish />
      <LightLeak at={at("brand") - 6} />
      <Flash at={at("brand")} peak={0.45} />
      {reel.signature === "scan" && <Scan from={span.from} to={span.to} checks={checks.map((c) => at(c.scene, c.on))} />}
      {reel.signature === "stamp" && checks.map((c, i) => <Stamp key={`s${i}`} at={at(c.scene, c.on)} to={next(c.scene) - 2} />)}
      {reel.signature === "stamp" && <Stamp at={at("fix") + 6} to={next("fix") - 2} good />}
      {reel.signature === "depth" && (
        <Depth from={span.from} to={span.to} steps={checks.map((c) => ({ at: at(c.scene), depth: c.depth ?? 0, label: c.short ?? c.name }))} />
      )}
      {reel.signature === "stages" && <Stages from={span.from} to={span.to} stages={checks.map((c) => ({ at: at(c.scene), label: c.short ?? c.name }))} />}
      {reel.cards.map((c, i) =>
        c.type === "check" && reel.signature === "chat" ? (
          <Bubble key={i} from={at(c.scene)} to={next(c.scene) - 2} n={c.n} text={c.name} detail={c.point} detailAt={c.on ? at(c.scene, c.on) : undefined} />
        ) : c.type === "check" ? (
          <Trade key={i} from={at(c.scene)} to={next(c.scene) - 2} n={c.n} of={c.of} name={c.name} points={c.point ? [{ at: at(c.scene, c.on), text: c.point }] : []} />
        ) : (
          <Title
            key={i}
            from={at(c.scene, c.word)}
            to={next(c.scene) - 2}
            text={c.text}
            accent={c.accent}
            kicker={c.kicker}
            kickerAt={c.kicker ? at(c.scene) : undefined}
            sub={c.sub}
            subAt={c.sub ? at(c.scene, c.subWord) : undefined}
            size={c.size ?? 96}
            top={1220}
          />
        ),
      )}
      <EndCard from={section("cta")} media={reel.end.media} line={reel.end.line} />
      <Watermark until={section("cta")} />
      <Audio name="التعليق الصوتي" src={staticFile(`reels/${reel.id}-vo/voiceover.mp3`)} />
      <Audio name="الموسيقى" src={staticFile(`music/reels/${reel.id}-score.mp3`)} volume={0.32} />
      {sounds.map((s, i) => (
        <Sfx key={i} {...s} voice={voice} />
      ))}
    </AbsoluteFill>
  );
};
