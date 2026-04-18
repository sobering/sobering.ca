# grooves.

A small website of my record collection, built from [Discogs](https://www.discogs.com/) API data.

Pure static HTML / CSS / JavaScript. No frameworks, no build step, no trackers, no cookies.

## Run it

Just open `index.html` in a browser. That's it.

```bash
xdg-open index.html   # linux
open index.html       # macOS
start index.html      # windows
```

Or if you'd rather serve it:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

- `index.html` — markup, inline SVG decoration (spinning vinyl, smoke, shag carpet)
- `styles.css` — the whole aesthetic: wood panels, neon accents, animations
- `app.js` — rendering, grouping, search, modal, tickers
- `data.js` — the collection as `window.DISCOGS_DATA` (generated from the JSON)
- `discogs-data.json` — source of truth: raw Discogs API response

## Regenerating `data.js`

If you update `discogs-data.json` (new records added, etc.), rebuild `data.js` with a one-liner:

```bash
printf 'window.DISCOGS_DATA = ' > data.js && cat discogs-data.json >> data.js && printf ';\n' >> data.js
```

## Features

- Grid of record cards, grouped alphabetically by artist, sorted oldest-to-newest within each group
- Live search across title / artist / label / catalog number (space-separated terms are AND-ed)
- Shuffle button — toss the whole stack into one random pile, then restack
- Click any record for a detail modal with label + catalog number, formats (gatefold, colored vinyl, etc.), genres, styles, and a "view on discogs" link
- Cards tilt randomly for that pinned-to-a-corkboard feel
- Hover a card: the vinyl slides out of the sleeve and spins
- Footer ticker scrolls through every artist in the collection

## Design notes

1970s basement (smoke, shag carpet, wood panels, warm orange) meets late-90s hobby web (neon magenta + cyan, VT323 terminal font, visitor counter, blinking cursors). Dark scheme, bright accents, SVG animation throughout.
