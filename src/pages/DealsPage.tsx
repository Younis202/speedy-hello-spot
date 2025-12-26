import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useDeals, useDeleteDeal } from '@/hooks/useDeals';
import { Link } from 'react-router-dom';
import { Deal } from '@/types';
import { 
  Plus, 
  Search, 
  Trash2, 
  ArrowLeft,
  Pencil,
  Briefcase, 
  Clock, 
  Filter,
  TrendingUp,
  ArrowUpRight,
  LayoutGrid,
  List,
  Target,
  Zap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AddDealDialog } from '@/components/deals/AddDealDialog';
import { EditDealDialog } from '@/components/deals/EditDealDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { ar } from 'date-fns/locale';

const stageStyles: Record<string, string> = {
  'جديد': 'bg-primary/12 text-primary border-primary/20',
  'بتتكلم': 'bg-warning/12 text-warning border-warning/20',
  'مفاوضات': 'bg-accent/12 text-accent border-accent/20',
  'مستني رد': 'bg-muted/80 text-muted-foreground border-border',
  'مستني توقيع': 'bg-success/12 text-success border-success/20',
  'مقفول': 'bg-success/15 text-success border-success/25',
  'ملغي': 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  'عالي': 'bg-danger',
  'متوسط': 'bg-warning',
  'منخفض': 'bg-muted-foreground/50',
};

const DealsPage = () => {
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editDeal, setEditDeal] = useState<Deal | null>(null);

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(search.toLowerCase()) ||
                         deal.type.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !filterStage || deal.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  // Statistics
  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي');
    const closedDeals = deals.filter(d => d.stage === 'مقفول');
    const cancelledDeals = deals.filter(d => d.stage === 'ملغي');
    
    const totalExpected = activeDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
    const closedValue = closedDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
    
    const highPriority = activeDeals.filter(d => d.priority === 'عالي').length;
    
    // Deals needing action today
    const needsActionToday = activeDeals.filter(d => {
      if (!d.next_action_date) return false;
      const actionDate = parseISO(d.next_action_date);
      return isToday(actionDate) || isPast(actionDate);
    });

    // Deals needing action tomorrow
    const needsActionTomorrow = activeDeals.filter(d => {
      if (!d.next_action_date) return false;
      return isTomorrow(parseISO(d.next_action_date));
    });

    return {
      total: deals.length,
      active: activeDeals.length,
      closed: closedDeals.length,
      cancelled: cancelledDeals.length,
      totalExpected,
      closedValue,
      highPriority,
      needsActionToday: needsActionToday.length,
      needsActionTomorrow: needsActionTomorrow.length,
      urgentDeals: needsActionToday,
    };
  }, [deals]);

  const formatMoney = (amount: number, currency: string = 'EGP') => {
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);
    return currency === 'USD' ? `$${formatted}` : `${formatted} ج.م`;
  };

  const stages = ['جديد', 'بتتكلم', 'مفاوضات', 'مستني رد', 'مستني توقيع', 'مقفول', 'ملغي'];

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary-foreground" />
              </div>
              المصالح
            </h1>
            <p className="text-muted-foreground">تتبع كل مصالحك وصفقاتك من مكان واحد</p>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)} 
            className="bg-gradient-primary text-primary-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            مصلحة جديدة
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-muted-foreground">من {stats.total} مصلحة</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">المصالح النشطة</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatMoney(stats.totalExpected)}</p>
            <p className="text-xs text-muted-foreground">قيمة متوقعة</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">من المصالح النشطة</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold">{stats.closed}</p>
            <p className="text-xs text-muted-foreground">{formatMoney(stats.closedValue)}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">مصالح مقفولة</p>
          </div>

          <div className={cn(
            "card-elegant p-5",
            stats.needsActionToday > 0 && "border-warning/30 bg-warning/5"
          )}>
            <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{stats.needsActionToday}</p>
            <p className="text-xs text-muted-foreground">تحتاج إجراء النهارده</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">مصالح عاجلة</p>
          </div>
        </div>

        {/* Urgent Deals Alert */}
        {stats.urgentDeals.length > 0 && (
          <div className="card-elegant p-5 border-warning/30 bg-warning/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-bold">مصالح تحتاج إجراء</h3>
                <p className="text-sm text-muted-foreground">
                  عندك {stats.urgentDeals.length} مصلحة محتاجة اهتمام النهارده
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {stats.urgentDeals.slice(0, 3).map(deal => (
                <Link 
                  key={deal.id} 
                  to={`/deals/${deal.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
                >
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    priorityColors[deal.priority] || 'bg-muted-foreground/50'
                  )} />
                  <span className="font-medium flex-1">{deal.name}</span>
                  <span className="text-xs text-muted-foreground">{deal.next_action}</span>
                  <ArrowLeft className="w-4 h-4 text-primary" />
                </Link>
              ))}
              {stats.urgentDeals.length > 3 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  و {stats.urgentDeals.length - 3} مصالح أخرى...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Priority Distribution */}
        {stats.active > 0 && (
          <div className="card-elegant p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              توزيع المصالح
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-danger/5 rounded-xl border border-danger/10">
                <p className="text-3xl font-bold text-danger">
                  {deals.filter(d => d.priority === 'عالي' && d.stage !== 'مقفول' && d.stage !== 'ملغي').length}
                </p>
                <p className="text-sm text-muted-foreground">أولوية عالية</p>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-xl border border-warning/10">
                <p className="text-3xl font-bold text-warning">
                  {deals.filter(d => d.priority === 'متوسط' && d.stage !== 'مقفول' && d.stage !== 'ملغي').length}
                </p>
                <p className="text-sm text-muted-foreground">أولوية متوسطة</p>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-xl border border-border">
                <p className="text-3xl font-bold text-muted-foreground">
                  {deals.filter(d => d.priority === 'منخفض' && d.stage !== 'مقفول' && d.stage !== 'ملغي').length}
                </p>
                <p className="text-sm text-muted-foreground">أولوية منخفضة</p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="card-elegant p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن مصلحة..."
                className="pr-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className={cn(viewMode === 'grid' && 'bg-secondary')}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className={cn(viewMode === 'list' && 'bg-secondary')}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stage Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStage('')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 border",
                filterStage === '' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
              )}
            >
              <span className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" />
                الكل ({deals.length})
              </span>
            </button>
            {stages.map(stage => {
              const count = deals.filter(d => d.stage === stage).length;
              return (
                <button
                  key={stage}
                  onClick={() => setFilterStage(stage)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 border",
                    filterStage === stage 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-secondary/50 text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {stage} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Deals List */}
        {isLoading ? (
          <div className={cn(
            "gap-4",
            viewMode === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-3"
          )}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="card-elegant text-center py-16">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground/25" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              {search || filterStage ? 'مفيش نتايج' : 'مفيش مصالح لسه'}
            </p>
            <p className="text-sm text-muted-foreground/70 mb-6">
              {search || filterStage ? 'جرب بحث تاني' : 'ابدأ بإضافة أول مصلحة'}
            </p>
            <Button 
              onClick={() => setDialogOpen(true)} 
              className="bg-gradient-primary text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              أضف أول مصلحة
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
            {filteredDeals.map((deal) => {
              const hasUrgentAction = deal.next_action_date && 
                (isToday(parseISO(deal.next_action_date)) || isPast(parseISO(deal.next_action_date)));
              
              return (
                <div
                  key={deal.id}
                  className={cn(
                    "card-elegant p-5 group relative transition-all",
                    hasUrgentAction && "border-warning/30"
                  )}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => setEditDeal(deal)}
                      className="text-muted-foreground hover:text-primary transition-all p-1.5 rounded-lg hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(deal.id)}
                      className="text-muted-foreground hover:text-danger transition-all p-1.5 rounded-lg hover:bg-danger/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "w-2.5 h-2.5 rounded-full shrink-0",
                          priorityColors[deal.priority] || 'bg-muted-foreground/50'
                        )} />
                        <Link
                          to={`/deals/${deal.id}`}
                          className="font-bold hover:text-primary transition-colors truncate block"
                        >
                          {deal.name}
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground">{deal.type}</p>
                    </div>
                  </div>

                  {/* Stage Badge */}
                  <div className="mb-3">
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full border font-medium",
                      stageStyles[deal.stage] || 'bg-muted text-muted-foreground border-border'
                    )}>
                      {deal.stage}
                    </span>
                  </div>

                  {/* Expected Value */}
                  <p className="text-xl font-bold text-success mb-3">
                    {formatMoney(Number(deal.expected_value), deal.currency)}
                  </p>

                  {/* Next Action */}
                  {deal.next_action && (
                    <div className={cn(
                      "rounded-lg p-3 mb-4",
                      hasUrgentAction ? "bg-warning/10 border border-warning/20" : "bg-secondary/50"
                    )}>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        <span>الخطوة الجاية</span>
                        {deal.next_action_date && (
                          <span className={cn(
                            "mr-auto",
                            hasUrgentAction && "text-warning font-medium"
                          )}>
                            {isToday(parseISO(deal.next_action_date)) ? 'اليوم' : 
                             isTomorrow(parseISO(deal.next_action_date)) ? 'بكره' :
                             format(parseISO(deal.next_action_date), 'd MMM', { locale: ar })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{deal.next_action}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <Link
                    to={`/deals/${deal.id}`}
                    className="flex items-center justify-center gap-2 text-primary text-sm font-medium hover:underline pt-3 border-t border-border"
                  >
                    عرض التفاصيل
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {filteredDeals.map((deal) => {
              const hasUrgentAction = deal.next_action_date && 
                (isToday(parseISO(deal.next_action_date)) || isPast(parseISO(deal.next_action_date)));
              
              return (
                <div
                  key={deal.id}
                  className={cn(
                    "card-elegant p-4 group flex items-center gap-4",
                    hasUrgentAction && "border-warning/30"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className={cn(
                      "w-3 h-3 rounded-full shrink-0",
                      priorityColors[deal.priority] || 'bg-muted-foreground/50'
                    )} />
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/deals/${deal.id}`}
                        className="font-bold hover:text-primary transition-colors truncate block"
                      >
                        {deal.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{deal.type}</p>
                    </div>
                  </div>

                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full border font-medium shrink-0",
                    stageStyles[deal.stage] || 'bg-muted text-muted-foreground border-border'
                  )}>
                    {deal.stage}
                  </span>

                  {hasUrgentAction && (
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 shrink-0">
                      عاجل
                    </span>
                  )}

                  <span className="text-lg font-bold text-success shrink-0">
                    {formatMoney(Number(deal.expected_value), deal.currency)}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditDeal(deal)}
                      className="p-2 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/deals/${deal.id}`}
                      className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => setDeleteId(deal.id)}
                      className="p-2 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddDealDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <EditDealDialog deal={editDeal} open={!!editDeal} onOpenChange={(open) => !open && setEditDeal(null)} />
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المصلحة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هتتحذف المصلحة دي نهائياً ومش هتقدر ترجعها.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteDeal.mutate(deleteId);
                  setDeleteId(null);
                }
              }}
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              احذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DealsPage;
