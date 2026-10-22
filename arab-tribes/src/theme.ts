import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Fonts are bundled in public/fonts (SIL OFL) so rendering needs no network.
export const headingFont = "Alexandria";
export const bodyFont = "IBM Plex Sans Arabic";

loadFont({
  family: headingFont,
  url: staticFile("fonts/Alexandria-Variable.ttf"),
  weight: "100 900",
});
loadFont({
  family: bodyFont,
  url: staticFile("fonts/IBMPlexSansArabic-Regular.ttf"),
  weight: "400",
});
loadFont({
  family: bodyFont,
  url: staticFile("fonts/IBMPlexSansArabic-SemiBold.ttf"),
  weight: "600",
});

// Night desert: ink background, sand, saffron gold and Bedouin-textile red.
export const C = {
  bg: "#0f0b09",
  bgGlow: "#2b1a12",
  land: "#36271b",
  landEdge: "#a8865d",
  sea: "#0d1a22",
  nile: "#3fb4c9",
  text: "#f7ecd9",
  muted: "#b9a58c",
  dim: "#6b5848",
  gold: "#f2b33d",
  red: "#d0412f",
  sand: "#e8c48a",
};

export const W = 1080;
export const H = 1920;

// Eastern Arabic digits, as Egyptian viewers read them.
export const ar = (n: number) =>
  Math.round(n).toLocaleString("ar-EG", { useGrouping: false });
