from django.contrib import messages
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods, require_POST


def start(request):
    return render(request, 'core/start.html')


@require_POST
def choose_order_type(request):
    order_type = request.POST.get('order_type')
    if order_type not in {'eat_in', 'takeaway'}:
        messages.error(request, 'Escolha uma forma de receber o pedido.')
        return redirect('core:start')

    request.session['order_type'] = order_type
    request.session.pop('table_number', None)

    if order_type == 'eat_in':
        return redirect('core:table_number')
    return redirect('menu:catalog')


@require_http_methods(['GET', 'POST'])
def table_number(request):
    if request.method == 'POST':
        table_number = request.POST.get('table_number', '').strip()
        if not table_number.isdigit() or int(table_number) <= 0:
            messages.error(request, 'Informe um numero de mesa valido.')
            return redirect('core:table_number')
        request.session['table_number'] = int(table_number)
        return redirect('menu:catalog')

    return render(request, 'core/table_number.html')
