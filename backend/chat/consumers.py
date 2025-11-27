import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from pymongo.errors import PyMongoError

from .mongodb import get_messages_collection
from .message_utils import build_message_document, serialize_message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name,
        )

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        text = data.get("text", "")
        sender = data.get("sender", "anonymous")
        if not text:
            return

        doc = build_message_document(self.room_name, sender, text.strip())
        try:
            message = await self._persist_message(doc)
        except PyMongoError:
            await self.send(
                text_data=json.dumps(
                    {"detail": "Database unavailable. Please retry in a moment."}
                )
            )
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message": message,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def _persist_message(self, doc):
        collection = get_messages_collection()

        def _insert():
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
            return serialize_message(doc)

        return await sync_to_async(_insert, thread_sensitive=False)()
