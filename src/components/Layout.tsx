import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  Phone, 
  Bot,
  Menu,
  X,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'الرئيسية' },
  { path: '/focus', icon: Command, label: 'الأولويات' },
  { path: '/deals', icon: Briefcase, label: 'المصالح' },
  { path: '/money', icon: Wallet, label: 'الفلوس' },
  { path: '/calls', icon: Phone, label: 'المكالمات' },
  { path: '/ai', icon: Bot, label: 'المساعد' },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 right-0 w-64 flex-col bg-sidebar border-l border-sidebar-border">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Command className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Control Room</h1>
              <p className="text-xs text-muted-foreground">مركز التحكم</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm",
                location.pathname === item.path
                  ? "bg-gradient-primary text-primary-foreground shadow-lg glow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-secondary/50 rounded-xl p-4 text-center">
            <p className="text-sm font-medium">مرحباً يا يونس</p>
            <p className="text-xs text-muted-foreground mt-1">v1.0</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Command className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold">Control Room</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <nav className="px-4 pb-4 space-y-1 animate-fade-in bg-background">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm",
                  location.pathname === item.path
                    ? "bg-gradient-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all",
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                location.pathname === item.path && "scale-110"
              )} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:mr-64 pt-14 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
