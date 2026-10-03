(() => {
  "use strict";

  const button = document.getElementById("about-dynamic-pdf");
  if (!button) return;

  const originalLabel = button.textContent;
  let printing = false;

  function waitForAboutData(timeout = 12000) {
    if (document.documentElement.dataset.aboutReady === "true") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let finished = false;

      const done = () => {
        if (finished) return;
        finished = true;
        window.removeEventListener("about-data-ready", done);
        resolve();
      };

      window.addEventListener("about-data-ready", done, { once: true });
      setTimeout(done, timeout);
    });
  }

  async function generateCurrentPdf() {
    if (printing) return;
    printing = true;
    button.disabled = true;
    button.textContent = "Updating current About…";

    await waitForAboutData();

    button.textContent = "Preparing PDF…";

    const oldTitle = document.title;
    const current = new Date();
    const stamp = [
      current.getFullYear(),
      String(current.getMonth() + 1).padStart(2, "0"),
      String(current.getDate()).padStart(2, "0")
    ].join("-");

    document.title = `Arash-Pashazadeh-About-CV-${stamp}`;

    // Do not print the generator button itself.
    const paperFooter = button.closest(".cv-paper-footer");
    const oldDisplay = paperFooter ? paperFooter.style.display : "";
    if (paperFooter) paperFooter.style.display = "none";

    const cleanup = () => {
      if (paperFooter) paperFooter.style.display = oldDisplay;
      document.title = oldTitle;
      button.disabled = false;
      button.textContent = originalLabel;
      printing = false;
      window.removeEventListener("afterprint", cleanup);
    };

    window.addEventListener("afterprint", cleanup, { once: true });

    // Let the browser apply print CSS before opening the native PDF dialog.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        // Some browsers do not fire afterprint reliably.
        setTimeout(() => {
          if (printing) cleanup();
        }, 1500);
      });
    });
  }

  button.addEventListener("click", generateCurrentPdf);
})();