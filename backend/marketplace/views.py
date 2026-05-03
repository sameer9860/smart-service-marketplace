from django.db import models, transaction
from django.db.models import Avg
from rest_framework import viewsets, permissions, exceptions, filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Service, Booking, Job, Bid, Review, Notification
from .serializers import (
    CategorySerializer, ServiceSerializer, BookingSerializer, 
    JobSerializer, BidSerializer, ReviewSerializer, NotificationSerializer
)
from .tasks import send_notification_task

class LenientJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        try:
            return super().authenticate(request)
        except Exception:
            return None

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = [] # Allow guest access without token validation

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.select_related('provider', 'category').annotate(
        avg_rating=Avg('reviews__rating')
    ).all()
    serializer_class = ServiceSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']
    authentication_classes = [LenientJWTAuthentication]

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

    def perform_create(self, serializer):
        booking = serializer.save()
        # Trigger Notification for Provider
        if booking.service:
            send_notification_task.delay(
                booking.service.provider.id,
                f"New booking received for {booking.service.title} from {booking.user.email}."
            )

    @action(detail=True, methods=['post'])
    def confirm_booking(self, request, pk=None):
        booking = self.get_object()
        if booking.service.provider != request.user:
            raise exceptions.PermissionDenied("You are not the provider of this service.")
        booking.status = 'confirmed'
        booking.save()
        return Response({'status': 'booking confirmed'})

    @action(detail=True, methods=['post'])
    def complete_booking(self, request, pk=None):
        booking = self.get_object()
        if booking.service.provider != request.user:
            raise exceptions.PermissionDenied("You are not the provider of this service.")
        booking.status = 'completed'
        booking.save()
        return Response({'status': 'booking completed'})

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
            
        bid = serializer.save()
        # Trigger Notification for Customer
        send_notification_task.delay(
            job.customer.id,
            f"New bid received on your job '{job.title}' from {bid.provider.email}."
        )

    def get_queryset(self):
        user = self.request.user
        return Bid.objects.filter(
            models.Q(provider=user) | models.Q(job__customer=user)
        ).select_related('job', 'provider')

    @action(detail=True, methods=['post'])
    def accept_bid(self, request, pk=None):
        bid = self.get_object()
        if bid.job.customer != request.user:
            raise exceptions.PermissionDenied("You are not the customer of this job.")
        if bid.job.status != 'open':
            raise exceptions.ValidationError("This job is no longer open for bidding.")

        with transaction.atomic():
            bid.status = 'accepted'
            bid.save()
            bid.job.bids.exclude(id=bid.id).update(status='rejected')
            bid.job.status = 'closed'
            bid.job.save()
            
            booking = Booking.objects.create(
                user=bid.job.customer,
                service=None,
                status='confirmed'
            )
            
            # Trigger Notification for winning Provider
            send_notification_task.delay(
                bid.provider.id,
                f"Your bid for '{bid.job.title}' has been accepted!"
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

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.select_related('user', 'service').all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        service = serializer.validated_data['service']
        
        has_completed_booking = Booking.objects.filter(
            user=user,
            service=service,
            status='completed'
        ).exists()
        
        if not has_completed_booking:
            raise exceptions.ValidationError("You can only review services you have successfully completed.")
            
        serializer.save()

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'notification marked as read'})
