

## V9 CV & Portfolio Builder

This version adds a private CV and portfolio generator:

- `cv-builder.html`
- `cv-builder.js`

Outputs:

1. Academic CV — Word `.docx` + PDF `.pdf`
2. Engineering CV — Word `.docx` + PDF `.pdf`
3. Europass-style CV — Word `.docx` + PDF `.pdf`
4. Long portfolio — PowerPoint `.pptx` + 16:9 landscape PDF `.pdf`

The long portfolio uses the current Projects and Gallery system:

- 16:9 PowerPoint size
- one slide/page per project
- project title and description at the top
- default text size 12 pt
- 3 or 4 images per project
- images are pulled from the private Telegram media gallery through the Cloudflare Worker

No Cloudflare Worker or D1 migration is required for V9 if V8 Free is already working.
