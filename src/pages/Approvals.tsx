import { getCurrentUser, requests } from "@/lib/mockData";
import { useViewMode } from "@/contexts/ViewModeContext";
import {
  RequesterApprovals,
  ManagerApprovals,
  FinanceApprovals,
  ComplianceApprovals,
  ITApprovals,
  CIOApprovals,
  DirectorOpsApprovals,
} from "@/components/approvals/role-views";
import { preApprovedVendors } from "@/lib/riskScoring";

const Approvals = () => {
  const currentUser = getCurrentUser();
  const { viewMode, canSwitchViews } = useViewMode();
  
  // If user can switch views and is in individual mode, show Requester view
  if (canSwitchViews && viewMode === 'individual') {
    return <RequesterApprovals user={currentUser} />;
  }
  
  // Route to appropriate approvals view based on user role
  switch (currentUser.role) {
    case 'cio':
      return <CIOApprovals />;
    
    case 'finance':
      return <FinanceApprovals />;
    
    case 'compliance':
      return <ComplianceApprovals />;
    
    case 'it':
      return <ITApprovals />;
    
    case 'director_operations':
      return <DirectorOpsApprovals />;
    
    case 'department_leader':
      return <ManagerApprovals user={currentUser} />;
    
    case 'requester':
    default:
      return <RequesterApprovals user={currentUser} />;
  }
};

export default Approvals;
