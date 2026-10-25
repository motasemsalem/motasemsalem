import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Flash, Title } from "../overlay/Cine";
import { at, section, TOTAL } from "./cues";
import { Finish, LightLeak, type PanelDef, Panels, type ShotDef, Sfx, Shots } from "./kit";
import { SCENES, type SceneId } from "./narration";
import { EndCard, Gauge, InsideOut, Laser, Phone, Quote, Trade, Watermark, WaterTest } from "./overlays";

// One House finishing reel (1080x1920): the client's journey from the first visit to the keys, every trade on
// real photos and clips, cut word by word to the voiceover in public/finishing-vo. Script: FINISHING-SCRIPT.md.

const next = (id: SceneId) => {
  const i = SCENES.findIndex((s) => s.id === id);
  return i + 1 < SCENES.length ? section(SCENES[i + 1].id) : TOTAL;
};

// One shot per phrase (two where the line turns), so each picture stays up long enough to read.
// The list lines (materials, systems, floors, paint, carpentry, fittings) are split screens, see PANELS.
const SHOTS: ShotDef[] = [
  { media: "contract", from: at("hook"), look: "site" },
  { media: "brief", from: at("promise") },
  { media: "level-room", from: at("visit"), look: "site" },
  { media: "listen", from: at("visit", "ويسمع") },
  { media: "designer", from: at("design") },
  { media: "render-room", from: at("design", "تشوف") },
  { media: "samples", from: at("materials") },
  { media: "porcelain", from: at("materials", "بورسلين") },
  { media: "quote", from: at("quote"), look: "site" },
  { media: "luxe-white", from: at("hidden") },
  { media: "conduits", from: at("hidden", "باين"), look: "xray" },
  { media: "demolition", from: at("demo"), look: "site" },
  { media: "drilling", from: at("electric"), look: "site", focus: 0.42 },
  { media: "wires", from: at("electric", "وسلك"), look: "site" },
  { media: "pipes", from: at("plumbing"), look: "site" },
  { media: "wrench", from: at("plumbing", "قبل"), look: "site" },
  { media: "screed", from: at("insulation"), look: "site", focus: 0.45 },
  { media: "ac", from: at("systems") },
  { media: "straightedge", from: at("plaster"), look: "site" },
  { media: "luxe-lights", from: at("luxe") },
  { media: "cove", from: at("gypsum") },
  { media: "tiling", from: at("floors") },
  { media: "roller", from: at("paint") },
  { media: "kitchen", from: at("carpentry") },
  { media: "slider", from: at("fittings") },
  { media: "villa", from: at("villa") },
  { media: "landscape", from: at("villa", "ولاندسكيب") },
  { media: "skim", from: at("follow"), look: "site" },
  { media: "cleaning", from: at("handover") },
  { media: "move-in", from: at("handover", "جاهزة") },
];

// Split screens: one band per item, each on its word.
const PANELS: { id: SceneId; heading: string; from: number; rows: PanelDef[] }[] = [
  {
    id: "materials",
    heading: "اختار خاماتك بإيدك",
    from: at("materials", "بورسلين"),
    rows: [
      { media: "porcelain", at: at("materials", "بورسلين"), label: "بورسلين" },
      { media: "marble", at: at("materials", "رخام"), label: "رخام" },
      { media: "parquet", at: at("materials", "باركيه"), label: "باركيه", focusY: 0.7 },
      { media: "colors", at: at("materials", "وألوانك"), label: "وألوانك" },
    ],
  },
  {
    id: "systems",
    heading: "تأسيس الأنظمة",
    from: at("systems"),
    rows: [
      { media: "ac", at: at("systems", "تكييف"), label: "تكييف", focusY: 0.3 },
      { media: "tv", at: at("systems", "ونت"), label: "نت ودش", focusY: 0.45 },
      { media: "cctv", at: at("systems", "وكاميرات"), label: "كاميرات", focusY: 0.45 },
      { media: "smart", at: at("systems", "وسمارت"), label: "سمارت هوم", focusY: 0.5 },
    ],
  },
  {
    id: "floors",
    heading: "أرضيات بالميزان",
    from: at("floors"),
    rows: [
      { media: "tiling", at: at("floors"), label: "بورسلين" },
      { media: "marble-floor", at: at("floors", "ورخام"), label: "رخام", focusY: 0.7 },
      { media: "parquet", at: at("floors", "وباركيه"), label: "باركيه", focusY: 0.75 },
    ],
  },
  {
    id: "paint",
    heading: "دهانات وتجاليد",
    from: at("paint"),
    rows: [
      { media: "roller", at: at("paint"), label: "دهانات", focusY: 0.4 },
      { media: "panelled", at: at("paint", "وورق"), label: "ورق حائط", focusY: 0.4 },
      { media: "wood-clad", at: at("paint", "وتجاليد"), label: "تجاليد خشب", focusY: 0.45 },
    ],
  },
  {
    id: "carpentry",
    heading: "نجارة على المقاس",
    from: at("carpentry"),
    rows: [
      { media: "kitchen", at: at("carpentry"), label: "مطابخ", focusY: 0.55 },
      { media: "closet", at: at("carpentry", "ودريسنج"), label: "دريسنج" },
      { media: "door", at: at("carpentry", "وأبواب"), label: "أبواب", focusY: 0.45 },
    ],
  },
  {
    id: "fittings",
    heading: "وكل التركيبات",
    from: at("fittings"),
    rows: [
      { media: "slider", at: at("fittings"), label: "ألوميتال", focusY: 0.45 },
      { media: "bath", at: at("fittings", "وأطقم"), label: "أطقم حمامات", focusY: 0.55 },
      { media: "lights", at: at("fittings", "وكل"), label: "إضاءة وكهرباء", focusY: 0.35 },
    ],
  },
];


// Whooshes on the section cuts, ticks on the checks, and a few literal sounds.
const SOUNDS: { name: string; at: number; volume?: number }[] = [
  ...SCENES.slice(1, -2).map((s) => ({ name: "mk/whoosh-fast", at: section(s.id) - 6, volume: 0.16 })),
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
    <Flash at={at("hidden", "باين")} color="#8fd8ff" peak={0.35} />
    <Flash at={at("brand")} peak={0.5} />

    {/* One card for the whole hook: the warning, then the ask under it. */}
    <Title from={at("hook")} to={at("promise") - 2} text="قبل ما تمضي عقد تشطيب…" accent="عقد" sub="اتفرج على ده للآخر" subAt={at("hook", "اتفرج")} size={92} top={1240} />
    <Title from={at("promise", "هتعرف")} to={next("promise") - 2} kicker="في ون هاوس" kickerAt={at("promise")} text="هتعرف كل خطوة قبل ما تحصل" accent="خطوة" size={92} top={1200} />
    <Title from={at("visit", "معاينة")} to={next("visit") - 2} kicker="مهندس بينزلك" kickerAt={at("visit")} text="معاينة ببلاش" accent="ببلاش" sub="يقيس… ويسمع إنت عاوز إيه" subAt={at("visit", "يقيس")} size={110} top={1200} />
    <Title from={at("design")} to={next("design") - 2} text="تصميم 3D" accent="3D" sub="تشوف شقتك قبل ما نبدأ" subAt={at("design", "تشوف")} size={120} top={1240} />
    <Title from={at("materials")} to={at("materials", "بورسلين") - 2} text="وتختار خاماتك بإيدك" accent="بإيدك" size={96} top={1260} />
    {PANELS.map((p) => (
      <Panels key={p.id} from={p.from} to={next(p.id) - 2} heading={p.heading} rows={p.rows} />
    ))}
    <Quote from={at("quote")} contractAt={at("quote", "وعقد")} stampAt={at("quote", "ومفيش")} to={next("quote") - 2} />
    <Title from={at("hidden")} to={next("hidden") - 2} text="نبدأ باللي مش باين" accent="مش باين" sub="لأنه أهم حاجة" subAt={at("hidden", "لأنه")} size={100} top={1240} />

    {/* Test graphics sit under the trade labels. */}
    <Gauge from={at("plumbing", "مواسير")} to={next("plumbing") - 2} holdAt={at("plumbing", "الحيطة")} />
    <WaterTest from={at("insulation", "ومية")} to={next("insulation") - 2} doneAt={at("insulation", "البلاط")} />
    <Trade from={at("demo")} to={next("demo") - 2} n={1} of={5} name="تكسير وتجديد" points={[{ at: at("demo", "لو"), text: "لو الشقة قديمة" }]} />
    <Trade
      from={at("electric")}
      to={next("electric") - 2}
      n={2}
      of={5}
      name="كهربا"
      points={[
        { at: at("electric", "كل"), text: "كل دايرة لوحدها" },
        { at: at("electric", "وسلك"), text: "سلك بالمقاس الصح" },
      ]}
    />
    <Trade from={at("plumbing")} to={next("plumbing") - 2} n={3} of={5} name="سباكة" points={[{ at: at("plumbing", "بالضغط"), text: "اختبار ضغط قبل ما الحيطة تتقفل" }]} />
    <Trade from={at("insulation")} to={next("insulation") - 2} n={4} of={5} name="عزل الحمامات والمطابخ" points={[{ at: at("insulation", "ومية"), text: "مية تقعد يومين قبل البلاط" }]} />
    <Trade from={at("plaster")} to={next("plaster") - 2} n={5} of={5} name="محارة بالميزان" points={[{ at: at("plaster", "الحيطة"), text: "الحيطة مستقيمة" }]} />
    <Laser from={at("plaster", "بالميزان")} to={next("plaster") - 2} okAt={at("plaster", "المسطرة")} />

    <Title from={at("luxe", "تيجي")} to={next("luxe") - 2} kicker="وبعدين" kickerAt={at("luxe")} text="تيجي الشياكة" accent="الشياكة" size={130} top={1180} />
    <Title from={at("gypsum")} to={next("gypsum") - 2} text="جبس بورد وإضاءة مخفية" accent="مخفية" size={96} top={1240} />
    <Title from={at("villa", "واجهات")} to={next("villa") - 2} kicker="ولو فيلا" kickerAt={at("villa")} text="واجهات ولاندسكيب" accent="ولاندسكيب" size={100} top={1240} />

    {/* Dim the room behind the phone. */}
    <Sequence from={at("follow")} durationInFrames={next("follow") - at("follow")} layout="none">
      <AbsoluteFill style={{ background: "rgba(2,10,22,0.55)", backdropFilter: "blur(6px)" }} />
    </Sequence>
    <Phone
      from={at("follow")}
      to={next("follow") - 2}
      messages={[
        { at: at("follow", "كل"), photo: "drilling", text: "الكهربا خلصت" },
        { at: at("follow", "بالصور"), photo: "straightedge", text: "المحارة خلصت" },
        { at: at("follow", "مسافر"), photo: "tiling", text: "البلاط خلص" },
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
