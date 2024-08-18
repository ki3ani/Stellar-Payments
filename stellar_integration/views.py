from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer, StellarAccountSerializer, SendPaymentSerializer, UserRegistrationSerializer
from .models import StellarAccount, UserProfile
from .utils import create_stellar_account, check_account_balance, send_payment, get_transaction_history, fund_account
from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import AllowAny

class StellarAccountViewSet(viewsets.ModelViewSet):
    queryset = StellarAccount.objects.all()
    serializer_class = StellarAccountSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create_account(self, request):
        public_key, secret_seed = create_stellar_account()
        if public_key and secret_seed:
            account = StellarAccount(user=request.user, account_id=public_key)
            account.set_secret_seed(secret_seed)
            account.save()
            return Response({'public_key': public_key, 'secret_seed': secret_seed})
        return Response({'error': 'Failed to create the account'}, status=400)

    @action(detail=False, methods=['post'])
    def fund_account(self, request):
        public_key = request.data.get('public_key')
        
        if not public_key:
            return Response({'error': 'Public key is required'}, status=400)
        
        try:
            response = fund_account(public_key)
            return Response({'status': 'success', 'response': response})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['get'])
    def check_balance(self, request):
        account = StellarAccount.objects.get(user=request.user)
        balances = check_account_balance(account.account_id)
        return Response({'balances': balances})

    @action(detail=False, methods=['post'])
    def send_payment(self, request):
        serializer = SendPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        from_account = StellarAccount.objects.get(user=request.user)
        
        balance = check_account_balance(from_account.account_id)
        if any(b['asset_type'] == 'native' and float(b['balance']) < data['amount'] for b in balance):
            return Response({'error': 'Insufficient balance'}, status=400)
        
        secret_seed = from_account.get_secret_seed()  # Decrypt the secret seed
        response = send_payment(from_account, data['to_account'], data['amount'], secret_seed=secret_seed)
        return Response({'response': response})

    @action(detail=False, methods=['get'])
    def transaction_history(self, request):
        account = StellarAccount.objects.get(user=request.user)
        transactions = get_transaction_history(account.account_id)
        return Response({'transactions': transactions})

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def retrieve_profile(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_profile(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

class UserRegistrationView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
