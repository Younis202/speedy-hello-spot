import { useState } from 'react';
import { Plus, History, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { DealEvent } from '@/types';

interface TimelineTabProps {
  events: DealEvent[];
  onAddEvent: (event: { title: string; event_type: string; description?: string }) => void;
}

import { MessageSquareText, PhoneCall, Handshake, RefreshCw, BadgeCheck } from 'lucide-react';

const eventTypeConfig: Record<string, { Icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  'ملاحظة': { Icon: MessageSquareText, color: 'bg-secondary text-foreground', label: 'ملاحظة' },
  'مكالمة': { Icon: PhoneCall, color: 'bg-accent/10 text-accent', label: 'مكالمة' },
  'اجتماع': { Icon: Handshake, color: 'bg-primary/10 text-primary', label: 'اجتماع' },
  'تحديث': { Icon: RefreshCw, color: 'bg-warning/10 text-warning', label: 'تحديث' },
  'إنجاز': { Icon: BadgeCheck, color: 'bg-success/10 text-success', label: 'إنجاز' },
};

export const TimelineTab = ({ events, onAddEvent }: TimelineTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: 'ملاحظة',
    description: '',
  });

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return;
    onAddEvent({
      title: newEvent.title,
      event_type: newEvent.event_type,
      description: newEvent.description || undefined,
    });
    setNewEvent({ title: '', event_type: 'ملاحظة', description: '' });
    setShowForm(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      month: 'long',
      day: 'numeric',
    });
  };

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.event_date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, DealEvent[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add Event Form */}
      <div className="card-elegant p-6">
        {!showForm ? (
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-primary hover:opacity-90 gap-2 py-6"
          >
            <Plus className="w-5 h-5" />
            إضافة حدث جديد
          </Button>
        ) : (
          <div className="space-y-4">
            <h3 className="section-title">
              <History className="w-5 h-5 text-primary" />
              تسجيل حدث
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="form-label">ماذا حدث؟ *</label>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="مثال: تم الاتفاق على السعر النهائي"
                />
              </div>
              <div>
                <label className="form-label">نوع الحدث</label>
                <Select 
                  value={newEvent.event_type} 
                  onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <config.Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="form-label">تفاصيل إضافية (اختياري)</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="أي تفاصيل إضافية..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddEvent} className="bg-gradient-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date} className="space-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-secondary rounded-full flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(dateEvents[0].event_date)}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <div className="space-y-0">
            {dateEvents.map((event, index) => {
              const config = eventTypeConfig[event.event_type] || eventTypeConfig['ملاحظة'];
              const isLast = index === dateEvents.length - 1;
              
              return (
                <div key={event.id} className="flex gap-4 animate-fade-in">
                  {/* Timeline Line & Icon */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      config.color
                    )}>
                      <config.Icon className="w-6 h-6" />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 flex-1 bg-border my-2 min-h-[24px]" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
                    <div className="card-elegant p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{event.title}</h4>
                          {event.description && (
                            <p className="text-muted-foreground mt-2 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>
                        <span className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium shrink-0",
                          config.color
                        )}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        {formatDateTime(event.event_date)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {events.length === 0 && !showForm && (
        <div className="card-elegant p-12">
          <div className="empty-state">
            <History className="empty-state-icon" />
            <p className="empty-state-title">مفيش أحداث لسه</p>
            <p className="empty-state-description">سجّل الأحداث والتطورات اللي بتحصل في المصلحة</p>
          </div>
        </div>
      )}
    </div>
  );
};
