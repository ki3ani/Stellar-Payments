from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from stellar_integration.views import UserRegistrationView



urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('stellar_integration.urls')),
    path('api/register/', UserRegistrationView.as_view(), name='user-registration'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
