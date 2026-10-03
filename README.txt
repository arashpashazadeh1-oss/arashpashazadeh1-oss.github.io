V13.5.5 — Dynamic About PDF

This restores a truly dynamic PDF workflow.

How it works:
- About page loads current Publications, Research, Projects, and Conferences from the website database.
- The old static PDF link is replaced by "Generate current PDF".
- When clicked, the page waits for the live About data to finish loading.
- It then opens the browser's native print/PDF dialog using the current live About content.
- Choose "Save as PDF" to save the current version.
- The filename/title is date-stamped automatically.

Files to upload to repository root:
- about.html
- about.js
- about-pdf.js

No CSS, Home slideshow, footer logo, flags, Library, Stripe, or Cloudflare changes are included.
