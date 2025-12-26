import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, Edit3, MoreVertical, Flame, Zap, Clock, TrendingUp, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Deal } from '@/types';

const stageStyles: Record<string, string> = {
  'جديد': 'badge-primary',
  'بتتكلم': 'badge-warning',
  'مفاوضات': 'bg-accent/10 text-accent border border-accent/20',
  'مستني رد': 'badge-muted',
  'مستني توقيع': 'badge-success',
  'مقفول': 'bg-success/20 text-success border border-success/30',
  'ملغي': 'badge-muted',
};

const priorityConfig: Record<string, { label: string; class: string; Icon: React.ComponentType<{ className?: string }> }> = {
  'عالي': { label: 'أولوية عالية', class: 'text-danger', Icon: Flame },
  'متوسط': { label: 'أولوية متوسطة', class: 'text-warning', Icon: Zap },
  'منخفض': { label: 'أولوية منخفضة', class: 'text-muted-foreground', Icon: Clock },
};

interface DealHeaderProps {
  deal: Deal;
  onDelete: () => void;
  onEdit?: () => void;
}

export const DealHeader = ({ deal, onDelete, onEdit }: DealHeaderProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatMoney = (amount: number, currency: string) => {
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);
    return currency === 'USD' ? `$${formatted}` : `${formatted} ج.م`;
  };

  const priorityInfo = priorityConfig[deal.priority] || priorityConfig['متوسط'];
  const PriorityIcon = priorityInfo.Icon;

  return (
    <div className="card-premium p-6 animate-fade-in">
      {/* Top Row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Link 
            to="/deals" 
            className="mt-1 p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold">{deal.name}</h1>
              <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", stageStyles[deal.stage])}>
                {deal.stage}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary/50" />
                {deal.type}
              </span>
              <span className="text-border">•</span>
              <span className={cn("flex items-center gap-1.5", priorityInfo.class)}>
                <PriorityIcon className="w-4 h-4" />
                {priorityInfo.label}
              </span>
              <span className="text-border">•</span>
              <span>أُنشئت {formatDate(deal.created_at)}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              تعديل المصلحة
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-danger focus:text-danger">
              <Trash2 className="w-4 h-4" />
              حذف المصلحة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Value Highlight */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-gradient-hero border border-primary/10">
        <div>
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            القيمة المتوقعة
          </p>
          <p className="text-3xl font-bold text-gradient">
            {formatMoney(Number(deal.expected_value), deal.currency)}
          </p>
        </div>
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
          <Banknote className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>
    </div>
  );
};
