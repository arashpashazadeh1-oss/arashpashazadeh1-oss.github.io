V9.2 - Admin Integrated CV & Portfolio Builder

What changed
------------
- CV Builder is now inside admin.html as a fourth Admin tab.
- There is NO second Unlock screen.
- It uses the already-unlocked Admin panel.
- Three CV generators remain available:
  1) Academic CV (Word + PDF)
  2) Engineering CV (Word + PDF)
  3) Europass-style CV (Word + PDF)
- Long Portfolio remains available as PowerPoint-size 16:9 PPTX + PDF.
- Portfolio can include 3 or 4 project images.
- Project title + description are placed above images.
- Default portfolio description font is 12 pt.
- Conference / workshop pages can also be included in the long portfolio.
- Gallery WebP images are converted in the browser to JPEG before PPTX/PDF export for better compatibility.

Install
-------
Replace these files in the GitHub repository:
- admin.html
- admin-cv.js
- styles.css
- admin.js

No Cloudflare Worker, D1, Telegram, or ADMIN_SECRET changes are required.

After GitHub deploy:
1. Open https://arashpashazadeh1-oss.github.io/admin.html
2. Ctrl+Shift+R
3. Unlock Admin once using the existing ADMIN_SECRET
4. Click the new "CV & Portfolio" tab
