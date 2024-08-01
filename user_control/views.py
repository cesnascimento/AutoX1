from django.shortcuts import render

from datetime import datetime
from django.http import HttpResponseForbidden
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.contrib import messages
from .forms.add_user_forms import AddUserForm, EditUserForm
from .models import CustomUser, UserActivities

def add_user_activity(user, action):
  UserActivities.objects.create(
    user_id=user.id,
    email=user.email,
    fullname=user.fullname,
    action=action
  )


@login_required
def register_user(request):
  if not request.user.is_staff:
    return HttpResponseForbidden("Acesso negado. Você precisa ser administrador.")
  if request.method == "POST":
    form_usuario = AddUserForm(request.POST)
    form_usuario.fields['fullname'].label = "Nome"
    if form_usuario.is_valid():
      novo_usuario = form_usuario.save()
      email_novo_usuario = novo_usuario.email
      action = f'Adicionou novo usuário: {email_novo_usuario}'
      add_user_activity(request.user, action)
      return redirect('list_users')
  else:
    form_usuario = AddUserForm()
  return render(request, 'users/form_users.html', {'form_usuario': form_usuario})


@login_required
def list_users(request):
  User = get_user_model()
  usuarios = User.objects.all()
  return render(request, 'users/list_users.html', {'usuarios': usuarios})


@login_required
def delete_user(request, id):
  if not request.user.is_staff:
    return HttpResponseForbidden("Acesso negado. Você precisa ser administrador.")

  User = get_user_model()
  usuario = get_object_or_404(User, id=id)

  if usuario.is_superuser:
    if not request.user.is_superuser:
      return HttpResponseForbidden("Acesso negado. Não é possível deletar um superusuário.")

  add_user_activity(request.user, "Deletou usuário")
  messages.info(request, "Você está deletando um usuario")
  usuario.delete()
  return redirect('list_users')


@login_required
def edit_user(request, id):
    User = get_user_model()
    user = User.objects.get(id=id)
    form_user = EditUserForm(request.POST or None, instance=user)
    if form_user.is_valid():
       form_user.save()
       return redirect('list_users')
    return render(request, 'users/form_users.html', {'form_user': form_user})


def users_activities(request):
  activities = UserActivities.objects.all()
  users = CustomUser.objects.all()

  from_date = request.GET.get('from_date')
  to_date = request.GET.get('to_date')
  user_id = request.GET.get('user')

  if from_date:
      activities = activities.filter(created_at__date__gte=datetime.strptime(from_date, '%Y-%m-%d'))
  if to_date:
      activities = activities.filter(created_at__date__lte=datetime.strptime(to_date, '%Y-%m-%d'))
  if user_id:
      activities = activities.filter(user_id=user_id)

  return render(request, 'users/user_activities.html', {'activities': activities, 'users': users})