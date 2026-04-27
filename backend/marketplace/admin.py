from django.contrib import admin
from .models import Category, Service, Booking, Bid, Review, Notification    

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'provider', 'category', 'price', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('title', 'description')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'service', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'service__title')

@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'provider', 'amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('job__title', 'provider__email')    

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'service', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__email', 'service__title')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'message', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('user__email', 'message')    
