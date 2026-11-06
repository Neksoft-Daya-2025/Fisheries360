import React, { useEffect, useState } from "react";
import { SiteContent, PageKey, pageKeys, CollectionKey } from "./content";
import { Logo } from "./App";
type User = { email: string; role: "owner" | "editor"; csrf: string };
type Media = { id: string; url: string; alt: string; usage: string };
type Enquiry = {
  id: number;
  name: string;
  email: string;
  company: string;
  location: string;
  requirements: string;
  status: string;
  notes: string;
  follow_up: string;
  created: string;
  mail_status?: string;
  mail_configured?: boolean;
};
type Revision = { id: number; action: string; actor: string; created: string };
export function Admin() {
  const [user, setUser] = useState<User | null>(null),
    [checking, setChecking] = useState(true),
    [tab, setTab] = useState("content"),
    [content, setContent] = useState<SiteContent | null>(null),
    [version, setVersion] = useState(0),
    [page, setPage] = useState<PageKey>("home"),
    [section, setSection] = useState("hero"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [media, setMedia] = useState<Media[]>([]),
    [enquiries, setEnquiries] = useState<Enquiry[]>([]),
    [revisions, setRevisions] = useState<Revision[]>([]),
    [uploadPreview, setUploadPreview] = useState("");
  const api = async (url: string, method = "GET", body?: unknown) => {
    const isForm = body instanceof FormData;
    const r = await fetch("/api/admin/" + url, {
      method,
      headers: {
        ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
        ...(user ? { "x-csrf-token": user.csrf } : {}),
      },
      body: body
        ? isForm
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
    const d = await r.json();
    if (!r.ok) {
      if (r.status === 401) setUser(null);
      throw new Error(d.error || "Request failed.");
    }
    return d;
  };
  const action = async (fn: () => Promise<void>) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      await fn();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  };
  const loadContent = async () => {
    const d = await api("content");
    setContent(d.content);
    setVersion(d.version);
    setDirty(false);
  };
  useEffect(() => {
    fetch("/api/admin/session")
      .then(async (r) => {
        if (r.ok) setUser(await r.json());
      })
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    if (user)
      action(async () => {
        await loadContent();
        setMedia(await api("media"));
        setEnquiries(await api("enquiries"));
        setRevisions(await api("revisions"));
      });
  }, [user?.email]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  useEffect(
    () => () => {
      if (uploadPreview) URL.revokeObjectURL(uploadPreview);
    },
    [uploadPreview],
  );
  const change = (fn: (c: SiteContent) => void) => {
    setContent((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      fn(next);
      return next;
    });
    setDirty(true);
  };
  const save = async () => {
    const d = await api("content", "PUT", { content, version });
    setVersion(d.version);
    setContent(d.content);
    setDirty(false);
    setRevisions(await api("revisions"));
    setMessage("Draft saved. The public site is unchanged.");
  };
  if (checking)
    return <div className="admin-loading">Checking your session…</div>;
  if (!user)
    return (
      <main className="login-page">
        <Logo />
        <div className="login-card">
          <p className="eyebrow">FISHERIES360 / TEAM ACCESS</p>
          <h1>Welcome to the workspace.</h1>
          <p>Sign in to manage the website and demo enquiries.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              action(async () => {
                setUser(await api("login", "POST", Object.fromEntries(f)));
                setMessage("");
              });
            }}
          >
            <label>
              Email
              <input
                name="email"
                autoComplete="username"
                type="email"
                required
              />
            </label>
            <label>
              Password
              <input
                name="password"
                autoComplete="current-password"
                type="password"
                required
                maxLength={256}
              />
            </label>
            <button disabled={busy} className="button">
              {busy ? "Signing in…" : "Sign in"} →
            </button>
          </form>
          <p className="form-message" role="status">
            {message}
          </p>
          <p className="fine">
            No default account is installed. The project owner creates accounts
            through the documented local setup command.
          </p>
          <a className="text-link" href="/">
            ← Back to website
          </a>
        </div>
      </main>
    );
  const current = content?.pages[page];
  const currentSection = current?.sections.find((s) => s.id === section);
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Logo />
        <p className="eyebrow">TEAM WORKSPACE</p>
        <nav aria-label="Admin navigation">
          {[
            ["content", "Pages & content"],
            ["menus", "Menus & links"],
            ["media", "Image library"],
            ["enquiries", "Demo enquiries"],
            ["revisions", "Revision history"],
          ].map(([key, label]) => (
            <button
              key={key}
              aria-current={tab === key ? "page" : undefined}
              onClick={() => {
                setTab(key);
                setMessage("");
              }}
            >
              {label}
              {key === "enquiries" && <small>{enquiries.length}</small>}
            </button>
          ))}
        </nav>
        <div className="admin-user">
          <strong>{user.role}</strong>
          <span>{user.email}</span>
          <button
            disabled={busy}
            onClick={() =>
              action(async () => {
                if (dirty && !confirm("Sign out and discard unsaved changes?"))
                  return;
                await api("logout", "POST", {});
                setUser(null);
                setContent(null);
                setDirty(false);
              })
            }
          >
            Sign out →
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <p className="eyebrow">FISHERIES360 CMS</p>
            <h1>
              {
                (
                  {
                    content: "Pages & content",
                    menus: "Menus & links",
                    media: "Image library",
                    enquiries: "Demo enquiries",
                    revisions: "Revision history",
                  } as any
                )[tab]
              }
            </h1>
          </div>
          <a className="text-link" href="/" target="_blank">
            View website ↗
          </a>
        </header>
        <div className="admin-status" role="status" aria-live="polite">
          {busy
            ? "Working…"
            : message ||
              `${dirty ? "Unsaved changes" : "Draft workspace"} · ${user.role === "owner" ? "Owner publishing enabled" : "Editors can save drafts; an owner publishes"}`}
        </div>
        {(tab === "content" || tab === "menus") && content && (
          <>
            <div className="admin-toolbar">
              <button
                className="button"
                disabled={busy || !dirty}
                onClick={() => action(save)}
              >
                Save draft
              </button>
              <button
                className="secondary-button"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    if (dirty) await save();
                    window.open(
                      (page === "home" ? "/" : "/" + page) + "?preview=1",
                      "_blank",
                      "noopener",
                    );
                  })
                }
              >
                Preview saved draft ↗
              </button>
              {user.role === "owner" && (
                <button
                  className="secondary-button"
                  disabled={busy || dirty}
                  onClick={() =>
                    action(async () => {
                      if (
                        !confirm(
                          "Publish the saved draft to the local public website?",
                        )
                      )
                        return;
                      const d = await api("publish", "POST", { version });
                      setVersion(d.version);
                      setRevisions(await api("revisions"));
                      setMessage(
                        "Saved draft published to this website. No domain deployment was performed.",
                      );
                    })
                  }
                >
                  Publish draft
                </button>
              )}
              <button
                className="quiet-button"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    if (
                      dirty &&
                      !confirm(
                        "Discard unsaved edits and reload the saved draft?",
                      )
                    )
                      return;
                    await loadContent();
                    setMessage("Saved draft reloaded.");
                  })
                }
              >
                Reload draft
              </button>
            </div>
            <p className="fine">
              Publishing updates this running website’s content. Hosting and
              domain deployment are separate.
            </p>
          </>
        )}
        {tab === "content" && content && current && (
          <>
            <div className="admin-selectors">
              <label>
                Page
                <select
                  value={page}
                  onChange={(e) => {
                    setPage(e.target.value as PageKey);
                    setSection("hero");
                  }}
                >
                  {pageKeys.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label>
                Section
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                >
                  {current.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {(section === "capabilities" ||
              section === "solutions" ||
              section === "ecosystem" ||
              section === "hardware" ||
              section === "implementation") && (
              <div className="admin-panel">
                <h2>Shared component content</h2>
                <p>
                  These entries are shared across pages that use this component.
                </p>
                {content.collections[
                  (
                    {
                      capabilities: "capabilities",
                      solutions: "useCases",
                      ecosystem: "stages",
                      hardware: "hardwareParts",
                      implementation: "implementation",
                    } as Record<string, CollectionKey>
                  )[section]
                ].map((row, i) => (
                  <details className="collection-editor" key={i}>
                    <summary>
                      {String(i + 1).padStart(2, "0")} · {row[0]}
                    </summary>
                    {row.map((value, j) => (
                      <label key={j}>
                        {j === 0
                          ? "Name / label"
                          : j === 1 && row.length === 4
                            ? "Workflow heading"
                            : j === 3
                              ? "Workflow sequence"
                              : "Description"}
                        <textarea
                          value={value}
                          maxLength={1500}
                          onChange={(e) =>
                            change((c) => {
                              c.collections[
                                (
                                  {
                                    capabilities: "capabilities",
                                    solutions: "useCases",
                                    ecosystem: "stages",
                                    hardware: "hardwareParts",
                                    implementation: "implementation",
                                  } as Record<string, CollectionKey>
                                )[section]
                              ][i][j] = e.target.value;
                            })
                          }
                        />
                      </label>
                    ))}
                  </details>
                ))}
              </div>
            )}
            <div className="admin-panel">
              <h2>Search engine metadata</h2>
              <label>
                SEO title
                <input
                  value={current.seoTitle}
                  maxLength={100}
                  onChange={(e) =>
                    change((c) => {
                      c.pages[page].seoTitle = e.target.value;
                    })
                  }
                />
              </label>
              <label>
                Meta description
                <textarea
                  value={current.description}
                  maxLength={300}
                  onChange={(e) =>
                    change((c) => {
                      c.pages[page].description = e.target.value;
                    })
                  }
                />
              </label>
            </div>
            {currentSection && (
              <div className="admin-panel">
                <h2>
                  {page} / {section}
                </h2>
                {(["eyebrow", "title", "body"] as const).map((field) => (
                  <label key={field}>
                    {field === "body"
                      ? "Section description"
                      : field === "title"
                        ? "Heading"
                        : "Eyebrow"}
                    {field === "body" ? (
                      <textarea
                        rows={5}
                        value={currentSection[field]}
                        onChange={(e) =>
                          change((c) => {
                            c.pages[page].sections.find(
                              (s) => s.id === section,
                            )![field] = e.target.value;
                          })
                        }
                      />
                    ) : (
                      <input
                        value={currentSection[field]}
                        onChange={(e) =>
                          change((c) => {
                            c.pages[page].sections.find(
                              (s) => s.id === section,
                            )![field] = e.target.value;
                          })
                        }
                      />
                    )}
                  </label>
                ))}
                <label>
                  Section image
                  <select
                    value={currentSection.image}
                    onChange={(e) =>
                      change((c) => {
                        const s = c.pages[page].sections.find(
                          (s) => s.id === section,
                        )!;
                        s.image = e.target.value;
                        const m = media.find((m) => m.url === e.target.value);
                        s.alt =
                          m?.alt ||
                          (e.target.value
                            ? "CageNode concept diagram; proposed configuration, not a product photograph"
                            : "");
                      })
                    }
                  >
                    <option value="">No section image</option>
                    <option value="/images/cagenode-diagram.svg">
                      CageNode · concept diagram · not a photograph
                    </option>
                    {media.map((m) => (
                      <option key={m.id} value={m.url}>
                        {m.alt}
                      </option>
                    ))}
                  </select>
                </label>
                {currentSection.image && (
                  <figure className="admin-image-preview">
                    <img src={currentSection.image} alt={currentSection.alt} />
                    <figcaption>
                      Used on {page} / {section}.{" "}
                      {media.find((m) => m.url === currentSection.image)
                        ?.usage ||
                        "Jebulon / Bammesk, CC0; contextual image, not a customer site."}
                    </figcaption>
                  </figure>
                )}
                <label>
                  Image alt text
                  <input
                    value={currentSection.alt}
                    maxLength={300}
                    onChange={(e) =>
                      change((c) => {
                        c.pages[page].sections.find(
                          (s) => s.id === section,
                        )!.alt = e.target.value;
                      })
                    }
                  />
                </label>
                <div className="inline-upload">
                  <h3>Choose a new image for this section</h3>
                  <UploadForm
                    busy={busy}
                    preview={uploadPreview}
                    setPreview={setUploadPreview}
                    onUpload={(form) =>
                      action(async () => {
                        const m = await api("media", "POST", form);
                        setMedia((old) => [m, ...old]);
                        change((c) => {
                          const s = c.pages[page].sections.find(
                            (s) => s.id === section,
                          )!;
                          s.image = m.url;
                          s.alt = m.alt;
                        });
                        setMessage(
                          "Image uploaded and selected. Save the draft to retain this section change.",
                        );
                      })
                    }
                  />
                </div>
              </div>
            )}
          </>
        )}
        {tab === "menus" && content && (
          <div className="admin-panel">
            <h2>Primary calls to action</h2>
            {(
              [
                "demoLabel",
                "demoHref",
                "platformLabel",
                "platformHref",
              ] as const
            ).map((key) => (
              <label key={key}>
                {key}
                <input
                  value={content.links[key]}
                  onChange={(e) =>
                    change((c) => {
                      c.links[key] = e.target.value;
                    })
                  }
                />
              </label>
            ))}
            <h2>Primary & footer navigation</h2>
            <p>
              Use a local route or an HTTPS URL. Header and footer use these
              links.
            </p>
            {content.menus.map((m, i) => (
              <div className="menu-editor-row" key={i}>
                <label>
                  Label
                  <input
                    value={m.label}
                    onChange={(e) =>
                      change((c) => {
                        c.menus[i].label = e.target.value;
                      })
                    }
                  />
                </label>
                <label>
                  Destination
                  <input
                    value={m.href}
                    onChange={(e) =>
                      change((c) => {
                        c.menus[i].href = e.target.value;
                      })
                    }
                  />
                </label>
                <button
                  disabled={i === 0}
                  aria-label={`Move ${m.label} up`}
                  onClick={() =>
                    change((c) => {
                      [c.menus[i - 1], c.menus[i]] = [
                        c.menus[i],
                        c.menus[i - 1],
                      ];
                    })
                  }
                >
                  ↑
                </button>
                <button
                  disabled={content.menus.length <= 1}
                  onClick={() => {
                    if (confirm(`Remove the ${m.label} navigation link?`))
                      change((c) => {
                        c.menus.splice(i, 1);
                      });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="secondary-button"
              disabled={content.menus.length >= 10}
              onClick={() =>
                change((c) => {
                  c.menus.push({ label: "New link", href: "/contact" });
                })
              }
            >
              Add navigation link
            </button>
          </div>
        )}
        {tab === "media" && (
          <>
            <div className="admin-panel">
              <h2>Upload an image</h2>
              <p>
                JPEG, PNG, WebP or AVIF · Up to 8 MB · Converted to optimised
                WebP. Supply source and usage rights before uploading.
              </p>
              <UploadForm
                busy={busy}
                preview={uploadPreview}
                setPreview={setUploadPreview}
                onUpload={(f) =>
                  action(async () => {
                    const m = await api("media", "POST", f);
                    setMedia((old) => [m, ...old]);
                    setMessage(
                      "Image saved to the library. Select it from a page section.",
                    );
                  })
                }
              />
            </div>
            <div className="media-grid">
              <article>
                <img
                  src="/images/cagenode-diagram.svg"
                  alt="CageNode concept diagram; not a product photograph"
                />
                <h3>CageNode concept diagram</h3>
                <p>
                  Original code-based illustration of a proposed configuration.
                  Approved original hardware photography is pending.
                </p>
                <p className="fine">
                  Used in:{" "}
                  {content &&
                    Object.entries(content.pages)
                      .flatMap(([key, p]) =>
                        p.sections
                          .filter(
                            (s) => s.image === "/images/cagenode-diagram.svg",
                          )
                          .map((s) => `${key}/${s.id}`),
                      )
                      .join(", ")}
                </p>
              </article>
              {media.map((m) => (
                <article key={m.id}>
                  <img src={m.url} alt={m.alt} />
                  <h3>{m.alt}</h3>
                  <p>{m.usage}</p>
                  <p className="fine">
                    Used in draft:{" "}
                    {(content &&
                      Object.entries(content.pages)
                        .flatMap(([key, p]) =>
                          p.sections
                            .filter((s) => s.image === m.url)
                            .map((s) => `${key}/${s.id}`),
                        )
                        .join(", ")) ||
                      "Not assigned"}
                  </p>
                </article>
              ))}
            </div>
            <p className="fine">
              The CageNode SVG is an original, code-based concept illustration;
              edit its source to preserve component alignment. No screenshot
              participants or meeting interface are used.
            </p>
          </>
        )}
        {tab === "enquiries" && (
          <>
            <p>
              Saved form submissions only. Follow-up dates are tracked here;
              email notification status is shown for each enquiry. Follow-up
              reminders are not sent automatically.
            </p>
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() =>
                action(async () => {
                  setEnquiries(await api("enquiries"));
                  setMessage("Enquiries refreshed.");
                })
              }
            >
              Refresh enquiries
            </button>
            {enquiries.length === 0 ? (
              <div className="empty-state">
                <h2>No enquiries yet.</h2>
                <p>
                  Enquiries appear here only after a visitor’s submission is
                  saved.
                </p>
              </div>
            ) : (
              enquiries.map((q) => (
                <EnquiryCard
                  key={q.id}
                  enquiry={q}
                  owner={user.role === "owner"}
                  busy={busy}
                  onSave={(d) =>
                    action(async () => {
                      await api(`enquiries/${q.id}`, "PATCH", d);
                      setEnquiries(await api("enquiries"));
                      setMessage(`Enquiry F360-${q.id} updated.`);
                    })
                  }
                  onDelete={() =>
                    action(async () => {
                      if (
                        !confirm(
                          `Permanently delete enquiry F360-${q.id}? This cannot be undone.`,
                        )
                      )
                        return;
                      await api(`enquiries/${q.id}`, "DELETE", {});
                      setEnquiries(await api("enquiries"));
                      setMessage("Enquiry deleted.");
                    })
                  }
                />
              ))
            )}
          </>
        )}
        {tab === "revisions" && (
          <div className="admin-panel">
            <h2>Restore a previous content snapshot</h2>
            <p>
              Restoring creates a draft. Preview it and publish separately. The
              latest 100 snapshots are listed.
            </p>
            {revisions.length === 0 ? (
              <p>No revisions yet. Saving or publishing creates a snapshot.</p>
            ) : (
              revisions.map((r) => (
                <div className="revision-row" key={r.id}>
                  <div>
                    <strong>
                      #{r.id} · {r.action}
                    </strong>
                    <p>
                      {r.actor} · {r.created} UTC
                    </p>
                  </div>
                  {user.role === "owner" && (
                    <button
                      className="secondary-button"
                      disabled={busy || dirty}
                      onClick={() =>
                        action(async () => {
                          if (
                            !confirm(
                              `Replace the saved draft with revision #${r.id}? The current draft will be snapshotted.`,
                            )
                          )
                            return;
                          const d = await api(
                            `revisions/${r.id}/restore`,
                            "POST",
                            { version },
                          );
                          setContent(d.content);
                          setVersion(d.version);
                          setDirty(false);
                          setRevisions(await api("revisions"));
                          setMessage(
                            "Revision restored to draft. Preview before publishing.",
                          );
                        })
                      }
                    >
                      Restore to draft
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
function UploadForm({
  busy,
  preview,
  setPreview,
  onUpload,
}: {
  busy: boolean;
  preview: string;
  setPreview: (p: string) => void;
  onUpload: (f: FormData) => void;
}) {
  return (
    <form
      className="upload-form"
      onSubmit={(e) => {
        e.preventDefault();
        onUpload(new FormData(e.currentTarget));
      }}
    >
      <label>
        Choose File
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          onChange={(e) => {
            if (preview) URL.revokeObjectURL(preview);
            setPreview(
              e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : "",
            );
          }}
        />
      </label>
      {preview && (
        <img
          className="upload-preview"
          src={preview}
          alt="Selected file preview"
        />
      )}
      <label>
        Descriptive alt text
        <input name="alt" required minLength={3} maxLength={300} />
      </label>
      <label>
        Source, licence & permitted use
        <textarea
          name="usage"
          required
          minLength={5}
          maxLength={1000}
          placeholder="Owner-provided image, permission details or source URL and licence"
        />
      </label>
      <button className="secondary-button" disabled={busy}>
        Upload & save image
      </button>
    </form>
  );
}
function EnquiryCard({
  enquiry: q,
  owner,
  busy,
  onSave,
  onDelete,
}: {
  enquiry: Enquiry;
  owner: boolean;
  busy: boolean;
  onSave: (d: unknown) => void;
  onDelete: () => void;
}) {
  return (
    <article className="admin-panel enquiry">
      <div className="enquiry-heading">
        <div>
          <p className="eyebrow">
            F360-{q.id} · {q.created} UTC
          </p>
          <h2>{q.name}</h2>
          <a href={`mailto:${q.email}`}>{q.email}</a>
          <p>
            {q.company} · {q.location}
          </p>
        </div>
        <span className="sample-badge">{q.status}</span>
      </div>
      <p className="enquiry-requirements">{q.requirements}</p>
      <p className="fine">
        Email notification:{" "}
        {q.mail_status === "sent"
          ? "Accepted by configured SMTP server"
          : q.mail_configured
            ? "Queued for delivery / retry"
            : "SMTP not configured; enquiry saved for admin review"}
        . Recipient: info@neksoftconsultancy.com.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <div className="form-grid">
          <label>
            Status
            <select name="status" defaultValue={q.status}>
              {["new", "contacted", "qualified", "closed"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Follow-up date
            <input name="follow_up" type="date" defaultValue={q.follow_up} />
          </label>
        </div>
        <label>
          Internal notes
          <textarea
            name="notes"
            maxLength={10000}
            rows={3}
            defaultValue={q.notes}
          />
        </label>
        <div className="admin-toolbar">
          <button className="secondary-button" disabled={busy}>
            Save enquiry
          </button>
          {owner && (
            <button
              className="danger-button"
              type="button"
              disabled={busy}
              onClick={onDelete}
            >
              Delete enquiry
            </button>
          )}
        </div>
      </form>
    </article>
  );
}
