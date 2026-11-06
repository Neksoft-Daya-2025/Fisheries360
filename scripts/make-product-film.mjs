import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const work = path.resolve(root, "../work/product-film");
const ffmpeg = path.resolve(
  root,
  "../work/media-tools/node_modules/ffmpeg-static/ffmpeg.exe",
);
await fs.mkdir(work, { recursive: true });
const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const text = (x, y, s, size = 22, color = "#d3dce3", extra = "") =>
  `<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" fill="${color}" ${extra}>${esc(s)}</text>`;
const rect = (x, y, w, h, fill, stroke = "none", r = 10) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
async function png(name, body) {
  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">${body}</svg>`,
    ),
  )
    .png()
    .toFile(path.join(work, name + ".png"));
}
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
    p.on("exit", (code) => (code ? reject(Error(err)) : resolve()));
  });
}
const brand =
  text(60, 65, "FISHERIES360", 23, "#f5ebda", 'letter-spacing="3"') +
  text(
    1220,
    64,
    "PRODUCT WALKTHROUGH",
    11,
    "#d8c3a0",
    'text-anchor="end" letter-spacing="2"',
  );
const shotTitles = [
  [
    "01 / CONNECTED AQUACULTURE",
    "Your water. Your work.",
    "One connected view.",
    "Bring monitoring and farm business management together.",
  ],
  [
    "02 / CAGENODE CONCEPT",
    "Closer to the water.",
    "Connected to your decisions.",
    "Proposed hardware. Configuration and integration agreed per site.",
  ],
  [
    "03 / CONFIGURED SENSING",
    "Give each reading",
    "the context it needs.",
    "Sensor selection and alert thresholds depend on the agreed configuration.",
  ],
];
for (let i = 0; i < 3; i++) {
  const t = shotTitles[i];
  await png(
    "title-" + i,
    `<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".3" stop-color="#06121c" stop-opacity="0"/><stop offset="1" stop-color="#06121c" stop-opacity=".93"/></linearGradient></defs>${rect(0, 0, 1280, 720, "url(#shade)", "none", 0)}${brand}${text(60, 420, t[0], 13, "#dfbe88", 'letter-spacing="2"')}${text(60, 488, t[1], 49, "#fff")}${text(60, 546, t[2], 49, "#fff")}${text(60, 598, t[3], 20, "#e0e6eb")}${rect(60, 633, 80, 2, "#c59b5f")}${text(1220, 671, "Conceptual imagery · Not an actual installation", 13, "#d1dbe1", 'text-anchor="end"')}`,
  );
}
const navy = "#0b1b29",
  ink = "#24485c",
  muted = "#688698",
  gold = "#c59b5f";
const board = (index, title, subtitle, metrics, lower) => {
  let s = rect(0, 0, 1280, 720, navy, "none", 0) + brand;
  s += text(
    60,
    122,
    ["04 / MONITORING", "05 / FARM OPERATIONS", "06 / BUSINESS OVERVIEW"][
      index
    ],
    13,
    "#dfbe88",
    'letter-spacing="2"',
  );
  s +=
    text(60, 170, title, 37, "#fff") + text(60, 203, subtitle, 18, "#b4c6d2");
  s += rect(60, 236, 1160, 415, "#eef4f7", "#425769", 12);
  s +=
    rect(60, 236, 154, 415, "#132d40", "none", 12) +
    text(82, 272, "F360", 24, "#dfbe88") +
    text(82, 298, "WORKSPACE", 9, "#9eb8ca", 'letter-spacing="2"');
  ["Monitoring", "Farm operations", "Business overview"].forEach((n, i) => {
    s += rect(72, 326 + i * 50, 130, 36, index === i ? "#36586a" : "#132d40");
    s += text(83, 349 + i * 50, n, 12, index === i ? "#fff" : "#9fb7c9");
  });
  s +=
    text(
      238,
      270,
      [
        "Water quality overview",
        "Daily activity register",
        "Production cycle summary",
      ][index],
      17,
      ink,
      'font-weight="600"',
    ) +
    text(
      1194,
      270,
      "ILLUSTRATIVE DATA",
      10,
      "#527f94",
      'text-anchor="end" letter-spacing="1"',
    );
  metrics.forEach((m, i) => {
    let x = 238 + i * 238;
    s +=
      rect(x, 290, 218, 91, "#fff", "#d4e2ea", 7) +
      rect(
        x,
        290,
        218,
        3,
        [gold, "#63a3ac", "#929dc4", "#7eb09c"][i],
        "none",
        0,
      ) +
      text(x + 15, 316, m[0], 11, muted) +
      text(x + 15, 354, m[1], 28, ink, 'font-weight="600"');
  });
  s += lower;
  s += text(
    60,
    685,
    "Illustrative data · Interface demonstration · No live sensor connection",
    14,
    "#b2c8d7",
  );
  return s;
};
let chart =
  rect(238, 399, 610, 225, "#fff", "#d4e2ea", 7) +
  text(258, 427, "Dissolved oxygen trend · mg/L", 13, ink);
for (let y of [460, 500, 540, 580])
  chart += `<path d="M260 ${y}H825" stroke="#e1eaf0"/>`;
chart += `<path d="M260 568L310 555L360 563L410 530L460 540L510 517L560 528L610 488L660 500L710 475L760 485L825 469L825 590H260Z" fill="#dff1f6"/><path d="M260 568L310 555L360 563L410 530L460 540L510 517L560 528L610 488L660 500L710 475L760 485L825 469" fill="none" stroke="#25899e" stroke-width="3"/>`;
chart +=
  text(260, 610, "06:00", 10, muted) +
  text(800, 610, "18:00", 10, muted) +
  rect(866, 399, 328, 225, "#fff", "#d4e2ea", 7) +
  text(887, 428, "From observation to follow-up", 13, ink);
[
  "Review a configured threshold",
  "Check site context",
  "Record the team response",
].forEach(
  (s, i) =>
    (chart +=
      rect(886, 449 + i * 49, 286, 36, "#eef5f7") +
      text(899, 472 + i * 49, "0" + (i + 1) + "   " + s, 12, muted)),
);
await png(
  "board-0",
  board(
    0,
    "Understand the water.",
    "Review sample readings, explore trends and organise a response.",
    [
      ["Dissolved oxygen", "6.2 mg/L"],
      ["Temperature", "27.5 °C"],
      ["pH · optional input", "7.6"],
      ["Sample locations", "3 ponds"],
    ],
    chart,
  ),
);
function table(headers, rows) {
  let s =
    rect(238, 399, 956, 225, "#fff", "#d4e2ea", 7) +
    rect(250, 412, 932, 33, "#eaf1f5", "none", 3);
  headers.forEach((h, i) => (s += text(269 + i * 225, 433, h, 11, muted)));
  rows.forEach((row, r) => {
    s += `<path d="M251 ${493 + r * 52}H1180" stroke="#e5edf2"/>`;
    row.forEach(
      (cell, i) =>
        (s += text(
          269 + i * 225,
          479 + r * 52,
          cell,
          14,
          i === 0 ? ink : muted,
        )),
    );
  });
  return s;
}
await png(
  "board-1",
  board(
    1,
    "Keep the everyday work connected.",
    "Pond records, feed, farm activities and harvest planning in one workflow.",
    [
      ["Fish stock", "8,400 fish"],
      ["Feed record", "120 kg/day"],
      ["Sample ponds", "3 locations"],
      ["Workflow", "Stock → Harvest"],
    ],
    table(
      ["POND", "ACTIVITY", "WORKSTREAM", "SAMPLE STATUS"],
      [
        ["Pond 01", "Morning feed", "Feeding", "Recorded"],
        ["Pond 02", "Health observation", "Inspection", "To review"],
        ["Pond 03", "Harvest preparation", "Harvest", "Scheduled"],
      ],
    ),
  ),
);
await png(
  "board-2",
  board(
    2,
    "See the business behind each cycle.",
    "Connect harvest and sales with costs, collections and outstanding balances.",
    [
      ["Sample sales", "₹4,80,000"],
      ["Operating costs", "₹3,10,000"],
      ["Cycle difference", "₹1,70,000"],
      ["Outstanding", "₹65,000"],
    ],
    table(
      ["POND", "SALES", "COSTS", "OUTSTANDING"],
      [
        ["Pond 01", "₹1,90,000", "₹1,20,000", "₹25,000"],
        ["Pond 02", "₹1,60,000", "₹1,10,000", "₹22,000"],
        ["Pond 03", "₹1,30,000", "₹80,000", "₹18,000"],
      ],
    ),
  ),
);
await png(
  "outro",
  rect(0, 0, 1280, 720, "#07131e", "none", 0) +
    rect(588, 166, 104, 2, gold) +
    text(640, 272, "Fisheries360", 67, "#fff", 'text-anchor="middle"') +
    text(
      640,
      331,
      "Connecting Aquaculture to Intelligence",
      26,
      "#dfbe88",
      'text-anchor="middle"',
    ) +
    text(
      640,
      402,
      "A product of Neksoft Consultancy Services B.V.",
      22,
      "#b8cbd7",
      'text-anchor="middle"',
    ) +
    rect(474, 455, 332, 59, "#c59b5f", "none", 29) +
    text(640, 493, "Request a Demo", 21, "#1c211f", 'text-anchor="middle"') +
    text(640, 566, "fisheries360.com", 20, "#e0e7eb", 'text-anchor="middle"') +
    text(
      640,
      654,
      "Device availability and integration scope agreed per engagement.",
      14,
      "#92a9b9",
      'text-anchor="middle"',
    ),
);
const codec = [
  "-an",
  "-c:v",
  "libx264",
  "-preset",
  "fast",
  "-crf",
  "23",
  "-pix_fmt",
  "yuv420p",
  "-threads",
  "2",
  "-movflags",
  "+faststart",
];
for (let i = 0; i < 3; i++) {
  await run([
    "-ss",
    String([0, 6, 12][i]),
    "-i",
    path.join(root, "public/media/fisheries360-hero.mp4"),
    "-loop",
    "1",
    "-i",
    path.join(work, "title-" + i + ".png"),
    "-filter_complex",
    "[0:v]fps=24[base];[base][1:v]overlay=0:0,fade=t=in:st=0:d=0.3,fade=t=out:st=4.7:d=0.3[v]",
    "-map",
    "[v]",
    "-t",
    "5",
    ...codec,
    path.join(work, "scene-" + i + ".mp4"),
  ]);
}
for (let i = 0; i < 4; i++) {
  const duration = i === 3 ? 4 : 7;
  await run([
    "-loop",
    "1",
    "-framerate",
    "24",
    "-i",
    path.join(work, i === 3 ? "outro.png" : "board-" + i + ".png"),
    "-vf",
    `scale=1312:738,crop=1280:720:x='16+5*sin(t/3)':y=9,fade=t=in:st=0:d=0.3,fade=t=out:st=${duration - 0.3}:d=0.3`,
    "-t",
    String(duration),
    ...codec,
    path.join(work, "scene-" + (i + 3) + ".mp4"),
  ]);
}
await fs.writeFile(
  path.join(work, "sequence.txt"),
  Array.from({ length: 7 }, (_, i) => `file 'scene-${i}.mp4'`).join("\n"),
);
await run([
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  path.join(work, "sequence.txt"),
  "-c",
  "copy",
  path.join(work, "picture.mp4"),
]);
// Original synthesized ambient bed. No third-party recording or voice impersonation.
await run([
  "-i",
  path.join(work, "picture.mp4"),
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=130.8128:sample_rate=48000:duration=40",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=196:sample_rate=48000:duration=40",
  "-f",
  "lavfi",
  "-i",
  "sine=frequency=261.6256:sample_rate=48000:duration=40",
  "-filter_complex",
  "[1:a]volume=0.23,tremolo=f=0.13:d=0.45[a];[2:a]volume=0.12,tremolo=f=0.11:d=0.5[b];[3:a]volume=0.08,tremolo=f=0.18:d=0.5[c];[a][b][c]amix=inputs=3:normalize=0,volume=8,aecho=0.8:0.4:180|370:0.2|0.1,afade=t=in:d=2,afade=t=out:st=37:d=3,pan=stereo|c0=c0|c1=c0[audio]",
  "-map",
  "0:v",
  "-map",
  "[audio]",
  "-c:v",
  "copy",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-t",
  "40",
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
  "-preset",
  "fast",
  "-crf",
  "25",
  "-c:a",
  "aac",
  "-b:a",
  "96k",
  "-threads",
  "2",
  "-movflags",
  "+faststart",
  path.join(root, "public/media/fisheries360-product-demo-mobile.mp4"),
]);
await sharp(path.join(work, "board-0.png"))
  .webp({ quality: 88 })
  .toFile(path.join(root, "public/images/product-demo-poster.webp"));
await run([
  "-i",
  path.join(root, "public/media/fisheries360-product-demo.mp4"),
  "-vf",
  "fps=1/6,scale=480:270,tile=3x3",
  "-frames:v",
  "1",
  path.resolve(root, "../outputs/fisheries360-product-film-review.jpg"),
]);
console.log("40-second product film, mobile encode and poster ready.");

