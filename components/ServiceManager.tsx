import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { getServices, deleteService, createService, updateService } from '../services/serviceService';

const ServiceManager: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceName, setServiceName] = useState('');
    const [serviceDuration, setServiceDuration] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceDescription, setServiceDescription] = useState('');
    const [serviceIcon, setServiceIcon] = useState('content_cut');
    const [serviceFormError, setServiceFormError] = useState('');
    const [serviceFormSuccess, setServiceFormSuccess] = useState('');

    const iconOptions = ['content_cut', 'face', 'child_care', 'face_retouching_natural', 'brush', 'person', 'build', 'diamond', 'star', 'auto_fix_high'];

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const data = await getServices();
        setServices(data);
    };

    const openNewServiceForm = () => {
        setEditingService(null);
        setServiceName('');
        setServiceDuration('');
        setServicePrice('');
        setServiceDescription('');
        setServiceIcon('content_cut');
        setServiceFormError('');
        setServiceFormSuccess('');
        setShowServiceForm(true);
    };

    const openEditServiceForm = (service: Service) => {
        setEditingService(service);
        setServiceName(service.name);
        setServiceDuration(service.duration);
        setServicePrice(typeof service.price === 'number' ? service.price.toString() : service.price.toString());
        setServiceDescription(service.description);
        setServiceIcon(service.icon);
        setServiceFormError('');
        setServiceFormSuccess('');
        setShowServiceForm(true);
    };

    const handleSaveService = async () => {
        setServiceFormError('');
        setServiceFormSuccess('');
        if (!serviceName || !serviceDuration) {
            setServiceFormError('Nome e duração são obrigatórios.');
            return;
        }

        const priceValue = (servicePrice === 'Sob Consulta' || !servicePrice)
            ? null
            : parseFloat(servicePrice.replace('R$', '').replace(/\s/g, '').replace(',', '.'));

        if (editingService) {
            const result = await updateService(editingService.id, {
                name: serviceName,
                duration: serviceDuration,
                price: priceValue,
                description: serviceDescription,
                icon: serviceIcon
            });
            if (result.success) {
                setServiceFormSuccess('Serviço atualizado!');
                loadServices();
                setTimeout(() => {
                    setShowServiceForm(false);
                    setServiceFormSuccess('');
                }, 1000);
            } else {
                setServiceFormError(result.error || 'Erro ao atualizar.');
            }
        } else {
            const result = await createService({
                name: serviceName,
                duration: serviceDuration,
                price: priceValue,
                description: serviceDescription,
                icon: serviceIcon
            });
            if (result.success) {
                setServiceFormSuccess('Serviço criado!');
                loadServices();
                setTimeout(() => {
                    setShowServiceForm(false);
                    setServiceFormSuccess('');
                }, 1000);
            } else {
                setServiceFormError(result.error || 'Erro ao criar.');
            }
        }
    };

    const handleDeleteService = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir este serviço?')) {
            const result = await deleteService(id);
            if (result.success) {
                loadServices();
            } else {
                alert(result.error);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Gerenciar Serviços</h2>
                    <p className="text-xs text-slate-500">Adicione ou edite os serviços oferecidos.</p>
                </div>
                <button onClick={openNewServiceForm} className="bg-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-lg">add</span> Novo Serviço
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(service => (
                    <div
                        key={service.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 group transition-all hover:bg-white/[0.07] hover:border-primary/50 cursor-pointer"
                        onClick={() => openEditServiceForm(service)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{service.name}</h3>
                                <div className="flex items-center gap-2 text-primary font-black text-sm">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    {service.duration}
                                </div>
                            </div>
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                                <span className="material-symbols-outlined">{service.icon}</span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-10">
                            {service.description}
                        </p>

                        <div className="mt-auto pt-4 flex justify-between items-center border-t border-white/5">
                            <div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Preço</span>
                                <span className="text-xl font-black text-white">
                                    {typeof service.price === 'number' ? `R$ ${service.price.toFixed(2).replace('.', ',')}` : service.price || 'Sob Consulta'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditServiceForm(service); }}
                                    className="size-9 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">edit</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteService(service.id); }}
                                    className="size-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 transition-all"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Service Form Modal */}
            {showServiceForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
                    <div className="bg-[#111722] border border-white/10 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <h3 className="text-lg font-bold">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h3>
                            <button onClick={() => setShowServiceForm(false)} className="text-slate-500 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
                            <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                                className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary transition-all"
                                placeholder="Nome do serviço" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Duração</label>
                                <input type="text" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary transition-all"
                                    placeholder="ex: 45 min" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Preço (R$)</label>
                                <input type="text" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-primary transition-all"
                                    placeholder="50.00" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Descrição</label>
                            <textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)}
                                className="h-24 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-white outline-none focus:border-primary resize-none transition-all"
                                placeholder="Descrição detalhada do serviço..." />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Ícone</label>
                            <div className="flex flex-wrap gap-2 p-2 bg-black/20 rounded-xl border border-white/5">
                                {iconOptions.map(icon => (
                                    <button key={icon} onClick={() => setServiceIcon(icon)}
                                        className={`size-9 rounded-lg flex items-center justify-center transition-all ${serviceIcon === icon ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                                        <span className="material-symbols-outlined text-lg">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {serviceFormError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">error</span>
                                {serviceFormError}
                            </div>
                        )}
                        {serviceFormSuccess && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                {serviceFormSuccess}
                            </div>
                        )}

                        <div className="flex gap-3 mt-2 pt-4 border-t border-white/5">
                            <button onClick={() => setShowServiceForm(false)} className="flex-1 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors">Cancelar</button>
                            <button onClick={handleSaveService} className="flex-1 py-3 rounded-lg bg-primary hover:bg-primary/90 text-sm font-bold transition-colors shadow-lg shadow-primary/20">
                                {editingService ? 'Salvar' : 'Criar Serviço'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceManager;
