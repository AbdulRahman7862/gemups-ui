"use client";

import { useEffect, useState } from "react";
import { getAuthToken, getUserUID, hasUserLoggedOut } from "@/utils/authCookies";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetUserSlice } from "@/store/user/userSlice";
import { resetBookingSlice } from "@/store/bookings/bookingSlice";

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      const userUID = getUserUID();
      const userHasLoggedOut = hasUserLoggedOut();

      const hasToken = !!token;

      // If user has explicitly logged out, show login/signup buttons
      if (userHasLoggedOut) {
        dispatch(resetUserSlice());
        dispatch(resetBookingSlice());
        setIsAuthenticated(false);
        setIsGuest(false);
        setIsLoading(false);
        return;
      }

      // Only log out if token is missing from localStorage
      if (!hasToken) {
        dispatch(resetUserSlice());
        dispatch(resetBookingSlice());
        setIsAuthenticated(false);
        setIsGuest(false);
        setIsLoading(false);
        return;
      }

      // If token exists, user is authenticated (even if Redux user is empty)
      const isGuestUser = hasToken && user?.isGuest === true;
      const isAuthenticatedUser = hasToken && (user?.isGuest === undefined || user?.isGuest === false);

      setIsAuthenticated(isAuthenticatedUser);
      setIsGuest(isGuestUser);
      setIsLoading(false);
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (like login/logout in other tabs)
    const handleStorageChange = () => checkAuth();
    window.addEventListener("storage", handleStorageChange);

    // Polling as fallback (optional)
    const interval = setInterval(checkAuth, 30000); // 30s

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user, dispatch]);

  return { isAuthenticated, isLoading, isGuest };
}
