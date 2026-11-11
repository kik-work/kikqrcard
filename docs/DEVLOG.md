# KIKQrcards — Development Log

> Tracks what matches the [Project Plan](PROJECT_PLAN.md), what is still pending, and how to solve each pending item from the **user** side and the **owner** side.
> Add a new dated entry at the top of the log for every update.

**Legend:** ✅ Done · 🟡 Partly done · ❌ Not started · ⚠️ Risk or bug

---

## Status Overview

| # | Area | Status | Notes |
|---|---|---|---|
| 1 | Sign up / login | 🟡 | Google + email/password work. No email verification and no password reset. |
| 2 | Card designer (manual) | ✅ | Design model v2: 32 templates in 8 categories, 28 palettes, custom colour stops + angle, 7 fonts, 5 layouts, 13 patterns, 4 finishes. Admin templates still use the old class-based look. |
| 3 | AI design from prompt | ✅ | "AI design" tab. Free offline demo generator by default; uses Claude when `ANTHROPIC_API_KEY` is set. |
| 4 | QR page with links | ✅ | Up to 12 links: WhatsApp, phone, email, maps, website, socials and more. |
| 5 | Dynamic QR (updates after printing) | ✅ ⚠️ | Live page rendered on every scan, no caching. Copies resolve to the live card. The domain must be fixed before printing (see Issue A). |
| 6 | Save contact (vCard) | ✅ | Download button on the public card page. |
| 7 | Physical card order | ✅ | User picks a saved card to print. Owner gets email + WhatsApp alerts (WhatsApp needs a free CallMeBot key). |
| 8 | Order tracking (user) | ✅ | Expandable orders with a 5-step tracker, payment status, tracking number and full history. |
| 9 | Order management (admin) | ✅ | `/admin/orders`: filter, search, card preview, status/payment/tracking updates, "Message customer" on WhatsApp. |
| 10 | Plans and pricing | 🟡 | Manual plan requests over WhatsApp, approved on `/admin/payments`. No plan expiry yet. bKash stays switchable. |
| 11 | Team / Corporate plans | ❌ | Only a pricing label exists. No seats, members or company admin. |
| 12 | Admin dashboard | 🟡 | Users, cards, templates, payments, orders and stats exist. Stats do not count order revenue yet. |
| 13 | Premium public UI | ✅ | Landing redesigned 2026-11-11: code-built hero, scroll reveals, bento features, dark featured plan, CTA band. More real showcase templates still help. |
| 14 | Premium user/admin dashboards | ✅ | Admin now shares the dashboard theme via `AdminLayout`. Shimmer skeletons, count-up stats and page transitions on both. |
| 15 | Card analytics | ❌ | Not started. |
| 16 | API security | 🟡 | Issue B fixed. Some card read APIs still take `?email=`; review them before launch. |

---

## Key Issues and How to Solve Them

### Issue A — "Will an old QR show updated data?"

**Answer: yes, for saved cards — as long as the domain stays the same.** ✅ Code side done on 2026-11-11.

How it works now:
- A saved card's QR encodes only that card's link: `<site>/c/<cardId>` ([src/components/business-card.jsx](../src/components/business-card.jsx), [src/lib/publicUrl.js](../src/lib/publicUrl.js)).
- [src/pages/c/[cardId].js](../src/pages/c/[cardId].js) renders on the server on every scan with `Cache-Control: no-store`, so it always shows the latest saved data. It shows a "Live card · last updated" note.
- Editing a card keeps its `_id`, so its QR never changes.
- Loved / favourite / highlighted / public copies have their own ids. [lib/publicCard.js](../lib/publicCard.js) traces them back to the live card (`sourceCardId`, else owner + card name), so their QRs show current data too.
- Unsaved previews show "Save card to activate QR" instead of a QR. Orders can only be placed for a saved card.

The risk:
- `<site>` comes from `NEXT_PUBLIC_SITE_URL`. If that variable is not set, the QR uses whatever domain the page was opened on (for example a temporary Netlify URL).
- If the domain later changes (for example from `*.netlify.app` to a paid domain), **every printed QR points to the old domain and breaks**.

Solutions:
- **Owner:** before printing the first real card, pick one permanent address and set `NEXT_PUBLIC_SITE_URL` to it. The cheapest safe option is a low-cost domain (around ৳1,000–1,500 per year). If that is not possible yet, keep the free Netlify subdomain forever, and later redirect it to the new domain instead of dropping it.
- ~~**Owner:** block the "Order physical card" button unless the card is saved.~~ Done.
- **User:** always save the card before ordering. Edit the card later instead of creating a new one, so the same QR stays valid.

### Issue B — Order and payment history are readable by anyone ✅ Fixed 2026-11-11

`GET /api/payment/orders/history?email=...` and `GET /api/payment/bkash/history?email=...` have no login check. Anyone who knows an email address can read that person's orders, including name, phone number and home address.

Solution:
- **Owner (code fix):** read the email from the logged-in session (`requireUser`) instead of the query string. Do this before launch.

### Issue C — No merchant account ✅ Workaround built 2026-11-11

Built: orders and plan requests are saved, the owner gets email + WhatsApp alerts, the customer gets a pre-filled WhatsApp button, and the owner approves or updates from the admin pages. The original plan:
- **Owner:** switch the order flow to **WhatsApp checkout**:
  1. The user places the order. It is saved with status `pending_payment`.
  2. The site opens `https://wa.me/<owner-number>?text=<order summary + invoice number>`, so the user sends the order to the owner in one tap.
  3. The owner confirms on WhatsApp and collects payment by personal bKash/Nagad or cash on delivery.
  4. The owner marks the order as paid in the admin dashboard.
- Keep the email notification as a backup copy for the owner.
- Use the same flow for plan purchases: the admin activates the plan by hand after payment.
- Keep the bKash code. Switch it on later when a merchant account exists.
- **User:** send the pre-filled WhatsApp message and share the payment reference (TrxID) in the chat.

---

## Pending Tasks with Solutions

### 1. Proper sign-up
| Side | Solution |
|---|---|
| User | Clear sign-up form with password rules, email verification link, "Forgot password" flow, and Google one-tap. |
| Owner | Add a verification token + expiry in MongoDB and send it with the existing nodemailer setup. Block card ordering until the email is verified. Add rate limiting to login and sign-up. |

### 2. More designs for manual design
| Side | Solution |
|---|---|
| User | Template gallery with categories (corporate, creative, minimal, dark, festive). Live preview. Free and premium templates. |
| Owner | Extend `cardTemplates` with `category`, `isPremium`, `font`, `layout` and `previewImage`. Add 20–30 templates through the existing admin templates page. Lock premium templates by plan. |

### 3. AI design from a prompt
| Side | Solution |
|---|---|
| User | A prompt box such as "dark blue, minimal, for a lawyer". The AI fills colours, gradient, pattern, font and layout. The user can still edit everything. |
| Owner | Ask an LLM API to return JSON that matches the existing card fields (`bgGrad`, `bgStyle`, `pattern`, etc.), not images. This is cheap and always printable. Limit generations per plan (for example 3 on Free and 30 on Personal) to control cost. |

### 4. Order tracking and management
| Side | Solution |
|---|---|
| User | An orders page with a status timeline: `pending_payment → confirmed → printing → shipped → delivered` (plus `cancelled`). Show the invoice, price breakdown and the date of each status change. Add a WhatsApp "Contact support" button on each order. |
| Owner | A new admin **Orders** page: list, filter by status, search by invoice or phone, change status, add a note and tracking number. Store each change in a `statusHistory` array on the order. Add a sales summary (total revenue, orders per month) to the admin stats. |

### 5. Proper card purchase plans
| Side | Solution |
|---|---|
| User | One clear pricing page: what each plan includes, its limits, and how to pay (WhatsApp/bKash for now). Show current usage in the dashboard (for example "3 of 5 cards used"). |
| Owner | Keep `lib/bkash/plans.js` as the single source of truth. Add `team` and `corporate` entries. Add admin controls to activate, extend or cancel a user's plan by hand, with an expiry date. |

### 6. Team and Corporate plans
| Side | Solution |
|---|---|
| User | A team owner invites members by email. Members get cards with locked company branding. The team owner orders cards in bulk. |
| Owner | Add an `organizations` collection (name, logo, brand colours, seats, plan) and an `orgId` + role on users. Start with Team. Treat Corporate as Team with more seats and custom, manually quoted pricing. |

### 7. Premium public UI and dashboards
| Side | Solution |
|---|---|
| User | Fast, clean pages. Real card examples on the landing page. Mobile-first dashboard with clear next steps ("Create card → Set up QR → Order"). |
| Owner | Use one design system (shadcn/ui tokens, one font pair, one spacing scale). Add loading skeletons, empty states and toasts everywhere. Run a Lighthouse check on every page. |

### 8. Card analytics (Pro)
| Side | Solution |
|---|---|
| User | Scan count, views per day and the most-clicked links. |
| Owner | Log one event per public page view and link click into a `cardEvents` collection. Show analytics on paid plans only. |

---

## Suggested Order of Work

1. Fix Issue B (security).
2. Fix Issue A: decide the permanent domain and block ordering from unsaved cards.
3. WhatsApp checkout (Issue C) and the order status model.
4. Admin Orders page and the user order timeline.
5. Manual plan activation in the admin dashboard.
6. Email verification and password reset.
7. Template library expansion.
8. Premium UI pass.
9. AI design.
10. Team plan, then Corporate, then analytics.

---

## Log

<!-- Add new entries directly below this comment, newest first:
### YYYY-MM-DD — Title
- What changed
- Status updates in the table above
-->

### 2026-11-11 — Card design v2, AI designer, live QR, orders and owner alerts
- **Card design model v2** ([src/lib/cardDesign.js](../src/lib/cardDesign.js)): each card stores a `design` object (colour stops, angle, text, accent, font, layout, pattern, finish). It is validated on every API write with `normalizeDesign`. Old cards keep their `bgGrad` / `bgStyle` classes and still render.
- **Designer** ([src/pages/cards/createcard.js](../src/pages/cards/createcard.js)): Templates / AI design / Customize tabs; email, website and address fields added; saving switches to edit mode so the preview shows the real QR.
- **AI design** ([src/pages/api/ai/design.js](../src/pages/api/ai/design.js)): uses Claude (`claude-opus-5-5`, low effort, structured JSON) when `ANTHROPIC_API_KEY` is set. Otherwise, or on any error, it uses the free keyword generator in [src/lib/aiDesignLocal.js](../src/lib/aiDesignLocal.js). Limit: 30 per user per hour.
- **Live QR page**: server-rendered on every scan, no caching; copies resolve to the live card ([lib/publicCard.js](../lib/publicCard.js)). The owner's account email is never sent to the page.
- **Orders**: each order picks a saved card and stores a snapshot plus the live link; status model `placed → confirmed → printing → shipped → delivered` / `cancelled` with `statusHistory`; admin page [src/pages/admin/orders.js](../src/pages/admin/orders.js); user timeline on `/payment/orders`.
- **Owner alerts** ([lib/notify.js](../lib/notify.js), [lib/owner.js](../lib/owner.js)): every order and plan request goes to the owner's email and WhatsApp. A failed alert no longer deletes the order; the result is stored on the order.
- **Plans without a merchant**: `/api/payment/plans/request` plus Approve / Reject on `/admin/payments`, which activates the plan. `NEXT_PUBLIC_PAYMENT_MODE=bkash` switches back to bKash checkout.
- **Security**: order and payment history read the email from the session (Issue B).
- **Card fonts** load only on pages that show a v2 design, not on the landing page.
- **New dependencies**: `@anthropic-ai/sdk`, `zod`. Installed with `--legacy-peer-deps` because of an existing `nodemailer` / `next-auth` peer conflict.
- **Owner setup still needed** (env vars on Netlify):
  - `NEXT_PUBLIC_SITE_URL` — the permanent site address. Set it **before printing any card**.
  - `GMAIL_USER`, `GMAIL_APP_PASSWORD` — sender for alert emails. `ORDER_NOTIFY_EMAIL` and `OWNER_WHATSAPP` override the built-in owner contacts.
  - `CALLMEBOT_API_KEY` — free automatic WhatsApp alerts. From the owner's WhatsApp, send "I allow callmebot to send me messages" to the number on callmebot.com, then save the key it replies with.
  - `ANTHROPIC_API_KEY` (optional) — real Claude designs instead of the demo generator.
- **Still pending**: plan expiry / renewals, order revenue in admin stats, v2 designs for admin templates, Team/Corporate, email verification, analytics.

### 2026-11-11 — Premium UI pass (landing, user dashboard, admin)
- **Design system** (`src/styles/globals.css`): brand ink/deep tokens, glow and float shadows, keyframes (float, fade-up, page-in, marquee, scan, shimmer), `skeleton`, `spotlight`, `bg-grid` and `text-gradient` utilities. One global `prefers-reduced-motion` rule turns all motion off.
- **Scroll reveal** (`src/components/reveal.jsx`): one shared IntersectionObserver for the whole page, no scroll listeners. Content is only hidden when JS is on, so it never stays invisible.
- **Landing**: new hero built in code (phone profile preview, physical card with a live QR and scan line, floating chips) replaces the 2.2 MB `new_hero.png`. Integrations marquee, bento features, design showcase with skeletons, dark "most popular" plan, contact card with channels, "How it works" steps, closing CTA band in the footer.
- **Header**: glass on scroll, active section via IntersectionObserver (was `getBoundingClientRect` on every scroll event). On FAQ, T&C and All designs, nav links now open the section on the home page (they did nothing before).
- **User dashboard**: page-in transition, active nav indicator, upgrade card for free users, staggered stat cards with count-up numbers, quick actions row, shimmer skeletons.
- **Admin**: `AdminLayout` in `src/components/admin-shell.jsx` gives admin pages the same theme, sidebar and access screen as the user dashboard. Overview has a payment health ring, metrics and quick links. Tables restyled.
- **Performance**: Noto Sans and Roboto fallback fonts are no longer preloaded. Images are served as AVIF/WebP. The landing page no longer loads axios.
- **Owner note**: `src/pages/_document.js` loads 7 Google font families as a render-blocking stylesheet on every page (for card designs). Load them only on the card editor and public card pages to speed up the landing page.

### 2026-11-11 — Baseline review
- Reviewed the codebase against the project plan.
- Confirmed: saved-card QR codes are dynamic (`/c/<cardId>`), so printed cards show updated data.
- Found: the user-facing order and payment history APIs have no authentication (Issue B).
- Found: there is no admin order management, and order status never moves past `placed`.
- Found: owner notification uses email only. A WhatsApp flow is needed (Issue C).
- Found: Team and Corporate plans, AI design and analytics are not started.
- Created `docs/PROJECT_PLAN.md` and this log.
