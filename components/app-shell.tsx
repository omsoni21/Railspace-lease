
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  LayoutGrid,
  FileText,
  Train,
  Home,
  Files,
  PlusCircle,
  User,
  Package,
  Landmark,
  ShieldCheck,
  Users,
  Wrench,
  LineChart,
  Search,
  LifeBuoy,
  Bot,
  Settings,
} from "lucide-react";
import { UserNav } from "@/components/user-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/add-asset") ||
    pathname.startsWith("/asset-management") ||
    pathname.startsWith("/land-management") ||
    pathname.startsWith("/warehouse-management") ||
    pathname.startsWith("/view-applications") ||
    pathname.startsWith("/ai-tool") ||
    pathname.startsWith("/high-risk-zones");

  const isUserRoute =
    pathname.startsWith("/user-dashboard") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/my-applications") ||
    pathname.startsWith("/report-encroachment") ||
    pathname.startsWith("/profile");

  const adminMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
    { href: "/asset-management", label: "Asset Management", icon: Package },
    { href: "/view-applications", label: "Applications", icon: Files },
    { href: "/ai-tool", label: "AI Tools", icon: Bot },
    { href: "/dashboard", label: "System Settings", icon: Settings },
  ];

  const userMenuItems = [
    { href: "/user-dashboard", label: "Home", icon: Home },
    { href: "/assets", label: "Explore Assets", icon: Search },
    { href: "/my-applications", label: "My Applications", icon: FileText },
    { href: "/report-encroachment", label: "Support", icon: LifeBuoy },
    { href: "/profile", label: "Profile", icon: User },
  ];

  let menuItems;
  let showUserNavAsAdmin = false;

  if (isAdminRoute) {
    menuItems = adminMenuItems;
    showUserNavAsAdmin = true;
  } else if (isUserRoute) {
    menuItems = userMenuItems;
    showUserNavAsAdmin = false;
  } else {
    // Fallback for pages that might not be explicitly routed
    menuItems = userMenuItems;
    showUserNavAsAdmin = false;
  }

  const isAssetManagementActive = () => {
    return pathname.startsWith('/land-management') || 
           pathname.startsWith('/warehouse-management') || 
           pathname.startsWith('/add-asset') ||
           pathname.startsWith('/asset-management');
  };
  
  const isAiToolsActive = () => {
    return pathname.startsWith('/ai-tool') ||
           pathname.startsWith('/high-risk-zones');
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Train className="w-8 h-8 text-primary" />
              <h1 className="text-xl font-semibold text-primary font-headline">
                RailSpace
              </h1>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      isActive={
                        (item.label === "Asset Management" && isAssetManagementActive()) ||
                        (item.label === "AI Tools" && isAiToolsActive()) ||
                        (pathname === item.href && !isAssetManagementActive() && !isAiToolsActive())
                      }
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:justify-end">
            <SidebarTrigger className="sm:hidden" />
            <div className="flex items-center gap-2">
              {isUserRoute && (
                <Link href="/profile">
                  <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </button>
                </Link>
              )}
              <UserNav isAdmin={showUserNavAsAdmin} />
            </div>
          </header>
          <main className="flex-1 p-4 overflow-auto sm:p-6 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
