import { Layout } from '@/components/Layout';
import { DailyMovesCard } from '@/components/dashboard/DailyMovesCard';
import { MoneyPressureCard } from '@/components/dashboard/MoneyPressureCard';
import { HotDealsCard } from '@/components/dashboard/HotDealsCard';
import { PriorityCard } from '@/components/dashboard/PriorityCard';
import { BlockedDealsCard } from '@/components/dashboard/BlockedDealsCard';
import { JobsIncomeCard } from '@/components/dashboard/JobsIncomeCard';
import {
  TrendingUp, 
  Wallet, 
  Target, 
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Briefcase,
  Sparkles,
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
  
  const { topPriorities, focusNow, blockedDeals, summary: prioritySummary } = usePriorityEngine({ deals, debts });

  const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي');
  const totalDebts = debts.filter(d => !d.is_paid).reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);
  const totalExpected = activeDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
  const todayMoves = moves.filter(m => m.move_date === new Date().toISOString().split('T')[0]);
  const completedMoves = todayMoves.filter(m => m.is_completed).length;
  const progressPercent = todayMoves.length > 0 ? Math.round((completedMoves / todayMoves.length) * 100) : 0;
  const financialHealth = totalDebts > 0 ? Math.min(100, Math.round((totalExpected / totalDebts) * 100)) : 100;

  const formatMoney = (amount: number) => new Intl.NumberFormat('ar-EG').format(amount);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl card-hero p-8">
          <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-tl from-accent/15 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-lg">{timeIcon}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold">
                {greeting}، <span className="text-gradient">يونس</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                {focusNow 
                  ? <>عندك <span className="text-foreground font-semibold">{prioritySummary.totalDeals}</span> مصلحة نشطة · ركز على "<span className="text-primary font-semibold">{focusNow.name}</span>" النهارده</>
                  : 'ابدأ يومك بإضافة مصالح جديدة'
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link 
                to="/deals" 
                className="group inline-flex items-center gap-3 px-6 py-4 bg-gradient-primary text-primary-foreground rounded-2xl font-medium hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg glow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="block font-bold">المصالح</span>
                  <span className="text-xs opacity-80">{activeDeals.length} نشطة</span>
                </div>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link 
                to="/focus" 
                className="group inline-flex items-center gap-3 px-6 py-4 glass hover:bg-secondary/50 rounded-2xl font-medium transition-all hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <div className="text-right">
                  <span className="block font-bold">الأولويات</span>
                  <span className="text-xs text-muted-foreground">{prioritySummary.criticalCount} حرجة</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/deals" className="group">
            <div className="card-elegant p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform glow-sm">
                  <Briefcase className="w-7 h-7 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <p className="text-4xl font-bold mb-1">{activeDeals.length}</p>
              <p className="text-sm text-muted-foreground">مصلحة نشطة</p>
              {prioritySummary.criticalCount > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-danger/15 text-danger text-xs font-medium glow-danger">
                  <Flame className="w-3.5 h-3.5" />
                  {prioritySummary.criticalCount} حرجة
                </div>
              )}
            </div>
          </Link>

          <Link to="/deals" className="group">
            <div className="card-elegant p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/5 flex items-center justify-center group-hover:scale-110 transition-transform glow-success">
                  <TrendingUp className="w-7 h-7 text-success" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <p className="text-3xl font-bold text-success mb-1">{formatMoney(totalExpected)}</p>
              <p className="text-sm text-muted-foreground">القيمة المتوقعة</p>
              <p className="text-xs text-muted-foreground/60 mt-1">جنيه مصري</p>
            </div>
          </Link>

          <Link to="/money" className="group">
            <div className={cn("card-elegant p-6 h-full", totalDebts > 0 && "border-danger/30")}>
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                  totalDebts > 0 ? "bg-gradient-to-br from-danger/20 to-danger/5 glow-danger" : "bg-gradient-to-br from-success/20 to-success/5 glow-success"
                )}>
                  <Wallet className={cn("w-7 h-7", totalDebts > 0 ? "text-danger" : "text-success")} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <p className={cn("text-3xl font-bold mb-1", totalDebts > 0 ? "text-danger" : "text-success")}>
                {totalDebts > 0 ? formatMoney(totalDebts) : 'صفر'}
              </p>
              <p className="text-sm text-muted-foreground">الديون المتبقية</p>
              {totalDebts > 0 && financialHealth >= 100 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/15 text-success text-xs font-medium glow-success">
                  <Sparkles className="w-3.5 h-3.5" />
                  تقدر تسدد!
                </div>
              )}
            </div>
          </Link>

          <div className="card-elegant p-6 h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center glow-accent">
                <CheckCircle className="w-7 h-7 text-accent" />
              </div>
              {todayMoves.length > 0 && (
                <span className={cn(
                  "text-sm font-bold px-3 py-1 rounded-full",
                  progressPercent === 100 ? "bg-success/20 text-success" : progressPercent >= 50 ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
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
              <div className="mt-4 h-2.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-700", progressPercent === 100 ? "bg-gradient-to-r from-success to-emerald-400" : "bg-gradient-accent")}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Priority Engine */}
        <PriorityCard topPriorities={topPriorities} focusNow={focusNow} summary={prioritySummary} />
        
        {blockedDeals.length > 0 && <BlockedDealsCard blockedDeals={blockedDeals} />}

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <DailyMovesCard />
          <JobsIncomeCard />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MoneyPressureCard />
          <HotDealsCard />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
