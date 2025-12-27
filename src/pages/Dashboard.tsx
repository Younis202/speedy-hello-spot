import { Layout } from '@/components/Layout';
import { DailyMovesCard } from '@/components/dashboard/DailyMovesCard';
import { MoneyPressureCard } from '@/components/dashboard/MoneyPressureCard';
import { HotDealsCard } from '@/components/dashboard/HotDealsCard';
import { PriorityCard } from '@/components/dashboard/PriorityCard';
import { BlockedDealsCard } from '@/components/dashboard/BlockedDealsCard';
import {
  TrendingUp, 
  Wallet, 
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Briefcase,
  Target,
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

  const formatMoney = (amount: number) => new Intl.NumberFormat('ar-EG').format(amount);

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{today.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            {greeting}، <span className="text-primary">يونس</span>
          </h1>
          <p className="text-muted-foreground">
            {focusNow 
              ? <>عندك <span className="font-semibold text-foreground">{prioritySummary.totalDeals}</span> مصلحة نشطة</>
              : 'ابدأ يومك بإضافة مصالح جديدة'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Link 
            to="/deals" 
            className="inline-flex items-center gap-3 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all"
          >
            <Briefcase className="w-5 h-5" />
            <span>المصالح</span>
            <span className="bg-primary-foreground/20 px-2 py-0.5 rounded-md text-sm">{activeDeals.length}</span>
          </Link>
          <Link 
            to="/focus" 
            className="inline-flex items-center gap-3 px-5 py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-secondary/80 transition-all"
          >
            <Target className="w-5 h-5" />
            <span>الأولويات</span>
            {prioritySummary.criticalCount > 0 && (
              <span className="bg-danger/20 text-danger px-2 py-0.5 rounded-md text-sm">{prioritySummary.criticalCount}</span>
            )}
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {/* Active Deals */}
          <Link to="/deals" className="group">
            <div className="card-elegant p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-3xl font-bold text-foreground">{activeDeals.length}</p>
              <p className="text-sm text-muted-foreground mt-1">مصلحة نشطة</p>
              {prioritySummary.criticalCount > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 badge-danger">
                  <Flame className="w-3 h-3" />
                  {prioritySummary.criticalCount} حرجة
                </div>
              )}
            </div>
          </Link>

          {/* Expected Value */}
          <Link to="/deals" className="group">
            <div className="card-elegant p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold text-success">{formatMoney(totalExpected)}</p>
              <p className="text-sm text-muted-foreground mt-1">القيمة المتوقعة</p>
            </div>
          </Link>

          {/* Total Debts */}
          <Link to="/money" className="group">
            <div className={cn("card-elegant p-5", totalDebts > 0 && "border-danger/20")}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  totalDebts > 0 ? "bg-danger/10" : "bg-success/10"
                )}>
                  <Wallet className={cn("w-6 h-6", totalDebts > 0 ? "text-danger" : "text-success")} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className={cn("text-2xl font-bold", totalDebts > 0 ? "text-danger" : "text-success")}>
                {totalDebts > 0 ? formatMoney(totalDebts) : 'صفر'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">الديون المتبقية</p>
            </div>
          </Link>

          {/* Today's Progress */}
          <div className="card-elegant p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-accent" />
              </div>
              {todayMoves.length > 0 && (
                <span className={cn(
                  "text-xs font-bold px-2 py-1 rounded-md",
                  progressPercent === 100 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                )}>
                  {progressPercent}%
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-foreground">
              {completedMoves}<span className="text-xl text-muted-foreground">/{todayMoves.length}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">تحركات اليوم</p>
            {todayMoves.length > 0 && (
              <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    progressPercent === 100 ? "bg-success" : "bg-primary"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Priority Section */}
        <div className="space-y-6">
          <PriorityCard 
            topPriorities={topPriorities}
            focusNow={focusNow}
            summary={prioritySummary}
          />
          <BlockedDealsCard blockedDeals={blockedDeals} />
        </div>

        {/* Main Grid */}
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
