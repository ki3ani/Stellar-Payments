from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import StellarAccountViewSet


router = DefaultRouter()
router.register(r'stellar_accounts', StellarAccountViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
