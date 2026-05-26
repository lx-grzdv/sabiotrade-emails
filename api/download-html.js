const fs = require("fs");
const path = require("path");

function sendText(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.end(body);
}

function toSafePreviewPath(value) {
  const raw = String(value || "").replace(/^\/+/, "");
  if (!raw.startsWith("preview/") || !raw.endsWith(".html")) return null;
  if (raw.includes("\0") || raw.split("/").includes("..")) return null;
  return raw;
}

function toDownloadFilename(filePath) {
  const filename = path.basename(filePath);
  return filename.endsWith(".html") ? filename : `${filename}.html`;
}

module.exports = async (req, res) => {
  if (req.method && req.method !== "GET") {
    return sendText(res, 405, "Method not allowed");
  }

  const safePath = toSafePreviewPath(req.query?.path);
  if (!safePath) {
    return sendText(res, 400, "Only preview/*.html files can be downloaded");
  }

  const root = process.cwd();
  const absolutePath = path.resolve(root, safePath);
  const previewRoot = path.resolve(root, "preview");

  if (!absolutePath.startsWith(`${previewRoot}${path.sep}`)) {
    return sendText(res, 400, "Invalid preview path");
  }

  try {
    const html = await fs.promises.readFile(absolutePath);
    const filename = toDownloadFilename(safePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.end(html);
  } catch (error) {
    if (error.code === "ENOENT") {
      return sendText(res, 404, "HTML file not found");
    }
    return sendText(res, 500, "Failed to download HTML");
  }
};
