from datetime import datetime, timezone


def build_message_document(room, sender, text):
    return {
        "room": room,
        "sender": sender,
        "text": text,
        "created_at": datetime.now(timezone.utc),
    }


def serialize_message(doc):
    created_at = doc.get("created_at")
    if created_at is None:
        created_iso = ""
    else:
        if getattr(created_at, "tzinfo", None) is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        created_iso = created_at.astimezone(timezone.utc).isoformat()

    document_id = doc.get("_id")
    return {
        "id": str(document_id) if document_id is not None else None,
        "room": doc.get("room"),
        "sender": doc.get("sender"),
        "text": doc.get("text", ""),
        "created_at": created_iso,
    }
