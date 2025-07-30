import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

// Tipos de itens no carrinho
const ITEM_TYPES = {
  EVENT_TICKET: 'event_ticket',
  STORE_PRODUCT: 'store_product',
  EVENT_PRODUCT: 'event_product'
};

// Estado inicial do carrinho
const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

// Reducer para gerenciar o carrinho
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.type === action.payload.type &&
        item.eventId === action.payload.eventId
      );

      if (existingItem) {
        // Atualizar quantidade se o item já existe
        const updatedItems = state.items.map(item =>
          item.id === action.payload.id && 
          item.type === action.payload.type &&
          item.eventId === action.payload.eventId
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        
        const newTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: updatedItems,
          total: newTotal,
          itemCount: newItemCount
        };
      } else {
        // Adicionar novo item
        const newItems = [...state.items, action.payload];
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
          ...state,
          items: newItems,
          total: newTotal,
          itemCount: newItemCount
        };
      }

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(item => 
        !(item.id === action.payload.id && 
          item.type === action.payload.type &&
          item.eventId === action.payload.eventId)
      );
      
      const newTotalAfterRemove = filteredItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCountAfterRemove = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: filteredItems,
        total: newTotalAfterRemove,
        itemCount: newItemCountAfterRemove
      };

    case 'UPDATE_QUANTITY':
      const updatedItemsQuantity = state.items.map(item =>
        item.id === action.payload.id && 
        item.type === action.payload.type &&
        item.eventId === action.payload.eventId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      const newTotalQuantity = updatedItemsQuantity.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const newItemCountQuantity = updatedItemsQuantity.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: updatedItemsQuantity,
        total: newTotalQuantity,
        itemCount: newItemCountQuantity
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      };

    case 'LOAD_CART':
      const loadedItems = action.payload.items || [];
      const loadedTotal = loadedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const loadedItemCount = loadedItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        ...state,
        items: loadedItems,
        total: loadedTotal,
        itemCount: loadedItemCount
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Carregar carrinho do localStorage ao inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  // Funções para manipular o carrinho
  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (item) => {
    dispatch({ type: 'REMOVE_ITEM', payload: item });
  };

  const updateQuantity = (item, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { ...item, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemsByType = (type) => {
    return state.items.filter(item => item.type === type);
  };

  const getEventItems = (eventId) => {
    return state.items.filter(item => 
      item.type === ITEM_TYPES.EVENT_PRODUCT && item.eventId === eventId
    );
  };

  const getStoreItems = () => {
    return state.items.filter(item => item.type === ITEM_TYPES.STORE_PRODUCT);
  };

  const getEventTicketItems = () => {
    return state.items.filter(item => item.type === ITEM_TYPES.EVENT_TICKET);
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemsByType,
    getEventItems,
    getStoreItems,
    ITEM_TYPES
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

export { ITEM_TYPES }; 