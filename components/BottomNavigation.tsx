
import React from 'react';
import { Page } from '../types';

interface BottomNavProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    isBarber?: boolean;
    activeTab?: string;
    setActiveTab?: (tab: any) => void;
}

const BottomNavigation: React.FC<BottomNavProps> = ({ currentPage, setCurrentPage, isBarber, activeTab, setActiveTab }) => {

    // Main App Navigation Items
    const mainItems = [
        { id: Page.HOME, label: 'Início', icon: 'home' },
        { id: Page.BOOKING, label: 'Agendar', icon: 'add_circle' },
        { id: Page.SERVICES, label: 'Serviços', icon: 'content_cut' },
        { id: Page.MY_BOOKINGS, label: 'Meus', icon: 'calendar_month' },
    ];

    // Barber Profile Navigation Items
    const barberItems = [
        { id: 'appointments', label: 'Agenda', icon: 'book' },
        { id: 'daily', label: 'Diário', icon: 'event_busy' },
        { id: 'weekly', label: 'Padrão', icon: 'settings_backup_restore' },
        { id: 'exceptions', label: 'Feriados', icon: 'event_repeat' },
        { id: 'services', label: 'Serviços', icon: 'content_cut' },
        { id: 'finance', label: 'Gestão', icon: 'monitoring' },
    ];

    // Admin Dashboard Navigation Items
    const adminItems = [
        { id: 'appointments', label: 'Agenda', icon: 'calendar_today' },
        { id: 'services', label: 'Serviços', icon: 'content_cut' },
        { id: 'barbers', label: 'Equipe', icon: 'groups' },
        { id: 'users', label: 'Usuários', icon: 'manage_accounts' },
        { id: 'settings', label: 'Config', icon: 'settings' },
    ];

    let items: any[] = mainItems;
    if (currentPage === Page.BARBER_PROFILE) items = barberItems;
    if (currentPage === Page.ADMIN) items = adminItems;

    return (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#111722]/95 backdrop-blur-lg border-t border-white/10 z-[100] safe-area-bottom">
            <div className="flex items-center h-16 px-2 overflow-x-auto no-scrollbar gap-2 hide-scrollbar">
                {items.map((item) => {
                    const isActive = (currentPage === Page.BARBER_PROFILE || currentPage === Page.ADMIN)
                        ? activeTab === item.id
                        : currentPage === item.id;
                    const onClick = () => {
                        if (isBarber && setActiveTab) {
                            setActiveTab(item.id);
                        } else {
                            setCurrentPage(item.id as Page);
                        }
                    };

                    return (
                        <button
                            key={item.id}
                            onClick={onClick}
                            className={`flex flex-col items-center justify-center flex-1 min-w-[70px] transition-all ${isActive ? 'text-primary' : 'text-slate-500'
                                }`}
                        >
                            <span className={`material-symbols-outlined transition-transform ${isActive ? 'scale-110 !filled-icon' : ''}`}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-tighter mt-0.5">
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavigation;
