from rest_framework import serializers
from .models import Category, Service, Booking

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    # Optional: include read-only category name or provider email
    category_name = serializers.ReadOnlyField(source='category.name')
    provider_email = serializers.ReadOnlyField(source='provider.email')

    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'provider_email', 'category', 'category_name', 
            'title', 'description', 'price', 'created_at'
        ]
        read_only_fields = ['provider', 'created_at']

    def create(self, validated_data):
        # Automatically set provider to current user
        validated_data['provider'] = self.context['request'].user
        return super().create(validated_data)

class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    service_title = serializers.ReadOnlyField(source='service.title')

    class Meta:
        model = Booking
        fields = ['id', 'user', 'user_email', 'service', 'service_title', 'status', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']

    def create(self, validated_data):
        # Automatically set user to current logged-in user
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
