import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Dashboard, 
  Fuel, 
  Truck, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  User,
  CreditCard,
  History
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const items = [
  { title: "Dashboard", url: "/customer", icon: Dashboard },
  { title: "Subscriptions", url: "/customer/subscriptions", icon: Fuel },
  { title: "Delivery", url: "/customer/deliveries", icon: Truck },
  { title: "Analytics", url: "/customer/analytics", icon: BarChart3 },
  { title: "Payments", url: "/customer/payments", icon: CreditCard },
  { title: "History", url: "/customer/history", icon: History },
  { title: "Settings", url: "/customer/settings", icon: Settings },
];

export default function CustomerLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-4">
            <Fuel className="h-6 w-6 text-primary" />
            <span className="font-bold">FuelFlow</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/customer/profile">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/auth/login">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1">
        <div className="flex items-center justify-between p-4 border-b">
          <SidebarTrigger />
          <ThemeToggle />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
