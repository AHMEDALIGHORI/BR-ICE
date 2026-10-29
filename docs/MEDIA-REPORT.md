# Supplied media report

All final website imagery and video use the assets supplied by the user. No additional image or video generation was performed for the completed build.

## Processing

The eleven source films are 1280 x 720, 24 fps, approximately eight seconds each. Eight are exported in desktop and mobile variants for scroll scrubbing; three are used as loops. The pipeline creates posters, shop images, a share image, and sampled background colours. The supplied seven Moments photographs and pasture photograph are integrated.

Four pixels are trimmed from each video edge to remove thin dark source borders. After scaling, desktop videos measure 1280 x 716 and mobile scrub videos measure 720 x 404; actual dimensions are recorded in `media/manifest.json`. The specified mark-removal region is scaled to the source resolution. Originals in `assets/` are preserved.

## Differences inherited from the supplied assets

- Sources are 720p, whereas the original generation brief requested 1080p. Processing cannot recover missing original detail.
- Strawberry, mango, and pistachio films contain changing background colours, including blue areas near the bottom of some opening frames. Final-frame stage colours and soft edge masks reduce the visible transition, but these films cannot produce a perfectly flat, constant backdrop throughout.
- Some supplied camera motion, ingredient positions, and lighting differ from the generation brief. Ingredient labels are aligned to the supplied hero's end composition.
- The supplied Tokyo photo is landscape and is cropped into its gallery presentation. The picnic photo fills the London slot; city captions are illustrative rather than verified locations.

For closer source-level conformity, replace the affected assets with renders matching `ASSET_PROMPTS.md`, update the filename-prefix mappings, and rerun the included pipeline. No regeneration is necessary to run the current website.
