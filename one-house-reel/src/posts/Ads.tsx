import { AbsoluteFill, Img, staticFile } from "remotion";
import { cue } from "../cues";
import { Studio } from "../ad/Finale";
import { ArtOnly, Finish, P } from "../ad/kit";
import { bodyFont, headingFont, SHADOW } from "../theme";
import { type Art, Frozen, Headline } from "./Posts";

// Single-image Facebook ads (1080x1350): a real photo on top, the message and the offer below.
// Each ad has to sell on its own, so every one carries the brand, one idea, one line of proof and the free-inspection offer.
// A "|" in a title is a line break.

type Ad = {
  readonly photo: string;
  // CSS object-position for the photo crop.
  readonly focus?: string;
  readonly kicker: string;
  readonly title: string;
  readonly accent: string;
  readonly sub: string;
  // Short labels pinned on the photo, at [x, y] in the photo area.
  readonly tags?: readonly { readonly text: string; readonly x: number; readonly y: number }[];
  readonly art?: Art;
  readonly url?: string;
};

export const ADS = {
  inside: {
    photo: "columns-sunset",
    focus: "50% 60%",
    kicker: "قبل ما تشتري أو تبني",
    title: "شكلها حلو من بره…|بس جوّه الحيطة فيه إيه؟",
    accent: "جوّه",
    sub: "الدهان بيداري أي عيب. في ون هاوس بنبني المسلّح صح من أول طوبة، ومهندس بيراجع كل مرحلة",
  },
  cracks: {
    photo: "crack",
    focus: "50% 50%",
    kicker: "مشكلة بنسمعها كل يوم",
    title: "شروخ بعد سنة؟|العيب من المسلّح",
    accent: "المسلّح",
    sub: "في ون هاوس مفيش مرحلة بتبدأ قبل ما المهندس يراجع اللي قبلها ويمضي عليها",
    tags: [{ text: "شرخ في الخرسانة", x: 700, y: 360 }],
  },
  rebar: {
    photo: "rebar",
    focus: "50% 50%",
    kicker: "المسلّح صح",
    title: "الحديد مطابق…|والكانة بالمسطرة",
    accent: "بالمسطرة",
    sub: "مش بنقرّب ولا بنوفّر في الحديد. المقاسات والمسافات زي الرسومات بالظبط",
    tags: [{ text: "حديد مطابق للمواصفات ✓", x: 560, y: 330 }],
  },
  pour: {
    photo: "pour",
    focus: "50% 45%",
    kicker: "المسلّح صح",
    title: "صبّة واحدة بالهزّاز…|وسقفك مش هينشّ",
    accent: "بالهزّاز…",
    sub: "شدّة بالميزان، وصبّة من غير وقفات، ومكعبات من كل صبّة تتكسر في المعمل",
    tags: [{ text: "خرسانة على حديد السقف", x: 640, y: 560 }],
  },
  engineer: {
    photo: "site-columns",
    focus: "50% 40%",
    kicker: "في ون هاوس",
    title: "مهندس في الموقع…|في كل مرحلة",
    accent: "مهندس",
    sub: "بيراجع ويمضي على الأساس والأعمدة والسقف، وإنت بتوصلك صور الموقع على الموبايل",
  },
  home: {
    photo: "building",
    focus: "50% 40%",
    kicker: "ون هاوس",
    title: "بيت يعيش|العمر كله",
    accent: "العمر كله",
    sub: "المسلّح صح من أول طوبة. احجز معاينة مجانية، والمهندس ينزلك الموقع ويقولك هتبني إزاي",
  },
  studio: {
    photo: "building",
    focus: "50% 40%",
    kicker: "أداة مجانية على موقع ون هاوس",
    title: "ارسم شقتك بنفسك…|ببلاش",
    accent: "ببلاش",
    sub: "استوديو 2D: ضيف أوضك بالمقاسات، واعرف المساحة، وابعت المخطط PDF للمهندس",
    art: { scene: Studio, frame: cue("PDF") + 6, cx: 540, cy: 960, scale: 0.44 },
    url: "onehouse-eg.web.app/studio",
  },
} satisfies Record<string, Ad>;

export type AdId = keyof typeof ADS;

const PHOTO_H = 800;

const Tag: React.FC<{ readonly text: string; readonly x: number; readonly y: number }> = ({ text, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div dir="rtl" style={{ padding: "12px 24px", borderRadius: 16, background: "rgba(4,15,29,0.88)", border: `3px solid ${P.red}`, fontFamily: headingFont, fontWeight: 800, fontSize: 36, color: "white", whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(0,0,0,0.45)" }}>
      {text}
    </div>
    <div style={{ width: 3, height: 50, background: P.red }} />
    <div style={{ width: 20, height: 20, borderRadius: 10, background: P.red, boxShadow: `0 0 0 8px rgba(227,30,36,0.3)` }} />
  </div>
);

export const FacebookAd: React.FC<{ readonly id: AdId }> = ({ id }) => {
  const ad: Ad = ADS[id];
  return (
    <AbsoluteFill style={{ backgroundColor: P.night, overflow: "hidden" }}>
      {/* Photo */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: PHOTO_H, overflow: "hidden" }}>
        <Img
          src={staticFile(`photos/${ad.photo}.jpg`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: ad.focus,
            filter: ad.art ? "blur(10px) brightness(0.45) saturate(0.8)" : "contrast(1.06) saturate(1.05)",
            transform: ad.art ? "scale(1.08)" : undefined,
          }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,15,29,0.55) 0%, rgba(4,15,29,0) 22%, rgba(4,15,29,0) 62%, rgba(4,15,29,1) 100%)" }} />
        {ad.tags?.map((t) => (
          <Tag key={t.text} {...t} />
        ))}
      </div>
      {ad.art && (
        <ArtOnly.Provider value>
          <Frozen art={ad.art} x={540} y={450} />
        </ArtOnly.Provider>
      )}

      {/* Brand and offer on the photo */}
      <Img src={staticFile("brand/logo-white.png")} style={{ position: "absolute", right: 44, top: 36, height: 120, filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }} />
      <div dir="rtl" style={{ position: "absolute", left: 44, top: 46, padding: "14px 28px", borderRadius: 16, background: P.red, boxShadow: "0 14px 34px rgba(227,30,36,0.45)", transform: "rotate(-3deg)" }}>
        <div style={{ fontFamily: headingFont, fontWeight: 900, fontSize: 40, color: "white", lineHeight: 1.1 }}>معاينة مجانية</div>
      </div>

      {/* Message */}
      <div dir="rtl" style={{ position: "absolute", top: PHOTO_H - 100, left: 50, right: 50, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 24px", borderRadius: 999, background: "rgba(4,15,29,0.75)", border: "2px solid rgba(143,182,221,0.4)", fontFamily: bodyFont, fontWeight: 600, fontSize: 30, color: "rgba(255,255,255,0.92)" }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: P.red }} />
          {ad.kicker}
        </div>
        <Headline text={ad.title} accent={ad.accent} size={74} />
        <div style={{ maxWidth: 940, fontFamily: bodyFont, fontWeight: 600, fontSize: 32, lineHeight: 1.45, color: "rgba(255,255,255,0.88)", textShadow: SHADOW }}>{ad.sub}</div>
      </div>

      {/* Call to action */}
      <div dir="rtl" style={{ position: "absolute", left: 50, right: 50, bottom: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ padding: "20px 46px", borderRadius: 999, background: P.red, boxShadow: "0 18px 44px rgba(227,30,36,0.5)", fontFamily: headingFont, fontWeight: 800, fontSize: 44, color: "white", whiteSpace: "nowrap" }}>احجز معاينتك المجانية</div>
        <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: ad.url ? 26 : 30, color: "rgba(255,255,255,0.9)", direction: "ltr", whiteSpace: "nowrap" }}>{ad.url ?? "onehouse-eg.web.app"}</div>
      </div>
      <Finish />
    </AbsoluteFill>
  );
};
