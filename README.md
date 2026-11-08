# STILL

A camera-facing clock for filming a physical phone. Set an arbitrary local calendar date and time to the second, then press Start. The device clock is never modified.

## Use

Open `index.html` in Chrome or Samsung Internet. Set date/time, choose a layout and color, then Start. The interface disappears completely; tap once to reveal controls. Pause keeps the precise position. Reset returns to the entered date/time. Optional 3- or 5-second preparation countdown does not advance the clock until it ends.

Three compositions (Stack, Line, Split), four colorways (Chalk, Ink, Cobalt, Cherry), optional seconds/date/caption. Landscape reflows automatically. Fullscreen and screen wake lock depend on browser support and permissions. If unsupported, a visible fallback is offered. No camera access is needed.

## Privacy and limits

No accounts, ads, analytics, third-party runtime requests or uploads. Settings are saved in this browser's local storage. GitHub Pages may process ordinary hosting access logs. The clock is intended as a creative prop, not evidence of the real time. It is not a precision timekeeping instrument. Browser/device sleep policies can interrupt fullscreen or wake locks. Physical Samsung device and camera capture have not been tested.

## Development

```
npm ci
node build.cjs
node --test test/engine.test.cjs
npx playwright test
```

The build embeds fonts and the clock engine into a standalone HTML file. Test Chromium executable is configurable with `CHROME_PATH`. The HTML also works offline after downloading; fullscreen may be limited by file viewers, so open in a full browser.

Code: MIT. Embedded Barlow Condensed and DM Sans fonts: SIL Open Font License, license texts in `assets/`.
