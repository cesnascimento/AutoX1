import csv
from django.shortcuts import get_object_or_404, render, redirect
from user_control.models import CustomUser
from .forms.app_forms import AddGroupForm
from django.contrib import messages
from .models import Group, Contacts
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseForbidden

@login_required
def register_group(request):
    groups = Group.objects.all()
    if request.method == 'POST':
        form_count = int(request.POST['form_count'])
        forms = [AddGroupForm(request.POST, prefix=str(i), user=request.user) for i in range(form_count)]

        all_valid = all(form.is_valid() for form in forms)
        
        if all_valid:
            try:
                for form in forms:
                    form.save()
                messages.success(request, "Grupos registrados com sucesso.")
                return redirect('list_groups')
            except Exception as e:
                messages.error(request, f"Erro ao registrar grupos: {e}")
        else:
            messages.error(request, "Formulários inválidos. Por favor, corrija os erros e tente novamente.")
    else:
        forms = [AddGroupForm(prefix='0', user=request.user)]

    return render(request, 'app/register_group.html', {'forms': forms, 'groups': groups})


@login_required
def edit_group(request, id):
  if not request.user.is_staff:
      return HttpResponseForbidden("Acesso negado. Você precisa ser administrador.")
  rotina = Group.objects.get(id=id)
  if request.method == 'POST':
      form = AddGroupForm(request.POST, instance=rotina)
      if form.is_valid():
          form.save()
          return redirect('list_groups')
  else:
      form = AddGroupForm(instance=rotina)

  return render(request, 'app/add_group.html', {'form': form})


@login_required
def list_groups(request):
    groups = Group.objects.all()
    if request.method == 'POST':
        form_count = int(request.POST['form_count'])
        forms = [AddGroupForm(request.POST, prefix=str(i)) for i in range(form_count)]

        all_valid = all(form.is_valid() for form in forms)
        
        if all_valid:
            try:
                for form in forms:
                    form.save()
                messages.success(request, "Grupos registrados com sucesso.")
                return redirect('list_groups')
            except Exception as e:
                messages.error(request, f"Erro ao registrar grupos: {e}")
        else:
            messages.error(request, "Formulários inválidos. Por favor, corrija os erros e tente novamente.")
    else:
        forms = [AddGroupForm(prefix='0')]

    return render(request, 'app/list_groups.html', {'forms': forms, 'groups': groups})


@login_required
def delete_group(request, id):
  if not request.user.is_staff:
    return HttpResponseForbidden("Acesso negado. Você precisa ser administrador.")
  group = get_object_or_404(Group, id=id)
  group.delete()
  return redirect('list_groups')


@login_required
def list_user(request):
  usuarios = Contacts.objects.all()
  return render(request, 'app/list_lids.html', {'usuarios': usuarios})


@login_required
def download_serialized(request):
    usuarios = Contacts.objects.filter(serialized__contains='@c.us')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="contacts.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Numero'])
    
    for usuario in usuarios:
        serialized_clean = usuario.serialized.replace('@c.us', '')
        writer.writerow([serialized_clean])
    
    return response