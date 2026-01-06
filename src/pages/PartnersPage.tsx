import { useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { useDeals } from '@/hooks/useDeals';
import { Link } from 'react-router-dom';
import { toEGP } from '@/types';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  ArrowLeft,
  Target,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PartnerStats {
  name: string;
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  totalExpectedEGP: number;
  totalRealizedEGP: number;
  stages: Record<string, number>;
}

const PartnersPage = () => {
  const { data: deals = [], isLoading } = useDeals();

  // Group deals by owner and calculate stats
  const partners = useMemo(() => {
    const partnerDeals = deals.filter(d => d.owner);
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
          stages: {},
        };
      }

      const partner = partnersMap[ownerName];
      partner.totalDeals++;
      
      if (deal.stage === 'مقفول') {
        partner.closedDeals++;
      } else if (deal.stage !== 'ملغي') {
        partner.activeDeals++;
      }

      partner.totalExpectedEGP += toEGP(Number(deal.expected_value || 0), deal.currency);
      partner.totalRealizedEGP += toEGP(Number(deal.realized_value || 0), deal.currency);
      
      partner.stages[deal.stage] = (partner.stages[deal.stage] || 0) + 1;
    });

    return Object.values(partnersMap).sort((a, b) => b.totalDeals - a.totalDeals);
  }, [deals]);

  const formatMoney = (amount: number) => {
    const formatted = new Intl.NumberFormat('ar-EG').format(amount);
    return `${formatted} ج.م`;
  };

  // Overall stats
  const overallStats = useMemo(() => {
    const partnerDeals = deals.filter(d => d.owner);
    return {
      totalPartners: partners.length,
      totalDeals: partnerDeals.length,
      totalExpectedEGP: partnerDeals.reduce((sum, d) => sum + toEGP(Number(d.expected_value || 0), d.currency), 0),
      totalRealizedEGP: partnerDeals.reduce((sum, d) => sum + toEGP(Number(d.realized_value || 0), d.currency), 0),
    };
  }, [deals, partners]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
                <Users className="w-5 h-5 text-accent-foreground" />
              </div>
              الأصحاب
            </h1>
            <p className="text-muted-foreground">مصالح الأصحاب والشركاء</p>
          </div>
          <Link 
            to="/deals"
            className="text-primary hover:underline text-sm flex items-center gap-1"
          >
            العودة للمصالح
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold">{overallStats.totalPartners}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">صاحب</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{overallStats.totalDeals}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">مصلحة</p>
          </div>

          <div className="card-elegant p-5">
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-success" />
            </div>
            <p className="text-xl font-bold text-success">{formatMoney(overallStats.totalExpectedEGP)}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">قيمة متوقعة</p>
          </div>

          <div className="card-elegant p-5 border-success/20 bg-success/5">
            <div className="w-11 h-11 rounded-xl bg-success/15 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-xl font-bold text-success">{formatMoney(overallStats.totalRealizedEGP)}</p>
            <p className="text-sm font-medium text-muted-foreground mt-1">دخل فعلي</p>
          </div>
        </div>

        {/* Partners List */}
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
            <Link 
              to="/deals"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Briefcase className="w-4 h-4" />
              اذهب للمصالح
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 stagger-children">
            {partners.map((partner) => (
              <Link
                key={partner.name}
                to={`/partners/${encodeURIComponent(partner.name)}`}
                className="card-elegant p-5 group hover:border-accent/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center text-xl font-bold text-accent-foreground shrink-0">
                    {partner.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name & Deals Count */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg truncate group-hover:text-accent transition-colors">
                        {partner.name}
                      </h3>
                      <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-accent group-hover:-translate-x-1 transition-all" />
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span>{partner.totalDeals} مصلحة</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{partner.closedDeals} مقفولة</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-warning">
                        <Clock className="w-4 h-4" />
                        <span>{partner.activeDeals} نشطة</span>
                      </div>
                    </div>

                    {/* Values */}
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">متوقع: </span>
                        <span className="font-semibold text-success">{formatMoney(partner.totalExpectedEGP)}</span>
                      </div>
                      {partner.totalRealizedEGP > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">فعلي: </span>
                          <span className="font-semibold text-success">{formatMoney(partner.totalRealizedEGP)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PartnersPage;
