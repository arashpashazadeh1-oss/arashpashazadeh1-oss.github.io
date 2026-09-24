V11.5 — Conference image/cache fix

Why the screenshot showed no images:
- conferences.html was already the new 4-column version.
- the browser/GitHub Pages was still serving cached older script.js and styles.css.
- That produced exactly the mixed layout in the screenshot: the new 4-column header with old 3-column rows.

Fixes:
1. conferences.html now cache-busts both files:
   styles.css?v=11.5
   script.js?v=11.5
2. Conference thumbnails no longer depend only on cover_media_id.
   If the conference API does not return a cover id, the page fetches that conference's gallery
   and displays the cover image, or otherwise the first uploaded event photo.
3. Event / Year / Location remain compact, and the full description stays on the detail page.

Upload/replace only:
- conferences.html
- script.js
- styles.css

After GitHub deploy:
- wait 1–2 minutes
- open Conferences
- Ctrl+Shift+R once
