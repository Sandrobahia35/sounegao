
import React from 'react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, isSelected, onSelect }) => {
  const formattedPrice = typeof service.price === 'number'
    ? `R$ ${service.price.toFixed(2).replace('.', ',')}`
    : 'Sob Consulta';

  return (
    <div
      onClick={() => onSelect(service)}
      className={`group relative flex cursor-pointer flex-col gap-4 rounded-xl border-2 p-5 shadow-sm transition-all h-full ${isSelected
          ? 'border-primary bg-primary/5 shadow-primary/10'
          : 'border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark hover:border-primary/50'
        }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center size-10 rounded-lg transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-background-dark text-slate-500 dark:text-text-secondary group-hover:text-primary'
            }`}>
            <span className="material-symbols-outlined">{service.icon}</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{service.name}</p>
            <p className="text-sm text-slate-500 dark:text-text-secondary">{service.duration}</p>
          </div>
        </div>
        <div className={`size-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-slate-300 dark:border-slate-600 bg-transparent'
          }`}>
          {isSelected && <span className="material-symbols-outlined text-white text-lg">check</span>}
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto pt-2">
        <p className="text-xs text-slate-500 dark:text-text-secondary max-w-[70%]">{service.description}</p>
        <p className={`text-lg font-bold ${isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
          {formattedPrice}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
