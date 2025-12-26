import { FileText, CheckCircle2, History, Phone, Users, ArrowLeft, Circle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Deal, DealEvent, Call, Contact } from '@/types';
import { DealTask } from '@/hooks/useDealTasks';
import { TabType } from '../DealTabs';

interface OverviewTabProps {
  deal: Deal;
  tasks: DealTask[];
  events: DealEvent[];
  calls: Call[];
  onTabChange: (tab: TabType) => void;
  onToggleTask: (task: DealTask) => void;
}

import { MessageSquareText, PhoneCall, Handshake, RefreshCw, BadgeCheck } from 'lucide-react';

const eventTypeIcons: Record<string, { Icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'ملاحظة': { Icon: MessageSquareText, color: 'text-muted-foreground' },
  'مكالمة': { Icon: PhoneCall, color: 'text-accent' },
  'اجتماع': { Icon: Handshake, color: 'text-primary' },
  'تحديث': { Icon: RefreshCw, color: 'text-warning' },
  'إنجاز': { Icon: BadgeCheck, color: 'text-success' },
};

export const OverviewTab = ({ deal, tasks, events, calls, onTabChange, onToggleTask }: OverviewTabProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const pendingTasks = tasks.filter(t => !t.is_completed).slice(0, 4);
  const recentEvents = events.slice(0, 4);
  const recentCalls = calls.slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Description */}
      {deal.description && (
        <div className="card-elegant p-6">
          <h3 className="section-title mb-4">
            <FileText className="w-5 h-5 text-primary" />
            وصف المصلحة
          </h3>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
            {deal.description}
          </p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              المهام القادمة
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('tasks')}
              className="text-primary gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <div 
                key={task.id} 
                className="list-item group"
              >
                <button 
                  onClick={() => onToggleTask(task)}
                  className="text-muted-foreground hover:text-success transition-colors"
                >
                  <Circle className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.due_date)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {pendingTasks.length === 0 && (
              <div className="empty-state py-8">
                <CheckCircle2 className="empty-state-icon" />
                <p className="empty-state-title">مفيش مهام قادمة 🎉</p>
                <p className="empty-state-description">أضف مهام للمصلحة دي</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <History className="w-5 h-5 text-primary" />
              آخر الأحداث
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('timeline')}
              className="text-primary gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentEvents.map(event => {
              const eventConfig = eventTypeIcons[event.event_type] || { Icon: MessageSquareText, color: 'text-muted-foreground' };
              return (
              <div key={event.id} className="flex items-start gap-3">
                <div className={cn("w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0", eventConfig.color)}>
                  <eventConfig.Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.event_date)}</p>
                </div>
              </div>
            )})}
            
            {recentEvents.length === 0 && (
              <div className="empty-state py-8">
                <History className="empty-state-icon" />
                <p className="empty-state-title">مفيش أحداث لسه</p>
                <p className="empty-state-description">سجّل أول حدث للمصلحة</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <Phone className="w-5 h-5 text-primary" />
              آخر المكالمات
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('calls')}
              className="text-primary gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentCalls.map(call => (
              <div key={call.id} className="list-item">
                <div className="list-item-icon bg-accent/10">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{call.contact_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {call.call_type} • {formatDate(call.call_date)}
                  </p>
                </div>
                {call.result && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                    {call.result}
                  </span>
                )}
              </div>
            ))}
            
            {recentCalls.length === 0 && (
              <div className="empty-state py-8">
                <Phone className="empty-state-icon" />
                <p className="empty-state-title">مفيش مكالمات</p>
                <p className="empty-state-description">سجّل أول مكالمة</p>
              </div>
            )}
          </div>
        </div>

        {/* Contacts Summary */}
        <div className="card-elegant p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="section-title">
              <Users className="w-5 h-5 text-primary" />
              جهات الاتصال
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onTabChange('contacts')}
              className="text-primary gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {deal.contacts?.slice(0, 3).map((contact, index) => (
              <div key={index} className="list-item">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {contact.name?.charAt(0) || '؟'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  {contact.role && (
                    <p className="text-xs text-muted-foreground">{contact.role}</p>
                  )}
                </div>
                {contact.phone && (
                  <a 
                    href={`tel:${contact.phone}`}
                    className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
            
            {(!deal.contacts || deal.contacts.length === 0) && (
              <div className="empty-state py-8">
                <Users className="empty-state-icon" />
                <p className="empty-state-title">مفيش جهات اتصال</p>
                <p className="empty-state-description">أضف جهات اتصال للمصلحة</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
