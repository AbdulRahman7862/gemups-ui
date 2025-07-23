import { Modal } from "@/components/ui/modal";
import React, { useState } from "react";

interface PaymentBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed?: (amount: number, method: string) => void;
  loading?: boolean;
  initialAmount?: number;
}

const PAYMENT_METHODS = [
  { key: "cryptomus", label: "Cryptomus" },
  { key: "custompay", label: "CustomPay", comingSoon: true },
  { key: "stripe", label: "Stripe(Card)", comingSoon: true },
];

const AMOUNT_OPTIONS = [10, 20, 50, 100];

const PaymentBalanceModal: React.FC<PaymentBalanceModalProps> = ({
  isOpen,
  onClose,
  onProceed,
  loading,
  initialAmount = 10,
}) => {
  const [selectedMethod, setSelectedMethod] = useState("cryptomus");
  const [amount, setAmount] = useState(initialAmount || 10);

  const handleMethodSelect = (method: string) => {
    // Don't allow selection of coming soon methods
    const methodData = PAYMENT_METHODS.find((m) => m.key === method);
    if (!methodData?.comingSoon) {
      setSelectedMethod(method);
    }
  };

  const handleAmountSelect = (amt: number) => {
    setAmount(amt);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setAmount(isNaN(val) ? 0 : val);
  };

  const handleProceed = () => {
    if (onProceed && amount > 0) onProceed(amount, selectedMethod);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[420px] bg-[#090E15] p-6 rounded-xl"
    >
      <h4 className="font-bold text-white text-2xl mb-6">Deposit</h4>
      {/* Payment Methods */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.key}
            type="button"
            onClick={() => handleMethodSelect(method.key)}
            className={`px-3 py-2 rounded-md text-base font-medium transition-colors
        flex items-center justify-center sm:justify-start relative
              ${
                selectedMethod === method.key
                  ? "bg-[#18432e] text-[#13F195]"
                  : method.comingSoon
                  ? "bg-[#1E2836]/50 text-[#7A8895]/50 cursor-not-allowed"
                  : "bg-[#1E2836] text-[#7A8895] hover:bg-[#2C3A4D]"
              }
            `}
            aria-pressed={selectedMethod === method.key}
          >
            {method.label}
            {method.comingSoon && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[10px] px-1 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Amount Selection */}
      <div className="mb-3 sm:mb-4">
        <div className="text-white mb-2">For payment:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
          {AMOUNT_OPTIONS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleAmountSelect(amt)}
              className={`px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center justify-center
                ${
                  amount === amt
                    ? "bg-[#18432e] text-[#13F195]"
                    : "bg-[#1E2836] text-[#7A8895] hover:bg-[#2C3A4D]"
                }
              `}
              aria-pressed={amount === amt}
            >
              {amt} $
            </button>
          ))}
        </div>

        {/* Custom Amount Input */}
        <label htmlFor="amount-input" className="text-white text-sm mb-1 block">
          Your amount
        </label>
        <input
          id="amount-input"
          type="number"
          min={1}
          value={amount}
          onChange={handleInputChange}
          className="w-full py-2 px-3 rounded-md bg-[#1E2836] text-white text-lg outline-none border-none mb-2 sm:mb-4"
        />
      </div>
      {/* Proceed Button */}
      <button
        type="button"
        onClick={handleProceed}
        disabled={loading || amount <= 0}
        className="w-full py-3 rounded-lg font-semibold text-lg bg-[#13F195] text-black hover:bg-[#0ddb7f] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Proceed to the payment"}
      </button>
    </Modal>
  );
};

export default PaymentBalanceModal;
