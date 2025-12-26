import { useState } from 'react';
import { Plus, Phone, Calendar, MessageSquare, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Call, CALL_TYPES } from '@/types';

interface CallsTabProps {
  calls: Call[];
  onAddCall: (call: Omit<Call, 'id' | 'created_at' | 'call_date'>) => void;
}

import { PhoneOutgoing, PhoneIncoming, RefreshCw } from 'lucide-react';

const callTypeConfig: Record<string, { color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  'صادر': { color: 'bg-primary/10 text-primary border-primary/20', Icon: PhoneOutgoing },
  'وارد': { color: 'bg-success/10 text-success border-success/20', Icon: PhoneIncoming },
  'متابعة': { color: 'bg-accent/10 text-accent border-accent/20', Icon: RefreshCw },
};

export const CallsTab = ({ calls, onAddCall }: CallsTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newCall, setNewCall] = useState({
    contact_name: '',
    phone_number: '',
    call_type: 'صادر',
    result: '',
    notes: '',
    follow_up_date: '',
  });
  const [expandedCall, setExpandedCall] = useState<string | null>(null);

  const handleAddCall = () => {
    if (!newCall.contact_name.trim()) return;
    onAddCall({
      ...newCall,
      follow_up_date: newCall.follow_up_date || undefined,
    });
    setNewCall({
      contact_name: '',
      phone_number: '',
      call_type: 'صادر',
      result: '',
      notes: '',
      follow_up_date: '',
    });
    setShowForm(false);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
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

  // Group calls by date
  const groupedCalls = calls.reduce((acc, call) => {
    const date = new Date(call.call_date).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(call);
    return acc;
  }, {} as Record<string, Call[]>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add Call Form */}
      <div className="card-elegant p-6">
        {!showForm ? (
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-primary hover:opacity-90 gap-2 py-6"
          >
            <Phone className="w-5 h-5" />
            تسجيل مكالمة جديدة
          </Button>
        ) : (
          <div className="space-y-5">
            <h3 className="section-title">
              <Phone className="w-5 h-5 text-primary" />
              تسجيل مكالمة
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">اسم الشخص *</label>
                <Input
                  value={newCall.contact_name}
                  onChange={(e) => setNewCall({ ...newCall, contact_name: e.target.value })}
                  placeholder="مين اتكلمت معاه؟"
                />
              </div>
              <div>
                <label className="form-label">رقم التليفون</label>
                <Input
                  value={newCall.phone_number}
                  onChange={(e) => setNewCall({ ...newCall, phone_number: e.target.value })}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="form-label">نوع المكالمة</label>
                <Select 
                  value={newCall.call_type} 
                  onValueChange={(v) => setNewCall({ ...newCall, call_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CALL_TYPES.map(type => {
                      const config = callTypeConfig[type];
                      return (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2">
                          {config && <config.Icon className="w-4 h-4" />}
                          {type}
                        </span>
                      </SelectItem>
                    );})}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">النتيجة</label>
                <Input
                  value={newCall.result}
                  onChange={(e) => setNewCall({ ...newCall, result: e.target.value })}
                  placeholder="مثال: وافق على العرض"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">ملاحظات</label>
              <Textarea
                value={newCall.notes}
                onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
                placeholder="تفاصيل المكالمة..."
                rows={3}
              />
            </div>
            
            <div>
              <label className="form-label">تاريخ المتابعة (اختياري)</label>
              <Input
                type="date"
                value={newCall.follow_up_date}
                onChange={(e) => setNewCall({ ...newCall, follow_up_date: e.target.value })}
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddCall} className="bg-gradient-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" />
                سجّل المكالمة
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Calls Timeline */}
      {Object.entries(groupedCalls).map(([date, dateCalls]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground px-3 py-1 bg-secondary rounded-full">
              {formatDate(dateCalls[0].call_date)}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <div className="space-y-4 stagger-children">
            {dateCalls.map((call) => {
              const typeConfig = callTypeConfig[call.call_type] || callTypeConfig['صادر'];
              const isExpanded = expandedCall === call.id;
              
              return (
                <div 
                  key={call.id} 
                  className="card-premium p-5 cursor-pointer"
                  onClick={() => setExpandedCall(isExpanded ? null : call.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      typeConfig.color
                    )}>
                      <typeConfig.Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold">{call.contact_name}</h4>
                          {call.phone_number && (
                            <p className="text-sm text-muted-foreground" dir="ltr">
                              {call.phone_number}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium border",
                            typeConfig.color
                          )}>
                            {call.call_type}
                          </span>
                          {(call.notes || call.result) && (
                            isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(call.call_date)}
                      </p>
                      
                      {call.result && (
                        <p className="text-sm mt-2">
                          <span className="text-muted-foreground">النتيجة:</span>{' '}
                          <span className="font-medium">{call.result}</span>
                        </p>
                      )}
                      
                      {isExpanded && call.notes && (
                        <div className="mt-4 p-4 rounded-xl bg-secondary/50 animate-fade-in-fast">
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{call.notes}</span>
                          </p>
                        </div>
                      )}
                      
                      {call.follow_up_date && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-warning">
                          <Calendar className="w-4 h-4" />
                          <span>متابعة: {formatDate(call.follow_up_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Empty State */}
      {calls.length === 0 && !showForm && (
        <div className="card-elegant p-12">
          <div className="empty-state">
            <Phone className="empty-state-icon" />
            <p className="empty-state-title">مفيش مكالمات مسجلة</p>
            <p className="empty-state-description">سجّل المكالمات اللي بتعملها علشان تتابع التواصل</p>
          </div>
        </div>
      )}
    </div>
  );
};
