import { z } from "zod";
import { pageKeys } from "../src/content";
const text = (min = 0, max = 500) => z.string().trim().min(min).max(max);
export const enquirySchema = z.object({
  name: text(2, 120),
  email: z.email().max(254),
  company: text(2, 160),
  location: text(2, 160),
  requirements: text(15, 5000),
  website: text(0, 0).optional(),
});
export const safeLink = z
  .string()
  .max(500)
  .refine(
    (s) =>
      /^\/(?!\/)[a-zA-Z0-9\-\/#?=&.]*$/.test(s) ||
      /^https:\/\/[^\s<>]+$/.test(s),
    "Use a local path or HTTPS URL",
  );
const image = z
  .string()
  .max(300)
  .refine(
    (s) => s === "" || /^\/(images|uploads)\/[a-zA-Z0-9._-]+$/.test(s),
    "Choose an image from the library",
  );
const section = z
  .object({
    id: text(1, 40).regex(/^[a-z]+$/),
    eyebrow: text(0, 100),
    title: text(1, 200),
    body: text(1, 3000),
    image,
    alt: text(0, 300),
  })
  .refine(
    (s) => !s.image || s.alt.length > 0,
    "Images require descriptive alt text",
  );
const page = z.object({
  seoTitle: text(5, 100),
  description: text(20, 300),
  sections: z.array(section).min(1).max(20),
});
const pair = z.array(text(1, 1500)).length(2);
export const contentSchema = z.object({
  menus: z
    .array(z.object({ label: text(1, 40), href: safeLink }))
    .min(1)
    .max(10),
  links: z.object({
    demoLabel: text(1, 60),
    demoHref: safeLink,
    platformLabel: text(1, 60),
    platformHref: safeLink,
  }),
  collections: z.object({
    capabilities: z.array(pair).length(11),
    useCases: z.array(z.array(text(1, 1500)).length(4)).length(4),
    stages: z.array(pair).length(5),
    hardwareParts: z.array(pair).length(5),
    implementation: z.array(pair).length(5),
  }),
  pages: z.object(
    Object.fromEntries(pageKeys.map((k) => [k, page])) as Record<
      (typeof pageKeys)[number],
      typeof page
    >,
  ),
});
export const enquiryUpdate = z.object({
  status: z.enum(["new", "contacted", "qualified", "closed"]),
  notes: text(0, 10000),
  follow_up: z.union([z.literal(""), z.iso.date()]),
});
