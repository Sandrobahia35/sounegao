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
        // Query appointments with barber info
        let query = supabase
            .from('appointments')
            .select(`
                id,
                barber_id,
                customer_name,
                customer_phone,
                customer_email,
                appointment_date,
                appointment_time,
                status,
                created_at,
                service_names,
                total_price,
                barbers:barber_id (
                    name,
                    photo_url
                )
            `);

        // Prefer User ID filter if available but fallback/include Email for legacy data
        if (userId) {
            // Unify query: (user_id = ID) OR (customer_email = EMAIL)
            // Supabase .or requires full syntax: "user_id.eq.ID,customer_email.eq.EMAIL"
            query = query.or(`user_id.eq.${userId},customer_email.eq.${customerEmail.toLowerCase()}`);
        } else {
            // Fallback to Email (Case Insensitive)
            query = query.eq('customer_email', customerEmail.toLowerCase());
        }

        const { data, error } = await query
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false });

        if (error) {
            console.error('Error fetching customer appointments:', error);
            return { upcoming: [], history: [] };
        }

        // Use String Comparison for Dates (Timezone Safe)
        // Get local YYYY-MM-DD
        const localDate = new Date();
        const offset = localDate.getTimezoneOffset();
        localDate.setMinutes(localDate.getMinutes() - offset);
        const todayStr = localDate.toISOString().split('T')[0]; // "2025-12-28"

        const appointments: CustomerAppointment[] = (data || []).map((apt: any) => ({
            id: apt.id,
            barber_id: apt.barber_id,
            barber_name: apt.barbers?.name || 'Barbeiro',
            barber_photo_url: apt.barbers?.photo_url || '',
            customer_name: apt.customer_name,
            customer_phone: apt.customer_phone,
            customer_email: apt.customer_email,
            appointment_date: apt.appointment_date,
            appointment_time: apt.appointment_time,
            status: apt.status,
            created_at: apt.created_at,
            service_names: apt.service_names,
            total_price: apt.total_price
        }));

        const upcoming = appointments.filter(apt => {
            // Compare YYYY-MM-DD strings directly
            return apt.appointment_date >= todayStr && apt.status !== 'cancelled' && apt.status !== 'completed';
        }).reverse(); // Closest date first

        const history = appointments.filter(apt => {
            return apt.appointment_date < todayStr || apt.status === 'completed' || apt.status === 'cancelled';
        });

        return { upcoming, history };
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
                service_names,
                appointment_date,
                appointment_time,
                total_price,
                status
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

        return (data || []).map((item: any) => ({
            ...item,
            total_price: Number(item.total_price) || 0
        }));
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
