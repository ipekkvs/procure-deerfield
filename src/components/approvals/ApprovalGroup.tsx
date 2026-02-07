import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApprovalCard, type ApprovalRequest } from "./ApprovalCard";

interface ApprovalGroupProps {
  title: string;
  icon: "urgent" | "standard";
  requests: ApprovalRequest[];
  defaultOpen?: boolean;
  onQuickApprove: (id: string) => void;
  onViewDetails: (request: ApprovalRequest) => void;
  approvingId?: string | null;
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
  showCheckbox?: boolean;
}

export function ApprovalGroup({
  title,
  icon,
  requests,
  defaultOpen = false,
  onQuickApprove,
  onViewDetails,
  approvingId,
  selectedIds = new Set(),
  onSelect,
  showCheckbox = false,
}: ApprovalGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full text-left group"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={cn(
          "inline-block w-2.5 h-2.5 rounded-full",
          icon === "urgent" ? "bg-status-error" : "bg-status-warning"
        )} />
        <span className="font-semibold text-sm uppercase tracking-wide">
          {title}
        </span>
        <span className="text-sm text-muted-foreground">({requests.length})</span>
      </button>

      {isOpen && (
        <div className="space-y-3 pl-6">
          {requests.map((request) => (
            <ApprovalCard
              key={request.id}
              request={request}
              onQuickApprove={onQuickApprove}
              onViewDetails={onViewDetails}
              isApproving={approvingId === request.id}
              isSelected={selectedIds.has(request.id)}
              onSelect={onSelect}
              showCheckbox={showCheckbox}
            />
          ))}
        </div>
      )}
    </div>
  );
}
