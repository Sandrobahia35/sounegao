import { supabase } from '../lib/supabase';

export interface Appointment {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    appointment_date: string;
    appointment_time: string;
    status: string;
    created_at: string;
    service_names: string;
}

export const createAppointment = async (data: {
    barberId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    date: Date;
    time: string;
    serviceIds: string[];
    userId?: string; // New optional user ID
}): Promise<{ success: boolean; error?: string }> => {
    // Format date to YYYY-MM-DD
    const dateStr = data.date.toISOString().split('T')[0];

    // Format time (ensure HH:mm:ss or HH:mm)
    const timeStr = data.time.length === 5 ? `${data.time}:00` : data.time;

    const { data: result, error } = await supabase.rpc('create_appointment_rpc', {
        p_barber_id: data.barberId,
        p_customer_name: data.customerName,
        p_customer_phone: data.customerPhone,
        p_customer_email: (data.customerEmail || '').toLowerCase() || null,
        p_date: dateStr,
        p_time: timeStr,
        p_service_ids: data.serviceIds,
        p_user_id: data.userId || null // Pass user ID
    });

    if (error) {
        console.error('Error in createAppointment:', error);
        return { success: false, error: error.message };
    }

    return result; // { success: boolean, appointment_id: string }
};

export const getBarberAppointments = async (barberId: string): Promise<Appointment[]> => {
    const { data, error } = await supabase.rpc('get_barber_appointments_rpc', {
        p_barber_id: barberId
    });

    if (error) {
        console.error('Error in getBarberAppointments:', error);
        return [];
    }

    return (data || []) as Appointment[];
};

export const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'completed' | 'cancelled') => {
    const { data, error } = await supabase.rpc('update_appointment_status_rpc', {
        p_appointment_id: appointmentId,
        p_status: status
    });

    if (error) {
        console.error('Error in updateAppointmentStatus:', error);
        return { success: false, error: error.message };
    }

    return data as { success: boolean, error?: string };
};

// Customer Appointment interface with barber info
export interface CustomerAppointment {
    id: string;
    barber_id: string;
    barber_name: string;
    barber_photo_url: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    appointment_date: string;
    appointment_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    created_at: string;
    service_names: string;
    total_price: number | null;
}

// Get customer appointments by email
export const getCustomerAppointments = async (customerEmail: string, userId?: string): Promise<{
    upcoming: CustomerAppointment[];
    history: CustomerAppointment[];
}> => {
    try {
        const { data, error } = await supabase.rpc('get_customer_appointments_rpc', {
            p_customer_email: customerEmail.toLowerCase(),
            p_user_id: userId || null
        });

        if (error) {
            console.error('Error fetching customer appointments via RPC:', error);
            return { upcoming: [], history: [] };
        }

        return {
            upcoming: (data.upcoming || []).map((apt: any) => ({
                ...apt,
                barber_photo_url: apt.barber_photo_path
                    ? `https://aqvwaiogqiaxoayhsihg.supabase.co/storage/v1/object/public/barber-photos/${apt.barber_photo_path}`
                    : ''
            })),
            history: (data.history || []).map((apt: any) => ({
                ...apt,
                barber_photo_url: apt.barber_photo_path
                    ? `https://aqvwaiogqiaxoayhsihg.supabase.co/storage/v1/object/public/barber-photos/${apt.barber_photo_path}`
                    : ''
            }))
        };
    } catch (err) {
        console.error('Unexpected error fetching appointments:', err);
        return { upcoming: [], history: [] };
    }
};

export interface BarberFinancialData {
    id: string;
    customer_name: string;
    service_names: string;
    appointment_date: string;
    appointment_time: string;
    total_price: number;
    status: string;
}

export const getBarberFinancials = async (
    barberId: string,
    startDate?: string,
    endDate?: string
): Promise<BarberFinancialData[]> => {
    try {
        let query = supabase
            .from('appointments')
            .select(`
                id,
                customer_name,
                appointment_date,
                appointment_time,
                status,
                appointment_services (
                    services (
                        name,
                        price
                    )
                )
            `)
            .eq('barber_id', barberId)
            .eq('status', 'completed');

        if (startDate) {
            query = query.gte('appointment_date', startDate);
        }
        if (endDate) {
            query = query.lte('appointment_date', endDate);
        }

        const { data, error } = await query.order('appointment_date', { ascending: false });

        if (error) {
            console.error('Error fetching financial data:', error);
            return [];
        }

        return (data || []).map((apt: any) => {
            const aptServices = (apt.appointment_services || [])
                .map((as: any) => as.services)
                .filter(Boolean);

            return {
                id: apt.id,
                customer_name: apt.customer_name,
                appointment_date: apt.appointment_date,
                appointment_time: apt.appointment_time,
                status: apt.status,
                service_names: aptServices.map((s: any) => s.name).join(', '),
                total_price: aptServices.reduce((sum: number, s: any) => sum + (Number(s.price) || 0), 0)
            };
        });
    } catch (err) {
        console.error('Unexpected error in getBarberFinancials:', err);
        return [];
    }
};

export const deleteAppointment = async (appointmentId: string) => {
    const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

    if (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const rescheduleAppointment = async (appointmentId: string, date: string, time: string) => {
    // Format time to HH:mm:00 if needed
    const timeStr = time.length === 5 ? `${time}:00` : time;

    const { error } = await supabase
        .from('appointments')
        .update({
            appointment_date: date,
            appointment_time: timeStr
        })
        .eq('id', appointmentId);

    if (error) {
        console.error('Error rescheduling appointment:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const archiveAppointment = async (appointmentId: string) => {
    const { data, error } = await supabase.rpc('archive_appointment_rpc', {
        p_appointment_id: appointmentId
    });

    if (error) {
        console.error('Error archiving appointment:', error);
        return { success: false, error: error.message };
    }

    return data as { success: boolean, error?: string };
};
