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

## Implemented (2026-09-05)
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
