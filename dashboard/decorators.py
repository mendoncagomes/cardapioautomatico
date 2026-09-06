from django.contrib.auth.decorators import login_required, user_passes_test


def staff_required(view_func):
    return login_required(user_passes_test(lambda user: user.is_staff)(view_func))


def manager_required(view_func):
    return login_required(user_passes_test(lambda user: user.is_superuser or user.groups.filter(name='Administradores').exists())(view_func))
