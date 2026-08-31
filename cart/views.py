from django.shortcuts import redirect, render
from django.views.decorators.http import require_POST

from .services import hydrate_cart, remove_item, update_quantity


def detail(request):
    items, total = hydrate_cart(request.session)
    return render(request, 'cart/detail.html', {'items': items, 'total': total})


@require_POST
def update(request, index):
    update_quantity(request.session, index, request.POST.get('quantity', 1))
    return redirect('cart:detail')


@require_POST
def remove(request, index):
    remove_item(request.session, index)
    return redirect('cart:detail')
