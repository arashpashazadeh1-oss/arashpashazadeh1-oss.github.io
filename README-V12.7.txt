V12.7 — Home samples now use the exact page components

This fixes the issue where Home used newly designed sample cards.

Home now reuses the EXACT SAME component functions and CSS structures as the source pages:

Projects
- Same createProjectCard() component used on projects.html
- Same data-card-grid container
- Same photo behavior, title, summary, chips, status, and View project link

Conferences / Events / Activities
- Same createConferenceCompactRow() component used on conferences.html
- Same conference-compact-list container
- Same event photo/gallery fallback
- Same Event / Year / Location structure

Research
- Same createProjectRow() component used on research.html
- Same project-list container
- Same category, title, summary, methods, and period structure

Publications
- Same createPublicationCard() component used on publications.html
- Same publication-list container
- Same year, title, authors, journal/status, abstract, DOI/PDF/Cite controls

Only three entries from each category are shown on Home.
No new alternative card design is used.

Files changed:
- index.html
- home-minimal.js
- styles.css

No Cloudflare, D1, Analytics, Worker, Telegram, or Admin changes are required.
