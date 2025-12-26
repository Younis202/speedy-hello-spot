import { DollarSign, Target, CheckCircle2, Clock, Phone, Users, FileText, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealStatsProps {
  deal: {
    expected_value: number;
    currency: string;
    stage: string;
    updated_at: string;
    next_action_date?: string;
    contacts?: { name: string }[];
  };
  tasksCount: { completed: number; total: number };
  callsCount: number;
  eventsCount: number;
}

export const DealStats = ({ deal, tasksCount, callsCount, eventsCount }: DealStatsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const stats = [
    {
      icon: CheckCircle2,
      label: 'تقدم المهام',
      value: tasksCount.total > 0 
        ? `${Math.round((tasksCount.completed / tasksCount.total) * 100)}%` 
        : '0%',
      subValue: `${tasksCount.completed}/${tasksCount.total}`,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Users,
      label: 'جهات الاتصال',
      value: deal.contacts?.length || 0,
      subValue: 'شخص',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Phone,
      label: 'المكالمات',
      value: callsCount,
      subValue: 'مكالمة',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Clock,
      label: 'آخر تحديث',
      value: formatDate(deal.updated_at),
      subValue: '',
      color: 'text-muted-foreground',
      bgColor: 'bg-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, index) => (
        <div 
          key={stat.label} 
          className="card-elegant p-5 hover-lift"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={cn("p-2.5 rounded-xl", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
          <p className="text-2xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">
            {stat.label} {stat.subValue && <span className="opacity-70">({stat.subValue})</span>}
          </p>
        </div>
      ))}
    </div>
  );
};
