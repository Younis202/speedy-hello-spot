import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useDeals } from '@/hooks/useDeals';
import { useDebts } from '@/hooks/useDebts';
import { usePriorityEngine, PrioritizedDeal } from '@/hooks/usePriorityEngine';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Target, 
  ArrowLeft, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  Flame,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Briefcase,
  Wallet,
  Pin,
  ClipboardList,
  CircleDot,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const focusLevelConfig = {
  critical: {
    label: 'حرج',
    Icon: Flame,
    bg: 'bg-danger/5 border-danger/30 hover:bg-danger/10',
    badge: 'bg-danger/15 text-danger',
    progress: 'bg-danger',
  },
  high: {
    label: 'عالي',
    Icon: Zap,
    bg: 'bg-warning/5 border-warning/30 hover:bg-warning/10',
    badge: 'bg-warning/15 text-warning',
    progress: 'bg-warning',
  },
  medium: {
    label: 'متوسط',
    Icon: Pin,
    bg: 'bg-primary/5 border-primary/20 hover:bg-primary/10',
    badge: 'bg-primary/15 text-primary',
    progress: 'bg-primary',
  },
  low: {
    label: 'عادي',
    Icon: ClipboardList,
    bg: 'bg-muted/30 border-border hover:bg-muted/50',
    badge: 'bg-muted text-muted-foreground',
    progress: 'bg-muted-foreground',
  },
};

const formatMoney = (amount: number, currency: string = 'EGP') => {
  const formatted = new Intl.NumberFormat('ar-EG').format(amount);
  return currency === 'USD' ? `$${formatted}` : `${formatted} ج.م`;
};

const FocusPage = () => {
  const { data: deals = [] } = useDeals();
  const { data: debts = [] } = useDebts();
  const { 
    prioritizedDeals, 
    topPriorities, 
    focusNow, 
    criticalDeals,
    needsAttention,
    summary 
  } = usePriorityEngine({ deals, debts });
  
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'attention'>('all');

  const filteredDeals = prioritizedDeals.filter(deal => {
    if (filter === 'all') return true;
    if (filter === 'attention') return needsAttention.some(d => d.id === deal.id);
    return deal.focus_level === filter;
  });

  const totalDebt = debts.filter(d => !d.is_paid).reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              Priority Engine
            </h1>
            <p className="text-muted-foreground">ركز على اللي يفرق معاك فعلاً</p>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{summary.totalDeals}</p>
            <p className="text-sm text-muted-foreground">مصلحة نشطة</p>
          </div>

          <div className={cn(
            "card-elegant p-5",
            summary.criticalCount > 0 && "border-danger/30 bg-danger/5"
          )}>
            <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-danger" />
            </div>
            <p className="text-2xl font-bold text-danger">{summary.criticalCount}</p>
            <p className="text-sm text-muted-foreground">مصلحة حرجة</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatMoney(summary.totalValue)}</p>
            <p className="text-sm text-muted-foreground">القيمة المتوقعة</p>
          </div>

          <div className={cn(
            "card-elegant p-5",
            summary.needsAttentionCount > 0 && "border-warning/30 bg-warning/5"
          )}>
            <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{summary.needsAttentionCount}</p>
            <p className="text-sm text-muted-foreground">محتاجة اهتمام</p>
          </div>
        </div>

        {/* Focus Now - Hero Card */}
        {focusNow && (
          <div className="card-elegant overflow-hidden border-2 border-primary/30">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">ركز على دي دلوقتي</h2>
                  <p className="text-sm text-muted-foreground">أهم حاجة تعملها النهارده</p>
                </div>
              </div>
              
              <Link 
                to={`/deals/${focusNow.id}`}
                className="block p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const config = focusLevelConfig[focusNow.focus_level];
                        const IconComponent = config.Icon;
                        return (
                          <span className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1",
                            config.badge
                          )}>
                            <IconComponent className="w-3 h-3" />
                            {config.label}
                          </span>
                        );
                      })()}
                      <span className="text-sm font-bold text-primary">
                        {focusNow.priority_score} نقطة
                      </span>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-1">{focusNow.name}</h3>
                    <p className="text-muted-foreground mb-4">{focusNow.type} • {focusNow.stage}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {focusNow.priority_reasons.map((reason, i) => (
                        <span 
                          key={i}
                          className="text-sm px-3 py-1.5 rounded-lg bg-secondary"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    {focusNow.suggested_action && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium">
                        <CheckCircle2 className="w-5 h-5" />
                        {focusNow.suggested_action}
                      </div>
                    )}
                  </div>
                  
                  <div className="text-left">
                    <p className="text-3xl font-bold text-success">
                      {formatMoney(Number(focusNow.expected_value), focusNow.currency)}
                    </p>
                    {totalDebt > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.round((Number(focusNow.expected_value) / totalDebt) * 100)}% من الديون
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">افتح المصلحة</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: `الكل (${prioritizedDeals.length})`, icon: Eye },
            { key: 'critical', label: `حرج (${criticalDeals.length})`, icon: Flame },
            { key: 'attention', label: `محتاج اهتمام (${needsAttention.length})`, icon: AlertTriangle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-sm font-medium transition-all shrink-0 flex items-center gap-2",
                filter === key 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Prioritized Deals List */}
        <div className="space-y-3 stagger-children">
          {filteredDeals.length === 0 ? (
            <div className="card-elegant text-center py-16">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/25" />
              <p className="text-lg font-medium text-muted-foreground mb-2">مفيش مصالح في الفلتر ده</p>
              <Button variant="outline" onClick={() => setFilter('all')}>
                عرض الكل
              </Button>
            </div>
          ) : (
            filteredDeals.map((deal, index) => {
              const config = focusLevelConfig[deal.focus_level];
              const isTop3 = index < 3;
              
              // Readiness score color
              const readinessColor = deal.readiness_score >= 70 ? 'bg-success' : 
                deal.readiness_score >= 50 ? 'bg-warning' : 'bg-danger';
              const readinessTextColor = deal.readiness_score >= 70 ? 'text-success' : 
                deal.readiness_score >= 50 ? 'text-warning' : 'text-danger';
              
              return (
                <Link
                  key={deal.id}
                  to={`/deals/${deal.id}`}
                  className={cn(
                    "block card-elegant p-5 transition-all border",
                    config.bg,
                    isTop3 && "ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0",
                      isTop3 ? "bg-primary/10" : "bg-secondary"
                    )}>
                      <span className="text-lg font-bold">{index + 1}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const IconComp = config.Icon;
                        return (
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1",
                              config.badge
                            )}>
                              <IconComp className="w-3 h-3" />
                              {deal.priority_score}
                            </span>
                            <span className="text-xs text-muted-foreground">{deal.stage}</span>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                              deal.execution_difficulty === 'easy' ? 'bg-success/15 text-success' :
                              deal.execution_difficulty === 'medium' ? 'bg-warning/15 text-warning' :
                              'bg-danger/15 text-danger'
                            )}>
                              {deal.execution_difficulty === 'easy' ? <Target className="w-3 h-3" /> :
                               deal.execution_difficulty === 'medium' ? <Zap className="w-3 h-3" /> :
                               <Flame className="w-3 h-3" />}
                              {deal.execution_difficulty === 'easy' ? 'سهل' :
                               deal.execution_difficulty === 'medium' ? 'متوسط' : 'صعب'}
                            </span>
                          </div>
                        );
                      })()}
                      
                      <h3 className="font-bold text-lg mb-0.5 truncate">{deal.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{deal.type}</p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {deal.priority_reasons.map((reason, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-md bg-secondary/80">
                            {reason}
                          </span>
                        ))}
                      </div>

                      {deal.blockers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {deal.blockers.map((blocker, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded-md bg-danger/10 text-danger flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {blocker}
                            </span>
                          ))}
                        </div>
                      )}

                      {deal.suggested_action && (
                        <p className="text-sm text-primary font-medium flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {deal.suggested_action}
                        </p>
                      )}
                    </div>

                    {/* Value & Readiness */}
                    <div className="text-left shrink-0 space-y-2">
                      <p className="text-xl font-bold text-success">
                        {formatMoney(Number(deal.expected_value), deal.currency)}
                      </p>
                      
                      {/* Readiness Score */}
                      <div className="text-center">
                        <div className={cn("text-lg font-bold", readinessTextColor)}>
                          {deal.readiness_score}%
                        </div>
                        <p className="text-[10px] text-muted-foreground">جاهزية</p>
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                          <div 
                            className={cn("h-full rounded-full transition-all", readinessColor)}
                            style={{ width: `${deal.readiness_score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Priority Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Priority Score</span>
                      <span>{deal.priority_score}/100</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full rounded-full transition-all", config.progress)}
                        style={{ width: `${deal.priority_score}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default FocusPage;
