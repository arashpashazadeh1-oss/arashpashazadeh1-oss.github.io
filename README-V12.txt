V12 — FINAL CORRECTED DEPLOYMENT

Fixes compared with V11.9 / V11.9.1
------------------------------------
1. Conference page:
   Actual H1 is now:
   Conferences / Events / Activities

   Lead text is:
   A growing record of conference presentations, engineering projects, posters, workshops,
   research dissemination, and academic activities connected to my civil, coastal, hydraulic,
   and systems-engineering work:

2. About photo:
   The uploaded portrait is embedded directly inside about.html as a Base64 JPEG.
   It no longer depends on a GitHub image path, filename, folder, or browser cache.
   This fixes the broken-image problem permanently.
   Display ratio remains 3:4 at the upper-right of the CV.

3. Analytics:
   Admin -> Analytics UI is included in the GitHub site.
   Public page tracking is included in script.js.
   The Cloudflare Worker and D1 SQL needed to make it work are included in the separate
   CLOUDFLARE-ANALYTICS package / deployment bundle.

Important:
GitHub cannot activate the Analytics backend by itself.
You must run the D1 SQL and deploy the analytics Worker once.
