import os
from functools import lru_cache

from pymongo import MongoClient, ASCENDING

DEFAULT_URI = "mongodb://localhost:27017/"
DEFAULT_DB = "chat_app_db"
DEFAULT_COLLECTION = "messages"


def _create_client():
    uri = os.getenv("MONGODB_URI", DEFAULT_URI)
    timeout = int(os.getenv("MONGODB_TIMEOUT_MS", "5000"))
    return MongoClient(uri, serverSelectionTimeoutMS=timeout, tz_aware=True)


@lru_cache(maxsize=1)
def get_messages_collection():
    """
    Lazily create the Mongo collection and ensure indexes exist. Cached so that
    the same client/collection is reused across calls and requests.
    """
    client = _create_client()
    db_name = os.getenv("MONGODB_DB", DEFAULT_DB)
    collection_name = os.getenv("MONGODB_COLLECTION", DEFAULT_COLLECTION)
    collection = client[db_name][collection_name]
    collection.create_index([("room", ASCENDING), ("created_at", ASCENDING)])
    return collection


def ping_database():
    """Utility hook for health checks/tests."""
    collection = get_messages_collection()
    collection.database.client.admin.command("ping")
    return True
