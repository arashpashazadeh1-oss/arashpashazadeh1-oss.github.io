# Arash Pashazadeh — Civil Engineering & Academic Website

This version includes a live Telegram feed connected to:

`https://arash-api.arash-pashazadeh1.workers.dev/posts`

## Upload to GitHub Pages

Replace/upload the following files in the repository root:

- `index.html`
- `styles.css`
- `script.js`
- `robots.txt`
- `sitemap.xml`
- `assets/favicon.svg`

The repository should look like:

```text
username.github.io/
├── index.html
├── styles.css
├── script.js
├── robots.txt
├── sitemap.xml
└── assets/
    └── favicon.svg
```

## Live Telegram feed

The **Civil Engineering Insights** section fetches the latest posts from the Cloudflare Worker API.

New Telegram posts appear automatically without redeploying the GitHub site.

The feed:
- shows all stored Telegram posts
- links to each original Telegram post
- refreshes automatically every 60 seconds while the page is open
- includes a manual Refresh button
- safely renders post text using `textContent`


## Important Cloudflare Worker change

To display every Telegram post, the Worker `/posts` query must also return every row.
Remove `LIMIT 50` from the SQL query in `worker.js`.

A ready-to-paste Worker file is included as:
`cloudflare-worker-all-posts.js`


## V5 rich Telegram feed

This version adds:

- Telegram photo previews for NEW posts
- thumbnails for video/animation/document posts when Telegram supplies one
- automatic post titles
- hashtag chips
- automatic category inference
- optional hiding of very short test-only posts
- `Show all posts` toggle so nothing is lost
- all posts remain stored in D1
- no API `LIMIT`

### One-time D1 update

Run the contents of:

`d1-media-migration.sql`

once in:

Cloudflare → D1 SQLite Database → arash-website-db → Console

### Worker update

Replace the current Cloudflare `worker.js` with:

`cloudflare-worker-rich-telegram.js`

and Deploy.

### Important

Existing older Telegram posts that were saved before media capture was added do not automatically gain old images.
New photo/media posts will have previews. Existing text remains unchanged.


## Final public URL / SEO update

Canonical website URL:

`https://arashpashazadeh1-oss.github.io/`

Updated:
- `index.html` canonical URL
- Open Graph URL
- Schema.org / JSON-LD URL
- `sitemap.xml`
- `robots.txt`

Cloudflare Worker and Telegram settings do not need any change for this URL update.
