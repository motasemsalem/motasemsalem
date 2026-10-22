import { useVideoConfig } from "remotion";
import { CustomsArt, GoldDust, KhitatArt, RebabArt } from "./art/art";
import { makeCue } from "./cue";
import {
  type Arrow,
  EgyptMap,
  type Pin,
  type Region,
  toScreen,
} from "./components/EgyptMap";
import { Shell } from "./components/Shell";
import { Sfx } from "./components/Sound";
import { P } from "./geo";
import { C } from "./theme";
import type { Word } from "./timing";

export type SceneProps = { readonly words: Word[]; readonly index: number };

const useCue = (words: Word[]) => makeCue(words, useVideoConfig().fps);

// Sound for everything that lands on the map: a snap per pin, a whoosh per arrow.
const MapSfx: React.FC<{
  pins?: readonly Pin[];
  arrows?: readonly Arrow[];
  regions?: readonly Region[];
}> = ({ pins = [], arrows = [], regions = [] }) => (
  <>
    {pins.map((p, i) => (
      <Sfx key={`p${i}`} name="camera" at={p.delay} volume={0.35} />
    ))}
    {arrows.map((a, i) => (
      <Sfx key={`a${i}`} name="whoosh" at={a.delay} volume={0.35} />
    ))}
    {regions.map((r, i) => (
      <Sfx key={`r${i}`} name="blip" at={r.delay} volume={0.25} />
    ))}
  </>
);

// Pins for every tribe in the reel, used by the intro and the closing.
const ALL_TRIBES: {
  at: readonly [number, number];
  label: string;
  side: Pin["side"];
}[] = [
  { at: P.sharqia, label: "قيس", side: "left" },
  { at: P.juhayna, label: "جهينة", side: "left" },
  { at: P.aswan, label: "بنو الكنز", side: "left" },
  { at: P.farshut, label: "هوّارة", side: "bottom" },
  { at: P.qena, label: "الأشراف", side: "right" },
  { at: P.easternDesert, label: "العبابدة", side: "right" },
  { at: P.sawarka, label: "السواركة", side: "top" },
  { at: P.tarabin, label: "الترابين", side: "right" },
  { at: P.muzeina, label: "مزينة", side: "right" },
  { at: P.matruh, label: "أولاد علي", side: "bottom" },
  { at: [29.4, 27.0], label: "بنو هلال", side: "bottom" },
];

export const IntroScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const pins: Pin[] = ALL_TRIBES.map((t, i) => ({
    at: t.at,
    delay: 18 + i * 3,
    color: i % 2 ? C.red : C.gold,
  }));
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ count: 1400, prefix: "أكثر من ", suffix: " سنة" }}
      title="القبائل العربية في مصر"
      chips={[
        { text: "١٣ محطة", at: cue("دقيقة", -4) },
        { text: "من الفتح إلى اليوم", at: cue("دقيقة", 2) },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [30.5, 26.8], zoom: 0.95 },
          { frame: 200, at: [30.5, 26.8], zoom: 1.05 },
        ]}
        drawFrames={26}
        pins={pins}
      />
      <Sfx name="hit" volume={0.55} />
      <Sfx name="riser" at={0} volume={0.12} />
      {pins.map((p, i) => (
        <Sfx key={i} name="pop" at={p.delay} volume={0.18} />
      ))}
    </Shell>
  );
};

export const ConquestScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const arrows: Arrow[] = [
    {
      path: [P.rafah, [32.6, 31.3], P.fustat],
      delay: cue("بقيادة", -6),
      duration: 30,
    },
  ];
  const pins: Pin[] = [
    { at: P.arish, label: "العريش", delay: cue("الفتح"), side: "top" },
    {
      at: P.fustat,
      label: "الفسطاط",
      delay: cue("الفسطاط"),
      side: "bottom",
      big: true,
    },
  ];
  const khitat = cue("نزلت", -4);
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ count: 639, suffix: " م" }}
      title="الفتح الإسلامي"
      chips={[
        { text: "عمرو بن العاص", at: cue("عمرو") },
        { text: "الفسطاط", at: cue("الفسطاط") },
        { text: "الخِطَط", at: cue("الخطة") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.4, 30.4], zoom: 2.1 },
          { frame: khitat, at: [31.6, 30.2], zoom: 2.6 },
        ]}
        arrows={arrows}
        pins={pins}
      />
      <KhitatArt start={khitat} />
      <MapSfx pins={pins} arrows={arrows} />
      <Sfx name="swell" at={khitat - 10} volume={0.2} />
    </Shell>
  );
};

export const QaysScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const regions: Region[] = [
    { at: P.sharqia, rx: 34, ry: 24, delay: cue("الشرقية") },
  ];
  const pins: Pin[] = [
    {
      at: P.bilbeis,
      label: "بلبيس",
      delay: cue("بلبيس"),
      side: "bottom",
      big: true,
    },
    { at: P.fustat, label: "الفسطاط", delay: cue("الأمويون"), side: "left" },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ count: 727, suffix: " م" }}
      title="قيس في الشرقية"
      chips={[
        { text: "الدولة الأموية", at: cue("الأمويون") },
        { text: "آلاف الأسر", at: cue("آلاف") },
        { text: "بلبيس", at: cue("بلبيس") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.0, 29.0], zoom: 1.4 },
          { frame: cue("الشرقية"), at: [31.5, 30.35], zoom: 3.6 },
        ]}
        regions={regions}
        pins={pins}
      />
      <MapSfx pins={pins} regions={regions} />
    </Shell>
  );
};

export const HilalScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const regions: Region[] = [
    { at: P.upperEgypt, rx: 60, ry: 110, rotate: -15, delay: cue("هلال", -8) },
  ];
  const arrows: Arrow[] = [
    {
      path: [[31.9, 26.8], [27.5, 29.5], P.maghreb],
      delay: cue("غربا", -4),
      duration: 34,
      color: C.red,
    },
    {
      path: [
        [31.6, 26.0],
        [26.5, 27.0],
        [21.5, 28.4],
      ],
      delay: cue("غربا", 4),
      duration: 34,
    },
  ];
  const pins: Pin[] = [
    { at: [31.4, 27.6], label: "بنو هلال", delay: cue("هلال"), side: "right" },
    { at: [31.4, 25.4], label: "بنو سُليم", delay: cue("سليم"), side: "right" },
    {
      at: [22.0, 30.6],
      label: "المغرب",
      delay: cue("المغرب"),
      side: "top",
      color: C.red,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "القرن الحادي عشر" }}
      title="تغريبة بني هلال"
      chips={[
        { text: "الفاطميون", at: cue("الفاطميون") },
        { text: "من الصعيد غربًا", at: cue("غربا") },
        { text: "أكبر هجرة", at: cue("أكبر") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.5, 26.6], zoom: 2 },
          { frame: cue("غربا", 10), at: [27.0, 28.0], zoom: 0.85 },
        ]}
        regions={regions}
        arrows={arrows}
        pins={pins}
      />
      <MapSfx pins={pins} arrows={arrows} regions={regions} />
    </Shell>
  );
};

export const SiraScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const badge = cue("اليونسكو");
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "ملحمة شعبية" }}
      title="السيرة الهلالية"
      chips={[
        { text: "أبو زيد الهلالي", at: cue("زيد") },
        { text: "شعراء الصعيد", at: cue("شعراء") },
        { text: "الربابة", at: cue("الربابة") },
      ]}
    >
      <RebabArt badgeAt={badge} />
      <Sfx name="swell" at={0} volume={0.25} />
      <Sfx name="ding" at={badge} volume={0.35} />
      <Sfx name="shimmer" at={badge + 4} volume={0.15} />
    </Shell>
  );
};

export const JuhaynaScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const arrows: Arrow[] = [
    {
      path: [[31.4, 26.3], [30.6, 23.6], P.sudan],
      delay: cue("السودان", -14),
      duration: 26,
    },
  ];
  const pins: Pin[] = [
    {
      at: P.juhayna,
      label: "جهينة · سوهاج",
      delay: cue("سوهاج", -6),
      side: "left",
      big: true,
    },
    {
      at: [31.3, 21.2],
      label: "السودان",
      delay: cue("السودان", 8),
      side: "left",
      color: C.red,
    },
  ];
  const regions: Region[] = [
    { at: [31.8, 26.6], rx: 50, ry: 90, rotate: 40, delay: cue("الصعيد") },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "الصعيد" }}
      title="جُهينة"
      chips={[
        { text: "انتشار في الصعيد", at: cue("الصعيد") },
        { text: "مدينة جهينة", at: cue("مدينة") },
        { text: "فروع في السودان", at: cue("السودان") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.6, 26.6], zoom: 2.6 },
          { frame: cue("سوهاج", 6), at: [31.6, 26.6], zoom: 2.4 },
          { frame: cue("السودان", 4), at: [31.8, 24.1], zoom: 1.12 },
        ]}
        regions={regions}
        arrows={arrows}
        pins={pins}
      />
      <MapSfx pins={pins} arrows={arrows} regions={regions} />
    </Shell>
  );
};

export const KanzScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const focus = [33.05, 23.4] as const;
  const zoom = 2.1;
  const gold = cue("لذهب");
  const regions: Region[] = [
    { at: P.allaqi, rx: 30, ry: 22, delay: gold, color: C.gold },
  ];
  const pins: Pin[] = [
    {
      at: P.aswan,
      label: "أسوان",
      delay: cue("أسوان"),
      side: "left",
      big: true,
    },
    {
      at: P.allaqi,
      label: "وادي العلاقي",
      delay: cue("العلاقي"),
      side: "right",
    },
  ];
  const dust = toScreen(P.allaqi, focus, zoom);
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "أسوان" }}
      title="بنو الكنز"
      chips={[
        { text: "قبيلة ربيعة", at: cue("ربيعة") },
        { text: "ذهب العلاقي", at: gold },
        { text: "مع النوبيين", at: cue("بالنوبيين") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.5, 25.5], zoom: 1.3 },
          { frame: cue("أسوان", 6), at: focus, zoom },
        ]}
        regions={regions}
        pins={pins}
      />
      <GoldDust start={gold} x={dust.x} y={dust.y} />
      <MapSfx pins={pins} regions={regions} />
      <Sfx name="shimmer" at={gold} volume={0.3} />
    </Shell>
  );
};

export const HawwaraScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const regions: Region[] = [
    {
      at: [31.95, 26.5],
      rx: 120,
      ry: 34,
      rotate: 49,
      delay: cue("الصعيد", -4),
    },
  ];
  const pins: Pin[] = [
    {
      at: P.farshut,
      label: "فرشوط",
      delay: cue("همام"),
      side: "right",
      big: true,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "القرن الثامن عشر" }}
      title="هوّارة"
      chips={[
        { text: "أصل أمازيغي", at: cue("أمازيغي") },
        { text: "شيخ العرب همّام", at: cue("همام") },
        { text: "حكم الصعيد", at: cue("معظم") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.2, 27.6], zoom: 1.6 },
          { frame: cue("همام"), at: [31.9, 26.4], zoom: 2.6 },
        ]}
        regions={regions}
        pins={pins}
      />
      <MapSfx pins={pins} regions={regions} />
      <Sfx name="boom" at={cue("همام")} volume={0.3} />
    </Shell>
  );
};

export const AshrafScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const regions: Region[] = [
    { at: [32.7, 25.9], rx: 40, ry: 60, delay: cue("الأشراف"), color: C.red },
    {
      at: P.easternDesert,
      rx: 75,
      ry: 125,
      rotate: -32,
      delay: cue("العبابدة"),
      color: C.gold,
    },
  ];
  const pins: Pin[] = [
    {
      at: P.qena,
      label: "الأشراف",
      delay: cue("الأشراف", 4),
      side: "left",
      big: true,
    },
    {
      at: P.easternDesert,
      label: "العبابدة",
      delay: cue("العبابدة", 4),
      side: "top",
      big: true,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "الصعيد والصحراء الشرقية" }}
      title="الأشراف والعبابدة"
      chips={[
        { text: "آل البيت", at: cue("آل") },
        { text: "الصحراء الشرقية", at: cue("الصحراء") },
        { text: "النيل ↔ البحر الأحمر", at: cue("الأحمر", -4) },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.6, 26.2], zoom: 2.4 },
          { frame: cue("العبابدة", 6), at: [33.4, 25.2], zoom: 1.55 },
        ]}
        regions={regions}
        pins={pins}
      />
      <MapSfx pins={pins} regions={regions} />
    </Shell>
  );
};

export const SinaiScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const pins: Pin[] = [
    { at: P.tarabin, label: "الترابين", delay: cue("الترابين"), side: "right" },
    { at: P.sawarka, label: "السواركة", delay: cue("السواركة"), side: "top" },
    { at: P.tiyaha, label: "التياها", delay: cue("التياها"), side: "top" },
    { at: P.muzeina, label: "مزينة", delay: cue("مزينة"), side: "right" },
    {
      at: P.jebeliya,
      label: "الجبالية",
      delay: cue("الجبالية"),
      side: "left",
      color: C.red,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "شبه جزيرة سيناء" }}
      title="قبائل سيناء"
      chips={[
        { text: "الشمال", at: cue("الشمال") },
        { text: "الوسط", at: cue("الوسط") },
        { text: "الجنوب", at: cue("الجنوب") },
        { text: "دير سانت كاترين", at: cue("كاترين") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.0, 29.0], zoom: 1.4 },
          { frame: 18, at: [33.7, 29.75], zoom: 2.75 },
          { frame: cue("الجنوب"), at: [33.75, 29.45], zoom: 2.8 },
        ]}
        pins={pins}
      />
      <MapSfx pins={pins} />
      <Sfx name="wind" at={0} volume={0.25} />
    </Shell>
  );
};

export const WestScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const arrows: Arrow[] = [
    {
      path: [
        [22.4, 31.0],
        [24.8, 32.0],
        [27.0, 31.25],
      ],
      delay: cue("برقة", -6),
      duration: 26,
      color: C.red,
    },
  ];
  const regions: Region[] = [
    { at: [27.0, 30.9], rx: 150, ry: 34, rotate: -8, delay: cue("أولاد") },
  ];
  const pins: Pin[] = [
    {
      at: P.matruh,
      label: "مطروح",
      delay: cue("مطروح"),
      side: "bottom",
      big: true,
    },
    {
      at: [22.4, 31.0],
      label: "برقة · ليبيا",
      delay: cue("برقة"),
      side: "bottom",
      color: C.red,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "الصحراء الغربية" }}
      title="أولاد علي"
      chips={[
        { text: "أكبر قبائل مطروح", at: cue("أكبر") },
        { text: "من برقة", at: cue("برقة") },
        { text: "بنو سُليم", at: cue("سليم") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [28.5, 28.0], zoom: 1.2 },
          { frame: cue("مطروح"), at: [26.3, 30.6], zoom: 2.2 },
          { frame: cue("برقة", 12), at: [25.2, 30.7], zoom: 1.7 },
        ]}
        regions={regions}
        arrows={arrows}
        pins={pins}
      />
      <MapSfx pins={pins} arrows={arrows} regions={regions} />
    </Shell>
  );
};

export const CustomsScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const cues = [cue("المجالس", -4), cue("الشعر", -4), cue("وكرم", -4)];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "حتى اليوم" }}
      title="عادات باقية"
    >
      <CustomsArt cues={cues} />
      {cues.map((at, i) => (
        <Sfx key={i} name="swoosh" at={at} volume={0.4} />
      ))}
    </Shell>
  );
};

export const ClosingScene: React.FC<SceneProps> = ({ words, index }) => {
  const cue = useCue(words);
  const pins: Pin[] = ALL_TRIBES.map((t, i) => ({
    at: t.at,
    label: t.label,
    delay: 8 + i * 4,
    color: i % 2 ? C.red : C.gold,
    side: t.side,
  }));
  const cta = cue("تابعنا");
  return (
    <Shell
      index={index}
      words={words}
      title="نسيج مصر الواحد"
      chips={[{ text: "تابعنا لمزيد من التاريخ ✦", at: cta }]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [30.5, 26.8], zoom: 1.15 },
          { frame: 160, at: [30.3, 26.8], zoom: 0.98 },
        ]}
        pins={pins}
      />
      {pins.map((p, i) => (
        <Sfx key={i} name="pop" at={p.delay} volume={0.2} />
      ))}
      <Sfx name="riser" at={cta - 48} volume={0.25} />
      <Sfx name="hit" at={cta} volume={0.5} />
    </Shell>
  );
};
