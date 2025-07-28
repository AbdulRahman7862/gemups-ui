import { bytesToGB } from "@/utils/bytesToGB";
import React, { useEffect, useState } from "react";

const TrafficUsage = ({ used, total, onProlongClick }: { 
  used: any; 
  total: any; 
  onProlongClick: () => void;
}) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(100); // Start at 100% (filled)
  
  // For prolonged traffic, we need to use the updated values
  // If order_flow_after exists, it means the traffic has been prolonged
  // In that case, use un_flow as the remaining traffic and order_flow_after as total
  const isProlonged = used && used.order_flow_after;
  
  // Determine the correct values to use
  let remainingTraffic, totalTraffic;
  
  if (isProlonged) {
    // For prolonged traffic: un_flow is remaining, order_flow_after is total
    remainingTraffic = Number(used.un_flow || 0);
    totalTraffic = Number(used.order_flow_after || 1);
  } else {
    // For original traffic: un_flow_used is used, un_flow is total
    const usedTraffic = Number(used?.un_flow_used || 0);
    totalTraffic = Number(used?.un_flow || total || 1);
    remainingTraffic = totalTraffic - usedTraffic;
  }
  
  // Ensure total is not zero to avoid division by zero
  if (totalTraffic === 0) totalTraffic = 1;
  
  // Calculate percentage of remaining traffic (circle should be filled based on remaining)
  const percentageRemaining = (remainingTraffic / totalTraffic) * 100;
  
  const radius = 90;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  // Animate the circle fill on component mount
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;
    const decrement = (100 - percentageRemaining) / steps; // Start from 100% and decrease
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newPercentage = Math.max(100 - (decrement * currentStep), percentageRemaining);
      setAnimatedPercentage(newPercentage);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);
    
    return () => clearInterval(timer);
  }, [percentageRemaining]);

  return (
    <div className="bg-[#090e15] rounded-xl p-6 text-white flex flex-col items-center justify-center shadow-lg">
      <div className="relative w-[200px] h-[200px]">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="transform -rotate-90"
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
            strokeDashoffset={isNaN(strokeDashoffset) ? circumference : strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <p className="text-xs text-white mb-1">Traffic left</p>
          <p className="text-xs font-semibold text-[#00FFAE] text-center leading-tight">
            {bytesToGB(remainingTraffic)}
            <span className="text-white block">/ {bytesToGB(totalTraffic)} GB</span>
          </p>
        </div>
      </div>
      
      {/* Prolong Button */}
      <button 
        onClick={onProlongClick}
        className="mt-6 px-6 py-2 bg-[#13F195] text-white font-medium rounded-lg hover:bg-[#0ddb7f] transition-colors w-[85%]"
      >
        Prolong
      </button>
    </div>
  );
};

export default TrafficUsage;
