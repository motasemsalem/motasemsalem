// Generates public/voiceover/<scene>.mp3 plus <scene>.json (word timings for the captions) with ElevenLabs.
// Usage: ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 node --experimental-strip-types scripts/generate-voiceover.ts [--force]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { NARRATION } from "../src/narration.ts";

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("Set ELEVENLABS_API_KEY");

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};
type Word = { text: string; start: number; end: number };

// Groups character timings into words split on whitespace.
const toWords = (a: Alignment) => {
  const words: Word[] = [];
  let current: Word | null = null;
  a.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      current = null;
      return;
    }
    if (!current) {
      current = { text: "", start: a.character_start_times_seconds[i], end: 0 };
      words.push(current);
    }
    current.text += ch;
    current.end = a.character_end_times_seconds[i];
  });
  return words;
};

mkdirSync("public/voiceover", { recursive: true });
const force = process.argv.includes("--force");

for (const [i, scene] of NARRATION.entries()) {
  const out = `public/voiceover/${scene.id}`;
  if (existsSync(`${out}.mp3`) && !force) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: scene.text,
        model_id: "eleven_multilingual_v2",
        language_code: "ar",
        previous_text: NARRATION[i - 1]?.text,
        next_text: NARRATION[i + 1]?.text,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.4,
          speed: 1.12,
        },
      }),
    },
  );
  if (!res.ok)
    throw new Error(`${scene.id}: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as {
    audio_base64: string;
    alignment: Alignment;
  };
  writeFileSync(`${out}.mp3`, Buffer.from(body.audio_base64, "base64"));
  writeFileSync(`${out}.json`, JSON.stringify(toWords(body.alignment)));
  console.log("wrote", out);
}
