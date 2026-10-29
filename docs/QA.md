# BR-ICE verification

Verified locally in Chrome on 29 October 2026. This record covers the supplied build; it is not a claim of testing every browser or device.

## Browser checks

- Desktop: 1440 x 900. Tablet: 1024 x 768. Phone: 390 x 844. No horizontal document overflow at these sizes.
- Loader completes; hero uses a fully fetched blob URL. Forward scrubbing reaches the last frame and reverse scrubbing returns to the opening frame.
- All eight scrub scenes load: pint, sugar, and six flavours. Mobile selects the 720px files at page load.
- Hero ingredient labels remain inside the viewport at the tested tablet and phone widths. Switching across the responsive breakpoint rebuilds the hero layout.
- Sugar, milk, texture, six-flavour theatre, Moments, shop, and footer sections render with the supplied media. Milk counters and heading reveals finish correctly.
- Builder adds strawberry on first view, supports three scoops, disables additions at the limit, rotates with arrow keys, and exports a 1080 x 1350 PNG. The exported image was inspected.
- Bag additions and quantity controls work. JPY selection updates prices. Tab wraps within the modal; Escape closes it and returns focus to the trigger.
- Invalid newsletter input is identified. Valid input receives an explicit integration notice rather than a false subscription confirmation.
- Offscreen loops pause. Normal tested flows produce no JavaScript page errors.
- Reduced motion has no pins, Lenis, or scrub-blob requests. All six flavour end posters remain in normal document flow.
- Simulated unavailable WebGL displays fallback messages for both Three.js scenes.
- Final desktop screenshots were inspected after media loading and text animations settled.

## Media verification

`python scripts/verify-media.py` passed for all 19 processed videos: 16 scrub files and three loops. Verified H.264, silent audio tracks, faststart placement, expected widths, actual manifest dimensions, no B-frames in scrub files, and a maximum two-frame keyframe interval in scrub files.

Total contents of `media/`: **51.25 MB**, below the brief's 55 MB target. The archive also contains source code, documentation, prompts, and processing scripts.

## README presentation

The README includes two local animated GIFs captured from the running website (54 hero frames and 36 builder frames), a vector masthead, and static alternatives. All 31 documentation links/image references were checked. Its companion browser preview was checked at 1280px and 390px widths with no horizontal document overflow; expandable sections work. The GIFs loop independently of system reduced-motion preferences in Markdown viewers. README assets are separate from the 51.25 MB website media total.

## Scope and remaining launch connections

Checkout and newsletter are explicit integration points. No payment processor or mailing service is connected. Prices, nutrition claims, and city captions are template content to replace with verified seller information.

The supplied footage limits exact visual conformity; see `MEDIA-REPORT.md`. Runtime libraries and fonts are loaded from their specified CDNs, so the preview needs internet access. Testing covered Chrome and the simulated conditions above; Safari, Firefox, and physical-device testing were not performed.
