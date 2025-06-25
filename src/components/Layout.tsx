
import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  onBack?: () => void;
  title?: string;
}

const Layout = ({ children, onBack, title = "Vigilância Condomínio" }: LayoutProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="flex-shrink-0 hover:scale-105 transition-transform"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">VC</span>
                </div>
                <h1 className="text-sm sm:text-xl font-bold text-slate-800 dark:text-white truncate">
                  {title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hover:scale-105 transition-transform w-8 h-8 sm:w-10 sm:h-10"
              >
                {theme === 'dark' ? (
                  <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
