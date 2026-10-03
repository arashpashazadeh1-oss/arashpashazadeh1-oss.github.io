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

  function slideDetailHref(type, id) {
    return `${type === "project" ? "project.html" : "conference.html"}?id=${encodeURIComponent(id)}`;
  }

  async function resolvedHomeCover(item, type) {
    let src = getCoverUrl(item);
    if (src) return src;
    try {
      const gallery = await loadGallery(type, item.id);
      const cover = gallery.find((x) => Number(x.is_cover) === 1) || gallery[0];
      return cover?.url || galleryImageUrl(cover?.id) || "";
    } catch {
      return "";
    }
  }

  function interleaveSlides(projectSlides, conferenceSlides) {
    const result = [];
    const max = Math.max(projectSlides.length, conferenceSlides.length);
    for (let i = 0; i < max; i += 1) {
      if (projectSlides[i]) result.push(projectSlides[i]);
      if (conferenceSlides[i]) result.push(conferenceSlides[i]);
      if (result.length >= 10) break;
    }
    return result.slice(0, 10);
  }

  function renderHomeCoverSlideshow(slides) {
    const stage = document.getElementById("home-cover-stage");
    const dots = document.getElementById("home-cover-dots");
    const showcase = document.getElementById("home-cover-showcase");
    if (!stage || !dots || !showcase) return;

    stage.innerHTML = "";
    dots.innerHTML = "";

    if (!slides.length) {
      showcase.hidden = true;
      return;
    }

    showcase.hidden = false;
    let activeIndex = 0;
    let timer = null;
    const slideEls = [];
    const dotEls = [];

    slides.forEach((slide, index) => {
      const link = document.createElement("a");
      link.className = `home-cover-slide${index === 0 ? " active" : ""}`;
      link.href = slide.href;
      link.setAttribute("aria-label", `${slide.kind}: ${slide.title}`);

      const img = document.createElement("img");
      img.src = slide.src;
      img.alt = slide.title || slide.kind;
      img.loading = index === 0 ? "eager" : "lazy";
      img.decoding = "async";

      const caption = document.createElement("div");
      caption.className = "home-cover-caption";
      const kind = document.createElement("span");
      kind.className = "home-cover-kind";
      kind.textContent = slide.kind;
      const title = document.createElement("strong");
      title.textContent = slide.title;
      caption.append(kind, title);

      link.append(img, caption);
      stage.appendChild(link);
      slideEls.push(link);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `home-cover-dot${index === 0 ? " active" : ""}`;
      dot.setAttribute("aria-label", `Show slide ${index + 1}`);
      dot.addEventListener("click", () => {
        show(index);
        restart();
      });
      dots.appendChild(dot);
      dotEls.push(dot);
    });

    function show(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slideEls.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
      dotEls.forEach((el, i) => {
        el.classList.toggle("active", i === activeIndex);
        el.setAttribute("aria-current", i === activeIndex ? "true" : "false");
      });
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = window.setInterval(() => show(activeIndex + 1), 4600);
    }

    function restart() {
      start();
    }

    showcase.addEventListener("mouseenter", stop);
    showcase.addEventListener("mouseleave", start);
    showcase.addEventListener("focusin", stop);
    showcase.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
  }

  async function buildHomeCoverSlideshow(projects, conferences) {
    const projectCandidates = projects.slice(0, 6);
    const conferenceCandidates = conferences.slice(0, 6);

    const projectSlides = (await Promise.all(projectCandidates.map(async (item) => ({
      type: "project",
      kind: t("project"),
      title: item.title || t("project"),
      href: slideDetailHref("project", item.id),
      src: await resolvedHomeCover(item, "project")
    })))).filter((x) => x.src);

    const conferenceSlides = (await Promise.all(conferenceCandidates.map(async (item) => ({
      type: "conference",
      kind: t("conference"),
      title: item.title || item.event || t("conference"),
      href: slideDetailHref("conference", item.id),
      src: await resolvedHomeCover(item, "conference")
    })))).filter((x) => x.src);

    renderHomeCoverSlideshow(interleaveSlides(projectSlides, conferenceSlides));
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

      const allProjects = Array.isArray(projectRows) ? projectRows : [];
      const projects = allProjects.filter((item) => String(item.kind || "").toLowerCase() !== "research");
      const research = allProjects.filter((item) => String(item.kind || "").toLowerCase() === "research");
      const conferences = Array.isArray(conferenceRows) ? conferenceRows : [];
      const publications = Array.isArray(publicationRows) ? publicationRows : [];

      renderThree(projectsEl, projects, createProjectCard, "noProjects");
      renderThree(conferencesEl, conferences, createConferenceCompactRow, "noConferences");
      renderThree(researchEl, research, createProjectRow, "noResearch");
      renderThree(publicationsEl, publications, createPublicationCard, "noPublications");
      buildHomeCoverSlideshow(projects, conferences);
    } catch (error) {
      console.error("HOME EXACT COMPONENT LOAD ERROR", error);
      if (projectsEl) showError(projectsEl, t("contentUnavailable"));
      if (conferencesEl) showError(conferencesEl, t("contentUnavailable"));
      if (researchEl) showError(researchEl, t("contentUnavailable"));
      if (publicationsEl) showError(publicationsEl, t("contentUnavailable"));
      const showcase = document.getElementById("home-cover-showcase");
      if (showcase) showcase.hidden = true;
    }
  }

  loadExactHomeSamples();
})();
