import { Layout } from '@/components/Layout';
import { DailyMovesCard } from '@/components/dashboard/DailyMovesCard';
import { MoneyPressureCard } from '@/components/dashboard/MoneyPressureCard';
import { HotDealsCard } from '@/components/dashboard/HotDealsCard';
import { PriorityCard } from '@/components/dashboard/PriorityCard';
import { BlockedDealsCard } from '@/components/dashboard/BlockedDealsCard';
import {
  TrendingUp, 
  Wallet, 
  Target, 
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Briefcase,
  Sparkles,
  Clock,
  Flame
} from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { useDebts } from '@/hooks/useDebts';
import { useDailyMoves } from '@/hooks/useDailyMoves';
import { usePriorityEngine } from '@/hooks/usePriorityEngine';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء النور';
  const timeIcon = hour < 12 ? '☀️' : hour < 18 ? '🌤️' : '🌙';

  const { data: deals = [] } = useDeals();
  const { data: debts = [] } = useDebts();
  const { data: moves = [] } = useDailyMoves();
  
  // Priority Engine
  const { topPriorities, focusNow, blockedDeals, easyWins, summary: prioritySummary } = usePriorityEngine({ deals, debts });

  const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي');
  const totalDebts = debts.filter(d => !d.is_paid).reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);
  const totalExpected = activeDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
  const todayMoves = moves.filter(m => m.move_date === new Date().toISOString().split('T')[0]);
  const completedMoves = todayMoves.filter(m => m.is_completed).length;
  const progressPercent = todayMoves.length > 0 ? Math.round((completedMoves / todayMoves.length) * 100) : 0;

  const formatMoney = (amount: number) => new Intl.NumberFormat('ar-EG').format(amount);

  // Calculate financial health
  const financialHealth = totalDebts > 0 
    ? Math.min(100, Math.round((totalExpected / totalDebts) * 100))
    : 100;

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Hero Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/8 via-accent/5 to-transparent border border-border/50 p-8">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-border/50 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">
                {greeting}، <span className="text-gradient">يونس</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md">
                {focusNow 
                  ? `عندك ${prioritySummary.totalDeals} مصلحة نشطة · ركز على "${focusNow.name}" النهارده`
                  : 'ابدأ يومك بإضافة مصالح جديدة'
                }
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Link 
                to="/deals" 
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-primary text-primary-foreground rounded-2xl font-medium hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
              >
                <Briefcase className="w-5 h-5" />
                المصالح
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/focus" 
                className="inline-flex items-center gap-2 px-5 py-3 bg-card border border-border hover:border-primary/30 rounded-2xl font-medium transition-all hover:scale-[1.02]"
              >
                <Target className="w-5 h-5 text-primary" />
                الأولويات
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview - Redesigned */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Deals */}
          <Link to="/deals" className="group">
            <div className="card-premium p-5 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-4xl font-bold mb-1">{activeDeals.length}</p>
              <p className="text-sm text-muted-foreground">مصلحة نشطة</p>
              {prioritySummary.criticalCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/10 text-danger text-xs font-medium">
                  <Flame className="w-3 h-3" />
                  {prioritySummary.criticalCount} حرجة
                </div>
              )}
            </div>
          </Link>

          {/* Expected Value */}
          <Link to="/deals" className="group">
            <div className="card-premium p-5 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-bold text-success mb-1">{formatMoney(totalExpected)}</p>
              <p className="text-sm text-muted-foreground">القيمة المتوقعة</p>
              <p className="text-xs text-muted-foreground/70 mt-1">جنيه مصري</p>
            </div>
          </Link>

          {/* Total Debts */}
          <Link to="/money" className="group">
            <div className={cn(
              "card-premium p-5 h-full",
              totalDebts > 0 && "border-danger/20"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                  totalDebts > 0 ? "bg-danger/10" : "bg-success/10"
                )}>
                  <Wallet className={cn("w-6 h-6", totalDebts > 0 ? "text-danger" : "text-success")} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className={cn(
                "text-3xl font-bold mb-1",
                totalDebts > 0 ? "text-danger" : "text-success"
              )}>
                {totalDebts > 0 ? formatMoney(totalDebts) : 'صفر'}
              </p>
              <p className="text-sm text-muted-foreground">الديون المتبقية</p>
              {totalDebts > 0 && financialHealth >= 100 && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  تقدر تسدد!
                </div>
              )}
            </div>
          </Link>

          {/* Today's Progress */}
          <div className="card-premium p-5 h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              {todayMoves.length > 0 && (
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  progressPercent === 100 
                    ? "bg-success/15 text-success" 
                    : progressPercent >= 50 
                      ? "bg-accent/15 text-accent"
                      : "bg-muted text-muted-foreground"
                )}>
                  {progressPercent}%
                </span>
              )}
            </div>
            <p className="text-4xl font-bold mb-1">
              {completedMoves}<span className="text-2xl text-muted-foreground">/{todayMoves.length}</span>
            </p>
            <p className="text-sm text-muted-foreground">تحركات اليوم</p>
            {todayMoves.length > 0 && (
              <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progressPercent === 100 ? "bg-success" : "bg-gradient-accent"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Priority Engine Section */}
        <div className="space-y-6">
          <PriorityCard 
            topPriorities={topPriorities}
            focusNow={focusNow}
            summary={prioritySummary}
          />
          
          {/* Blocked Deals Warning */}
          <BlockedDealsCard blockedDeals={blockedDeals} />
        </div>

        {/* Main Grid - Better Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DailyMovesCard />
          <MoneyPressureCard />
        </div>

        {/* Hot Deals */}
        <HotDealsCard />
      </div>
    </Layout>
  );
};

export default Dashboard;