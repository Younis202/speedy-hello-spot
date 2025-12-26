import { AlertTriangle, CheckCircle, Target, Zap, ArrowRight, Lightbulb, Flame, Pin, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrioritizedDeal } from '@/hooks/usePriorityEngine';

interface DealReadinessCardProps {
  prioritizedDeal: PrioritizedDeal;
}

// حلول ذكية للمعوقات
const getBlockerSolution = (blocker: string): { solution: string; action: string } => {
  const solutions: Record<string, { solution: string; action: string }> = {
    'مفيش خطوة قادمة محددة': {
      solution: 'حدد إيه أول حاجة لازم تعملها - مكالمة؟ إيميل؟ اجتماع؟',
      action: 'حدد الخطوة الجاية'
    },
    'مفيش موعد للخطوة': {
      solution: 'حط موعد محدد - حتى لو تقريبي. الموعد بيخلي المخ يركز.',
      action: 'حدد الموعد'
    },
    'لسه في البداية': {
      solution: 'محتاج تتحرك بسرعة - أول اتصال أو رسالة هي اللي بتكسر الجمود.',
      action: 'ابدأ التواصل'
    },
  };

  return solutions[blocker] || {
    solution: 'حدد إيه المشكلة بالظبط وإيه أول خطوة لحلها.',
    action: 'حل المشكلة'
  };
};

export const DealReadinessCard = ({ prioritizedDeal }: DealReadinessCardProps) => {
  const { readiness_score, blockers, execution_difficulty, priority_score, priority_reasons, suggested_action, focus_level } = prioritizedDeal;

  // Colors based on readiness
  const getReadinessColor = () => {
    if (readiness_score >= 70) return { bg: 'bg-success', text: 'text-success', bgLight: 'bg-success/10', border: 'border-success/30' };
    if (readiness_score >= 50) return { bg: 'bg-warning', text: 'text-warning', bgLight: 'bg-warning/10', border: 'border-warning/30' };
    return { bg: 'bg-danger', text: 'text-danger', bgLight: 'bg-danger/10', border: 'border-danger/30' };
  };

  const readinessColors = getReadinessColor();

  const difficultyConfig = {
    easy: { label: 'سهل التنفيذ', Icon: Target, color: 'text-success', bg: 'bg-success/10' },
    medium: { label: 'متوسط الصعوبة', Icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
    hard: { label: 'صعب التنفيذ', Icon: Flame, color: 'text-danger', bg: 'bg-danger/10' },
  };

  const focusConfig = {
    critical: { label: 'حرج', Icon: Flame, color: 'text-danger', bg: 'bg-danger/15' },
    high: { label: 'عالي', Icon: Zap, color: 'text-warning', bg: 'bg-warning/15' },
    medium: { label: 'متوسط', Icon: Pin, color: 'text-primary', bg: 'bg-primary/15' },
    low: { label: 'عادي', Icon: ClipboardList, color: 'text-muted-foreground', bg: 'bg-muted' },
  };

  const difficulty = difficultyConfig[execution_difficulty];
  const focus = focusConfig[focus_level];

  return (
    <div className={cn(
      "card-elegant overflow-hidden border-2",
      readinessColors.border
    )}>
      {/* Header with big readiness score */}
      <div className={cn("p-6", readinessColors.bgLight)}>
        <div className="flex items-start justify-between gap-6">
          {/* Readiness Score - Circular Progress */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              {/* Background Circle */}
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="hsl(var(--secondary))"
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={readiness_score >= 70 ? 'hsl(var(--success))' : 
                          readiness_score >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--danger))'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(readiness_score / 100) * 327} 327`}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold", readinessColors.text)}>
                  {readiness_score}%
                </span>
                <span className="text-xs text-muted-foreground">جاهزية</span>
              </div>
            </div>
            <p className={cn("text-sm font-medium mt-2", readinessColors.text)}>
              {readiness_score >= 70 ? 'جاهز للتنفيذ' : readiness_score >= 50 ? 'قريب' : 'محتاج شغل'}
            </p>
          </div>

          {/* Priority & Difficulty Info */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className={cn("px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5", focus.bg, focus.color)}>
                <focus.Icon className="w-4 h-4" />
                أولوية: {focus.label}
              </span>
              <span className={cn("px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5", difficulty.bg, difficulty.color)}>
                <difficulty.Icon className="w-4 h-4" />
                {difficulty.label}
              </span>
              <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary">
                {priority_score} نقطة
              </span>
            </div>

            {/* Priority Reasons */}
            <div className="flex flex-wrap gap-2">
              {priority_reasons.map((reason, i) => (
                <span 
                  key={i}
                  className="text-sm px-3 py-1.5 rounded-lg bg-secondary"
                >
                  {reason}
                </span>
              ))}
            </div>

            {/* Suggested Action */}
            {suggested_action && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary">
                <Target className="w-5 h-5 shrink-0" />
                <span className="font-medium">{suggested_action}</span>
              </div>
            )}
          </div>
        </div>

        {/* Readiness Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">مستوى الجاهزية للتنفيذ</span>
            <span className={cn("font-bold", readinessColors.text)}>
              {readiness_score >= 70 ? 'جاهز!' : readiness_score >= 50 ? 'قريب' : 'محتاج شغل'}
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-500", readinessColors.bg)}
              style={{ width: `${readiness_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Blockers Section */}
      {blockers.length > 0 && (
        <div className="p-6 border-t border-border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-danger">
            <AlertTriangle className="w-5 h-5" />
            المعوقات ({blockers.length})
          </h3>
          
          <div className="space-y-4">
            {blockers.map((blocker, i) => {
              const { solution, action } = getBlockerSolution(blocker);
              
              return (
                <div 
                  key={i}
                  className="p-4 rounded-xl bg-danger/5 border border-danger/20"
                >
                  {/* The Blocker */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-danger" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-danger">{blocker}</h4>
                    </div>
                  </div>
                  
                  {/* The Solution */}
                  <div className="flex items-start gap-3 mr-11">
                    <ArrowRight className="w-4 h-4 text-success shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">{solution}</p>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm font-medium">
                        <Zap className="w-4 h-4" />
                        {action}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Good! */}
      {blockers.length === 0 && readiness_score >= 70 && (
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-success/10 border border-success/30">
            <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-success">جاهز للتنفيذ!</h3>
              <p className="text-sm text-muted-foreground">المصلحة دي واضحة ومحددة - اتحرك عليها دلوقتي!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};