import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useDeal, useDeals, useUpdateDeal, useDeleteDeal } from '@/hooks/useDeals';
import { useDebts } from '@/hooks/useDebts';
import { useDealEvents, useCreateDealEvent } from '@/hooks/useDealEvents';
import { useDealTasks, useCreateDealTask, useUpdateDealTask, useDeleteDealTask } from '@/hooks/useDealTasks';
import { useDealCalls, useCreateDealCall } from '@/hooks/useDealCalls';
import { useDealFiles, useCreateDealFile, useDeleteDealFile } from '@/hooks/useDealFiles';
import { usePriorityEngine } from '@/hooks/usePriorityEngine';
import { DealHeader } from '@/components/deal/DealHeader';
import { DealStats } from '@/components/deal/DealStats';
import { DealNextAction } from '@/components/deal/DealNextAction';
import { DealReadinessCard } from '@/components/deal/DealReadinessCard';
import { DealTabs, TabType } from '@/components/deal/DealTabs';
import { OverviewTab } from '@/components/deal/tabs/OverviewTab';
import { TasksTab } from '@/components/deal/tabs/TasksTab';
import { ContactsTab } from '@/components/deal/tabs/ContactsTab';
import { CallsTab } from '@/components/deal/tabs/CallsTab';
import { TimelineTab } from '@/components/deal/tabs/TimelineTab';
import { FilesTab } from '@/components/deal/tabs/FilesTab';
import { NotesTab } from '@/components/deal/tabs/NotesTab';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Link } from 'react-router-dom';

const DealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id || '');
  const { data: allDeals = [] } = useDeals();
  const { data: debts = [] } = useDebts();
  const { data: events = [] } = useDealEvents(id || '');
  const { data: tasks = [] } = useDealTasks(id || '');
  const { data: calls = [] } = useDealCalls(id || '');
  const { data: files = [] } = useDealFiles(id || '');
  
  // Priority Engine for this deal
  const { prioritizedDeals } = usePriorityEngine({ deals: allDeals, debts });
  
  const updateDeal = useUpdateDeal();
  const deleteDeal = useDeleteDeal();
  const createEvent = useCreateDealEvent();
  const createTask = useCreateDealTask();
  const updateTask = useUpdateDealTask();
  const deleteTask = useDeleteDealTask();
  const createCall = useCreateDealCall();
  const createFile = useCreateDealFile();
  const deleteFile = useDeleteDealFile();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="h-40 bg-card rounded-2xl animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}
          </div>
          <div className="h-64 bg-card rounded-2xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!deal) {
    return (
      <Layout>
        <div className="empty-state">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-secondary flex items-center justify-center">
            <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="empty-state-title">المصلحة مش موجودة</p>
          <Link to="/deals" className="text-primary hover:underline mt-4 inline-block">
            ← ارجع للمصالح
          </Link>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    deleteDeal.mutate(deal.id, { onSuccess: () => navigate('/deals') });
  };

  const handleUpdateNextAction = (nextAction: string, nextActionDate?: string) => {
    updateDeal.mutate({ id: deal.id, next_action: nextAction, next_action_date: nextActionDate });
  };

  const handleToggleTask = (task: { id: string; is_completed: boolean }) => {
    updateTask.mutate({ id: task.id, deal_id: deal.id, is_completed: !task.is_completed });
  };

  const handleAddTask = (title: string, priority?: number, dueDate?: string) => {
    createTask.mutate({ deal_id: deal.id, title, priority, due_date: dueDate });
  };

  const handleUpdateContacts = (contacts: { name: string; phone?: string; role?: string }[]) => {
    updateDeal.mutate({ id: deal.id, contacts });
  };

  const handleAddCall = (call: any) => {
    createCall.mutate({ deal_id: deal.id, ...call });
  };

  const handleAddEvent = (event: { title: string; event_type: string; description?: string }) => {
    createEvent.mutate({ deal_id: deal.id, ...event });
  };

  const handleAddFile = (file: { name: string; file_url: string; file_type?: string }) => {
    createFile.mutate({ deal_id: deal.id, ...file });
  };

  const handleUpdateNotes = (notes: string) => {
    updateDeal.mutate({ id: deal.id, notes });
  };

  const completedTasks = tasks.filter(t => t.is_completed).length;
  
  // Get prioritized version of this deal
  const prioritizedDeal = prioritizedDeals.find(d => d.id === deal.id);

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <DealHeader deal={deal} onDelete={() => setShowDeleteDialog(true)} />
        
        {/* Readiness Card - Big and prominent */}
        {prioritizedDeal && (
          <DealReadinessCard prioritizedDeal={prioritizedDeal} />
        )}
        
        <DealStats 
          deal={deal}
          tasksCount={{ completed: completedTasks, total: tasks.length }}
          callsCount={calls.length}
          eventsCount={events.length}
        />
        
        <DealNextAction 
          nextAction={deal.next_action}
          nextActionDate={deal.next_action_date}
          onUpdate={handleUpdateNextAction}
        />
        
        <DealTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={{
            tasks: { completed: completedTasks, total: tasks.length },
            contacts: deal.contacts?.length || 0,
            calls: calls.length,
            events: events.length,
            files: files.length,
          }}
        />
        
        <div className="pb-8">
          {activeTab === 'overview' && (
            <OverviewTab 
              deal={deal} 
              tasks={tasks} 
              events={events} 
              calls={calls}
              onTabChange={setActiveTab}
              onToggleTask={handleToggleTask}
            />
          )}
          {activeTab === 'tasks' && (
            <TasksTab 
              tasks={tasks}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={(id) => deleteTask.mutate({ id, deal_id: deal.id })}
            />
          )}
          {activeTab === 'contacts' && (
            <ContactsTab 
              contacts={deal.contacts || []}
              onUpdateContacts={handleUpdateContacts}
            />
          )}
          {activeTab === 'calls' && (
            <CallsTab calls={calls} onAddCall={handleAddCall} />
          )}
          {activeTab === 'timeline' && (
            <TimelineTab events={events} onAddEvent={handleAddEvent} />
          )}
          {activeTab === 'files' && (
            <FilesTab 
              files={files}
              onAddFile={handleAddFile}
              onDeleteFile={(id) => deleteFile.mutate({ id, deal_id: deal.id })}
            />
          )}
          {activeTab === 'notes' && (
            <NotesTab notes={deal.notes} onUpdateNotes={handleUpdateNotes} />
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المصلحة؟</AlertDialogTitle>
            <AlertDialogDescription>هتتحذف المصلحة دي وكل اللي فيها نهائياً.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>لأ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-danger hover:bg-danger/90">احذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default DealDetailsPage;
