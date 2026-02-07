import { useViewMode } from '@/contexts/ViewModeContext';
import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ViewModeSwitcherProps {
  collapsed?: boolean;
}

export function ViewModeSwitcher({ collapsed = false }: ViewModeSwitcherProps) {
  const { viewMode, setViewMode, canSwitchViews, individualLabel, roleLabel } = useViewMode();
  
  if (!canSwitchViews) {
    return null;
  }

  // Collapsed version - just show icons with tooltips
  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('individual')}
              className={cn(
                "h-8 w-8",
                viewMode === 'individual' 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{individualLabel}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('role')}
              className={cn(
                "h-8 w-8",
                viewMode === 'role' 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground hover:text-foreground"
              )}
            >
              <Briefcase className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">{roleLabel}</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-1 rounded-lg bg-sidebar-accent/50 border border-sidebar-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('individual')}
        className={cn(
          "gap-2 h-7 px-2 text-xs font-medium transition-all justify-start w-full",
          viewMode === 'individual' 
            ? "bg-background shadow-sm text-foreground" 
            : "text-sidebar-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        <User className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{individualLabel}</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('role')}
        className={cn(
          "gap-2 h-7 px-2 text-xs font-medium transition-all justify-start w-full",
          viewMode === 'role' 
            ? "bg-background shadow-sm text-foreground" 
            : "text-sidebar-foreground hover:text-foreground hover:bg-transparent"
        )}
      >
        <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="truncate">{roleLabel}</span>
      </Button>
    </div>
  );
}
