import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BarChart3, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/contexts/socket-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const { isConnected, reconnect } = useSocket();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      setIsMobileMenuOpen(false);
    };
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: true,
    },
    {
      name: "Analytics",
      href: "/dashboard",
      icon: BarChart3,
      current: false,
    },
    {
      name: "Users",
      href: "/dashboard",
      icon: Users,
      current: false,
    },
    {
      name: "Support",
      href: "/support",
      icon: MessageSquare,
      current: false,
    },
    {
      name: "Settings",
      href: "/dashboard",
      icon: Settings,
      current: false,
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-center border-b border-border px-4">
          <h1 className="text-xl font-bold">Analytics Dashboard</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navigationItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  item.current ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Log out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </Button>

          <div className="ml-auto flex items-center space-x-2">
            {!isConnected && (
              <Button variant="outline" size="sm" onClick={reconnect} className="text-xs">
                <span className="mr-1 h-2 w-2 rounded-full bg-destructive"></span>
                Reconnect
              </Button>
            )}
            {isConnected && (
              <div className="flex items-center text-xs">
                <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
                Connected
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
