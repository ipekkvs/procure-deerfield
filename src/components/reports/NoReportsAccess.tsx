import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NoReportsAccess() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Reports Access Restricted</h2>
          <p className="text-muted-foreground mb-6">
            Reports are available to managers and leadership. 
            View your requests in "My Requests" to track your procurement activity.
          </p>
          <Button onClick={() => navigate('/approvals')} className="gap-2">
            Go to My Requests
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
