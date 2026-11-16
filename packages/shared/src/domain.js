export const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
export const currentPrice = (product) => product.promotionalPrice ?? product.price;
export const itemUnitPrice = (item) => currentPrice(item.product) + item.options.reduce((sum, option) => sum + option.price, 0);
export const cartTotal = (cart) => cart.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0);
export const cartCount = (cart) => cart.reduce((sum, item) => sum + item.quantity, 0);
export const orderTypeLabel = (order) => order.type === 'eat_in' ? `Mesa ${order.table}` : 'Para viagem';
export const statusLabels = { pending: 'Novo', confirmed: 'Confirmado', preparing: 'Em preparo', ready: 'Pronto', completed: 'Finalizado', cancelled: 'Cancelado' };
export const nextStatus = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'completed' };

export function addCartItem(cart, product, options = []) {
  const signature = `${product.id}:${options.map((option) => option.id).sort().join(',')}`;
  const index = cart.findIndex((item) => item.signature === signature);
  if (index < 0) return [...cart, { signature, product, options, quantity: 1 }];
  return cart.map((item, current) => current === index ? { ...item, quantity: item.quantity + 1 } : item);
}

export function createOrder(cart, service, id = Date.now()) {
  return {
    id,
    type: service.type,
    table: service.table,
    status: 'pending',
    createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    items: cart.map((item) => ({ name: item.product.name, quantity: item.quantity, options: item.options.map((option) => option.name) })),
    total: cartTotal(cart),
  };
}
