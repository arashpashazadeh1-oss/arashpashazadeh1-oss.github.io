V11.9 — Analytics setup

The website update works immediately for the visual changes. The private Analytics tab needs TWO Cloudflare steps.

1) D1
Cloudflare -> D1 -> arash-website-db -> Console
Paste the full contents of d1-v9-analytics.sql and Execute.

2) Worker
Cloudflare -> Workers & Pages -> arash-api -> Edit code
Replace the existing worker code with cloudflare-worker-v9-analytics.js
Deploy.

Test:
https://arash-api.arash-pashazadeh1.workers.dev/
The JSON should show:
"version":"v9-analytics"

Then visit a few public website pages and open:
admin.html -> Analytics

Privacy / IP behavior
---------------------
By default the Worker stores MASKED IP addresses:
IPv4 example: 203.0.113.47 -> 203.0.113.0
IPv6 is shortened.

It also stores an irreversible visitor hash for approximate unique-visitor counts.

If you explicitly want full raw IP storage:
Cloudflare Worker -> Settings -> Variables and Secrets
Add environment variable:
ANALYTICS_STORE_RAW_IP = true
Deploy again.

Raw IP addresses are personal data. If you enable them, consider adding an appropriate privacy notice and retention policy.

Optional:
You may add a secret ANALYTICS_SALT. If omitted, the existing ADMIN_SECRET is used as the visitor-hash salt.
