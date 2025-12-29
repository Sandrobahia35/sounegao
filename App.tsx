
import React, { useState, useEffect } from 'react';
import { Page, Service, UserInfo, Barber } from './types';
import { SERVICES, BARBERS, TIME_SLOTS, BUSY_SLOTS } from './constants';
import Header from './components/Header';
import ServiceCard from './components/ServiceCard';
import BarberCard from './components/BarberCard';
import Calendar from './components/Calendar';
import ChatBot from './components/ChatBot';
import Home from './components/Home';
import Services from './components/Services';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import BarberProfile from './components/BarberProfile';
import CustomerLogin from './components/CustomerLogin';
import MyAppointments from './components/MyAppointments';
import { User, getSession, logout as authLogout } from './services/authService';
import { CustomerUser, getCustomerSession, onCustomerAuthStateChange, signOutCustomer } from './services/customerAuthService';
import { getBarbers } from './services/barberService';
import { getServices } from './services/serviceService';
import { getAvailableSlots } from './services/scheduleService';
import WorkingHours from './components/WorkingHours';
import { createAppointment } from './services/appointmentService';
import BottomNavigation from './components/BottomNavigation';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    if (today.getDay() === 6) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + 1);
      return nextDay;
    }
    return today;
  });
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', phone: '', email: '' });
  const [isBooked, setIsBooked] = useState(false);

  // Staff Auth State (barbers/admins)
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // Customer Auth State (Google OAuth)
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [customerAuthLoading, setCustomerAuthLoading] = useState(true);

  // Page requiring authentication redirect
  const [pendingAuthPage, setPendingAuthPage] = useState<Page | null>(null);

  // Dynamic barbers list
  const [barbersList, setBarbersList] = useState<Barber[]>([]);

  // Dynamic services list
  const [servicesList, setServicesList] = useState<Service[]>([]);

  // Initialize session and load data on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Staff session (RPC-based)
      const session = getSession();
      if (session) {
        setLoggedInUser(session.user);
      }

      // Customer session (Supabase OAuth)
      const customer = await getCustomerSession();
      setCustomerUser(customer);
      setCustomerAuthLoading(false);

      const [barbers, services] = await Promise.all([
        getBarbers(),
        getServices()
      ]);
      setBarbersList(barbers);
      setServicesList(services);
    };
    loadInitialData();

    // Listen for customer auth state changes
    const unsubscribe = onCustomerAuthStateChange((user) => {
      setCustomerUser(user);
      setCustomerAuthLoading(false);
      // If user just logged in and had a pending page, redirect there
      if (user && pendingAuthPage) {
        setCurrentPage(pendingAuthPage);
        setPendingAuthPage(null);
      }
    });

    return () => unsubscribe();
  }, [pendingAuthPage]);

  // Reload barbers and services when returning to booking page
  useEffect(() => {
    if (currentPage === Page.BOOKING) {
      const reloadData = async () => {
        const [barbers, services] = await Promise.all([
          getBarbers(),
          getServices()
        ]);
        setBarbersList(barbers);
        setServicesList(services);
      };
      reloadData();
    }
  }, [currentPage]);

  // Update userInfo when customer logs in
  useEffect(() => {
    if (customerUser) {
      setUserInfo(prev => ({
        ...prev,
        name: customerUser.name || prev.name,
        email: customerUser.email || prev.email
      }));
    }
  }, [customerUser]);

  useEffect(() => {
    if (selectedDate.getDay() === 0) {
      const hour = parseInt(selectedTime.split(':')[0]);
      if (hour >= 13) {
        setSelectedTime('10:00');
      }
    }
  }, [selectedDate, selectedTime]);

  const handleConfirm = async () => {
    if (!selectedBarber) {
      alert("Por favor, selecione um profissional.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Por favor, selecione pelo menos um serviço.");
      return;
    }
    if (selectedDate.getDay() === 6) {
      alert("A barbearia não funciona aos sábados. Por favor, escolha outro dia.");
      return;
    }
    if (!userInfo.name || !userInfo.phone) {
      alert("Por favor, preencha seu nome e telefone para continuar.");
      return;
    }
    if (!selectedBarber) {
      alert("Por favor, selecione um profissional.");
      return;
    }

    setIsBooked(true);

    try {
      const result = await createAppointment({
        barberId: selectedBarber.id,
        customerName: userInfo.name,
        customerPhone: userInfo.phone,
        customerEmail: customerUser?.email || userInfo.email, // Use authenticated email if available
        date: selectedDate,
        time: selectedTime,
        serviceIds: selectedServices.map((s: Service) => s.id),
        userId: customerUser?.id // Pass User ID for robust sync
      });

      if (result.success) {
        const serviceNames = selectedServices.map((s: Service) => s.name).join(", ");
        alert(`Agendamento realizado com sucesso para ${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime} com ${selectedBarber.name}!\nServiços: ${serviceNames}`);
        setCurrentPage(Page.HOME);
      } else {
        alert("Erro ao realizar agendamento: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Booking catch error:", error);
      alert("Erro ao realizar agendamento. Tente novamente.");
    } finally {
      setIsBooked(false);
    }
  };

  const toggleService = (service: Service) => {
    setSelectedServices((prev: Service[]) => {
      const isAlreadySelected = prev.find((s: Service) => s.id === service.id);
      if (isAlreadySelected) {
        if (prev.length === 1) return prev;
        return prev.filter((s: Service) => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleLoginSuccess = (user: User) => {
    setLoggedInUser(user);
    if (user.role === 'system_admin' || user.role === 'admin') {
      setCurrentPage(Page.ADMIN);
    } else {
      setCurrentPage(Page.BARBER_PROFILE);
    }
  };

  const handleLogout = () => {
    authLogout();
    setLoggedInUser(null);
    setCurrentPage(Page.HOME);
  };

  const handleCustomerLogout = async () => {
    await signOutCustomer();
    setCustomerUser(null);
    setCurrentPage(Page.HOME);
  };

  const calculateTotal = () => {
    let total = 0;
    let hasQuote = false;
    selectedServices.forEach((s: Service) => {
      if (typeof s.price === 'number') {
        total += s.price;
      } else {
        hasQuote = true;
      }
    });
    return { total, hasQuote };
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('pt-BR', { month: 'long' });
    return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  };

  const dayOfWeekIndex = selectedDate.getDay();
  const dayOfWeek = selectedDate.toLocaleString('pt-BR', { weekday: 'long' });
  const capitalizedDayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  const { total, hasQuote } = calculateTotal();

  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedBarber && selectedDate) {
        setAvailableSlots([]); // Clear while fetching
        try {
          // If Sunday logic is handled by service config, we rely on service.
          // But service returns [] for Sunday by default unless configured.
          const slots = await getAvailableSlots(selectedBarber.id, selectedDate);
          setAvailableSlots(slots);
        } catch (error) {
          console.error("Error fetching slots", error);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [selectedBarber, selectedDate]);

  const renderContent = () => {
    switch (currentPage) {
      case Page.HOME:
        return (
          <Home
            onStartBooking={() => setCurrentPage(Page.BOOKING)}
            onViewServices={() => setCurrentPage(Page.SERVICES)}
          />
        );

      case Page.SERVICES:
        return (
          <Services onStartBooking={() => setCurrentPage(Page.BOOKING)} />
        );

      case Page.LOGIN:
        return (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => setCurrentPage(Page.HOME)}
          />
        );

      case Page.ADMIN:
        if (!loggedInUser || (loggedInUser.role !== 'admin' && loggedInUser.role !== 'system_admin')) {
          setCurrentPage(Page.LOGIN);
          return null;
        }
        return <AdminDashboard currentUser={loggedInUser} onLogout={handleLogout} />;

      case Page.BARBER_PROFILE:
        if (!loggedInUser || loggedInUser.role !== 'barber') {
          setCurrentPage(Page.LOGIN);
          return null;
        }
        return <BarberProfile currentUser={loggedInUser} onLogout={handleLogout} />;

      case Page.BOOKING:
        // Protected route - require customer login
        if (!customerUser && !customerAuthLoading) {
          return (
            <CustomerLogin
              onCancel={() => setCurrentPage(Page.HOME)}
              message="Faça login para agendar seu horário."
            />
          );
        }
        // If still loading auth, show loading state
        if (customerAuthLoading) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          );
        }
        return (
          <div className="flex flex-col lg:flex-row gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex-1 flex flex-col gap-10">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em] text-slate-900 dark:text-white">Agende seu horário</h1>
                <p className="text-slate-500 dark:text-text-secondary text-lg font-normal">Sua melhor versão começa com o profissional certo.</p>
              </div>

              {/* Step 1: Professional */}
              <section className="flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-border-dark pb-2">
                  <span className="flex items-center justify-center size-8 rounded-full bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold">1</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Escolha o Profissional</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {barbersList.map((b: Barber) => (
                    <BarberCard
                      key={b.id}
                      barber={b}
                      isSelected={selectedBarber?.id === b.id}
                      onSelect={setSelectedBarber}
                    />
                  ))}
                </div>
              </section>

              {/* Step 2: Services (Combo) */}
              <section className="flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-border-dark pb-2">
                  <span className="flex items-center justify-center size-8 rounded-full bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold">2</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Monte seu Combo</h2>
                </div>
                <p className="text-sm text-slate-500 -mt-2">Você pode selecionar mais de um serviço para o seu atendimento.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesList.map((s: Service) => (
                    <ServiceCard
                      key={s.id}
                      service={s}
                      isSelected={!!selectedServices.find((selected: Service) => selected.id === s.id)}
                      onSelect={toggleService}
                    />
                  ))}
                </div>
              </section>

              {/* Step 3: Date & Time */}
              <section className="flex flex-col gap-5">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-border-dark pb-2">
                  <span className="flex items-center justify-center size-8 rounded-full bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold">3</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Data e Hora</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-6">
                    <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
                    {selectedBarber && <WorkingHours barberId={selectedBarber.id} />}
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-text-secondary mb-1">
                      Horários Disponíveis ({capitalizedDayOfWeek})
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {availableSlots.map((time: string) => {
                        const isBusy = BUSY_SLOTS.includes(time);
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            disabled={isBusy}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${isSelected
                              ? 'border-primary bg-primary text-white shadow-md shadow-primary/20 font-bold'
                              : isBusy
                                ? 'border-transparent bg-slate-100 dark:bg-surface-dark/50 text-slate-300 dark:text-slate-700 cursor-not-allowed line-through'
                                : 'border-slate-200 dark:border-border-dark text-slate-600 dark:text-text-secondary hover:border-primary hover:text-primary dark:hover:text-white dark:hover:border-primary'
                              }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                    {dayOfWeekIndex === 0 && (
                      <p className="text-[10px] text-orange-400 font-bold uppercase mt-2">
                        * Aos domingos funcionamos apenas até as 13:00.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Step 4: Contact Info */}
              <section className="flex flex-col gap-5 pb-10">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-border-dark pb-2">
                  <span className="flex items-center justify-center size-8 rounded-full bg-slate-100 dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold">4</span>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Seus Dados</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-text-secondary">Nome Completo</label>
                    <input
                      value={userInfo.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInfo({ ...userInfo, name: e.target.value })}
                      className="h-12 w-full rounded-lg border border-slate-300 dark:border-border-dark bg-transparent px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Ex: João da Silva"
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-text-secondary">Celular (WhatsApp)</label>
                    <input
                      value={userInfo.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      className="h-12 w-full rounded-lg border border-slate-300 dark:border-border-dark bg-transparent px-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="(00) 00000-0000"
                      type="tel"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Summary (Sticky) */}
            <div className="w-full lg:w-[380px] shrink-0">
              <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Resumo do Agendamento</h3>
                <div className="flex flex-col gap-6">
                  <div className="flex gap-4">
                    <div className="size-12 shrink-0 rounded-lg overflow-hidden border border-border-dark">
                      {selectedBarber ? (
                        <img src={selectedBarber.photoUrl} className="size-full object-cover" alt={selectedBarber.name} />
                      ) : (
                        <div className="size-full bg-slate-200 dark:bg-surface-dark flex items-center justify-center text-slate-400">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Profissional</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{selectedBarber?.name || 'Selecione um profissional'}</span>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-border-dark"></div>

                  <div className="flex flex-col gap-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Serviços Selecionados</span>
                    <div className="flex flex-col gap-3">
                      {selectedServices.map((s: Service) => (
                        <div key={s.id} className="flex justify-between items-center bg-slate-50 dark:bg-background-dark/50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">{s.icon}</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            {typeof s.price === 'number' ? `R$ ${s.price.toFixed(2).replace('.', ',')}` : 'Sob Consulta'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-border-dark"></div>

                  <div className="flex gap-4">
                    <div className="size-12 shrink-0 rounded-lg bg-slate-100 dark:bg-background-dark flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">calendar_today</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-slate-500 dark:text-text-secondary uppercase tracking-wider">Data e Hora</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">{formatDate(selectedDate)}</span>
                      <span className="text-sm text-slate-500 dark:text-text-secondary">{capitalizedDayOfWeek} às {selectedTime}</span>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-border-dark"></div>

                  <div className="flex justify-between items-end mt-2">
                    <span className="text-sm font-medium text-slate-500 dark:text-text-secondary">Total a pagar</span>
                    <div className="flex flex-col items-end">
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        R$ {total.toFixed(2).replace('.', ',')}
                      </span>
                      {hasQuote && <span className="text-[10px] text-orange-400 font-bold uppercase">+ Sob Consulta</span>}
                    </div>
                  </div>
                  <button
                    disabled={isBooked || dayOfWeekIndex === 6}
                    onClick={handleConfirm}
                    className={`w-full mt-4 flex h-14 items-center justify-center rounded-xl bg-primary hover:bg-primary/90 transition-all text-white text-base font-bold tracking-[0.015em] shadow-lg shadow-primary/30 active:scale-[0.98] ${isBooked || dayOfWeekIndex === 6 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {isBooked ? 'Agendando...' : dayOfWeekIndex === 6 ? 'Sábado (Fechado)' : 'Confirmar Agendamento'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case Page.MY_BOOKINGS:
        // Protected route - require customer login
        if (!customerUser && !customerAuthLoading) {
          return (
            <CustomerLogin
              onCancel={() => setCurrentPage(Page.HOME)}
              message="Faça login para ver seus agendamentos."
            />
          );
        }
        // If still loading auth, show loading state
        if (customerAuthLoading) {
          return (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
          );
        }
        return <MyAppointments customer={customerUser} onLogout={handleCustomerLogout} />;

      default:
        // Default error or other pages fall back to common styling
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6 animate-in fade-in duration-500">
            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-border-dark">construction</span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Página em Construção</h2>
            <p className="text-slate-500 max-w-md">Esta funcionalidade está em desenvolvimento.</p>
            <button
              onClick={() => setCurrentPage(Page.HOME)}
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        );
    }
  };

  // If in Login, Admin, or Barber Profile, we might want full-screen without header/footer or simplified layer
  // But keeping header for simplicity is fine, or hiding it.
  // Let's hide standard Header/Footer for Admin/Barber/Login pages for a cleaner "App" feel.
  const isProtectedPage = [Page.ADMIN, Page.BARBER_PROFILE, Page.LOGIN].includes(currentPage);

  if (isProtectedPage) {
    return renderContent();
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background-dark">
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        customerUser={customerUser}
        onCustomerLogout={handleCustomerLogout}
      />

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 lg:px-8 py-8 lg:py-12 pb-24 md:pb-12">
        {renderContent()}
      </main>

      <BottomNavigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <footer className="mt-auto border-t border-border-dark bg-[#111722] py-16">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined filled-icon">content_cut</span>
              </div>
              <h2 className="text-white text-xl font-bold">Sou Negão</h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Estilo, tradição e modernidade. O lugar onde você renova sua autoestima com os melhores profissionais.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold uppercase tracking-wider text-xs">Links Rápidos</h3>
            <ul className="flex flex-col gap-4">
              <li><button onClick={() => setCurrentPage(Page.BOOKING)} className="text-slate-500 text-sm hover:text-white transition-colors">Agendar</button></li>
              <li><button onClick={() => setCurrentPage(Page.SERVICES)} className="text-slate-500 text-sm hover:text-white transition-colors">Nossos Barbeiros</button></li>
              <li><button className="text-slate-500 text-sm hover:text-white transition-colors">Produtos</button></li>
              <li>
                <button
                  onClick={() => setCurrentPage(Page.LOGIN)}
                  className="text-primary text-sm font-bold hover:text-white transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  Área do Profissional
                </button>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold uppercase tracking-wider text-xs">Contato</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">location_on</span>
                <span className="text-slate-500 text-sm">Rua Senhor do Bonfim S/N</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-0.5">call</span>
                <span className="text-slate-500 text-sm">73 - 98825 - 9991</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold uppercase tracking-wider text-xs">Horário</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Seg - Sex</span>
                <span className="text-slate-300">09:00 - 19:30</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Sábado</span>
                <span className="text-red-500 font-bold uppercase text-[10px]">Fechado</span>
              </li>
              <li className="flex justify-between text-sm">
                <span className="text-slate-500">Domingo</span>
                <span className="text-slate-300">09:00 - 13:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-10 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-xs">© 2026 Sou Negão Barbearia. Todos os direitos reservados.</p>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
