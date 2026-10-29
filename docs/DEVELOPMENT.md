# BR-ICE

A buildless, animated ice-cream storefront template. Source lives in `D:\BR-ICE`.

## Run

From this folder:

```sh
npx serve .
```

Or use the included Node-only preview server:

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173` for the included server. Do not open `index.html` with `file://`: video fetches and ES-module imports need HTTP. No build or installation is required to run the site. Internet access is needed for the specified CDN libraries and Google Fonts.

## Edit the brand

- `index.html`: brand wording, section copy, nutrition claims, chapter headings, newsletter, and footer. All lettering is HTML. No brand text is baked into the supplied films.
- `css/style.css`: all brand tokens are at the top. Typography uses Bricolage Grotesque, Instrument Serif italic, and DM Sans.
- `js/main.js`: `FLAVOURS` is the single source for product names, origins, colours, scoop colours, nutrition, notes, and facts. It generates the theatre, shop, and builder chips. `PRICES` holds the fixed, editable per-pint prices for USD, EUR, GBP, INR, and JPY. These are illustrative prices, not live exchange rates.
- `js/three-scenes.js`: deterministic instanced sprinkle burst and the procedural waffle cone/scoops, textures, lighting, drag/keyboard controls, and 1080 x 1350 PNG export.
- `media/manifest.json`: sampled colours and actual processed video metadata. For the three supplied clips with changing backgrounds, the stage uses the final-frame sampled colour. First-frame bottom-left samples are preserved in the manifest.

The stack is GSAP 3.13.0 with ScrollTrigger/SplitText, Lenis 1.1.13, and Three.js 0.170.0 via an import map. No framework or other browser libraries.

## Asset pipeline

Keep original downloads in `assets/`. They are not included in the distributable template archive. `docs/ASSET_PROMPTS.md` contains the generation prompts, and `docs/ORIGINAL-BRIEF.txt` preserves the supplied brief.

Install FFmpeg/ffprobe and run in Bash (Git Bash on Windows):

```sh
bash scripts/process.sh
python scripts/process-images.py
python scripts/verify-media.py
```

`process-images.py` needs Pillow. The two video scripts use FFmpeg/ffprobe; set `FFMPEG` and `FFPROBE` if they are not on PATH. The local development copies under `work/tools/` are detected automatically but are not shipped.

`SRC` at the top of `process.sh` maps stable media names to supplied filename prefixes. Update it when replacing films. The source must resolve to exactly one file per prefix. Update the photo-prefix mapping in `process-images.py` when replacing photography.

The pipeline removes the specified sparkle-mark box, scaled from 1920 x 1080 to the input resolution. It trims four border pixels from each edge to remove the thin dark borders in the supplied renders. Set `DELOGO=0` for clean future footage that does not need that box processed. Raw files are never changed.

Scrub outputs: 1280px/CRF 25 and 720px/CRF 27, H.264, silent, faststart, `keyint=2:min-keyint=1:scenecut=0:bframes=0`. To meet the size target without changing keyframe density, constrained CRF uses 4 Mbps/8 Mb buffer on desktop and 1.5 Mbps/3 Mb buffer on mobile. Loops: 1280px/CRF 26. First/end posters, square shop WebPs, share image, and bottom-left 40px background samples are also generated. The pipeline prints total media size. See `docs/QA.md` for the verified build size and checks.

## Behaviour

- The loader waits for fonts and the pint clip, with a five-second maximum. The pint fetches completely before playback through a blob URL. Sugar and flavour clips then load sequentially in story order.
- Near-viewport clips seek on the GSAP ticker with 0.2 interpolation and an 8ms movement threshold. Mobile clips are selected at page load at 760px and below; reload after switching device classes during testing.
- Hero ingredient coordinates are normalised to the film and mapped through its displayed cover bounds. For replacement films, update the three `data-x`/`data-y` coordinates and the closed-pint x bounds in `initHero`. Tags appear once the film reaches the end composition.
- The theatre wipes between six layers and scrubs each clip. Its bottom rail also selects flavours.
- The builder accepts up to three scoops, starts with strawberry on first view, supports horizontal drag and arrow keys, and exports an image locally.
- The bag uses `localStorage` for this browser; no account or server is required. A native modal dialog plus explicit tab handling provides focus trapping, Escape close, and focus restoration.
- Loops pause offscreen and on hidden tabs. Three.js only renders while the canvas is visible (the builder redraws on changes/animation).
- Reduced motion uses end posters, no smooth scrolling/pins/scrubs, all flavour layers in document flow, and a manually scrollable Moments gallery.

## Before selling or launching

This is a template, not a connected commerce service. The checkout and newsletter explicitly disclose that they need integrations; neither collects payment nor sends email. Replace the checkout button handler with your store checkout integration and the newsletter submit handler with your mailing-service endpoint. Do not place secret keys in browser code.

Replace illustrative prices, kcal values, product specifications, ingredient/nutrition claims, shipping promises, and city captions with verified brand information. The supplied picnic image fills the brief's London gallery slot; it is an illustrative caption, not verified geolocation. Add the seller's own policies and backend integrations as needed.

## Packaging

Ship `index.html`, `css/`, `js/`, `media/`, `scripts/`, `docs/`, and this README. Exclude `assets/`, `work/`, `.playwright-cli/`, local tool dependencies, and test state. The delivered ZIP follows this layout.
