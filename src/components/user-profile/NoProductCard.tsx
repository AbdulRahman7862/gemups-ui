import React from "react";

const NoProductCard = () => {
  return (
    <div className="w-full rounded-xl bg-[#090E15] px-6 py-10 flex flex-col items-center justify-center text-center space-y-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0D141B]">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.5 9H2.5V11H13.5V9ZM13.5 5H2.5V7H13.5V5ZM17.5 13V9H15.5V13H11.5V15H15.5V19H17.5V15H21.5V13H17.5ZM2.5 15H9.5V13H2.5V15Z"
            fill="#13F195"
          />
        </svg>
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">You have no products</h2>
        <div className="text-[16px] text-[#7A8895] mt-1">
          Add your first product and you will be able to view and buy it
        </div>
      </div>
      <button
        // onClick={onAddOffer}
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-[#101828] hover:bg-[#1A202C] text-white text-[16px] font-medium px-4 py-2 border border-[#7BB9FF1A] transition"
      >
        <svg
          className="w-4 h-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Add Offer
      </button>
    </div>
  );
};

export default NoProductCard;
