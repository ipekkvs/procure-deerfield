import { useState, useEffect } from "react";
import { UserRole, users, setCurrentUserByRole, getCurrentUser } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

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

interface RoleSwitcherProps {
  onRoleChange: () => void;
}

export function RoleSwitcher({ onRoleChange }: RoleSwitcherProps) {
  const [currentRole, setCurrentRole] = useState<UserRole>(getCurrentUser().role);
  
  const availableRoles = users.map(u => u.role).filter((role, index, self) => 
    self.indexOf(role) === index
  );
  
  const handleRoleChange = (role: UserRole) => {
    setCurrentUserByRole(role);
    setCurrentRole(role);
    onRoleChange();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
      <Badge variant="outline" className="gap-1 text-xs">
        <Sparkles className="w-3 h-3" />
        Demo Mode
      </Badge>
      <Select value={currentRole} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map(role => (
            <SelectItem key={role} value={role} className="text-xs">
              {roleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
