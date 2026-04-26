from django.db import models
from rest_framework import viewsets, permissions, exceptions
from .models import Category, Service, Booking, Job, Bid
from .serializers import (
    CategorySerializer, ServiceSerializer, BookingSerializer, 
    JobSerializer, BidSerializer
)

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
        user = self.request.user
        return Booking.objects.filter(
            models.Q(user=user) | models.Q(service__provider=user)
        ).select_related('user', 'service').distinct()

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related('customer').all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'customer':
            raise exceptions.PermissionDenied("Only customers can post jobs.")
        serializer.save()

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.select_related('job', 'provider').all()
    serializer_class = BidSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role != 'provider':
            raise exceptions.PermissionDenied("Only providers can bid on jobs.")
        
        job = serializer.validated_data['job']
        if Bid.objects.filter(job=job, provider=self.request.user).exists():
            raise exceptions.ValidationError("You have already bid on this job.")
            
        serializer.save()

    def get_queryset(self):
        # Customers see bids for their jobs
        # Providers see their own bids
        user = self.request.user
        return Bid.objects.filter(
            models.Q(provider=user) | models.Q(job__customer=user)
        ).select_related('job', 'provider')
