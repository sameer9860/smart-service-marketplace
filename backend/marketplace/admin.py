from django.contrib import admin
from .models import Category, Service, Booking

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
