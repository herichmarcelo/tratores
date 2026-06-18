import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Tratores } from '../pages/Tratores';
import { Abastecimento } from '../pages/Abastecimento';
import { Checklists } from '../pages/Checklists';
import Relatorios from '../pages/Relatorios';
import { Configuracoes } from '../pages/Configuracoes';
import { MainLayout } from '../layouts/MainLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const withLayout = (page: React.ReactNode) => (
  <MainLayout>{page}</MainLayout>
);

const AppRoutes: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {withLayout(<Dashboard />)}
              </ProtectedRoute>
            }
          />
          <Route
            path="/abastecimento"
            element={
              <ProtectedRoute>
                {withLayout(<Abastecimento />)}
              </ProtectedRoute>
            }
          />
          <Route
            path="/tratores"
            element={
              <AdminRoute>
                {withLayout(<Tratores />)}
              </AdminRoute>
            }
          />
          <Route
            path="/checklists"
            element={
              <AdminRoute>
                {withLayout(<Checklists />)}
              </AdminRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <AdminRoute>
                {withLayout(<Relatorios />)}
              </AdminRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <AdminRoute>
                {withLayout(<Configuracoes />)}
              </AdminRoute>
            }
          />
          <Route path="/usuarios" element={<Navigate to="/configuracoes" replace />} />
          <Route path="/pneus" element={<Navigate to="/dashboard" replace />} />
          <Route path="/manutencao" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
