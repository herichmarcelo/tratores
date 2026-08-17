import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pluma_pwa_install_dismissed';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[70] mx-auto max-w-md rounded-xl border border-[#262626] bg-[#14141A] p-4 shadow-2xl lg:bottom-6 lg:left-auto lg:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ff-yellow/20">
          <Download className="h-5 w-5 text-ff-yellow" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">Instalar Pluma Fleet</p>
          <p className="mt-1 text-sm text-[#B3B3B3]">
            Adicione à tela inicial para usar no campo, inclusive offline.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              className="bg-ff-yellow text-black hover:brightness-110 h-8 text-xs"
              onClick={() => void handleInstall()}
            >
              Instalar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 text-xs text-[#B3B3B3]"
              onClick={handleDismiss}
            >
              Agora não
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[#666] hover:text-white shrink-0"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
