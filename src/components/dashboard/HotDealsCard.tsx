import { useDeals } from '@/hooks/useDeals';
import { Link } from 'react-router-dom';
import { ChevronLeft, Briefcase, ArrowUpRight, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toEGP } from '@/types';

const stageStyles: Record<string, string> = {
  'جديد': 'bg-primary/12 text-primary border-primary/20',
  'بتتكلم': 'bg-warning/12 text-warning border-warning/20',
  'مفاوضات': 'bg-accent/12 text-accent border-accent/20',
  'مستني رد': 'bg-muted/80 text-muted-foreground border-border',
  'مستني توقيع': 'bg-success/12 text-success border-success/20',
  'مؤجل': 'bg-secondary text-secondary-foreground border-border',
  'مقفول': 'bg-success/15 text-success border-success/25',
  'ملغي': 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  'عالي': 'bg-danger',
  'متوسط': 'bg-warning',
  'منخفض': 'bg-muted-foreground/50',
};

export const HotDealsCard = () => {
  const { data: deals = [], isLoading } = useDeals();
  
  const activeDeals = deals
    .filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي' && d.stage !== 'مؤجل')
    .sort((a, b) => {
      const priorityOrder = { 'عالي': 0, 'متوسط': 1, 'منخفض': 2 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
    })
    .slice(0, 6);
  
  const formatMoney = (amount: number, currency: string = 'EGP') => 
    currency === 'USD' 
      ? `$${new Intl.NumberFormat('ar-EG').format(amount)}` 
      : `${new Intl.NumberFormat('ar-EG').format(amount)} ج.م`;

  // Convert all to EGP for accurate total
  const totalExpectedEGP = activeDeals.reduce((sum, d) => 
    sum + toEGP(Number(d.expected_value || 0), d.currency), 0);

  return (
    <div className="card-elegant overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">المصالح الساخنة</h2>
              <p className="text-sm text-muted-foreground">
                {activeDeals.length} مصلحة نشطة · <span className="text-success font-medium">{formatMoney(totalExpectedEGP)}</span> متوقع
              </p>
            </div>
          </div>
          <Link 
            to="/deals" 
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="p-6 pt-5">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activeDeals.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium mb-2">مفيش مصالح نشطة</p>
            <p className="text-sm text-muted-foreground/70 mb-5">ابدأ بإضافة أول مصلحة</p>
            <Link 
              to="/deals" 
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 shadow-lg shadow-primary/20"
            >
              أضف مصلحة جديدة
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeals.map((deal, index) => (
              <Link 
                key={deal.id} 
                to={`/deals/${deal.id}`} 
                className="group block p-5 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/20 transition-all hover:shadow-lg hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Deal Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full shrink-0",
                        priorityColors[deal.priority] || 'bg-muted-foreground/50'
                      )} />
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {deal.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{deal.type}</p>
                  </div>
                  <span className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border shrink-0 font-medium",
                    stageStyles[deal.stage] || 'bg-muted text-muted-foreground border-border'
                  )}>
                    {deal.stage}
                  </span>
                </div>

                {/* Next Action */}
                {deal.next_action && (
                  <div className="bg-background/60 rounded-lg p-3 mb-4 border border-border/30">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                      <Clock className="w-3 h-3" />
                      <span>الخطوة الجاية</span>
                    </div>
                    <p className="text-xs line-clamp-2">{deal.next_action}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/30">
                  <span className="text-xl font-bold text-success">
                    {formatMoney(Number(deal.expected_value), deal.currency)}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
