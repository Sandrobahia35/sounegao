// Barber Management Service with Supabase
import { supabase } from '../lib/supabase';
import { Barber } from '../types';

const BARBER_PHOTOS_BUCKET = 'barber-photos';

export const getBarbers = async (): Promise<Barber[]> => {
    const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching barbers:', error);
        return [];
    }

    return (data || []).map(barber => ({
        id: barber.id,
        name: barber.name,
        photoUrl: getPhotoUrl(barber.photo_path),
        userId: barber.user_id // Added userId to type if not there? Barber type needs update?
    }));
};

// New function to link User -> Barber
export const getBarberByUserId = async (userId: string): Promise<Barber | null> => {
    const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) {
        return null;
    }

    return {
        id: data.id,
        name: data.name,
        photoUrl: getPhotoUrl(data.photo_path),
        userId: data.user_id
    };
};

export const createBarber = async (barberData: { name: string, photo: File | null, userId?: string }): Promise<{ success: boolean; barber?: Barber; error?: string }> => {
    let photoPath = null;

    // Upload photo if provided
    if (barberData.photo) {
        const uploadResult = await uploadBarberPhoto(barberData.photo);
        if (!uploadResult.success) {
            return { success: false, error: uploadResult.error };
        }
        photoPath = uploadResult.path!;
    }

    // Call RPC
    const { data, error } = await supabase.rpc('create_barber_rpc', {
        p_name: barberData.name,
        p_photo_path: photoPath,
        p_user_id: barberData.userId || null
    });

    if (error) return { success: false, error: error.message };

    // The RPC returns a row, but typescript might not infer it perfectly from RPC call result if not typed. 
    // Usually returns data which is array of rows or single row depending on setup.
    // My RPC CREATE returns TABLE(id, name...), so it returns an array of 1.
    const newBarber = Array.isArray(data) ? data[0] : data;

    return {
        success: true,
        barber: {
            id: newBarber.id,
            name: newBarber.name,
            photoUrl: getPhotoUrl(newBarber.photo_path),
            userId: newBarber.user_id
        }
    };
};

export const updateBarber = async (id: string, updates: { name: string, photo: File | null, userId?: string }): Promise<{ success: boolean; error?: string }> => {
    let photoPath = null;

    if (updates.photo) {
        const uploadResult = await uploadBarberPhoto(updates.photo);
        if (!uploadResult.success) {
            return { success: false, error: uploadResult.error };
        }
        photoPath = uploadResult.path;
    }

    const { error } = await supabase.rpc('update_barber_rpc', {
        p_id: id,
        p_name: updates.name,
        p_photo_path: photoPath,
        p_user_id: updates.userId || null
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
};

export const deleteBarber = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.rpc('delete_barber_rpc', { p_id: id });
    if (error) return { success: false, error: error.message };
    return { success: true };
};

const uploadBarberPhoto = async (file: File): Promise<{ success: boolean; path?: string; error?: string }> => {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(BARBER_PHOTOS_BUCKET)
            .upload(filePath, file);

        if (error) {
            console.error('Storage upload error:', error);
            return { success: false, error: 'Erro ao fazer upload da foto no Storage.' };
        }

        return { success: true, path: data.path };
    } catch (err) {
        console.error('Unexpected upload error:', err);
        return { success: false, error: 'Erro inesperado no upload.' };
    }
};

const getPhotoUrl = (path: string | null): string => {
    if (!path) return 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1000&auto=format&fit=crop'; // Placeholder
    const { data } = supabase.storage.from(BARBER_PHOTOS_BUCKET).getPublicUrl(path);
    return data.publicUrl;
};
