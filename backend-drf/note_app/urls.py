from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from accounts.views import RegisterView, ProfileView

urlpatterns = [
    path("admin/", admin.site.urls),
    # ── Auth ──────────────────────────────────────────────────
    path("api/v1/register/",        RegisterView.as_view(),        name="register"),
    path("api/v1/token/",           TokenObtainPairView.as_view(), name="token_obtain"),
    path("api/v1/token/refresh/",   TokenRefreshView.as_view(),    name="token_refresh"),
    path("api/v1/token/blacklist/", TokenBlacklistView.as_view(),  name="token_blacklist"),
    # ── Profile ───────────────────────────────────────────────
    path("api/v1/profile/",         ProfileView.as_view(),         name="profile"),
    # ── Notes ─────────────────────────────────────────────────
    path("api/v1/", include("api.urls")),
]
