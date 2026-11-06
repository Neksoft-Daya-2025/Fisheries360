import React, { useId, useMemo, useState } from "react";
const views = [
  "Monitoring",
  "Farm Operations",
  "Business Overview",
  "Production",
  "Feed & Inventory",
  "Fish Health",
  "Harvest Planning",
];
function WorkspaceIcon({ index }: { index: number }) {
  const paths = [
    "M3 12h4l3-7 4 14 3-7h4",
    "M4 7h16M4 12h16M4 17h10",
    "M4 19V5m0 14h16M8 14l4-4 4 2 4-7",
    "M4 8l8-4 8 4v9l-8 4-8-4V8zm0 0l8 4 8-4m-8 4v9",
    "M4 5h16v15H4V5zm4-3v6m8-6v6M4 10h16m-12 4h8",
    "M12 21S3 16 3 9a5 5 0 019-3 5 5 0 019 3c0 7-9 12-9 12zm0-13v8m-4-4h8",
    "M5 4v3m14-3v3M3 10h18M5 6h14a2 2 0 012 2v11H3V8a2 2 0 012-2zm4 9l2 2 4-4",
  ];
  return (
    <svg
      className="workspace-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index % paths.length]} />
    </svg>
  );
}
const pondData = [
  {
    id: "Pond 01",
    species: "Rohu",
    stock: 3200,
    feed: 48,
    oxygen: 6.2,
    temp: 27.4,
    ph: 7.6,
    sales: 190000,
    cost: 120000,
    due: 25000,
  },
  {
    id: "Pond 02",
    species: "Catla",
    stock: 2800,
    feed: 42,
    oxygen: 5.8,
    temp: 28.1,
    ph: 7.4,
    sales: 160000,
    cost: 110000,
    due: 22000,
  },
  {
    id: "Pond 03",
    species: "Tilapia",
    stock: 2400,
    feed: 30,
    oxygen: 6.5,
    temp: 27,
    ph: 7.7,
    sales: 130000,
    cost: 80000,
    due: 18000,
  },
];
const money = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const num = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(n);
const activity = [
  ["Pond 01", "Morning feed", "Feeding", "Recorded"],
  ["Pond 02", "Health observation", "Inspection", "To review"],
  ["Pond 03", "Harvest preparation", "Harvest", "Scheduled"],
  ["Pond 01", "Water sample review", "Monitoring", "Recorded"],
  ["Pond 02", "Feed stock check", "Inventory", "Scheduled"],
];
export function Dashboard() {
  const uid = useId().replace(/:/g, "");
  const [view, setView] = useState(0),
    [pond, setPond] = useState("All ponds"),
    [period, setPeriod] = useState("24 hours"),
    [point, setPoint] = useState(7),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All statuses"),
    [selected, setSelected] = useState<string | null>(null),
    [notice, setNotice] = useState("");
  const rows = pondData.filter((p) => pond === "All ponds" || p.id === pond);
  const sum = (key: "stock" | "feed" | "sales" | "cost" | "due") =>
    rows.reduce((a, p) => a + p[key], 0);
  const avg = (key: "oxygen" | "temp" | "ph") =>
    rows.reduce((a, p) => a + p[key], 0) / rows.length;
  const series = useMemo(() => {
    const base =
      view === 0
        ? avg("oxygen")
        : view === 2
          ? sum("sales") / 100000
          : view === 4
            ? sum("feed")
            : view === 5
              ? 3
              : sum("stock") / 1000;
    return Array.from({ length: 12 }, (_, i) =>
      Math.max(
        0.1,
        base *
          (0.72 +
            i * 0.026 +
            Math.sin(
              i * 1.7 +
                (period === "7 days" ? 2 : period === "30 days" ? 4 : 0),
            ) *
              0.07),
      ),
    );
  }, [view, pond, period]);
  const labels = Array.from({ length: 12 }, (_, i) =>
    period === "24 hours"
      ? String(i * 2).padStart(2, "0") + ":00"
      : period === "7 days"
        ? "Day " + (1 + i / 2).toFixed(1)
        : "Day " + Math.round(1 + (i * 29) / 11),
  );
  const max = Math.max(...series) * 1.2;
  const points = series.map(
    (n, i) => `${42 + i * 46},${172 - (n / max) * 140}`,
  );
  const line = "M" + points.join("L");
  const metrics =
    view === 0
      ? [
          [
            "Dissolved oxygen",
            num(avg("oxygen")),
            "mg/L",
            "Selected pond average",
          ],
          ["Temperature", num(avg("temp")), "°C", "Selected pond average"],
          [
            "pH · optional sensor",
            num(avg("ph")),
            "pH",
            "Configuration-dependent",
          ],
          [
            "Locations in view",
            String(rows.length),
            "ponds",
            "Illustrative locations",
          ],
        ]
      : view === 2
        ? [
            ["Sales", money(sum("sales")), "", "Sample production cycle"],
            [
              "Operating costs",
              money(sum("cost")),
              "",
              "Feed, labour & other costs",
            ],
            [
              "Cycle difference",
              money(sum("sales") - sum("cost")),
              "",
              "Sales less recorded costs",
            ],
            ["Outstanding", money(sum("due")), "", "Sample buyer balances"],
          ]
        : view === 4
          ? [
              [
                "Feed used",
                num(sum("feed")),
                "kg/day",
                "Illustrative daily record",
              ],
              [
                "Available inventory",
                num(sum("feed") * 12),
                "kg",
                "Sample stock balance",
              ],
              ["Stock coverage", "12", "days", "At sample usage rate"],
              ["Reorder items", "02", "items", "Example planning queue"],
            ]
          : view === 5
            ? [
                [
                  "Observation records",
                  String(rows.length * 3),
                  "entries",
                  "Sample health register",
                ],
                [
                  "Awaiting review",
                  String(rows.length),
                  "entries",
                  "Illustrative review queue",
                ],
                [
                  "Recorded mortalities",
                  String(rows.length * 2),
                  "fish",
                  "Sample records only",
                ],
                [
                  "Locations in view",
                  String(rows.length),
                  "ponds",
                  "No diagnosis or advice",
                ],
              ]
            : view === 6
              ? [
                  [
                    "Planned harvest",
                    num(sum("stock") * 0.65),
                    "kg",
                    "Illustrative estimate",
                  ],
                  [
                    "Harvest batches",
                    String(rows.length),
                    "batches",
                    "Sample planning records",
                  ],
                  [
                    "Preparation tasks",
                    String(rows.length * 3),
                    "tasks",
                    "Example activity queue",
                  ],
                  [
                    "Sales planning",
                    money(sum("sales")),
                    "",
                    "Illustrative cycle context",
                  ],
                ]
              : [
                  [
                    "Recorded biomass",
                    num(sum("stock")),
                    "kg",
                    "Illustrative stock estimate",
                  ],
                  [
                    "Feed recorded",
                    num(sum("feed")),
                    "kg/day",
                    "Selected pond records",
                  ],
                  [
                    "Production cycles",
                    String(rows.length),
                    "cycles",
                    "Sample active records",
                  ],
                  [
                    "Activities",
                    String(rows.length * 3),
                    "entries",
                    "Illustrative daily records",
                  ],
                ];
  const headers =
    view === 0
      ? ["Pond", "Oxygen", "Temperature", "pH", "Context"]
      : view === 2
        ? ["Pond", "Sales", "Costs", "Difference", "Outstanding"]
        : view === 4
          ? ["Pond", "Feed / day", "Inventory", "Coverage", "Context"]
          : view === 5
            ? ["Pond", "Observation", "Recorded mortality", "Review", "Context"]
            : view === 6
              ? [
                  "Pond",
                  "Species",
                  "Planned quantity",
                  "Preparation",
                  "Context",
                ]
              : view === 1
                ? ["Pond", "Activity", "Category", "Status", "Context"]
                : ["Pond", "Species", "Biomass", "Daily feed", "Context"];
  let tableRows: string[][] =
    view === 1
      ? activity
          .filter((r) => pond === "All ponds" || r[0] === pond)
          .map((r) => [...r, "Illustrative record"])
      : rows.map((p) =>
          view === 0
            ? [
                p.id,
                p.oxygen + " mg/L",
                p.temp + " °C",
                String(p.ph),
                p.id === "Pond 02" ? "Review example" : "Sample only",
              ]
            : view === 2
              ? [
                  p.id,
                  money(p.sales),
                  money(p.cost),
                  money(p.sales - p.cost),
                  money(p.due),
                ]
              : view === 4
                ? [
                    p.id,
                    p.feed + " kg",
                    p.feed * 12 + " kg",
                    "12 days",
                    "Sample stock",
                  ]
                : view === 5
                  ? [
                      p.id,
                      "Routine observation",
                      "2 fish",
                      "To review",
                      "Illustrative record",
                    ]
                  : view === 6
                    ? [
                        p.id,
                        p.species,
                        num(p.stock * 0.65) + " kg",
                        "Scheduled",
                        "Sample plan",
                      ]
                    : [
                        p.id,
                        p.species,
                        num(p.stock) + " kg",
                        p.feed + " kg",
                        "Sample cycle",
                      ],
        );
  tableRows = tableRows.filter(
    (r) =>
      r.join(" ").toLowerCase().includes(search.toLowerCase()) &&
      (status === "All statuses" || r.includes(status)),
  );
  const switchView = (i: number) => {
    setView(i);
    setPoint(7);
    setSearch("");
    setStatus("All statuses");
    setSelected(null);
    setNotice("");
  };
  const exportCsv = () => {
    const escape = (s: string) => '"' + s.replace(/"/g, '""') + '"';
    const csv = [
      ["Fisheries360 — ILLUSTRATIVE DATA — no live connection"],
      ["View", views[view], "Pond", pond, "Period", period],
      headers,
      ...tableRows,
    ]
      .map((r) => r.map(escape).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "fisheries360-illustrative-" +
      views[view].toLowerCase().replaceAll(" ", "-") +
      ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Illustrative CSV exported with the current filters.");
  };
  return (
    <div className="advanced-demo">
      <div
        className="advanced-mode-strip"
        role="tablist"
        aria-label="Dashboard views"
      >
        {views.map((v, i) => (
          <button
            key={v}
            id={uid + "tab" + i}
            role="tab"
            aria-selected={view === i}
            aria-controls={uid + "panel"}
            tabIndex={view === i ? 0 : -1}
            onClick={() => switchView(i)}
            onKeyDown={(e) => {
              let next = i;
              if (e.key === "ArrowRight") next = (i + 1) % views.length;
              else if (e.key === "ArrowLeft")
                next = (i + views.length - 1) % views.length;
              else if (e.key === "Home") next = 0;
              else if (e.key === "End") next = views.length - 1;
              else return;
              e.preventDefault();
              switchView(next);
              document.getElementById(uid + "tab" + next)?.focus();
            }}
          >
            <WorkspaceIcon index={i} />
            {v}
          </button>
        ))}
      </div>
      <div className="command-dashboard">
        <aside className="command-sidebar">
          <div className="command-brand">
            <span className="workspace-monogram">F</span>
            <span className="workspace-brand-name">
              Fisheries<b>360</b>
            </span>
            <small>CONNECTED WORKSPACE</small>
          </div>
          <span className="command-nav-label">EXPLORE DEMO</span>
          {views.map((v, i) => (
            <button
              key={v}
              aria-pressed={view === i}
              onClick={() => switchView(i)}
            >
              <WorkspaceIcon index={i} />
              {v}
            </button>
          ))}
          <div className="command-sidebar-note">
            <span className="demo-indicator" />
            Illustrative environment
            <p>
              No live sensor connection.
              <br />
              Explore sample workflows.
            </p>
            <a href="/contact">Discuss your operation ↗</a>
          </div>
        </aside>
        <div
          className="command-content"
          id={uid + "panel"}
          role="tabpanel"
          aria-labelledby={uid + "tab" + view}
          tabIndex={0}
        >
          <div className="command-breadcrumb">
            <span>
              WORKSPACE <b>/</b> {views[view].toUpperCase()}
            </span>
            <span>ILLUSTRATIVE DATA</span>
          </div>
          <header className="command-heading">
            <div>
              <p>YOUR CONNECTED WORKSPACE</p>
              <h3>{views[view]}</h3>
              <span>
                Explore your water, work and business. Illustrative data only;
                no live connection.
              </span>
            </div>
            <button className="command-export" onClick={exportCsv}>
              ↓ Export CSV
            </button>
          </header>
          <div className="command-filters">
            <label>
              Location
              <select
                aria-label="Dashboard location"
                value={pond}
                onChange={(e) => {
                  setPond(e.target.value);
                  setSelected(null);
                }}
              >
                <option>All ponds</option>
                {pondData.map((p) => (
                  <option key={p.id}>{p.id}</option>
                ))}
              </select>
            </label>
            <label>
              Chart period
              <select
                aria-label="Dashboard chart period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option>24 hours</option>
                <option>7 days</option>
                <option>30 days</option>
              </select>
            </label>
            <div className="filter-context">
              <span className="demo-indicator" />
              {rows.length} sample {rows.length === 1 ? "pond" : "ponds"}
              <small>
                Period affects the trend illustration; records show a sample
                cycle.
              </small>
            </div>
          </div>
          <div className="command-metrics" key={view}>
            {metrics.map(([title, value, unit, detail], i) => (
              <article key={title} style={{ animationDelay: i * 65 + "ms" }}>
                <div>
                  <span>{title}</span>
                  <span className="metric-symbol">
                    <WorkspaceIcon index={[0, 3, 4, 6][i]} />
                  </span>
                </div>
                <strong>
                  {value}
                  <small>{unit}</small>
                </strong>
                <p>{detail}</p>
                <svg viewBox="0 0 110 25" aria-hidden="true">
                  <path
                    d={`M0 ${20 - i * 2}L10 16L20 19L30 9L40 14L50 7L60 12L70 8L80 10L95 3L110 6`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </article>
            ))}
          </div>
          <div className="command-analysis">
            <article className="command-chart">
              <div className="command-card-heading">
                <div>
                  <h4>
                    {view === 0
                      ? "Water quality trend"
                      : view === 2
                        ? "Sales trend"
                        : view === 4
                          ? "Feed usage trend"
                          : view === 5
                            ? "Observation trend"
                            : "Production trend"}
                  </h4>
                  <p>
                    Illustrative data · {period} · {pond}
                  </p>
                </div>
                <span className="chart-legend">● Sample series</span>
              </div>
              <div className="chart-value" aria-live="polite">
                <strong>{num(series[point])}</strong>
                <span>
                  {view === 0
                    ? "mg/L"
                    : view === 2
                      ? "₹ lakh"
                      : view === 4
                        ? "kg"
                        : view === 5
                          ? "entries"
                          : "tonnes"}
                  <small>{labels[point]} · Illustrative reading</small>
                </span>
              </div>
              <svg
                className="inspect-chart"
                viewBox="0 0 600 210"
                role="img"
                aria-label="Illustrative trend chart. Use the reading selector below to inspect values."
              >
                <defs>
                  <linearGradient id={uid + "area"} x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#55cafa" stopOpacity=".28" />
                    <stop offset="1" stopColor="#55cafa" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[32, 78, 124, 172].map((y, i) => (
                  <g key={y}>
                    <path
                      d={"M42 " + y + "H562"}
                      stroke="#24364d"
                      strokeDasharray="3 5"
                    />
                    <text x="2" y={y + 4} fill="#8196b1" fontSize="9">
                      {num(max * (1 - i / 3))}
                    </text>
                  </g>
                ))}
                <path d={line + "V172H42Z"} fill={"url(#" + uid + "area)"} />
                <path d={line} fill="none" stroke="#65d6ff" strokeWidth="2.8" />
                <path
                  d={"M" + (42 + point * 46) + " 20V172"}
                  stroke="#83dfff"
                  strokeDasharray="3 4"
                  opacity=".6"
                />
                <circle
                  cx={42 + point * 46}
                  cy={172 - (series[point] / max) * 140}
                  r="5"
                  fill="#09192a"
                  stroke="#a5e9ff"
                  strokeWidth="2"
                />
                {series.map((_, i) => (
                  <rect
                    key={i}
                    x={22 + i * 46}
                    y="10"
                    width="45"
                    height="165"
                    fill="transparent"
                    onPointerEnter={() => setPoint(i)}
                  />
                ))}
                <text x="42" y="199" fill="#8196b1" fontSize="9">
                  {labels[0]}
                </text>
                <text x="280" y="199" fill="#8196b1" fontSize="9">
                  {labels[5]}
                </text>
                <text x="520" y="199" fill="#8196b1" fontSize="9">
                  {labels[11]}
                </text>
              </svg>
              <label className="reading-slider">
                Inspect sample reading{" "}
                <input
                  type="range"
                  min="0"
                  max="11"
                  value={point}
                  onChange={(e) => setPoint(Number(e.target.value))}
                />
              </label>
            </article>
            <article className="command-insights">
              <div className="command-card-heading">
                <div>
                  <h4>
                    {view === 2 ? "Cost distribution" : "Operations snapshot"}
                  </h4>
                  <p>Illustrative data · selected ponds</p>
                </div>
              </div>
              <div
                className="insight-ring"
                style={
                  view === 2
                    ? undefined
                    : {
                        background: `conic-gradient(#268fa9 0 ${(rows.length / 3) * 100}%, #e1edf2 ${(rows.length / 3) * 100}% 100%)`,
                      }
                }
              >
                <div>
                  <strong>{view === 2 ? "62%" : rows.length + "/3"}</strong>
                  <small>
                    {view === 2 ? "Sample feed share" : "PONDS IN VIEW"}
                  </small>
                </div>
              </div>
              <div className="insight-key">
                <span>● {view === 2 ? "Feed" : "Selected ponds"}</span>
                <b>{view === 2 ? "62%" : rows.length}</b>
                <span>● {view === 2 ? "Labour" : "Illustrative records"}</span>
                <b>{view === 2 ? "24%" : rows.length * 3}</b>
                <span>● {view === 2 ? "Other" : "Example follow-ups"}</span>
                <b>{view === 2 ? "14%" : rows.length}</b>
              </div>
              <p className="insight-footnote">
                {view === 0
                  ? "Sensor selection and alert thresholds are agreed per site. These are sample readings."
                  : view === 5
                    ? "Records demonstrate workflow only. No health diagnosis or treatment advice."
                    : "Use sample records to explore the workflow; figures are not actual farm results."}
              </p>
            </article>
          </div>
          <div className="command-lower">
            <article className="command-records">
              <div className="command-card-heading">
                <div>
                  <h4>{views[view]} records</h4>
                  <p>Illustrative data · click a row to inspect</p>
                </div>
                <span>{tableRows.length} records</span>
              </div>
              <div className="records-filters">
                <label>
                  Search records
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pond, species or record…"
                  />
                </label>
                {view === 1 && (
                  <label>
                    Status
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {[
                        "All statuses",
                        "Recorded",
                        "To review",
                        "Scheduled",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="command-table-scroll">
                <table>
                  <caption>Illustrative data · Sample cycle records</caption>
                  <thead>
                    <tr>
                      {headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((r, i) => (
                      <tr
                        key={r.join("|")}
                        className={
                          selected === r.join("|") ? "row-selected" : ""
                        }
                      >
                        {r.map((c, j) => (
                          <td key={j}>
                            {j === 0 ? (
                              <button
                                aria-label={"Inspect " + r.join(", ")}
                                onClick={() => setSelected(r.join("|"))}
                              >
                                {c} <span>↗</span>
                              </button>
                            ) : (
                              c
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tableRows.length === 0 && (
                  <p className="records-empty">
                    No sample records match these filters.
                  </p>
                )}
              </div>
              {selected && (
                <div
                  className="record-detail"
                  role="region"
                  aria-label="Selected sample record"
                >
                  <button
                    className="detail-close"
                    onClick={() => setSelected(null)}
                    aria-label="Close sample record"
                  >
                    ✕
                  </button>
                  <span>SELECTED SAMPLE RECORD</span>
                  <h4>{selected.split("|")[0]}</h4>
                  <dl>
                    {headers.map((h, i) => (
                      <React.Fragment key={h}>
                        <dt>{h}</dt>
                        <dd>{selected.split("|")[i]}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                  <p>
                    Illustrative data. This view does not save changes or
                    represent a live farm.
                  </p>
                </div>
              )}
            </article>
            <aside className="command-queue">
              <div className="command-card-heading">
                <div>
                  <h4>Review queue</h4>
                  <p>Example follow-up workflow</p>
                </div>
                <span>03</span>
              </div>
              {[
                [
                  "Water observation",
                  "Review a configured threshold example.",
                  "Monitoring",
                ],
                [
                  "Feed inventory",
                  "Check an illustrative reorder entry.",
                  "Feed & Inventory",
                ],
                [
                  "Harvest preparation",
                  "Review a sample harvest planning record.",
                  "Harvest Planning",
                ],
              ].map(([title, body, target], i) => (
                <button
                  key={title}
                  onClick={() => switchView(views.indexOf(target))}
                >
                  <span className={"queue-mark q" + i}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <strong>{title}</strong>
                    <small>{body}</small>
                  </span>
                  <b>↗</b>
                </button>
              ))}
              <div className="queue-note">
                DEMONSTRATION ONLY
                <p>
                  Notifications are examples. No live alert delivery or
                  automated farm action is connected.
                </p>
              </div>
            </aside>
          </div>
          <p className="command-notice" role="status">
            {notice ||
              "Illustrative data throughout. Filters and exported records operate only on this demonstration."}
          </p>
        </div>
      </div>
    </div>
  );
}
