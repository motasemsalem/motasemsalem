import { AbsoluteFill, Img, staticFile } from "remotion";
import { BRAND, bodyFont, headingFont } from "../theme";
import media from "./photos.json";

// The "engineer's eye" family of feed posts (1080x1350), see social/BRAND.md.
// spec: photo with callouts and a title block · measure: photo framed by dimension lines on paper
// report: an inspection report with red ticks and a stamp · bignum: one huge outlined number over a photo
// cutout: a big word filled with the photo on navy.
// A "|" in a title is a line break; words in `accent` turn red.

export type ELook = "spec" | "measure" | "report" | "bignum" | "cutout";
export type Callout = { readonly x: number; readonly y: number; readonly label: string; readonly side?: "left" | "right" };
export type EPost = {
  readonly look: ELook;
  readonly photo: string;
  readonly pos?: string;
  readonly kicker: string;
  readonly title: string;
  readonly accent?: string;
  readonly sub?: string;
  readonly callouts?: readonly Callout[]; // spec: x, y in % of the photo
  readonly points?: readonly string[]; // report
  readonly dims?: readonly [string, string]; // measure: top and side values
  readonly num?: string; // bignum
  readonly unit?: string; // bignum: what the number counts
  readonly word?: string; // cutout
  readonly line: string; // who we are, in the title block
};

export const EPOST_W = 1080;
export const EPOST_H = 1350;

const MEDIA: Record<string, { file: string }> = media;
const GRADE = "contrast(1.08) saturate(1.04)";
const photoUrl = (name: string) => {
  const m = MEDIA[name];
  if (!m) throw new Error(`No photo "${name}" in photos.json`);
  return staticFile(m.file);
};

const Photo: React.FC<{ readonly name: string; readonly pos?: string; readonly style?: React.CSSProperties }> = ({ name, pos = "50% 50%", style }) => (
  <Img src={photoUrl(name)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter: GRADE, display: "block", ...style }} />
);

const Title: React.FC<{ readonly text: string; readonly accent?: string; readonly size: number; readonly color: string }> = ({ text, accent, size, color }) => {
  const red = new Set(accent?.split(" "));
  return (
    <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: size, lineHeight: 1.18, color }}>
      {text.split("|").map((l) => (
        <div key={l}>
          {l.split(" ").map((w, i) => (
            <span key={i} style={{ color: red.has(w) ? BRAND.red : undefined }}>
              {i ? " " : ""}
              {w}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

const Kicker: React.FC<{ readonly text: string; readonly color: string }> = ({ text, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: bodyFont, fontWeight: 600, fontSize: 28, color, letterSpacing: 1 }}>
    <div style={{ width: 44, height: 3, background: BRAND.red }} />
    {text}
  </div>
);

// A faint engineering grid.
const Grid: React.FC<{ readonly color: string; readonly step?: number; readonly style?: React.CSSProperties }> = ({ color, step = 54, style }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${step}px ${step}px`,
      ...style,
    }}
  />
);

// Corner crop marks around a box.
const Crops: React.FC<{ readonly box: { left: number; top: number; width: number; height: number }; readonly color: string }> = ({ box, color }) => {
  const L = 34;
  const g = 14;
  const s = { position: "absolute" as const, background: color };
  const { left, top, width, height } = box;
  return (
    <>
      {[
        [left - g - L, top, L, 2],
        [left, top - g - L, 2, L],
        [left + width + g, top, L, 2],
        [left + width - 2, top - g - L, 2, L],
        [left - g - L, top + height - 2, L, 2],
        [left, top + height + g, 2, L],
        [left + width + g, top + height - 2, L, 2],
        [left + width - 2, top + height + g, 2, L],
      ].map(([x, y, w, h], i) => (
        <div key={i} style={{ ...s, left: x, top: y, width: w, height: h }} />
      ))}
    </>
  );
};

// A drawing's title block: logo, who we are, and the call to action as the red cell.
const TitleBlock: React.FC<{ readonly line: string; readonly dark: boolean }> = ({ line, dark }) => {
  const ink = dark ? "rgba(255,255,255,0.9)" : BRAND.navy;
  const rule = dark ? "rgba(95,168,255,0.45)" : "rgba(6,36,72,0.3)";
  return (
    <div dir="rtl" style={{ position: "absolute", left: 56, right: 56, bottom: 52, height: 112, display: "flex", border: `2px solid ${rule}`, background: dark ? "rgba(2,13,28,0.55)" : "rgba(255,255,255,0.6)" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "0 26px", borderLeft: `2px solid ${rule}` }}>
        <Img src={staticFile(dark ? "brand/logo-white.png" : "brand/logo-color.png")} style={{ width: 138 }} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", fontFamily: bodyFont, fontWeight: 600, fontSize: 25, lineHeight: 1.35, color: ink }}>
        {line.split("|").map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", padding: "0 34px", background: BRAND.red, fontFamily: headingFont, fontWeight: 800, fontSize: 30, color: "white", whiteSpace: "nowrap" }}>احجز معاينتك المجانية</div>
    </div>
  );
};

// spec: the photo as an annotated drawing.
const Spec: React.FC<{ readonly post: EPost }> = ({ post }) => {
  const H = 900;
  return (
    <AbsoluteFill style={{ background: BRAND.navy }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: EPOST_W, height: H, overflow: "hidden" }}>
        <Photo name={post.photo} pos={post.pos} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(2,13,28,0.25) 0%, rgba(2,13,28,0) 30%, rgba(2,13,28,0.15) 75%, rgba(6,36,72,1) 100%)" }} />
        <Grid color="rgba(95,168,255,0.12)" />
        {(post.callouts ?? []).map((c) => {
          const x = (c.x / 100) * EPOST_W;
          const y = (c.y / 100) * H;
          const left = (c.side ?? (c.x > 50 ? "left" : "right")) === "left";
          const len = 120;
          return (
            <div key={c.label}>
              <div style={{ position: "absolute", left: x - 17, top: y - 17, width: 34, height: 34, borderRadius: 99, border: "3px solid white", boxShadow: "0 0 0 6px rgba(224,7,26,0.35)" }}>
                <div style={{ position: "absolute", inset: 8, borderRadius: 99, background: BRAND.red }} />
              </div>
              <div style={{ position: "absolute", top: y - 1, left: left ? x - 17 - len : x + 17, width: len, height: 2, background: "white" }} />
              <div
                dir="rtl"
                style={{
                  position: "absolute",
                  top: y - 28,
                  ...(left ? { right: EPOST_W - (x - 17 - len) } : { left: x + 17 + len }),
                  padding: "10px 20px",
                  background: "rgba(2,13,28,0.86)",
                  border: `2px solid ${BRAND.blueprint}`,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: 28,
                  color: "white",
                  whiteSpace: "nowrap",
                }}
              >
                {c.label}
              </div>
            </div>
          );
        })}
      </div>
      <div dir="rtl" style={{ position: "absolute", top: 70, right: 60 }}>
        <div style={{ padding: "10px 22px", background: BRAND.red, fontFamily: headingFont, fontWeight: 800, fontSize: 28, color: "white" }}>{post.kicker}</div>
      </div>
      <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: H - 60 }}>
        <Title text={post.title} accent={post.accent} size={post.title.length > 26 ? 66 : 78} color="white" />
        {post.sub ? <div style={{ marginTop: 16, fontFamily: bodyFont, fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: BRAND.steel }}>{post.sub}</div> : null}
      </div>
      <TitleBlock line={post.line} dark />
    </AbsoluteFill>
  );
};

// An arrowed dimension line.
const Dim: React.FC<{ readonly vertical?: boolean; readonly length: number; readonly label: string; readonly style: React.CSSProperties; readonly color: string }> = ({ vertical, length, label, style, color }) => {
  const head = (rot: number) => <div style={{ width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: `16px solid ${color}`, transform: `rotate(${rot}deg)` }} />;
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", width: vertical ? 40 : length, height: vertical ? length : 40, ...style }}>
      {head(vertical ? -90 : 180)}
      <div style={{ flex: 1, background: color, [vertical ? "width" : "height"]: 2 }} />
      {head(vertical ? 90 : 0)}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%)${vertical ? " rotate(-90deg)" : ""}`,
          padding: "2px 16px",
          background: BRAND.paper,
          fontFamily: headingFont,
          fontWeight: 700,
          fontSize: 28,
          color,
          whiteSpace: "nowrap",
          direction: "ltr",
        }}
      >
        {label}
      </div>
    </div>
  );
};

// measure: the photo on paper, framed by dimension lines.
const Measure: React.FC<{ readonly post: EPost }> = ({ post }) => {
  const box = { left: 110, top: 430, width: 800, height: 560 };
  const [top, side] = post.dims ?? ["", ""];
  return (
    <AbsoluteFill style={{ background: BRAND.paper }}>
      <Grid color="rgba(6,36,72,0.06)" step={45} />
      <div dir="rtl" style={{ position: "absolute", left: 60, right: 60, top: 76 }}>
        <Kicker text={post.kicker} color={BRAND.dim} />
        <div style={{ marginTop: 18 }}>
          <Title text={post.title} accent={post.accent} size={post.title.length > 24 ? 64 : 76} color={BRAND.navy} />
        </div>
      </div>
      <div style={{ position: "absolute", ...box, overflow: "hidden", boxShadow: "0 30px 60px rgba(6,36,72,0.25)" }}>
        <Photo name={post.photo} pos={post.pos} />
      </div>
      <Crops box={box} color={BRAND.navy} />
      {top ? <Dim length={box.width} label={top} color={BRAND.navy} style={{ left: box.left, top: box.top - 74 }} /> : null}
      {side ? <Dim vertical length={box.height} label={side} color={BRAND.navy} style={{ left: box.left + box.width + 34, top: box.top }} /> : null}
      {post.sub ? (
        <div dir="rtl" style={{ position: "absolute", left: 110, right: 110, top: box.top + box.height + 36, fontFamily: bodyFont, fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: BRAND.ink }}>
          {post.sub}
        </div>
      ) : null}
      <TitleBlock line={post.line} dark={false} />
    </AbsoluteFill>
  );
};

// report: an inspection report with red ticks and a stamp.
const Report: React.FC<{ readonly post: EPost }> = ({ post }) => {
  const points = post.points ?? [];
  return (
    <AbsoluteFill style={{ background: "#e9edf2" }}>
      <div dir="rtl" style={{ position: "absolute", left: 50, right: 50, top: 50, bottom: 190, background: "white", boxShadow: "0 24px 50px rgba(6,36,72,0.18)" }}>
        <Grid color="rgba(6,36,72,0.045)" step={40} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, background: BRAND.navy, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
          <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 32, color: "white" }}>تقرير معاينة</div>
          <div style={{ fontFamily: headingFont, fontWeight: 600, fontSize: 24, color: BRAND.steel, direction: "ltr" }}>ONE HOUSE · {post.kicker}</div>
        </div>
        <div style={{ position: "absolute", left: 40, top: 128, width: 300, height: 300, overflow: "hidden", border: `8px solid white`, boxShadow: "0 10px 24px rgba(6,36,72,0.25)", transform: "rotate(-3deg)" }}>
          <Photo name={post.photo} pos={post.pos} />
        </div>
        <div style={{ position: "absolute", right: 40, left: 380, top: 136 }}>
          <Title text={post.title} accent={post.accent} size={post.title.length > 22 ? 56 : 66} color={BRAND.navy} />
        </div>
        <div style={{ position: "absolute", right: 40, left: 40, top: 470 }}>
          {points.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 24, padding: "18px 0", borderBottom: "2px dashed rgba(6,36,72,0.18)" }}>
              <div style={{ width: 48, height: 48, flex: "none", border: `3px solid ${BRAND.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: headingFont, fontWeight: 900, fontSize: 40, color: BRAND.red, lineHeight: 1 }}>✓</div>
              <div style={{ flex: 1, fontFamily: bodyFont, fontWeight: 600, fontSize: 32, color: BRAND.ink }}>{p}</div>
              <div style={{ fontFamily: headingFont, fontWeight: 600, fontSize: 22, color: BRAND.dim, direction: "ltr" }}>{String(i + 1).padStart(2, "0")}</div>
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: 56,
            bottom: 40,
            width: 210,
            height: 210,
            borderRadius: 999,
            border: `6px solid ${BRAND.red}`,
            color: BRAND.red,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "rotate(-14deg)",
            opacity: 0.88,
            fontFamily: headingFont,
          }}
        >
          <div style={{ position: "absolute", inset: 10, borderRadius: 999, border: `2px solid ${BRAND.red}` }} />
          <div style={{ fontWeight: 900, fontSize: 34 }}>تمت</div>
          <div style={{ fontWeight: 900, fontSize: 34 }}>المراجعة</div>
          <div style={{ fontWeight: 600, fontSize: 18, direction: "ltr", marginTop: 4 }}>ONE HOUSE</div>
        </div>
        {post.sub ? <div style={{ position: "absolute", right: 40, left: 320, bottom: 56, fontFamily: bodyFont, fontWeight: 600, fontSize: 28, lineHeight: 1.45, color: BRAND.dim }}>{post.sub}</div> : null}
      </div>
      <TitleBlock line={post.line} dark={false} />
    </AbsoluteFill>
  );
};

// bignum: one fact, one huge number.
const BigNum: React.FC<{ readonly post: EPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.deep }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 640, height: 1350, overflow: "hidden" }}>
      <Photo name={post.photo} pos={post.pos} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(270deg, rgba(2,13,28,1) 0%, rgba(2,13,28,0.2) 45%, rgba(2,13,28,0.1) 100%)" }} />
    </div>
    <Grid color="rgba(95,168,255,0.08)" style={{ left: 640 }} />
    <div
      style={{
        position: "absolute",
        right: 40,
        top: 70,
        fontFamily: headingFont,
        fontWeight: 900,
        fontSize: 560,
        lineHeight: 1,
        color: "transparent",
        WebkitTextStroke: `6px ${BRAND.red}`,
        direction: "ltr",
        letterSpacing: -20,
      }}
    >
      {post.num}
    </div>
    {post.unit ? <div dir="rtl" style={{ position: "absolute", right: 64, top: 590, fontFamily: headingFont, fontWeight: 800, fontSize: 54, color: "white", padding: "6px 26px", background: BRAND.red }}>{post.unit}</div> : null}
    <div dir="rtl" style={{ position: "absolute", right: 60, width: 560, top: 720 }}>
      <Kicker text={post.kicker} color={BRAND.steel} />
      <div style={{ marginTop: 18 }}>
        <Title text={post.title} accent={post.accent} size={post.title.length > 24 ? 58 : 68} color="white" />
      </div>
      {post.sub ? <div style={{ marginTop: 18, fontFamily: bodyFont, fontWeight: 600, fontSize: 29, lineHeight: 1.45, color: BRAND.steel }}>{post.sub}</div> : null}
    </div>
    <TitleBlock line={post.line} dark />
  </AbsoluteFill>
);

// cutout: a big word filled with the photo.
const Cutout: React.FC<{ readonly post: EPost }> = ({ post }) => (
  <AbsoluteFill style={{ background: BRAND.navy }}>
    {/* A CSS background isn't waited for, so the same photo as an <Img> holds the render until it has loaded. */}
    <Img src={photoUrl(post.photo)} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
    <Grid color="rgba(95,168,255,0.1)" />
    <div dir="rtl" style={{ position: "absolute", right: 60, left: 60, top: 80 }}>
      <Kicker text={post.kicker} color={BRAND.steel} />
    </div>
    <div
      dir="rtl"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 110,
        textAlign: "center",
        fontFamily: headingFont,
        fontWeight: 900,
        fontSize: (post.word?.length ?? 5) > 5 ? 340 : 420,
        lineHeight: 1.25,
        backgroundImage: `url(${photoUrl(post.photo)})`,
        backgroundSize: "cover",
        backgroundPosition: post.pos ?? "50% 50%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "contrast(1.1) saturate(1.1) drop-shadow(0 20px 40px rgba(0,0,0,0.35))",
      }}
    >
      {post.word}
    </div>
    <div style={{ position: "absolute", left: 160, right: 160, top: 700, height: 2, background: BRAND.blueprint, opacity: 0.6 }} />
    <div dir="rtl" style={{ position: "absolute", right: 60, left: 60, top: 750, textAlign: "center" }}>
      <Title text={post.title} accent={post.accent} size={post.title.length > 26 ? 60 : 72} color="white" />
      {post.sub ? <div style={{ marginTop: 20, fontFamily: bodyFont, fontWeight: 600, fontSize: 30, lineHeight: 1.45, color: BRAND.steel }}>{post.sub}</div> : null}
    </div>
    <TitleBlock line={post.line} dark />
  </AbsoluteFill>
);

export const EditorialPost: React.FC<{ readonly post: EPost }> = ({ post }) =>
  post.look === "spec" ? <Spec post={post} /> : post.look === "measure" ? <Measure post={post} /> : post.look === "report" ? <Report post={post} /> : post.look === "bignum" ? <BigNum post={post} /> : <Cutout post={post} />;

// One sample per look, to review the family.
export const ESAMPLES: Record<string, EPost> = {
  spec: {
    look: "spec",
    photo: "wires-wall",
    pos: "50% 45%",
    kicker: "جوه الحيطة",
    title: "اللي ورا المحارة|هو اللي بيعيش معاك",
    accent: "بيعيش",
    sub: "كل خط كهربا وسباكة بيتراجع قبل ما يتقفل عليه",
    callouts: [
      { x: 30, y: 38, label: "مواسير بقطر مظبوط" },
      { x: 70, y: 58, label: "خط مستقل للتكييف" },
    ],
    line: "تشطيبات|وتجديد",
  },
  measure: {
    look: "measure",
    photo: "herringbone",
    kicker: "الأرضيات",
    title: "الأرضية الحلوة|بتبدأ من الميزان",
    accent: "الميزان",
    sub: "نقيس الميول ونظبط المستوى قبل أول بلاطة",
    dims: ["4.20 m", "3.60 m"],
    line: "تشطيبات|وتجديد",
  },
  report: {
    look: "report",
    photo: "bare-room",
    kicker: "قبل الاستلام",
    title: "٥ حاجات تتأكد منها|قبل ما تستلم شقتك",
    accent: "تستلم",
    points: ["ميول الحمامات والبلكونات", "استلام الشبابيك والأبواب", "عزل الحمامات قبل البلاط", "مسارات الكهربا والسباكة", "استقامة الحيطان والزوايا"],
    line: "تشطيبات|وتجديد",
  },
  bignum: {
    look: "bignum",
    photo: "s-slab-pour",
    pos: "60% 50%",
    num: "28",
    unit: "يوم",
    kicker: "الخرسانة",
    title: "الصبّة مش بتخلص|يوم الصب",
    accent: "يوم الصب",
    sub: "المعالجة بالمية بتكمّل قوة الخرسانة… ومن غيرها السقف بيتشرخ",
    line: "مقاولات|وإنشاءات",
  },
  cutout: {
    look: "cutout",
    photo: "villa-dusk",
    pos: "50% 55%",
    word: "بيتك",
    kicker: "ون هاوس",
    title: "اتبنى صح|من أول طوبة",
    accent: "صح",
    sub: "مقاولات وتشطيبات بعين المهندس، من الأساس لآخر لمبة",
    line: "مقاولات|وتشطيبات",
  },
};
