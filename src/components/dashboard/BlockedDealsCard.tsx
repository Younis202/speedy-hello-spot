import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft, Ban, AlertTriangle, Lightbulb } from 'lucide-react';
import { PrioritizedDeal } from '@/hooks/usePriorityEngine';
import { cn } from '@/lib/utils';

interface BlockedDealsCardProps {
  blockedDeals: PrioritizedDeal[];
}

export const BlockedDealsCard = ({ blockedDeals }: BlockedDealsCardProps) => {
  if (blockedDeals.length === 0) return null;

  return (
    <div className="card-elegant border-danger/30 bg-danger/5 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-danger/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-danger" />
          </div>
          <div>
            <h3 className="font-bold text-lg">مصالح متعطلة</h3>
            <p className="text-sm text-muted-foreground">
              {blockedDeals.length} مصلحة محتاجة تحل مشاكلها
            </p>
          </div>
        </div>
        <Link
          to="/focus?filter=attention"
          className="text-sm text-danger hover:text-danger/80 font-medium flex items-center gap-1"
        >
          عرض الكل
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Blocked Deals List */}
      <div className="divide-y divide-danger/10">
        {blockedDeals.slice(0, 4).map((deal) => (
          <Link
            key={deal.id}
            to={`/deals/${deal.id}`}
            className="block p-4 hover:bg-danger/5 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Ban className="w-4 h-4 text-danger/70" />
                  <h4 className="font-semibold truncate">{deal.name}</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {deal.type} • {deal.stage}
                </p>
                
                {/* Blockers - السبب */}
                <div className="space-y-1">
                  {deal.blockers.map((blocker, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-danger bg-danger/10 px-2.5 py-1.5 rounded-lg"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{blocker}</span>
                    </div>
                  ))}
                </div>

                {/* Suggested Action */}
                {deal.suggested_action && (
                  <p className="text-sm text-primary font-medium mt-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    {deal.suggested_action}
                  </p>
                )}
              </div>

              {/* Readiness Score */}
              <div className="shrink-0 text-left">
                <div className={cn(
                  "text-lg font-bold",
                  deal.readiness_score >= 60 ? "text-success" : 
                  deal.readiness_score >= 40 ? "text-warning" : "text-danger"
                )}>
                  {deal.readiness_score}%
                </div>
                <p className="text-xs text-muted-foreground">جاهزية</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      {blockedDeals.length > 4 && (
        <div className="p-3 bg-danger/5 text-center border-t border-danger/20">
          <Link
            to="/focus?filter=attention"
            className="text-sm text-danger hover:underline"
          >
            + {blockedDeals.length - 4} مصالح تانية متعطلة
          </Link>
        </div>
      )}
    </div>
  );
};