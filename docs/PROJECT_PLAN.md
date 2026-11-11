# KIKQrcards — Project Plan

> A SaaS platform for smart networking cards: design your card online, share it by QR, and order a real printed card that always shows your latest details.

---

## 1. Vision

Give everyone a networking card that **never goes out of date**.

One card works in two places:

- **Online**, as a public profile page opened by link or QR scan.
- **Offline**, as a printed physical card with the same QR on it.

When the owner updates their details, every printed card shows the new details on the next scan. Nothing needs to be reprinted.

---

## 2. The Problem

Traditional paper business cards have real gaps:

| Gap | What happens today |
|---|---|
| **Stale information** | People change phone numbers, jobs or emails. The printed card is now wrong. |
| **Manual effort** | The receiver has to type the number, search the name, and find the profile by hand. Most people don't bother. |
| **Hard-to-find profiles** | Searching someone on Facebook often gives the wrong person or a dead link instead of the right profile. |
| **No room for work** | A paper card can't show a portfolio, services, or recent work. Freelancers and businesses need to show this instantly. |

---

## 3. The Solution

A **digital card with a QR code**, also sold as a **physical printed card**.

- One scan opens the owner's live profile page.
- The page holds contact buttons (call, WhatsApp, email, maps), social links, website, and portfolio or service links.
- The visitor can save the contact to their phone in one tap (vCard).
- The owner edits the card at any time. The QR stays the same, so printed cards stay valid.

---

## 4. Target Users and Business Model

The platform is sold as SaaS on three levels:

| Segment | Who | What they buy |
|---|---|---|
| **Individual** | Professionals, freelancers, creators, students | A personal plan with a few digital cards and physical card orders |
| **Team** | Small businesses, agencies, startups | One plan for many members, shared branding, bulk card orders |
| **Corporate** | Large companies | Many seats, company branding control, admin over all employee cards, bulk printing |

### Current pricing in the code (`lib/bkash/plans.js`)

| Plan | Price | Digital cards | Physical orders |
|---|---|---|---|
| Free | ৳0 | 1 | First order is free |
| Personal | ৳199 / month | 5 | 5 per month |
| Business | ৳999 / year | 100 | 10–50 per month |

Physical card price: **৳400** per card + **3% VAT** + delivery (**৳50** inside Dhaka, **৳100** outside).

> The Team and Corporate tiers are planned but not built yet. See the [Development Log](DEVLOG.md).

---

## 5. Product Principles

1. **Dynamic** — the card content is live, the QR is permanent.
2. **Configurable** — users choose their own design, information, and which links to share.
3. **Easy** — a non-technical user can create, save and order a card in a few minutes.
4. **Premium** — the public site and both dashboards must look professional and trustworthy.

---

## 6. User Journeys

### 6.1 As a user (card owner)

1. Sign up or log in (Google or email/password).
2. Design the card: pick a template or customise colours, gradient and pattern. Later, generate a design from a text prompt with AI.
3. Add information: name, profession, quote, phone, email, website, address.
4. Set up the QR page: choose which links to share (WhatsApp, socials, portfolio, services, etc.).
5. Save the card and get a public link plus a QR code.
6. Order the physical card: enter delivery details, see the full price, and place the order.
7. Track the order: see its status (placed, confirmed, printing, shipped, delivered) and its history.
8. Update the card at any time. The printed QR keeps working.

### 6.2 As the owner / admin

1. Receive each new order instantly (WhatsApp first, email as backup).
2. Confirm the order and payment manually with the customer.
3. Update the order status in the admin dashboard. The user sees the change.
4. Manage users, cards, templates, plans and sales history.
5. See business stats: sales, orders, active users and plan usage.

---

## 7. Current Constraints (Bootstrap Phase)

The project starts small on purpose, because of limited funds.

| Constraint | Plan for now |
|---|---|
| No paid domain or hosting | Run on a free host (Netlify) and a free database tier (MongoDB Atlas M0). |
| No merchant account | No online payment gateway at launch. Orders are sent to the owner on **WhatsApp**. The owner collects payment manually (bKash/Nagad personal number or cash on delivery). |
| Manual operations | The admin updates sales history, order status and plan activation by hand in the dashboard. |

When revenue allows: buy a real domain, upgrade hosting and database, then add a merchant account (bKash/SSLCommerz) for automatic payments.

---

## 8. Feature Roadmap

### Phase 1 — MVP (launch on free stack)
- Proper sign-up and login.
- Card designer with several templates.
- QR page with configurable links.
- Permanent, dynamic QR codes.
- Physical card ordering, with a WhatsApp notification to the owner.
- Order tracking and history for the user.
- Order management for the admin, with manual status updates.
- Clear plan and pricing page.

### Phase 2 — Growth
- A large template library for manual design.
- AI design: generate a card design from the user's prompt.
- Premium redesign of the public site and both dashboards.
- Card analytics: scans, views and link clicks.
- Team plan: shared branding and member management.

### Phase 3 — Scale
- Corporate plan: many seats, company admin, bulk ordering.
- Online payment gateway once a merchant account exists.
- Custom domain and short QR links.
- NFC cards as an add-on.

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (Pages Router), React 18 |
| Styling | Tailwind CSS 4, shadcn/ui, tw-animate-css |
| Auth | NextAuth (Google + email/password) with MongoDB adapter |
| Database | MongoDB |
| QR | react-qr-code |
| Email | nodemailer (Gmail) |
| Payments | bKash tokenized checkout (built, but needs a merchant account) |
| Hosting | Netlify |

---

*Progress against this plan is tracked in the [Development Log](DEVLOG.md).*
