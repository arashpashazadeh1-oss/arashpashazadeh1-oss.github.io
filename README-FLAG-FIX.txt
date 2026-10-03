V13.3.3 cross-browser flag fix

Why: Windows/Chrome often does not render Unicode country-flag emoji.
Fix: all four flags are now drawn with CSS, so no emoji support is required.

EN = United States
FA = Iran tricolor without center emblem
ES = Spain
DE = Germany

Upload/replace only script.js and styles.css in the repository root.
Then use Ctrl+F5.
