"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@ai-mock-interview/ui/lib/utils";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 glass bg-background/80 border-b border-border/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <span className="font-display text-xl tracking-tight text-primary transition-colors group-hover:text-foreground">
              MockPrep
            </span>
          </Link>
          <nav className="hidden sm:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                href={to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-all duration-200",
                  pathname === to
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
