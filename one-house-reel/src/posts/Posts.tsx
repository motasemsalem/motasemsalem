import { AbsoluteFill, Freeze, Img, staticFile } from "remotion";
import { C, cue } from "../cues";
import { Columns, Concrete, Foundation, Slab } from "../ad/Build";
import { Review, Studio } from "../ad/Finale";
import { ArtOnly, Backdrop, Finish, P } from "../ad/kit";
import { Hook, Pain } from "../ad/Open";
import { bodyFont, headingFont, SHADOW } from "../theme";

// Facebook feed posts (1080x1350, 4:5) built from frozen frames of the reel's drawings.
// Each one stands alone (it is not read next to the reel), so every post says its point in a sub line.
// A "|" in a title is a line break.
export const POST_W = 1080;
export const POST_H = 1350;

// A frame of one reel scene, with the part around (cx, cy) of the 1080x1920 canvas scaled into a box.
type Art = {
  readonly scene: React.FC;
  readonly frame: number;
  readonly cx: number;
  readonly cy: number;
  readonly scale: number;
};

type Post = {
  readonly kicker: string;
  readonly title: string;
  readonly accent?: string;
  readonly sub?: string;
  readonly art?: Art;
  readonly notes?: readonly string[];
  readonly grid?: readonly Art[];
  readonly chips?: readonly string[];
  readonly list?: readonly string[];
  readonly url?: string;
};

const STEPS: readonly Art[] = [
  { scene: Foundation, frame: C.columns - 8, cx: 540, cy: 940, scale: 0.66 },
  { scene: Columns, frame: C.slab - 8, cx: 560, cy: 1230, scale: 0.6 },
  { scene: Slab, frame: C.concrete - 8, cx: 540, cy: 1150, scale: 0.8 },
  { scene: Concrete, frame: C.review - 8, cx: 540, cy: 960, scale: 0.62 },
];

export const POSTS = {
  hook: {
    kicker: "قبل ما تشتري أو تبني… اسأل",
    title: "شكلها حلو من بره…|بس جوّه الحيطة فيه إيه؟",
    accent: "جوّه",
    sub: "الدهان بيداري أي عيب… لكن الحديد والأساس هما اللي بيحددوا عمر البيت",
    art: { scene: Hook, frame: C.paint - 12, cx: 470, cy: 1060, scale: 0.56 },
    chips: ["في ون هاوس… المسلّح صح من أول طوبة"],
  },
  pain: {
    kicker: "مشاكل بنسمعها كل يوم",
    title: "4 مشاكل|بتظهر بعد التسليم",
    accent: "بعد التسليم",
    sub: "وسببها كلها مسلّح متنفذش صح… علشان كده في ون هاوس كل مرحلة بيراجعها مهندس",
    art: { scene: Pain, frame: C.notUs - 3, cx: 540, cy: 950, scale: 0.58 },
    chips: ["مش في بيوت ون هاوس"],
  },
  steps: {
    kicker: "ون هاوس · من أول طوبة",
    title: "المسلّح صح في 4 خطوات",
    accent: "4 خطوات",
    sub: "اللي بنعمله في كل بيت بنبنيه… من الأساس لحد آخر صبّة",
    grid: STEPS,
    notes: ["جسّة تربة وقواعد على الرسومات", "حديد مطابق وكانات بالمسطرة", "شدّة بالميزان وصبّة بالهزّاز", "مكعبات للمعمل ورشّ مية"],
  },
  foundation: {
    kicker: "ون هاوس · الأساس",
    title: "البيت كله شايله الأساس",
    accent: "الأساس",
    sub: "قبل الحفر بنعمل جسّة تربة نعرف بيها الأرض… والقواعد بتتسلّح على الرسومات بالظبط",
    art: { ...STEPS[0], cy: 1010 },
    chips: ["جسّة تربة", "قواعد مسلحة على الرسومات"],
  },
  columns: {
    kicker: "ون هاوس · الأعمدة",
    title: "الكانة بالمسطرة…|مش بالعين",
    accent: "بالمسطرة…",
    sub: "مسافة الكانات هي اللي بتدّي العمود قوته… علشان كده بنقيسها بالمسطرة",
    art: STEPS[1],
    chips: ["حديد مطابق للمواصفات", "كانات كل 15 سم"],
  },
  slab: {
    kicker: "ون هاوس · السقف",
    title: "سقفك مش هينشّ…|لو اتصب صح",
    accent: "صح",
    sub: "شدّة مستوية، وصبّة واحدة من غير وقفات، وهزّاز يطلّع الهوا من الخرسانة",
    art: STEPS[2],
    chips: ["شدّة بالميزان", "صبّة واحدة بالهزّاز"],
  },
  concrete: {
    kicker: "ون هاوس · الخرسانة",
    title: "الخرسانة القوية|محتاجة صبر",
    accent: "صبر",
    sub: "مكعبات من كل صبّة بتتكسر في المعمل… ورشّ مية أسبوع علشان متتشرخش",
    art: STEPS[3],
    chips: ["مكعبات للمعمل", "رشّ مية أسبوع"],
  },
  checklist: {
    kicker: "نصيحة من مهندس",
    title: "قبل ما تصب السقف…|اتأكد من 5 حاجات",
    accent: "5 حاجات",
    sub: "البسكوت: المكعبات الصغيرة اللي بترفع الحديد عن الخشب علشان يتغطى بالخرسانة",
    list: [
      "الشدّة مستوية بالميزان",
      "الحديد مطابق للرسومات",
      "الكانات متقاسة بالمسطرة",
      "البسكوت تحت الحديد",
      "المهندس راجع ومضى",
    ],
    chips: ["احفظ البوست ده لحد يوم الصبّة"],
  },
  review: {
    kicker: "في ون هاوس",
    title: "مهندس يراجع ويمضي…|وإنت متابع بالصور",
    accent: "ويمضي…",
    sub: "في ون هاوس كل مرحلة بتتراجع وتتمضي قبل اللي بعدها… وصور الموقع بتوصلك على الموبايل",
    art: { scene: Review, frame: C.studio - 8, cx: 540, cy: 1000, scale: 0.66 },
  },
  studio: {
    kicker: "أداة مجانية على موقع ون هاوس",
    title: "ارسم شقتك بنفسك…|ببلاش",
    accent: "ببلاش",
    sub: "استوديو 2D: ضيف أوضك بالمقاسات، واعرف المساحة، وصدّر المخطط PDF من الموبايل",
    art: { scene: Studio, frame: cue("PDF") + 6, cx: 540, cy: 990, scale: 0.54 },
    chips: ["ضيف الغرف", "صدّرها PDF", "ابعتها للمهندس"],
    url: "onehouse-eg.web.app/studio",
  },
  cta: { kicker: "", title: "" },
} satisfies Record<string, Post>;

export type PostId = keyof typeof POSTS;

// The art box sits between the headline and the footer.
const BOX = { top: 420, bottom: 1150 };

const Frozen: React.FC<{
  readonly art: Art;
  readonly x: number;
  readonly y: number;
  readonly scale?: number;
}> = ({ art, x, y, scale = 1 }) => {
  const s = art.scale * scale;
  const Scene = art.scene;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1920,
        transformOrigin: "0 0",
        transform: `translate(${x - art.cx * s}px, ${y - art.cy * s}px) scale(${s})`,
      }}
    >
      <Freeze frame={art.frame}>
        <Scene />
      </Freeze>
    </div>
  );
};

const Headline: React.FC<{
  readonly text: string;
  readonly accent?: string;
  readonly size: number;
}> = ({ text, accent, size }) => (
  <div
    style={{
      fontFamily: headingFont,
      fontWeight: 800,
      fontSize: size,
      lineHeight: 1.25,
      color: "white",
      textShadow: SHADOW,
    }}
  >
    {text.split("|").map((line, l) => (
      <div key={l}>
        {line.split(" ").map((w, i) => {
          const on = accent?.split(" ").includes(w);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                padding: "0 0.12em",
                position: "relative",
                color: on ? "#ff2a3d" : "white",
              }}
            >
              {w}
              {on && (
                <span
                  style={{
                    position: "absolute",
                    left: "0.12em",
                    right: "0.12em",
                    bottom: "0.04em",
                    height: size * 0.07,
                    background: P.red,
                    boxShadow: `0 0 20px ${P.red}`,
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
    ))}
  </div>
);

const Header: React.FC<{ readonly post: Post }> = ({ post }) => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      top: 46,
      left: 50,
      right: 50,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 18,
      textAlign: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 28px",
        borderRadius: 999,
        border: "2px solid rgba(143,182,221,0.4)",
        background: "rgba(4,15,29,0.6)",
        fontFamily: bodyFont,
        fontWeight: 600,
        fontSize: 32,
        color: "rgba(255,255,255,0.9)",
      }}
    >
      <span
        style={{ width: 14, height: 14, borderRadius: 7, background: P.red }}
      />
      {post.kicker}
    </div>
    {
      <Headline
        text={post.title}
        accent={post.accent}
        size={post.title.includes("|") ? 64 : 70}
      />
    }
    {post.sub && (
      <div
        style={{
          marginTop: -8,
          maxWidth: 900,
          fontFamily: bodyFont,
          fontWeight: 600,
          fontSize: 33,
          lineHeight: 1.45,
          color: "rgba(255,255,255,0.88)",
        }}
      >
        {post.sub}
      </div>
    )}
  </div>
);

const Chips: React.FC<{
  readonly items: readonly string[];
  readonly top: number;
}> = ({ items, top }) => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      top,
      left: 40,
      right: 40,
      display: "flex",
      justifyContent: "center",
      gap: 14,
    }}
  >
    {items.map((t, i) => (
      <div
        key={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 22px",
          borderRadius: 18,
          whiteSpace: "nowrap",
          background: i === items.length - 1 ? P.red : "rgba(4,15,29,0.85)",
          border:
            i === items.length - 1 ? "none" : "2px solid rgba(143,182,221,0.4)",
          boxShadow: "0 16px 36px rgba(0,0,0,0.4)",
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: items.length > 2 ? 34 : 38,
          color: "white",
        }}
      >
        <span style={{ color: i === items.length - 1 ? "white" : P.ok }}>
          ✓
        </span>
        {t}
      </div>
    ))}
  </div>
);

// Numbered rows, for the tips post people save.
const Checklist: React.FC<{ readonly items: readonly string[] }> = ({
  items,
}) => (
  <div
    dir="rtl"
    style={{
      position: "absolute",
      top: BOX.top + 20,
      left: 90,
      right: 90,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}
  >
    {items.map((t, i) => (
      <div
        key={t}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          height: 100,
          padding: "0 26px",
          borderRadius: 26,
          background: "rgba(15,44,76,0.9)",
          border: "2px solid rgba(143,182,221,0.35)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: 20,
            background: P.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 48,
            color: "white",
          }}
        >
          {i + 1}
        </div>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: 48,
            color: "white",
          }}
        >
          {t}
        </div>
        <div
          style={{
            marginRight: "auto",
            width: 56,
            height: 56,
            borderRadius: 28,
            border: `4px solid ${P.ok}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            color: P.ok,
            fontWeight: 900,
          }}
        >
          ✓
        </div>
      </div>
    ))}
  </div>
);

// Logo on one side, the booking button and website on the other.
const Footer: React.FC<{ readonly url?: string }> = ({
  url = "onehouse-eg.web.app",
}) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: 190,
      background:
        "linear-gradient(180deg, rgba(4,15,29,0), rgba(4,15,29,0.92) 35%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: 40,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${P.red}, transparent)`,
        opacity: 0.8,
      }}
    />
    <Img
      src={staticFile("brand/logo-white.png")}
      style={{ position: "absolute", left: 60, bottom: 34, height: 104 }}
    />
    <div
      style={{
        position: "absolute",
        right: 60,
        bottom: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <div
        dir="rtl"
        style={{
          padding: "16px 40px",
          borderRadius: 999,
          background: P.red,
          boxShadow: "0 16px 40px rgba(227,30,36,0.45)",
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 40,
          color: "white",
        }}
      >
        احجز معاينتك المجانية
      </div>
      <div
        style={{
          fontFamily: headingFont,
          fontWeight: 600,
          fontSize: 30,
          color: "rgba(255,255,255,0.85)",
          direction: "ltr",
        }}
      >
        {url}
      </div>
    </div>
  </div>
);

const Cta: React.FC = () => (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 30%, rgba(227,30,36,0.28), transparent 55%)",
      }}
    />
    <Img
      src={staticFile("brand/logo-white.png")}
      style={{ position: "absolute", left: 250, top: 90, width: 580 }}
    />
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 470,
        left: 0,
        right: 0,
        textAlign: "center",
      }}
    >
      <Headline text="بيت يعيش العمر كله" accent="العمر كله" size={92} />
      <div
        style={{
          marginTop: 18,
          fontFamily: headingFont,
          fontWeight: 700,
          fontSize: 46,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        المسلّح صح… من أول طوبة
      </div>
    </div>
    <div
      dir="rtl"
      style={{
        position: "absolute",
        top: 760,
        left: 90,
        right: 90,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 18,
      }}
    >
      {[
        "الأساس على الرسومات",
        "أعمدة بالمسطرة",
        "سقف بالميزان",
        "خرسانة بالمعمل",
        "مهندس بيمضي",
        "متابعة بالصور",
      ].map((t) => (
        <div
          key={t}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 22px",
            borderRadius: 18,
            background: "rgba(15,44,76,0.85)",
            border: "2px solid rgba(143,182,221,0.3)",
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: 34,
            color: "white",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: P.ok,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            ✓
          </span>
          {t}
        </div>
      ))}
    </div>
    <div
      style={{
        position: "absolute",
        top: 1080,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        dir="rtl"
        style={{
          padding: "28px 70px",
          borderRadius: 999,
          background: P.red,
          boxShadow: "0 24px 60px rgba(227,30,36,0.5)",
          outline: "4px solid rgba(227,30,36,0.35)",
          outlineOffset: 12,
          fontFamily: headingFont,
          fontWeight: 800,
          fontSize: 62,
          color: "white",
        }}
      >
        احجز معاينتك المجانية
      </div>
    </div>
    <div
      style={{
        position: "absolute",
        top: 1240,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: headingFont,
        fontWeight: 600,
        fontSize: 42,
        color: "white",
        direction: "ltr",
      }}
    >
      onehouse-eg.web.app
    </div>
  </>
);

export const FacebookPost: React.FC<{ readonly id: PostId }> = ({ id }) => {
  const post: Post = POSTS[id];
  const mid = (BOX.top + BOX.bottom) / 2;
  return (
    <AbsoluteFill style={{ backgroundColor: P.night, overflow: "hidden" }}>
      <Backdrop />
      <ArtOnly.Provider value>
        {id === "cta" ? (
          <Cta />
        ) : (
          <>
            {post.art && <Frozen art={post.art} x={540} y={mid} />}
            {post.list && <Checklist items={post.list} />}
            {post.grid && (
              <div
                style={{
                  position: "absolute",
                  left: 60,
                  right: 60,
                  top: BOX.top + 10,
                  height: BOX.bottom - BOX.top - 20,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
                dir="rtl"
              >
                {post.grid.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      borderRadius: 28,
                      overflow: "hidden",
                      background: "rgba(15,44,76,0.55)",
                      border: "2px solid rgba(143,182,221,0.3)",
                    }}
                  >
                    <Frozen art={a} x={230} y={190} scale={0.44} />
                    <div
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "6px 18px 6px 6px",
                        borderRadius: 18,
                        background: "rgba(4,15,29,0.85)",
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: 14,
                          background: P.red,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: headingFont,
                          fontWeight: 900,
                          fontSize: 34,
                          color: "white",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div
                        style={{
                          fontFamily: headingFont,
                          fontWeight: 800,
                          fontSize: 40,
                          color: "white",
                          textShadow: SHADOW,
                        }}
                      >
                        {["الأساس", "الأعمدة", "السقف", "الخرسانة"][i]}
                      </div>
                    </div>
                    {post.notes && (
                      <div
                        style={{
                          position: "absolute",
                          left: 10,
                          right: 10,
                          bottom: 10,
                          padding: "8px 10px",
                          borderRadius: 14,
                          background: "rgba(4,15,29,0.88)",
                          textAlign: "center",
                          fontFamily: headingFont,
                          fontWeight: 700,
                          fontSize: 25,
                          color: "white",
                        }}
                      >
                        {post.notes[i]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Header post={post} />
            {post.chips && <Chips items={post.chips} top={BOX.bottom - 96} />}
            <Footer url={post.url} />
          </>
        )}
      </ArtOnly.Provider>
      <Finish />
    </AbsoluteFill>
  );
};
