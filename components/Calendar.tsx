
import React, { useState } from 'react';
import { BUSY_DAYS } from '../constants';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthYearStr = currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const capitalizedMonthYear = monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
    const dayOfWeek = dateObj.getDay();
    
    // 6 é Sábado no JavaScript (0-6, onde 0 é Domingo)
    const isSaturday = dayOfWeek === 6;
    const isBusy = BUSY_DAYS.includes(d) || isSaturday;
    
    const isSelected = selectedDate.getDate() === d && 
                       selectedDate.getMonth() === currentMonth.getMonth() &&
                       selectedDate.getFullYear() === currentMonth.getFullYear();
    
    days.push(
      <button
        key={d}
        disabled={isBusy}
        onClick={() => onDateChange(dateObj)}
        className={`p-2 text-sm rounded-lg transition-all relative ${
          isSelected 
          ? 'bg-primary text-white font-bold shadow-md shadow-primary/20' 
          : isBusy 
            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' 
            : 'hover:bg-slate-100 dark:hover:bg-background-dark text-slate-900 dark:text-white'
        }`}
      >
        {d}
        {isSaturday && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[6px] font-bold text-red-500 uppercase opacity-60">
            Fechado
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-5">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          className="p-1 hover:bg-slate-100 dark:hover:bg-background-dark rounded-full transition-colors text-slate-600 dark:text-text-secondary"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="text-lg font-bold text-slate-900 dark:text-white">{capitalizedMonthYear}</span>
        <button 
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          className="p-1 hover:bg-slate-100 dark:hover:bg-background-dark rounded-full transition-colors text-slate-600 dark:text-text-secondary"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
          <div key={day} className="text-xs font-medium text-slate-400 dark:text-slate-500 py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days}
      </div>
      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] uppercase tracking-wider font-bold">
        <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-primary"></div> Selecionado</div>
        <div className="flex items-center gap-1.5"><div className="size-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div> Indisponível</div>
        <div className="flex items-center gap-1.5 text-red-500"><div className="size-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div> Sábado (Fechado)</div>
      </div>
    </div>
  );
};

export default Calendar;
