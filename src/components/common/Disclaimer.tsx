import React from "react";

interface DisclaimerProps {
  message: string;
}
const Disclaimer: React.FC<DisclaimerProps> = ({ message }) => {
  return (
    <div className="w-full bg-[#35310a] text-[#f1d713] border-b border-[#f1d713] p-3 text-center text-sm flex items-center justify-center flex-wrap">
      <p className="font-bold mr-1">Disclaimer:</p>
      <p>{message}</p>
    </div>
  );
};

export default Disclaimer;
