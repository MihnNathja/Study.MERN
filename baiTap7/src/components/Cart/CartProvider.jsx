// src/components/Cart/CartProvider.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => setItems([...items, item]);
  const removeItem = (id) => setItems(items.filter(i => i.id !== id));
  const updateItem = (id, quantity) => 
    setItems(items.map(i => i.id === id ? { ...i, quantity } : i));

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
