from django.urls import path, reverse_lazy
from .views import *
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('login', auth_views.LoginView.as_view(), name='login'),
    path('logout', auth_views.LogoutView.as_view(), name='logout'),
    path('change_password', auth_views.PasswordChangeView.as_view(
        success_url=reverse_lazy('listar_usuarios')), name='change_password'),
    
    path('register', register_user, name='register'),
    path('list', list_users, name='list_users'),
    path('edit/<int:id>', edit_user, name='edit_user'),
    path('delete/<int:id>', delete_user, name='delete_user'),
    
    path('activies', users_activities, name='users_activities'),
]