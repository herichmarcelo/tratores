import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { mapFuncaoToPerfil, mapUsuarioRow, verifyStoredPassword, type UsuarioRow } from '../utils/usuario';
import type { UserProfile } from '../types/index';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  foto_url?: string;
  role: 'admin' | 'collaborator';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const mapPerfilToRole = (perfil?: UserProfile | string): 'admin' | 'collaborator' => {
  if (perfil === 'colaborador') return 'collaborator';
  return 'admin';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pluma_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const persistUser = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('pluma_user', JSON.stringify(authUser));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data: dbUser, error } = await supabase
      .from('usuarios')
      .select('id, nome_completo, email, foto_url, funcao, senha, ativo')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error || !dbUser || dbUser.ativo === false) return false;

    const valid = await verifyStoredPassword(password, dbUser.senha);
    if (!valid) return false;

    const mapped = mapUsuarioRow(dbUser as UsuarioRow);
    const authUser: AuthUser = {
      id: mapped.id,
      nome: mapped.nome,
      email: mapped.email,
      foto_url: mapped.foto_url,
      role: mapPerfilToRole(mapFuncaoToPerfil(dbUser.funcao)),
    };

    persistUser(authUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pluma_user');
  };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    persistUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
