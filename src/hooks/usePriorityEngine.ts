import { useMemo } from 'react';
import { Deal, Debt } from '@/types';
import { parseISO, differenceInDays, isToday, isPast, isTomorrow, differenceInWeeks } from 'date-fns';

export interface PrioritizedDeal extends Deal {
  priority_score: number;
  priority_reasons: string[];
  focus_level: 'critical' | 'high' | 'medium' | 'low';
  suggested_action?: string;
  blockers: string[];
  execution_difficulty: 'easy' | 'medium' | 'hard';
  readiness_score: number; // 0-100 - هل جاهز للتنفيذ دلوقتي؟
}

interface PriorityContext {
  deals: Deal[];
  debts: Debt[];
}

// ============================================
// 🧠 SMART PRIORITY ENGINE - مش بالفلوس بس!
// ============================================

interface ScoreResult {
  score: number;
  reasons: string[];
  suggestedAction?: string;
  blockers: string[];
  executionDifficulty: 'easy' | 'medium' | 'hard';
  readinessScore: number;
}

// تحليل جاهزية المصلحة للتنفيذ
const analyzeReadiness = (deal: Deal): { score: number; blockers: string[] } => {
  let score = 100;
  const blockers: string[] = [];

  // ❌ مفيش خطوة قادمة محددة = مش جاهز
  if (!deal.next_action || deal.next_action.trim().length === 0) {
    score -= 40;
    blockers.push('مفيش خطوة قادمة محددة');
  }

  // ❌ مفيش موعد = مش urgent
  if (!deal.next_action_date) {
    score -= 20;
    blockers.push('مفيش موعد للخطوة');
  }

  // ❌ مرحلة جديدة ومفيش تفاصيل = لسه محتاج شغل
  if (deal.stage === 'جديد') {
    score -= 15;
    blockers.push('لسه في البداية');
  }

  // ✅ مستني توقيع = قريب جداً
  if (deal.stage === 'مستني توقيع') {
    score += 20;
  }

  // ✅ في مفاوضات = progress حقيقي
  if (deal.stage === 'مفاوضات') {
    score += 10;
  }

  return { score: Math.max(0, Math.min(100, score)), blockers };
};

// تحليل صعوبة التنفيذ
const analyzeExecutionDifficulty = (deal: Deal): 'easy' | 'medium' | 'hard' => {
  const stage = deal.stage;
  const hasNextAction = deal.next_action && deal.next_action.trim().length > 0;
  const hasDate = !!deal.next_action_date;

  // سهل: خطوة واضحة + موعد + قريب من الإغلاق
  if (hasNextAction && hasDate && (stage === 'مستني توقيع' || stage === 'مفاوضات')) {
    return 'easy';
  }

  // صعب: جديد بدون تفاصيل أو مستني رد
  if (stage === 'جديد' || stage === 'مستني رد') {
    if (!hasNextAction) return 'hard';
    return 'medium';
  }

  return 'medium';
};

// ============================================
// 🎯 CALCULATE SMART PRIORITY SCORE
// ============================================
const calculateDealScore = (deal: Deal, debts: Debt[]): ScoreResult => {
  let score = 0;
  const reasons: string[] = [];
  let suggestedAction: string | undefined;

  // Skip closed or cancelled deals
  if (deal.stage === 'مقفول' || deal.stage === 'ملغي') {
    return { 
      score: 0, 
      reasons: ['مصلحة مغلقة'], 
      blockers: [], 
      executionDifficulty: 'easy',
      readinessScore: 0 
    };
  }

  const { score: readinessScore, blockers } = analyzeReadiness(deal);
  const executionDifficulty = analyzeExecutionDifficulty(deal);

  // ============================================
  // 1️⃣ READINESS SCORE (0-30) - الأهم!
  // لو مش جاهز، مش هيتنفذ
  // ============================================
  const readinessPoints = Math.round(readinessScore * 0.3);
  score += readinessPoints;

  if (readinessScore >= 80) {
    reasons.push('جاهز للتنفيذ دلوقتي');
  } else if (readinessScore < 50) {
    suggestedAction = 'حدد الخطوة القادمة الأول';
  }

  // ============================================
  // 2️⃣ URGENCY (0-25) - الوقت بيجري
  // ============================================
  if (deal.next_action_date) {
    const actionDate = parseISO(deal.next_action_date);
    const daysUntil = differenceInDays(actionDate, new Date());
    
    if (isPast(actionDate) && !isToday(actionDate)) {
      score += 25;
      reasons.push('الموعد فات!');
      suggestedAction = suggestedAction || 'لازم تتحرك النهارده';
    } else if (isToday(actionDate)) {
      score += 22;
      reasons.push('الموعد النهاردة');
      suggestedAction = suggestedAction || 'نفذ الخطوة دلوقتي';
    } else if (isTomorrow(actionDate)) {
      score += 18;
      reasons.push('الموعد بكرة');
    } else if (daysUntil <= 3) {
      score += 14;
      reasons.push(`${daysUntil} أيام للموعد`);
    } else if (daysUntil <= 7) {
      score += 8;
    }
  }

  // ============================================
  // 3️⃣ EXECUTION EASE (0-20) - الأسهل الأول
  // مش دايماً الأكبر، الأسهل يتقفل الأول
  // ============================================
  if (executionDifficulty === 'easy') {
    score += 20;
    reasons.push('سهل يتقفل');
  } else if (executionDifficulty === 'medium') {
    score += 10;
  } else {
    score += 3;
  }

  // ============================================
  // 4️⃣ STAGE MOMENTUM (0-15) - قريب من الإغلاق
  // ============================================
  const stageScores: Record<string, { points: number; reason?: string }> = {
    'مستني توقيع': { points: 15, reason: 'قريبة جداً من الإغلاق!' },
    'مفاوضات': { points: 12, reason: 'في المفاوضات' },
    'مستني رد': { points: 6 },
    'بتتكلم': { points: 4 },
    'جديد': { points: 2 },
  };
  
  const stageInfo = stageScores[deal.stage] || { points: 0 };
  score += stageInfo.points;
  if (stageInfo.reason) reasons.push(stageInfo.reason);

  // ============================================
  // 5️⃣ DEBT RELIEF POTENTIAL (0-10) - بونص
  // لو هتحل مشكلة ديون = بونص
  // ============================================
  const value = Number(deal.expected_value) || 0;
  const totalDebt = debts.filter(d => !d.is_paid).reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);
  const highPressureDebt = debts.filter(d => !d.is_paid && d.pressure_level === 'عالي')
    .reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);

  // بونص لو هتحل ديون - بس مش العامل الأساسي
  if (value >= totalDebt && totalDebt > 0 && executionDifficulty !== 'hard') {
    score += 10;
    reasons.push('تسد كل الديون');
  } else if (value >= highPressureDebt && highPressureDebt > 0 && executionDifficulty !== 'hard') {
    score += 7;
    reasons.push('تحل ديون الضغط');
  } else if (value >= totalDebt * 0.5 && totalDebt > 0 && executionDifficulty === 'easy') {
    score += 5;
    reasons.push('تغطي نص الديون');
  }

  // ============================================
  // ❌ PENALTIES - عقوبات
  // ============================================
  
  // لو مفيش خطوة واضحة = عقوبة
  if (!deal.next_action || deal.next_action.trim().length === 0) {
    score -= 15;
  }

  // لو صعب التنفيذ = عقوبة
  if (executionDifficulty === 'hard') {
    score -= 10;
  }

  // ============================================
  // 🎁 BONUS - User Priority
  // ============================================
  if (deal.priority === 'عالي') {
    score += 5;
  }

  // ============================================
  // 💡 SMART SUGGESTED ACTION
  // ============================================
  if (!suggestedAction) {
    if (blockers.length > 0) {
      suggestedAction = `عالج: ${blockers[0]}`;
    } else if (deal.stage === 'مستني توقيع') {
      suggestedAction = 'تابع علشان تقفل';
    } else if (deal.stage === 'مفاوضات') {
      suggestedAction = 'خلص المفاوضة';
    } else if (deal.stage === 'مستني رد') {
      suggestedAction = 'فولو أب';
    } else if (deal.stage === 'بتتكلم') {
      suggestedAction = 'اتفق على الخطوة الجاية';
    } else {
      suggestedAction = 'ابدأ التواصل';
    }
  }

  return { 
    score: Math.max(0, Math.min(100, score)), 
    reasons: reasons.slice(0, 3),
    suggestedAction,
    blockers,
    executionDifficulty,
    readinessScore
  };
};

const getFocusLevel = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (score >= 65) return 'critical';
  if (score >= 45) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
};

export const usePriorityEngine = ({ deals, debts }: PriorityContext) => {
  const prioritizedDeals = useMemo(() => {
    const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي');
    
    const scored = activeDeals.map(deal => {
      const result = calculateDealScore(deal, debts);
      return {
        ...deal,
        priority_score: result.score,
        priority_reasons: result.reasons,
        focus_level: getFocusLevel(result.score),
        suggested_action: result.suggestedAction,
        blockers: result.blockers,
        execution_difficulty: result.executionDifficulty,
        readiness_score: result.readinessScore,
      } as PrioritizedDeal;
    });

    // Sort by priority score descending
    return scored.sort((a, b) => b.priority_score - a.priority_score);
  }, [deals, debts]);

  // Top 3 deals to focus on - الأهم: الجاهز والسهل، مش الأكبر
  const topPriorities = prioritizedDeals.slice(0, 3);

  // Critical deals
  const criticalDeals = prioritizedDeals.filter(d => d.focus_level === 'critical');

  // Deals needing attention (has blockers)
  const needsAttention = prioritizedDeals.filter(d => d.blockers.length > 0);

  // Easy wins - سهل يتقفل ومحتاج شوية شغل بس
  const easyWins = prioritizedDeals.filter(d => 
    d.execution_difficulty === 'easy' && 
    d.readiness_score >= 60 &&
    d.stage !== 'جديد'
  );

  // Blocked deals - محتاج تحل المشكلة الأول
  const blockedDeals = prioritizedDeals.filter(d => 
    d.readiness_score < 50 || d.blockers.length >= 2
  );

  // Summary stats
  const summary = useMemo(() => {
    const totalValue = prioritizedDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
    const criticalValue = criticalDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
    const avgScore = prioritizedDeals.length > 0 
      ? Math.round(prioritizedDeals.reduce((sum, d) => sum + d.priority_score, 0) / prioritizedDeals.length)
      : 0;
    const avgReadiness = prioritizedDeals.length > 0
      ? Math.round(prioritizedDeals.reduce((sum, d) => sum + d.readiness_score, 0) / prioritizedDeals.length)
      : 0;

    return {
      totalDeals: prioritizedDeals.length,
      criticalCount: criticalDeals.length,
      avgPriorityScore: avgScore,
      avgReadinessScore: avgReadiness,
      totalValue,
      criticalValue,
      needsAttentionCount: needsAttention.length,
      easyWinsCount: easyWins.length,
      blockedCount: blockedDeals.length,
    };
  }, [prioritizedDeals, criticalDeals, needsAttention, easyWins, blockedDeals]);

  // Get the single most important thing to do right now
  const focusNow = topPriorities[0];

  return {
    prioritizedDeals,
    topPriorities,
    criticalDeals,
    needsAttention,
    easyWins,
    blockedDeals,
    summary,
    focusNow,
  };
};
