import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Upload,
  Wrench,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { CyberBackground } from "./CyberBackground";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

const navItems = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/input", label: "Smart Input", icon: Upload },
  { to: "/app/extraction", label: "AI Extraction", icon: Sparkles },
  { to: "/app/validation", label: "Validation", icon: Shield },
  { to: "/app/analyze", label: "Analyze", icon: ShieldAlert },
  { to: "/app/mitigation", label: "Mitigation", icon: Wrench },
  { to: "/app/reports", label: "Reports", icon: FileText },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { location } = useRouterState();
  const path = location.pathname;

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });
  }, [user]);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User";
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="relative min-h-screen">
      <CyberBackground variant="subtle" />

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/50 bg-sidebar/60 backdrop-blur-xl">
          <SidebarContent path={path} />
        </aside>

        {/* Sidebar - mobile drawer */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border lg:hidden animate-in slide-in-from-left duration-200">
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 hover:bg-accent"
                  aria-label="Close menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <SidebarContent path={path} onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 bg-background/60 px-4 backdrop-blur-xl lg:px-8">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 hover:bg-accent lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>

            <div className="relative hidden md:block flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search projects, risks, components…"
                className="w-full rounded-lg border border-border/60 bg-background/40 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success ring-1 ring-success/30">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                Engine online
              </span>
              <button
                className="relative rounded-lg p-2 hover:bg-accent"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-background" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="hidden md:block text-right">
                  <p className="text-xs font-medium leading-tight">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                </div>
                <div className="size-9 rounded-full bg-gradient-to-br from-primary to-secondary p-px">
                  <div className="flex size-full items-center justify-center rounded-full bg-card text-xs font-semibold">
                    {initials}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  path,
  onNavigate,
}: {
  path: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        className="flex items-center gap-2.5 px-6 py-5 border-b border-border/50"
        onClick={onNavigate}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-lg bg-primary/40 blur-md" />
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
            <Shield className="size-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-sm font-bold leading-none">SentinelAI</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            Security Platform
          </p>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 p-3">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const active = path === item.to || path.startsWith(item.to + "/");
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-primary shadow-[0_0_10px] shadow-primary" />
              )}
              <item.icon className={cn("size-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 p-4 ring-1 ring-primary/20">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <p className="text-xs font-semibold">System Health</p>
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-gradient-cyan">98.7%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/50">
            <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-primary to-primary-glow" />
          </div>
          <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <GitBranch className="size-3" />
            v3.4.2 — all systems nominal
          </p>
        </div>
      </div>
    </div>
  );
}

