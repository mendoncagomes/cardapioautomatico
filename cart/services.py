from decimal import Decimal

from menu.models import Product, ProductOption


CART_SESSION_KEY = 'cart'


def get_cart(session):
    return session.get(CART_SESSION_KEY, [])


def save_cart(session, cart):
    session[CART_SESSION_KEY] = cart
    session.modified = True


def cart_count(session):
    return sum(item['quantity'] for item in get_cart(session))


def money(value):
    return Decimal(value).quantize(Decimal('0.01'))


def serialize_option(option):
    return {
        'id': option.id,
        'name': option.name,
        'price': str(option.price),
        'type': option.option_type,
    }


def build_item(product, quantity=1, options=None):
    options = options or []
    unit_price = money(product.current_price + sum(option.price for option in options))
    return {
        'product_id': product.id,
        'name': product.name,
        'image': product.image,
        'quantity': max(int(quantity), 1),
        'unit_price': str(unit_price),
        'options': [serialize_option(option) for option in options],
    }


def add_item(session, item):
    cart = get_cart(session)
    signature = (item['product_id'], tuple((opt['id'], opt['type']) for opt in item['options']))

    for current in cart:
        current_signature = (
            current['product_id'],
            tuple((opt['id'], opt['type']) for opt in current['options']),
        )
        if current_signature == signature:
            current['quantity'] += item['quantity']
            save_cart(session, cart)
            return

    cart.append(item)
    save_cart(session, cart)


def update_quantity(session, index, quantity):
    cart = get_cart(session)
    if 0 <= index < len(cart):
        quantity = int(quantity)
        if quantity <= 0:
            cart.pop(index)
        else:
            cart[index]['quantity'] = quantity
        save_cart(session, cart)


def remove_item(session, index):
    cart = get_cart(session)
    if 0 <= index < len(cart):
        cart.pop(index)
        save_cart(session, cart)


def clear_cart(session):
    save_cart(session, [])


def hydrate_cart(session):
    hydrated = []
    total = Decimal('0.00')
    for index, item in enumerate(get_cart(session)):
        unit_price = money(item['unit_price'])
        subtotal = money(unit_price * item['quantity'])
        total += subtotal
        hydrated.append({**item, 'index': index, 'unit_price_decimal': unit_price, 'subtotal': subtotal})
    return hydrated, money(total)


def validate_cart_from_database(session):
    validated = []
    total = Decimal('0.00')

    for item in get_cart(session):
        product = Product.objects.get(pk=item['product_id'], active=True)
        option_ids = [option['id'] for option in item.get('options', [])]
        options = list(ProductOption.objects.filter(pk__in=option_ids, active=True))
        unit_price = money(product.current_price + sum(option.price for option in options))
        quantity = max(int(item['quantity']), 1)
        subtotal = money(unit_price * quantity)
        total += subtotal
        validated.append({
            'product': product,
            'quantity': quantity,
            'unit_price': unit_price,
            'total': subtotal,
            'options': options,
        })

    return validated, money(total)
