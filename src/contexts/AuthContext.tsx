import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { mapUsuarioRow, verifyStoredPassword, type UsuarioRow } from '../utils/usuario';
import type { UserProfile } from '../types/index';
import { canAccessGestao, isAdministrador, isColaborador, isGestor } from '../utils/permissions';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  foto_url?: string;
  perfil: UserProfile;
  fazenda_id?: string;
  /** @deprecated use perfil */
  role: 'admin' | 'manager' | 'collaborator';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
  isAdministrador: boolean;
  isGestor: boolean;
  isColaborador: boolean;
  /** Admin ou Gestor — acesso à gestão operacional */
  canAccessGestao: boolean;
  /** @deprecated use isAdministrador ou canAccessGestao */
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const mapPerfilToLegacyRole = (perfil: UserProfile): AuthUser['role'] => {
  if (perfil === 'colaborador') return 'collaborator';
  if (perfil === 'gestor') return 'manager';
  return 'admin';
};

/** @deprecated use mapPerfilToLegacyRole */
export const mapPerfilToRole = mapPerfilToLegacyRole;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('pluma_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as AuthUser;
        if (parsed.perfil) {
          setUser(parsed);
        } else {
          localStorage.removeItem('pluma_user');
        }
      } catch {
        localStorage.removeItem('pluma_user');
      }
    }
  }, []);

  const persistUser = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem('pluma_user', JSON.stringify(authUser));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data: dbUser, error } = await supabase
      .from('usuarios')
      .select('id, nome_completo, email, foto_url, funcao, senha, ativo, fazenda_id')
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
      perfil: mapped.perfil,
      fazenda_id: mapped.fazenda_id,
      role: mapPerfilToLegacyRole(mapped.perfil),
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
    const next = { ...user, ...updates };
    if (updates.perfil) {
      next.role = mapPerfilToLegacyRole(updates.perfil);
    }
    persistUser(next);
  };

  const value = useMemo(() => ({
    user,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdministrador: isAdministrador(user?.perfil),
    isGestor: isGestor(user?.perfil),
    isColaborador: isColaborador(user?.perfil),
    canAccessGestao: canAccessGestao(user?.perfil),
    isAdmin: canAccessGestao(user?.perfil),
  }), [user]);

  return (
    <AuthContext.Provider value={value}>
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
