
import React from 'react';
import { Barber } from '../types';

interface BarberCardProps {
  barber: Barber;
  isSelected: boolean;
  onSelect: (barber: Barber) => void;
}

const BarberCard: React.FC<BarberCardProps> = ({ barber, isSelected, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(barber)}
      className={`relative cursor-pointer flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
        isSelected 
        ? 'border-primary bg-primary/10' 
        : 'border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50'
      }`}
    >
      <div className="relative size-20 md:size-24 rounded-full overflow-hidden border-2 border-white dark:border-border-dark shadow-md">
        <img 
          src={barber.photoUrl} 
          alt={barber.name} 
          className="size-full object-cover"
        />
        {isSelected && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white font-bold text-3xl">check</span>
          </div>
        )}
      </div>
      <span className={`font-bold text-lg ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
        {barber.name}
      </span>
      {isSelected && (
        <div className="absolute -top-2 -right-2 size-6 bg-primary rounded-full flex items-center justify-center text-white text-[10px] font-bold">
          <span className="material-symbols-outlined text-sm">done</span>
        </div>
      )}
    </div>
  );
};

export default BarberCard;
