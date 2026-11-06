import { brand } from "../src/brand";
import type { SiteContent } from "../src/content";

// Narrow corrections only: preserve page order, owner edits and unrelated fields.
export function approvedText(text: string): string {
  return text
    .replace(/pond\s+se\s+profit\s+tak\.?/gi, brand.tagline)
    .replace(
      /Neksoft\s+Global\s+(?:(?:Services?|Consultancy)\s+)?(?:Private\s+Limited|Pvt\.?\s*Ltd\.?|Private\s+Ltd\.?)/gi,
      brand.company,
    )
    .replace(
      /Fisheries360\s+is\s+a\s+Neksoft\s+product/gi,
      `Fisheries360 is a product of ${brand.company}`,
    )
    .replace(/A\s+Neksoft\s+product/gi, brand.ownership)
    .replace(
      /Fisheries360\s+by\s+Neksoft(?!\s+Consultancy)/gi,
      `Fisheries360 by ${brand.company}`,
    )
    .replace(
      /Fisheries360\s+is\s+a\s+Neksoft\s+product/gi,
      `Fisheries360 is a product of ${brand.company}`,
    )
    .replace(/from Neksoft\./gi, `from ${brand.company}`)
    .replace(/FISHERIES360 BY NEKSOFT$/g, `Fisheries360 by ${brand.company}`)
    .replace(/B\.V\.\./g, "B.V.");
}

export function approvedContent(input: SiteContent): SiteContent {
  function walk(value: unknown): unknown {
    if (typeof value === "string") return approvedText(value);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, walk(v)]),
      );
    return value;
  }
  const content = walk(input) as SiteContent;
  for (const page of Object.values(content.pages)) {
    for (const section of page.sections) {
      // These are the specific generated/unrelated legacy assets, not owner uploads.
      if (
        [
          "/images/cagenode-hero-v2.webp",
          "/images/cagenode-hero-v2-small.webp",
          "/images/aquaculture.webp",
          "/images/aquaculture-small.webp",
        ].includes(section.image)
      ) {
        section.image =
          section.id === "hero" &&
          [content.pages.home, content.pages.cagenode].includes(page)
            ? "/images/cagenode-diagram.svg"
            : "";
        section.alt = section.image
          ? "CageNode concept diagram; proposed configuration, not a product photograph"
          : "";
      }
    }
  }
  return content;
}
