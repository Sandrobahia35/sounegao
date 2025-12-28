// Service Management Service with Supabase
import { supabase } from '../lib/supabase';
import { Service } from '../types';

export const getServices = async (): Promise<Service[]> => {
    const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching services:', error);
        return [];
    }

    return (data || []).map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        icon: service.icon
    }));
};

export const createService = async (serviceData: Omit<Service, 'id'>): Promise<{ success: boolean; service?: Service; error?: string }> => {
    try {
        const { data, error } = await supabase
            .rpc('create_service_rpc', {
                p_name: serviceData.name,
                p_description: serviceData.description,
                p_duration: serviceData.duration,
                p_price: serviceData.price,
                p_icon: serviceData.icon
            });

        if (error) {
            console.error('Error creating service RPC:', error);
            // Return the actual error message to help debugging
            return { success: false, error: `Erro no servidor: ${error.message}` };
        }

        if (!data.success) {
            return { success: false, error: data.error };
        }

        const newService = data.service;

        return {
            success: true,
            service: {
                id: newService.id,
                name: newService.name,
                description: newService.description,
                duration: newService.duration,
                price: newService.price,
                icon: newService.icon
            }
        };
    } catch (err: any) {
        console.error('Error in createService:', err);
        return { success: false, error: `Erro inesperado: ${err.message || err}` };
    }
};

export const updateService = async (id: string, updates: Partial<Service>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data, error } = await supabase
            .rpc('update_service_rpc', {
                p_id: id,
                p_name: updates.name,
                p_description: updates.description,
                p_duration: updates.duration,
                p_price: updates.price,
                p_icon: updates.icon
            });

        if (error) {
            console.error('Error updating service RPC:', error);
            return { success: false, error: `Erro no servidor: ${error.message}` };
        }

        if (!data.success) {
            return { success: false, error: data.error };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in updateService:', err);
        return { success: false, error: `Erro inesperado: ${err.message || err}` };
    }
};

export const deleteService = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data, error } = await supabase
            .rpc('delete_service_rpc', { p_id: id });

        if (error) {
            console.error('Error deleting service RPC:', error);
            return { success: false, error: `Erro no servidor: ${error.message}` };
        }

        if (!data.success) {
            return { success: false, error: data.error };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Error in deleteService:', err);
        return { success: false, error: `Erro inesperado: ${err.message || err}` };
    }
};
