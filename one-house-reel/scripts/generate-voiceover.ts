// Generates public/voiceover/<scene>.mp3 and <scene>.json (character timings for captions) with ElevenLabs.
// Usage: ELEVENLABS_API_KEY=sk_... NODE_USE_ENV_PROXY=1 node --experimental-strip-types scripts/generate-voiceover.ts [--force] [scene...]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { NARRATION } from "../src/narration.ts";

// "Brian" (premade), deep and warm; premade voices work on every ElevenLabs plan.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "nPczCjzI2devNBz1zQrb";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_v3";
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("Set ELEVENLABS_API_KEY");

mkdirSync("public/voiceover", { recursive: true });
const force = process.argv.includes("--force");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

for (const scene of NARRATION) {
  if (only.length && !only.includes(scene.id)) continue;
  const out = `public/voiceover/${scene.id}`;
  if (existsSync(`${out}.mp3`) && !force) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: scene.text,
        model_id: MODEL_ID,
        language_code: "ar",
        seed: "seed" in scene ? scene.seed : 7,
        voice_settings: { stability: 0.5, similarity_boost: 0.8 },
      }),
    },
  );
  if (!res.ok)
    throw new Error(`${scene.id}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as {
    audio_base64: string;
    alignment: {
      characters: string[];
      character_start_times_seconds: number[];
      character_end_times_seconds: number[];
    };
  };
  writeFileSync(`${out}.mp3`, Buffer.from(data.audio_base64, "base64"));
  writeFileSync(`${out}.json`, JSON.stringify(data.alignment));
  console.log("wrote", out);
}
