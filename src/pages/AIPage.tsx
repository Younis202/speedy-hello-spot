import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, Loader2, Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb, Trash2, Plus } from 'lucide-react';
import { Message } from '@/types';
import { useDeals } from '@/hooks/useDeals';
import { useDebts } from '@/hooks/useDebts';
import { useDailyMoves } from '@/hooks/useDailyMoves';
import { useReminders } from '@/hooks/useReminders';
import { usePriorityEngine } from '@/hooks/usePriorityEngine';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const quickPrompts = [
  { icon: TrendingUp, text: 'إيه الأولويات النهارده؟', color: 'text-green-400' },
  { icon: AlertTriangle, text: 'تحليل الديون والضغط', color: 'text-red-400' },
  { icon: Target, text: 'إيه أسهل مصلحة أقفلها؟', color: 'text-blue-400' },
  { icon: Lightbulb, text: 'اقترح خطة للأسبوع', color: 'text-yellow-400' },
];

const AIPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: deals = [] } = useDeals();
  const { data: debts = [] } = useDebts();
  const { data: dailyMoves = [] } = useDailyMoves();
  const { data: reminders = [] } = useReminders();
  const { summary, focusNow, easyWins, blockedDeals } = usePriorityEngine({ deals, debts });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: content.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [...messages, userMessage],
          context: {
            deals,
            debts,
            dailyMoves,
            reminders,
          },
        },
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      toast.error('حصل مشكلة في الاتصال');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'معلش، حصل مشكلة. جرب تاني بعد شوية 🙏',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('تم مسح المحادثة');
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">صاحبك</h1>
              <p className="text-sm text-muted-foreground">المساعد الذكي بتاعك</p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="text-muted-foreground">
              <Trash2 className="w-4 h-4 ml-2" />
              محادثة جديدة
            </Button>
          )}
        </div>

        {/* Summary Cards */}
        {messages.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-primary">{summary.totalDeals}</p>
              <p className="text-xs text-muted-foreground">مصلحة نشطة</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-400">{summary.easyWinsCount}</p>
              <p className="text-xs text-muted-foreground">سهل يتقفل</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">{summary.blockedCount}</p>
              <p className="text-xs text-muted-foreground">محتاج اهتمام</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-red-400">{debts.filter(d => !d.is_paid).length}</p>
              <p className="text-xs text-muted-foreground">دين مفتوح</p>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 glass rounded-2xl overflow-hidden flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">أهلاً بيك!</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  أنا صاحبك، هساعدك تنظم شغلك وتاخد قرارات صح. اسألني أي حاجة عن المصالح أو الديون أو الأولويات.
                </p>
                
                {/* Quick Prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(prompt.text)}
                      className="flex items-center gap-2 p-3 rounded-xl bg-background/50 hover:bg-background/80 transition-colors text-right"
                    >
                      <prompt.icon className={cn("w-5 h-5", prompt.color)} />
                      <span className="text-sm">{prompt.text}</span>
                    </button>
                  ))}
                </div>

                {/* Focus Now Card */}
                {focusNow && (
                  <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 w-full max-w-lg">
                    <p className="text-xs text-primary mb-1">🎯 ركز على دي دلوقتي</p>
                    <p className="font-semibold">{focusNow.name}</p>
                    <p className="text-sm text-muted-foreground">{focusNow.suggested_action}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 animate-fadeIn",
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-gradient-to-br from-primary/30 to-primary/10'
                    )}>
                      {message.role === 'user' ? '👤' : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-background/80 rounded-bl-none'
                    )}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 animate-fadeIn">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-background/80 rounded-2xl rounded-bl-none px-4 py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="اسألني أي حاجة..."
                className="flex-1 bg-background/50 border-border/50"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AIPage;
