import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useDebts, useCreateDebt, useUpdateDebt, useDeleteDebt } from '@/hooks/useDebts';
import { useDeals } from '@/hooks/useDeals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { PRESSURE_LEVELS, Debt } from '@/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  Target,
  PiggyBank,
  ArrowDownCircle,
  Banknote
} from 'lucide-react';

const MoneyPage = () => {
  const { data: debts = [], isLoading } = useDebts();
  const { data: deals = [] } = useDeals();
  const createDebt = useCreateDebt();
  const updateDebt = useUpdateDebt();
  const deleteDebt = useDeleteDebt();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPressure, setFilterPressure] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('unpaid');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [expandedDebt, setExpandedDebt] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    creditor_name: '',
    amount: '',
    monthly_payment: '',
    remaining_amount: '',
    due_date: '',
    pressure_level: 'متوسط',
    notes: '',
  });

  const formatMoney = (amount: number) => new Intl.NumberFormat('ar-EG').format(amount);

  // Statistics
  const stats = useMemo(() => {
    const unpaidDebts = debts.filter(d => !d.is_paid);
    const paidDebts = debts.filter(d => d.is_paid);
    
    const totalDebt = unpaidDebts.reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);
    const totalPaid = paidDebts.reduce((sum, d) => sum + Number(d.amount), 0);
    const monthlyPayments = unpaidDebts.reduce((sum, d) => sum + Number(d.monthly_payment || 0), 0);
    
    const highPressure = unpaidDebts.filter(d => d.pressure_level === 'عالي').length;
    const mediumPressure = unpaidDebts.filter(d => d.pressure_level === 'متوسط').length;
    const lowPressure = unpaidDebts.filter(d => d.pressure_level === 'خفيف').length;

    // Expected value from deals
    const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي');
    const expectedIncome = activeDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
    
    // How many months to pay off debt
    const monthsToPayOff = monthlyPayments > 0 ? Math.ceil(totalDebt / monthlyPayments) : 0;
    
    // Coverage ratio
    const coverageRatio = totalDebt > 0 ? (expectedIncome / totalDebt) * 100 : 100;

    return {
      totalDebt,
      totalPaid,
      monthlyPayments,
      highPressure,
      mediumPressure,
      lowPressure,
      unpaidCount: unpaidDebts.length,
      paidCount: paidDebts.length,
      expectedIncome,
      monthsToPayOff,
      coverageRatio,
    };
  }, [debts, deals]);

  // Filtered debts
  const filteredDebts = useMemo(() => {
    return debts.filter(debt => {
      const matchesSearch = debt.creditor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (debt.notes && debt.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesPressure = filterPressure === 'all' || debt.pressure_level === filterPressure;
      
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'unpaid' && !debt.is_paid) ||
                           (filterStatus === 'paid' && debt.is_paid);
      
      return matchesSearch && matchesPressure && matchesStatus;
    });
  }, [debts, searchQuery, filterPressure, filterStatus]);

  const handleSubmit = async () => {
    if (!formData.creditor_name || !formData.amount) return;

    const debtData = {
      creditor_name: formData.creditor_name,
      amount: parseFloat(formData.amount),
      monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : 0,
      remaining_amount: formData.remaining_amount ? parseFloat(formData.remaining_amount) : parseFloat(formData.amount),
      due_date: formData.due_date || null,
      pressure_level: formData.pressure_level,
      notes: formData.notes || null,
    };

    if (editingDebt) {
      await updateDebt.mutateAsync({ id: editingDebt.id, ...debtData });
    } else {
      await createDebt.mutateAsync(debtData);
    }

    resetForm();
    setIsAddDialogOpen(false);
    setEditingDebt(null);
  };

  const handlePaymentRecord = async (debt: Debt, paymentAmount: number) => {
    const newRemaining = Math.max(0, Number(debt.remaining_amount || debt.amount) - paymentAmount);
    await updateDebt.mutateAsync({
      id: debt.id,
      remaining_amount: newRemaining,
      is_paid: newRemaining === 0,
    });
  };

  const resetForm = () => {
    setFormData({
      creditor_name: '',
      amount: '',
      monthly_payment: '',
      remaining_amount: '',
      due_date: '',
      pressure_level: 'متوسط',
      notes: '',
    });
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      creditor_name: debt.creditor_name,
      amount: debt.amount.toString(),
      monthly_payment: debt.monthly_payment?.toString() || '',
      remaining_amount: (debt.remaining_amount || debt.amount).toString(),
      due_date: debt.due_date || '',
      pressure_level: debt.pressure_level,
      notes: debt.notes || '',
    });
    setIsAddDialogOpen(true);
  };

  const getPressureColor = (level: string) => {
    switch (level) {
      case 'عالي': return 'text-danger bg-danger/10 border-danger/20';
      case 'متوسط': return 'text-warning bg-warning/10 border-warning/20';
      case 'خفيف': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-secondary';
    }
  };

  const getPaymentProgress = (debt: Debt) => {
    const paid = Number(debt.amount) - Number(debt.remaining_amount || debt.amount);
    return (paid / Number(debt.amount)) * 100;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              إدارة الفلوس
            </h1>
            <p className="text-muted-foreground">تتبع الديون والأقساط والمدفوعات</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingDebt(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                إضافة دين جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingDebt ? 'تعديل الدين' : 'إضافة دين جديد'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="form-label">اسم الدائن</label>
                  <Input
                    value={formData.creditor_name}
                    onChange={e => setFormData(prev => ({ ...prev, creditor_name: e.target.value }))}
                    placeholder="مثال: البنك الأهلي"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">المبلغ الكلي</label>
                    <Input
                      type="number"
                      value={formData.amount}
                      onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">المتبقي</label>
                    <Input
                      type="number"
                      value={formData.remaining_amount}
                      onChange={e => setFormData(prev => ({ ...prev, remaining_amount: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">القسط الشهري</label>
                    <Input
                      type="number"
                      value={formData.monthly_payment}
                      onChange={e => setFormData(prev => ({ ...prev, monthly_payment: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="form-label">تاريخ الاستحقاق</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={e => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">مستوى الضغط</label>
                  <Select
                    value={formData.pressure_level}
                    onValueChange={value => setFormData(prev => ({ ...prev, pressure_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESSURE_LEVELS.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="form-label">ملاحظات</label>
                  <Textarea
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="أي تفاصيل إضافية..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingDebt(null);
                  resetForm();
                }}>
                  إلغاء
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.creditor_name || !formData.amount}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  {editingDebt ? 'حفظ التعديلات' : 'إضافة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center mb-3">
              <TrendingDown className="w-5 h-5 text-danger" />
            </div>
            <p className="text-2xl font-bold text-danger">{formatMoney(stats.totalDebt)}</p>
            <p className="text-xs text-muted-foreground">ج.م</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">إجمالي الديون</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-warning/10 flex items-center justify-center mb-3">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <p className="text-2xl font-bold text-warning">{formatMoney(stats.monthlyPayments)}</p>
            <p className="text-xs text-muted-foreground">ج.م / شهر</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">الأقساط الشهرية</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{formatMoney(stats.expectedIncome)}</p>
            <p className="text-xs text-muted-foreground">ج.م متوقع</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">من المصالح</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.monthsToPayOff}</p>
            <p className="text-xs text-muted-foreground">شهر للسداد</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">بالمعدل الحالي</p>
          </div>
        </div>

        {/* Coverage Analysis */}
        {stats.totalDebt > 0 && (
          <div className="card-elegant p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  stats.coverageRatio >= 100 ? "bg-success/10" : 
                  stats.coverageRatio >= 50 ? "bg-warning/10" : "bg-danger/10"
                )}>
                  <PiggyBank className={cn(
                    "w-5 h-5",
                    stats.coverageRatio >= 100 ? "text-success" : 
                    stats.coverageRatio >= 50 ? "text-warning" : "text-danger"
                  )} />
                </div>
                <div>
                  <h3 className="font-bold">نسبة التغطية</h3>
                  <p className="text-sm text-muted-foreground">
                    المصالح المتوقعة vs الديون
                  </p>
                </div>
              </div>
              <span className={cn(
                "text-2xl font-bold",
                stats.coverageRatio >= 100 ? "text-success" : 
                stats.coverageRatio >= 50 ? "text-warning" : "text-danger"
              )}>
                {Math.round(stats.coverageRatio)}%
              </span>
            </div>
            <Progress 
              value={Math.min(stats.coverageRatio, 100)} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.coverageRatio >= 100 
                ? 'ممتاز! المصالح المتوقعة تغطي الديون بالكامل' 
                : stats.coverageRatio >= 50
                ? 'تحتاج مصالح إضافية لتغطية كل الديون'
                : 'تحذير: الديون أكثر من المتوقع من المصالح'}
            </p>
          </div>
        )}

        {/* Pressure Distribution */}
        {stats.unpaidCount > 0 && (
          <div className="card-elegant p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              توزيع الضغط
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-danger/5 rounded-xl border border-danger/10">
                <p className="text-3xl font-bold text-danger">{stats.highPressure}</p>
                <p className="text-sm text-muted-foreground">ضغط عالي</p>
              </div>
              <div className="text-center p-4 bg-warning/5 rounded-xl border border-warning/10">
                <p className="text-3xl font-bold text-warning">{stats.mediumPressure}</p>
                <p className="text-sm text-muted-foreground">ضغط متوسط</p>
              </div>
              <div className="text-center p-4 bg-success/5 rounded-xl border border-success/10">
                <p className="text-3xl font-bold text-success">{stats.lowPressure}</p>
                <p className="text-sm text-muted-foreground">ضغط خفيف</p>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن دين..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Select value={filterPressure} onValueChange={setFilterPressure}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="w-4 h-4 ml-2" />
              <SelectValue placeholder="الضغط" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المستويات</SelectItem>
              {PRESSURE_LEVELS.map(level => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="unpaid">غير مسدد</SelectItem>
              <SelectItem value="paid">مسدد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Debts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card-elegant p-6 animate-pulse">
                <div className="h-6 bg-secondary rounded w-1/3 mb-2" />
                <div className="h-4 bg-secondary rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDebts.length === 0 ? (
          <div className="card-elegant p-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              {debts.length === 0 ? 'مفيش ديون' : 'مفيش نتائج'}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {debts.length === 0 
                ? 'الحمد لله، كل حاجة تمام' 
                : 'جرب تغيير الفلتر أو البحث'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDebts.map(debt => (
              <div 
                key={debt.id} 
                className={cn(
                  "card-elegant overflow-hidden transition-all",
                  debt.is_paid && "opacity-60"
                )}
              >
                {/* Main Row */}
                <div 
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedDebt(expandedDebt === debt.id ? null : debt.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      debt.is_paid ? "bg-success/10" : 
                      debt.pressure_level === 'عالي' ? "bg-danger/10" :
                      debt.pressure_level === 'متوسط' ? "bg-warning/10" : "bg-muted"
                    )}>
                      {debt.is_paid ? (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      ) : (
                        <Banknote className={cn(
                          "w-6 h-6",
                          debt.pressure_level === 'عالي' ? "text-danger" :
                          debt.pressure_level === 'متوسط' ? "text-warning" : "text-muted-foreground"
                        )} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{debt.creditor_name}</h3>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full border",
                          getPressureColor(debt.pressure_level)
                        )}>
                          {debt.pressure_level}
                        </span>
                        {debt.is_paid && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                            مسدد
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>المبلغ: {formatMoney(debt.amount)} ج.م</span>
                        {debt.monthly_payment && debt.monthly_payment > 0 && (
                          <span>القسط: {formatMoney(debt.monthly_payment)} ج.م</span>
                        )}
                        {debt.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(debt.due_date), 'd MMMM', { locale: ar })}
                          </span>
                        )}
                      </div>

                      {/* Progress */}
                      {!debt.is_paid && debt.remaining_amount !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">المتبقي: {formatMoney(Number(debt.remaining_amount))} ج.م</span>
                            <span className="text-success">{Math.round(getPaymentProgress(debt))}% مسدد</span>
                          </div>
                          <Progress value={getPaymentProgress(debt)} className="h-2" />
                        </div>
                      )}
                    </div>

                    {/* Expand Icon */}
                    <div className="shrink-0">
                      {expandedDebt === debt.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedDebt === debt.id && (
                  <div className="px-5 pb-5 pt-0 border-t border-border/50 space-y-4">
                    {/* Notes */}
                    {debt.notes && (
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">{debt.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {!debt.is_paid && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentRecord(debt, Number(debt.monthly_payment || 0));
                          }}
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                          سجل دفعة ({formatMoney(Number(debt.monthly_payment || 0))} ج.م)
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(debt);
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                        تعديل
                      </Button>

                      {!debt.is_paid && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2 text-success hover:text-success"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateDebt.mutate({ id: debt.id, is_paid: true, remaining_amount: 0 });
                          }}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          تمام السداد
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-danger hover:text-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingDebt(debt);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingDebt} onOpenChange={() => setDeletingDebt(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف دين "{deletingDebt?.creditor_name}"؟
                <br />
                لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                className="bg-danger text-danger-foreground hover:bg-danger/90"
                onClick={() => {
                  if (deletingDebt) {
                    deleteDebt.mutate(deletingDebt.id);
                    setDeletingDebt(null);
                  }
                }}
              >
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default MoneyPage;
