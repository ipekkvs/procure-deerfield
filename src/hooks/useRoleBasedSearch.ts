import { useMemo } from "react";
import { 
  requests, 
  renewals, 
  vendors, 
  getCurrentUser, 
  PurchaseRequest, 
  Renewal, 
  Vendor,
  UserRole 
} from "@/lib/mockData";

// Define search scopes for each role on different pages
export type SearchPage = 'approvals' | 'renewals' | 'vendors' | 'my-requests';

interface SearchScope {
  placeholder: string;
  searchFields: string[];
  filterFn: (items: any[], userId: string, department: string) => any[];
}

const getApprovalsSearchScope = (role: UserRole): SearchScope => {
  switch (role) {
    case 'requester':
      return {
        placeholder: "Search my requests...",
        searchFields: ['title', 'description'],
        filterFn: (items, userId) => items.filter(r => r.requesterId === userId),
      };
    
    case 'department_leader':
      return {
        placeholder: "Search department requests...",
        searchFields: ['title', 'requesterName'],
        filterFn: (items, _, dept) => items.filter(r => r.department === dept),
      };
    
    case 'finance':
      return {
        placeholder: "Search all procurement requests...",
        searchFields: ['title', 'department', 'requesterName'],
        filterFn: (items) => items, // All requests
      };
    
    case 'compliance':
      return {
        placeholder: "Search compliance reviews...",
        searchFields: ['title', 'category'],
        filterFn: (items) => items.filter(r => 
          r.currentStep === 'compliance_it_review' || 
          r.complianceApproved !== undefined
        ),
      };
    
    case 'it':
      return {
        placeholder: "Search IT reviews...",
        searchFields: ['title', 'category'],
        filterFn: (items) => items.filter(r => 
          r.currentStep === 'compliance_it_review' || 
          r.itApproved !== undefined
        ),
      };
    
    case 'cio':
      return {
        placeholder: "Search strategic approvals...",
        searchFields: ['title', 'department'],
        filterFn: (items) => items.filter(r => 
          r.budgetedAmount > 50000 || 
          r.currentStep === 'cio_approval'
        ),
      };
    
    case 'director_operations':
      return {
        placeholder: "Search all requests...",
        searchFields: ['title', 'department', 'requesterName', 'status'],
        filterFn: (items) => items, // Master access
      };
    
    default:
      return {
        placeholder: "Search requests...",
        searchFields: ['title'],
        filterFn: (items, userId) => items.filter(r => r.requesterId === userId),
      };
  }
};

const getRenewalsSearchScope = (role: UserRole): SearchScope => {
  const isEnterpriseRole = ['finance', 'compliance', 'it', 'cio', 'director_operations'].includes(role);
  
  return {
    placeholder: isEnterpriseRole ? "Search all renewals..." : "Search my renewals...",
    searchFields: ['vendorName'],
    filterFn: isEnterpriseRole 
      ? (items) => items 
      : (items, userId, dept) => items, // For demo, show all since we don't have owner data
  };
};

const getVendorsSearchScope = (): SearchScope => ({
  placeholder: "Search vendors...",
  searchFields: ['name', 'category', 'status'],
  filterFn: (items) => items, // Everyone has same vendor access
});

export function useRoleBasedSearch(page: SearchPage) {
  const user = getCurrentUser();
  
  return useMemo(() => {
    switch (page) {
      case 'approvals':
        return getApprovalsSearchScope(user.role);
      case 'renewals':
        return getRenewalsSearchScope(user.role);
      case 'vendors':
        return getVendorsSearchScope();
      case 'my-requests':
        return {
          placeholder: "Search my requests...",
          searchFields: ['title', 'description'],
          filterFn: (items: any[], userId: string) => 
            items.filter((r: PurchaseRequest) => r.requesterId === userId),
        };
      default:
        return getApprovalsSearchScope(user.role);
    }
  }, [page, user.role]);
}

// Helper to perform search
export function searchItems<T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: string[]
): T[] {
  if (!searchTerm || searchTerm.length < 2) return items;
  
  const lowerSearch = searchTerm.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerSearch);
      }
      if (typeof value === 'number') {
        return value.toString().includes(lowerSearch);
      }
      return false;
    })
  );
}
