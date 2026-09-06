(() => {
    const board = document.querySelector('[data-orders-board]');
    if (!board) return;

    const endpoint = board.dataset.ordersEndpoint;
    const toast = document.querySelector('[data-order-toast]');
    let knownIds = new Set();

    const showToast = () => {
        if (!toast) return;
        toast.hidden = false;
        window.setTimeout(() => {
            toast.hidden = true;
        }, 4200);
    };

    const pollOrders = async () => {
        try {
            const response = await fetch(endpoint, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
            if (!response.ok) return;
            const data = await response.json();
            const ids = new Set(data.orders.map((order) => order.id));
            const hasNewOrder = knownIds.size > 0 && data.orders.some((order) => !knownIds.has(order.id));
            knownIds = ids;
            if (hasNewOrder) showToast();
        } catch (error) {
            window.console.debug('Nao foi possivel atualizar os pedidos.', error);
        }
    };

    pollOrders();
    window.setInterval(pollOrders, 15000);
})();
