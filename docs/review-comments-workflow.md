# Review comments workflow

This guide describes the day-to-day process for reviewing email previews with shared comments.

## Links

Clean chain view:

```text
https://sabiotrade-email-experiments.vercel.app/chain?chain=google-traffic-onboarding
```

Abandoned Cart chain view:

```text
https://sabiotrade-email-experiments.vercel.app/chain?chain=abandoned-cart
```

Review a specific email:

```text
https://sabiotrade-email-experiments.vercel.app/chain?chain=google-traffic-onboarding&review=1&email=GTO-01
```

Abandoned Cart review links:

```text
https://sabiotrade-email-experiments.vercel.app/chain?chain=abandoned-cart&review=1&email=AC-01
https://sabiotrade-email-experiments.vercel.app/chain?chain=abandoned-cart&review=1&email=AC-02
https://sabiotrade-email-experiments.vercel.app/chain?chain=abandoned-cart&review=1&email=AC-03
```

Each email row has three actions:

- `Preview` opens the clean email preview.
- `Review` opens the same email with comment pins and review tools.
- `Source` opens the source/development HTML.

## Manager flow

1. Open the hub or `Review` link.
2. Enter your name when prompted. This is the lightweight review access and the author name for new comments.
3. Click a block inside the email preview.
4. Write a comment and save it.
5. Use `Comments list` to see all comments in the current chain.
6. When a developer marks a comment as `applied`, check the preview.
7. If the change is accepted, click `Resolve`.

## Developer flow

1. Open the same `Review` link and enter your name when prompted.
2. Filter the comments list by `Open`.
3. Click a comment to scroll the email preview to the related block.
4. Use `Source` or the `sourcePath` shown in the comment to edit the HTML file.
5. Deploy or refresh the preview.
6. Mark the comment as `applied`.
7. The manager verifies and resolves it.

## Statuses

- `open`: needs work.
- `applied`: developer has made the change; waiting for manager review.
- `resolved`: manager accepted the change.

## Sync states

- `Shared comments`: comments are syncing through the shared backend.
- `Local comments`: shared backend is unavailable or not configured; comments are saved only in this browser.
- `Shared access blocked`: the backend rejected the request.
- `Sync failed`: the UI kept local comments, but the last backend sync failed.

Use `Sync now` to manually pull the latest comments. The page also syncs every 20 seconds while the tab is visible and shared comments are available.

## Safety notes

Name-only review is lightweight coordination, not real authentication. The whole project is also marked `noindex` through `robots.txt`, page metadata, and the `X-Robots-Tag` header. For stronger access control, enable Vercel Deployment Protection for the preview site.

Do not send `SUPABASE_SERVICE_ROLE_KEY` to teammates. Teammates only enter their name in the browser.
