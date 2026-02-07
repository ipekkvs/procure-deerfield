import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-status-success-bg flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-status-success" />
      </div>
      <h3 className="text-xl font-semibold mb-1">All caught up!</h3>
      <p className="text-muted-foreground mb-6">No pending approvals</p>
      <Button variant="outline" asChild>
        <Link to="/dashboard">View Approved Requests</Link>
      </Button>
    </div>
  );
}
