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

const telegramContainer =
  document.getElementById("telegram-posts");

const telegramRefreshButton =
  document.getElementById("feed-refresh");

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

function createTelegramPostCard(post) {
  const article = document.createElement("article");
  article.className = "telegram-post-card";

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

  const text = document.createElement("p");
  text.className = "telegram-post-text";
  text.dir = "auto";

  if (post.text && String(post.text).trim()) {
    text.textContent = post.text;
  } else {
    text.textContent =
      "Media update published on Telegram.";
    text.classList.add("is-empty");
  }

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

  article.appendChild(header);
  article.appendChild(text);
  article.appendChild(footer);

  return article;
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
    telegramContainer.innerHTML = "";

    if (!Array.isArray(posts) || posts.length === 0) {
      const empty = document.createElement("div");
      empty.className = "posts-empty";
      empty.textContent =
        "No engineering insights have been published yet.";
      telegramContainer.appendChild(empty);
      return;
    }

    posts.forEach((post) => {
      telegramContainer.appendChild(
        createTelegramPostCard(post)
      );
    });

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

loadTelegramPosts();

// Refresh every 60 seconds while the page is open.
setInterval(() => {
  if (document.visibilityState === "visible") {
    loadTelegramPosts({ silent: true });
  }
}, 60000);
