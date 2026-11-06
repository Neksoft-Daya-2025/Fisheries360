# Fisheries360 hero film

The project owner's four generated clips are now edited into a 23-second silent background loop, shown on Home and CageNode. The originals were read from the supplied Downloads paths and were not modified.

## Edit and outputs

Sequence: aerial reservoir → monitoring node → sensor assembly → wider farm view.

Each source is approximately 9.96 seconds. The edit uses 6.5-second portions, 0.75-second cross-dissolves between scenes and a cyclic cross-dissolve back into the opening clip. The beginning/end of the output match adjacent points in the opening footage. Source visual marks are retained.

| Public asset | Dimensions | Duration | Size |
| --- | --- | --- | --- |
| `/media/fisheries360-hero.mp4` | 1280 × 720 | 23 seconds, 24 fps | 3,663,780 bytes |
| `/media/fisheries360-hero-mobile.mp4` | 854 × 480 | 23 seconds, 24 fps | 1,522,627 bytes |

Both outputs are H.264/yuv420p, contain no audio stream and use MP4 fast-start metadata. They live in `public/media/`; there is no dependency on the original Downloads files at runtime. FFmpeg was used only as temporary local authoring tooling, then uninstalled from the task's temporary tooling directory.

## Playback

`src/Visuals.tsx` selects the mobile output at widths up to 760px. The decorative film uses muted autoplay, looping and inline playback. The existing conceptual poster remains visible until playback starts and provides a no-JavaScript, reduced-motion and media-error fallback.

The pause/play control reflects actual player events. Playback pauses when the hero leaves the viewport or the document is hidden; returning to it resumes playback unless the visitor explicitly paused it. Reduced-motion users receive the still poster. The film remains labelled conceptual; it does not depict a verified production installation or sensor connection.

## Verification

- Both final files decoded fully without errors.
- MP4 `moov` metadata precedes `mdat` payload for progressive playback.
- Desktop and mobile routes support HTTP 206 byte ranges with correct content type and lengths.
- Browser verified the desktop source playing at 23-second duration, muted and loop enabled.
- Browser verified pause changes the actual player state and button label; resume plays again.
- Browser verified off-screen pausing.
- Browser at 390px selected and played the smaller mobile file, with no horizontal overflow.
- The full production build and all 8 integration tests passed.

OS-level reduced-motion emulation and hidden-document behaviour were source-reviewed, not separately exercised through browser emulation. Real-device iOS/Android testing and throttled-network testing remain outside this local verification.

## Owner-requested sparkle removal
Website video copies reframed with a 1120x630 top-left crop from the prior 1280x720 edit, then resized proportionally. This excludes the lower-right sparkle. Original Downloads clips are untouched. Both 23-second outputs fully decoded without errors. Reviewed six sampled frames in outputs/fisheries360-clean-film-review.jpg. Current sizes: desktop 4,033,788 bytes; mobile 1,929,373 bytes. Versioned video URLs avoid cached earlier clips. Prior source-mark-retained statement describes the earlier edit only.

