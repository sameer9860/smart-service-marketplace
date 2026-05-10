from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ServiceViewSet, BookingViewSet, 
    JobViewSet, BidViewSet, ReviewViewSet, NotificationViewSet,
    ConversationViewSet, MessageViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'jobs', JobViewSet)
router.register(r'bids', BidViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
