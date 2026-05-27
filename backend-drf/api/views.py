from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Note
from .serializers import NoteSerializer


class NoteListCreate(generics.ListCreateAPIView):
    """GET /api/v1/notes/  →  list current user's notes
       POST /api/v1/notes/ →  create a new note"""
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NoteRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    """GET    /api/v1/notes/<id>/  →  get one note
       PATCH  /api/v1/notes/<id>/  →  edit a note
       DELETE /api/v1/notes/<id>/  →  delete a note"""
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only touch their own notes
        return Note.objects.filter(author=self.request.user)
