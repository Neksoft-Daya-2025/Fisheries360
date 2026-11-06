import React, { useEffect, useRef, useState } from "react";
import {
  SiteContent,
  PageKey,
  Section,
  capabilities,
  useCases,
  stages,
} from "./content";
import { Hardware } from "./Hardware";
import { Dashboard } from "./Dashboard";
import { brand } from "./brand";
import {
  HeroFilm,
  HeroReadout,
  LayerOverview,
  FarmAtlas,
  FieldStory,
  ProductFilm,
} from "./Visuals";
export type AppProps = {
  content: SiteContent;
  page: PageKey;
  preview?: boolean;
  sent?: boolean;
  formError?: string;
  notFound?: boolean;
};
export function Logo() {
  return (
    <a className="logo" href="/" aria-label="Fisheries360 home">
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <path
          d="M4 15Q20 0 35 15Q21 30 7 18L3 25V10L7 15M8 29Q22 35 36 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="28" cy="13" r="1.6" fill="currentColor" />
      </svg>
      <span>
        Fisheries<span className="logo-number">360</span>
        <small>Connecting Aquaculture to Intelligence</small>
      </span>
    </a>
  );
}
function Arrow() {
  return <span aria-hidden="true">↗</span>;
}
function CompanyContact() {
  return (
    <address className="company-contact">
      <span>{brand.ownership}</span>
      <a href={`mailto:${brand.email}`}>{brand.email}</a>
      <a href={`tel:${brand.telephone}`}>{brand.phone}</a>
    </address>
  );
}
function ContactForm({ sent, error }: { sent?: boolean; error?: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    sent ? "success" : error ? "error" : "idle",
  );
  const [message, setMessage] = useState(error || "");
  return (
    <div className="contact-layout">
      <div>
        <p className="eyebrow">REQUEST A DEMO</p>
        <h3>
          Tell us about
          <br />
          your waters.
        </h3>
        <p>
          Business management, monitoring, or both. Let’s start with what
          matters to you.
        </p>
        <div className="contact-aside">
          <span>01</span>
          <p>Share your requirements</p>
          <span>02</span>
          <p>Discuss your workflows</p>
          <span>03</span>
          <p>Agree a practical next step</p>
        </div>
        <CompanyContact />
        <p className="fine">
          Your information is used to respond to your enquiry. It is stored in
          the Fisheries360 enquiry system and accessible to authorised team
          members.
        </p>
      </div>
      <form
        action="/api/enquiries"
        method="post"
        onSubmit={async (e) => {
          e.preventDefault();
          if (state === "loading") return;
          const form = e.currentTarget;
          setState("loading");
          setMessage("");
          try {
            const data = Object.fromEntries(new FormData(form));
            const response = await fetch("/api/enquiries", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(data),
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(
                result.error ||
                  "Could not save your enquiry. Please try again.",
              );
            setState("success");
            setMessage(
              `Your enquiry has been saved. Reference F360-${result.id}.`,
            );
            form.reset();
          } catch (err) {
            setState("error");
            setMessage(
              err instanceof Error
                ? err.message
                : "Connection failed. Please try again.",
            );
          }
        }}
      >
        <div className="form-grid">
          <label>
            Name
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Your full name"
            />
          </label>
          <label>
            Work email
            <input
              name="email"
              autoComplete="email"
              type="email"
              required
              maxLength={254}
              placeholder="you@company.com"
            />
          </label>
          <label>
            Company / farm
            <input
              name="company"
              autoComplete="organization"
              required
              minLength={2}
              maxLength={160}
              placeholder="Your company or farm"
            />
          </label>
          <label>
            Location
            <input
              name="location"
              autoComplete="address-level2"
              required
              minLength={2}
              maxLength={160}
              placeholder="City, state, country"
            />
          </label>
        </div>
        <label>
          Project requirements
          <textarea
            name="requirements"
            required
            minLength={15}
            maxLength={5000}
            rows={5}
            placeholder="Tell us about your ponds, team, current workflows and monitoring needs…"
          />
        </label>
        <label className="honeypot" aria-hidden="true">
          Leave this field empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <p className="fine">
          By submitting, you ask the Fisheries360 team to contact you about this
          enquiry.
        </p>
        <button className="button" type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Saving your enquiry…" : "Request a Demo"}
          <Arrow />
        </button>
        <div
          role={state === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`form-message ${state}`}
        >
          {message ||
            (state === "success"
              ? "Your enquiry has been saved. Thank you for contacting Fisheries360."
              : "")}
        </div>
      </form>
    </div>
  );
}
function Ecosystem({ items: stages }: { items: string[][] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="ecosystem">
      <div className="ecosystem-line" />
      {stages.map(([title], i) => (
        <button
          key={title}
          aria-pressed={active === i}
          onClick={() => setActive(i)}
          className={`eco-stage ${active === i ? "active" : ""}`}
        >
          <span className="eco-symbol" aria-hidden="true">
            {["≋", "⌁", "▤", "↗", "◫"][i]}
          </span>
          <small>0{i + 1}</small>
          <strong>{title}</strong>
          <span className="eco-arrow" aria-hidden="true">
            →
          </span>
        </button>
      ))}
      <noscript>
        <div className="eco-noscript">
          {stages.map(([name, body]) => (
            <details key={name}>
              <summary>{name}</summary>
              <p>{body}</p>
            </details>
          ))}
        </div>
      </noscript>
      <div className="eco-detail" aria-live="polite">
        <span>
          0{active + 1} / {stages[active][0]}
        </span>
        <p key={active}>{stages[active][1]}</p>
      </div>
    </div>
  );
}
function Capabilities({ items: capabilities }: { items: string[][] }) {
  return (
    <div className="capability-layout">
      <div className="capability-intro">
        <FarmAtlas />
        <p>
          From the first lease to the final collection, keep the cycle
          connected.
        </p>
        <a className="text-link" href="/platform">
          Explore the platform <Arrow />
        </a>
      </div>
      <div className="capability-list">
        {capabilities.map(([name, body], i) => (
          <details key={name} className="reveal" open={i === 0}>
            <summary>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {name}
              <b aria-hidden="true">+</b>
            </summary>
            <p>{body}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
function Solutions({ items: useCases }: { items: string[][] }) {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ start: true, end: false });
  function slide(direction: number) {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left: direction * (element.clientWidth * 0.7),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  return (
    <div className="solutions-gallery">
      <div className="solutions-controls">
        <span>EXPLORE YOUR OPERATION</span>
        <button
          type="button"
          aria-label="Previous use cases"
          disabled={position.start}
          onClick={() => slide(-1)}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="Next use cases"
          disabled={position.end}
          onClick={() => slide(1)}
        >
          →
        </button>
      </div>
      <div
        className="use-cases"
        ref={track}
        tabIndex={0}
        aria-label="Aquaculture use cases"
        onScroll={(e) => {
          const el = e.currentTarget;
          setPosition({
            start: el.scrollLeft < 2,
            end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
          });
        }}
      >
        {useCases.map(([name, title, body, flow], i) => (
          <article className="use-case reveal" key={name}>
            <span className="case-num">0{i + 1}</span>
            <div>
              <p className="eyebrow">{name}</p>
              <h3>{title}</h3>
              <p>{body}</p>
              <p className="workflow">{flow}</p>
              <a
                className="text-link"
                href={`/contact?interest=${encodeURIComponent(name)}`}
              >
                Discuss your workflow <Arrow />
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
function Implementation({ items }: { items: string[][] }) {
  return (
    <>
      <div className="implementation">
        {items.map(([name, body], i) => (
          <div key={name} className="reveal">
            <span>0{i + 1}</span>
            <h3>{name}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
      <p className="scope-note">
        Device availability, implementation and integration scope are agreed per
        engagement.
      </p>
    </>
  );
}
function SectionHeading({ s }: { s: Section }) {
  return (
    <div className="section-heading reveal">
      <p className="eyebrow">{s.eyebrow}</p>
      <h2>{s.title}</h2>
      <p>{s.body}</p>
    </div>
  );
}
export function App({
  content,
  page,
  preview,
  sent,
  formError,
  notFound,
}: AppProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chapter, setChapter] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const sections = content.pages[page].sections;
  const hero = sections.find((s) => s.id === "hero")!;
  const chapters = [
    { label: "Connected aquaculture", title: hero.title, body: hero.body },
    {
      label: "01 / Understand your water",
      title: "Connected waters.",
      body: "Explore proposed CageNode monitoring, configured sensors and alerts, with the context your team needs to review and respond.",
    },
    {
      label: "02 / Organise your operation",
      title: "Informed operations.",
      body: "Bring pond records, stocking, feed, harvest and sales together. Follow each cycle from the first lease to the final collection.",
    },
  ];
  const currentHero =
    page === "home"
      ? chapters[chapter]
      : { label: hero.eyebrow, title: hero.title, body: hero.body };
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let alive = true;
    let cleanup = () => {};
    import("gsap").then(({ gsap }) => {
      if (!alive || !root.current) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".hero-copy > *",
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.11,
            ease: "power2.out",
          },
        );
      }, root);
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            gsap.to(entry.target, {
              opacity: entry.isIntersecting ? 1 : 0.45,
              y: entry.isIntersecting ? 0 : 30,
              duration: 0.85,
              delay: entry.isIntersecting
                ? (Array.from(
                    root.current?.querySelectorAll(".reveal") || [],
                  ).indexOf(entry.target) %
                    3) *
                  0.07
                : 0,
              ease: "power2.out",
              overwrite: true,
            });
          }),
        { threshold: 0.08 },
      );
      root.current
        .querySelectorAll(".reveal")
        .forEach((e) => observer.observe(e));
      let frame = 0;
      const parallax = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - innerHeight;
          if (progress.current)
            progress.current.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
          root.current?.classList.toggle("is-scrolled", scrollY > 45);
          const photo = document.querySelector<HTMLElement>(".hero-photo");
          if (photo && innerWidth > 800 && scrollY < innerHeight)
            gsap.set(photo, { y: Math.min(scrollY * 0.12, 70) });
        });
      };
      window.addEventListener("scroll", parallax, { passive: true });
      parallax();
      cleanup = () => {
        ctx.revert();
        observer.disconnect();
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", parallax);
      };
    });
    return () => {
      alive = false;
      cleanup();
    };
  }, [page]);
  return (
    <div ref={root} className={`public-site page-${page}`}>
      <div ref={progress} className="reading-progress" aria-hidden="true" />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {preview && (
        <div className="preview-bar">
          Draft preview · Not published <a href="/admin">Return to admin</a>
        </div>
      )}
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <button
            className="menu-toggle"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <>
                  <path d="M4 6h16M4 12h16" />
                  <path d="M4 18h11" />
                </>
              )}
            </svg>
          </button>
          <nav
            id="primary-nav"
            className={menuOpen ? "open" : ""}
            aria-label="Main navigation"
          >
            {content.menus.map((m) => (
              <a
                key={m.label}
                href={m.href}
                aria-current={
                  m.href === (page === "home" ? "/" : `/${page}`)
                    ? "page"
                    : undefined
                }
              >
                {m.label}
              </a>
            ))}
          </nav>
          <a className="button header-cta" href={content.links.demoHref}>
            {content.links.demoLabel} <Arrow />
          </a>
        </div>
      </header>
      <main id="main">
        {notFound ? (
          <section className="not-found">
            <p className="eyebrow">404 / UNCHARTED WATERS</p>
            <h1>This page isn’t here.</h1>
            <a href="/" className="button">
              Back to Fisheries360 <Arrow />
            </a>
          </section>
        ) : (
          <>
            <section
              className={`hero ${page === "home" ? "home-hero" : "inner-hero"} ${hero.image ? "has-photo" : ""}`}
            >
              {page === "home" || page === "cagenode" ? (
                <HeroFilm />
              ) : (
                hero.image && (
                  <img
                    className="hero-photo"
                    src={hero.image}
                    alt={hero.alt}

                    sizes="100vw"
                    fetchPriority="high"
                    width="1600"
                    height="941"
                  />
                )
              )}
              <div className="hero-shade" />
              <div className="hero-content">
                <div className="hero-copy">
                  {page !== "home" && (
                    <p className="eyebrow">
                      <span className="status-dot" />
                      {chapter === 0 ? hero.eyebrow : currentHero.label}
                    </p>
                  )}
                  <h1
                    aria-label={currentHero.title}
                    aria-live={page === "home" ? "polite" : undefined}
                  >
                    {page === "home" &&
                    chapter === 0 &&
                    hero.title ===
                      "Your ponds. Your operations. One connected view." ? (
                      <>
                        <span>Your ponds.</span>
                        <span>Your operations.</span>
                        <em>One connected view.</em>
                      </>
                    ) : (
                      currentHero.title
                    )}
                  </h1>
                  <p>{currentHero.body}</p>
                  <div className="hero-actions">
                    <a
                      className="button"
                      href={
                        page === "home"
                          ? content.links.platformHref
                          : page === "contact"
                            ? "#contact"
                            : content.links.demoHref
                      }
                    >
                      {page === "home"
                        ? content.links.platformLabel
                        : content.links.demoLabel}
                      <Arrow />
                    </a>
                    <a
                      className="text-link light"
                      href={
                        page === "home"
                          ? content.links.demoHref
                          : page === "cagenode"
                            ? "#hardware"
                            : "#" + sections[1]?.id
                      }
                    >
                      {page === "home"
                        ? content.links.demoLabel
                        : page === "cagenode"
                          ? "Explore the concept"
                          : "Explore the details"}{" "}
                      <span aria-hidden="true">↓</span>
                    </a>
                  </div>
                  {page === "home" && (
                    <a className="hero-watch-film" href="#product-film">
                      <span aria-hidden="true">▷</span> Product Demo{" "}
                      <small>01:00</small>
                    </a>
                  )}
                  {page === "home" && (
                    <p className="hero-tagline">
                      Connecting Aquaculture to Intelligence{" "}
                      <span>
                        Connected aquaculture. Intelligent farm management.
                      </span>
                    </p>
                  )}
                </div>
                {page === "home" && (
                  <div
                    className="hero-chapters"
                    role="group"
                    aria-label="Explore the Fisheries360 story"
                  >
                    {chapters.map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-pressed={chapter === i}
                        onClick={() => setChapter(i)}
                      >
                        <span>0{i + 1}</span>
                        <small>
                          {
                            [
                              "The connected view",
                              "In the water",
                              "Across the business",
                            ][i]
                          }
                        </small>
                        <i aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                )}
                {(page === "home" || page === "cagenode") && <HeroReadout />}
                {page === "platform" && (
                  <div className="hero-abstract" aria-hidden="true">
                    <div>
                      01 <span>POND & PRODUCTION</span>
                      <b>Operational clarity</b>
                    </div>
                    <div>
                      02 <span>MONITORING & ALERTS</span>
                      <b>Connected visibility</b>
                    </div>
                    <div>
                      03 <span>SALES & PROFITABILITY</span>
                      <b>Business context</b>
                    </div>
                  </div>
                )}
              </div>
              <div className="hero-bottom">
                <span>
                  FISHERIES360 <i>/</i>{" "}
                  {page === "home"
                    ? "GENERATED CONCEPT FOOTAGE · NOT AN ACTUAL INSTALLATION"
                    : page.toUpperCase()}
                </span>
                <a href={"#" + sections[1]?.id}>
                  Scroll to explore <span aria-hidden="true">↓</span>
                </a>
              </div>
            </section>
            {page === "home" && (
              <>
                <nav
                  className="journey-index"
                  aria-label="Explore Fisheries360"
                >
                  <span>FROM WATER TO WORKSPACE</span>
                  <a href="/cagenode">
                    <small>01</small> Connected monitoring <Arrow />
                  </a>
                  <a href="/platform">
                    <small>02</small> Farm management <Arrow />
                  </a>
                  <a href="/platform#dashboard">
                    <small>03</small> Explore the workspace <Arrow />
                  </a>
                </nav>
                <FieldStory />
                <LayerOverview />
              </>
            )}
            {sections
              .filter((s) => s.id !== "hero")
              .map((s) => (
                <section
                  key={s.id}
                  id={s.id}
                  className={`section section-${s.id} ${s.id === "dashboard" || s.id === "implementation" ? "tinted" : ""} ${s.id === "ecosystem" ? "ocean-section" : ""}`}
                >
                  <div className="container">
                    <SectionHeading s={s} />
                    {s.image && (
                      <figure className="section-image">
                        <img
                          src={s.image}
                          alt={s.alt}
                          loading="lazy"
                          width="1600"
                          height="941"
                        />
                      </figure>
                    )}
                    {s.id === "ecosystem" ? (
                      <Ecosystem items={content.collections.stages} />
                    ) : s.id === "hardware" ? (
                      <Hardware parts={content.collections.hardwareParts} />
                    ) : s.id === "capabilities" ? (
                      <Capabilities items={content.collections.capabilities} />
                    ) : s.id === "dashboard" ? (
                      <Dashboard />
                    ) : s.id === "solutions" ? (
                      <Solutions items={content.collections.useCases} />
                    ) : s.id === "implementation" ? (
                      <Implementation
                        items={content.collections.implementation}
                      />
                    ) : s.id === "contact" ? (
                      <ContactForm sent={sent} error={formError} />
                    ) : s.id === "about" ? (
                      <div className="about-inline">
                        <span className="neksoft-word">
                          {brand.company}
                          <small>{brand.ownership}</small>
                        </span>
                        <a className="text-link" href="/about">
                          Meet the product <Arrow />
                        </a>
                        <a
                          className="text-link"
                          href="https://www.neksoftconsultancy.com/"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Visit {brand.company} <Arrow />
                        </a>
                      </div>
                    ) : s.id === "configuration" ? (
                      <div className="configuration-table">
                        <div>
                          <strong>Depicted in the concept</strong>
                          <p>
                            Enclosure, solar panel, antenna, clamp mounting,
                            dissolved oxygen and temperature sensor assembly.
                          </p>
                        </div>
                        <div>
                          <strong>Potential optional inputs</strong>
                          <p>
                            pH, conductivity and depth. Compatibility, sensor
                            availability and integration need confirmation.
                          </p>
                        </div>
                        <div>
                          <strong>Confirmed standard specification</strong>
                          <p>
                            Not supplied. The concept is a discussion reference;
                            the engagement defines the actual configuration.
                          </p>
                        </div>
                      </div>
                    ) : s.id === "neksoft" ? (
                      <a
                        className="button"
                        href="https://www.neksoftconsultancy.com/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit {brand.company} <Arrow />
                      </a>
                    ) : s.id === "mobile" ? (
                      <div className="mobile-story">
                        <div className="phone-demo">
                          <span>F360 / ILLUSTRATIVE DATA</span>
                          <h3>Farm overview</h3>
                          <div>
                            Lease review <b>Upcoming</b>
                          </div>
                          <div>
                            Feed inventory <b>Check stock</b>
                          </div>
                          <div>
                            Harvest plan <b>Review cycle</b>
                          </div>
                          <small>Interface concept · No live connection</small>
                        </div>
                        <div>
                          <h3>
                            The same context.
                            <br />A smaller screen.
                          </h3>
                          <p>
                            Use mobile access to review records and reminders.
                            Field observations and follow-ups stay connected to
                            the wider farm picture.
                          </p>
                          <a className="text-link" href="/contact">
                            Discuss mobile workflows <Arrow />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="editorial-end">
                        <span aria-hidden="true">≈</span>
                        <a className="text-link" href="/contact">
                          Discuss your requirements <Arrow />
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            {page === "home" && <ProductFilm />}
          </>
        )}
      </main>
      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <Logo />
              <p>
                Connected aquaculture.
                <br />
                Intelligent farm management.
              </p>
              <span className="tagline">
                Connecting Aquaculture to Intelligence
              </span>
            </div>
            <div>
              <p className="eyebrow">EXPLORE</p>
              {content.menus
                .filter((m) => m.href !== "/")
                .map((m) => (
                  <a key={m.label} href={m.href}>
                    {m.label}
                  </a>
                ))}
            </div>
            <div>
              <p className="eyebrow">LET’S CONNECT</p>
              <a className="footer-demo" href="/contact">
                Your next cycle,
                <br />
                with a clearer view. ↗
              </a>
              <p>
                A product of{" "}
                <a
                  href="https://www.neksoftconsultancy.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  {brand.company}
                </a>
              </p>
              <CompanyContact />
            </div>
          </div>
          <div className="footer-bottom">
            <span>
              © {new Date().getFullYear()} Fisheries360 · A product of Neksoft
              Consultancy Services B.V.
            </span>
            <details className="credits">
              <summary>Image & concept credits</summary>
              <p>
                Hardware visuals are concept diagrams, not product photographs.
                Hero and demo films contain owner-supplied generated conceptual
                footage. They do not show actual installations. Original product
                photography and the approved logo are pending owner supply. All
                dashboard data is illustrative.
              </p>
            </details>
            <a href="/admin">Team access</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
