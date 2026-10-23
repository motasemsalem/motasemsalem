import { useCurrentFrame } from "remotion";
import { C, cue, pop, ramp, section } from "../cues";
import { FLOORS } from "../world/Building";
import { BRAND, headingFont } from "../theme";
import { Counter, WarrantySeal } from "./Overlays";
import { Phone } from "./Phone";
import { Beat, Chapter, SHADOW, Tick } from "./Type";

const FINISHES = [
  { at: C.plumbing, label: "سباكة" },
  { at: C.electric, label: "كهربا" },
  { at: C.insulation, label: "عزل" },
  { at: C.plaster, label: "محارة" },
  { at: C.marble, label: "رخام" },
  { at: C.paint, label: "دهانات" },
];

// "Floor N" counter while the storeys go up.
const FloorCount: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < C.floors || frame > C.team + 4) return null;
  const n = 1 + Math.min(FLOORS - 1, Math.floor(ramp(frame, C.floors, C.team, (x) => x) * FLOORS));
  const p = pop(frame, C.floors, 10) * (1 - pop(frame, C.team - 4, 8));
  return (
    <div dir="rtl" style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center", opacity: p, fontFamily: headingFont, color: "white", textShadow: SHADOW }}>
      <div style={{ fontSize: 46, fontWeight: 700 }}>الدور</div>
      <div key={n} style={{ fontSize: 260, fontWeight: 900, lineHeight: 1, color: BRAND.red }}>{n}</div>
    </div>
  );
};

// Every headline, chapter marker and info graphic, each placed on the word that triggers it.
export const Story: React.FC = () => {
  const frame = useCurrentFrame();
  const finishActive = FINISHES.filter((f) => frame >= f.at - 3).length - 1;
  return (
    <>
      {/* Hook */}
      <Beat from={0} to={cue("بس")} kicker="إنت دافع" title="تحويشة عمرك" accent="تحويشة عمرك" sub="في شقة" subAt={C.flat} size={118} top={230} />
      <Beat from={cue("بس") + 6} to={C.steel - 2} kicker="بس عمرك سألت نفسك" title="إيه اللي جوّه الحيطة؟" accent="جوّه" size={100} top={230} />
      {frame >= C.steel - 2 && frame < C.rewind && (
        <div dir="rtl" style={{ position: "absolute", top: 260, right: 70, display: "flex", flexDirection: "column", gap: 18, opacity: 1 - pop(frame, C.rewind - 6, 6) }}>
          <Tick at={C.steel} label="الحديد" />
          <Tick at={C.concrete} label="الخرسانة" />
          <Tick at={C.base} label="الأساس" active />
        </div>
      )}
      <Beat from={C.rewind} to={C.brand - 4} title="تعالى أوريك" accent="أوريك" size={150} top={560} />
      <Beat from={C.brand + 30} to={C.start - 4} title="وده اللي بنعمله كل يوم" size={68} top={1120} />

      {/* Build */}
      <Chapter num="01" label="الأساس" from={C.start} to={section("columns") - 4} />
      <Beat from={C.start} to={C.dig - 2} title="كل حاجة بتبدأ من تحت" accent="تحت" />
      <Beat from={C.dig} to={C.lean - 2} title="حفر بالمقاسات" accent="حفر" />
      <Beat from={C.lean} to={C.footings - 2} title="خرسانة نضافة" accent="نضافة" />
      <Beat from={C.footings} to={cue("لأن") - 2} title="قواعد مسلحة" accent="مسلحة" sub="بالحساب الإنشائي" subAt={C.calc} />
      <Beat from={cue("لأن")} to={section("columns") - 4} kicker="البيت القوي" title="بيبان من أساسه" accent="أساسه" sub="مش من دهانه" subAt={cue("مش")} />

      <Chapter num="02" label="الأعمدة" from={section("columns")} to={section("formwork") - 4} />
      <Beat from={section("columns")} to={C.rebar - 2} title="الأعمدة بتطلع" accent="بتطلع" />
      <Beat from={C.rebar} to={cue("وكل") - 2} title="حديد متربط" accent="حديد" sub="بإيد صنايعية فاهمة" subAt={cue("بإيد")} />
      <Beat from={cue("وكل")} to={C.pourColumns - 2} kicker="كل عمود" title="بيتراجع على الرسومات" accent="بيتراجع" sub="مع مهندس الموقع" subAt={cue("مهندس")} size={92} />
      <Beat from={C.pourColumns} to={section("formwork") - 4} title="وبعدين الصب" accent="الصب" />

      <Chapter num="03" label="الشدّة الخشب" from={section("formwork")} to={section("floors") - 4} />
      <Beat from={section("formwork")} to={C.posts - 2} kicker="على السطح" title="الشدّة بتتركب حتّة حتّة" accent="حتّة حتّة" size={92} />
      <Beat from={C.posts} to={C.level - 2} title="قوايم وعروق" accent="قوايم" />
      <Beat from={C.level} to={C.flatSlab - 2} title="متظبطة بالميزان" accent="بالميزان" />
      <Beat from={C.flatSlab} to={section("floors") - 4} title="مستوي" accent="مستوي" sub="من غير شرخ ولا ميل" subAt={cue("من", 3)} />

      <Chapter num="04" label="دور ورا دور" from={section("floors")} to={section("finishing") - 4} />
      <Beat from={section("floors")} to={C.team - 2} title="العمارة بتكبر" accent="بتكبر" />
      <FloorCount />
      <Beat from={C.team} to={C.heat - 2} title="فريقنا في الموقع" accent="فريقنا" sub="كل يوم" />
      <Beat from={C.heat} to={C.cold - 2} title="في حر الصيف" accent="حر الصيف" />
      <Beat from={C.cold} to={section("finishing") - 4} title="وفي برد الشتا" accent="برد الشتا" />

      <Chapter num="05" label="التشطيب" from={section("finishing")} to={section("bathroom") - 4} />
      <Beat from={C.shell} to={C.turnkey - 2} kicker="ومش بنقف" title="عند العضم!" accent="العضم" size={120} />
      <Beat from={C.turnkey} to={C.design - 2} title="على المفتاح" accent="المفتاح" kicker="تشطيب كامل" size={96} top={200} />
      {frame >= C.plumbing - 3 && frame < C.design && (
        <div dir="rtl" style={{ position: "absolute", top: 520, right: 70, display: "flex", flexDirection: "column", gap: 14, opacity: 1 - pop(frame, C.design - 6, 6) }}>
          {FINISHES.map((f, i) => (
            <Tick key={f.label} at={f.at} label={f.label} active={i === finishActive} />
          ))}
        </div>
      )}
      <Beat from={C.design} to={C.see - 2} title="تصميم 3D" accent="3D" size={130} />
      <Beat from={C.see} to={section("bathroom") - 4} title="شوف بيتك" accent="بيتك" sub="قبل ما يتبني" />

      <Chapter num="06" label="مصنعنا" from={section("bathroom")} to={section("stats") - 8} />
      <Beat from={C.bath + 14} to={C.units - 2} title="مصنعنا الخاص" accent="الخاص" />
      <Beat from={C.units} to={C.water - 2} kicker="وحدات حمام" title="بورديوم" accent="بورديوم" size={120} />
      <Beat from={C.water} to={C.warranty - 2} title="مقاومة للمية" accent="للمية" sub="100%" />
      <WarrantySeal />

      <Chapter num="07" label="أرقامنا" from={section("stats")} to={section("closing") - 4} />
      <Counter to={500} prefix="+" label="مشروع" from={C.projects - 6} until={C.projectsEnd + 10} x={560} />
      <Counter to={12} label="سنة خبرة" from={C.years} until={C.yearsEnd} x={60} />
      {frame >= C.contracts - 3 && frame < C.follow && (
        <div dir="rtl" style={{ position: "absolute", top: 760, left: 120, right: 120, display: "flex", flexDirection: "column", gap: 18, opacity: 1 - pop(frame, C.follow - 6, 6) }}>
          <Tick at={C.contracts} label="عقود واضحة" />
          <Tick at={C.deadlines} label="مواعيد تسليم بنلتزم بيها" />
        </div>
      )}
      {frame < section("closing") + 6 && (
        <div style={{ opacity: 1 - pop(frame, section("closing") - 6, 10) }}>
          <Phone start={C.follow - 4} updates={["تحديث جديد من موقعك", "صور شغل النهارده", "تم صب سقف الدور التالت"]} top={420} />
        </div>
      )}
    </>
  );
};
