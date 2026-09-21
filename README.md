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
