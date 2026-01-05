// Exchange rate for currency conversion (USD to EGP)
export const USD_TO_EGP_RATE = 50;

export interface Deal {
  id: string;
  name: string;
  type: string;
  description?: string;
  expected_value: number;
  realized_value: number;
  currency: string;
  stage: string;
  priority: string;
  next_action?: string;
  next_action_date?: string;
  contacts: Contact[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Helper to convert any currency to EGP
export const toEGP = (amount: number, currency: string): number => {
  if (currency === 'USD') return amount * USD_TO_EGP_RATE;
  return amount;
};

export interface Contact {
  name: string;
  phone?: string;
  role?: string;
}

export interface DealEvent {
  id: string;
  deal_id: string;
  event_type: string;
  title: string;
  description?: string;
  event_date: string;
  created_at: string;
}

export interface Debt {
  id: string;
  creditor_name: string;
  amount: number;
  currency: string;
  monthly_payment: number;
  remaining_amount?: number;
  due_date?: string;
  pressure_level: string;
  notes?: string;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  name: string;
  company?: string;
  description?: string;
  salary_amount: number;
  currency: string;
  pay_frequency: string;
  hours_per_day?: number;
  start_date?: string;
  next_pay_date?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const PAY_FREQUENCIES = [
  'أسبوعي',
  'كل أسبوعين',
  'شهري',
  'سنوي'
] as const;

export const PAY_FREQUENCY_MAP: Record<string, string> = {
  'weekly': 'أسبوعي',
  'biweekly': 'كل أسبوعين',
  'monthly': 'شهري',
  'yearly': 'سنوي',
  'أسبوعي': 'weekly',
  'كل أسبوعين': 'biweekly',
  'شهري': 'monthly',
  'سنوي': 'yearly'
};

// Calculate monthly equivalent for any pay frequency
export const toMonthlyAmount = (amount: number, frequency: string): number => {
  switch (frequency) {
    case 'weekly':
    case 'أسبوعي':
      return amount * 4.33;
    case 'biweekly':
    case 'كل أسبوعين':
      return amount * 2.17;
    case 'yearly':
    case 'سنوي':
      return amount / 12;
    default:
      return amount;
  }
};

export interface Call {
  id: string;
  deal_id?: string;
  contact_name: string;
  phone_number?: string;
  call_type: string;
  result?: string;
  notes?: string;
  follow_up_date?: string;
  call_date: string;
  created_at: string;
}

export interface DailyMove {
  id: string;
  title: string;
  deal_id?: string;
  is_completed: boolean;
  priority: number;
  move_date: string;
  created_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIConversation {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export const DEAL_TYPES = [
  'وساطة',
  'توريد',
  'حكومي',
  'توظيف',
  'استشارات',
  'مبيعات',
  'أخرى'
] as const;

export const DEAL_STAGES = [
  'جديد',
  'بتتكلم',
  'مفاوضات',
  'مستني رد',
  'مستني توقيع',
  'مؤجل',
  'مقفول',
  'ملغي'
] as const;

export const PRIORITIES = [
  'عالي',
  'متوسط',
  'منخفض'
] as const;

export const PRESSURE_LEVELS = [
  'عالي',
  'متوسط',
  'خفيف'
] as const;

export const CALL_TYPES = [
  'صادر',
  'وارد',
  'متابعة'
] as const;