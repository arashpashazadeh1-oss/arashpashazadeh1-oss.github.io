V13.1 — Secure paid Library checkout

Changes:
- Stripe Checkout is created server-side by the Cloudflare Worker.
- Admin can upload one protected paid PDF per Library item to the existing private Telegram media channel.
- Paid PDFs are never placed in public GitHub.
- After Stripe verifies payment, the Library item page exposes a protected download endpoint.
- Each purchase is limited to 5 downloads.
- Library item content remains in English; only the interface is localized.

Required backend migration and Worker are packaged separately.
