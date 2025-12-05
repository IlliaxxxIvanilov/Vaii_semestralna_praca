import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../services/authService';

const ProtectedRoute: React.FC<{ roles?: string[]; children: React.ReactElement }> = ({ roles, children }) => {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
