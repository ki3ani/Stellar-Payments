from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import StellarAccount
from .utils import create_stellar_account

class StellarAccountTests(APITestCase):
    def setUp(self):
        # Create a user and authenticate
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.refresh.access_token}')

    def test_create_account(self):
        response = self.client.post(reverse('stellaraccount-create_account'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('public_key', response.data)
        self.assertIn('secret_seed', response.data)

    def test_check_balance(self):
        public_key, secret_seed = create_stellar_account()
        StellarAccount.objects.create(user=self.user, account_id=public_key, secret_seed=secret_seed)
        response = self.client.get(reverse('stellaraccount-check_balance'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_send_payment(self):
        public_key, secret_seed = create_stellar_account()
        StellarAccount.objects.create(user=self.user, account_id=public_key, secret_seed=secret_seed)
        response = self.client.post(reverse('stellaraccount-send_payment'), {
            'to_account': public_key,
            'amount': 10
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_transaction_history(self):
        public_key, secret_seed = create_stellar_account()
        StellarAccount.objects.create(user=self.user, account_id=public_key, secret_seed=secret_seed)
        response = self.client.get(reverse('stellaraccount-transaction_history'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
