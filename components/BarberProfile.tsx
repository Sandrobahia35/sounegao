import React, { useState, useEffect } from 'react';
import { User } from '../services/authService';
import { getBarberByUserId } from '../services/barberService';
import {
    getBarberSchedule,
    saveScheduleConfig,
    addBlockedPeriod,
    deleteBlockedPeriod,
    ScheduleConfig,
    BlockedPeriod,
    ManagementSlot,
    getDailyManagementSlots,
    upsertDailySlot
} from '../services/scheduleService';
import BottomNavigation from './BottomNavigation';
import { Page } from '../types';
import { getBarberAppointments, Appointment, updateAppointmentStatus } from '../services/appointmentService';
import BarberFinancials from './BarberFinancials';
import ServiceManager from './ServiceManager';

interface BarberProfileProps {
    currentUser: User;
    onLogout: () => void;
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const BarberProfile: React.FC<BarberProfileProps> = ({ currentUser, onLogout }) => {
    const [barberId, setBarberId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'weekly' | 'exceptions' | 'appointments' | 'daily' | 'finance' | 'services'>('appointments');

    // Schedule Config State
    const [configs, setConfigs] = useState<ScheduleConfig[]>([]);

    // Exceptions State
    const [blocks, setBlocks] = useState<BlockedPeriod[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [exceptionType, setExceptionType] = useState<'blocked' | 'working'>('blocked');
    const [newBlockStart, setNewBlockStart] = useState('');
    const [newBlockEnd, setNewBlockEnd] = useState('');
    const [newBlockReason, setNewBlockReason] = useState('');

    // Appointments State
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [managementSlots, setManagementSlots] = useState<ManagementSlot[]>([]);
    const [managementDate, setManagementDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [mgmtLoading, setMgmtLoading] = useState(false);
    const [editingSlot, setEditingSlot] = useState<string | null>(null); // Time being edited
    const [editValue, setEditValue] = useState<string>('');

    useEffect(() => {
        loadBarberData();
    }, [currentUser.id]);

    const loadBarberData = async () => {
        try {
            setLoading(true);
            const barber = await getBarberByUserId(currentUser.id);
            if (barber) {
                setBarberId(barber.id);
                // Load Schedule
                const schedule = await getBarberSchedule(barber.id);
                if (schedule.success) {
                    const loadedConfigs = schedule.configs as ScheduleConfig[];
                    // Updated Defaults Logic
                    const fullConfigs = DAYS.map((_, index) => {
                        const existing = loadedConfigs.find(c => c.day_of_week === index);
                        if (existing) return existing;

                        // New Defaults
                        let def: ScheduleConfig = {
                            day_of_week: index,
                            start_time: '09:00',
                            end_time: '19:00',
                            is_active: false
                        };

                        if (index >= 1 && index <= 4) { // Mon-Thu
                            def.end_time = '19:30';
                            def.is_active = true;
                        } else if (index === 5) { // Fri
                            def.end_time = '17:00';
                            def.is_active = true;
                        } else if (index === 0) { // Sun
                            def.end_time = '13:00';
                            def.is_active = true;
                        }
                        // Sat (6) remains inactive/closed by default

                        return def;
                    });
                    setConfigs(fullConfigs);
                    setBlocks(schedule.blocks as BlockedPeriod[]);

                    // Load Appointments
                    const apps = await getBarberAppointments(barber.id);
                    setAppointments(apps);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: 'completed' | 'cancelled') => {
        const result = await updateAppointmentStatus(id, status);
        if (result.success) {
            loadBarberData(); // Refresh list
        } else {
            alert('Erro ao atualizar status: ' + result.error);
        }
    };

    const loadMgmtSlots = async () => {
        if (!barberId) return;
        setMgmtLoading(true);
        const slots = await getDailyManagementSlots(barberId, managementDate);
        setManagementSlots(slots);
        setMgmtLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'daily') {
            loadMgmtSlots();
        }
    }, [activeTab, managementDate, barberId]);

    const handleToggleSlot = async (time: string, currentStatus: string) => {
        if (!barberId) return;
        if (currentStatus === 'booked') {
            alert('Este horário já possui um agendamento e não pode ser desativado manualmente.');
            return;
        }

        const isAvailable = currentStatus === 'blocked'; // If blocked, we want to make it available
        const result = await upsertDailySlot(barberId, managementDate, time, time, isAvailable);
        if (result.success) {
            loadMgmtSlots();
        } else {
            alert('Erro ao alterar horário: ' + result.error);
        }
    };

    const handleSaveSlotTime = async (oldTime: string, newTime: string) => {
        if (!barberId) return;
        if (oldTime === newTime) {
            setEditingSlot(null);
            return;
        }

        setMgmtLoading(true);
        const result = await upsertDailySlot(barberId, managementDate, oldTime, newTime, true);
        if (result.success) {
            await loadMgmtSlots();
        } else {
            alert('Erro ao salvar horário: ' + result.error);
        }
        setEditingSlot(null);
        setMgmtLoading(false);
    };

    const handleAddSlot = async () => {
        const time = prompt('Digite o horário (ex: 08:15):');
        if (!time || !/^\d{2}:\d{2}$/.test(time)) {
            if (time) alert('Formato de hora inválido. Use HH:MM');
            return;
        }
        await handleSaveSlotTime(time, time); // oldTime=newTime for brand new slots
    };


    const handleConfigChange = (index: number, field: keyof ScheduleConfig, value: any) => {
        const newConfigs = [...configs];
        newConfigs[index] = { ...newConfigs[index], [field]: value };
        setConfigs(newConfigs);
    };

    const handleSaveConfigs = async () => {
        if (!barberId) return;
        const result = await saveScheduleConfig(barberId, configs);
        if (result.success) {
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar: ' + result.error);
        }
    };

    const handleAddException = async () => {
        if (!barberId) return;
        if (!newBlockReason) { alert('Informe o motivo/descrição.'); return; }

        const block: BlockedPeriod = {
            date: selectedDate,
            start_time: newBlockStart || null,
            end_time: newBlockEnd || null,
            reason: newBlockReason,
            type: exceptionType
        };

        const result = await addBlockedPeriod(barberId, block);
        if (result.success) {
            alert(exceptionType === 'blocked' ? 'Bloqueio adicionado!' : 'Horário extra adicionado!');
            setNewBlockStart(''); setNewBlockEnd(''); setNewBlockReason('');
            loadBarberData();
        } else {
            alert('Erro ao salvar: ' + result.error);
        }
    };

    const handleDeleteBlock = async (id: string) => {
        if (confirm('Remover esta exceção?')) {
            const result = await deleteBlockedPeriod(id);
            if (result.success) loadBarberData();
        }
    };

    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    if (loading) return <div className="text-white p-8">Carregando...</div>;
    if (!barberId) return <div className="text-white p-8">Erro: Barbeiro não encontrado para este usuário.</div>;

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#111722]">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center font-bold text-lg">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Olá, {currentUser.name}</h1>
                        <p className="text-xs text-slate-400 capitalize">{today}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                    Sair
                </button>
            </div>

            <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8 pb-24 md:pb-8">
                {/* Tabs - Hidden on Mobile, Visible on Desktop */}
                <div className="hidden md:flex gap-2 border-b border-white/10 overflow-x-auto pb-px scroll-smooth no-scrollbar sticky top-0 bg-background-dark/95 backdrop-blur-sm z-10 -mx-4 px-4 md:mx-0 md:px-0 flex-nowrap snap-x snap-mandatory">
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`pb-3 px-4 font-bold whitespace-nowrap text-sm transition-all border-b-2 flex-none snap-start ${activeTab === 'appointments' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        Agendamentos
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`pb-3 px-4 font-bold whitespace-nowrap text-sm transition-all border-b-2 flex-none snap-start ${activeTab === 'services' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        Serviços
                    </button>
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`pb-3 px-4 font-bold whitespace-nowrap text-sm transition-all border-b-2 flex-none snap-start ${activeTab === 'daily' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        Gestão Diária
                    </button>
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={`pb-3 px-4 font-bold whitespace-nowrap text-sm transition-all border-b-2 flex-none snap-start ${activeTab === 'weekly' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        Padrão Semanal
                    </button>
                    <button
                        onClick={() => setActiveTab('exceptions')}
                        className={`pb-3 px-4 font-bold whitespace-nowrap text-sm transition-all border-b-2 flex-none snap-start ${activeTab === 'exceptions' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        Feriados
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`pb-3 px-4 font-bold whitespace-nowrap text-sm transition-all border-b-2 flex-none snap-start ${activeTab === 'finance' ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                    >
                        Financeiro
                    </button>
                </div>

                {/* WEEKLY CONFIG */}
                {activeTab === 'appointments' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agendamentos</h2>
                            <button
                                onClick={loadBarberData}
                                className="w-full sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-bold transition-all border border-primary/20"
                            >
                                🔄 Atualizar Lista
                            </button>
                        </div>

                        {appointments.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-surface-dark rounded-xl border-2 border-dashed border-slate-200 dark:border-border-dark">
                                <p className="text-slate-500 dark:text-text-secondary">Nenhum agendamento encontrado.</p>
                            </div>
                        ) : (
                            <>
                                {/* Mobile view: Cards */}
                                <div className="md:hidden space-y-4">
                                    {appointments.map((app) => (
                                        <div key={app.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                                            {/* Status Badge Background */}
                                            <div className={`absolute top-0 right-0 h-1 w-full ${app.status === 'pending' ? 'bg-orange-500' :
                                                app.status === 'completed' ? 'bg-green-500' :
                                                    app.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-500'
                                                }`} />

                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                        {new Date(app.appointment_date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                    </div>
                                                    <div className="text-2xl font-black text-primary">
                                                        {app.appointment_time.substring(0, 5)}
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${app.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                                                    app.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                        app.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {app.status === 'pending' ? 'Pendente' :
                                                        app.status === 'completed' ? 'Concluído' :
                                                            app.status === 'cancelled' ? 'Cancelado' : app.status}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-lg font-bold text-white leading-tight">
                                                    {app.customer_name}
                                                </div>
                                                <div className="text-xs text-slate-400 italic">
                                                    {app.service_names}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                                                <a
                                                    href={`tel:${app.customer_phone}`}
                                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl text-sm transition-all"
                                                >
                                                    <span className="text-lg">📞</span>
                                                    <span className="font-bold text-slate-300">{app.customer_phone}</span>
                                                </a>

                                                {app.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'completed'); }}
                                                            className="bg-green-600 hover:bg-green-700 text-white size-10 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 transition-all active:scale-95"
                                                            title="Concluir"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'cancelled'); }}
                                                            className="bg-red-600 hover:bg-red-700 text-white size-10 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 transition-all active:scale-95"
                                                            title="Cancelar"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop view: Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-border-dark text-slate-500 dark:text-text-secondary uppercase">
                                                <th className="py-4 px-4 text-[10px] font-black tracking-[0.2em]">Data/Hora</th>
                                                <th className="py-4 px-4 text-[10px] font-black tracking-[0.2em]">Cliente</th>
                                                <th className="py-4 px-4 text-[10px] font-black tracking-[0.2em]">Serviços</th>
                                                <th className="py-4 px-4 text-[10px] font-black tracking-[0.2em] text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map((app) => (
                                                <tr key={app.id} className="border-b border-slate-100 dark:border-border-dark/50 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                                    <td className="py-4 px-4">
                                                        <div className="font-black text-slate-900 dark:text-white whitespace-nowrap">
                                                            {new Date(app.appointment_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                                        </div>
                                                        <div className="text-sm text-primary font-black uppercase">{app.appointment_time.substring(0, 5)}</div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{app.customer_name}</div>
                                                        <a
                                                            href={`tel:${app.customer_phone}`}
                                                            className="text-sm text-slate-500 dark:text-text-secondary hover:text-primary transition-colors flex items-center gap-1 font-medium"
                                                        >
                                                            <span>📞</span> {app.customer_phone}
                                                        </a>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-[11px] text-slate-600 dark:text-text-secondary italic max-w-[150px] truncate" title={app.service_names}>
                                                            {app.service_names}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap tracking-wider ${app.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                                                                app.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                                    app.status === 'cancelled' ? 'bg-red-500/10 text-red-500' :
                                                                        'bg-slate-100 text-slate-600'
                                                                }`}>
                                                                {app.status === 'pending' ? 'Pendente' :
                                                                    app.status === 'completed' ? 'Concluído' :
                                                                        app.status === 'cancelled' ? 'Cancelado' : app.status}
                                                            </span>

                                                            {app.status === 'pending' && (
                                                                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app.id, 'completed')}
                                                                        className="bg-green-600 hover:bg-green-700 text-white size-8 rounded-lg flex items-center justify-center text-xs shadow-sm font-bold transition-all"
                                                                    >
                                                                        ✓
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                                                                        className="bg-red-600 hover:bg-red-700 text-white size-8 rounded-lg flex items-center justify-center text-xs shadow-sm font-bold transition-all"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'daily' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gestão Horários</h2>
                                <p className="text-xs text-slate-500 dark:text-text-secondary">Controle granular por dia.</p>
                            </div>
                            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={handleAddSlot}
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white px-4 py-3 sm:py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <span>+</span> Novo Horário
                                </button>
                                <input
                                    type="date"
                                    value={managementDate}
                                    onChange={(e) => setManagementDate(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 sm:py-2 text-sm font-bold focus:ring-2 focus:ring-primary outline-none text-white text-center"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {managementSlots.map((slot) => (
                                <div
                                    key={slot.time + '-' + slot.status}
                                    className={`relative p-4 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 group select-none min-h-[85px] justify-center ${slot.status === 'booked'
                                        ? 'border-orange-500/30 bg-orange-500/10 cursor-not-allowed opacity-90'
                                        : slot.status === 'blocked'
                                            ? 'border-white/5 bg-white/5 opacity-50'
                                            : 'border-green-500/20 bg-green-500/5 hover:border-green-500 shadow-lg cursor-pointer'
                                        }`}
                                    onClick={() => {
                                        if (slot.status !== 'booked' && editingSlot !== slot.time) {
                                            handleToggleSlot(slot.time, slot.status);
                                        }
                                    }}
                                >
                                    {editingSlot === slot.time ? (
                                        <input
                                            autoFocus
                                            type="text"
                                            value={editValue}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onBlur={() => handleSaveSlotTime(slot.time, editValue)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveSlotTime(slot.time, editValue);
                                                if (e.key === 'Escape') setEditingSlot(null);
                                            }}
                                            className="w-full text-center bg-white/20 text-white text-lg font-black rounded-lg outline-none border-2 border-primary py-2"
                                        />
                                    ) : (
                                        <div
                                            className="flex flex-col items-center w-full"
                                            onClick={(e) => {
                                                if (slot.status !== 'booked') {
                                                    e.stopPropagation();
                                                    setEditingSlot(slot.time);
                                                    setEditValue(slot.time);
                                                }
                                            }}
                                        >
                                            <span
                                                className={`text-xl font-black transition-all ${slot.status === 'booked' ? 'text-orange-500' :
                                                    slot.status === 'blocked' ? 'text-slate-600' : 'text-green-500'
                                                    }`}
                                            >
                                                {slot.time}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded ${slot.status === 'booked' ? 'bg-orange-500 text-black' :
                                                slot.status === 'blocked' ? 'bg-slate-700 text-slate-500' : 'bg-green-500 text-black'
                                                }`}>
                                                {slot.status === 'booked' ? 'RESERVADO' : slot.status === 'blocked' ? 'OFF' : 'ATIVO'}
                                            </span>
                                        </div>
                                    )}

                                    {slot.isCustom && (
                                        <div className="absolute top-2 right-2 size-2 bg-primary rounded-full shadow-[0_0_8px_rgba(234,179,8,0.6)]" />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl">
                            <p className="text-xs text-primary leading-relaxed">
                                <strong>Instruções:</strong>
                                <br />• Clique no <strong>Horário</strong> (número) para editar (ex: mudar de 08:30 para 08:36).
                                <br />• Clique no <strong>Botão de Status</strong> (Ativo/Desativado) para alternar a disponibilidade.
                                <br />• Use o botão <strong>"+ Adicionar Horário"</strong> para incluir novos horários extras.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'weekly' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Horário de Atendimento Padrão</h2>
                            <button onClick={handleSaveConfigs} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">
                                Salvar Alterações
                            </button>
                        </div>
                        <div className="grid gap-3">
                            {configs.map((config, index) => (
                                <div key={index} className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-xl border transition-all ${config.is_active ? 'bg-surface-dark border-white/10' : 'bg-surface-dark/50 border-white/5 opacity-60'}`}>
                                    <div className={`w-24 font-bold ${config.day_of_week === 0 || config.day_of_week === 6 ? 'text-primary' : 'text-white'}`}>
                                        {DAYS[config.day_of_week]}
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer bg-black/20 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={config.is_active}
                                            onChange={(e) => handleConfigChange(index, 'is_active', e.target.checked)}
                                            className="accent-primary size-4"
                                        />
                                        <span className="text-sm font-medium">{config.is_active ? 'Aberto' : 'Fechado'}</span>
                                    </label>

                                    {config.is_active && (
                                        <div className="flex flex-wrap items-center gap-2 flex-1 animate-in fade-in slide-in-from-left-2">
                                            <input
                                                type="time"
                                                value={config.start_time.slice(0, 5)}
                                                onChange={(e) => handleConfigChange(index, 'start_time', e.target.value)}
                                                className="bg-black/20 rounded p-2 text-white border border-white/10 focus:border-primary outline-none transition-colors"
                                            />
                                            <span className="text-slate-500">até</span>
                                            <input
                                                type="time"
                                                value={config.end_time.slice(0, 5)}
                                                onChange={(e) => handleConfigChange(index, 'end_time', e.target.value)}
                                                className="bg-black/20 rounded p-2 text-white border border-white/10 focus:border-primary outline-none transition-colors"
                                            />

                                            <div className="h-4 w-px bg-white/10 mx-2 hidden md:block"></div>

                                            <span className="text-xs text-slate-400">Almoço:</span>
                                            <input
                                                type="time"
                                                value={config.lunch_start?.slice(0, 5) || ''}
                                                onChange={(e) => handleConfigChange(index, 'lunch_start', e.target.value || null)}
                                                className="bg-black/20 rounded p-2 text-white border border-white/10 focus:border-primary outline-none transition-colors w-24"
                                            />
                                            <span className="text-slate-500">-</span>
                                            <input
                                                type="time"
                                                value={config.lunch_end?.slice(0, 5) || ''}
                                                onChange={(e) => handleConfigChange(index, 'lunch_end', e.target.value || null)}
                                                className="bg-black/20 rounded p-2 text-white border border-white/10 focus:border-primary outline-none transition-colors w-24"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EXCEPTIONS */}
                {activeTab === 'exceptions' && (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Add Exception Form */}
                            <div className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col gap-4 h-fit">
                                <h3 className="text-lg font-bold">Gerenciar Exceção</h3>
                                <p className="text-xs text-slate-400">Adicione dias de folga ou dias de trabalho extra (feriados abertos).</p>

                                <div className="flex bg-black/20 p-1 rounded-lg">
                                    <button
                                        onClick={() => setExceptionType('blocked')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${exceptionType === 'blocked' ? 'bg-red-500/20 text-red-500 shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Bloquear (Folga)
                                    </button>
                                    <button
                                        onClick={() => setExceptionType('working')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${exceptionType === 'working' ? 'bg-green-500/20 text-green-500 shadow-sm' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        Disponível (Trabalho)
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-slate-400">Data</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="bg-black/20 rounded p-3 text-white border border-white/10 w-full focus:border-primary outline-none"
                                    />
                                </div>

                                {exceptionType === 'working' && (
                                    <div className="grid grid-cols-2 gap-2 animate-in fade-in">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-slate-400">Início</label>
                                            <input
                                                type="time"
                                                value={newBlockStart}
                                                onChange={(e) => setNewBlockStart(e.target.value)}
                                                className="bg-black/20 rounded p-3 text-white border border-white/10 w-full focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-slate-400">Fim</label>
                                            <input
                                                type="time"
                                                value={newBlockEnd}
                                                onChange={(e) => setNewBlockEnd(e.target.value)}
                                                className="bg-black/20 rounded p-3 text-white border border-white/10 w-full focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                {exceptionType === 'blocked' && (
                                    <div className="grid grid-cols-2 gap-2 animate-in fade-in opacity-50 hover:opacity-100 transition-opacity">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-slate-400">Início (Opcional)</label>
                                            <input
                                                type="time"
                                                value={newBlockStart}
                                                onChange={(e) => setNewBlockStart(e.target.value)}
                                                className="bg-black/20 rounded p-3 text-white border border-white/10 w-full focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-slate-400">Fim (Opcional)</label>
                                            <input
                                                type="time"
                                                value={newBlockEnd}
                                                onChange={(e) => setNewBlockEnd(e.target.value)}
                                                className="bg-black/20 rounded p-3 text-white border border-white/10 w-full focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm text-slate-400">Descrição / Motivo</label>
                                    <input
                                        type="text"
                                        placeholder={exceptionType === 'blocked' ? "Ex: Médico" : "Ex: Especial de Natal"}
                                        value={newBlockReason}
                                        onChange={(e) => setNewBlockReason(e.target.value)}
                                        className="bg-black/20 rounded p-3 text-white border border-white/10 w-full focus:border-primary outline-none"
                                    />
                                </div>

                                <button onClick={handleAddException} className={`w-full py-3 rounded-lg font-bold transition-all mt-2 ${exceptionType === 'blocked' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                                    {exceptionType === 'blocked' ? 'Bloquear Horário' : 'Liberar Horário'}
                                </button>
                            </div>

                            {/* Existing Blocks List */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-bold">Calendário de Exceções</h3>
                                {blocks.length === 0 ? (
                                    <p className="text-slate-500 italic">Nenhuma exceção cadastrada.</p>
                                ) : (
                                    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
                                        {blocks.map(block => (
                                            <div key={block.id} className={`p-4 rounded-xl border flex justify-between items-center group transition-colors ${block.type === 'working' ? 'bg-green-500/10 border-green-500/20 hover:border-green-500/50' : 'bg-red-500/10 border-red-500/20 hover:border-red-500/50'}`}>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${block.type === 'working' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                                            {block.type === 'working' ? 'Aberto' : 'Fechado'}
                                                        </span>
                                                        <p className="font-bold text-white">
                                                            {new Date(block.date).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-slate-300">
                                                        {block.start_time ? `${block.start_time.slice(0, 5)} - ${block.end_time?.slice(0, 5)}` : (block.type === 'working' ? 'Dia todo' : 'Dia inteiro')}
                                                    </p>
                                                    <p className={`text-xs mt-1 ${block.type === 'working' ? 'text-green-400' : 'text-red-400'}`}>{block.reason}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteBlock(block.id!)}
                                                    className="size-8 rounded-full bg-slate-700/50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {/* FINANCIAL DASHBOARD */}
                {activeTab === 'finance' && (
                    <BarberFinancials barberId={barberId} />
                )}

                {/* SERVICE MANAGER */}
                {activeTab === 'services' && (
                    <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                        <ServiceManager />
                    </div>
                )}
            </main>

            <BottomNavigation
                currentPage={Page.BARBER_PROFILE}
                setCurrentPage={() => { }}
                isBarber={true}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </div>
    );
};

export default BarberProfile;
