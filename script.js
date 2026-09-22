const API_BASE = "https://arash-api.arash-pashazadeh1.workers.dev";
const TELEGRAM_API_URL = `${API_BASE}/posts`;
const TELEGRAM_MEDIA_URL = `${API_BASE}/media`;

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".site-nav a").forEach((link) => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
function observeReveals(scope=document){ scope.querySelectorAll(".reveal:not(.visible)").forEach((el)=>revealObserver.observe(el)); }
observeReveals();

async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}${path.includes("?") ? "&" : "?"}t=${Date.now()}`, {cache:"no-store", headers:{Accept:"application/json"}});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
function escapeText(value){ return String(value ?? ""); }
function clear(el){ if(el) el.innerHTML=""; }
function showError(el, message="Content is temporarily unavailable."){
  if(!el) return; clear(el); const d=document.createElement("div"); d.className="posts-error"; d.textContent=message; el.appendChild(d);
}
function splitMethods(value=""){ return String(value).split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean); }
function yearLabel(item){ if(item.start_year && item.end_year) return `${item.start_year}–${item.end_year}`; if(item.start_year) return `${item.start_year}–Present`; return item.status || ""; }

function createProjectRow(item){
  const article=document.createElement("article"); article.className="project-row reveal";
  const kicker=document.createElement("div"); kicker.className="project-kicker"; kicker.textContent=item.category || (item.kind ? item.kind[0].toUpperCase()+item.kind.slice(1) : "Project");
  const body=document.createElement("div");
  const title=document.createElement("h3"); const a=document.createElement("a"); a.href=`project.html?id=${encodeURIComponent(item.id)}`; a.textContent=item.title; title.appendChild(a);
  const p=document.createElement("p"); p.textContent=item.summary || ""; body.append(title,p);
  const method=document.createElement("div"); method.className="project-method"; const methods=splitMethods(item.methods); method.innerHTML="";
  [...methods.slice(0,3), yearLabel(item)].filter(Boolean).forEach((m)=>{const span=document.createElement("div");span.textContent=m;method.appendChild(span);});
  article.append(kicker,body,method); return article;
}
function createProjectCard(item){
  const card=document.createElement("article"); card.className="data-card reveal";
  const media=document.createElement("div"); media.className="data-card-media";
  if(item.image_url){const img=document.createElement("img");img.loading="lazy";img.alt=item.title;img.src=item.image_url;img.addEventListener("error",()=>{media.classList.add("placeholder");img.remove();});media.appendChild(img);} else {media.classList.add("placeholder");}
  const body=document.createElement("div"); body.className="data-card-body";
  const meta=document.createElement("div");meta.className="data-card-meta";meta.innerHTML=`<span></span><span></span>`;meta.children[0].textContent=item.category||item.kind||"Project";meta.children[1].textContent=yearLabel(item);
  const h=document.createElement("h3");h.textContent=item.title;const p=document.createElement("p");p.textContent=item.summary||"";
  const chips=document.createElement("div");chips.className="chip-row";splitMethods(item.methods).slice(0,4).forEach(m=>{const s=document.createElement("span");s.textContent=m;chips.appendChild(s);});
  const foot=document.createElement("div");foot.className="data-card-footer";const link=document.createElement("a");link.href=`project.html?id=${encodeURIComponent(item.id)}`;link.textContent="View project →";const status=document.createElement("span");status.className="status-pill";status.textContent=item.status||"Project";foot.append(link,status);
  body.append(meta,h,p,chips,foot);card.append(media,body);return card;
}
function publicationCitation(item){ const parts=[]; if(item.authors) parts.push(item.authors); if(item.year) parts.push(`(${item.year}).`); if(item.title) parts.push(`${item.title}.`); if(item.journal) parts.push(item.journal+"."); if(item.doi) parts.push(`https://doi.org/${item.doi}`); return parts.join(" "); }
function createPublicationCard(item){
  const card=document.createElement("article");card.className="publication-card reveal";
  const y=document.createElement("div");y.className="publication-year";y.textContent=item.year||"—";
  const body=document.createElement("div");body.className="publication-body";const h=document.createElement("h3");
  if(item.url||item.doi){const a=document.createElement("a");a.target="_blank";a.rel="noopener noreferrer";a.href=item.url||(item.doi?`https://doi.org/${item.doi}`:"#");a.textContent=item.title;h.appendChild(a);}else h.textContent=item.title;
  const authors=document.createElement("p");authors.className="publication-authors";authors.textContent=item.authors||"";const venue=document.createElement("p");venue.className="publication-venue";venue.textContent=[item.journal,item.status].filter(Boolean).join(" · ");body.append(h,authors,venue);if(item.abstract){const note=document.createElement("p");note.className="publication-note";note.textContent=item.abstract;body.appendChild(note);}
  const actions=document.createElement("div");actions.className="publication-actions";
  if(item.doi){const doi=document.createElement("a");doi.className="mini-button";doi.href=`https://doi.org/${item.doi}`;doi.target="_blank";doi.rel="noopener noreferrer";doi.textContent="DOI";actions.appendChild(doi);}
  if(item.pdf_url){const pdf=document.createElement("a");pdf.className="mini-button";pdf.href=item.pdf_url;pdf.target="_blank";pdf.rel="noopener noreferrer";pdf.textContent="PDF";actions.appendChild(pdf);}
  const cite=document.createElement("button");cite.className="mini-button";cite.type="button";cite.textContent="Cite";cite.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(publicationCitation(item));cite.textContent="Copied";setTimeout(()=>cite.textContent="Cite",1200);}catch{cite.textContent="Copy failed";}});actions.appendChild(cite);
  card.append(y,body,actions);return card;
}
function createConferenceCard(item){
  const card=document.createElement("article");card.className="conference-card reveal";const type=document.createElement("span");type.className="conference-type";type.textContent=item.type||"Academic Event";const h=document.createElement("h3");h.textContent=item.title;const p=document.createElement("p");p.textContent=item.description||"";const meta=document.createElement("div");meta.className="conference-meta";[item.event,item.location,item.year].filter(Boolean).forEach(v=>{const s=document.createElement("span");s.textContent=v;meta.appendChild(s);});card.append(type,h,p,meta);if(item.url){const a=document.createElement("a");a.className="conference-link";a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Event / material ↗";card.appendChild(a);}return card;
}

async function loadHomeContent(){
  const projectsEl=document.getElementById("home-featured-projects");
  if(projectsEl){try{let rows=await apiGet("/projects?featured=1&kind=research&limit=4");if(!rows.length) rows=await apiGet("/projects?kind=research&limit=4");clear(projectsEl);rows.forEach(r=>projectsEl.appendChild(createProjectRow(r)));if(!rows.length) showError(projectsEl,"No research projects have been added yet.");observeReveals(projectsEl);}catch{showError(projectsEl);}}
  const pubsEl=document.getElementById("home-publications");
  if(pubsEl){try{let rows=await apiGet("/publications?featured=1&limit=3");if(!rows.length) rows=await apiGet("/publications?limit=3");clear(pubsEl);rows.forEach(r=>pubsEl.appendChild(createPublicationCard(r)));if(!rows.length) showError(pubsEl,"No publications have been added yet.");observeReveals(pubsEl);}catch{showError(pubsEl);}}
  const confEl=document.getElementById("home-conferences");
  if(confEl){try{let rows=await apiGet("/conferences?featured=1&limit=3");if(!rows.length) rows=await apiGet("/conferences?limit=3");clear(confEl);rows.forEach(r=>confEl.appendChild(createConferenceCard(r)));if(!rows.length) showError(confEl,"No conference entries have been added yet.");observeReveals(confEl);}catch{showError(confEl);}}
}
loadHomeContent();

let allProjectsCache=[];
async function loadProjectPages(){
  const researchEl=document.getElementById("research-projects");
  const allEl=document.getElementById("all-projects");
  if(!researchEl && !allEl) return;
  try{allProjectsCache=await apiGet("/projects");
    if(researchEl){const search=document.getElementById("project-search"), status=document.getElementById("project-status-filter");[...new Set(allProjectsCache.filter(x=>x.kind==="research").map(x=>x.status).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;status.appendChild(o);});const render=()=>{clear(researchEl);const q=(search.value||"").toLowerCase();const s=status.value;const rows=allProjectsCache.filter(x=>x.kind==="research").filter(x=>(!q||`${x.title} ${x.summary} ${x.category} ${x.methods}`.toLowerCase().includes(q))&&(!s||x.status===s));rows.forEach(r=>researchEl.appendChild(createProjectRow(r)));if(!rows.length)showError(researchEl,"No matching research projects.");observeReveals(researchEl);};search.addEventListener("input",render);status.addEventListener("change",render);render();}
    if(allEl){const search=document.getElementById("all-project-search"),kind=document.getElementById("project-kind-filter"),category=document.getElementById("project-category-filter");[...new Set(allProjectsCache.map(x=>x.category).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;category.appendChild(o);});const render=()=>{clear(allEl);const q=(search.value||"").toLowerCase();const k=kind.value,c=category.value;const rows=allProjectsCache.filter(x=>(!q||`${x.title} ${x.summary} ${x.category} ${x.methods}`.toLowerCase().includes(q))&&(!k||x.kind===k)&&(!c||x.category===c));rows.forEach(r=>allEl.appendChild(createProjectCard(r)));if(!rows.length)showError(allEl,"No matching projects.");observeReveals(allEl);};[search,kind,category].forEach(el=>el.addEventListener(el.tagName==="INPUT"?"input":"change",render));render();}
  }catch{showError(researchEl||allEl);}
}
loadProjectPages();

async function loadProjectDetail(){
  const el=document.getElementById("project-detail");if(!el)return;const id=new URLSearchParams(location.search).get("id");if(!id){showError(el,"Project ID is missing.");return;}
  try{const rows=await apiGet(`/projects?id=${encodeURIComponent(id)}`);const item=Array.isArray(rows)?rows[0]:rows;if(!item){showError(el,"Project not found.");return;}clear(el);
    const main=document.createElement("article");main.className="project-detail-main";if(item.image_url){const img=document.createElement("img");img.className="project-detail-image";img.src=item.image_url;img.alt=item.title;main.appendChild(img);}const copy=document.createElement("div");copy.className="project-detail-copy";const e=document.createElement("p");e.className="eyebrow";e.textContent=item.category||item.kind||"Project";const h=document.createElement("h1");h.textContent=item.title;const s=document.createElement("p");s.className="summary";s.textContent=item.summary||"";copy.append(e,h,s);const chips=document.createElement("div");chips.className="chip-row";splitMethods(item.methods).forEach(m=>{const sp=document.createElement("span");sp.textContent=m;chips.appendChild(sp);});copy.appendChild(chips);if(item.description){const d=document.createElement("p");d.className="project-detail-description";d.textContent=item.description;copy.appendChild(d);}if(item.project_url){const a=document.createElement("a");a.className="btn btn-primary";a.href=item.project_url;a.target="_blank";a.rel="noopener noreferrer";a.textContent="External project link ↗";a.style.marginTop="24px";copy.appendChild(a);}main.appendChild(copy);
    const side=document.createElement("aside");side.className="project-detail-side";[["Type",item.kind],["Status",item.status],["Category",item.category],["Period",yearLabel(item)]].filter(x=>x[1]).forEach(([k,v])=>{const f=document.createElement("div");f.className="detail-fact";const sp=document.createElement("span");sp.textContent=k;const st=document.createElement("strong");st.textContent=v;f.append(sp,st);side.appendChild(f);});el.append(main,side);
  }catch{showError(el);}
}
loadProjectDetail();

async function loadPublications(){
  const el=document.getElementById("publications-list");if(!el)return;try{const rows=await apiGet("/publications");const search=document.getElementById("publication-search"),yearF=document.getElementById("publication-year-filter"),statusF=document.getElementById("publication-status-filter");[...new Set(rows.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;yearF.appendChild(o);});[...new Set(rows.map(x=>x.status).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;statusF.appendChild(o);});const render=()=>{clear(el);const q=(search.value||"").toLowerCase(),y=yearF.value,s=statusF.value;const filtered=rows.filter(x=>(!q||`${x.title} ${x.authors} ${x.journal} ${x.doi}`.toLowerCase().includes(q))&&(!y||String(x.year)===y)&&(!s||x.status===s));filtered.forEach(r=>el.appendChild(createPublicationCard(r)));if(!filtered.length)showError(el,"No matching publications.");observeReveals(el);};search.addEventListener("input",render);yearF.addEventListener("change",render);statusF.addEventListener("change",render);render();}catch{showError(el);}
}
loadPublications();

async function loadConferences(){
  const el=document.getElementById("conferences-list");if(!el)return;try{const rows=await apiGet("/conferences");const search=document.getElementById("conference-search"),yearF=document.getElementById("conference-year-filter");[...new Set(rows.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;yearF.appendChild(o);});const render=()=>{clear(el);const q=(search.value||"").toLowerCase(),y=yearF.value;const filtered=rows.filter(x=>(!q||`${x.title} ${x.event} ${x.location} ${x.description}`.toLowerCase().includes(q))&&(!y||String(x.year)===y));filtered.forEach(r=>el.appendChild(createConferenceCard(r)));if(!filtered.length)showError(el,"No matching conference entries.");observeReveals(el);};search.addEventListener("input",render);yearF.addEventListener("change",render);render();}catch{showError(el);}
}
loadConferences();

// =====================================================
// LIVE TELEGRAM FEED
// =====================================================
const telegramContainer=document.getElementById("telegram-posts");
const telegramRefreshButton=document.getElementById("feed-refresh");
const telegramFilterButton=document.getElementById("feed-filter-toggle");
let cachedTelegramPosts=[];let showAllTelegramPosts=false;
function formatTelegramDate(dateString){const date=new Date(dateString);if(Number.isNaN(date.getTime()))return"";return new Intl.DateTimeFormat("en-US",{year:"numeric",month:"short",day:"numeric"}).format(date);}
function extractHashtags(text=""){const matches=String(text).match(/#[\p{L}\p{N}_-]+/gu);return matches?[...new Set(matches)]:[];}
function inferCategory(text="",hashtags=[]){if(hashtags.length)return hashtags[0].replace(/^#/,"").replace(/_/g," ");const t=String(text).toLowerCase();if(t.includes("digital twin"))return"Digital Twin";if(/\b(ai|artificial intelligence|machine learning|deep learning)\b/.test(t))return"AI";if(/\b(concrete|cement|admixture)\b/.test(t))return"Concrete";if(/\b(hydraulic|hydraulics|water resources|flow|river)\b/.test(t))return"Hydraulics";if(/\b(coastal|marine|oyster|wave|mooring|offshore)\b/.test(t))return"Coastal";if(/\b(bridge|structure|structural|beam|column)\b/.test(t))return"Structures";if(/\b(3d print|3d printing|construction|robotic construction)\b/.test(t))return"Construction";if(/\b(sensor|imu|monitoring|instrumentation)\b/.test(t))return"Monitoring";return"Civil Engineering";}
function cleanTextForBody(text=""){return String(text).replace(/#[\p{L}\p{N}_-]+/gu,"").replace(/\s{2,}/g," ").trim();}
function deriveTitle(text="",category="Civil Engineering"){const cleaned=cleanTextForBody(text);if(!cleaned)return category;const firstLine=cleaned.split(/\n+/)[0].trim();const firstSentence=firstLine.split(/(?<=[.!?])\s+/)[0].trim();const c=firstSentence||firstLine;return c.length<=82?c:c.slice(0,79).trimEnd()+"…";}
function deriveBody(text="",title=""){const cleaned=cleanTextForBody(text);if(!cleaned||cleaned===title)return"";if(cleaned.startsWith(title))return cleaned.slice(title.length).replace(/^[\s:–—-]+/,"").trim();return cleaned;}
function isSubstantivePost(post){const text=String(post.text||"").trim();return Boolean(post.media_file_id||extractHashtags(text).length||text.length>=20);}
function createChip(label,className=""){const chip=document.createElement("span");chip.className=`telegram-chip ${className}`.trim();chip.textContent=label;return chip;}
function createTelegramPostCard(post){const article=document.createElement("article");article.className="telegram-post-card";const rawText=String(post.text||"");const hashtags=extractHashtags(rawText);const category=inferCategory(rawText,hashtags);const titleText=deriveTitle(rawText,category);const bodyText=deriveBody(rawText,titleText);const channelName=post.channel_username||"ArashCivilEngineering";
  if(post.media_file_id){const mediaWrap=document.createElement("a");mediaWrap.className="telegram-media";mediaWrap.target="_blank";mediaWrap.rel="noopener noreferrer";mediaWrap.href=`https://t.me/${encodeURIComponent(channelName)}/${encodeURIComponent(post.telegram_message_id)}`;const img=document.createElement("img");img.loading="lazy";img.alt=titleText;img.src=`${TELEGRAM_MEDIA_URL}?file_id=${encodeURIComponent(post.media_file_id)}`;img.addEventListener("error",()=>mediaWrap.remove());mediaWrap.appendChild(img);article.appendChild(mediaWrap);}
  const content=document.createElement("div");content.className="telegram-post-content";const header=document.createElement("div");header.className="telegram-post-header";const source=document.createElement("div");source.className="telegram-source";const icon=document.createElement("div");icon.className="telegram-icon";icon.textContent="TG";const sourceText=document.createElement("div");sourceText.className="telegram-source-text";const sourceName=document.createElement("strong");sourceName.textContent="Civil Engineering Insights";const channel=document.createElement("span");channel.textContent=`@${channelName}`;sourceText.append(sourceName,channel);source.append(icon,sourceText);const date=document.createElement("span");date.className="telegram-post-date";date.textContent=formatTelegramDate(post.posted_at);header.append(source,date);
  const chips=document.createElement("div");chips.className="telegram-chip-row";chips.appendChild(createChip(category,"category-chip"));hashtags.slice(0,4).forEach(tag=>chips.appendChild(createChip(tag,"hashtag-chip")));const title=document.createElement("h3");title.className="telegram-post-title";title.dir="auto";title.textContent=titleText;const body=document.createElement("p");body.className="telegram-post-text";body.dir="auto";if(bodyText)body.textContent=bodyText;else if(!rawText.trim()){body.textContent="Media update published on Telegram.";body.classList.add("is-empty");}else body.classList.add("compact");const foot=document.createElement("div");foot.className="telegram-post-footer";const link=document.createElement("a");link.className="telegram-post-link";link.target="_blank";link.rel="noopener noreferrer";link.textContent="Open original post ↗";link.href=`https://t.me/${encodeURIComponent(channelName)}/${encodeURIComponent(post.telegram_message_id)}`;const id=document.createElement("span");id.className="telegram-post-id";id.textContent=`#${post.telegram_message_id??""}`;foot.append(link,id);content.append(header,chips,title);if(bodyText||!rawText.trim())content.appendChild(body);content.appendChild(foot);article.appendChild(content);return article;}
function renderTelegramPosts(){if(!telegramContainer)return;clear(telegramContainer);let posts=showAllTelegramPosts?cachedTelegramPosts:cachedTelegramPosts.filter(isSubstantivePost);const limit=Number(telegramContainer.dataset.limit||0);if(limit>0)posts=posts.slice(0,limit);if(!posts.length){showError(telegramContainer,showAllTelegramPosts?"No Telegram posts have been published yet.":"No engineering posts are available yet.");return;}posts.forEach(p=>telegramContainer.appendChild(createTelegramPostCard(p)));}
async function loadTelegramPosts({silent=false}={}){if(!telegramContainer)return;if(telegramRefreshButton){telegramRefreshButton.disabled=true;telegramRefreshButton.textContent="Refreshing...";}if(!silent)telegramContainer.setAttribute("aria-busy","true");try{const posts=await apiGet("/posts");cachedTelegramPosts=Array.isArray(posts)?posts:[];renderTelegramPosts();}catch(e){if(!silent||!telegramContainer.children.length)showError(telegramContainer,"Engineering insights are temporarily unavailable.");}finally{telegramContainer.setAttribute("aria-busy","false");if(telegramRefreshButton){telegramRefreshButton.disabled=false;telegramRefreshButton.textContent="Refresh feed";}}}
if(telegramRefreshButton)telegramRefreshButton.addEventListener("click",()=>loadTelegramPosts());
if(telegramFilterButton)telegramFilterButton.addEventListener("click",()=>{showAllTelegramPosts=!showAllTelegramPosts;telegramFilterButton.setAttribute("aria-pressed",String(showAllTelegramPosts));telegramFilterButton.textContent=showAllTelegramPosts?"Hide test posts":"Show all posts";renderTelegramPosts();});
loadTelegramPosts();setInterval(()=>{if(document.visibilityState==="visible")loadTelegramPosts({silent:true});},60000);
