(function () {
  const data = window.CAMPAIGN_DATA;
  if (!data) return;

  const campaignsById = Object.fromEntries(data.campaigns.map((campaign) => [campaign.id, campaign]));

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const toPublicSourcePath = (path) => {
    if (!path) return "";
    return path.startsWith("development/") ? `sources/${path.slice("development/".length)}` : path;
  };

  const renderEmailRows = (emails, campaignName, campaignId) =>
    emails
      .map(
        (email, index) => `
        <tr>
          <td>${index + 1}</td>
          <td class="id-cell"><code>${escapeHtml(email.id)}</code></td>
          <td>${escapeHtml(email.sendAt)}</td>
          <td>${escapeHtml(email.subject || "—")}</td>
          <td>${escapeHtml(email.preheader || "—")}</td>
          <td class="link-cell">
            <a
              href="${escapeHtml(email.previewPath)}"
              class="js-preview-link-clean"
              data-preview-title="${escapeHtml(campaignName)} · ${escapeHtml(email.id)}"
            >
              Preview
            </a>
            <a href="chain.html?chain=${escapeHtml(campaignId)}&review=1&email=${escapeHtml(email.id)}">Review</a>
            <a href="${escapeHtml(toPublicSourcePath(email.developmentPath))}" target="_blank" rel="noopener">Source</a>
          </td>
        </tr>
      `
      )
      .join("");

  const renderStageBlock = (stage) => {
    const campaigns = data.campaigns.filter((campaign) => campaign.stageId === stage.id);
    const cards = campaigns
      .map((campaign) => {
        return `
        <article class="cjm-card" id="campaign-${escapeHtml(campaign.id)}">
          <div class="cjm-card-header">
            <div>
              <h3>${escapeHtml(campaign.name)}</h3>
              <p>${escapeHtml(campaign.summary)}</p>
            </div>
            <a class="cjm-chain-link" href="chain.html?chain=${escapeHtml(campaign.id)}">Детали цепочки →</a>
          </div>
          <div class="cjm-card-meta">
            <span><strong>Триггер:</strong> ${escapeHtml(campaign.trigger)}</span>
            <span><strong>Exit:</strong> ${escapeHtml(campaign.exit)}</span>
            <span><strong>Re-entry:</strong> ${escapeHtml(campaign.reentry)}</span>
            <span><strong>Писем:</strong> ${campaign.emails.length}</span>
          </div>
          <div class="table-wrap">
            <table class="campaign-table campaign-table-wide" role="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID</th>
                  <th>Когда шлется</th>
                  <th>Subject</th>
                  <th>Preheader</th>
                  <th>Открыть</th>
                </tr>
              </thead>
              <tbody>
                ${renderEmailRows(campaign.emails, campaign.name, campaign.id)}
              </tbody>
            </table>
          </div>
        </article>
      `;
      })
      .join("");

    return `
      <section class="cjm-stage" id="stage-${escapeHtml(stage.id)}">
        <h2 class="section-title">${escapeHtml(stage.title)}</h2>
        <p class="stage-lead">${escapeHtml(stage.description)}</p>
        <div class="cjm-card-list">${cards}</div>
      </section>
    `;
  };

  const renderHub = () => {
    const root = document.getElementById("cjm-root");
    if (!root) return;

    const stageNav = data.stages
      .map((stage, index) => {
        const label = stage.title.replace(/^[0-9]+\)\s*/, "");
        return `
          <a class="cjm-path-link" href="#stage-${escapeHtml(stage.id)}">
            <span class="cjm-path-index">${index + 1}</span>
            <span class="cjm-path-label">${escapeHtml(label)}</span>
          </a>
        `;
      })
      .join("");

    root.innerHTML = `
      <section class="hub-meta cjm-nav">
        <h2>CJM навигация</h2>
        <p>Ниже каждая цепочка разложена по последовательности писем: тайминг, subject, preheader и прямые ссылки на шаблоны.</p>
        <div class="cjm-nav-links">${stageNav}</div>
      </section>
      ${data.stages.map(renderStageBlock).join("")}
      <section class="hub-meta">
        <h2>UI Kit</h2>
        <ul>
          <li><a href="Templates%20%26%20Examples/Email_UI_Kit_Blocks.html">Email_UI_Kit_Blocks.html</a></li>
          <li><a href="Templates%20%26%20Examples/Email_UI_Kit_Readme.md">Email_UI_Kit_Readme.md</a></li>
        </ul>
      </section>
    `;
  };

  const renderChainPage = () => {
    const root = document.getElementById("chain-root");
    if (!root) return;

    const params = new URLSearchParams(window.location.search);
    const chainId = params.get("chain");
    const campaign = chainId ? campaignsById[chainId] : null;

    if (!campaign) {
      root.innerHTML = `
        <section class="hub-meta">
          <h2>Цепочка не найдена</h2>
          <p>Проверь параметр <code>chain</code> в URL.</p>
          <p><a href="index.html">← Вернуться в общий CJM индекс</a></p>
        </section>
      `;
      return;
    }

    const pageTitle = document.querySelector(".hub-header h1");
    const pageLead = document.querySelector(".hub-header .hub-lead");
    if (pageTitle) pageTitle.textContent = campaign.name;
    if (pageLead) pageLead.textContent = "Каноническая страница цепочки: логика, письма, review-ссылки и сохранённые версии.";

    const notes = campaign.taskNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
    const versionsBlock = campaign.versionsPath
      ? `
      <section class="hub-meta">
        <h2>Версии писем</h2>
        <p>Снимки HTML, созданные перед деплоем. Можно открыть сами письма в выбранной версии.</p>
        <p style="margin: 14px 0 0">
          <a class="version-button" href="${escapeHtml(campaign.versionsPath)}">Открыть версии</a>
        </p>
      </section>
      `
      : "";
    root.innerHTML = `
      <section class="hub-meta">
        <p><a href="index.html">← Назад в общий индекс</a></p>
        <h2>Обзор цепочки</h2>
        <p>${escapeHtml(campaign.summary)}</p>
        <ul class="meta-compact">
          <li><strong>Триггер:</strong> ${escapeHtml(campaign.trigger)}</li>
          <li><strong>Exit:</strong> ${escapeHtml(campaign.exit)}</li>
          <li><strong>Re-entry:</strong> ${escapeHtml(campaign.reentry)}</li>
          <li><strong>Brief/ТЗ:</strong> <a href="${escapeHtml(toPublicSourcePath(campaign.briefPath))}" target="_blank" rel="noopener"><code>${escapeHtml(toPublicSourcePath(campaign.briefPath))}</code></a></li>
          <li><strong>Preview files:</strong> <code>${escapeHtml(campaign.previewFolder)}</code></li>
          <li><strong>Development folder:</strong> <a href="${escapeHtml(toPublicSourcePath(campaign.developmentFolder))}" target="_blank" rel="noopener"><code>${escapeHtml(toPublicSourcePath(campaign.developmentFolder))}</code></a></li>
        </ul>
      </section>

      <section class="hub-meta">
        <h2>Последовательность писем</h2>
        <div class="table-wrap">
          <table class="campaign-table campaign-table-wide" role="table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Когда шлется</th>
                <th>Subject</th>
                <th>Preheader</th>
                <th>Открыть</th>
              </tr>
            </thead>
            <tbody>
              ${renderEmailRows(campaign.emails, campaign.name, campaign.id)}
            </tbody>
          </table>
        </div>
      </section>

      ${versionsBlock}

      <section class="hub-meta">
        <h2>Детали задачи по цепочке</h2>
        <ul class="meta-compact">${notes}</ul>
      </section>
    `;
  };

  renderHub();
  renderChainPage();

  const ensureGlobalPreview = () => {
    let shell = document.getElementById("global-preview-shell");
    if (shell) return shell;

    shell = document.createElement("aside");
    shell.id = "global-preview-shell";
    shell.className = "global-preview-shell";
    shell.innerHTML = `
      <div class="global-preview-head">
        <strong id="global-preview-title">Preview</strong>
        <div class="global-preview-actions">
          <a id="global-preview-open" href="#" target="_blank" rel="noopener">Открыть отдельно</a>
          <button type="button" id="global-preview-close" aria-label="Закрыть preview">×</button>
        </div>
      </div>
      <iframe id="global-preview-frame" class="global-preview-frame" src="about:blank" title="Global preview"></iframe>
    `;
    document.body.appendChild(shell);
    return shell;
  };

  const openGlobalPreview = (href, titleText) => {
    const shell = ensureGlobalPreview();
    const frame = shell.querySelector("#global-preview-frame");
    const title = shell.querySelector("#global-preview-title");
    const openLink = shell.querySelector("#global-preview-open");
    if (!frame || !title || !openLink) return;

    frame.src = href;
    title.textContent = titleText || "Preview";
    openLink.setAttribute("href", href);
    document.body.classList.add("preview-open");
  };

  const closeGlobalPreview = () => {
    document.body.classList.remove("preview-open");
  };

  document.addEventListener("click", (event) => {
    const previewLink = event.target.closest(".js-preview-link, .js-preview-link-clean");
    if (previewLink) {
      event.preventDefault();
      const href = previewLink.getAttribute("href");
      if (!href) return;
      openGlobalPreview(href, previewLink.dataset.previewTitle || "Preview");
      if (isReviewMode() && previewLink.classList.contains("js-preview-link")) {
        ensureReviewPreviewStructure();
        ensureReviewPreviewControls();
        const shell = document.getElementById("global-preview-shell");
        const frame = shell?.querySelector("#global-preview-frame");
        if (frame) {
          const emailMeta = findEmailByPreviewPath(href, getChainIdFromUrl());
          setupIframeReview(frame, {
            previewPath: href,
            emailTitle: previewLink.dataset.previewTitle || "Preview",
            campaignId: getChainIdFromUrl(),
            emailId: emailMeta?.emailId || null,
            sourcePath: emailMeta?.sourcePath || null,
          });
        }
      }
      return;
    }

    if (event.target.closest("#global-preview-close")) {
      closeGlobalPreview();
      return;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeGlobalPreview();
      if (isReviewMode()) {
        closeCommentPanel();
        closeCommentPopover();
      }
    }
  });

  /* --- Review mode (?review=1) --- */

  const REVIEW_STORAGE_KEY = "emailReviewComments:v1";
  const REVIEW_AUTHOR_KEY = "emailReviewAuthorName:v1";
  const REVIEW_API_BASE = "/api/review-comments";
  const REVIEW_POLL_MS = 20000;
  const MEANINGFUL_TAGS = new Set(["td", "table", "h1", "h2", "h3", "p", "a", "img"]);
  const FALLBACK_TAGS = new Set(["tr", "center", "body", "html"]);

  const isReviewMode = () => new URLSearchParams(window.location.search).get("review") === "1";

  const getChainIdFromUrl = () => new URLSearchParams(window.location.search).get("chain") || "";

  const findEmailByPreviewPath = (previewPath, campaignId) => {
    if (!previewPath) return null;
    const campaigns = campaignId && campaignsById[campaignId] ? [campaignsById[campaignId]] : data.campaigns;
    for (const campaign of campaigns) {
      const email = campaign.emails.find((item) => item.previewPath === previewPath);
      if (email) {
        return { emailId: email.id, sourcePath: toPublicSourcePath(email.developmentPath) || null };
      }
    }
    return null;
  };

  const enrichReviewComment = (comment) => {
    const meta = findEmailByPreviewPath(comment.previewPath, comment.campaignId);
    return {
      ...comment,
      emailId: comment.emailId || meta?.emailId || null,
      sourcePath: comment.sourcePath || meta?.sourcePath || null,
      authorName: comment.authorName || null,
      updatedAt: comment.updatedAt || comment.createdAt || null,
    };
  };

  let reviewCommentsCache = [];
  let reviewCommentsLoaded = false;
  let reviewCommentsRemoteAvailable = false;
  let reviewSyncStatus = "local";
  let reviewPollTimer = null;

  const loadReviewCommentsFromStorage = () => {
    try {
      const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const persistReviewCommentsCache = () => {
    try {
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewCommentsCache));
    } catch {
      /* ignore quota errors */
    }
  };

  const setReviewCommentsCache = (comments) => {
    reviewCommentsCache = comments.map(enrichReviewComment);
    reviewCommentsLoaded = true;
    persistReviewCommentsCache();
  };

  const upsertCommentInCache = (comment) => {
    const enriched = enrichReviewComment(comment);
    const index = reviewCommentsCache.findIndex((item) => item.id === enriched.id);
    if (index >= 0) reviewCommentsCache[index] = enriched;
    else reviewCommentsCache.push(enriched);
    persistReviewCommentsCache();
    return enriched;
  };

  const getReviewAuthorName = () => {
    const input = document.getElementById("review-author-name");
    const name = input ? input.value : localStorage.getItem(REVIEW_AUTHOR_KEY);
    const trimmed = String(name || "").trim();
    return trimmed;
  };

  const updateReviewIdentityState = () => {
    const isReady = Boolean(getReviewAuthorName());
    document.body.classList.toggle("review-identity-missing", !isReady);
    const hint = document.getElementById("review-identity-status");
    if (hint) hint.hidden = isReady;
    document.querySelectorAll("[data-review-requires-name]").forEach((el) => {
      el.disabled = !isReady;
    });
  };

  const persistReviewAuthorName = () => {
    const name = getReviewAuthorName();
    if (name) localStorage.setItem(REVIEW_AUTHOR_KEY, name);
    else localStorage.removeItem(REVIEW_AUTHOR_KEY);
    updateReviewIdentityState();
    return name;
  };

  const requireReviewAuthorName = () => {
    const name = persistReviewAuthorName();
    if (name) return name;
    const input = document.getElementById("review-author-name");
    if (input) {
      input.focus();
      input.select?.();
    }
    return "";
  };

  const syncReviewAuthorInputs = (name) => {
    document.querySelectorAll("#review-author-name, #review-entry-name").forEach((input) => {
      if (input.value !== name) input.value = name;
    });
    updateReviewIdentityState();
  };

  const closeReviewIdentityGate = () => {
    document.body.classList.remove("review-identity-gated");
    const gate = document.getElementById("review-identity-gate");
    if (gate) gate.hidden = true;
  };

  const saveReviewIdentityName = () => {
    const input = document.getElementById("review-entry-name");
    const name = String(input?.value || "").trim();
    if (!name) {
      input?.focus();
      return "";
    }
    localStorage.setItem(REVIEW_AUTHOR_KEY, name);
    syncReviewAuthorInputs(name);
    closeReviewIdentityGate();
    return name;
  };

  const ensureReviewIdentityGate = () => {
    const existingName = String(localStorage.getItem(REVIEW_AUTHOR_KEY) || "").trim();
    syncReviewAuthorInputs(existingName);
    if (existingName) return;

    let gate = document.getElementById("review-identity-gate");
    if (!gate) {
      gate = document.createElement("div");
      gate.id = "review-identity-gate";
      gate.className = "review-identity-gate";
      gate.innerHTML = `
        <form class="review-identity-card" id="review-identity-form">
          <img
            class="review-identity-logo"
            src="https://sabiotrade.com/storage/media/5304/Sabiotrade-LogoCombination.png"
            alt="SabioTrade"
            width="160"
            height="32"
          />
          <h2>Enter your name</h2>
          <p>This name will be shown as the author of your review comments and status changes.</p>
          <label for="review-entry-name">Name</label>
          <input type="text" id="review-entry-name" autocomplete="name" placeholder="Maria Zvereva" required />
          <button type="submit" class="review-btn-primary">Continue</button>
        </form>
      `;
      document.body.appendChild(gate);
      gate.querySelector("#review-identity-form")?.addEventListener("submit", (event) => {
        event.preventDefault();
        saveReviewIdentityName();
      });
    }

    document.body.classList.add("review-identity-gated");
    gate.hidden = false;
    window.setTimeout(() => gate.querySelector("#review-entry-name")?.focus(), 0);
  };

  const getReviewApiHeaders = (withJson) => {
    const headers = {};
    if (withJson) headers["Content-Type"] = "application/json";
    return headers;
  };

  const parseReviewApiResponse = async (response) => {
    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }
    if (response.status === 401) {
      reviewCommentsRemoteAvailable = false;
      stopReviewPolling();
      setReviewSyncStatus("unauthorized");
      const error = new Error(data.error || "Unauthorized");
      error.isUnauthorized = true;
      throw error;
    }
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "API request failed");
    }
    return data;
  };

  const updateReviewSyncIndicator = () => {
    const el = document.getElementById("review-sync-status");
    if (!el) return;
    const labels = {
      shared: "Shared comments",
      local: "Local comments",
      failed: "Sync failed",
      unauthorized: "Shared access blocked",
    };
    el.textContent = labels[reviewSyncStatus] || "Local comments";
  };

  const setReviewSyncStatus = (status) => {
    reviewSyncStatus = status;
    updateReviewSyncIndicator();
  };

  const mergeCampaignComments = (campaignId, serverComments) => {
    const others = reviewCommentsCache.filter((item) => item.campaignId !== campaignId);
    const localCampaign = reviewCommentsCache.filter((item) => item.campaignId === campaignId);
    const serverMap = new Map();
    (serverComments || []).forEach((item) => {
      const enriched = enrichReviewComment(item);
      serverMap.set(enriched.id, enriched);
    });
    const mergedCampaign = [...serverMap.values()];
    const mergedIds = new Set(serverMap.keys());
    localCampaign.forEach((item) => {
      const enriched = enrichReviewComment(item);
      if (!mergedIds.has(enriched.id)) {
        mergedCampaign.push(enriched);
        mergedIds.add(enriched.id);
      }
    });
    return [...others, ...mergedCampaign];
  };

  const uploadLocalOnlyComments = async (localOnly) => {
    if (!localOnly.length) return true;
    let allOk = true;
    for (const comment of localOnly) {
      try {
        const remote = await createReviewCommentRemote(enrichReviewComment(comment));
        upsertCommentInCache(remote);
      } catch (error) {
        allOk = false;
        if (error.isUnauthorized) return false;
      }
    }
    return allOk;
  };

  const stopReviewPolling = () => {
    if (reviewPollTimer) {
      window.clearInterval(reviewPollTimer);
      reviewPollTimer = null;
    }
  };

  const startReviewPolling = () => {
    stopReviewPolling();
    if (!reviewCommentsRemoteAvailable) return;
    reviewPollTimer = window.setInterval(() => {
      if (!reviewCommentsRemoteAvailable || document.hidden) return;
      fetchReviewComments({ silent: true });
    }, REVIEW_POLL_MS);
  };

  const fetchReviewComments = async (options = {}) => {
    const { silent = false } = options;
    const campaignId = getChainIdFromUrl();
    if (!campaignId) return false;
    try {
      const response = await fetch(
        `${REVIEW_API_BASE}?campaignId=${encodeURIComponent(campaignId)}`,
        { headers: getReviewApiHeaders(false) }
      );
      const data = await parseReviewApiResponse(response);
      const serverComments = data.comments || [];
      const localCampaign = reviewCommentsCache.filter((item) => item.campaignId === campaignId);
      const serverIds = new Set(serverComments.map((item) => item.id));
      const localOnly = localCampaign.filter((item) => !serverIds.has(item.id));

      setReviewCommentsCache(mergeCampaignComments(campaignId, serverComments));
      reviewCommentsRemoteAvailable = true;
      if (!silent) setReviewSyncStatus("shared");
      else if (reviewSyncStatus === "local" || reviewSyncStatus === "unauthorized") setReviewSyncStatus("shared");

      const uploadOk = await uploadLocalOnlyComments(localOnly);
      if (!uploadOk) setReviewSyncStatus("failed");

      scheduleReviewRerender();
      startReviewPolling();
      return true;
    } catch (error) {
      reviewCommentsRemoteAvailable = false;
      stopReviewPolling();
      if (error.isUnauthorized) setReviewSyncStatus("unauthorized");
      else if (!silent) setReviewSyncStatus("local");
      return false;
    }
  };

  const syncReviewCommentsNow = () => fetchReviewComments();

  const createReviewCommentRemote = async (comment) => {
    const response = await fetch(REVIEW_API_BASE, {
      method: "POST",
      headers: getReviewApiHeaders(true),
      body: JSON.stringify(comment),
    });
    const data = await parseReviewApiResponse(response);
    return data.comment;
  };

  const updateReviewCommentRemote = async (id, patch) => {
    const response = await fetch(REVIEW_API_BASE, {
      method: "PATCH",
      headers: getReviewApiHeaders(true),
      body: JSON.stringify({ id, ...patch }),
    });
    const data = await parseReviewApiResponse(response);
    return data.comment;
  };

  const clearReviewCommentsRemote = async () => {
    const campaignId = getChainIdFromUrl();
    if (!campaignId) return;
    const response = await fetch(`${REVIEW_API_BASE}?campaignId=${encodeURIComponent(campaignId)}`, {
      method: "DELETE",
      headers: getReviewApiHeaders(false),
    });
    await parseReviewApiResponse(response);
  };

  const initReviewComments = async () => {
    setReviewCommentsCache(loadReviewCommentsFromStorage());
    scheduleReviewRerender();
    await fetchReviewComments();
    if (!document._reviewVisibilityBound) {
      document._reviewVisibilityBound = true;
      document.addEventListener("visibilitychange", () => {
        if (!isReviewMode() || document.hidden || !reviewCommentsRemoteAvailable) return;
        fetchReviewComments({ silent: true });
      });
    }
  };

  const updateReviewCommentStatus = async (commentId, status) => {
    if (!requireReviewAuthorName()) return;
    const item = reviewCommentsCache.find((c) => c.id === commentId);
    if (!item) return;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    upsertCommentInCache(item);
    scheduleReviewRerender();
    openCommentPopover(item);
    if (!reviewCommentsRemoteAvailable) return;
    try {
      const remote = await updateReviewCommentRemote(commentId, { status });
      upsertCommentInCache(remote);
      setReviewSyncStatus("shared");
      scheduleReviewRerender();
      openCommentPopover(remote);
    } catch (error) {
      if (!error.isUnauthorized) setReviewSyncStatus("failed");
    }
  };

  const truncateText = (text, max) => {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (normalized.length <= max) return normalized;
    return normalized.slice(0, max) + "…";
  };

  const buildElementSelector = (element) => {
    const reviewId = element.getAttribute("data-review-id");
    if (reviewId) {
      return `[data-review-id="${String(reviewId).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"]`;
    }
    const parts = [];
    let node = element;
    while (node && node.nodeType === 1) {
      const tag = node.tagName.toLowerCase();
      if (tag === "html") break;
      const parent = node.parentElement;
      if (!parent) break;
      const sameTagSiblings = Array.from(parent.children).filter((child) => child.tagName === node.tagName);
      const index = sameTagSiblings.indexOf(node) + 1;
      parts.unshift(`${tag}:nth-of-type(${index})`);
      if (tag === "body") break;
      node = parent;
    }
    return parts.join(" > ");
  };

  const resolveMeaningfulElement = (element) => {
    if (!element || element.nodeType !== 1) return null;
    let current = element;
    let fallback = null;
    while (current && current.nodeType === 1) {
      const tag = current.tagName.toLowerCase();
      if (MEANINGFUL_TAGS.has(tag)) return current;
      if (FALLBACK_TAGS.has(tag)) fallback = current;
      if (tag === "html") break;
      current = current.parentElement;
    }
    return fallback;
  };

  const findElementBySelector = (doc, selector, reviewId) => {
    if (reviewId) {
      const byId = doc.querySelector(`[data-review-id="${CSS.escape(reviewId)}"]`);
      if (byId) return byId;
    }
    if (!selector) return null;
    try {
      return doc.querySelector(selector);
    } catch {
      return null;
    }
  };

  let reviewPreviewContext = null;
  let reviewHoverElement = null;
  let reviewSelectedElement = null;
  let reviewIframeDoc = null;
  let reviewCommentsVisible = true;
  let reviewCommentsListOpen = false;
  let reviewListFilter = "open";
  let activeCommentId = null;
  let pendingFocusCommentId = null;
  let reviewRerenderScheduled = false;

  const syncReviewBodyClasses = () => {
    document.body.classList.toggle("review-comments-visible", reviewCommentsVisible);
    document.body.classList.toggle("review-comments-list-open", reviewCommentsListOpen);
  };

  const scheduleReviewRerender = () => {
    if (reviewRerenderScheduled) return;
    reviewRerenderScheduled = true;
    requestAnimationFrame(() => {
      reviewRerenderScheduled = false;
      renderReviewPins();
      renderCommentsViewer();
      positionCommentPopover();
    });
  };

  const getCampaignComments = () => {
    const campaignId = getChainIdFromUrl();
    return reviewCommentsCache
      .filter((item) => item.campaignId === campaignId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const buildCommentNumberMap = (comments) => {
    const map = new Map();
    comments.forEach((item, index) => map.set(item.id, index + 1));
    return map;
  };

  const ensureReviewPreviewStructure = () => {
    const shell = ensureGlobalPreview();
    if (shell.querySelector(".global-preview-body")) return shell;

    const frame = shell.querySelector("#global-preview-frame");
    if (!frame) return shell;

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "global-preview-body";
    const mainWrap = document.createElement("div");
    mainWrap.className = "global-preview-main";

    frame.replaceWith(mainWrap);
    mainWrap.appendChild(frame);
    bodyWrap.appendChild(mainWrap);

    const viewer = document.createElement("aside");
    viewer.id = "review-comments-viewer";
    viewer.className = "review-comments-viewer";
    viewer.hidden = true;
    viewer.innerHTML = `
      <div class="review-comments-viewer-head">
        <strong>Comments</strong>
        <div class="review-comments-filter" role="tablist">
          <button type="button" data-filter="open" class="is-active">Open</button>
          <button type="button" data-filter="applied">Applied</button>
          <button type="button" data-filter="resolved">Resolved</button>
          <button type="button" data-filter="all">All</button>
        </div>
      </div>
      <div id="review-comments-list" class="review-comments-list"></div>
    `;
    bodyWrap.appendChild(viewer);
    shell.appendChild(bodyWrap);
    ensureReviewPreviewControls();

    viewer.querySelector(".review-comments-filter")?.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-filter]");
      if (!btn) return;
      reviewListFilter = btn.dataset.filter || "open";
      viewer.querySelectorAll(".review-comments-filter button").forEach((el) => {
        el.classList.toggle("is-active", el === btn);
      });
      renderCommentsViewer();
    });

    return shell;
  };

  const toggleReviewCommentsVisible = () => {
    reviewCommentsVisible = !reviewCommentsVisible;
    syncReviewBodyClasses();
    updateReviewToolbarButtons();
    scheduleReviewRerender();
  };

  const toggleReviewCommentsList = () => {
    reviewCommentsListOpen = !reviewCommentsListOpen;
    ensureReviewPreviewStructure();
    syncReviewBodyClasses();
    updateReviewToolbarButtons();
    const viewer = document.getElementById("review-comments-viewer");
    if (viewer) viewer.hidden = !reviewCommentsListOpen;
    scheduleReviewRerender();
  };

  const bindReviewToggleButtons = (root) => {
    if (!root || root.dataset.reviewTogglesBound === "1") return;
    root.querySelectorAll(".js-review-toggle-pins").forEach((btn) => {
      btn.addEventListener("click", toggleReviewCommentsVisible);
    });
    root.querySelectorAll(".js-review-toggle-list").forEach((btn) => {
      btn.addEventListener("click", toggleReviewCommentsList);
    });
    root.dataset.reviewTogglesBound = "1";
  };

  const ensureReviewPreviewControls = () => {
    if (!isReviewMode()) return;
    const shell = ensureGlobalPreview();
    const actions = shell.querySelector(".global-preview-actions");
    if (!actions) return;

    let wrap = actions.querySelector(".review-preview-actions");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "review-preview-actions";
      wrap.innerHTML = `
        <button type="button" class="js-review-toggle-pins review-preview-toolbar-btn">Hide comments</button>
        <button type="button" class="js-review-toggle-list review-preview-toolbar-btn">Comments list</button>
      `;
      const closeBtn = actions.querySelector("#global-preview-close");
      if (closeBtn) {
        actions.insertBefore(wrap, closeBtn);
      } else {
        actions.appendChild(wrap);
      }
    }
    bindReviewToggleButtons(wrap);
    updateReviewToolbarButtons();
  };

  const ensureReviewBar = () => {
    let bar = document.getElementById("review-mode-bar");
    if (bar) {
      bindReviewToggleButtons(bar);
      ensureReviewPreviewControls();
      updateReviewSyncIndicator();
      return bar;
    }

    bar = document.createElement("div");
    bar.id = "review-mode-bar";
    bar.className = "review-mode-bar";
    bar.innerHTML = `
      <div class="review-mode-bar-main">
        <span class="review-mode-label">Review mode</span>
        <span id="review-sync-status" class="review-sync-status">Local comments</span>
        <span id="review-identity-status" class="review-identity-status" hidden>Enter name to review</span>
        <label class="review-author-field">Name:
          <input type="text" id="review-author-name" placeholder="Required" autocomplete="name" />
        </label>
      </div>
      <div class="review-mode-actions">
        <button type="button" id="review-toggle-pins-btn" class="js-review-toggle-pins">Hide comments</button>
        <button type="button" id="review-toggle-list-btn" class="js-review-toggle-list">Comments list</button>
        <button type="button" id="review-sync-now-btn">Sync now</button>
        <button type="button" id="review-export-btn">Export comments</button>
        <button type="button" id="review-clear-btn" class="review-btn-muted">Clear comments</button>
      </div>
    `;

    const header = document.querySelector(".hub-header");
    if (header) {
      header.insertAdjacentElement("afterend", bar);
    } else {
      document.body.insertBefore(bar, document.body.firstChild);
    }

    bindReviewToggleButtons(bar);
    bar.querySelector("#review-export-btn")?.addEventListener("click", exportReviewComments);
    bar.querySelector("#review-clear-btn")?.addEventListener("click", clearReviewComments);
    const authorInput = bar.querySelector("#review-author-name");
    if (authorInput) {
      authorInput.value = localStorage.getItem(REVIEW_AUTHOR_KEY) || "";
      const saveAuthor = () => {
        const hadName = Boolean(localStorage.getItem(REVIEW_AUTHOR_KEY));
        const name = persistReviewAuthorName();
        if (!hadName && name) syncReviewCommentsNow();
      };
      authorInput.addEventListener("input", saveAuthor);
      authorInput.addEventListener("change", saveAuthor);
      authorInput.addEventListener("blur", saveAuthor);
      authorInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") saveAuthor();
      });
    }
    bar.querySelector("#review-sync-now-btn")?.addEventListener("click", () => {
      syncReviewCommentsNow();
    });
    updateReviewSyncIndicator();
    updateReviewIdentityState();

    syncReviewBodyClasses();
    updateReviewToolbarButtons();
    ensureReviewPreviewControls();
    return bar;
  };

  const updateReviewToolbarButtons = () => {
    const pinsLabel = reviewCommentsVisible ? "Hide comments" : "Show comments";
    const listLabel = reviewCommentsListOpen ? "Hide list" : "Comments list";
    document.querySelectorAll(".js-review-toggle-pins").forEach((btn) => {
      btn.textContent = pinsLabel;
    });
    document.querySelectorAll(".js-review-toggle-list").forEach((btn) => {
      btn.textContent = listLabel;
    });
  };

  const exportReviewComments = () => {
    const comments = reviewCommentsCache.map(enrichReviewComment);
    const blob = new Blob([JSON.stringify(comments, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "email-review-comments.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearReviewMarkersInDoc = (doc) => {
    if (!doc) return;
    doc.querySelectorAll(".email-review-marked").forEach((el) => el.classList.remove("email-review-marked"));
    doc.querySelectorAll(".email-review-hover").forEach((el) => el.classList.remove("email-review-hover"));
    doc.querySelectorAll(".email-review-focus").forEach((el) => el.classList.remove("email-review-focus"));
  };

  const clearReviewComments = async () => {
    if (!confirm("Clear all saved review comments for this campaign?")) return;
    const campaignId = getChainIdFromUrl();
    reviewCommentsCache = reviewCommentsCache.filter((item) => item.campaignId !== campaignId);
    persistReviewCommentsCache();
    if (reviewIframeDoc) clearReviewMarkersInDoc(reviewIframeDoc);
    closeCommentPanel();
    closeCommentPopover();
    activeCommentId = null;
    pendingFocusCommentId = null;
    scheduleReviewRerender();
    if (!reviewCommentsRemoteAvailable) return;
    try {
      await clearReviewCommentsRemote();
      setReviewSyncStatus("shared");
    } catch (error) {
      if (!error.isUnauthorized) setReviewSyncStatus("failed");
    }
  };

  const ensureCommentPopover = () => {
    let popover = document.getElementById("review-comment-popover");
    if (popover) return popover;

    ensureReviewPreviewStructure();
    const shell = document.getElementById("global-preview-shell");
    popover = document.createElement("div");
    popover.id = "review-comment-popover";
    popover.className = "review-comment-popover";
    popover.hidden = true;
    popover.innerHTML = `
      <div class="review-comment-popover-head">
        <strong id="review-popover-title">Comment</strong>
        <button type="button" id="review-popover-close" aria-label="Close">×</button>
      </div>
      <div class="review-comment-popover-meta">
        <p><span class="review-meta-label">#</span> <span id="review-popover-number">—</span></p>
        <p><span class="review-meta-label">Author</span> <span id="review-popover-author">—</span></p>
        <p><span class="review-meta-label">Email ID</span> <code id="review-popover-email-id">—</code></p>
        <p><span class="review-meta-label">Status</span> <span id="review-popover-status">—</span></p>
        <p class="review-meta-quote" id="review-popover-quote">—</p>
        <p id="review-popover-comment">—</p>
        <p><span class="review-meta-label">Source</span> <code id="review-popover-source">—</code></p>
      </div>
      <div class="review-comment-popover-actions">
        <button type="button" id="review-popover-applied" class="review-btn-primary" data-review-requires-name>Mark applied</button>
        <button type="button" id="review-popover-resolve" class="review-btn-primary" data-review-requires-name>Resolve</button>
        <button type="button" id="review-popover-reopen" class="review-btn-muted" data-review-requires-name>Reopen</button>
        <button type="button" id="review-popover-close-btn" class="review-btn-muted">Close</button>
      </div>
    `;
    (shell || document.body).appendChild(popover);

    popover.querySelector("#review-popover-close")?.addEventListener("click", closeCommentPopover);
    popover.querySelector("#review-popover-close-btn")?.addEventListener("click", closeCommentPopover);
    popover.querySelector("#review-popover-applied")?.addEventListener("click", () => {
      if (activeCommentId) updateReviewCommentStatus(activeCommentId, "applied");
    });
    popover.querySelector("#review-popover-resolve")?.addEventListener("click", () => {
      if (activeCommentId) updateReviewCommentStatus(activeCommentId, "resolved");
    });
    popover.querySelector("#review-popover-reopen")?.addEventListener("click", () => {
      if (activeCommentId) updateReviewCommentStatus(activeCommentId, "open");
    });
    updateReviewIdentityState();
    return popover;
  };

  const closeCommentPopover = () => {
    const popover = document.getElementById("review-comment-popover");
    if (popover) popover.hidden = true;
    activeCommentId = null;
    if (reviewIframeDoc) {
      reviewIframeDoc.querySelectorAll(".email-review-pin-active").forEach((el) => {
        el.classList.remove("email-review-pin-active");
      });
    }
    renderCommentsViewer();
  };

  const positionCommentPopover = () => {
    const popover = document.getElementById("review-comment-popover");
    if (!popover || popover.hidden) return;
    popover.style.left = "";
    popover.style.top = "";
  };

  const openCommentPopover = (comment) => {
    const popover = ensureCommentPopover();
    const numbers = buildCommentNumberMap(getCampaignComments());
    const enriched = enrichReviewComment(comment);
    activeCommentId = enriched.id;

    popover.querySelector("#review-popover-title").textContent = "Comment " + (numbers.get(enriched.id) || "—");
    popover.querySelector("#review-popover-number").textContent = String(numbers.get(enriched.id) || "—");
    popover.querySelector("#review-popover-author").textContent = enriched.authorName || "Anonymous";
    popover.querySelector("#review-popover-email-id").textContent = enriched.emailId || "—";
    popover.querySelector("#review-popover-status").textContent = enriched.status || "open";
    popover.querySelector("#review-popover-quote").textContent = enriched.textQuote || "—";
    popover.querySelector("#review-popover-comment").textContent = enriched.comment || "—";
    popover.querySelector("#review-popover-source").textContent = enriched.sourcePath || enriched.previewPath || "—";
    const appliedBtn = popover.querySelector("#review-popover-applied");
    const resolveBtn = popover.querySelector("#review-popover-resolve");
    const reopenBtn = popover.querySelector("#review-popover-reopen");
    if (appliedBtn) appliedBtn.hidden = enriched.status === "applied";
    if (resolveBtn) resolveBtn.hidden = enriched.status === "resolved";
    if (reopenBtn) reopenBtn.hidden = enriched.status === "open";
    updateReviewIdentityState();
    popover.hidden = false;
    renderCommentsViewer();
    scheduleReviewRerender();
  };

  const highlightReviewTarget = (target) => {
    if (!target) return;
    target.classList.add("email-review-marked", "email-review-focus");
    window.setTimeout(() => target.classList.remove("email-review-focus"), 2200);
  };

  const applyFocusToComment = (comment) => {
    const enriched = enrichReviewComment(comment);
    activeCommentId = enriched.id;
    const doc = reviewIframeDoc;
    if (!doc) {
      openCommentPopover(enriched);
      return;
    }

    const target = findElementBySelector(doc, enriched.selector, enriched.reviewId);
    if (target) {
      try {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch {
        target.scrollIntoView();
      }
      highlightReviewTarget(target);
    }
    openCommentPopover(enriched);
    scheduleReviewRerender();
  };

  const focusReviewComment = (commentId) => {
    const comment = getCampaignComments().find((item) => item.id === commentId);
    if (!comment) return;

    ensureReviewPreviewStructure();
    const shell = document.getElementById("global-preview-shell");
    const frame = shell?.querySelector("#global-preview-frame");
    if (!frame) return;

    if (reviewPreviewContext?.previewPath !== comment.previewPath) {
      pendingFocusCommentId = commentId;
      const meta = findEmailByPreviewPath(comment.previewPath, comment.campaignId);
      openGlobalPreview(comment.previewPath, comment.emailTitle || comment.emailId || "Preview");
      setupIframeReview(frame, {
        previewPath: comment.previewPath,
        emailTitle: comment.emailTitle || "Preview",
        campaignId: comment.campaignId || getChainIdFromUrl(),
        emailId: comment.emailId || meta?.emailId || null,
        sourcePath: comment.sourcePath || meta?.sourcePath || null,
      });
      return;
    }

    pendingFocusCommentId = null;
    applyFocusToComment(comment);
  };

  const removeReviewPinsLayer = (doc) => {
    if (!doc) return;
    doc.getElementById("email-review-pins-layer")?.remove();
  };

  const detachReviewPinListeners = (doc) => {
    if (!doc?._reviewPinListeners) return;
    const { onScroll, onResize, onLoad, win } = doc._reviewPinListeners;
    win?.removeEventListener("scroll", onScroll);
    win?.removeEventListener("resize", onResize);
    doc.removeEventListener("load", onLoad, true);
    delete doc._reviewPinListeners;
  };

  const attachReviewPinListeners = (doc) => {
    if (!doc || doc._reviewPinListeners) return;
    const win = doc.defaultView;
    if (!win) return;
    const onScroll = () => scheduleReviewRerender();
    const onResize = () => scheduleReviewRerender();
    const onLoad = () => scheduleReviewRerender();
    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onResize);
    doc.addEventListener("load", onLoad, true);
    doc._reviewPinListeners = { onScroll, onResize, onLoad, win };
  };

  const renderReviewPins = () => {
    const doc = reviewIframeDoc;
    const context = reviewPreviewContext;
    if (!doc || !context) return;

    removeReviewPinsLayer(doc);

    if (!reviewCommentsVisible) return;

    const win = doc.defaultView;
    if (!win) return;

    const allCampaign = getCampaignComments();
    const numbers = buildCommentNumberMap(allCampaign);
    const comments = allCampaign.filter((item) => item.previewPath === context.previewPath);
    if (!comments.length) return;

    const layer = doc.createElement("div");
    layer.id = "email-review-pins-layer";
    const docWidth = Math.max(doc.documentElement.scrollWidth, doc.body.scrollWidth);
    const docHeight = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
    layer.style.cssText =
      "position:absolute;top:0;left:0;width:" +
      docWidth +
      "px;height:" +
      docHeight +
      "px;pointer-events:none;z-index:99999;";
    doc.body.appendChild(layer);

    const offsetCounts = new Map();

    comments.forEach((comment) => {
      const target = findElementBySelector(doc, comment.selector, comment.reviewId);
      if (!target) return;

      const key = (comment.selector || "") + "|" + (comment.reviewId || "");
      const offsetIndex = offsetCounts.get(key) || 0;
      offsetCounts.set(key, offsetIndex + 1);

      const rect = target.getBoundingClientRect();
      const x = rect.left + win.scrollX - 4 + offsetIndex * 14;
      const y = rect.top + win.scrollY - 4 + offsetIndex * 14;

      const pin = doc.createElement("button");
      pin.type = "button";
      pin.className = "email-review-pin";
      pin.dataset.commentId = comment.id;
      if (comment.status === "applied") pin.classList.add("email-review-pin-applied");
      if (comment.status === "resolved") pin.classList.add("email-review-pin-resolved");
      if (comment.id === activeCommentId) pin.classList.add("email-review-pin-active");
      pin.textContent = String(numbers.get(comment.id) || "?");
      pin.style.left = x + "px";
      pin.style.top = y + "px";
      pin.setAttribute("aria-label", "Comment " + (numbers.get(comment.id) || ""));
      pin.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        applyFocusToComment(comment);
      });
      layer.appendChild(pin);
    });
  };

  const renderCommentsViewer = () => {
    const viewer = document.getElementById("review-comments-viewer");
    const list = document.getElementById("review-comments-list");
    if (!viewer || !list) return;

    if (!reviewCommentsListOpen) {
      list.innerHTML = "";
      return;
    }

    let comments = getCampaignComments();
    if (reviewListFilter === "open") {
      comments = comments.filter((item) => item.status === "open");
    } else if (reviewListFilter === "applied") {
      comments = comments.filter((item) => item.status === "applied");
    } else if (reviewListFilter === "resolved") {
      comments = comments.filter((item) => item.status === "resolved");
    }

    const numbers = buildCommentNumberMap(getCampaignComments());

    if (!comments.length) {
      list.innerHTML = '<p class="review-comments-empty">No comments for this filter.</p>';
      return;
    }

    list.innerHTML = comments
      .map((comment) => {
        const enriched = enrichReviewComment(comment);
        const num = numbers.get(enriched.id) || "—";
        const pathLabel = enriched.sourcePath || enriched.previewPath || "—";
        const onCurrentPreview = enriched.previewPath === reviewPreviewContext?.previewPath;
        const targetMissing =
          onCurrentPreview &&
          reviewIframeDoc &&
          !findElementBySelector(reviewIframeDoc, enriched.selector, enriched.reviewId);
        const notFoundClass = targetMissing ? " is-not-found" : "";
        const isActive = enriched.id === activeCommentId ? " is-active" : "";
        const statusClass =
          enriched.status === "resolved"
            ? " is-resolved"
            : enriched.status === "applied"
              ? " is-applied"
              : "";

        return `
          <button type="button" class="review-comment-item${isActive}${statusClass}${notFoundClass}" data-comment-id="${escapeHtml(enriched.id)}">
            <span class="review-comment-item-num">#${escapeHtml(String(num))}</span>
            <span class="review-comment-item-email">${escapeHtml(enriched.emailId || "—")}</span>
            <span class="review-comment-item-author">${escapeHtml(enriched.authorName || "Anonymous")}</span>
            <span class="review-comment-item-status">${escapeHtml(enriched.status || "open")}</span>
            <span class="review-comment-item-quote">${escapeHtml(truncateText(enriched.textQuote, 80))}</span>
            <span class="review-comment-item-text">${escapeHtml(truncateText(enriched.comment, 120))}</span>
            <span class="review-comment-item-path">${escapeHtml(pathLabel)}</span>
            ${targetMissing ? '<span class="review-comment-item-missing">Target not found</span>' : ""}
          </button>
        `;
      })
      .join("");

    list.querySelectorAll(".review-comment-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-comment-id");
        if (id) focusReviewComment(id);
      });
    });
  };

  const ensureCommentPanel = () => {
    let panel = document.getElementById("review-comment-panel");
    if (panel) return panel;

    panel = document.createElement("aside");
    panel.id = "review-comment-panel";
    panel.className = "review-comment-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="review-comment-panel-head">
        <strong>Add comment</strong>
        <button type="button" id="review-panel-close" aria-label="Close comment panel">×</button>
      </div>
      <div class="review-comment-meta">
        <p><span class="review-meta-label">Email</span> <span id="review-meta-title">—</span></p>
        <p><span class="review-meta-label">Email ID</span> <code id="review-meta-email-id">—</code></p>
        <p><span class="review-meta-label">Source</span> <code id="review-meta-source-path">—</code></p>
        <p><span class="review-meta-label">Path</span> <code id="review-meta-path">—</code></p>
        <p><span class="review-meta-label">Element</span> <code id="review-meta-tag">—</code></p>
        <p class="review-meta-quote" id="review-meta-quote">—</p>
      </div>
      <label class="review-field" for="review-comment-text">Comment</label>
      <textarea id="review-comment-text" rows="4" placeholder="Describe what should be fixed…"></textarea>
      <label class="review-field" for="review-comment-status">Status</label>
      <select id="review-comment-status">
        <option value="open">open</option>
        <option value="applied">applied</option>
        <option value="resolved">resolved</option>
      </select>
      <div class="review-comment-actions">
        <button type="button" id="review-save-btn" class="review-btn-primary" data-review-requires-name>Save comment</button>
        <button type="button" id="review-cancel-btn" class="review-btn-muted">Cancel</button>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector("#review-panel-close")?.addEventListener("click", closeCommentPanel);
    panel.querySelector("#review-cancel-btn")?.addEventListener("click", closeCommentPanel);
    panel.querySelector("#review-save-btn")?.addEventListener("click", saveReviewComment);
    updateReviewIdentityState();
    return panel;
  };

  const closeCommentPanel = () => {
    const panel = document.getElementById("review-comment-panel");
    if (panel) panel.hidden = true;
    reviewSelectedElement = null;
  };

  const openCommentPanel = (context) => {
    const panel = ensureCommentPanel();
    panel.querySelector("#review-meta-title").textContent = context.emailTitle || "—";
    panel.querySelector("#review-meta-email-id").textContent = context.emailId || "—";
    panel.querySelector("#review-meta-source-path").textContent = context.sourcePath || "—";
    panel.querySelector("#review-meta-path").textContent = context.previewPath || "—";
    panel.querySelector("#review-meta-tag").textContent = context.tagName || "—";
    panel.querySelector("#review-meta-quote").textContent = context.textQuote || "—";
    panel.querySelector("#review-comment-text").value = "";
    panel.querySelector("#review-comment-status").value = "open";
    updateReviewIdentityState();
    panel.hidden = false;
    panel.querySelector("#review-comment-text")?.focus();
  };

  const saveReviewComment = async () => {
    if (!reviewSelectedElement || !reviewPreviewContext || !reviewIframeDoc) {
      closeCommentPanel();
      return;
    }

    const commentText = document.getElementById("review-comment-text")?.value.trim();
    if (!commentText) return;
    const authorName = requireReviewAuthorName();
    if (!authorName) return;

    const element = reviewSelectedElement;
    const now = new Date().toISOString();
    const entry = {
      id: "rev_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      createdAt: now,
      updatedAt: now,
      campaignId: reviewPreviewContext.campaignId,
      emailTitle: reviewPreviewContext.emailTitle,
      emailId: reviewPreviewContext.emailId || null,
      sourcePath: reviewPreviewContext.sourcePath || null,
      previewPath: reviewPreviewContext.previewPath,
      selector: buildElementSelector(element),
      reviewId: element.getAttribute("data-review-id") || null,
      tagName: element.tagName.toLowerCase(),
      textQuote: truncateText(element.innerText || element.textContent || "", 160),
      comment: commentText,
      status: document.getElementById("review-comment-status")?.value || "open",
      authorName,
    };

    upsertCommentInCache(entry);
    element.classList.add("email-review-marked");
    closeCommentPanel();
    scheduleReviewRerender();

    try {
      const remote = await createReviewCommentRemote(entry);
      upsertCommentInCache(remote);
      reviewCommentsRemoteAvailable = true;
      setReviewSyncStatus("shared");
      startReviewPolling();
      scheduleReviewRerender();
    } catch (error) {
      if (error.isUnauthorized) return;
      if (reviewCommentsRemoteAvailable) setReviewSyncStatus("failed");
      else setReviewSyncStatus("local");
    }
  };

  const injectReviewStyles = (doc) => {
    if (!doc || doc.getElementById("email-review-style")) return;
    const style = doc.createElement("style");
    style.id = "email-review-style";
    style.textContent = `
      .email-review-hover {
        outline: 2px dashed #3d5afe !important;
        outline-offset: 2px;
        background-color: rgba(61, 90, 254, 0.08) !important;
      }
      .email-review-marked {
        outline: 2px solid #e67e22 !important;
        outline-offset: 2px;
      }
      .email-review-focus {
        outline: 3px solid #2844e0 !important;
        outline-offset: 2px;
        background-color: rgba(61, 90, 254, 0.12) !important;
      }
      #email-review-pins-layer {
        pointer-events: none;
      }
      .email-review-pin {
        position: absolute;
        width: 22px;
        height: 22px;
        margin: 0;
        padding: 0;
        border: 2px solid #fff;
        border-radius: 50%;
        background: #3d5afe;
        color: #fff;
        font: 600 11px/18px Inter, Helvetica, sans-serif;
        text-align: center;
        cursor: pointer;
        pointer-events: auto;
        box-shadow: 0 2px 6px rgba(16, 18, 43, 0.25);
      }
      .email-review-pin-applied {
        background: #e67e22;
      }
      .email-review-pin-resolved {
        background: #8b92a8;
      }
      .email-review-pin-active {
        background: #1a2fbf;
        transform: scale(1.08);
      }
    `;
    (doc.head || doc.documentElement).appendChild(style);
  };

  const setReviewHover = (element) => {
    if (reviewHoverElement === element) return;
    if (reviewHoverElement) reviewHoverElement.classList.remove("email-review-hover");
    reviewHoverElement = element;
    if (reviewHoverElement) reviewHoverElement.classList.add("email-review-hover");
  };

  const restoreReviewMarkers = (doc, context) => {
    const comments = reviewCommentsCache.filter(
      (item) => item.previewPath === context.previewPath && item.campaignId === context.campaignId
    );
    comments.forEach((item) => {
      const el = findElementBySelector(doc, item.selector, item.reviewId);
      if (el) el.classList.add("email-review-marked");
    });
  };

  const teardownIframeReview = (doc) => {
    if (!doc) return;
    if (doc._reviewHandlers) {
      const { onMouseOver, onMouseOut, onClick } = doc._reviewHandlers;
      doc.removeEventListener("mouseover", onMouseOver, true);
      doc.removeEventListener("mouseout", onMouseOut, true);
      doc.removeEventListener("click", onClick, true);
      delete doc._reviewHandlers;
    }
    detachReviewPinListeners(doc);
    removeReviewPinsLayer(doc);
    clearReviewMarkersInDoc(doc);
    setReviewHover(null);
    reviewIframeDoc = null;
  };

  const setupIframeReview = (frame, context) => {
    if (!frame) return;

    const onLoad = () => {
      let doc;
      try {
        doc = frame.contentDocument || frame.contentWindow?.document;
      } catch {
        return;
      }
      if (!doc || !doc.body) return;

      teardownIframeReview(reviewIframeDoc);
      reviewIframeDoc = doc;
      reviewPreviewContext = context;

      injectReviewStyles(doc);

      const onMouseOver = (event) => {
        const target = resolveMeaningfulElement(event.target);
        if (target) setReviewHover(target);
      };

      const onMouseOut = (event) => {
        const related = event.relatedTarget;
        if (reviewHoverElement && (!related || !reviewHoverElement.contains(related))) {
          setReviewHover(null);
        }
      };

      const onClick = (event) => {
        if (event.target.closest(".email-review-pin, #email-review-pins-layer")) return;
        const target = resolveMeaningfulElement(event.target);
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        closeCommentPopover();
        reviewSelectedElement = target;
        openCommentPanel({
          emailTitle: context.emailTitle,
          emailId: context.emailId,
          sourcePath: context.sourcePath,
          previewPath: context.previewPath,
          tagName: target.tagName.toLowerCase(),
          textQuote: truncateText(target.innerText || target.textContent || "", 160),
        });
      };

      doc._reviewHandlers = { onMouseOver, onMouseOut, onClick };
      doc.addEventListener("mouseover", onMouseOver, true);
      doc.addEventListener("mouseout", onMouseOut, true);
      doc.addEventListener("click", onClick, true);

      attachReviewPinListeners(doc);
      restoreReviewMarkers(doc, context);
      scheduleReviewRerender();

      if (pendingFocusCommentId) {
        const focusId = pendingFocusCommentId;
        const focusComment = getCampaignComments().find((item) => item.id === focusId);
        if (focusComment && focusComment.previewPath === context.previewPath) {
          pendingFocusCommentId = null;
          applyFocusToComment(focusComment);
        }
      }
    };

    frame.removeEventListener("load", frame._reviewOnLoad);
    frame._reviewOnLoad = onLoad;
    frame.addEventListener("load", onLoad);
    if (frame.contentDocument?.readyState === "complete") onLoad();
  };

  const openReviewEmailFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const emailId = params.get("email");
    const chainId = params.get("chain");
    if (!emailId || !chainId) return;
    const campaign = campaignsById[chainId];
    if (!campaign) return;
    const email = campaign.emails.find((item) => item.id === emailId);
    if (!email) return;

    ensureReviewPreviewStructure();
    ensureReviewPreviewControls();
    const title = `${campaign.name} · ${email.id}`;
    openGlobalPreview(email.previewPath, title);
    const shell = document.getElementById("global-preview-shell");
    const frame = shell?.querySelector("#global-preview-frame");
    if (!frame) return;
    setupIframeReview(frame, {
      previewPath: email.previewPath,
      emailTitle: title,
      campaignId: chainId,
      emailId: email.id,
      sourcePath: toPublicSourcePath(email.developmentPath) || null,
    });
  };

  ensureReviewIdentityGate();

  if (isReviewMode() && document.getElementById("chain-root")) {
    ensureReviewBar();
    initReviewComments().then(() => {
      openReviewEmailFromUrl();
    });
    window.addEventListener("resize", scheduleReviewRerender);
  }
})();
