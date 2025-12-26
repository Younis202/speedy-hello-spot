import { useDebts } from '@/hooks/useDebts';
import { Link } from 'react-router-dom';
import { AlertTriangle, ChevronLeft, Wallet, TrendingDown, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MoneyPressureCard = () => {
  const { data: debts = [], isLoading } = useDebts();
  const unpaidDebts = debts.filter(d => !d.is_paid);
  const totalDebt = unpaidDebts.reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);
  const monthlyPayments = unpaidDebts.reduce((sum, d) => sum + Number(d.monthly_payment || 0), 0);
  const highPressureCount = unpaidDebts.filter(d => d.pressure_level === 'عالي').length;
  
  const formatMoney = (amount: number) => new Intl.NumberFormat('ar-EG').format(amount);

  return (
    <div className="card-elegant overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
              highPressureCount > 0 
                ? "bg-gradient-to-br from-danger to-danger/80 shadow-danger/20" 
                : "bg-gradient-to-br from-warning to-warning/80 shadow-warning/20"
            )}>
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">ضغط الفلوس</h2>
              <p className="text-sm text-muted-foreground">{unpaidDebts.length} دين نشط</p>
            </div>
          </div>
          <Link 
            to="/money" 
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            التفاصيل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="p-6 pt-5">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
            <div className="h-16 bg-secondary/50 rounded-xl animate-pulse" />
          </div>
        ) : unpaidDebts.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-success/10 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-success" />
            </div>
            <p className="text-success font-bold text-lg mb-1">مفيش ديون</p>
            <p className="text-sm text-muted-foreground">الحمد لله، كله تمام</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-danger/5 border border-danger/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-danger" />
                  <span className="text-xs text-muted-foreground">إجمالي الديون</span>
                </div>
                <p className="text-xl font-bold text-danger">{formatMoney(totalDebt)} ج.م</p>
              </div>
              <div className="bg-warning/5 border border-warning/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-warning" />
                  <span className="text-xs text-muted-foreground">الأقساط الشهرية</span>
                </div>
                <p className="text-xl font-bold text-warning">{formatMoney(monthlyPayments)} ج.م</p>
              </div>
            </div>

            {/* High Pressure Alert */}
            {highPressureCount > 0 && (
              <div className="bg-danger/5 border border-danger/15 rounded-xl p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-danger">تنبيه ضغط عالي</p>
                  <p className="text-xs text-muted-foreground">
                    عندك {highPressureCount} دين ضغطه عالي ومحتاج اهتمام
                  </p>
                </div>
              </div>
            )}

            {/* Debts Preview */}
            <div className="space-y-2">
              {unpaidDebts.slice(0, 3).map(debt => (
                <div 
                  key={debt.id} 
                  className="flex items-center justify-between p-3.5 bg-secondary/20 border border-border/30 rounded-xl hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-2.5 h-2.5 rounded-full",
                      debt.pressure_level === 'عالي' ? 'bg-danger' :
                      debt.pressure_level === 'متوسط' ? 'bg-warning' : 'bg-muted-foreground/40'
                    )} />
                    <span className="text-sm font-medium">{debt.creditor_name}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {formatMoney(Number(debt.remaining_amount || debt.amount))} ج.م
                  </span>
                </div>
              ))}
              {unpaidDebts.length > 3 && (
                <Link 
                  to="/money"
                  className="block text-center text-sm text-primary font-medium hover:underline py-2"
                >
                  +{unpaidDebts.length - 3} ديون أخرى
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
