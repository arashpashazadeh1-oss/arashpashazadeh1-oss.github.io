const API_BASE = "https://arash-api.arash-pashazadeh1.workers.dev";
const TELEGRAM_API_URL = `${API_BASE}/posts`;
const TELEGRAM_MEDIA_URL = `${API_BASE}/media`;

const SITE_LANG = (["en","fa","es","de"].includes(document.documentElement.lang) ? document.documentElement.lang : "en");
const SITE_LOCALE = {en:"en-US",fa:"fa-IR",es:"es-ES",de:"de-DE"}[SITE_LANG] || "en-US";
const ASSET_PREFIX = (["fa","es","de"].includes(SITE_LANG) ? "../" : "");
const UI_TEXT = {
  en:{
    contentUnavailable:"Content is temporarily unavailable.",present:"Present",project:"Project",research:"Research",engineering:"Engineering",study:"Study",viewProject:"View project →",academicEvent:"Academic Event",viewDetails:"View details →",eventMaterial:"Event / material ↗",loading:"Loading",noPhoto:"No photo",event:"Event",year:"Year",location:"Location",type:"Type",status:"Status",category:"Category",period:"Period",externalProject:"External project link ↗",projectGallery:"Project Gallery",conferenceGallery:"Conference Gallery",photoGallery:"Photo Gallery",conference:"Conference",missingProjectId:"Project ID is missing.",projectNotFound:"Project not found.",missingConferenceId:"Conference ID is missing.",conferenceNotFound:"Conference entry not found.",noResearch:"No matching research projects.",noProjects:"No matching projects.",noPublications:"No matching publications.",noConferences:"No matching conference entries.",cite:"Cite",copied:"Copied",copyFailed:"Copy failed",civilInsights:"Civil Engineering Insights",openOriginal:"Open original post ↗",mediaUpdate:"Media update published on Telegram.",refreshing:"Refreshing...",refreshFeed:"Refresh feed",showAll:"Show all posts",hideTest:"Hide test posts",noTelegram:"No Telegram posts have been published yet.",noEngineeringPosts:"No engineering posts are available yet.",insightsUnavailable:"Engineering insights are temporarily unavailable.",book:"Book",designNotebook:"Design notebook",libraryItem:"Library item",viewItem:"View details →",preview:"Preview ↗",purchase:"Purchase securely ↗",price:"Price",author:"Author",resourceType:"Resource type",libraryUnavailable:"Library is temporarily unavailable.",noLibrary:"No matching library items.",missingLibraryId:"Library item ID is missing.",libraryNotFound:"Library item not found.",comingSoon:"Checkout coming soon",free:"Free",processingPayment:"Opening secure checkout…",paymentSuccess:"Payment verified. Your protected download is ready.",paymentCancelled:"Payment was cancelled. No charge was completed.",downloadFile:"Download protected PDF",paymentPending:"Payment is still being verified. Refresh this page in a moment.",checkoutUnavailable:"Secure checkout is unavailable for this item.",downloadsRemaining:"Downloads remaining"
  },
  fa:{
    contentUnavailable:"محتوا موقتاً در دسترس نیست.",present:"اکنون",project:"پروژه",research:"پژوهش",engineering:"مهندسی",study:"مطالعه",viewProject:"مشاهده پروژه ←",academicEvent:"رویداد دانشگاهی",viewDetails:"مشاهده جزئیات ←",eventMaterial:"رویداد / محتوا ↗",loading:"در حال بارگذاری",noPhoto:"بدون عکس",event:"رویداد",year:"سال",location:"مکان",type:"نوع",status:"وضعیت",category:"دسته",period:"دوره",externalProject:"لینک خارجی پروژه ↗",projectGallery:"گالری پروژه",conferenceGallery:"گالری کنفرانس",photoGallery:"گالری تصاویر",conference:"کنفرانس",missingProjectId:"شناسه پروژه وجود ندارد.",projectNotFound:"پروژه پیدا نشد.",missingConferenceId:"شناسه رویداد وجود ندارد.",conferenceNotFound:"رویداد پیدا نشد.",noResearch:"پژوهش منطبق پیدا نشد.",noProjects:"پروژه منطبق پیدا نشد.",noPublications:"انتشار منطبق پیدا نشد.",noConferences:"رویداد منطبق پیدا نشد.",cite:"استناد",copied:"کپی شد",copyFailed:"کپی ناموفق بود",civilInsights:"دیدگاه‌های مهندسی عمران",openOriginal:"باز کردن پست اصلی ↗",mediaUpdate:"به‌روزرسانی رسانه‌ای در Telegram منتشر شده است.",refreshing:"در حال به‌روزرسانی...",refreshFeed:"به‌روزرسانی",showAll:"نمایش همه پست‌ها",hideTest:"پنهان کردن پست‌های آزمایشی",noTelegram:"هنوز پستی در Telegram منتشر نشده است.",noEngineeringPosts:"در حال حاضر پست مهندسی در دسترس نیست.",insightsUnavailable:"دیدگاه‌های مهندسی موقتاً در دسترس نیستند.",book:"کتاب",designNotebook:"دفترچه طراحی",libraryItem:"مورد کتابخانه",viewItem:"مشاهده جزئیات ←",preview:"پیش‌نمایش ↗",purchase:"خرید امن ↗",price:"قیمت",author:"نویسنده",resourceType:"نوع منبع",libraryUnavailable:"کتابخانه موقتاً در دسترس نیست.",noLibrary:"مورد منطبق در کتابخانه پیدا نشد.",missingLibraryId:"شناسه مورد کتابخانه وجود ندارد.",libraryNotFound:"مورد کتابخانه پیدا نشد.",comingSoon:"پرداخت به‌زودی فعال می‌شود",free:"رایگان",processingPayment:"در حال باز کردن پرداخت امن…",paymentSuccess:"پرداخت تأیید شد. فایل محافظت‌شده آماده دانلود است.",paymentCancelled:"پرداخت لغو شد و پرداختی تکمیل نشد.",downloadFile:"دانلود PDF محافظت‌شده",paymentPending:"پرداخت هنوز در حال تأیید است. چند لحظه دیگر صفحه را تازه کنید.",checkoutUnavailable:"پرداخت امن برای این مورد در دسترس نیست.",downloadsRemaining:"تعداد دانلود باقی‌مانده"
  },
  es:{
    contentUnavailable:"El contenido no está disponible temporalmente.",present:"Presente",project:"Proyecto",research:"Investigación",engineering:"Ingeniería",study:"Estudio",viewProject:"Ver proyecto →",academicEvent:"Evento académico",viewDetails:"Ver detalles →",eventMaterial:"Evento / material ↗",loading:"Cargando",noPhoto:"Sin foto",event:"Evento",year:"Año",location:"Ubicación",type:"Tipo",status:"Estado",category:"Categoría",period:"Periodo",externalProject:"Enlace externo del proyecto ↗",projectGallery:"Galería del proyecto",conferenceGallery:"Galería de la conferencia",photoGallery:"Galería de fotos",conference:"Conferencia",missingProjectId:"Falta el ID del proyecto.",projectNotFound:"Proyecto no encontrado.",missingConferenceId:"Falta el ID de la conferencia.",conferenceNotFound:"Conferencia no encontrada.",noResearch:"No hay proyectos de investigación coincidentes.",noProjects:"No hay proyectos coincidentes.",noPublications:"No hay publicaciones coincidentes.",noConferences:"No hay conferencias coincidentes.",cite:"Citar",copied:"Copiado",copyFailed:"Error al copiar",civilInsights:"Perspectivas de Ingeniería Civil",openOriginal:"Abrir publicación original ↗",mediaUpdate:"Actualización multimedia publicada en Telegram.",refreshing:"Actualizando...",refreshFeed:"Actualizar feed",showAll:"Mostrar todas las publicaciones",hideTest:"Ocultar publicaciones de prueba",noTelegram:"Aún no hay publicaciones en Telegram.",noEngineeringPosts:"No hay publicaciones de ingeniería disponibles.",insightsUnavailable:"Las perspectivas de ingeniería no están disponibles temporalmente.",book:"Libro",designNotebook:"Cuaderno de diseño",libraryItem:"Recurso",viewItem:"Ver detalles →",preview:"Vista previa ↗",purchase:"Comprar de forma segura ↗",price:"Precio",author:"Autor",resourceType:"Tipo de recurso",libraryUnavailable:"La biblioteca no está disponible temporalmente.",noLibrary:"No hay recursos coincidentes.",missingLibraryId:"Falta el ID del recurso.",libraryNotFound:"Recurso no encontrado.",comingSoon:"Pago próximamente",free:"Gratis",processingPayment:"Abriendo el pago seguro…",paymentSuccess:"Pago verificado. La descarga protegida está lista.",paymentCancelled:"El pago fue cancelado. No se completó ningún cargo.",downloadFile:"Descargar PDF protegido",paymentPending:"El pago todavía se está verificando. Actualiza esta página en un momento.",checkoutUnavailable:"El pago seguro no está disponible para este recurso.",downloadsRemaining:"Descargas restantes"
  },
  de:{
    contentUnavailable:"Der Inhalt ist vorübergehend nicht verfügbar.",present:"Heute",project:"Projekt",research:"Forschung",engineering:"Ingenieurwesen",study:"Studie",viewProject:"Projekt ansehen →",academicEvent:"Akademische Veranstaltung",viewDetails:"Details ansehen →",eventMaterial:"Veranstaltung / Material ↗",loading:"Wird geladen",noPhoto:"Kein Foto",event:"Veranstaltung",year:"Jahr",location:"Ort",type:"Typ",status:"Status",category:"Kategorie",period:"Zeitraum",externalProject:"Externer Projektlink ↗",projectGallery:"Projektgalerie",conferenceGallery:"Konferenzgalerie",photoGallery:"Fotogalerie",conference:"Konferenz",missingProjectId:"Projekt-ID fehlt.",projectNotFound:"Projekt nicht gefunden.",missingConferenceId:"Konferenz-ID fehlt.",conferenceNotFound:"Konferenzeintrag nicht gefunden.",noResearch:"Keine passenden Forschungsprojekte.",noProjects:"Keine passenden Projekte.",noPublications:"Keine passenden Publikationen.",noConferences:"Keine passenden Konferenzeinträge.",cite:"Zitieren",copied:"Kopiert",copyFailed:"Kopieren fehlgeschlagen",civilInsights:"Einblicke ins Bauingenieurwesen",openOriginal:"Originalbeitrag öffnen ↗",mediaUpdate:"Medienupdate auf Telegram veröffentlicht.",refreshing:"Aktualisieren...",refreshFeed:"Feed aktualisieren",showAll:"Alle Beiträge anzeigen",hideTest:"Testbeiträge ausblenden",noTelegram:"Noch keine Telegram-Beiträge veröffentlicht.",noEngineeringPosts:"Keine Engineering-Beiträge verfügbar.",insightsUnavailable:"Engineering-Einblicke sind vorübergehend nicht verfügbar.",book:"Buch",designNotebook:"Planungsheft",libraryItem:"Bibliothekseintrag",viewItem:"Details ansehen →",preview:"Vorschau ↗",purchase:"Sicher kaufen ↗",price:"Preis",author:"Autor",resourceType:"Ressourcentyp",libraryUnavailable:"Die Bibliothek ist vorübergehend nicht verfügbar.",noLibrary:"Keine passenden Bibliothekseinträge.",missingLibraryId:"Bibliothekseintrag-ID fehlt.",libraryNotFound:"Bibliothekseintrag nicht gefunden.",comingSoon:"Checkout folgt in Kürze",free:"Kostenlos",processingPayment:"Sicherer Checkout wird geöffnet…",paymentSuccess:"Zahlung bestätigt. Der geschützte Download ist bereit.",paymentCancelled:"Die Zahlung wurde abgebrochen. Es wurde keine Zahlung abgeschlossen.",downloadFile:"Geschütztes PDF herunterladen",paymentPending:"Die Zahlung wird noch geprüft. Aktualisieren Sie die Seite in Kürze.",checkoutUnavailable:"Sicherer Checkout ist für diesen Eintrag nicht verfügbar.",downloadsRemaining:"Verbleibende Downloads"
  }
};
function t(key){ return UI_TEXT[SITE_LANG]?.[key] ?? UI_TEXT.en[key] ?? key; }
function kindLabel(kind){ const k=String(kind||"").toLowerCase(); return ["research","engineering","study"].includes(k)?t(k):(kind||t("project")); }

// Keep the same query string (e.g. ?id=) when switching language on detail pages.
document.querySelectorAll("[data-lang-link]").forEach((link)=>{
  if(location.search){
    const base=link.getAttribute("href").split("?")[0];
    link.setAttribute("href",base+location.search);
  }
});



const LANGUAGE_FLAGS = {en:"us",fa:"ir",es:"es",de:"de"};
function enhanceLanguageSwitcher(){
  document.querySelectorAll(".language-switcher .language-link").forEach((link)=>{
    if(link.querySelector(".lang-code")) return;
    const lang=String(link.dataset.langLink || link.getAttribute("hreflang") || link.textContent || "").trim().toLowerCase();
    if(!(lang in LANGUAGE_FLAGS)) return;
    const code=(link.textContent || lang).trim().toUpperCase();
    link.textContent="";
    const codeSpan=document.createElement("span"); codeSpan.className="lang-code"; codeSpan.textContent=code;
    const flagSpan=document.createElement("span");
    flagSpan.className=`lang-flag lang-flag-${LANGUAGE_FLAGS[lang]}`;
    flagSpan.setAttribute("aria-hidden","true");
    link.append(codeSpan,flagSpan);
  });
}
function injectFooterCornerBadge(){
  const footer=[...document.querySelectorAll("footer.site-footer")].pop();
  if(!footer || footer.querySelector(".footer-corner-badge")) return;
  const host=footer.querySelector(".footer-stack") || footer.querySelector(".footer-inner") || footer.querySelector(".container") || footer;
  host.classList.add("footer-badge-host");
  const badge=document.createElement("div"); badge.className="footer-corner-badge"; badge.setAttribute("aria-hidden","true");
  const img=document.createElement("img"); img.alt=""; img.loading="lazy"; img.decoding="async"; img.src=`${ASSET_PREFIX}assets/decor/arash-footer-badge.gif?v=13.3.2`;
  badge.appendChild(img); host.appendChild(badge);
}
enhanceLanguageSwitcher();
injectFooterCornerBadge();

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
  let requestPath=path;
  if(SITE_LANG!=="en" && !/[?&]lang=/.test(requestPath)) requestPath += `${requestPath.includes("?") ? "&" : "?"}lang=${encodeURIComponent(SITE_LANG)}`;
  const res = await fetch(`${API_BASE}${requestPath}${requestPath.includes("?") ? "&" : "?"}t=${Date.now()}`, {cache:"no-store", headers:{Accept:"application/json"}});
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body || {}),
    cache:"no-store"
  });
  let data=null; try{data=await res.json();}catch{}
  if(!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

function escapeText(value){ return String(value ?? ""); }
function clear(el){ if(el) el.innerHTML=""; }
function showError(el, message=t("contentUnavailable")){
  if(!el) return; clear(el); const d=document.createElement("div"); d.className="posts-error"; d.textContent=message; el.appendChild(d);
}
function splitMethods(value=""){ return String(value).split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean); }
function yearLabel(item){ if(item.start_year && item.end_year) return `${item.start_year}–${item.end_year}`; if(item.start_year) return `${item.start_year}–${t("present")}`; return item.status || ""; }

function galleryImageUrl(mediaId){ return mediaId ? `${API_BASE}/gallery-media/${encodeURIComponent(mediaId)}` : ""; }
async function loadGallery(entityType, entityId){
  if(!entityId) return [];
  return apiGet(`/gallery?entity_type=${encodeURIComponent(entityType)}&entity_id=${encodeURIComponent(entityId)}`);
}
function getCoverUrl(item){ return item.cover_media_id ? galleryImageUrl(item.cover_media_id) : (item.image_url || ""); }

function ensureLightbox(){
  let box=document.getElementById("site-lightbox");
  if(box) return box;
  box=document.createElement("div");
  box.id="site-lightbox";
  box.className="site-lightbox";
  box.hidden=true;
  box.innerHTML=`<button class="lightbox-close" type="button" aria-label="Close gallery">×</button>
    <button class="lightbox-prev" type="button" aria-label="Previous image">‹</button>
    <figure><img alt=""><figcaption></figcaption></figure>
    <button class="lightbox-next" type="button" aria-label="Next image">›</button>`;
  document.body.appendChild(box);
  box.querySelector(".lightbox-close").addEventListener("click",()=>closeLightbox());
  box.addEventListener("click",(e)=>{if(e.target===box)closeLightbox();});
  document.addEventListener("keydown",(e)=>{
    if(box.hidden)return;
    if(e.key==="Escape")closeLightbox();
    if(e.key==="ArrowLeft")box.querySelector(".lightbox-prev").click();
    if(e.key==="ArrowRight")box.querySelector(".lightbox-next").click();
  });
  return box;
}
let currentLightboxItems=[];let currentLightboxIndex=0;
function openLightbox(items,index=0){
  const box=ensureLightbox();currentLightboxItems=items;currentLightboxIndex=index;
  const render=()=>{const item=currentLightboxItems[currentLightboxIndex];if(!item)return;const img=box.querySelector("img");img.src=item.url;img.alt=item.alt_text||item.caption||"Gallery image";box.querySelector("figcaption").textContent=item.caption||"";box.querySelector(".lightbox-prev").disabled=currentLightboxItems.length<2;box.querySelector(".lightbox-next").disabled=currentLightboxItems.length<2;};
  box.querySelector(".lightbox-prev").onclick=()=>{currentLightboxIndex=(currentLightboxIndex-1+currentLightboxItems.length)%currentLightboxItems.length;render();};
  box.querySelector(".lightbox-next").onclick=()=>{currentLightboxIndex=(currentLightboxIndex+1)%currentLightboxItems.length;render();};
  box.hidden=false;document.body.classList.add("lightbox-open");render();
}
function closeLightbox(){const box=document.getElementById("site-lightbox");if(box){box.hidden=true;document.body.classList.remove("lightbox-open");}}
function createGallerySection(items,title=t("photoGallery")){
  const section=document.createElement("section");section.className="detail-gallery-section";
  const head=document.createElement("div");head.className="detail-gallery-head";const h=document.createElement("h2");h.textContent=title;const count=document.createElement("span");count.textContent=`${items.length} photo${items.length===1?"":"s"}`;head.append(h,count);
  const grid=document.createElement("div");grid.className="detail-gallery-grid";
  items.forEach((item,index)=>{const button=document.createElement("button");button.className="detail-gallery-item"+(item.protected?" protected-preview":"");button.type="button";const img=document.createElement("img");img.loading="lazy";img.src=item.url;img.alt=item.alt_text||item.caption||"Gallery image";button.appendChild(img);if(item.protected){button.setAttribute("aria-label","Protected portfolio preview");button.title="Protected preview — full-resolution drawing is not published";}if(item.caption){const cap=document.createElement("span");cap.textContent=item.caption;button.appendChild(cap);}if(!item.protected)button.addEventListener("click",()=>openLightbox(items,index));grid.appendChild(button);});
  section.append(head,grid);return section;
}

function createProjectRow(item){
  const article=document.createElement("article"); article.className="project-row reveal";
  const kicker=document.createElement("div"); kicker.className="project-kicker"; kicker.textContent=item.category || kindLabel(item.kind);
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
  const projectCover=getCoverUrl(item);if(projectCover){const img=document.createElement("img");img.loading="lazy";img.alt=item.title;img.src=projectCover;img.addEventListener("error",()=>{media.classList.add("placeholder");img.remove();});media.appendChild(img);} else {media.classList.add("placeholder");}
  const body=document.createElement("div"); body.className="data-card-body";
  const meta=document.createElement("div");meta.className="data-card-meta";meta.innerHTML=`<span></span><span></span>`;meta.children[0].textContent=item.category||kindLabel(item.kind);meta.children[1].textContent=yearLabel(item);
  const h=document.createElement("h3");h.textContent=item.title;const p=document.createElement("p");p.textContent=item.summary||"";
  const chips=document.createElement("div");chips.className="chip-row";splitMethods(item.methods).slice(0,4).forEach(m=>{const s=document.createElement("span");s.textContent=m;chips.appendChild(s);});
  const foot=document.createElement("div");foot.className="data-card-footer";const link=document.createElement("a");link.href=`project.html?id=${encodeURIComponent(item.id)}`;link.textContent=t("viewProject");const status=document.createElement("span");status.className="status-pill";status.textContent=item.status||t("project");foot.append(link,status);
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
  const cite=document.createElement("button");cite.className="mini-button";cite.type="button";cite.textContent=t("cite");cite.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(publicationCitation(item));cite.textContent=t("copied");setTimeout(()=>cite.textContent=t("cite"),1200);}catch{cite.textContent=t("copyFailed");}});actions.appendChild(cite);
  card.append(y,body,actions);return card;
}
function createConferenceCard(item){
  const card=document.createElement("article");card.className="conference-card reveal";
  if(item.cover_media_id){const media=document.createElement("a");media.className="conference-card-media";media.href=`conference.html?id=${encodeURIComponent(item.id)}`;const img=document.createElement("img");img.loading="lazy";img.src=galleryImageUrl(item.cover_media_id);img.alt=item.title;media.appendChild(img);card.appendChild(media);}
  const content=document.createElement("div");content.className="conference-card-content";
  const type=document.createElement("span");type.className="conference-type";type.textContent=item.type||t("academicEvent");
  const h=document.createElement("h3");const detail=document.createElement("a");detail.href=`conference.html?id=${encodeURIComponent(item.id)}`;detail.textContent=item.title;h.appendChild(detail);
  const p=document.createElement("p");p.textContent=item.description||"";
  const meta=document.createElement("div");meta.className="conference-meta";[item.event,item.location,item.year].filter(Boolean).forEach(v=>{const s=document.createElement("span");s.textContent=v;meta.appendChild(s);});
  content.append(type,h,p,meta);
  const links=document.createElement("div");links.className="conference-links";const view=document.createElement("a");view.className="conference-link";view.href=`conference.html?id=${encodeURIComponent(item.id)}`;view.textContent=t("viewDetails");links.appendChild(view);
  if(item.url){const external=document.createElement("a");external.className="conference-link";external.href=item.url;external.target="_blank";external.rel="noopener noreferrer";external.textContent=t("eventMaterial");links.appendChild(external);}
  content.appendChild(links);card.appendChild(content);return card;
}
function conferenceIndexTitle(item){
  const raw=String(item.event||item.title||"Academic Event").trim();
  const year=String(item.year||"").trim();
  if(!year) return raw;

  // The year already has its own column on the conference index.
  // Remove only a standalone occurrence from the displayed Event text
  // so entries such as "... - 2026 NSF Research" do not repeat 2026.
  const escaped=year.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const cleaned=raw
    .replace(new RegExp(`(^|[\\s–—-])${escaped}(?=($|[\\s–—-]))`,"g"),"$1")
    .replace(/\s{2,}/g," ")
    .replace(/\s+([–—-])\s*([–—-])\s*/g," $1 ")
    .replace(/^[\s–—-]+|[\s–—-]+$/g,"")
    .trim();
  return cleaned||raw;
}
function createConferenceCompactRow(item){
  const row=document.createElement("article");row.className="conference-compact-row reveal";

  const mediaCell=document.createElement("div");mediaCell.className="conference-compact-media";
  const mediaLink=document.createElement("a");mediaLink.href=`conference.html?id=${encodeURIComponent(item.id)}`;mediaLink.setAttribute("aria-label",`Open ${item.title||item.event||"conference"} details`);

  const img=document.createElement("img");
  img.loading="lazy";
  img.alt=item.title||item.event||"Conference image";
  img.hidden=true;
  mediaLink.appendChild(img);

  const placeholder=document.createElement("span");
  placeholder.className="conference-compact-placeholder";
  placeholder.textContent=t("loading");
  mediaLink.appendChild(placeholder);

  const directCover=getCoverUrl(item);
  if(directCover){
    img.src=directCover;
    img.hidden=false;
    placeholder.remove();
  }else{
    // /conferences may not expose cover_media_id. Fall back to the actual
    // conference gallery so the list page still shows the event photo.
    loadGallery("conference",item.id).then((gallery)=>{
      const cover=(gallery||[]).find((g)=>Number(g.is_cover)===1)||(gallery||[])[0];
      const src=cover?.url||galleryImageUrl(cover?.id);
      if(src){
        img.src=src;
        img.hidden=false;
        if(placeholder.isConnected) placeholder.remove();
      }else if(placeholder.isConnected){
        placeholder.textContent=t("noPhoto");
      }
    }).catch(()=>{
      if(placeholder.isConnected) placeholder.textContent=t("noPhoto");
    });
  }
  mediaCell.appendChild(mediaLink);

  const eventCell=document.createElement("div");eventCell.className="conference-compact-cell conference-compact-event";
  const eventLabel=document.createElement("span");eventLabel.className="conference-compact-label";eventLabel.textContent=t("event");
  const eventLink=document.createElement("a");eventLink.href=`conference.html?id=${encodeURIComponent(item.id)}`;eventLink.textContent=conferenceIndexTitle(item);
  if(item.title&&item.event&&item.title!==item.event) eventLink.title=item.title;
  eventCell.append(eventLabel,eventLink);

  const yearCell=document.createElement("div");yearCell.className="conference-compact-cell conference-compact-year";
  const yearLabel=document.createElement("span");yearLabel.className="conference-compact-label";yearLabel.textContent=t("year");
  const yearValue=document.createElement("strong");yearValue.textContent=item.year||"—";
  yearCell.append(yearLabel,yearValue);

  const locationCell=document.createElement("div");locationCell.className="conference-compact-cell conference-compact-location";
  const locationLabel=document.createElement("span");locationLabel.className="conference-compact-label";locationLabel.textContent=t("location");
  const locationValue=document.createElement("strong");locationValue.textContent=item.location||"—";
  locationCell.append(locationLabel,locationValue);

  row.append(mediaCell,eventCell,yearCell,locationCell);
  return row;
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
    if(Array.isArray(window.PORTFOLIO_PROJECTS)) allProjectsCache=[...window.PORTFOLIO_PROJECTS, ...allProjectsCache.filter(x=>!window.PORTFOLIO_PROJECTS.some(p=>String(p.id)===String(x.id)))];
    if(researchEl){const search=document.getElementById("project-search"), status=document.getElementById("project-status-filter");[...new Set(allProjectsCache.filter(x=>x.kind==="research").map(x=>x.status).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;status.appendChild(o);});const render=()=>{clear(researchEl);const q=(search.value||"").toLowerCase();const s=status.value;const rows=allProjectsCache.filter(x=>x.kind==="research").filter(x=>(!q||`${x.title} ${x.summary} ${x.category} ${x.methods}`.toLowerCase().includes(q))&&(!s||x.status===s));rows.forEach(r=>researchEl.appendChild(createProjectRow(r)));if(!rows.length)showError(researchEl,t("noResearch"));observeReveals(researchEl);};search.addEventListener("input",render);status.addEventListener("change",render);render();}
    if(allEl){const search=document.getElementById("all-project-search"),kind=document.getElementById("project-kind-filter"),category=document.getElementById("project-category-filter");[...new Set(allProjectsCache.map(x=>x.category).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;category.appendChild(o);});const render=()=>{clear(allEl);const q=(search.value||"").toLowerCase();const k=kind.value,c=category.value;const rows=allProjectsCache.filter(x=>(!q||`${x.title} ${x.summary} ${x.category} ${x.methods}`.toLowerCase().includes(q))&&(!k||x.kind===k)&&(!c||x.category===c));rows.forEach(r=>allEl.appendChild(createProjectCard(r)));if(!rows.length)showError(allEl,t("noProjects"));observeReveals(allEl);};[search,kind,category].forEach(el=>el.addEventListener(el.tagName==="INPUT"?"input":"change",render));render();}
  }catch{showError(researchEl||allEl);}
}
loadProjectPages();

async function loadProjectDetail(){
  const el=document.getElementById("project-detail");if(!el)return;
  const id=new URLSearchParams(location.search).get("id");if(!id){showError(el,t("missingProjectId"));return;}
  try{
    const staticItem=(window.PORTFOLIO_PROJECTS||[]).find(p=>String(p.id)===String(id));
    if(staticItem){
      clear(el);
      const main=document.createElement("article");main.className="project-detail-main portfolio-static-detail";
      if(staticItem.image_url){const img=document.createElement("img");img.className="project-detail-image";img.src=staticItem.image_url;img.alt=staticItem.title;main.appendChild(img);}
      const copy=document.createElement("div");copy.className="project-detail-copy";
      const e=document.createElement("p");e.className="eyebrow";e.textContent=staticItem.category||"Engineering Project";
      const h=document.createElement("h1");h.textContent=staticItem.title;
      const sm=document.createElement("p");sm.className="summary";sm.textContent=staticItem.summary||"";copy.append(e,h,sm);
      const chips=document.createElement("div");chips.className="chip-row";splitMethods(staticItem.methods).forEach(m=>{const sp=document.createElement("span");sp.textContent=m;chips.appendChild(sp);});copy.appendChild(chips);
      if(staticItem.overview){const oh=document.createElement("h2");oh.textContent="Project Overview";const op=document.createElement("p");op.className="project-detail-description";op.textContent=staticItem.overview;copy.append(oh,op);}
      main.appendChild(copy);
      const side=document.createElement("aside");side.className="project-detail-side";[["Type",kindLabel(staticItem.kind)],["Status",staticItem.status],["Year",staticItem.year],["Role",staticItem.role],["Organization",staticItem.organization],["Location",staticItem.location]].filter(x=>x[1]).forEach(([k,v])=>{const f=document.createElement("div");f.className="detail-fact";const sp=document.createElement("span");sp.textContent=k;const st=document.createElement("strong");st.textContent=v;f.append(sp,st);side.appendChild(f);});
      el.append(main,side);
      if(staticItem.highlights?.length){const sec=document.createElement("section");sec.className="portfolio-project-section";sec.innerHTML="<h2>Key Project Facts</h2>";const grid=document.createElement("div");grid.className="portfolio-facts-grid";staticItem.highlights.forEach(v=>{const d=document.createElement("div");d.className="portfolio-fact";d.textContent=v;grid.appendChild(d);});sec.appendChild(grid);el.parentElement.appendChild(sec);}
      if(staticItem.sections?.length){const sec=document.createElement("section");sec.className="portfolio-project-section";sec.innerHTML="<h2>Design & Engineering Work Packages</h2>";const grid=document.createElement("div");grid.className="portfolio-design-grid";staticItem.sections.forEach(([num,title,text])=>{const a=document.createElement("article");a.className="portfolio-design-card";const n=document.createElement("span");n.className="portfolio-design-number";n.textContent=num;const hh=document.createElement("h3");hh.textContent=title;const pp=document.createElement("p");pp.textContent=text;a.append(n,hh,pp);grid.appendChild(a);});sec.appendChild(grid);el.parentElement.appendChild(sec);}
      if(staticItem.gallery?.length){const gallery=staticItem.gallery.map(([url,caption],index)=>({url,caption,alt_text:caption,protected:index>0}));const gs=createGallerySection(gallery,t("projectGallery"));gs.classList.add("project-gallery-wide");el.parentElement.appendChild(gs);}
      document.title=`${staticItem.title} | Arash Pashazadeh`;return;
    }
    const [rows,gallery]=await Promise.all([apiGet(`/projects?id=${encodeURIComponent(id)}`),loadGallery("project",id)]);
    const item=Array.isArray(rows)?rows[0]:rows;if(!item){showError(el,t("projectNotFound"));return;}clear(el);
    const main=document.createElement("article");main.className="project-detail-main";
    const cover=gallery.find(x=>x.is_cover)||gallery[0];
    const heroUrl=cover?.url||item.image_url;
    if(heroUrl){const img=document.createElement("img");img.className="project-detail-image";img.src=heroUrl;img.alt=cover?.alt_text||item.title;main.appendChild(img);}
    const copy=document.createElement("div");copy.className="project-detail-copy";const e=document.createElement("p");e.className="eyebrow";e.textContent=item.category||item.kind||"Project";const h=document.createElement("h1");h.textContent=item.title;const s=document.createElement("p");s.className="summary";s.textContent=item.summary||"";copy.append(e,h,s);
    const chips=document.createElement("div");chips.className="chip-row";splitMethods(item.methods).forEach(m=>{const sp=document.createElement("span");sp.textContent=m;chips.appendChild(sp);});copy.appendChild(chips);
    if(item.description){const d=document.createElement("p");d.className="project-detail-description";d.textContent=item.description;copy.appendChild(d);}
    if(item.project_url){const a=document.createElement("a");a.className="btn btn-primary";a.href=item.project_url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t("externalProject");a.style.marginTop="24px";copy.appendChild(a);}
    main.appendChild(copy);
    const side=document.createElement("aside");side.className="project-detail-side";[[t("type"),kindLabel(item.kind)],[t("status"),item.status],[t("category"),item.category],[t("period"),yearLabel(item)]].filter(x=>x[1]).forEach(([k,v])=>{const f=document.createElement("div");f.className="detail-fact";const sp=document.createElement("span");sp.textContent=k;const st=document.createElement("strong");st.textContent=v;f.append(sp,st);side.appendChild(f);});
    el.append(main,side);
    if(gallery.length){const gallerySection=createGallerySection(gallery,t("projectGallery"));gallerySection.classList.add("project-gallery-wide");el.parentElement.appendChild(gallerySection);}
    document.title=`${item.title} | Arash Pashazadeh`;
  }catch{showError(el);}
}
loadProjectDetail();

async function loadPublications(){
  const el=document.getElementById("publications-list");if(!el)return;try{const rows=await apiGet("/publications");const search=document.getElementById("publication-search"),yearF=document.getElementById("publication-year-filter"),statusF=document.getElementById("publication-status-filter");[...new Set(rows.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;yearF.appendChild(o);});[...new Set(rows.map(x=>x.status).filter(Boolean))].sort().forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;statusF.appendChild(o);});const render=()=>{clear(el);const q=(search.value||"").toLowerCase(),y=yearF.value,s=statusF.value;const filtered=rows.filter(x=>(!q||`${x.title} ${x.authors} ${x.journal} ${x.doi}`.toLowerCase().includes(q))&&(!y||String(x.year)===y)&&(!s||x.status===s));filtered.forEach(r=>el.appendChild(createPublicationCard(r)));if(!filtered.length)showError(el,t("noPublications"));observeReveals(el);};search.addEventListener("input",render);yearF.addEventListener("change",render);statusF.addEventListener("change",render);render();}catch{showError(el);}
}
loadPublications();

async function loadConferenceDetail(){
  const el=document.getElementById("conference-detail");if(!el)return;
  const id=new URLSearchParams(location.search).get("id");if(!id){showError(el,t("missingConferenceId"));return;}
  try{
    const [rows,gallery]=await Promise.all([apiGet(`/conferences?id=${encodeURIComponent(id)}`),loadGallery("conference",id)]);
    const item=Array.isArray(rows)?rows[0]:rows;if(!item){showError(el,t("conferenceNotFound"));return;}clear(el);
    const main=document.createElement("article");main.className="project-detail-main";
    const cover=gallery.find(x=>x.is_cover)||gallery[0];if(cover){const img=document.createElement("img");img.className="project-detail-image";img.src=cover.url;img.alt=cover.alt_text||item.title;main.appendChild(img);}
    const copy=document.createElement("div");copy.className="project-detail-copy";const e=document.createElement("p");e.className="eyebrow";e.textContent=item.type||t("conference");const h=document.createElement("h1");h.textContent=item.title;const s=document.createElement("p");s.className="summary";s.textContent=item.description||"";copy.append(e,h,s);
    if(item.url){const a=document.createElement("a");a.className="btn btn-primary";a.href=item.url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=t("eventMaterial");a.style.marginTop="24px";copy.appendChild(a);}main.appendChild(copy);
    const side=document.createElement("aside");side.className="project-detail-side";[[t("event"),item.event],[t("type"),item.type],[t("year"),item.year],[t("location"),item.location]].filter(x=>x[1]).forEach(([k,v])=>{const f=document.createElement("div");f.className="detail-fact";const sp=document.createElement("span");sp.textContent=k;const st=document.createElement("strong");st.textContent=v;f.append(sp,st);side.appendChild(f);});
    el.append(main,side);
    if(gallery.length){const gallerySection=createGallerySection(gallery,t("conferenceGallery"));gallerySection.classList.add("project-gallery-wide");el.parentElement.appendChild(gallerySection);}
    document.title=`${item.title} | Arash Pashazadeh`;
  }catch{showError(el);}
}
loadConferenceDetail();

async function loadConferences(){
  const el=document.getElementById("conferences-list");if(!el)return;try{const rows=await apiGet("/conferences");const search=document.getElementById("conference-search"),yearF=document.getElementById("conference-year-filter");[...new Set(rows.map(x=>x.year).filter(Boolean))].sort((a,b)=>b-a).forEach(v=>{const o=document.createElement("option");o.value=v;o.textContent=v;yearF.appendChild(o);});const render=()=>{clear(el);const q=(search.value||"").toLowerCase(),y=yearF.value;const filtered=rows.filter(x=>(!q||`${x.title} ${x.event} ${x.location} ${x.description}`.toLowerCase().includes(q))&&(!y||String(x.year)===y));filtered.forEach(r=>el.appendChild(createConferenceCompactRow(r)));if(!filtered.length)showError(el,t("noConferences"));observeReveals(el);};search.addEventListener("input",render);yearF.addEventListener("change",render);render();}catch{showError(el);}
}
loadConferences();


// =====================================================
// LIBRARY / PAID TECHNICAL RESOURCES
// =====================================================
function libraryTypeLabel(type){ return type==="design_notebook" ? t("designNotebook") : t("book"); }
function formatLibraryPrice(item){
  const cents=Number(item.price_cents||0);
  if(cents<=0) return t("free");
  try{return new Intl.NumberFormat(SITE_LOCALE,{style:"currency",currency:item.currency||"USD"}).format(cents/100);}catch{return `${(cents/100).toFixed(2)} ${item.currency||"USD"}`;}
}

async function startLibraryCheckout(item, button){
  if(!item?.id) return;
  const oldText=button?.textContent||t("purchase");
  if(button){button.disabled=true;button.textContent=t("processingPayment");}
  try{
    const data=await apiPost("/checkout/create",{item_id:Number(item.id),lang:SITE_LANG});
    if(!data?.checkout_url) throw new Error(t("checkoutUnavailable"));
    location.href=data.checkout_url;
  }catch(error){
    if(item.purchase_url){
      window.open(item.purchase_url,"_blank","noopener,noreferrer");
    }else{
      alert(error.message || t("checkoutUnavailable"));
    }
    if(button){button.disabled=false;button.textContent=oldText;}
  }
}
function appendLibraryPurchaseControl(actions,item,buttonClass="btn btn-primary"){
  if(Number(item.price_cents||0)<=0) return;
  if(Number(item.secure_file_ready||0)>0){
    const buy=document.createElement("button");
    buy.type="button";buy.className=buttonClass;buy.textContent=t("purchase");
    buy.addEventListener("click",()=>startLibraryCheckout(item,buy));
    actions.appendChild(buy);return;
  }
  if(item.purchase_url){
    const buy=document.createElement("a");buy.className=buttonClass;buy.href=item.purchase_url;buy.target="_blank";buy.rel="noopener noreferrer";buy.textContent=t("purchase");actions.appendChild(buy);return;
  }
  const soon=document.createElement("span");soon.className="status-pill";soon.textContent=t("comingSoon");actions.appendChild(soon);
}
async function renderLibraryPaymentResult(container,item){
  const params=new URLSearchParams(location.search);
  const payment=params.get("payment");
  const sessionId=params.get("session_id");
  if(payment==="cancelled"){
    const notice=document.createElement("div");notice.className="library-payment-notice";notice.textContent=t("paymentCancelled");container.appendChild(notice);return;
  }
  if(payment!=="success"||!sessionId) return;
  const notice=document.createElement("div");notice.className="library-payment-notice";notice.textContent=t("processingPayment");container.appendChild(notice);
  try{
    const data=await apiGet(`/checkout/status?session_id=${encodeURIComponent(sessionId)}`);
    if(Number(data.item_id)!==Number(item.id)) throw new Error(t("checkoutUnavailable"));
    if(!data.paid){
      notice.textContent=t("paymentPending");return;
    }
    notice.textContent=`${t("paymentSuccess")} ${t("downloadsRemaining")}: ${data.downloads_remaining ?? ""}`.trim();
    if(data.download_url){
      const dl=document.createElement("a");dl.className="btn btn-primary library-secure-download";dl.href=data.download_url;dl.textContent=t("downloadFile");container.appendChild(dl);
    }
  }catch(error){
    notice.textContent=error.message||t("checkoutUnavailable");
  }
}
function createLibraryCard(item){
  const card=document.createElement("article");card.className="library-card reveal";
  const detailHref=`library-item.html?id=${encodeURIComponent(item.id)}`;
  const cover=document.createElement("a");cover.className="library-card-cover";cover.href=detailHref;
  const coverUrl=getCoverUrl(item);
  if(coverUrl){const img=document.createElement("img");img.loading="lazy";img.src=coverUrl;img.alt=item.title||t("libraryItem");img.addEventListener("error",()=>{img.remove();cover.classList.add("placeholder");});cover.appendChild(img);}else{cover.classList.add("placeholder");}
  const body=document.createElement("div");body.className="library-card-body";
  const meta=document.createElement("div");meta.className="library-card-meta";const type=document.createElement("span");type.textContent=libraryTypeLabel(item.item_type);const price=document.createElement("strong");price.textContent=formatLibraryPrice(item);meta.append(type,price);
  const h=document.createElement("h3");const a=document.createElement("a");a.href=detailHref;a.textContent=item.title||t("libraryItem");h.appendChild(a);
  if(item.author){const author=document.createElement("p");author.className="library-author";author.textContent=item.author;body.append(meta,h,author);}else body.append(meta,h);
  if(item.summary){const p=document.createElement("p");p.textContent=item.summary;body.appendChild(p);}
  const actions=document.createElement("div");actions.className="library-actions";
  const details=document.createElement("a");details.className="mini-button";details.href=detailHref;details.textContent=t("viewItem");actions.appendChild(details);
  if(item.preview_url){const preview=document.createElement("a");preview.className="mini-button";preview.href=item.preview_url;preview.target="_blank";preview.rel="noopener noreferrer";preview.textContent=t("preview");actions.appendChild(preview);}
  appendLibraryPurchaseControl(actions,item,"btn btn-primary library-buy");
  body.appendChild(actions);card.append(cover,body);return card;
}
async function loadLibrary(){
  const el=document.getElementById("library-list");if(!el)return;
  try{
    const rows=await apiGet("/library");
    const search=document.getElementById("library-search"),typeF=document.getElementById("library-type-filter");
    const render=()=>{clear(el);const q=(search?.value||"").toLowerCase(),ty=typeF?.value||"";const filtered=rows.filter(x=>(!q||`${x.title} ${x.author||""} ${x.summary||""} ${x.description||""}`.toLowerCase().includes(q))&&(!ty||x.item_type===ty));filtered.forEach(r=>el.appendChild(createLibraryCard(r)));if(!filtered.length)showError(el,t("noLibrary"));observeReveals(el);};
    search?.addEventListener("input",render);typeF?.addEventListener("change",render);render();
  }catch{showError(el,t("libraryUnavailable"));}
}
loadLibrary();
async function loadLibraryDetail(){
  const el=document.getElementById("library-detail");if(!el)return;
  const id=new URLSearchParams(location.search).get("id");if(!id){showError(el,t("missingLibraryId"));return;}
  try{
    const [rows,gallery]=await Promise.all([apiGet(`/library?id=${encodeURIComponent(id)}`),loadGallery("library",id)]);
    const item=Array.isArray(rows)?rows[0]:rows;if(!item){showError(el,t("libraryNotFound"));return;}clear(el);
    const main=document.createElement("article");main.className="project-detail-main library-detail-main";
    const cover=gallery.find(x=>x.is_cover)||gallery[0];const heroUrl=cover?.url||item.cover_url;
    if(heroUrl){const img=document.createElement("img");img.className="project-detail-image library-detail-cover";img.src=heroUrl;img.alt=cover?.alt_text||item.title;main.appendChild(img);}
    const copy=document.createElement("div");copy.className="project-detail-copy";const e=document.createElement("p");e.className="eyebrow";e.textContent=libraryTypeLabel(item.item_type);const h=document.createElement("h1");h.textContent=item.title;const price=document.createElement("p");price.className="library-detail-price";price.textContent=formatLibraryPrice(item);copy.append(e,h,price);
    if(item.author){const author=document.createElement("p");author.className="summary";author.textContent=item.author;copy.appendChild(author);}if(item.summary){const s=document.createElement("p");s.className="summary";s.textContent=item.summary;copy.appendChild(s);}if(item.description){const d=document.createElement("p");d.className="project-detail-description";d.textContent=item.description;copy.appendChild(d);}
    const actions=document.createElement("div");actions.className="library-detail-actions";if(item.preview_url){const preview=document.createElement("a");preview.className="btn btn-quiet";preview.href=item.preview_url;preview.target="_blank";preview.rel="noopener noreferrer";preview.textContent=t("preview");actions.appendChild(preview);}appendLibraryPurchaseControl(actions,item);copy.appendChild(actions);await renderLibraryPaymentResult(copy,item);main.appendChild(copy);
    const side=document.createElement("aside");side.className="project-detail-side";[[t("resourceType"),libraryTypeLabel(item.item_type)],[t("author"),item.author],[t("year"),item.year],[t("price"),formatLibraryPrice(item)]].filter(x=>x[1]).forEach(([k,v])=>{const f=document.createElement("div");f.className="detail-fact";const sp=document.createElement("span");sp.textContent=k;const st=document.createElement("strong");st.textContent=v;f.append(sp,st);side.appendChild(f);});el.append(main,side);
    if(gallery.length>1){const gallerySection=createGallerySection(gallery,t("photoGallery"));gallerySection.classList.add("project-gallery-wide");el.parentElement.appendChild(gallerySection);}document.title=`${item.title} | Arash Pashazadeh`;
  }catch{showError(el,t("libraryUnavailable"));}
}
loadLibraryDetail();

// =====================================================
// LIVE TELEGRAM FEED
// =====================================================
const telegramContainer=document.getElementById("telegram-posts");
const telegramRefreshButton=document.getElementById("feed-refresh");
const telegramFilterButton=document.getElementById("feed-filter-toggle");
let cachedTelegramPosts=[];let showAllTelegramPosts=false;
function formatTelegramDate(dateString){const date=new Date(dateString);if(Number.isNaN(date.getTime()))return"";return new Intl.DateTimeFormat(SITE_LOCALE,{year:"numeric",month:"short",day:"numeric"}).format(date);}
function extractHashtags(text=""){const matches=String(text).match(/#[\p{L}\p{N}_-]+/gu);return matches?[...new Set(matches)]:[];}
function inferCategory(text="",hashtags=[]){if(hashtags.length)return hashtags[0].replace(/^#/,"").replace(/_/g," ");const t=String(text).toLowerCase();if(t.includes("digital twin"))return"Digital Twin";if(/\b(ai|artificial intelligence|machine learning|deep learning)\b/.test(t))return"AI";if(/\b(concrete|cement|admixture)\b/.test(t))return"Concrete";if(/\b(hydraulic|hydraulics|water resources|flow|river)\b/.test(t))return"Hydraulics";if(/\b(coastal|marine|oyster|wave|mooring|offshore)\b/.test(t))return"Coastal";if(/\b(bridge|structure|structural|beam|column)\b/.test(t))return"Structures";if(/\b(3d print|3d printing|construction|robotic construction)\b/.test(t))return"Construction";if(/\b(sensor|imu|monitoring|instrumentation)\b/.test(t))return"Monitoring";return"Civil Engineering";}
function cleanTextForBody(text=""){return String(text).replace(/#[\p{L}\p{N}_-]+/gu,"").replace(/\s{2,}/g," ").trim();}
function deriveTitle(text="",category="Civil Engineering"){const cleaned=cleanTextForBody(text);if(!cleaned)return category;const firstLine=cleaned.split(/\n+/)[0].trim();const firstSentence=firstLine.split(/(?<=[.!?])\s+/)[0].trim();const c=firstSentence||firstLine;return c.length<=82?c:c.slice(0,79).trimEnd()+"…";}
function deriveBody(text="",title=""){const cleaned=cleanTextForBody(text);if(!cleaned||cleaned===title)return"";if(cleaned.startsWith(title))return cleaned.slice(title.length).replace(/^[\s:–—-]+/,"").trim();return cleaned;}
function isSubstantivePost(post){const text=String(post.text||"").trim();return Boolean(post.media_file_id||extractHashtags(text).length||text.length>=20);}
function createChip(label,className=""){const chip=document.createElement("span");chip.className=`telegram-chip ${className}`.trim();chip.textContent=label;return chip;}
function createTelegramPostCard(post){const article=document.createElement("article");article.className="telegram-post-card";const rawText=String(post.text||"");const hashtags=extractHashtags(rawText);const category=inferCategory(rawText,hashtags);const titleText=deriveTitle(rawText,category);const bodyText=deriveBody(rawText,titleText);const channelName=post.channel_username||"ArashCivilEngineering";
  if(post.media_file_id){const mediaWrap=document.createElement("a");mediaWrap.className="telegram-media";mediaWrap.target="_blank";mediaWrap.rel="noopener noreferrer";mediaWrap.href=`https://t.me/${encodeURIComponent(channelName)}/${encodeURIComponent(post.telegram_message_id)}`;const img=document.createElement("img");img.loading="lazy";img.alt=titleText;img.src=`${TELEGRAM_MEDIA_URL}?file_id=${encodeURIComponent(post.media_file_id)}`;img.addEventListener("error",()=>mediaWrap.remove());mediaWrap.appendChild(img);article.appendChild(mediaWrap);}
  const content=document.createElement("div");content.className="telegram-post-content";const header=document.createElement("div");header.className="telegram-post-header";const source=document.createElement("div");source.className="telegram-source";const icon=document.createElement("div");icon.className="telegram-icon";icon.textContent="TG";const sourceText=document.createElement("div");sourceText.className="telegram-source-text";const sourceName=document.createElement("strong");sourceName.textContent=t("civilInsights");const channel=document.createElement("span");channel.textContent=`@${channelName}`;sourceText.append(sourceName,channel);source.append(icon,sourceText);const date=document.createElement("span");date.className="telegram-post-date";date.textContent=formatTelegramDate(post.posted_at);header.append(source,date);
  const chips=document.createElement("div");chips.className="telegram-chip-row";chips.appendChild(createChip(category,"category-chip"));hashtags.slice(0,4).forEach(tag=>chips.appendChild(createChip(tag,"hashtag-chip")));const title=document.createElement("h3");title.className="telegram-post-title";title.dir="auto";title.textContent=titleText;const body=document.createElement("p");body.className="telegram-post-text";body.dir="auto";if(bodyText)body.textContent=bodyText;else if(!rawText.trim()){body.textContent=t("mediaUpdate");body.classList.add("is-empty");}else body.classList.add("compact");const foot=document.createElement("div");foot.className="telegram-post-footer";const link=document.createElement("a");link.className="telegram-post-link";link.target="_blank";link.rel="noopener noreferrer";link.textContent=t("openOriginal");link.href=`https://t.me/${encodeURIComponent(channelName)}/${encodeURIComponent(post.telegram_message_id)}`;const id=document.createElement("span");id.className="telegram-post-id";id.textContent=`#${post.telegram_message_id??""}`;foot.append(link,id);content.append(header,chips,title);if(bodyText||!rawText.trim())content.appendChild(body);content.appendChild(foot);article.appendChild(content);return article;}
function renderTelegramPosts(){if(!telegramContainer)return;clear(telegramContainer);let posts=showAllTelegramPosts?cachedTelegramPosts:cachedTelegramPosts.filter(isSubstantivePost);const limit=Number(telegramContainer.dataset.limit||0);if(limit>0)posts=posts.slice(0,limit);if(!posts.length){showError(telegramContainer,showAllTelegramPosts?t("noTelegram"):t("noEngineeringPosts"));return;}posts.forEach(p=>telegramContainer.appendChild(createTelegramPostCard(p)));}
async function loadTelegramPosts({silent=false}={}){if(!telegramContainer)return;if(telegramRefreshButton){telegramRefreshButton.disabled=true;telegramRefreshButton.textContent=t("refreshing");}if(!silent)telegramContainer.setAttribute("aria-busy","true");try{const posts=await apiGet("/posts");cachedTelegramPosts=Array.isArray(posts)?posts:[];renderTelegramPosts();}catch(e){if(!silent||!telegramContainer.children.length)showError(telegramContainer,t("insightsUnavailable"));}finally{telegramContainer.setAttribute("aria-busy","false");if(telegramRefreshButton){telegramRefreshButton.disabled=false;telegramRefreshButton.textContent=t("refreshFeed");}}}
if(telegramRefreshButton)telegramRefreshButton.addEventListener("click",()=>loadTelegramPosts());
if(telegramFilterButton)telegramFilterButton.addEventListener("click",()=>{showAllTelegramPosts=!showAllTelegramPosts;telegramFilterButton.setAttribute("aria-pressed",String(showAllTelegramPosts));telegramFilterButton.textContent=showAllTelegramPosts?t("hideTest"):t("showAll");renderTelegramPosts();});
loadTelegramPosts();setInterval(()=>{if(document.visibilityState==="visible")loadTelegramPosts({silent:true});},60000);


// =====================================================
// PRIVACY-AWARE SITE ANALYTICS
// =====================================================
// Public pages send a lightweight page-view event to the existing Cloudflare Worker.
// The Worker derives location from Cloudflare and masks the visitor IP by default.
// Raw IP storage is only enabled when ANALYTICS_STORE_RAW_IP=true is configured in Worker settings.
function trackSiteVisit(){
  try{
    const path=`${location.pathname}${location.search}`;
    if(
      location.protocol==="file:" ||
      /(?:^|\/)(admin|cv-builder)\.html$/i.test(location.pathname) ||
      navigator.doNotTrack==="1"
    ) return;

    const key=`arash_visit_${path}`;
    const now=Date.now();
    const previous=Number(sessionStorage.getItem(key)||0);
    if(previous && now-previous<30000) return;
    sessionStorage.setItem(key,String(now));

    fetch(`${API_BASE}/track`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      keepalive:true,
      body:JSON.stringify({
        path,
        title:document.title,
        referrer:document.referrer||"",
        language:navigator.language||""
      })
    }).catch(()=>{});
  }catch{}
}
trackSiteVisit();
