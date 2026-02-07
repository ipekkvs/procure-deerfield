import { getCurrentUser } from "@/lib/mockData";
import {
  CIODashboard,
  FinanceDashboard,
  ComplianceDashboard,
  ITDashboard,
  DirectorOpsDashboard,
  DepartmentHeadDashboard,
  RequesterDashboard,
} from "@/components/dashboards";

const Dashboard = () => {
  const currentUser = getCurrentUser();
  
  // Route to appropriate dashboard based on user role
  switch (currentUser.role) {
    case 'cio':
      return <CIODashboard userName={currentUser.name} />;
    
    case 'finance':
      return <FinanceDashboard userName={currentUser.name} />;
    
    case 'compliance':
      return <ComplianceDashboard userName={currentUser.name} />;
    
    case 'it':
      return <ITDashboard userName={currentUser.name} />;
    
    case 'director_operations':
      return <DirectorOpsDashboard userName={currentUser.name} />;
    
    case 'department_leader':
      return <DepartmentHeadDashboard userName={currentUser.name} user={currentUser} />;
    
    case 'requester':
    default:
      return <RequesterDashboard userName={currentUser.name} user={currentUser} />;
  }
};

export default Dashboard;
