import { CheckCircle2, Circle, Trash2, Plus, ListTodo, ArrowRight } from 'lucide-react';
import { useDailyMoves, useToggleDailyMove, useDeleteDailyMove, useCreateDailyMove } from '@/hooks/useDailyMoves';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export const DailyMovesCard = () => {
  const { data: moves = [], isLoading } = useDailyMoves();
  const toggleMove = useToggleDailyMove();
  const deleteMove = useDeleteDailyMove();
  const createMove = useCreateDailyMove();
  const [newMove, setNewMove] = useState('');

  const handleAddMove = () => {
    if (!newMove.trim()) return;
    createMove.mutate({ title: newMove, priority: moves.length + 1 });
    setNewMove('');
  };

  const completedCount = moves.filter(m => m.is_completed).length;
  const progress = moves.length > 0 ? (completedCount / moves.length) * 100 : 0;

  return (
    <div className="card-elegant overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg shadow-accent/20">
              <ListTodo className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-lg">تحركات اليوم</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount} من {moves.length} خلصت
              </p>
            </div>
          </div>
          {moves.length > 0 && (
            <div className="text-left">
              <span className="text-4xl font-bold text-gradient-accent">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {moves.length > 0 && (
        <div className="px-6 py-3 bg-secondary/20">
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-accent rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
      )}

      {/* Moves List */}
      <div className="p-6 pt-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-secondary/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : moves.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <ListTodo className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground font-medium mb-1">مفيش تحركات لليوم</p>
            <p className="text-xs text-muted-foreground/70">أضف أول تحرك تحت</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {moves.map((move, index) => (
              <div 
                key={move.id} 
                className={cn(
                  "group flex items-center gap-3 p-4 rounded-xl transition-all border",
                  move.is_completed 
                    ? "bg-success/5 border-success/20" 
                    : "bg-secondary/20 border-transparent hover:border-accent/20 hover:bg-secondary/40"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button 
                  onClick={() => toggleMove.mutate({ id: move.id, is_completed: !move.is_completed })}
                  className="transition-transform hover:scale-110"
                >
                  {move.is_completed 
                    ? <CheckCircle2 className="w-5 h-5 text-success" /> 
                    : <Circle className="w-5 h-5 text-muted-foreground hover:text-accent" />
                  }
                </button>
                <span className={cn(
                  "flex-1 text-sm",
                  move.is_completed && "line-through text-muted-foreground"
                )}>
                  {move.title}
                </span>
                <button 
                  onClick={() => deleteMove.mutate(move.id)} 
                  className="text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Move */}
        <div className="flex gap-2 mt-5 pt-5 border-t border-border/50">
          <Input 
            value={newMove} 
            onChange={(e) => setNewMove(e.target.value)} 
            placeholder="أضف تحرك جديد..." 
            className="flex-1 bg-secondary/30 border-border/50 focus:border-accent/50" 
            onKeyDown={(e) => e.key === 'Enter' && handleAddMove()} 
          />
          <Button 
            onClick={handleAddMove} 
            size="icon" 
            className="bg-gradient-accent hover:opacity-90 shrink-0 shadow-lg shadow-accent/20"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
