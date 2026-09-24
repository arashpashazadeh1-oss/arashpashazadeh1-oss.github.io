V11.6 — About page rebuilt as a CV sheet

Main changes
------------
- Recommendations removed completely from About and from CV Builder outputs.
- Admissions / academic-record section removed from the About/CV Builder content.
- About page redesigned to look like a typed CV sheet, not a website-card layout.
- About body uses a clean 12 pt CV format on a white A4-like sheet.
- Nationality and marital status remain excluded.
- Static CV-file content remains: education, detailed professional experience,
  research/work interests, technical skills, languages, honors, memberships, and certificate.
- Publications on About are NOT a separate hard-coded list anymore.
  They are read directly from the same /publications database used by publications.html,
  so every publication currently shown on the Publications page is listed in About automatically.
- The bottom of About automatically syncs current Research, Projects/Studies,
  and Conferences/Workshops from the same website database.
- Therefore future edits through Admin automatically update the bottom of About,
  while the main CV-derived text remains stable.

Files to upload/replace
-----------------------
about.html
about.js
styles.css
admin.html
admin-cv-v95.js

No Cloudflare Worker, D1, Telegram, or ADMIN_SECRET changes are required.
