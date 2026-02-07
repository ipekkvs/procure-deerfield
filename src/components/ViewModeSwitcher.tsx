import { useViewMode } from '@/contexts/ViewModeContext';
import { Button } from '@/components/ui/button';
import { User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ViewModeSwitcher() {
  const { viewMode, setViewMode, canSwitchViews, individualLabel, roleLabel } = useViewMode();
  
  if (!canSwitchViews) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('individual')}
        className={cn(
          "gap-2 h-8 px-3 text-xs font-medium transition-all",
          viewMode === 'individual' 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <User className="w-3.5 h-3.5" />
        {individualLabel}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('role')}
        className={cn(
          "gap-2 h-8 px-3 text-xs font-medium transition-all",
          viewMode === 'role' 
            ? "bg-background shadow-sm text-foreground" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Briefcase className="w-3.5 h-3.5" />
        {roleLabel}
      </Button>
    </div>
  );
}
