const ALLOWED_STATUSES = new Set(["open", "applied", "resolved"]);

function getConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const table = process.env.REVIEW_COMMENTS_TABLE || "review_comments";
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key, table };
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function rowToComment(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    campaignId: row.campaign_id,
    emailId: row.email_id,
    emailTitle: row.email_title,
    previewPath: row.preview_path,
    sourcePath: row.source_path,
    selector: row.selector,
    reviewId: row.review_id,
    tagName: row.tag_name,
    textQuote: row.text_quote,
    comment: row.comment,
    status: row.status,
    authorName: row.author_name,
  };
}

function commentToRow(body) {
  const now = new Date().toISOString();
  return {
    id: body.id,
    campaign_id: body.campaignId,
    email_id: body.emailId || null,
    email_title: body.emailTitle || null,
    preview_path: body.previewPath,
    source_path: body.sourcePath || null,
    selector: body.selector || null,
    review_id: body.reviewId || null,
    tag_name: body.tagName || null,
    text_quote: body.textQuote || null,
    comment: body.comment,
    status: body.status || "open",
    author_name: body.authorName || null,
    created_at: body.createdAt || now,
    updated_at: body.updatedAt || now,
  };
}

async function supabaseFetch(config, path, options = {}) {
  const headers = {
    apikey: config.key,
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (!config.key.startsWith("sb_")) {
    headers.Authorization = `Bearer ${config.key}`;
  }
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...options,
    headers,
  });
  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  return { response, data };
}

function checkReviewToken(req, res) {
  const expected = process.env.REVIEW_COMMENTS_TOKEN;
  if (!expected) return true;
  const provided = req.headers["x-review-token"] || req.headers["X-Review-Token"] || "";
  if (provided !== expected) {
    json(res, 401, { ok: false, error: "Unauthorized" });
    return false;
  }
  return true;
}

module.exports = async (req, res) => {
  const config = getConfig();
  if (!config) {
    return json(res, 500, { ok: false, error: "Review comments API is not configured" });
  }

  if (!checkReviewToken(req, res)) return;

  const method = req.method || "GET";

  try {
    if (method === "GET") {
      const campaignId = (req.query?.campaignId || "").trim();
      if (!campaignId) {
        return json(res, 400, { ok: false, error: "campaignId is required" });
      }
      const query = new URLSearchParams({
        campaign_id: `eq.${campaignId}`,
        order: "created_at.asc",
        select: "*",
      });
      const { response, data } = await supabaseFetch(config, `${config.table}?${query.toString()}`);
      if (!response.ok) {
        return json(res, 500, { ok: false, error: data?.message || "Failed to load comments" });
      }
      return json(res, 200, { ok: true, comments: (data || []).map(rowToComment) });
    }

    if (method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        body = JSON.parse(body);
      }
      if (!body?.id || !body?.campaignId || !body?.previewPath || !body?.comment) {
        return json(res, 400, { ok: false, error: "id, campaignId, previewPath and comment are required" });
      }
      if (body.status && !ALLOWED_STATUSES.has(body.status)) {
        return json(res, 400, { ok: false, error: "Invalid status" });
      }
      const row = commentToRow(body);
      const { response, data } = await supabaseFetch(config, config.table, {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(row),
      });
      if (!response.ok) {
        return json(res, 500, { ok: false, error: data?.message || "Failed to create comment" });
      }
      const created = Array.isArray(data) ? data[0] : data;
      return json(res, 200, { ok: true, comment: rowToComment(created) });
    }

    if (method === "PATCH") {
      let body = req.body;
      if (typeof body === "string") {
        body = JSON.parse(body);
      }
      if (!body?.id) {
        return json(res, 400, { ok: false, error: "id is required" });
      }
      const patch = { updated_at: new Date().toISOString() };
      if (body.status !== undefined) {
        if (!ALLOWED_STATUSES.has(body.status)) {
          return json(res, 400, { ok: false, error: "Invalid status" });
        }
        patch.status = body.status;
      }
      if (body.comment !== undefined) patch.comment = body.comment;
      if (body.authorName !== undefined) patch.author_name = body.authorName;

      const query = new URLSearchParams({ id: `eq.${body.id}` });
      const { response, data } = await supabaseFetch(config, `${config.table}?${query.toString()}`, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        return json(res, 500, { ok: false, error: data?.message || "Failed to update comment" });
      }
      const updated = Array.isArray(data) ? data[0] : data;
      if (!updated) {
        return json(res, 404, { ok: false, error: "Comment not found" });
      }
      return json(res, 200, { ok: true, comment: rowToComment(updated) });
    }

    if (method === "DELETE") {
      const campaignId = (req.query?.campaignId || "").trim();
      if (!campaignId) {
        return json(res, 400, { ok: false, error: "campaignId is required" });
      }
      const query = new URLSearchParams({ campaign_id: `eq.${campaignId}` });
      const { response, data } = await supabaseFetch(config, `${config.table}?${query.toString()}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        return json(res, 500, { ok: false, error: data?.message || "Failed to delete comments" });
      }
      return json(res, 200, { ok: true, deleted: true });
    }

    return json(res, 405, { ok: false, error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || "Unexpected server error" });
  }
};
