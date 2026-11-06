# Fisheries360 product film

40-second edited product walkthrough, created 5 November 2026.

Timeline:
- 00:00–00:05: aquaculture aerial; connected aquaculture positioning.
- 00:05–00:10: proposed CageNode; configuration-dependent messaging.
- 00:10–00:15: sensor assembly; sensor/alert configuration.
- 00:15–00:22: monitoring interface illustration, labelled illustrative.
- 00:22–00:29: farm operations interface illustration, labelled illustrative.
- 00:29–00:36: business overview interface illustration, labelled illustrative.
- 00:36–00:40: brand, tagline and Request a Demo ending.

Editing:
- Owner-supplied generated aquaculture footage from the already reframed hero film; source Downloads files untouched.
- Original SVG interface compositions based on the website's sample values; not recordings from an operating farm.
- Scene fades, subtle presentation motion, consistent titles, warm gold accents and explicit conceptual/sample labels.
- Original synthesized ambient instrumental bed. No third-party recording, voiceover or licensed track is used.
- H.264/yuv420p with AAC stereo and MP4 faststart. Desktop 1280x720; mobile 854x480. 24fps; 40 seconds.
- English WebVTT captions and HTML transcript. Sound plays only after visitor initiation. Player uses preload=none, native controls, playsInline, and responsive mobile source selection.

Website:
Home hero 'Watch the product film' link leads to #product-film. The dedicated player appears between editorial introduction and product overview. Existing hero background loop remains separate and silent.

Verification:
- Both outputs fully decoded without FFmpeg errors.
- MP4 metadata and HTTP byte ranges covered by the integration tests; all 8 tests passed.
- Scene contact sheet plus full-size business and sensor frames visually inspected.
- Original ambient mix measured -29.1 dB mean and -20.8 dB peak; no clipping.
- Browser playback, listening review, caption positioning and phone tap testing remain unverified because browser access is disabled in Work settings.

Reproduction:
Run node scripts/make-product-film.mjs with sharp installed and FFmpeg at the authoring-tool path referenced by the script. The FFmpeg binary is not included in the source archive and is not needed by the deployed website. Captions are maintained separately at public/media/fisheries360-product-demo.vtt.

Deployed successfully to https://www.fisheries360.com/#product-film. Release /opt/fisheries360/releases/20261105-product-film. Homepage markup/latest JS verified HTTP 200. Desktop/mobile MP4 ranges returned 206 (3,425,088 and 1,724,034 bytes); captions/poster returned 200. Pre-switch backup succeeded; service active; all other-site Nginx checksums unchanged.


## Narrated edition — supersedes the 40-second audio-free edition

The film now runs 60 seconds, with synthetic Indian-English explanation using the Microsoft Edge Prabhat neural voice. Narration text is public product copy only. Timestamps: 00:00 introduction, 00:07 CageNode concept, 00:14 sensors/configuration, 00:22 monitoring, 00:33 farm operations, 00:44 business overview, 00:54 closing CTA. English captions and HTML transcript match the spoken script.

Most voice segments run at their generated pace; only the opening is adjusted by 0.3% and closing by 12.9% to fit. Original ambient bed is attenuated below narration. Final mix measured -19.4 dB mean, -3.9 dB peak; both video files decode fully without errors. New versioned media and caption URLs bypass old cached assets. No autoplay audio.

Build and all 8 integration tests pass. Actual listening review/browser playback remains unverified under current Work browser settings.

Reproduction: generate seven source MP3 segments using the narration script and voice named above, then run scripts/mix-product-narration.mjs against the original scene files and original ambient master in the authoring work folder. Those temporary authoring intermediates are not required by the live website.

Live narrated release /opt/fisheries360/releases/20261105-narrated-film verified: homepage 200 with voice-2 URLs and 60-second labels; desktop/mobile MP4s 206; captions 200 and final cue ends at 00:01:00. Database preserved and backup taken before switch.

