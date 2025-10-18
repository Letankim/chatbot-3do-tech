"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bot,
  Palette,
  Package,
  FileText,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { api } from "@/lib/api";

const navigation = [
  { name: "Theme", href: "/dashboard", icon: Palette },
  { name: "Sản phẩm", href: "/dashboard/products", icon: Package },
  { name: "Chính sách", href: "/dashboard/policies", icon: FileText },
  { name: "Xem trước Chat", href: "/dashboard/preview", icon: MessageSquare },
];

export function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    api.clearApiKey();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src="https://cuuho.3docorp.vn/logo.png"
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-lg">AI ChatBot - 3Do</h1>
                <p className="text-xs text-muted-foreground">User panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    isActive && "shadow-md"
                  )}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11 bg-transparent"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 bg-card border-b border-border px-4 py-3 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold">AI Chatbot Admin</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
