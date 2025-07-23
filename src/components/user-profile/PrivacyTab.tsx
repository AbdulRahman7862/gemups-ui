"use client";
import React, { useState } from "react";
import { Pencil } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import PasswordModal from "./PasswordModal";
import EmailModal from "./EmailModal";
import Link from "next/link";

const PrivacyTab = () => {
  const { user } = useAppSelector((state) => state.user);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const closeEmailModal = () => setIsEmailModalOpen(false);
  const closePasswordModal = () => setIsPasswordModalOpen(false);

  const openEmailModal = () => setIsEmailModalOpen(true);
  const openPasswordModal = () => setIsPasswordModalOpen(true);
  return (
    <>
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
          Privacy
        </h3>
        <div className="space-y-4">
          {/* General Settings */}

          <div className=" px-2 pb-3">
            <div className="mt-7">
              <div className="space-y-4">
                {/* <!-- Email --> */}
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        disabled
                        placeholder="Enter your email"
                        value={user?.email || ""}
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={openEmailModal}
                        className="flex items-center justify-center gap-2 rounded-lg border border-gray-700 p-3.5 text-xs sm:text-sm font-medium text-white bg-[#090e13] shadow-theme-xs"
                      >
                        <Pencil size={16} className="flex-shrink-0" />
                      </button>
                    </div>
                  </div>
                </div>
                {/* <!-- Password --> */}
                <div>
                  <button
                    type="button"
                    onClick={openPasswordModal}
                    className="flex items-center justify-center px-4 py-3 text-sm font-medium transition rounded-lg bg-[#13F195] shadow-theme-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change Password
                  </button>
                  <div className="flex items-center justify-between mt-2">
                    <Link href="#" className="text-xs sm:text-sm text-[#13F195]">
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <PasswordModal isOpen={isPasswordModalOpen} onClose={closePasswordModal} />
      )}
      {isEmailModalOpen && (
        <EmailModal isOpen={isEmailModalOpen} onClose={closeEmailModal} />
      )}
    </>
  );
};

export default PrivacyTab;
