# liquidglass (vendored)

- Source: https://github.com/ybouane/liquidglass, npm `@ybouane/liquidglass` v1.0.3, License: MIT
- File: `index.js` is the package's `dist/index.js` (one self-contained esbuild bundle) minus the
  trailing `sourceMappingURL` comment. `index.d.ts` is a hand-written, trimmed type declaration.
- Why vendored instead of `npm install`: the package declares `"postinstall": "patch-package"` without
  shipping patch-package, so installing it fails (locally and on Vercel).

## Local patch

`index.js` line ~1868 (`LiquidGlass._start`): the call `await this.capture.prefetchFontEmbedCSS()` is commented out.
It base64-embeds every page web font for html-to-image captures of glass *content*. We keep glass elements
empty (content lives in a separate layer), and the step requested all font files from `/media/...` (404) on
each page load. Re-apply this change when updating the vendored file.

Second patch: `capDpr()` / `MAX_DPR` near `getPixelRatio` - every `window.devicePixelRatio` read goes through it
(max 1.5 on touch devices, 2 elsewhere). Re-apply when updating the vendored file.
