import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Tractor,
  Fuel,
  Truck,
  ClipboardList,
  Wrench,
  FileText,
  Settings,
  LogOut,
  Menu,
  Home,
  Search,
  Bell,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { UserAvatar } from '../components/UserAvatar';
import { OfflineBanner } from '../components/OfflineBanner';
import { PendingSyncIndicator } from '../components/PendingSyncIndicator';
import { useUpdateUsuario } from '../hooks';
import { uploadToCloudinary } from '../services/cloudinary';

import type { UserProfile } from '../types';

interface NavItem {
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  path: string;
  perfis: UserProfile[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', shortLabel: 'Home', icon: Home, path: '/dashboard', perfis: ['administrador', 'gestor'] },
  { label: 'Tratores', shortLabel: 'Tratores', icon: Tractor, path: '/tratores', perfis: ['administrador', 'gestor'] },
  { label: 'Abastecimentos', shortLabel: 'Abastec.', icon: Fuel, path: '/abastecimento', perfis: ['administrador', 'gestor', 'colaborador'] },
  { label: 'Compra de Combustível', icon: Truck, path: '/compra-combustivel', perfis: ['administrador', 'gestor'] },
  { label: 'Checklists', shortLabel: 'Checklist', icon: ClipboardList, path: '/checklists', perfis: ['administrador', 'gestor', 'colaborador'] },
  { label: 'Manutenção', shortLabel: 'Manuten.', icon: Wrench, path: '/manutencao', perfis: ['administrador', 'gestor'] },
  { label: 'Relatórios', shortLabel: 'Relatórios', icon: FileText, path: '/relatorios', perfis: ['administrador', 'gestor'] },
  { label: 'Configurações', shortLabel: 'Config.', icon: Settings, path: '/configuracoes', perfis: ['administrador'] },
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, updateUser } = useAuth();
  const { theme, setPreference } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const { mutateAsync: updateUsuario } = useUpdateUsuario();

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    try {
      setUploadingPhoto(true);
      const fotoUrl = await uploadToCloudinary(file, 'usuarios');

      let usuarioId = user.id;

      await updateUsuario({ id: usuarioId, foto_url: fotoUrl });

      updateUser({ foto_url: fotoUrl });
    } catch (err) {
      console.error('Erro ao atualizar foto:', err);
      alert('Não foi possível atualizar a foto. Tente novamente.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const filteredNavItems = navItems.filter(item =>
    user ? item.perfis.includes(user.perfil) : false
  );

  const isNavActive = (path: string) =>
    location.pathname === path
    || (path === '/configuracoes' && location.pathname.startsWith('/configuracoes'))
    || (path === '/tratores' && location.pathname.startsWith('/tratores'))
    || (path === '/manutencao' && location.pathname.startsWith('/manutencao'));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#0A0A0A]">
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-[#0A4D28] to-[#083D20] dark:from-[#111111] dark:to-[#0A0A0A] text-white dark:text-gray-100 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-green-700 dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <img
              src={theme === 'dark' ? '/ff-black.png' : '/ff-white.png'}
              alt="Logo"
              className="h-10 w-auto"
            />
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = isNavActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-yellow-400 dark:bg-[#FFC107] text-green-900 dark:text-[#0A0A0A] font-semibold shadow-lg'
                      : 'text-green-100 dark:text-gray-300 hover:bg-green-700 dark:hover:bg-[#262626] hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-green-700 dark:border-[#262626]">
          <div className="mb-4 p-3 bg-green-700/50 dark:bg-[#171717] rounded-lg">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={user?.foto_url}
                nome={user?.nome || 'Usuário'}
                size="sm"
                editable
                onUpload={handlePhotoUpload}
                isUploading={uploadingPhoto}
              />
              <div>
                <p className="font-medium text-white dark:text-gray-100">{user?.nome}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="flex-1 text-green-200 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-green-700 dark:hover:bg-[#262626] rounded-lg"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              className="flex-1 justify-start text-green-200 dark:text-gray-300 hover:text-white dark:hover:text-white hover:bg-green-700 dark:hover:bg-[#262626] rounded-lg"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col bg-gray-100 dark:bg-[#0A0A0A] pb-[env(safe-area-inset-bottom)]">
        <OfflineBanner />

        {/* Mobile Header — abre menu lateral com todos os itens */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#262626]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 dark:text-gray-200 shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <img
            src={theme === 'dark' ? '/ff-black.png' : '/ff-white.png'}
            alt="Franco Forte"
            className="h-8 w-auto"
          />
          <UserAvatar
            src={user?.foto_url}
            nome={user?.nome || 'Usuário'}
            size="sm"
            className="shrink-0"
          />
        </header>

        <div className="lg:hidden px-4 py-2">
          <PendingSyncIndicator />
        </div>
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#262626] shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 dark:text-gray-300">
              <Menu />
            </Button>
            <PendingSyncIndicator />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Buscar no sistema..."
                className="pl-10 pr-4 py-2 border border-gray-200 dark:border-[#262626] rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-[#FFC107] bg-white dark:bg-[#171717] text-gray-900 dark:text-gray-100"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-600 dark:text-gray-300 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-3">
              <UserAvatar
                src={user?.foto_url}
                nome={user?.nome || 'Usuário'}
                size="md"
                editable
                onUpload={handlePhotoUpload}
                isUploading={uploadingPhoto}
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.nome}</p>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
