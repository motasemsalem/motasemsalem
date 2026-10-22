import { useCurrentFrame, useVideoConfig } from "remotion";
import {
  Camel,
  CustomsArt,
  GoldDust,
  KhitatArt,
  NamesWall,
  RebabArt,
} from "./art/art";
import { makeCue } from "./cue";
import {
  type Arrow,
  EgyptMap,
  type Pin,
  type Region,
  sampleCurve,
  toScreen,
} from "./components/EgyptMap";
import { Shell } from "./components/Shell";
import { Sfx } from "./components/Sound";
import type { TimedTribe } from "./components/Tribes";
import { type LonLat, P } from "./geo";
import { NARRATION, type SceneId } from "./narration";
import { C } from "./theme";
import type { Word } from "./timing";
import { ALL_TRIBES, tallyBefore, TRIBES } from "./tribes";

export type SceneProps = { readonly words: Word[]; readonly index: number };

const ORDER = NARRATION.map((n) => n.id);

// Cue lookup, this scene's tribes timed to the narration, their map pins, and the tally so far.
const useScene = (id: SceneId, words: Word[]) => {
  const cue = makeCue(words, useVideoConfig().fps);
  const tribes: TimedTribe[] = (TRIBES[id] ?? []).map((t) => ({
    ...t,
    frame: cue(t.cue),
  }));
  const pins: Pin[] = tribes.map((t, i) => ({
    at: t.at,
    label: t.name,
    side: t.side,
    delay: t.frame,
    color: i % 2 ? C.red : C.gold,
  }));
  return { cue, tribes, pins, before: tallyBefore(id, ORDER) };
};

// Sound for everything that lands on the map: a whoosh per arrow, a blip per region.
const MapSfx: React.FC<{
  arrows?: readonly Arrow[];
  regions?: readonly Region[];
  pins?: readonly Pin[];
}> = ({ arrows = [], regions = [], pins = [] }) => (
  <>
    {arrows.map((a, i) => (
      <Sfx key={`a${i}`} name="whoosh" at={a.delay} volume={0.4} />
    ))}
    {regions.map((r, i) => (
      <Sfx key={`r${i}`} name="blip" at={r.delay} volume={0.25} />
    ))}
    {pins.map((p, i) => (
      <Sfx key={`p${i}`} name="camera" at={p.delay} volume={0.3} />
    ))}
  </>
);

export const IntroScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue } = useScene("intro", words);
  const pins: Pin[] = ALL_TRIBES.map((t, i) => ({
    at: t.at,
    delay: 14 + i * 2,
    color: i % 2 ? C.red : C.gold,
  }));
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ count: 30, prefix: "أكثر من ", suffix: " قبيلة" }}
      title="القبائل العربية في مصر"
      chips={[
        { text: "١٤٠٠ عام", at: cue("ألف") },
        { text: "من الصعيد إلى سيناء", at: cue("الصعيد") },
      ]}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [30.4, 27.0], zoom: 0.9 },
          { frame: 300, at: [30.4, 27.0], zoom: 1.05 },
        ]}
        drawFrames={26}
        pins={pins}
        showCities={false}
      />
      <Sfx name="hit" volume={0.6} />
      {pins.map((p, i) => (
        <Sfx key={i} name="pop" at={p.delay} volume={0.15} />
      ))}
    </Shell>
  );
};

export const ConquestScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, before } = useScene("conquest", words);
  const arrows: Arrow[] = [
    {
      path: [P.rafah, [32.6, 31.35], P.fustat],
      delay: cue("جيش", -4),
      duration: 30,
    },
  ];
  const pins: Pin[] = [
    { at: P.arish, label: "العريش", delay: cue("جيش"), side: "top" },
    {
      at: P.fustat,
      label: "الفسطاط",
      delay: cue("الفسطاط", -10),
      side: "bottom",
      big: true,
    },
  ];
  const khitat = cue("نزلت", -6);
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ count: 639, suffix: " م" }}
      title="الفتح والفسطاط"
      chips={[
        { text: "عمرو بن العاص", at: cue("عمرو") },
        { text: "الخِطَط القبلية", at: khitat + 4 },
      ]}
      tribes={tribes}
      tallyBefore={before}
      cards={false}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.4, 30.4], zoom: 2.1 },
          { frame: khitat, at: [31.4, 30.1], zoom: 3.2 },
        ]}
        arrows={arrows}
        pins={pins}
      />
      <KhitatArt
        start={khitat}
        blocks={tribes.map((t) => ({ name: t.name, frame: t.frame }))}
      />
      <MapSfx arrows={arrows} pins={pins} />
      <Sfx name="swell" at={khitat - 6} volume={0.2} />
    </Shell>
  );
};

export const QaysScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("qays", words);
  const regions: Region[] = [
    { at: P.sharqia, rx: 36, ry: 26, delay: cue("الشرقية") },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ count: 727, suffix: " م" }}
      title="قيس في الشرقية"
      chips={[
        { text: "الدولة الأموية", at: cue("الأمويون") },
        { text: "آلاف الأسر", at: cue("آلافا") },
      ]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.0, 29.0], zoom: 1.4 },
          { frame: cue("الشرقية"), at: [31.4, 30.3], zoom: 3.6 },
        ]}
        centerY={400}
        regions={regions}
        pins={[
          ...pins,
          {
            at: P.fustat,
            label: "الفسطاط",
            delay: cue("نقل"),
            side: "left",
            color: C.red,
          },
        ]}
      />
      <MapSfx regions={regions} />
    </Shell>
  );
};

export const HilalScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("hilal", words);
  const regions: Region[] = [
    {
      at: P.upperEgypt,
      rx: 60,
      ry: 110,
      rotate: -15,
      delay: cue("الصعيد"),
    },
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
      delay: cue("غربا", 6),
      duration: 34,
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
        { text: "أكبر هجرة عربية", at: cue("أكبر") },
      ]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.5, 26.6], zoom: 2 },
          { frame: cue("غربا", 12), at: [27.0, 28.2], zoom: 0.85 },
        ]}
        centerY={380}
        regions={regions}
        arrows={arrows}
        pins={[
          ...pins,
          {
            at: [22.0, 30.6],
            label: "المغرب",
            delay: cue("المغرب"),
            side: "top",
            color: C.red,
          },
        ]}
      />
      <MapSfx arrows={arrows} regions={regions} />
    </Shell>
  );
};

export const SiraScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, before } = useScene("sira", words);
  const badge = cue("اليونسكو");
  const heroes = cue("زيد");
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "ملحمة شعبية" }}
      title="السيرة الهلالية"
      chips={[
        { text: "أبو زيد الهلالي", at: heroes },
        { text: "دياب بن غانم", at: heroes + 8 },
        { text: "الزناتي خليفة", at: heroes + 16 },
      ]}
      tallyBefore={before}
    >
      <RebabArt badgeAt={badge} />
      <Sfx name="swell" at={0} volume={0.25} />
      <Sfx name="ding" at={badge} volume={0.35} />
      <Sfx name="shimmer" at={badge + 4} volume={0.15} />
    </Shell>
  );
};

export const SaeedScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("saeed", words);
  const regions: Region[] = [
    {
      at: [31.95, 26.5],
      rx: 120,
      ry: 36,
      rotate: 49,
      delay: cue("الصعيد"),
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "صعيد مصر" }}
      title="جُهينة وهوّارة"
      chips={[
        { text: "مدينة جهينة · سوهاج", at: cue("مدينة") },
        { text: "شيخ العرب همّام", at: cue("همام") },
      ]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.0, 27.6], zoom: 1.6 },
          { frame: cue("جهينة"), at: [31.6, 26.6], zoom: 3.0 },
          { frame: cue("وهوارة"), at: [31.85, 26.35], zoom: 2.8 },
        ]}
        centerY={400}
        regions={regions}
        pins={pins}
      />
      <MapSfx regions={regions} />
      <Sfx name="boom" at={cue("همام")} volume={0.3} />
    </Shell>
  );
};

export const SouthScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("south", words);
  const focus: LonLat = [32.95, 24.3];
  const zoom = 2.6;
  const centerY = 360;
  const gold = cue("لذهب");
  const regions: Region[] = [
    { at: P.allaqi, rx: 30, ry: 22, delay: gold, color: C.gold },
  ];
  const dust = toScreen(P.allaqi, focus, zoom, centerY);
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "قنا · الأقصر · أسوان" }}
      title="الأشراف والجعافرة"
      chips={[
        { text: "آل البيت", at: cue("آل") },
        { text: "ذهب العلّاقي", at: gold },
      ]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.4, 26.6], zoom: 2.2 },
          { frame: cue("الأشراف", 6), at: [32.55, 25.9], zoom: 2.8 },
          { frame: cue("أسوان", 4), at: focus, zoom },
        ]}
        centerY={centerY}
        regions={regions}
        pins={[
          ...pins,
          {
            at: P.allaqi,
            label: "وادي العلّاقي",
            delay: cue("العلاقي"),
            side: "right",
          },
        ]}
      />
      <GoldDust start={gold} x={dust.x} y={dust.y} />
      <MapSfx regions={regions} />
      <Sfx name="shimmer" at={gold} volume={0.3} />
    </Shell>
  );
};

// The old caravan road from Qift on the Nile to Quseir on the Red Sea.
const CARAVAN: Arrow["path"] = [
  [32.8, 26.0],
  [33.6, 26.5],
  [34.27, 26.1],
];

export const AbabdaScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("ababda", words);
  const regions: Region[] = [
    {
      at: [34.0, 24.7],
      rx: 80,
      ry: 135,
      rotate: -32,
      delay: cue("الصحراء"),
      color: C.gold,
    },
  ];
  const arrows: Arrow[] = [
    { path: CARAVAN, delay: cue("القوافل", -6), duration: 24 },
  ];
  const caravan = (zoom: number) => {
    const { pts } = sampleCurve(CARAVAN);
    return [0, 1, 2].map((k) => (
      <CaravanCamel
        key={k}
        pts={pts}
        start={cue("القوافل", 10) + k * 8}
        zoom={zoom}
      />
    ));
  };
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "الصحراء الشرقية" }}
      title="العبابدة"
      chips={[
        { text: "بين النيل والبحر الأحمر", at: cue("النيل") },
        { text: "أدلّاء القوافل", at: cue("أدلاء") },
      ]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [33.0, 25.8], zoom: 1.6 },
          { frame: cue("القوافل"), at: [33.5, 25.6], zoom: 2.4 },
        ]}
        centerY={420}
        regions={regions}
        arrows={arrows}
        pins={[
          ...pins,
          {
            at: [32.8, 26.0],
            label: "قِفط",
            delay: cue("القوافل"),
            side: "left",
          },
          {
            at: [34.27, 26.1],
            label: "القُصير",
            delay: cue("ودروب"),
            side: "right",
          },
        ]}
        layers={caravan}
      />
      <MapSfx regions={regions} arrows={arrows} />
      <Sfx name="wind" at={0} volume={0.3} />
    </Shell>
  );
};

// One camel walking the caravan road, in map units.
const CaravanCamel: React.FC<{
  pts: [number, number][];
  start: number;
  zoom: number;
}> = ({ pts, start, zoom }) => {
  const frame = useCurrentFrame();
  if (frame < start) return null;
  const t = Math.min(1, (frame - start) / 160);
  const [x, y] = pts[Math.round(t * (pts.length - 1))];
  return (
    <g transform={`translate(${x} ${y - 14 / zoom}) scale(${0.32 / zoom})`}>
      <Camel stride={frame / 3} color={C.sand} />
    </g>
  );
};

export const SinaiNorthScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("sinaiNorth", words);
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "شمال سيناء" }}
      title="قبائل الشمال"
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [32.4, 30.0], zoom: 1.5 },
          { frame: cue("السواركة"), at: [33.75, 30.85], zoom: 3.3 },
          { frame: cue("والبياضية"), at: [33.6, 30.85], zoom: 3.2 },
        ]}
        centerY={330}
        pins={pins}
      />
      <Sfx name="wind" at={0} volume={0.22} />
    </Shell>
  );
};

export const SinaiSouthScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("sinaiSouth", words);
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "وسط وجنوب سيناء" }}
      title="قبائل الجبل والوادي"
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [33.8, 30.4], zoom: 2.4 },
          { frame: cue("مزينة"), at: [33.85, 29.35], zoom: 2.0 },
        ]}
        centerY={300}
        pins={pins}
      />
      <Sfx name="wind" at={0} volume={0.22} />
    </Shell>
  );
};

export const CanalScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("canal", words);
  const regions: Region[] = [
    {
      at: [32.33, 30.6],
      rx: 18,
      ry: 70,
      delay: cue("القناة"),
      color: C.nile,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "قناة السويس والشرقية" }}
      title="قبائل القناة"
      chips={[{ text: "الخيل العربية الأصيلة", at: cue("الخيل") }]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [31.6, 29.8], zoom: 1.8 },
          { frame: cue("القناة", 4), at: [32.1, 30.35], zoom: 3.8 },
        ]}
        centerY={380}
        regions={regions}
        pins={pins}
      />
      <MapSfx regions={regions} />
    </Shell>
  );
};

export const WestScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("west", words);
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
    { at: [27.6, 30.9], rx: 190, ry: 36, rotate: -6, delay: cue("أولاد") },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "الصحراء الغربية" }}
      title="أولاد علي"
      chips={[
        { text: "الأحمر والأبيض", at: cue("الأحمر") },
        { text: "من بني سُليم", at: cue("سليم") },
      ]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [28.5, 28.5], zoom: 1.2 },
          { frame: cue("مطروح"), at: [27.2, 30.6], zoom: 2.3 },
          { frame: cue("برقة", 12), at: [25.4, 30.7], zoom: 1.7 },
        ]}
        centerY={420}
        regions={regions}
        arrows={arrows}
        pins={[
          ...pins,
          {
            at: [22.4, 31.0],
            label: "برقة · ليبيا",
            delay: cue("برقة"),
            side: "bottom",
            color: C.red,
          },
        ]}
      />
      <MapSfx arrows={arrows} regions={regions} />
    </Shell>
  );
};

export const MiddleScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, tribes, pins, before } = useScene("middle", words);
  const arrows: Arrow[] = [
    {
      path: [
        [20.1, 32.1],
        [25.5, 32.6],
        [30.84, 29.4],
      ],
      delay: cue("هاجروا", -4),
      duration: 30,
      color: C.red,
    },
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "الفيوم · المنيا · بني سويف" }}
      title="الجوازي والفوايد"
      chips={[{ text: "مذبحة بنغازي ١٨١٧", at: cue("مذبحة") }]}
      tribes={tribes}
      tallyBefore={before}
    >
      <EgyptMap
        camera={[
          { frame: 0, at: [30.9, 29.0], zoom: 2.6 },
          { frame: cue("هاجروا", 2), at: [26.5, 30.2], zoom: 1.0 },
          { frame: cue("والفوايد"), at: [30.8, 29.4], zoom: 2.4 },
        ]}
        centerY={340}
        arrows={arrows}
        pins={[
          ...pins,
          {
            at: [20.1, 32.1],
            label: "بنغازي",
            delay: cue("بنغازي"),
            side: "bottom",
            color: C.red,
          },
        ]}
      />
      <MapSfx arrows={arrows} />
    </Shell>
  );
};

export const CustomsScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, before } = useScene("customs", words);
  const cues = [
    cue("المجالس", -4),
    cue("والشعر", -4),
    cue("وسباقات", -4),
    cue("وكرم", -4),
  ];
  return (
    <Shell
      index={index}
      words={words}
      kicker={{ text: "حتى اليوم" }}
      title="عادات باقية"
      tallyBefore={before}
    >
      <CustomsArt cues={cues} />
      {cues.map((at, i) => (
        <Sfx key={i} name="hit-soft" at={at} volume={0.4} />
      ))}
    </Shell>
  );
};

export const ClosingScene: React.FC<SceneProps> = ({ words, index }) => {
  const { cue, before } = useScene("closing", words);
  const cta = cue("تابعنا");
  return (
    <Shell
      index={index}
      words={words}
      title="نسيج مصر الواحد"
      chips={[{ text: "تابعنا لمزيد من التاريخ ✦", at: cta }]}
      tallyBefore={before}
    >
      <NamesWall names={ALL_TRIBES.map((t) => t.name)} start={8} />
      {ALL_TRIBES.map((_, i) =>
        i % 3 === 0 ? (
          <Sfx key={i} name="pop" at={8 + i * 2} volume={0.18} />
        ) : null,
      )}
      <Sfx name="riser" at={cta - 48} volume={0.25} />
      <Sfx name="hit" at={cta} volume={0.5} />
    </Shell>
  );
};
