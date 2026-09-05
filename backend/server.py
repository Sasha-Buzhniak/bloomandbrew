import asyncio
import logging
import os
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel, Field, EmailStr
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from lib.db import client, db, ensure_indexes


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    yield
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
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


@api_router.get("/")
async def root():
    return {"message": "Bloom & Brew API"}


@api_router.get("/products")
async def get_products():
    return {"products": PRODUCTS}


@api_router.post("/orders", response_model=Order, status_code=201)
async def create_order(payload: OrderCreate):
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
    order = Order(
        order_number=f"BB-{uuid.uuid4().hex[:6].upper()}",
        items=items,
        customer=payload.customer,
        promo_code=promo if rate else None,
        subtotal=round(subtotal, 2),
        discount=discount,
        total=round(subtotal - discount, 2),
    )
    await db.orders.insert_one(order.model_dump())
    return order


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    doc = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**doc)


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
