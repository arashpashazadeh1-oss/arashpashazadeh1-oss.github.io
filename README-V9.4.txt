V9.4 — CACHE-BUST PPTX FIX

Why this version exists
-----------------------
The exact error "PowerPoint export library did not load." belongs to the OLD V9.2 JavaScript.
V9.3 no longer contains that error text.

So if you still saw that exact message after uploading V9.3, the browser/GitHub Pages was still
serving the cached old admin-cv.js.

V9.4 forces a fresh download by:
- renaming admin-cv.js -> admin-cv-v94.js
- referencing admin-cv-v94.js?v=9.4 from admin.html
- showing "Generator engine: V9.4" visibly in the CV & Portfolio tab

Replace/upload ONLY:
- admin.html
- admin-cv-v94.js

After GitHub deploy:
1. Wait 1–2 minutes.
2. Open admin.html.
3. Ctrl+Shift+R.
4. Unlock Admin.
5. Open CV & Portfolio.
6. Confirm you see "Generator engine: V9.4".
7. Try Generate Long Portfolio again.

If an error still appears, send the NEW exact red error text.
