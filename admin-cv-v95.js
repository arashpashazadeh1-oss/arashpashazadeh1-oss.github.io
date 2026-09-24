(() => {
  "use strict";

  const CV_API_BASE = "https://arash-api.arash-pashazadeh1.workers.dev";
  const cvData = { projects: [], publications: [], conferences: [], galleries: new Map() };
  let cvLoaded = false;
  let cvLoading = false;

  const cv$ = (id) => document.getElementById(id);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function ensurePptxLibrary() {
    if (typeof window.PptxGenJS !== "undefined") return window.PptxGenJS;

    const existing = document.querySelector('script[data-pptxgen-fallback="1"]');
    if (existing) {
      await new Promise((resolve, reject) => {
        if (typeof window.PptxGenJS !== "undefined") return resolve();
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      });
      if (typeof window.PptxGenJS !== "undefined") return window.PptxGenJS;
    }

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs/dist/pptxgen.bundle.js";
      script.async = true;
      script.dataset.pptxgenFallback = "1";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Unable to load the PowerPoint export library from jsDelivr."));
      document.head.appendChild(script);
    });

    if (typeof window.PptxGenJS === "undefined") {
      throw new Error("PowerPoint export library loaded, but PptxGenJS was not found.");
    }
    return window.PptxGenJS;
  }

  function setStatus(message, tone = "") {
    const el = cv$("cv-status");
    if (!el) return;
    el.textContent = message || "";
    el.className = `form-message ${tone}`.trim();
  }

  function sanitizeFileName(text) {
    return String(text || "Arash_Pashazadeh")
      .replace(/[^a-z0-9_\-]+/gi, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function splitLines(text) {
    return String(text || "")
      .split(/\n+/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function oneLine(text, fallback = "") {
    return String(text || fallback || "").replace(/\s+/g, " ").trim();
  }

  function dateRange(item) {
    const start = item.start_year || "";
    const end = item.end_year || (item.status && /ongoing|present/i.test(item.status) ? "Present" : "");
    if (start && end) return `${start}–${end}`;
    if (start) return `${start}`;
    if (item.year) return `${item.year}`;
    return "";
  }

  function escapeHtml(text) {
    return String(text ?? "").replace(/[&<>'"]/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[c]));
  }

  async function api(path) {
    const sep = path.includes("?") ? "&" : "?";
    const res = await fetch(`${CV_API_BASE}${path}${sep}t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) {
      let message = `${path}: HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data?.error) message += ` — ${data.error}`;
      } catch {}
      throw new Error(message);
    }
    return await res.json();
  }

  async function fetchGallery(entityType, entityId) {
    const key = `${entityType}:${entityId}`;
    if (cvData.galleries.has(key)) return cvData.galleries.get(key);
    try {
      const rows = await api(`/gallery?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`);
      cvData.galleries.set(key, rows || []);
      return rows || [];
    } catch {
      cvData.galleries.set(key, []);
      return [];
    }
  }

  async function loadAllData(force = false) {
    if (cvLoading) return;
    if (cvLoaded && !force) return;
    cvLoading = true;
    setStatus("Loading projects, publications, conferences, and galleries...");
    try {
      cvData.galleries.clear();
      cvData.projects = await api("/projects?limit=500");
      cvData.publications = await api("/publications?limit=500");
      cvData.conferences = await api("/conferences?limit=500");

      for (const project of cvData.projects) await fetchGallery("project", project.id);
      for (const conf of cvData.conferences) await fetchGallery("conference", conf.id);

      renderDataSummary();
      renderProjectSelector();
      cvLoaded = true;
      setStatus("Website data loaded.", "success");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Unable to load website data.", "error");
    } finally {
      cvLoading = false;
    }
  }

  function renderDataSummary() {
    const el = cv$("cv-data-summary");
    if (!el) return;
    const imageCount = [...cvData.galleries.values()].reduce((a, b) => a + b.length, 0);
    el.innerHTML = `<strong>Loaded:</strong> ${cvData.projects.length} projects · ${cvData.publications.length} publications · ${cvData.conferences.length} conferences/workshops · ${imageCount} gallery images`;
  }

  function renderProjectSelector() {
    const el = cv$("cv-project-selector");
    if (!el) return;
    if (!cvData.projects.length) {
      el.innerHTML = '<div class="data-loading">No projects found yet.</div>';
      return;
    }

    el.innerHTML = cvData.projects.map((p) => {
      const images = cvData.galleries.get(`project:${p.id}`)?.length || 0;
      return `<label class="cv-select-card">
        <input type="checkbox" class="cv-project-check" value="${p.id}" checked>
        <span>
          <strong>${escapeHtml(p.title)}</strong>
          <small>${escapeHtml(p.kind || "project")} · ${images} images · ${escapeHtml(dateRange(p))}</small>
        </span>
      </label>`;
    }).join("");
  }

  function getProfile() {
    return {
      name: cv$("cv-name")?.value || "Arash Pashazadeh",
      title: cv$("cv-title")?.value || "Civil Engineer · Ph.D. Researcher",
      email: cv$("cv-email")?.value || "",
      location: cv$("cv-location")?.value || "",
      scholar: cv$("cv-scholar")?.value || "",
      linkedin: cv$("cv-linkedin")?.value || "",
      summary: cv$("cv-summary")?.value || "",
      education: splitLines(cv$("cv-education")?.value || ""),
      experience: splitLines(cv$("cv-experience")?.value || ""),
      skills: splitLines(cv$("cv-skills")?.value || ""),
      languages: splitLines(cv$("cv-languages")?.value || ""),
      interests: splitLines(cv$("cv-interests")?.value || ""),
      honors: splitLines(cv$("cv-honors")?.value || ""),
      memberships: splitLines(cv$("cv-memberships")?.value || ""),
      certifications: splitLines(cv$("cv-certifications")?.value || "")
    };
  }

  function selectedProjects() {
    const ids = new Set([...document.querySelectorAll(".cv-project-check:checked")].map((x) => Number(x.value)));
    const kind = cv$("portfolio-kind-filter")?.value || "all";
    return cvData.projects.filter((p) => ids.has(p.id) && (kind === "all" || p.kind === kind));
  }

  function paraDocx(text, opts = {}) {
    const { Paragraph, TextRun, AlignmentType } = window.docx;
    return new Paragraph({
      spacing: { after: opts.after ?? 120 },
      alignment: opts.center ? AlignmentType.CENTER : undefined,
      children: [new TextRun({
        text: String(text || ""),
        bold: !!opts.bold,
        size: opts.size || 22,
        color: opts.color || undefined
      })]
    });
  }

  function bulletDocx(text) {
    const { Paragraph, TextRun } = window.docx;
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 80 },
      children: [new TextRun({ text: String(text || ""), size: 21 })]
    });
  }

  function sectionHeadingDocx(text) {
    return paraDocx(text, { bold: true, size: 28, color: "0F6C7A", after: 160 });
  }

  function cvProjectsForType(type) {
    if (type === "academic") return cvData.projects.filter((p) => p.kind === "research");
    if (type === "engineering") {
      return cvData.projects.filter((p) => p.kind !== "research")
        .concat(cvData.projects.filter((p) => p.kind === "research"));
    }
    return cvData.projects;
  }

  function buildCvContent(type) {
    const profile = getProfile();
    const projects = cvProjectsForType(type);
    const sections = [];

    sections.push({ title: "Professional Profile", items: [profile.summary] });
    sections.push({ title: "Education", items: profile.education });
    sections.push({
      title: type === "engineering" ? "Professional / Engineering Experience" : "Experience",
      items: profile.experience
    });
    sections.push({
      title: type === "academic" ? "Research Projects" : "Selected Projects",
      items: projects.map((p) => `${dateRange(p)} — ${p.title}. ${p.summary || p.description || ""}`)
    });

    if (cv$("include-publications")?.checked) {
      sections.push({
        title: "Publications",
        items: cvData.publications.map((p) =>
          `${p.year || ""} — ${p.title}. ${p.authors || ""}. ${p.journal || ""}. ${p.doi ? `DOI: ${p.doi}` : ""}`)
      });
    }

    if (cv$("include-conferences")?.checked) {
      sections.push({
        title: "Conferences / Workshops",
        items: cvData.conferences.map((c) =>
          `${c.year || ""} — ${c.title}. ${c.event || ""}. ${c.location || ""}`)
      });
    }

    sections.push({ title: "Research & Work Interests", items: profile.interests });
    sections.push({ title: "Honors & Distinctions", items: profile.honors });
    sections.push({ title: "Professional Memberships", items: profile.memberships });
    sections.push({ title: "Certifications", items: profile.certifications });
    sections.push({ title: "Technical Skills", items: profile.skills });
    sections.push({ title: "Languages", items: profile.languages });
    return { profile, sections };
  }

  async function generateCvDocx(type) {
    if (!window.docx || !window.saveAs) throw new Error("Word export library did not load.");
    const { Document, Packer } = window.docx;
    const { profile, sections } = buildCvContent(type);

    const children = [];
    children.push(paraDocx(profile.name, { bold: true, size: 36, center: true, color: "10252D" }));
    children.push(paraDocx(profile.title, { size: 22, center: true, color: "0F6C7A" }));
    children.push(paraDocx(
      [profile.email, profile.location, profile.scholar, profile.linkedin].filter(Boolean).join(" | "),
      { size: 18, center: true, after: 260 }
    ));

    if (type === "europass") {
      children.push(sectionHeadingDocx("Personal information"));
      children.push(bulletDocx(`Name: ${profile.name}`));
      children.push(bulletDocx(`Title: ${profile.title}`));
      if (profile.email) children.push(bulletDocx(`Email: ${profile.email}`));
      if (profile.location) children.push(bulletDocx(`Location: ${profile.location}`));
    }

    for (const section of sections) {
      if (!section.items?.length) continue;
      children.push(sectionHeadingDocx(section.title));
      for (const item of section.items) if (item) children.push(bulletDocx(item));
    }

    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFileName(profile.name)}_${type}_CV.docx`);
  }

  function addWrappedTextPdf(pdf, text, x, y, w, lineHeight = 0.18) {
    const lines = pdf.splitTextToSize(String(text || ""), w);
    pdf.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  async function generateCvPdf(type) {
    if (!window.jspdf?.jsPDF) throw new Error("PDF export library did not load.");
    const { jsPDF } = window.jspdf;
    const { profile, sections } = buildCvContent(type);
    const pdf = new jsPDF({ unit: "in", format: "letter", orientation: "portrait" });
    const margin = 0.65;
    let y = margin;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(profile.name, 4.25, y, { align: "center" });
    y += 0.28;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.text(profile.title, 4.25, y, { align: "center" });
    y += 0.22;
    pdf.setFontSize(8.5);
    pdf.text(
      [profile.email, profile.location, profile.scholar, profile.linkedin].filter(Boolean).join(" | "),
      4.25, y, { align: "center", maxWidth: 7.1 }
    );
    y += 0.35;

    for (const section of sections) {
      if (!section.items?.length) continue;
      if (y > 9.55) { pdf.addPage(); y = margin; }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(15, 108, 122);
      pdf.text(section.title, margin, y);
      y += 0.22;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.2);

      for (const item of section.items) {
        if (!item) continue;
        if (y > 9.85) { pdf.addPage(); y = margin; }
        y = addWrappedTextPdf(pdf, `• ${item}`, margin + 0.1, y, 7.0, 0.15) + 0.06;
      }
      y += 0.08;
    }

    pdf.save(`${sanitizeFileName(profile.name)}_${type}_CV.pdf`);
  }

  async function generateCvBoth(type) {
    if (!cvLoaded) await loadAllData();
    setStatus(`Generating ${type} CV...`);
    try {
      await generateCvDocx(type);
      await sleep(250);
      await generateCvPdf(type);
      setStatus(`${type} CV generated.`, "success");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "CV generation failed.", "error");
    }
  }

  async function imageUrlToJpegDataUri(url) {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Unable to load image ${url}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = objectUrl;
      });

      // Keep the original aspect ratio. We only reduce resolution if needed.
      const maxW = 1800;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      return {
        dataUri: canvas.toDataURL("image/jpeg", 0.9),
        pixelWidth: canvas.width,
        pixelHeight: canvas.height
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function entityImages(entityType, entityId, count) {
    const gallery = await fetchGallery(entityType, entityId);
    const images = gallery.slice(0, count);
    const data = [];
    for (const img of images) {
      try {
        const converted = await imageUrlToJpegDataUri(img.url);
        data.push({ ...img, ...converted });
      } catch (error) {
        console.warn(error);
      }
    }
    return data;
  }

  function fitInsideBox(pixelWidth, pixelHeight, boxWidth, boxHeight) {
    const iw = Math.max(1, Number(pixelWidth) || 1);
    const ih = Math.max(1, Number(pixelHeight) || 1);
    const scale = Math.min(boxWidth / iw, boxHeight / ih);
    const w = iw * scale;
    const h = ih * scale;
    return {
      w,
      h,
      dx: (boxWidth - w) / 2,
      dy: (boxHeight - h) / 2
    };
  }

  function fitInsidePixels(pixelWidth, pixelHeight, maxWidth, maxHeight) {
    const iw = Math.max(1, Number(pixelWidth) || 1);
    const ih = Math.max(1, Number(pixelHeight) || 1);
    const scale = Math.min(maxWidth / iw, maxHeight / ih, 1);
    return {
      width: Math.max(1, Math.round(iw * scale)),
      height: Math.max(1, Math.round(ih * scale))
    };
  }

  function dataUriToUint8Array(dataUri) {
    const base64 = String(dataUri || "").split(",")[1] || "";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function addPptImageGrid(pptx, slide, images, y = 2.85) {
    const slots = [
      { x: 0.65, y, w: 3.0, h: 1.95 },
      { x: 3.85, y, w: 3.0, h: 1.95 },
      { x: 7.05, y, w: 2.8, h: 1.95 },
      { x: 10.05, y, w: 2.6, h: 1.95 }
    ];

    slots.forEach((s, i) => {
      // Draw a neutral frame first. The image is contained inside this box
      // without changing its aspect ratio, so portrait/landscape photos never stretch.
      slide.addShape(pptx.ShapeType.rect, {
        x: s.x, y: s.y, w: s.w, h: s.h,
        fill: { color: "EEF5F7" },
        line: { color: "D7E4E7", width: 0.7 }
      });

      if (images[i]?.dataUri) {
        const fit = fitInsideBox(
          images[i].pixelWidth,
          images[i].pixelHeight,
          s.w - 0.08,
          s.h - 0.08
        );
        slide.addImage({
          data: images[i].dataUri,
          x: s.x + 0.04 + fit.dx,
          y: s.y + 0.04 + fit.dy,
          w: fit.w,
          h: fit.h
        });
      } else {
        slide.addText("No image", {
          x: s.x, y: s.y + 0.85, w: s.w, h: 0.25,
          fontSize: 9, align: "center", color: "789097"
        });
      }
    });
  }

  async function generatePortfolioPptx(projects, includeConferences) {
    const PptxGenJS = await ensurePptxLibrary();
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_WIDE";
    const profile = getProfile();
    pptx.author = profile.name;
    pptx.subject = "Civil Engineering Portfolio";
    pptx.title = "Long Portfolio";
    pptx.company = "Arash Pashazadeh";
    pptx.lang = "en-US";

    let slide = pptx.addSlide();
    slide.background = { color: "081318" };
    slide.addText(profile.name, { x: 0.65, y: 0.75, w: 12, h: 0.4, fontFace: "Arial", fontSize: 22, bold: true, color: "FFFFFF" });
    slide.addText("Civil Engineering Portfolio", { x: 0.65, y: 1.25, w: 12, h: 0.35, fontSize: 16, color: "69D4DF" });
    slide.addText(profile.summary, { x: 0.65, y: 2.0, w: 11.7, h: 1.2, fontSize: 12, color: "D4E5E9", fit: "shrink" });
    slide.addText("Generated from website projects and media galleries", { x: 0.65, y: 6.75, w: 11.8, h: 0.3, fontSize: 9, color: "9DB0B7" });

    const imgCount = Number(cv$("portfolio-image-count")?.value || 4);
    const fontSize = Number(cv$("portfolio-font-size")?.value || 12);

    for (const project of projects) {
      const images = await entityImages("project", project.id, imgCount);
      slide = pptx.addSlide();
      slide.background = { color: "F7FBFC" };
      slide.addText(project.title || "Project", { x: 0.65, y: 0.38, w: 12, h: 0.3, fontSize, bold: true, color: "10252D", margin: 0 });
      slide.addText([project.category, project.kind, dateRange(project), project.status].filter(Boolean).join(" · "), { x: 0.65, y: 0.72, w: 12, h: 0.22, fontSize: 9, color: "0F6C7A", margin: 0 });
      slide.addText(oneLine(project.description || project.summary, "Project description."), { x: 0.65, y: 1.03, w: 12.0, h: 1.28, fontSize, color: "304D55", fit: "shrink", margin: 0.02 });
      if (project.methods) slide.addText(`Methods / keywords: ${project.methods}`, { x: 0.65, y: 2.38, w: 12.0, h: 0.25, fontSize: 9, color: "667D84", margin: 0 });
      addPptImageGrid(pptx, slide, images, 2.78);
      slide.addText("Arash Pashazadeh | Civil Engineering Portfolio", { x: 0.65, y: 7.05, w: 12, h: 0.22, fontSize: 7.5, color: "8AA0A7" });
    }

    if (includeConferences) {
      for (const conf of cvData.conferences) {
        const images = await entityImages("conference", conf.id, imgCount);
        slide = pptx.addSlide();
        slide.background = { color: "F7FBFC" };
        slide.addText(conf.title || "Conference / Workshop", { x: 0.65, y: 0.38, w: 12, h: 0.3, fontSize, bold: true, color: "10252D", margin: 0 });
        slide.addText([conf.event, conf.type, conf.year, conf.location].filter(Boolean).join(" · "), { x: 0.65, y: 0.72, w: 12, h: 0.22, fontSize: 9, color: "0F6C7A", margin: 0 });
        slide.addText(oneLine(conf.description, "Conference / workshop activity."), { x: 0.65, y: 1.03, w: 12.0, h: 1.28, fontSize, color: "304D55", fit: "shrink", margin: 0.02 });
        addPptImageGrid(pptx, slide, images, 2.78);
        slide.addText("Arash Pashazadeh | Civil Engineering Portfolio", { x: 0.65, y: 7.05, w: 12, h: 0.22, fontSize: 7.5, color: "8AA0A7" });
      }
    }

    await pptx.writeFile({ fileName: `${sanitizeFileName(profile.name)}_Long_Portfolio.pptx` });
  }

  async function generatePortfolioPdf(projects, includeConferences) {
    if (!window.jspdf?.jsPDF) throw new Error("PDF export library did not load.");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "in", format: [13.333, 7.5], orientation: "landscape" });
    const profile = getProfile();
    const imgCount = Number(cv$("portfolio-image-count")?.value || 4);
    const fontSize = Number(cv$("portfolio-font-size")?.value || 12);

    pdf.setFillColor(8, 19, 24);
    pdf.rect(0, 0, 13.333, 7.5, "F");
    pdf.setTextColor(255,255,255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.text(profile.name, 0.65, 0.95);
    pdf.setFontSize(16);
    pdf.setTextColor(105,212,223);
    pdf.text("Civil Engineering Portfolio", 0.65, 1.42);
    pdf.setTextColor(212,229,233);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(pdf.splitTextToSize(profile.summary, 11.7), 0.65, 2.0);

    async function addEntityPage(entity, type) {
      pdf.addPage([13.333, 7.5], "landscape");
      pdf.setFillColor(247,251,252);
      pdf.rect(0, 0, 13.333, 7.5, "F");
      pdf.setTextColor(16,37,45);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(fontSize);
      pdf.text(oneLine(entity.title, type === "project" ? "Project" : "Conference / Workshop"), 0.65, 0.6, { maxWidth: 12 });
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(15,108,122);
      pdf.setFontSize(9);
      const meta = type === "project"
        ? [entity.category, entity.kind, dateRange(entity), entity.status]
        : [entity.event, entity.type, entity.year, entity.location];
      pdf.text(meta.filter(Boolean).join(" · "), 0.65, 0.9, { maxWidth: 12 });
      pdf.setTextColor(48,77,85);
      pdf.setFontSize(fontSize);
      const description = type === "project" ? (entity.description || entity.summary) : entity.description;
      const desc = pdf.splitTextToSize(oneLine(description, type === "project" ? "Project description." : "Conference / workshop activity."), 12.0);
      pdf.text(desc.slice(0, 7), 0.65, 1.23);

      const images = await entityImages(type, entity.id, imgCount);
      const slots = [
        { x: 0.65, y: 2.85, w: 3.0, h: 1.95 },
        { x: 3.85, y: 2.85, w: 3.0, h: 1.95 },
        { x: 7.05, y: 2.85, w: 2.8, h: 1.95 },
        { x: 10.05, y: 2.85, w: 2.6, h: 1.95 }
      ];
      slots.forEach((s, i) => {
        pdf.setDrawColor(215,228,231);
        pdf.setFillColor(238,245,247);
        pdf.rect(s.x, s.y, s.w, s.h, "FD");

        if (images[i]?.dataUri) {
          try {
            const fit = fitInsideBox(
              images[i].pixelWidth,
              images[i].pixelHeight,
              s.w - 0.08,
              s.h - 0.08
            );
            pdf.addImage(
              images[i].dataUri,
              "JPEG",
              s.x + 0.04 + fit.dx,
              s.y + 0.04 + fit.dy,
              fit.w,
              fit.h
            );
          } catch {
            pdf.setTextColor(120,144,151);
            pdf.setFontSize(9);
            pdf.text("Image", s.x + 0.1, s.y + 0.2);
          }
        } else {
          pdf.setTextColor(120,144,151);
          pdf.setFontSize(9);
          pdf.text("No image", s.x + s.w / 2, s.y + s.h / 2, { align: "center" });
        }
      });
      pdf.setFontSize(7.5);
      pdf.setTextColor(138,160,167);
      pdf.text("Arash Pashazadeh | Civil Engineering Portfolio", 0.65, 7.1);
    }

    for (const project of projects) await addEntityPage(project, "project");
    if (includeConferences) for (const conf of cvData.conferences) await addEntityPage(conf, "conference");

    pdf.save(`${sanitizeFileName(profile.name)}_Long_Portfolio_16x9.pdf`);
  }


  async function projectImageParagraphsDocx(project, count) {
    const {
      Paragraph,
      TextRun,
      ImageRun,
      AlignmentType
    } = window.docx;

    const images = await entityImages("project", project.id, count);
    const paragraphs = [];

    for (let i = 0; i < images.length; i += 2) {
      const pair = images.slice(i, i + 2);
      const children = [];

      pair.forEach((img, index) => {
        const fit = fitInsidePixels(img.pixelWidth, img.pixelHeight, 285, 190);
        children.push(new ImageRun({
          data: dataUriToUint8Array(img.dataUri),
          type: "jpg",
          transformation: { width: fit.width, height: fit.height }
        }));
        if (index === 0 && pair.length > 1) {
          children.push(new TextRun({ text: "      " }));
        }
      });

      paragraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 90 },
        children
      }));

      const captions = pair
        .map((img) => oneLine(img.caption || img.alt_text || ""))
        .filter(Boolean);

      if (captions.length) {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({
            text: captions.join("        |        "),
            italics: true,
            size: 17,
            color: "667D84"
          })]
        }));
      }
    }

    return paragraphs;
  }

  async function generateLongCvDocx(projects) {
    if (!window.docx || !window.saveAs) throw new Error("Word export library did not load.");

    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      AlignmentType
    } = window.docx;

    const profile = getProfile();
    const imgCount = Number(cv$("long-cv-image-count")?.value || 2);
    const children = [];

    children.push(paraDocx(profile.name, { bold: true, size: 36, center: true, color: "10252D" }));
    children.push(paraDocx(profile.title, { size: 22, center: true, color: "0F6C7A" }));
    children.push(paraDocx(
      [profile.email, profile.location, profile.scholar, profile.linkedin].filter(Boolean).join(" | "),
      { size: 18, center: true, after: 260 }
    ));

    children.push(sectionHeadingDocx("Professional Profile"));
    children.push(paraDocx(profile.summary, { size: 21, after: 180 }));

    children.push(sectionHeadingDocx("Education"));
    profile.education.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Experience"));
    profile.experience.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Research & Project Experience"));

    for (const project of projects) {
      children.push(new Paragraph({
        spacing: { before: 160, after: 70 },
        children: [
          new TextRun({
            text: `${dateRange(project) ? `${dateRange(project)} — ` : ""}${project.title || "Project"}`,
            bold: true,
            size: 25,
            color: "10252D"
          })
        ]
      }));

      const meta = [project.category, project.kind, project.status].filter(Boolean).join(" · ");
      if (meta) {
        children.push(new Paragraph({
          spacing: { after: 80 },
          children: [new TextRun({ text: meta, size: 18, color: "0F6C7A" })]
        }));
      }

      const description = project.description || project.summary || "Project description.";
      children.push(new Paragraph({
        spacing: { after: 90 },
        children: [new TextRun({ text: description, size: 21, color: "304D55" })]
      }));

      if (project.methods) {
        children.push(new Paragraph({
          spacing: { after: 90 },
          children: [
            new TextRun({ text: "Methods / keywords: ", bold: true, size: 18, color: "667D84" }),
            new TextRun({ text: project.methods, size: 18, color: "667D84" })
          ]
        }));
      }

      const imageParagraphs = await projectImageParagraphsDocx(project, imgCount);
      children.push(...imageParagraphs);

      children.push(new Paragraph({
        spacing: { after: 120 },
        children: [new TextRun({ text: " ", size: 6 })]
      }));
    }

    if (cv$("include-publications")?.checked && cvData.publications.length) {
      children.push(sectionHeadingDocx("Publications"));
      cvData.publications.forEach((p) => {
        children.push(bulletDocx(
          `${p.year || ""} — ${p.title}. ${p.authors || ""}. ${p.journal || ""}. ${p.doi ? `DOI: ${p.doi}` : ""}`
        ));
      });
    }

    if (cv$("include-conferences")?.checked && cvData.conferences.length) {
      children.push(sectionHeadingDocx("Conferences / Workshops"));
      cvData.conferences.forEach((c) => {
        children.push(bulletDocx(
          `${c.year || ""} — ${c.title}. ${c.event || ""}. ${c.location || ""}`
        ));
      });
    }

    children.push(sectionHeadingDocx("Research & Work Interests"));
    profile.interests.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Honors & Distinctions"));
    profile.honors.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Professional Memberships"));
    profile.memberships.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Certifications"));
    profile.certifications.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Technical Skills"));
    profile.skills.forEach((item) => children.push(bulletDocx(item)));

    children.push(sectionHeadingDocx("Languages"));
    profile.languages.forEach((item) => children.push(bulletDocx(item)));

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${sanitizeFileName(profile.name)}_Long_CV_with_Images.docx`);
  }

  function pdfEnsureSpace(pdf, state, requiredHeight, pageHeight, margin) {
    if (state.y + requiredHeight <= pageHeight - margin) return;
    pdf.addPage();
    state.y = margin;
  }

  async function addProjectToLongCvPdf(pdf, state, project, imgCount, pageWidth, pageHeight, margin) {
    const usableWidth = pageWidth - margin * 2;
    const title = `${dateRange(project) ? `${dateRange(project)} — ` : ""}${project.title || "Project"}`;
    const meta = [project.category, project.kind, project.status].filter(Boolean).join(" · ");
    const description = oneLine(project.description || project.summary, "Project description.");
    const descLines = pdf.splitTextToSize(description, usableWidth);
    const estimatedTextHeight = 0.32 + (meta ? 0.18 : 0) + Math.min(descLines.length, 12) * 0.17 + 0.18;
    pdfEnsureSpace(pdf, state, estimatedTextHeight + 2.35, pageHeight, margin);

    pdf.setTextColor(16,37,45);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11.5);
    pdf.text(pdf.splitTextToSize(title, usableWidth), margin, state.y);
    state.y += 0.28;

    if (meta) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.6);
      pdf.setTextColor(15,108,122);
      pdf.text(meta, margin, state.y, { maxWidth: usableWidth });
      state.y += 0.20;
    }

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.6);
    pdf.setTextColor(48,77,85);
    const shownDesc = descLines.slice(0, 12);
    pdf.text(shownDesc, margin, state.y);
    state.y += shownDesc.length * 0.17 + 0.08;

    if (project.methods) {
      pdf.setFontSize(8.3);
      pdf.setTextColor(102,125,132);
      const methodLines = pdf.splitTextToSize(`Methods / keywords: ${project.methods}`, usableWidth);
      pdf.text(methodLines.slice(0, 3), margin, state.y);
      state.y += Math.min(methodLines.length, 3) * 0.15 + 0.08;
    }

    const images = await entityImages("project", project.id, imgCount);
    const gap = 0.18;
    const boxW = (usableWidth - gap) / 2;
    const boxH = 1.75;

    for (let i = 0; i < images.length; i += 2) {
      pdfEnsureSpace(pdf, state, boxH + 0.35, pageHeight, margin);
      const pair = images.slice(i, i + 2);

      pair.forEach((img, index) => {
        const x = margin + index * (boxW + gap);
        pdf.setDrawColor(215,228,231);
        pdf.setFillColor(238,245,247);
        pdf.rect(x, state.y, boxW, boxH, "FD");

        if (img?.dataUri) {
          const fit = fitInsideBox(img.pixelWidth, img.pixelHeight, boxW - 0.08, boxH - 0.08);
          pdf.addImage(
            img.dataUri,
            "JPEG",
            x + 0.04 + fit.dx,
            state.y + 0.04 + fit.dy,
            fit.w,
            fit.h
          );
        }
      });

      state.y += boxH + 0.24;
    }

    state.y += 0.12;
  }

  async function generateLongCvPdf(projects) {
    if (!window.jspdf?.jsPDF) throw new Error("PDF export library did not load.");

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "in", format: "a4", orientation: "portrait" });
    const profile = getProfile();
    const imgCount = Number(cv$("long-cv-image-count")?.value || 2);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 0.58;
    const usableWidth = pageWidth - margin * 2;
    const state = { y: margin };

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(16,37,45);
    pdf.text(profile.name, pageWidth / 2, state.y, { align: "center" });
    state.y += 0.28;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(15,108,122);
    pdf.text(profile.title, pageWidth / 2, state.y, { align: "center" });
    state.y += 0.21;

    pdf.setFontSize(8.0);
    pdf.setTextColor(70,92,99);
    pdf.text(
      [profile.email, profile.location, profile.scholar, profile.linkedin].filter(Boolean).join(" | "),
      pageWidth / 2,
      state.y,
      { align: "center", maxWidth: usableWidth }
    );
    state.y += 0.34;

    function sectionHeading(text) {
      pdfEnsureSpace(pdf, state, 0.34, pageHeight, margin);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11.5);
      pdf.setTextColor(15,108,122);
      pdf.text(text, margin, state.y);
      state.y += 0.23;
    }

    function addBulletLines(items) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.2);
      pdf.setTextColor(30,48,54);
      for (const item of items) {
        if (!item) continue;
        const lines = pdf.splitTextToSize(`• ${item}`, usableWidth - 0.1);
        pdfEnsureSpace(pdf, state, lines.length * 0.16 + 0.08, pageHeight, margin);
        pdf.text(lines, margin + 0.08, state.y);
        state.y += lines.length * 0.16 + 0.06;
      }
      state.y += 0.05;
    }

    sectionHeading("Professional Profile");
    const summaryLines = pdf.splitTextToSize(profile.summary, usableWidth);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.4);
    pdf.setTextColor(30,48,54);
    pdf.text(summaryLines, margin, state.y);
    state.y += summaryLines.length * 0.16 + 0.14;

    sectionHeading("Education");
    addBulletLines(profile.education);

    sectionHeading("Experience");
    addBulletLines(profile.experience);

    sectionHeading("Research & Project Experience");
    state.y += 0.04;

    for (const project of projects) {
      await addProjectToLongCvPdf(pdf, state, project, imgCount, pageWidth, pageHeight, margin);
    }

    if (cv$("include-publications")?.checked && cvData.publications.length) {
      sectionHeading("Publications");
      addBulletLines(cvData.publications.map((p) =>
        `${p.year || ""} — ${p.title}. ${p.authors || ""}. ${p.journal || ""}. ${p.doi ? `DOI: ${p.doi}` : ""}`
      ));
    }

    if (cv$("include-conferences")?.checked && cvData.conferences.length) {
      sectionHeading("Conferences / Workshops");
      addBulletLines(cvData.conferences.map((c) =>
        `${c.year || ""} — ${c.title}. ${c.event || ""}. ${c.location || ""}`
      ));
    }

    sectionHeading("Research & Work Interests");
    addBulletLines(profile.interests);

    sectionHeading("Honors & Distinctions");
    addBulletLines(profile.honors);

    sectionHeading("Professional Memberships");
    addBulletLines(profile.memberships);

    sectionHeading("Certifications");
    addBulletLines(profile.certifications);

    sectionHeading("Technical Skills");
    addBulletLines(profile.skills);

    sectionHeading("Languages");
    addBulletLines(profile.languages);

    pdf.save(`${sanitizeFileName(profile.name)}_Long_CV_with_Images.pdf`);
  }

  async function generateLongCv() {
    if (!cvLoaded) await loadAllData();

    const items = selectedProjects();
    if (!items.length) {
      setStatus("Please select at least one project for the Long CV.", "error");
      return;
    }

    setStatus("Generating Long CV with project images...");
    try {
      await generateLongCvDocx(items);
      await sleep(300);
      await generateLongCvPdf(items);
      setStatus("Long CV with images generated.", "success");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Long CV generation failed.", "error");
    }
  }

  async function generatePortfolio() {
    if (!cvLoaded) await loadAllData();
    const items = selectedProjects();
    if (!items.length) {
      setStatus("Please select at least one project for the portfolio.", "error");
      return;
    }

    const includeConferences = Boolean(cv$("portfolio-include-conferences")?.checked);
    setStatus("Generating long portfolio. Loading gallery images may take a moment...");
    try {
      const format = cv$("portfolio-format")?.value || "both";
      if (format === "pptx" || format === "both") await generatePortfolioPptx(items, includeConferences);
      if (format === "pdf" || format === "both") await generatePortfolioPdf(items, includeConferences);
      setStatus("Long portfolio generated.", "success");
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Portfolio generation failed.", "error");
    }
  }

  function wireEvents() {
    document.querySelectorAll('.admin-tab[data-tab="cv"]').forEach((button) => {
      button.addEventListener("click", () => loadAllData());
    });

    cv$("cv-refresh-data")?.addEventListener("click", () => loadAllData(true));
    cv$("generate-academic-cv")?.addEventListener("click", () => generateCvBoth("academic"));
    cv$("generate-engineering-cv")?.addEventListener("click", () => generateCvBoth("engineering"));
    cv$("generate-europass-cv")?.addEventListener("click", () => generateCvBoth("europass"));
    cv$("generate-long-cv")?.addEventListener("click", generateLongCv);
    cv$("generate-portfolio")?.addEventListener("click", generatePortfolio);

    cv$("select-all-projects")?.addEventListener("click", () => {
      document.querySelectorAll(".cv-project-check").forEach((c) => c.checked = true);
    });

    cv$("select-featured-projects")?.addEventListener("click", () => {
      document.querySelectorAll(".cv-project-check").forEach((c) => {
        const p = cvData.projects.find((x) => x.id === Number(c.value));
        c.checked = Boolean(p?.featured);
      });
    });
  }

  wireEvents();

  // Visible diagnostic marker for cache verification.
  window.__ARASH_CV_ENGINE_VERSION__ = "v10.0";
  const originalCvTabHandler = () => {
    const status = document.getElementById("cv-status");
    if (status && !status.textContent) {
      status.textContent = "CV/Portfolio engine v10.0 loaded.";
      status.className = "form-message success";
    }
  };
  document.querySelectorAll('.admin-tab[data-tab="cv"]').forEach((btn) => {
    btn.addEventListener("click", originalCvTabHandler, { once: true });
  });
})();