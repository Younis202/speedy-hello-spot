import { Layout } from '@/components/Layout';
import { Bot } from 'lucide-react';

const AIPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">المساعد الذكي</h1>
        <div className="glass rounded-2xl p-12 text-center">
          <Bot className="w-16 h-16 mx-auto text-primary mb-4 animate-pulse" />
          <p className="text-xl text-muted-foreground">قريباً - المساعد اللي يفكر بدالك</p>
        </div>
      </div>
    </Layout>
  );
};

export default AIPage;