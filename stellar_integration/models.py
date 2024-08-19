from django.db import models
from django.contrib.auth.models import User
from .utils import encrypt_data, decrypt_data

class StellarAccount(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    account_id = models.CharField(max_length=56)
    secret_seed = models.CharField(max_length=256)  # Increased length to accommodate encrypted data
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.account_id

    def set_secret_seed(self, secret_seed):
        self.secret_seed = encrypt_data(secret_seed)
        self.save()

    def get_secret_seed(self):
        return decrypt_data(self.secret_seed)

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return self.user.username
