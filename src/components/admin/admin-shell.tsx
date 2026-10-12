"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LayoutDashboard, LogOut, Plus, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiPost } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Events", icon: CalendarDays, exact: false },
];

/** Admin chrome, hidden on the login screen so that page stays distraction-free. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/admin/login") {
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  async function signOut() {
    await apiPost("/api/admin/logout");
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-foreground text-background">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="font-display text-base font-semibold leading-none tracking-tight">
              Admin
              <span className="block text-xs font-medium text-background/60">
                Community Events Board
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {ADMIN_LINKS.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-background/15 text-background"
                      : "text-background/70 hover:text-background",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/admin/events/new">
                <Plus className="h-4 w-4" />
                Add event
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
              className="text-background hover:bg-background/15 hover:text-background"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>

        <nav className="container-page flex items-center gap-1 pb-2 sm:hidden">
          {ADMIN_LINKS.map((link) => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-background/15 text-background" : "text-background/70",
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/admin/events/new"
            className="ml-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-background/80"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </nav>
      </header>

      <main className="container-page py-8">{children}</main>
    </div>
  );
}
