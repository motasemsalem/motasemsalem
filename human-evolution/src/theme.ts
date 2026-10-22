import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Fonts are bundled in public/fonts (SIL OFL) so rendering needs no network.
export const headingFont = 'Alexandria';
export const bodyFont = 'IBM Plex Sans Arabic';

loadFont({family: headingFont, url: staticFile('fonts/Alexandria-Variable.ttf'), weight: '100 900'});
loadFont({family: bodyFont, url: staticFile('fonts/IBMPlexSansArabic-Regular.ttf'), weight: '400'});
loadFont({family: bodyFont, url: staticFile('fonts/IBMPlexSansArabic-SemiBold.ttf'), weight: '600'});

export const C = {
  bg: '#15110e',
  bgGlow: '#2a1f17',
  text: '#f4ead8',
  muted: '#a8998a',
  dim: '#5d5148',
  line: '#3a3029',
  accent: '#e9a23b',
  accent2: '#d9694a',
  pale: '#fff1cf',
};
