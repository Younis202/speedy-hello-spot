import { useState } from 'react';
import { Target, Edit3, Calendar, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DealNextActionProps {
  nextAction?: string;
  nextActionDate?: string;
  onUpdate: (nextAction: string, nextActionDate?: string) => void;
}

export const DealNextAction = ({ nextAction, nextActionDate, onUpdate }: DealNextActionProps) => {
  const [editing, setEditing] = useState(false);
  const [actionValue, setActionValue] = useState(nextAction || '');
  const [dateValue, setDateValue] = useState(nextActionDate || '');

  const handleSave = () => {
    onUpdate(actionValue, dateValue || undefined);
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isOverdue = nextActionDate && new Date(nextActionDate) < new Date();
  const isToday = nextActionDate && new Date(nextActionDate).toDateString() === new Date().toDateString();

  return (
    <div className={cn(
      "card-premium p-6 animate-fade-in",
      "bg-gradient-to-r from-primary/5 via-transparent to-accent/5",
      "border-primary/20"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-primary">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg">الخطوة الجاية</h2>
            <p className="text-sm text-muted-foreground">إيه المطلوب تعمله دلوقتي؟</p>
          </div>
        </div>
        
        {!editing && (
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-2"
            onClick={() => {
              setActionValue(nextAction || '');
              setDateValue(nextActionDate || '');
              setEditing(true);
            }}
          >
            <Edit3 className="w-4 h-4" />
            تعديل
          </Button>
        )}
      </div>
      
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="form-label">الخطوة المطلوبة</label>
            <Input
              value={actionValue}
              onChange={(e) => setActionValue(e.target.value)}
              placeholder="مثال: اتصل بأحمد لمتابعة العرض"
              className="bg-background/80"
            />
          </div>
          <div>
            <label className="form-label">تاريخ التنفيذ (اختياري)</label>
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="bg-background/80"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 gap-2">
              <CheckCircle2 className="w-4 h-4" />
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className={cn(
            "text-xl font-semibold",
            nextAction ? "text-foreground" : "text-muted-foreground italic"
          )}>
            {nextAction || "لم يتم تحديد خطوة بعد..."}
          </p>
          
          {nextActionDate && (
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
              isOverdue && "bg-danger/10 text-danger",
              isToday && "bg-warning/10 text-warning",
              !isOverdue && !isToday && "bg-secondary text-muted-foreground"
            )}>
              <Calendar className="w-4 h-4" />
              <span>{formatDate(nextActionDate)}</span>
              {isOverdue && <span className="font-semibold">(متأخرة!)</span>}
              {isToday && <span className="font-semibold">(اليوم)</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
