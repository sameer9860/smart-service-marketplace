from django.db import models
from rest_framework import viewsets, permissions
from .models import Category, Service, Booking
from .serializers import CategorySerializer, ServiceSerializer, BookingSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.select_related('provider', 'category').all()
    serializer_class = ServiceSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.select_related('user', 'service').all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users only see their own bookings
        # Providers only see bookings for their services
        user = self.request.user
        return Booking.objects.filter(
            models.Q(user=user) | models.Q(service__provider=user)
        ).select_related('user', 'service').distinct()
