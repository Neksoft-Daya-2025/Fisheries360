import fs from "node:fs/promises";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
const root = process.cwd(),
  work = path.resolve(root, "../work/product-film");
const ffmpeg = path.resolve(
  root,
  "../work/media-tools/node_modules/ffmpeg-static/ffmpeg.exe",
);
const scenes = JSON.parse(
  await fs.readFile(path.join(work, "narration-script.json"), "utf8"),
);
async function run(args) {
  await new Promise((resolve, reject) => {
    const p = spawn(
      ffmpeg,
      ["-hide_banner", "-loglevel", "error", "-y", ...args],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("error", reject);
    p.on("exit", (n) => (n ? reject(Error(err)) : resolve()));
  });
}
const timings = [];
for (let i = 0; i < scenes.length; i++) {
  const file = path.join(work, `narration-${i}.mp3`);
  const info = spawnSync(ffmpeg, ["-hide_banner", "-i", file], {
    encoding: "utf8",
  }).stderr;
  const d = info.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!d) throw Error("Missing duration " + i);
  const duration = Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]);
  const slot = scenes[i][1],
    tempo = Math.max(1, duration / (slot - 0.35));
  await run([
    "-i",
    file,
    "-af",
    `atempo=${tempo},adelay=100:all=1,apad,atrim=duration=${slot},afade=t=out:st=${slot - 0.1}:d=0.1`,
    "-ar",
    "48000",
    "-ac",
    "1",
    path.join(work, `voice-slot-${i}.wav`),
  ]);
  timings.push({
    scene: i + 1,
    start: scenes[i][0],
    slot,
    sourceDuration: duration,
    tempo: Number(tempo.toFixed(3)),
  });
}
await fs.writeFile(
  path.join(work, "voice-sequence.txt"),
  scenes.map((_, i) => `file 'voice-slot-${i}.wav'`).join("\n"),
);
await run([
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  path.join(work, "voice-sequence.txt"),
  "-af",
  "loudnorm=I=-16:TP=-1.5:LRA=9",
  "-ar",
  "48000",
  "-ac",
  "2",
  path.join(work, "narration-master.wav"),
]);
for (let i = 0; i < scenes.length; i++) {
  const oldDuration = i < 3 ? 5 : i === 6 ? 4 : 7,
    slot = scenes[i][1];
  await run([
    "-i",
    path.join(work, `scene-${i}.mp4`),
    "-vf",
    `trim=duration=${oldDuration - 0.35},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${slot - oldDuration + 0.35},fade=t=out:st=${slot - 0.3}:d=0.3`,
    "-t",
    String(slot),
    "-an",
    "-c:v",
    "libx264",
    "-crf",
    "23",
    "-preset",
    "fast",
    "-pix_fmt",
    "yuv420p",
    "-threads",
    "2",
    path.join(work, `extended-${i}.mp4`),
  ]);
}
await fs.writeFile(
  path.join(work, "extended-sequence.txt"),
  scenes.map((_, i) => `file 'extended-${i}.mp4'`).join("\n"),
);
await run([
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  path.join(work, "extended-sequence.txt"),
  "-c",
  "copy",
  path.join(work, "extended-picture.mp4"),
]);
await run([
  "-i",
  path.join(work, "extended-picture.mp4"),
  "-i",
  path.join(work, "narration-master.wav"),
  "-stream_loop",
  "-1",
  "-i",
  path.join(work, "audio-master.mp4"),
  "-filter_complex",
  "[2:a]volume=0.14,afade=t=out:st=57:d=3[bed];[1:a][bed]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[a]",
  "-map",
  "0:v",
  "-map",
  "[a]",
  "-c:v",
  "copy",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-t",
  "60",
  "-movflags",
  "+faststart",
  path.join(root, "public/media/fisheries360-product-demo.mp4"),
]);
await run([
  "-i",
  path.join(root, "public/media/fisheries360-product-demo.mp4"),
  "-vf",
  "scale=854:480:flags=lanczos",
  "-c:v",
  "libx264",
  "-crf",
  "25",
  "-preset",
  "fast",
  "-threads",
  "2",
  "-c:a",
  "aac",
  "-b:a",
  "96k",
  "-t",
  "60",
  "-movflags",
  "+faststart",
  path.join(root, "public/media/fisheries360-product-demo-mobile.mp4"),
]);
await fs.writeFile(
  path.join(work, "narration-timings.json"),
  JSON.stringify(timings, null, 2),
);
await fs.writeFile(
  path.join(root, "public/media/fisheries360-product-demo.vtt"),
  "WEBVTT\n\n" +
    scenes
      .map(([start, duration, text]) => {
        const stamp = (n) =>
          `00:${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}.000`;
        return `${stamp(start)} --> ${stamp(start + duration)}\n${text}\n`;
      })
      .join("\n"),
);
console.log(JSON.stringify(timings));
