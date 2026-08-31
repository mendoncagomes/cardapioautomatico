from django.contrib import messages
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from cart.services import clear_cart, hydrate_cart, validate_cart_from_database

from .models import Order, OrderItem, OrderItemOption


def checkout(request):
    items, total = hydrate_cart(request.session)
    if not items:
        messages.info(request, 'Adicione um item antes de finalizar.')
        return redirect('menu:catalog')
    return render(request, 'orders/checkout.html', {'items': items, 'total': total})


@require_POST
@transaction.atomic
def confirm(request):
    if 'order_type' not in request.session:
        return redirect('core:start')

    validated_items, total = validate_cart_from_database(request.session)
    if not validated_items:
        messages.info(request, 'Seu carrinho esta vazio.')
        return redirect('menu:catalog')

    order = Order.objects.create(
        order_type=request.session['order_type'],
        table_number=request.session.get('table_number'),
        total=total,
    )

    for item in validated_items:
        order_item = OrderItem.objects.create(
            order=order,
            product_name=item['product'].name,
            product_snapshot={
                'id': item['product'].id,
                'slug': item['product'].slug,
                'description': item['product'].description,
            },
            quantity=item['quantity'],
            unit_price=item['unit_price'],
            total=item['total'],
        )
        for option in item['options']:
            OrderItemOption.objects.create(
                order_item=order_item,
                name=option.name,
                price=option.price,
            )

    clear_cart(request.session)
    return redirect('orders:confirmed', pk=order.pk)


def confirmed(request, pk):
    order = get_object_or_404(Order.objects.prefetch_related('items__options'), pk=pk)
    return render(request, 'orders/confirmed.html', {'order': order})
