from django.urls import path
from .views import MessagesView

urlpatterns = [
    path("messages/<str:room_name>/", MessagesView.as_view()),
]
