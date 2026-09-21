export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    };

    // =====================================================
    // CORS PREFLIGHT
    // =====================================================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // =====================================================
    // HOME / API HEALTH CHECK
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
    // PUBLIC API — GET ALL TELEGRAM POSTS
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
              created_at
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

        await env.DB
          .prepare(`
            INSERT INTO telegram_posts (
              telegram_message_id,
              channel_username,
              text,
              posted_at
            )
            VALUES (?, ?, ?, ?)

            ON CONFLICT(telegram_message_id)
            DO UPDATE SET
              channel_username = excluded.channel_username,
              text = excluded.text,
              posted_at = excluded.posted_at
          `)
          .bind(
            messageId,
            channelUsername,
            postText,
            postedAt
          )
          .run();

        console.log(`Telegram post saved: ${messageId}`);

        return new Response(
          JSON.stringify({
            ok: true,
            saved: true,
            message_id: messageId
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

      } catch (error) {
        console.error("TELEGRAM WEBHOOK ERROR:", error);

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

    // =====================================================
    // 404
    // =====================================================
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
