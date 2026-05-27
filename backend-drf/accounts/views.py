from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, ProfileSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveUpdateAPIView):
    """GET  /api/v1/profile/  →  return the logged-in user's profile
       PATCH /api/v1/profile/  →  update username / email / name / password"""
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    # Use PATCH so the frontend only needs to send the fields it changed
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        # Always return the currently authenticated user
        return self.request.user
