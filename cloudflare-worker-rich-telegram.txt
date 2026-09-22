export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // =====================================================
    // HOME / HEALTH CHECK
    // =====================================================
    if (url.pathname === "/" && request.method === "GET") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "Arash Website API",
          status: "running"
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // =====================================================
    // PUBLIC POSTS API — RETURNS ALL STORED POSTS
    // =====================================================
    if (url.pathname === "/posts" && request.method === "GET") {
      try {
        const result = await env.DB
          .prepare(`
            SELECT
              id,
              telegram_message_id,
              channel_username,
              text,
              posted_at,
              created_at,
              media_file_id,
              media_type,
              media_group_id
            FROM telegram_posts
            ORDER BY posted_at DESC
          `)
          .all();

        return new Response(
          JSON.stringify(result.results),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              ...corsHeaders
            }
          }
        );
      } catch (error) {
        console.error("POSTS API ERROR:", error);

        return new Response(
          JSON.stringify({
            ok: false,
            error: "Unable to retrieve posts."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              ...corsHeaders
            }
          }
        );
      }
    }

    // =====================================================
    // PUBLIC MEDIA PROXY
    // Keeps TELEGRAM_BOT_TOKEN private.
    // =====================================================
    if (url.pathname === "/media" && request.method === "GET") {
      const fileId = url.searchParams.get("file_id");

      if (!fileId || fileId.length > 512) {
        return new Response("Invalid file_id", {
          status: 400,
          headers: corsHeaders
        });
      }

      try {
        const getFileResponse = await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${encodeURIComponent(fileId)}`
        );

        const getFileResult = await getFileResponse.json();

        if (
          !getFileResult.ok ||
          !getFileResult.result ||
          !getFileResult.result.file_path
        ) {
          return new Response("Media not found", {
            status: 404,
            headers: corsHeaders
          });
        }

        const filePath =
          getFileResult.result.file_path;

        const telegramFileResponse = await fetch(
          `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${filePath}`
        );

        if (!telegramFileResponse.ok) {
          return new Response("Unable to load media", {
            status: telegramFileResponse.status,
            headers: corsHeaders
          });
        }

        const headers = new Headers();
        headers.set(
          "Content-Type",
          telegramFileResponse.headers.get("Content-Type") ||
            "application/octet-stream"
        );
        headers.set(
          "Cache-Control",
          "public, max-age=3600"
        );
        headers.set(
          "Access-Control-Allow-Origin",
          "*"
        );

        return new Response(
          telegramFileResponse.body,
          {
            status: 200,
            headers
          }
        );

      } catch (error) {
        console.error("MEDIA PROXY ERROR:", error);

        return new Response("Media proxy error", {
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // =====================================================
    // TELEGRAM WEBHOOK
    // =====================================================
    if (
      url.pathname === "/telegram" &&
      request.method === "POST"
    ) {
      const telegramSecret =
        request.headers.get(
          "X-Telegram-Bot-Api-Secret-Token"
        );

      if (
        !telegramSecret ||
        telegramSecret !== env.TELEGRAM_WEBHOOK_SECRET
      ) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Unauthorized"
          }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      try {
        const update = await request.json();

        const post =
          update.channel_post ||
          update.edited_channel_post;

        if (!post) {
          return new Response(
            JSON.stringify({
              ok: true,
              ignored: true
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        const messageId = post.message_id;

        const channelUsername =
          post.chat?.username ||
          post.chat?.title ||
          String(post.chat?.id || "");

        const postText =
          post.text ||
          post.caption ||
          "";

        const postedAt =
          post.date
            ? new Date(post.date * 1000).toISOString()
            : new Date().toISOString();

        const mediaGroupId =
          post.media_group_id
            ? String(post.media_group_id)
            : null;

        // Pick the best preview image available.
        let mediaFileId = null;
        let mediaType = null;

        if (
          Array.isArray(post.photo) &&
          post.photo.length > 0
        ) {
          const largestPhoto =
            post.photo[post.photo.length - 1];

          mediaFileId =
            largestPhoto.file_id || null;

          mediaType = "photo";

        } else if (
          post.video &&
          post.video.thumbnail &&
          post.video.thumbnail.file_id
        ) {
          mediaFileId =
            post.video.thumbnail.file_id;

          mediaType = "video_thumbnail";

        } else if (
          post.animation &&
          post.animation.thumbnail &&
          post.animation.thumbnail.file_id
        ) {
          mediaFileId =
            post.animation.thumbnail.file_id;

          mediaType = "animation_thumbnail";

        } else if (
          post.document &&
          post.document.thumbnail &&
          post.document.thumbnail.file_id
        ) {
          mediaFileId =
            post.document.thumbnail.file_id;

          mediaType = "document_thumbnail";
        }

        await env.DB
          .prepare(`
            INSERT INTO telegram_posts (
              telegram_message_id,
              channel_username,
              text,
              posted_at,
              media_file_id,
              media_type,
              media_group_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)

            ON CONFLICT(telegram_message_id)
            DO UPDATE SET
              channel_username = excluded.channel_username,
              text = excluded.text,
              posted_at = excluded.posted_at,
              media_file_id = excluded.media_file_id,
              media_type = excluded.media_type,
              media_group_id = excluded.media_group_id
          `)
          .bind(
            messageId,
            channelUsername,
            postText,
            postedAt,
            mediaFileId,
            mediaType,
            mediaGroupId
          )
          .run();

        console.log(
          `Telegram post saved: ${messageId}`
        );

        return new Response(
          JSON.stringify({
            ok: true,
            saved: true,
            message_id: messageId,
            media_type: mediaType
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        console.error(
          "TELEGRAM WEBHOOK ERROR:",
          error
        );

        return new Response(
          JSON.stringify({
            ok: false,
            error: "Webhook processing failed."
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: false,
        error: "Not Found"
      }),
      {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
};
