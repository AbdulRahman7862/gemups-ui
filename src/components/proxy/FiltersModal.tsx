import React, { useState } from "react";
import { Modal } from "../ui/modal";

const FILTERS_LIST = [
  "Подтверждены по почте",
  "Подтверждены по телефону",
  "Tdata",
  "Json",
  "2FA",
  "США",
  "Европа",
  "Англия",
  "England",
  "Europe",
  "USA",
  "Secured",
  "Confirmed by mail",
  "Confirmed by Phone",
];

const FiltersModal = ({ isOpen, onClose }: any) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[700px] bg-[#090E15] p-6 rounded-xl"
    >
      <h4 className="font-bold text-white text-[24px] mb-6">Filter</h4>
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS_LIST.map((filter, index) => {
          const isSelected = selectedFilters.includes(filter);
          return (
            <button
              key={index}
              onClick={() => toggleFilter(filter)}
              className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                isSelected
                  ? "bg-[#13F1951A] text-[#13F195]"
                  : "bg-[#7BB9FF0D] text-[#7A8895] hover:bg-[#2C3A4D]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between gap-4">
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-[#1E2836] text-white rounded-lg font-medium hover:bg-[#2C3A4D] transition"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onClose();
          }}
          className="flex-1 py-3 bg-[#13F195] text-black font-semibold rounded-lg hover:bg-[#0ddb7f] transition"
        >
          Save
        </button>
      </div>
    </Modal>
  );
};

export default FiltersModal;
