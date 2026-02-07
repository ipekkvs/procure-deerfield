import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Check, 
  ChevronRight, 
  Clock, 
  SkipForward, 
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  FileText,
  ArrowDown,
  Timer,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export interface WorkflowStep {
  id: string;
  label: string;
  description?: string;
  status: 'completed' | 'current' | 'pending' | 'skipped';
  isConditional?: boolean;
  conditionLabel?: string;
  approver?: {
    name: string;
    role: string;
    avatar?: string;
  };
  completedAt?: string;
  comments?: string;
  documents?: string[];
  slaHoursRemaining?: number;
  whyRequired?: string;
}

export interface ParallelSteps {
  steps: WorkflowStep[];
  label?: string;
}

export type WorkflowNode = WorkflowStep | ParallelSteps;

interface ApprovalWorkflowDiagramProps {
  nodes: WorkflowNode[];
  requestType?: 'new_purchase' | 'renewal';
  budgetedAmount?: number;
  priceNegotiated?: boolean;
  className?: string;
}

function isParallelSteps(node: WorkflowNode): node is ParallelSteps {
  return 'steps' in node && Array.isArray(node.steps);
}

const StatusIcon = ({ status, size = 'md' }: { status: WorkflowStep['status']; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  switch (status) {
    case 'completed':
      return <Check className={sizeClass} />;
    case 'current':
      return <Clock className={cn(sizeClass, "animate-pulse")} />;
    case 'skipped':
      return <SkipForward className={sizeClass} />;
    default:
      return <Timer className={sizeClass} />;
  }
};

const getStatusStyles = (status: WorkflowStep['status']) => {
  switch (status) {
    case 'completed':
      return {
        bg: 'bg-status-success',
        bgLight: 'bg-status-success-bg',
        border: 'border-status-success',
        text: 'text-status-success',
        textWhite: 'text-white',
      };
    case 'current':
      return {
        bg: 'bg-status-warning',
        bgLight: 'bg-status-warning-bg',
        border: 'border-status-warning',
        text: 'text-status-warning',
        textWhite: 'text-white',
      };
    case 'skipped':
      return {
        bg: 'bg-muted',
        bgLight: 'bg-muted/30',
        border: 'border-muted',
        text: 'text-muted-foreground',
        textWhite: 'text-muted-foreground',
      };
    default:
      return {
        bg: 'bg-primary/20',
        bgLight: 'bg-muted/20',
        border: 'border-muted',
        text: 'text-muted-foreground',
        textWhite: 'text-foreground',
      };
  }
};

const StepCard = ({ 
  step, 
  onClick, 
  compact = false 
}: { 
  step: WorkflowStep; 
  onClick?: () => void;
  compact?: boolean;
}) => {
  const isClickable = step.status === 'completed' || step.status === 'current';
  const styles = getStatusStyles(step.status);
  
  const cardContent = (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative rounded-xl border-2 transition-all duration-300 group",
        compact ? "p-3 min-w-[130px] md:min-w-[150px]" : "p-4 min-w-[160px] md:min-w-[200px]",
        styles.bgLight,
        styles.border,
        step.status === 'skipped' && "opacity-60 border-dashed",
        isClickable && "cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5",
      )}
    >
      {/* Status Badge */}
      <div className={cn(
        "absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium shadow-sm",
        styles.bg,
        styles.textWhite
      )}>
        <StatusIcon status={step.status} size="sm" />
        <span className="hidden sm:inline">
          {step.status === 'completed' ? 'Done' :
           step.status === 'current' ? 'Active' :
           step.status === 'skipped' ? 'Skipped' : 'Pending'}
        </span>
      </div>

      <div className="pt-2 space-y-1 text-center">
        <p className={cn(
          "font-semibold text-sm leading-tight",
          step.status === 'skipped' && "line-through opacity-70"
        )}>
          {step.label}
        </p>
        
        {step.description && !compact && (
          <p className="text-xs text-muted-foreground line-clamp-2">{step.description}</p>
        )}

        {step.status === 'current' && (
          <Badge variant="outline" className="text-[10px] bg-status-warning/20 border-status-warning text-status-warning animate-pulse">
            YOU ARE HERE
          </Badge>
        )}

        {step.status === 'skipped' && step.conditionLabel && (
          <p className="text-[10px] text-muted-foreground italic mt-1 line-clamp-2">
            {step.conditionLabel}
          </p>
        )}

        {step.isConditional && step.status !== 'skipped' && step.conditionLabel && (
          <p className="text-[10px] text-muted-foreground opacity-70 mt-1">
            {step.conditionLabel}
          </p>
        )}

        {step.approver && step.status !== 'skipped' && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span className="truncate max-w-[100px]">{step.approver.name}</span>
          </div>
        )}

        {step.completedAt && step.status === 'completed' && (
          <p className="text-[10px] text-status-success mt-1">
            ✓ {step.completedAt}
          </p>
        )}
      </div>

      {/* Hover indicator for clickable items */}
      {isClickable && (
        <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </div>
  );

  // Wrap with tooltip for hover info
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {cardContent}
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-[250px]">
        <div className="space-y-2">
          <p className="font-semibold">{step.label}</p>
          {step.approver && (
            <p className="text-xs">
              <span className="text-muted-foreground">Assigned to:</span> {step.approver.name} ({step.approver.role})
            </p>
          )}
          <p className="text-xs">
            <span className="text-muted-foreground">Status:</span>{' '}
            <span className={styles.text}>
              {step.status === 'completed' ? 'Approved' :
               step.status === 'current' ? 'In Progress' :
               step.status === 'skipped' ? 'Skipped' : 'Waiting'}
            </span>
          </p>
          {step.slaHoursRemaining && step.status === 'current' && (
            <p className="text-xs text-status-warning">
              ⏱️ SLA: {step.slaHoursRemaining}h remaining
            </p>
          )}
          {step.whyRequired && (
            <p className="text-xs text-muted-foreground italic">
              {step.whyRequired}
            </p>
          )}
          {step.conditionLabel && step.status === 'skipped' && (
            <p className="text-xs text-muted-foreground">
              Reason: {step.conditionLabel}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

const VerticalConnector = ({ 
  status = 'pending',
  showArrow = true,
  className
}: { 
  status?: 'completed' | 'current' | 'pending';
  showArrow?: boolean;
  className?: string;
}) => {
  const lineColor = status === 'completed' ? 'bg-status-success' : status === 'current' ? 'bg-status-warning' : 'bg-muted';
  const arrowColor = status === 'completed' ? 'text-status-success' : status === 'current' ? 'text-status-warning' : 'text-muted-foreground';
  
  return (
    <div className={cn("flex flex-col items-center py-1", className)}>
      <div className={cn("w-0.5 h-4 md:h-6", lineColor)} />
      {showArrow && (
        <ArrowDown className={cn("w-4 h-4 -mt-1", arrowColor)} />
      )}
    </div>
  );
};

const ParallelContainer = ({ 
  parallelSteps, 
  onStepClick 
}: { 
  parallelSteps: ParallelSteps; 
  onStepClick: (step: WorkflowStep) => void;
}) => {
  const allCompleted = parallelSteps.steps.every(s => s.status === 'completed' || s.status === 'skipped');
  const anyCurrent = parallelSteps.steps.some(s => s.status === 'current');
  const connectorStatus = allCompleted ? 'completed' : anyCurrent ? 'current' : 'pending';
  
  // Filter out skipped steps for cleaner display, but keep at least one
  const activeSteps = parallelSteps.steps.filter(s => s.status !== 'skipped');
  const displaySteps = activeSteps.length > 0 ? parallelSteps.steps : parallelSteps.steps;
  
  return (
    <div className="relative">
      {/* Top connector */}
      <VerticalConnector status={connectorStatus} showArrow={false} />
      
      {/* Parallel label */}
      {parallelSteps.label && (
        <div className="flex justify-center mb-2">
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 shadow-sm">
            {parallelSteps.label}
          </Badge>
        </div>
      )}
      
      {/* Horizontal branches */}
      <div className="relative">
        {/* Horizontal line connecting branches */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center">
          <div className={cn(
            "h-0.5",
            displaySteps.length > 1 ? "w-[calc(100%-60px)] md:w-[calc(100%-80px)]" : "w-0",
            allCompleted ? "bg-status-success" : anyCurrent ? "bg-status-warning" : "bg-muted"
          )} />
        </div>
        
        {/* Branch cards - stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-3 md:gap-6 pt-2">
          {displaySteps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center">
              {/* Vertical drop line for desktop */}
              <div className={cn(
                "hidden md:block w-0.5 h-3",
                step.status === 'completed' ? "bg-status-success" : 
                step.status === 'current' ? "bg-status-warning" : "bg-muted"
              )} />
              <StepCard step={step} onClick={() => onStepClick(step)} compact />
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom connector */}
      <VerticalConnector status={allCompleted ? 'completed' : 'pending'} />
    </div>
  );
};

const StepDetailModal = ({ 
  step, 
  open, 
  onClose 
}: { 
  step: WorkflowStep | null; 
  open: boolean; 
  onClose: () => void;
}) => {
  if (!step) return null;
  const styles = getStatusStyles(step.status);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              styles.bg,
              styles.textWhite
            )}>
              <StatusIcon status={step.status} />
            </div>
            <div>
              <span className="block">{step.label}</span>
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs mt-1",
                  step.status === 'completed' && "bg-status-success-bg text-status-success border-status-success/30",
                  step.status === 'current' && "bg-status-warning-bg text-status-warning border-status-warning/30",
                  step.status === 'skipped' && "bg-muted text-muted-foreground"
                )}
              >
                {step.status === 'completed' ? '✓ Approved' : 
                 step.status === 'current' ? '⏳ In Progress' : 
                 step.status === 'skipped' ? '⏭️ Skipped' : '⌛ Pending'}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {step.description && (
            <p className="text-sm text-muted-foreground">{step.description}</p>
          )}

          {step.approver && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{step.approver.name}</p>
                <p className="text-xs text-muted-foreground">{step.approver.role}</p>
              </div>
            </div>
          )}

          {step.completedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-status-success" />
              <span className="text-muted-foreground">Approved:</span>
              <span className="font-medium text-status-success">{step.completedAt}</span>
            </div>
          )}

          {step.slaHoursRemaining && step.status === 'current' && (
            <div className="flex items-center gap-2 text-sm text-status-warning">
              <Timer className="w-4 h-4" />
              <span>SLA: {step.slaHoursRemaining} hours remaining</span>
            </div>
          )}

          {step.comments && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="w-4 h-4" />
                  Approval Comments
                </div>
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-2 border-primary">
                  "{step.comments}"
                </div>
              </div>
            </>
          )}

          {step.documents && step.documents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Attached Documents
                </div>
                <div className="space-y-1">
                  {step.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer p-2 rounded hover:bg-muted/50">
                      <FileText className="w-4 h-4" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step.status === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              This step is waiting for previous approvals to complete
            </div>
          )}

          {step.status === 'skipped' && step.conditionLabel && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Step Skipped</p>
                <p className="text-xs mt-1">{step.conditionLabel}</p>
              </div>
            </div>
          )}

          {step.whyRequired && step.status !== 'skipped' && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Why this step?</p>
                <p className="text-xs mt-1">{step.whyRequired}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export function ApprovalWorkflowDiagram({
  nodes,
  requestType = 'new_purchase',
  budgetedAmount = 0,
  priceNegotiated = false,
  className
}: ApprovalWorkflowDiagramProps) {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleStepClick = (step: WorkflowStep) => {
    setSelectedStep(step);
    setModalOpen(true);
  };

  // Calculate summary stats
  const allSteps = nodes.flatMap(node => 
    isParallelSteps(node) ? node.steps : [node]
  );
  const completedCount = allSteps.filter(s => s.status === 'completed').length;
  const skippedCount = allSteps.filter(s => s.status === 'skipped').length;
  const currentStep = allSteps.find(s => s.status === 'current');
  const totalSteps = allSteps.filter(s => s.status !== 'skipped').length;
  const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status Summary Box */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Status</span>
            <p className="font-semibold text-primary">
              {completedCount === totalSteps ? '✓ Complete' : 'In Progress'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Current Step</span>
            <p className="font-semibold truncate">{currentStep?.label || 'Completed'}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Progress</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-status-success rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-semibold text-xs">{progress}%</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Type</span>
            <p className="font-semibold capitalize">{requestType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="rounded-xl border bg-card p-4 md:p-6 overflow-x-auto shadow-sm">
        <div className="flex flex-col items-center min-w-[280px]">
          {/* Start node */}
          <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-semibold shadow-lg">
            Request Submitted
          </div>
          
          <VerticalConnector status="completed" />

          {nodes.map((node, index) => {
            const isLast = index === nodes.length - 1;
            
            return (
              <div key={index} className="flex flex-col items-center w-full">
                {isParallelSteps(node) ? (
                  <ParallelContainer 
                    parallelSteps={node} 
                    onStepClick={handleStepClick}
                  />
                ) : (
                  <>
                    <StepCard 
                      step={node} 
                      onClick={() => handleStepClick(node)}
                    />
                    {!isLast && (
                      <VerticalConnector 
                        status={
                          node.status === 'completed' || node.status === 'skipped' 
                            ? 'completed' 
                            : 'pending'
                        }
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}

          <VerticalConnector status={completedCount === totalSteps ? 'completed' : 'pending'} showArrow={false} />
          
          {/* End node */}
          <div className={cn(
            "px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all duration-500",
            completedCount === totalSteps
              ? "bg-gradient-to-r from-status-success to-status-success/80 text-white"
              : "bg-muted text-muted-foreground"
          )}>
            {completedCount === totalSteps ? "✓ Request Complete" : "Complete"}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-status-success" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-status-warning animate-pulse" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary/30" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted border border-dashed border-muted-foreground" />
          <span>Skipped</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary">
          <Info className="w-3 h-3" />
          <span>Click completed steps for details</span>
        </div>
      </div>

      {/* Step Detail Modal */}
      <StepDetailModal 
        step={selectedStep}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
