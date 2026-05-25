# Assessment 30-Day Warning - A/B Test Plan

## Base files

- `Assessment_30DayWarning_Day25.html` - control/A for Email 1.
- `Assessment_30DayWarning_Day29.html` - control/A for Email 2.

## Important launch note

Do not run all tests at once. Subject, tone, timing, and CTA each affect a different part of the funnel. If they run together, the result will be hard to interpret.

If the audience is small, launch the control version first and collect a baseline before splitting traffic. For a small segment, a noisy A/B test can look decisive while being mostly random.

## Recommended first launch

### Test 1 - Email 1 subject line

This test does not require a new HTML file.

Variant A:
- Subject: ⚠️ Your assessment account closes in 5 days
- Preview: One trade is all it takes to keep it open.

Variant B:
- Subject: ⚠️ Action needed: your account closes in 5 days
- Preview: Keep your progress with one small trade.

Primary metric:
- Open rate

Guardrail metrics:
- Click rate
- `trade_placed`
- Unsubscribe / complaint rate

### Test 2 - Email 1 CTA copy

This can be done either by editing the CTA text in Pushwoosh or by creating a second HTML copy.

Variant A:
- CTA: Open Traderoom - Place 1 Trade

Variant B:
- CTA: Save My Account Now

Primary metric:
- `trade_placed` after click

Secondary metric:
- Click-to-open rate

## Later tests

### Tone test - Email 1

This requires a separate HTML/content variant.

Variant A:
- Current softer tone: "If life got in the way..."

Variant B:
- More direct tone: "Your account will close unless you place one trade before day 30."

Primary metric:
- `trade_placed` within the journey window

Guardrail:
- Unsubscribe / complaint rate

### Timing test - Email 1

This is a Pushwoosh journey test, not an HTML test.

Variant A:
- First email on day 25

Variant B:
- First email on day 20

Primary metric:
- `trade_placed` before day 30

Guardrail:
- Support complaints or unsubscribes

### Email 2 subject line

Keep Email 2 short and stable at first. If there is enough volume later, test subject only.

Variant A:
- Subject: 🚨 Last chance: your account closes tomorrow
- Preview: Place 1 trade today - takes 2 minutes.

Variant B:
- Subject: Your assessment account closes tomorrow
- Preview: Place 1 trade today - takes 2 minutes.

Primary metric:
- Open rate

Real success metric:
- Same-day `trade_placed`

## Pushwoosh setup notes

- Stop condition: `trade_placed` exits the journey immediately.
- Email 2 condition: Email 1 sent + 4 days passed + no `trade_placed`.
- Do not let users re-enter more than once in the same 30-day inactivity period.
- Attribute every test by journey variant, not only by email subject, so `trade_placed` can be tied back to the experiment branch.
