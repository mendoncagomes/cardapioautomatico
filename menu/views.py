from django.contrib import messages
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_http_methods, require_POST

from cart.services import add_item, build_item

from .models import Category, Product, ProductOption


def ensure_order_started(request):
    if 'order_type' not in request.session:
        messages.info(request, 'Comece escolhendo como deseja receber seu pedido.')
        return False
    return True


def catalog(request):
    if not ensure_order_started(request):
        return redirect('core:start')

    categories = Category.objects.filter(active=True).prefetch_related('products')
    selected_slug = request.GET.get('categoria') or (categories[0].slug if categories else None)
    selected_category = None
    products = Product.objects.none()

    if selected_slug:
        selected_category = get_object_or_404(Category, slug=selected_slug, active=True)
        products = selected_category.products.filter(active=True)

    return render(request, 'menu/catalog.html', {
        'categories': categories,
        'selected_category': selected_category,
        'products': products,
    })


@require_http_methods(['GET', 'POST'])
def product_detail(request, slug):
    if not ensure_order_started(request):
        return redirect('core:start')

    product = get_object_or_404(Product, slug=slug, active=True)
    if product.kind in {'combo', 'promotion'}:
        if request.method == 'POST':
            add_item(request.session, build_item(product))
            messages.success(request, 'Item adicionado ao pedido.')
            return redirect('menu:catalog')
        return render(request, 'menu/product_detail.html', {'product': product})

    drinks = ProductOption.objects.filter(option_type='drink', active=True)
    sides = ProductOption.objects.filter(option_type='side', active=True)

    if request.method == 'POST':
        option_ids = [request.POST.get('drink'), request.POST.get('side')]
        options = ProductOption.objects.filter(pk__in=[oid for oid in option_ids if oid], active=True)
        add_item(request.session, build_item(product, options=list(options)))
        messages.success(request, 'Lanche adicionado ao pedido.')
        return redirect('cart:detail')

    return render(request, 'menu/product_detail.html', {
        'product': product,
        'drinks': drinks,
        'sides': sides,
    })


@require_http_methods(['GET', 'POST'])
def custom_burger(request):
    if not ensure_order_started(request):
        return redirect('core:start')

    base = get_object_or_404(Product, slug='monte-seu-hamburguer', active=True)
    grouped_options = {
        'bread': ProductOption.objects.filter(option_type='bread', active=True),
        'meat': ProductOption.objects.filter(option_type='meat', active=True),
        'cheese': ProductOption.objects.filter(option_type='cheese', active=True),
        'extra': ProductOption.objects.filter(option_type='extra', active=True),
    }

    if request.method == 'POST':
        selected_ids = []
        for field in ['bread', 'meat', 'cheese']:
            value = request.POST.get(field)
            if value:
                selected_ids.append(value)
        selected_ids.extend(request.POST.getlist('extra'))
        options = ProductOption.objects.filter(pk__in=selected_ids, active=True)
        add_item(request.session, build_item(base, options=list(options)))
        messages.success(request, 'Hamburguer personalizado adicionado.')
        return redirect('cart:detail')

    return render(request, 'menu/custom_burger.html', {
        'product': base,
        'grouped_options': grouped_options,
    })
