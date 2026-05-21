import uuid
from dataclasses import dataclass
from datetime import datetime

from shared.actor import ActorContext


@dataclass
class InventoryResult:
    id: uuid.UUID
    variant_id: uuid.UUID
    quantity_on_hand: int
    quantity_reserved: int
    available: int
    updated_at: datetime | None = None


@dataclass
class RestockInput:
    variant_id: uuid.UUID
    quantity: int
    actor: ActorContext


@dataclass
class ReserveStockInput:
    variant_id: uuid.UUID
    quantity: int
    actor: ActorContext


@dataclass
class ReleaseReservationInput:
    variant_id: uuid.UUID
    quantity: int
    actor: ActorContext
