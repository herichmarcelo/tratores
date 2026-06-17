import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Tractor,
  Fuel,
  ClipboardList,
  Truck,
  Wrench,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Users,
  Search,
  Bell,
  Leaf,
} from 'lucide-react';
import { Button } from '../components/ui/button';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: ('admin' | 'collaborator')[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/dashboard', roles: ['admin', 'collaborator'] },
  { label: 'Tratores', icon: Tractor, path: '/tratores', roles: ['admin'] },
  { label: 'Abastecimentos', icon: Fuel, path: '/abastecimento', roles: ['admin', 'collaborator'] },
  { label: 'Checklists', icon: ClipboardList, path: '/checklist', roles: ['admin', 'collaborator'] },
  { label: 'Pneus', icon: Truck, path: '/pneus', roles: ['admin'] },
  { label: 'Manutenção', icon: Wrench, path: '/manutencao', roles: ['admin'] },
  { label: 'Relatórios', icon: FileText, path: '/relatorios', roles: ['admin'] },
  { label: 'Usuários', icon: Users, path: '/usuarios', roles: ['admin'] },
  { label: 'Configurações', icon: Settings, path: '/configuracoes', roles: ['admin'] },
];

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNavItems = navItems.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-primary-600 to-primary-800 z-40 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white">
            {sidebarOpen ? <X /> : <Menu />}
          </Button>
          <div className="flex items-center gap-2">
            <Leaf className="w-8 h-8 text-yellow-400" />
            <span className="font-bold text-white text-xl">PLUMA</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <Leaf className="w-10 h-10 text-yellow-400" />
            <div>
              <h1 className="font-bold text-yellow-300 text-xl">PLUMA</h1>
              <p className="text-xs text-green-200">AGROAVÍCOLA</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-yellow-400 text-primary-900 font-semibold shadow-lg'
                      : 'text-green-100 hover:bg-primary-700 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-700">
          <div className="mb-4 p-3 bg-primary-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{user?.name}</p>
                <p className="text-xs text-green-200">
                  {user?.role === 'admin' ? 'Administrador' : 'Operador'}
                </p>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-green-200 hover:text-white hover:bg-primary-700"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600">
              <Menu />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar no sistema..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button variant="ghost" size="icon" className="text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-cyan-400 flex items-center justify-center text-white font-bold">
                HM
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </header>
        {children}
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
