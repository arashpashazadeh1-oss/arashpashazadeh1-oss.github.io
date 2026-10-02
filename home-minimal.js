(() => {
  "use strict";

  function renderThree(container, items, builder, emptyKey) {
    if (!container) return;
    clear(container);
    const rows = items.slice(0, 3);
    if (!rows.length) {
      showError(container, t(emptyKey));
      return;
    }
    rows.forEach((item) => container.appendChild(builder(item)));
    observeReveals(container);
  }

  async function loadExactHomeSamples() {
    const projectsEl = document.getElementById("home-project-samples");
    const conferencesEl = document.getElementById("home-conference-samples");
    const researchEl = document.getElementById("home-research-samples");
    const publicationsEl = document.getElementById("home-publication-samples");

    try {
      const [projectRows, conferenceRows, publicationRows] = await Promise.all([
        apiGet("/projects"),
        apiGet("/conferences"),
        apiGet("/publications")
      ]);

      const projects = (Array.isArray(projectRows) ? projectRows : [])
        .filter((item) => String(item.kind || "").toLowerCase() !== "research");
      const research = (Array.isArray(projectRows) ? projectRows : [])
        .filter((item) => String(item.kind || "").toLowerCase() === "research");
      const conferences = Array.isArray(conferenceRows) ? conferenceRows : [];
      const publications = Array.isArray(publicationRows) ? publicationRows : [];

      renderThree(projectsEl, projects, createProjectCard, "noProjects");
      renderThree(conferencesEl, conferences, createConferenceCompactRow, "noConferences");
      renderThree(researchEl, research, createProjectRow, "noResearch");
      renderThree(publicationsEl, publications, createPublicationCard, "noPublications");
    } catch (error) {
      console.error("HOME EXACT COMPONENT LOAD ERROR", error);
      if (projectsEl) showError(projectsEl, t("contentUnavailable"));
      if (conferencesEl) showError(conferencesEl, t("contentUnavailable"));
      if (researchEl) showError(researchEl, t("contentUnavailable"));
      if (publicationsEl) showError(publicationsEl, t("contentUnavailable"));
    }
  }

  loadExactHomeSamples();
})();
