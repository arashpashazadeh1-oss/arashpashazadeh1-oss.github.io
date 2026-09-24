V9.3 PPTX Fix

Problem fixed:
- The browser PptxGenJS bundle exposes `PptxGenJS` globally.
- The previous code incorrectly checked `window.pptxgen`.
- The official browser bundle URL from the PptxGenJS documentation is now used.
- A fallback loader was added in case the library is not yet available when the button is clicked.

Replace only these files in GitHub:
1. admin.html
2. admin-cv.js

No Cloudflare, D1, Telegram, or ADMIN_SECRET changes are needed.

After GitHub deploy:
- Open admin.html
- Ctrl+Shift+R
- Unlock Admin
- CV & Portfolio
- Generate Long Portfolio
