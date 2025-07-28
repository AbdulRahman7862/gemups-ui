"use client";
import React, { useState, useCallback, useEffect } from "react";
import { HelpCircle, ChevronDown, Plus, Minus, RefreshCw, Loader } from "lucide-react";
import { countries, TTL, TTL2 } from "@/helpers/const";
import Tabs from "../common/Tabs";
import GeneratedProxies from "./GeneratedProxies";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProxyOrderDetails, getOrdersByUser } from "@/store/bookings/actions";
import TrafficUsage from "./TrafficUsed";
import { toast } from "react-toastify";
import PaymentBuyClickModal from "../common/Modals/PaymentBuyClickModal";

export default function GenerateProxy() {
  const orderId = useParams().id;
  const dispatch = useAppDispatch();
  const { order, proxyOrderLoading, orders } = useAppSelector((state) => state.booking);
  // 1. Enable all proxy type tabs and make them dynamic
  const proxyTypes = [
    { value: "Residential" },
    { value: "ISP" },
    { value: "Datacenter" },
  ];
  const [activeTab, setActiveTab] = useState("Residential");
  // 2. Fetch and display real active orders
  const { orders: allOrders } = useAppSelector((state) => state.booking);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // 3. Default country to Germany
  const [selectedCountry, setSelectedCountry] = useState("Germany");
  const [countryCode, setCountryCode] = useState("DE");

  // 4. Set count default to 100
  const [count, setCount] = useState(100);
  const [format, setFormat] = useState("ip:port:login:password");
  const [location, setLocation] = useState("Random");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [port, setPort] = useState("");
  const [isProlongModalOpen, setIsProlongModalOpen] = useState(false);
  const [originalOrder, setOriginalOrder] = useState<any>(null);
  const [sessionType, setSessionType] = useState("Static");
  const [ttl, setTtl] = useState(30);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [rotation, setRotation] = useState("Rotating");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProxies, setGeneratedProxies] = useState<string[]>([]);
  // 1. Add back protocol state
  const [protocol, setProtocol] = useState("http(s)");
  // Add loading states for location data
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const tabs = [
    { value: "Residential" },
    { value: "Data Center", comingSoon: true, disabled: true },
    { value: "ISP", comingSoon: true, disabled: true },
  ];

  // Replace availableProxies with real orders
  const availableProxies = orders?.filter(o => o.type === activeTab.toLowerCase()) || [];
  const protocols = ["http(s)", "socks5"];
  const rotations = ["Rotating", "Sticky"];
  const formats = ["ip:port:login:password", "login:password@ip:port"];
  const locations = ["Random", "Country"];
  const sessionTypes = ["Dynamic", "Static"];

  // 5. Update generateRandomProxy to use the full required format
  const generateRandomProxy = useCallback(
    (protocol?: string, format?: string, sessionIdOverride?: string) => {
      const ip = selectedOrder?.host || `${Math.floor(Math.random() * 255)}.${Math.floor(
        Math.random() * 255
      )}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const port = selectedOrder?.port || "10000";
      const username = name || selectedOrder?.username || `user_${Math.random().toString(36).substring(2, 8)}`;
      const pass = password || selectedOrder?.passwd || `pass_${Math.random().toString(36).substring(2, 8)}`;
      const protocolPrefix = protocol == "http(s)" ? "http" : "socks5";
      const sessionId = sessionType === "Static"
        ? sessionIdOverride || ((window as any)._staticSessionId || ((window as any)._staticSessionId = Math.random().toString(36).substring(2, 10)))
        : Math.random().toString(36).substring(2, 10);
      const zone = activeTab === "Residential" ? "resi" : activeTab.toLowerCase();
      const sanitizedState = selectedState?.replace(/\s+/g, "-") || "";
      const sanitizedCity = selectedCity?.replace(/\s+/g, "-") || "";
      const regionSuffix = [
        `zone-${zone}`,
        selectedCountry && `region-${countryCode}`,
        selectedState && `st-${sanitizedState}`,
        selectedCity && `city-${sanitizedCity}`,
        `session-${sessionId}`,
        `sessTime-${ttl}`,
      ].filter(Boolean).join("-");
      if (format == "ip:port:login:password") {
        return `${protocolPrefix}://${ip}:${port}:${username}-${regionSuffix}:${pass}`;
      } else {
        return `${protocolPrefix}://${username}-${regionSuffix}:${pass}@${ip}:${port}`;
      }
    },
    [name, password, ttl, activeTab, countryCode, selectedState, selectedCity, port, sessionType, selectedOrder]
  );

  // 6. Ensure session type and TTL are respected in handleGenerateProxies
  const handleGenerateProxies = async (selectedProtocol?: string, format?: string) => {
    const activeProtocol = selectedProtocol || protocol;
    if (count <= 0) {
      alert("Please enter a valid count greater than 0");
      return;
    }
    if (count > 100) {
      alert("Maximum allowed count is 100");
      return;
    }
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }
    if (!password.trim()) {
      alert("Please enter a password");
      return;
    }
    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newProxies = [];
      let staticSessionId = undefined;
      if (sessionType === "Static") {
        staticSessionId = Math.random().toString(36).substring(2, 10);
      }
      for (let i = 0; i < count; i++) {
        newProxies.push(generateRandomProxy(activeProtocol, format, staticSessionId));
      }
      setGeneratedProxies(newProxies);
      toast.success("Proxies generated successfully!");
    } catch (error) {
      console.error("Error generating proxies:", error);
      alert("Failed to generate proxies. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setSelectedCountry(name);
    const code = countries.find((c) => c.name === name)?.code ?? "";
    setCountryCode(code);
  };

  // Fetch states when country changes
  useEffect(() => {
    if (selectedCountry) {
      setIsLoadingStates(true);
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      fetch(
        `https://countriesnow.space/api/v0.1/countries/states/q?country=${selectedCountry}`,
        {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data?.data?.states) {
            setStates(data.data.states.map((s: any) => s.name));
            setSelectedState(data.data.states?.[0]?.name);
          } else {
            // Fallback: set empty states if API doesn't return expected data
            setStates([]);
            setSelectedState("");
          }
          setCities([]);
          setSelectedCity("");
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Failed to fetch states from external API:', err);
            // Fallback: set empty states on error
            setStates([]);
            setSelectedState("");
            setCities([]);
            setSelectedCity("");
          }
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setIsLoadingStates(false);
        });

      // Cleanup function to cancel request if component unmounts or dependency changes
      return () => {
        controller.abort();
        clearTimeout(timeoutId);
      };
    }
  }, [selectedCountry]);

  // Fetch cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      setIsLoadingCities(true);
      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ country: selectedCountry, state: selectedState }),
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data?.data && Array.isArray(data.data)) {
            setCities(data.data);
            setSelectedCity(data.data?.[0]);
          } else {
            // Fallback: set empty cities if API doesn't return expected data
            setCities([]);
            setSelectedCity("");
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.warn('Failed to fetch cities from external API:', err);
            // Fallback: set empty cities on error
            setCities([]);
            setSelectedCity("");
          }
        })
        .finally(() => {
          clearTimeout(timeoutId);
          setIsLoadingCities(false);
        });

      // Cleanup function to cancel request if component unmounts or dependency changes
      return () => {
        controller.abort();
        clearTimeout(timeoutId);
      };
    }
  }, [selectedCountry, selectedState]);

  useEffect(() => {
    if (!orderId) return;
    const id = Array.isArray(orderId) ? orderId[0] : orderId;
    dispatch(getProxyOrderDetails(id));
    
    // Also fetch the original order from purchases to get productId and providerId
    dispatch(getOrdersByUser({ page: 1, limit: 100, type: 'all' }));
  }, [orderId, dispatch]);

  useEffect(() => {
    if (order) {
      setPassword(order?.passwd);
      // Keep the default count of 100, don't override with order quantity
      // setCount(order?.quantity || 1);
      setProtocol(order?.proto);
      setName(order?.username);
      setPort(order?.port);
      
      // Set the selectedOrder to the API response data which contains the real proxy details
      // This ensures that generateRandomProxy uses the correct host and port from the API
      setSelectedOrder(order);
    }
  }, [order]);

  // Find the original order from purchases to get productId and providerId
  useEffect(() => {
    if (orders && orders.length > 0 && orderId) {
      const id = Array.isArray(orderId) ? orderId[0] : orderId;
      const foundOrder = orders.find((order: any) => order.id === id);
      if (foundOrder) {
        setOriginalOrder(foundOrder);
      }
    }
  }, [orders, orderId]);

  const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => (
    <div className="relative inline-flex group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
        {text}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded-lg shadow-lg text-black">Generating proxies, please wait...</div>
        </div>
      )}
      <div className="container-fluid mx-auto py-2 min-h-screen text-white">
        <Tabs tabs={tabs} defaultTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
        {proxyOrderLoading ? (
          <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin text-[#13F195]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#090e15] rounded-lg p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <label className="text-base font-medium text-white">
                      Available proxy providers
                    </label>
                    <Tooltip text="Select available proxy provider">
                      <HelpCircle size={18} className="text-gray-400 cursor-pointer" />
                    </Tooltip>
                  </div>
                  <div className="flex space-x-2">
                    {availableProxies.map((proxy) => (
                      <button
                        key={proxy.id}
                        onClick={() => setSelectedOrder(proxy)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedOrder?.id === proxy.id
                            ? "bg-[#13F1951A] text-[#13F195]"
                            : "bg-[#0f1721] text-[#7A8895]"
                        }`}
                      >
                        {proxy.providerName} - {proxy.orderNumber}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-4 w-full max-w-2xl mb-3">
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium text-[#7A8895]">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-[#0f1721] text-white border border-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#13F195]"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium text-[#7A8895]">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-[#0f1721] text-white border border-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#13F195]"
                    />
                  </div>
                </div>
                <div className="flex space-x-4 w-full max-w-2xl mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-base font-medium text-white">Rotation:</label>
                      <Tooltip text="Select rotation type">
                        <HelpCircle size={18} className="text-gray-400 cursor-pointer" />
                      </Tooltip>
                    </div>
                    <select
                      value={rotation}
                      onChange={(e) => setRotation(e.target.value)}
                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-[#0f1721] text-white border border-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#13F195]"
                    >
                      {rotations.map((rot) => (
                        <option key={rot} value={rot}>
                          {rot}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-base font-medium text-white">Protocol:</label>
                      <Tooltip text="Select protocol type">
                        <HelpCircle size={18} className="text-gray-400 cursor-pointer" />
                      </Tooltip>
                    </div>
                    <select
                      value={protocol}
                      onChange={(e) => {
                        setProtocol(e.target.value);
                        handleGenerateProxies(e.target.value, format);
                      }}
                      className="w-full px-4 py-2 rounded-md text-sm font-medium bg-[#0f1721] text-white border border-[#2c3e50] focus:outline-none focus:ring-2 focus:ring-[#13F195] uppercase"
                    >
                      {protocols.map((prot) => (
                        <option key={prot} value={prot}>
                          {prot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-base font-medium text-white">Count:</label>
                      <Tooltip text="Number of proxies to generate">
                        <HelpCircle size={18} className="text-gray-400 cursor-pointer" />
                      </Tooltip>
                    </div>
                    <div className="flex gap-1 items-center w-full">
                      <button
                        onClick={() => setCount(Math.max(1, count - 1))}
                        className="p-3 bg-[#0f1721] text-[#7A8895] rounded-lg hover:bg-[#1a2332] transition-colors"
                      >
                        <Minus size={18} className="text-gray-400" />
                      </button>
                      <input
                        type="number"
                        value={count}
                        onChange={(e) =>
                          setCount(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="flex-1 px-3 py-2 text-white rounded-lg border-0 focus:outline-none bg-[#0f1721] min-w-0 text-center"
                        min="1"
                      />
                      <button
                        onClick={() => setCount(count + 1)}
                        className="p-3 bg-[#0f1721] text-[#7A8895] rounded-lg hover:bg-[#1a2332] transition-colors"
                      >
                        <Plus size={18} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[240px]">
                    <div className="flex items-center gap-2 mb-3">
                      <label className="text-base font-medium text-white">Format:</label>
                      <Tooltip text="Proxy format output">
                        <HelpCircle size={18} className="text-gray-400 cursor-pointer" />
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <select
                        value={format}
                        onChange={(e) => {
                          setFormat(e.target.value);
                          handleGenerateProxies(protocol, e.target.value);
                        }}
                        className="w-full px-3 py-2 text-white rounded-lg bg-[#0f1721] focus:outline-none appearance-none"
                      >
                        {formats.map((fmt) => (
                          <option key={fmt} value={fmt}>
                            {fmt}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#7A8895] pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex w-full md:w-auto items-end">
                    <button
                      onClick={() => setShowMoreOptions(!showMoreOptions)}
                      className="flex items-center gap-2 px-3 py-2 bg-[#141f2c] text-white rounded-lg hover:bg-gray-600/50 hover:text-gray-300 transition-colors text-base w-full md:w-auto justify-center"
                    >
                      {showMoreOptions ? "Hide options" : "Show more options"}
                    </button>
                  </div>
                </div>
              </div>
              {showMoreOptions && (
                <div className="bg-[#090e15] rounded-lg p-6">
                  <div className="space-y-4 pt-4">
                    <div className="flex flex-col md:flex-row flex-wrap gap-4">
                      <div className="w-full md:w-auto">
                        <div className="flex items-center gap-2 mb-3">
                          <label className="text-base font-medium text-white">
                            Location:
                          </label>
                          <Tooltip text="Proxy location selection">
                            <HelpCircle
                              size={18}
                              className="text-gray-400 cursor-pointer"
                            />
                          </Tooltip>
                        </div>
                        <div className="flex space-x-2">
                          {locations.map((loc) => (
                            <button
                              key={loc}
                              onClick={() => {
                                setLocation(loc);
                                if (loc === "Random") {
                                  setSelectedCountry("");
                                  setSelectedCity("");
                                  setSelectedState("");
                                }
                              }}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                location === loc
                                  ? "bg-[#13F1951A] text-[#13F195]"
                                  : "bg-[#0f1721] text-[#7A8895]"
                              }`}
                            >
                              {loc}
                            </button>
                          ))}
                        </div>
                      </div>
                      {location === "Country" && (
                        <div className="flex-1 w-full min-w-0 md:min-w-[400px] flex items-end">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                            <div className="relative w-full">
                              <select
                                value={selectedCountry}
                                onChange={handleCountryChange}
                                className="w-full px-3 py-2 text-white rounded-lg bg-[#0f1721] focus:outline-none appearance-none"
                              >
                                <option value="">Select Country</option>
                                {countries.map((country) => (
                                  <option key={country.name} value={country.name}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className="relative w-full">
                              <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                disabled={!states?.length || isLoadingStates}
                                className="w-full px-3 py-2 text-white rounded-lg bg-[#0f1721] focus:outline-none appearance-none disabled:opacity-50"
                              >
                                <option value="">
                                  {isLoadingStates ? "Loading states..." : "Select State"}
                                </option>
                                {states?.map((state) => (
                                  <option key={state} value={state}>
                                    {state}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              {isLoadingStates && (
                                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                  <Loader className="animate-spin h-4 w-4 text-[#13F195]" />
                                </div>
                              )}
                            </div>
                            <div className="relative w-full">
                              <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                disabled={!cities?.length || isLoadingCities}
                                className="w-full px-3 py-2 text-white rounded-lg bg-[#0f1721] focus:outline-none appearance-none disabled:opacity-50"
                              >
                                <option value="">
                                  {isLoadingCities ? "Loading cities..." : "Select City"}
                                </option>
                                {cities?.map((city) => (
                                  <option key={city} value={city}>
                                    {city}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                              {isLoadingCities && (
                                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                                  <Loader className="animate-spin h-4 w-4 text-[#13F195]" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Fallback message when location APIs fail */}
                      {location === "Country" && selectedCountry && !isLoadingStates && !states?.length && (
                        <div className="w-full mt-2">
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-yellow-400 text-sm">
                              Location data temporarily unavailable. You can continue with proxy generation using random locations.
                            </p>
                            <button
                              onClick={() => setLocation("Random")}
                              className="mt-2 text-yellow-400 hover:text-yellow-300 text-sm underline"
                            >
                              Switch to Random location
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <label className="text-base font-medium text-white">
                            Session type:
                          </label>
                          <Tooltip text="Session type configuration">
                            <HelpCircle
                              size={18}
                              className="text-gray-400 cursor-pointer"
                            />
                          </Tooltip>
                        </div>
                        <div className="flex gap-2">
                          {sessionTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => setSessionType(type)}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                sessionType === type
                                  ? "bg-[#13F1951A] text-[#13F195]"
                                  : "bg-[#0f1721] text-[#7A8895]"
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex items-center gap-2 mb-3">
                          <label className="text-base font-medium text-white">TTL:</label>
                          <Tooltip text="Time to live for proxy session">
                            <HelpCircle
                              size={18}
                              className="text-gray-400 cursor-pointer"
                            />
                          </Tooltip>
                        </div>
                        <div className="relative">
                          <select
                            value={ttl}
                            onChange={(e) => setTtl(Number(e.target.value))}
                            className="w-full px-3 py-2 text-white rounded-lg bg-[#0f1721] focus:outline-none appearance-none"
                          >
                            {(selectedOrder?.providerName === "Lola" ? TTL : TTL2).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <div className="flex w-full md:w-auto items-end">
                        <button
                          className="flex items-center justify-center gap-2 px-4 py-1.5 w-full md:w-auto bg-[#13f195] hover:opacity-90 rounded-lg font-medium transition-colors text-black"
                          onClick={() => handleGenerateProxies(protocol, format)}
                          disabled={
                            isGenerating || !name.trim() || !password.trim() || count <= 0
                          }
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw size={20} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Save and close"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Generate Button */}
              {/* <div className="bg-[#090e15] rounded-lg p-6">
                <button
                  onClick={handleGenerateProxies}
                  disabled={
                    isGenerating ||
                    !name.trim() ||
                    !password.trim() ||
                    count <= 0 ||
                    selectedCountry === ""
                  }
                  className="w-full bg-[#13f195] hover:bg-[#10d182] disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      Generating Proxies...
                    </>
                  ) : (
                    `Generate ${count} Proxies`
                  )}
                </button>
              </div> */}
            </div>
            {/* Right Column - Traffic Monitor */}
            <div className="lg:col-span-1">
              <TrafficUsage 
                used={order} 
                total={order?.un_flow} 
                onProlongClick={() => setIsProlongModalOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Generated Proxies Section */}
        {generatedProxies.length > 0 && (
          <GeneratedProxies
            generatedProxies={generatedProxies.length}
            sampleProxies={generatedProxies}
          />
        )}
        
        {/* Prolong Modal */}
        {isProlongModalOpen && order && originalOrder && (
          <PaymentBuyClickModal
            isOpen={isProlongModalOpen}
            onClose={() => setIsProlongModalOpen(false)}
            providerId={originalOrder.providerId}
            productId={originalOrder.productId}
            orderId={originalOrder.id}
            currentPage={1}
            activeTab="proxy"
            isProlong={true}
            proxyDetails={order ? {
              username: order.username,
              expire: order.expire,
              order_flow: order.order_flow
            } : null}
          />
        )}
      </div>
    </div>
  );
}
