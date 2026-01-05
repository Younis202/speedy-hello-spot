import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useJobs } from '@/hooks/useJobs';
import { 
  Building2, 
  Calendar, 
  TrendingUp,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toEGP, toMonthlyAmount } from '@/types';
import { cn } from '@/lib/utils';

const frequencyLabels: Record<string, string> = {
  weekly: 'أسبوعي',
  biweekly: 'كل أسبوعين',
  monthly: 'شهري',
  yearly: 'سنوي',
};

export const JobsIncomeCard = () => {
  const { data: jobs = [], isLoading } = useJobs();

  const activeJobs = jobs.filter(j => j.is_active);
  const totalMonthlyIncome = activeJobs.reduce((sum, job) => {
    return sum + toEGP(toMonthlyAmount(job.salary_amount, job.pay_frequency), job.currency);
  }, 0);

  const formatMoney = (amount: number, currency: string = 'EGP') => {
    const symbol = currency === 'USD' ? '$' : 'ج.م';
    return `${new Intl.NumberFormat('ar-EG').format(amount)} ${symbol}`;
  };

  const getNextPayday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingPaydays = activeJobs
      .filter(j => j.next_pay_date)
      .map(j => ({ job: j, date: new Date(j.next_pay_date!) }))
      .filter(p => p.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return upcomingPaydays[0];
  };

  const nextPayday = getNextPayday();

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <Card className="card-elegant">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-elegant overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-500" />
            </div>
            الشغلانات
          </CardTitle>
          <Link 
            to="/jobs" 
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            عرض الكل
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {activeJobs.length === 0 ? (
          <div className="text-center py-6">
            <Building2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">مفيش شغلانات نشطة</p>
            <Link to="/jobs" className="text-primary text-sm hover:underline">
              ضيف شغلانة
            </Link>
          </div>
        ) : (
          <>
            {/* Monthly Income */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="w-4 h-4 text-success" />
                الدخل الشهري الثابت
              </div>
              <p className="text-3xl font-bold text-success">
                {new Intl.NumberFormat('ar-EG').format(totalMonthlyIncome)} ج.م
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                من {activeJobs.length} شغلانة نشطة
              </p>
            </div>

            {/* Next Payday */}
            {nextPayday && (
              <div className={cn(
                "rounded-2xl p-4 border",
                getDaysUntil(nextPayday.job.next_pay_date!) <= 3 
                  ? "bg-success/10 border-success/30" 
                  : "glass border-border/30"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    القبض الجاي
                  </div>
                  {getDaysUntil(nextPayday.job.next_pay_date!) <= 0 ? (
                    <Badge className="bg-success text-success-foreground">النهارده! 🎉</Badge>
                  ) : getDaysUntil(nextPayday.job.next_pay_date!) <= 3 ? (
                    <Badge variant="outline" className="border-success text-success">
                      بعد {getDaysUntil(nextPayday.job.next_pay_date!)} يوم
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{nextPayday.job.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {nextPayday.date.toLocaleDateString('ar-EG', { 
                        weekday: 'long', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">
                      {formatMoney(nextPayday.job.salary_amount, nextPayday.job.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {frequencyLabels[nextPayday.job.pay_frequency]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Active Jobs List */}
            <div className="space-y-2">
              {activeJobs.slice(0, 3).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 px-3 glass rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{job.name}</p>
                      {job.company && (
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">
                      {formatMoney(job.salary_amount, job.currency)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {job.hours_per_day || 8}س/يوم
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
