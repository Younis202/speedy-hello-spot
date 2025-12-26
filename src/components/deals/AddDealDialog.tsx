import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateDeal } from '@/hooks/useDeals';
import { DEAL_TYPES, DEAL_STAGES, PRIORITIES } from '@/types';

interface AddDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDealDialog = ({ open, onOpenChange }: AddDealDialogProps) => {
  const createDeal = useCreateDeal();
  const [form, setForm] = useState({
    name: '',
    type: 'وساطة',
    description: '',
    expected_value: '',
    currency: 'EGP',
    stage: 'جديد',
    priority: 'متوسط',
    next_action: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    createDeal.mutate({
      name: form.name,
      type: form.type,
      description: form.description,
      expected_value: parseFloat(form.expected_value) || 0,
      currency: form.currency,
      stage: form.stage,
      priority: form.priority,
      next_action: form.next_action,
      notes: form.notes,
      contacts: [],
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({
          name: '',
          type: 'وساطة',
          description: '',
          expected_value: '',
          currency: 'EGP',
          stage: 'جديد',
          priority: 'متوسط',
          next_action: '',
          notes: '',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">مصلحة جديدة</DialogTitle>
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
                <SelectContent>
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
                <SelectContent>
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
                <SelectContent>
                  <SelectItem value="EGP">جنيه</SelectItem>
                  <SelectItem value="USD">دولار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">الأولوية</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <Label className="text-xs">وصف</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="تفاصيل عن المصلحة..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 h-9 text-sm">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1 h-9 text-sm bg-primary hover:bg-primary/90" disabled={createDeal.isPending}>
              {createDeal.isPending ? 'جاري...' : 'أضف'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
