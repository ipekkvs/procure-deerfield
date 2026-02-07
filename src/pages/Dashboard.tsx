import { getCurrentUser } from "@/lib/mockData";
import { useViewMode } from "@/contexts/ViewModeContext";
import {
  RequesterSummary,
  ManagerSummary,
  FinanceSummary,
  ComplianceSummary,
  ITSummary,
  CIOSummary,
  DirectorOpsSummary,
} from "@/components/dashboards/summary";

const Dashboard = () => {
  const currentUser = getCurrentUser();
  const { viewMode, canSwitchViews } = useViewMode();
  
  // If user can switch views and is in individual mode, show Requester view
  if (canSwitchViews && viewMode === 'individual') {
    return <RequesterSummary userName={currentUser.name} user={currentUser} />;
  }
  
  // Route to appropriate summary dashboard based on user role
  switch (currentUser.role) {
    case 'cio':
      return <CIOSummary userName={currentUser.name} />;
    
    case 'finance':
      return <FinanceSummary userName={currentUser.name} />;
    
    case 'compliance':
      return <ComplianceSummary userName={currentUser.name} />;
    
    case 'it':
      return <ITSummary userName={currentUser.name} />;
    
    case 'director_operations':
      return <DirectorOpsSummary userName={currentUser.name} />;
    
    case 'department_leader':
      return <ManagerSummary userName={currentUser.name} user={currentUser} />;
    
    case 'requester':
    default:
      return <RequesterSummary userName={currentUser.name} user={currentUser} />;
  }
};

export default Dashboard;
