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
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const StatusIcon = ({ status }: { status: WorkflowStep['status'] }) => {
  switch (status) {
    case 'completed':
      return <Check className="w-4 h-4" />;
    case 'current':
      return <Clock className="w-4 h-4 animate-pulse" />;
    case 'skipped':
      return <SkipForward className="w-4 h-4" />;
    default:
      return null;
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
  
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative rounded-lg border-2 p-3 transition-all duration-200",
        compact ? "min-w-[140px]" : "min-w-[180px]",
        step.status === 'completed' && "bg-status-success-bg border-status-success text-status-success cursor-pointer hover:shadow-md",
        step.status === 'current' && "bg-status-warning-bg border-status-warning cursor-pointer hover:shadow-md",
        step.status === 'pending' && "bg-muted/30 border-muted text-muted-foreground",
        step.status === 'skipped' && "bg-muted/20 border-dashed border-muted text-muted-foreground opacity-60",
        isClickable && "hover:scale-[1.02]"
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center",
        step.status === 'completed' && "bg-status-success text-white",
        step.status === 'current' && "bg-status-warning text-white",
        step.status === 'pending' && "bg-muted text-muted-foreground",
        step.status === 'skipped' && "bg-muted text-muted-foreground"
      )}>
        <StatusIcon status={step.status} />
      </div>

      <div className="space-y-1">
        <p className={cn(
          "font-semibold text-sm",
          step.status === 'skipped' && "line-through"
        )}>
          {step.label}
        </p>
        
        {step.description && !compact && (
          <p className="text-xs opacity-80">{step.description}</p>
        )}

        {step.status === 'current' && (
          <Badge variant="outline" className="text-[10px] bg-status-warning/20 border-status-warning text-status-warning">
            YOU ARE HERE
          </Badge>
        )}

        {step.status === 'skipped' && step.conditionLabel && (
          <p className="text-[10px] italic">{step.conditionLabel}</p>
        )}

        {step.isConditional && step.status !== 'skipped' && step.conditionLabel && (
          <p className="text-[10px] opacity-70">{step.conditionLabel}</p>
        )}
      </div>
    </div>
  );
};

const ConnectorLine = ({ 
  direction = 'down',
  status = 'pending'
}: { 
  direction?: 'down' | 'right' | 'converge-left' | 'converge-right';
  status?: 'completed' | 'current' | 'pending';
}) => {
  const lineColor = status === 'completed' ? 'bg-status-success' : status === 'current' ? 'bg-status-warning' : 'bg-muted';
  
  if (direction === 'down') {
    return (
      <div className="flex justify-center py-2">
        <div className={cn("w-0.5 h-6", lineColor)} />
      </div>
    );
  }
  
  return null;
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
  
  return (
    <div className="relative">
      {/* Parallel indicator label */}
      {parallelSteps.label && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
            {parallelSteps.label}
          </Badge>
        </div>
      )}
      
      {/* Branching lines */}
      <div className="flex justify-center mb-2">
        <div className={cn(
          "w-0.5 h-4",
          allCompleted ? "bg-status-success" : anyCurrent ? "bg-status-warning" : "bg-muted"
        )} />
      </div>
      
      {/* Horizontal connector with branches */}
      <div className="relative flex justify-center items-start gap-4 md:gap-8">
        {/* Left branch line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center">
          <div className={cn(
            "h-0.5 w-[calc(50%-70px)] md:w-[calc(50%-90px)]",
            allCompleted ? "bg-status-success" : anyCurrent ? "bg-status-warning" : "bg-muted"
          )} style={{ transform: 'translateX(-50%)' }} />
          <div className={cn(
            "h-0.5 w-[calc(50%-70px)] md:w-[calc(50%-90px)]",
            allCompleted ? "bg-status-success" : anyCurrent ? "bg-status-warning" : "bg-muted"
          )} style={{ transform: 'translateX(50%)' }} />
        </div>
        
        {/* Vertical drops to cards */}
        {parallelSteps.steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center">
            <div className={cn(
              "w-0.5 h-4",
              step.status === 'completed' ? "bg-status-success" : 
              step.status === 'current' ? "bg-status-warning" : "bg-muted"
            )} />
            <StepCard step={step} onClick={() => onStepClick(step)} compact />
          </div>
        ))}
      </div>
      
      {/* Converging lines */}
      <div className="flex justify-center mt-2">
        <div className={cn(
          "w-0.5 h-4",
          allCompleted ? "bg-status-success" : "bg-muted"
        )} />
      </div>
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{step.label}</span>
            <Badge 
              variant={step.status === 'completed' ? 'default' : 'secondary'}
              className={cn(
                step.status === 'completed' && "bg-status-success",
                step.status === 'current' && "bg-status-warning",
                step.status === 'skipped' && "bg-muted"
              )}
            >
              {step.status === 'completed' ? 'Approved' : 
               step.status === 'current' ? 'In Progress' : 
               step.status === 'skipped' ? 'Skipped' : 'Pending'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Approved:</span>
              <span className="font-medium">{step.completedAt}</span>
            </div>
          )}

          {step.comments && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="w-4 h-4" />
                  Comments
                </div>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  "{step.comments}"
                </p>
              </div>
            </>
          )}

          {step.documents && step.documents.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  Documents
                </div>
                <div className="space-y-1">
                  {step.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
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
              This step is pending previous approvals
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
  const currentStep = allSteps.find(s => s.status === 'current');
  const totalSteps = allSteps.filter(s => s.status !== 'skipped').length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Status Summary Box */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Status</span>
            <p className="font-semibold text-primary">In Progress</p>
          </div>
          <div>
            <span className="text-muted-foreground">Current Step</span>
            <p className="font-semibold">{currentStep?.label || 'Completed'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Progress</span>
            <p className="font-semibold">{completedCount} of {totalSteps} steps</p>
          </div>
          <div>
            <span className="text-muted-foreground">Type</span>
            <p className="font-semibold capitalize">{requestType.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="rounded-xl border bg-card p-6 overflow-x-auto">
        <div className="flex flex-col items-center min-w-[300px]">
          {/* Start node */}
          <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium">
            Request Submitted
          </div>
          
          <ConnectorLine status="completed" />

          {nodes.map((node, index) => (
            <div key={index} className="flex flex-col items-center w-full">
              {isParallelSteps(node) ? (
                <ParallelContainer 
                  parallelSteps={node} 
                  onStepClick={handleStepClick}
                />
              ) : (
                <StepCard 
                  step={node} 
                  onClick={() => handleStepClick(node)}
                />
              )}
              
              {index < nodes.length - 1 && (
                <ConnectorLine 
                  status={
                    (isParallelSteps(node) 
                      ? node.steps.every(s => s.status === 'completed' || s.status === 'skipped')
                      : node.status === 'completed' || node.status === 'skipped'
                    ) ? 'completed' : 'pending'
                  }
                />
              )}
            </div>
          ))}

          <ConnectorLine />
          
          {/* End node */}
          <div className={cn(
            "px-4 py-2 rounded-full text-sm font-medium",
            allSteps.every(s => s.status === 'completed' || s.status === 'skipped')
              ? "bg-status-success text-white"
              : "bg-muted text-muted-foreground"
          )}>
            {allSteps.every(s => s.status === 'completed' || s.status === 'skipped') 
              ? "✓ Complete" 
              : "Complete"}
          </div>
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
