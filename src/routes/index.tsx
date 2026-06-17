import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Tratores } from '../pages/Tratores';
import { Abastecimento } from '../pages/Abastecimento';
import { Checklists } from '../pages/Checklists';
import Relatorios from '../pages/Relatorios';
import { MainLayout } from '../layouts/MainLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
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
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tratores" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Tratores />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/abastecimento" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Abastecimento />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checklists" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Checklists />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/relatorios" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Relatorios />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
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
