// src/components/Modal/Modal.js
import React from 'react';

export const Modal = ({ visible, onClose, children }) => {
  if (!visible) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};
