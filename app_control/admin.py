from django.contrib import admin
from .models import Group, Contacts


admin.site.register((Group, Contacts))
