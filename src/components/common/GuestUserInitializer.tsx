"use client";

import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeGuestUserAction } from "@/store/user/actions";
import { getAuthToken, hasUserLoggedOut } from "@/utils/authCookies";
import { usePathname } from "next/navigation";

interface GuestUserInitializerProps {
  children: React.ReactNode;
}

export const GuestUserInitializer: React.FC<GuestUserInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const isLoggingOutRef = useRef(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Only run after hydration to avoid SSR mismatch
    if (!isHydrated) return;
    
    // Check if we're in the process of logging out
    const userHasLoggedOut = hasUserLoggedOut();
    if (userHasLoggedOut && !isLoggingOutRef.current) {
      isLoggingOutRef.current = true;
    }
    
    const initializeGuest = async () => {
      const token = getAuthToken();
      const userHasLoggedOut = hasUserLoggedOut();
      
      // Define routes where guest user initialization should happen
      const guestInitRoutes = ["/proxy", "/proxy/detail"];
      const authRoutes = ["/signin", "/signup"];
      
      const isGuestInitRoute = guestInitRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );
      const isAuthRoute = authRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );
      
      // Never initialize guest user on auth routes
      if (isAuthRoute) {
        return;
      }
      
      // Only initialize guest user on specific routes
      if (!isGuestInitRoute) {
        return;
      }
      
      // If user has explicitly logged out, clear the flag and allow guest initialization
      // Only do this on guest init routes, not on auth routes
      if (userHasLoggedOut && isGuestInitRoute) {
        // Clear the logout flag to allow guest user initialization
        localStorage.removeItem("userLoggedOut");
        isLoggingOutRef.current = false;
      }
      
      // Don't initialize guest user if we're in the process of logging out
      if (isLoggingOutRef.current) {
        return;
      }
      
      // Initialize guest user if no token exists and no user is loaded
      if (!token && !user && !isLoading) {
        try {
          await dispatch(initializeGuestUserAction({ showToast: false }));
        } catch (error) {
          console.error("Failed to initialize guest user:", error);
        }
      }
      // If token exists but user is null (user not found), initialize guest user
      else if (token && !user && !isLoading) {
        try {
          await dispatch(initializeGuestUserAction({ showToast: false }));
        } catch (error) {
          console.error("Failed to initialize guest user:", error);
        }
      }
    };

    initializeGuest();
  }, [dispatch, user, isLoading, pathname, isHydrated]);

  return <>{children}</>;
}; 