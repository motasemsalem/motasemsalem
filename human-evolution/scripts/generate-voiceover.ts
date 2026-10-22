// Generates public/voiceover/<scene>.mp3 with ElevenLabs.
// Usage: ELEVENLABS_API_KEY=sk_... node --experimental-strip-types scripts/generate-voiceover.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { NARRATION } from "../src/narration.ts";

const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "JBFqnCBsd6RMkjVDRZzb";
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("Set ELEVENLABS_API_KEY");

mkdirSync("public/voiceover", { recursive: true });
const force = process.argv.includes("--force");

for (const [i, scene] of NARRATION.entries()) {
  const out = `public/voiceover/${scene.id}.mp3`;
  if (existsSync(out) && !force) continue;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: scene.text,
        model_id: "eleven_multilingual_v2",
        language_code: "ar",
        previous_text: NARRATION[i - 1]?.text,
        next_text: NARRATION[i + 1]?.text,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.25,
          speed: 0.95,
        },
      }),
    },
  );
  if (!res.ok)
    throw new Error(`${scene.id}: ${res.status} ${await res.text()}`);
  writeFileSync(out, Buffer.from(await res.arrayBuffer()));
  console.log("wrote", out);
}
