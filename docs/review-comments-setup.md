# Review comments — Supabase setup

Shared email review comments use a Supabase table and Vercel serverless API (`api/review-comments.js`).

For day-to-day manager/developer usage, see [`review-comments-workflow.md`](./review-comments-workflow.md).

## Current project

Vercel production:

```text
https://sabiotrade-email-experiments.vercel.app
```

Supabase project:

```text
https://supabase.com/dashboard/project/lcbcfbxokbemhgklkekw
```

Supabase API URL:

```text
https://lcbcfbxokbemhgklkekw.supabase.co
```

Current setup status:

- `SUPABASE_URL` has been added to the Vercel Production environment.
- `SUPABASE_SERVICE_ROLE_KEY` still needs to be added to Vercel Production. Use a Supabase secret key (`sb_secret_...`) or the legacy `service_role` key.
- The `review_comments` table still needs to be created in Supabase.
- Current review access is name-only: reviewers enter `Name` when opening the hub/review pages; do not set `REVIEW_COMMENTS_TOKEN` for this flow.
- After adding the service key, redeploy the Vercel project so the API function receives the new environment variables.

## 1. Create table

Run in Supabase SQL editor:

```sql
create table if not exists review_comments (
  id text primary key,
  campaign_id text not null,
  email_id text,
  email_title text,
  preview_path text not null,
  source_path text,
  selector text,
  review_id text,
  tag_name text,
  text_quote text,
  comment text not null,
  status text not null default 'open'
    check (status in ('open', 'applied', 'resolved')),
  author_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists review_comments_campaign_created_idx
  on review_comments (campaign_id, created_at);
```

## 2. Vercel environment variables

In the Vercel project (Production + Preview):

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase secret key (`sb_secret_...`) or legacy `service_role` key (server only) |
| `REVIEW_COMMENTS_TABLE` | No | Table name, default `review_comments` |
| `REVIEW_COMMENTS_TOKEN` | No | Leave unset for the current name-only review flow |

**Important:** never expose `SUPABASE_SERVICE_ROLE_KEY` or `REVIEW_COMMENTS_TOKEN` in frontend code or public env vars. Supabase keeps these in **Project Settings → API Keys**; use a backend-only secret key for this Vercel function.

### Name-only review access

For the current lightweight flow, reviewers enter their name when opening the hub or review pages. The name is stored in browser `localStorage` (`emailReviewAuthorName:v1`) and is saved as `authorName` for new comments.

This is not real authentication. For stronger access control on the whole preview site, use [Vercel Deployment Protection](https://vercel.com/docs/security/deployment-protection) later.

## 3. API

| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/review-comments?campaignId=...` | List comments for campaign |
| POST | `/api/review-comments` | Create comment |
| PATCH | `/api/review-comments` | Update comment (`status`, `comment`, `authorName`) |
| DELETE | `/api/review-comments?campaignId=...` | Clear all comments for campaign |

## 4. Local fallback

Without Supabase env vars, the hub uses `localStorage` (`emailReviewComments:v1`) and shows **Local comments** in the review toolbar.

When Supabase is configured later, existing local comments are **merged** with server data on sync (server wins on duplicate `id`), and local-only comments are uploaded automatically when possible.

## 5. Sync

- **Sync now** — manual pull from API + merge + upload local-only comments.
- **Polling** — every 20 seconds while review mode is open, API is available, and the tab is visible.

## 6. Review entry URL

```
chain.html?chain=google-traffic-onboarding&review=1&email=GTO-01
```

Opens review mode and auto-loads the GTO-01 preview.

## 7. Deploy checklist

Before production deploy:

1. Run the SQL above in Supabase.
2. Add Vercel environment variables for Production and Preview:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `REVIEW_COMMENTS_TABLE` only if the table name is not `review_comments`
3. Deploy the project.
4. Open a review URL, enter `Name`, and confirm the toolbar shows **Shared comments**.

If the toolbar shows **Local comments**, the UI is working but the shared backend is not configured or not reachable.
