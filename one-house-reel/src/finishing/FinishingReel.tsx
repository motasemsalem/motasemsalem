import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Flash, Title } from "../overlay/Cine";
import { at, section, TOTAL } from "./cues";
import { Finish, LightLeak, type ShotDef, Sfx, Shots } from "./kit";
import { SCENES, type SceneId } from "./narration";
import { EndCard, Gauge, InsideOut, Items, Laser, Phone, Quote, Trade, Watermark, WaterTest } from "./overlays";

// One House finishing reel (1080x1920): the client's journey from the first visit to the keys, every trade on
// real photos and clips, cut word by word to the voiceover in public/finishing-vo. Script: FINISHING-SCRIPT.md.

const next = (id: SceneId) => {
  const i = SCENES.findIndex((s) => s.id === id);
  return i + 1 < SCENES.length ? section(SCENES[i + 1].id) : TOTAL;
};

const SHOTS: ShotDef[] = [
  { media: "bare-room", from: at("hook"), move: "in", look: "site" },
  { media: "sign-keys", from: at("hook", "اتفرج"), move: "in", look: "site" },
  { media: "luxe-apartment", from: at("promise"), move: "in" },
  { media: "plan-tape", from: at("visit"), move: "left", look: "site" },
  { media: "render-lounge", from: at("design"), move: "in", look: "xray" },
  { media: "render-lounge", from: at("design", "تشوف"), move: "out" },
  { media: "tablet", from: at("materials") },
  { media: "porcelain", from: at("materials", "بورسلين"), move: "left" },
  { media: "marble", from: at("materials", "رخام"), move: "up" },
  { media: "wood", from: at("materials", "باركيه"), move: "right" },
  { media: "swatches", from: at("materials", "وألوانك"), move: "in" },
  { media: "handshake", from: at("quote"), move: "in", look: "site" },
  { media: "luxe-apartment", from: at("hidden"), move: "out" },
  { media: "wires-wall", from: at("hidden", "باين"), move: "in", look: "xray" },
  { media: "wall-hole", from: at("demo"), move: "in", look: "site" },
  { media: "chisel-tiles", from: at("demo", "لو"), move: "left", look: "site" },
  { media: "electrician", from: at("electric"), move: "right", look: "site", focus: 0.35 },
  { media: "panel-hands", from: at("electric", "وسلك"), move: "in", look: "site" },
  { media: "plumbing", from: at("plumbing"), look: "site" },
  { media: "hoses-plan", from: at("plumbing", "قبل"), move: "left", look: "site" },
  { media: "bath-stripped", from: at("insulation"), move: "in", look: "site" },
  { media: "ac-lounge", from: at("systems"), move: "left" },
  { media: "cctv", from: at("systems", "وكاميرات"), move: "in", look: "site" },
  { media: "smart-tablet", from: at("systems", "وسمارت"), move: "right" },
  { media: "level-hands", from: at("plaster"), move: "right", look: "site" },
  { media: "linear-lights", from: at("luxe"), move: "up" },
  { media: "tv-wall", from: at("gypsum"), move: "left" },
  { media: "tiler", from: at("floors"), move: "right", look: "site" },
  { media: "marble-bath", from: at("floors", "ورخام"), move: "in" },
  { media: "herringbone", from: at("floors", "وباركيه"), move: "up" },
  { media: "paint", from: at("paint") },
  { media: "wood-bedroom", from: at("paint", "وتجاليد"), move: "in" },
  { media: "kitchen", from: at("carpentry"), move: "left" },
  { media: "walk-in", from: at("carpentry", "ودريسنج"), move: "in" },
  { media: "double-door", from: at("carpentry", "وأبواب"), move: "in" },
  { media: "big-windows", from: at("fittings"), move: "right" },
  { media: "shower-dark", from: at("fittings", "وأطقم"), move: "in" },
  { media: "villa-dusk", from: at("villa"), move: "left" },
  { media: "villa-pool", from: at("villa", "ولاندسكيب"), move: "right" },
  { media: "kitchen", from: at("follow"), move: "out" },
  { media: "cleaning", from: at("handover"), move: "in" },
  { media: "keys-house", from: at("handover", "جاهزة"), move: "in" },
];

// Whooshes on the section cuts, ticks on the checks, and a few literal sounds.
const SOUNDS: { name: string; at: number; volume?: number }[] = [
  ...SCENES.slice(1, -2).map((s) => ({ name: "mk/whoosh-fast", at: section(s.id) - 6, volume: 0.22 })),
  { name: "mk/pen-write-paper", at: at("hook", "اتفرج"), volume: 0.35 },
  { name: "mk/data-scan", at: at("design"), volume: 0.3 },
  { name: "mk/shimmer-sparkle-sweep", at: at("design", "تشوف") - 4, volume: 0.3 },
  { name: "mk/paper-slide", at: at("quote"), volume: 0.4 },
  { name: "stamp", at: at("quote", "ومفيش"), volume: 0.6 },
  { name: "mk/data-scan", at: at("hidden", "باين"), volume: 0.35 },
  { name: "hammer", at: at("demo"), volume: 0.45 },
  { name: "mk/gear-lock-metallic", at: at("plumbing", "بالضغط"), volume: 0.3 },
  { name: "mk/water-splash", at: at("insulation", "ومية"), volume: 0.4 },
  { name: "mk/ui-zoom-in", at: at("plaster", "الحيطة"), volume: 0.3 },
  { name: "mk/shimmer-sparkle-sweep", at: at("luxe", "الشياكة") - 6, volume: 0.5 },
  { name: "mk/ui-message-pop", at: at("follow", "كل"), volume: 0.4 },
  { name: "mk/ui-message-pop", at: at("follow", "بالصور"), volume: 0.4 },
  { name: "mk/ui-message-pop", at: at("follow", "مسافر"), volume: 0.4 },
  { name: "keys", at: at("handover", "جاهزة") + 4, volume: 0.5 },
  { name: "mk/impact-deep-whoosh", at: at("brand") - 4, volume: 0.45 },
  { name: "mk/data-scan", at: at("brand", "وضمير") - 6, volume: 0.3 },
  { name: "mk/ui-confirm-tone", at: at("cta") + 10, volume: 0.4 },
];

const TICKS = [
  at("materials", "بورسلين"), at("materials", "رخام"), at("materials", "باركيه"), at("materials", "وألوانك"),
  at("electric", "كل"), at("electric", "وسلك"),
  at("systems", "تكييف"), at("systems", "ونت"), at("systems", "ودش"), at("systems", "وكاميرات"), at("systems", "وسمارت"),
  at("floors"), at("floors", "ورخام"), at("floors", "وباركيه"),
  at("paint"), at("paint", "وورق"), at("paint", "وتجاليد"),
  at("carpentry"), at("carpentry", "ودريسنج"), at("carpentry", "وأبواب"),
  at("fittings"), at("fittings", "وأطقم"), at("fittings", "وكل"),
];

export const FinishingReel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "black" }}>
    <Shots shots={SHOTS} end={section("brand") + 8} />
    <Finish />

    {/* Light on the turns from bare walls to finished rooms. */}
    <LightLeak at={at("promise") - 6} />
    <LightLeak at={at("design", "تشوف") - 6} />
    <LightLeak at={at("luxe") - 4} length={34} />
    <LightLeak at={at("handover", "جاهزة") - 4} />
    <Flash at={at("hidden", "باين")} color="#8fd8ff" peak={0.55} />
    <Flash at={at("brand")} peak={0.8} />

    <Title from={at("hook")} to={at("hook", "اتفرج") - 2} text="قبل ما تمضي عقد تشطيب…" accent="عقد" size={92} top={1240} />
    <Title from={at("hook", "اتفرج")} to={at("promise") - 2} text="اتفرج على ده للآخر" accent="للآخر" size={96} top={1260} />
    <Title from={at("promise", "هتعرف")} to={next("promise") - 2} kicker="في ون هاوس" kickerAt={at("promise")} text="هتعرف كل خطوة قبل ما تحصل" accent="خطوة" size={92} top={1200} />
    <Title from={at("visit", "معاينة")} to={next("visit") - 2} kicker="مهندس بينزلك" kickerAt={at("visit")} text="معاينة ببلاش" accent="ببلاش" sub="يقيس… ويسمع إنت عاوز إيه" subAt={at("visit", "يقيس")} size={110} top={1200} />
    <Title from={at("design")} to={next("design") - 2} text="تصميم 3D" accent="3D" sub="تشوف شقتك قبل ما نبدأ" subAt={at("design", "تشوف")} size={120} top={1240} />
    <Items
      from={at("materials")}
      to={next("materials") - 2}
      heading="اختار خاماتك بإيدك"
      items={[
        { at: at("materials", "بورسلين"), text: "بورسلين" },
        { at: at("materials", "رخام"), text: "رخام" },
        { at: at("materials", "باركيه"), text: "باركيه" },
        { at: at("materials", "وألوانك"), text: "وألوانك" },
      ]}
      top={1020}
    />
    <Quote from={at("quote")} contractAt={at("quote", "وعقد")} stampAt={at("quote", "ومفيش")} to={next("quote") - 2} />
    <Title from={at("hidden")} to={next("hidden") - 2} text="نبدأ باللي مش باين" accent="مش باين" sub="لأنه أهم حاجة" subAt={at("hidden", "لأنه")} size={100} top={1240} />

    {/* Test graphics sit under the trade labels. */}
    <Gauge from={at("plumbing", "مواسير")} to={next("plumbing") - 2} holdAt={at("plumbing", "الحيطة")} />
    <WaterTest from={at("insulation", "ومية")} to={next("insulation") - 2} doneAt={at("insulation", "البلاط")} />
    <Trade from={at("demo")} to={next("demo") - 2} n={1} of={6} name="تكسير وتجديد" points={[{ at: at("demo", "لو"), text: "لو الشقة قديمة" }]} />
    <Trade
      from={at("electric")}
      to={next("electric") - 2}
      n={2}
      of={6}
      name="كهربا"
      points={[
        { at: at("electric", "كل"), text: "كل دايرة لوحدها" },
        { at: at("electric", "وسلك"), text: "سلك بالمقاس الصح" },
      ]}
    />
    <Trade from={at("plumbing")} to={next("plumbing") - 2} n={3} of={6} name="سباكة" points={[{ at: at("plumbing", "بالضغط"), text: "اختبار ضغط قبل ما الحيطة تتقفل" }]} />
    <Trade from={at("insulation")} to={next("insulation") - 2} n={4} of={6} name="عزل الحمامات والمطابخ" points={[{ at: at("insulation", "ومية"), text: "مية تقعد يومين قبل البلاط" }]} />
    <Trade
      from={at("systems")}
      to={next("systems") - 2}
      n={5}
      of={6}
      name="تأسيس"
      points={[
        { at: at("systems", "تكييف"), text: "تكييف" },
        { at: at("systems", "ونت"), text: "نت ودش" },
        { at: at("systems", "وكاميرات"), text: "كاميرات" },
        { at: at("systems", "وسمارت"), text: "سمارت هوم" },
      ]}
    />
    <Trade from={at("plaster")} to={next("plaster") - 2} n={6} of={6} name="محارة بالقدة والميزان" points={[{ at: at("plaster", "الحيطة"), text: "الحيطة مستقيمة" }]} />
    <Laser from={at("plaster", "والميزان")} to={next("plaster") - 2} okAt={at("plaster", "المسطرة")} />

    <Title from={at("luxe", "تيجي")} to={next("luxe") - 2} kicker="وبعدين" kickerAt={at("luxe")} text="تيجي الشياكة" accent="الشياكة" size={130} top={1180} />
    <Title from={at("gypsum")} to={next("gypsum") - 2} text="جبس بورد وإضاءة مخفية" accent="مخفية" size={96} top={1240} />
    <Items from={at("floors")} to={next("floors") - 2} heading="أرضيات بالميزان" items={[{ at: at("floors"), text: "بورسلين" }, { at: at("floors", "ورخام"), text: "رخام" }, { at: at("floors", "وباركيه"), text: "باركيه" }]} top={1080} />
    <Items from={at("paint")} to={next("paint") - 2} items={[{ at: at("paint"), text: "دهانات" }, { at: at("paint", "وورق"), text: "ورق حائط" }, { at: at("paint", "وتجاليد"), text: "تجاليد خشب" }]} top={1230} />
    <Items from={at("carpentry")} to={next("carpentry") - 2} items={[{ at: at("carpentry"), text: "مطابخ" }, { at: at("carpentry", "ودريسنج"), text: "دريسنج" }, { at: at("carpentry", "وأبواب"), text: "أبواب" }]} top={1230} />
    <Items from={at("fittings")} to={next("fittings") - 2} items={[{ at: at("fittings"), text: "ألوميتال" }, { at: at("fittings", "وأطقم"), text: "أطقم حمامات" }, { at: at("fittings", "وكل"), text: "وكل التركيبات" }]} top={1230} />
    <Title from={at("villa", "واجهات")} to={next("villa") - 2} kicker="ولو فيلا" kickerAt={at("villa")} text="واجهات ولاندسكيب" accent="ولاندسكيب" size={100} top={1240} />

    {/* Dim the room behind the phone. */}
    <Sequence from={at("follow")} durationInFrames={next("follow") - at("follow")} layout="none">
      <AbsoluteFill style={{ background: "rgba(2,10,22,0.55)", backdropFilter: "blur(6px)" }} />
    </Sequence>
    <Phone
      from={at("follow")}
      to={next("follow") - 2}
      messages={[
        { at: at("follow", "كل"), photo: "electrician", text: "الكهربا خلصت" },
        { at: at("follow", "بالصور"), photo: "level-hands", text: "المحارة خلصت" },
        { at: at("follow", "مسافر"), photo: "tiler", text: "البلاط خلص" },
      ]}
    />
    <Title from={at("follow", "حتى")} to={next("follow") - 2} kicker="متابع كل مرحلة بالصور" kickerAt={at("follow")} text="حتى لو مسافر" accent="مسافر" size={92} top={1380} />
    <Title from={at("handover", "نسلّمهالك")} to={next("handover") - 2} kicker="وفي الآخر" kickerAt={at("handover")} text="نسلّمهالك نضيفة" accent="نضيفة" sub="جاهزة تسكن على طول" subAt={at("handover", "جاهزة")} size={100} top={1220} />

    <InsideOut from={section("brand")} to={section("cta")} insideAt={at("brand", "وضمير")} />
    <EndCard from={section("cta")} />
    <Watermark until={section("brand")} />

    <Audio name="التعليق الصوتي" src={staticFile("finishing-vo/voiceover.mp3")} />
    <Audio name="الموسيقى" src={staticFile("music/finishing-score.mp3")} volume={0.32} />
    {SOUNDS.map((s, i) => (
      <Sfx key={i} {...s} />
    ))}
    {TICKS.map((t, i) => (
      <Sfx key={`t${i}`} name="mk/ui-select-click" at={t + 2} volume={0.28} />
    ))}
  </AbsoluteFill>
);
