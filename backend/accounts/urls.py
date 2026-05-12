from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, ProfileView, ChangePasswordView, ActivityLogView

urlpatterns = [
    # JWT Token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Auth endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('password/change/', ChangePasswordView.as_view(), name='password_change'),
    path('activity-logs/', ActivityLogView.as_view(), name='activity_logs'),
]
