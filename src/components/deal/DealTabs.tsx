import { Target, CheckCircle2, Users, Phone, History, FileText, MessageSquare, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'overview' | 'tasks' | 'contacts' | 'calls' | 'timeline' | 'files' | 'notes';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface DealTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    tasks: { completed: number; total: number };
    contacts: number;
    calls: number;
    events: number;
    files: number;
  };
}

export const DealTabs = ({ activeTab, onTabChange, counts }: DealTabsProps) => {
  const tabs: Tab[] = [
    { id: 'overview', label: 'نظرة عامة', icon: Target },
    { 
      id: 'tasks', 
      label: 'المهام', 
      icon: CheckCircle2,
      count: counts.tasks.total > 0 ? counts.tasks.total : undefined,
    },
    { 
      id: 'contacts', 
      label: 'جهات الاتصال', 
      icon: Users,
      count: counts.contacts > 0 ? counts.contacts : undefined,
    },
    { 
      id: 'calls', 
      label: 'المكالمات', 
      icon: Phone,
      count: counts.calls > 0 ? counts.calls : undefined,
    },
    { 
      id: 'timeline', 
      label: 'التاريخ', 
      icon: History,
      count: counts.events > 0 ? counts.events : undefined,
    },
    { 
      id: 'files', 
      label: 'الملفات', 
      icon: FolderOpen,
      count: counts.files > 0 ? counts.files : undefined,
    },
    { id: 'notes', label: 'ملاحظات', icon: MessageSquare },
  ];

  return (
    <div className="border-b border-border animate-fade-in">
      <div className="flex gap-1 overflow-x-auto pb-px scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-xl",
              "hover:bg-secondary/50",
              activeTab === tab.id 
                ? "bg-card text-primary border-b-2 border-primary shadow-sm" 
                : "text-muted-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary" 
                  : "bg-secondary text-muted-foreground"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
