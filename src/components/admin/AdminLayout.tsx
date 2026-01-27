import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Shield, 
  Users,
  LogOut,
  Menu,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  BarChart3,
  Settings,
  FileText,
  LayoutDashboard,
  Home,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/admin" },
  { icon: Users, label: "Utilisateurs", path: "/admin/users" },
  { icon: ArrowDownCircle, label: "Dépôts (validation)", path: "/admin/deposits" },
  { icon: ArrowUpCircle, label: "Retraits (validation)", path: "/admin/withdrawals" },
  { icon: CreditCard, label: "Moyens de paiement", path: "/admin/payment-methods" },
  { icon: TrendingUp, label: "Plans ROI", path: "/admin/plans" },
  { icon: BarChart3, label: "Statistiques", path: "/admin/statistics" },
  { icon: Settings, label: "Paramètres", path: "/admin/settings" },
  { icon: FileText, label: "Journaux (logs)", path: "/admin/logs" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:transform-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-destructive flex items-center justify-center">
                <Shield className="w-6 h-6 text-destructive-foreground" />
              </div>
              <span className="text-xl font-bold font-display">Admin Panel</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            {/* User Dashboard Link */}
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mt-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Mon Dashboard</span>
            </Link>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive-foreground" />
              </div>
              <span className="font-bold font-display">Admin</span>
            </div>
            <div className="w-10" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
