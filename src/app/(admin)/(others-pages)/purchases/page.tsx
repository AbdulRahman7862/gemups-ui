import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import MyPurchases from "@/components/purchases/MyPurchases";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "My Purchases ",
  description: "Manage your purchases on this page.",
};
export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Purchases" noBreadcrumb />
      <MyPurchases />
    </div>
  );
}
