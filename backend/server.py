import asyncio
import hmac
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
import resend
import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request
from pydantic import BaseModel, Field, EmailStr
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from lib.db import client, db, ensure_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    app.state.reminder_task = asyncio.create_task(gift_reminder_loop())
    yield
    app.state.reminder_task.cancel()
    client.close()


app = FastAPI(lifespan=lifespan)
api_router = APIRouter(prefix="/api")

PRODUCTS = [
    {"id": "lovely-latte", "name": "Lovely Latte", "description": "Classic latte with a little flower", "price": 5.50, "category": "coffee"},
    {"id": "bloom-cappuccino", "name": "Bloom Cappuccino", "description": "Cappuccino with a mini bouquet", "price": 5.00, "category": "coffee"},
    {"id": "pink-bloom-latte", "name": "Pink Bloom Latte", "description": "Iced latte with floral touch", "price": 5.80, "category": "coffee"},
    {"id": "flowers-cup", "name": "Flowers Cup", "description": "Seasonal fresh flowers in a cup", "price": 12.00, "category": "flowers"},
    {"id": "matcha-moment", "name": "Matcha Moment", "description": "Matcha latte with a mini bouquet", "price": 5.80, "category": "coffee"},
    {"id": "the-perfect-pair", "name": "The Perfect Pair", "description": "Your coffee and a cup of flowers", "price": 15.00, "category": "combo"},
    {"id": "caramel-bloom", "name": "Caramel Bloom", "description": "Iced caramel latte with a mini bouquet", "price": 5.80, "category": "coffee"},
    {"id": "blue-harmony", "name": "Blue Harmony", "description": "Seasonal fresh flowers in a cup", "price": 12.00, "category": "flowers"},
    {"id": "mocha-love", "name": "Mocha Love", "description": "Mocha with a mini bouquet", "price": 5.80, "category": "coffee"},
    {"id": "berry-blossom", "name": "Berry Blossom", "description": "Iced berry latte with a mini bouquet", "price": 5.80, "category": "seasonal"},
]
PRODUCT_MAP = {p["id"]: p for p in PRODUCTS}
PROMO_CODES = {"BLOOM5": 0.05}

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY") or os.environ.get("STRIPE_API_KEY") or "sk_test_emergent"
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
PROMO_COUPON_ID = "BLOOM5_OFF"

logger = logging.getLogger(__name__)


def ensure_tax_settings() -> None:
    try:
        settings = stripe.tax.Settings.retrieve()
        if settings.head_office and getattr(settings.head_office, "address", None):
            return
        stripe.tax.Settings.modify(
            head_office={"address": {"country": "GB", "line1": "Tower Bridge", "city": "London", "postal_code": "SE1 2UP"}},
            defaults={"tax_behavior": "exclusive"},
        )
    except stripe.error.StripeError as exc:
        logger.warning("tax settings not configured: %s", exc)


def ensure_promo_coupon() -> str | None:
    try:
        stripe.Coupon.retrieve(PROMO_COUPON_ID)
        return PROMO_COUPON_ID
    except stripe.error.InvalidRequestError:
        try:
            stripe.Coupon.create(id=PROMO_COUPON_ID, percent_off=5, duration="once", name="BLOOM5 — 5% off")
            return PROMO_COUPON_ID
        except stripe.error.StripeError as exc:
            logger.warning("coupon create failed: %s", exc)
            return None
    except stripe.error.StripeError as exc:
        logger.warning("coupon retrieve failed: %s", exc)
        return None


def build_receipt_html(order: "Order") -> str:
    rows = "".join(
        f"<tr><td style='padding:10px 0;border-bottom:1px solid #F3DDD7;color:#2C2422;font-size:14px;'>"
        f"{item.quantity}&times; {item.name}</td>"
        f"<td align='right' style='padding:10px 0;border-bottom:1px solid #F3DDD7;color:#2C2422;font-size:14px;'>"
        f"&pound;{item.unit_price * item.quantity:.2f}</td></tr>"
        for item in order.items
    )
    discount_row = (
        f"<tr><td style='padding:6px 0;color:#DFA4A5;font-size:13px;'>Discount ({order.promo_code})</td>"
        f"<td align='right' style='color:#DFA4A5;font-size:13px;'>&minus;&pound;{order.discount:.2f}</td></tr>"
        if order.discount else ""
    )
    payment_line = "Paid online &hearts;" if order.payment_status == "paid" else "Pay at the counter"
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7E9E4;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#FFF8F4;padding:40px;border:1px solid #F3DDD7;">
      <tr><td align="center" style="font-family:Georgia,serif;font-size:28px;letter-spacing:3px;color:#2C2422;">BLOOM &amp; BREW</td></tr>
      <tr><td align="center" style="padding-top:6px;font-size:11px;letter-spacing:3px;color:#6E5E5A;">COFFEE &hearts; FLOWERS &hearts; A HAPPIER YOU</td></tr>
      <tr><td align="center" style="padding:28px 0 8px;font-family:Georgia,serif;font-size:22px;color:#2C2422;">Thank you, {order.customer.name}!</td></tr>
      <tr><td align="center" style="font-size:14px;color:#6E5E5A;line-height:1.6;">
        Your order is in. Show this number at the counter &mdash;<br/>
        your coffee and flowers will be waiting by the bridge.</td></tr>
      <tr><td align="center" style="padding:22px 0;">
        <span style="display:inline-block;background:#E7B5B2;color:#2C2422;font-family:Georgia,serif;font-size:20px;letter-spacing:2px;padding:12px 28px;border-radius:999px;">{order.order_number}</span>
      </td></tr>
      <tr><td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          {rows}
          <tr><td style="padding:6px 0;color:#6E5E5A;font-size:13px;">Subtotal</td>
              <td align="right" style="color:#6E5E5A;font-size:13px;">&pound;{order.subtotal:.2f}</td></tr>
          {discount_row}
          <tr><td style="padding:12px 0 0;font-family:Georgia,serif;font-size:17px;color:#2C2422;">Total</td>
              <td align="right" style="padding:12px 0 0;font-family:Georgia,serif;font-size:17px;color:#2C2422;">&pound;{order.total:.2f}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding-top:18px;font-size:12px;color:#6E5E5A;line-height:1.7;">
        {payment_line}<br/>
        Pickup: Tower Bridge, London SE1 2UP<br/>
        Mon&ndash;Fri 8:00&ndash;14:00 &middot; Sat&ndash;Sun 9:00&ndash;16:00
      </td></tr>
      <tr><td align="center" style="padding-top:26px;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#DFA4A5;">
        Same coffee, more love &hearts;</td></tr>
    </table>
  </td></tr>
</table>"""


async def send_confirmation_email(order: "Order") -> None:
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set — skipping confirmation email for %s", order.order_number)
        return
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [order.customer.email],
            "subject": f"Your Bloom & Brew order {order.order_number}",
            "html": build_receipt_html(order),
        })
        await db.orders.update_one({"id": order.id}, {"$set": {"confirmation_sent": True}})
    except Exception as exc:
        logger.error("Failed to send confirmation email for %s: %s", order.order_number, exc)


class Customisation(BaseModel):
    coffee: str | None = None
    milk: str | None = None
    flowers: str | None = None
    flower_branch: bool = False
    gift_card: bool = False
    gift_note: str | None = None


class OrderItemIn(BaseModel):
    product_id: str
    quantity: int = Field(ge=1, le=20)
    customisation: Customisation = Field(default_factory=Customisation)


class Customer(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    pickup_time: str = "asap"


class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)
    customer: Customer
    promo_code: str | None = None
    payment_method: str = "counter"


class CheckoutCreate(OrderCreate):
    origin_url: str


class OrderItem(OrderItemIn):
    name: str
    unit_price: float


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    items: list[OrderItem]
    customer: Customer
    promo_code: str | None = None
    subtotal: float
    discount: float
    total: float
    status: str = "received"
    payment_method: str = "counter"
    payment_status: str = "pending"
    confirmation_sent: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TrackResponse(BaseModel):
    order: Order
    display_status: str
    minutes_elapsed: int


def build_order(payload: OrderCreate, payment_method: str) -> Order:
    items: list[OrderItem] = []
    subtotal = 0.0
    for item in payload.items:
        product = PRODUCT_MAP.get(item.product_id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Unknown product: {item.product_id}")
        unit_price = float(product["price"])
        subtotal += unit_price * item.quantity
        items.append(OrderItem(
            product_id=item.product_id,
            quantity=item.quantity,
            customisation=item.customisation,
            name=product["name"],
            unit_price=unit_price,
        ))

    promo = payload.promo_code.strip().upper() if payload.promo_code else None
    rate = PROMO_CODES.get(promo, 0.0) if promo else 0.0
    if promo and rate == 0.0:
        raise HTTPException(status_code=400, detail="Invalid promo code")

    discount = round(subtotal * rate, 2)
    return Order(
        order_number=f"BB-{uuid.uuid4().hex[:6].upper()}",
        items=items,
        customer=payload.customer,
        promo_code=promo if rate else None,
        subtotal=round(subtotal, 2),
        discount=discount,
        total=round(subtotal - discount, 2),
        payment_method=payment_method,
        payment_status="pending" if payment_method == "online" else "pay_at_counter",
    )


@api_router.get("/")
async def root():
    return {"message": "Bloom & Brew API"}


@api_router.get("/products")
async def get_products():
    return {"products": PRODUCTS}


@api_router.post("/orders", response_model=Order, status_code=201)
async def create_order(payload: OrderCreate):
    order = build_order(payload, payload.payment_method if payload.payment_method in ("counter", "online") else "counter")
    await db.orders.insert_one(order.model_dump())
    if order.payment_method == "counter":
        await send_confirmation_email(order)
    return order


@api_router.post("/orders/checkout", status_code=201)
async def create_order_checkout(payload: CheckoutCreate):
    order = build_order(payload, "online")
    await db.orders.insert_one(order.model_dump())

    line_items = [
        {
            "price_data": {
                "currency": "gbp",
                "unit_amount": int(round(item.unit_price * 100)),
                "product_data": {"name": item.name},
            },
            "quantity": item.quantity,
        }
        for item in order.items
    ]
    kwargs: dict = {
        "line_items": line_items,
        "mode": "payment",
        "success_url": f"{payload.origin_url}/order/success?session_id={{CHECKOUT_SESSION_ID}}&order={order.order_number}",
        "cancel_url": f"{payload.origin_url}/order?cancelled=1",
        "customer_email": payload.customer.email,
        "metadata": {"order_id": order.id, "order_number": order.order_number},
    }
    if order.promo_code:
        coupon = await asyncio.to_thread(ensure_promo_coupon)
        if coupon:
            kwargs["discounts"] = [{"coupon": coupon}]
    await asyncio.to_thread(ensure_tax_settings)
    try:
        session = await asyncio.to_thread(
            lambda: stripe.checkout.Session.create(
                **kwargs, automatic_tax={"enabled": True}, billing_address_collection="required"
            )
        )
    except stripe.error.InvalidRequestError as exc:
        logger.warning("automatic_tax unavailable, retrying without: %s", exc.user_message or exc)
        session = await asyncio.to_thread(lambda: stripe.checkout.Session.create(**kwargs))

    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "order_id": order.id,
        "order_number": order.order_number,
        "amount": int(round(order.total * 100)),
        "currency": "gbp",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    return {"checkout_url": session.url, "session_id": session.id, "order_number": order.order_number}


async def mark_order_paid(order_id: str, payment_intent: str | None) -> None:
    res = await db.orders.update_one(
        {"id": order_id, "payment_status": {"$ne": "paid"}},
        {"$set": {"payment_status": "paid", "stripe_payment_intent_id": payment_intent}},
    )
    if res.modified_count:
        doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if doc:
            await send_confirmation_email(Order(**doc))


@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    record = await db.payment_transactions.find_one({"session_id": session_id})
    if not record:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if record.get("payment_status") != "paid":
        try:
            session = await asyncio.to_thread(stripe.checkout.Session.retrieve, session_id)
            if session.payment_status == "paid" or session.status == "complete":
                await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {
                        "status": "completed",
                        "payment_status": "paid",
                        "stripe_payment_intent_id": session.payment_intent,
                        "updated_at": datetime.now(timezone.utc),
                    }},
                )
                if record.get("order_id"):
                    await mark_order_paid(record["order_id"], session.payment_intent)
                if record.get("gift_subscription_id"):
                    await mark_gift_active(record["gift_subscription_id"], getattr(session, "subscription", None))
                record = await db.payment_transactions.find_one({"session_id": session_id})
        except stripe.error.StripeError:
            pass
    return {"session_id": record["session_id"], "status": record["status"], "payment_status": record["payment_status"]}


@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    obj, event_type = event["data"]["object"], event["type"]
    metadata = obj.get("metadata") or {}
    if event_type == "checkout.session.completed":
        await db.payment_transactions.update_one(
            {"session_id": obj["id"], "payment_status": {"$ne": "paid"}},
            {"$set": {
                "status": "completed",
                "payment_status": obj.get("payment_status", "paid"),
                "stripe_payment_intent_id": obj.get("payment_intent"),
                "updated_at": datetime.now(timezone.utc),
            }},
        )
        if metadata.get("order_id"):
            await mark_order_paid(metadata["order_id"], obj.get("payment_intent"))
        if metadata.get("gift_subscription_id"):
            await mark_gift_active(metadata["gift_subscription_id"], obj.get("subscription"))
    elif event_type == "checkout.session.async_payment_succeeded":
        await db.payment_transactions.update_one({"session_id": obj["id"]}, {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc)}})
    elif event_type == "checkout.session.async_payment_failed":
        await db.payment_transactions.update_one({"session_id": obj["id"]}, {"$set": {"status": "failed", "payment_status": "failed", "updated_at": datetime.now(timezone.utc)}})
    elif event_type == "checkout.session.expired":
        await db.payment_transactions.update_one({"session_id": obj["id"]}, {"$set": {"status": "expired", "payment_status": "expired", "updated_at": datetime.now(timezone.utc)}})
    elif event_type == "charge.refunded":
        await db.payment_transactions.update_one({"stripe_payment_intent_id": obj.get("payment_intent")}, {"$set": {"status": "refunded", "payment_status": "refunded", "updated_at": datetime.now(timezone.utc)}})
    elif event_type == "customer.subscription.deleted":
        await db.gift_subscriptions.update_one({"stripe_subscription_id": obj.get("id")}, {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}})
    return {"status": "ok"}


def compute_display_status(doc: dict, order: Order) -> tuple[str, int]:
    created = datetime.fromisoformat(order.created_at)
    if created.tzinfo is None:
        created = created.replace(tzinfo=timezone.utc)
    elapsed = int((datetime.now(timezone.utc) - created).total_seconds() / 60)
    override = doc.get("status_override")
    if override in ("received", "preparing", "ready", "collected"):
        return override, elapsed
    if order.payment_method == "online" and order.payment_status != "paid":
        return "awaiting_payment", elapsed
    if elapsed < 3:
        return "received", elapsed
    if elapsed < 10:
        return "preparing", elapsed
    return "ready", elapsed


@api_router.get("/orders/track/{order_number}", response_model=TrackResponse)
async def track_order(order_number: str):
    doc = await db.orders.find_one({"order_number": order_number.strip().upper()}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="We can't find that order — double-check your number (it looks like BB-ABC123).")
    order = Order(**doc)
    display_status, elapsed = compute_display_status(doc, order)
    return TrackResponse(order=order, display_status=display_status, minutes_elapsed=elapsed)


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**doc)


# ---------- Staff (shared passcode, JWT token, brute-force lockout) ----------

STAFF_PASSCODE = os.environ.get("STAFF_PASSCODE", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
STAFF_TOKEN_HOURS = 12
LOCKOUT_THRESHOLD = 5
LOCKOUT_MINUTES = 15


class StaffLogin(BaseModel):
    passcode: str = Field(min_length=1, max_length=100)


class StaffStatusUpdate(BaseModel):
    status: str


class StaffOrderView(BaseModel):
    order: Order
    display_status: str
    minutes_elapsed: int


def require_staff(request: Request) -> None:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if decoded.get("type") != "staff":
            raise jwt.InvalidTokenError()
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(status_code=401, detail="Staff authentication required")


@api_router.post("/staff/login")
async def staff_login(payload: StaffLogin, request: Request):
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:staff"
    now = datetime.now(timezone.utc)
    record = await db.login_attempts.find_one({"identifier": identifier})
    if record and record.get("locked_until"):
        locked_until = record["locked_until"]
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        if now < locked_until:
            raise HTTPException(status_code=429, detail="Too many attempts — try again in a few minutes.")

    if not STAFF_PASSCODE or not hmac.compare_digest(payload.passcode, STAFF_PASSCODE):
        attempts = (record.get("attempts", 0) if record else 0) + 1
        update: dict = {"attempts": attempts, "last_attempt": now}
        if attempts >= LOCKOUT_THRESHOLD:
            update["locked_until"] = now + timedelta(minutes=LOCKOUT_MINUTES)
            update["attempts"] = 0
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Incorrect passcode")

    await db.login_attempts.delete_one({"identifier": identifier})
    token = jwt.encode({"type": "staff", "exp": now + timedelta(hours=STAFF_TOKEN_HOURS)}, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"token": token}


@api_router.get("/staff/orders")
async def staff_orders(request: Request):
    require_staff(request)
    cursor = db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(50)
    views: list[dict] = []
    async for doc in cursor:
        order = Order(**doc)
        display_status, elapsed = compute_display_status(doc, order)
        views.append(StaffOrderView(order=order, display_status=display_status, minutes_elapsed=elapsed).model_dump())
    return {"orders": views}


@api_router.post("/staff/orders/{order_number}/status")
async def staff_update_status(order_number: str, payload: StaffStatusUpdate, request: Request):
    require_staff(request)
    if payload.status not in ("received", "preparing", "ready", "collected"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.orders.update_one(
        {"order_number": order_number.strip().upper()},
        {"$set": {"status_override": payload.status, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if not res.matched_count:
        raise HTTPException(status_code=404, detail="Order not found")
    if payload.status == "ready":
        doc = await db.orders.find_one({"order_number": order_number.strip().upper()}, {"_id": 0})
        if doc and not doc.get("ready_email_sent"):
            await send_ready_email(Order(**doc))
    return {"ok": True, "status": payload.status}


# ---------- Gift subscriptions (weekly Stripe subscription) ----------


class GiftSubscriptionCreate(BaseModel):
    product_id: str
    flower_colour: str = "Seasonal"
    coffee: str | None = None
    milk: str | None = None
    recipient_name: str = Field(min_length=1, max_length=80)
    address_line1: str = Field(min_length=1, max_length=120)
    city: str = Field(min_length=1, max_length=60)
    postcode: str = Field(min_length=1, max_length=12)
    gift_note: str | None = None
    gifter_name: str = Field(min_length=1, max_length=80)
    gifter_email: EmailStr
    origin_url: str


def build_gift_email_html(sub: dict) -> str:
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7E9E4;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#FFF8F4;padding:40px;border:1px solid #F3DDD7;">
      <tr><td align="center" style="font-family:Georgia,serif;font-size:28px;letter-spacing:3px;color:#2C2422;">BLOOM &amp; BREW</td></tr>
      <tr><td align="center" style="padding-top:6px;font-size:11px;letter-spacing:3px;color:#6E5E5A;">COFFEE &hearts; FLOWERS &hearts; A HAPPIER YOU</td></tr>
      <tr><td align="center" style="padding:28px 0 8px;font-family:Georgia,serif;font-size:22px;color:#2C2422;">Thank you, {sub['gifter_name']}!</td></tr>
      <tr><td align="center" style="font-size:14px;color:#6E5E5A;line-height:1.7;">
        Your weekly gift of <strong>{sub['product_name']}</strong> is now blooming.<br/>
        Every week we'll hand-make it for <strong>{sub['recipient_name']}</strong> and deliver it to<br/>
        {sub['address_line1']}, {sub['city']}, {sub['postcode']} &mdash; with your note handwritten on the card.</td></tr>
      <tr><td align="center" style="padding:22px 0;">
        <span style="display:inline-block;background:#E7B5B2;color:#2C2422;font-family:Georgia,serif;font-size:18px;letter-spacing:2px;padding:12px 28px;border-radius:999px;">&pound;{sub['weekly_amount'] / 100:.2f} / week</span>
      </td></tr>
      <tr><td style="font-size:12px;color:#6E5E5A;line-height:1.7;">
        Pause or cancel anytime by replying to this email or writing to hello@bloomandbrew.london.</td></tr>
      <tr><td align="center" style="padding-top:26px;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#DFA4A5;">
        Same coffee, more love &hearts;</td></tr>
    </table>
  </td></tr>
</table>"""


async def send_gift_email(sub: dict) -> None:
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set — skipping gift email for %s", sub["id"])
        return
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [sub["gifter_email"]],
            "subject": "Your weekly Bloom & Brew gift is blooming",
            "html": build_gift_email_html(sub),
        })
        await db.gift_subscriptions.update_one({"id": sub["id"]}, {"$set": {"confirmation_sent": True}})
    except Exception as exc:
        logger.error("Failed to send gift email for %s: %s", sub["id"], exc)


async def mark_gift_active(gift_id: str, stripe_subscription_id: str | None) -> None:
    res = await db.gift_subscriptions.update_one(
        {"id": gift_id, "status": {"$ne": "active"}},
        {"$set": {"status": "active", "stripe_subscription_id": stripe_subscription_id, "activated_at": datetime.now(timezone.utc), "updated_at": datetime.now(timezone.utc)}},
    )
    if res.modified_count:
        sub = await db.gift_subscriptions.find_one({"id": gift_id}, {"_id": 0})
        if sub:
            await send_gift_email(sub)


@api_router.post("/gift-subscriptions/checkout", status_code=201)
async def create_gift_subscription(payload: GiftSubscriptionCreate):
    product = PRODUCT_MAP.get(payload.product_id)
    if not product:
        raise HTTPException(status_code=400, detail="Unknown product")

    sub_id = str(uuid.uuid4())
    weekly_amount = int(round(float(product["price"]) * 100))
    doc = {
        "id": sub_id,
        "product_id": payload.product_id,
        "product_name": product["name"],
        "weekly_amount": weekly_amount,
        "flower_colour": payload.flower_colour,
        "coffee": payload.coffee,
        "milk": payload.milk,
        "recipient_name": payload.recipient_name,
        "address_line1": payload.address_line1,
        "city": payload.city,
        "postcode": payload.postcode,
        "gift_note": payload.gift_note,
        "gifter_name": payload.gifter_name,
        "gifter_email": payload.gifter_email,
        "status": "pending",
        "stripe_subscription_id": None,
        "confirmation_sent": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    await db.gift_subscriptions.insert_one(doc)

    kwargs: dict = {
        "line_items": [{
            "price_data": {
                "currency": "gbp",
                "unit_amount": weekly_amount,
                "recurring": {"interval": "week"},
                "product_data": {"name": f"Weekly {product['name']} — Bloom & Brew gift"},
            },
            "quantity": 1,
        }],
        "mode": "subscription",
        "success_url": f"{payload.origin_url}/gift/success?session_id={{CHECKOUT_SESSION_ID}}",
        "cancel_url": f"{payload.origin_url}/gift?cancelled=1",
        "customer_email": payload.gifter_email,
        "metadata": {"gift_subscription_id": sub_id},
        "subscription_data": {"metadata": {"gift_subscription_id": sub_id}},
    }
    await asyncio.to_thread(ensure_tax_settings)
    try:
        session = await asyncio.to_thread(
            lambda: stripe.checkout.Session.create(
                **kwargs, automatic_tax={"enabled": True}, billing_address_collection="required"
            )
        )
    except stripe.error.InvalidRequestError as exc:
        logger.warning("automatic_tax unavailable for subscription, retrying without: %s", exc.user_message or exc)
        session = await asyncio.to_thread(lambda: stripe.checkout.Session.create(**kwargs))

    await db.gift_subscriptions.update_one({"id": sub_id}, {"$set": {"stripe_session_id": session.id}})
    await db.payment_transactions.insert_one({
        "session_id": session.id,
        "gift_subscription_id": sub_id,
        "amount": weekly_amount,
        "currency": "gbp",
        "status": "initiated",
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    return {"checkout_url": session.url, "session_id": session.id, "order_number": f"GIFT-{sub_id[:6].upper()}"}


# ---------- Ready alerts & weekly gift reminders ----------


def build_ready_email_html(order: Order) -> str:
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7E9E4;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#FFF8F4;padding:40px;border:1px solid #F3DDD7;">
      <tr><td align="center" style="font-family:Georgia,serif;font-size:28px;letter-spacing:3px;color:#2C2422;">BLOOM &amp; BREW</td></tr>
      <tr><td align="center" style="padding-top:6px;font-size:11px;letter-spacing:3px;color:#6E5E5A;">COFFEE &hearts; FLOWERS &hearts; A HAPPIER YOU</td></tr>
      <tr><td align="center" style="padding:28px 0 8px;font-family:Georgia,serif;font-size:22px;color:#2C2422;">It&apos;s ready, {order.customer.name}!</td></tr>
      <tr><td align="center" style="font-size:14px;color:#6E5E5A;line-height:1.7;">
        Your order is waiting at the counter &mdash; come and get it while it&apos;s warm.</td></tr>
      <tr><td align="center" style="padding:22px 0;">
        <span style="display:inline-block;background:#E7B5B2;color:#2C2422;font-family:Georgia,serif;font-size:20px;letter-spacing:2px;padding:12px 28px;border-radius:999px;">{order.order_number}</span>
      </td></tr>
      <tr><td align="center" style="font-size:12px;color:#6E5E5A;line-height:1.7;">
        Tower Bridge, London SE1 2UP</td></tr>
      <tr><td align="center" style="padding-top:26px;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#DFA4A5;">
        Same coffee, more love &hearts;</td></tr>
    </table>
  </td></tr>
</table>"""


async def send_ready_email(order: Order) -> None:
    if not RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set — skipping ready email for %s", order.order_number)
        return
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": SENDER_EMAIL,
            "to": [order.customer.email],
            "subject": f"Order {order.order_number} is ready — come and get it while it's warm",
            "html": build_ready_email_html(order),
        })
        await db.orders.update_one({"id": order.id}, {"$set": {"ready_email_sent": True}})
    except Exception as exc:
        logger.error("Failed to send ready email for %s: %s", order.order_number, exc)


def ordinal(n: int) -> str:
    if 10 <= n % 100 <= 20:
        return f"{n}th"
    return f"{n}{ {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th') }"


def build_gift_reminder_html(sub: dict, week: int) -> str:
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7E9E4;padding:40px 16px;">
  <tr><td align="center">
    <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#FFF8F4;padding:40px;border:1px solid #F3DDD7;">
      <tr><td align="center" style="font-family:Georgia,serif;font-size:28px;letter-spacing:3px;color:#2C2422;">BLOOM &amp; BREW</td></tr>
      <tr><td align="center" style="padding:28px 0 8px;font-family:Georgia,serif;font-size:22px;color:#2C2422;">Week {week} of blooms went out today</td></tr>
      <tr><td align="center" style="font-size:14px;color:#6E5E5A;line-height:1.7;">
        This morning we hand-made a fresh <strong>{sub['product_name']}</strong> for <strong>{sub['recipient_name']}</strong>,<br/>
        tied this week&apos;s {sub['flower_colour'].lower()} posy, and wrote your note on the card &mdash; again.</td></tr>
      <tr><td align="center" style="padding:22px 0;">
        <span style="display:inline-block;background:#E7B5B2;color:#2C2422;font-family:Georgia,serif;font-size:18px;letter-spacing:2px;padding:12px 28px;border-radius:999px;">the {ordinal(week)} week of brighter mornings</span>
      </td></tr>
      <tr><td align="center" style="font-size:12px;color:#6E5E5A;line-height:1.7;">
        Pause or cancel anytime by replying to this email.</td></tr>
      <tr><td align="center" style="padding-top:26px;font-family:Georgia,serif;font-style:italic;font-size:15px;color:#DFA4A5;">
        Same coffee, more love &hearts;</td></tr>
    </table>
  </td></tr>
</table>"""


async def send_gift_reminders() -> None:
    if not RESEND_API_KEY:
        return
    now = datetime.now(timezone.utc)
    cursor = db.gift_subscriptions.find({"status": "active", "activated_at": {"$exists": True}})
    async for sub in cursor:
        activated = sub["activated_at"]
        if activated.tzinfo is None:
            activated = activated.replace(tzinfo=timezone.utc)
        week = (now - activated).days // 7
        if week >= 1 and sub.get("last_reminder_week", 0) < week:
            try:
                await asyncio.to_thread(resend.Emails.send, {
                    "from": SENDER_EMAIL,
                    "to": [sub["gifter_email"]],
                    "subject": f"Week {week} of blooms went out today ♡",
                    "html": build_gift_reminder_html(sub, week),
                })
                await db.gift_subscriptions.update_one({"id": sub["id"]}, {"$set": {"last_reminder_week": week}})
                logger.info("Gift reminder week %s sent for subscription %s", week, sub["id"])
            except Exception as exc:
                logger.error("Failed to send gift reminder for %s: %s", sub["id"], exc)


async def gift_reminder_loop() -> None:
    while True:
        try:
            await send_gift_reminders()
        except Exception as exc:
            logger.error("Gift reminder loop error: %s", exc)
        await asyncio.sleep(3600)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
