V11.9.1 — About portrait path fix

Why this fixes the broken image:
- The About page now uses the established existing profile filename:
  assets/profile/arash-pashazadeh.jpg
- The uploaded portrait is saved under that exact filename.
- A cache-busting query (?v=11.9.1) is added to the image URL.

Upload/replace:
1. about.html
2. assets/profile/arash-pashazadeh.jpg

Then commit, wait 1–2 minutes, and refresh About with Ctrl+Shift+R.
