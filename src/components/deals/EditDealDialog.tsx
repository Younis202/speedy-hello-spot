import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateDeal } from '@/hooks/useDeals';
import { DEAL_TYPES, DEAL_STAGES, PRIORITIES, Deal } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface EditDealDialogProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditDealDialog = ({ deal, open, onOpenChange }: EditDealDialogProps) => {
  const updateDeal = useUpdateDeal();
  const [form, setForm] = useState({
    name: '',
    type: 'وساطة',
    description: '',
    expected_value: '',
    realized_value: '',
    currency: 'EGP',
    stage: 'جديد',
    priority: 'متوسط',
    next_action: '',
    next_action_date: undefined as Date | undefined,
    notes: '',
  });

  useEffect(() => {
    if (deal) {
      setForm({
        name: deal.name || '',
        type: deal.type || 'وساطة',
        description: deal.description || '',
        expected_value: deal.expected_value?.toString() || '',
        realized_value: deal.realized_value?.toString() || '0',
        currency: deal.currency || 'EGP',
        stage: deal.stage || 'جديد',
        priority: deal.priority || 'متوسط',
        next_action: deal.next_action || '',
        next_action_date: deal.next_action_date ? parseISO(deal.next_action_date) : undefined,
        notes: deal.notes || '',
      });
    }
  }, [deal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal || !form.name.trim()) return;

    updateDeal.mutate({
      id: deal.id,
      name: form.name,
      type: form.type,
      description: form.description,
      expected_value: parseFloat(form.expected_value) || 0,
      realized_value: parseFloat(form.realized_value) || 0,
      currency: form.currency,
      stage: form.stage,
      priority: form.priority,
      next_action: form.next_action,
      next_action_date: form.next_action_date ? format(form.next_action_date, 'yyyy-MM-dd') : null,
      notes: form.notes,
      contacts: deal.contacts,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-base">تعديل المصلحة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">اسم المصلحة *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="مثلاً: vistel.cn مصر"
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {DEAL_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">المرحلة</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {DEAL_STAGES.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">القيمة المتوقعة</Label>
              <Input
                type="number"
                value={form.expected_value}
                onChange={(e) => setForm({ ...form, expected_value: e.target.value })}
                placeholder="0"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">العملة</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="EGP">جنيه</SelectItem>
                  <SelectItem value="USD">دولار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-success">الدخل الفعلي (الفلوس اللي دخلت)</Label>
            <Input
              type="number"
              value={form.realized_value}
              onChange={(e) => setForm({ ...form, realized_value: e.target.value })}
              placeholder="0"
              className="h-9 text-sm border-success/30 focus:border-success"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">الأولوية</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {PRIORITIES.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">الخطوة الجاية</Label>
            <Input
              value={form.next_action}
              onChange={(e) => setForm({ ...form, next_action: e.target.value })}
              placeholder="إيه اللي لازم تعمله؟"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">تاريخ الخطوة الجاية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-9 text-sm justify-start text-right font-normal",
                    !form.next_action_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {form.next_action_date 
                    ? format(form.next_action_date, 'PPP', { locale: ar }) 
                    : 'اختر تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover" align="start">
                <Calendar
                  mode="single"
                  selected={form.next_action_date}
                  onSelect={(date) => setForm({ ...form, next_action_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">وصف</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="تفاصيل عن المصلحة..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">ملاحظات</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="ملاحظات إضافية..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9 text-sm">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 h-9 text-sm bg-primary hover:bg-primary/90" disabled={updateDeal.isPending}>
              {updateDeal.isPending ? 'جاري...' : 'حفظ التعديلات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
