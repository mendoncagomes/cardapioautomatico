from django.contrib import messages
from django.contrib.auth.models import Group, User
from django.contrib.auth.views import LoginView, LogoutView
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils import timezone
from django.views.decorators.http import require_POST

from menu.models import Category, Product, ProductOption
from orders.models import Order, OrderItem

from .decorators import manager_required, staff_required
from .forms import CategoryForm, ProductForm, ProductOptionForm, StaffForm


STATUS_LABELS = {
    'pending': 'NOVO',
    'confirmed': 'CONFIRMADO',
    'preparing': 'EM PREPARO',
    'ready': 'PRONTO',
    'completed': 'FINALIZADO',
    'cancelled': 'CANCELADO',
}

STATUS_FLOW = {
    'pending': 'confirmed',
    'confirmed': 'preparing',
    'preparing': 'ready',
    'ready': 'completed',
}

STATUS_ACTIONS = {
    'pending': 'Aceitar pedido',
    'confirmed': 'Iniciar preparo',
    'preparing': 'Marcar como pronto',
    'ready': 'Finalizar',
}


class StaffLoginView(LoginView):
    template_name = 'dashboard/login.html'
    redirect_authenticated_user = True

    def get_success_url(self):
        return reverse_lazy('dashboard:panel')


class StaffLogoutView(LogoutView):
    next_page = reverse_lazy('dashboard:login')


def ensure_staff_groups():
    Group.objects.get_or_create(name='Administradores')
    Group.objects.get_or_create(name='Funcionarios')


def dashboard_context(request):
    return {
        'is_manager': request.user.is_superuser or request.user.groups.filter(name='Administradores').exists(),
        'status_labels': STATUS_LABELS,
    }


def order_badge(order):
    if order.order_type == 'eat_in':
        return f'MESA {order.table_number}'
    return 'PARA VIAGEM'


@staff_required
def panel(request):
    today = timezone.localdate()
    today_orders = Order.objects.filter(created_at__date=today)
    open_orders = Order.objects.exclude(status__in=['completed', 'cancelled'])
    unavailable_products = Product.objects.filter(active=True, available=False).select_related('category')[:8]
    recent_orders = Order.objects.prefetch_related('items__options')[:6]
    best_sellers = (
        OrderItem.objects.values('product_name')
        .annotate(quantity=Sum('quantity'))
        .order_by('-quantity')[:5]
    )

    return render(request, 'dashboard/panel.html', {
        **dashboard_context(request),
        'stats': {
            'orders_today': today_orders.count(),
            'preparing': open_orders.filter(status='preparing').count(),
            'ready': open_orders.filter(status='ready').count(),
            'completed': today_orders.filter(status='completed').count(),
            'revenue_today': today_orders.exclude(status='cancelled').aggregate(total=Sum('total'))['total'] or 0,
        },
        'recent_orders': recent_orders,
        'unavailable_products': unavailable_products,
        'best_sellers': best_sellers,
    })


def filtered_orders(request):
    orders = Order.objects.prefetch_related('items__options')
    filter_value = request.GET.get('filter', 'open')

    if filter_value == 'local':
        orders = orders.filter(order_type='eat_in')
    elif filter_value == 'takeaway':
        orders = orders.filter(order_type='takeaway')
    elif filter_value in STATUS_LABELS:
        orders = orders.filter(status=filter_value)
    elif filter_value == 'open':
        orders = orders.exclude(status__in=['completed', 'cancelled'])

    return orders


@staff_required
def orders_board(request):
    orders = filtered_orders(request)
    grouped = {
        'pending': orders.filter(status='pending'),
        'confirmed': orders.filter(status='confirmed'),
        'preparing': orders.filter(status='preparing'),
        'ready': orders.filter(status='ready'),
        'completed': orders.filter(status='completed')[:20],
    }
    return render(request, 'dashboard/orders.html', {
        **dashboard_context(request),
        'grouped_orders': grouped,
        'status_actions': STATUS_ACTIONS,
        'active_filter': request.GET.get('filter', 'open'),
    })


@staff_required
def orders_json(request):
    data = []
    for order in filtered_orders(request)[:40]:
        data.append({
            'id': order.id,
            'status': order.status,
            'status_label': STATUS_LABELS.get(order.status, order.status),
            'order_type': order.order_type,
            'order_type_label': order_badge(order),
            'time': timezone.localtime(order.created_at).strftime('%H:%M'),
            'total': str(order.total),
            'items': [
                {
                    'name': item.product_name,
                    'quantity': item.quantity,
                    'options': [option.name for option in item.options.all()],
                }
                for item in order.items.all()
            ],
        })
    return JsonResponse({'orders': data, 'count': len(data)})


@staff_required
def order_detail(request, pk):
    order = get_object_or_404(Order.objects.prefetch_related('items__options'), pk=pk)
    return render(request, 'dashboard/order_detail.html', {
        **dashboard_context(request),
        'order': order,
        'order_badge': order_badge(order),
        'status_action': STATUS_ACTIONS.get(order.status),
        'status_label': STATUS_LABELS.get(order.status, order.status),
    })


@require_POST
@staff_required
def update_status(request, pk):
    order = get_object_or_404(Order, pk=pk)
    requested_status = request.POST.get('status')
    next_status = requested_status if requested_status in STATUS_LABELS else STATUS_FLOW.get(order.status)
    if next_status:
        order.status = next_status
        order.save(update_fields=['status', 'updated_at'])
        messages.success(request, f'Pedido #{order.id} atualizado para {STATUS_LABELS[next_status]}.')
    return redirect(request.POST.get('next') or 'dashboard:orders')


@require_POST
@staff_required
def cancel_order(request, pk):
    order = get_object_or_404(Order, pk=pk)
    order.status = 'cancelled'
    order.save(update_fields=['status', 'updated_at'])
    messages.success(request, f'Pedido #{order.id} cancelado.')
    return redirect('dashboard:orders')


@staff_required
def products(request):
    queryset = Product.objects.select_related('category')
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category')
    availability = request.GET.get('availability')

    if query:
        queryset = queryset.filter(name__icontains=query)
    if category:
        queryset = queryset.filter(category_id=category)
    if availability == 'available':
        queryset = queryset.filter(active=True, available=True)
    elif availability == 'unavailable':
        queryset = queryset.filter(active=True, available=False)
    elif availability == 'inactive':
        queryset = queryset.filter(active=False)
    elif availability == 'promotion':
        queryset = queryset.filter(promotional_price__isnull=False)

    return render(request, 'dashboard/products.html', {
        **dashboard_context(request),
        'products': queryset,
        'categories': Category.objects.all(),
        'query': query,
        'selected_category': category,
        'availability': availability,
    })


@manager_required
def product_create(request):
    form = ProductForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Produto criado com sucesso.')
        return redirect('dashboard:products')
    return render(request, 'dashboard/product_form.html', {**dashboard_context(request), 'form': form, 'title': 'Novo produto'})


@manager_required
def product_edit(request, pk):
    product = get_object_or_404(Product, pk=pk)
    form = ProductForm(request.POST or None, request.FILES or None, instance=product)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Produto atualizado com sucesso.')
        return redirect('dashboard:products')
    return render(request, 'dashboard/product_form.html', {**dashboard_context(request), 'form': form, 'title': 'Editar produto', 'product': product})


@require_POST
@staff_required
def product_toggle_available(request, pk):
    product = get_object_or_404(Product, pk=pk)
    product.available = not product.available
    product.save(update_fields=['available', 'updated_at'])
    messages.success(request, f'{product.name} agora esta {"disponivel" if product.available else "indisponivel"}.')
    return redirect(request.POST.get('next') or 'dashboard:products')


@require_POST
@manager_required
def product_deactivate(request, pk):
    product = get_object_or_404(Product, pk=pk)
    product.active = False
    product.available = False
    product.save(update_fields=['active', 'available', 'updated_at'])
    messages.success(request, f'{product.name} foi desativado.')
    return redirect('dashboard:products')


@staff_required
def categories(request):
    return render(request, 'dashboard/categories.html', {
        **dashboard_context(request),
        'categories': Category.objects.annotate(product_count=Count('products')),
    })


@manager_required
def category_create(request):
    form = CategoryForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Categoria criada com sucesso.')
        return redirect('dashboard:categories')
    return render(request, 'dashboard/category_form.html', {**dashboard_context(request), 'form': form, 'title': 'Nova categoria'})


@manager_required
def category_edit(request, pk):
    category = get_object_or_404(Category, pk=pk)
    form = CategoryForm(request.POST or None, instance=category)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Categoria atualizada com sucesso.')
        return redirect('dashboard:categories')
    return render(request, 'dashboard/category_form.html', {**dashboard_context(request), 'form': form, 'title': 'Editar categoria'})


@staff_required
def options(request):
    option_type = request.GET.get('type')
    queryset = ProductOption.objects.select_related('product')
    if option_type:
        queryset = queryset.filter(option_type=option_type)
    return render(request, 'dashboard/options.html', {
        **dashboard_context(request),
        'options': queryset,
        'option_types': ProductOption.OPTION_TYPES,
        'active_type': option_type,
    })


@manager_required
def option_create(request):
    form = ProductOptionForm(request.POST or None, request.FILES or None)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Opcao criada com sucesso.')
        return redirect('dashboard:options')
    return render(request, 'dashboard/option_form.html', {**dashboard_context(request), 'form': form, 'title': 'Nova opcao'})


@manager_required
def option_edit(request, pk):
    option = get_object_or_404(ProductOption, pk=pk)
    form = ProductOptionForm(request.POST or None, request.FILES or None, instance=option)
    if request.method == 'POST' and form.is_valid():
        form.save()
        messages.success(request, 'Opcao atualizada com sucesso.')
        return redirect('dashboard:options')
    return render(request, 'dashboard/option_form.html', {**dashboard_context(request), 'form': form, 'title': 'Editar opcao'})


@require_POST
@staff_required
def option_toggle_available(request, pk):
    option = get_object_or_404(ProductOption, pk=pk)
    option.available = not option.available
    option.save(update_fields=['available', 'updated_at'])
    messages.success(request, f'{option.name} agora esta {"disponivel" if option.available else "indisponivel"}.')
    return redirect(request.POST.get('next') or 'dashboard:options')


@manager_required
def staff_users(request):
    ensure_staff_groups()
    users = User.objects.filter(is_staff=True).prefetch_related('groups').order_by('username')
    return render(request, 'dashboard/staff_users.html', {**dashboard_context(request), 'users': users})


@manager_required
def staff_create(request):
    ensure_staff_groups()
    form = StaffForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.save(commit=False)
        user.is_staff = True
        user.save()
        group, _ = Group.objects.get_or_create(name=form.cleaned_data['role'])
        user.groups.add(group)
        messages.success(request, 'Funcionario cadastrado com sucesso.')
        return redirect('dashboard:staff_users')
    return render(request, 'dashboard/staff_form.html', {**dashboard_context(request), 'form': form})


@staff_required
def reports(request):
    today = timezone.localdate()
    month = today.replace(day=1)
    valid_orders = Order.objects.exclude(status='cancelled')
    today_orders = valid_orders.filter(created_at__date=today)
    month_orders = valid_orders.filter(created_at__date__gte=month)
    revenue_month = month_orders.aggregate(total=Sum('total'))['total'] or 0
    orders_month = month_orders.count()
    best_seller = (
        OrderItem.objects.values('product_name')
        .annotate(quantity=Sum('quantity'))
        .order_by('-quantity')
        .first()
    )
    month_by_day = (
        month_orders.annotate(day=TruncDate('created_at'))
        .values('day')
        .annotate(total=Sum('total'), orders=Count('id'))
        .order_by('-day')[:10]
    )

    return render(request, 'dashboard/reports.html', {
        **dashboard_context(request),
        'orders_today': today_orders.count(),
        'revenue_today': today_orders.aggregate(total=Sum('total'))['total'] or 0,
        'orders_month': orders_month,
        'revenue_month': revenue_month,
        'average_ticket': revenue_month / orders_month if orders_month else 0,
        'best_seller': best_seller,
        'local_count': month_orders.filter(order_type='eat_in').count(),
        'takeaway_count': month_orders.filter(order_type='takeaway').count(),
        'month_by_day': month_by_day,
    })
