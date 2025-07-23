import React from "react";
import { Metadata } from "next";
import UserProfile from "@/components/user-profile/UserProfile";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile information and security settings on this page.",
};

export default function Profile() {
  return (
    <div className="container-fluid mx-auto">
      <UserProfile />
    </div>
  );
}
