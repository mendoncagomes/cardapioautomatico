from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from orders.models import Order


STATUS_FLOW = {
    'confirmed': 'preparing',
    'preparing': 'ready',
    'ready': 'completed',
}


def panel(request):
    orders = Order.objects.exclude(status__in=['completed', 'cancelled']).prefetch_related('items__options')
    return render(request, 'dashboard/panel.html', {'orders': orders})


@require_POST
def update_status(request, pk):
    order = get_object_or_404(Order, pk=pk)
    next_status = STATUS_FLOW.get(order.status)
    if next_status:
        order.status = next_status
        order.save(update_fields=['status'])
    return redirect('dashboard:panel')
