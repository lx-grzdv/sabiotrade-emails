#!/usr/bin/env python3
"""Build the Free Trial Expired winback email set."""

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DEV = ROOT / "development" / "free-trial-expired"
HTML_DIR = DEV / "HTML"
PREVIEW = ROOT / "preview" / "free-trial-expired"

SITE_URL = "https://sabiotrade.com/"
CHECKOUT_URL = "https://sabiotrade.com/checkout"
SUPPORT_URL = "https://discord.com/invite/hgMTA62ZET"
COURSE_URL = "https://sabiotrade.com/education/courses/how-to-be-successful-in-prop-trading"
COURSE_CH4_URL = (
    "https://sabiotrade.com/education/courses/how-to-be-successful-in-prop-trading/"
    "chapter-4-top-mistakes-to-avoid-in-prop-trading-part-1---strategy--risk"
)


def p(text, margin="0 0 16px", color="#000b36", size=17, line=25, weight="normal"):
    return (
        f'<p style="margin: {margin}; font-weight: {weight}; font-size: {size}px; '
        f'line-height: {line}px; color: {color}">{text}</p>'
    )


def section(inner, pad_bottom=24):
    return f"""
                <tr>
                  <td style="padding: 0 0 {pad_bottom}px">
                    {inner}
                  </td>
                </tr>"""


def card(title, body, bg="#FFFFFF", radius=24):
    return f"""
                    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 580px">
                      <tr>
                        <td bgcolor="{bg}" style="background-color: {bg}; border-radius: {radius}px; padding: 32px">
                          <h2 style="margin: 0 0 12px; font-weight: bold; font-size: 24px; line-height: 34px; color: #1358ff">{title}</h2>
                          {body}
                        </td>
                      </tr>
                    </table>"""


def metric_panel(title, rows, intro=None):
    row_html = []
    for i, (label, value) in enumerate(rows):
        divider = ""
        if i < len(rows) - 1:
            divider = """
                                  <tr>
                                    <td colspan="2" style="padding: 0 0 12px"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td bgcolor="#E4E9FF" height="1" style="height: 1px; font-size: 0; line-height: 1px">&nbsp;</td></tr></table></td>
                                  </tr>"""
        row_html.append(
            f"""
                                  <tr>
                                    <td class="mobile-block" valign="top" width="56%" style="width: 56%; padding: 0 16px 12px 0; font-size: 16px; line-height: 24px; color: #000b36">{label}</td>
                                    <td class="mobile-block mobile-center" valign="top" width="44%" align="right" style="width: 44%; padding: 0 0 12px; font-size: 18px; line-height: 24px; color: #000b36; font-weight: bold">{value}</td>
                                  </tr>{divider}"""
        )
    intro_html = p(intro, "0 0 18px", size=16, line=24) if intro else ""
    return f"""
                    <table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 580px; background-color: #d7e5ff; border-radius: 32px">
                      <tr>
                        <td style="padding: 32px">
                          <h2 style="margin: 0 0 20px; font-weight: bold; font-size: 28px; line-height: 36px; color: #1358ff">{title}</h2>
                          {intro_html}
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; background-color: #ffffff; border-radius: 24px">
                            <tr>
                              <td style="padding: 20px 24px">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                  {''.join(row_html)}
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>"""


def bullets(items):
    rows = []
    for item in items:
        rows.append(
            f"""
                                  <tr>
                                    <td valign="top" width="18" style="width: 18px; padding: 0 8px 8px 0; color: #1358ff; font-size: 18px; line-height: 24px; font-weight: bold">-</td>
                                    <td valign="top" style="padding: 0 0 8px; color: #000b36; font-size: 16px; line-height: 24px">{item}</td>
                                  </tr>"""
        )
    return f"""
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; border-radius: 16px">
                            <tr>
                              <td style="padding: 18px 20px">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                  {''.join(rows)}
                                </table>
                              </td>
                            </tr>
                          </table>"""


def numbered(items):
    rows = []
    for i, (title, text) in enumerate(items, 1):
        bottom = "8px" if i < len(items) else "0"
        rows.append(
            f"""
                                  <tr>
                                    <td valign="top" width="26" style="width: 26px; padding: 0 10px {bottom} 0; color: #1358ff; font-size: 18px; line-height: 25px; font-weight: bold">{i}.</td>
                                    <td valign="top" style="padding: 0 0 {bottom}; color: #000b36; font-size: 16px; line-height: 24px"><strong>{title}</strong><br />{text}</td>
                                  </tr>"""
        )
    return f"""
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; border-radius: 16px">
                            <tr>
                              <td style="padding: 18px 20px">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                                  {''.join(rows)}
                                </table>
                              </td>
                            </tr>
                          </table>"""


def two_cards(cards):
    cells = []
    for i, (title, text) in enumerate(cards):
        pad = "0 8px 0 0" if i == 0 else "0 0 0 8px"
        cells.append(
            f"""
                              <td class="mobile-block" width="50%" valign="top" style="width: 50%; padding: {pad}">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; border-radius: 18px">
                                  <tr>
                                    <td style="padding: 20px">
                                      <p style="margin: 0 0 6px; font-size: 20px; line-height: 28px; color: #1358ff; font-weight: bold">{title}</p>
                                      <p style="margin: 0; font-size: 15px; line-height: 22px; color: #000b36">{text}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>"""
        )
    return f"""
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>{''.join(cells)}
                            </tr>
                          </table>"""


def tip(text):
    return f"""
                    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 580px">
                      <tr>
                        <td bgcolor="#D9FF00" style="background-color: #d9ff00; padding: 16px 20px; border-radius: 18px">
                          {p(text, "0", size=16, line=24)}
                        </td>
                      </tr>
                    </table>"""


def cta(text, url=CHECKOUT_URL, pad_bottom=32):
    return section(
        f"""
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 580px">
                      <tr>
                        <td align="center" bgcolor="#1A22FF" style="background-color: #1a22ff; border: 2px solid #8f93ff; border-radius: 100px; mso-padding-alt: 14px 17px">
                          <a href="{url}" target="_blank" style="display: block; padding: 14px 17px; font-weight: normal; font-size: 16px; line-height: 23px; color: #ffffff; text-align: center; text-decoration: none; white-space: normal">{text}</a>
                        </td>
                      </tr>
                    </table>""",
        pad_bottom=pad_bottom,
    )


def offer_card(expires=False):
    expiry = (
        p("Offer expires in 48 hours.", "16px 0 0", color="#4a4c8e", size=13, line=20)
        if expires
        else ""
    )
    body = (
        p("RETRY20 gives 20% off the plans that fit the next attempt:", "0 0 16px")
        + """
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; border-radius: 18px">
                            <tr>
                              <td style="padding: 20px">
                                <p style="margin: 0 0 8px; font-size: 18px; line-height: 26px; color: #000b36"><strong>Essential:</strong> &euro;119 -> &euro;95 with RETRY20</p>
                                <p style="margin: 0 0 8px; font-size: 18px; line-height: 26px; color: #000b36"><strong>Plus $50K:</strong> &euro;289 -> &euro;231 with RETRY20</p>
                                <p style="margin: 0; font-size: 14px; line-height: 21px; color: #4a4c8e">RETRY20 applies to Essential and Plus only.</p>
                              </td>
                            </tr>
                          </table>"""
        + expiry
    )
    return card("Start the next attempt with RETRY20", body)


def image_placeholder(title, subtitle):
    return f"""
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #eef2ff; border-radius: 22px">
                            <tr>
                              <td align="center" style="padding: 38px 22px; border: 1px dashed #8f93ff; border-radius: 22px">
                                <p style="margin: 0 0 6px; color: #1358ff; font-size: 13px; line-height: 18px; font-weight: bold; text-transform: uppercase">Image placeholder</p>
                                <p style="margin: 0; color: #000b36; font-size: 18px; line-height: 26px; font-weight: bold">{title}</p>
                                <p style="margin: 6px 0 0; color: #4a4c8e; font-size: 14px; line-height: 20px">{subtitle}</p>
                              </td>
                            </tr>
                          </table>"""


def support_and_footer():
    return """
                <tr>
                  <td style="padding: 0 0 48px">
                    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px">
                      <tr>
                        <td style="padding: 0 0 16px">
                          <p style="margin: 0; color: #1c1e4e; font-size: 16px; line-height: 24px">
                            Got any questions about SabioTrade? Our dedicated
                            <a href="https://discord.com/invite/hgMTA62ZET" target="_blank" style="text-decoration: underline; color: #0057fa">Support Service</a> is always here to help. Drop us a message, and we'll be right with you!
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong style="margin: 0; color: #1c1e4e; font-size: 16px; line-height: 24px; font-weight: bold">
                            Stay informed and stay ahead with Sabiotrade. For real-time updates and insights, follow our social channels. We're here to support your trading journey.
                          </strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 10px 0">
                    <table align="center" role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="width: 100%; max-width: 480px">
                      <tr>
                        <td align="center">
                          <p style="margin: 0; color: #4a4c8e; font-size: 14px; line-height: 22px; letter-spacing: 1px; text-transform: uppercase; font-weight: bold">RISK WARNING:</p>
                          <p style="margin: 4px 0 25px; color: #4a4c8e; font-size: 14px; line-height: 22px; text-align: center">The content on this website is for general information only.</p>
                          <p style="margin: 0; color: #4a4c8e; font-size: 14px; line-height: 22px; text-align: center">The service and company website are provided on an "as-is" basis and without warranty of any kind, including, but not limited to warranties of title, merchantability, accuracy, fitness for a particular purpose, security, and non-infringement.</p>
                        </td>
                      </tr>
                      <tr><td height="16" style="height: 16px; font-size: 0"></td></tr>
                      <tr>
                        <td align="center">
                          <table role="presentation" width="240" border="0" cellspacing="0" cellpadding="0" style="max-width: 240px">
                            <tr>
                              <td align="center" height="24" width="24"><a href="https://discord.gg/hgMTA62ZET" title="Discord" target="_blank"><img src="https://fsms.quadcode.com/storage/public/ck/42/o28d0gfttt1fdojg/discrord.png" height="24" width="24" alt="Discord" style="display: block; border: 0; width: 24px; height: 24px" /></a></td>
                              <td align="center" height="24" width="24"><a href="https://t.me/sabiotrade" title="telegram" target="_blank"><img src="https://fsms.quadcode.com/storage/public/ck/42/o2e1fignqlbpc4e0/tg.png" height="24" width="24" alt="telegram" style="display: block; border: 0; width: 24px; height: 24px" /></a></td>
                              <td align="center" height="24" width="24"><a href="https://www.instagram.com/sabiotrade/" title="instagram" target="_blank"><img src="https://fsms.quadcode.com/storage/public/ck/42/o2e1fignqlbpc4b0/inst.png" height="24" width="24" alt="instagram" style="display: block; border: 0; width: 24px; height: 24px" /></a></td>
                              <td align="center" height="24" width="24"><a href="https://www.facebook.com/people/Sabio-Trade/100075852953720/" title="facebook" target="_blank"><img src="https://fsms.quadcode.com/storage/public/ck/42/o2e1fignqlbpc4ag/fa.png" height="24" width="24" alt="facebook" style="display: block; border: 0; width: 24px; height: 24px" /></a></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td height="20" style="height: 20px; font-size: 0"></td></tr>
                      <tr>
                        <td align="center">
                          <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td><a target="_blank" style="text-decoration: underline; color: #4a4c8e; font-size: 14px; line-height: 22px" href="https://sabiotrade.com/terms">Terms and Conditions</a></td>
                              <td width="32" style="width: 32px; font-size: 0"></td>
                              <td><a target="_blank" style="text-decoration: underline; color: #4a4c8e; font-size: 14px; line-height: 22px" href="%%PW_EMAIL_UNSUBSCRIBE%%">Unsubscribe</a></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td height="32" style="height: 32px; font-size: 0"></td></tr>
                    </table>
                  </td>
                </tr>"""


def email_shell(email):
    preheader_pad = "&nbsp;&zwnj;" * 15
    sections = "\n".join(email["sections"])
    return f"""<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!--
  Subject: {email['subject']}
  Preheader: {email['preheader']}
  Audience: {email['audience']}
-->
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SabioTrade</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&amp;display=swap" rel="stylesheet" />
    <style type="text/css">
      body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
      body {{ height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: "Inter", Helvetica, sans-serif; background: #f9f9fc; }}
      table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
      img {{ border: 0; line-height: 100%; text-decoration: none; -ms-interpolation-mode: bicubic; }}
      table {{ border-collapse: separate !important; border-spacing: 0; }}
      a[x-apple-data-detectors] {{ color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }}
      b, strong {{ font-weight: bold !important; }}
      @media screen and (max-width: 525px) {{
        .wrapper {{ width: 100% !important; max-width: 100% !important; }}
        .center {{ text-align: center !important; }}
        .two-columns .column {{ width: 100% !important; max-width: 100% !important; display: block !important; }}
        .header-logo, .header-cta {{ display: block !important; width: 100% !important; max-width: 100% !important; text-align: center !important; }}
        .header-logo {{ padding: 0 0 16px !important; }}
        .mobile-block {{ display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; box-sizing: border-box !important; }}
        .mobile-center {{ text-align: center !important; }}
        .hero-title {{ font-size: 34px !important; line-height: 42px !important; }}
      }}
    </style>
  </head>
  <body style="margin: 0 !important; padding: 0 !important; background: #f9f9fc; font-family: Inter, Helvetica, sans-serif">
    <div style="font-size: 0; color: #262119; line-height: 1px; mso-line-height-rule: exactly; display: none; max-width: 0; max-height: 0; opacity: 0; overflow: hidden; mso-hide: all; font-family: Inter, Helvetica, sans-serif">
      {email['preheader']}
      {preheader_pad}
    </div>

    <center style="width: 100%; table-layout: fixed; padding: 0">
      <div bgcolor="#F9F9FC" style="background-color: #f9f9fc">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 604px; margin: 0 auto; font-family: Inter, Helvetica, sans-serif" align="center">
          <tr>
            <td style="padding: 0 12px">
              <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 0; padding: 16px 0 24px" class="two-columns">
                    <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 580px">
                      <tr>
                        <td valign="middle" class="header-logo" style="vertical-align: middle; padding: 0 18px 0 0">
                          <table align="left" role="presentation" style="max-width: 220px" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td>
                                <a href="{SITE_URL}" target="_blank" rel="noopener">
                                  <img src="https://sabiotrade.com/storage/media/5304/Sabiotrade-LogoCombination.png" border="0" alt="SabioTrade" style="display: block; border: 0; width: 160px; max-width: 100%; height: auto" width="160" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                        <td valign="middle" class="header-cta" style="vertical-align: middle">
                          <table align="right" role="presentation" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="vertical-align: middle; white-space: nowrap">
                                <a href="{CHECKOUT_URL}" target="_blank" rel="noopener" style="font-weight: normal; font-size: 14px; line-height: 21px; color: #1c1e4e; text-decoration: none; white-space: nowrap">
                                  <span style="vertical-align: middle">Use RETRY20</span>
                                  <img src="https://sabiotrade.com/storage/media/4751/r-icon.png" border="0" alt="" style="border: 0; width: 24px; vertical-align: middle" width="24" />
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 0 32px">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width: 100%; max-width: 580px">
                      <tr>
                        <td bgcolor="#484FFF" style="padding: 40px 32px; background-color: #484fff; border-radius: 40px">
                          <table role="presentation" align="center" width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 516px">
                            <tr>
                              <td style="padding: 0 0 16px">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td bgcolor="#D9FF00" style="background-color: #d9ff00; border-radius: 100px; padding: 6px 14px">
                                      <strong style="margin: 0; font-weight: bold; font-size: 14px; line-height: 20px; color: #0b0b26">{email['badge']}</strong>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 0 0 16px">
                                <h1 class="hero-title" style="margin: 0; font-weight: bold; font-size: 40px; line-height: 50px; color: #ffffff">{email['hero_title']}</h1>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <p style="margin: 0; font-weight: normal; font-size: 18px; line-height: 26px; color: #ffffff">{email['hero_text']}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
{sections}
                <tr>
                  <td style="padding: 0 0 24px">
                    <table align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px">
                      <tr>
                        <td>
                          <p style="margin: 0; color: #4a4c8e; font-size: 13px; line-height: 20px">{email['activity_note']}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
{support_and_footer()}
              </table>
            </td>
          </tr>
        </table>
      </div>
    </center>
  </body>
</html>
"""


def build_emails():
    return [
        {
            "id": "C1",
            "file": "FTE_C1.html",
            "wrapper": "email-c1.html",
            "label": "C1 - Almost passed",
            "desc": "Segment C - reached 80%+ of profit target during trial",
            "subject": "You were at 80%. Your trial ended - the path didn't.",
            "preheader": "Most funded traders had a trial that ended the same way.",
            "audience": "Segment C - reached 80%+ of profit target during free trial.",
            "badge": "Trial ended today",
            "hero_title": "You were at 80%. The path did not end.",
            "hero_text": "Hi {{first_name}}, your free trial ended today. Before you close this, one data point matters: you reached 80% of the profit target.",
            "activity_note": "You received this because your free trial expired and your trading data showed 80%+ progress toward the profit target.",
            "sections": [
                section(metric_panel("Your trial signal", [
                    ("Profit target reached", "80%+"),
                    ("What that means", "Almost passed on the first attempt"),
                    ("Paid challenge target", "10% profit"),
                ])),
                section(card(
                    "This is not just a trial result",
                    p("That means you are not a trader who simply tried prop trading. You are a trader who almost passed on the first attempt, without paying anything.")
                    + p("The funded traders on our leaderboard - the ones with $50,000+ in payouts - often had a free trial that looked exactly like yours. They were close. Then the trial ended. Then they bought the challenge.", "0")
                )),
                section(card(
                    "What the challenge looks like from here",
                    p("The difference between where you are and a funded account is not skill. You already demonstrated that. It is one more attempt with the rules locked in from day one.")
                    + bullets([
                        "You need 10% profit. You have already shown you can get to 8%.",
                        "Daily loss limit: 5% of account.",
                        "Max trailing drawdown: 6%.",
                        "No time limit.",
                    ]),
                )),
                section(tip("The single adjustment that usually makes the difference: cap every trade at 0.5-1% of account balance. This prevents one bad session from catching the drawdown.")),
                section(offer_card()),
                cta("Start with Essential - &euro;95 with RETRY20"),
            ],
        },
        {
            "id": "C2",
            "file": "FTE_C2.html",
            "wrapper": "email-c2.html",
            "label": "C2 - 80% reminder",
            "desc": "Segment C - day 4 without Purchase",
            "subject": "4 days since your trial. Still thinking about it?",
            "preheader": "The 80% you hit doesn't disappear. It's a data point.",
            "audience": "Segment C - day 4 after free trial expired, no Purchase.",
            "badge": "48 hours left",
            "hero_title": "Four days later, the 80% still matters.",
            "hero_text": "Hi {{first_name}}, four days ago your trial ended. You were at 80% of the profit target. That is not a coincidence - it is your baseline.",
            "activity_note": "You received this because your free trial expired, you reached 80%+ of the profit target, and no Purchase event was recorded.",
            "sections": [
                section(card(
                    "The clearest way to look at the decision",
                    p("Essential plan - &euro;95 with RETRY20:")
                    + bullets([
                        "$20,000 account.",
                        "Target: $22,000 (+10%).",
                        "You have already shown you can get to about $21,600 on a free account.",
                    ])
                    + p("The gap between what you have done and what pays out is about $400 of additional profit.", "18px 0 0", weight="bold")
                    + p("That is the bet you are making for &euro;95.", "8px 0 0"),
                )),
                section(offer_card(expires=True)),
                cta("Start with Essential - &euro;95 with RETRY20"),
            ],
        },
        {
            "id": "B1",
            "file": "FTE_B1.html",
            "wrapper": "email-b1.html",
            "label": "B1 - Account grew",
            "desc": "Segment B - account grew 1%+ during trial",
            "subject": "Your account grew during the trial. Here's what that means.",
            "preheader": "You were moving in the right direction. The trial just ran out of time.",
            "audience": "Segment B - capital growth 1%+, but did not reach 80% target.",
            "badge": "Trial ended today",
            "hero_title": "Your account grew. The trial just ran out.",
            "hero_text": "Hi {{first_name}}, your free trial ended today. Something worth noticing: your account balance grew during the trial.",
            "activity_note": "You received this because your free trial expired and your account showed capital growth during the trial.",
            "sections": [
                section(metric_panel("Your signal", [
                    ("Trial outcome", "Account balance grew"),
                    ("What it shows", "The mechanics are there"),
                    ("What changed next", "No time limit on the paid challenge"),
                ])),
                section(card(
                    "That is a different situation than most people who leave",
                    p("Most traders who let their trial expire without buying think they were not ready. But account growth during a trial is the clearest signal that the mechanics are there.")
                    + p("You were trading in the right direction - the trial just ran out before you could go further.", "0"),
                )),
                section(card(
                    "What usually turns growth into a funded account",
                    two_cards([
                        ("Time", "The paid challenge has no time limit. You keep trading until you hit the target."),
                        ("One rule", "Cap every trade at 0.5-1% of account balance so one session does not undo the trend."),
                    ])
                    + p("You have already shown you can do the first part. The second part is a settings change.", "18px 0 0"),
                )),
                section(offer_card()),
                cta("Start the next attempt"),
            ],
        },
        {
            "id": "B2",
            "file": "FTE_B2.html",
            "wrapper": "email-b2.html",
            "label": "B2 - No deadline",
            "desc": "Segment B - day 4 without Purchase",
            "subject": "One thing most traders don't know about the challenge",
            "preheader": "There's no time limit. That changes the math completely.",
            "audience": "Segment B - day 4 after free trial expired, no Purchase.",
            "badge": "48 hours left",
            "hero_title": "No time limit changes the math.",
            "hero_text": "Hi {{first_name}}, the thing most people do not realise about the SabioTrade challenge: there is no time limit.",
            "activity_note": "You received this because your free trial expired, your account showed capital growth, and no Purchase event was recorded.",
            "sections": [
                section(card(
                    "Your free trial had 7 days. The paid challenge does not expire.",
                    p("You trade until you hit the 10% target - however long that takes. Some traders pass in 2 days. Some take 6 weeks. Both get funded.")
                    + p("Your trial showed your account can grow. With no deadline on the next attempt, that growth does not need to happen in 7 days.", "0"),
                )),
                section(metric_panel("Trial vs challenge", [
                    ("Free trial", "7 days"),
                    ("Paid challenge", "No time limit"),
                    ("Goal", "10% profit target"),
                ])),
                section(offer_card(expires=True)),
                cta("Use RETRY20 before it expires"),
            ],
        },
        {
            "id": "A1",
            "file": "FTE_A1.html",
            "wrapper": "email-a1.html",
            "label": "A1 - Bad session",
            "desc": "Segment A - daily loss over 3%",
            "subject": "Your trial ended. One session went against you - here's why that's normal.",
            "preheader": "Every funded trader has had this exact session. Here's what they did next.",
            "audience": "Segment A - daily loss over 3%, excluding C and B.",
            "badge": "Trial ended today",
            "hero_title": "One session went against you. That is normal.",
            "hero_text": "Hi {{first_name}}, your free trial ended today. At some point, the account dropped more than 3% in one day. That is the moment most traders pause.",
            "activity_note": "You received this because your free trial expired and your account had a daily loss over 3% during the trial.",
            "sections": [
                section(card(
                    "That session is the test - not the market",
                    p("Here is what usually happened: a position was too large for that day's movement, or a news event moved faster than the stop.")
                    + p("This is not a trading skill problem. It is a position sizing problem. And it has a specific fix:", "0")
                    + p("Cap every trade at 0.5% of account balance.", "18px 0 0", color="#1358ff", size=24, line=32, weight="bold"),
                )),
                section(card(
                    "With this rule",
                    bullets([
                        "A single bad session cannot close your account.",
                        "You can have 10 consecutive losing trades and stay within the drawdown limit.",
                        "News events become survivable, not fatal.",
                    ])
                    + p("This is the rule that separates most funded traders from most failed attempts.", "18px 0 0"),
                )),
                section(card(
                    "Watch the free lesson before buying",
                    image_placeholder("Risk and strategy lesson thumbnail", "How to Be Successful in Prop Trading - Chapter 4")
                    + p("Chapter 4 covers the top mistakes to avoid in prop trading and shows how to keep a single trade from deciding the whole attempt.", "20px 0 0"),
                )),
                cta("Watch Chapter 4", COURSE_CH4_URL, pad_bottom=24),
                section(offer_card()),
                cta("Start fresh with this rule"),
            ],
        },
        {
            "id": "A2",
            "file": "FTE_A2.html",
            "wrapper": "email-a2.html",
            "label": "A2 - 0.5% rule",
            "desc": "Segment A - day 4 without Purchase",
            "subject": "The one rule that would have changed your trial",
            "preheader": "0.5% risk per trade. That's it.",
            "audience": "Segment A - day 4 after free trial expired, no Purchase.",
            "badge": "48 hours left",
            "hero_title": "One rule. One number.",
            "hero_text": "Hi {{first_name}}, this is all that changes between the trial you had and a funded-account attempt: risk no more than 0.5% per trade.",
            "activity_note": "You received this because your free trial expired, your account had a daily loss over 3%, and no Purchase event was recorded.",
            "sections": [
                section(card(
                    "What 0.5% risk means in real numbers",
                    two_cards([
                        ("$20,000 account", "$100 risk per trade."),
                        ("$50,000 account", "$250 risk per trade."),
                    ])
                    + p("At $100 per trade, you can lose 12 consecutive trades and still be within the 6% drawdown limit.", "18px 0 0"),
                )),
                section(card(
                    "Why funded traders use it",
                    p("Most funded traders say this felt too conservative when they started. Then it kept them in the challenge while other traders exited. Then they got funded.")
                    + p("Ready to try it properly?", "0", weight="bold"),
                )),
                section(offer_card(expires=True)),
                cta("Start again with 0.5% risk"),
            ],
        },
        {
            "id": "D1",
            "file": "FTE_D1.html",
            "wrapper": "email-d1.html",
            "label": "D1 - First trade",
            "desc": "Segment D - opened Traderoom, no trade",
            "subject": "You opened the Traderoom. Something stopped you.",
            "preheader": "That's the most common point where traders pause. Here's what usually helps.",
            "audience": "Segment D - no Activity_FirstPositionOpened in the last 14 days.",
            "badge": "Trial ended today",
            "hero_title": "You opened Traderoom. Something stopped you.",
            "hero_text": "Hi {{first_name}}, your free trial ended today. You logged into the Traderoom but did not place a trade. That is more common than you might think.",
            "activity_note": "You received this because your free trial expired and no first position event was recorded.",
            "sections": [
                section(card(
                    "The pause is usually about the first click",
                    p("The platform felt unfamiliar, and placing the first trade felt like a commitment.")
                    + p("It is not. A demo trade on a free trial account is virtual capital. There is nothing to lose.", "0"),
                )),
                section(card(
                    "The fastest path to making it feel natural",
                    numbered([
                        ("Pick one asset you already follow.", "EUR/USD, Gold, or US100 are liquid and familiar for many first positions."),
                        ("Open the smallest possible position.", "0.01 lot. The goal is not profit - it is to feel the platform respond."),
                        ("Set a stop-loss before you click buy.", "This is the habit that makes everything else manageable."),
                    ])
                    + p("That is a first trade. It takes 3 minutes.", "18px 0 0", weight="bold"),
                )),
                section(card(
                    "Platform walkthrough placeholder",
                    image_placeholder("Traderoom first-trade walkthrough", "Suggested visual: smallest position + stop-loss set before buy")
                    + p(f"If you want to understand the platform better first, this course is free: <a href=\"{COURSE_URL}\" target=\"_blank\" style=\"text-decoration: underline; color: #0057fa\">How to Be Successful in Prop Trading</a>.", "20px 0 0"),
                )),
                section(offer_card()),
                cta("Try it properly with no time pressure"),
            ],
        },
        {
            "id": "D2",
            "file": "FTE_D2.html",
            "wrapper": "email-d2.html",
            "label": "D2 - Still curious",
            "desc": "Segment D - day 4 without Purchase",
            "subject": "Still curious about prop trading?",
            "preheader": "No pressure. Just the clearest explanation we have.",
            "audience": "Segment D - day 4 after free trial expired, no Purchase.",
            "badge": "Last email",
            "hero_title": "Still curious about prop trading?",
            "hero_text": "Hi {{first_name}}, no pressure. Just the clearest explanation we have before this follow-up ends.",
            "activity_note": "You received this because your free trial expired, you did not place a first trade, and no Purchase event was recorded.",
            "sections": [
                section(card(
                    "Prop trading in one sentence",
                    p("You pay a one-time fee to prove you can trade. If you pass, we give you up to $1,000,000 in real capital and you keep 80-90% of every profit.", "0 0 16px", size=18, line=26, weight="bold")
                    + p("The challenge starts at &euro;95 with code RETRY20.", "0")
                    + p("RETRY20 applies to Essential and Plus only.", "8px 0 0", color="#4a4c8e", size=13, line=20),
                )),
                section(tip("No follow-up emails after this one.")),
                cta("Take a second look"),
            ],
        },
    ]


def wrapper_page(email, prev_email, next_email):
    prev_link = f'<a href="{prev_email["wrapper"]}">{prev_email["id"]} &larr;</a>' if prev_email else '<a href="index.html">&larr; Campaign</a>'
    next_link = f'<a href="{next_email["wrapper"]}">{next_email["id"]} &rarr;</a>' if next_email else '<a href="index.html">Campaign &rarr;</a>'
    return f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Free Trial Expired - {email['id']}</title>
    <link rel="stylesheet" href="../../assets/hub.css" />
  </head>
  <body>
    <nav class="preview-bar">
      {prev_link}
      <span class="preview-title">{email['label']}</span>
      {next_link}
    </nav>
    <div class="preview-frame-wrap">
      <iframe class="preview-frame" title="Free Trial Expired - {email['id']}" src="{email['file']}"></iframe>
    </div>
  </body>
</html>
"""


def preview_index(emails):
    rows = "\n".join(
        f"""          <li>
            <a href="{email['file']}">
              {email['label']}
              <span class="variant-desc">{email['desc']}</span>
            </a>
          </li>"""
        for email in emails
    )
    wrappers = " · ".join(f'<a href="{email["wrapper"]}">{email["id"]}</a>' for email in emails)
    return f"""<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Free Trial Expired - превью</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="../../assets/hub.css" />
  </head>
  <body>
    <div class="hub">
      <header class="hub-header">
        <p><a href="../../index.html">← Оглавление</a></p>
        <h1>Free Trial Expired</h1>
        <p class="hub-lead">Winback после истечения триала · 4 сегмента · 8 писем · RETRY20 для Essential и Plus.</p>
      </header>

      <main>
        <ul class="preview-list">
{rows}
        </ul>
        <p class="hub-lead" style="margin-top: 20px">Превью в рамке: {wrappers}</p>
        <section class="hub-meta">
          <h2>Исходники</h2>
          <ul>
            <li><a href="../../development/free-trial-expired/">development/free-trial-expired/</a></li>
            <li><a href="../../development/free-trial-expired/free_trial_expired_winback.docx">free_trial_expired_winback.docx</a></li>
          </ul>
        </section>
      </main>
    </div>
  </body>
</html>
"""


def write_readme():
    (DEV / "README.md").write_text(
        """# free-trial-expired

Текст: `free_trial_expired_winback.docx`

HTML готов:
- `HTML/FTE_C1.html`
- `HTML/FTE_C2.html`
- `HTML/FTE_B1.html`
- `HTML/FTE_B2.html`
- `HTML/FTE_A1.html`
- `HTML/FTE_A2.html`
- `HTML/FTE_D1.html`
- `HTML/FTE_D2.html`

Кампания вынесена в `preview/free-trial-expired/`.
""",
        encoding="utf-8",
    )


def update_root_index(emails):
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    preview_row = """            <tr>
              <td>
                <strong>Free Trial Expired</strong>
                <span class="campaign-note">winback после истечения триала</span>
              </td>
              <td><code>preview/free-trial-expired/</code></td>
              <td class="preview-links">
                <a href="preview/free-trial-expired/">Все →</a>
                <a href="preview/free-trial-expired/FTE_C1.html">C1</a>
                <a href="preview/free-trial-expired/FTE_C2.html">C2</a>
                <a href="preview/free-trial-expired/FTE_B1.html">B1</a>
                <a href="preview/free-trial-expired/FTE_B2.html">B2</a>
                <a href="preview/free-trial-expired/FTE_A1.html">A1</a>
                <a href="preview/free-trial-expired/FTE_A2.html">A2</a>
                <a href="preview/free-trial-expired/FTE_D1.html">D1</a>
                <a href="preview/free-trial-expired/FTE_D2.html">D2</a>
              </td>
            </tr>
"""
    if "preview/free-trial-expired/" not in text:
        marker = "            <tr>\n              <td>\n                <strong>Breach Winback</strong>"
        pos = text.find(marker)
        if pos != -1:
            text = text[:pos] + preview_row + text[pos:]

    dev_row = """            <tr>
              <td><strong>Free trial expired</strong></td>
              <td><code>development/free-trial-expired/</code></td>
              <td><code>free_trial_expired_winback.docx</code></td>
            </tr>
"""
    if dev_row in text:
        text = text.replace(dev_row, "")
    path.write_text(text, encoding="utf-8")


def update_sync_preview():
    path = ROOT / "scripts" / "sync-preview.py"
    text = path.read_text(encoding="utf-8")
    if '"free-trial-expired",' not in text:
        text = text.replace(
            'READY = [\n    "assessment-30-day-warning",\n',
            'READY = [\n    "assessment-30-day-warning",\n    "free-trial-expired",\n',
        )
    path.write_text(text, encoding="utf-8")


def main():
    HTML_DIR.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    emails = build_emails()

    for email in emails:
        html = email_shell(email)
        (HTML_DIR / email["file"]).write_text(html, encoding="utf-8")
        (PREVIEW / email["file"]).write_text(html, encoding="utf-8")

    for idx, email in enumerate(emails):
        prev_email = emails[idx - 1] if idx else None
        next_email = emails[idx + 1] if idx + 1 < len(emails) else None
        (PREVIEW / email["wrapper"]).write_text(wrapper_page(email, prev_email, next_email), encoding="utf-8")

    (PREVIEW / "index.html").write_text(preview_index(emails), encoding="utf-8")
    write_readme()
    update_root_index(emails)
    update_sync_preview()

    print("Built Free Trial Expired emails:")
    for email in emails:
        print(f"  {email['file']}")


if __name__ == "__main__":
    main()
