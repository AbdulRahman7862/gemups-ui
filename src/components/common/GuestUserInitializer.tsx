"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { initializeGuestUserAction } from "@/store/user/actions";
import { getAuthToken } from "@/utils/authCookies";

interface GuestUserInitializerProps {
  children: React.ReactNode;
}

export const GuestUserInitializer: React.FC<GuestUserInitializerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.user);

  useEffect(() => {
    const initializeGuest = async () => {
      const token = getAuthToken();
      
      // Only initialize guest user if no token exists and no user is loaded
      if (!token && !user && !isLoading) {
        try {
          await dispatch(initializeGuestUserAction({}));
        } catch (error) {
          console.error("Failed to initialize guest user:", error);
        }
      }
    };

    initializeGuest();
  }, [dispatch, user, isLoading]);

  return <>{children}</>;
}; 