import React from 'react';

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
  return (
    <button className="btn" {...props}>{children}</button>
  );
};

export default Button;
