"use client";
import React, { useState } from "react";
import Tabs from "../common/Tabs";
import { MoveLeft, ShieldX } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import PrivacyTab from "./PrivacyTab";
import GeneralTab from "./GeneralTab";
import { useRouter } from "next/navigation";

const ProfileSettings = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading } = useAppSelector((state) => state.user);

  const [activeTab, setActiveTab] = useState("General");

  const tabs = ["General", "Privacy"];

  return (
    <div className="space-y-6 py-2">
      <div>
        <button
          onClick={() => {
            router.back();
          }}
          type="button"
          className="flex items-center text-sm font-medium text-[#13F195] hover:opacity-90 transition-colors"
        >
          <MoveLeft size={14} className="mr-1" />
          <span>Back</span>
        </button>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Unverified Seller Banner */}
      <div className="bg-[#35310a] rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-[#5c540c] rounded-full flex items-center justify-center flex-shrink-0">
            <ShieldX size={18} className="text-[#f1d713]" />
          </div>
          <div>
            <h3 className="text-white font-medium mb-1 sm:mb-2">Unverified Seller</h3>
            <p className="text-[#7a8895] text-sm">
              To show your products to buyers visit yourself. Currently your products can
              be seen only via direct links.
            </p>
          </div>
        </div>
        <button className="text-[#f1d713] hover:opacity-90 underline text-sm font-medium transition-colors self-start sm:self-center whitespace-nowrap">
          Get Verification
        </button>
      </div>

      {/* Profile Settings General */}
      {activeTab === "General" && <GeneralTab />}
      {/* Profile Settings Privacy */}
      {activeTab === "Privacy" && <PrivacyTab />}
    </div>
  );
};

export default ProfileSettings;
