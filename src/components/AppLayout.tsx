import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plus,
  ClipboardCheck,
  RefreshCw,
  Building2,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requests, renewals, getCurrentUser } from "@/lib/mockData";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "New Request", href: "/new-request", icon: Plus },
  { name: "Approvals", href: "/approvals", icon: ClipboardCheck, badge: true },
  { name: "Renewals", href: "/renewals", icon: RefreshCw },
  { name: "Vendors", href: "/vendors", icon: Building2 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentUser = getCurrentUser();
  
  // Count pending approvals
  const pendingApprovals = requests.filter(r => r.status === 'pending').length;
  
  // Count pending notifications (renewals needing attention + requests needing info)
  const notifications = renewals.filter(r => r.reviewStatus !== 'completed').length + 
    requests.filter(r => r.status === 'needs_info').length;

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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && pendingApprovals > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                        {pendingApprovals}
                      </span>
                    )}
                  </>
                )}
                {collapsed && item.badge && pendingApprovals > 0 && (
                  <span className="absolute left-10 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                    {pendingApprovals}
                  </span>
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
                    <p className="text-xs text-sidebar-foreground capitalize">{currentUser.role}</p>
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search requests, vendors..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>
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
