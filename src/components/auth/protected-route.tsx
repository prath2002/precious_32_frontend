"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth/store";
import { UserRole } from "@/lib/auth/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, token, getUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Load remember me preference
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(remembered);

    // If we have a token but don't want to be remembered and not on login page
    // Only do this when the component first mounts, not on every pathname change
    if (token && !remembered && pathname !== '/login') {
      console.log('Not remembering session, logging out');
      logout();
      router.push('/login');
    }
  }, [token, logout, router]); // Removed pathname dependency to prevent logout loops

  // Add debugging to track auth state
  useEffect(() => {
    console.log("ProtectedRoute auth state:", {
      isAuthenticated,
      hasToken: !!token,
      hasUser: !!user,
      pathname,
      userRole: user?.role,
      rememberMe
    });
  }, [isAuthenticated, token, user, pathname, rememberMe]);

  useEffect(() => {
    // If we have a token but no user, try to get the user info
    if (token && !user) {
      console.log("Getting user info with token");
      getUser();
    }

    // If not authenticated, redirect to login
    if (!token && pathname !== "/login") {
      console.log("Not authenticated, redirecting to login");
      router.push("/login");
    }

    // If authenticated but not authorized for this route
    if (
      user &&
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user.role)
    ) {
      console.log("User not authorized for this route, redirecting to home");
      router.push("/");
    }

    // If on login page and already authenticated, redirect to home
    if (isAuthenticated && pathname === "/login") {
      console.log("Already authenticated on login page, redirecting to home");
      router.push("/");
    }
  }, [token, user, isAuthenticated, pathname, router, getUser, allowedRoles]);

  // If we're on the login page and authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated && pathname === "/login") {
      console.log("Already authenticated on login page, redirecting to home");
      router.push("/");
    }
  }, [isAuthenticated, pathname, router]);

  // Show nothing while checking authentication or redirecting from login
  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  // Also show nothing when authenticated on login page (while redirecting)
  if (isAuthenticated && pathname === "/login") {
    return null;
  }

  return <>{children}</>;
}
