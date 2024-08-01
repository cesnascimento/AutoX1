from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth import get_user_model
from django import forms

class AddUserForm(UserCreationForm):
  def save(self, commit=True):
    user = super(UserCreationForm, self).save(commit=False)
    user.set_password(self.cleaned_data['password1'])
    if commit:
        user.save()
    return user
  
  class Meta(UserCreationForm.Meta):
    model = get_user_model()
    fields = ['fullname', 'email', 'role', 'password1', 'password2']
    labels = {'fullname': 'Nome', 'role': 'Cargo'}


class EditUserForm(UserChangeForm):
    password = None
    class Meta:
        model = get_user_model()
        fields = ['fullname', 'email', 'role']
        labels = {'fullname': 'Nome', 'role': 'Cargo'}
