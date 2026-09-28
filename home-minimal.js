(() => {
  "use strict";

  const API = "https://arash-api.arash-pashazadeh1.workers.dev";

  async function get(path) {
    const res = await fetch(`${API}${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function galleryUrl(id) {
    return id ? `${API}/gallery-media/${encodeURIComponent(id)}` : "";
  }

  async function coverFor(item, type) {
    if (item.cover_media_id) return galleryUrl(item.cover_media_id);
    if (item.image_url) return item.image_url;

    try {
      const gallery = await get(`/gallery?entity_type=${encodeURIComponent(type)}&entity_id=${encodeURIComponent(item.id)}`);
      const cover = (gallery || []).find((x) => Number(x.is_cover) === 1) || (gallery || [])[0];
      return cover?.url || galleryUrl(cover?.id) || "";
    } catch {
      return "";
    }
  }

  function makeCard(item, type, href) {
    const article = document.createElement("article");
    article.className = "home-preview-card";

    const link = document.createElement("a");
    link.href = href;

    const media = document.createElement("div");
    media.className = "home-preview-media";

    const placeholder = document.createElement("div");
    placeholder.className = "home-preview-placeholder";
    placeholder.textContent = "AP";
    media.appendChild(placeholder);

    coverFor(item, type).then((src) => {
      if (!src) return;
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = item.title || item.event || "";
      img.src = src;
      img.addEventListener("load", () => placeholder.replaceWith(img));
    });

    const title = document.createElement("h3");
    title.textContent = item.title || item.event || "Untitled";

    link.append(media, title);
    article.appendChild(link);
    return article;
  }

  function makePublication(item) {
    const article = document.createElement("article");
    article.className = "home-publication-card";

    const link = document.createElement("a");
    link.href = item.url || (item.doi ? `https://doi.org/${item.doi}` : "publications.html");
    if (item.url || item.doi) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled publication";

    link.appendChild(title);
    article.appendChild(link);
    return article;
  }

  function showEmpty(container, text) {
    container.innerHTML = "";
    const p = document.createElement("p");
    p.className = "home-preview-empty";
    p.textContent = text;
    container.appendChild(p);
  }

  async function load() {
    const projectsEl = document.getElementById("home-project-samples");
    const conferencesEl = document.getElementById("home-conference-samples");
    const researchEl = document.getElementById("home-research-samples");
    const publicationsEl = document.getElementById("home-publication-samples");

    try {
      const [projectData, conferenceData, publicationData] = await Promise.all([
        get("/projects?limit=100"),
        get("/conferences?limit=100"),
        get("/publications?limit=100")
      ]);

      const allProjects = Array.isArray(projectData) ? projectData : [];
      const allConferences = Array.isArray(conferenceData) ? conferenceData : [];
      const allPublications = Array.isArray(publicationData) ? publicationData : [];

      const research = allProjects
        .filter((x) => String(x.kind || "").toLowerCase() === "research")
        .slice(0, 3);

      const projects = allProjects
        .filter((x) => String(x.kind || "").toLowerCase() !== "research")
        .slice(0, 3);

      const conferences = allConferences.slice(0, 3);
      const publications = allPublications.slice(0, 3);

      projectsEl.innerHTML = "";
      conferencesEl.innerHTML = "";
      researchEl.innerHTML = "";
      publicationsEl.innerHTML = "";

      if (projects.length) {
        projects.forEach((item) => {
          projectsEl.appendChild(makeCard(item, "project", `project.html?id=${encodeURIComponent(item.id)}`));
        });
      } else {
        showEmpty(projectsEl, "No projects yet.");
      }

      if (conferences.length) {
        conferences.forEach((item) => {
          conferencesEl.appendChild(makeCard(item, "conference", `conference.html?id=${encodeURIComponent(item.id)}`));
        });
      } else {
        showEmpty(conferencesEl, "No conferences yet.");
      }

      if (research.length) {
        research.forEach((item) => {
          researchEl.appendChild(makeCard(item, "project", `project.html?id=${encodeURIComponent(item.id)}`));
        });
      } else {
        showEmpty(researchEl, "No research yet.");
      }

      if (publications.length) {
        publications.forEach((item) => {
          publicationsEl.appendChild(makePublication(item));
        });
      } else {
        showEmpty(publicationsEl, "No publications yet.");
      }
    } catch (error) {
      console.error("HOME SAMPLE LOAD ERROR", error);
      showEmpty(projectsEl, "Projects are temporarily unavailable.");
      showEmpty(conferencesEl, "Conferences are temporarily unavailable.");
      showEmpty(researchEl, "Research is temporarily unavailable.");
      showEmpty(publicationsEl, "Publications are temporarily unavailable.");
    }
  }

  load();
})();