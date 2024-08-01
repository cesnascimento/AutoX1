from django.urls import path
from .views import *


urlpatterns = [
    path('group/add', register_group, name='register_group'),
    path('group/edit/<int:id>', edit_group, name='edit_group'),
    path('group/delete/<int:id>', delete_group, name='delete_group'),
    path('group/list', list_groups, name='list_groups'),

    path('lids/list', list_user, name='list_lids'),
    path('download-serialized/', download_serialized, name='download_serialized'),
]