"use client";
import React, { useEffect, useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/user/userSlice";
import { useAuthStatus } from "@/hooks/useAuthStatus";
import Image from "next/image";
import PaymentBalanceModal from "../common/Modals/PaymentBalanceModal";
import { createPayment } from "@/store/bookings/actions";
import { toast } from "react-toastify";
import { initiateWalletDeposit, initiateGuestWalletDeposit } from "@/store/user/actions";
import { getUserBalance } from "@/store/user/actions";

export default function UserDropdown() {
  const dispatch = useAppDispatch();
  const { user, walletBalance } = useAppSelector((state) => state.user);
  const { isCreatePaymentLoading } = useAppSelector((state) => state.booking);
  const { isAuthenticated, isGuest } = useAuthStatus();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);


  // useEffect(() => {
  //   const checkPendingDeposit = async () => {
  //     const orderId = localStorage.getItem("walletDepositOrderId");
  //     if (!orderId) return;
  //     try {
  //       const result = await dispatch(
  //         checkWalletDepositStatus({ orderId })
  //       ).unwrap();
  //       if (result.balanceCredited) {
  //         dispatch(getUserBalance());
  //         localStorage.removeItem("walletDepositOrderId");
  //         toast.success(result.message);
  //       } else if (!result.success) {
  //         localStorage.removeItem("walletDepositOrderId");
  //         toast.error(result.message);
  //       }
  //       // If pending, do nothing (could poll if desired)
  //     } catch (error) {
  //       // Optionally handle error
  //     }
  //   };
  //   checkPendingDeposit();
  // }, [dispatch]);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  function handleLogout() {
    dispatch(logoutUser());

    // Check if user is a guest user
    if (user?.isGuest) {
      // Guest users stay on the same page without guest session
      // No redirect needed - they'll see the page without guest privileges
    } else {
      // Regular users redirect to proxy page
      router.push("/proxy");
    }
  }

  const handleOpenBalanceModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBalanceModalOpen(true);
  };

  const handlePayment = async (amount: number, method: string) => {
    if (!user) {
      toast.error("Please sign in to make a payment");
      return;
    }
    setDepositLoading(true);
    try {
      // Check if user is a guest user
      const isGuestUser = user?.isGuest === true;
      
      const result = await dispatch(
        isGuestUser 
          ? initiateGuestWalletDeposit({ amount })
          : initiateWalletDeposit({ amount })
      ).unwrap();

      if (result?.paymentUrl && result?.order_id) {
        localStorage.setItem("walletDepositOrderId", result.order_id);
        window.location.href = result.paymentUrl;
      } else {
        throw new Error("Payment URL or order_id not found in response");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to initiate payment");
    } finally {
      setDepositLoading(false);
    }
  };



  return (
    <>
      <div className="flex items-center gap-4 bg-[#0A0F15] px-4 py-2 rounded-full text-white text-sm">
        <div className="hidden sm:block">
          <div className="flex items-center gap-1 cursor-pointer">
            <span className="font-medium">EN</span>
            <svg
              width="7"
              height="6"
              viewBox="0 0 7 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.5 5.5L6.53109 0.25H0.468911L3.5 5.5Z" fill="#273242" />
            </svg>
          </div>
        </div>
        <button
          className="flex items-center gap-1 text-[#13F195] font-semibold focus:outline-none"
          onClick={handleOpenBalanceModal}
          style={{ background: "none", border: "none", padding: 0, margin: 0 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.0007 6H15.0007C13.4094 6 11.8833 6.63214 10.7581 7.75736C9.63287 8.88258 9.00073 10.4087 9.00073 12C9.00073 13.5913 9.63287 15.1174 10.7581 16.2426C11.8833 17.3679 13.4094 18 15.0007 18H22.0007V20C22.0007 20.2652 21.8954 20.5196 21.7078 20.7071C21.5203 20.8946 21.2659 21 21.0007 21H3.00073C2.73552 21 2.48116 20.8946 2.29363 20.7071C2.10609 20.5196 2.00073 20.2652 2.00073 20V4C2.00073 3.73478 2.10609 3.48043 2.29363 3.29289C2.48116 3.10536 2.73552 3 3.00073 3H21.0007C21.2659 3 21.5203 3.10536 21.7078 3.29289C21.8954 3.48043 22.0007 3.73478 22.0007 4V6ZM15.0007 8H23.0007V16H15.0007C13.9399 16 12.9225 15.5786 12.1723 14.8284C11.4222 14.0783 11.0007 13.0609 11.0007 12C11.0007 10.9391 11.4222 9.92172 12.1723 9.17157C12.9225 8.42143 13.9399 8 15.0007 8ZM15.0007 11V13H18.0007V11H15.0007Z"
              fill="#13F195"
            />
          </svg>
          <span>{walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}$</span>
        </button>
        <div className="relative">
          <button onClick={toggleDropdown} className="flex items-center gap-1 text-white">
            {user?.image ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-800">
                <Image
                  width={40}
                  height={40}
                  src={user?.image}
                  alt="User profile"
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <svg
                width="24"
                height="24"
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
            <span className="text-[16px] hidden sm:block whitespace-nowrap">
              {user?.email || "Guest"}
            </span>
            <svg
              width="7"
              height="6"
              viewBox="0 0 7 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.5 5.5L6.53109 0.25H0.468911L3.5 5.5Z" fill="#273242" />
            </svg>
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="absolute left-[-80px] w-52 lg:w-52 rounded-2xl !bg-[#090e15] p-2 shadow-lg z-50"
          >
            {(isAuthenticated || isGuest) && (
              <ul className="space-y-1">
                <li>
                  <DropdownItem
                    tag="a"
                    href="/profile"
                    onItemClick={closeDropdown}
                    className="rounded-md flex items-center gap-2 text-[#7A8895] hover:bg-[#101922] group"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#7A8895] group-hover:text-[#13F195]"
                    >
                      <path
                        d="M11.9998 13C14.7612 13 16.9998 10.7614 16.9998 8C16.9998 5.23858 14.7612 3 11.9998 3C9.23833 3 6.99976 5.23858 6.99976 8C6.99976 10.7614 9.23833 13 11.9998 13Z"
                        fill="currentColor"
                      />
                      <path
                        d="M21.8 18.0992C20.9 16.2992 19.2 14.7992 17 13.8992C16.4 13.6992 15.7 13.6992 15.2 13.9992C14.2 14.5992 13.2 14.8992 12 14.8992C10.8 14.8992 9.79997 14.5992 8.79997 13.9992C8.29997 13.7992 7.59997 13.6992 6.99997 13.9992C4.79997 14.8992 3.09997 16.3992 2.19997 18.1992C1.49997 19.4992 2.59997 20.9992 4.09997 20.9992H19.9C21.4 20.9992 22.5 19.4992 21.8 18.0992Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="group-hover:text-white">My Profile</span>
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    tag="a"
                    href="/purchases"
                    onItemClick={() => {
                      closeDropdown();
                      router.push("/purchases");
                    }}
                    className="rounded-md flex items-center gap-2 text-[#7A8895] hover:bg-[#101922] hover:text-[#13F195] group"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-[#7A8895] group-hover:text-[#13F195]"
                    >
                      <path
                        d="M14 4H12C12 1.79 10.21 0 8 0C5.79 0 4 1.79 4 4H2C0.9 4 0 4.9 0 6V18C0 19.1 0.9 20 2 20H14C15.1 20 16 19.1 16 18V6C16 4.9 15.1 4 14 4ZM8 2C9.1 2 10 2.9 10 4H6C6 2.9 6.9 2 8 2ZM14 18H2V6H4V8C4 8.55 4.45 9 5 9C5.55 9 6 8.55 6 8V6H10V8C10 8.55 10.45 9 11 9C11.55 9 12 8.55 12 8V6H14V18Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="group-hover:text-white">My Purchases</span>
                  </DropdownItem>
                </li>
                <li>
                  <DropdownItem
                    onClick={handleLogout}
                    className="rounded-md flex items-center gap-2 text-[#F11313] hover:bg-[rgba(241,19,19,0.10)]"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.09 12.59L8.5 14L13.5 9L8.5 4L7.09 5.41L9.67 8H0V10H9.67L7.09 12.59ZM16 0H2C0.89 0 0 0.9 0 2V6H2V2H16V16H2V12H0V16C0 17.1 0.89 18 2 18H16C17.1 18 18 17.1 18 16V2C18 0.9 17.1 0 16 0Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="ml-1">Logout</span>
                  </DropdownItem>
                </li>
              </ul>
            )}
          </Dropdown>
        </div>
      </div>
      {isBalanceModalOpen && (
        <PaymentBalanceModal
          isOpen={isBalanceModalOpen}
          onClose={() => setIsBalanceModalOpen(false)}
          onProceed={handlePayment}
          loading={depositLoading}
        />
      )}
    </>
  );
}
