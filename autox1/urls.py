from django.contrib import admin
from django.urls import include, path
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('app/', include('app_control.urls')),
    path('user/', include('user_control.urls')),
    path('', auth_views.LoginView.as_view(), name='login')
]
