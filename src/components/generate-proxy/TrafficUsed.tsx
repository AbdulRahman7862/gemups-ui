import { bytesToGB } from "@/utils/bytesToGB";
import React from "react";

const TrafficUsage = ({ used, total }: { used: any; total: any }) => {
  const percentage = (used / total) * 100;
  const radius = 90;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-[#090e15] rounded-xl p-6 text-white flex flex-col items-center justify-center shadow-lg">
      <div className="relative w-[200px] h-[200px]">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="transform rotate-90"
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#101922"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#00FFAE"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm text-white">Traffic used</p>
          <p className="text-base font-semibold text-[#00FFAE] flex items-center flex-wrap">
            {bytesToGB(used)}{" "}
            <span className="text-white">/ {bytesToGB(total)} gb</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrafficUsage;
