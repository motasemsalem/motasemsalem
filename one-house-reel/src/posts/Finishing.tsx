import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRAND, bodyFont, headingFont } from "../theme";
import media from "./photos.json";

// Facebook feed posts (1080x1350) for finishing and renovation, on Pixabay photos (scripts/prepare-post-photos.py).
// One frame for all of them, like a big brand's feed: full-bleed photo, logo, gold rule, and the same footer.
// A "|" in a title is a line break; words in `accent` turn gold.
export const FPOST_W = 1080;
export const FPOST_H = 1350;

const GOLD = "#e8c58a";
const GRADE = "contrast(1.05) saturate(1.06) sepia(0.06) brightness(1.02)";

type MediaInfo = { file: string; w: number; h: number };
const MEDIA: Record<string, MediaInfo> = media;

type Tile = { readonly photo: string; readonly label: string; readonly pos?: string };

type FPost = {
  readonly kicker: string;
  readonly title: string;
  readonly accent?: string;
  readonly sub?: string;
  readonly chips?: readonly string[];
  // full: one photo behind everything · split: before / after · grid: six trades · trio: three materials · list: tips
  readonly layout: "full" | "split" | "grid" | "trio" | "list";
  readonly photo?: string;
  // CSS object-position for the photo crop.
  readonly pos?: string;
  readonly tiles?: readonly Tile[];
  readonly list?: readonly string[];
};

export const FPOSTS = {
  hero: {
    layout: "full",
    photo: "luxe-apartment",
    pos: "50% 40%",
    kicker: "ون هاوس للتشطيبات",
    title: "بيتك يستاهل|تشطيب على أصوله",
    accent: "على أصوله",
    sub: "من المحارة لحد آخر لمبة… كل بنود التشطيب مع فريق واحد ومهندس واحد",
  },
  before: {
    layout: "split",
    tiles: [
      { photo: "bare-room", label: "قبل", pos: "50% 50%" },
      { photo: "big-windows", label: "بعد", pos: "60% 50%" },
    ],
    kicker: "تجديد وتشطيب",
    title: "من طوب ومحارة…|لبيت تتمنى تسكنه",
    accent: "تتمنى تسكنه",
    sub: "شقة على الطوب أو بيت محتاج يتجدد… بنستلمه ونسلّمه جاهز",
  },
  services: {
    layout: "grid",
    tiles: [
      { photo: "electrician", label: "كهرباء" },
      { photo: "hoses-plan", label: "سباكة" },
      { photo: "tv-wall", label: "جبس وإضاءة" },
      { photo: "herringbone", label: "أرضيات", pos: "50% 75%" },
      { photo: "swatches", label: "دهانات" },
      { photo: "double-door", label: "نجارة وأبواب" },
    ],
    kicker: "كل البنود",
    title: "التشطيب كله|تحت سقف واحد",
    accent: "سقف واحد",
    sub: "ومعاهم: عزل، تكييف، مطابخ، دريسنج، كاميرات وسمارت هوم",
  },
  hidden: {
    layout: "full",
    photo: "wires-wall",
    pos: "50% 50%",
    kicker: "اللي محدش بيشوفه",
    title: "اللي جوّه الحيطة|أهم من اللي بره",
    accent: "جوّه الحيطة",
    sub: "الكهرباء والسباكة بتتمد صح وتتجرّب… قبل ما الحيطة تتقفل",
    chips: ["مواسير تحت ضغط", "سلك بمقاسه", "لوحة متقسمة"],
  },
  materials: {
    layout: "trio",
    tiles: [
      { photo: "marble", label: "رخام" },
      { photo: "porcelain", label: "بورسلين", pos: "50% 70%" },
      { photo: "wood", label: "خشب" },
    ],
    kicker: "الخامات",
    title: "إنت بتختار الخامة…|وإحنا بنركّبها صح",
    accent: "بنركّبها صح",
    sub: "بنروح معاك المعارض، ونقولك الأنسب لكل أوضة ولميزانيتك",
  },
  quote: {
    layout: "full",
    photo: "sign-keys",
    pos: "40% 50%",
    kicker: "قبل ما تبدأ",
    title: "عرض سعر بالبند…|مفيش مفاجآت",
    accent: "مفيش مفاجآت",
    sub: "كل بند مكتوب بخامته وكميته وسعره… واللي في العقد هو اللي يتنفذ",
    chips: ["معاينة مجانية", "تصميم 3D", "عقد واضح"],
  },
  bath: {
    layout: "full",
    photo: "marble-bath",
    pos: "45% 50%",
    kicker: "الحمامات",
    title: "حمامك يتعمل|مرة واحدة… صح",
    accent: "صح",
    sub: "عزل قبل السيراميك، واختبار مية 48 ساعة، وميول مظبوطة للصرف",
    chips: ["عزل", "اختبار 48 ساعة", "ميول للصرف"],
  },
  kitchen: {
    layout: "full",
    photo: "kitchen",
    pos: "45% 50%",
    kicker: "المطابخ والنجارة",
    title: "مطبخك على مقاسك…|مش على مقاس المعرض",
    accent: "مقاسك…",
    sub: "مطابخ ودريسنج وأبواب تفصيل… بتتقاس في موقعك وتتركب من غير فراغات",
  },
  smart: {
    layout: "full",
    photo: "ac-lounge",
    pos: "40% 50%",
    kicker: "الأنظمة",
    title: "بيتك ذكي…|من أول يوم",
    accent: "من أول يوم",
    sub: "تكييف وكاميرات وسمارت هوم: المواسير والسلك بتتمد مع التأسيس… مش بتكسّر بعد التشطيب",
  },
  checklist: {
    layout: "list",
    photo: "tiler",
    pos: "50% 30%",
    kicker: "نصيحة من مهندس",
    title: "قبل ما تستلم تشطيبك…|اتأكد من 5 حاجات",
    accent: "5 حاجات",
    list: [
      "السيراميك مستوي… ومفيش بلاطة صوتها مفرّغ",
      "الدهان ناعم… حتى لو نوّرت عليه بكشاف جنب الحيطة",
      "كل البرايز والمفاتيح شغالة… وكل خط ليه قاطع",
      "مفيش ولا نقطة مية تحت الحوض والحمام",
      "الأبواب بتتقفل بسهولة… من غير ما تحكّ",
    ],
    chips: ["احفظ البوست لحد يوم الاستلام"],
  },
  cta: {
    layout: "full",
    photo: "villa-dusk",
    pos: "50% 50%",
    kicker: "ون هاوس للتشطيبات",
    title: "احجز معاينتك|المجانية",
    accent: "المجانية",
    sub: "مهندس يجيلك، يقيس، ويسمع إنت عاوز إيه… وتاخد عرض سعر بالبند",
    chips: ["ابعتلنا رسالة على الصفحة"],
  },
} satisfies Record<string, FPost>;

export type FPostId = keyof typeof FPOSTS;

const Photo: React.FC<{ readonly name: string; readonly pos?: string; readonly style?: React.CSSProperties }> = ({ name, pos = "50% 50%", style }) => {
  const m = MEDIA[name];
  if (!m) throw new Error(`No photo "${name}" in photos.json`);
  return <Img src={staticFile(m.file)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter: GRADE, ...style }} />;
};

const Title: React.FC<{ readonly text: string; readonly accent?: string; readonly size: number }> = ({ text, accent, size }) => {
  const gold = new Set(accent?.split(" "));
  return (
    <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: size, lineHeight: 1.22, color: "white", textShadow: "0 4px 30px rgba(0,0,0,0.55)" }}>
      {text.split("|").map((line, l) => (
        <div key={l}>
          {line.split(" ").map((w, i) => (
            <span key={i} style={{ color: gold.has(w) ? GOLD : "white" }}>
              {(i ? " " : "") + w}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const Kicker: React.FC<{ readonly text: string }> = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: bodyFont, fontWeight: 600, fontSize: 30, color: GOLD, letterSpacing: 1 }}>
    <span style={{ width: 56, height: 3, background: GOLD }} />
    {text}
  </div>
);

const Chips: React.FC<{ readonly items: readonly string[] }> = ({ items }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 6 }}>
    {items.map((t) => (
      <div
        key={t}
        style={{
          padding: "10px 24px",
          borderRadius: 999,
          border: `2px solid ${GOLD}88`,
          background: "rgba(2,13,28,0.55)",
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 28,
          color: "white",
          whiteSpace: "nowrap",
        }}
      >
        {t}
      </div>
    ))}
  </div>
);

// Name on the right, the offer on the left: the same strip closes every post.
const Footer: React.FC = () => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 96,
      padding: "0 56px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: BRAND.deep,
      borderTop: `2px solid ${GOLD}`,
      fontFamily: bodyFont,
      fontWeight: 600,
      fontSize: 28,
      color: "rgba(255,255,255,0.85)",
    }}
  >
    <span>ون هاوس · تشطيبات وتجديد</span>
    <span style={{ display: "flex", alignItems: "center", gap: 12, color: GOLD }}>
      احجز معاينتك المجانية
      <span style={{ width: 10, height: 10, borderRadius: 5, background: BRAND.red }} />
    </span>
  </div>
);

const Logo: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.6) 0%, rgba(2,13,28,0) 18%)" }} />
    <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", top: 44, right: 52, width: 190, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }} />
  </>
);

const Text: React.FC<{ readonly post: FPost; readonly size?: number }> = ({ post, size }) => (
  <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, bottom: 136, display: "flex", flexDirection: "column", gap: 20 }}>
    <Kicker text={post.kicker} />
    <Title text={post.title} accent={post.accent} size={size ?? (post.title.length > 30 ? 62 : 74)} />
    {post.sub && <div style={{ fontFamily: bodyFont, fontWeight: 400, fontSize: 32, lineHeight: 1.5, color: "rgba(255,255,255,0.88)", maxWidth: 900 }}>{post.sub}</div>}
    {post.chips && <Chips items={post.chips} />}
  </div>
);

const Shade: React.FC<{ readonly from?: number }> = ({ from = 38 }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(2,13,28,0) ${from}%, rgba(2,13,28,0.78) ${from + 22}%, rgba(2,13,28,0.96) 92%)` }} />
);

const Label: React.FC<{ readonly text: string; readonly gold?: boolean }> = ({ text, gold }) => (
  <div
    style={{
      position: "absolute",
      top: 18,
      right: 18,
      padding: "6px 18px",
      borderRadius: 999,
      background: gold ? GOLD : "rgba(2,13,28,0.78)",
      color: gold ? BRAND.deep : "white",
      fontFamily: headingFont,
      fontWeight: 700,
      fontSize: 26,
    }}
  >
    {text}
  </div>
);

// Before on the right (read first in Arabic), after on the left, split by a gold seam.
const Split: React.FC<{ readonly tiles: readonly Tile[] }> = ({ tiles }) => (
  <AbsoluteFill style={{ flexDirection: "row-reverse" }}>
    {tiles.map((t, i) => (
      <div key={t.photo} style={{ position: "relative", flex: 1, overflow: "hidden", borderLeft: i === 0 ? `4px solid ${GOLD}` : undefined }}>
        <Photo name={t.photo} pos={t.pos} style={i === 0 ? { filter: `${GRADE} saturate(0.6) brightness(0.92)` } : undefined} />
        <div style={{ position: "absolute", top: 210, right: 0, left: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "10px 34px", borderRadius: 999, background: i ? GOLD : "rgba(2,13,28,0.8)", color: i ? BRAND.deep : "white", fontFamily: headingFont, fontWeight: 800, fontSize: 38 }}>{t.label}</div>
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

const Tiles: React.FC<{ readonly tiles: readonly Tile[]; readonly cols: number; readonly top: number; readonly height: number }> = ({ tiles, cols, top, height }) => (
  <div dir="rtl" style={{ position: "absolute", top, left: 40, right: 40, height, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
    {tiles.map((t) => (
      <div key={t.photo} style={{ position: "relative", overflow: "hidden", borderRadius: 18, border: `1px solid ${GOLD}55` }}>
        <Photo name={t.photo} pos={t.pos} />
        <Label text={t.label} />
      </div>
    ))}
  </div>
);

const List: React.FC<{ readonly items: readonly string[] }> = ({ items }) => (
  <div dir="rtl" style={{ position: "absolute", top: 440, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 18 }}>
    {items.map((t, i) => (
      <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 24px", borderRadius: 18, background: "rgba(2,13,28,0.72)", border: `1px solid ${GOLD}55` }}>
        <div style={{ flex: "none", width: 58, height: 58, borderRadius: 29, background: GOLD, color: BRAND.deep, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headingFont, fontWeight: 800, fontSize: 32 }}>
          {"١٢٣٤٥"[i]}
        </div>
        <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 31, lineHeight: 1.4, color: "white" }}>{t}</div>
      </div>
    ))}
  </div>
);

export const FinishingPost: React.FC<{ readonly id: FPostId }> = ({ id }) => {
  const post: FPost = FPOSTS[id];
  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.deep }}>
      {post.layout === "full" && post.photo && <Photo name={post.photo} pos={post.pos} />}
      {post.layout === "split" && post.tiles && <Split tiles={post.tiles} />}
      {post.layout === "list" && post.photo && (
        <>
          <Photo name={post.photo} pos={post.pos} style={{ filter: `${GRADE} brightness(0.55) blur(2px)` }} />
          <AbsoluteFill style={{ background: "rgba(2,13,28,0.45)" }} />
        </>
      )}
      {(post.layout === "full" || post.layout === "split") && <Shade from={post.layout === "split" ? 46 : 38} />}
      {post.layout === "grid" && post.tiles && <Tiles tiles={post.tiles} cols={3} top={196} height={640} />}
      {post.layout === "trio" && post.tiles && <Tiles tiles={post.tiles} cols={3} top={196} height={680} />}
      <Logo />
      {post.layout === "list" && post.list ? (
        <>
          <div dir="rtl" style={{ position: "absolute", top: 170, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
            <Kicker text={post.kicker} />
            <Title text={post.title} accent={post.accent} size={62} />
          </div>
          <List items={post.list} />
          {post.chips && (
            <div dir="rtl" style={{ position: "absolute", bottom: 126, left: 60, right: 60, display: "flex", justifyContent: "center" }}>
              <Chips items={post.chips} />
            </div>
          )}
        </>
      ) : (
        <Text post={post} size={post.layout === "grid" || post.layout === "trio" ? 62 : undefined} />
      )}
      <Footer />
    </AbsoluteFill>
  );
};
