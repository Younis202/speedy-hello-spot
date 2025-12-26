import { useState, useEffect } from 'react';
import { Edit3, Save, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface NotesTabProps {
  notes?: string;
  onUpdateNotes: (notes: string) => void;
}

export const NotesTab = ({ notes, onUpdateNotes }: NotesTabProps) => {
  const [editing, setEditing] = useState(false);
  const [notesValue, setNotesValue] = useState(notes || '');

  useEffect(() => {
    setNotesValue(notes || '');
  }, [notes]);

  const handleSave = () => {
    onUpdateNotes(notesValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setNotesValue(notes || '');
    setEditing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="section-title">
            <MessageSquare className="w-5 h-5 text-primary" />
            ملاحظات المصلحة
          </h3>
          
          {!editing && (
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2"
              onClick={() => setEditing(true)}
            >
              <Edit3 className="w-4 h-4" />
              تعديل
            </Button>
          )}
        </div>
        
        {editing ? (
          <div className="space-y-4">
            <Textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="اكتب ملاحظاتك هنا... 

يمكنك تدوين:
• ملاحظات عن العميل
• تفاصيل مهمة للتفاوض
• معلومات الاتصال الإضافية
• أي شيء تحتاج تتذكره"
              rows={12}
              className="text-lg leading-relaxed"
            />
            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-gradient-primary hover:opacity-90 gap-2">
                <Save className="w-4 h-4" />
                حفظ الملاحظات
              </Button>
              <Button variant="outline" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                إلغاء
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "min-h-[300px] p-6 rounded-xl",
            notes ? "bg-secondary/30" : "bg-secondary/20 flex items-center justify-center"
          )}>
            {notes ? (
              <p className="whitespace-pre-wrap leading-relaxed text-lg">{notes}</p>
            ) : (
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">مفيش ملاحظات...</p>
                <p className="text-sm text-muted-foreground/70 mt-1">اضغط تعديل لإضافة ملاحظات</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
