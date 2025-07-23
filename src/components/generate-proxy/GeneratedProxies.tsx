import React, { useState } from "react";
import { Copy } from "lucide-react";

interface GeneratedProxiesProps {
  generatedProxies: number;
  sampleProxies: string[];
}

const GeneratedProxies = ({ generatedProxies, sampleProxies }: GeneratedProxiesProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleProxies.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#090e15] rounded-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          Generated Proxies ({generatedProxies})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#13f195] hover:opacity-90 rounded-lg font-medium transition-colors text-sm text-black"
          >
            <Copy size={16} />
            {copied ? "Copied!" : "Copy All"}
          </button>
        </div>
      </div>
      <div className="bg-[#0f1721] rounded-lg p-4 max-h-60 overflow-y-auto">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          {sampleProxies.join("\n")}
        </pre>
      </div>
    </div>
  );
};

export default GeneratedProxies;
