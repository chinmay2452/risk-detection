import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/cyber/AppShell";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  return <AppShell />;
}

// Suppress unused import warning — Outlet is used inside AppShell
void Outlet;
