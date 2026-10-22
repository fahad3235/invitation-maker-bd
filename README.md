# Invitation Maker BD

Offline bilingual (EN / Bangla) event invitation card maker. Design invitation cards from your own details - no account, no network, nothing leaves your browser.

## Features

- **5 templates:** Wedding, Birthday, Eid / Mehfil Gathering, Graduation, Business / Office Event
- **4 pure-CSS card styles:** Classic Gold, Floral, Minimal, Festive - no images needed
- **Live preview** that updates as you type
- **Fields:** hosts, guest of honour (optional), event title, date + time, venue, dress code (optional), RSVP contact (optional), custom message
- **BN / EN toggle** persisted, with Bengali digits for dates and times
- **Copy as text** - plain-text version of the card for WhatsApp / SMS
- **Print CSS** - the card prints cleanly without app chrome (browser Print / Save as PDF)
- **Drafts** saved in localStorage: list, load, delete
- **JSON export / strict import** for backups
- **Typed-DELETE erase-all** (type `DELETE` to confirm)
- **Input validation** + empty states; 390px mobile layout; zero network requests

## Honesty

The card is assembled ONLY from what you type. There are no fake venue/date defaults - fields stay empty until you fill them. A "check details before sending" note is shown above the form. The app never invents details.

## Stack

Vanilla HTML / CSS / JavaScript. No build step, no dependencies. Logic in `js/logic.js` (shared by the app and the Node tests); DOM wiring in `js/app.js`.

## Run

Open `index.html` in any modern browser, or serve the folder:

```sh
python3 -m http.server 8000
# open http://localhost:8000/
```

## Testing

```sh
node tests/unit.test.js   # pure-logic tests
node tests/smoke.mjs      # headless-Chrome browser tests (desktop + 390px mobile)
```

See `TEST_RESULTS.md` for the recorded results.

## Limitations

- Drafts live in one browser's localStorage - no cloud sync, no sharing link.
- Print output depends on the browser's print settings (margins, background graphics).
- Dates use the Gregorian calendar only.
- No image upload or photo backgrounds (pure CSS styles by design).

## Status

Complete, tested, offline-ready.
