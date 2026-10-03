const ADMIN_API = "https://arash-api.arash-pashazadeh1.workers.dev";
const SECRET_KEY = "arash_admin_session_secret";

let adminSecret = sessionStorage.getItem(SECRET_KEY) || "";
let mediaStorageReady = false;
let stripeCheckoutReady = false;
let caches = { publications: [], projects: [], conferences: [], library: [] };
let galleryCaches = { project: [], conference: [], library: [] };

const $ = (id) => document.getElementById(id);

function authHeaders(jsonBody = true) {
  const headers = { Authorization: `Bearer ${adminSecret}` };
  if (jsonBody) headers["Content-Type"] = "application/json";
  return headers;
}

function setMessage(id, text, type = "") {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`.trim();
}

async function adminFetch(path, options = {}) {
  const response = await fetch(`${ADMIN_API}${path}`, {
    ...options,
    headers: {
      ...authHeaders(options.body !== undefined),
      ...(options.headers || {})
    }
  });

  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

async function adminBinaryFetch(path, blob, filename) {
  const response = await fetch(`${ADMIN_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${adminSecret}`,
      "Content-Type": blob.type || "image/webp",
      "X-File-Name": encodeURIComponent(filename || "image.webp")
    },
    body: blob
  });

  let data = null;
  try { data = await response.json(); } catch {}
  if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
  return data;
}

async function publicFetch(path) {
  const sep = path.includes("?") ? "&" : "?";
  const response = await fetch(`${ADMIN_API}${path}${sep}t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) {
    let data = null;
    try { data = await response.json(); } catch {}
    throw new Error(data?.error || `HTTP ${response.status}`);
  }
  return response.json();
}

function updateMediaStorageBadges() {
  ["project", "conference", "library"].forEach((type) => {
    const badge = $(`${type}-gallery-status`);
    if (!badge) return;
    badge.textContent = mediaStorageReady ? "Telegram media connected" : "Telegram media not connected";
    badge.classList.toggle("ready", mediaStorageReady);
  });
  const paymentBadge = $("library-payment-status");
  if (paymentBadge) {
    paymentBadge.textContent = stripeCheckoutReady ? "Stripe connected" : "Stripe not configured";
    paymentBadge.classList.toggle("ready", stripeCheckoutReady);
  }
}

function showDashboard() {
  $("admin-login").hidden = true;
  $("admin-dashboard").hidden = false;
  updateMediaStorageBadges();
  refreshAll();
}

function showLogin() {
  $("admin-login").hidden = false;
  $("admin-dashboard").hidden = true;
}

async function verifySecret(secret) {
  adminSecret = secret;
  const ping = await adminFetch("/admin/ping", { method: "GET" });
  mediaStorageReady = Boolean(ping.media_storage);
  stripeCheckoutReady = Boolean(ping.stripe_checkout);
  sessionStorage.setItem(SECRET_KEY, secret);
  showDashboard();
}

$("admin-login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("admin-login-message", "Checking…");
  try {
    await verifySecret($("admin-secret").value);
    setMessage("admin-login-message", "");
  } catch (error) {
    adminSecret = "";
    sessionStorage.removeItem(SECRET_KEY);
    setMessage("admin-login-message", error.message, "error");
  }
});

$("admin-logout")?.addEventListener("click", () => {
  adminSecret = "";
  mediaStorageReady = false;
  stripeCheckoutReady = false;
  sessionStorage.removeItem(SECRET_KEY);
  showLogin();
});

if (adminSecret) {
  verifySecret(adminSecret).catch(() => {
    adminSecret = "";
    sessionStorage.removeItem(SECRET_KEY);
    showLogin();
  });
} else {
  showLogin();
}

// Tabs
for (const button of document.querySelectorAll(".admin-tab")) {
  button.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((b) => b.classList.toggle("active", b === button));
    document.querySelectorAll(".admin-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === button.dataset.tab);
    });
  });
}

document.querySelectorAll("[data-refresh]").forEach((button) => {
  button.addEventListener("click", () => refreshResource(button.dataset.refresh));
});

function adminItem(item, resource, subtitle) {
  const row = document.createElement("div");
  row.className = "admin-item";

  const info = document.createElement("div");
  const heading = document.createElement("h4");
  heading.textContent = item.title;
  const paragraph = document.createElement("p");
  paragraph.textContent = subtitle;
  info.append(heading, paragraph);

  const actions = document.createElement("div");
  actions.className = "admin-item-actions";

  const edit = document.createElement("button");
  edit.type = "button";
  edit.textContent = "Edit";
  edit.addEventListener("click", () => editItem(resource, item));

  const del = document.createElement("button");
  del.type = "button";
  del.className = "danger";
  del.textContent = "Delete";
  del.addEventListener("click", () => deleteItem(resource, item));

  actions.append(edit, del);
  row.append(info, actions);
  return row;
}

async function refreshResource(resource) {
  const map = {
    publications: ["/publications", "admin-publications"],
    projects: ["/projects", "admin-projects"],
    conferences: ["/conferences", "admin-conferences"],
    library: ["/admin/library", "admin-library"]
  };

  const [path, id] = map[resource];
  const el = $(id);
  if (!el) return;
  el.innerHTML = '<div class="data-loading">Loading…</div>';

  try {
    const rows = resource === "library"
      ? await adminFetch(path, { method: "GET" })
      : await publicFetch(path);
    caches[resource] = rows;
    el.innerHTML = "";

    rows.forEach((item) => {
      let subtitle = "";
      if (resource === "publications") {
        subtitle = [item.year, item.journal, item.status, item.featured ? "Featured" : ""].filter(Boolean).join(" · ");
      }
      if (resource === "projects") {
        subtitle = [item.category, item.kind, item.status, item.featured ? "Featured" : ""].filter(Boolean).join(" · ");
      }
      if (resource === "conferences") {
        subtitle = [item.year, item.event, item.type, item.featured ? "Featured" : ""].filter(Boolean).join(" · ");
      }
      if (resource === "library") {
        const price = `${(Number(item.price_cents || 0) / 100).toFixed(2)} ${item.currency || "USD"}`;
        subtitle = [item.item_type === "design_notebook" ? "Design notebook" : "Book", item.year, price, item.published ? "Published" : "Draft", item.featured ? "Featured" : ""].filter(Boolean).join(" · ");
      }
      el.appendChild(adminItem(item, resource, subtitle));
    });

    if (!rows.length) el.innerHTML = '<div class="data-loading">No entries yet.</div>';
    refreshTranslationItemOptions();
  } catch (error) {
    el.innerHTML = `<div class="posts-error">${error.message}</div>`;
  }
}

async function refreshAll() {
  await Promise.all([
    refreshResource("publications"),
    refreshResource("projects"),
    refreshResource("conferences"),
    refreshResource("library")
  ]);
}

async function deleteItem(resource, item) {
  const hasGallery = resource === "projects" || resource === "conferences" || resource === "library";
  const extra = hasGallery ? " All gallery images for this item will also be deleted." : "";
  if (!confirm(`Delete “${item.title}”?${extra}`)) return;

  try {
    await adminFetch(`/admin/${resource}/${item.id}`, { method: "DELETE" });
    await refreshResource(resource);
  } catch (error) {
    alert(error.message);
  }
}

function editItem(resource, item) {
  document.querySelector(`.admin-tab[data-tab="${resource === "library" ? "library" : resource.slice(0, -1)}"]`)?.click();
  if (resource === "publications") fillPublication(item);
  if (resource === "projects") fillProject(item);
  if (resource === "conferences") fillConference(item);
  if (resource === "library") fillLibrary(item);

  window.scrollTo({
    top: document.querySelector(".admin-panel.active").offsetTop - 90,
    behavior: "smooth"
  });
}

// -----------------------------------------------------
// Publications
// -----------------------------------------------------
function resetPublication() {
  $("publication-form").reset();
  $("publication-id").value = "";
  $("publication-form-title").textContent = "Add publication";
  setMessage("publication-message", "");
}

function fillPublication(item) {
  $("publication-id").value = item.id;
  $("pub-doi").value = item.doi || "";
  $("pub-title").value = item.title || "";
  $("pub-authors").value = item.authors || "";
  $("pub-journal").value = item.journal || "";
  $("pub-year").value = item.year || "";
  $("pub-status").value = item.status || "Published";
  $("pub-url").value = item.url || "";
  $("pub-pdf").value = item.pdf_url || "";
  $("pub-abstract").value = item.abstract || "";
  $("pub-featured").checked = Boolean(item.featured);
  $("publication-form-title").textContent = "Edit publication";
}

$("publication-reset")?.addEventListener("click", resetPublication);

$("doi-lookup")?.addEventListener("click", async () => {
  const doi = $("pub-doi").value.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  if (!doi) {
    setMessage("publication-message", "Enter a DOI first.", "error");
    return;
  }

  setMessage("publication-message", "Looking up DOI…");
  try {
    const response = await fetch(`${ADMIN_API}/doi?doi=${encodeURIComponent(doi)}`);
    const item = await response.json();
    if (!response.ok) throw new Error(item.error || "DOI lookup failed");

    $("pub-doi").value = item.doi || doi;
    $("pub-title").value = item.title || "";
    $("pub-authors").value = item.authors || "";
    $("pub-journal").value = item.journal || "";
    $("pub-year").value = item.year || "";
    $("pub-url").value = item.url || `https://doi.org/${doi}`;
    setMessage("publication-message", "DOI data loaded. Review it, then Save.", "success");
  } catch (error) {
    setMessage("publication-message", error.message, "error");
  }
});

$("publication-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("publication-id").value;
  const body = {
    doi: $("pub-doi").value.trim(),
    title: $("pub-title").value.trim(),
    authors: $("pub-authors").value.trim(),
    journal: $("pub-journal").value.trim(),
    year: Number($("pub-year").value) || null,
    status: $("pub-status").value,
    url: $("pub-url").value.trim(),
    pdf_url: $("pub-pdf").value.trim(),
    abstract: $("pub-abstract").value.trim(),
    featured: $("pub-featured").checked
  };

  setMessage("publication-message", "Saving…");
  try {
    await adminFetch(id ? `/admin/publications/${id}` : "/admin/publications", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body)
    });
    setMessage("publication-message", "Saved. The public site is updated automatically.", "success");
    resetPublication();
    await refreshResource("publications");
  } catch (error) {
    setMessage("publication-message", error.message, "error");
  }
});

// -----------------------------------------------------
// Shared gallery manager
// -----------------------------------------------------
function galleryEntityId(entityType) {
  const idMap = { project: "project-id", conference: "conference-id", library: "library-id" };
  return Number($(idMap[entityType])?.value || 0);
}

function setGalleryEnabled(entityType, enabled) {
  const input = $(`${entityType}-gallery-files`);
  const button = $(`${entityType}-upload-images`);
  if (input) input.disabled = !enabled;
  if (button) button.disabled = !enabled;

  const dropzone = $(`${entityType}-dropzone`);
  if (dropzone) dropzone.classList.toggle("disabled", !enabled);

  if (!enabled) {
    const gallery = $(`${entityType}-admin-gallery`);
    if (gallery) gallery.innerHTML = "";
  }
}

async function loadAdminGallery(entityType, entityId) {
  const gallery = $(`${entityType}-admin-gallery`);
  if (!gallery) return;

  if (!entityId) {
    setGalleryEnabled(entityType, false);
    gallery.innerHTML = '<div class="gallery-empty">Save this item first to enable photo uploads.</div>';
    return;
  }

  if (!mediaStorageReady) {
    setGalleryEnabled(entityType, false);
    gallery.innerHTML = '<div class="gallery-empty">Telegram media storage is not connected yet. Create a private media channel, add the bot as admin, and post: MEDIA SETUP</div>';
    return;
  }

  setGalleryEnabled(entityType, true);
  gallery.innerHTML = '<div class="data-loading">Loading gallery…</div>';

  try {
    const rows = await publicFetch(`/gallery?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`);
    galleryCaches[entityType] = rows;
    renderAdminGallery(entityType, entityId, rows);
  } catch (error) {
    gallery.innerHTML = `<div class="posts-error">${error.message}</div>`;
  }
}

function renderAdminGallery(entityType, entityId, rows) {
  const gallery = $(`${entityType}-admin-gallery`);
  gallery.innerHTML = "";

  if (!rows.length) {
    gallery.innerHTML = '<div class="gallery-empty">No photos yet. Upload your first image above.</div>';
    return;
  }

  rows.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "admin-gallery-card";
    card.dataset.mediaId = item.id;

    const visual = document.createElement("div");
    visual.className = "admin-gallery-visual";
    const image = document.createElement("img");
    image.src = item.url;
    image.alt = item.alt_text || item.caption || item.original_name || "Gallery image";
    image.loading = "lazy";
    visual.appendChild(image);

    if (item.is_cover) {
      const badge = document.createElement("span");
      badge.className = "cover-badge";
      badge.textContent = "Cover";
      visual.appendChild(badge);
    }

    const body = document.createElement("div");
    body.className = "admin-gallery-body";

    const captionLabel = document.createElement("label");
    captionLabel.textContent = "Caption";
    const caption = document.createElement("textarea");
    caption.rows = 2;
    caption.value = item.caption || "";
    captionLabel.appendChild(caption);

    const altLabel = document.createElement("label");
    altLabel.textContent = "Alt text";
    const alt = document.createElement("input");
    alt.type = "text";
    alt.value = item.alt_text || "";
    altLabel.appendChild(alt);

    const controls = document.createElement("div");
    controls.className = "admin-gallery-actions";

    const save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save text";
    save.addEventListener("click", async () => {
      try {
        await updateGalleryItem(item.id, {
          caption: caption.value.trim(),
          alt_text: alt.value.trim(),
          sort_order: index,
          is_cover: Boolean(item.is_cover)
        });
        setMessage(`${entityType}-gallery-message`, "Image details saved.", "success");
        await loadAdminGallery(entityType, entityId);
      } catch (error) {
        setMessage(`${entityType}-gallery-message`, error.message, "error");
      }
    });

    const cover = document.createElement("button");
    cover.type = "button";
    cover.textContent = item.is_cover ? "Current cover" : "Set cover";
    cover.disabled = Boolean(item.is_cover);
    cover.addEventListener("click", async () => {
      try {
        await updateGalleryItem(item.id, {
          caption: caption.value.trim(),
          alt_text: alt.value.trim(),
          sort_order: index,
          is_cover: true
        });
        setMessage(`${entityType}-gallery-message`, "Cover image updated.", "success");
        await loadAdminGallery(entityType, entityId);
        await refreshResource(entityType === "project" ? "projects" : entityType === "conference" ? "conferences" : "library");
      } catch (error) {
        setMessage(`${entityType}-gallery-message`, error.message, "error");
      }
    });

    const up = document.createElement("button");
    up.type = "button";
    up.textContent = "←";
    up.title = "Move earlier";
    up.disabled = index === 0;
    up.addEventListener("click", () => moveGalleryItem(entityType, entityId, index, -1));

    const down = document.createElement("button");
    down.type = "button";
    down.textContent = "→";
    down.title = "Move later";
    down.disabled = index === rows.length - 1;
    down.addEventListener("click", () => moveGalleryItem(entityType, entityId, index, 1));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "danger";
    del.textContent = "Delete";
    del.addEventListener("click", async () => {
      if (!confirm("Delete this image permanently?")) return;
      try {
        await adminFetch(`/admin/media/${item.id}`, { method: "DELETE" });
        setMessage(`${entityType}-gallery-message`, "Image deleted.", "success");
        await loadAdminGallery(entityType, entityId);
        await refreshResource(entityType === "project" ? "projects" : entityType === "conference" ? "conferences" : "library");
      } catch (error) {
        setMessage(`${entityType}-gallery-message`, error.message, "error");
      }
    });

    controls.append(up, down, save, cover, del);
    body.append(captionLabel, altLabel, controls);
    card.append(visual, body);
    gallery.appendChild(card);
  });
}

async function updateGalleryItem(mediaId, body) {
  return adminFetch(`/admin/media/${mediaId}`, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

async function moveGalleryItem(entityType, entityId, index, direction) {
  const rows = galleryCaches[entityType] || [];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= rows.length) return;

  const current = rows[index];
  const target = rows[targetIndex];

  try {
    await Promise.all([
      updateGalleryItem(current.id, {
        caption: current.caption || "",
        alt_text: current.alt_text || "",
        sort_order: targetIndex,
        is_cover: Boolean(current.is_cover)
      }),
      updateGalleryItem(target.id, {
        caption: target.caption || "",
        alt_text: target.alt_text || "",
        sort_order: index,
        is_cover: Boolean(target.is_cover)
      })
    ]);
    await loadAdminGallery(entityType, entityId);
  } catch (error) {
    setMessage(`${entityType}-gallery-message`, error.message, "error");
  }
}

async function optimizeImage(file) {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} is not an image.`);
  if (file.type === "image/gif") return { blob: file, filename: file.name };

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bitmap = await createImageBitmap(file);
  }

  const maxDimension = 1800;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  if (!blob) return { blob: file, filename: file.name };

  const base = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-") || "image";
  return { blob, filename: `${base}.webp` };
}

async function uploadSelectedImages(entityType) {
  const entityId = galleryEntityId(entityType);
  const input = $(`${entityType}-gallery-files`);
  const button = $(`${entityType}-upload-images`);

  if (!entityId) {
    setMessage(`${entityType}-gallery-message`, `Save the ${entityType} first.`, "error");
    return;
  }
  if (!mediaStorageReady) {
    setMessage(`${entityType}-gallery-message`, "Telegram media storage is not connected. Post MEDIA SETUP in the private media channel first.", "error");
    return;
  }

  const files = Array.from(input?.files || []);
  if (!files.length) {
    setMessage(`${entityType}-gallery-message`, "Choose one or more images first.", "error");
    return;
  }

  button.disabled = true;
  let uploaded = 0;

  try {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      setMessage(
        `${entityType}-gallery-message`,
        `Optimizing and uploading ${i + 1} of ${files.length}: ${file.name}…`
      );

      const optimized = await optimizeImage(file);
      if (optimized.blob.size > 8 * 1024 * 1024) {
        throw new Error(`${file.name} is still larger than 8 MB after optimization.`);
      }

      await adminBinaryFetch(
        `/admin/media?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`,
        optimized.blob,
        optimized.filename
      );
      uploaded += 1;
    }

    input.value = "";
    setMessage(`${entityType}-gallery-message`, `${uploaded} image${uploaded === 1 ? "" : "s"} uploaded.`, "success");
    await loadAdminGallery(entityType, entityId);
    await refreshResource(entityType === "project" ? "projects" : entityType === "conference" ? "conferences" : "library");
  } catch (error) {
    setMessage(`${entityType}-gallery-message`, error.message, "error");
  } finally {
    button.disabled = false;
  }
}

function setupDropzone(entityType) {
  const zone = $(`${entityType}-dropzone`);
  const input = $(`${entityType}-gallery-files`);
  if (!zone || !input) return;

  ["dragenter", "dragover"].forEach((eventName) => {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      if (!zone.classList.contains("disabled")) zone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    zone.addEventListener(eventName, (event) => {
      event.preventDefault();
      zone.classList.remove("dragging");
    });
  });

  zone.addEventListener("drop", (event) => {
    if (zone.classList.contains("disabled")) return;
    const files = Array.from(event.dataTransfer?.files || []).filter((file) => file.type.startsWith("image/"));
    if (!files.length) return;
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    input.files = dt.files;
    setMessage(`${entityType}-gallery-message`, `${files.length} image${files.length === 1 ? "" : "s"} selected.`);
  });

  input.addEventListener("change", () => {
    const count = input.files?.length || 0;
    if (count) setMessage(`${entityType}-gallery-message`, `${count} image${count === 1 ? "" : "s"} selected.`);
  });
}

setupDropzone("project");
setupDropzone("conference");
setupDropzone("library");
$("project-upload-images")?.addEventListener("click", () => uploadSelectedImages("project"));
$("conference-upload-images")?.addEventListener("click", () => uploadSelectedImages("conference"));
$("library-upload-images")?.addEventListener("click", () => uploadSelectedImages("library"));

// -----------------------------------------------------
// Projects
// -----------------------------------------------------
function resetProject() {
  $("project-form").reset();
  $("project-id").value = "";
  $("project-form-title").textContent = "Add project";
  $("project-image-preview").hidden = true;
  setMessage("project-message", "");
  setMessage("project-gallery-message", "");
  setGalleryEnabled("project", false);
  $("project-admin-gallery").innerHTML = '<div class="gallery-empty">Save this item first to enable photo uploads.</div>';
}

function fillProject(item) {
  $("project-id").value = item.id;
  $("proj-title").value = item.title || "";
  $("proj-category").value = item.category || "";
  $("proj-kind").value = item.kind || "research";
  $("proj-status").value = item.status || "";
  $("proj-featured").checked = Boolean(item.featured);
  $("proj-start-year").value = item.start_year || "";
  $("proj-end-year").value = item.end_year || "";
  $("proj-summary").value = item.summary || "";
  $("proj-description").value = item.description || "";
  $("proj-methods").value = item.methods || "";
  $("proj-image").value = item.image_url || "";
  $("proj-url").value = item.project_url || "";
  $("project-form-title").textContent = "Edit project";
  updateImagePreview();
  loadAdminGallery("project", item.id);
}

function updateImagePreview() {
  const url = $("proj-image")?.value.trim();
  const box = $("project-image-preview");
  if (!box) return;
  if (url) {
    box.hidden = false;
    box.querySelector("img").src = url;
  } else {
    box.hidden = true;
  }
}

$("proj-image")?.addEventListener("input", updateImagePreview);
$("project-reset")?.addEventListener("click", resetProject);

$("project-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("project-id").value;
  const body = {
    title: $("proj-title").value.trim(),
    category: $("proj-category").value.trim(),
    kind: $("proj-kind").value,
    status: $("proj-status").value.trim(),
    featured: $("proj-featured").checked,
    start_year: Number($("proj-start-year").value) || null,
    end_year: Number($("proj-end-year").value) || null,
    summary: $("proj-summary").value.trim(),
    description: $("proj-description").value.trim(),
    methods: $("proj-methods").value.trim(),
    image_url: $("proj-image").value.trim(),
    project_url: $("proj-url").value.trim()
  };

  setMessage("project-message", "Saving…");
  try {
    const result = await adminFetch(id ? `/admin/projects/${id}` : "/admin/projects", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body)
    });

    const savedId = Number(id || result.id);
    $("project-id").value = savedId;
    $("project-form-title").textContent = "Edit project";
    setMessage("project-message", "Saved. You can upload project photos below.", "success");
    await refreshResource("projects");
    await loadAdminGallery("project", savedId);
  } catch (error) {
    setMessage("project-message", error.message, "error");
  }
});

// -----------------------------------------------------
// Conferences
// -----------------------------------------------------
function resetConference() {
  $("conference-form").reset();
  $("conference-id").value = "";
  $("conference-form-title").textContent = "Add conference";
  setMessage("conference-message", "");
  setMessage("conference-gallery-message", "");
  setGalleryEnabled("conference", false);
  $("conference-admin-gallery").innerHTML = '<div class="gallery-empty">Save this item first to enable photo uploads.</div>';
}

function fillConference(item) {
  $("conference-id").value = item.id;
  $("conf-title").value = item.title || "";
  $("conf-event").value = item.event || "";
  $("conf-type").value = item.type || "";
  $("conf-year").value = item.year || "";
  $("conf-location").value = item.location || "";
  $("conf-description").value = item.description || "";
  $("conf-url").value = item.url || "";
  $("conf-featured").checked = Boolean(item.featured);
  $("conference-form-title").textContent = "Edit conference";
  loadAdminGallery("conference", item.id);
}

$("conference-reset")?.addEventListener("click", resetConference);

$("conference-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("conference-id").value;
  const body = {
    title: $("conf-title").value.trim(),
    event: $("conf-event").value.trim(),
    type: $("conf-type").value.trim(),
    year: Number($("conf-year").value) || null,
    location: $("conf-location").value.trim(),
    description: $("conf-description").value.trim(),
    url: $("conf-url").value.trim(),
    featured: $("conf-featured").checked
  };

  setMessage("conference-message", "Saving…");
  try {
    const result = await adminFetch(id ? `/admin/conferences/${id}` : "/admin/conferences", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body)
    });

    const savedId = Number(id || result.id);
    $("conference-id").value = savedId;
    $("conference-form-title").textContent = "Edit conference";
    setMessage("conference-message", "Saved. You can upload conference photos below.", "success");
    await refreshResource("conferences");
    await loadAdminGallery("conference", savedId);
  } catch (error) {
    setMessage("conference-message", error.message, "error");
  }
});

// Initial gallery state.
setGalleryEnabled("project", false);
setGalleryEnabled("conference", false);
setGalleryEnabled("library", false);


// V11: allow old cv-builder.html bookmarks to open the integrated CV tab.
window.addEventListener("load", () => {
  if (location.hash === "#cv") {
    const cvTab = document.querySelector('.admin-tab[data-tab="cv"]');
    if (cvTab) setTimeout(() => cvTab.click(), 120);
  }
});




// -----------------------------------------------------
// Library
// -----------------------------------------------------
function resetLibrary() {
  $("library-form")?.reset();
  if ($("library-id")) $("library-id").value = "";
  if ($("lib-currency")) $("lib-currency").value = "USD";
  if ($("lib-published")) $("lib-published").checked = true;
  if ($("library-form-title")) $("library-form-title").textContent = "Add library item";
  setMessage("library-message", "");
  setMessage("library-gallery-message", "");
  setMessage("library-protected-file-message", "");
  setGalleryEnabled("library", false);
  if ($("library-admin-gallery")) $("library-admin-gallery").innerHTML = '<div class="gallery-empty">Save this item first to enable photo uploads.</div>';
  if ($("library-protected-file")) $("library-protected-file").value = "";
  if ($("library-protected-file-info")) $("library-protected-file-info").textContent = "Save this Library item first.";
  if ($("library-upload-protected-file")) $("library-upload-protected-file").disabled = true;
  if ($("library-delete-protected-file")) $("library-delete-protected-file").disabled = true;
}

function fillLibrary(item) {
  $("library-id").value = item.id;
  $("lib-title").value = item.title || "";
  $("lib-author").value = item.author || "";
  $("lib-type").value = item.item_type || "book";
  $("lib-year").value = item.year || "";
  $("lib-currency").value = item.currency || "USD";
  $("lib-price").value = (Number(item.price_cents || 0) / 100).toFixed(2);
  $("lib-featured").checked = Boolean(item.featured);
  $("lib-published").checked = Boolean(item.published);
  $("lib-summary").value = item.summary || "";
  $("lib-description").value = item.description || "";
  $("lib-cover").value = item.cover_url || "";
  $("lib-preview").value = item.preview_url || "";
  $("lib-purchase").value = item.purchase_url || "";
  $("library-form-title").textContent = "Edit library item";
  loadAdminGallery("library", item.id);
  loadLibraryProtectedFile(item.id);
}

$("library-reset")?.addEventListener("click", resetLibrary);
$("library-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = $("library-id").value;
  const price = Math.max(0, Number($("lib-price").value) || 0);
  const body = {
    title: $("lib-title").value.trim(),
    author: $("lib-author").value.trim(),
    item_type: $("lib-type").value,
    year: Number($("lib-year").value) || null,
    currency: ($("lib-currency").value.trim() || "USD").toUpperCase(),
    price_cents: Math.round(price * 100),
    featured: $("lib-featured").checked,
    published: $("lib-published").checked,
    summary: $("lib-summary").value.trim(),
    description: $("lib-description").value.trim(),
    cover_url: $("lib-cover").value.trim(),
    preview_url: $("lib-preview").value.trim(),
    purchase_url: $("lib-purchase").value.trim()
  };
  setMessage("library-message", "Saving…");
  try {
    const result = await adminFetch(id ? `/admin/library/${id}` : "/admin/library", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(body)
    });
    const savedId = Number(id || result.id);
    $("library-id").value = savedId;
    $("library-form-title").textContent = "Edit library item";
    setMessage("library-message", "Saved. Add cover images or the protected paid PDF if needed.", "success");
    await refreshResource("library");
    await loadAdminGallery("library", savedId);
    await loadLibraryProtectedFile(savedId);
  } catch (error) {
    setMessage("library-message", error.message, "error");
  }
});


async function loadLibraryProtectedFile(itemId) {
  const info = $("library-protected-file-info");
  const upload = $("library-upload-protected-file");
  const remove = $("library-delete-protected-file");
  if (!itemId) {
    if (info) info.textContent = "Save this Library item first.";
    if (upload) upload.disabled = true;
    if (remove) remove.disabled = true;
    return;
  }
  if (upload) upload.disabled = false;
  setMessage("library-protected-file-message", "Checking protected file…");
  try {
    const data = await adminFetch(`/admin/library-file?library_id=${encodeURIComponent(itemId)}`, { method: "GET" });
    if (data.configured && data.file) {
      const mb = Number(data.file.file_size || 0) / (1024 * 1024);
      if (info) info.textContent = `Protected file: ${data.file.original_name || "PDF"}${mb ? ` · ${mb.toFixed(2)} MB` : ""}`;
      if (remove) remove.disabled = false;
      setMessage("library-protected-file-message", stripeCheckoutReady
        ? "Protected PDF ready for Stripe delivery."
        : "Protected PDF uploaded. Configure Stripe before accepting payments.", stripeCheckoutReady ? "success" : "");
    } else {
      if (info) info.textContent = "No protected PDF uploaded yet.";
      if (remove) remove.disabled = true;
      setMessage("library-protected-file-message", "");
    }
  } catch (error) {
    if (info) info.textContent = "Unable to read protected-file status.";
    if (remove) remove.disabled = true;
    setMessage("library-protected-file-message", error.message, "error");
  }
}

$("library-upload-protected-file")?.addEventListener("click", async () => {
  const itemId = Number($("library-id")?.value || 0);
  const file = $("library-protected-file")?.files?.[0];
  if (!itemId) {
    setMessage("library-protected-file-message", "Save the Library item first.", "error");
    return;
  }
  if (!file) {
    setMessage("library-protected-file-message", "Choose a PDF first.", "error");
    return;
  }
  if (file.type && file.type !== "application/pdf") {
    setMessage("library-protected-file-message", "Only PDF files are allowed.", "error");
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    setMessage("library-protected-file-message", "PDF is larger than the configured 20 MB limit.", "error");
    return;
  }
  setMessage("library-protected-file-message", "Uploading protected PDF…");
  try {
    await adminBinaryFetch(`/admin/library-file?library_id=${encodeURIComponent(itemId)}`, file, file.name || "library-file.pdf");
    $("library-protected-file").value = "";
    await loadLibraryProtectedFile(itemId);
  } catch (error) {
    setMessage("library-protected-file-message", error.message, "error");
  }
});

$("library-delete-protected-file")?.addEventListener("click", async () => {
  const itemId = Number($("library-id")?.value || 0);
  if (!itemId) return;
  if (!confirm("Remove the protected paid PDF for this Library item?")) return;
  setMessage("library-protected-file-message", "Removing protected PDF…");
  try {
    await adminFetch(`/admin/library-file?library_id=${encodeURIComponent(itemId)}`, { method: "DELETE" });
    await loadLibraryProtectedFile(itemId);
  } catch (error) {
    setMessage("library-protected-file-message", error.message, "error");
  }
});

// -----------------------------------------------------
// Multilingual database translations
// -----------------------------------------------------
const translationFieldMap = {
  project: { secondary:["category","Category"], summary:["summary","Short summary"], description:["description","Full description"], extra:["methods","Methods / keywords"], status:["status","Status"] },
  conference: { secondary:["event","Event / Organization"], summary:null, description:["description","Description"], extra:["location","Location"], status:["type","Type"] },
  publication: { secondary:["journal","Journal / Venue"], summary:["abstract","Abstract / Note"], description:null, extra:null, status:["status","Status"] }
};

function translationCacheFor(type) {
  return type === "project" ? caches.projects : type === "conference" ? caches.conferences : caches.publications;
}
function refreshTranslationItemOptions() {
  const type = $("tr-entity-type")?.value || "project";
  const select = $("tr-entity-id");
  if (!select) return;
  const previous = select.value;
  select.innerHTML = '<option value="">Choose an item</option>';
  translationCacheFor(type).forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item.title || `#${item.id}`;
    select.appendChild(option);
  });
  if ([...select.options].some((o) => o.value === previous)) select.value = previous;
  updateTranslationFieldLabels();
}
function toggleTranslationField(name, config) {
  const wrap = $(`tr-${name}-wrap`);
  if (!wrap) return;
  wrap.hidden = !config;
  if (config) {
    const label = $(`tr-${name}-label`);
    if (label) label.textContent = config[1];
  }
}
function updateTranslationFieldLabels() {
  const type = $("tr-entity-type")?.value || "project";
  const map = translationFieldMap[type];
  toggleTranslationField("secondary", map.secondary);
  toggleTranslationField("summary", map.summary);
  toggleTranslationField("description", map.description);
  toggleTranslationField("extra", map.extra);
  toggleTranslationField("status", map.status);
}
function clearTranslationInputs() {
  ["tr-title","tr-secondary","tr-summary","tr-description","tr-extra","tr-status"].forEach((id) => { if ($(id)) $(id).value = ""; });
  setMessage("translation-message", "");
}
async function loadTranslation() {
  clearTranslationInputs();
  updateTranslationFieldLabels();
  const type = $("tr-entity-type")?.value;
  const entityId = Number($("tr-entity-id")?.value || 0);
  const lang = $("tr-lang")?.value || "fa";
  if (!entityId) return;
  setMessage("translation-message", "Loading translation…");
  try {
    const result = await adminFetch(`/admin/translations?entity_type=${encodeURIComponent(type)}&entity_id=${entityId}&lang=${encodeURIComponent(lang)}`, { method:"GET" });
    const data = result.data || {};
    const map = translationFieldMap[type];
    $("tr-title").value = data.title || "";
    if (map.secondary) $("tr-secondary").value = data[map.secondary[0]] || "";
    if (map.summary) $("tr-summary").value = data[map.summary[0]] || "";
    if (map.description) $("tr-description").value = data[map.description[0]] || "";
    if (map.extra) $("tr-extra").value = data[map.extra[0]] || "";
    if (map.status) $("tr-status").value = data[map.status[0]] || "";
    setMessage("translation-message", result.updated_at ? `Loaded. Last update: ${result.updated_at}` : "No translation saved yet.");
  } catch (error) {
    setMessage("translation-message", error.message, "error");
  }
}
$("tr-entity-type")?.addEventListener("change", () => { refreshTranslationItemOptions(); clearTranslationInputs(); });
$("tr-entity-id")?.addEventListener("change", loadTranslation);
document.querySelectorAll("[data-tr-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-tr-lang]").forEach((b) => b.classList.toggle("active", b === button));
    $("tr-lang").value = button.dataset.trLang;
    loadTranslation();
  });
});
$("translation-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const type = $("tr-entity-type").value;
  const entityId = Number($("tr-entity-id").value || 0);
  const lang = $("tr-lang").value;
  if (!entityId) { setMessage("translation-message", "Choose an item first.", "error"); return; }
  const map = translationFieldMap[type];
  const data = { title: $("tr-title").value.trim() };
  if (map.secondary) data[map.secondary[0]] = $("tr-secondary").value.trim();
  if (map.summary) data[map.summary[0]] = $("tr-summary").value.trim();
  if (map.description) data[map.description[0]] = $("tr-description").value.trim();
  if (map.extra) data[map.extra[0]] = $("tr-extra").value.trim();
  if (map.status) data[map.status[0]] = $("tr-status").value.trim();
  setMessage("translation-message", "Saving…");
  try {
    await adminFetch("/admin/translations", { method:"PUT", body:JSON.stringify({ entity_type:type, entity_id:entityId, lang, data }) });
    setMessage("translation-message", "Translation saved. The localized public page updates automatically.", "success");
  } catch (error) {
    setMessage("translation-message", error.message, "error");
  }
});

// =====================================================
// PRIVATE ANALYTICS DASHBOARD
// =====================================================
let analyticsLoaded = false;

function analyticsText(value){
  return String(value ?? "");
}

function renderAnalyticsRanked(id, rows, labelKey, valueKey="count"){
  const container = $(id);
  if(!container) return;
  container.innerHTML = "";
  if(!rows?.length){
    container.innerHTML = '<div class="data-loading">No data yet.</div>';
    return;
  }
  rows.forEach((row, index)=>{
    const item=document.createElement("div");
    item.className="analytics-ranked-item";
    const label=document.createElement("span");
    label.textContent=`${index+1}. ${analyticsText(row[labelKey] || "Unknown")}`;
    const value=document.createElement("strong");
    value.textContent=analyticsText(row[valueKey] || 0);
    item.append(label,value);
    container.appendChild(item);
  });
}

function shortReferrer(value){
  if(!value) return "Direct";
  try{
    const u=new URL(value);
    return u.hostname.replace(/^www\./,"") || value;
  }catch{
    return value;
  }
}

async function loadAnalytics(){
  const tbody=$("analytics-visits");
  if(!tbody) return;
  setMessage("analytics-message","Loading analytics…");

  try{
    const days=Number($("analytics-days")?.value || 30);
    const data=await adminFetch(`/admin/analytics?days=${encodeURIComponent(days)}&limit=250`,{method:"GET"});

    $("analytics-pageviews").textContent=data.summary?.pageviews ?? 0;
    $("analytics-visitors").textContent=data.summary?.unique_visitors ?? 0;
    $("analytics-countries-count").textContent=data.summary?.country_count ?? 0;
    $("analytics-ip-mode").textContent=data.raw_ip_storage ? "Raw IP" : "Masked";

    renderAnalyticsRanked("analytics-countries",data.countries || [],"country");
    renderAnalyticsRanked("analytics-pages",data.pages || [],"path");

    tbody.innerHTML="";
    const visits=data.visits || [];
    if(!visits.length){
      tbody.innerHTML='<tr><td colspan="6">No visits recorded in this period yet.</td></tr>';
    }else{
      visits.forEach((visit)=>{
        const tr=document.createElement("tr");
        const when=document.createElement("td");
        const dt=new Date(visit.visited_at);
        when.textContent=Number.isNaN(dt.getTime()) ? analyticsText(visit.visited_at) : dt.toLocaleString();

        const page=document.createElement("td");
        page.textContent=visit.path || "/";

        const location=document.createElement("td");
        location.textContent=[visit.city,visit.region,visit.country].filter(Boolean).join(", ") || "Unknown";

        const ip=document.createElement("td");
        ip.textContent=visit.ip_address || "—";

        const ref=document.createElement("td");
        ref.textContent=shortReferrer(visit.referrer);

        const ua=document.createElement("td");
        ua.textContent=visit.user_agent || "—";

        tr.append(when,page,location,ip,ref,ua);
        tbody.appendChild(tr);
      });
    }

    analyticsLoaded=true;
    setMessage("analytics-message",`Showing the last ${days} days.`,"success");
  }catch(error){
    console.error("ANALYTICS LOAD ERROR",error);
    tbody.innerHTML='<tr><td colspan="6">Analytics backend is not ready yet.</td></tr>';
    setMessage("analytics-message",error.message || "Analytics could not be loaded.","error");
  }
}

$("analytics-refresh")?.addEventListener("click",loadAnalytics);
$("analytics-days")?.addEventListener("change",loadAnalytics);

document.querySelector('.admin-tab[data-tab="analytics"]')?.addEventListener("click",()=>{
  if(!analyticsLoaded) loadAnalytics();
});
