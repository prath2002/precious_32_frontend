"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth/store";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="font-semibold text-lg">Briana Dental Clinic</div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-muted-foreground mr-2">
              {user.full_name} ({user.role})
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
