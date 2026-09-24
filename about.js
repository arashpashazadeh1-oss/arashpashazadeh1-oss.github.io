(() => {
  "use strict";

  const el = (id) => document.getElementById(id);
  const clean = (v) => String(v ?? "").trim();

  function yearRange(item) {
    if (item.start_year && item.end_year) return `${item.start_year}–${item.end_year}`;
    if (item.start_year) return `${item.start_year}–Present`;
    if (item.year) return String(item.year);
    return "";
  }

  function setMessage(container, message) {
    if (!container) return;
    container.innerHTML = "";
    const p = document.createElement("p");
    p.className = "cv-paper-muted";
    p.textContent = message;
    container.appendChild(p);
  }

  function publicationItem(item) {
    const li = document.createElement("li");
    const line = document.createElement("span");

    const parts = [];
    if (item.authors) parts.push(item.authors);
    if (item.year) parts.push(`(${item.year})`);
    if (item.title) parts.push(item.title);
    if (item.journal) parts.push(item.journal);
    if (item.status) parts.push(item.status);

    line.textContent = parts.join(". ").replace(/\.\s*\./g, ".") + (parts.length ? "." : "");
    li.appendChild(line);

    if (item.doi || item.url) {
      const a = document.createElement("a");
      a.href = item.url || `https://doi.org/${item.doi}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.doi ? ` DOI: ${item.doi}` : " Link";
      li.appendChild(a);
    }

    return li;
  }

  function projectLine(item) {
    const row = document.createElement("p");
    row.className = "cv-paper-live-row";

    const a = document.createElement("a");
    a.href = `project.html?id=${encodeURIComponent(item.id)}`;
    a.textContent = item.title || "Project";

    const prefix = [yearRange(item), item.category, item.status].filter(Boolean).join(" · ");
    if (prefix) {
      const strong = document.createElement("strong");
      strong.textContent = `${prefix} — `;
      row.appendChild(strong);
    }
    row.appendChild(a);

    const summary = clean(item.summary || item.description);
    if (summary) row.append(document.createTextNode(`. ${summary}`));
    return row;
  }

  function conferenceLine(item) {
    const row = document.createElement("p");
    row.className = "cv-paper-live-row";

    const a = document.createElement("a");
    a.href = `conference.html?id=${encodeURIComponent(item.id)}`;
    a.textContent = item.title || item.event || "Conference / Workshop";

    const prefix = [item.year, item.event, item.location].filter(Boolean).join(" · ");
    if (prefix) {
      const strong = document.createElement("strong");
      strong.textContent = `${prefix} — `;
      row.appendChild(strong);
    }
    row.appendChild(a);
    return row;
  }

  function renderLines(container, items, factory, emptyText) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) return setMessage(container, emptyText);
    items.forEach((item) => container.appendChild(factory(item)));
  }

  async function load() {
    const publicationsList = el("about-publications-live");
    const researchList = el("about-research-live");
    const projectList = el("about-projects-live");
    const conferenceList = el("about-conferences-live");

    try {
      const [projectData, publicationData, conferenceData] = await Promise.all([
        apiGet("/projects?limit=500"),
        apiGet("/publications?limit=500"),
        apiGet("/conferences?limit=500")
      ]);

      const projects = Array.isArray(projectData) ? projectData : [];
      const publications = Array.isArray(publicationData) ? publicationData : [];
      const conferences = Array.isArray(conferenceData) ? conferenceData : [];

      const research = projects
        .filter((p) => clean(p.kind).toLowerCase() === "research")
        .sort((a, b) => Number(b.start_year || b.year || 0) - Number(a.start_year || a.year || 0));

      const engineering = projects
        .filter((p) => clean(p.kind).toLowerCase() !== "research")
        .sort((a, b) => Number(b.start_year || b.year || 0) - Number(a.start_year || a.year || 0));

      publications.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));
      conferences.sort((a, b) => Number(b.year || 0) - Number(a.year || 0));

      if (publicationsList) {
        publicationsList.innerHTML = "";
        if (!publications.length) {
          const li = document.createElement("li");
          li.textContent = "No publications are currently stored in the Publications database.";
          publicationsList.appendChild(li);
        } else {
          publications.forEach((item) => publicationsList.appendChild(publicationItem(item)));
        }
      }

      renderLines(researchList, research, projectLine, "No research projects are currently stored in the website database.");
      renderLines(projectList, engineering, projectLine, "No engineering projects or technical studies are currently stored in the website database.");
      renderLines(conferenceList, conferences, conferenceLine, "No conferences or workshops are currently stored in the website database.");
    } catch (error) {
      console.error("ABOUT CV SYNC ERROR", error);

      if (publicationsList) {
        publicationsList.innerHTML = "<li>Current publication data is temporarily unavailable. Please open the Publications page.</li>";
      }
      setMessage(researchList, "Current research data is temporarily unavailable.");
      setMessage(projectList, "Current project data is temporarily unavailable.");
      setMessage(conferenceList, "Current conference data is temporarily unavailable.");
    }
  }

  load();
})();