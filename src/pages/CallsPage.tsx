import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useAllCalls, useTodayFollowUps, useCreateCall, useDeleteCall, CallWithDeal } from '@/hooks/useAllCalls';
import { useDeals } from '@/hooks/useDeals';
import { 
  Phone, PhoneOutgoing, PhoneIncoming, RefreshCw, Plus, Search, Filter, 
  Calendar, Clock, MessageSquare, ChevronDown, ChevronUp, X, Bell, 
  TrendingUp, PhoneCall, AlertCircle, Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CALL_TYPES } from '@/types';
import { Link } from 'react-router-dom';

const callTypeConfig: Record<string, { color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  'صادر': { color: 'bg-primary/10 text-primary border-primary/20', Icon: PhoneOutgoing },
  'وارد': { color: 'bg-success/10 text-success border-success/20', Icon: PhoneIncoming },
  'متابعة': { color: 'bg-accent/10 text-accent border-accent/20', Icon: RefreshCw },
};

const CallsPage = () => {
  const { data: allCalls = [], isLoading } = useAllCalls();
  const { data: todayFollowUps = [] } = useTodayFollowUps();
  const { data: deals = [] } = useDeals();
  const createCall = useCreateCall();
  const deleteCall = useDeleteCall();

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  
  const [newCall, setNewCall] = useState({
    contact_name: '',
    phone_number: '',
    call_type: 'صادر',
    result: '',
    notes: '',
    follow_up_date: '',
    deal_id: '',
  });

  // Filter and search calls
  const filteredCalls = useMemo(() => {
    return allCalls.filter(call => {
      const matchesSearch = 
        call.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.result?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.deals?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || call.call_type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [allCalls, searchQuery, filterType]);

  // Statistics
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const todayCalls = allCalls.filter(c => c.call_date.split('T')[0] === today);
    const weekCalls = allCalls.filter(c => new Date(c.call_date) >= thisWeekStart);
    const pendingFollowUps = allCalls.filter(c => c.follow_up_date && new Date(c.follow_up_date) <= new Date());
    
    return {
      total: allCalls.length,
      today: todayCalls.length,
      thisWeek: weekCalls.length,
      pendingFollowUps: pendingFollowUps.length,
      todayFollowUps: todayFollowUps.length,
    };
  }, [allCalls, todayFollowUps]);

  const handleAddCall = () => {
    if (!newCall.contact_name.trim()) return;
    createCall.mutate({
      ...newCall,
      deal_id: newCall.deal_id || undefined,
      follow_up_date: newCall.follow_up_date || undefined,
    });
    setNewCall({
      contact_name: '',
      phone_number: '',
      call_type: 'صادر',
      result: '',
      notes: '',
      follow_up_date: '',
      deal_id: '',
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
  const groupedCalls = useMemo(() => {
    return filteredCalls.reduce((acc, call) => {
      const date = new Date(call.call_date).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(call);
      return acc;
    }, {} as Record<string, CallWithDeal[]>);
  }, [filteredCalls]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-32 bg-card rounded-2xl animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-card rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-card rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-primary">
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </div>
                مركز المكالمات
              </h1>
              <p className="page-description">تتبع كل مكالماتك ومتابعاتك من مكان واحد</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-primary hover:opacity-90 gap-2"
            >
              <Plus className="w-5 h-5" />
              تسجيل مكالمة
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="card-elegant p-5 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <PhoneCall className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">إجمالي المكالمات</p>
          </div>
          
          <div className="card-elegant p-5 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.today}</p>
            <p className="text-sm text-muted-foreground">مكالمات اليوم</p>
          </div>
          
          <div className="card-elegant p-5 hover-lift">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.thisWeek}</p>
            <p className="text-sm text-muted-foreground">هذا الأسبوع</p>
          </div>
          
          <div className={cn(
            "card-elegant p-5 hover-lift",
            stats.todayFollowUps > 0 && "border-warning/30 bg-warning/5"
          )}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-warning/10">
                <Bell className="w-5 h-5 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stats.todayFollowUps}</p>
            <p className="text-sm text-muted-foreground">متابعات اليوم</p>
          </div>
        </div>

        {/* Today's Follow-ups Alert */}
        {todayFollowUps.length > 0 && (
          <div className="card-premium p-5 border-warning/30 bg-warning/5 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-bold">متابعات اليوم</h3>
                <p className="text-sm text-muted-foreground">عندك {todayFollowUps.length} متابعة لازم تعملها النهاردة</p>
              </div>
            </div>
            <div className="space-y-2">
              {todayFollowUps.slice(0, 3).map(call => (
                <div key={call.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <Phone className="w-4 h-4 text-warning" />
                  <span className="font-medium">{call.contact_name}</span>
                  {call.phone_number && (
                    <span className="text-sm text-muted-foreground" dir="ltr">{call.phone_number}</span>
                  )}
                  {call.deals && (
                    <Link 
                      to={`/deals/${call.deals.id}`}
                      className="text-xs text-primary hover:underline flex items-center gap-1 mr-auto"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {call.deals.name}
                    </Link>
                  )}
                </div>
              ))}
              {todayFollowUps.length > 3 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  و {todayFollowUps.length - 3} متابعات أخرى...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Add Call Form */}
        {showForm && (
          <div className="card-premium p-6 animate-scale-in">
            <h3 className="section-title mb-5">
              <Phone className="w-5 h-5 text-primary" />
              تسجيل مكالمة جديدة
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
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">ربط بمصلحة (اختياري)</label>
                <Select 
                  value={newCall.deal_id || "none"} 
                  onValueChange={(v) => setNewCall({ ...newCall, deal_id: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مصلحة..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون مصلحة</SelectItem>
                    {deals.map(deal => (
                      <SelectItem key={deal.id} value={deal.id}>
                        {deal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="form-label">النتيجة</label>
                <Input
                  value={newCall.result}
                  onChange={(e) => setNewCall({ ...newCall, result: e.target.value })}
                  placeholder="مثال: وافق على العرض، طلب عرض سعر، مشغول..."
                />
              </div>
              <div className="md:col-span-2">
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
            </div>
            
            <div className="flex gap-3 mt-6">
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

        {/* Search and Filter */}
        <div className="card-elegant p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الشخص، رقم التليفون، المصلحة..."
                className="pr-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="نوع المكالمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  {CALL_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(searchQuery || filterType !== 'all') && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          {filteredCalls.length !== allCalls.length && (
            <p className="text-sm text-muted-foreground mt-3">
              عرض {filteredCalls.length} من {allCalls.length} مكالمة
            </p>
          )}
        </div>

        {/* Calls Timeline */}
        {Object.entries(groupedCalls).map(([date, dateCalls]) => (
          <div key={date} className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm font-medium text-muted-foreground px-4 py-1.5 bg-secondary rounded-full flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(dateCalls[0].call_date)}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            
            <div className="space-y-3 stagger-children">
              {dateCalls.map((call) => {
                const typeConfig = callTypeConfig[call.call_type] || callTypeConfig['صادر'];
                const isExpanded = expandedCall === call.id;
                
                return (
                  <div 
                    key={call.id} 
                    className="card-premium p-5 cursor-pointer group"
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
                            <h4 className="font-bold text-lg">{call.contact_name}</h4>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 text-danger hover:text-danger hover:bg-danger/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCall.mutate({ id: call.id, deal_id: call.deal_id || undefined });
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateTime(call.call_date)}
                          </p>
                          
                          {call.deals && (
                            <Link 
                              to={`/deals/${call.deals.id}`}
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <LinkIcon className="w-3 h-3" />
                              {call.deals.name}
                            </Link>
                          )}
                        </div>
                        
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
                          <div className={cn(
                            "mt-3 flex items-center gap-2 text-sm",
                            new Date(call.follow_up_date) <= new Date() ? "text-warning" : "text-muted-foreground"
                          )}>
                            <Calendar className="w-4 h-4" />
                            <span>متابعة: {formatDate(call.follow_up_date)}</span>
                            {new Date(call.follow_up_date).toDateString() === new Date().toDateString() && (
                              <span className="text-warning font-medium">(اليوم!)</span>
                            )}
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
        {allCalls.length === 0 && (
          <div className="card-elegant p-16">
            <div className="empty-state">
              <Phone className="empty-state-icon" />
              <p className="empty-state-title">مفيش مكالمات مسجلة</p>
              <p className="empty-state-description">ابدأ بتسجيل أول مكالمة علشان تتابع تواصلك</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="mt-6 bg-gradient-primary hover:opacity-90 gap-2"
              >
                <Plus className="w-4 h-4" />
                سجّل أول مكالمة
              </Button>
            </div>
          </div>
        )}

        {/* No Results */}
        {allCalls.length > 0 && filteredCalls.length === 0 && (
          <div className="card-elegant p-12">
            <div className="empty-state">
              <Search className="empty-state-icon" />
              <p className="empty-state-title">مفيش نتائج</p>
              <p className="empty-state-description">جرب تغير كلمات البحث أو الفلتر</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CallsPage;
