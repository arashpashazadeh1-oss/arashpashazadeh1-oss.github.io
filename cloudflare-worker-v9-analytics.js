const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-File-Name",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
};

const INSIGHTS_CHANNEL_USERNAME = "ArashCivilEngineering";
const MEDIA_SETUP_PHRASE = "MEDIA SETUP";


function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

function cleanString(value, max = 10000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function nullableInt(value) {
  const n = Number(value);
  return Number.isFinite(n) && n !== 0 ? Math.trunc(n) : null;
}

function boolInt(value) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}

function isAdmin(request, env) {
  if (!env.ADMIN_SECRET) return false;
  return request.headers.get("Authorization") === `Bearer ${env.ADMIN_SECRET}`;
}

function safeLimit(url, fallback = 200) {
  const n = Number.parseInt(url.searchParams.get("limit") || "", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), 500) : fallback;
}



function analyticsDays(url) {
  const n = Number.parseInt(url.searchParams.get("days") || "30", 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), 3650) : 30;
}

function maskIpAddress(ip) {
  const value = cleanString(ip, 100);
  if (!value) return "";
  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  if (value.includes(":")) {
    const parts = value.split(":").filter(Boolean);
    return `${parts.slice(0, 3).join(":")}::`;
  }
  return value;
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function rawAnalyticsIpEnabled(env) {
  return String(env.ANALYTICS_STORE_RAW_IP || "").toLowerCase() === "true";
}

async function trackVisit(request, env) {
  let body = {};
  try { body = await request.json(); } catch {}

  const path = cleanString(body.path || "/", 1000);
  if (!path || /(?:^|\/)(admin|cv-builder)\.html/i.test(path)) {
    return json({ ok: true, ignored: true });
  }

  const rawIp = cleanString(
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0] ||
    "",
    100
  );
  const userAgent = cleanString(request.headers.get("User-Agent") || "", 1200);
  const salt = String(env.ANALYTICS_SALT || env.ADMIN_SECRET || "arash-website");
  const visitorHash = (await sha256Hex(`${rawIp}|${userAgent}|${salt}`)).slice(0, 32);
  const ipAddress = rawAnalyticsIpEnabled(env) ? rawIp : maskIpAddress(rawIp);

  const cf = request.cf || {};
  const country = cleanString(cf.country || "", 100);
  const region = cleanString(cf.region || "", 160);
  const city = cleanString(cf.city || "", 160);
  const timezone = cleanString(cf.timezone || "", 100);

  await env.DB.prepare(`
    INSERT INTO site_visits
      (path,title,referrer,country,region,city,timezone,ip_address,visitor_hash,user_agent,language)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).bind(
    path,
    cleanString(body.title, 500),
    cleanString(body.referrer, 1500),
    country,
    region,
    city,
    timezone,
    ipAddress,
    visitorHash,
    userAgent,
    cleanString(body.language, 100)
  ).run();

  return json({ ok: true }, 200, { "Cache-Control": "no-store" });
}

async function adminAnalytics(url, env) {
  const days = analyticsDays(url);
  const limit = safeLimit(url, 250);
  const modifier = `-${days} days`;

  const summary = await env.DB.prepare(`
    SELECT
      COUNT(*) AS pageviews,
      COUNT(DISTINCT visitor_hash) AS unique_visitors,
      COUNT(DISTINCT CASE WHEN country<>'' THEN country END) AS country_count
    FROM site_visits
    WHERE visited_at >= datetime('now', ?)
  `).bind(modifier).first();

  const countries = (await env.DB.prepare(`
    SELECT COALESCE(NULLIF(country,''),'Unknown') AS country, COUNT(*) AS count
    FROM site_visits
    WHERE visited_at >= datetime('now', ?)
    GROUP BY COALESCE(NULLIF(country,''),'Unknown')
    ORDER BY count DESC
    LIMIT 20
  `).bind(modifier).all()).results;

  const pages = (await env.DB.prepare(`
    SELECT path, COUNT(*) AS count
    FROM site_visits
    WHERE visited_at >= datetime('now', ?)
    GROUP BY path
    ORDER BY count DESC
    LIMIT 20
  `).bind(modifier).all()).results;

  const visits = (await env.DB.prepare(`
    SELECT id,visited_at,path,title,referrer,country,region,city,timezone,ip_address,visitor_hash,user_agent,language
    FROM site_visits
    WHERE visited_at >= datetime('now', ?)
    ORDER BY visited_at DESC
    LIMIT ${limit}
  `).bind(modifier).all()).results;

  return json({
    ok: true,
    days,
    raw_ip_storage: rawAnalyticsIpEnabled(env),
    summary: summary || { pageviews: 0, unique_visitors: 0, country_count: 0 },
    countries,
    pages,
    visits
  }, 200, { "Cache-Control": "no-store" });
}

function entityTable(entityType) {
  if (entityType === "project") return "projects";
  if (entityType === "conference") return "conferences";
  return null;
}

function galleryMediaUrl(request, id, updatedAt = "") {
  const url = new URL(request.url);
  const version = updatedAt ? `?v=${encodeURIComponent(updatedAt)}` : "";
  return `${url.origin}/gallery-media/${id}${version}`;
}

async function getPublications(url, env) {
  const where = [];
  const binds = [];

  if (url.searchParams.get("featured") === "1") where.push("featured = 1");
  if (url.searchParams.get("id")) {
    where.push("id = ?");
    binds.push(Number(url.searchParams.get("id")));
  }

  let sql = `
    SELECT id,title,authors,journal,year,doi,url,pdf_url,status,abstract,featured,created_at,updated_at
    FROM publications
  `;
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += ` ORDER BY COALESCE(year,0) DESC, created_at DESC LIMIT ${safeLimit(url)}`;

  return (await env.DB.prepare(sql).bind(...binds).all()).results;
}

async function getProjects(url, env) {
  const where = [];
  const binds = [];

  if (url.searchParams.get("featured") === "1") where.push("p.featured = 1");
  if (url.searchParams.get("kind")) {
    where.push("p.kind = ?");
    binds.push(cleanString(url.searchParams.get("kind"), 30));
  }
  if (url.searchParams.get("id")) {
    where.push("p.id = ?");
    binds.push(Number(url.searchParams.get("id")));
  }

  const withGallery = `
    SELECT
      p.id,p.title,p.category,p.kind,p.summary,p.description,p.methods,p.image_url,p.project_url,
      p.status,p.start_year,p.end_year,p.featured,p.created_at,p.updated_at,
      (
        SELECT mg.id
        FROM media_gallery mg
        WHERE mg.entity_type='project' AND mg.entity_id=p.id
        ORDER BY mg.is_cover DESC, mg.sort_order ASC, mg.id ASC
        LIMIT 1
      ) AS cover_media_id
    FROM projects p
  `;

  const basic = `
    SELECT
      p.id,p.title,p.category,p.kind,p.summary,p.description,p.methods,p.image_url,p.project_url,
      p.status,p.start_year,p.end_year,p.featured,p.created_at,p.updated_at,
      NULL AS cover_media_id
    FROM projects p
  `;

  let tail = "";
  if (where.length) tail += ` WHERE ${where.join(" AND ")}`;
  tail += ` ORDER BY p.featured DESC, p.updated_at DESC, p.created_at DESC LIMIT ${safeLimit(url)}`;

  try {
    return (await env.DB.prepare(withGallery + tail).bind(...binds).all()).results;
  } catch {
    return (await env.DB.prepare(basic + tail).bind(...binds).all()).results;
  }
}

async function getConferences(url, env) {
  const where = [];
  const binds = [];

  if (url.searchParams.get("featured") === "1") where.push("c.featured = 1");
  if (url.searchParams.get("id")) {
    where.push("c.id = ?");
    binds.push(Number(url.searchParams.get("id")));
  }

  const withGallery = `
    SELECT
      c.id,c.title,c.event,c.type,c.year,c.location,c.description,c.url,c.featured,c.created_at,c.updated_at,
      (
        SELECT mg.id
        FROM media_gallery mg
        WHERE mg.entity_type='conference' AND mg.entity_id=c.id
        ORDER BY mg.is_cover DESC, mg.sort_order ASC, mg.id ASC
        LIMIT 1
      ) AS cover_media_id
    FROM conferences c
  `;

  const basic = `
    SELECT
      c.id,c.title,c.event,c.type,c.year,c.location,c.description,c.url,c.featured,c.created_at,c.updated_at,
      NULL AS cover_media_id
    FROM conferences c
  `;

  let tail = "";
  if (where.length) tail += ` WHERE ${where.join(" AND ")}`;
  tail += ` ORDER BY COALESCE(c.year,0) DESC, c.featured DESC, c.created_at DESC LIMIT ${safeLimit(url)}`;

  try {
    return (await env.DB.prepare(withGallery + tail).bind(...binds).all()).results;
  } catch {
    return (await env.DB.prepare(basic + tail).bind(...binds).all()).results;
  }
}

async function doiLookup(url) {
  let doi = cleanString(url.searchParams.get("doi") || "", 500)
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");

  if (!doi) return json({ error: "DOI is required." }, 400);

  const response = await fetch(
    `https://api.crossref.org/works/${encodeURIComponent(doi)}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "ArashPashazadehWebsite/1.0"
      }
    }
  );

  if (!response.ok) return json({ error: "DOI was not found in Crossref." }, 404);

  const data = await response.json();
  const message = data?.message || {};
  const authors = Array.isArray(message.author)
    ? message.author
        .map((a) => [a.given, a.family].filter(Boolean).join(" "))
        .filter(Boolean)
        .join(", ")
    : "";

  const parts =
    message["published-print"]?.["date-parts"] ||
    message["published-online"]?.["date-parts"] ||
    message.issued?.["date-parts"] ||
    [];

  const year = parts?.[0]?.[0] || null;

  return json({
    doi: message.DOI || doi,
    title: Array.isArray(message.title) ? message.title[0] || "" : "",
    authors,
    journal: Array.isArray(message["container-title"])
      ? message["container-title"][0] || ""
      : "",
    year,
    url: message.URL || `https://doi.org/${doi}`
  });
}

async function entityExists(env, entityType, entityId) {
  const table = entityTable(entityType);
  if (!table) return false;
  const row = await env.DB.prepare(`SELECT id FROM ${table} WHERE id=? LIMIT 1`)
    .bind(entityId)
    .first();
  return Boolean(row);
}

async function getGallery(request, url, env) {
  const entityType = cleanString(url.searchParams.get("entity_type"), 20);
  const entityId = Number(url.searchParams.get("entity_id"));

  if (!entityTable(entityType) || !Number.isInteger(entityId) || entityId <= 0) {
    return json({ error: "Valid entity_type and entity_id are required." }, 400);
  }

  const result = await env.DB.prepare(`
    SELECT id,entity_type,entity_id,original_name,mime_type,caption,alt_text,sort_order,is_cover,created_at,updated_at
    FROM media_gallery
    WHERE entity_type=? AND entity_id=?
    ORDER BY is_cover DESC, sort_order ASC, id ASC
  `).bind(entityType, entityId).all();

  const rows = result.results.map((row) => ({
    ...row,
    url: galleryMediaUrl(request, row.id, row.updated_at)
  }));

  return json(rows, 200, { "Cache-Control": "no-store" });
}

async function getSetting(env, key) {
  try {
    const row = await env.DB.prepare(`SELECT value FROM site_settings WHERE key=? LIMIT 1`).bind(key).first();
    return row?.value || "";
  } catch {
    return "";
  }
}

async function setSetting(env, key, value) {
  await env.DB.prepare(`
    INSERT INTO site_settings (key,value,updated_at)
    VALUES (?,?,CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP
  `).bind(key, String(value)).run();
}

async function mediaChannelInfo(env) {
  const id = await getSetting(env, "media_channel_id");
  const title = await getSetting(env, "media_channel_title");
  return { id, title, ready: Boolean(id) };
}

async function telegramFileResponse(fileId, env, cacheSeconds = 86400) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return new Response("Telegram bot token is not configured.", { status: 503, headers: CORS_HEADERS });
  }

  const getFileResponse = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`
  );
  const getFileData = await getFileResponse.json();

  if (!getFileData.ok || !getFileData.result?.file_path) {
    return new Response("Media not found", { status: 404, headers: CORS_HEADERS });
  }

  const fileResponse = await fetch(
    `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${getFileData.result.file_path}`
  );

  if (!fileResponse.ok) {
    return new Response("Unable to load media", { status: fileResponse.status, headers: CORS_HEADERS });
  }

  const headers = new Headers(CORS_HEADERS);
  headers.set("Content-Type", fileResponse.headers.get("Content-Type") || "application/octet-stream");
  headers.set("Cache-Control", `public, max-age=${cacheSeconds}`);
  return new Response(fileResponse.body, { status: 200, headers });
}

async function serveGalleryMedia(request, id, env) {
  const row = await env.DB.prepare(`
    SELECT telegram_file_id,mime_type,updated_at
    FROM media_gallery
    WHERE id=?
    LIMIT 1
  `).bind(id).first();

  if (!row?.telegram_file_id) {
    return new Response("Media not found", { status: 404, headers: CORS_HEADERS });
  }

  return telegramFileResponse(row.telegram_file_id, env, 604800);
}

function extensionForMime(mime) {
  const map = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/avif": "avif",
    "image/gif": "gif"
  };
  return map[mime] || "img";
}

async function uploadGalleryMedia(request, url, env) {
  const entityType = cleanString(url.searchParams.get("entity_type"), 20);
  const entityId = Number(url.searchParams.get("entity_id"));

  if (!entityTable(entityType) || !Number.isInteger(entityId) || entityId <= 0) {
    return json({ error: "Valid entity_type and entity_id are required." }, 400);
  }

  if (!(await entityExists(env, entityType, entityId))) {
    return json({ error: "The selected project or conference does not exist." }, 404);
  }

  const mediaChannel = await mediaChannelInfo(env);
  if (!mediaChannel.ready) {
    return json({
      error: `Telegram media channel is not connected. Create a private channel, add the bot as admin, then post exactly: ${MEDIA_SETUP_PHRASE}`
    }, 503);
  }

  const contentType = cleanString(request.headers.get("Content-Type"), 100).toLowerCase();
  if (!contentType.startsWith("image/")) {
    return json({ error: "Only image uploads are allowed." }, 415);
  }

  const allowed = new Set(["image/webp", "image/jpeg", "image/png", "image/avif", "image/gif"]);
  if (!allowed.has(contentType)) {
    return json({ error: "Unsupported image type." }, 415);
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > 8 * 1024 * 1024) {
    return json({ error: "Image is too large. Maximum upload size is 8 MB after optimization." }, 413);
  }

  const originalName = decodeURIComponent(cleanString(request.headers.get("X-File-Name"), 500) || "image");

  try {
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > 8 * 1024 * 1024) {
      return json({ error: "Image is too large. Maximum upload size is 8 MB after optimization." }, 413);
    }

    const form = new FormData();
    form.append("chat_id", mediaChannel.id);
    form.append("document", new Blob([bytes], { type: contentType }), originalName);
    form.append(
      "caption",
      `Website media • ${entityType} #${entityId} • ${originalName}`.slice(0, 1000)
    );
    form.append("disable_content_type_detection", "true");

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendDocument`,
      { method: "POST", body: form }
    );
    const telegramData = await telegramResponse.json();

    if (!telegramData.ok || !telegramData.result?.document?.file_id) {
      console.error("TELEGRAM MEDIA UPLOAD ERROR", telegramData);
      return json({ error: telegramData.description || "Telegram media upload failed." }, 502);
    }

    const doc = telegramData.result.document;
    const orderRow = await env.DB.prepare(`
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
      FROM media_gallery
      WHERE entity_type=? AND entity_id=?
    `).bind(entityType, entityId).first();

    const coverRow = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM media_gallery
      WHERE entity_type=? AND entity_id=?
    `).bind(entityType, entityId).first();

    const sortOrder = Number(orderRow?.next_order || 0);
    const isCover = Number(coverRow?.count || 0) === 0 ? 1 : 0;

    const result = await env.DB.prepare(`
      INSERT INTO media_gallery
        (entity_type,entity_id,telegram_file_id,telegram_file_unique_id,telegram_message_id,telegram_chat_id,
         original_name,mime_type,caption,alt_text,sort_order,is_cover)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `).bind(
      entityType,
      entityId,
      doc.file_id,
      doc.file_unique_id || "",
      telegramData.result.message_id,
      String(telegramData.result.chat?.id || mediaChannel.id),
      originalName,
      contentType,
      "",
      originalName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      sortOrder,
      isCover
    ).run();

    const id = Number(result.meta.last_row_id);
    return json({
      ok: true,
      id,
      is_cover: isCover,
      storage: "telegram",
      url: galleryMediaUrl(request, id)
    }, 201);
  } catch (error) {
    console.error("TELEGRAM GALLERY UPLOAD ERROR", error);
    return json({ error: "Unable to upload image to Telegram media storage." }, 500);
  }
}

async function updateGalleryMedia(request, id, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const existing = await env.DB.prepare(`
    SELECT id,entity_type,entity_id
    FROM media_gallery
    WHERE id=?
    LIMIT 1
  `).bind(id).first();

  if (!existing) return json({ error: "Image not found." }, 404);

  const caption = cleanString(body.caption, 1500);
  const altText = cleanString(body.alt_text, 1000);
  const sortOrder = Number.isFinite(Number(body.sort_order)) ? Math.max(0, Math.trunc(Number(body.sort_order))) : 0;
  const isCover = boolInt(body.is_cover);

  if (isCover) {
    await env.DB.batch([
      env.DB.prepare(`
        UPDATE media_gallery
        SET is_cover=0,updated_at=CURRENT_TIMESTAMP
        WHERE entity_type=? AND entity_id=?
      `).bind(existing.entity_type, existing.entity_id),
      env.DB.prepare(`
        UPDATE media_gallery
        SET caption=?,alt_text=?,sort_order=?,is_cover=1,updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).bind(caption, altText, sortOrder, id)
    ]);
  } else {
    await env.DB.prepare(`
      UPDATE media_gallery
      SET caption=?,alt_text=?,sort_order=?,is_cover=0,updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).bind(caption, altText, sortOrder, id).run();
  }

  return json({ ok: true });
}

async function deleteTelegramMessage(env, chatId, messageId) {
  if (!env.TELEGRAM_BOT_TOKEN || !chatId || !messageId) return;
  try {
    await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/deleteMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id: messageId })
    });
  } catch (error) {
    console.error("TELEGRAM DELETE ERROR", error);
  }
}

async function deleteGalleryMedia(id, env) {
  const existing = await env.DB.prepare(`
    SELECT id,entity_type,entity_id,telegram_chat_id,telegram_message_id,is_cover
    FROM media_gallery
    WHERE id=?
    LIMIT 1
  `).bind(id).first();

  if (!existing) return json({ error: "Image not found." }, 404);

  await deleteTelegramMessage(env, existing.telegram_chat_id, existing.telegram_message_id);
  await env.DB.prepare(`DELETE FROM media_gallery WHERE id=?`).bind(id).run();

  if (existing.is_cover) {
    const next = await env.DB.prepare(`
      SELECT id
      FROM media_gallery
      WHERE entity_type=? AND entity_id=?
      ORDER BY sort_order ASC,id ASC
      LIMIT 1
    `).bind(existing.entity_type, existing.entity_id).first();

    if (next) {
      await env.DB.prepare(`UPDATE media_gallery SET is_cover=1,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(next.id)
        .run();
    }
  }

  return json({ ok: true });
}

async function cleanupEntityMedia(env, entityType, entityId) {
  let rows = [];
  try {
    rows = (await env.DB.prepare(`
      SELECT telegram_chat_id,telegram_message_id
      FROM media_gallery
      WHERE entity_type=? AND entity_id=?
    `).bind(entityType, entityId).all()).results;
  } catch {
    return;
  }

  for (const row of rows) {
    await deleteTelegramMessage(env, row.telegram_chat_id, row.telegram_message_id);
  }

  await env.DB.prepare(`DELETE FROM media_gallery WHERE entity_type=? AND entity_id=?`)
    .bind(entityType, entityId)
    .run();
}

async function adminCrud(request, url, env) {
  if (!env.ADMIN_SECRET) return json({ error: "ADMIN_SECRET is not configured in Cloudflare." }, 503);
  if (!isAdmin(request, env)) return json({ error: "Unauthorized" }, 401);

  if (url.pathname === "/admin/ping" && request.method === "GET") {
    const mediaChannel = await mediaChannelInfo(env);
    return json({
      ok: true,
      media_storage: mediaChannel.ready,
      media_storage_type: "telegram",
      media_channel_title: mediaChannel.title || ""
    });
  }

  if (url.pathname === "/admin/analytics" && request.method === "GET") {
    return adminAnalytics(url, env);
  }

  if (url.pathname === "/admin/media" && request.method === "POST") {
    return uploadGalleryMedia(request, url, env);
  }

  const mediaMatch = url.pathname.match(/^\/admin\/media\/(\d+)$/);
  if (mediaMatch) {
    const mediaId = Number(mediaMatch[1]);
    if (request.method === "PUT") return updateGalleryMedia(request, mediaId, env);
    if (request.method === "DELETE") return deleteGalleryMedia(mediaId, env);
    return json({ error: "Method not allowed." }, 405);
  }

  const match = url.pathname.match(/^\/admin\/(publications|projects|conferences)(?:\/(\d+))?$/);
  if (!match) return null;

  const resource = match[1];
  const id = match[2] ? Number(match[2]) : null;
  let body = {};

  if (["POST", "PUT"].includes(request.method)) {
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON." }, 400);
    }
  }

  if (resource === "publications") {
    if (request.method === "POST") {
      const title = cleanString(body.title, 500);
      if (!title) return json({ error: "Title is required." }, 400);
      const doi = cleanString(body.doi, 500) || null;

      try {
        const result = await env.DB.prepare(`
          INSERT INTO publications (title,authors,journal,year,doi,url,pdf_url,status,abstract,featured)
          VALUES (?,?,?,?,?,?,?,?,?,?)
        `).bind(
          title,
          cleanString(body.authors, 2000),
          cleanString(body.journal, 500),
          nullableInt(body.year),
          doi,
          cleanString(body.url, 2000),
          cleanString(body.pdf_url, 2000),
          cleanString(body.status, 100) || "Published",
          cleanString(body.abstract, 12000),
          boolInt(body.featured)
        ).run();
        return json({ ok: true, id: result.meta.last_row_id }, 201);
      } catch (error) {
        return json({
          error: doi && String(error).includes("UNIQUE")
            ? "This DOI already exists."
            : "Unable to save publication."
        }, 400);
      }
    }

    if (request.method === "PUT" && id) {
      const title = cleanString(body.title, 500);
      if (!title) return json({ error: "Title is required." }, 400);
      try {
        await env.DB.prepare(`
          UPDATE publications
          SET title=?,authors=?,journal=?,year=?,doi=?,url=?,pdf_url=?,status=?,abstract=?,featured=?,updated_at=CURRENT_TIMESTAMP
          WHERE id=?
        `).bind(
          title,
          cleanString(body.authors, 2000),
          cleanString(body.journal, 500),
          nullableInt(body.year),
          cleanString(body.doi, 500) || null,
          cleanString(body.url, 2000),
          cleanString(body.pdf_url, 2000),
          cleanString(body.status, 100) || "Published",
          cleanString(body.abstract, 12000),
          boolInt(body.featured),
          id
        ).run();
        return json({ ok: true });
      } catch (error) {
        return json({
          error: String(error).includes("UNIQUE")
            ? "This DOI already exists."
            : "Unable to update publication."
        }, 400);
      }
    }

    if (request.method === "DELETE" && id) {
      await env.DB.prepare(`DELETE FROM publications WHERE id=?`).bind(id).run();
      return json({ ok: true });
    }
  }

  if (resource === "projects") {
    if (request.method === "POST") {
      const title = cleanString(body.title, 500);
      if (!title) return json({ error: "Project title is required." }, 400);
      const result = await env.DB.prepare(`
        INSERT INTO projects
          (title,category,kind,summary,description,methods,image_url,project_url,status,start_year,end_year,featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `).bind(
        title,
        cleanString(body.category, 300),
        cleanString(body.kind, 30) || "research",
        cleanString(body.summary, 4000),
        cleanString(body.description, 16000),
        cleanString(body.methods, 3000),
        cleanString(body.image_url, 3000),
        cleanString(body.project_url, 3000),
        cleanString(body.status, 100),
        nullableInt(body.start_year),
        nullableInt(body.end_year),
        boolInt(body.featured)
      ).run();
      return json({ ok: true, id: result.meta.last_row_id }, 201);
    }

    if (request.method === "PUT" && id) {
      const title = cleanString(body.title, 500);
      if (!title) return json({ error: "Project title is required." }, 400);
      await env.DB.prepare(`
        UPDATE projects
        SET title=?,category=?,kind=?,summary=?,description=?,methods=?,image_url=?,project_url=?,status=?,start_year=?,end_year=?,featured=?,updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).bind(
        title,
        cleanString(body.category, 300),
        cleanString(body.kind, 30) || "research",
        cleanString(body.summary, 4000),
        cleanString(body.description, 16000),
        cleanString(body.methods, 3000),
        cleanString(body.image_url, 3000),
        cleanString(body.project_url, 3000),
        cleanString(body.status, 100),
        nullableInt(body.start_year),
        nullableInt(body.end_year),
        boolInt(body.featured),
        id
      ).run();
      return json({ ok: true });
    }

    if (request.method === "DELETE" && id) {
      await cleanupEntityMedia(env, "project", id);
      await env.DB.prepare(`DELETE FROM projects WHERE id=?`).bind(id).run();
      return json({ ok: true });
    }
  }

  if (resource === "conferences") {
    if (request.method === "POST") {
      const title = cleanString(body.title, 500);
      if (!title) return json({ error: "Conference title is required." }, 400);
      const result = await env.DB.prepare(`
        INSERT INTO conferences (title,event,type,year,location,description,url,featured)
        VALUES (?,?,?,?,?,?,?,?)
      `).bind(
        title,
        cleanString(body.event, 500),
        cleanString(body.type, 200),
        nullableInt(body.year),
        cleanString(body.location, 500),
        cleanString(body.description, 6000),
        cleanString(body.url, 3000),
        boolInt(body.featured)
      ).run();
      return json({ ok: true, id: result.meta.last_row_id }, 201);
    }

    if (request.method === "PUT" && id) {
      const title = cleanString(body.title, 500);
      if (!title) return json({ error: "Conference title is required." }, 400);
      await env.DB.prepare(`
        UPDATE conferences
        SET title=?,event=?,type=?,year=?,location=?,description=?,url=?,featured=?,updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `).bind(
        title,
        cleanString(body.event, 500),
        cleanString(body.type, 200),
        nullableInt(body.year),
        cleanString(body.location, 500),
        cleanString(body.description, 6000),
        cleanString(body.url, 3000),
        boolInt(body.featured),
        id
      ).run();
      return json({ ok: true });
    }

    if (request.method === "DELETE" && id) {
      await cleanupEntityMedia(env, "conference", id);
      await env.DB.prepare(`DELETE FROM conferences WHERE id=?`).bind(id).run();
      return json({ ok: true });
    }
  }

  return json({ error: "Method not allowed." }, 405);
}

async function telegramPosts(env) {
  try {
    const rich = await env.DB.prepare(`
      SELECT id,telegram_message_id,channel_username,text,posted_at,created_at,media_file_id,media_type,media_group_id
      FROM telegram_posts
      ORDER BY posted_at DESC
    `).all();
    return rich.results;
  } catch {
    const basic = await env.DB.prepare(`
      SELECT id,telegram_message_id,channel_username,text,posted_at,created_at
      FROM telegram_posts
      ORDER BY posted_at DESC
    `).all();
    return basic.results.map((row) => ({
      ...row,
      media_file_id: null,
      media_type: null,
      media_group_id: null
    }));
  }
}

async function saveTelegramPost(post, env) {
  const messageId = post.message_id;
  const channelUsername = post.chat?.username || post.chat?.title || String(post.chat?.id || "");
  const postText = post.text || post.caption || "";
  const postedAt = post.date
    ? new Date(post.date * 1000).toISOString()
    : new Date().toISOString();
  const mediaGroupId = post.media_group_id ? String(post.media_group_id) : null;

  let mediaFileId = null;
  let mediaType = null;

  if (Array.isArray(post.photo) && post.photo.length) {
    mediaFileId = post.photo[post.photo.length - 1].file_id || null;
    mediaType = "photo";
  } else if (post.video?.thumbnail?.file_id) {
    mediaFileId = post.video.thumbnail.file_id;
    mediaType = "video_thumbnail";
  } else if (post.animation?.thumbnail?.file_id) {
    mediaFileId = post.animation.thumbnail.file_id;
    mediaType = "animation_thumbnail";
  } else if (post.document?.thumbnail?.file_id) {
    mediaFileId = post.document.thumbnail.file_id;
    mediaType = "document_thumbnail";
  }

  try {
    await env.DB.prepare(`
      INSERT INTO telegram_posts
        (telegram_message_id,channel_username,text,posted_at,media_file_id,media_type,media_group_id)
      VALUES (?,?,?,?,?,?,?)
      ON CONFLICT(telegram_message_id)
      DO UPDATE SET
        channel_username=excluded.channel_username,
        text=excluded.text,
        posted_at=excluded.posted_at,
        media_file_id=excluded.media_file_id,
        media_type=excluded.media_type,
        media_group_id=excluded.media_group_id
    `).bind(
      messageId,
      channelUsername,
      postText,
      postedAt,
      mediaFileId,
      mediaType,
      mediaGroupId
    ).run();
  } catch {
    await env.DB.prepare(`
      INSERT INTO telegram_posts (telegram_message_id,channel_username,text,posted_at)
      VALUES (?,?,?,?)
      ON CONFLICT(telegram_message_id)
      DO UPDATE SET
        channel_username=excluded.channel_username,
        text=excluded.text,
        posted_at=excluded.posted_at
    `).bind(messageId, channelUsername, postText, postedAt).run();
  }

  return { messageId, mediaType };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    try {
      if (url.pathname.startsWith("/admin/")) {
        const response = await adminCrud(request, url, env);
        if (response) return response;
      }

      if (url.pathname === "/" && request.method === "GET") {
        return json({
          ok: true,
          service: "Arash Website API",
          status: "running",
          version: "v9-analytics",
          media_storage: (await mediaChannelInfo(env)).ready,
          media_storage_type: "telegram",
          insights_source: `@${INSIGHTS_CHANNEL_USERNAME}`
        });
      }

      if (url.pathname === "/track" && request.method === "POST") {
        return trackVisit(request, env);
      }

      if (url.pathname === "/publications" && request.method === "GET") {
        return json(await getPublications(url, env), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/projects" && request.method === "GET") {
        return json(await getProjects(url, env), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/conferences" && request.method === "GET") {
        return json(await getConferences(url, env), 200, { "Cache-Control": "no-store" });
      }

      if (url.pathname === "/gallery" && request.method === "GET") {
        return getGallery(request, url, env);
      }

      const galleryMediaMatch = url.pathname.match(/^\/gallery-media\/(\d+)$/);
      if (galleryMediaMatch && request.method === "GET") {
        return serveGalleryMedia(request, Number(galleryMediaMatch[1]), env);
      }

      if (url.pathname === "/doi" && request.method === "GET") {
        return doiLookup(url);
      }

      if (url.pathname === "/posts" && request.method === "GET") {
        return json(await telegramPosts(env), 200, { "Cache-Control": "no-store" });
      }

      // Existing Telegram media proxy for public Insights posts.
      if (url.pathname === "/media" && request.method === "GET") {
        const fileId = url.searchParams.get("file_id");
        if (!fileId || fileId.length > 512) {
          return new Response("Invalid file_id", { status: 400, headers: CORS_HEADERS });
        }
        return telegramFileResponse(fileId, env, 3600);
      }

      if (url.pathname === "/telegram" && request.method === "POST") {
        const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
        if (!secret || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
          return json({ ok: false, error: "Unauthorized" }, 401);
        }

        const update = await request.json();
        const post = update.channel_post || update.edited_channel_post;
        if (!post) return json({ ok: true, ignored: true });

        const channelUsername = String(post.chat?.username || "");
        const postText = String(post.text || post.caption || "").trim();

        // PRIVATE MEDIA CHANNEL SETUP.
        // This channel is intentionally NOT written to telegram_posts.
        if (
          post.chat?.type === "channel" &&
          channelUsername !== INSIGHTS_CHANNEL_USERNAME &&
          postText.toUpperCase() === MEDIA_SETUP_PHRASE
        ) {
          await setSetting(env, "media_channel_id", String(post.chat.id));
          await setSetting(env, "media_channel_title", String(post.chat.title || "Arash Website Media"));
          return json({
            ok: true,
            configured: "media_channel",
            title: post.chat.title || "",
            isolated_from_insights: true
          });
        }

        // HARD SEPARATION: only the public Civil Engineering channel can enter Insights.
        // Any private media channel post, bot-uploaded gallery file, or other channel is ignored.
        if (channelUsername !== INSIGHTS_CHANNEL_USERNAME) {
          return json({ ok: true, ignored: true, reason: "not_insights_channel" });
        }

        const saved = await saveTelegramPost(post, env);
        return json({
          ok: true,
          saved: true,
          message_id: saved.messageId,
          media_type: saved.mediaType,
          source: "insights"
        });
      }

      return json({ ok: false, error: "Not Found" }, 404);
    } catch (error) {
      console.error("WORKER ERROR", error);
      return json({ ok: false, error: "Server error" }, 500);
    }
  }
};
