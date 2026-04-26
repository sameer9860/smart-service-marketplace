from rest_framework import serializers
from .models import Category, Service, Booking, Job, Bid

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

class JobSerializer(serializers.ModelSerializer):
    customer_email = serializers.ReadOnlyField(source='customer.email')

    class Meta:
        model = Job
        fields = ['id', 'customer', 'customer_email', 'title', 'description', 'budget', 'status', 'created_at']
        read_only_fields = ['customer', 'status', 'created_at']

    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)

class BidSerializer(serializers.ModelSerializer):
    provider_email = serializers.ReadOnlyField(source='provider.email')
    job_title = serializers.ReadOnlyField(source='job.title')

    class Meta:
        model = Bid
        fields = ['id', 'job', 'job_title', 'provider', 'provider_email', 'amount', 'message', 'status', 'created_at']
        read_only_fields = ['provider', 'status', 'created_at']

    def create(self, validated_data):
        validated_data['provider'] = self.context['request'].user
        return super().create(validated_data)
