// Budget Alert System for Deerfield Procurement

import { departmentBudgets, DepartmentBudget, Department, departments } from './mockData';

export type BudgetAlertLevel = 'warning' | 'caution' | 'critical' | 'blocked';

export interface BudgetAlert {
  department: Department;
  departmentLabel: string;
  level: BudgetAlertLevel;
  percentUsed: number;
  remaining: number;
  message: string;
  notifyRoles: string[];
}

export interface BudgetCheckResult {
  canProceed: boolean;
  alerts: BudgetAlert[];
  warningMessage: string | null;
  blockMessage: string | null;
}

const BUDGET_THRESHOLDS = {
  warning: 75,    // Alert Department Heads
  caution: 85,    // Alert Finance
  critical: 90,   // Alert Department Heads again
  blocked: 100,   // Block submissions
};

export function getDepartmentLabel(dept: Department): string {
  return departments.find(d => d.value === dept)?.label || dept;
}

export function checkBudgetStatus(department: Department): BudgetAlert | null {
  const budget = departmentBudgets.find(b => b.department === department);
  if (!budget) return null;
  
  const percentUsed = (budget.spentToDate / budget.totalBudget) * 100;
  const departmentLabel = getDepartmentLabel(department);
  
  if (percentUsed >= BUDGET_THRESHOLDS.blocked) {
    return {
      department,
      departmentLabel,
      level: 'blocked',
      percentUsed,
      remaining: budget.remaining,
      message: `${departmentLabel} has exceeded 100% of its budget. New submissions require Finance exception approval.`,
      notifyRoles: ['department_leader', 'finance', 'director_operations'],
    };
  }
  
  if (percentUsed >= BUDGET_THRESHOLDS.critical) {
    return {
      department,
      departmentLabel,
      level: 'critical',
      percentUsed,
      remaining: budget.remaining,
      message: `${departmentLabel} has used ${Math.round(percentUsed)}% of its budget. Only $${budget.remaining.toLocaleString()} remaining.`,
      notifyRoles: ['department_leader', 'finance'],
    };
  }
  
  if (percentUsed >= BUDGET_THRESHOLDS.caution) {
    return {
      department,
      departmentLabel,
      level: 'caution',
      percentUsed,
      remaining: budget.remaining,
      message: `${departmentLabel} has used ${Math.round(percentUsed)}% of its budget. Finance has been notified.`,
      notifyRoles: ['finance'],
    };
  }
  
  if (percentUsed >= BUDGET_THRESHOLDS.warning) {
    return {
      department,
      departmentLabel,
      level: 'warning',
      percentUsed,
      remaining: budget.remaining,
      message: `${departmentLabel} has used ${Math.round(percentUsed)}% of its budget.`,
      notifyRoles: ['department_leader'],
    };
  }
  
  return null;
}

export function checkBudgetForRequest(
  department: Department, 
  requestAmount: number
): BudgetCheckResult {
  const budget = departmentBudgets.find(b => b.department === department);
  const alerts: BudgetAlert[] = [];
  
  if (!budget) {
    return {
      canProceed: true,
      alerts: [],
      warningMessage: null,
      blockMessage: null,
    };
  }
  
  const currentAlert = checkBudgetStatus(department);
  if (currentAlert) {
    alerts.push(currentAlert);
  }
  
  const percentUsed = (budget.spentToDate / budget.totalBudget) * 100;
  const afterRequestPercent = ((budget.spentToDate + requestAmount) / budget.totalBudget) * 100;
  const wouldExceed = requestAmount > budget.remaining;
  const departmentLabel = getDepartmentLabel(department);
  
  // Check if this request would push budget over thresholds
  if (wouldExceed) {
    return {
      canProceed: false,
      alerts,
      warningMessage: null,
      blockMessage: `This request for $${requestAmount.toLocaleString()} exceeds ${departmentLabel}'s remaining budget of $${budget.remaining.toLocaleString()}. Finance exception approval will be required.`,
    };
  }
  
  // Warning if request would push past 85%
  if (afterRequestPercent >= 85 && percentUsed < 85) {
    return {
      canProceed: true,
      alerts,
      warningMessage: `This request will bring ${departmentLabel}'s budget usage to ${Math.round(afterRequestPercent)}%. Finance will be notified.`,
      blockMessage: null,
    };
  }
  
  // Warning if request would push past 75%
  if (afterRequestPercent >= 75 && percentUsed < 75) {
    return {
      canProceed: true,
      alerts,
      warningMessage: `This request will bring ${departmentLabel}'s budget usage to ${Math.round(afterRequestPercent)}%.`,
      blockMessage: null,
    };
  }
  
  return {
    canProceed: true,
    alerts,
    warningMessage: null,
    blockMessage: null,
  };
}

// Get all departments with budget alerts
export function getAllBudgetAlerts(): BudgetAlert[] {
  return departmentBudgets
    .map(b => checkBudgetStatus(b.department))
    .filter((alert): alert is BudgetAlert => alert !== null)
    .sort((a, b) => b.percentUsed - a.percentUsed);
}

// Get budget summary for a department
export function getBudgetSummary(department: Department) {
  const budget = departmentBudgets.find(b => b.department === department);
  if (!budget) return null;
  
  const percentUsed = (budget.spentToDate / budget.totalBudget) * 100;
  const alert = checkBudgetStatus(department);
  
  return {
    ...budget,
    departmentLabel: getDepartmentLabel(department),
    percentUsed,
    alert,
    isHealthy: percentUsed < 75,
    isWarning: percentUsed >= 75 && percentUsed < 85,
    isCaution: percentUsed >= 85 && percentUsed < 90,
    isCritical: percentUsed >= 90 && percentUsed < 100,
    isBlocked: percentUsed >= 100,
  };
}
