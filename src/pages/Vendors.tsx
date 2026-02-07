import { useState, useMemo } from "react";
import { VendorCard } from "@/components/VendorCard";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  vendors, 
  requests,
  formatCurrency, 
  formatDate,
  Vendor,
  getCurrentUser
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus,
  Building2,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  LayoutGrid,
  List,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/ui/search-input";
import { NoSearchResults } from "@/components/search/NoSearchResults";
import { searchItems } from "@/hooks/useRoleBasedSearch";

const Vendors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const currentUser = getCurrentUser();
  const isRequester = currentUser.role === 'requester';

  // For requesters, only show vendors they have used in their requests
  const accessibleVendors = useMemo(() => {
    if (!isRequester) return vendors;
    
    // Get vendor IDs from user's requests
    const userRequests = requests.filter(r => r.requesterId === currentUser.id);
    const userVendorIds = new Set(userRequests.map(r => r.vendorId).filter(Boolean));
    
    // Also include vendors from requests in user's department
    const deptRequests = requests.filter(r => r.department === currentUser.department);
    deptRequests.forEach(r => {
      if (r.vendorId) userVendorIds.add(r.vendorId);
    });
    
    return vendors.filter(v => userVendorIds.has(v.id));
  }, [isRequester, currentUser.id, currentUser.department]);

  // Get unique categories from accessible vendors
  const categories = Array.from(new Set(accessibleVendors.map(v => v.category)));

  // Filter vendors with search
  const searchedVendors = useMemo(() => 
    searchItems(accessibleVendors, searchQuery, ['name', 'category', 'status']),
    [accessibleVendors, searchQuery]
  );

  // Apply category filter
  const filteredVendors = useMemo(() => 
    searchedVendors.filter(v => 
      categoryFilter === 'all' || v.category === categoryFilter
    ),
    [searchedVendors, categoryFilter]
  );

  // Stats - different for requesters
  const totalAnnualSpend = vendors.reduce((sum, v) => sum + v.annualSpend, 0);
  const activeVendors = vendors.filter(v => v.status === 'active').length;
  const myVendorCount = accessibleVendors.length;

  const handleVendorClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowDetailDialog(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vendors</h1>
          <p className="text-muted-foreground mt-1">
            {isRequester 
              ? "Vendors associated with your department's requests"
              : "Manage your vendor relationships and contracts"
            }
          </p>
        </div>
        {!isRequester && (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Vendor
          </Button>
        )}
      </div>

      {/* Stats - Role-based visibility */}
      <div className={cn("grid gap-4", isRequester ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3")}>
        {isRequester ? (
          <>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="w-4 h-4" />
                <p className="text-sm">My Department's Vendors</p>
              </div>
              <p className="text-2xl font-bold">{myVendorCount}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="w-4 h-4" />
                <p className="text-sm">Active Contracts</p>
              </div>
              <p className="text-2xl font-bold">
                {accessibleVendors.filter(v => v.status === 'active').length}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Vendors</p>
              <p className="text-2xl font-bold mt-1">{vendors.length}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Active Vendors</p>
              <p className="text-2xl font-bold mt-1">{activeVendors}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Annual Spend</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalAnnualSpend)}</p>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vendors..."
          resultsCount={filteredVendors.length}
          totalCount={accessibleVendors.length}
          showResultsCount={searchQuery.length >= 2}
          syncToUrl={true}
          className="flex-1 min-w-[200px] max-w-md"
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center border rounded-lg p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('table')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Vendor List */}
      {filteredVendors.length === 0 && searchQuery.length >= 2 ? (
        <NoSearchResults searchTerm={searchQuery} onClear={() => setSearchQuery("")} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={() => handleVendorClick(vendor)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                {!isRequester && <TableHead>Owner</TableHead>}
                <TableHead>Contract End</TableHead>
                {!isRequester && <TableHead className="text-right">Annual Spend</TableHead>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow 
                  key={vendor.id}
                  className="cursor-pointer"
                  onClick={() => handleVendorClick(vendor)}
                >
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  {!isRequester && <TableCell>{vendor.ownerName}</TableCell>}
                  <TableCell>{formatDate(vendor.contractEnd)}</TableCell>
                  {!isRequester && <TableCell className="text-right">{formatCurrency(vendor.annualSpend)}</TableCell>}
                  <TableCell>
                    <StatusBadge 
                      variant={vendor.status === 'active' ? 'success' : 'neutral'}
                      dot={false}
                    >
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Vendor Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle>{selectedVendor?.name}</DialogTitle>
                <DialogDescription>{selectedVendor?.category}</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6 py-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Contact Information</h4>
                {selectedVendor.website && (
                  <a 
                    href={selectedVendor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {selectedVendor.website}
                  </a>
                )}
                {selectedVendor.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedVendor.contactEmail}
                  </div>
                )}
                {selectedVendor.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {selectedVendor.contactPhone}
                  </div>
                )}
              </div>

              {/* Contract Details */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-muted-foreground">Contract Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(selectedVendor.contractStart)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">End Date</p>
                      <p className="font-medium">{formatDate(selectedVendor.contractEnd)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spend - Hidden for requesters */}
              {!isRequester && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Annual Spend</span>
                    </div>
                    <span className="text-2xl font-bold">{formatCurrency(selectedVendor.annualSpend)}</span>
                  </div>
                </div>
              )}

              {/* Owner - Hidden for requesters */}
              {!isRequester && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Owner: </span>
                  <span className="font-medium">{selectedVendor.ownerName}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
            {!isRequester && <Button>Edit Vendor</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Vendors;
