from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from pymongo.errors import PyMongoError

from accounts.authentication import CsrfExemptSessionAuthentication

from .mongodb import get_messages_collection
from .message_utils import build_message_document, serialize_message


@method_decorator(csrf_exempt, name="dispatch")
class MessagesView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = (CsrfExemptSessionAuthentication,)

    def get(self, request, room_name):
        try:
            collection = get_messages_collection()
            docs = (
                collection.find({"room": room_name})
                .sort("created_at", 1)
                .limit(100)
            )
        except PyMongoError:
            return Response(
                {"detail": "Unable to read chat history. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response([serialize_message(d) for d in docs])

    # Optional: HTTP send; we mainly use WebSockets, so you may not call this from frontend
    def post(self, request, room_name):
        text = request.data.get("text", "").strip()
        if not text:
            return Response({"detail": "Text required"}, status=status.HTTP_400_BAD_REQUEST)

        doc = build_message_document(room_name, request.user.username, text)
        try:
            collection = get_messages_collection()
            result = collection.insert_one(doc)
            doc["_id"] = result.inserted_id
        except PyMongoError:
            return Response(
                {"detail": "Unable to save the message right now."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        serialized = serialize_message(doc)
        self._broadcast_message(room_name, serialized)

        return Response(serialized, status=status.HTTP_201_CREATED)

    def _broadcast_message(self, room_name, message):
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        async_to_sync(channel_layer.group_send)(
            f"chat_{room_name}",
            {
                "type": "chat.message",
                "message": message,
            },
        )
