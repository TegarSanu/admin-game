"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Sparkles,
  BarChart3,
  History,
  X,
  FolderOpen,
  Trello,
  Briefcase,
  UserCheck,
  PieChart as PieChartIcon,
  Building2,
  ChevronDown,
  UsersIcon,
  Store as StoreIcon,
  ShoppingCart,
  ShoppingBag,
  Gamepad2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useMobileMenu, useAuthStore } from "@/lib/store";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Game Management", href: "/admin/games", icon: Gamepad2 },
  { name: "Nilai Murid", href: "/admin/grades", icon: BarChart3 },
  { name: "Config Hadiah", href: "/admin/rewards", icon: StoreIcon },
  { name: "Cerita Rakyat", href: "/admin/folktales", icon: FolderOpen },
  { name: "Katalog Stiker", href: "/admin/stickers", icon: ShoppingBag },
  {
    name: "User Management",
    icon: Users,
    children: [
      { name: "All Users", href: "/admin/users", icon: UsersIcon },
      {
        name: "Roles & Permissions",
        href: "/admin/users/roles",
        icon: UserCheck,
      },
    ],
  },
  { name: "Dokumentasi API", href: "/api-doc", icon: Briefcase },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen: isMobileOpen, close } = useMobileMenu();
  const { user, hasPermission } = useAuthStore();
  const [openMenus, setOpenMenus] = useState<string[]>(["User Management"]);

  const filteredNavigation = navigation
    .map((item) => {
      if (item.children) {
        const filteredChildren = item.children.filter((child) => {
          if (
            child.name === "All Users" ||
            child.name === "Roles & Permissions"
          )
            return hasPermission("users", "read");
          return true;
        });
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter((item) => {
      if (item.children && item.children.length === 0) return false;

      // Role permission checks
      if (item.name === "User Management")
        return hasPermission("users", "read");
      if (item.name === "Game Management")
        return hasPermission("games", "read");
      if (item.name === "Nilai Murid") return hasPermission("grades", "read");
      if (item.name === "Config Hadiah")
        return hasPermission("rewards", "read");
      if (item.name === "Cerita Rakyat")
        return hasPermission("folktales", "read");
      if (item.name === "Katalog Stiker")
        return hasPermission("stickers", "read");
      if (item.name === "Dokumentasi API")
        return user?.role?.name === "Super Admin";

      // Don't show dashboard to students
      if (item.name === "Dashboard" && user?.role?.name === "Murid")
        return false;

      return true;
    });

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((m) => m !== name) : [...prev, name],
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-72 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full flex flex-col">
          {/* Brand Header */}
          <div className="h-20 flex items-center px-8 border-b border-border/50 shrink-0">
            <Link
              href="/admin"
              className="flex items-center gap-2 group outline-none"
              onClick={close}
            >
              <div
                className="w-9 h-9 accent-icon-box-solid rounded-xl flex items-center justify-center transition-all group-hover:scale-105 shadow-lg"
                style={{ boxShadow: "0 4px 14px var(--accent-glow)" }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-foreground tracking-tighter leading-none italic uppercase">
                  DUNIA
                  <span className="text-accent-dynamic opacity-70">PINTAR</span>
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                  Admin Dashboard
                </span>
              </div>
            </Link>
            <button
              onClick={close}
              className="ml-auto lg:hidden p-2 hover:bg-muted rounded-xl transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 overflow-y-auto px-4 custom-scrollbar">
            <nav className="space-y-1">
              {filteredNavigation.map((item) => {
                const hasChildren = !!item.children;
                const isSubMenuOpen = openMenus.includes(item.name);
                const isActive =
                  pathname === item.href ||
                  (hasChildren &&
                    item.children?.some((c) => pathname === c.href));

                return (
                  <div key={item.name} className="space-y-1">
                    {hasChildren ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 outline-none group",
                            isActive
                              ? "text-foreground bg-muted/20"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                          )}
                          aria-label={`Toggle ${item.name} section`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className="w-4 h-4"
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span>{item.name}</span>
                          </div>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform duration-300",
                              isSubMenuOpen ? "rotate-180" : "rotate-0",
                            )}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isSubMenuOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeInOut" }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-1 mt-1 pl-4 border-l border-border/50 ml-5">
                                {item.children?.map((child) => {
                                  const isChildActive = pathname === child.href;
                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      onClick={close}
                                      className={cn(
                                        "relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 outline-none group",
                                        isChildActive
                                          ? "text-accent-dynamic font-bold"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                                      )}
                                      aria-label={`Go to ${child.name}`}
                                    >
                                      {isChildActive && (
                                        <motion.div
                                          layoutId="sidebar-active-pill"
                                          className="absolute inset-0 rounded-lg sidebar-active-pill"
                                          initial={false}
                                          transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                          }}
                                        />
                                      )}
                                      <child.icon
                                        className="w-4 h-4 relative z-10"
                                        strokeWidth={isChildActive ? 2.5 : 2}
                                      />
                                      <span className="relative z-10">
                                        {child.name}
                                      </span>
                                    </Link>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.href || "#"}
                        onClick={close}
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 outline-none group",
                          isActive
                            ? "text-accent-dynamic font-bold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                        )}
                        aria-label={`Go to ${item.name}`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="sidebar-active-pill"
                            className="absolute inset-0 rounded-lg sidebar-active-pill"
                            initial={false}
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        <item.icon
                          className="w-4 h-4 relative z-10"
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span className="relative z-10">{item.name}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          {/* User Footer */}
          <div className="p-6 border-t border-border/50 bg-muted/5 shrink-0 mt-auto">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl accent-icon-box-solid flex items-center justify-center font-black text-[10px] shadow-lg uppercase"
                style={{ boxShadow: "0 4px 14px var(--accent-glow)" }}
              >
                {user?.name?.substring(0, 2) || "AD"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate leading-none">
                  {user?.name || "Admin Demo"}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground truncate uppercase mt-1 tracking-tighter">
                  {user?.role?.name || "super_admin"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
