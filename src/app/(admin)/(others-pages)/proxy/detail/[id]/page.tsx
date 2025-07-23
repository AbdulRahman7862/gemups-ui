"use client";
import React, { useEffect, useState } from "react";
import PaymentModal from "@/components/common/Modals/PaymentModal";
import shield from "../../../../../../../public/images/cards/proxy.png";
import Image from "next/image";
import { Check, ChevronRight, ClipboardList, Loader } from "lucide-react";
import OtherSellers from "@/components/common/Modals/OtherSellers";
import { addToCart, getCartByUser, updateCartItem } from "@/store/bookings/actions";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import {
  getOtherSellers,
  getProxyPricing,
  getSingleProxy,
} from "@/store/proxies/actions";
import { addUser } from "@/store/user/actions";
import { getAuthToken, getUserUID, setUserUID } from "@/utils/authCookies";
import { getOrCreateDeviceIdClient } from "@/utils/deviceId";
import { reviews } from "@/helpers/const";
import ReviewCard from "@/components/proxy/Reviews";
import PricingSelector from "@/components/proxy/PricingSelector";

const Page = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const { user } = useAppSelector((state) => state.user);
  const { cartItems, isOrderPaymentLoading, placingOrder } = useAppSelector(
    (state) => state.booking
  );
  const {
    selectedProxy,
    isLoading,
    otherSellers,
    fetchingOtherSellers,
    pricingPlans,
    fetchPricingPlans,
  } = useAppSelector((state) => state.proxy);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isOtherSellersOpen, setIsOtherSellersOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const [selectedTier, setSelectedTier] = useState<(typeof pricingPlans)[0]>(
    pricingPlans[0]
  );
  const [isCopied, setIsCopied] = useState(false);

  const handleTierSelect = (tier: any) => {
    setSelectedTier(tier);
    setQuantity(tier?.quantity);
  };

  const closePaymentModal = () => setIsPaymentModalOpen(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const calculateTotalPrice = () => {
    const sortedTiers = [...pricingPlans].sort((a, b) => a.quantity - b.quantity);

    let pricePerPc = sortedTiers[0]?.price;

    for (let i = 0; i < sortedTiers.length; i++) {
      if (quantity >= sortedTiers[i].quantity) {
        pricePerPc = sortedTiers[i].price;
      } else {
        break;
      }
    }

    return (quantity * pricePerPc).toFixed(2);
  };

  useEffect(() => {
    if (!id) return;
    dispatch(getSingleProxy(id));
    dispatch(getOtherSellers(id));
  }, [id, dispatch]);

  useEffect(() => {
    const providerId = otherSellers?.[0]?.id;
    if (!id || !providerId) return;
    dispatch(getProxyPricing({ proxyId: id, providerId }));
  }, [otherSellers]);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    dispatch(getCartByUser());
  }, [dispatch]);

  useEffect(() => {
    if (pricingPlans?.length > 0) {
      setSelectedTier(pricingPlans?.[0]);
    }
  }, [pricingPlans]);

  return (
    <div className="min-h-screen text-white px-4 sm:px-6 md:px-8">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader className="animate-spin text-[#13F195]" />
        </div>
      ) : (
        <div className="max-w-8xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-[#090E15] p-4 sm:p-6 rounded-2xl mb-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Image
                    src={selectedProxy?.image || shield}
                    alt="Proxy Icon"
                    className="w-12 h-12 rounded-full"
                    width={40}
                    height={40}
                  />
                  <div>
                    <h1 className="text-lg md:text-xl font-semibold mb-1">
                      {selectedProxy?.name}
                    </h1>
                    <p className="text-sm text-gray-400 mb-2">
                      {selectedProxy?.features?.join("+")}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedProxy?.tags?.map((tag: any) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-[#7BB9FF0D] text-[#7A8895] hover:bg-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center mt-2 gap-x-2 flex-wrap">
                      <span className="text-sm text-white font-semibold">
                        <span className="mr-1">★★★★★</span>0
                      </span>
                    </div>
                  </div>
                </div>
                <div className="self-start">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center whitespace-nowrap text-sm hover:text-green-300 bg-gray-800 px-3 py-1 rounded-lg transition-all"
                  >
                    {isCopied ? (
                      <>
                        <Check size={14} className="mr-1 text-green-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList size={14} className="mr-1" />
                        <div>Copy Link</div>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4">
              <div className="flex space-x-6 text-sm text-gray-400 mb-4 border-b border-[#1E293B] overflow-x-auto">
                {["overview", "reviews"]?.map((tab) => (
                  <span
                    key={tab}
                    onClick={() => setActiveTab(tab as "overview" | "reviews")}
                    className={`cursor-pointer pb-2 font-medium transition whitespace-nowrap ${
                      activeTab === tab
                        ? "text-[#13F195] border-b-2 border-[#13F195]"
                        : "hover:text-white"
                    }`}
                  >
                    {tab === "overview" ? "Overview" : "Reviews"}
                  </span>
                ))}
              </div>
              <div>
                {activeTab === "overview" ? (
                  <div className="bg-[#090E15] p-4 sm:p-6 rounded-xl">
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-sm text-gray-400">{selectedProxy?.description}</p>
                  </div>
                ) : (
                  <div className="mt-3 space-y-4">
                    {reviews.map((review, idx) => (
                      <ReviewCard key={idx} review={review} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 lg:mt-0">
            <PricingSelector
              productId={id as string}
              fetchPricingPlans={fetchPricingPlans}
              pricingPlans={pricingPlans}
              selectedTier={selectedTier}
              quantity={quantity}
              calculateTotalPrice={calculateTotalPrice}
              handleTierSelect={handleTierSelect}
              setQuantity={setQuantity}
              setIsPaymentModalOpen={setIsPaymentModalOpen}
              otherSellers={otherSellers}
            />
            <div
              className="bg-[#003b2e] p-4 rounded-xl flex items-center justify-between mt-3 text-white cursor-pointer"
              onClick={() => setIsOtherSellersOpen(true)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">🛡️</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Other sellers</p>
                  <p className="text-[#13F195] font-bold text-sm">From $0</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-[#13F195] bg-[#003b2e] text-sm font-semibold px-2 py-0.5 rounded-lg">
                  {otherSellers?.length || 0}
                </div>
                <ChevronRight size={18} className="text-[#13F195]" />
              </div>
            </div>
          </div>
        </div>
      )}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        productId={id as string}
        providerId={otherSellers?.[0]?.id}
        quantity={quantity}
        totalPrice={calculateTotalPrice()}
        loading={isOrderPaymentLoading || placingOrder}
      />
      <OtherSellers
        isOpen={isOtherSellersOpen}
        onClose={() => setIsOtherSellersOpen(false)}
        otherSellers={otherSellers}
        loading={fetchingOtherSellers}
      />
    </div>
  );
};

export default Page;
