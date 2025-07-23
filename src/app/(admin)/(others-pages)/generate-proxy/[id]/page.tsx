import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import GenerateProxy from "@/components/generate-proxy/GenerateProxy";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Generate Proxy ",
  description: "This is  Generate Proxy page of gemup",
};

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Generate Proxy" noBreadcrumb />
      <GenerateProxy />
    </div>
  );
}
