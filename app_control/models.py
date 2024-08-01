from django.db import models
from user_control.models import CustomUser
from user_control.views import add_user_activity


class Group(models.Model):
    created_by = models.ForeignKey(
        CustomUser, null=True, related_name="group",
        on_delete=models.SET_NULL
    )
    added_date = models.DateTimeField(auto_now_add=True)
    origin = models.CharField(max_length=255, blank=True, null=True)
    invite_link = models.URLField(unique=True)
    status_connect = models.BooleanField(null=True, default=False)


    def save(self, *args, **kwargs):
        action = f"added new group - '{self.invite_link}'"
        super().save(*args, **kwargs)
        add_user_activity(self.created_by, action=action)


    def __str__(self):
        return self.invite_link


class Contacts(models.Model):
    number = models.CharField(max_length=255)
    serialized = models.CharField(max_length=255)
    message_sent = models.BooleanField(null=True, default=False)
    collection_date = models.DateTimeField(auto_now_add=True)
    send_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('number', 'serialized')

    def __str__(self):
        return self.number
