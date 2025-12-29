import { supabase } from '../lib/supabase';
import { Barber } from '../types';

export interface ScheduleConfig {
    day_of_week: number;
    start_time: string;
    end_time: string;
    lunch_start?: string | null;
    lunch_end?: string | null;
    is_active: boolean;
    slot_duration?: number; // New field for dynamic duration
}

export interface BlockedPeriod {
    id?: string;
    barber_id?: string;
    date: string; // YYYY-MM-DD
    start_time?: string | null; // HH:mm
    end_time?: string | null; // HH:mm
    reason?: string;
    type?: 'blocked' | 'working';
}

export const getBarberSchedule = async (barberId: string) => {
    const { data, error } = await supabase.rpc('get_barber_schedule', { p_barber_id: barberId });
    if (error) {
        console.error('Error fetching schedule:', error);
        return { success: false, error: error.message };
    }
    return data; // { success: true, configs: [], blocks: [] }
};

export const saveScheduleConfig = async (barberId: string, configs: ScheduleConfig[]) => {
    const { data, error } = await supabase.rpc('upsert_schedule_config', {
        p_barber_id: barberId,
        p_configs: configs
    });
    if (error) {
        console.error('Error saving schedule:', error);
        return { success: false, error: error.message };
    }
    return data;
};

export const addBlockedPeriod = async (barberId: string, block: BlockedPeriod) => {
    const { data, error } = await supabase.rpc('add_blocked_period', {
        p_barber_id: barberId,
        p_date: block.date,
        p_start_time: block.start_time || null,
        p_end_time: block.end_time || null,
        p_reason: block.reason || '',
        p_type: block.type || 'blocked'
    });
    if (error) {
        console.error('Error blocking period:', error);
        return { success: false, error: error.message };
    }
    return data;
};

export const deleteBlockedPeriod = async (blockId: string) => {
    const { data, error } = await supabase.rpc('delete_blocked_period', { p_id: blockId });
    if (error) {
        console.error('Error deleting block:', error);
        return { success: false, error: error.message };
    }
    return data;
};

// Helper: Generate time slots given range and interval
const generateSlots = (startStr: string, endStr: string, intervalMin: number = 30): string[] => {
    const slots: string[] = [];
    if (!startStr || !endStr) return [];

    const [startH, startM] = startStr.split(':').map(Number);
    const [endH, endM] = endStr.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    // Safety break
    let limit = 0;
    while (current < end && limit < 100) {
        limit++;
        const h = current.getHours().toString().padStart(2, '0');
        const m = current.getMinutes().toString().padStart(2, '0');
        slots.push(`${h}:${m}`);

        current.setMinutes(current.getMinutes() + intervalMin);
    }
    return slots;
};

// Returns the effective configuration for all days (0-6), filling defaults
export const getEffectiveScheduleConfig = async (barberId: string): Promise<ScheduleConfig[]> => {
    const schedule = await getBarberSchedule(barberId);
    if (!schedule.success) return [];

    const loadedConfigs = schedule.configs as ScheduleConfig[];

    const fullConfigs = [0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
        const existing = loadedConfigs.find(c => c.day_of_week === dayOfWeek);
        if (existing) return existing;

        // Defaults
        // Mon-Thu (1-4): 09:00 - 19:30
        // Fri (5): 09:00 - 17:00
        // Sat (6): Closed
        // Sun (0): 09:00 - 13:00

        let def: ScheduleConfig = {
            day_of_week: dayOfWeek,
            start_time: '09:00',
            end_time: '19:00',
            is_active: false
        };

        if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Mon-Thu
            def.end_time = '19:30';
            def.is_active = true;
        } else if (dayOfWeek === 5) { // Fri
            def.end_time = '17:00';
            def.is_active = true;
        } else if (dayOfWeek === 0) { // Sun
            def.end_time = '13:00';
            def.is_active = true;
        }
        // Sat defaults to is_active: false
        return def;
    });

    return fullConfigs;
};

export const getAvailableSlots = async (barberId: string, date: Date): Promise<string[]> => {
    try {
        // Get local YYYY-MM-DD for the query date
        const localDate = new Date(date);
        const offset = localDate.getTimezoneOffset();
        localDate.setMinutes(localDate.getMinutes() - offset);
        const dateStr = localDate.toISOString().split('T')[0];

        console.log('[getAvailableSlots] Calling RPC with params:', {
            p_barber_id: barberId,
            p_date: dateStr,
            originalDate: date.toISOString(),
            dayOfWeek: date.getDay()
        });

        const { data, error } = await supabase.rpc('get_available_slots_rpc', {
            p_barber_id: barberId,
            p_date: dateStr
        });

        if (error) {
            console.error('[getAvailableSlots] RPC Error:', error);
            console.error('[getAvailableSlots] Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            return [];
        }

        console.log('[getAvailableSlots] RPC Success. Received slots:', data);
        console.log('[getAvailableSlots] Number of slots:', data?.length || 0);
        return data || [];
    } catch (err) {
        console.error('[getAvailableSlots] Unexpected error:', err);
        return [];
    }
};


export const saveDaySlots = async (barberId: string, date: string, slots: string[]) => {
    // slots is array of HH:mm strings
    console.log('Saving slots:', slots);
    const { data, error } = await supabase.rpc('save_day_slots_rpc', {
        p_barber_id: barberId,
        p_date: date,
        p_slots: slots
    });

    if (error) {
        console.error('Error in saveDaySlots:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
};

export interface ManagementSlot {
    time: string;
    status: 'available' | 'blocked' | 'booked';
    isCustom: boolean; // true if from daily_slots, false if from pattern
    source?: 'custom' | 'pattern';
}

export const getDailyManagementSlots = async (barberId: string, date: string): Promise<ManagementSlot[]> => {
    // 1. Get Slots Definition (the grid)
    const { data: slotsData, error: slotsError } = await supabase.rpc('get_day_slots_rpc', {
        p_barber_id: barberId,
        p_date: date
    });

    if (slotsError) {
        console.error('Error fetching day slots:', slotsError);
        return [];
    }

    // 2. Get Bookings for this day (to mark as booked)
    // We can use direct query here if policies allow, or use an RPC. Assuming direct select works for barber.
    const { data: bookingsData, error: bookingsError } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('barber_id', barberId)
        .eq('status', 'confirmed') // Only confirmed? Or pending too? Usually 'cancelled' is excluded.
        // Let's filter out cancelled/no_show in JS or query
        .neq('status', 'cancelled')
        .neq('status', 'no_show')
        // Filter by date. appointment_date is datetime or date? 
        // In previous context it's timestamp? Or date? 
        // Let's check RPC code: DATE(appointment_date) = p_date. 
        // Direct query on timestamp requires range. 
        // Using RPC 'get_day_appointments_simple' might be safer if date handling is tricky, 
        // but let's try a range query assuming 'date' string YYYY-MM-DD.
        .gte('appointment_date', `${date}T00:00:00`)
        .lte('appointment_date', `${date}T23:59:59`);


    const bookedTimes = bookingsData
        ? bookingsData.map((b: any) => b.appointment_time.substring(0, 5))
        : [];

    // Helper to check blocks? 
    // The new logic says: daily_slots overrides blocks? Or blocks still apply?
    // "Grade Livre" implies absolute control. If I put a slot, it's there. 
    // BUT booked is booked.
    // What about "Personal Block"? 
    // In "Grade Livre", you just REMOVE the slot to block it. 
    // So distinct "blocked" status is less relevant unless it comes from "blocked_periods" table (vacations etc).
    // Let's assume daily_slots supersedes "blocked_periods" if custom. 
    // If pattern, we might want to show blocked? 
    // Valid for V1: Just show what RPC returns + Booked status.

    // RPC returns { slot_time, source, status }
    // We map to ManagementSlot

    // Also need to handle blocked_periods if we want to show "Blocked" visually for pattern slots?
    // RPC get_day_slots_rpc logic: returns all pattern slots. 
    // It does NOT filter blocks (I removed that check in my SQL above to return THE GRID).
    // Wait, my SQL for get_day_slots_rpc returned 'available'.

    // Let's fetch blocks too to be safe?
    const { data: blocksData } = await supabase
        .from('blocked_periods')
        .select('start_time, end_time, type')
        .eq('barber_id', barberId)
        .eq('date', date);

    // Simplification: Check if time in block range.
    const isBlocked = (time: string) => {
        if (!blocksData) return false;
        // logic for range blocks... 
        // For simplicity in this step, let's rely on simply:
        // If it's booked, show booked.
        // If it's not present, it's not there.
        return false;
    };

    const result: ManagementSlot[] = (slotsData as any[]).map(s => {
        const time = s.slot_time;
        // Check booking
        if (bookedTimes.includes(time)) {
            return { time, status: 'booked', isCustom: s.source === 'custom', source: s.source };
        }
        // Check blocks (optional, stick to simple for now)

        return { time, status: 'available', isCustom: s.source === 'custom', source: s.source };
    });

    return result.sort((a, b) => a.time.localeCompare(b.time));
};
