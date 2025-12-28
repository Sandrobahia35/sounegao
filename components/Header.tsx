
import React from 'react';
import { Page } from '../types';
import { CustomerUser } from '../services/customerAuthService';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  customerUser?: CustomerUser | null;
  onCustomerLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, customerUser, onCustomerLogout }) => {

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 dark:border-b-border-dark bg-white/90 dark:bg-[#111722]/90 backdrop-blur-md px-4 md:px-6 lg:px-10 py-3">
      <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => setCurrentPage(Page.HOME)}>
        <div className="flex items-center justify-center size-9 md:size-10 rounded-full bg-white/5 border border-white/10 shadow-lg">
          <img src="/logo.jpg" alt="Sou Negão Logo" className="w-full h-full object-cover rounded-full" />
        </div>
        <h2 className="text-slate-900 dark:text-white text-lg md:text-xl font-black leading-tight tracking-[-0.015em] uppercase">Sou Negão</h2>
      </div>
      <div className="hidden md:flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <button
            onClick={() => setCurrentPage(Page.HOME)}
            className={`${currentPage === Page.HOME ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-text-secondary hover:text-primary dark:hover:text-white'} text-sm font-medium leading-normal transition-colors`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentPage(Page.BOOKING)}
            className={`${currentPage === Page.BOOKING ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-text-secondary hover:text-primary dark:hover:text-white'} text-sm font-medium leading-normal transition-colors`}
          >
            Agendar
          </button>
          <button
            onClick={() => setCurrentPage(Page.SERVICES)}
            className={`${currentPage === Page.SERVICES ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-text-secondary hover:text-primary dark:hover:text-white'} text-sm font-medium leading-normal transition-colors`}
          >
            Serviços
          </button>
        </div>

        {/* Customer Auth Section */}
        {customerUser ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Page.MY_BOOKINGS)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <div className="size-6 rounded-full overflow-hidden border border-primary/30">
                {customerUser.avatarUrl ? (
                  <img src={customerUser.avatarUrl} alt={customerUser.name} className="size-full object-cover" />
                ) : (
                  <div className="size-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                    <span className="material-symbols-outlined text-sm">person</span>
                  </div>
                )}
              </div>
              <span className="text-white text-sm font-medium truncate max-w-[100px]">
                {customerUser.name.split(' ')[0]}
              </span>
            </button>
            <button
              onClick={onCustomerLogout}
              className="flex items-center justify-center size-10 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCurrentPage(Page.MY_BOOKINGS)}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary hover:bg-primary/90 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Meus Agendamentos</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
