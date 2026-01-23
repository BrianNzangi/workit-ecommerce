'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';

const counties = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Uasin Gishu',
  'Kiambu', 'Machakos', 'Nyeri', 'Kericho', 'Meru',
];

function LocationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState('Nairobi');

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (county: string) => {
    setSelectedCounty(county);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-start gap-2 text-left group"
      >
        <MapPin className="w-5 h-5 mt-1 text-primary shrink-0" />

        <div className="leading-tight text-xs">
          <span className="block font-sans text-gray-500 text-[11px]">Deliver to</span>
          <span className="block font-sans font-semibold text-sm text-black">
            {selectedCounty}
          </span>
        </div>

        <ChevronDown className="w-4 h-4 mt-1 text-gray-500 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-md z-50">
          {counties.map((county) => (
            <button
              key={county}
              onClick={() => handleSelect(county)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              {county}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocationSelector;