import React, { useEffect, useRef, useState } from "react";
import { Device } from "./Hardware";

export const heroVideo = "/media/fisheries360-hero.mp4?v=reframed-2";
export const heroVideoMobile =
  "/media/fisheries360-hero-mobile.mp4?v=reframed-2";

export function ProductFilm() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = matchMedia("(max-width: 760px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return (
    <section
      id="product-film"
      className="product-film-section"
      aria-labelledby="product-film-title"
    >
      <div className="container">
        <div className="product-film-heading">
          <div>
            <p className="eyebrow">THE FISHERIES360 PRODUCT FILM</p>
            <h2 id="product-film-title">
              From the water.
              <br />
              <em>To the whole picture.</em>
            </h2>
          </div>
          <div>
            <p>
              A narrated 60-second look at connected monitoring, everyday farm
              work and business visibility.
            </p>
            <span>
              60 SEC <i> / </i> PRODUCT WALKTHROUGH <i> / </i> SOUND ON WHEN YOU
              PLAY
            </span>
          </div>
        </div>
        <video
          className="product-film-player"
          controls
          playsInline
          preload="none"
          poster="/images/product-demo-poster.webp"
          aria-label="Fisheries360 product walkthrough, 60 seconds"
          src={
            mobile
              ? "/media/fisheries360-product-demo-mobile.mp4?v=approved-3"
              : "/media/fisheries360-product-demo.mp4?v=approved-3"
          }
        >
          <track
            default
            kind="captions"
            src="/media/fisheries360-product-demo.vtt?v=approved-3"
            srcLang="en"
            label="English"
          />
          Your browser cannot play this video.{" "}
          <a href="/media/fisheries360-product-demo.mp4">
            Download the product film
          </a>
          .
        </video>
        <div className="product-film-foot">
          <p>
            Conceptual footage and illustrative interface data. No live sensor
            connection. Hardware configuration and integration scope are agreed
            per engagement.
          </p>
          <a className="text-link" href="/contact">
            Discuss your operation <span aria-hidden="true">↗</span>
          </a>
        </div>
        <details className="product-film-transcript">
          <summary>Read the film transcript</summary>
          <ol>
            <li>
              <b>00:00</b> Fisheries three sixty. Connect your water, farm
              operations, and business.
            </li>
            <li>
              <b>00:07</b> Cage Node is a proposed monitoring concept,
              configured for your site.
            </li>
            <li>
              <b>00:14</b> Sensor choices, alert thresholds, and integrations
              are agreed for each engagement.
            </li>
            <li>
              <b>00:22</b> Review water readings and trends, then organise a
              response. These sample readings are illustrative, with no live
              connection.
            </li>
            <li>
              <b>00:33</b> Keep pond leases, fish stock, feed, health
              observations, farm activities, and harvest planning connected
              throughout each production cycle.
            </li>
            <li>
              <b>00:44</b> Connect harvest and sales with expenses, buyer
              payments, and outstanding balances, so each cycle has clear
              business context.
            </li>
            <li>
              <b>00:54</b> Fisheries three sixty. Connecting Aquaculture to
              Intelligence Request a demo.
            </li>
          </ol>
          <p>
            Audio: synthetic Indian-English narration with an original ambient
            instrumental bed.
          </p>
        </details>
      </div>
    </section>
  );
}

export function FieldStory() {
  return (
    <section className="field-story" aria-labelledby="field-story-title">
      <div className="container field-story-grid">
        <figure className="field-story-image reveal">
          <FarmAtlas />
          <figcaption>
            AQUACULTURE / ILLUSTRATIVE WORKSPACE
            <small>
              Diagram and illustrative data · Not a product photograph
            </small>
          </figcaption>
        </figure>
        <div className="field-story-copy reveal">
          <p className="eyebrow">Connecting Aquaculture to Intelligence</p>
          <h2 id="field-story-title">
            A closer connection.
            <br />
            <em>A clearer perspective.</em>
          </h2>
          <p>
            The water tells one part of the story. Your people, production and
            business records tell the rest.
          </p>
          <p>
            Fisheries360 brings these perspectives together: proposed IoT
            monitoring alongside practical farm and business management. One
            connected view of the work that matters.
          </p>
          <div className="field-story-facts">
            <span>
              <b>In the water</b>Configured monitoring & alerts
            </span>
            <span>
              <b>Across the farm</b>Operations, sales & profitability
            </span>
          </div>
          <a href="/about" className="text-link">
            Discover Fisheries360 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function HeroFilm({ poster, alt }: { poster: string; alt: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [motion, setMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [paused, setPaused] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const size = matchMedia("(max-width: 760px)");
    const update = () => {
      setMotion(!media.matches);
      setMobile(size.matches);
    };
    update();
    media.addEventListener("change", update);
    size.addEventListener("change", update);
    return () => {
      media.removeEventListener("change", update);
      size.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    const element = video.current;
    if (!element || !motion || failed) return;
    let visible = true;
    setLoaded(false);
    const update = () => {
      if (document.hidden || !visible || userPaused.current) element.pause();
      else void element.play().catch(() => setPaused(true));
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [motion, mobile, failed]);
  return (
    <div className="hero-film">
      <img
        className="hero-photo"
        src={poster}
        alt={alt}
        width="1800"
        height="1013"
        fetchPriority="high"
        sizes="100vw"
      />
      {motion && !failed && (
        <>
          <video
            ref={video}
            key={mobile ? "mobile-film" : "desktop-film"}
            className={`hero-video ${loaded ? "is-ready" : ""}`}
            src={mobile ? heroVideoMobile : heroVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={poster}
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={() => {
              setLoaded(true);
              setPaused(false);
            }}
            onPause={() => setPaused(true)}
            onError={() => setFailed(true)}
          ></video>
          <button
            className="film-control"
            onClick={() => {
              if (!video.current) return;
              if (video.current.paused) {
                userPaused.current = false;
                void video.current.play().catch(() => setPaused(true));
              } else {
                userPaused.current = true;
                video.current.pause();
              }
            }}
            aria-label={
              paused ? "Play background video" : "Pause background video"
            }
          >
            {paused ? "Play film ▷" : "Pause film Ⅱ"}
          </button>
        </>
      )}
      <div className="film-vignette" />
    </div>
  );
}

export function HeroReadout() {
  return (
    <div className="hero-readout">
      <div>
        <span className="readout-symbol">≋</span>
        <span>
          Water to workspace
          <small>Illustrative data · No live connection</small>
        </span>
        <span className="readout-code">F360 / 01</span>
      </div>
      <div className="readout-values">
        <p>
          <span>Dissolved oxygen</span>
          <b>
            6.2 <small>mg/L</small>
          </b>
        </p>
        <p>
          <span>Temperature</span>
          <b>
            27.4 <small>°C</small>
          </b>
        </p>
        <svg
          viewBox="0 0 150 50"
          aria-label="Illustrative oxygen trend"
          role="img"
        >
          <path
            d="M0 39L12 34L24 38L36 27L48 30L60 18L72 23L84 14L96 19L108 10L120 14L136 5L150 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M0 49H150" stroke="currentColor" opacity=".2" />
        </svg>
      </div>
    </div>
  );
}

export function LayerOverview() {
  return (
    <section
      className="layer-overview"
      aria-label="Two connected product layers"
    >
      <div className="container layer-grid">
        <div className="layer-intro reveal">
          <span className="eyebrow">ONE PLATFORM. TWO CONNECTED LAYERS.</span>
          <h2>
            One operation.
            <br />
            <span>Connected at every level.</span>
          </h2>
          <p className="layer-summary">
            Understand the water. Organise the work. Keep the business in view.
            Two connected layers, built around your aquaculture operation.
          </p>
        </div>
        <a className="layer-link reveal" href="/cagenode">
          <div className="product-scene node-scene" aria-hidden="true">
            <span className="scene-caption">CAGENODE / CONCEPT EXPLORER</span>
            <Device id="overview-node" />
            <span className="scene-foot">PROPOSED CONFIGURATION</span>
          </div>
          <div className="product-card-copy">
            <span className="layer-number">01 / IN THE WATER</span>
            <div className="layer-heading">
              <h3>Monitoring, with context.</h3>
              <span aria-hidden="true">↗</span>
            </div>
            <p>
              CageNode, connected sensors and operational visibility. Configured
              around your site.
            </p>
            <span className="layer-bottom">
              EXPLORE MONITORING <span>→</span>
            </span>
          </div>
        </a>
        <a className="layer-link reveal" href="/platform">
          <div className="product-scene workspace-scene" aria-hidden="true">
            <div className="mini-workspace">
              <div className="mini-toolbar">
                <b>
                  F<span>360</span>
                </b>
                <span>Farm workspace</span>
                <small>ILLUSTRATIVE DATA</small>
              </div>
              <div className="mini-heading">
                <span>Business overview</span>
                <small>Sample cycle</small>
              </div>
              <div className="mini-metrics">
                <div>
                  <small>Sales</small>
                  <b>₹4.8L</b>
                </div>
                <div>
                  <small>Expenses</small>
                  <b>₹3.1L</b>
                </div>
                <div>
                  <small>Outstanding</small>
                  <b>₹65K</b>
                </div>
              </div>
              <div className="mini-chart">
                <span>
                  Cycle overview <small>Illustrative data</small>
                </span>
                <svg viewBox="0 0 420 110">
                  <path
                    d="M0 90H420M0 55H420M0 20H420"
                    stroke="#dce7ed"
                    fill="none"
                  />
                  <path
                    d="M0 88L35 77L70 82L105 54L140 64L175 48L210 58L245 32L280 37L315 20L350 29L385 10L420 17"
                    fill="none"
                    stroke="#147b9d"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="mini-rows">
                <span>
                  Pond 01 <b>Rohu</b>
                  <small>Cycle record ↗</small>
                </span>
                <span>
                  Pond 02 <b>Catla</b>
                  <small>Cycle record ↗</small>
                </span>
              </div>
            </div>
          </div>
          <div className="product-card-copy">
            <span className="layer-number">02 / ACROSS THE BUSINESS</span>
            <div className="layer-heading">
              <h3>Your farm. In focus.</h3>
              <span aria-hidden="true">↗</span>
            </div>
            <p>
              Ponds, production, costs and collections. A connected view from
              lease to profit.
            </p>
            <span className="layer-bottom">
              EXPLORE THE PLATFORM <span>→</span>
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}

export function FarmAtlas() {
  return (
    <div className="farm-atlas">
      <div className="atlas-toolbar">
        <span>FARM WORKSPACE</span>
        <span className="sample-badge">Illustrative view</span>
      </div>
      <svg
        viewBox="0 0 420 320"
        role="img"
        aria-label="Illustrative pond layout, showing three example pond records"
      >
        <defs>
          <pattern
            id="atlas-grid"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
          >
            <path d="M24 0H0V24" fill="none" stroke="#94b9ad" opacity=".15" />
          </pattern>
          <pattern
            id="water-lines"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path d="M0 5H10" stroke="#b4e0d2" opacity=".22" />
          </pattern>
        </defs>
        <rect width="420" height="320" fill="url(#atlas-grid)" />
        <path
          d="M-20 245L420 30M60 350L420 170M190 0L0 300"
          stroke="#cee1d4"
          strokeWidth="17"
          fill="none"
        />
        <g transform="translate(35 50) rotate(-16 170 100)">
          <rect x="15" y="35" width="140" height="90" rx="12" fill="#0a736c" />
          <rect x="175" y="35" width="140" height="90" rx="12" fill="#358c7b" />
          <rect x="70" y="146" width="200" height="90" rx="12" fill="#165b58" />
          <rect
            x="15"
            y="35"
            width="140"
            height="90"
            rx="12"
            fill="url(#water-lines)"
          />
          <rect
            x="175"
            y="35"
            width="140"
            height="90"
            rx="12"
            fill="url(#water-lines)"
          />
          <rect
            x="70"
            y="146"
            width="200"
            height="90"
            rx="12"
            fill="url(#water-lines)"
          />
          <g fill="#eaf8ee" fontSize="12" fontFamily="Arial">
            <text x="49" y="86">
              POND 01
            </text>
            <text x="207" y="86">
              POND 02
            </text>
            <text x="135" y="197">
              POND 03
            </text>
          </g>
        </g>
        <g fill="#0c5a54" fontSize="9" fontFamily="Arial">
          <text x="22" y="28">
            N ↑
          </text>
          <text x="295" y="300">
            CONCEPT INTERFACE
          </text>
        </g>
      </svg>
      <div className="atlas-footer">
        <span>Stock → Feed → Harvest</span>
        <span className="atlas-marker" aria-hidden="true">
          ↗
        </span>
      </div>
    </div>
  );
}
