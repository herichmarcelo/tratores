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
  { label: 'Tratores', icon: Tractor, path: '/tractors', roles: ['admin'] },
  { label: 'Abastecimento', icon: Fuel, path: '/refuel', roles: ['admin', 'collaborator'] },
  { label: 'Checklist', icon: ClipboardList, path: '/checklist', roles: ['admin', 'collaborator'] },
  { label: 'Pneus', icon: Truck, path: '/tires', roles: ['admin'] },
  { label: 'Manutenção', icon: Wrench, path: '/maintenance', roles: ['admin'] },
  { label: 'Relatórios', icon: FileText, path: '/reports', roles: ['admin'] },
  { label: 'Configurações', icon: Settings, path: '/settings', roles: ['admin'] },
  { label: 'Perfil', icon: User, path: '/profile', roles: ['admin', 'collaborator'] },
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
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <Tractor className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-primary-600">PLUMA FLEET</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-30 h-full w-64 bg-white border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <Tractor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-primary-600 text-lg">PLUMA FLEET</h1>
              <p className="text-xs text-gray-500">Gestão Agrícola</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">
              {user?.role === 'admin' ? 'Administrador' : 'Operador'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
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
