// src/components/Cart/CartItem.js
import React from 'react';
import { Button } from '../Button/Button';

export const CartItem = ({ item, onRemove, onUpdate }) => {
  return (
    <div className="cart-item">
      <span>{item.name}</span>
      <input 
        type="number" 
        value={item.quantity} 
        onChange={(e) => onUpdate(item.id, +e.target.value)} 
      />
      <Button onClick={() => onRemove(item.id)}>Xóa</Button>
    </div>
  );
};
