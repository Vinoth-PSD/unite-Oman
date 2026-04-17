"""
Simple in-memory TTL cache — no Redis required.
Usage:
    from core.cache import ttl_cache
    cached = ttl_cache.get("key")
    ttl_cache.set("key", value, ttl=300)
    ttl_cache.delete("key")
"""
import time
from typing import Any, Optional


class TTLCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if time.monotonic() > expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        self._store[key] = (value, time.monotonic() + ttl)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()


# Singleton — import this everywhere
ttl_cache = TTLCache()
