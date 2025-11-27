from django.urls import path
from .views import (
    LoginView,
    LogoutView,
    MeView,
    ProfileView,
    RegisterView,
    UserListView,
)

urlpatterns = [
    path("register/", RegisterView.as_view()),
    path("login/", LoginView.as_view()),
    path("logout/", LogoutView.as_view()),
    path("me/", MeView.as_view()),
    path("profile/", ProfileView.as_view()),
    path("users/", UserListView.as_view()),
]
