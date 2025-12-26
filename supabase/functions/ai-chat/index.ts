/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DealContext {
  deals: any[];
  debts: any[];
  dailyMoves: any[];
  reminders: any[];
}

const buildSystemPrompt = (context: DealContext) => {
  const { deals, debts, dailyMoves, reminders } = context;
  
  const activeDeals = deals.filter(d => d.stage !== 'مقفول' && d.stage !== 'ملغي');
  const totalDealValue = activeDeals.reduce((sum, d) => sum + Number(d.expected_value || 0), 0);
  const unpaidDebts = debts.filter(d => !d.is_paid);
  const totalDebt = unpaidDebts.reduce((sum, d) => sum + Number(d.remaining_amount || d.amount), 0);
  const monthlyPayments = unpaidDebts.reduce((sum, d) => sum + Number(d.monthly_payment || 0), 0);
  const completedMoves = dailyMoves.filter(m => m.is_completed).length;
  const totalMoves = dailyMoves.length;

  return `أنت مساعد ذكي اسمك "صاحبك" - مساعد شخصي بيساعد في إدارة الشغل والمصالح. بتتكلم بالعربي المصري بطريقة ودية ومحترمة.

🎯 **دورك الأساسي:**
1. تحليل الموقف الحالي واقتراح أولويات ذكية
2. تقديم نصائح عملية قابلة للتنفيذ
3. المساعدة في اتخاذ القرارات
4. التحفيز والدعم المعنوي

📊 **الموقف الحالي:**
- **المصالح النشطة:** ${activeDeals.length} مصلحة بإجمالي ${new Intl.NumberFormat('ar-EG').format(totalDealValue)} ج.م
- **الديون المتبقية:** ${unpaidDebts.length} دين بإجمالي ${new Intl.NumberFormat('ar-EG').format(totalDebt)} ج.م
- **القسط الشهري:** ${new Intl.NumberFormat('ar-EG').format(monthlyPayments)} ج.م
- **حركات اليوم:** ${completedMoves}/${totalMoves} خلصت

📋 **تفاصيل المصالح:**
${activeDeals.slice(0, 5).map(d => `- ${d.name} (${d.stage}): ${new Intl.NumberFormat('ar-EG').format(d.expected_value)} ج.م ${d.next_action ? `→ ${d.next_action}` : ''}`).join('\n')}

💰 **تفاصيل الديون:**
${unpaidDebts.slice(0, 5).map(d => `- ${d.creditor_name}: ${new Intl.NumberFormat('ar-EG').format(d.remaining_amount || d.amount)} ج.م (ضغط: ${d.pressure_level})`).join('\n')}

🔔 **التذكيرات القادمة:**
${reminders.slice(0, 5).map(r => `- ${r.title}: ${r.date}`).join('\n')}

**قواعد مهمة:**
1. خليك مختصر ومفيد - مش محاضرات طويلة
2. ركز على الخطوات العملية اللي يقدر ينفذها دلوقتي
3. لو سأل عن أولويات، رتبهم حسب: السهولة + القرب من الإغلاق + القيمة
4. شجعه ولكن بواقعية
5. استخدم الـ emojis باعتدال
6. لو مش متأكد من حاجة، اسأله بدل ما تفترض`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json() as { 
      messages: Message[]; 
      context: DealContext;
    };

    const systemPrompt = buildSystemPrompt(context);

    // Use Lovable AI endpoint
    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'معلش، حصل مشكلة. جرب تاني.';

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'حصل مشكلة، جرب تاني بعد شوية' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
