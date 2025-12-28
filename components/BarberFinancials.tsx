
import React, { useState, useEffect } from 'react';
import { BarberFinancialData, getBarberFinancials } from '../services/appointmentService';

interface BarberFinancialsProps {
    barberId: string;
}

const BarberFinancials: React.FC<BarberFinancialsProps> = ({ barberId }) => {
    const [data, setData] = useState<BarberFinancialData[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Set default to current month on mount
    useEffect(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (barberId && startDate && endDate) {
            loadFinancials();
        }
    }, [barberId, startDate, endDate]);

    const loadFinancials = async () => {
        setLoading(true);
        const result = await getBarberFinancials(barberId, startDate, endDate);
        setData(result);
        setLoading(false);
    };

    const handleQuickFilter = (type: 'today' | 'month') => {
        const today = new Date();
        if (type === 'today') {
            const dateStr = today.toISOString().split('T')[0];
            setStartDate(dateStr);
            setEndDate(dateStr);
        } else {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setStartDate(firstDay.toISOString().split('T')[0]);
            setEndDate(lastDay.toISOString().split('T')[0]);
        }
    };

    const calculateStats = () => {
        const totalRevenue = data.reduce((acc, curr) => acc + curr.total_price, 0);
        const totalServices = data.length;
        const avgTicket = totalServices > 0 ? totalRevenue / totalServices : 0;
        return { totalRevenue, totalServices, avgTicket };
    };

    const { totalRevenue, totalServices, avgTicket } = calculateStats();

    // Prepare Chart Data (Group by Day)
    const chartData = data.reduce((acc, curr) => {
        const date = curr.appointment_date; // YYYY-MM-DD
        acc[date] = (acc[date] || 0) + curr.total_price;
        return acc;
    }, {} as Record<string, number>);

    // Generate array for chart sorted by date
    const sortedDates = Object.keys(chartData).sort();
    const chartValues = sortedDates.map(date => ({
        date,
        value: chartData[date],
        label: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    }));

    const maxChartValue = Math.max(...chartValues.map(d => d.value), 100); // Min 100 to avoid div by zero

    const exportToCSV = () => {
        const headers = ['Data', 'Hora', 'Cliente', 'Serviços', 'Valor', 'Status'];
        const csvContent = [
            headers.join(','),
            ...data.map(item => [
                item.appointment_date,
                item.appointment_time,
                `"${item.customer_name}"`,
                `"${item.service_names}"`,
                item.total_price.toFixed(2),
                item.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financeiro_${startDate}_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center bg-surface-dark p-4 rounded-xl border border-white/5">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-bold">Início</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-black/20 rounded-lg px-3 py-2 text-white border border-white/10 focus:border-primary outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-bold">Fim</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-black/20 rounded-lg px-3 py-2 text-white border border-white/10 focus:border-primary outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => handleQuickFilter('today')}
                        className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => handleQuickFilter('month')}
                        className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors"
                    >
                        Mês Atual
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-green-600/20 text-green-500 hover:bg-green-600/30 text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        title="Exportar CSV"
                    >
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">payments</span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Faturamento</p>
                    <h3 className="text-3xl font-black text-green-400 mt-1">
                        R$ {totalRevenue.toFixed(2).replace('.', ',')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">No período selecionado</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">content_cut</span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Serviços</p>
                    <h3 className="text-3xl font-black text-white mt-1">
                        {totalServices}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Agendamentos concluídos</p>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-6xl">trending_up</span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Ticket Médio</p>
                    <h3 className="text-3xl font-black text-blue-400 mt-1">
                        R$ {avgTicket.toFixed(2).replace('.', ',')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2">Por atendimento</p>
                </div>
            </div>

            {/* Chart Section */}
            {chartValues.length > 0 && (
                <div className="bg-surface-dark p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-6">Evolução do Faturamento</h3>
                    <div className="h-60 flex items-end gap-2 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
                        {chartValues.map((item) => (
                            <div key={item.date} className="flex flex-col items-center gap-2 group min-w-[40px]">
                                <div className="relative w-8 bg-white/5 rounded-t-lg group-hover:bg-primary/50 transition-all flex items-end justify-center" style={{ height: `${(item.value / maxChartValue) * 100}%` }}>
                                    <div className="absolute -top-8 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded pointer-events-none whitespace-nowrap">
                                        R$ {item.value.toFixed(0)}
                                    </div>
                                    <div className="w-full bg-primary/20 h-full absolute bottom-0 rounded-t-lg group-hover:bg-primary transition-all"></div>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold rotate-0 whitespace-nowrap">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detailed Table */}
            <div className="bg-surface-dark rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-[#111722]">
                    <h3 className="text-lg font-bold">Detalhamento de Serviços</h3>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500">Carregando dados...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">Nenhum serviço realizado neste período.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <th className="p-4">Data</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Serviços</th>
                                    <th className="p-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors text-sm">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="font-bold text-white">
                                                {new Date(item.appointment_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {item.appointment_time.slice(0, 5)}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-slate-300">
                                            {item.customer_name}
                                        </td>
                                        <td className="p-4 text-slate-400 italic text-xs max-w-[200px] truncate" title={item.service_names}>
                                            {item.service_names}
                                        </td>
                                        <td className="p-4 text-right font-bold text-green-400">
                                            R$ {item.total_price.toFixed(2).replace('.', ',')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BarberFinancials;
