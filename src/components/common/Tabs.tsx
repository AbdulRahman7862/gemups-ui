import React, { useState } from "react";

type TabItem =
  | string
  | {
      value: string;
      comingSoon?: boolean;
      disabled?: boolean;
    };

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
  tabClassName?: string;
  activeTabClassName?: string;
  inactiveTabClassName?: string;
  containerClassName?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onTabChange,
  tabClassName = "px-3 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap text-white capitalize",
  activeTabClassName = "border-[#13F195]",
  inactiveTabClassName = "border-transparent text-white hover:text-white hover:border-gray-600",
  containerClassName = "flex mb-6 border-b border-gray-700 overflow-visible no-scrollbar",
}) => {
  const firstEnabled = tabs.find((t) => typeof t === "string" || !t.disabled) as TabItem;

  const [activeTab, setActiveTab] = useState(
    defaultTab || (typeof firstEnabled === "string" ? firstEnabled : firstEnabled.value)
  );

  const handleTabClick = (tab: TabItem) => {
    const label = typeof tab === "string" ? tab : tab.value;
    const disabled = typeof tab !== "string" && tab.disabled;
    if (disabled) return;
    setActiveTab(label);
    onTabChange?.(label);
  };

  return (
    <div className={containerClassName}>
      <div className="flex gap-1 sm:gap-2">
        {tabs.map((tab) => {
          const label = typeof tab === "string" ? tab : tab.value;
          const comingSoon = typeof tab !== "string" && tab.comingSoon;
          const disabled = typeof tab !== "string" && tab.disabled;

          return (
            <button
              key={label}
              onClick={() => handleTabClick(tab)}
              disabled={disabled}
              className={`${tabClassName} ${
                activeTab === label ? activeTabClassName : inactiveTabClassName
              } ${
                disabled ? "opacity-60 cursor-not-allowed pointer-events-none" : ""
              } relative`}
            >
              {comingSoon && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-700 text-yellow-200 text-[10px] px-1 py-0.5 rounded-full z-10">
                  Coming&nbsp;Soon
                </span>
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
