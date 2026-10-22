// Simplified geography of Egypt, as [longitude, latitude] pairs, and its projection into map units.
export type LonLat = readonly [number, number];

const LON0 = 24.3;
const LAT0 = 32.2;
const K = 87; // map units per degree of latitude
const COS = Math.cos((27 * Math.PI) / 180);

export const MAP_W = 1000;
export const MAP_H = 940;

export const project = ([lon, lat]: LonLat): [number, number] => [
  (lon - LON0) * K * COS,
  (LAT0 - lat) * K,
];

export const toPath = (pts: readonly LonLat[], close = false) =>
  pts
    .map((p, i) => {
      const [x, y] = project(p);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ") + (close ? " Z" : "");

// Mainland and Sinai, clockwise from Sallum. The southern border follows the 22nd parallel.
export const EGYPT: LonLat[] = [
  [25.15, 31.57],
  [26.2, 31.55],
  [27.24, 31.36],
  [28.2, 31.05],
  [28.95, 30.84],
  [29.55, 31.0],
  [29.9, 31.2],
  [30.35, 31.46],
  [30.9, 31.58],
  [31.5, 31.5],
  [31.85, 31.52],
  [32.3, 31.27],
  [32.9, 31.12],
  [33.8, 31.13],
  [34.24, 31.32],
  [34.9, 29.49],
  [34.7, 28.95],
  [34.45, 28.1],
  [34.25, 27.73],
  [33.85, 28.05],
  [33.4, 28.6],
  [32.85, 29.4],
  [32.6, 29.95],
  [32.35, 29.65],
  [32.65, 29.05],
  [33.1, 28.3],
  [33.55, 27.6],
  [33.85, 27.15],
  [34.0, 26.7],
  [34.3, 26.1],
  [34.9, 25.05],
  [35.3, 24.4],
  [35.75, 23.9],
  [35.6, 23.3],
  [36.15, 22.7],
  [36.9, 22.0],
  [31.4, 22.0],
  [25.0, 22.0],
  [25.0, 29.5],
  [24.85, 30.2],
  [25.15, 31.57],
];

export const NILE: LonLat[] = [
  [31.3, 22.0],
  [32.1, 22.6],
  [32.6, 23.2],
  [32.9, 24.09],
  [32.8, 24.9],
  [32.64, 25.69],
  [32.72, 26.16],
  [32.2, 26.1],
  [31.7, 26.56],
  [31.18, 27.18],
  [30.75, 28.1],
  [31.1, 29.07],
  [31.24, 30.04],
  [31.1, 30.4],
];
export const ROSETTA: LonLat[] = [
  [31.1, 30.4],
  [30.8, 30.8],
  [30.42, 31.42],
];
export const DAMIETTA: LonLat[] = [
  [31.1, 30.4],
  [31.3, 30.9],
  [31.8, 31.45],
];
// Lake Nasser, drawn as a thick stroke over the southern Nile.
export const LAKE: LonLat[] = [
  [31.3, 22.0],
  [32.1, 22.6],
  [32.6, 23.2],
  [32.88, 23.95],
];

// Places named in the reel.
export const P = {
  rafah: [34.24, 31.28],
  arish: [33.8, 31.1],
  fustat: [31.23, 30.0],
  bilbeis: [31.56, 30.42],
  sharqia: [31.65, 30.6],
  upperEgypt: [32.2, 26.4],
  juhayna: [31.46, 26.67],
  aswan: [32.9, 24.09],
  allaqi: [33.4, 22.7],
  farshut: [32.16, 26.05],
  qena: [32.72, 26.16],
  luxor: [32.64, 25.69],
  easternDesert: [34.0, 24.6],
  sawarka: [33.55, 30.95],
  tarabin: [34.35, 30.45],
  tiyaha: [33.7, 29.75],
  muzeina: [34.3, 28.25],
  jebeliya: [33.95, 28.56],
  matruh: [27.24, 31.35],
  cyrenaica: [22.0, 31.2],
  sudan: [31.3, 20.8],
  maghreb: [21.0, 30.0],
} satisfies Record<string, LonLat>;

export const CANAL: LonLat[] = [
  [32.3, 31.26],
  [32.31, 30.9],
  [32.27, 30.6],
  [32.35, 30.35],
  [32.55, 29.97],
];

// Reference cities, drawn faintly under the story's pins.
export const CITIES: { at: LonLat; name: string }[] = [
  { at: [31.24, 30.04], name: "القاهرة" },
  { at: [29.92, 31.2], name: "الإسكندرية" },
  { at: [32.9, 24.09], name: "أسوان" },
  { at: [32.64, 25.69], name: "الأقصر" },
  { at: [31.18, 27.18], name: "أسيوط" },
  { at: [32.55, 29.97], name: "السويس" },
  { at: [32.3, 31.26], name: "بورسعيد" },
  { at: [33.8, 31.13], name: "العريش" },
  { at: [27.24, 31.35], name: "مطروح" },
  { at: [33.81, 27.26], name: "الغردقة" },
  { at: [25.15, 31.55], name: "السلوم" },
  { at: [25.54, 29.2], name: "سيوة" },
];
