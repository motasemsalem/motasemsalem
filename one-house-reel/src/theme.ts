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

// Brand colours, taken from the One House logo.
export const BRAND = {
  navy: "#062448",
  deep: "#020d1c",
  ink: "#04162d",
  red: "#e0071a",
  redGlow: "#ff2a3d",
  white: "#ffffff",
  paper: "#f3f5f8",
  steel: "#8ea3bf",
  dim: "#4c6283",
  line: "rgba(140, 180, 240, 0.16)",
  blueprint: "#5fa8ff",
  concrete: "#b9b3a7",
  wood: "#d8a35a",
};

// Soft shadow that keeps white type readable on any footage.
export const SHADOW = "0 4px 24px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.55)";
