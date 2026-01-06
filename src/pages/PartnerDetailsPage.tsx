import { useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useDeals, useDeleteDeal } from '@/hooks/useDeals';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deal, toEGP, CONTRACT_TYPES } from '@/types';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  ArrowLeft,
  Target,
  CheckCircle2,
  Clock,
  Trash2,
  Pencil,
  ArrowUpRight,
  Percent,
  BadgeDollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

const PartnerDetailsPage = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const partnerName = decodeURIComponent(name || '');
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();
  
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filter deals for this partner
  const partnerDeals = useMemo(() => {
    return deals.filter(d => d.owner === partnerName);
  }, [deals, partnerName]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeDeals = partnerDeals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي' && d.stage !== 'مؤجل');
    const closedDeals = partnerDeals.filter(d => d.stage === 'مقفول');
    
    const totalExpectedEGP = activeDeals.reduce((sum, d) => 
      sum + toEGP(Number(d.expected_value || 0), d.currency), 0);
    const closedValueEGP = closedDeals.reduce((sum, d) => 
      sum + toEGP(Number(d.expected_value || 0), d.currency), 0);
    const totalRealizedEGP = partnerDeals.reduce((sum, d) => 
      sum + toEGP(Number(d.realized_value || 0), d.currency), 0);
    
    // Commission stats
    const commissionDeals = partnerDeals.filter(d => d.contract_type === 'commission' || d.contract_type === 'success-fee');
    const avgCommission = commissionDeals.length > 0 
      ? commissionDeals.reduce((sum, d) => sum + (Number(d.commission_percentage) || 0), 0) / commissionDeals.length
      : 0;
    const totalSuccessFees = partnerDeals.reduce((sum, d) => sum + toEGP(Number(d.success_fee || 0), d.currency), 0);

    return {
      total: partnerDeals.length,
      active: activeDeals.length,
      closed: closedDeals.length,
      totalExpectedEGP,
      closedValueEGP,
      totalRealizedEGP,
      avgCommission,
      totalSuccessFees,
    };
  }, [partnerDeals]);

  const formatMoney = (amount: number, currency: string = 'EGP') => {
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);
    return currency === 'USD' ? `$${formatted}` : `${formatted} ج.م`;
  };

  const getContractTypeLabel = (type: string | undefined) => {
    const found = CONTRACT_TYPES.find(ct => ct.value === type);
    return found ? found.label : 'مرة واحدة';
  };

  if (!partnerName) {
    navigate('/partners');
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-2xl font-bold text-accent-foreground">
              {partnerName.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{partnerName}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                ملف الصاحب
              </p>
            </div>
          </div>
          <Link 
            to="/partners"
            className="text-primary hover:underline text-sm flex items-center gap-1"
          >
            العودة للأصحاب
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-muted-foreground">من {stats.total} مصلحة</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">مصالح نشطة</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-success" />
            </div>
            <p className="text-xl font-bold text-success">{formatMoney(stats.totalExpectedEGP)}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">قيمة متوقعة</p>
          </div>

          <div className="card-elegant p-5 border-success/20 bg-success/5">
            <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-xl font-bold text-success">{formatMoney(stats.totalRealizedEGP)}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">دخل فعلي</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold">{stats.closed}</p>
            <p className="text-xs text-muted-foreground">{formatMoney(stats.closedValueEGP)}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">مصالح مقفولة</p>
          </div>
        </div>

        {/* Commission Stats */}
        {(stats.avgCommission > 0 || stats.totalSuccessFees > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {stats.avgCommission > 0 && (
              <div className="card-elegant p-5 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <Percent className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">متوسط العمولة</span>
                </div>
                <p className="text-2xl font-bold text-primary">{stats.avgCommission.toFixed(1)}%</p>
              </div>
            )}
            {stats.totalSuccessFees > 0 && (
              <div className="card-elegant p-5 border-accent/20 bg-accent/5">
                <div className="flex items-center gap-3 mb-2">
                  <BadgeDollarSign className="w-5 h-5 text-accent" />
                  <span className="text-sm text-muted-foreground">إجمالي Success Fees</span>
                </div>
                <p className="text-2xl font-bold text-accent">{formatMoney(stats.totalSuccessFees)}</p>
              </div>
            )}
          </div>
        )}

        {/* Deals List */}
        <div className="space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            مصالح {partnerName}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : partnerDeals.length === 0 ? (
            <div className="card-elegant text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground/25" />
              <p className="text-muted-foreground">مفيش مصالح لـ {partnerName}</p>
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {partnerDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="card-elegant p-4 group flex items-center gap-4"
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
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{deal.type}</span>
                        {deal.contract_type && deal.contract_type !== 'one-time' && (
                          <>
                            <span>•</span>
                            <span className="text-primary">{getContractTypeLabel(deal.contract_type)}</span>
                            {deal.commission_percentage && (
                              <span className="text-primary">({deal.commission_percentage}%)</span>
                            )}
                          </>
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
              ))}
            </div>
          )}
        </div>
      </div>

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

export default PartnerDetailsPage;
