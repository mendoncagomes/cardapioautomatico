import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { addCartItem, createOrder, initialOptions, initialOrders, initialProducts, initialStaff, nextStatus } from '@quickmenu/shared';

const StoreContext = createContext(null);
const initialState = { service: null, cart: [], products: initialProducts, options: initialOptions, orders: initialOrders, staff: initialStaff, admin: false };

function reducer(state, action) {
  switch (action.type) {
    case 'SERVICE': return { ...state, service: action.payload, cart: [] };
    case 'ADD_CART': return { ...state, cart: addCartItem(state.cart, action.product, action.options) };
    case 'QUANTITY': return { ...state, cart: state.cart.map((item, index) => index === action.index ? { ...item, quantity: action.quantity } : item).filter((item) => item.quantity > 0) };
    case 'REMOVE_CART': return { ...state, cart: state.cart.filter((_, index) => index !== action.index) };
    case 'CONFIRM_ORDER': return { ...state, orders: [createOrder(state.cart, state.service, Math.max(...state.orders.map((order) => order.id), 1042) + 1), ...state.orders], cart: [] };
    case 'LOGIN': return { ...state, admin: true };
    case 'LOGOUT': return { ...state, admin: false };
    case 'ORDER_STATUS': return { ...state, orders: state.orders.map((order) => order.id === action.id ? { ...order, status: action.status ?? nextStatus[order.status] ?? order.status } : order) };
    case 'TOGGLE_PRODUCT': return { ...state, products: state.products.map((product) => product.id === action.id ? { ...product, available: !product.available } : product) };
    case 'SAVE_PRODUCT': {
      const exists = state.products.some((product) => product.id === action.product.id);
      return { ...state, products: exists ? state.products.map((product) => product.id === action.product.id ? action.product : product) : [...state.products, action.product] };
    }
    case 'SAVE_OPTION': {
      const exists = state.options.some((option) => option.id === action.option.id);
      return { ...state, options: exists ? state.options.map((option) => option.id === action.option.id ? action.option : option) : [...state.options, action.option] };
    }
    case 'TOGGLE_OPTION': return { ...state, options: state.options.map((option) => option.id === action.id ? { ...option, available: !option.available } : option) };
    case 'ADD_STAFF': return { ...state, staff: [...state.staff, { ...action.member, id: crypto.randomUUID() }] };
    default: return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, (fallback) => {
    try { return { ...fallback, ...JSON.parse(localStorage.getItem('quickmenu-state')) }; } catch { return fallback; }
  });
  useEffect(() => localStorage.setItem('quickmenu-state', JSON.stringify(state)), [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
