from django.db import models, transaction
from django.db.models import Avg
from rest_framework import viewsets, permissions, exceptions, filters
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, Service, Booking, Job, Bid, Review, Notification, Conversation, Message, Payment
from .serializers import (
    CategorySerializer, ServiceSerializer, ServiceListSerializer, BookingSerializer, 
    JobSerializer, JobListSerializer, BidSerializer, ReviewSerializer, NotificationSerializer,
    MessageSerializer, ConversationSerializer, PaymentSerializer
)
from .permissions import IsOwnerOrReadOnly, IsCustomer, IsProvider
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
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'provider__email', 'category__name']
    ordering_fields = ['price', 'created_at', 'avg_rating']
    ordering = ['-created_at']
    authentication_classes = [LenientJWTAuthentication]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsProvider()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceListSerializer
        return ServiceSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        # Optimization: only fetch fields needed for list/detail
        if self.action == 'list':
            queryset = queryset.only(
                'id', 'provider__email', 'category__name', 
                'title', 'price', 'created_at'
            )
            
        category = self.request.query_params.get('category')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')

        if category:
            queryset = queryset.filter(category=category)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
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
        # Auto-create conversation
        conversation = Conversation.objects.create(booking=booking)
        conversation.participants.add(self.request.user, booking.service.provider)
        
        # Trigger Notification for Provider
        if booking.service:
            # Create Payment record
            Payment.objects.create(
                booking=booking,
                amount=booking.service.price,
                status='pending',
                transaction_id=f"PENDING-{uuid.uuid4().hex[:8].upper()}"
            )

            # In-app notification
            Notification.objects.create(
                user=booking.service.provider,
                message=f"New booking received for {booking.service.title} from {booking.user.email}."
            )
            # Background task (Email/Push)
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
        
        # Notify Customer
        Notification.objects.create(
            user=booking.user,
            message=f"Your booking for '{booking.service.title}' has been confirmed by the provider."
        )
        return Response({'status': 'booking confirmed'})

    @action(detail=True, methods=['post'])
    def complete_booking(self, request, pk=None):
        booking = self.get_object()
        if booking.service.provider != request.user:
            raise exceptions.PermissionDenied("You are not the provider of this service.")
        booking.status = 'completed'
        booking.save()

        # Notify Customer
        Notification.objects.create(
            user=booking.user,
            message=f"Service '{booking.service.title}' has been marked as completed. Please leave a review!"
        )
        return Response({'status': 'booking completed'})

    @action(detail=True, methods=['post'])
    def cancel_booking(self, request, pk=None):
        booking = self.get_object()
        # Only the customer who made the booking can cancel it
        if booking.user != request.user:
            raise exceptions.PermissionDenied("You do not have permission to cancel this booking.")
        
        if booking.status != 'pending':
            raise exceptions.ValidationError("Only pending bookings can be cancelled.")
            
        booking.status = 'cancelled'
        booking.save()

        # Notify Provider
        if booking.service:
            Notification.objects.create(
                user=booking.service.provider,
                message=f"The booking for '{booking.service.title}' has been cancelled by the customer."
            )
        return Response({'status': 'booking cancelled'})

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related('customer').all()
    serializer_class = JobSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'customer__email']
    ordering_fields = ['budget', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCustomer()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

    def get_serializer_class(self):
        if self.action == 'list':
            return JobListSerializer
        return JobSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == 'list':
            queryset = queryset.prefetch_related('bids').only(
                'id', 'customer__email', 'title', 'budget', 'status', 'created_at'
            )
        else:
            queryset = queryset.prefetch_related('bids')
            
        min_budget = self.request.query_params.get('min_budget')
        max_budget = self.request.query_params.get('max_budget')
        category = self.request.query_params.get('category')

        if min_budget:
            queryset = queryset.filter(budget__gte=min_budget)
        if max_budget:
            queryset = queryset.filter(budget__lte=max_budget)
        if category:
            queryset = queryset.filter(category=category)
            
        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != 'customer':
            raise exceptions.PermissionDenied("Only customers can post jobs.")
        serializer.save()

class BidViewSet(viewsets.ModelViewSet):
    queryset = Bid.objects.select_related('job', 'provider').all()
    serializer_class = BidSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsProvider()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]

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

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        conversation = serializer.validated_data['conversation']
        if self.request.user not in conversation.participants.all():
            raise exceptions.PermissionDenied("You are not a participant in this conversation.")
        
        serializer.save(sender=self.request.user)
        # Update conversation timestamp
        conversation.save() 

import time
import uuid

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(booking__user=self.request.user)

    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        payment = self.get_object()
        
        if payment.status == 'completed':
            return Response({"error": "Payment already completed"}, status=400)
        
        # Simulate payment gateway processing delay
        time.sleep(2)
        
        # Atomically update payment and booking status
        with transaction.atomic():
            payment.status = 'completed'
            payment.transaction_id = f"MOCK-TXN-{uuid.uuid4().hex[:12].upper()}"
            payment.save()
            
            booking = payment.booking
            booking.status = 'confirmed' # Move from pending/approved to confirmed
            booking.save()
            
            # Notify Provider
            Notification.objects.create(
                user=booking.service.provider,
                message=f"Payment received for {booking.service.title}. Booking is now confirmed!"
            )

        return Response({
            "message": "Payment processed successfully",
            "transaction_id": payment.transaction_id,
            "status": payment.status
        })
