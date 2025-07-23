"use client";
import React, { useState } from "react";
import Image from "next/image";
import UpdateProfileModal from "./UpdateProfileModal";
import { Pencil } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import { toast } from "react-toastify";

export default function UserInfoCard() {
  const { user } = useAppSelector((state) => state.user);
  const { isAuthenticated } = useAuthStatus();
  const [profileModal, setProfileModal] = useState(false);

  const openModal = () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to modify your profile details");
      return;
    }
    setProfileModal(true);
  };

  const closeModal = () => {
    setProfileModal(false);
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="flex items-center justify-center sm:justify-start w-full my-4">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              {user?.image ? (
                <Image
                  width={80}
                  height={80}
                  src={user.image}
                  alt="user profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.9998 13C14.7612 13 16.9998 10.7614 16.9998 8C16.9998 5.23858 14.7612 3 11.9998 3C9.23833 3 6.99976 5.23858 6.99976 8C6.99976 10.7614 9.23833 13 11.9998 13Z"
                    fill="#13F195"
                  />
                  <path
                    d="M21.8 18.0992C20.9 16.2992 19.2 14.7992 17 13.8992C16.4 13.6992 15.7 13.6992 15.2 13.9992C14.2 14.5992 13.2 14.8992 12 14.8992C10.8 14.8992 9.79997 14.5992 8.79997 13.9992C8.29997 13.7992 7.59997 13.6992 6.99997 13.9992C4.79997 14.8992 3.09997 16.3992 2.19997 18.1992C1.49997 19.4992 2.59997 20.9992 4.09997 20.9992H19.9C21.4 20.9992 22.5 19.4992 21.8 18.0992Z"
                    fill="#13F195"
                  />
                </svg>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name || "Guest"}
              </p>
            </div>

            {user?.email && (
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Email address
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.email || "Guest"}
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      <UpdateProfileModal isOpen={profileModal} onClose={closeModal} />
    </div>
  );
}
