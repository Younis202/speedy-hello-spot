import { useState } from 'react';
import { Plus, Circle, CheckCircle2, X, Calendar, Flag, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DealTask } from '@/hooks/useDealTasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TasksTabProps {
  tasks: DealTask[];
  onAddTask: (title: string, priority?: number, dueDate?: string) => void;
  onToggleTask: (task: DealTask) => void;
  onDeleteTask: (taskId: string) => void;
}

import { Flame, Zap, Clock as ClockIcon } from 'lucide-react';

const priorityConfig: Record<number, { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  1: { label: 'عالي', color: 'text-danger', Icon: Flame },
  2: { label: 'متوسط', color: 'text-warning', Icon: Zap },
  3: { label: 'منخفض', color: 'text-muted-foreground', Icon: ClockIcon },
};

export const TasksTab = ({ tasks, onAddTask, onToggleTask, onDeleteTask }: TasksTabProps) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<string>('2');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(
      newTaskTitle, 
      parseInt(newTaskPriority), 
      newTaskDueDate || undefined
    );
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setNewTaskPriority('2');
    setShowAdvanced(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date(new Date().toDateString());
  };

  const completedTasks = tasks.filter(t => t.is_completed);
  const pendingTasks = tasks.filter(t => !t.is_completed);
  const progress = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress Bar */}
      {tasks.length > 0 && (
        <div className="card-elegant p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">تقدم المهام</span>
            <span className="text-sm text-muted-foreground">
              {completedTasks.length} من {tasks.length} مكتملة
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Task Form */}
      <div className="card-elegant p-6">
        <h3 className="section-title mb-4">
          <Plus className="w-5 h-5 text-primary" />
          إضافة مهمة جديدة
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="اكتب المهمة هنا..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && !showAdvanced && handleAddTask()}
            />
            <Button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="shrink-0"
            >
              <Flag className="w-4 h-4" />
            </Button>
            <Button 
              onClick={handleAddTask}
              className="bg-gradient-primary hover:opacity-90 shrink-0 gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة
            </Button>
          </div>
          
          {showAdvanced && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/30 rounded-xl animate-fade-in-fast">
              <div>
                <label className="form-label">الأولوية</label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1"><span className="flex items-center gap-2"><Flame className="w-4 h-4 text-danger" /> عالي</span></SelectItem>
                    <SelectItem value="2"><span className="flex items-center gap-2"><Zap className="w-4 h-4 text-warning" /> متوسط</span></SelectItem>
                    <SelectItem value="3"><span className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-muted-foreground" /> منخفض</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">تاريخ الاستحقاق</label>
                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div className="card-elegant p-6">
          <h3 className="section-title mb-4">
            <Circle className="w-5 h-5 text-warning" />
            المهام القادمة
            <span className="text-sm font-normal text-muted-foreground mr-2">
              ({pendingTasks.length})
            </span>
          </h3>
          
          <div className="space-y-3 stagger-children">
            {pendingTasks.map((task) => {
              const priority = priorityConfig[task.priority] || priorityConfig[2];
              const overdue = task.due_date && isOverdue(task.due_date);
              
              return (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border transition-all group",
                    "bg-card hover:bg-secondary/30 border-border hover:border-primary/20",
                    overdue && "border-danger/30 bg-danger/5"
                  )}
                >
                  <button 
                    onClick={() => onToggleTask(task)}
                    className="text-muted-foreground hover:text-success transition-colors shrink-0"
                  >
                    <Circle className="w-6 h-6" />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={cn("text-xs flex items-center gap-1.5", priority.color)}>
                        <priority.Icon className="w-3.5 h-3.5" />
                        {priority.label}
                      </span>
                      {task.due_date && (
                        <span className={cn(
                          "text-xs flex items-center gap-1",
                          overdue ? "text-danger font-medium" : "text-muted-foreground"
                        )}>
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.due_date)}
                          {overdue && " (متأخرة!)"}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="text-muted-foreground hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="card-elegant p-6">
          <h3 className="section-title mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            المهام المكتملة
            <span className="text-sm font-normal text-muted-foreground mr-2">
              ({completedTasks.length})
            </span>
          </h3>
          
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center gap-4 p-3 rounded-xl bg-success/5 border border-success/10 group"
              >
                <button 
                  onClick={() => onToggleTask(task)}
                  className="text-success shrink-0"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                
                <span className="flex-1 text-sm text-muted-foreground line-through">
                  {task.title}
                </span>
                
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="text-muted-foreground hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="card-elegant p-12">
          <div className="empty-state">
            <CheckCircle2 className="empty-state-icon" />
            <p className="empty-state-title">مفيش مهام لسه</p>
            <p className="empty-state-description">أضف أول مهمة للمصلحة دي من الفورم فوق</p>
          </div>
        </div>
      )}
    </div>
  );
};
