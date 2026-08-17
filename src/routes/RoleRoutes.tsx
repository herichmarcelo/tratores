import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPath, getDefaultPathForPerfil } from '../utils/permissions';

/** Qualquer usuário autenticado */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/** Verifica se o perfil pode acessar a rota atual */
export const RoleRoute: React.FC<{ children: React.ReactNode; path: string }> = ({ children, path }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!canAccessPath(user?.perfil, path)) {
    return <Navigate to={getDefaultPathForPerfil(user!.perfil)} replace />;
  }
  return <>{children}</>;
};

/** Apenas administrador global */
export const AdministradorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdministrador, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isAdministrador) {
    return <Navigate to={getDefaultPathForPerfil(user!.perfil)} replace />;
  }
  return <>{children}</>;
};

/** Admin + Gestor — gestão operacional */
export const GestaoRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, canAccessGestao, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!canAccessGestao) {
    return <Navigate to={getDefaultPathForPerfil(user!.perfil)} replace />;
  }
  return <>{children}</>;
};

/** @deprecated use GestaoRoute ou AdministradorRoute */
export const AdminRoute = GestaoRoute;
