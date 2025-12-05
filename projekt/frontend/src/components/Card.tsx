import React from 'react';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <div className={`card ui-card ${className || ''}`}>
      {children}
    </div>
  );
};

export default Card;
