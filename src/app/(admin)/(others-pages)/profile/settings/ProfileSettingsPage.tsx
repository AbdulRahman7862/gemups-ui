"use client";
import React from "react";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import ProfileSettings from "@/components/user-profile/ProfileSettings";
import ProfileSettingsGuest from "@/components/user-profile/ProfileSettingsGuest";

const ProfileSettingsPage = () => {
  const { isGuest, isAuthenticated } = useAuthStatus();
  return (
    <>
      {isAuthenticated && <ProfileSettings />}
      {isGuest && <ProfileSettingsGuest />}
    </>
  );
};

export default ProfileSettingsPage;
