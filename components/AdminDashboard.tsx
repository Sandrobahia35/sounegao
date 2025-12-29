import React, { useState, useEffect, useRef } from 'react';
import { Barber, Service, Page } from '../types';
import { getUsers, deleteUser, createUser, User, UserRole } from '../services/authService';
import { getBarbers, deleteBarber, createBarber, updateBarber } from '../services/barberService';
import ServiceManager from './ServiceManager';
import BottomNavigation from './BottomNavigation';

interface AdminDashboardProps {
    currentUser: User;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'barbers' | 'users' | 'settings'>('appointments');
    const [users, setUsers] = useState<User[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);

    // New user form
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<UserRole>('barber');
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Barber form
    const [showBarberForm, setShowBarberForm] = useState(false);
    const [editingBarber, setEditingBarber] = useState<Barber | null>(null);
    const [barberName, setBarberName] = useState('');
    const [barberPhotoUrl, setBarberPhotoUrl] = useState('');
    const [barberFormError, setBarberFormError] = useState('');
    const [barberFormSuccess, setBarberFormSuccess] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Service form state removed (moved to ServiceManager)

    const isSystemAdmin = currentUser.role === 'system_admin';

    useEffect(() => {
        loadUsers();
        loadBarbers();
    }, []);

    const loadUsers = async () => {
        const data = await getUsers();
        setUsers(data);
    };

    const loadBarbers = async () => {
        const data = await getBarbers();
        setBarbers(data);
    };



    // === USER HANDLERS ===
    const handleCreateUser = async () => {
        setFormError('');
        setFormSuccess('');
        if (!newUserName || !newUserEmail || !newUserPassword) {
            setFormError('Preencha todos os campos.');
            return;
        }
        const result = await createUser({ name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole });
        if (result.success) {
            setFormSuccess('Usuário criado com sucesso!');
            setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); setNewUserRole('barber');
            loadUsers();
            setTimeout(() => { setShowNewUserForm(false); setFormSuccess(''); }, 1500);
        } else {
            setFormError(result.error || 'Erro ao criar usuário.');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            const result = await deleteUser(id);
            if (result.success) loadUsers();
            else alert(result.error);
        }
    };

    // === BARBER HANDLERS ===
    const openNewBarberForm = () => {
        setEditingBarber(null); setBarberName(''); setBarberPhotoUrl(''); setSelectedPhoto(null); setSelectedUserId('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setBarberFormError(''); setBarberFormSuccess(''); setShowBarberForm(true);
    };

    const openEditBarberForm = (barber: Barber) => {
        setEditingBarber(barber); setBarberName(barber.name); setBarberPhotoUrl(barber.photoUrl); setSelectedPhoto(null);
        setSelectedUserId(barber.userId || '');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setBarberFormError(''); setBarberFormSuccess(''); setShowBarberForm(true);
    };

    const handleSaveBarber = async () => {
        setBarberFormError(''); setBarberFormSuccess('');
        if (!barberName) { setBarberFormError('O nome é obrigatório.'); return; }

        if (editingBarber) {
            const result = await updateBarber(editingBarber.id, { name: barberName, photo: selectedPhoto, userId: selectedUserId || undefined });
            if (result.success) {
                setBarberFormSuccess('Barbeiro atualizado!'); loadBarbers();
                setTimeout(() => { setShowBarberForm(false); setBarberFormSuccess(''); }, 1000);
            } else setBarberFormError(result.error || 'Erro ao atualizar.');
        } else {
            const result = await createBarber({ name: barberName, photo: selectedPhoto, userId: selectedUserId || undefined });
            if (result.success) {
                setBarberFormSuccess('Barbeiro criado!'); loadBarbers();
                setTimeout(() => { setShowBarberForm(false); setBarberFormSuccess(''); }, 1000);
            } else setBarberFormError(result.error || 'Erro ao criar.');
        }
    };

    const handleDeleteBarber = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este barbeiro?')) {
            const result = await deleteBarber(id);
            if (result.success) loadBarbers();
            else alert(result.error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => setBarberPhotoUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // Service handlers removed (moved to ServiceManager)

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'system_admin': return <span className="px-2 py-1 text-[10px] font-bold uppercase bg-purple-500/20 text-purple-400 rounded">Sistema</span>;
            case 'admin': return <span className="px-2 py-1 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 rounded">Admin</span>;
            case 'barber': return <span className="px-2 py-1 text-[10px] font-bold uppercase bg-green-500/20 text-green-400 rounded">Barbeiro</span>;
        }
    };

    const iconOptions = ['content_cut', 'face', 'child_care', 'face_retouching_natural', 'brush', 'person', 'build', 'diamond', 'star', 'auto_fix_high'];

    return (
        <div className="flex flex-col min-h-screen bg-background-dark text-white animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-[#111722]">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center font-bold">
                        {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">{currentUser.name}</h1>
                        <p className="text-xs text-slate-400">{currentUser.email}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">logout</span> Sair
                </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 pb-24 md:pb-0">
                {/* Sidebar - Hidden on Mobile */}
                <aside className="hidden md:flex w-full md:w-64 bg-[#111722]/50 border-r border-white/5 p-4 flex-col gap-2">
                    {['appointments', 'services', 'barbers', 'users', 'settings'].map((tab) => {
                        if (tab === 'users' && !isSystemAdmin) return null;
                        const icons: Record<string, string> = { appointments: 'calendar_today', services: 'content_cut', barbers: 'groups', users: 'manage_accounts', settings: 'settings' };
                        const labels: Record<string, string> = { appointments: 'Agendamentos', services: 'Serviços', barbers: 'Barbeiros', users: 'Usuários', settings: 'Configurações' };
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab as any)}
                                className={`p-3 rounded-lg text-left font-medium transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5'}`}>
                                <span className="material-symbols-outlined text-lg">{icons[tab]}</span> {labels[tab]}
                            </button>
                        );
                    })}
                </aside>

                {/* Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {/* APPOINTMENTS */}
                    {activeTab === 'appointments' && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold">Todos os Agendamentos</h2>
                            <div className="bg-surface-dark rounded-xl p-8 text-center border border-white/5">
                                <span className="material-symbols-outlined text-4xl text-slate-600 mb-4">calendar_today</span>
                                <p className="text-slate-500">Nenhum agendamento registrado hoje.</p>
                            </div>
                        </div>
                    )}

                    {/* SERVICES */}
                    {activeTab === 'services' && (
                        <ServiceManager />
                    )}

                    {/* BARBERS */}
                    {activeTab === 'barbers' && (
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Gerenciar Barbeiros</h2>
                                <button onClick={openNewBarberForm} className="bg-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person_add</span> Novo Barbeiro
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {barbers.map(barber => (
                                    <div key={barber.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-3 text-center">
                                        <div className="size-20 rounded-full overflow-hidden border-2 border-primary">
                                            <img src={barber.photoUrl} alt={barber.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">{barber.name}</h3>
                                            <p className="text-xs text-slate-400 uppercase tracking-widest">Barbeiro</p>
                                        </div>
                                        <div className="w-full flex gap-2 mt-2">
                                            <button onClick={() => openEditBarberForm(barber)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors">Editar</button>
                                            <button onClick={() => handleDeleteBarber(barber.id)} className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors">
                                                <span className="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Barber Form Modal */}
                            {showBarberForm && (
                                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in">
                                    <div className="bg-[#111722] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4">
                                        <h3 className="text-lg font-bold">{editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro'}</h3>
                                        <div className="flex flex-col items-center gap-3">
                                            <div onClick={() => fileInputRef.current?.click()}
                                                className="size-24 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-primary cursor-pointer transition-colors flex items-center justify-center bg-white/5">
                                                {barberPhotoUrl ? <img src={barberPhotoUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-3xl text-slate-500">add_a_photo</span>}
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                            <span className="text-xs text-slate-400">Clique para adicionar foto</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                                            <input type="text" value={barberName} onChange={(e) => setBarberName(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary" placeholder="Nome do barbeiro" />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Usuário de Sistema (Login)</label>
                                            <select
                                                value={selectedUserId}
                                                onChange={(e) => setSelectedUserId(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary"
                                            >
                                                <option value="" className="bg-slate-800">Sem vínculo (Apenas Perfil)</option>
                                                {users.filter(u => u.role === 'barber').map(u => (
                                                    <option key={u.id} value={u.id} className="bg-slate-800">
                                                        {u.name} ({u.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-500">Vincule a um usuário 'Barbeiro' para permitir que ele gerencie sua agenda.</p>
                                        </div>

                                        {barberFormError && <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{barberFormError}</div>}
                                        {barberFormSuccess && <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{barberFormSuccess}</div>}
                                        <div className="flex gap-3 mt-2">
                                            <button onClick={() => setShowBarberForm(false)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">Cancelar</button>
                                            <button onClick={handleSaveBarber} className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-bold transition-colors">{editingBarber ? 'Salvar' : 'Criar'}</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && isSystemAdmin && (
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">Gerenciar Usuários</h2>
                                <button onClick={() => setShowNewUserForm(true)} className="bg-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">person_add</span> Novo Usuário
                                </button>
                            </div>

                            {showNewUserForm && (
                                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in">
                                    <div className="bg-[#111722] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4">
                                        <h3 className="text-lg font-bold">Criar Novo Usuário</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                                            <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary" placeholder="Nome completo" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                            <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary" placeholder="email@exemplo.com" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Senha</label>
                                            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)}
                                                className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary" placeholder="******" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase">Tipo de Acesso</label>
                                            <div className="flex gap-2">
                                                <button onClick={() => setNewUserRole('barber')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newUserRole === 'barber' ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Barbeiro</button>
                                                <button onClick={() => setNewUserRole('admin')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${newUserRole === 'admin' ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Administrador</button>
                                            </div>
                                        </div>
                                        {formError && <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">{formError}</div>}
                                        {formSuccess && <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">{formSuccess}</div>}
                                        <div className="flex gap-3 mt-2">
                                            <button onClick={() => { setShowNewUserForm(false); setFormError(''); setFormSuccess(''); }} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors">Cancelar</button>
                                            <button onClick={handleCreateUser} className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-bold transition-colors">Criar Usuário</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-white/5">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Nome</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Email</th>
                                            <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">Tipo</th>
                                            <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(user => (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-4 font-medium">{user.name}</td>
                                                <td className="px-4 py-4 text-slate-400 text-sm">{user.email}</td>
                                                <td className="px-4 py-4">{getRoleBadge(user.role)}</td>
                                                <td className="px-4 py-4 text-right">
                                                    {user.role !== 'system_admin' && <button onClick={() => handleDeleteUser(user.id)} className="text-red-400 hover:text-red-300 text-sm font-medium">Excluir</button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SETTINGS */}
                    {activeTab === 'settings' && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold">Configurações Gerais</h2>
                            <div className="bg-white/5 p-6 rounded-xl border border-white/5 flex flex-col gap-4 max-w-xl">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Nome da Barbearia</label>
                                    <input type="text" value="Sou Negão" className="bg-black/20 border border-white/10 rounded-lg h-10 px-3 text-white outline-none focus:border-primary" readOnly />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Telefone</label>
                                    <input type="text" value="73 98825-9991" className="bg-black/20 border border-white/10 rounded-lg h-10 px-3 text-white outline-none focus:border-primary" readOnly />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-slate-400">Status da Loja</label>
                                    <div className="flex items-center gap-3">
                                        <span className="flex size-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
                                        <span className="text-sm">Aberto agora</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <BottomNavigation
                currentPage={Page.ADMIN}
                setCurrentPage={() => { }}
                isBarber={true} // Reusing the isBarber logic for subtests
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </div>
    );
};

export default AdminDashboard;
