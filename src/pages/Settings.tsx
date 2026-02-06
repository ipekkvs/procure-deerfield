import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Bell, 
  Mail, 
  Shield, 
  Building2, 
  Users,
  Palette
} from "lucide-react";

const Settings = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Users className="w-5 h-5" />
          Profile
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Alex" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Johnson" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="alex@company.com" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="department">Department</Label>
            <Input id="department" defaultValue="Marketing" className="mt-1.5" />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5" />
          Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive email updates for request status changes</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Approval Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminded about pending approvals</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Renewal Alerts</p>
              <p className="text-sm text-muted-foreground">Notify me 30 days before contract renewals</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Digest</p>
              <p className="text-sm text-muted-foreground">Receive a weekly summary of procurement activity</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Organization Section */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5" />
          Organization
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="orgName">Organization Name</Label>
            <Input id="orgName" defaultValue="Acme Corporation" className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fiscalYear">Fiscal Year Start</Label>
              <Input id="fiscalYear" defaultValue="January" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" defaultValue="USD" className="mt-1.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5" />
          Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default Settings;
