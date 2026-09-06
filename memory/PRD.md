# Bloom & Brew — PRD

## Original problem statement
Premium, fully responsive website for a London-based coffee shop + flower concept ("Bloom & Brew" — Coffee. Flowers. A Happier You.), closely matching supplied blush editorial reference images. USP: coffee, flower cups, coffee with a flower branch tied to the cup, and coffee+flower gift combos. Pages: / /menu /our-story /gallery /find-us /faq /order with working basket, customisations, gallery filters, FAQ accordion, stylised map. AI-generated photography, soft blush palette (#F7E9E4/#E7B5B2/#2C2422/#FFF8F4), serif + script typography, slow elegant motion.

## Architecture
- FastAPI + MongoDB (motor): GET /api/products, POST /api/orders (server-side price computation + BLOOM5 5% promo), GET /api/orders/{id}. Orders persisted in `orders` collection (unique index on id).
- React 19 + Vite + Tailwind v4 + motion (framer-motion) + lenis smooth scroll. Pages in src/pages, cart in src/lib/cart.tsx (localStorage-persisted), products+image URLs in src/lib/products.ts.
- Fonts: Playfair Display (headings), DM Sans (body), self-hosted Meow Script (handwritten accents) at frontend/public/fonts/.
- 19 AI-generated brand photos hosted on static.prod-images.emergentagent.com.

## User personas
London commuters, students, couples, friends/colleagues, small-gift buyers, dates, Instagram/TikTok-oriented customers.

## Implemented (2026-09-06, iteration 8 — bug fixes)
- Fixed mobile product cards: price/buttons overlapped on ~180px-wide cards (footer now wraps, smaller pills on mobile) — this overlap was also swallowing Add-button taps, which caused the reported "checkout does nothing"
- Fixed mobile checkout UX: cart "Review & Checkout" now deep-links to /order#checkout and auto-scrolls to the checkout panel; added a floating "Checkout · N items · £X" bar on mobile while the basket is non-empty
- Fixed nav tagline wrapping on small screens (whitespace-nowrap)
- Verified via full mobile-viewport browser pass (390px): add → drawer → checkout → form → order placed (BB-45B822); cards clean on /order and /menu

## Implemented (2026-09-06, iteration 7)
- Stamp milestones: after each order receipt, loyalty is recomputed and a one-time "Halfway there!" (5/10) or "One coffee away…" (9/10) nudge email fires per cycle (loyalty_milestones collection, idempotent); verified live at 15 total coffees → stamp-5 email sent
- Admin panel /admin ("The Shop Room"): gated by Google sign-in + ADMIN_EMAILS env (sashalunar13@gmail.com); add/edit/delete products (auto slug + numbering, photo picker from existing brand photos), per-product In Stock / Sold Out toggle, and a Milk Fridge panel toggling whole/oat/almond/soy availability
- Catalogue moved to MongoDB (products + settings collections, seeded idempotently at startup from static defaults, image/alt backfill); GET /api/products now DB-driven; out-of-stock products are rejected at order time ("X is sold out right now") and unavailable milks are rejected too; menu/order cards show a "sold out, sorry ♡" state with disabled buttons, customise dialog strikes through sold-out milks; gift page hides sold-out plans
- Verified: is_admin flag, create/delete product, non-admin 401, sold-out product order 400, oat-milk-out order 400, sold-out badge appears/disappears on menu via admin toggle, 0 broken images, typecheck clean

## Implemented (2026-09-06, iteration 6)
- Order-ready texts: checkout collects an optional mobile number (Customer.phone, UK numbers auto-normalised to +44); when a barista marks an order Ready, an SMS fires via Twilio (twilio SDK, asyncio.to_thread, ready_sms_sent flag). DORMANT until TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM_NUMBER are added to backend/.env — skips gracefully otherwise. Ready email still always sends
- Loyalty stamps: GET /api/auth/loyalty counts coffee-category items across a signed-in customer's orders (10 per reward); stamp card on /account with 10 hearts; POST /api/auth/loyalty/redeem issues a single-use FREE-XXXXXX code (worth £5.80, locked to the customer's email); build_order validates reward codes from promo_rewards and marks them used. Verified: 9-coffee history + 1 order → 10 stamps → redeem → £11.60 order discounted to £5.80 → reuse rejected 400 → stamps continue at 2
- Reorder favourites: "Again" button on every account order re-adds items with exact customisations to the basket and opens the drawer
- Branded sender: still pending user's Resend dashboard + DNS steps (send-only API key can't do it programmatically)

## Implemented (2026-09-06, iteration 5)
- Emergent-managed Google sign-in: /account ("My Mornings") with Continue with Google → auth.emergentagent.com → AuthCallback exchanges session_id via backend-only GET /api/auth/session-data, httpOnly session_token cookie (7 days, samesite=none, secure), users + user_sessions collections with custom user_id (never _id), GET /api/auth/me (cookie then Bearer), POST /api/auth/logout, GET /api/auth/orders (order history + gift subscriptions matched by email)
- AuthProvider with three-state check that skips /auth/me during the OAuth hash callback (race-condition-safe, hash read from useLocation); navbar account icon; checkout prefills name/email when signed in
- Fully additive: orders, tracking, Stripe, barista passcode all unchanged and still work signed-out
- Verified: /auth/me 401 without token, test session returns user, /auth/orders returns BB-E5F238 + active gift, browser pass with cookie shows profile/history/prefill, sign-out prompt without cookie. NOT verified: the real Google round trip (needs a human Google login — test by clicking Continue with Google)
- Testing playbook saved at /app/auth_testing.md

## Implemented (2026-09-06, iteration 4)
- Order-ready alerts: when a barista marks an order Ready in /barista, the customer is emailed "come and get it while it's warm" (idempotent via ready_email_sent flag); verified live for BB-E5F238
- Gift reminders: hourly background task emails the giver "Week N of blooms went out today ♡" on each weekly anniversary of an active subscription (activated_at, last_reminder_week); verified live (week-1 reminder sent for the test subscription)
- Branded sender: BLOCKED on two manual steps — (1) the Resend API key is send-only, so the domain must be added in the Resend dashboard (resend.com/domains → bloomandbrew.london), (2) DNS records added at the registrar + verified; then set SENDER_EMAIL=orders@bloomandbrew.london in backend/.env and restart backend. Until then receipts/alerts only reach the verified address sashalunar13@gmail.com

## Implemented (2026-09-05, iteration 3)
- Receipt emails ACTIVATED: Resend key in backend/.env; blush HTML receipt sends on counter-order creation and on paid online orders; gift-subscription welcome email added; verified delivered for BB-E5F238 (confirmation_sent=True). Free-tier limit: only delivers to the verified address (sashalunar13@gmail.com) until a domain is verified in Resend
- Barista dashboard /barista: shared passcode "bloom-staff" → JWT staff token (12h, sessionStorage), brute-force lockout (5 tries → 15 min, Mongo login_attempts), constant-time passcode compare; live order board (20s auto-refresh) with payment badges, customisations, gift notes, one-tap status pills (Received → Preparing → Ready → Collected); overrides instantly reflected on customer /track page
- Gift subscriptions /gift: weekly Stripe subscription (mode=subscription, recurring weekly inline price) for Lovely Latte £5.50 / Flowers Cup £12.00 / The Perfect Pair £15.00 per week, recipient address + handwritten note, success page, webhook activation + customer.subscription.deleted cancellation handling; banner added on home page
- Verified: wrong passcode 401, no token 401, login token, staff list, status override visible on track page, gift checkout session created, real Resend send confirmed

## Implemented (2026-09-05, iteration 2)
- Stripe test checkout (Emergent sandbox, keys in backend/.env): POST /api/orders/checkout creates order + Checkout Session (GBP, itemized, BLOOM5 5% coupon, Stripe Tax calc-only with GB origin); success redirect to /order/success; POST /api/stripe/webhook (signature-verified) and GET /api/payments/status/{session_id} both flip order to paid idempotently
- Order tracking: GET /api/orders/track/{order_number} with computed display status (awaiting_payment → received → preparing → ready by elapsed time); /track page with timeline, payment badge, items + gift notes; links from confirmation, footer, mobile nav
- Confirmation emails: Resend pipeline (blush HTML receipt) sends on counter-order creation and on paid flip; dormant until RESEND_API_KEY is added to backend/.env (graceful skip + log otherwise)
- Order page now offers Pay by Card (Stripe) and Pay at the Counter; cancelled-payment toast on /order?cancelled=1
- Verified: direct sandbox charge succeeded (£19.76 GBP, pi_3UCHQh...), signed webhook → order BB-19C1C5 paid, status endpoint paid, track page + success page browser-verified; hosted checkout page rendered correctly with items/discount (headless browser could not complete Stripe's own submit — card entry proven via direct API charge instead)

## Backlog
- P1: add RESEND_API_KEY to activate confirmation emails (free at resend.com); admin orders dashboard
- P2: Instagram live feed; newsletter signup; order-ready notifications
- P3: loyalty stamps, gift subscriptions, multi-location pop-ups

## Next tasks
1. Add RESEND_API_KEY + verified sender domain for receipt emails
2. Claim the Stripe sandbox (claim link was in provisioning output) to keep it beyond the preview window
3. Register Stripe Tax when going live

## Implemented (2026-09-05, iteration 1)
- All 7 routes with sticky editorial nav (center script logo, blush ORDER NOW pill, bag counter), mobile hamburger sheet
- Home: parallax masked-reveal hero, marquee ribbon, feature strip, category cards, featured products, How It Works, Share The Love polaroid collage, closing CTA
- Menu: hero, 5 category filters, numbered product grid 01–10 with customise dialog + quick add
- Order: full ordering flow — customisation (coffee/milk/flower colour/branch/gift card/gift note), basket drawer, promo code, mock checkout persisted to MongoDB, confirmation with order number
- Our Story: numbered manifesto chapters, polaroids, values grid, closing quote
- Gallery: masonry with 7 filters + text tiles, share strip
- Find Us: Tower Bridge hero, info cards, stylised SVG map, Right Here section, Google Maps directions link
- FAQ: 11-question animated accordion, Email Us CTA
- Verified: typecheck clean; API curls (products, order create/fetch, invalid promo 400, unknown product 400); browser pass through customise → basket → BLOOM5 → checkout → confirmation (BB-60C33F); gallery filter; FAQ accordion

## Backlog
- P1: real Stripe payments at checkout; order status page lookup by order number; email confirmation via Resend
- P2: admin orders dashboard; Instagram live feed; newsletter signup; seasonal menu CMS
- P3: multi-location pop-ups, loyalty stamps, gift subscriptions

## Next tasks
1. Stripe test checkout (key already in pod environment folder)
2. Order status lookup page (/order/{id} view)
3. Resend order-confirmation email
