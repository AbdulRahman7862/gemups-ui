const RefreshLoading = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading content"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030507]/90 backdrop-blur-md"
    >
      <div className="flex flex-col items-center space-y-5">
        {/* Improved spinner with gradient and smoother animation */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#030507]"></div>
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#13F195] border-r-[#13F195]"
            style={{
              animationTimingFunction: "cubic-bezier(0.65, 0.05, 0.36, 1)",
            }}
          />
          {/* Optional: Add pulsing dot in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#13F195]"></div>
          </div>
        </div>

        {/* Improved text with better typography and animation */}
        <div className="flex space-x-2">
          <p className="text-lg font-medium text-white tracking-wide">
            Loading, please wait
          </p>
          <div className="flex space-x-1">
            <span className="animate-bounce text-[#13F195]">.</span>
            <span
              className="animate-bounce text-[#13F195]"
              style={{ animationDelay: "0.2s" }}
            >
              .
            </span>
            <span
              className="animate-bounce text-[#13F195]"
              style={{ animationDelay: "0.4s" }}
            >
              .
            </span>
          </div>
        </div>

        {/* Optional progress indicator */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full w-full origin-left animate-indeterminate-progress bg-[#13F195]"
            style={{
              animationTimingFunction: "cubic-bezier(0.65, 0.05, 0.36, 1)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RefreshLoading;
