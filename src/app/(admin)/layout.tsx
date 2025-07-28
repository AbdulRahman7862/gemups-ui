"use client";

import Disclaimer from "@/components/common/Disclaimer";
import { useSidebar } from "@/context/SidebarContext";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { resetBookingSlice } from "@/store/bookings/bookingSlice";
import { useAppDispatch } from "@/store/hooks";
import { resetUserSlice } from "@/store/user/userSlice";
import { getAuthToken } from "@/utils/authCookies";
import React, { useEffect } from "react";
import { GuestUserBanner } from "@/components/common/GuestUserBanner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isGuest } = useAuthStatus();
  const dispatch = useAppDispatch();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      dispatch(resetUserSlice());
      dispatch(resetBookingSlice());
    }
  }, []);

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Guest User Banner */}
        <GuestUserBanner />
        {/* Disclaimer */}
        {isGuest && (
          <Disclaimer message="Please add your username, email, and password so you don&apos;t lose your data." />
        )}
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
