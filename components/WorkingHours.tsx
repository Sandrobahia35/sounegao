import React, { useEffect, useState } from 'react';
import { getEffectiveScheduleConfig, ScheduleConfig } from '../services/scheduleService';

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const WorkingHours: React.FC<{ barberId: string }> = ({ barberId }) => {
    const [configs, setConfigs] = useState<ScheduleConfig[]>([]);

    useEffect(() => {
        async function load() {
            const loaded = await getEffectiveScheduleConfig(barberId);
            setConfigs(loaded);
        }
        load();
    }, [barberId]);

    const formatTime = (t: string) => t.slice(0, 5);

    return (
        <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-white/5 rounded-xl p-4 text-sm w-full">
            <h4 className="font-bold mb-3 text-slate-700 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">schedule</span>
                Horário de Atendimento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {configs.map((cfg) => (
                    <div key={cfg.day_of_week} className="flex justify-between items-center text-slate-500 dark:text-slate-400 border-b border-slate-200/50 dark:border-white/5 pb-1 last:border-0 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <span className="font-medium">{DAYS[cfg.day_of_week]}</span>
                        <span className={!cfg.is_active ? 'text-red-400 text-xs font-bold uppercase' : ''}>
                            {cfg.is_active
                                ? `${formatTime(cfg.start_time)} - ${formatTime(cfg.end_time)}`
                                : 'Fechado'
                            }
                        </span>
                    </div>
                ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-3 italic">* Horários podem variar em feriados.</p>
        </div>
    );
};

export default WorkingHours;
