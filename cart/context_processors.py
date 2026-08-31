from .services import cart_count, hydrate_cart


def cart_summary(request):
    items, total = hydrate_cart(request.session)
    return {
        'cart_item_count': cart_count(request.session),
        'cart_total': total,
        'cart_preview_items': items,
    }
