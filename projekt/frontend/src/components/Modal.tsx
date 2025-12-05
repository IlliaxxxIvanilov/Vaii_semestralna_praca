import React from 'react';

const Modal: React.FC<{ show: boolean, onClose: () => void, onConfirm: () => void, children: React.ReactNode }> = ({ show, onClose, onConfirm, children }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        {children}
        <button onClick={onConfirm}>Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};
export default Modal;
