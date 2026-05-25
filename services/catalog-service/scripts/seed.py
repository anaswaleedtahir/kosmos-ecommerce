import asyncio
import logging
import sys
import uuid
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import selectinload

# Add the service root to Python path to enable 'app' imports.
service_root = Path(__file__).resolve().parent.parent
if str(service_root) not in sys.path:
    sys.path.insert(0, str(service_root))

from app.catalog.domain.entities.product import ProductStatus  # noqa: E402
from app.catalog.infrastructure.orm.category import Category  # noqa: E402
from app.catalog.infrastructure.orm.product import Product, ProductVariant  # noqa: E402
from app.inventory.infrastructure.orm.inventory import Inventory  # noqa: E402
from app.shared.infrastructure.db.session import async_session_factory  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SEED_ACTOR_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")

SEED_DATA = {
    "categories": [
        {"name": "Fragrance", "slug": "fragrance"},
        {"name": "Skin", "slug": "skin"},
        {"name": "Lipstick", "slug": "lipstick"},
    ],
    "products": [
        {
            "name": "Noir, Undone",
            "slug": "noir-undone",
            "category_slug": "fragrance",
            "description": (
                "An eau de parfum built around cold smoke, amber resin, and a"
                " mineral cedar trail."
            ),
            "storefront_metadata": {
                "image_url": "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1600&q=80",
                "image_url_2": "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=80",
                "image_url_3": "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1600&q=80",
                "cat": "fragrance",
                "no": "No. 04",
                "tagline": "Cold air, white smoke, amber at the wrist.",
                "italic": "undone.",
                "family": "Amber / Leather",
                "composer": "H. Vasseur",
                "variant_label": "Size",
                "variants_are_shades": False,
                "notes": {
                    "Top": "Juniper, bergamot",
                    "Heart": "Orris, black tea",
                    "Base": "Amber, cade smoke, cedar",
                },
            },
            "variants": [
                {
                    "sku": "KOS-FR-NOIR-50",
                    "price": 98.0,
                    "attributes": {"label": "50 ml", "is_default": True},
                    "inventory": {"quantity_on_hand": 8, "quantity_reserved": 1},
                },
                {
                    "sku": "KOS-FR-NOIR-100",
                    "price": 148.0,
                    "attributes": {"label": "100 ml", "is_default": False},
                    "inventory": {"quantity_on_hand": 4, "quantity_reserved": 0},
                },
            ],
        },
        {
            "name": "Velours, Minuit",
            "slug": "velours-minuit",
            "category_slug": "fragrance",
            "description": (
                "A softer floral built on powder, iris butter, and warm suede."
            ),
            "storefront_metadata": {
                "image_url": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=80",
                "image_url_2": "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80",
                "cat": "fragrance",
                "no": "No. 07",
                "tagline": "Powdered iris and suede after midnight.",
                "family": "Floral / Powder",
                "composer": "L. Garnier",
                "variant_label": "Size",
                "variants_are_shades": False,
                "notes": {
                    "Top": "Aldehydes, pink pepper",
                    "Heart": "Iris, violet, rose stem",
                    "Base": "Suede, musk, tonka",
                },
            },
            "variants": [
                {
                    "sku": "KOS-FR-VELOURS-50",
                    "price": 105.0,
                    "attributes": {"label": "50 ml", "is_default": True},
                    "inventory": {"quantity_on_hand": 6, "quantity_reserved": 0},
                }
            ],
        },
        {
            "name": "Huile Visage",
            "slug": "huile-visage",
            "category_slug": "skin",
            "description": (
                "A nightly facial oil with camellia, squalane, and blue tansy."
            ),
            "storefront_metadata": {
                "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1600&q=80",
                "image_url_2": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1600&q=80",
                "cat": "skin",
                "no": "S-01",
                "tagline": "Night repair with a dry, quiet finish.",
                "family": "Face / Night",
                "variant_label": "Size",
                "variants_are_shades": False,
                "notes": {
                    "Texture": "Silk oil",
                    "Finish": "Dry glow",
                    "Use": "2-3 drops at night",
                },
            },
            "variants": [
                {
                    "sku": "KOS-SK-HUILE-30",
                    "price": 72.0,
                    "attributes": {"label": "30 ml", "is_default": True},
                    "inventory": {"quantity_on_hand": 12, "quantity_reserved": 2},
                }
            ],
        },
        {
            "name": "Creme Mains",
            "slug": "creme-mains",
            "category_slug": "skin",
            "description": (
                "A dense hand cream with cedar water and oat lipid for daily use."
            ),
            "storefront_metadata": {
                "image_url": "https://images.unsplash.com/photo-1619451334792-150fd785ee74?auto=format&fit=crop&w=1600&q=80",
                "cat": "skin",
                "no": "S-04",
                "tagline": "Hands restored without gloss or residue.",
                "family": "Hands / Daily",
                "variant_label": "Format",
                "variants_are_shades": False,
                "notes": {
                    "Texture": "Dense cream",
                    "Finish": "Soft matte",
                    "Use": "Anytime hands need recovery",
                },
            },
            "variants": [
                {
                    "sku": "KOS-SK-MAINS-75",
                    "price": 34.0,
                    "attributes": {"label": "75 ml", "is_default": True},
                    "inventory": {"quantity_on_hand": 18, "quantity_reserved": 1},
                }
            ],
        },
        {
            "name": "Rouge Mat",
            "slug": "rouge-mat",
            "category_slug": "lipstick",
            "description": (
                "A flat, velvety lipstick developed as pure color without shimmer."
            ),
            "storefront_metadata": {
                "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1600&q=80",
                "image_url_2": "https://images.unsplash.com/photo-1631214540553-ff044a3ff1d4?auto=format&fit=crop&w=1600&q=80",
                "cat": "lipstick",
                "no": "L-02",
                "tagline": "Velvet pigment named after rooms you cannot enter.",
                "family": "Matte / Long wear",
                "variant_label": "Shade",
                "variants_are_shades": True,
                "notes": {
                    "Finish": "Matte velvet",
                    "Wear": "Long wear",
                    "Origin": "Poured in Paris",
                },
            },
            "variants": [
                {
                    "sku": "KOS-LI-ROUGE-SALON",
                    "price": 42.0,
                    "attributes": {
                        "label": "Salon",
                        "swatch": "#8F2E3A",
                        "is_default": True,
                    },
                    "inventory": {"quantity_on_hand": 9, "quantity_reserved": 1},
                },
                {
                    "sku": "KOS-LI-ROUGE-ATELIER",
                    "price": 42.0,
                    "attributes": {
                        "label": "Atelier",
                        "swatch": "#A13E4D",
                        "is_default": False,
                    },
                    "inventory": {"quantity_on_hand": 5, "quantity_reserved": 0},
                },
                {
                    "sku": "KOS-LI-ROUGE-VERANDA",
                    "price": 42.0,
                    "attributes": {
                        "label": "Veranda",
                        "swatch": "#BE6A72",
                        "is_default": False,
                    },
                    "inventory": {"quantity_on_hand": 0, "quantity_reserved": 0},
                },
            ],
        },
        {
            "name": "Baume Teinte",
            "slug": "baume-teinte",
            "category_slug": "lipstick",
            "description": "A sheer balm with a washed tint and a conditioned finish.",
            "storefront_metadata": {
                "image_url": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80",
                "cat": "lipstick",
                "no": "L-05",
                "tagline": "Tinted balm for the color of having just arrived.",
                "family": "Balm / Tinted",
                "variant_label": "Shade",
                "variants_are_shades": True,
                "notes": {
                    "Finish": "Sheer satin",
                    "Wear": "Comfort balm",
                    "Use": "Apply without mirror",
                },
            },
            "variants": [
                {
                    "sku": "KOS-LI-BAUME-ROSE",
                    "price": 29.0,
                    "attributes": {
                        "label": "Rose",
                        "swatch": "#C97B84",
                        "is_default": True,
                    },
                    "inventory": {"quantity_on_hand": 14, "quantity_reserved": 0},
                },
                {
                    "sku": "KOS-LI-BAUME-NUDE",
                    "price": 29.0,
                    "attributes": {
                        "label": "Nude",
                        "swatch": "#B07C74",
                        "is_default": False,
                    },
                    "inventory": {"quantity_on_hand": 11, "quantity_reserved": 0},
                },
            ],
        },
    ],
}


async def get_or_create_category(
    db, *, name: str, slug: str, parent_id: uuid.UUID | None = None
) -> Category:
    result = await db.execute(select(Category).where(Category.slug == slug))
    category = result.scalar_one_or_none()

    if category is None:
        category = Category(name=name, slug=slug, parent_id=parent_id)
        db.add(category)
        await db.flush()
        logger.info("Created category %s", slug)
    else:
        category.name = name
        category.parent_id = parent_id
        logger.info("Updated category %s", slug)

    return category


async def get_or_create_product(
    db,
    *,
    category_id: uuid.UUID,
    name: str,
    slug: str,
    description: str | None,
    storefront_metadata: dict,
) -> Product:
    result = await db.execute(
        select(Product)
        .where(Product.slug == slug)
        .options(selectinload(Product.variants))
    )
    product = result.scalar_one_or_none()

    if product is None:
        product = Product(
            name=name,
            slug=slug,
            description=description,
            category_id=category_id,
            created_by=SEED_ACTOR_ID,
            status=ProductStatus.ACTIVE,
            storefront_metadata=storefront_metadata,
        )
        db.add(product)
        await db.flush()
        logger.info("Created product %s", slug)
    else:
        product.name = name
        product.description = description
        product.category_id = category_id
        product.created_by = SEED_ACTOR_ID
        product.status = ProductStatus.ACTIVE
        product.storefront_metadata = storefront_metadata
        logger.info("Updated product %s", slug)

    return product


async def get_or_create_variant(
    db,
    *,
    product_id: uuid.UUID,
    sku: str,
    price: float,
    attributes: dict,
    is_active: bool = True,
) -> ProductVariant:
    result = await db.execute(select(ProductVariant).where(ProductVariant.sku == sku))
    variant = result.scalar_one_or_none()

    if variant is None:
        variant = ProductVariant(
            product_id=product_id,
            sku=sku,
            price=price,
            attributes=attributes,
            is_active=is_active,
        )
        db.add(variant)
        await db.flush()
        logger.info("Created variant %s", sku)
    else:
        variant.product_id = product_id
        variant.price = price
        variant.attributes = attributes
        variant.is_active = is_active
        logger.info("Updated variant %s", sku)

    return variant


async def get_or_create_inventory(
    db,
    *,
    variant_id: uuid.UUID,
    quantity_on_hand: int,
    quantity_reserved: int,
) -> Inventory:
    result = await db.execute(
        select(Inventory).where(Inventory.variant_id == variant_id)
    )
    inventory = result.scalar_one_or_none()

    if inventory is None:
        inventory = Inventory(
            variant_id=variant_id,
            quantity_on_hand=quantity_on_hand,
            quantity_reserved=quantity_reserved,
        )
        db.add(inventory)
        await db.flush()
        logger.info("Created inventory for variant %s", variant_id)
    else:
        inventory.quantity_on_hand = quantity_on_hand
        inventory.quantity_reserved = quantity_reserved
        logger.info("Updated inventory for variant %s", variant_id)

    return inventory


async def seed(db) -> None:
    categories_by_slug: dict[str, Category] = {}
    for category_data in SEED_DATA["categories"]:
        category = await get_or_create_category(db, **category_data)
        categories_by_slug[category.slug] = category

    for product_data in SEED_DATA["products"]:
        category = categories_by_slug[product_data["category_slug"]]
        product = await get_or_create_product(
            db,
            category_id=category.id,
            name=product_data["name"],
            slug=product_data["slug"],
            description=product_data["description"],
            storefront_metadata=product_data["storefront_metadata"],
        )

        for variant_data in product_data["variants"]:
            variant = await get_or_create_variant(
                db,
                product_id=product.id,
                sku=variant_data["sku"],
                price=variant_data["price"],
                attributes=variant_data["attributes"],
                is_active=True,
            )
            await get_or_create_inventory(
                db,
                variant_id=variant.id,
                quantity_on_hand=variant_data["inventory"]["quantity_on_hand"],
                quantity_reserved=variant_data["inventory"]["quantity_reserved"],
            )

    await db.commit()
    logger.info("Catalog seed completed successfully")


async def main() -> None:
    async with async_session_factory() as db:
        try:
            await seed(db)
        except Exception:
            await db.rollback()
            logger.exception("Catalog seed failed")
            raise


if __name__ == "__main__":
    asyncio.run(main())
