import { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

// تعريف API الخاص بـ Electron
declare global {
  interface Window {
    electronAPI?: {
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isElectron: boolean;
      onMaximizeChange: (callback: (isMaximized: boolean) => void) => void;
    };
  }
}

const ElectronTitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  useEffect(() => {
    if (isElectron && window.electronAPI?.onMaximizeChange) {
      window.electronAPI.onMaximizeChange((maximized) => {
        setIsMaximized(maximized);
      });
    }
  }, [isElectron]);

  // لا تظهر الـ Title Bar إلا في Electron
  if (!isElectron) return null;

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-10 bg-background/95 backdrop-blur-sm border-b border-border/50 flex items-center justify-between z-[9999] select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Logo & Title */}
      <div className="flex items-center gap-3 px-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs">
          🎯
        </div>
        <span className="text-sm font-semibold text-foreground/90">
          Control Room - مركز التحكم
        </span>
      </div>

      {/* Window Controls */}
      <div 
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="h-full px-4 hover:bg-muted/50 transition-colors flex items-center justify-center group"
          title="تصغير"
        >
          <Minus className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        {/* Maximize/Restore */}
        <button
          onClick={handleMaximize}
          className="h-full px-4 hover:bg-muted/50 transition-colors flex items-center justify-center group"
          title={isMaximized ? "استعادة" : "تكبير"}
        >
          {isMaximized ? (
            <Square className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>

        {/* Close */}
        <button
          onClick={handleClose}
          className="h-full px-4 hover:bg-destructive transition-colors flex items-center justify-center group"
          title="إغلاق"
        >
          <X className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default ElectronTitleBar;
