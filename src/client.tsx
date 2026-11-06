import React, { lazy, Suspense } from "react";
import { hydrateRoot, createRoot } from "react-dom/client";
import { App, AppProps } from "./App";
import "./style.css";
import "./redesign.css";
import "./dashboard.css";
import "./connected.css";
import "./workspace.css";
import "./luxury.css";
document.documentElement.classList.remove("no-js");
const root = document.getElementById("root")!;
if (location.pathname.startsWith("/admin")) {
  const Admin = lazy(() =>
    import("./admin").then((m) => ({ default: m.Admin })),
  );
  createRoot(root).render(
    <Suspense
      fallback={<p className="admin-loading">Loading team workspace…</p>}
    >
      <Admin />
    </Suspense>,
  );
} else {
  const data = JSON.parse(
    document.getElementById("page-data")!.textContent!,
  ) as AppProps;
  hydrateRoot(root, <App {...data} />);
}
