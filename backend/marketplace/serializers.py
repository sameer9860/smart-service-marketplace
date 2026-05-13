from rest_framework import serializers
from .models import Category, Service, Booking, Job, Bid, Review, Notification, Conversation, Message, Payment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    provider_email = serializers.ReadOnlyField(source='provider.email')
    avg_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'provider', 'provider_email', 'category', 'category_name', 
            'title', 'description', 'price', 'image', 'created_at', 'avg_rating'
        ]
        read_only_fields = ['provider', 'created_at', 'avg_rating']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
        
class ServiceListSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    provider_email = serializers.ReadOnlyField(source='provider.email')
    avg_rating = serializers.FloatField(read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'provider_email', 'category_name', 
            'title', 'price', 'image', 'created_at', 'avg_rating'
        ]

    def create(self, validated_data):
        # Automatically set provider to current user
        validated_data['provider'] = self.context['request'].user
        return super().create(validated_data)

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'booking', 'amount', 'status', 'transaction_id', 'created_at', 'updated_at']
        read_only_fields = ['transaction_id', 'status']

class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')
    service_details = ServiceListSerializer(source='service', read_only=True)
    provider_details = serializers.SerializerMethodField()
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user', 'user_email', 'service', 'service_details', 'provider_details', 'status', 'payment', 'created_at']
        read_only_fields = ['user', 'status', 'created_at']

    def get_provider_details(self, obj):
        provider = obj.service.provider
        return {
            'id': provider.id,
            'email': provider.email,
            'full_name': getattr(provider, 'full_name', ''),
        }

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

    def validate_budget(self, value):
        if value <= 0:
            raise serializers.ValidationError("Budget must be greater than zero.")
        return value

class JobListSerializer(serializers.ModelSerializer):
    customer_email = serializers.ReadOnlyField(source='customer.email')
    bids_count = serializers.IntegerField(source='bids.count', read_only=True)

    class Meta:
        model = Job
        fields = ['id', 'customer_email', 'title', 'budget', 'status', 'created_at', 'bids_count']

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

class ReviewSerializer(serializers.ModelSerializer):
    user_email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_email', 'service', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        service = data['service']
        
        from .models import Booking
        has_completed_booking = Booking.objects.filter(
            user=user,
            service=service,
            status='completed'
        ).exists()
        
        if not has_completed_booking:
            raise serializers.ValidationError("You can only review services you have successfully completed.")
            
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'message', 'is_read', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_email', 'text', 'is_read', 'created_at']
        read_only_fields = ['sender', 'created_at']

class ConversationSerializer(serializers.ModelSerializer):
    other_participant = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'other_participant', 'last_message', 'created_at', 'updated_at', 'booking', 'job']

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other = obj.participants.exclude(id=request.user.id).first()
            if other:
                return {
                    'id': other.id,
                    'email': other.email,
                    'full_name': getattr(other, 'full_name', ''),
                    'avatar': request.build_absolute_uri(other.avatar.url) if other.avatar else None
                }
        return None

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return MessageSerializer(last).data
        return None

