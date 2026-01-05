import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';
import { useUpdateJob } from '@/hooks/useJobs';
import { Job } from '@/types';

interface EditJobDialogProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditJobDialog = ({ job, open, onOpenChange }: EditJobDialogProps) => {
  const updateJob = useUpdateJob();
  
  const [formData, setFormData] = useState({
    name: job.name,
    company: job.company || '',
    description: job.description || '',
    salary_amount: String(job.salary_amount),
    currency: job.currency,
    pay_frequency: job.pay_frequency,
    hours_per_day: String(job.hours_per_day || 8),
    next_pay_date: job.next_pay_date || '',
    notes: job.notes || '',
  });

  useEffect(() => {
    setFormData({
      name: job.name,
      company: job.company || '',
      description: job.description || '',
      salary_amount: String(job.salary_amount),
      currency: job.currency,
      pay_frequency: job.pay_frequency,
      hours_per_day: String(job.hours_per_day || 8),
      next_pay_date: job.next_pay_date || '',
      notes: job.notes || '',
    });
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateJob.mutate({
      id: job.id,
      name: formData.name,
      company: formData.company || null,
      description: formData.description || null,
      salary_amount: Number(formData.salary_amount) || 0,
      currency: formData.currency,
      pay_frequency: formData.pay_frequency,
      hours_per_day: Number(formData.hours_per_day) || 8,
      next_pay_date: formData.next_pay_date || null,
      notes: formData.notes || null,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Briefcase className="w-5 h-5 text-primary" />
            تعديل الشغلانة
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>اسم الشغلانة *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="col-span-2">
              <Label>الشركة</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            
            <div>
              <Label>الراتب *</Label>
              <Input
                type="number"
                value={formData.salary_amount}
                onChange={(e) => setFormData({ ...formData, salary_amount: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label>العملة</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">دولار $</SelectItem>
                  <SelectItem value="EGP">جنيه ج.م</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>فترة القبض</Label>
              <Select
                value={formData.pay_frequency}
                onValueChange={(value) => setFormData({ ...formData, pay_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">أسبوعي</SelectItem>
                  <SelectItem value="biweekly">كل أسبوعين</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>ساعات العمل/يوم</Label>
              <Input
                type="number"
                value={formData.hours_per_day}
                onChange={(e) => setFormData({ ...formData, hours_per_day: e.target.value })}
              />
            </div>
            
            <div className="col-span-2">
              <Label>تاريخ القبض الجاي</Label>
              <Input
                type="date"
                value={formData.next_pay_date}
                onChange={(e) => setFormData({ ...formData, next_pay_date: e.target.value })}
              />
            </div>
            
            <div className="col-span-2">
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-gradient-primary" disabled={updateJob.isPending}>
              {updateJob.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
