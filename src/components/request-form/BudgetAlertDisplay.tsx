import { AlertTriangle, DollarSign, AlertCircle, Ban } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BudgetCheckResult } from "@/lib/budgetAlerts";
import { formatCurrency } from "@/lib/mockData";

interface BudgetAlertDisplayProps {
  checkResult: BudgetCheckResult;
  departmentLabel: string;
  remaining: number;
  percentUsed: number;
}

export function BudgetAlertDisplay({ 
  checkResult, 
  departmentLabel, 
  remaining, 
  percentUsed 
}: BudgetAlertDisplayProps) {
  // Show block message (cannot proceed)
  if (checkResult.blockMessage) {
    return (
      <Alert variant="destructive" className="border-destructive">
        <Ban className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Budget Exceeded
          <Badge variant="destructive">Requires Exception</Badge>
        </AlertTitle>
        <AlertDescription className="mt-2">
          {checkResult.blockMessage}
          <p className="mt-2 text-sm">
            You can still submit this request, but it will require Finance exception approval 
            before proceeding.
          </p>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show warning message (can proceed with caution)
  if (checkResult.warningMessage) {
    return (
      <Alert className="border-amber-500 bg-amber-50 text-amber-900 [&>svg]:text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Budget Alert</AlertTitle>
        <AlertDescription>
          {checkResult.warningMessage}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Show existing department alerts if any
  if (checkResult.alerts.length > 0) {
    const alert = checkResult.alerts[0];
    
    if (alert.level === 'critical') {
      return (
        <Alert className="border-orange-500 bg-orange-50 text-orange-900 [&>svg]:text-orange-600">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Department Budget Critical
            <Badge variant="outline" className="border-orange-500 text-orange-700">
              {Math.round(alert.percentUsed)}% used
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {alert.message}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (alert.level === 'caution') {
      return (
        <Alert className="border-amber-400 bg-amber-50/50 text-amber-800 [&>svg]:text-amber-500">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Budget Caution
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              {Math.round(alert.percentUsed)}% used
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {alert.message}
          </AlertDescription>
        </Alert>
      );
    }
    
    if (alert.level === 'warning') {
      return (
        <Alert className="border-yellow-400 bg-yellow-50/50 text-yellow-800 [&>svg]:text-yellow-500">
          <DollarSign className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            Budget Status
            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
              {Math.round(alert.percentUsed)}% used
            </Badge>
          </AlertTitle>
          <AlertDescription>
            {formatCurrency(remaining)} remaining in {departmentLabel} budget.
          </AlertDescription>
        </Alert>
      );
    }
  }
  
  // No alerts - show healthy status if budget info available
  if (percentUsed > 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <DollarSign className="h-4 w-4" />
        <span>
          {departmentLabel} budget: {formatCurrency(remaining)} remaining ({Math.round(percentUsed)}% used)
        </span>
      </div>
    );
  }
  
  return null;
}
