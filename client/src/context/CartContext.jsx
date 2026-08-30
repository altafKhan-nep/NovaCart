import { createContext, useContext, useEffect, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.cartItems.find(
        (item) => item.product === action.payload.product
      );
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item.product === action.payload.product
              ? { ...item, qty: item.qty + action.payload.qty }
              : item
          ),
        };
      }
      return { ...state, cartItems: [...state.cartItems, action.payload] };
    case 'REMOVE_ITEM':
      return {
        ...state,
        cartItems: state.cartItems.filter(
          (item) => item.product !== action.payload
        ),
      };
    case 'UPDATE_QTY':
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item.product === action.payload.product
            ? { ...item, qty: action.payload.qty }
            : item
        ),
      };
    case 'CLEAR':
      return { cartItems: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { cartItems: [] }, () => {
    const stored = localStorage.getItem('novacart_cart');
    return stored ? JSON.parse(stored) : { cartItems: [] };
  });

  useEffect(() => {
    localStorage.setItem('novacart_cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    dispatch({ type: 'UPDATE_QTY', payload: { product: id, qty } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR' });
  };

  const cartItems = state.cartItems;

  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const itemsPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 5;

  const taxPrice = Number((itemsPrice * 0.085).toFixed(2));

  const totalPrice = Number(
    (itemsPrice + shippingPrice + taxPrice).toFixed(2)
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
