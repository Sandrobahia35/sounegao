import { supabase } from '../lib/supabase';
import { Barber } from '../types';

export interface ScheduleConfig {
    day_of_week: number;
    start_time: string;
    end_time: string;
    lunch_start?: string | null;
    lunch_end?: string | null;
    is_active: boolean;
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

        const { data, error } = await supabase.rpc('get_available_slots_rpc', {
            p_barber_id: barberId,
            p_date: dateStr
        });

        if (error) {
            console.error('Error fetching available slots via RPC:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Unexpected error fetching available slots:', err);
        return [];
    }
};


export const upsertDailySlot = async (barberId: string, date: string, oldTime: string, newTime: string, isActive: boolean) => {
    const { data, error } = await supabase.rpc('upsert_daily_slot_rpc', {
        p_barber_id: barberId,
        p_date: date,
        p_old_time: oldTime,
        p_new_time: newTime,
        p_is_active: isActive
    });

    if (error) {
        console.error('Error in upsertDailySlot:', error);
        return { success: false, error: error.message };
    }

    return data as { success: boolean, error?: string };
};

export interface ManagementSlot {
    time: string;
    status: 'available' | 'blocked' | 'booked';
    isCustom: boolean;
    id?: string;
}

export const getDailyManagementSlots = async (barberId: string, date: string): Promise<ManagementSlot[]> => {
    const { data: rpcData, error } = await supabase.rpc('get_daily_management_slots_rpc', {
        p_barber_id: barberId,
        p_date: date
    });

    if (error) {
        console.error('Error fetching mgmt slots:', error);
        return [];
    }

    const appointments = rpcData.appointments as { appointment_time: string }[];
    const exceptions = rpcData.exceptions as { id: string, start_time: string, type: string }[];

    const bookedTimes = appointments.map(a => a.appointment_time.substring(0, 5));
    const blocksList = exceptions.filter(e => e.type === 'blocked' || !e.type);
    const overridesList = exceptions.filter(e => e.type === 'working');

    const blockedTimes = blocksList.map(b => b.start_time.substring(0, 5));

    // 3. Get Default Slots
    const allPossibleTimes: string[] = [];
    for (let h = 8; h <= 21; h++) {
        const hour = h.toString().padStart(2, '0');
        allPossibleTimes.push(`${hour}:00`);
        allPossibleTimes.push(`${hour}:30`);
    }

    // 4. Merge
    const result: ManagementSlot[] = [];

    // Add potential defaults
    allPossibleTimes.forEach(time => {
        let status: 'available' | 'blocked' | 'booked' = 'available';
        if (bookedTimes.includes(time)) status = 'booked';
        else if (blockedTimes.includes(time)) status = 'blocked';

        result.push({
            time,
            status,
            isCustom: false,
            id: blocksList.find(b => b.start_time.substring(0, 5) === time)?.id
        });
    });

    // Add custom overrides (if not already in list)
    overridesList.forEach(ov => {
        const time = ov.start_time.substring(0, 5);
        if (!time) return;

        const existingIdx = result.findIndex(r => r.time === time);
        if (existingIdx >= 0) {
            result[existingIdx].isCustom = true;
            result[existingIdx].id = ov.id;
        } else {
            result.push({
                time,
                status: bookedTimes.includes(time) ? 'booked' : 'available',
                isCustom: true,
                id: ov.id
            });
        }
    });

    return result.sort((a, b) => a.time.localeCompare(b.time));
};
