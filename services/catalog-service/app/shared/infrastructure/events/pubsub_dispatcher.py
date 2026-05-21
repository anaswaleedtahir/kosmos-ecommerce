from app.shared.infrastructure.events.pubsub_publisher import publish_event


class PostCommitPubSubDispatcher:
    """Publishes domain events to GCP Pub/Sub after the business commit."""

    async def dispatch(self, events: list) -> None:
        for event in events:
            await publish_event(event.event_type, event.to_pubsub_payload())
