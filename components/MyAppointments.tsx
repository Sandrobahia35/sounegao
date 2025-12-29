import React, { useState, useEffect } from 'react';
import { CustomerUser } from '../services/customerAuthService';
import { CustomerAppointment, getCustomerAppointments, updateAppointmentStatus, deleteAppointment, rescheduleAppointment } from '../services/appointmentService';

interface MyAppointmentsProps {
    customer: CustomerUser;
    onLogout: () => void;
}

const MyAppointments: React.FC<MyAppointmentsProps> = ({ customer, onLogout }) => {
    const [upcoming, setUpcoming] = useState<CustomerAppointment[]>([]);
    const [history, setHistory] = useState<CustomerAppointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [actionLoading, setActionLoading] = useState(false);

    // Reschedule State
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedApt, setSelectedApt] = useState<CustomerAppointment | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const reloadData = async () => {
        if (customer.email) {
            setIsLoading(true);
            const result = await getCustomerAppointments(customer.email);
            setUpcoming(result.upcoming);
            setHistory(result.history);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadAppointments = async () => {
            setIsLoading(true);
            const result = await getCustomerAppointments(customer.email);
            setUpcoming(result.upcoming);
            setHistory(result.history);
            setIsLoading(false);
        };

        if (customer.email) {
            loadAppointments();
        }
    }, [customer.email]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const formatTime = (timeStr: string) => {
        return timeStr.substring(0, 5);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
            confirmed: { label: 'Confirmado', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
            completed: { label: 'Concluído', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            cancelled: { label: 'Cancelado', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${config.className}`}>
                {config.label}
            </span>
        );
    };

    const canModify = (dateStr: string, timeStr: string) => {
        const aptDate = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diffInMinutes = (aptDate.getTime() - now.getTime()) / 1000 / 60;
        return diffInMinutes > 30;
    };

    const handleCancel = async (apt: CustomerAppointment) => {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        setActionLoading(true);
        const result = await updateAppointmentStatus(apt.id, 'cancelled');
        if (result.success) {
            alert('Agendamento cancelado com sucesso.');
            reloadData();
        } else {
            alert('Erro ao cancelar: ' + result.error);
        }
        setActionLoading(false);
    };

    const handleDelete = async (apt: CustomerAppointment) => {
        if (!confirm('Tem certeza que deseja excluir pementemente este registro?')) return;

        setActionLoading(true);
        const result = await deleteAppointment(apt.id);
        if (result.success) {
            alert('Agendamento excluído.');
            reloadData();
        } else {
            alert('Erro ao excluir: ' + result.error);
        }
        setActionLoading(false);
    };

    const openReschedule = (apt: CustomerAppointment) => {
        setSelectedApt(apt);
        setNewDate(apt.appointment_date);
        setNewTime(apt.appointment_time.substring(0, 5));
        setShowRescheduleModal(true);
    };

    const handleRescheduleSubmit = async () => {
        if (!selectedApt || !newDate || !newTime) return;

        setActionLoading(true);
        const result = await rescheduleAppointment(selectedApt.id, newDate, newTime);
        if (result.success) {
            alert('Agendamento reagendado com sucesso!');
            setShowRescheduleModal(false);
            setSelectedApt(null);
            reloadData();
        } else {
            alert('Erro ao reagendar: ' + result.error);
        }
        setActionLoading(false);
    };

    const renderAppointmentCard = (apt: CustomerAppointment) => {
        const isEditable = activeTab === 'upcoming' && canModify(apt.appointment_date, apt.appointment_time);

        return (
            <div
                key={apt.id}
                className="bg-[#111722] border border-white/10 rounded-xl p-5 flex flex-col gap-4 hover:border-primary/30 transition-colors"
            >
                {/* Header with barber info */}
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
                        {apt.barber_photo_url ? (
                            <img src={apt.barber_photo_url} alt={apt.barber_name} className="size-full object-cover" />
                        ) : (
                            <div className="size-full bg-surface-dark flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold truncate">{apt.barber_name}</h3>
                        <p className="text-slate-500 text-sm truncate">{apt.service_names}</p>
                    </div>
                    {getStatusBadge(apt.status)}
                </div>

                {/* Date and Time */}
                <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                        <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                        <span className="text-slate-300 text-sm capitalize">{formatDate(apt.appointment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                        <span className="text-white font-bold">{formatTime(apt.appointment_time)}</span>
                    </div>
                </div>

                {/* Price if available */}
                {apt.total_price && (
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-slate-500 text-sm">Total</span>
                        <span className="text-white font-bold">
                            R$ {apt.total_price.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                )}


                {/* Actions */}
                <div className="flex gap-2 mt-2 pt-4 border-t border-white/5">
                    {isEditable ? (
                        <>
                            <button
                                onClick={() => openReschedule(apt)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Editar
                            </button>
                            <button
                                onClick={() => handleCancel(apt)}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                                Cancelar
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 text-center text-xs text-slate-600 self-center">
                            {activeTab === 'upcoming' ? 'Edição indisponível (menos de 30min)' : null}
                        </div>
                    )}

                    {(activeTab === 'history' || apt.status === 'cancelled') && (
                        <button
                            onClick={() => handleDelete(apt)}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            title="Excluir histórico"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                    )}
                </div>
            </div>
        );
    };


    const renderEmptyState = (type: 'upcoming' | 'history') => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-slate-600">
                    {type === 'upcoming' ? 'event_available' : 'history'}
                </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
                {type === 'upcoming' ? 'Nenhum agendamento futuro' : 'Nenhum histórico'}
            </h3>
            <p className="text-slate-500 text-sm max-w-xs">
                {type === 'upcoming'
                    ? 'Você ainda não tem agendamentos marcados. Que tal agendar agora?'
                    : 'Seu histórico de agendamentos aparecerá aqui.'}
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#111722]/95 backdrop-blur-md border-b border-white/10 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full overflow-hidden border-2 border-primary/30">
                            {customer.avatarUrl ? (
                                <img src={customer.avatarUrl} alt={customer.name} className="size-full object-cover" />
                            ) : (
                                <div className="size-full bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-sm">Olá, {customer.name.split(' ')[0]}!</h1>
                            <p className="text-slate-500 text-xs">{customer.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-sm"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <span className="hidden sm:inline">Sair</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 pb-24">
                <h2 className="text-2xl font-black text-white mb-6">Meus Agendamentos</h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'upcoming'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">event</span>
                            Próximos ({upcoming.length})
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${activeTab === 'history'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">history</span>
                            Histórico ({history.length})
                        </span>
                    </button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 text-sm">Carregando agendamentos...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                        {activeTab === 'upcoming' && (
                            upcoming.length > 0
                                ? upcoming.map(renderAppointmentCard)
                                : renderEmptyState('upcoming')
                        )}
                        {activeTab === 'history' && (
                            history.length > 0
                                ? history.map(renderAppointmentCard)
                                : renderEmptyState('history')
                        )}
                    </div>
                )}
            </main>

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#1e293b] rounded-2xl w-full max-w-sm p-6 border border-white/10 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Reagendar</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Nova Data</label>
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">Novo Horário</label>
                                <input
                                    type="time"
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowRescheduleModal(false)}
                                    className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleRescheduleSubmit}
                                    disabled={actionLoading}
                                    className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {actionLoading ? 'Salvando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyAppointments;
