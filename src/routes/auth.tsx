import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { GlassCard } from "@/components/cyber/GlassCard";
import { Shield, ArrowRight, Lock, Mail, Loader2, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const { session } = useAuth();

  // If already logged in, redirect to dashboard
  if (session) {
    navigate({ to: "/app/dashboard" });
    return null;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate({ to: "/app/dashboard" });
      } else {
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // Insert into the profiles table with full_name
        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
              id: data.user.id,
              full_name: fullName.trim(),
              email: data.user.email,
              created_at: new Date().toISOString(),
            });
          if (profileError) console.error("Profile insert error:", profileError.message);
        }

        setErrorMsg("Check your email for the confirmation link.");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
      <CyberBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-2xl bg-primary/40 blur-xl" />
            <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary ring-1 ring-white/20">
              <Shield className="size-8 text-primary-foreground" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">SentinelAI</h1>
          <p className="text-sm text-muted-foreground mt-1">Secure architecture intelligence</p>
        </div>

        <GlassCard className="p-8 backdrop-blur-xl bg-background/40">
          <div className="flex space-x-1 bg-background/50 p-1 rounded-lg mb-6 ring-1 ring-border/50">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                isLogin
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_-3px] shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(""); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                !isLogin
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_-3px] shadow-primary/30"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Full Name — only shown on Sign Up */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background/50 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                    placeholder="John Smith"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/50 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/50 border border-border/50 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {errorMsg && (
              <div className={`text-xs p-3 rounded-lg border ${errorMsg.includes("Check your email") ? "bg-success/10 border-success/30 text-success" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary-glow px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_-5px] shadow-primary hover:shadow-[0_0_30px_-5px] hover:shadow-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {isLogin ? "Access Dashboard" : "Initialize Account"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>
        </GlassCard>

        <p className="text-center mt-6 text-xs text-muted-foreground">
          By authenticating, you agree to the{" "}
          <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>
          {" "}& <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
