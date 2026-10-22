# TEST_RESULTS - invitation-maker-bd

Date: 2026-10-18. All tests run for real; nothing fabricated.

## Unit tests - 63/63 passed

`node tests/unit.test.js` (pure logic, no DOM):

- Templates: 5 templates with expected ids/order; wedding defaults to gold style; unknown template/style fall back safely.
- Styles: 4 styles with expected ids.
- Validation: valid invitation passes; missing hosts/title/venue rejected; invalid dates (2026-02-30, DD/MM/YYYY) rejected; bad time (25:00) rejected; empty time allowed; over-length title/message/dress/rsvp rejected; unknown template/style rejected; empty optional honoree allowed; null input rejected.
- Date/time: EN + BN formatting (EN "18 December 2026" / BN same date in Bengali digits + Bengali month name), leap date 2024-02-29, 12-hour AM/PM + BN markers (Bengali for AM/PM), Bengali digit conversion.
- Escaping: `<script>`, `&`, quotes, `<b>` in user input are HTML-escaped in card HTML; no raw `<script>` in output.
- Card text: contains title/hosts/date/time/venue/message; omits empty optional fields (honoree, dress, RSVP, time); BN template name renders.
- Export/import: round-trip preserves drafts; rejects bad JSON, wrong app, wrong version, non-array drafts, invalid draft fields, missing draft id; imported XSS draft still renders escaped.
- Draft ids: 50 generated ids all unique.

## Browser smoke tests - 81/81 passed

`node tests/smoke.mjs` (headless Chromium via puppeteer-core, file:// URL, desktop 1280px + mobile 390px):

- Renders title, Bangla toggle button, check-details note; 5 template options, 4 style options; empty-preview + no-drafts states.
- Full end-to-end: fill a birthday invitation (hosts, honoree, title, date, time, venue, dress, RSVP, message) -> preview contains exactly those inputs (date "20 November 2026", time "6:00 PM"), festive class applied; style switch to minimal changes class.
- Drafts: save -> list shows draft -> reload persists -> load restores title.
- Export contains app marker + draft; import adds a second draft; bad import rejected with flash, count unchanged.
- Validation: empty required fields block save, errors shown, count unchanged.
- BN toggle: title switches to Bangla, preview shows Bengali-digit date and time; toggle back to EN.
- Erase: wrong word keeps drafts; typed DELETE clears all.
- XSS: hostile `<img onerror>` input produces no injected `<img>`, text is escaped.
- 0 console errors, 0 page errors, 0 network requests in both viewports; no horizontal overflow at 390px.

## Repairs

None - first run green for both suites. Only a hygiene pass: non-ASCII characters (Bengali literals, em-dashes) converted to `\uXXXX` escapes / hyphens; sources verified pure-ASCII (`grep -P '[^\x00-\x7F]'` = 0 matches); tests re-run green after.

## Hand verification

One full invitation end-to-end (covered by the smoke suite and reviewed): inputs -> preview contains exactly those inputs -> draft save/load round-trip -> print view is the card alone (print CSS hides app chrome; verified by inspecting the `@media print` rules - actual paper output depends on browser print settings).

## Limitations

- Live print output not verified on paper (browser print settings vary).
- Drafts are per-browser localStorage; no sync.
- Gregorian calendar only; no image upload.

## Re-verification 2026-10-22 (factory run #108, 11:00 slot - orphan adoption)

Build directory (dated 2026-10-18) existed in builds/ with NO ledger row and NO
GitHub repo (search "user:fahad3235 formal-letter invitation palette-studio" = 0
repos). Re-ran the full suite from scratch this slot: 63/63 unit + 81/81
headless-Chrome smoke (desktop 1280px + mobile 390px), 0 console/page errors,
0 repairs. Pure-ASCII app sources verified (Bengali as \uXXXX escapes in JS,
numeric entities in HTML; grep -P zero non-ASCII matches; TEST_RESULTS.md
em-dashes normalised to ASCII). README.md already pure ASCII. Nothing rebuilt -
the project is recorded ONCE ("built exactly once, ever").
