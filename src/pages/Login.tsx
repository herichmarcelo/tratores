import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { theme, setPreference } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciais inválidas');
    }
  };

  const toggleTheme = () => {
    setPreference(theme === 'dark' ? 'light' : 'dark');
  };

  const logoImage = theme === 'dark' ? '/ff-black.png' : '/ff-white.png';
  const bgGradient = theme === 'dark' 
    ? 'from-[#0A0A0A] to-[#14141A]' 
    : 'from-primary-50 to-background';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center p-4 transition-colors duration-300`}>
      <Card className={`w-full max-w-md ${theme === 'dark' ? 'bg-[#14141A] border-[#2A2A2A]' : ''}`}>
        {/* Botão de tema */}
        <div className="flex justify-end p-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' 
                ? 'bg-[#1A1A1A] hover:bg-[#2A2A2A] text-ff-yellow' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src={logoImage} 
              alt="Frango Forte Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <CardTitle className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-primary-600'}`}>
            Condominios Frango Forte.
          </CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-[#B3B3B3]' : ''}>
            Sistema de Gestão de Frota Agrícola
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className={`p-3 border rounded-md text-sm ${
                theme === 'dark'
                  ? 'bg-red-900/20 border-red-700 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className={`text-sm font-medium ${theme === 'dark' ? 'text-[#B3B3B3]' : 'text-gray-700'}`}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={theme === 'dark' ? 'bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#B3B3B3]' : ''}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className={`text-sm font-medium ${theme === 'dark' ? 'text-[#B3B3B3]' : 'text-gray-700'}`}>
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={theme === 'dark' ? 'bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-[#B3B3B3]' : ''}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full h-12 text-lg bg-ff-yellow text-black hover:brightness-110">
              Entrar
            </Button>
          </CardFooter>
        </form>

        <div className={`px-6 pb-6 text-center text-xs ${theme === 'dark' ? 'text-[#B3B3B3]' : 'text-gray-500'}`}>
          <p>Acesse com o e-mail e senha cadastrados em Configurações.</p>
          <p className="mt-1">Colaboradores: apenas Dashboard e Abastecimentos.</p>
        </div>
      </Card>
    </div>
  );
};