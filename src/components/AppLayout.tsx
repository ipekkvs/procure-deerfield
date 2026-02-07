import { useState, useCallback, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  ClipboardCheck,
  RefreshCw,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requests, renewals, getCurrentUser } from "@/lib/mockData";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { preApprovedVendors } from "@/lib/riskScoring";
import { NotificationsPopover } from "@/components/NotificationsPopover";
import { HeaderSearchPopover } from "@/components/HeaderSearchPopover";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Helper to calculate role-specific approval counts
function getApprovalCount(role: string, department?: string): number {
  switch (role) {
    case 'cio':
      return requests.filter(r => 
        r.status === 'pending' && (
          r.budgetedAmount > 50000 ||
          r.title.toLowerCase().includes('ai') ||
          r.department === 'investment'
        )
      ).length;
    case 'finance':
      return requests.filter(r => 
        r.status === 'pending' && (
          r.budgetedAmount >= 10000 || 
          r.budgetedAmount > 25000
        )
      ).length;
    case 'compliance':
      return requests.filter(r => 
        r.status === 'pending' && !r.complianceApproved && (
          r.description.toLowerCase().includes('patient') ||
          r.category === 'saas'
        )
      ).length;
    case 'it':
      return requests.filter(r => 
        r.status === 'pending' && !r.itApproved && (
          !r.vendorId ||
          !preApprovedVendors.some(v => r.title.toLowerCase().includes(v.toLowerCase()))
        )
      ).length;
    case 'director_operations':
      return requests.filter(r => 
        r.status === 'pending' && (
          (r.budgetedAmount > 50000 && r.currentStep === 'negotiation') ||
          r.daysInCurrentStage > 5
        )
      ).length;
    case 'department_leader':
      return requests.filter(r => 
        r.status === 'pending' && 
        r.department === department &&
        (r.currentStep === 'department_pre_approval' || r.currentStep === 'department_final_approval')
      ).length;
    case 'requester':
    default:
      return requests.filter(r => r.status === 'needs_info').length;
  }
}

// Helper to calculate dashboard alert count (urgent items)
function getDashboardAlertCount(role: string): number {
  switch (role) {
    case 'cio':
    case 'finance':
    case 'compliance':
    case 'it':
    case 'director_operations':
    case 'department_leader':
      // Show urgent alerts count (over-budget or stuck > 3 days)
      return requests.filter(r => 
        r.status === 'pending' && (r.daysInCurrentStage > 3 || r.budgetedAmount > 25000)
      ).length > 0 ? 1 : 0; // Show indicator if any urgent
    default:
      return requests.filter(r => r.status === 'needs_info').length;
  }
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [, forceUpdate] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  // Force re-render when role changes
  const handleRoleChange = useCallback(() => {
    forceUpdate({});
    if (location.pathname !== '/') {
      navigate('/');
    }
  }, [navigate, location.pathname]);
  
  // Role-specific counts
  const approvalCount = useMemo(() => 
    getApprovalCount(currentUser.role, currentUser.department),
    [currentUser.role, currentUser.department]
  );
  
  const dashboardAlertCount = useMemo(() => 
    getDashboardAlertCount(currentUser.role),
    [currentUser.role]
  );
  
  // Count pending notifications
  const notifications = renewals.filter(r => r.reviewStatus !== 'completed').length + 
    requests.filter(r => r.status === 'needs_info').length;

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, badge: dashboardAlertCount > 0 },
    { name: "New Request", href: "/new-request", icon: Plus },
    { name: "Approvals", href: "/approvals", icon: ClipboardCheck, badgeCount: approvalCount },
    { name: "Renewals", href: "/renewals", icon: RefreshCw },
    { name: "Vendors", href: "/vendors", icon: Building2 },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Procure</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badgeCount && item.badgeCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                        {item.badgeCount}
                      </span>
                    )}
                    {item.badge && !item.badgeCount && (
                      <span className="w-2 h-2 rounded-full bg-destructive" />
                    )}
                  </>
                )}
                {collapsed && item.badgeCount && item.badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                    {item.badgeCount}
                  </span>
                )}
                {collapsed && item.badge && !item.badgeCount && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "flex items-center gap-3 w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
                    <p className="text-xs text-sidebar-foreground capitalize">{currentUser.role.replace('_', ' ')}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        collapsed ? "ml-16" : "ml-64"
      )}>
        {/* Top bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <HeaderSearchPopover />
          </div>
          
          <div className="flex items-center gap-3">
            <RoleSwitcher onRoleChange={handleRoleChange} />
            <NotificationsPopover />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
