import { useReminders, formatReminderDate, getTodayReminders, getTomorrowReminders, getUpcomingReminders, Reminder } from '@/hooks/useReminders';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  Phone, 
  Target, 
  CreditCard, 
  CheckSquare, 
  ChevronLeft,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ReminderTypeIcon = ({ type }: { type: Reminder['type'] }) => {
  switch (type) {
    case 'call_followup':
      return <Phone className="w-4 h-4" />;
    case 'deal_action':
      return <Target className="w-4 h-4" />;
    case 'debt_due':
      return <CreditCard className="w-4 h-4" />;
    case 'task_due':
      return <CheckSquare className="w-4 h-4" />;
  }
};

const ReminderItem = ({ reminder }: { reminder: Reminder }) => {
  const content = (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all",
      "bg-card border border-border/50 hover:border-primary/20 hover:bg-primary/5",
      reminder.priority === 'high' && "border-danger/30 bg-danger/5"
    )}>
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
        reminder.priority === 'high' ? 'bg-danger/15 text-danger' :
        reminder.priority === 'medium' ? 'bg-warning/15 text-warning' :
        'bg-primary/15 text-primary'
      )}>
        <ReminderTypeIcon type={reminder.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{reminder.title}</p>
        <p className="text-xs text-muted-foreground truncate">{reminder.subtitle}</p>
      </div>
      {reminder.link && (
        <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
    </div>
  );

  if (reminder.link) {
    return <Link to={reminder.link}>{content}</Link>;
  }
  return content;
};

const ReminderSection = ({ title, reminders, icon: Icon }: { 
  title: string; 
  reminders: Reminder[];
  icon: React.ComponentType<{ className?: string }>;
}) => {
  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{title}</span>
        <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{reminders.length}</span>
      </div>
      <div className="space-y-2">
        {reminders.map(reminder => (
          <ReminderItem key={reminder.id} reminder={reminder} />
        ))}
      </div>
    </div>
  );
};

export const RemindersPanel = () => {
  const { data: reminders = [], isLoading } = useReminders();
  
  const todayReminders = getTodayReminders(reminders);
  const tomorrowReminders = getTomorrowReminders(reminders);
  const upcomingReminders = getUpcomingReminders(reminders);

  return (
    <div className="card-elegant p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center",
          todayReminders.some(r => r.priority === 'high') 
            ? "bg-danger/10" 
            : "bg-primary/10"
        )}>
          <Bell className={cn(
            "w-5 h-5",
            todayReminders.some(r => r.priority === 'high') 
              ? "text-danger" 
              : "text-primary"
          )} />
        </div>
        <div>
          <h2 className="font-bold text-lg">التذكيرات</h2>
          <p className="text-sm text-muted-foreground">
            {reminders.length > 0 
              ? `${reminders.length} تذكير قادم` 
              : 'مفيش تذكيرات'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-8">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground font-medium mb-1">مفيش تذكيرات</p>
          <p className="text-xs text-muted-foreground/70">كل حاجة تمام للأسبوع الجاي</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today Alert */}
          {todayReminders.length > 0 && (
            <div className="bg-primary/8 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">عندك {todayReminders.length} تذكير النهارده</p>
                <p className="text-xs text-muted-foreground">
                  {todayReminders.filter(r => r.priority === 'high').length > 0 && 
                    `منهم ${todayReminders.filter(r => r.priority === 'high').length} عاجل`}
                </p>
              </div>
            </div>
          )}

          <ReminderSection 
            title="النهارده" 
            reminders={todayReminders} 
            icon={AlertCircle}
          />
          
          <ReminderSection 
            title="بكره" 
            reminders={tomorrowReminders} 
            icon={CalendarClock}
          />
          
          <ReminderSection 
            title="الأيام الجاية" 
            reminders={upcomingReminders.slice(0, 5)} 
            icon={CalendarClock}
          />
        </div>
      )}
    </div>
  );
};
