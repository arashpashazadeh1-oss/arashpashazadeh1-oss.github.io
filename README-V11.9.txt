V11.9 — Conference header, CV portrait, Contact order, Analytics

Website changes
---------------
- Conference page header: Conferences / Events / Activities
- Conference lead text now includes engineering projects.
- Existing square conference cards and event photos are retained.
- About/CV page uses the uploaded portrait at the upper-right in a 3:4 ratio.
- The redundant Professional Profile introduction is removed from About.
- Contact order:
  1. Google Scholar
  2. ResearchGate
  3. LinkedIn
  4. Web of Science
  5. ORCID
  6. University Email
  7. Professional Email
  8. Instagram
  9. Telegram Channel

Important profile-link note
---------------------------
An exact ORCID iD and exact Web of Science researcher profile URL could not be reliably verified from public search.
The two cards therefore use name-search pages instead of inventing an identifier.
Replace them later with the exact profile URLs when available.

Private analytics
-----------------
- New Admin -> Analytics tab.
- Page views.
- Approximate unique visitors.
- Country / region / city.
- Top countries.
- Top pages.
- Referrer.
- User agent.
- IP display.
- Default IP storage is MASKED, not raw.
- Exact raw IP can be enabled explicitly with ANALYTICS_STORE_RAW_IP=true.

Cloudflare setup files are in /cloudflare-analytics.
