import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRAND, bodyFont, headingFont } from "../theme";
import media from "../posts/photos.json";

// The company profile sent to serious leads: A4 portrait pages (1240x1754, 150 dpi), in the
// "engineer's eye" style of social/BRAND.md. scripts/profile-pdf.py renders the pages and joins them into a PDF.
// Same limits as the posts: no prices, warranties, payment plans, testimonials or phone numbers.

export const PAGE_W = 1240;
export const PAGE_H = 1754;
const MEDIA: Record<string, { file: string }> = media;
const photo = (name: string) => staticFile(MEDIA[name].file);

const Grid: React.FC<{ readonly color: string; readonly step?: number }> = ({ color, step = 62 }) => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: `${step}px ${step}px` }} />
);

const Kicker: React.FC<{ readonly text: string; readonly color: string }> = ({ text, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: bodyFont, fontWeight: 600, fontSize: 32, color }}>
    <div style={{ width: 54, height: 4, background: BRAND.red }} />
    {text}
  </div>
);

const H: React.FC<{ readonly children: React.ReactNode; readonly color?: string; readonly size?: number }> = ({ children, color = BRAND.navy, size = 84 }) => (
  <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: size, lineHeight: 1.18, color }}>{children}</div>
);

// Page footer: logo, page number, site.
const Foot: React.FC<{ readonly n: number; readonly dark?: boolean }> = ({ n, dark }) => (
  <div style={{ position: "absolute", left: 90, right: 90, bottom: 70, display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `2px solid ${dark ? "rgba(95,168,255,0.35)" : "rgba(6,36,72,0.18)"}`, paddingTop: 26 }}>
    <div style={{ fontFamily: headingFont, fontWeight: 600, fontSize: 24, color: dark ? BRAND.steel : BRAND.dim, direction: "ltr" }}>{String(n).padStart(2, "0")} / 06</div>
    <Img src={staticFile(dark ? "brand/logo-white.png" : "brand/logo-color.png")} style={{ width: 130 }} />
  </div>
);

const Page: React.FC<{ readonly dark?: boolean; readonly children: React.ReactNode }> = ({ dark, children }) => (
  <AbsoluteFill dir="rtl" style={{ background: dark ? BRAND.navy : BRAND.paper }}>
    <Grid color={dark ? "rgba(95,168,255,0.08)" : "rgba(6,36,72,0.045)"} />
    {children}
  </AbsoluteFill>
);

const Cover: React.FC = () => (
  <AbsoluteFill dir="rtl" style={{ background: BRAND.navy }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1060, overflow: "hidden" }}>
      <Img src={photo("villa-dusk")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 55%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,36,72,0.35) 0%, rgba(6,36,72,0) 35%, rgba(6,36,72,0.2) 70%, rgba(6,36,72,1) 100%)" }} />
    </div>
    <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", right: 90, top: 90, width: 260 }} />
    <div style={{ position: "absolute", right: 90, left: 90, top: 1000 }}>
      <Kicker text="ملف الشركة" color={BRAND.steel} />
      <div style={{ marginTop: 26 }}>
        <H color="white" size={120}>
          اتبنى <span style={{ color: BRAND.red, marginRight: "0.2em" }}>صح</span>
          <br />
          من أول طوبة
        </H>
      </div>
      <div style={{ marginTop: 34, fontFamily: bodyFont, fontWeight: 600, fontSize: 38, lineHeight: 1.5, color: BRAND.steel }}>مقاولات وتشطيبات وتجديد، بعين المهندس، من الأساس لآخر لمبة.</div>
    </div>
    <div style={{ position: "absolute", left: 90, right: 90, bottom: 80, display: "flex", justifyContent: "space-between", fontFamily: headingFont, fontWeight: 600, fontSize: 26, color: BRAND.steel, direction: "ltr" }}>
      <span>ONE HOUSE</span>
      <span>onehouse-eg.web.app</span>
    </div>
  </AbsoluteFill>
);

const PILLARS = [
  { t: "مهندس واحد مسؤول قدامك", d: "من أول معاينة لحد ما تستلم مفتاحك، فيه مهندس واحد عارف كل تفصيلة في شغلك." },
  { t: "كل حاجة مكتوبة", d: "المواصفات والخامات ومعاد التسليم في العقد. اللي اتفقنا عليه هو اللي بيتنفذ." },
  { t: "متابع كل مرحلة بالصور", d: "تقارير وصور من الموقع أول بأول، حتى لو إنت مسافر." },
];
const About: React.FC = () => (
  <Page>
    <div style={{ position: "absolute", right: 90, left: 90, top: 120 }}>
      <Kicker text="مين إحنا" color={BRAND.dim} />
      <div style={{ marginTop: 26 }}>
        <H>
          عين المهندس
          <br />
          على <span style={{ color: BRAND.red, marginRight: "0.2em" }}>بيتك</span>
        </H>
      </div>
      <div style={{ marginTop: 34, fontFamily: bodyFont, fontWeight: 400, fontSize: 36, lineHeight: 1.65, color: BRAND.ink }}>
        ون هاوس شركة مقاولات وتشطيبات. أغلب اللي بيقلق أي حد بيبني أو بيشطّب هو اللي مش باين: الحديد جوه العمود، والمواسير جوه الحيطة، والعزل تحت البلاط. وإحنا شغلنا إننا نخلّي ده كله باين ومتراجع قبل ما يتقفل عليه.
      </div>
    </div>
    <div style={{ position: "absolute", right: 90, left: 90, top: 860, display: "flex", flexDirection: "column", gap: 28 }}>
      {PILLARS.map((p, i) => (
        <div key={p.t} style={{ display: "flex", gap: 32, alignItems: "flex-start", background: "white", padding: "34px 38px", boxShadow: "0 12px 30px rgba(6,36,72,0.08)", borderRight: `8px solid ${BRAND.red}` }}>
          <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 64, color: BRAND.blueprint, lineHeight: 1, direction: "ltr" }}>{String(i + 1).padStart(2, "0")}</div>
          <div>
            <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 40, color: BRAND.navy }}>{p.t}</div>
            <div style={{ marginTop: 10, fontFamily: bodyFont, fontWeight: 400, fontSize: 30, lineHeight: 1.55, color: BRAND.dim }}>{p.d}</div>
          </div>
        </div>
      ))}
    </div>
    <Foot n={2} />
  </Page>
);

const STRUCTURE = ["الحفر والأساسات", "الأعمدة والكمرات", "الأسقف والصبّات", "المباني", "متابعة الحديد والخرسانة في كل صبّة"];
const FINISHING = ["تأسيس الكهرباء والسباكة", "عزل الحمامات والمطابخ والأسطح", "المحارة بالميزان", "الجبس بورد والإضاءة", "البورسلين والرخام والباركيه", "الدهانات وورق الحائط", "المطابخ والدريسنج والأبواب", "تأسيس التكييف والنت والكاميرات والسمارت هوم", "الواجهات واللاندسكيب للفيلات"];
const ServiceCol: React.FC<{ readonly title: string; readonly img: string; readonly items: readonly string[] }> = ({ title, img, items }) => (
  <div style={{ flex: 1, background: "white", boxShadow: "0 12px 30px rgba(6,36,72,0.08)" }}>
    <div style={{ height: 300, overflow: "hidden", position: "relative" }}>
      <Img src={photo(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", right: 0, bottom: 0, padding: "12px 28px", background: BRAND.navy, fontFamily: headingFont, fontWeight: 800, fontSize: 40, color: "white" }}>{title}</div>
    </div>
    <div style={{ padding: "26px 30px" }}>
      {items.map((t) => (
        <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, padding: "13px 0", borderBottom: "2px dashed rgba(6,36,72,0.12)", fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color: BRAND.ink }}>
          <div style={{ width: 14, height: 14, background: BRAND.red, flex: "none" }} />
          {t}
        </div>
      ))}
    </div>
  </div>
);
const Services: React.FC = () => (
  <Page>
    <div style={{ position: "absolute", right: 90, left: 90, top: 120 }}>
      <Kicker text="خدماتنا" color={BRAND.dim} />
      <div style={{ marginTop: 26 }}>
        <H>
          من الأساس
          <br />
          لآخر <span style={{ color: BRAND.red, marginRight: "0.2em" }}>لمبة</span>
        </H>
      </div>
    </div>
    <div style={{ position: "absolute", right: 90, left: 90, top: 470, display: "flex", gap: 34, alignItems: "flex-start" }}>
      <ServiceCol title="المقاولات" img="s-slab-pour" items={STRUCTURE} />
      <ServiceCol title="التشطيبات" img="kitchen" items={FINISHING} />
    </div>
    <Foot n={3} />
  </Page>
);

const STEPS = [
  { t: "معاينة مجانية", d: "مهندس بينزلك، يقيس، ويسمع إنت عاوز إيه." },
  { t: "تصميم 3D", d: "تشوف شقتك أو فيلتك قبل ما نبدأ." },
  { t: "اختيار الخامات", d: "بإيدك: بورسلين، رخام، باركيه، وألوانك." },
  { t: "عرض بالبنود وعقد", d: "المواصفات والخامات ومعاد التسليم مكتوبين." },
  { t: "التنفيذ والمتابعة", d: "مرحلة ورا مرحلة، وصور وتقارير أول بأول." },
  { t: "التسليم", d: "نسلّمهالك نضيفة، جاهزة تسكن على طول." },
];
const Steps: React.FC = () => (
  <Page dark>
    <div style={{ position: "absolute", right: 90, left: 90, top: 120 }}>
      <Kicker text="خطوات الشغل" color={BRAND.steel} />
      <div style={{ marginTop: 26 }}>
        <H color="white">
          هتعرف كل خطوة
          <br />
          <span style={{ color: BRAND.red }}>قبل</span> ما تحصل
        </H>
      </div>
    </div>
    <div style={{ position: "absolute", right: 90, left: 90, top: 520 }}>
      {/* a vertical measure line down the step numbers */}
      <div style={{ position: "absolute", right: 46, top: 40, bottom: 40, width: 2, background: BRAND.blueprint, opacity: 0.5 }} />
      {STEPS.map((s, i) => (
        <div key={s.t} style={{ display: "flex", alignItems: "center", gap: 40, height: 158, position: "relative" }}>
          <div style={{ width: 94, height: 94, flex: "none", borderRadius: 999, background: i === 0 ? BRAND.red : BRAND.deep, border: `3px solid ${i === 0 ? BRAND.red : BRAND.blueprint}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headingFont, fontWeight: 900, fontSize: 40, color: "white", direction: "ltr" }}>{i + 1}</div>
          <div>
            <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 44, color: "white" }}>{s.t}</div>
            <div style={{ marginTop: 6, fontFamily: bodyFont, fontWeight: 400, fontSize: 30, color: BRAND.steel }}>{s.d}</div>
          </div>
        </div>
      ))}
    </div>
    <Foot n={4} dark />
  </Page>
);

const CHECKS = ["مقاس الحديد ومسافات الكانات قبل الصب", "رش الخرسانة بالمية أيام المعالجة", "اختبار ضغط المواسير قبل ما الحيطة تتقفل", "كل دايرة كهربا لوحدها، وسلك بالمقاس الصح", "تجربة العزل بالمية قبل البلاط", "استقامة الحيطان والزوايا بالميزان", "ميول الحمامات والبلكونات"];
const Quality: React.FC = () => (
  <Page>
    <div style={{ position: "absolute", right: 90, left: 90, top: 120 }}>
      <Kicker text="بنراجع إيه" color={BRAND.dim} />
      <div style={{ marginTop: 26 }}>
        <H>
          اللي مش باين
          <br />
          هو <span style={{ color: BRAND.red, marginRight: "0.2em" }}>الأهم</span>
        </H>
      </div>
    </div>
    <div style={{ position: "absolute", right: 90, left: 90, top: 480, background: "white", boxShadow: "0 18px 40px rgba(6,36,72,0.1)" }}>
      <div style={{ height: 90, background: BRAND.navy, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
        <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 34, color: "white" }}>قائمة المراجعة</div>
        <div style={{ fontFamily: headingFont, fontWeight: 600, fontSize: 24, color: BRAND.steel, direction: "ltr" }}>ONE HOUSE · QC</div>
      </div>
      <div style={{ padding: "16px 40px 30px" }}>
        {CHECKS.map((c) => (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 0", borderBottom: "2px dashed rgba(6,36,72,0.15)" }}>
            <div style={{ width: 50, height: 50, flex: "none", border: `3px solid ${BRAND.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headingFont, fontWeight: 900, fontSize: 40, color: BRAND.red }}>✓</div>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 32, color: BRAND.ink }}>{c}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{ position: "absolute", left: 110, top: 150, width: 200, height: 200, borderRadius: 999, border: `6px solid ${BRAND.red}`, color: BRAND.red, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: "rotate(-12deg)", fontFamily: headingFont, opacity: 0.9 }}>
      <div style={{ position: "absolute", inset: 10, borderRadius: 999, border: `2px solid ${BRAND.red}` }} />
      <div style={{ fontWeight: 900, fontSize: 32 }}>تمت</div>
      <div style={{ fontWeight: 900, fontSize: 32 }}>المراجعة</div>
    </div>
    <Foot n={5} />
  </Page>
);

const Contact: React.FC = () => (
  <AbsoluteFill dir="rtl" style={{ background: BRAND.navy }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 760, overflow: "hidden" }}>
      <Img src={photo("luxe-apartment")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 40%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(6,36,72,0.1) 40%, rgba(6,36,72,1) 100%)" }} />
    </div>
    <Grid color="rgba(95,168,255,0.06)" />
    <div style={{ position: "absolute", right: 90, left: 90, top: 760 }}>
      <Kicker text="تواصل معانا" color={BRAND.steel} />
      <div style={{ marginTop: 26 }}>
        <H color="white" size={96}>
          ون هاوس
          <br />
          <span style={{ color: BRAND.red }}>قريبة منك</span>
        </H>
      </div>
      <div style={{ marginTop: 30, fontFamily: bodyFont, fontWeight: 400, fontSize: 34, lineHeight: 1.6, color: BRAND.steel }}>لأي استفسار عن شغلنا أو مشروعك، تقدر توصلنا على صفحاتنا وموقعنا.</div>
      <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 22 }}>
        {[
          ["فيسبوك", "One House"],
          ["إنستجرام", "@onehouse_eg"],
          ["الموقع", "onehouse-eg.web.app"],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 34px", border: "2px solid rgba(95,168,255,0.4)", background: "rgba(2,13,28,0.4)" }}>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 32, color: BRAND.steel }}>{k}</div>
            <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 36, color: "white", direction: "ltr" }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
    <Foot n={6} dark />
  </AbsoluteFill>
);

export const PROFILE_PAGES = [Cover, About, Services, Steps, Quality, Contact];
export const ProfilePage: React.FC<{ readonly n: number }> = ({ n }) => {
  const P = PROFILE_PAGES[n - 1];
  return <P />;
};
