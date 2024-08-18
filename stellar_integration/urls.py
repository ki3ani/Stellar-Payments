from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StellarAccountViewSet, UserProfileViewSet


router = DefaultRouter()
router.register(r'stellar_accounts', StellarAccountViewSet)
router.register(r'user_profiles', UserProfileViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
