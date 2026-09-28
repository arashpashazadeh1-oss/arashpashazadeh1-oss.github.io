V12.3 — PDF CV 404 fix

Reason for the 404:
The About page linked to:
assets/cv/Arash_Pashazadeh_CV_2025.pdf

That file existed in the full package, but if only an update ZIP was uploaded,
the PDF itself may not have been uploaded to GitHub.

This fix makes it simpler and more reliable:
- The PDF is placed at repository root as:
  Arash-Pashazadeh-CV.pdf
- about.html now links directly to that root PDF.

Upload/replace:
1. about.html
2. Arash-Pashazadeh-CV.pdf

Then Commit, wait 1–2 minutes, and refresh About.
