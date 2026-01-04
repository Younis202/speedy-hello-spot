import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Phone, 
  Bot,
  Menu,
  X,
  Command,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'الرئيسية', gradient: 'from-amber-500 to-orange-500' },
  { path: '/focus', icon: Target, label: 'الأولويات', gradient: 'from-cyan-500 to-blue-500' },
  { path: '/deals', icon: Briefcase, label: 'المصالح', gradient: 'from-emerald-500 to-teal-500' },
  { path: '/money', icon: Wallet, label: 'الفلوس', gradient: 'from-rose-500 to-pink-500' },
  { path: '/calls', icon: Phone, label: 'المكالمات', gradient: 'from-violet-500 to-purple-500' },
  { path: '/ai', icon: Bot, label: 'المساعد', gradient: 'from-yellow-500 to-amber-500' },
];

// كشف إذا كان التطبيق يعمل في Electron
const isElectron = typeof window !== 'undefined' && !!(window as any).electronAPI?.isElectron;

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={cn(
      "min-h-screen bg-background bg-gradient-mesh",
      isElectron && "pt-10" // إضافة padding للـ Title Bar في Electron
    )}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:flex fixed inset-y-0 right-0 w-72 flex-col glass-dark border-l border-border/30",
        isElectron && "top-10" // تعديل للـ Title Bar
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-border/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center glow-sm">
              <Command className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">Control Room</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                مركز التحكم
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 text-sm relative overflow-hidden",
                  isActive
                    ? "bg-gradient-primary text-primary-foreground shadow-lg glow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-primary-foreground/20" 
                    : "bg-secondary group-hover:bg-gradient-to-br group-hover:" + item.gradient
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    isActive && "text-primary-foreground"
                  )} />
                </div>
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary-foreground/5 pointer-events-none" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-border/20">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-sm text-muted-foreground">الوضع</span>
            <ThemeToggle />
          </div>
          <div className="glass rounded-2xl p-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-hero opacity-50" />
            <div className="relative">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-primary flex items-center justify-center glow-sm">
                <span className="text-lg font-bold text-primary-foreground">ي</span>
              </div>
              <p className="font-bold text-foreground">مرحباً يا يونس</p>
              <p className="text-xs text-muted-foreground mt-1">Control Room v2.0</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={cn(
        "lg:hidden fixed inset-x-0 z-50 glass-dark border-b border-border/20",
        isElectron ? "top-10" : "top-0"
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-sm">
              <Command className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-gradient">Control Room</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-2 animate-fade-in glass-dark">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm",
                    isActive
                      ? "bg-gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    isActive ? "bg-primary-foreground/20" : "bg-secondary"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 glass-dark border-t border-border/20 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isActive && "bg-primary/15 glow-sm"
                )}>
                  <item.icon className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110 text-primary"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-primary"
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className={cn(
        "lg:mr-72 pb-24 lg:pb-0 min-h-screen",
        isElectron ? "pt-6 lg:pt-0" : "pt-16 lg:pt-0"
      )}>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
