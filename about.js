(() => {
  "use strict";

  const q = (id) => document.getElementById(id);
  const clean = (v) => String(v ?? "").trim();
  const escYear = (item) => {
    if (item.start_year && item.end_year) return `${item.start_year}–${item.end_year}`;
    if (item.start_year) return `${item.start_year}–Present`;
    if (item.year) return String(item.year);
    return clean(item.status) || "—";
  };

  function empty(container, message) {
    if (!container) return;
    container.innerHTML = "";
    const el = document.createElement("div");
    el.className = "about-live-empty";
    el.textContent = message;
    container.appendChild(el);
  }

  function projectRow(item) {
    const row = document.createElement("article");
    row.className = "about-live-row";
    const date = document.createElement("div");
    date.className = "about-live-date";
    date.textContent = escYear(item);
    const body = document.createElement("div");
    const title = document.createElement("h4");
    const link = document.createElement("a");
    link.href = `project.html?id=${encodeURIComponent(item.id)}`;
    link.textContent = item.title || "Project";
    title.appendChild(link);
    const meta = document.createElement("p");
    meta.className = "about-live-meta";
    meta.textContent = [item.category, item.kind, item.status].filter(Boolean).join(" · ");
    const desc = document.createElement("p");
    desc.textContent = item.summary || item.description || "";
    body.append(title, meta, desc);
    row.append(date, body);
    return row;
  }

  function publicationRow(item) {
    const row = document.createElement("article");
    row.className = "about-live-row";
    const date = document.createElement("div");
    date.className = "about-live-date";
    date.textContent = item.year || "—";
    const body = document.createElement("div");
    const title = document.createElement("h4");
    if (item.doi || item.url) {
      const a = document.createElement("a");
      a.href = item.url || `https://doi.org/${item.doi}`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = item.title || "Publication";
      title.appendChild(a);
    } else title.textContent = item.title || "Publication";
    const meta = document.createElement("p");
    meta.className = "about-live-meta";
    meta.textContent = [item.authors, item.journal, item.status].filter(Boolean).join(" · ");
    const desc = document.createElement("p");
    desc.textContent = item.abstract || (item.doi ? `DOI: ${item.doi}` : "");
    body.append(title, meta, desc);
    row.append(date, body);
    return row;
  }

  function conferenceRow(item) {
    const row = document.createElement("article");
    row.className = "about-live-row";
    const date = document.createElement("div");
    date.className = "about-live-date";
    date.textContent = item.year || "—";
    const body = document.createElement("div");
    const title = document.createElement("h4");
    const a = document.createElement("a");
    a.href = `conference.html?id=${encodeURIComponent(item.id)}`;
    a.textContent = item.title || item.event || "Conference / Workshop";
    title.appendChild(a);
    const meta = document.createElement("p");
    meta.className = "about-live-meta";
    meta.textContent = [item.event, item.type, item.location].filter(Boolean).join(" · ");
    const desc = document.createElement("p");
    desc.textContent = item.description || "";
    body.append(title, meta, desc);
    row.append(date, body);
    return row;
  }

  function render(container, items, factory, emptyMessage) {
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) return empty(container, emptyMessage);
    items.forEach((item) => container.appendChild(factory(item)));
  }

  function renderCounts(research, projects, publications, conferences) {
    const box = q("about-live-counts");
    if (!box) return;
    box.innerHTML = "";
    [
      [research.length, "Research"],
      [projects.length, "Projects / Studies"],
      [publications.length, "Publications"],
      [conferences.length, "Conferences / Workshops"]
    ].forEach(([count, label]) => {
      const card = document.createElement("div");
      const strong = document.createElement("strong");
      strong.textContent = count;
      const span = document.createElement("span");
      span.textContent = label;
      card.append(strong, span);
      box.appendChild(card);
    });
  }

  async function loadAboutRecord() {
    try {
      const [allProjects, publications, conferences] = await Promise.all([
        apiGet("/projects?limit=500"),
        apiGet("/publications?limit=500"),
        apiGet("/conferences?limit=500")
      ]);

      const projects = Array.isArray(allProjects) ? allProjects : [];
      const pubs = Array.isArray(publications) ? publications : [];
      const confs = Array.isArray(conferences) ? conferences : [];
      const research = projects.filter((p) => clean(p.kind).toLowerCase() === "research");
      const engineering = projects.filter((p) => clean(p.kind).toLowerCase() !== "research");

      render(q("about-research-live"), research, projectRow, "No research projects are currently stored in the website database.");
      render(q("about-projects-live"), engineering, projectRow, "No engineering projects or technical studies are currently stored in the website database.");
      render(q("about-publications-live"), pubs, publicationRow, "No publications are currently stored in the website database.");
      render(q("about-conferences-live"), confs, conferenceRow, "No conferences or workshops are currently stored in the website database.");
      renderCounts(research, engineering, pubs, confs);
      if (typeof observeReveals === "function") observeReveals(document);
    } catch (error) {
      console.error("ABOUT LIVE RECORD ERROR", error);
      empty(q("about-research-live"), "Current research data is temporarily unavailable. Open the Research page to try again.");
      empty(q("about-projects-live"), "Current project data is temporarily unavailable. Open the Projects page to try again.");
      empty(q("about-publications-live"), "Current publication data is temporarily unavailable. Open the Publications page to try again.");
      empty(q("about-conferences-live"), "Current conference data is temporarily unavailable. Open the Conferences page to try again.");
      const counts = q("about-live-counts");
      if (counts) counts.textContent = "Live website data is temporarily unavailable.";
    }
  }

  loadAboutRecord();
})();
