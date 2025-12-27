import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isTomorrow, addDays, parseISO, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface Reminder {
  id: string;
  type: 'call_followup' | 'deal_action' | 'debt_due' | 'task_due';
  title: string;
  subtitle: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  link?: string;
  entityId: string;
}

export const useReminders = () => {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 7);

      // Fetch all data in parallel
      const [callsRes, dealsRes, debtsRes, tasksRes] = await Promise.all([
        supabase
          .from('calls')
          .select('*, deals(name)')
          .not('follow_up_date', 'is', null)
          .gte('follow_up_date', format(today, 'yyyy-MM-dd'))
          .lte('follow_up_date', format(nextWeek, 'yyyy-MM-dd'))
          .order('follow_up_date', { ascending: true }),
        supabase
          .from('deals')
          .select('*')
          .not('next_action_date', 'is', null)
          .not('stage', 'in', '("مقفول","ملغي")')
          .gte('next_action_date', format(today, 'yyyy-MM-dd'))
          .lte('next_action_date', format(nextWeek, 'yyyy-MM-dd'))
          .order('next_action_date', { ascending: true }),
        supabase
          .from('debts')
          .select('*')
          .eq('is_paid', false)
          .not('due_date', 'is', null)
          .gte('due_date', format(today, 'yyyy-MM-dd'))
          .lte('due_date', format(nextWeek, 'yyyy-MM-dd'))
          .order('due_date', { ascending: true }),
        supabase
          .from('deal_tasks')
          .select('*, deals(name)')
          .eq('is_completed', false)
          .not('due_date', 'is', null)
          .gte('due_date', format(today, 'yyyy-MM-dd'))
          .lte('due_date', format(nextWeek, 'yyyy-MM-dd'))
          .order('due_date', { ascending: true }),
      ]);

      const reminders: Reminder[] = [];

      // Call follow-ups
      if (callsRes.data) {
        callsRes.data.forEach(call => {
          const dealName = (call.deals as any)?.name;
          reminders.push({
            id: `call-${call.id}`,
            type: 'call_followup',
            title: `متابعة: ${call.contact_name}`,
            subtitle: dealName ? `مصلحة: ${dealName}` : call.phone_number || 'اتصال',
            date: call.follow_up_date!,
            priority: isToday(parseISO(call.follow_up_date!)) ? 'high' : 'medium',
            link: call.deal_id ? `/deals/${call.deal_id}` : '/calls',
            entityId: call.id,
          });
        });
      }

      // Deal next actions
      if (dealsRes.data) {
        dealsRes.data.forEach(deal => {
          reminders.push({
            id: `deal-${deal.id}`,
            type: 'deal_action',
            title: deal.next_action || 'إجراء مطلوب',
            subtitle: deal.name,
            date: deal.next_action_date!,
            priority: deal.priority === 'عالي' ? 'high' : deal.priority === 'متوسط' ? 'medium' : 'low',
            link: `/deals/${deal.id}`,
            entityId: deal.id,
          });
        });
      }

      // Debt due dates
      if (debtsRes.data) {
        debtsRes.data.forEach(debt => {
          reminders.push({
            id: `debt-${debt.id}`,
            type: 'debt_due',
            title: `قسط: ${debt.creditor_name}`,
            subtitle: `${new Intl.NumberFormat('ar-EG').format(debt.monthly_payment || 0)} ج.م`,
            date: debt.due_date!,
            priority: debt.pressure_level === 'عالي' ? 'high' : debt.pressure_level === 'متوسط' ? 'medium' : 'low',
            link: '/money',
            entityId: debt.id,
          });
        });
      }

      // Task due dates
      if (tasksRes.data) {
        tasksRes.data.forEach(task => {
          const dealName = (task.deals as any)?.name;
          reminders.push({
            id: `task-${task.id}`,
            type: 'task_due',
            title: task.title,
            subtitle: dealName ? `مصلحة: ${dealName}` : 'مهمة',
            date: task.due_date!,
            priority: task.priority === 1 ? 'high' : task.priority === 2 ? 'medium' : 'low',
            link: task.deal_id ? `/deals/${task.deal_id}` : undefined,
            entityId: task.id,
          });
        });
      }

      // Sort by date and priority
      return reminders.sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const formatReminderDate = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'اليوم';
  if (isTomorrow(date)) return 'بكره';
  return format(date, 'EEEE d MMMM', { locale: ar });
};

export const getTodayReminders = (reminders: Reminder[]): Reminder[] => {
  return reminders.filter(r => isToday(parseISO(r.date)));
};

export const getTomorrowReminders = (reminders: Reminder[]): Reminder[] => {
  return reminders.filter(r => isTomorrow(parseISO(r.date)));
};

export const getUpcomingReminders = (reminders: Reminder[]): Reminder[] => {
  return reminders.filter(r => !isToday(parseISO(r.date)) && !isTomorrow(parseISO(r.date)));
};
