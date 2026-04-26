from django.db import models, transaction
from rest_framework import viewsets, permissions, exceptions
from rest_framework.decorators import action
from rest_framework.response import Response
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
        user = self.request.user
        return Bid.objects.filter(
            models.Q(provider=user) | models.Q(job__customer=user)
        ).select_related('job', 'provider')

    @action(detail=True, methods=['post'])
    def accept_bid(self, request, pk=None):
        bid = self.get_object()
        
        # Only job customer can accept bids
        if bid.job.customer != request.user:
            raise exceptions.PermissionDenied("You are not the customer of this job.")
        
        if bid.job.status != 'open':
            raise exceptions.ValidationError("This job is no longer open for bidding.")

        with transaction.atomic():
            # Accept this bid
            bid.status = 'accepted'
            bid.save()
            
            # Reject all other bids for this job
            bid.job.bids.exclude(id=bid.id).update(status='rejected')
            
            # Close the job
            bid.job.status = 'closed'
            bid.job.save()
            
            # Create a booking
            Booking.objects.create(
                user=bid.job.customer,
                service=None,  # Or logic to link to a generic service if needed
                status='confirmed'
            )
            
        return Response({'status': 'bid accepted and booking created'})

    @action(detail=True, methods=['post'])
    def reject_bid(self, request, pk=None):
        bid = self.get_object()
        
        if bid.job.customer != request.user:
            raise exceptions.PermissionDenied("You are not the customer of this job.")
            
        bid.status = 'rejected'
        bid.save()
        return Response({'status': 'bid rejected'})
