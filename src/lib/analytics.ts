// Analytics and Reporting Data for Deerfield Procurement

import { 
  requests, 
  renewals, 
  departmentBudgets, 
  departments, 
  formatCurrency,
  PurchaseRequest,
  Department
} from './mockData';
import { preApprovedVendors, isPreApprovedVendor } from './riskScoring';

// ============= CYCLE TIME METRICS =============

export interface CycleTimeMetric {
  tier: number;
  tierLabel: string;
  avgDays: number;
  minDays: number;
  maxDays: number;
  requestCount: number;
}

export function getCycleTimeByTier(): CycleTimeMetric[] {
  // Mock data for cycle time analysis
  return [
    { tier: 0, tierLabel: 'Auto-Approved', avgDays: 0.5, minDays: 0, maxDays: 1, requestCount: 12 },
    { tier: 1, tierLabel: 'Low Risk', avgDays: 3.2, minDays: 1, maxDays: 5, requestCount: 28 },
    { tier: 2, tierLabel: 'Medium Risk', avgDays: 6.5, minDays: 3, maxDays: 10, requestCount: 15 },
    { tier: 3, tierLabel: 'High Risk', avgDays: 12.3, minDays: 7, maxDays: 18, requestCount: 8 },
    { tier: 4, tierLabel: 'Critical Risk', avgDays: 18.7, minDays: 12, maxDays: 28, requestCount: 4 },
  ];
}

// ============= BOTTLENECK ANALYSIS =============

export interface ApproverBottleneck {
  approverRole: string;
  approverName: string;
  avgDaysInQueue: number;
  requestsDelayed: number;
  longestWait: number;
}

export function getApprovalBottlenecks(): ApproverBottleneck[] {
  // Mock data for bottleneck analysis
  return [
    { approverRole: 'Compliance', approverName: 'David Lee', avgDaysInQueue: 5.2, requestsDelayed: 3, longestWait: 8 },
    { approverRole: 'IT', approverName: 'Emily Brown', avgDaysInQueue: 4.1, requestsDelayed: 2, longestWait: 6 },
    { approverRole: 'Finance', approverName: 'Sarah Chen', avgDaysInQueue: 2.3, requestsDelayed: 1, longestWait: 4 },
    { approverRole: 'CIO', approverName: 'Robert Martinez', avgDaysInQueue: 3.8, requestsDelayed: 1, longestWait: 5 },
    { approverRole: 'Legal', approverName: 'Legal Team', avgDaysInQueue: 6.7, requestsDelayed: 2, longestWait: 12 },
  ].sort((a, b) => b.avgDaysInQueue - a.avgDaysInQueue);
}

// ============= BUDGET TRACKING =============

export interface DepartmentBudgetStatus {
  department: Department;
  departmentLabel: string;
  totalBudget: number;
  spentToDate: number;
  remaining: number;
  percentUsed: number;
  pendingCommitments: number;
  projectedRemaining: number;
  status: 'healthy' | 'warning' | 'critical' | 'over';
}

export function getDepartmentBudgetStatuses(): DepartmentBudgetStatus[] {
  return departmentBudgets.map(budget => {
    const deptLabel = departments.find(d => d.value === budget.department)?.label || budget.department;
    const pendingCommitments = requests
      .filter(r => r.department === budget.department && r.status === 'pending')
      .reduce((sum, r) => sum + r.budgetedAmount, 0);
    
    const percentUsed = (budget.spentToDate / budget.totalBudget) * 100;
    const projectedRemaining = budget.remaining - pendingCommitments;
    
    let status: 'healthy' | 'warning' | 'critical' | 'over' = 'healthy';
    if (percentUsed >= 100) status = 'over';
    else if (percentUsed >= 90) status = 'critical';
    else if (percentUsed >= 75) status = 'warning';
    
    return {
      department: budget.department,
      departmentLabel: deptLabel,
      totalBudget: budget.totalBudget,
      spentToDate: budget.spentToDate,
      remaining: budget.remaining,
      percentUsed,
      pendingCommitments,
      projectedRemaining,
      status,
    };
  }).sort((a, b) => b.percentUsed - a.percentUsed);
}

// ============= SAVINGS METRICS =============

export interface SavingsMetrics {
  totalNegotiatedSavings: number;
  avgSavingsPercent: number;
  negotiationsCount: number;
  topSavingsRequest: {
    title: string;
    originalAmount: number;
    negotiatedAmount: number;
    savings: number;
    savingsPercent: number;
  } | null;
}

export function getSavingsMetrics(): SavingsMetrics {
  const negotiatedRequests = requests.filter(r => r.priceChanged && r.savingsAchieved);
  
  const totalSavings = negotiatedRequests.reduce((sum, r) => sum + (r.savingsAchieved || 0), 0);
  const avgSavingsPercent = negotiatedRequests.length > 0
    ? negotiatedRequests.reduce((sum, r) => {
        const savings = r.savingsAchieved || 0;
        const percent = (savings / r.originalAmount) * 100;
        return sum + percent;
      }, 0) / negotiatedRequests.length
    : 0;
  
  const topSavings = negotiatedRequests.reduce((best, r) => {
    if (!r.savingsAchieved) return best;
    if (!best || r.savingsAchieved > best.savingsAchieved!) return r;
    return best;
  }, null as PurchaseRequest | null);
  
  return {
    totalNegotiatedSavings: totalSavings,
    avgSavingsPercent,
    negotiationsCount: negotiatedRequests.length,
    topSavingsRequest: topSavings ? {
      title: topSavings.title,
      originalAmount: topSavings.originalAmount,
      negotiatedAmount: topSavings.negotiatedAmount || topSavings.originalAmount,
      savings: topSavings.savingsAchieved || 0,
      savingsPercent: ((topSavings.savingsAchieved || 0) / topSavings.originalAmount) * 100,
    } : null,
  };
}

// ============= REQUEST VOLUME =============

export interface RequestVolumeByDepartment {
  department: Department;
  departmentLabel: string;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  totalSpend: number;
}

export function getRequestVolumeByDepartment(): RequestVolumeByDepartment[] {
  const deptCounts: Record<string, RequestVolumeByDepartment> = {};
  
  departments.forEach(dept => {
    deptCounts[dept.value] = {
      department: dept.value as Department,
      departmentLabel: dept.label,
      totalRequests: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalSpend: 0,
    };
  });
  
  requests.forEach(r => {
    if (deptCounts[r.department]) {
      deptCounts[r.department].totalRequests++;
      if (r.status === 'pending') deptCounts[r.department].pending++;
      if (r.status === 'approved') {
        deptCounts[r.department].approved++;
        deptCounts[r.department].totalSpend += r.negotiatedAmount || r.budgetedAmount;
      }
      if (r.status === 'rejected') deptCounts[r.department].rejected++;
    }
  });
  
  return Object.values(deptCounts).sort((a, b) => b.totalRequests - a.totalRequests);
}

// ============= REQUEST TYPES =============

export interface RequestTypeBreakdown {
  category: string;
  count: number;
  percent: number;
  totalSpend: number;
}

export function getRequestTypeBreakdown(): RequestTypeBreakdown[] {
  const categoryMap: Record<string, { count: number; spend: number }> = {
    saas: { count: 0, spend: 0 },
    hardware: { count: 0, spend: 0 },
    services: { count: 0, spend: 0 },
    other: { count: 0, spend: 0 },
  };
  
  const categoryLabels: Record<string, string> = {
    saas: 'SaaS / Software',
    hardware: 'Hardware',
    services: 'Professional Services',
    other: 'Other',
  };
  
  requests.forEach(r => {
    if (categoryMap[r.category]) {
      categoryMap[r.category].count++;
      categoryMap[r.category].spend += r.budgetedAmount;
    }
  });
  
  const total = requests.length;
  
  return Object.entries(categoryMap)
    .map(([key, value]) => ({
      category: categoryLabels[key] || key,
      count: value.count,
      percent: total > 0 ? (value.count / total) * 100 : 0,
      totalSpend: value.spend,
    }))
    .sort((a, b) => b.count - a.count);
}

// ============= PRE-APPROVED VENDOR USAGE =============

export interface PreApprovedVendorUsage {
  vendorName: string;
  requestCount: number;
  totalSpend: number;
  avgProcessingTime: number;
}

export function getPreApprovedVendorUsage(): PreApprovedVendorUsage[] {
  const vendorMap: Record<string, { count: number; spend: number }> = {};
  
  // Initialize with known pre-approved vendors
  preApprovedVendors.forEach(v => {
    vendorMap[v] = { count: 0, spend: 0 };
  });
  
  // Count usage
  requests.forEach(r => {
    const matchedVendor = preApprovedVendors.find(v => 
      r.title.toLowerCase().includes(v) || 
      (r.vendorId && r.vendorId.toLowerCase().includes(v))
    );
    
    if (matchedVendor) {
      vendorMap[matchedVendor].count++;
      vendorMap[matchedVendor].spend += r.budgetedAmount;
    }
  });
  
  return Object.entries(vendorMap)
    .filter(([_, value]) => value.count > 0)
    .map(([vendor, value]) => ({
      vendorName: vendor.charAt(0).toUpperCase() + vendor.slice(1),
      requestCount: value.count,
      totalSpend: value.spend,
      avgProcessingTime: 1.5, // Mock - pre-approved vendors are fast
    }))
    .sort((a, b) => b.requestCount - a.requestCount);
}

// ============= RENEWAL COMPLIANCE =============

export interface RenewalCompliance {
  totalRenewals: number;
  onTimeRenewals: number;
  lateRenewals: number;
  complianceRate: number;
  avgLeadTimeDays: number;
}

export function getRenewalCompliance(): RenewalCompliance {
  const total = renewals.length;
  const onTime = renewals.filter(r => r.daysUntilExpiration >= 0).length;
  const late = total - onTime;
  
  return {
    totalRenewals: total,
    onTimeRenewals: onTime,
    lateRenewals: late,
    complianceRate: total > 0 ? (onTime / total) * 100 : 100,
    avgLeadTimeDays: renewals.reduce((sum, r) => sum + Math.max(0, r.daysUntilExpiration), 0) / total || 0,
  };
}

// ============= SUMMARY STATS =============

export interface ProcurementSummary {
  totalRequestsThisMonth: number;
  totalApprovedSpend: number;
  totalPendingSpend: number;
  avgApprovalTime: number;
  renewalsComingUp: number;
  budgetAlertsCount: number;
}

export function getProcurementSummary(): ProcurementSummary {
  const approved = requests.filter(r => r.status === 'approved');
  const pending = requests.filter(r => r.status === 'pending');
  const upcomingRenewals = renewals.filter(r => r.daysUntilExpiration <= 90);
  const budgetAlerts = departmentBudgets.filter(b => (b.spentToDate / b.totalBudget) >= 0.75);
  
  return {
    totalRequestsThisMonth: requests.length,
    totalApprovedSpend: approved.reduce((sum, r) => sum + (r.negotiatedAmount || r.budgetedAmount), 0),
    totalPendingSpend: pending.reduce((sum, r) => sum + r.budgetedAmount, 0),
    avgApprovalTime: 5.3, // Mock average
    renewalsComingUp: upcomingRenewals.length,
    budgetAlertsCount: budgetAlerts.length,
  };
}
