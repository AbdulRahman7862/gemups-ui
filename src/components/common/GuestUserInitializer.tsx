"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeGuestUserAction } from "@/store/user/actions";
import { getAuthToken, hasUserLoggedOut, getUserUID } from "@/utils/authCookies";
import { usePathname } from "next/navigation";

interface GuestUserInitializerProps {
  children: React.ReactNode;
}

export const GuestUserInitializer: React.FC<GuestUserInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);
  const pathname = usePathname();

  useEffect(() => {
    const initializeGuest = async () => {
      const token = getAuthToken();
      const userUID = getUserUID();
      const userHasLoggedOut = hasUserLoggedOut();
      
      // Don't initialize guest user if user has explicitly logged out
      if (userHasLoggedOut) {
        console.log("DEBUG: User has logged out, not initializing guest user");
        return;
      }
      
      // Define routes where guest user initialization should happen
      const guestInitRoutes = ["/proxy", "/proxy/detail"];
      const isGuestInitRoute = guestInitRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );
      
      // Only initialize guest user on specific routes
      if (!isGuestInitRoute) {
        return;
      }
      
      // Initialize guest user if no token exists and no user is loaded
      if (!token && !user && !isLoading) {
        try {
          console.log("DEBUG: No token found, initializing guest user");
          console.log("DEBUG: User UID from localStorage:", userUID);
          await dispatch(initializeGuestUserAction({}));
        } catch (error) {
          console.error("Failed to initialize guest user:", error);
        }
      }
      // If token exists but user is null (user not found), initialize guest user
      else if (token && !user && !isLoading) {
        try {
          console.log("DEBUG: Token exists but user not found, initializing guest user");
          console.log("DEBUG: User UID from localStorage:", userUID);
          await dispatch(initializeGuestUserAction({}));
        } catch (error) {
          console.error("Failed to initialize guest user:", error);
        }
      }
    };

    initializeGuest();
  }, [dispatch, user, isLoading, pathname]);

  return <>{children}</>;
}; 