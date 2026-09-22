const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => {
  revealObserver.observe(el);
});

// =====================================================
// LIVE CIVIL ENGINEERING INSIGHTS / TELEGRAM FEED
// =====================================================

const TELEGRAM_API_URL =
  "https://arash-api.arash-pashazadeh1.workers.dev/posts";

const TELEGRAM_MEDIA_URL =
  "https://arash-api.arash-pashazadeh1.workers.dev/media";

const telegramContainer =
  document.getElementById("telegram-posts");

const telegramRefreshButton =
  document.getElementById("feed-refresh");

const telegramFilterButton =
  document.getElementById("feed-filter-toggle");

let cachedTelegramPosts = [];
let showAllTelegramPosts = false;

function formatTelegramDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function extractHashtags(text = "") {
  const matches = String(text).match(/#[\p{L}\p{N}_-]+/gu);
  return matches ? [...new Set(matches)] : [];
}

function inferCategory(text = "", hashtags = []) {
  if (hashtags.length > 0) {
    return hashtags[0].replace(/^#/, "").replace(/_/g, " ");
  }

  const t = String(text).toLowerCase();

  if (t.includes("digital twin")) return "Digital Twin";
  if (/\b(ai|artificial intelligence|machine learning|deep learning)\b/.test(t)) return "AI";
  if (/\b(concrete|cement|admixture)\b/.test(t)) return "Concrete";
  if (/\b(hydraulic|hydraulics|water resources|flow|river)\b/.test(t)) return "Hydraulics";
  if (/\b(coastal|marine|oyster|wave|mooring|offshore)\b/.test(t)) return "Coastal";
  if (/\b(bridge|structure|structural|beam|column)\b/.test(t)) return "Structures";
  if (/\b(3d print|3d printing|construction|robotic construction)\b/.test(t)) return "Construction";
  if (/\b(sensor|imu|monitoring|instrumentation)\b/.test(t)) return "Monitoring";

  return "Civil Engineering";
}

function cleanTextForBody(text = "") {
  return String(text)
    .replace(/#[\p{L}\p{N}_-]+/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function deriveTitle(text = "", category = "Civil Engineering") {
  const cleaned = cleanTextForBody(text);

  if (!cleaned) {
    return category;
  }

  const firstLine = cleaned.split(/\n+/)[0].trim();
  const firstSentence = firstLine.split(/(?<=[.!?])\s+/)[0].trim();
  const candidate = firstSentence || firstLine;

  if (candidate.length <= 82) {
    return candidate;
  }

  return candidate.slice(0, 79).trimEnd() + "…";
}

function deriveBody(text = "", title = "") {
  const cleaned = cleanTextForBody(text);

  if (!cleaned) {
    return "";
  }

  if (cleaned === title) {
    return "";
  }

  if (cleaned.startsWith(title)) {
    return cleaned.slice(title.length).replace(/^[\s:–—-]+/, "").trim();
  }

  return cleaned;
}

function isSubstantivePost(post) {
  const text = String(post.text || "").trim();
  const hashtags = extractHashtags(text);

  if (post.media_file_id) return true;
  if (hashtags.length > 0) return true;
  if (text.length >= 20) return true;

  return false;
}

function createChip(label, className = "") {
  const chip = document.createElement("span");
  chip.className = `telegram-chip ${className}`.trim();
  chip.textContent = label;
  return chip;
}

function createTelegramPostCard(post) {
  const article = document.createElement("article");
  article.className = "telegram-post-card";

  const rawText = String(post.text || "");
  const hashtags = extractHashtags(rawText);
  const category = inferCategory(rawText, hashtags);
  const titleText = deriveTitle(rawText, category);
  const bodyText = deriveBody(rawText, titleText);

  // Media
  if (post.media_file_id) {
    const mediaWrap = document.createElement("a");
    mediaWrap.className = "telegram-media";
    mediaWrap.target = "_blank";
    mediaWrap.rel = "noopener noreferrer";

    const channelName =
      post.channel_username || "ArashCivilEngineering";

    mediaWrap.href =
      `https://t.me/${encodeURIComponent(channelName)}/${encodeURIComponent(post.telegram_message_id)}`;

    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = titleText;
    img.src =
      `${TELEGRAM_MEDIA_URL}?file_id=${encodeURIComponent(post.media_file_id)}`;

    img.addEventListener("error", () => {
      mediaWrap.remove();
    });

    mediaWrap.appendChild(img);
    article.appendChild(mediaWrap);
  }

  const content = document.createElement("div");
  content.className = "telegram-post-content";

  // Meta header
  const header = document.createElement("div");
  header.className = "telegram-post-header";

  const source = document.createElement("div");
  source.className = "telegram-source";

  const icon = document.createElement("div");
  icon.className = "telegram-icon";
  icon.textContent = "TG";
  icon.setAttribute("aria-hidden", "true");

  const sourceText = document.createElement("div");
  sourceText.className = "telegram-source-text";

  const sourceName = document.createElement("strong");
  sourceName.textContent = "Civil Engineering Insights";

  const channelName =
    post.channel_username || "ArashCivilEngineering";

  const channel = document.createElement("span");
  channel.textContent = `@${channelName}`;

  sourceText.appendChild(sourceName);
  sourceText.appendChild(channel);
  source.appendChild(icon);
  source.appendChild(sourceText);

  const date = document.createElement("span");
  date.className = "telegram-post-date";
  date.textContent = formatTelegramDate(post.posted_at);

  header.appendChild(source);
  header.appendChild(date);

  // Chips
  const chips = document.createElement("div");
  chips.className = "telegram-chip-row";
  chips.appendChild(createChip(category, "category-chip"));

  hashtags.slice(0, 4).forEach((tag) => {
    chips.appendChild(createChip(tag, "hashtag-chip"));
  });

  // Title
  const title = document.createElement("h3");
  title.className = "telegram-post-title";
  title.dir = "auto";
  title.textContent = titleText;

  // Body
  const body = document.createElement("p");
  body.className = "telegram-post-text";
  body.dir = "auto";

  if (bodyText) {
    body.textContent = bodyText;
  } else if (!rawText.trim()) {
    body.textContent = "Media update published on Telegram.";
    body.classList.add("is-empty");
  } else {
    body.classList.add("compact");
  }

  // Footer
  const footer = document.createElement("div");
  footer.className = "telegram-post-footer";

  const link = document.createElement("a");
  link.className = "telegram-post-link";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Open original post ↗";
  link.href =
    `https://t.me/${encodeURIComponent(channelName)}/${encodeURIComponent(post.telegram_message_id)}`;

  const messageId = document.createElement("span");
  messageId.className = "telegram-post-id";
  messageId.textContent =
    `#${post.telegram_message_id ?? ""}`;

  footer.appendChild(link);
  footer.appendChild(messageId);

  content.appendChild(header);
  content.appendChild(chips);
  content.appendChild(title);

  if (bodyText || !rawText.trim()) {
    content.appendChild(body);
  }

  content.appendChild(footer);
  article.appendChild(content);

  return article;
}

function renderTelegramPosts() {
  if (!telegramContainer) return;

  telegramContainer.innerHTML = "";

  const postsToShow = showAllTelegramPosts
    ? cachedTelegramPosts
    : cachedTelegramPosts.filter(isSubstantivePost);

  if (postsToShow.length === 0) {
    const empty = document.createElement("div");
    empty.className = "posts-empty";
    empty.textContent =
      showAllTelegramPosts
        ? "No Telegram posts have been published yet."
        : "No engineering posts are available yet. Use “Show all posts” to include short test posts.";
    telegramContainer.appendChild(empty);
    return;
  }

  postsToShow.forEach((post) => {
    telegramContainer.appendChild(
      createTelegramPostCard(post)
    );
  });
}

async function loadTelegramPosts({ silent = false } = {}) {
  if (!telegramContainer) return;

  if (telegramRefreshButton) {
    telegramRefreshButton.disabled = true;
    telegramRefreshButton.textContent = "Refreshing...";
  }

  if (!silent) {
    telegramContainer.setAttribute("aria-busy", "true");
  }

  try {
    const response = await fetch(
      `${TELEGRAM_API_URL}?t=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: { "Accept": "application/json" }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const posts = await response.json();

    cachedTelegramPosts =
      Array.isArray(posts) ? posts : [];

    renderTelegramPosts();

  } catch (error) {
    console.error("Telegram feed error:", error);

    if (!silent || telegramContainer.children.length === 0) {
      telegramContainer.innerHTML = "";

      const errorBox = document.createElement("div");
      errorBox.className = "posts-error";
      errorBox.textContent =
        "Engineering insights are temporarily unavailable. Please try again shortly.";

      telegramContainer.appendChild(errorBox);
    }

  } finally {
    telegramContainer.setAttribute("aria-busy", "false");

    if (telegramRefreshButton) {
      telegramRefreshButton.disabled = false;
      telegramRefreshButton.textContent = "Refresh feed";
    }
  }
}

if (telegramRefreshButton) {
  telegramRefreshButton.addEventListener("click", () => {
    loadTelegramPosts();
  });
}

if (telegramFilterButton) {
  telegramFilterButton.addEventListener("click", () => {
    showAllTelegramPosts = !showAllTelegramPosts;

    telegramFilterButton.setAttribute(
      "aria-pressed",
      String(showAllTelegramPosts)
    );

    telegramFilterButton.textContent =
      showAllTelegramPosts
        ? "Hide test posts"
        : "Show all posts";

    renderTelegramPosts();
  });
}

loadTelegramPosts();

setInterval(() => {
  if (document.visibilityState === "visible") {
    loadTelegramPosts({ silent: true });
  }
}, 60000);
