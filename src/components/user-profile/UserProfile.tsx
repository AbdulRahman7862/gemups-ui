"use client";
import { Loader, Pencil, Plus, ShieldX } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Tabs from "../common/Tabs";
import { useRouter } from "next/navigation";
import Pagination from "../common/Pagination";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import ProxyCard from "../proxy/ProxyCard";
import { getProxies } from "@/store/proxies/actions";
import NoProductCard from "./NoProductCard";

const UserProfile = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.user);
  const { proxies, fetchingProxies } = useAppSelector((state) => state.proxy);
  const [activeTab, setActiveTab] = useState("Offers");
  const [currentPage, setCurrentPage] = useState(1);
  const tabs = ["Offers", "Info"];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!proxies || proxies.length === 0) {
      dispatch(getProxies());
    }
  }, [dispatch, proxies]);
  return (
    <div className="space-y-6 py-2">
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

      {/* Banner Preview */}
      <div className="relative w-full aspect-[3/1] bg-gradient-to-r from-blue-400 to-green-400 rounded-lg overflow-hidden">
        <Image
          src={user?.banner || "/images/defaultBanner.png"}
          alt="Banner"
          fill
          className="object-cover"
        />

        {/* Edit Button on Top-Right */}
        <button
          onClick={() => {
            router.push("/profile/settings");
          }}
          className="absolute top-3 right-3 flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#3f738c] shadow-theme-xs"
        >
          <Pencil size={16} className="flex-shrink-0" />
          <span className="hidden sm:inline-block">Edit Profile</span>
        </button>
      </div>

      {/* Change Profile Picture Section */}
      <div className="bg-[#090e15] rounded-lg p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            {true ? (
              <Image
                width={80}
                height={80}
                src={"/images/cards/proxy.png"}
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
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-white text-base sm:text-lg font-medium mb-1">Tele GO</h2>
            <div className=" text-xs sm:text-sm mb-1">
              <span className="text-[#7A8895]">Insurance balance:</span>
              <span className="text-[#13F195] ml-1">100 000 ₽</span>
            </div>
            <div className=" text-xs sm:text-sm">
              <span className="text-[#13F195]">★★★★★</span>
              <span className="text-[#7A8895] ml-1">5/5</span>
              <span className="text-[#7A8895] ml-1">242523 Sales</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-white bg-[#141f2c] shadow-theme-xs">
              <Plus size={18} className="flex-shrink-0 text-[#13F195]" />
              <span>Add Offer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Offers Tab */}
      {activeTab === "Offers" && (
        <div className="space-y-10">
          {/* Popular Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
              Popular
            </h3>

            {fetchingProxies ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-[#13F195]" />
              </div>
            ) : proxies?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proxies.map((proxy, index) => (
                  <ProxyCard key={index} proxy={proxy} index={index} />
                ))}
              </div>
            ) : (
              <NoProductCard />
            )}
          </div>
          {/* All Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
              All
            </h3>
            {fetchingProxies ? (
              <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin text-[#13F195]" />
              </div>
            ) : proxies?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proxies.map((proxy, index) => (
                  <ProxyCard key={index} proxy={proxy} index={index} />
                ))}
              </div>
            ) : (
              <NoProductCard />
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={100}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}

      {/* Info Tab */}
      {activeTab === "Info" && (
        <div className="space-y-4">
          {/* Description Section */}
          <div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
                Description
              </h3>

              <div>
                <p className="text-[#7A8895] text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod
                  est quis
                </p>
              </div>
            </div>
          </div>
          {/* Reviwes Section */}
          <div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4 lg:mb-6">
                Reviews
              </h3>
            </div>

            {/* Average Review Card */}
            <div className="bg-[#090e15] rounded-lg p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-white text-base sm:text-lg font-medium mb-1">
                    Average Seller Rate 5 (289)
                  </h2>
                  <div className=" text-xs sm:text-sm mb-1">
                    <span className="text-[#7A8895]">5.0</span>
                    <span className="text-[#13F195] ml-1">★★★★★</span>
                  </div>
                  <div className=" text-xs sm:text-sm">
                    <span className="text-[#7A8895]">
                      To provide a feedback about the seller, you must buy this product on
                      $10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div>
              <div className="mt-2 space-y-4">
                {[
                  {
                    user: "James",
                    comment: "The mails are good. I recommend them.",
                    rating: 5,
                    title: "GMAIL TRUST NUMBER CONFIRMED SUBMAIL BEST ACCOUNT",
                    date: "10/9/2024, 4:04:30 PM",
                  },
                  {
                    user: "James",
                    comment: "The mails are good. I recommend them.",
                    rating: 4,
                    title: "GMAIL TRUST NUMBER CONFIRMED SUBMAIL BEST ACCOUNT",
                    date: "10/9/2024, 4:04:30 PM",
                  },
                ].map((review, idx) => (
                  <div key={idx} className="bg-[#0E1118] p-4 rounded-lg text-white">
                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-3">
                      <div className="w-16 h-16 rounded-full bg-[#10141F] flex items-center justify-center shrink-0">
                        <Image
                          src={"/images/cards/proxy.png"}
                          alt="shield"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <span className="font-semibold text-sm">{review.user}</span>
                          <div className="flex items-center gap-1 text-[#13F195] text-sm font-semibold mt-1 sm:mt-0">
                            {review.rating.toFixed(1)}
                            <span className="text-[#13F195]">
                              {"★".repeat(review.rating)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1">
                          <div className="text-[16px] text-[#7A8895] uppercase font-medium tracking-wide">
                            {review.title}
                          </div>
                          <div className="text-xs text-[#7A8895] mt-1 sm:mt-0">
                            {review.date}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm text-gray-400">Comment:</span>
                          <p className="text-sm text-[#7A8895] mt-1">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={100}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
