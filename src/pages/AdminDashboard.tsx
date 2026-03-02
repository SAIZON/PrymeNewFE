import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
    Users, FileText, Building2, TrendingUp, Settings,
    LogOut, Bell, Search, BarChart3, CreditCard,
    Shield, Clock, CheckCircle, XCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Added Dialog imports
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { PrymeAPI } from "@/lib/api";
import AdminDocumentList from "@/components/loan/AdminDocumentList"; // Imported Document List
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardStats {
    totalUsers: number;
    pendingApplications: number;
    approvedLoans: number;
    totalDisbursed: number;
}

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    role?: string;
}

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);

    // States for Live Java Data
    const [applications, setApplications] = useState<any[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null); // State for the Modal

    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        pendingApplications: 0,
        approvedLoans: 0,
        totalDisbursed: 0,
    });

    // 1. Check Authentication securely via LocalStorage
    useEffect(() => {
        const token = localStorage.getItem("pryme_token");
        const role = localStorage.getItem("pryme_role");

        if (!token) {
            navigate("/auth");
            return;
        }

        if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
            toast({
                title: "Access Denied",
                description: "You don't have admin privileges.",
                variant: "destructive",
            });
            navigate("/dashboard");
            return;
        }

        setIsLoading(false);
        fetchDashboardData();
    }, [navigate]);

    // 2. Fetch Live Data from Java Backend
    const fetchDashboardData = async () => {
        try {
            const response = await PrymeAPI.getApplications();

            // Extract the array from Spring Boot's Page wrapper (response.content)
            const apps = response.content || response || [];
            setApplications(apps);

            const pendingCount = apps.filter((a: any) => a.status === 'SUBMITTED' || a.status === 'PENDING').length;
            const approvedCount = apps.filter((a: any) => a.status === 'APPROVED' || a.status === 'DISBURSED').length;
            const totalVolume = apps.reduce((sum: number, app: any) => sum + (app.amount || 0), 0);

            setStats({
                totalUsers: 1, // Still mocked for now
                pendingApplications: pendingCount,
                approvedLoans: approvedCount,
                totalDisbursed: totalVolume,
            });

            // If a modal is open, silently update its data to reflect any document verifications
            if (selectedApplication) {
                const updatedApp = apps.find((a: any) => a.id === selectedApplication.id);
                if (updatedApp) setSelectedApplication(updatedApp);
            }

            setIsLoading(false);
        } catch (error) {
            toast({
                title: "Connection Error",
                description: "Failed to fetch live data from the secure server.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            await PrymeAPI.updateApplicationStatus(id, newStatus);
            toast({ title: "Status Updated", description: `Application is now ${newStatus}` });
            fetchDashboardData(); // Refresh the list
        } catch (error) {
            toast({ title: "Update Failed", variant: "destructive" });
        }
    };

    const handleSignOut = () => {
        localStorage.removeItem("pryme_token");
        localStorage.removeItem("pryme_role");
        localStorage.removeItem("pryme_name");
        navigate("/");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading Secure Dashboard...</div>
            </div>
        );
    }

    const sidebarItems = [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "users", label: "Users", icon: Users },
        { id: "applications", label: "Applications", icon: FileText },
        { id: "banks", label: "Partner Banks", icon: Building2 },
        { id: "offers", label: "Offers & Rewards", icon: CreditCard },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const statCards = [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
        { label: "Pending Applications", value: stats.pendingApplications, icon: Clock, color: "text-trust" },
        { label: "Approved Loans", value: stats.approvedLoans, icon: CheckCircle, color: "text-success" },
        { label: "Pipeline Volume", value: formatCurrency(stats.totalDisbursed), icon: TrendingUp, color: "text-primary" },
    ];

    return (
        <>
            <Helmet>
                <title>Admin Dashboard - PYRME Consulting</title>
                <meta name="description" content="Admin dashboard for PYRME Consulting loan management." />
            </Helmet>

            <div className="min-h-screen flex bg-background">
                {/* Sidebar */}
                <aside className="w-64 neo-card border-r border-border min-h-screen p-4 hidden lg:block">
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <div className="w-10 h-10 rounded-xl neo-card-inset flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">PYRME</h1>
                            <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                                    activeTab === item.id
                                        ? "neo-card-inset text-primary"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="absolute bottom-4 left-4 right-4">
                        <Button
                            variant="ghost"
                            onClick={handleSignOut}
                            className="w-full justify-start text-muted-foreground hover:text-destructive"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-auto relative">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                {activeTab === "overview" && "Dashboard Overview"}
                                {activeTab === "users" && "User Management"}
                                {activeTab === "applications" && "Loan Applications"}
                                {activeTab === "banks" && "Partner Banks"}
                                {activeTab === "offers" && "Offers & Rewards"}
                                {activeTab === "settings" && "Settings"}
                            </h1>
                            <p className="text-muted-foreground">
                                Welcome back, {localStorage.getItem("pryme_name") || "Admin"}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Input
                                    placeholder="Search..."
                                    className="neo-input border-0 pl-10 w-64"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                            <Button variant="ghost" size="icon" className="neo-card">
                                <Bell className="w-5 h-5" />
                            </Button>
                            <div className="flex items-center gap-2 neo-card px-3 py-2 rounded-xl">
                                <Shield className="w-4 h-4 text-success" />
                                <span className="text-sm font-medium text-foreground">Super Admin</span>
                            </div>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map((stat, index) => (
                                    <div key={index} className="neo-card p-6 card-hover">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                            </div>
                                            <div className={cn("w-12 h-12 rounded-xl neo-card-inset flex items-center justify-center", stat.color)}>
                                                <stat.icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Applications from Java Backend */}
                            <div className="neo-card p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
                                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("applications")} className="text-primary hover:text-primary/80">View All</Button>
                                </div>
                                <div className="space-y-3">
                                    {applications.length === 0 ? (
                                        <div className="text-center p-8 text-muted-foreground">No applications in the pipeline yet.</div>
                                    ) : (
                                        applications.slice(0, 4).map((app, index) => (
                                            <div key={app.id || index} className="flex items-center justify-between p-4 neo-card-inset rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full neo-card flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">{app.id}</p>
                                                        <p className="text-sm text-muted-foreground">{app.loanType} • CIBIL: {app.declaredCibilScore}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-right">
                                                    <div>
                                                        <p className="font-semibold text-foreground">{formatCurrency(app.amount)}</p>
                                                        <span className={cn(
                                                            "text-xs font-bold px-2 py-1 rounded-full",
                                                            app.status === "APPROVED" && "bg-success/10 text-success",
                                                            (app.status === "PENDING" || app.status === "SUBMITTED") && "bg-trust/10 text-trust",
                                                            app.status === "REJECTED" && "bg-destructive/10 text-destructive"
                                                        )}>
                              {app.status}
                            </span>
                                                    </div>
                                                    {/* Attached Eye Button to quick view in overview too */}
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                                                        <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Applications Tab (Live Data) */}
                    {activeTab === "applications" && (
                        <div className="neo-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-foreground">All Loan Applications</h3>
                                <Button className="neo-button border-0 bg-primary">
                                    Export CSV
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">App ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Loan Type</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">CIBIL</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {applications.map((app) => (
                                        <tr key={app.id} className="border-b border-border/50 hover:bg-muted/20">
                                            <td className="py-4 px-4 font-bold text-primary">{app.id}</td>
                                            <td className="py-4 px-4 font-medium text-foreground">{app.loanType}</td>
                                            <td className="py-4 px-4 font-bold text-foreground">{formatCurrency(app.amount)}</td>
                                            <td className="py-4 px-4 text-muted-foreground">{app.declaredCibilScore}</td>
                                            <td className="py-4 px-4">
                           <span className={cn(
                               "text-xs font-bold px-2 py-1 rounded-full",
                               app.status === "APPROVED" && "bg-success/10 text-success",
                               (app.status === "PENDING" || app.status === "SUBMITTED") && "bg-trust/10 text-trust",
                               app.status === "REJECTED" && "bg-destructive/10 text-destructive"
                           )}>
                            {app.status}
                          </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {/* Connected the Eye Button here */}
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(app)}>
                                                    <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {applications.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-muted-foreground font-medium">
                                                No applications found in the database.
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="neo-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-foreground">All Users</h3>
                                <Button className="neo-button border-0 bg-primary">
                                    Add User
                                </Button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {users.map((profile) => (
                                        <tr key={profile.id} className="border-b border-border/50 hover:bg-muted/20">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full neo-card-inset flex items-center justify-center">
                                                        <Users className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <span className="font-medium text-foreground">
                              {profile.full_name || "No Name"}
                            </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-muted-foreground">{profile.email}</td>
                                            <td className="py-4 px-4 text-muted-foreground">
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-muted-foreground">
                                                No users found
                                            </td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Placeholder for other tabs */}
                    {!["overview", "users", "applications"].includes(activeTab) && (
                        <div className="neo-card p-12 text-center">
                            <div className="w-16 h-16 mx-auto neo-card-inset rounded-full flex items-center justify-center mb-4">
                                <Settings className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Coming Soon</h3>
                            <p className="text-muted-foreground">
                                This section is under development and will be wired to the Java Backend shortly.
                            </p>
                        </div>
                    )}

                </main>
            </div>

            {/* MODAL: Application Details & Document Verification */}
            <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card text-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-3">
                            Application {selectedApplication?.applicationId}
                            <span className={cn(
                                "text-xs font-bold px-3 py-1 rounded-full",
                                selectedApplication?.status === "APPROVED" && "bg-success/10 text-success",
                                (selectedApplication?.status === "PENDING" || selectedApplication?.status === "SUBMITTED") && "bg-trust/10 text-trust",
                                selectedApplication?.status === "REJECTED" && "bg-destructive/10 text-destructive"
                            )}>
                {selectedApplication?.status}
              </span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {/* Quick Information Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border border-border/50 rounded-xl bg-muted/20">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Loan Type</p>
                                <p className="font-medium text-foreground mt-1">{selectedApplication?.loanType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                                <p className="font-medium text-foreground mt-1">
                                    {selectedApplication ? formatCurrency(selectedApplication.amount) : ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">CIBIL Score</p>
                                <p className="font-medium text-foreground mt-1">{selectedApplication?.declaredCibilScore}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Tenure</p>
                                <p className="font-medium text-foreground mt-1">{selectedApplication?.tenureMonths} Months</p>
                            </div>
                        </div>

                        {/* Master Application Status Controls */}
                        <div className="flex flex-col gap-2 p-4 bg-card border border-border/50 rounded-xl mt-4">
                            <label className="text-sm font-semibold text-foreground">Update Application Status</label>
                            <div className="flex items-center gap-4">
                                <Select
                                    value={selectedApplication?.status}
                                    onValueChange={(value) => handleUpdateStatus(selectedApplication.id, value)}
                                >
                                    <SelectTrigger className="w-[250px] neo-input border-border/50">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUBMITTED">1. Submitted</SelectItem>
                                        <SelectItem value="VERIFIED">2. Verified</SelectItem>
                                        <SelectItem value="PROCESSING">3. Processing (Underwriting)</SelectItem>
                                        <SelectItem value="APPROVED">4. Approved</SelectItem>
                                        <SelectItem value="DISBURSED">5. Disbursed (Completed)</SelectItem>
                                        <hr className="my-2 border-border/50" />
                                        <SelectItem value="REJECTED" className="text-destructive focus:bg-destructive/10">
                                            Declined / Rejected
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <span className="text-xs text-muted-foreground">
                  Updating this will instantly reflect on the user's timeline.
                </span>
                            </div>
                        </div>

                        <hr className="border-border/50" />

                        {/* Document Verification List */}
                        {selectedApplication && (
                            <AdminDocumentList
                                documents={selectedApplication.documents || []}
                                onUpdate={fetchDashboardData}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AdminDashboard;