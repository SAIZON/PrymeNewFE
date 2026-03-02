import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileText, Search, CheckCircle, CreditCard, Clock, AlertCircle, Building2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { PrymeAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const springConfig = { stiffness: 120, damping: 28, mass: 0.8 };

const Dashboard = () => {
    const { user, isLoading: isAuthLoading, isAdmin } = useAuth();
    const navigate = useNavigate();

    // State for live backend data
    const [stats, setStats] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            navigate("/auth");
        } else if (user) {
            fetchUserDashboard();
        }
    }, [user, isAuthLoading, navigate]);

    const fetchUserDashboard = async () => {
        try {
            const [statsData, appsData] = await Promise.all([
                PrymeAPI.getDashboardStats(),
                PrymeAPI.getUserApplications()
            ]);
            setStats(statsData);
            setApplications(appsData);
        } catch (error) {
            toast({ title: "Error fetching dashboard", variant: "destructive" });
        } finally {
            setIsDataLoading(false);
        }
    };

    // Static timeline stages (You can map these to currentApp.status later)
    const stages = [
        {
            id: 1,
            title: "Application Received",
            description: "Your application has been submitted successfully",
            icon: FileText,
            status: "completed",
        },
        {
            id: 2,
            title: "Document Verification",
            description: "Our team is verifying your documents",
            icon: Search,
            status: "current",
        },
        {
            id: 3,
            title: "Credit Assessment",
            description: "Evaluating your credit profile",
            icon: AlertCircle,
            status: "pending",
        },
        {
            id: 4,
            title: "Approval",
            description: "Final approval from our underwriting team",
            icon: CheckCircle,
            status: "pending",
        },
        {
            id: 5,
            title: "Disbursement",
            description: "Funds transferred to your account",
            icon: CreditCard,
            status: "pending",
        },
    ];

    const getStageStyles = (status: string) => {
        switch (status) {
            case "completed":
                return {
                    circle: "bg-success text-success-foreground",
                    line: "bg-success",
                    text: "text-success",
                };
            case "current":
                return {
                    circle: "bg-primary text-primary-foreground animate-pulse",
                    line: "bg-border",
                    text: "text-primary",
                };
            default:
                return {
                    circle: "bg-muted text-muted-foreground",
                    line: "bg-border",
                    text: "text-muted-foreground",
                };
        }
    };

    // Consolidated Loading Screen
    if (isAuthLoading || isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-muted-foreground animate-pulse text-lg font-medium">Loading Dashboard...</div>
            </div>
        );
    }

    // Determine current active application
    const currentApp = applications.length > 0 ? applications[0] : null;

    // Map backend stats to UI
    const quickStats = [
        { label: "Applications", value: stats?.totalApplications || "0", icon: FileText, color: "text-primary" },
        { label: "Pending", value: stats?.activeApplications || "0", icon: Clock, color: "text-warning" },
        { label: "Notifications", value: stats?.unreadNotifications || "0", icon: AlertCircle, color: "text-success" },
        { label: "Credit Score", value: stats?.creditScore || "N/A", icon: TrendingUp, color: "text-primary" },
    ];

    return (
        <>
            <Helmet>
                <title>Dashboard - PYRME Consulting</title>
                <meta name="description" content="Track your loan application status in real-time with PYRME Consulting." />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-background">
                <Header />

                <main className="flex-1">
                    {/* Page Header */}
                    <section className="aurora-gradient py-12 md:py-16">
                        <div className="container mx-auto px-4">
                            <div className="flex items-center justify-between">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", ...springConfig }}
                                >
                                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2" style={{ letterSpacing: "-0.02em" }}>
                                        Welcome back, {user?.name || user?.email?.split("@")[0] || "User"}
                                    </h1>
                                    <p className="text-muted-foreground text-lg">
                                        Monitor your loan applications and manage your profile
                                    </p>
                                </motion.div>
                                {isAdmin && (
                                    <Button
                                        onClick={() => navigate("/admin")}
                                        className="neo-button border-0 bg-trust text-trust-foreground hover:bg-trust/90"
                                    >
                                        <Building2 className="w-4 h-4 mr-2" />
                                        Admin Panel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Quick Stats */}
                    <section className="py-8 border-b border-border/50">
                        <div className="container mx-auto px-4">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {quickStats.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", ...springConfig, delay: index * 0.08 }}
                                        whileHover={{ y: -2, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                        className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-6 transition-shadow duration-300 hover:shadow-[0_8px_30px_-12px_hsl(148_62%_42%/0.12)] hover:border-primary/20"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center">
                                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Application Status */}
                    <section className="py-12 md:py-16">
                        <div className="container mx-auto px-4">
                            <div className="max-w-3xl mx-auto">

                                {/* Dynamic Application Card */}
                                {currentApp ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", ...springConfig, delay: 0.3 }}
                                        className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-6 mb-8 hover:border-primary/15 transition-colors duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-border/50">
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Application ID</span>
                                                <p className="text-lg font-mono font-semibold text-foreground">{currentApp.applicationId}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                         <span className={cn(
                             "text-sm font-bold px-3 py-1 rounded-full",
                             currentApp.status === "APPROVED" && "bg-success/10 text-success",
                             (currentApp.status === "PENDING" || currentApp.status === "SUBMITTED") && "bg-trust/10 text-trust",
                             currentApp.status === "REJECTED" && "bg-destructive/10 text-destructive"
                         )}>
                           {currentApp.status.replace("_", " ")}
                         </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Loan Type</span>
                                                <p className="text-sm font-medium text-foreground mt-1">{currentApp.loanType}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Amount</span>
                                                <p className="text-sm font-medium text-foreground mt-1">₹{currentApp.requestedAmount?.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">CIBIL Score</span>
                                                <p className="text-sm font-medium text-foreground mt-1">{currentApp.declaredCibilScore || "N/A"}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider">Bank</span>
                                                <p className="text-sm font-medium text-foreground mt-1">{currentApp.bankName || "Pending Setup"}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center p-8 bg-card/70 border border-border/40 rounded-2xl mb-8"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">No Active Applications</h3>
                                        <p className="text-muted-foreground mb-6">You don't have any loan applications currently in progress.</p>
                                        <Button onClick={() => navigate('/apply')} className="bg-primary text-primary-foreground neo-button border-0">
                                            Start an Application
                                        </Button>
                                    </motion.div>
                                )}

                                {/* Timeline */}
                                {currentApp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", ...springConfig, delay: 0.4 }}
                                        className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/40 p-6"
                                    >
                                        <h2 className="text-lg font-semibold text-foreground mb-8">Application Progress</h2>

                                        <div className="relative">
                                            {stages.map((stage, index) => {
                                                const styles = getStageStyles(stage.status);
                                                const isLast = index === stages.length - 1;

                                                return (
                                                    <div key={stage.id} className="relative flex gap-4 pb-8 last:pb-0">
                                                        {!isLast && (
                                                            <div className={cn("absolute left-5 top-10 w-0.5 h-[calc(100%-2rem)]", styles.line)} />
                                                        )}
                                                        <div className={cn("relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0", styles.circle)}>
                                                            <stage.icon className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1 pt-1">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <h3 className={cn("font-medium", styles.text)}>{stage.title}</h3>
                                                                    <p className="text-sm text-muted-foreground mt-0.5">{stage.description}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Help Card */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ type: "spring", ...springConfig, delay: 0.5 }}
                                    className="mt-8 bg-muted/40 backdrop-blur-sm p-6 rounded-2xl border border-border/30 text-center"
                                >
                                    <h3 className="font-medium text-foreground mb-2">Need Help?</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Our support team is available 24/7 to assist you with your application.
                                    </p>
                                    <Button variant="outline" className="neo-button border-0">Contact Support</Button>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default Dashboard;