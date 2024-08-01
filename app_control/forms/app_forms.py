from django import forms
from ..models import  Group


class AddGroupForm(forms.ModelForm):
  class Meta:
    model =  Group
    fields = ['origin', 'invite_link']
    labels = {'origin': 'Origem', 'invite_link': 'Link de Convite'}
  def __init__(self, *args, **kwargs):
    self.user = kwargs.pop('user', None)
    super().__init__(*args, **kwargs)

  def save(self, commit=True):
    group = super().save(commit=False)
    if self.user:
        group.created_by = self.user
    if commit:
        group.save()
    return group