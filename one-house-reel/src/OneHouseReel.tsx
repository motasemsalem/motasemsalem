import { chromaticAberration } from "@remotion/effects/chromatic-aberration";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, staticFile, useVideoConfig } from "remotion";
import { C, clamp, cue, easeInOut, section } from "./cues";
import { shot, Shot, SHOTS, type ShotStyle } from "./footage/Shot";
import { BrandReveal, EndCard } from "./overlay/Brand";
import { Callout, Chapter, Flash, Leak, Legibility, RewindFx, ScanLine, Title, XrayHud } from "./overlay/Cine";
import { Checklist, Counter, Seal } from "./overlay/Info";
import { Phone } from "./overlay/Phone";
import { Sfx } from "./overlay/Sound";
import { Subtitles } from "./overlay/Subtitles";

const BLUE = "#8fd6ff";
const scan = { from: C.inside, to: C.steel };

// Per-shot grade, camera move and cut energy. Shots not listed use the film look with a medium punch-in.
const STYLES: Record<string, ShotStyle> = {
  "hook-tower": { move: "in", punch: 0, look: "film" },
  "hook-room": { move: "in", punch: 0.4, look: "warm" },
  "hook-wall": { move: "in", punch: 0.3, look: "warm" },
  "xray-steel": { look: "xray", punch: 1 },
  "xray-concrete": { look: "xray", punch: 1 },
  "xray-base": { look: "xray", punch: 1, move: "down" },
  rewind: { punch: 0, move: "out", effects: () => [chromaticAberration({ amount: 0.01 })] },
  brand: { look: "warm", move: "out", punch: 0 },
  "brand-crane": { look: "warm", move: "in", punch: 0.3 },
  aerial: { move: "in", punch: 1 },
  heat: { look: "warm", move: "in" },
  cold: { look: "cold", move: "left" },
  turnkey: { look: "clean", move: "in" },
  design: { look: "clean", move: "in", punch: 0.8 },
  villa: { look: "clean", move: "left" },
  factory: { look: "night", punch: 1 },
  bath: { look: "clean", move: "down", punch: 0.8 },
  water: { look: "clean" },
  warranty: { look: "clean", move: "in" },
  cairo: { look: "warm", move: "right", punch: 1 },
  years: { move: "in" },
  brick: { look: "warm", punch: 1, move: "in" },
  key: { look: "clean", move: "in", punch: 0.5 },
  cta: { look: "warm", move: "in" },
  end: { look: "warm", move: "out", punch: 0.2 },
};

// Section openings get a bigger transition: a flash, a light leak and a whoosh-impact.
const OPENINGS = [section("foundation"), section("columns"), section("formwork"), section("floors"), section("finishing"), section("bathroom"), section("stats"), section("closing")];

export const OneHouseReel: React.FC = () => {
  const { durationInFrames } = useVideoConfig();
  const wall = shot("hook-wall");
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Audio name="التعليق الصوتي" src={staticFile("voiceover/voiceover.mp3")} />
      <Audio name="موسيقى" src={staticFile("music/score.mp3")} durationInFrames={durationInFrames} volume={0.85} />

      {SHOTS.map((s, i) => (
        <Shot key={s.name} name={s.name} index={i} style={STYLES[s.name]} />
      ))}
      {/* The wall turns to x-ray behind the scan line. */}
      <Shot
        name="hook-wall"
        index={2}
        style={{
          ...STYLES["hook-wall"],
          look: "xray",
          wrap: (f) => {
            const y = interpolate(f + wall.from, [scan.from, scan.to], [0, 100], { ...clamp, easing: easeInOut });
            return { clipPath: `inset(0 0 ${100 - y}% 0)` };
          },
        }}
      />
      <ScanLine from={scan.from} to={scan.to} />
      <XrayHud from={scan.to - 6} to={C.rewind} />
      <RewindFx from={C.rewind} to={C.brand} />
      <Flash at={C.steel} color={BLUE} peak={0.5} length={8} />
      <Flash at={C.brand} peak={1} length={14} />
      <Leak at={C.brand + 2} length={40} seed={3} />
      {OPENINGS.map((f, i) => (
        <span key={f}>
          <Flash at={f} color="#ffd2a0" peak={0.45} length={8} />
          <Leak at={f} length={22} seed={i + 5} peak={0.6} />
        </span>
      ))}
      <Legibility />

      <Story />
      <BrandReveal />
      <EndCard />
      <Subtitles hidden={(f) => (f >= C.rewind && f < C.start) || f >= C.cta - 10} />
      <SoundDesign />
    </AbsoluteFill>
  );
};

// Headlines, chapter markers, engineering callouts and info graphics, each on the word that triggers it.
const Story: React.FC = () => (
  <>
    {/* Hook */}
    <Title from={0} to={cue("بس") - 2} kicker="إنت دافع" kickerAt={0} text="تحويشة عمرك" accent="عمرك" sub="في شقة" subAt={C.flat} size={130} top={260} />
    <Title from={cue("إيه")} to={C.steel - 4} kicker="بس عمرك سألت نفسك" kickerAt={cue("بس") + 2} text="إيه اللي جوّه الحيطة؟" accent="جوّه" size={104} top={260} />
    <Callout at={C.steel + 2} to={C.concrete - 2} x={660} y={1080} dx={-200} dy={-260} label="حديد التسليح" value="Ø 16 mm" color={BLUE} />
    <Callout at={C.concrete + 2} to={C.base - 2} x={380} y={980} dx={200} dy={-240} label="الخرسانة" value="C30 · 300 kg/cm²" color={BLUE} />
    <Callout at={C.base + 2} to={C.rewind - 2} x={660} y={1150} dx={-200} dy={-300} label="الأساس" value="−3.50 m" color={BLUE} />
    <Title from={C.rewind} to={C.brand - 4} text="تعالى أوريك" accent="أوريك" size={150} top={780} />

    {/* 01 Foundation */}
    <Chapter num={1} label="الأساس" from={section("foundation")} to={section("columns") - 4} />
    <Title from={section("foundation")} to={C.dig - 2} text="كل حاجة بتبدأ من تحت" accent="تحت" size={100} />
    <Title from={C.dig} to={C.lean - 2} text="حفر بالمقاسات" accent="حفر" />
    <Callout at={C.dig + 8} to={C.lean - 2} x={430} y={1050} dx={250} dy={200} label="منسوب الحفر" value="−3.50 m" />
    <Title from={C.lean} to={C.footings - 2} text="خرسانة نضافة" accent="نضافة" />
    <Title from={C.footings} to={cue("لأن") - 2} text="قواعد مسلحة" accent="مسلحة" sub="بالحساب الإنشائي" subAt={C.calc} />
    <Title from={cue("لأن")} to={section("columns") - 4} kicker="البيت القوي" kickerAt={cue("لأن")} text="بيبان من أساسه" accent="أساسه" sub="مش من دهانه" subAt={cue("مش")} size={104} />

    {/* 02 Columns */}
    <Chapter num={2} label="الأعمدة" from={section("columns")} to={section("formwork") - 4} />
    <Title from={section("columns")} to={C.rebar - 2} text="الأعمدة بتطلع" accent="بتطلع" />
    <Title from={C.rebar} to={cue("وكل") - 2} text="حديد متربط" accent="حديد" sub="بإيد صنايعية فاهمة" subAt={cue("بإيد")} />
    <Title from={cue("وكل")} to={cue("قبل") - 2} kicker="كل عمود" kickerAt={cue("وكل")} text="بيتراجع على الرسومات" accent="الرسومات" sub="مع مهندس الموقع" subAt={cue("مهندس")} size={96} />
    <Callout at={cue("الرسومات")} to={cue("مهندس") - 2} x={330} y={1120} dx={260} dy={-180} label="مراجعة هندسية" value="✓ OK" />
    <Title from={cue("قبل")} to={section("formwork") - 4} text="قبل ما نقرّب للخرسانة" accent="للخرسانة" size={96} />

    {/* 03 Formwork */}
    <Chapter num={3} label="الشدّة" from={section("formwork")} to={section("floors") - 4} />
    <Title from={section("formwork")} to={C.posts - 2} kicker="وعلى السطح" kickerAt={section("formwork")} text="الشدّة الخشب" accent="الخشب" sub="بتتركب حتّة حتّة" subAt={C.props} />
    <Title from={C.posts} to={cue("علشان") - 2} text="قوايم وعروق" accent="قوايم" sub="متظبطة بالميزان" subAt={cue("متظبطة")} />
    <Callout at={C.level} to={cue("علشان") - 2} x={700} y={1100} dx={-220} dy={180} label="ميزان الليزر" value="± 2 mm" />
    <Title from={cue("علشان")} to={cue("من", 3) - 2} text="السقف يتصب مستوي" accent="مستوي" />
    <Title from={cue("من", 3)} to={section("floors") - 4} text="من غير شرخ ولا ميل" accent="شرخ ميل" size={100} />

    {/* 04 Floors */}
    <Chapter num={4} label="دور ورا دور" from={section("floors")} to={section("finishing") - 4} />
    <Title from={section("floors")} to={C.team - 2} kicker="دور ورا دور" kickerAt={section("floors")} text="العمارة بتكبر" accent="بتكبر" />
    <Title from={C.team} to={C.heat - 4} text="فريقنا في الموقع" accent="فريقنا" sub="كل يوم" subAt={cue("كل", 2)} />
    <Title from={C.heat - 2} to={cue("وفي") - 2} text="في حر الصيف" accent="الصيف" />
    <Callout at={cue("حر") + 2} to={cue("وفي") - 2} x={700} y={760} dx={-220} dy={260} label="حر الصيف" value="42 °C" color="#ffb36b" />
    <Title from={cue("وفي")} to={section("finishing") - 4} text="وفي برد الشتا" accent="الشتا" />

    {/* 05 Finishing */}
    <Chapter num={5} label="التشطيب" from={section("finishing")} to={section("bathroom") - 4} />
    <Title from={C.shell} to={cue("بنكمّل") - 2} kicker="ومش بنقف" kickerAt={C.shell} text="عند العضم!" accent="العضم!" size={130} />
    <Title from={cue("بنكمّل")} to={C.plumbing - 2} kicker="تشطيب كامل" kickerAt={cue("بنكمّل")} text="على المفتاح" accent="المفتاح" size={120} />
    {[
      [C.plumbing, C.electric, "سباكة"],
      [C.electric, C.insulation, "كهربا"],
      [C.insulation, C.plaster, "عزل"],
      [C.plaster, C.marble, "محارة"],
      [C.marble, C.paint, "رخام"],
      [C.paint, C.design, "دهانات"],
    ].map(([a, b, label], i) => (
      <Title key={label} from={a as number} to={(b as number) - 2} kicker={`0${i + 1} / 06`} kickerAt={a as number} text={label as string} accent={label as string} size={150} top={320} />
    ))}
    <Title from={C.design} to={C.see - 2} kicker="تصميم تلاتي الأبعاد" kickerAt={C.design} text="3D" accent="3D" size={190} top={300} />
    <Title from={C.see} to={section("bathroom") - 4} text="شوف بيتك" accent="بيتك" sub="قبل ما يتبني" subAt={cue("قبل", 1)} size={120} />

    {/* 06 Factory */}
    <Chapter num={6} label="مصنعنا" from={section("bathroom")} to={section("stats") - 4} />
    <Title from={section("bathroom")} to={C.units - 2} kicker="وكمان عندنا" kickerAt={section("bathroom")} text="مصنعنا الخاص" accent="الخاص" />
    <Title from={C.units} to={C.water - 2} kicker="وحدات حمام" kickerAt={C.units} text="البورديوم" accent="البورديوم" size={130} />
    <Title from={C.water} to={C.warranty - 2} text="مقاومة للمية" accent="للمية" sub="100%" subAt={C.water + 8} />
    <Seal at={C.warranty} hide={section("stats") - 4} />

    {/* 07 Numbers */}
    <Chapter num={7} label="أرقامنا" from={section("stats")} to={section("closing") - 4} />
    <Counter to={500} prefix="+" label="مشروع" from={C.stats + 4} until={C.projectsEnd + 8} hide={C.years - 4} />
    <Counter to={12} label="سنة خبرة" from={C.years} until={C.yearsEnd + 4} hide={C.contracts - 3} />
    <Checklist
      top={360}
      hide={C.follow - 4}
      items={[
        { at: C.contracts, label: "عقود واضحة" },
        { at: C.deadlines, label: "مواعيد تسليم بنلتزم بيها" },
      ]}
    />
    <Title from={C.follow} to={section("closing") - 4} text="متابع معانا خطوة بخطوة" accent="خطوة بخطوة" size={84} top={250} />
    <Phone start={C.follow + 4} updates={["تحديث جديد من موقعك", "صور شغل النهارده", "تم صب سقف الدور التالت"]} top={560} hide={section("closing") - 6} />

    {/* Closing */}
    <Title from={section("closing")} to={cue("لحد") - 2} kicker="ون هاوس" kickerAt={section("closing")} text="من أول طوبة" accent="طوبة" size={124} />
    <Title from={cue("لحد")} to={C.cta - 12} text="لحد ما تستلم المفتاح" accent="المفتاح" size={104} />
  </>
);

// Sound effects on their cues; they dip under the narrator automatically.
const SoundDesign: React.FC = () => (
  <>
    <Sfx name="mk/impact-deep-whoosh" at={0} volume={0.5} />
    <Sfx name="mk/data-scan" at={scan.from - 2} volume={0.55} />
    <Sfx name="mk/bass-hit-futuristic" at={C.steel} volume={0.45} />
    <Sfx name="mk/ui-notify-tech" at={C.steel + 6} volume={0.3} />
    <Sfx name="mk/ui-notify-tech" at={C.concrete + 6} volume={0.3} />
    <Sfx name="mk/ui-notify-tech" at={C.base + 6} volume={0.3} />
    <Sfx name="mk/tape-rewind-cine" at={C.rewind} volume={0.6} />
    <Sfx name="riser" at={C.brand - 48} volume={0.35} />
    <Sfx name="mk/impact-epic-trailer" at={C.brand} volume={0.8} />
    <Sfx name="mk/shimmer-sparkle-sweep" at={C.brand + 8} volume={0.35} />
    {OPENINGS.map((f) => (
      <span key={f}>
        <Sfx name="mk/whoosh-fast" at={f - 8} volume={0.45} />
        <Sfx name="mk/impact-cine-big" at={f} volume={0.3} />
      </span>
    ))}
    <Sfx name="mk/gravel-fall-hit" at={C.dig + 2} volume={0.45} />
    <Sfx name="mk/bass-hit-short" at={C.footings} volume={0.4} />
    <Sfx name="mk/data-compute" at={C.calc} volume={0.25} />
    <Sfx name="mk/metal-spring-hit" at={C.rebar} volume={0.35} />
    <Sfx name="mk/ui-confirm-tone" at={cue("الرسومات") + 10} volume={0.35} />
    <Sfx name="mk/gear-lock-metallic" at={C.posts} volume={0.35} />
    <Sfx name="mk/lock-quick" at={C.level} volume={0.35} />
    <Sfx name="mk/air-whoosh-powerful" at={section("floors") + 2} volume={0.35} />
    {[C.plumbing, C.electric, C.insulation, C.plaster, C.marble, C.paint].map((f) => (
      <Sfx key={f} name="mk/transition-snap" at={f - 2} volume={0.35} />
    ))}
    <Sfx name="mk/sweep-scifi-fast" at={C.design - 4} volume={0.35} />
    <Sfx name="mk/metal-spring-hit" at={section("bathroom")} volume={0.3} />
    <Sfx name="mk/water-splash" at={C.water} volume={0.45} />
    <Sfx name="mk/stomp-apocalyptic" at={C.warranty} volume={0.45} />
    <Sfx name="mk/data-compute" at={C.stats + 4} volume={0.22} />
    <Sfx name="mk/bass-hit-short" at={C.projectsEnd + 8} volume={0.35} />
    <Sfx name="mk/bass-hit-short" at={C.yearsEnd + 4} volume={0.35} />
    <Sfx name="mk/ui-confirm-tone" at={C.contracts + 2} volume={0.35} />
    <Sfx name="mk/ui-confirm-tone" at={C.deadlines + 2} volume={0.35} />
    {[0, 1, 2].map((i) => (
      <Sfx key={i} name="mk/ui-message-pop" at={C.follow + 14 + i * 9} volume={0.35} />
    ))}
    <Sfx name="keys" at={C.key} volume={0.35} />
    <Sfx name="mk/shimmer-sparkle-sweep" at={C.key} volume={0.3} />
    <Sfx name="mk/ui-confirm-tone" at={C.cta} volume={0.35} />
  </>
);
