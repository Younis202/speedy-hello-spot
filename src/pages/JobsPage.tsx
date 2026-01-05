import { Layout } from '@/components/Layout';
import { useJobs } from '@/hooks/useJobs';
import { AddJobDialog } from '@/components/jobs/AddJobDialog';
import { JobCard } from '@/components/jobs/JobCard';
import { 
  Briefcase, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Wallet
} from 'lucide-react';
import { toEGP, toMonthlyAmount } from '@/types';

const JobsPage = () => {
  const { data: jobs = [], isLoading } = useJobs();

  const activeJobs = jobs.filter(j => j.is_active);
  const totalMonthlyIncome = activeJobs.reduce((sum, job) => {
    return sum + toEGP(toMonthlyAmount(job.salary_amount, job.pay_frequency), job.currency);
  }, 0);
  const totalHoursPerDay = activeJobs.reduce((sum, job) => sum + (job.hours_per_day || 8), 0);

  const formatMoney = (amount: number) => new Intl.NumberFormat('ar-EG').format(amount);

  const getNextPayday = () => {
    const upcomingPaydays = activeJobs
      .filter(j => j.next_pay_date)
      .map(j => ({ job: j, date: new Date(j.next_pay_date!) }))
      .filter(p => p.date >= new Date())
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return upcomingPaydays[0];
  };

  const nextPayday = getNextPayday();

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in" dir="rtl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center glow-sm">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              الشغلانات
            </h1>
            <p className="text-muted-foreground mt-1">إدارة الوظائف والدخل المتكرر</p>
          </div>
          <AddJobDialog />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card-elegant p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">شغلانات نشطة</span>
            </div>
            <p className="text-3xl font-bold">{activeJobs.length}</p>
          </div>

          <div className="card-elegant p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">الدخل الشهري</span>
            </div>
            <p className="text-2xl font-bold text-success">{formatMoney(totalMonthlyIncome)} ج.م</p>
          </div>

          <div className="card-elegant p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">ساعات/يوم</span>
            </div>
            <p className="text-3xl font-bold">{totalHoursPerDay}</p>
          </div>

          <div className="card-elegant p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">القبض الجاي</span>
            </div>
            {nextPayday ? (
              <div>
                <p className="font-bold">{nextPayday.job.name}</p>
                <p className="text-sm text-muted-foreground">
                  {nextPayday.date.toLocaleDateString('ar-EG')}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">لا يوجد</p>
            )}
          </div>
        </div>

        {/* Jobs Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground mt-4">جاري التحميل...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="card-elegant p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">مفيش شغلانات</h3>
            <p className="text-muted-foreground mb-6">ضيف أول شغلانة عشان تتابع الدخل المتكرر</p>
            <AddJobDialog />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JobsPage;
