# BLOOM & BREW — Complete Build Prompt

Copy everything below into a new project to recreate this app.

---

## ROLE & GOAL

Build a premium, fully responsive website + ordering platform for a London-based coffee shop and flower concept. The result must feel like a high-end London boutique brand: part specialty coffee shop, part flower boutique, part romantic lifestyle magazine. It must NOT look like a generic coffee shop template.

## BUSINESS CONCEPT

Brand name: **BLOOM & BREW**
Tagline: "Coffee. Flowers. A Happier You."

A modern London coffee pop-up (Tower Bridge, SE1 2UP) combining specialty coffee with fresh flowers. The signature idea: a tiny hand-tied posy (pink carnations, daisies, baby's breath) tied to every takeaway cup with twine and a small kraft tag. Customers can buy: coffee only, a small cup of fresh flowers as an affordable gift, coffee with a flower branch attached, or a coffee + flower gift combination.

Core message (must be obvious within 5 seconds): "You came for your morning coffee — but you can also make someone else's morning brighter."

Slogans used throughout: "Good coffee. Brighter mornings." · "Same coffee. More love." · "A little coffee. A little flower. A brighter you." · "Small things make life more beautiful." · "Coffee for you. Flowers for someone special."

Target customers: London commuters, students, couples, colleagues, gift-buyers, dates, Instagram/TikTok-oriented customers.

## COLOUR PALETTE (strict)

- Page background: `#F7E9E4`
- Section backgrounds: `#F3DDD7` (rose mist) and `#F9EFEB` (sand)
- Cards/surfaces: `#FFF8F4` (cream)
- Soft blush (buttons, accents): `#E7B5B2` and deeper `#DFA4A5`
- Text: `#2C2422` (espresso) / `#332A27` (cocoa); muted text `#6E5E5A`
- Borders: espresso at 10–15% opacity
- Never: bright saturated pinks, neon, purple gradients, glassmorphism

## TYPOGRAPHY (strict)

- Headings: **Playfair Display** (serif), UPPERCASE, generous letter-spacing (0.15em), sizes 4xl→7xl
- Body: **DM Sans**, small and elegant (text-sm/base)
- Handwritten accents: **Meow Script** (self-hosted TTF) — used for the logo, small phrases, gift notes, section accents ("Same coffee, more love ♡")
- Logo: script "Bloom & Brew" with microtext underneath: "COFFEE ♡ FLOWERS ♡ A HAPPIER YOU" (8–9px, tracking 0.3em)
- Decorative elements (use sparingly, always intentional): ♡ hearts, ✿ flowers, thin horizontal rules, polaroid photo frames, small line icons (strokeWidth 1.2–1.5), subtle film-grain overlay (fixed, opacity 0.05, multiply)

## LAYOUT & MOTION RULES

- Sticky header: left nav links (HOME MENU OUR STORY GALLERY), dominant center script logo, right (FIND US, FAQ, blush pill "ORDER NOW", account icon, bag icon with count). Mobile: hamburger + center logo + bag.
- Buttons: rounded-full pills, blush background, uppercase micro-tracked labels, lift 2px on hover. Dark espresso pill for primary payment actions.
- Product cards: thin top border, script index number ("01"), 4:5 photo with hover zoom (scale 1.05, 700ms), serif name, small description, price + pills below. Mobile: 2 columns; footer wraps so price never collides with buttons.
- Motion: slow and elegant only — fade/rise on scroll into view (y 24–28px, 0.9s, ease [0.16,1,0.3,1]), image scale 0.98→1, masked line-by-line hero headline reveal, subtle hero parallax (16%), one slow marquee ribbon (48s linear), 2–4px card lift, smooth accordion. NO bouncing, flashing, or gaming-style UI.
- Lenis momentum scrolling (lerp 0.09). Page transitions: 0.4s fade.

## PHOTOGRAPHY DIRECTION

All photography is AI-generated original brand imagery (not stock). Style: cinematic editorial lifestyle photography in London, warm golden morning sunlight, shallow depth of field, 35mm film grain, blush pink + cream palette, realistic hands and skin, delicate small flower posies (never huge bouquets), London architecture, cosy cups. NO text or letters rendered inside images, no distorted hands/cups, no excessive bokeh or pink.

Required shots: hero (hand in pink knit holding iced latte with flower posy, flower stall backdrop); 10 product shots; Tower Bridge flower-cart golden hour; cafe interior barista handover; lifestyle set (woman drinking, gift exchange, couple by Thames, flat-lay notes, flower stall, cup on riverside railing).

## PAGES & CONTENT

1. **/** Home — full-viewport hero with left scrim + masked headline "GOOD COFFEE / BRIGHTER / MORNINGS", script "est. London — with love", "Same coffee, more love ♡" rotated bottom-right; marquee; 4-icon feature strip (Specialty Coffee / Fresh Flowers / Perfect Together / Pop-Up Experience); "Find Your Perfect Moment ♡" 4 category cards; "Coffee for you. Flowers for someone special." 3 featured products (Lovely Latte £5.50, Flowers Cup £12.00, The Perfect Pair £15.00); weekly-gift banner; "How It Works" (Choose/Enjoy/Share/Get 5%); "SHARE THE LOVE" overlapping polaroid collage + Instagram CTA; dark closing CTA over couple photo.
2. **/menu** — "COFFEE × FLOWERS" hero over flower-stall photo, "SAME COFFEE. MORE LOVE."; filters ALL / COFFEE / FLOWERS / COFFEE+FLOWERS / SEASONAL; numbered grid 01–10 with thin borders and breathing room.
   Products: 01 Lovely Latte £5.50 · 02 Bloom Cappuccino £5.00 · 03 Pink Bloom Latte £5.80 · 04 Flowers Cup £12.00 · 05 Matcha Moment £5.80 · 06 The Perfect Pair £15.00 · 07 Caramel Bloom £5.80 · 08 Blue Harmony £12.00 · 09 Mocha Love £5.80 · 10 Berry Blossom £5.80.
3. **/our-story** — "OUR STORY" + script subtitle; intro; "HOW IT ALL BEGAN" chapter layout (large image left, numbered paragraphs middle, polaroids right); "WHAT DRIVES US" 4 columns (Spread Kindness / Celebrate the Everyday / Support Local / Build a Community); closing quote "WE BELIEVE A HAPPIER WORLD STARTS WITH KINDER MORNINGS."
4. **/gallery** — "MOMENTS THAT BLOOM"; masonry (CSS columns, 2 on mobile) with filters (All/Coffee/Flowers/People/Our Pop-Up/London/Special Moments); two text tiles ("LIFE TASTES BETTER WITH FLOWERS ♡", "GOOD PEOPLE GOOD COFFEE BEAUTIFUL DAYS"); "SHARE YOUR MOMENT" strip (tag @bloomandbrew for 5% off).
5. **/find-us** — "COME FIND US BY THE RIVER" over Tower Bridge golden-hour photo; GET DIRECTIONS (Google Maps link); 4 info cards (Location / Dates / Opening Hours Mon–Fri 8–14, Sat–Sun 9–16, weather permitting / What to Expect); stylised inline-SVG map of the Thames + Tower Bridge with pin "Bloom & Brew ♡"; "RIGHT HERE ♡" (Picture Perfect / River Views / Made with Love) + polaroid; "Pop by and say hi!" strip.
6. **/faq** — "YOU ASK, WE ANSWER." + script "Good coffee. Brighter days."; 11-question elegant animated accordion; "STILL NEED HELP?" → EMAIL US (mailto:hello@bloomandbrew.london).
7. **/order** — "ORDER AHEAD" + script "Made with love, ready in about 15 minutes ♡"; product grid with Customise dialog (Coffee: Latte/Cappuccino/Americano/Matcha/Iced Latte · Milk: Whole/Oat/Almond/Soy · Flowers: Pink/White/Mixed/Seasonal · flower branch yes/no · handwritten gift card yes/no · gift note script textarea · quantity stepper); sticky checkout panel (name, email, optional mobile, pickup time, Pay by Card / Pay at the Counter); floating mobile checkout bar; deep-link #checkout auto-scroll; confirmation with order number + Track link.
8. **/track** — order-number lookup (BB-XXXXXX); 4-step timeline (Received → Preparing → Ready → Collected); payment badge; items with customisations and gift notes.
9. **/account** ("My Mornings") — Google sign-in gate; profile header (photo, name, email); Account Settings (edit name, birthday with date picker, upload avatar photo); loyalty stamp card (10 hearts, "your tenth blooms free", redeem → single-use FREE-XXXXXX code worth £5.80, email-locked); weekly gifts list; order history with per-order status badge, Track and "Again" (one-tap reorder with exact customisations).
10. **/admin** ("The Shop Room") — owner-only (Google account in ADMIN_EMAILS env); Milk Fridge toggles (whole/oat/almond/soy availability — sold-out milks are struck through in the customise dialog and rejected at checkout); product list with In Stock/Sold Out toggle (sold-out products show "sold out, sorry ♡" and can't be ordered), inline edit (name/description/price), delete with confirm, add-product form (auto slug + numbering, photo picker).
11. **/barista** ("The Counter") — staff passcode login (env STAFF_PASSCODE, JWT 12h token, 5-try → 15-min lockout, constant-time compare); live order board (20s auto-refresh) with payment badges, customisations, gift notes, one-tap status pills; status changes instantly update the customer tracking page; marking Ready emails (+ texts, if Twilio configured) the customer once.
12. **/gift** — "GIFT A WEEK OF MORNINGS": weekly subscription (real Stripe subscription, recurring weekly) for Lovely Latte £5.50 / Flowers Cup £12.00 / The Perfect Pair £15.00 per week; recipient address + handwritten note; success page; giver gets a "Week N of blooms went out today ♡" email every weekly anniversary (hourly background job); cancel by email; cancelled subscriptions handled via Stripe webhook.
13. **/order/success** + **/gift/success** — poll payment status until Stripe confirms, then confirmation UI.

## COMMERCE & INTEGRATIONS (backend: FastAPI + MongoDB)

- **Products live in MongoDB** (seeded idempotently from static defaults at startup; admin edits win). GET /api/products is DB-driven with static fallback.
- **Orders**: POST /api/orders (pay-at-counter) and POST /api/orders/checkout (Stripe). Prices ALWAYS computed server-side from the DB catalog — never trust client totals. Order numbers BB-XXXXXX. Promo: BLOOM5 (5%) + loyalty FREE-XXXXXX codes (single-use, £5.80, email-locked).
- **Stripe (test sandbox)**: Checkout Sessions, GBP, itemized line items, BLOOM5 coupon, automatic_tax with GB origin (physical goods → Stripe Tax calc-only); success redirect with session_id; signature-verified webhook /api/stripe/webhook flips orders paid idempotently (also the polling endpoint /api/payments/status/{session_id}); every payment touchpoint writes to payment_transactions collection; gift subscriptions use mode=subscription with inline recurring weekly price_data; customer.subscription.deleted marks gifts cancelled.
- **Google sign-in (Emergent-managed OAuth)**: redirect to https://auth.emergentagent.com/?redirect={origin}/account → returns #session_id in URL hash → AuthCallback exchanges it server-side only at GET /api/auth/session-data (calls Emergent session-data endpoint with X-Session-ID header) → users collection with custom user_id (never expose _id), user_sessions with 7-day expiry, httpOnly+secure+samesite=none session_token cookie; /auth/me (cookie first, Bearer fallback), /auth/logout, /auth/orders. AuthProvider skips /auth/me while hash contains session_id (race fix). Fully additive — everything works signed-out.
- **Email (Resend)**: blush HTML templates — order receipt (counter + on paid flip), order-ready alert (fires when barista marks Ready, once per order), gift welcome, weekly gift reminder, loyalty milestone nudges at stamps 5 and 9 (once per card cycle). All sends are fire-and-forget with try/except so email failures never break orders. Free tier only delivers to the account owner's verified email until a domain is verified.
- **SMS (Twilio, dormant)**: order-ready text when barista marks Ready and customer left a mobile (UK numbers auto-normalised to +44). Activates when TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER are set.
- **Object storage (avatars)**: Emergent objstore via INTEGRATION_PROXY_URL + EMERGENT_LLM_KEY; init once at startup; paths bloom-and-brew/uploads/{user_id}/{uuid}.{ext}; files collection with soft-delete; served via GET /api/files/{path}; JPG/PNG/WEBP ≤5MB validated.
- **PWA**: manifest.webmanifest (standalone, blush theme #F7E9E4), line-art app icon (192/512/maskable/apple-touch), iOS meta tags, service worker (app-shell precache, cache-first brand photos/fonts/icons, network-first navigations with offline fallback, /api always network), mobile install banner with per-platform instructions.

## TECHNICAL REQUIREMENTS

- React 19 + Vite + TypeScript + Tailwind v4 + TanStack Query + motion (framer-motion) + lenis; FastAPI + motor (MongoDB) + Pydantic v2.
- All API routes prefixed /api; frontend calls relative /api through the Vite proxy only.
- Secrets only in backend/.env (STRIPE_*, RESEND_API_KEY, SENDER_EMAIL, ADMIN_EMAILS, STAFF_PASSCODE, JWT_SECRET, TWILIO_*, EMERGENT_LLM_KEY). Never hardcode.
- Every interactive element has a data-testid (kebab-case, unique).
- Mobile-first responsive: 2-col product grids, 2-col gallery, hamburger nav, hero text over scrim, wrapping card footers, floating checkout bar.
- Accessibility: alt text on every image, aria-labels on icon buttons, aria-expanded on accordions, semantic HTML, visible focus.
- Smooth scrolling, SEO title/meta description, optimistic-consistent UI via TanStack invalidation.

## VERIFICATION CHECKLIST

1. `yarn typecheck` clean.
2. curl: /api/products (10 items with images+in_stock), place counter order (math correct), BLOOM5 discount, invalid promo 400, sold-out product 400, sold-out milk 400, track unknown order 404, staff login wrong passcode 401, loyalty redeem single-use enforced.
3. Browser (public URL, mobile 390px + desktop 1440px): hero reveal, add→drawer→checkout→confirmation, menu/gallery filters, FAQ accordion, admin stock toggle appears on menu, account settings save, install banner.
