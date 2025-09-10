// src/components/Cart/CartList.js
import React from 'react';
import { useCart } from './CartProvider';
import { CartItem } from './CartItem';

export const CartList = () => {
  const { items, removeItem, updateItem } = useCart();
  return (
    <div>
      {items.map(item => (
        <CartItem 
          key={item.id} 
          item={item} 
          onRemove={removeItem} 
          onUpdate={updateItem} 
        />
      ))}
    </div>
  );
};
