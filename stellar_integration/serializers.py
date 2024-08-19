from pydantic import ValidationError
from rest_framework import serializers
from .models import StellarAccount, UserProfile
from django.contrib.auth import get_user_model



class StellarAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = StellarAccount
        fields = ['user', 'account_id', 'secret_seed', 'created_at']

class SendPaymentSerializer(serializers.Serializer):
    to_account = serializers.CharField(max_length=56)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)


class SendPaymentSerializer(serializers.Serializer):
    to_account = serializers.CharField(max_length=56)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise ValidationError("Amount must be greater than zero.")
        return value
    
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user', 'first_name', 'last_name', 'email', 'profile_picture']


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = get_user_model().objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        return user