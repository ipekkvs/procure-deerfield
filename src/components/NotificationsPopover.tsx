import { Bell, Check, Clock, AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { requests, renewals } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface Notification {
  id: string;
  type: 'action_needed' | 'renewal' | 'approval' | 'info';
  title: string;
  description: string;
  timestamp: string;
  link?: string;
  read: boolean;
}

// Generate mock notifications from data
function generateNotifications(): Notification[] {
  const notifications: Notification[] = [];
  
  // Requests needing info
  requests
    .filter(r => r.status === 'needs_info')
    .slice(0, 3)
    .forEach(r => {
      notifications.push({
        id: `request-${r.id}`,
        type: 'action_needed',
        title: 'Action Required',
        description: `${r.title} needs additional information`,
        timestamp: '2 hours ago',
        link: `/request/${r.id}`,
        read: false,
      });
    });
  
  // Upcoming renewals
  renewals
    .filter(r => r.reviewStatus !== 'completed')
    .slice(0, 3)
    .forEach(r => {
      notifications.push({
        id: `renewal-${r.id}`,
        type: 'renewal',
        title: 'Renewal Due Soon',
        description: `${r.vendorName} renews in ${r.daysUntilExpiration} days`,
        timestamp: '1 day ago',
        link: '/renewals',
        read: false,
      });
    });
  
  // Pending approvals
  requests
    .filter(r => r.status === 'pending')
    .slice(0, 2)
    .forEach(r => {
      notifications.push({
        id: `approval-${r.id}`,
        type: 'approval',
        title: 'Pending Approval',
        description: `${r.title} is awaiting review`,
        timestamp: '3 hours ago',
        link: '/approvals',
        read: true,
      });
    });
  
  return notifications.slice(0, 8);
}

const typeIcons = {
  action_needed: AlertTriangle,
  renewal: RefreshCw,
  approval: Clock,
  info: Bell,
};

const typeColors = {
  action_needed: 'text-status-error',
  renewal: 'text-status-warning',
  approval: 'text-primary',
  info: 'text-muted-foreground',
};

export function NotificationsPopover() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(generateNotifications);
  const [open, setOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs font-semibold rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-auto py-1"
              onClick={markAllAsRead}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = typeIcons[notification.type];
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors flex gap-3",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className={cn("mt-0.5", typeColors[notification.type])}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm truncate",
                          !notification.read && "font-medium"
                        )}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t px-4 py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => {
              navigate('/approvals');
              setOpen(false);
            }}
          >
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
