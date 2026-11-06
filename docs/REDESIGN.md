# Fisheries360 visual redesign

The redesign uses a cinematic aquaculture setting, ocean navy surfaces, seafoam accents, larger editorial typography, a clear two-layer product introduction, an interactive hardware drawing, a pond-layout interface and a dark dashboard demonstration. The styling is scoped to public pages; owner/editor access and enquiry storage remain independent of the visual theme.

## Hero film

The owner-supplied scene clips have now been edited into a 23-second loop. Desktop and smaller mobile MP4s are active through `src/Visuals.tsx`, with an accessible pause/play control. The conceptual poster remains as loading, no-JavaScript, reduced-motion and media-error fallback. See `VIDEO.md` for source order, sizes and actual verification.

To replace the footage later, optimise both variants, update the public assets/paths and rebuild. Keep the conceptual label and recheck mobile crop, looping and accessibility.

## Concept poster provenance

Generated using the built-in image-generation tool, not an external API runner. The final optimised assets are:

- `public/images/cagenode-hero-v2.webp` — 1800-pixel-wide hero poster.
- `public/images/cagenode-hero-v2-small.webp` — 900-pixel-wide responsive variant.

The original generated PNG remains in the session's `.codex/generated_images/01a1a592-ab2c-7d03-bc8c-ccc509c82578/` directory. The project uses its own copied/optimised assets and does not depend on that external directory.

### Generation prompt

Use case: product-mockup. Asset type: premium aquaculture technology website hero background, wide landscape 16:9. Create an exceptionally polished photorealistic industrial design concept scene. A proposed compact aquaculture IoT node on the RIGHT HALF of the composition, installed on a dark marine cage railing just above textured deep teal water, a brushed light silver rectangular enclosure with four rounded corner screws, a small dark-blue solar panel angled on top, one thin black upright antenna to its right, black cable leading down to a steel cylindrical sensor probe hanging near water, subtle cyan status indicator, NO text or branding on the device. Background circular fish cages on a vast tranquil reservoir with misty forested mountains at early blue hour. Rich petrol navy, deep teal water, soft warm sliver of horizon light, realistic micro textures, elegant silver edge lighting. Device must feel like an engineered aquaculture instrument, not a sci-fi robot. Left HALF must be mostly very dark navy water and atmospheric shadow with very little detail, generous clear negative space for website headline. Editorial luxury technology campaign photography, cinematic lens, sharp product and softly atmospheric landscape. Full bleed environment, not a collage, not a screenshot, no labels or UI or typography, no people, no certification or specification markings. This will be labelled conceptual imagery, not a real production product photograph.

The website explicitly identifies it as a conceptual visualization and proposed hardware configuration. The original contextual CC0 aquaculture photograph remains available and credited separately.

## Content preservation

The one-time `visual-direction-v2` migration only replaces the former default hero images for Home and CageNode. It saves prior content revisions and preserves custom owner images and text. Future restarts do not repeat the migration. The new poster's source/usage information appears in the image library. No accounts or enquiries are seeded.
