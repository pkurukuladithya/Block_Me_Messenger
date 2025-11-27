from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

api_patterns = [
    path("accounts/", include("accounts.urls")),
    path("chat/", include("chat.urls")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_patterns, "api"))),
    # Provide direct fallbacks so /accounts/... keeps working for existing clients.
    path("accounts/", include("accounts.urls")),
    path("chat/", include("chat.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
