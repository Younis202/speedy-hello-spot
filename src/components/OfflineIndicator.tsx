import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { useSyncManager } from '@/hooks/useOfflineSync';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const OfflineIndicator = () => {
  const { isOnline, isSyncing, pendingChanges, syncPendingChanges } = useSyncManager();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
    } else {
      // Hide banner after a delay when coming back online
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  return (
    <>
      {/* Floating Status Indicator */}
      <div className="fixed bottom-20 lg:bottom-4 left-4 z-50 flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all shadow-lg",
                isOnline
                  ? "bg-success/20 text-success border border-success/30"
                  : "bg-danger/20 text-danger border border-danger/30"
              )}
            >
              {isOnline ? (
                <>
                  <Cloud className="w-4 h-4" />
                  <span className="hidden sm:inline">متصل</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isOnline ? 'متصل بالإنترنت' : 'غير متصل - البيانات محفوظة محلياً'}
          </TooltipContent>
        </Tooltip>

        {/* Pending Changes Indicator */}
        {pendingChanges > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={syncPendingChanges}
                disabled={!isOnline || isSyncing}
                size="sm"
                className={cn(
                  "h-8 px-3 rounded-full text-xs font-medium shadow-lg",
                  isOnline
                    ? "bg-warning/20 text-warning border border-warning/30 hover:bg-warning/30"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <RefreshCw className={cn("w-3.5 h-3.5 ml-1", isSyncing && "animate-spin")} />
                {pendingChanges} تغيير
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isOnline
                ? 'اضغط للمزامنة'
                : 'هيتزامن لما النت يرجع'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Offline Banner */}
      {showBanner && !isOnline && (
        <div className="fixed top-16 lg:top-0 inset-x-0 lg:right-72 z-40 animate-fade-in">
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-3 flex items-center justify-center gap-3 text-sm">
            <WifiOff className="w-4 h-4 text-warning" />
            <span className="text-warning font-medium">
              أنت offline - التغييرات بتتحفظ محلياً وهتتزامن لما النت يرجع
            </span>
          </div>
        </div>
      )}

      {/* Syncing Banner */}
      {isSyncing && (
        <div className="fixed top-16 lg:top-0 inset-x-0 lg:right-72 z-40 animate-fade-in">
          <div className="bg-accent/10 border-b border-accent/20 px-4 py-3 flex items-center justify-center gap-3 text-sm">
            <RefreshCw className="w-4 h-4 text-accent animate-spin" />
            <span className="text-accent font-medium">
              جاري مزامنة البيانات...
            </span>
          </div>
        </div>
      )}
    </>
  );
};
