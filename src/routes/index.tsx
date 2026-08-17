import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Tratores } from '../pages/Tratores';
import { TratorDetail } from '../pages/TratorDetail';
import { Abastecimento } from '../pages/Abastecimento';
import { Checklists } from '../pages/Checklists';
import Relatorios from '../pages/Relatorios';
import { Configuracoes } from '../pages/Configuracoes';
import { CompraCombustivel } from '../pages/CompraCombustivel';
import { Manutencao } from '../pages/Manutencao';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute, RoleRoute, AdministradorRoute, GestaoRoute } from './RoleRoutes';
import { OfflineStatus } from '../pages/OfflineStatus';
import { getDefaultPathForPerfil } from '../utils/permissions';

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getDefaultPathForPerfil(user.perfil)} replace />;
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
              <GestaoRoute>
                {withLayout(<Dashboard />)}
              </GestaoRoute>
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
            path="/tratores/:id"
            element={
              <GestaoRoute>
                {withLayout(<TratorDetail />)}
              </GestaoRoute>
            }
          />
          <Route
            path="/tratores"
            element={
              <GestaoRoute>
                {withLayout(<Tratores />)}
              </GestaoRoute>
            }
          />
          <Route
            path="/checklists"
            element={
              <RoleRoute path="/checklists">
                {withLayout(<Checklists />)}
              </RoleRoute>
            }
          />
          <Route
            path="/relatorios"
            element={
              <GestaoRoute>
                {withLayout(<Relatorios />)}
              </GestaoRoute>
            }
          />
          <Route
            path="/compra-combustivel"
            element={
              <GestaoRoute>
                {withLayout(<CompraCombustivel />)}
              </GestaoRoute>
            }
          />
          <Route
            path="/configuracoes"
            element={
              <AdministradorRoute>
                {withLayout(<Configuracoes />)}
              </AdministradorRoute>
            }
          />
          <Route path="/usuarios" element={<Navigate to="/configuracoes" replace />} />
          <Route
            path="/manutencao"
            element={
              <GestaoRoute>
                {withLayout(<Manutencao />)}
              </GestaoRoute>
            }
          />
          <Route
            path="/offline"
            element={
              <ProtectedRoute>
                {withLayout(<OfflineStatus />)}
              </ProtectedRoute>
            }
          />
          <Route path="/pneus" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default AppRoutes;
