import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRAND, bodyFont, headingFont } from "../theme";
import media from "./photos.json";

// A second family of feed posts (1080x1350), after the template look of big construction brands:
// solid brand colour blocks, a photo cut into a shape (diagonal, circle, arch), one big headline, and a red call to action.
// diagonal: navy panel, photo cut on a slant · circle: light paper, photo in a ringed circle
// type: huge stacked headline over a photo band · facts: numbered points beside a tall photo.
// After Canva's layouts: panel: photo on the left, navy panel on the right with a slanted edge and red pinstripes
// (white numbered cards when the post has points) · card: full photo with a floating navy card and beige tags
// · frame: before / after, two photos under a light header with slanted corner flags.
// A "|" in a title is a line break; words in `accent` turn red.

type Look = "diagonal" | "circle" | "type" | "facts" | "panel" | "card" | "frame";
export type SPost = {
  readonly look: Look;
  readonly photo: string;
  readonly pos?: string;
  readonly kicker: string;
  readonly title: string;
  readonly accent?: string;
  readonly sub?: string;
  readonly points?: readonly string[];
  readonly tags?: readonly string[];
  readonly after?: string; // frame: the "after" photo (`photo` is "before")
  readonly afterPos?: string;
  readonly line: string; // who we are, under the logo
};

const MEDIA: Record<string, { file: string }> = media;
const GRADE = "contrast(1.06) saturate(1.05) brightness(1.02)";

const Photo: React.FC<{ readonly name: string; readonly pos?: string; readonly style?: React.CSSProperties }> = ({ name, pos = "50% 50%", style }) => {
  const m = MEDIA[name];
  if (!m) throw new Error(`No photo "${name}" in photos.json`);
  return <Img src={staticFile(m.file)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter: GRADE, ...style }} />;
};

const Title: React.FC<{ readonly text: string; readonly accent?: string; readonly size: number; readonly color: string }> = ({ text, accent, size, color }) => {
  const red = new Set(accent?.split(" "));
  return (
    <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: size, lineHeight: 1.18, color }}>
      {text.split("|").map((line, l) => (
        <div key={l}>
          {line.split(" ").map((w, i) => (
            <span key={i} style={{ color: red.has(w) ? BRAND.red : color }}>
              {(i ? " " : "") + w}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const Kicker: React.FC<{ readonly text: string; readonly dark?: boolean }> = ({ text, dark }) => (
  <div style={{ alignSelf: "flex-start", padding: "8px 22px", borderRadius: 8, background: BRAND.red, fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color: "white", boxShadow: dark ? "none" : "0 8px 24px rgba(224,7,26,0.3)" }}>{text}</div>
);

// Diagonal hatching, the small graphic accent these templates put in a corner.
const Hatch: React.FC<{ readonly style: React.CSSProperties; readonly color: string }> = ({ style, color }) => (
  <div style={{ position: "absolute", background: `repeating-linear-gradient(135deg, ${color} 0 6px, transparent 6px 16px)`, ...style }} />
);

const Dots: React.FC<{ readonly style: React.CSSProperties; readonly color: string }> = ({ style, color }) => (
  <div style={{ position: "absolute", backgroundImage: `radial-gradient(${color} 3px, transparent 3.5px)`, backgroundSize: "26px 26px", ...style }} />
);

// The closing strip: logo and line on the right, the call to action as a red button on the left.
const Bar: React.FC<{ readonly line: string; readonly dark: boolean }> = ({ line, dark }) => (
  <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, bottom: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <Img src={staticFile(dark ? "brand/logo-white.png" : "brand/logo-color.png")} style={{ width: 150 }} />
      <div style={{ width: 2, height: 54, background: dark ? "rgba(255,255,255,0.35)" : "rgba(6,36,72,0.25)" }} />
      <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 26, lineHeight: 1.35, color: dark ? "rgba(255,255,255,0.85)" : BRAND.navy }}>
        {line.split("|").map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
    <div style={{ padding: "16px 30px", borderRadius: 999, background: BRAND.red, fontFamily: headingFont, fontWeight: 700, fontSize: 28, color: "white", boxShadow: "0 10px 30px rgba(224,7,26,0.35)" }}>احجز معاينتك المجانية</div>
  </div>
);

const Diagonal: React.FC<{ readonly post: SPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.navy }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 860, clipPath: "polygon(0 0, 100% 0, 100% 62%, 0 100%)" }}>
      <Photo name={post.photo} pos={post.pos} />
    </div>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 880, clipPath: "polygon(0 100%, 100% 61%, 100% 63.5%, 0 102%)", background: BRAND.red }} />
    <Hatch color="rgba(255,255,255,0.22)" style={{ right: 60, top: 700, width: 150, height: 90 }} />
    <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 760, display: "flex", flexDirection: "column", gap: 22 }}>
      <Kicker text={post.kicker} dark />
      <Title text={post.title} accent={post.accent} size={80} color="white" />
      {post.sub && <div style={{ fontFamily: bodyFont, fontSize: 32, lineHeight: 1.5, color: "rgba(255,255,255,0.85)", maxWidth: 920 }}>{post.sub}</div>}
    </div>
    <Bar line={post.line} dark />
  </AbsoluteFill>
);

const Circle: React.FC<{ readonly post: SPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.paper }}>
    <div style={{ position: "absolute", left: -260, top: -220, width: 760, height: 760, borderRadius: "50%", background: BRAND.navy }} />
    <Dots color="rgba(6,36,72,0.18)" style={{ right: 50, top: 60, width: 210, height: 160 }} />
    <div style={{ position: "absolute", left: 90, top: 110, width: 640, height: 640, borderRadius: "50%", padding: 14, background: "white", boxShadow: "0 30px 80px rgba(2,13,28,0.25)" }}>
      <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: `10px solid ${BRAND.red}` }}>
        <Photo name={post.photo} pos={post.pos} />
      </div>
    </div>
    <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 800, display: "flex", flexDirection: "column", gap: 20 }}>
      <Kicker text={post.kicker} />
      <Title text={post.title} accent={post.accent} size={76} color={BRAND.navy} />
      {post.sub && <div style={{ fontFamily: bodyFont, fontSize: 31, lineHeight: 1.5, color: "#3c4b60", maxWidth: 940 }}>{post.sub}</div>}
    </div>
    <Bar line={post.line} dark={false} />
  </AbsoluteFill>
);

const Type: React.FC<{ readonly post: SPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.paper }}>
    <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 80, display: "flex", flexDirection: "column", gap: 18 }}>
      <Kicker text={post.kicker} />
      <Title text={post.title} accent={post.accent} size={100} color={BRAND.navy} />
    </div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 470, height: 500, borderRadius: "260px 260px 24px 24px", overflow: "hidden", boxShadow: "0 30px 70px rgba(2,13,28,0.25)" }}>
      <Photo name={post.photo} pos={post.pos} />
    </div>
    <Hatch color="rgba(224,7,26,0.55)" style={{ left: 30, top: 920, width: 130, height: 80 }} />
    {post.sub && (
      <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 1030, fontFamily: bodyFont, fontWeight: 600, fontSize: 32, lineHeight: 1.5, color: "#3c4b60" }}>
        {post.sub}
      </div>
    )}
    <Bar line={post.line} dark={false} />
  </AbsoluteFill>
);

const Facts: React.FC<{ readonly post: SPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.navy }}>
    <Dots color="rgba(255,255,255,0.12)" style={{ left: 40, top: 40, width: 260, height: 180 }} />
    <div style={{ position: "absolute", left: 0, top: 0, width: 400, height: 1190, borderRadius: "0 0 200px 0", overflow: "hidden" }}>
      <Photo name={post.photo} pos={post.pos} />
    </div>
    <div style={{ position: "absolute", left: 400, top: 0, width: 14, height: 1190, background: BRAND.red }} />
    <div dir="rtl" style={{ position: "absolute", left: 470, right: 56, top: 90, display: "flex", flexDirection: "column", gap: 22 }}>
      <Kicker text={post.kicker} dark />
      <Title text={post.title} accent={post.accent} size={58} color="white" />
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 14 }}>
        {(post.points ?? []).map((t, i) => (
          <div key={t} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: "none", fontFamily: headingFont, fontWeight: 900, fontSize: 46, lineHeight: 1, color: BRAND.red, width: 58 }}>{`0${i + 1}`}</div>
            <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 29, lineHeight: 1.4, color: "white", paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.16)", flex: 1 }}>{t}</div>
          </div>
        ))}
      </div>
    </div>
    <Bar line={post.line} dark />
  </AbsoluteFill>
);

const BEIGE = "#efe4d4";

const Panel: React.FC<{ readonly post: SPost }> = ({ post }) => {
  const list = post.points && post.points.length > 0;
  return (
    <AbsoluteFill style={{ background: BRAND.navy }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 620, height: 1350 }}>
        <Photo name={post.photo} pos={post.pos} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: BRAND.navy, clipPath: "polygon(52% 0, 100% 0, 100% 100%, 40% 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: BRAND.red, clipPath: "polygon(51.2% 0, 52% 0, 40% 100%, 39.2% 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(224,7,26,0.55)", clipPath: "polygon(54.5% 0, 54.9% 0, 42.9% 100%, 42.5% 100%)" }} />
      <div dir="rtl" style={{ position: "absolute", right: 60, width: list ? 600 : 470, top: list ? 110 : 230, display: "flex", flexDirection: "column", gap: 24 }}>
        <Kicker text={post.kicker} dark />
        <Title text={post.title} accent={post.accent} size={list ? 56 : 80} color="white" />
        <div style={{ width: 380, height: 2, background: "linear-gradient(270deg, rgba(224,7,26,0.9), rgba(224,7,26,0))" }} />
        {post.sub && <div style={{ fontFamily: bodyFont, fontSize: 32, lineHeight: 1.55, color: "rgba(255,255,255,0.88)" }}>{post.sub}</div>}
        {list && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {post.points!.map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "stretch", background: "white", borderRadius: 10, overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
                <div style={{ flex: "none", width: 74, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "2px solid #dde3ea", fontFamily: headingFont, fontWeight: 900, fontSize: 42, color: BRAND.red }}>{i + 1}</div>
                <div style={{ padding: "18px 22px", fontFamily: bodyFont, fontWeight: 600, fontSize: 29, lineHeight: 1.35, color: BRAND.navy }}>{t}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Bar line={post.line} dark />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ readonly post: SPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.paper }}>
    <Photo name={post.photo} pos={post.pos} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(2,13,28,0.35) 0%, rgba(2,13,28,0) 22%, rgba(2,13,28,0) 70%, rgba(2,13,28,0.55) 100%)" }} />
    <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", top: 46, right: 56, width: 180, filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))" }} />
    <div dir="rtl" style={{ position: "absolute", right: 60, top: 300, width: 760, padding: "70px 50px 50px", background: "rgba(6,36,72,0.95)", clipPath: "polygon(0 0, 100% 0, 100% 100%, 12% 100%, 0 91%)", display: "flex", flexDirection: "column", gap: 24 }}>
      <Title text={post.title} accent={post.accent} size={64} color="white" />
      <div style={{ width: 90, height: 6, borderRadius: 3, background: BRAND.red }} />
      {post.sub && <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 31, lineHeight: 1.55, color: BEIGE }}>{post.sub}</div>}
      {post.tags && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {post.tags.map((t) => (
            <div key={t} style={{ padding: "12px 20px", borderRadius: 10, background: BEIGE, fontFamily: bodyFont, fontWeight: 600, fontSize: 26, color: BRAND.navy }}>{t}</div>
          ))}
        </div>
      )}
    </div>
    <div dir="rtl" style={{ position: "absolute", right: 100, top: 268, padding: "10px 24px", background: "white", borderRadius: 6, fontFamily: bodyFont, fontWeight: 600, fontSize: 27, color: BRAND.navy, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>{post.kicker}</div>
    <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, bottom: 56, display: "flex", justifyContent: "flex-end" }}>
      <div style={{ padding: "18px 40px", borderRadius: 999, background: BRAND.red, border: "3px solid white", fontFamily: headingFont, fontWeight: 700, fontSize: 30, color: "white", boxShadow: "0 10px 30px rgba(224,7,26,0.4)" }}>احجز معاينتك المجانية</div>
    </div>
  </AbsoluteFill>
);

const Flag: React.FC<{ readonly text: string; readonly red?: boolean }> = ({ text, red }) => (
  <div style={{ position: "absolute", top: 0, right: 0, padding: "12px 34px 12px 46px", background: red ? BRAND.red : BRAND.navy, clipPath: "polygon(16% 0, 100% 0, 100% 100%, 0 100%)", fontFamily: headingFont, fontWeight: 800, fontSize: 36, color: "white" }}>{text}</div>
);

const Frame: React.FC<{ readonly post: SPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.navy }}>
    <div style={{ position: "absolute", left: 36, right: 36, top: 36, bottom: 210, background: BEIGE, clipPath: "polygon(5% 0, 100% 0, 100% 95%, 95% 100%, 0 100%, 0 5%)" }} />
    <div dir="rtl" style={{ position: "absolute", left: 80, right: 80, top: 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, textAlign: "center" }}>
      <div style={{ fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color: BRAND.red }}>{post.kicker}</div>
      <Title text={post.title} accent={post.accent} size={70} color={BRAND.navy} />
      <div style={{ width: 300, height: 2, background: "linear-gradient(90deg, rgba(6,36,72,0), rgba(6,36,72,0.5), rgba(6,36,72,0))" }} />
    </div>
    <div dir="rtl" style={{ position: "absolute", left: 70, right: 70, top: 440, height: 640, display: "flex", gap: 14 }}>
      {[
        { name: post.photo, pos: post.pos, label: "قبل", red: false, dim: true },
        { name: post.after ?? post.photo, pos: post.afterPos, label: "بعد", red: true, dim: false },
      ].map((t) => (
        <div key={t.label} style={{ position: "relative", flex: 1, overflow: "hidden", borderRadius: 8, border: "5px solid white", boxShadow: "0 14px 34px rgba(2,13,28,0.3)" }}>
          <Photo name={t.name} pos={t.pos} style={t.dim ? { filter: `${GRADE} saturate(0.65) brightness(0.95)` } : undefined} />
          <Flag text={t.label} red={t.red} />
        </div>
      ))}
    </div>
    <Bar line={post.line} dark />
  </AbsoluteFill>
);

export const StudioPost: React.FC<{ readonly post: SPost }> = ({ post }) =>
  post.look === "diagonal" ? <Diagonal post={post} /> : post.look === "circle" ? <Circle post={post} /> : post.look === "type" ? <Type post={post} /> : post.look === "facts" ? <Facts post={post} /> : post.look === "panel" ? <Panel post={post} /> : post.look === "card" ? <Card post={post} /> : <Frame post={post} />;

// Four existing posts, redrawn in the new looks, to compare with the current frame.
export const SAMPLES: Record<string, SPost> = {
  "panel-columns": {
    look: "panel",
    photo: "s-column",
    pos: "45% 40%",
    kicker: "الأعمدة",
    title: "الكانة|بالمسطرة…|مش بالعين",
    accent: "بالمسطرة…",
    sub: "مسافة الكانات هي اللي بتدّي العمود قوته… ولو وسعت، العمود بيضعف",
    line: "مقاولات|وإنشاءات",
  },
  "panel-checklist": {
    look: "panel",
    photo: "s-slab-aerial",
    pos: "40% 50%",
    kicker: "نصيحة من مهندس",
    title: "قبل ما تصب السقف…|اتأكد من 5 حاجات",
    accent: "5 حاجات",
    points: ["الشدّة مستوية بالميزان", "الحديد مطابق للرسومات", "الكانات بالمسطرة", "البسكوت تحت الحديد", "المهندس راجع ومضى"],
    line: "مقاولات|وإنشاءات",
  },
  "card-hidden": {
    look: "card",
    photo: "wires-wall",
    pos: "60% 50%",
    kicker: "اللي محدش بيشوفه",
    title: "اللي جوّه الحيطة|أهم من اللي بره",
    accent: "جوّه الحيطة",
    sub: "الكهرباء والسباكة بتتمد صح وتتجرّب… قبل ما الحيطة تتقفل",
    tags: ["مواسير تحت ضغط", "سلك بمقاسه", "لوحة متقسمة"],
    line: "تشطيبات|وتجديد",
  },
  "frame-before": {
    look: "frame",
    photo: "bare-room",
    after: "big-windows",
    afterPos: "60% 50%",
    kicker: "تجديد وتشطيب",
    title: "من طوب ومحارة…|لبيت تتمنى تسكنه",
    accent: "تتمنى تسكنه",
    line: "تشطيبات|وتجديد",
  },
  columns: {
    look: "diagonal",
    photo: "s-column",
    pos: "50% 35%",
    kicker: "الأعمدة",
    title: "الكانة بالمسطرة…|مش بالعين",
    accent: "بالمسطرة…",
    sub: "مسافة الكانات هي اللي بتدّي العمود قوته… ولو وسعت، العمود بيضعف",
    line: "مقاولات|وإنشاءات",
  },
  hidden: {
    look: "circle",
    photo: "wires-wall",
    kicker: "اللي محدش بيشوفه",
    title: "اللي جوّه الحيطة|أهم من اللي بره",
    accent: "جوّه الحيطة",
    sub: "الكهرباء والسباكة بتتمد صح وتتجرّب… قبل ما الحيطة تتقفل",
    line: "تشطيبات|وتجديد",
  },
  concrete: {
    look: "type",
    photo: "s-chute",
    pos: "40% 50%",
    kicker: "الخرسانة",
    title: "الخرسانة القوية|محتاجة صبر",
    accent: "صبر",
    sub: "مكعبات من كل صبّة بتتكسر في المعمل… ورشّ مية أسبوع كامل علشان متتشرخش",
    line: "مقاولات|وإنشاءات",
  },
  checklist: {
    look: "facts",
    photo: "tiler",
    pos: "50% 30%",
    kicker: "نصيحة من مهندس",
    title: "قبل ما تستلم تشطيبك…|اتأكد من 5 حاجات",
    accent: "5 حاجات",
    points: [
      "السيراميك مستوي… ومفيش بلاطة صوتها مفرّغ",
      "الدهان ناعم… حتى لو نوّرت عليه بكشاف",
      "كل البرايز شغالة… وكل خط ليه قاطع",
      "مفيش ولا نقطة مية تحت الحوض",
      "الأبواب بتتقفل من غير ما تحكّ",
    ],
    line: "تشطيبات|وتجديد",
  },
};
