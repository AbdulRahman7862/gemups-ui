import { Metadata } from "next";
import React from "react";
import ProfileSettingsPage from "./ProfileSettingsPage";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile information and security settings on this page.",
};

export default function Profile() {
  return (
    <div className="container-fluid mx-auto">
      <ProfileSettingsPage />
    </div>
  );
}
