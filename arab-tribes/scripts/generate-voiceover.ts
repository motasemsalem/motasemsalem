// Generates public/voiceover/<scene>.mp3 plus <scene>.json (word timings for the captions) with ElevenLabs.
// Check each take with scripts/check-voiceover.py and regenerate the scenes it flags with a new seed:
//   ... generate-voiceover.ts --only=qays,south --seed=7
// Usage: ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 FFMPEG=/path/to/ffmpeg node --experimental-strip-types scripts/generate-voiceover.ts [--force] [--only=a,b] [--seed=n]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { NARRATION } from "../src/narration.ts";

// George, a premade voice (library voices need a paid plan).
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
// eleven_v3 is the most expressive model. It has no speed setting, so its takes are
// tightened with ffmpeg's pitch-preserving atempo and the word timings scaled to match.
const MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_v3";
const V3 = MODEL === "eleven_v3";
const TEMPO = V3 ? 1.1 : 1;
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
const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const only = arg("only")?.split(",");
const seed = Number(arg("seed") ?? 1);
const force = process.argv.includes("--force") || Boolean(only);

for (const [i, scene] of NARRATION.entries()) {
  const out = `public/voiceover/${scene.id}`;
  if (only && !only.includes(scene.id)) continue;
  if (existsSync(`${out}.mp3`) && !force) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: scene.text,
        model_id: MODEL,
        language_code: "ar",
        seed,
        ...(V3
          ? { voice_settings: { stability: 0.5, similarity_boost: 0.85 } }
          : {
              previous_text: NARRATION[i - 1]?.text,
              next_text: NARRATION[i + 1]?.text,
              voice_settings: {
                stability: 0.6,
                similarity_boost: 0.8,
                style: 0.3,
                speed: 1.1,
              },
            }),
      }),
    },
  );
  if (!res.ok)
    throw new Error(`${scene.id}: ${res.status} ${await res.text()}`);
  const body = (await res.json()) as {
    audio_base64: string;
    alignment: Alignment;
  };
  const audio = Buffer.from(body.audio_base64, "base64");
  if (TEMPO === 1) writeFileSync(`${out}.mp3`, audio);
  else
    execFileSync(
      process.env.FFMPEG ?? "ffmpeg",
      [
        "-v",
        "error",
        "-y",
        "-i",
        "pipe:0",
        "-af",
        `atempo=${TEMPO}`,
        "-b:a",
        "160k",
        `${out}.mp3`,
      ],
      { input: audio },
    );
  const words = toWords(body.alignment).map((w) => ({
    text: w.text,
    start: w.start / TEMPO,
    end: w.end / TEMPO,
  }));
  writeFileSync(`${out}.json`, JSON.stringify(words));
  console.log("wrote", out);
}
