import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { Flash, Title } from "../overlay/Cine";
import { Finish, LightLeak, type ShotDef, Sfx, Shots } from "../finishing/kit";
import { EndCard, Trade, Watermark } from "../finishing/overlays";
import { at, section, TOTAL, VOICE } from "./cues";
import { SCENES, type SceneId } from "./narration";

// One House slab-pour reel (1080x1920): the five checks before a slab is poured, then the curing, each on real
// site footage cut to the owner's voiceover in public/slab-vo. Script: social/voice/slab-reel.txt.

const next = (id: SceneId) => {
  const i = SCENES.findIndex((s) => s.id === id);
  return i + 1 < SCENES.length ? section(SCENES[i + 1].id) : TOTAL;
};

const SHOTS: ShotDef[] = [
  { media: "slab-pump", from: at("hook"), look: "site" },
  { media: "slab-mesh-wide", from: at("hook", "فيه"), look: "site" },
  { media: "slab-formwork", from: at("level"), look: "site" },
  { media: "slab-level", from: at("level", "بالميزان"), look: "site" },
  { media: "slab-tying", from: at("rebar"), look: "site" },
  { media: "slab-grid", from: at("rebar", "في"), look: "site" },
  { media: "slab-ruler", from: at("stirrups"), look: "site" },
  { media: "slab-stirrups", from: at("stirrups", "مش"), look: "site" },
  { media: "slab-beam", from: at("spacers"), look: "site" },
  { media: "slab-plans", from: at("engineer"), look: "site" },
  { media: "slab-pour", from: at("engineer", "قبل"), look: "site" },
  { media: "slab-mixer", from: at("after"), look: "site" },
  { media: "slab-curing", from: at("after", "ورش"), look: "site" },
  { media: "slab-aerial", from: at("brand"), look: "site" },
  { media: "slab-building", from: at("brand", "كل") },
];

const CHECKS: { id: SceneId; n: number; name: string; point: string; on: string }[] = [
  { id: "level", n: 1, name: "الشدّة", point: "مستوية بالميزان", on: "بالميزان" },
  { id: "rebar", n: 2, name: "الحديد", point: "مطابق للرسومات… عدد وقُطر", on: "مطابق" },
  { id: "stirrups", n: 3, name: "الكانات", point: "بالمسطرة… مش بالعين", on: "بالمسطرة" },
  { id: "spacers", n: 4, name: "البسكوت", point: "تحت الحديد… علشان ميصدّيش", on: "تحت" },
  { id: "engineer", n: 5, name: "المهندس", point: "يراجع ويمضي قبل الصبّة", on: "يراجع" },
];

const SOUNDS: { name: string; at: number; volume?: number }[] = [
  ...SCENES.slice(1, -1).map((s) => ({ name: "mk/whoosh-fast", at: section(s.id) - 6, volume: 0.16 })),
  ...CHECKS.map((c) => ({ name: "mk/ui-select-click", at: at(c.id, c.on) + 2, volume: 0.3 })),
  { name: "mk/pen-write-paper", at: at("engineer", "ويمضي"), volume: 0.35 },
  { name: "mk/water-splash", at: at("after", "ورش"), volume: 0.35 },
  { name: "mk/impact-deep-whoosh", at: at("brand") - 4, volume: 0.45 },
  { name: "mk/ui-confirm-tone", at: at("cta") + 10, volume: 0.4 },
];

export const SlabReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Shots shots={SHOTS} end={section("cta") + 8} />
    <Finish />
    <LightLeak at={at("brand") - 6} />
    <Flash at={at("brand")} peak={0.45} />

    <Title from={at("hook")} to={next("hook") - 2} text="قبل ما تصبّ السقف…" accent="السقف…" sub="5 حاجات لازم تتأكد منها" subAt={at("hook", "فيه")} size={96} top={1220} />
    {CHECKS.map((c) => (
      <Trade key={c.id} from={at(c.id)} to={next(c.id) - 2} n={c.n} of={5} name={c.name} points={[{ at: at(c.id, c.on), text: c.point }]} />
    ))}
    <Title from={at("after")} to={next("after") - 2} kicker="وبعد الصبّة" kickerAt={at("after")} text="مكعبات للمعمل" accent="للمعمل" sub="ورشّ مية أسبوع كامل" subAt={at("after", "ورش")} size={100} top={1200} />
    <Title from={at("brand", "كل")} to={next("brand") - 2} kicker="في ون هاوس" kickerAt={at("brand")} text="كل صبّة بتتعمل كده" accent="كده" size={96} top={1220} />
    <EndCard from={section("cta")} media="slab-building" line="المسلّح صح… من أول طوبة" />
    <Watermark until={section("cta")} />

    <Audio name="التعليق الصوتي" src={staticFile("slab-vo/voiceover.mp3")} />
    <Audio name="الموسيقى" src={staticFile("music/slab-score.mp3")} volume={0.32} />
    {SOUNDS.map((s, i) => (
      <Sfx key={i} {...s} voice={VOICE} />
    ))}
  </AbsoluteFill>
);
