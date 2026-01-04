import { Link } from 'react-router-dom';
import { PrioritizedDeal } from '@/hooks/usePriorityEngine';
import { cn } from '@/lib/utils';
import {
  Target,
  ArrowLeft,
  Zap,
  TrendingUp,
  AlertTriangle,
  Flame,
  Pin,
  ClipboardList
} from 'lucide-react';

interface PriorityCardProps {
  topPriorities: PrioritizedDeal[];
  focusNow?: PrioritizedDeal;
  summary: {
    criticalCount: number;
    needsAttentionCount: number;
  };
}

const focusLevelConfig = {
  critical: {
    label: 'حرج',
    Icon: Flame,
    bg: 'bg-danger/5 border-danger/30',
    badge: 'bg-danger/15 text-danger',
    icon: 'text-danger',
  },
  high: {
    label: 'عالي',
    Icon: Zap,
    bg: 'bg-warning/5 border-warning/30',
    badge: 'bg-warning/15 text-warning',
    icon: 'text-warning',
  },
  medium: {
    label: 'متوسط',
    Icon: Pin,
    bg: 'bg-primary/5 border-primary/20',
    badge: 'bg-primary/15 text-primary',
    icon: 'text-primary',
  },
  low: {
    label: 'عادي',
    Icon: ClipboardList,
    bg: 'bg-muted/50 border-border',
    badge: 'bg-muted text-muted-foreground',
    icon: 'text-muted-foreground',
  },
};

const formatMoney = (amount: number, currency: string = 'EGP') => {
  const formatted = new Intl.NumberFormat('ar-EG').format(amount);
  return currency === 'USD' ? `$${formatted}` : `${formatted} ج.م`;
};

export const PriorityCard = ({ topPriorities, focusNow, summary }: PriorityCardProps) => {
  if (!focusNow || topPriorities.length === 0) {
    return (
      <div className="card-elegant p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">ركز على إيه دلوقتي؟</h3>
            <p className="text-sm text-muted-foreground">Priority Engine</p>
          </div>
        </div>
        <div className="text-center py-6">
          <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">مفيش مصالح نشطة</p>
          <Link
            to="/deals"
            className="text-primary hover:underline text-sm mt-2 inline-block"
          >
            أضف مصلحة جديدة ←
          </Link>
        </div>
      </div>
    );
  }

  const styles = focusLevelConfig[focusNow.focus_level];
  const FocusIcon = styles.Icon;

  return (
    <div className="card-elegant overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center",
              focusNow.focus_level === 'critical' ? 'bg-danger/10' : 'bg-primary/10'
            )}>
              {focusNow.focus_level === 'critical' ? (
                <Flame className="w-5 h-5 text-danger" />
              ) : (
                <Target className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h3 className="font-bold">ركز على إيه دلوقتي؟</h3>
              <p className="text-sm text-muted-foreground">Priority Engine</p>
            </div>
          </div>
          {summary.criticalCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger/10 text-danger text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              {summary.criticalCount} حرجة
            </div>
          )}
        </div>
      </div>

      {/* Focus Now - Main Priority */}
      <Link
        to={`/deals/${focusNow.id}`}
        className={cn(
          "block p-5 transition-all hover:bg-secondary/30",
          styles.bg
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                "text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1",
                styles.badge
              )}>
                <FocusIcon className="w-3 h-3" />
                {styles.label}
              </span>
              <span className="text-xs text-muted-foreground">
                نقاط: {focusNow.priority_score}
              </span>
            </div>

            <h4 className="font-bold text-lg mb-1 truncate">{focusNow.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">{focusNow.type}</p>

            {/* Priority Reasons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {focusNow.priority_reasons.map((reason, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-lg bg-secondary text-foreground/80"
                >
                  {reason}
                </span>
              ))}
            </div>

            {/* Suggested Action */}
            {focusNow.suggested_action && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-background/50 border border-border">
                <TrendingUp className={cn("w-4 h-4", styles.icon)} />
                <span className="text-sm font-medium">{focusNow.suggested_action}</span>
              </div>
            )}
          </div>

          <div className="text-left shrink-0">
            <p className="text-xl font-bold text-success">
              {formatMoney(Number(focusNow.expected_value), focusNow.currency)}
            </p>
            <p className="text-xs text-muted-foreground">{focusNow.stage}</p>
          </div>
        </div>
      </Link>

      {/* Other Top Priorities */}
      {topPriorities.length > 1 && (
        <div className="border-t border-border">
          <div className="px-5 py-3">
            <p className="text-xs font-medium text-muted-foreground mb-3">التالي في الأولوية</p>
            <div className="space-y-2">
              {topPriorities.slice(1, 3).map((deal) => {
                const dealStyles = focusLevelConfig[deal.focus_level];
                return (
                  <Link
                    key={deal.id}
                    to={`/deals/${deal.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      deal.focus_level === 'critical' ? 'bg-danger/10' :
                        deal.focus_level === 'high' ? 'bg-warning/10' : 'bg-primary/10'
                    )}>
                      <span className="text-sm font-bold text-muted-foreground">
                        {deal.priority_score}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{deal.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {deal.priority_reasons[0]}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-success">
                      {formatMoney(Number(deal.expected_value), deal.currency)}
                    </span>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* View All Link */}
      <div className="px-5 py-3 border-t border-border bg-secondary/20">
        <Link
          to="/focus"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          عرض كل الأولويات
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
