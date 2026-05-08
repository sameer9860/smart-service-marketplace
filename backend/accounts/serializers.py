from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'full_name', 'avatar', 'date_joined']
        read_only_fields = ['id', 'email', 'role', 'date_joined']
