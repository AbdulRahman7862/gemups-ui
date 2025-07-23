import { Modal } from "@/components/ui/modal";
import {
  createPaymentOrder,
  getCartByUser,
  getOrdersByUser,
  placeOrder,
} from "@/store/bookings/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser, getUserBalance } from "@/store/user/actions";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";
import { getOrCreateDeviceIdClient } from "@/utils/deviceId";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface PaymentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  productId: string;
  providerId: string;
  quantity: number;
  totalPrice?: string;
  loading?: boolean;
  type?: string;
  orderId?: string;
  onSuccess?: () => void;
  currentPage?: number;
  activeTab?: string;
}

export default function PaymentModal({
  isOpen = true,
  onClose,
  productId,
  providerId,
  quantity,
  totalPrice,
  loading,
  type,
  orderId,
  onSuccess,
  currentPage,
  activeTab,
}: PaymentModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("cryptomus");
  const { walletBalance } = useAppSelector((state) => state.user);
  const [isProcessingGuest, setIsProcessingGuest] = useState(false);
  const handleCancel = () => {
    onClose?.();
    setSelectedMethod("cryptomus");
  };

  const handleGuestLogin = async () => {
    setIsProcessingGuest(true);
    try {
      let uid = getUserUID();
      if (!uid) {
        uid = getOrCreateDeviceIdClient();
        if (!uid) throw new Error("Failed to generate device ID");
      }

      const payload = { uid };
      const user = await dispatch(
        addUser({
          payload,
          onSuccess: () => {
            setUserUID(uid);
          },
        })
      ).unwrap();

      return user?.data;
    } catch (error) {
      console.error("Guest login failed:", error);
      toast.error("Failed to setup guest session");
      throw error;
    } finally {
      setIsProcessingGuest(false);
    }
  };

  const handlePayment = async () => {
    try {
      if (!productId || !quantity || !providerId) {
        toast.error("Missing order information.");
        return;
      }

      const token = getAuthToken();
      const userUID = getUserUID();

      if (!token && !userUID) {
        try {
          await handleGuestLogin();
        } catch (error) {
          console.error("Guest login failed:", error);
          return;
        }
      }

      if (selectedMethod === "cryptomus") {
        const orderPayload: any = {
          productId: Number(productId),
          currency: "USD",
          isOrder: true,
          quantity,
          type: type || "direct",
          providerId,
        };

        // Conditionally include oldOrderId if orderId exists
        if (orderId) {
          orderPayload.oldOrderId = orderId;
        }

        const result = await dispatch(createPaymentOrder(orderPayload)).unwrap();
        if (result?.data?.result?.url) {
          window.location.href = result.data.result.url;
        } else {
          throw new Error("Payment URL not found in response");
        }

        onClose?.();
        return;
      }

      if (selectedMethod === "balance") {
        const orderPayload: any = {
          productId: Number(productId),
          quantity: Number(quantity),
          type: type || "direct",
          providerId,
          paymentMethod: "wallet",
        };

        // Conditionally include orderId
        if (orderId) {
          orderPayload.orderId = orderId;
        }

        const result = await dispatch(placeOrder(orderPayload)).unwrap();

        if (result?.success) {
          toast.success("Order placed successfully via Balance.");
          dispatch(getUserBalance());
          dispatch(getCartByUser());
          onClose?.();
          setSelectedMethod("cryptomus");
          router.push("/purchases");

          if (type === "cart") {
            dispatch(getCartByUser());
          }
          if (orderId) {
            await dispatch(
              getOrdersByUser({
                page: currentPage,
                limit: 10,
                type: activeTab,
              })
            );
            onSuccess?.();
          }
        } else {
          throw new Error("Failed to place order using balance");
        }

        return;
      }
    } catch (error: any) {
      console.error(error?.message || "Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const token = getAuthToken();
    if (!token) return;
    dispatch(getUserBalance());
  }, [dispatch, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      className="max-w-[700px] bg-[#090E15] p-6 rounded-xl z-100"
    >
      <h4 className="font-bold text-white text-[24px] mb-6">Payment</h4>
      <p className="text-white mb-6">
        You are going to pay <span className="font-semibold">{totalPrice}$</span>
      </p>
      <div className="flex flex-col gap-4 mb-6">
        <div className="grid md:grid-cols-4 grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedMethod("cryptomus")}
            className={`flex items-center gap-4 p-4 rounded-lg transition ${
              selectedMethod === "cryptomus"
                ? "border-[#13F195] border-2"
                : "bg-[#1E2836] hover:bg-[#2C3A4D]"
            }`}
          >
            <div className="flex-1 text-left">
              <h6
                className={
                  selectedMethod === "cryptomus" ? "text-white" : "text-[#7A8895]"
                }
              >
                Cryptomus
              </h6>
            </div>
          </button>
          <button
            disabled={Number(walletBalance) === 0}
            onClick={() => {
              setSelectedMethod("balance");
              if (Number(walletBalance) < Number(totalPrice)) {
                toast.error("Not enough balance for this purchase.");
              }
            }}
            className={`flex items-center gap-4 p-4 rounded-lg transition relative ${
              selectedMethod === "balance"
                ? "border-[#13F195] border-2"
                : "bg-[#1E2836] hover:bg-[#2C3A4D]"
            } ${Number(walletBalance) === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex-1 text-left">
              <h6
                className={selectedMethod === "balance" ? "text-white" : "text-[#7A8895]"}
              >
                Balance
              </h6>
            </div>
            {Number(walletBalance) === 0 && (
              <span className="absolute top-[-10px] right-0 bg-red-400 text-black text-xs px-2 py-0.5 rounded-full">
                Not enough balance
              </span>
            )}
          </button>
          {/* Disabled payment methods */}
          {[
            { name: "CustomPay", comingSoon: true },
            { name: "Stripe (Card)", comingSoon: true },
          ].map(({ name }) => (
            <button
              key={name}
              disabled
              className="flex items-center gap-4 p-4 bg-[#1E2836] rounded-lg opacity-50 relative"
            >
              <div className="flex-1 text-left">
                <h6 className="text-[#7A8895]">{name}</h6>
              </div>
              <span className="absolute top-[-10px] right-0 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            </button>
          ))}
        </div>
        <div className="text-white mt-4">
          <span>Total:</span>{" "}
          <span className="font-semibold text-[#13F195] text-xl">{totalPrice}$</span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <button
          onClick={handleCancel}
          className="flex-1 py-3 bg-[#1E2836] text-[#7A8895] rounded-lg font-medium hover:bg-[#2C3A4D] transition"
        >
          Cancel
        </button>
        <button
          onClick={handlePayment}
          disabled={
            loading ||
            isProcessingGuest ||
            (Number(walletBalance) < Number(totalPrice) && selectedMethod === "balance")
          }
          aria-busy={loading}
          className={`flex-1 py-3 bg-[#13F195] text-black font-semibold rounded-lg hover:bg-[#0ddb7f] transition flex items-center justify-center gap-2 ${
            loading ||
            isProcessingGuest ||
            (Number(walletBalance) < Number(totalPrice) && selectedMethod === "balance")
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {loading || isProcessingGuest ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            "Proceed to the Payment"
          )}
        </button>
      </div>
    </Modal>
  );
}
