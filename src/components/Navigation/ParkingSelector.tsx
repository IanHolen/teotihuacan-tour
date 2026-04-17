'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { Parking } from '@/types';
import parkingsData from '../../../public/data/parkings.json';

const parkings = parkingsData as Parking[];

interface ParkingSelectorProps {
  selectedId: string | null;
  onSelect: (parking: Parking | null) => void;
}

export default function ParkingSelector({ selectedId, onSelect }: ParkingSelectorProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* No parking option */}
      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
          selectedId === null
            ? 'bg-[#c4956a]/20 border border-[#c4956a]'
            : 'bg-[#16213e]/60 border border-transparent hover:bg-[#1a2745]'
        }`}
      >
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
          selectedId === null ? 'bg-[#c4956a] text-white' : 'bg-white/10 text-white/60'
        }`}>
          —
        </span>
        <span className={`text-sm ${selectedId === null ? 'text-white font-medium' : 'text-white/70'}`}>
          {language === 'es' ? 'Sin estacionamiento' : language === 'pt' ? 'Sem estacionamento' : 'No parking'}
        </span>
      </button>

      {parkings.map((parking) => {
        const isSelected = selectedId === parking.id;
        return (
          <button
            key={parking.id}
            onClick={() => onSelect(parking)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              isSelected
                ? 'bg-[#c4956a]/20 border border-[#c4956a]'
                : 'bg-[#16213e]/60 border border-transparent hover:bg-[#1a2745]'
            }`}
          >
            <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${
              isSelected ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60'
            }`}>
              P
            </span>
            <span className={`text-sm ${isSelected ? 'text-white font-medium' : 'text-white/70'}`}>
              {parking.name[language]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
