import uuid
from typing import Protocol

from app.inventory.domain.entities.inventory import Inventory


class InventoryRepository(Protocol):
    async def find_by_variant_id(self, variant_id: uuid.UUID) -> Inventory | None: ...

    async def find_by_variant_ids(
        self, variant_ids: list[uuid.UUID]
    ) -> list[Inventory]: ...

    async def add(self, *, variant_id: uuid.UUID) -> Inventory: ...

    async def save(self, inventory: Inventory) -> None: ...
