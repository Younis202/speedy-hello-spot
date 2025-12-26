import { useState } from 'react';
import { Plus, FileText, Image, FileSpreadsheet, File, Trash2, ExternalLink, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DealFile {
  id: string;
  name: string;
  file_url: string;
  file_type?: string;
  created_at: string;
}

interface FilesTabProps {
  files: DealFile[];
  onAddFile: (file: { name: string; file_url: string; file_type?: string }) => void;
  onDeleteFile: (fileId: string) => void;
}

const fileTypeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'image': { icon: Image, color: 'bg-primary/10 text-primary' },
  'document': { icon: FileText, color: 'bg-warning/10 text-warning' },
  'spreadsheet': { icon: FileSpreadsheet, color: 'bg-success/10 text-success' },
  'other': { icon: File, color: 'bg-secondary text-muted-foreground' },
};

const getFileType = (url: string, type?: string): string => {
  if (type) return type;
  const ext = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
  if (['pdf', 'doc', 'docx'].includes(ext || '')) return 'document';
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) return 'spreadsheet';
  return 'other';
};

export const FilesTab = ({ files, onAddFile, onDeleteFile }: FilesTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newFile, setNewFile] = useState({ name: '', file_url: '' });

  const handleAddFile = () => {
    if (!newFile.name.trim() || !newFile.file_url.trim()) return;
    const file_type = getFileType(newFile.file_url);
    onAddFile({ ...newFile, file_type });
    setNewFile({ name: '', file_url: '' });
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Add File Form */}
      <div className="card-elegant p-6">
        {!showForm ? (
          <Button 
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-primary hover:opacity-90 gap-2 py-6"
          >
            <Upload className="w-5 h-5" />
            إضافة ملف جديد
          </Button>
        ) : (
          <div className="space-y-4">
            <h3 className="section-title">
              <File className="w-5 h-5 text-primary" />
              إضافة ملف
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">اسم الملف *</label>
                <Input
                  value={newFile.name}
                  onChange={(e) => setNewFile({ ...newFile, name: e.target.value })}
                  placeholder="مثال: عقد البيع النهائي"
                />
              </div>
              <div>
                <label className="form-label">رابط الملف *</label>
                <Input
                  value={newFile.file_url}
                  onChange={(e) => setNewFile({ ...newFile, file_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  dir="ltr"
                />
                <p className="form-hint">يمكنك استخدام روابط من Google Drive أو Dropbox أو أي خدمة تخزين</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleAddFile} className="bg-gradient-primary hover:opacity-90 gap-2">
                <Plus className="w-4 h-4" />
                إضافة
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Files Grid */}
      {files.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {files.map((file) => {
            const fileType = getFileType(file.file_url, file.file_type);
            const config = fileTypeConfig[fileType] || fileTypeConfig['other'];
            const IconComponent = config.icon;
            
            return (
              <div 
                key={file.id} 
                className="card-premium p-5 group"
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                    config.color
                  )}>
                    <IconComponent className="w-7 h-7" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{file.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      أُضيف {formatDate(file.created_at)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <a 
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="w-4 h-4" />
                      فتح
                    </Button>
                  </a>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-danger hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {files.length === 0 && !showForm && (
        <div className="card-elegant p-12">
          <div className="empty-state">
            <File className="empty-state-icon" />
            <p className="empty-state-title">مفيش ملفات</p>
            <p className="empty-state-description">أضف روابط الملفات المرتبطة بالمصلحة دي</p>
          </div>
        </div>
      )}
    </div>
  );
};
