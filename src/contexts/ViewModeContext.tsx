import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole, getCurrentUser } from '@/lib/mockData';

export type ViewMode = 'individual' | 'role';

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  // Whether the current user can switch between views
  canSwitchViews: boolean;
  // Labels for the current user's views
  individualLabel: string;
  roleLabel: string;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

// Roles that can act as both a requester AND their leadership role
const dualRoles: UserRole[] = [
  'department_leader',
  'cio',
  'finance',
  'compliance',
  'it',
  'director_operations',
  'admin',
];

const roleLabels: Record<UserRole, string> = {
  requester: 'Requester',
  department_leader: 'Dept. Head',
  compliance: 'Compliance',
  it: 'IT Security',
  director_operations: 'Dir. Operations',
  finance: 'Finance',
  legal: 'Legal',
  cio: 'CIO',
  admin: 'Admin',
};

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('role');
  
  const currentUser = getCurrentUser();
  const canSwitchViews = dualRoles.includes(currentUser.role);
  
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'individual' ? 'role' : 'individual');
  }, []);

  const individualLabel = 'My Requests';
  const roleLabel = roleLabels[currentUser.role] || 'Role View';

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        canSwitchViews,
        individualLabel,
        roleLabel,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
