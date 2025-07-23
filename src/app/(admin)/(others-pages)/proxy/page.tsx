import Proxy from "@/components/proxy/Proxy";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Proxy",
  description: "This is  Proxy page of gemup",
};
export default function page() {
  return (
    <div>
      {/* <PageBreadcrumb pageTitle="Proxy" /> */}
      <Proxy />
    </div>
  );
}
