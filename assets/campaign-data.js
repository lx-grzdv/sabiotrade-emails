window.CAMPAIGN_DATA = {
  stages: [
    {
      id: "acquisition",
      title: "1) Привлечение и первый интерес",
      description: "Пользователь только знакомится с продуктом или почти купил."
    },
    {
      id: "assessment",
      title: "2) Assessment journey",
      description: "Пользователь в процессе challenge, важно довести до pass и funded."
    },
    {
      id: "recovery",
      title: "3) Риск оттока и возврат",
      description: "Пользователь потерял темп или ушел, задача вернуть в покупку."
    },
    {
      id: "funded",
      title: "4) Funded и монетизация",
      description: "Пользователь уже в funded-сегменте или после payout."
    },
    {
      id: "academy",
      title: "5) Education retention",
      description: "Удержание подписки Academy и плавный апселл в challenge."
    }
  ],
  campaigns: [
    {
      id: "google-traffic-onboarding",
      name: "Google Traffic Onboarding",
      stageId: "acquisition",
      summary: "Onboarding для Google-трафика, перевод в assessment/challenge.",
      trigger: "Регистрация/попадание в сегмент source_google=true",
      exit: "Purchase",
      reentry: "Не указан",
      briefPath: "development/google-traffic-onboarding/google_traffic_onboarding.html",
      previewFolder: "preview/google-traffic-onboarding/",
      versionsPath: "preview/google-traffic-onboarding/versions/",
      developmentFolder: "development/google-traffic-onboarding/HTML/",
      emails: [
        {
          id: "GTO-01",
          sendAt: "Day 3",
          subject: "You've been trading for 3 days — here's what the next step actually looks like",
          preheader: "The practice account is free. The funded account is where real money comes in.",
          previewPath: "preview/google-traffic-onboarding/GTO_01.html",
          developmentPath: "development/google-traffic-onboarding/HTML/GTO_01.html"
        },
        {
          id: "GTO-02",
          sendAt: "Day 6",
          subject: "Your trial expires tomorrow — one option worth knowing about",
          preheader: "EUR 20 to start. Same platform. No commitment to a larger account.",
          previewPath: "preview/google-traffic-onboarding/GTO_02.html",
          developmentPath: "development/google-traffic-onboarding/HTML/GTO_02.html"
        },
        {
          id: "GTO-03",
          sendAt: "После первого failed assessment",
          subject: "Your first assessment ended — here's what that actually means",
          preheader: "Not a failure. Here's the honest breakdown of what happened.",
          previewPath: "preview/google-traffic-onboarding/GTO_03.html",
          developmentPath: "development/google-traffic-onboarding/HTML/GTO_03.html"
        }
      ],
      taskNotes: [
        "Сегментировать traffic source корректно и не смешивать с остальным onboarding.",
        "Синхронизировать CTA с текущими offer/price в checkout.",
        "Уточнить re-entry правило в CJM (в ТЗ явно не зафиксировано)."
      ]
    },
    {
      id: "abandoned-cart",
      name: "Abandoned Cart",
      stageId: "acquisition",
      summary: "Возврат пользователей, бросивших корзину до оплаты challenge.",
      trigger: "Cart abandoned",
      exit: "Purchase",
      reentry: "Да (при новом abandon)",
      briefPath: "development/abandoned-cart/abandoned_cart.html",
      previewFolder: "preview/abandoned-cart/",
      developmentFolder: "development/abandoned-cart/",
      emails: [
        {
          id: "AC-01",
          sendAt: "Через 1 час",
          subject: "You left {{plan_name}} in your cart — here's what's inside",
          preheader: "{{plan_balance}} in trading capital. Real payouts. Here's how it works.",
          previewPath: "preview/abandoned-cart/AC_01_1h.html",
          developmentPath: "development/abandoned-cart/abandoned_cart.html"
        },
        {
          id: "AC-02",
          sendAt: "Через 24 часа",
          subject: "The most common reason traders hesitate — and what actually happens",
          preheader: "\"What if I don't pass?\" Here's the honest answer.",
          previewPath: "preview/abandoned-cart/AC_02_24h.html",
          developmentPath: "development/abandoned-cart/abandoned_cart.html"
        },
        {
          id: "AC-03",
          sendAt: "Через 72 часа",
          subject: "20% off {{plan_name}} — your cart is still here",
          preheader: "Last reminder. Code expires soon.",
          previewPath: "preview/abandoned-cart/AC_03_72h.html",
          developmentPath: "development/abandoned-cart/abandoned_cart.html"
        }
      ],
      taskNotes: [
        "Проверить TTL купона и чтобы текст письма совпадал с фактическим сроком.",
        "Вынести единый блок FAQ-возражений для согласованности tone-of-voice."
      ]
    },
    {
      id: "assessment-progress-engagement",
      name: "Assessment Progress Engagement",
      stageId: "assessment",
      summary: "Event-driven поддержка на 50/80/90% пути к profit target.",
      trigger: "События достижения порога прогресса",
      exit: "Breach / Pass / Purchase",
      reentry: "Да, по событиям",
      briefPath: "development/assessment-progress-engagement/assessment_progress_engagement.html",
      previewFolder: "preview/assessment-progress-engagement/",
      developmentFolder: "development/assessment-progress-engagement/HTML/",
      emails: [
        {
          id: "APE-50",
          sendAt: "При достижении 50%",
          subject: "You're halfway there — this is where most traders either win or lose it",
          preheader: "One decision separates the traders who pass from those who don't.",
          previewPath: "preview/assessment-progress-engagement/Assessment_Progress_50.html",
          developmentPath: "development/assessment-progress-engagement/HTML/Assessment_Progress_50.html"
        },
        {
          id: "APE-80",
          sendAt: "При достижении 80%",
          subject: "80% done — here's what funded traders do in the final stretch",
          preheader: "The last 20% is where the challenge is actually won or lost.",
          previewPath: "preview/assessment-progress-engagement/Assessment_Progress_80.html",
          developmentPath: "development/assessment-progress-engagement/HTML/Assessment_Progress_80.html"
        },
        {
          id: "APE-90",
          sendAt: "При достижении 90%",
          subject: "One step away — don't rush it",
          preheader: "The finish line is visible. Here's how to cross it cleanly.",
          previewPath: "preview/assessment-progress-engagement/Assessment_Progress_90.html",
          developmentPath: "development/assessment-progress-engagement/HTML/Assessment_Progress_90.html"
        }
      ],
      taskNotes: [
        "Проверить приоритет отправки, чтобы не пересекалось с Trading Results сигналами.",
        "Отследить влияние на breach-rate на участке 80-90%."
      ]
    },
    {
      id: "assessment-30-day-warning",
      name: "Assessment 30-Day Warning",
      stageId: "assessment",
      summary: "Напоминание о риске закрытия assessment на Day 25 и Day 29.",
      trigger: "25-й день без выполненного условия",
      exit: "Trade placed / Purchase / End",
      reentry: "Нет",
      briefPath: "development/assessment-30-day-warning/assessment_30day_warning.html",
      previewFolder: "preview/assessment-30-day-warning/",
      developmentFolder: "development/assessment-30-day-warning/",
      emails: [
        {
          id: "A30-01",
          sendAt: "Day 25",
          subject: "5 days left before assessment closes",
          preheader: "Place one valid trade now to keep your path active.",
          previewPath: "preview/assessment-30-day-warning/Assessment_30DayWarning_Day25.html",
          developmentPath: "development/assessment-30-day-warning/Assessment_30DayWarning_Day25.html"
        },
        {
          id: "A30-02",
          sendAt: "Day 29 (финал)",
          subject: "Final reminder before account closure",
          preheader: "Last day window: complete action to avoid reset.",
          previewPath: "preview/assessment-30-day-warning/Assessment_30DayWarning_Day29.html",
          developmentPath: "development/assessment-30-day-warning/Assessment_30DayWarning_Day29.html"
        }
      ],
      taskNotes: [
        "Убедиться, что условие выхода срабатывает мгновенно после trade event.",
        "Согласовать текст urgency с юридическими ограничениями."
      ]
    },
    {
      id: "trading-results",
      name: "Trading Results Communication",
      stageId: "assessment",
      summary: "Серия event-based писем по торговым сигналам и статусам прогресса.",
      trigger: "Trading events",
      exit: "Pass/Breach/перекрытие приоритетом событий",
      reentry: "Да",
      briefPath: "development/trading-results/trading_results_communication_1.html",
      previewFolder: "preview/trading-results/",
      developmentFolder: "development/trading-results/HTML/",
      emails: [
        {
          id: "TR-01",
          sendAt: "capital_growth_5",
          subject: "Your account is up 5% - here's what to do with that",
          preheader: "Good progress. One thing that keeps it going.",
          previewPath: "preview/trading-results/TR_01_Capital_Growth_5.html",
          developmentPath: "development/trading-results/HTML/TR_01_Capital_Growth_5.html"
        },
        {
          id: "TR-02",
          sendAt: "daily_loss_over_3pct",
          subject: "Your account is down 3% today - you have 2% left",
          preheader: "Not a breach. But here's what the next 2 hours look like.",
          previewPath: "preview/trading-results/TR_02_Daily_Loss_Over_3pct.html",
          developmentPath: "development/trading-results/HTML/TR_02_Daily_Loss_Over_3pct.html"
        },
        {
          id: "TR-03",
          sendAt: "consistency_rule_triggered",
          subject: "Your profit target has increased - here's exactly why",
          preheader: "One big day moved your target. Here's the math and what to do next.",
          previewPath: "preview/trading-results/TR_03_Consistency_Rule_Triggered.html",
          developmentPath: "development/trading-results/HTML/TR_03_Consistency_Rule_Triggered.html"
        },
        {
          id: "TR-04",
          sendAt: "open_loss_tx_7d",
          subject: "You have a losing trade open for 7 days - here's why that's a problem",
          preheader: "Holding a loss longer doesn't make it smaller.",
          previewPath: "preview/trading-results/TR_04_Open_Loss_7d.html",
          developmentPath: "development/trading-results/HTML/TR_04_Open_Loss_7d.html"
        },
        {
          id: "TR-05",
          sendAt: "open_profit_tx_7d",
          subject: "You have a profitable trade open for 7 days - one thing to check",
          preheader: "Letting profits run is good. But there's a prop-specific risk.",
          previewPath: "preview/trading-results/TR_05_Open_Profit_7d.html",
          developmentPath: "development/trading-results/HTML/TR_05_Open_Profit_7d.html"
        },
        {
          id: "TR-06",
          sendAt: "assessment_passed",
          subject: "You passed your {{plan_name}} assessment - here's what happens next",
          preheader: "Profit target reached. The funded account is one step away.",
          previewPath: "preview/trading-results/TR_06_Assessment_Passed.html",
          developmentPath: "development/trading-results/HTML/TR_06_Assessment_Passed.html"
        }
      ],
      taskNotes: [
        "Соблюдать приоритеты событий (daily_loss > consistency > open_loss > open_profit > capital_growth).",
        "Проверить переменные в payload, особенно financial fields."
      ]
    },
    {
      id: "free-trial-expired",
      name: "Free Trial Expired",
      stageId: "recovery",
      summary: "Winback после окончания trial с ветвлением по поведению C/B/A/D.",
      trigger: "Trial expired",
      exit: "Purchase",
      reentry: "Да, при новом trial",
      briefPath: "development/free-trial-expired/free_trial_expired_winback.html",
      previewFolder: "preview/free-trial-expired/",
      developmentFolder: "development/free-trial-expired/HTML/",
      emails: [
        {
          id: "FTE-C1",
          sendAt: "Day 0 (ветка C)",
          subject: "You were at 80%. Your trial ended - the path didn't.",
          preheader: "Most funded traders had a trial that ended the same way.",
          previewPath: "preview/free-trial-expired/FTE_C1.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_C1.html"
        },
        {
          id: "FTE-C2",
          sendAt: "Day 4 (ветка C)",
          subject: "4 days since your trial. Still thinking about it?",
          preheader: "The 80% you hit doesn't disappear. It's a data point.",
          previewPath: "preview/free-trial-expired/FTE_C2.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_C2.html"
        },
        {
          id: "FTE-B1",
          sendAt: "Day 0 (ветка B)",
          subject: "Your account grew during the trial. Here's what that means.",
          preheader: "You were moving in the right direction. The trial just ran out of time.",
          previewPath: "preview/free-trial-expired/FTE_B1.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_B1.html"
        },
        {
          id: "FTE-B2",
          sendAt: "Day 4 (ветка B)",
          subject: "One thing most traders don't know about the challenge",
          preheader: "There's no time limit. That changes the math completely.",
          previewPath: "preview/free-trial-expired/FTE_B2.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_B2.html"
        },
        {
          id: "FTE-A1",
          sendAt: "Day 0 (ветка A)",
          subject: "Your trial ended. One session went against you - here's why that's normal.",
          preheader: "Every funded trader has had this exact session. Here's what they did next.",
          previewPath: "preview/free-trial-expired/FTE_A1.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_A1.html"
        },
        {
          id: "FTE-A2",
          sendAt: "Day 4 (ветка A)",
          subject: "The one rule that would have changed your trial",
          preheader: "0.5% risk per trade. That's it.",
          previewPath: "preview/free-trial-expired/FTE_A2.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_A2.html"
        },
        {
          id: "FTE-D1",
          sendAt: "Day 0 (ветка D)",
          subject: "You opened the Traderoom. Something stopped you.",
          preheader: "That's the most common point where traders pause. Here's what usually helps.",
          previewPath: "preview/free-trial-expired/FTE_D1.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_D1.html"
        },
        {
          id: "FTE-D2",
          sendAt: "Day 4 (ветка D)",
          subject: "Still curious about prop trading?",
          preheader: "No pressure. Just the clearest explanation we have.",
          previewPath: "preview/free-trial-expired/FTE_D2.html",
          developmentPath: "development/free-trial-expired/HTML/FTE_D2.html"
        }
      ],
      taskNotes: [
        "Каскад сегментации C -> B -> A -> D, исключающие условия проверять в указанном порядке.",
        "RETRY20 упоминать только там, где это разрешено по offer policy."
      ]
    },
    {
      id: "breach-winback",
      name: "Breach Winback",
      stageId: "recovery",
      summary: "Возврат после breach через empathy + education + оффер.",
      trigger: "Breach",
      exit: "Purchase",
      reentry: "Да",
      briefPath: "development/breach-winback/breach_winback_1.html",
      previewFolder: "preview/breach-winback/",
      developmentFolder: "development/breach-winback/HTML/",
      emails: [
        {
          id: "BW-01",
          sendAt: "Через 1 час",
          subject: "What happened to your account - and what's next",
          preheader: "It's not over. Most funded traders breached at least once.",
          previewPath: "preview/breach-winback/Breach_Winback_1.html",
          developmentPath: "development/breach-winback/HTML/Breach_Winback_1.html"
        },
        {
          id: "BW-02A",
          sendAt: "Через 3 дня (ветка A)",
          subject: "You reached {{highest_cash_balance}} - that's not a failure, that's a roadmap",
          preheader: "Most traders who get funded breached first. Here's what they did differently.",
          previewPath: "preview/breach-winback/Breach_Winback_2A.html",
          developmentPath: "development/breach-winback/HTML/Breach_Winback_2A.html"
        },
        {
          id: "BW-02B",
          sendAt: "Через 3 дня (ветка B)",
          subject: "Before you try again - 3 things that make the difference",
          preheader: "Most traders who passed had at least one breach behind them.",
          previewPath: "preview/breach-winback/Breach_Winback_2B.html",
          developmentPath: "development/breach-winback/HTML/Breach_Winback_2B.html"
        },
        {
          id: "BW-03",
          sendAt: "Через 7 дней от старта",
          subject: "Your 20% discount expires in 48 hours",
          preheader: "Code RETRY20 - Essential EUR119->EUR95, Plus EUR289->EUR231. Last chance.",
          previewPath: "preview/breach-winback/Breach_Winback_3.html",
          developmentPath: "development/breach-winback/HTML/Breach_Winback_3.html"
        }
      ],
      taskNotes: [
        "Разветвление по highest_cash_balance/equity_at_start должно быть строго бинарным.",
        "Контролировать корректность цен и скидки RETRY20."
      ]
    },
    {
      id: "funded-account-activation",
      name: "Funded Account Activation",
      stageId: "funded",
      summary: "Активация funded аккаунта и возврат после funded breach.",
      trigger: "Funded account activated / funded breach",
      exit: "Purchase / progression",
      reentry: "Да",
      briefPath: "development/funded-account-activation/funded_account_activation.html",
      previewFolder: "preview/funded-account-activation/",
      developmentFolder: "development/funded-account-activation/HTML/",
      emails: [
        {
          id: "FA-01",
          sendAt: "Day 0 (мгновенно)",
          subject: "Your funded account is live - one rule that changes everything",
          preheader: "Real capital. Real payouts. One thing that matters most right now.",
          previewPath: "preview/funded-account-activation/Funded_Activation_1.html",
          developmentPath: "development/funded-account-activation/HTML/Funded_Activation_1.html"
        },
        {
          id: "FA-02",
          sendAt: "Day 1 (если нет активности)",
          subject: "Your funded account is waiting - here's a reason to open it today",
          preheader: "Most funded traders place their first trade within 24 hours.",
          previewPath: "preview/funded-account-activation/Funded_Activation_2.html",
          developmentPath: "development/funded-account-activation/HTML/Funded_Activation_2.html"
        },
        {
          id: "FA-03",
          sendAt: "Day 4 (если нет breach)",
          subject: "You've proven it works - here's how to make it work at scale",
          preheader: "The same discipline. 3x, 6x, or 10x the capital.",
          previewPath: "preview/funded-account-activation/Funded_Activation_3.html",
          developmentPath: "development/funded-account-activation/HTML/Funded_Activation_3.html"
        },
        {
          id: "FBW-01",
          sendAt: "Сразу после funded breach",
          subject: "Your funded account has been closed - what happened and what's next",
          preheader: "This one stings more than an assessment breach. Here's an honest look at it.",
          previewPath: "preview/funded-account-activation/Funded_Breach_Winback_1.html",
          developmentPath: "development/funded-account-activation/HTML/Funded_Breach_Winback_1.html"
        },
        {
          id: "FBW-02",
          sendAt: "Через 4 дня после FBW-01",
          subject: "Ready to come back? Here's the most direct path.",
          preheader: "You already know you can pass. The funded account is still there.",
          previewPath: "preview/funded-account-activation/Funded_Breach_Winback_2.html",
          developmentPath: "development/funded-account-activation/HTML/Funded_Breach_Winback_2.html"
        }
      ],
      taskNotes: [
        "Нужен строгий переход в funded breach winback при событии breach в любой момент.",
        "Проверить consistency терминов funded vs assessment в копирайте."
      ]
    },
    {
      id: "post-payout-upsell-referral",
      name: "Post-Payout Upsell + Referral",
      stageId: "funded",
      summary: "После выплаты: upsell, referral и повторный upsell.",
      trigger: "Payout_Completed",
      exit: "Purchase",
      reentry: "Да, на каждый новый payout",
      briefPath: "development/post-payout-upsell-referral/post_payout_upsell_referral.html",
      previewFolder: "preview/post-payout-upsell-referral/",
      developmentFolder: "development/post-payout-upsell-referral/",
      emails: [
        {
          id: "PPUR-01",
          sendAt: "Сразу после payout",
          subject: "Congrats on your payout - ready to scale this?",
          preheader: "Turn one successful cycle into a bigger funded trajectory.",
          previewPath: "preview/post-payout-upsell-referral/email-1.html",
          developmentPath: "development/post-payout-upsell-referral/PPUR_01_Immediate_Upsell.html"
        },
        {
          id: "PPUR-02",
          sendAt: "Day 3",
          subject: "Invite a friend: they get 25% off, you get a free Essential",
          preheader: "Referral path for traders already showing consistent results.",
          previewPath: "preview/post-payout-upsell-referral/email-2.html",
          developmentPath: "development/post-payout-upsell-referral/PPUR_02_Day3_Referral.html"
        },
        {
          id: "PPUR-03",
          sendAt: "Day 5",
          subject: "Still considering the next plan? Here's the most practical option",
          preheader: "Second upsell touch with a different angle after payout momentum.",
          previewPath: "preview/post-payout-upsell-referral/email-3.html",
          developmentPath: "development/post-payout-upsell-referral/PPUR_03_Day5_Upsell.html"
        }
      ],
      taskNotes: [
        "Подтянуть обязательные переменные payout_amount, plan_name, referral_code.",
        "Проверить ограничения referral (entry-level и комбинации скидок)."
      ]
    },
    {
      id: "academy-subscription-onboarding",
      name: "Academy Subscription Onboarding",
      stageId: "academy",
      summary: "3 таймлайн-трека (1W/4W/12W) + 7 event-driven писем.",
      trigger: "subscription.created и event-сигналы Academy",
      exit: "Purchase (challenge)",
      reentry: "Новая подписка = новый цикл",
      briefPath: "development/subscription/academy_subscription_onboarding.html",
      previewFolder: "preview/academy-subscription-onboarding/",
      developmentFolder: "development/subscription/academy-subscription-onboarding/",
      emails: [
        { id: "ASO-1W-01", sendAt: "1W Day 0", subject: "Your Academy is live - here's your plan for 7 days", preheader: "7 days of full access. Real traders, real courses, real homework.", previewPath: "preview/academy-subscription-onboarding/ASO_1W_01_Day0.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_1W_01_Day0.html" },
        { id: "ASO-1W-02", sendAt: "1W Day 3", subject: "Halfway through your week - have you done the homework?", preheader: "One assignment. 30 minutes. Changes how you approach the challenge.", previewPath: "preview/academy-subscription-onboarding/ASO_1W_02_Day3.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_1W_02_Day3.html" },
        { id: "ASO-1W-03", sendAt: "1W Day 6", subject: "Your Academy access ends tomorrow - two options", preheader: "Don't let it expire without a plan.", previewPath: "preview/academy-subscription-onboarding/ASO_1W_03_Day6.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_1W_03_Day6.html" },
        { id: "ASO-4W-01", sendAt: "4W Day 0", subject: "Your Academy is active - your 4-week plan starts now", preheader: "4 weeks of real courses, homework, mentors, and community.", previewPath: "preview/academy-subscription-onboarding/ASO_4W_01_Day0.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_4W_01_Day0.html" },
        { id: "ASO-4W-02", sendAt: "4W Day 5", subject: "5 days in - one thing worth doing this week", preheader: "Most traders skip this. The ones who pass don't.", previewPath: "preview/academy-subscription-onboarding/ASO_4W_02_Day5.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_4W_02_Day5.html" },
        { id: "ASO-4W-03", sendAt: "4W Day 14", subject: "2 weeks in - are you practicing under real conditions?", preheader: "The habit that separates funded traders from the rest.", previewPath: "preview/academy-subscription-onboarding/ASO_4W_03_Day14.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_4W_03_Day14.html" },
        { id: "ASO-4W-04", sendAt: "4W Day 25", subject: "3 days until your subscription ends - what is next?", preheader: "Two paths. Choose honestly.", previewPath: "preview/academy-subscription-onboarding/ASO_4W_04_Day25.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_4W_04_Day25.html" },
        { id: "ASO-12W-01", sendAt: "12W Day 0", subject: "Your 12-week Academy starts now", preheader: "3 months. Real traders. Real homework. A funded account at the end.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_01_Day0.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_01_Day0.html" },
        { id: "ASO-12W-02", sendAt: "12W Day 7", subject: "Week 1 done - the homework question", preheader: "Did you do it? It matters more than the lesson itself.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_02_Day7.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_02_Day7.html" },
        { id: "ASO-12W-03", sendAt: "12W Day 21", subject: "3 weeks in - time to open your first practice trade", preheader: "Theory is ready. This is the bridge to execution.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_03_Day21.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_03_Day21.html" },
        { id: "ASO-12W-04", sendAt: "12W Day 35", subject: "5 weeks in - midpoint check", preheader: "An honest look at where you should be.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_04_Day35.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_04_Day35.html" },
        { id: "ASO-12W-05", sendAt: "12W Day 49", subject: "7 weeks in - direct question", preheader: "What is actually stopping you from starting?", previewPath: "preview/academy-subscription-onboarding/ASO_12W_05_Day49.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_05_Day49.html" },
        { id: "ASO-12W-06", sendAt: "12W Day 63", subject: "9 weeks in - at some point demo becomes avoidance", preheader: "You have prepared long enough. Here is the practical view.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_06_Day63.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_06_Day63.html" },
        { id: "ASO-12W-07", sendAt: "12W Day 70", subject: "2 weeks left - one practical suggestion", preheader: "Not a pitch. A practical reason to start now.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_07_Day70.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_07_Day70.html" },
        { id: "ASO-12W-08", sendAt: "12W Day 77", subject: "Your Academy subscription ends in 7 days", preheader: "What you built stays. Access does not.", previewPath: "preview/academy-subscription-onboarding/ASO_12W_08_Day77.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_12W_08_Day77.html" },
        { id: "ASO-EV-01", sendAt: "Event: Certificate_Issued", subject: "You completed \"{{course_title}}\" - here is what is next", preheader: "Certificate earned. Now put it to work.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_01_Certificate_Issued.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_01_Certificate_Issued.html" },
        { id: "ASO-EV-02", sendAt: "Event: Education_Webinar_View", subject: "Glad you watched - here is what to do with it", preheader: "A webinar is theory. Make it practical in 48 hours.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_02_Education_Webinar_View.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_02_Education_Webinar_View.html" },
        { id: "ASO-EV-03", sendAt: "Event: charge.failed", subject: "Your Academy payment did not go through", preheader: "Your access is still active. Here is what to check.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_03_Charge_Failed.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_03_Charge_Failed.html" },
        { id: "ASO-EV-04", sendAt: "Event: subscription.canceled (+1h)", subject: "You canceled your Academy subscription - one question", preheader: "No hard feelings. We want to understand.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_04_Subscription_Canceled.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_04_Subscription_Canceled.html" },
        { id: "ASO-EV-05", sendAt: "Event: Academy_Course_Started", subject: "You started \"{{course_title}}\" - one tip for lesson one", preheader: "Homework matters more than the video. Here is why.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_05_Academy_Course_Started.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_05_Academy_Course_Started.html" },
        { id: "ASO-EV-06", sendAt: "Event: 7 days no activity", subject: "We have not seen you in Academy for a week", preheader: "Your courses are waiting. 10 minutes is enough to keep momentum.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_06_7days_No_Activity.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_06_7days_No_Activity.html" },
        { id: "ASO-EV-07", sendAt: "Event: Academy_Homework_Submitted", subject: "Homework received - here is what happens next", preheader: "You submitted it. That already puts you ahead.", previewPath: "preview/academy-subscription-onboarding/ASO_EV_07_Homework_Submitted.html", developmentPath: "development/subscription/academy-subscription-onboarding/ASO_EV_07_Homework_Submitted.html" }
      ],
      taskNotes: [
        "Поддерживать split по recurring_amount для треков 1W/4W/12W.",
        "Нужны backend события Academy_Course_Started и Academy_Homework_Submitted (если еще не внедрены).",
        "Событие Purchase должно завершать цепочку на любом шаге."
      ]
    }
  ]
};
