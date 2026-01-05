import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2,
  Building2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Job, toEGP, toMonthlyAmount, USD_TO_EGP_RATE } from '@/types';
import { useUpdateJob, useDeleteJob } from '@/hooks/useJobs';
import { EditJobDialog } from './EditJobDialog';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface JobCardProps {
  job: Job;
}

const frequencyLabels: Record<string, string> = {
  weekly: 'أسبوعي',
  biweekly: 'كل أسبوعين',
  monthly: 'شهري',
  yearly: 'سنوي',
};

export const JobCard = ({ job }: JobCardProps) => {
  const [editOpen, setEditOpen] = useState(false);
  const updateJob = useUpdateJob();
  const deleteJob = useDeleteJob();

  const formatMoney = (amount: number, currency: string = 'EGP') => {
    const symbol = currency === 'USD' ? '$' : 'ج.م';
    return `${new Intl.NumberFormat('ar-EG').format(amount)} ${symbol}`;
  };

  const monthlyInEGP = toEGP(toMonthlyAmount(job.salary_amount, job.pay_frequency), job.currency);
  
  const getDaysUntilPayday = () => {
    if (!job.next_pay_date) return null;
    const today = new Date();
    const payDate = new Date(job.next_pay_date);
    const diff = Math.ceil((payDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysUntilPay = getDaysUntilPayday();

  return (
    <>
      <Card className={cn(
        "card-elegant overflow-hidden transition-all hover:shadow-lg",
        !job.is_active && "opacity-60"
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                job.is_active 
                  ? "bg-gradient-to-br from-primary/20 to-primary/5 glow-sm" 
                  : "bg-muted"
              )}>
                <Briefcase className={cn("w-6 h-6", job.is_active ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{job.name}</h3>
                {job.company && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {job.company}
                  </p>
                )}
              </div>
            </div>
            
            <Badge variant={job.is_active ? "default" : "secondary"} className={cn(
              "gap-1",
              job.is_active && "bg-success/20 text-success border-success/30"
            )}>
              {job.is_active ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  نشط
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  متوقف
                </>
              )}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                الراتب
              </div>
              <p className="font-bold text-lg">{formatMoney(job.salary_amount, job.currency)}</p>
              <p className="text-xs text-muted-foreground">{frequencyLabels[job.pay_frequency] || job.pay_frequency}</p>
            </div>
            
            <div className="glass rounded-xl p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="w-4 h-4" />
                ساعات/يوم
              </div>
              <p className="font-bold text-lg">{job.hours_per_day || 8}</p>
              <p className="text-xs text-muted-foreground">ساعة</p>
            </div>
          </div>

          {daysUntilPay !== null && (
            <div className={cn(
              "rounded-xl p-3 mb-4",
              daysUntilPay <= 3 ? "bg-success/15 border border-success/30" : "glass"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">القبض الجاي</span>
                </div>
                <div className="text-left">
                  {daysUntilPay <= 0 ? (
                    <Badge className="bg-success text-success-foreground">النهارده! 🎉</Badge>
                  ) : daysUntilPay <= 3 ? (
                    <span className="font-bold text-success">بعد {daysUntilPay} يوم</span>
                  ) : (
                    <span className="font-medium">{new Date(job.next_pay_date!).toLocaleDateString('ar-EG')}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-xl p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">الدخل الشهري (بالجنيه)</p>
            <p className="font-bold text-xl text-success">{new Intl.NumberFormat('ar-EG').format(monthlyInEGP)} ج.م</p>
          </div>

          {job.notes && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.notes}</p>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 gap-1"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="w-4 h-4" />
              تعديل
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateJob.mutate({ id: job.id, is_active: !job.is_active })}
            >
              {job.is_active ? 'إيقاف' : 'تفعيل'}
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>حذف الشغلانة؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    هتحذف "{job.name}" نهائياً. الإجراء دا مش هينفع يترجع.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteJob.mutate(job.id)}
                    className="bg-danger hover:bg-danger/90"
                  >
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
      <EditJobDialog job={job} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
};
