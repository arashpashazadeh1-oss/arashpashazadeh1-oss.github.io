(() => {
  "use strict";

  function renderThree(container, items, builder, emptyMessage) {
    if (!container) return;
    clear(container);

    const rows = items.slice(0, 3);
    if (!rows.length) {
      showError(container, emptyMessage);
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

      // EXACT same structure as projects.html
      renderThree(
        projectsEl,
        projects,
        createProjectCard,
        "No projects are currently available."
      );

      // EXACT same structure as conferences.html
      renderThree(
        conferencesEl,
        conferences,
        createConferenceCompactRow,
        "No conference entries are currently available."
      );

      // EXACT same structure as research.html
      renderThree(
        researchEl,
        research,
        createProjectRow,
        "No research entries are currently available."
      );

      // EXACT same structure as publications.html
      renderThree(
        publicationsEl,
        publications,
        createPublicationCard,
        "No publications are currently available."
      );
    } catch (error) {
      console.error("HOME EXACT COMPONENT LOAD ERROR", error);
      if (projectsEl) showError(projectsEl, "Projects are temporarily unavailable.");
      if (conferencesEl) showError(conferencesEl, "Conferences are temporarily unavailable.");
      if (researchEl) showError(researchEl, "Research is temporarily unavailable.");
      if (publicationsEl) showError(publicationsEl, "Publications are temporarily unavailable.");
    }
  }

  loadExactHomeSamples();
})();