"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";

export default function Sidebar() {
  const pathname = usePathname();
  useAuthStore();
  // Define menu items based on user role
  const menuItems = [
    { name: "Dashboard", href: "/" },
    { name: "Patients", href: "/patients" },
    { name: "Schedule", href: "/schedule" },
    { name: "Clinical Records", href: "/clinical-records" },
    { name: "Settings", href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-muted/40 border-r h-full flex-shrink-0">
      <div className="h-16 border-b flex items-center px-6">
        <span className="font-bold">Clinic Management</span>
      </div>
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center py-2 px-4 rounded-md hover:bg-muted transition-colors ${pathname === item.href ? 'bg-muted font-medium' : ''}`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
