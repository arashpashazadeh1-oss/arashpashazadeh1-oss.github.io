V13 — FOUR-LANGUAGE WEBSITE + LIBRARY

LANGUAGES
- English: root pages, e.g. /index.html
- Persian: /fa/
- Spanish: /es/
- German: /de/
- Language switcher is present on all public pages: EN · FA · ES · DE
- Persian pages use true RTL layout; English, Spanish, and German use LTR.
- hreflang/canonical metadata and sitemap entries are included.

STATIC CONTENT
Home, Research, Projects, Publications, Conferences, Insights, About/CV,
Contact, Library, and detail-page interface text have localized versions.

DATABASE-DRIVEN CONTENT
English remains the base D1 record. Projects/Research, Conferences,
Publications, and Library items may have optional Persian, Spanish, and German
overlays stored in content_translations.

Admin -> Translations lets you choose an item and save FA / ES / DE text.
If a translation is blank, the localized site intentionally falls back to English.
Publication titles can remain in their original published language.

LIBRARY
Public pages:
- library.html
- library-item.html?id=...
- localized versions in fa/, es/, de/

Admin -> Library supports:
- Title
- Author / creator
- Book or Design notebook
- Year
- Price and currency
- Summary and full description
- Featured / published status
- Public preview URL
- Secure checkout / purchase URL
- Cover and gallery images through the existing Telegram media system

PAYMENT / FILE DELIVERY
V13 deliberately does NOT expose a paid PDF from GitHub Pages.
For a paid item, paste a secure checkout/product URL into Admin -> Library.
Examples include Stripe Payment Links, Gumroad, Payhip, or another provider.
Configure the purchased digital-file delivery in that payment provider.

A fully automatic "verified payment -> private download token" flow requires
choosing a payment provider and adding that provider's webhook/secret. That is
not included because no payment-provider account/credentials were supplied.

DEPLOYMENT ORDER
1. Run the V13 D1 migration from the Cloudflare backend package.
2. Deploy the V13 Worker code.
3. Upload this full GitHub site.

Do not delete the existing Worker secrets or D1 binding.
