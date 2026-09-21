const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const year = document.getElementById('year');

year.textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.site-nav a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));



// =====================================================
// TELEGRAM / CIVIL ENGINEERING INSIGHTS
// =====================================================

const TELEGRAM_API_URL =
  "https://arash-api.arash-pashazadeh1.workers.dev/posts";

const telegramContainer =
  document.getElementById("telegram-posts");


// -----------------------------------------------------
// FORMAT DATE
// -----------------------------------------------------

function formatTelegramDate(dateString) {

  const date = new Date(dateString);

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric"
    }
  ).format(date);
}


// -----------------------------------------------------
// CREATE TELEGRAM POST CARD
// -----------------------------------------------------

function createTelegramPostCard(post) {

  const article =
    document.createElement("article");

  article.className =
    "telegram-post-card";


  // -----------------------------
  // HEADER
  // -----------------------------

  const header =
    document.createElement("div");

  header.className =
    "telegram-post-header";


  const source =
    document.createElement("div");

  source.className =
    "telegram-source";


  const icon =
    document.createElement("div");

  icon.className =
    "telegram-icon";

  icon.textContent = "TG";


  const sourceText =
    document.createElement("div");

  sourceText.className =
    "telegram-source-text";


  const sourceName =
    document.createElement("strong");

  sourceName.textContent =
    "Civil Engineering Insights";


  const channel =
    document.createElement("span");

  channel.textContent =
    "@" + post.channel_username;


  sourceText.appendChild(sourceName);
  sourceText.appendChild(channel);

  source.appendChild(icon);
  source.appendChild(sourceText);


  const date =
    document.createElement("span");

  date.className =
    "telegram-post-date";

  date.textContent =
    formatTelegramDate(post.posted_at);


  header.appendChild(source);
  header.appendChild(date);


  // -----------------------------
  // POST BODY
  // -----------------------------

  const text =
    document.createElement("p");

  text.className =
    "telegram-post-text";

  text.dir = "auto";

  text.textContent =
    post.text || "Media post";


  // -----------------------------
  // FOOTER
  // -----------------------------

  const footer =
    document.createElement("div");

  footer.className =
    "telegram-post-footer";


  const link =
    document.createElement("a");

  link.className =
    "telegram-post-link";

  link.target =
    "_blank";

  link.rel =
    "noopener noreferrer";

  link.textContent =
    "Open original post →";

  link.href =
    `https://t.me/${post.channel_username}/${post.telegram_message_id}`;


  footer.appendChild(link);


  // -----------------------------
  // BUILD CARD
  // -----------------------------

  article.appendChild(header);
  article.appendChild(text);
  article.appendChild(footer);

  return article;
}


// -----------------------------------------------------
// LOAD POSTS
// -----------------------------------------------------

async function loadTelegramPosts() {

  if (!telegramContainer) {
    return;
  }

  try {

    const response =
      await fetch(
        TELEGRAM_API_URL,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {
      throw new Error(
        "Unable to load posts"
      );
    }


    const posts =
      await response.json();


    telegramContainer.innerHTML = "";


    if (!Array.isArray(posts) ||
        posts.length === 0) {

      telegramContainer.innerHTML =
        `
        <div class="posts-empty">
          No engineering insights published yet.
        </div>
        `;

      return;
    }


    // Display latest 6 posts
    posts
      .slice(0, 6)
      .forEach(post => {

        const card =
          createTelegramPostCard(post);

        telegramContainer
          .appendChild(card);
      });


  } catch (error) {

    console.error(
      "Telegram feed error:",
      error
    );

    telegramContainer.innerHTML =
      `
      <div class="posts-error">
        Engineering insights are temporarily unavailable.
      </div>
      `;
  }
}


// Load automatically
loadTelegramPosts();
