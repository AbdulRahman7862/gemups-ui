"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { ConvertGuestUserModal } from "@/components/auth/ConvertGuestUserModal";

export const GuestUserBanner: React.FC = () => {
  const { user } = useAppSelector((state) => state.user);
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Only show banner for guest users
  if (!user?.isGuest) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Guest Mode</h3>
              <p className="text-xs opacity-90">
                You&apos;re using the app as a guest. Convert to a regular account to save your data permanently. You only need to provide email and password.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowConvertModal(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Convert Account
          </button>
        </div>
      </div>

      <ConvertGuestUserModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onSuccess={() => setShowConvertModal(false)}
      />
    </>
  );
}; 