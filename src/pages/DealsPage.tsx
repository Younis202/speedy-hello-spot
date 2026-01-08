import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useDeals, useDeleteDeal } from '@/hooks/useDeals';
import { Link } from 'react-router-dom';
import { Deal, toEGP, CONTRACT_TYPES } from '@/types';
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
  AlertCircle,
  CheckCircle2,
  Users,
  ChevronLeft,
  Percent,
  BadgeDollarSign,
  Sparkles
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
  'مؤجل': 'bg-secondary text-secondary-foreground border-border',
  'مقفول': 'bg-success/15 text-success border-success/25',
  'ملغي': 'bg-muted text-muted-foreground border-border',
};

const priorityColors: Record<string, string> = {
  'عالي': 'bg-danger',
  'متوسط': 'bg-warning',
  'منخفض': 'bg-muted-foreground/50',
};

interface PartnerStats {
  name: string;
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  totalExpectedEGP: number;
  totalRealizedEGP: number;
  avgCommission: number;
  totalSuccessFees: number;
  deals: Deal[];
}

const DealsPage = () => {
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'partners'>('all');
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);

  // Separate deals by owner
  const myDeals = deals.filter(d => !d.owner);
  const partnerDeals = deals.filter(d => d.owner);

  // Group partner deals
  const partners = useMemo(() => {
    const partnersMap: Record<string, PartnerStats> = {};

    partnerDeals.forEach(deal => {
      const ownerName = deal.owner!;
      
      if (!partnersMap[ownerName]) {
        partnersMap[ownerName] = {
          name: ownerName,
          totalDeals: 0,
          activeDeals: 0,
          closedDeals: 0,
          totalExpectedEGP: 0,
          totalRealizedEGP: 0,
          avgCommission: 0,
          totalSuccessFees: 0,
          deals: [],
        };
      }

      const partner = partnersMap[ownerName];
      partner.totalDeals++;
      partner.deals.push(deal);
      
      if (deal.stage === 'مقفول') {
        partner.closedDeals++;
      } else if (deal.stage !== 'ملغي' && deal.stage !== 'مؤجل') {
        partner.activeDeals++;
      }

      partner.totalExpectedEGP += toEGP(Number(deal.expected_value || 0), deal.currency);
      partner.totalRealizedEGP += toEGP(Number(deal.realized_value || 0), deal.currency);
      partner.totalSuccessFees += toEGP(Number(deal.success_fee || 0), deal.currency);
    });

    // Calculate average commission
    Object.values(partnersMap).forEach(partner => {
      const commissionDeals = partner.deals.filter(d => d.contract_type === 'commission' || d.contract_type === 'success-fee');
      if (commissionDeals.length > 0) {
        partner.avgCommission = commissionDeals.reduce((sum, d) => sum + (Number(d.commission_percentage) || 0), 0) / commissionDeals.length;
      }
    });

    return Object.values(partnersMap).sort((a, b) => b.totalDeals - a.totalDeals);
  }, [partnerDeals]);

  const filteredDeals = useMemo(() => {
    let dealsToFilter = deals;
    
    if (activeTab === 'mine') {
      dealsToFilter = myDeals;
    } else if (activeTab === 'partners') {
      dealsToFilter = partnerDeals;
    }

    return dealsToFilter.filter(deal => {
      const matchesSearch = deal.name.toLowerCase().includes(search.toLowerCase()) ||
                           deal.type.toLowerCase().includes(search.toLowerCase()) ||
                           (deal.owner || '').toLowerCase().includes(search.toLowerCase());
      const matchesStage = !filterStage || deal.stage === filterStage;
      return matchesSearch && matchesStage;
    });
  }, [deals, myDeals, partnerDeals, activeTab, search, filterStage]);

  // Statistics - with currency conversion to EGP
  const stats = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي' && d.stage !== 'مؤجل');
    const closedDeals = deals.filter(d => d.stage === 'مقفول');
    
    // Convert all values to EGP for accurate totals
    const totalExpectedEGP = activeDeals.reduce((sum, d) => 
      sum + toEGP(Number(d.expected_value || 0), d.currency), 0);
    const totalRealizedEGP = deals.reduce((sum, d) => 
      sum + toEGP(Number(d.realized_value || 0), d.currency), 0);
    
    // Deals needing action today
    const needsActionToday = activeDeals.filter(d => {
      if (!d.next_action_date) return false;
      const actionDate = parseISO(d.next_action_date);
      return isToday(actionDate) || isPast(actionDate);
    });

    return {
      total: deals.length,
      active: activeDeals.length,
      closed: closedDeals.length,
      totalExpectedEGP,
      totalRealizedEGP,
      needsActionToday: needsActionToday.length,
      urgentDeals: needsActionToday,
      partnersCount: partners.length,
    };
  }, [deals, partners]);

  const formatMoney = (amount: number, currency: string = 'EGP') => {
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);
    return currency === 'USD' ? `$${formatted}` : `${formatted} ج.م`;
  };

  const getContractTypeLabel = (type: string | undefined) => {
    const found = CONTRACT_TYPES.find(ct => ct.value === type);
    return found ? found.label : 'مرة واحدة';
  };

  const stages = ['جديد', 'بتتكلم', 'مفاوضات', 'مستني رد', 'مستني توقيع', 'مؤجل', 'مقفول', 'ملغي'];

  const renderDealCard = (deal: Deal) => {
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
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">{deal.type}</p>
              {deal.owner && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {deal.owner}
                </span>
              )}
              {deal.contract_type && deal.contract_type !== 'one-time' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {getContractTypeLabel(deal.contract_type)}
                </span>
              )}
            </div>
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
  };

  const renderDealRow = (deal: Deal) => {
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
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">{deal.type}</p>
              {deal.owner && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {deal.owner}
                </span>
              )}
            </div>
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
  };

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

        {/* Main Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
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
            <p className="text-2xl font-bold text-success">{formatMoney(stats.totalExpectedEGP)}</p>
            <p className="text-xs text-muted-foreground">قيمة متوقعة (بالجنيه)</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">من المصالح النشطة</p>
          </div>

          <div className="card-elegant p-5 border-success/20 bg-success/5">
            <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatMoney(stats.totalRealizedEGP)}</p>
            <p className="text-xs text-muted-foreground">دخل فعلي (بالجنيه)</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">الفلوس اللي دخلت</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold">{stats.partnersCount}</p>
            <p className="text-xs text-muted-foreground">{partnerDeals.length} مصلحة</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">الأصحاب</p>
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

        {/* Main Tabs */}
        <div className="card-premium p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                activeTab === 'all' 
                  ? 'bg-gradient-primary text-primary-foreground shadow-lg' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="w-4 h-4" />
              <span>كل المصالح</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                activeTab === 'all' ? 'bg-primary-foreground/20' : 'bg-muted'
              )}>
                {deals.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                activeTab === 'mine' 
                  ? 'bg-gradient-primary text-primary-foreground shadow-lg' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <Briefcase className="w-4 h-4" />
              <span>مصالحي</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                activeTab === 'mine' ? 'bg-primary-foreground/20' : 'bg-muted'
              )}>
                {myDeals.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                activeTab === 'partners' 
                  ? 'bg-gradient-accent text-accent-foreground shadow-lg' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              <Users className="w-4 h-4" />
              <span>الأصحاب</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                activeTab === 'partners' ? 'bg-accent-foreground/20' : 'bg-muted'
              )}>
                {partners.length}
              </span>
            </button>
          </div>
        </div>

        {/* Partners Section (when partners tab is active) */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-44 bg-card border border-border rounded-xl animate-pulse" />
                ))}
              </div>
            ) : partners.length === 0 ? (
              <div className="card-elegant text-center py-16">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/25" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  مفيش أصحاب لسه
                </p>
                <p className="text-sm text-muted-foreground/70 mb-6">
                  أضف مصلحة وحدد صاحبها عشان تظهر هنا
                </p>
              </div>
            ) : (
              <div className="space-y-4 stagger-children">
                {partners.map((partner) => (
                  <div key={partner.name} className="card-premium overflow-hidden">
                    {/* Partner Header - Clickable */}
                    <button
                      onClick={() => setExpandedPartner(expandedPartner === partner.name ? null : partner.name)}
                      className="w-full p-5 flex items-center gap-4 hover:bg-secondary/30 transition-colors"
                    >
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center text-xl font-bold text-accent-foreground shrink-0">
                        {partner.name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0 text-right">
                        {/* Name */}
                        <h3 className="font-bold text-lg truncate mb-1">
                          {partner.name}
                        </h3>
                        
                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4 text-primary" />
                            {partner.totalDeals} مصلحة
                          </span>
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle2 className="w-4 h-4" />
                            {partner.closedDeals} مقفولة
                          </span>
                          <span className="flex items-center gap-1 text-warning">
                            <Clock className="w-4 h-4" />
                            {partner.activeDeals} نشطة
                          </span>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="text-left shrink-0 hidden md:block">
                        <p className="text-lg font-bold text-success">{formatMoney(partner.totalExpectedEGP)}</p>
                        <p className="text-xs text-muted-foreground">قيمة متوقعة</p>
                      </div>

                      {/* Expand Icon */}
                      <ChevronLeft className={cn(
                        "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                        expandedPartner === partner.name && "-rotate-90"
                      )} />
                    </button>

                    {/* Expanded Content */}
                    {expandedPartner === partner.name && (
                      <div className="border-t border-border">
                        {/* Partner Stats */}
                        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-secondary/20">
                          <div className="text-center p-3 rounded-xl bg-card/50">
                            <p className="text-lg font-bold text-success">{formatMoney(partner.totalExpectedEGP)}</p>
                            <p className="text-xs text-muted-foreground">متوقع</p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-card/50">
                            <p className="text-lg font-bold text-success">{formatMoney(partner.totalRealizedEGP)}</p>
                            <p className="text-xs text-muted-foreground">فعلي</p>
                          </div>
                          {partner.avgCommission > 0 && (
                            <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/20">
                              <p className="text-lg font-bold text-primary flex items-center justify-center gap-1">
                                <Percent className="w-4 h-4" />
                                {partner.avgCommission.toFixed(1)}%
                              </p>
                              <p className="text-xs text-muted-foreground">متوسط العمولة</p>
                            </div>
                          )}
                          {partner.totalSuccessFees > 0 && (
                            <div className="text-center p-3 rounded-xl bg-accent/5 border border-accent/20">
                              <p className="text-lg font-bold text-accent">{formatMoney(partner.totalSuccessFees)}</p>
                              <p className="text-xs text-muted-foreground">Success Fees</p>
                            </div>
                          )}
                        </div>

                        {/* Partner's Deals */}
                        <div className="p-4 space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            مصالح {partner.name}
                          </h4>
                          {partner.deals.map(deal => (
                            <div
                              key={deal.id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all group"
                            >
                              <span className={cn(
                                "w-2.5 h-2.5 rounded-full shrink-0",
                                priorityColors[deal.priority] || 'bg-muted-foreground/50'
                              )} />
                              <Link
                                to={`/deals/${deal.id}`}
                                className="font-medium flex-1 truncate hover:text-primary transition-colors"
                              >
                                {deal.name}
                              </Link>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full border shrink-0",
                                stageStyles[deal.stage] || 'bg-muted text-muted-foreground border-border'
                              )}>
                                {deal.stage}
                              </span>
                              <span className="text-sm font-bold text-success shrink-0">
                                {formatMoney(Number(deal.expected_value), deal.currency)}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditDeal(deal)}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <Link
                                  to={`/deals/${deal.id}`}
                                  className="p-1.5 rounded-lg hover:bg-primary/10 text-primary"
                                >
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deals Section (when all or mine tabs are active) */}
        {activeTab !== 'partners' && (
          <>
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
                    الكل ({filteredDeals.length})
                  </span>
                </button>
                {stages.map(stage => {
                  const count = filteredDeals.filter(d => d.stage === stage).length;
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
                {filteredDeals.map(renderDealCard)}
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {filteredDeals.map(renderDealRow)}
              </div>
            )}
          </>
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
