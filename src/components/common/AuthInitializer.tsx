"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser, getUserDetail } from "@/store/user/actions";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";

// NOTE: getAuthToken and getUserUID now use localStorage instead of cookies.
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user.user);
  const [isHydrated, setIsHydrated] = useState(false);

  // Define public routes that don't require authentication
  const publicRoutes = ["/signin", "/signup", "/proxy", "/proxy/detail", "/forgot-password"];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only run after hydration to avoid SSR mismatch
    if (!isHydrated) return;
    console.log("DEBUG: AuthInitializer useEffect triggered");
    console.log("DEBUG: Current pathname:", pathname);
    console.log("DEBUG: Is public route:", isPublicRoute);
    
    const initializeAuth = async () => {
      const token = getAuthToken();
      const uid = getUserUID();
      
      console.log("DEBUG: AuthInitializer - Token exists:", !!token);
      console.log("DEBUG: AuthInitializer - UID exists:", !!uid);
      
      try {
        if (token) {
          console.log("DEBUG: AuthInitializer - Token found, skipping guest init");
          // TODO: Implement user profile fetch when endpoint is available
          // const result = await dispatch(getUserDetail());
          // if (getUserDetail.rejected.match(result)) {
          //   // Token is invalid or expired, clear token and redirect to login
          //   localStorage.removeItem("token");
          //   router.replace("/signin");
          //   return;
          // }
        } else if (!isPublicRoute) {
          console.log("DEBUG: AuthInitializer - No token, not public route - redirecting to signin");
          // No token - redirect to login only for non-public routes
          router.replace("/signin");
        } else {
          console.log("DEBUG: AuthInitializer - Public route, allowing access");
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
        // Only redirect to login on error if not on a public route
        if (!isPublicRoute) {
          router.replace("/signin");
        }
      }
    };

    initializeAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" || event.key === "user_uid") {
        initializeAuth();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch, router, pathname, isPublicRoute, isHydrated]);

  return <>{children}</>;
};

export default AuthInitializer;
