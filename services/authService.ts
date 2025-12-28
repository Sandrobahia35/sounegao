// Authentication Service with Supabase
import { supabase } from '../lib/supabase';

export type UserRole = 'system_admin' | 'admin' | 'barber';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    created_at: string;
}

export interface Session {
    user: User;
    loginTime: string;
}

// Login with email and password via RPC
export const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
        const { data, error } = await supabase
            .rpc('login_user', {
                p_email: email,
                p_password: password
            });

        if (error) {
            console.error('Login RPC error:', error);
            return { success: false, error: 'Erro ao conectar ao servidor.' };
        }

        if (!data.success) {
            return { success: false, error: data.error };
        }

        const user = data.user;

        // Save session
        const session: Session = {
            user,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('sounegao_session', JSON.stringify(session));

        return { success: true, user };
    } catch (err) {
        console.error('Unexpected login error:', err);
        return { success: false, error: 'Erro inesperado ao fazer login.' };
    }
};

// Logout
export const logout = (): void => {
    localStorage.removeItem('sounegao_session');
};

// Get current session
export const getSession = (): Session | null => {
    const sessionStr = localStorage.getItem('sounegao_session');
    if (!sessionStr) return null;
    try {
        return JSON.parse(sessionStr);
    } catch (e) {
        localStorage.removeItem('sounegao_session');
        return null;
    }
};

// Get all users via RPC
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.rpc('get_all_users');
    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }
    return data || [];
};

// Create user via RPC
export const createUser = async (userData: { name: string; email: string; password: string; role: UserRole }): Promise<{ success: boolean; error?: string }> => {
    if (!userData.password) {
        return { success: false, error: 'Senha é obrigatória.' };
    }

    const { data, error } = await supabase.rpc('create_user_rpc', {
        p_name: userData.name,
        p_email: userData.email,
        p_password: userData.password,
        p_role: userData.role
    });

    if (error) {
        console.error('Error creating user:', error);
        return { success: false, error: 'Erro ao criar usuário.' };
    }

    if (!data.success) {
        return { success: false, error: data.error };
    }

    return { success: true };
};

// Delete user via RPC
export const deleteUser = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.rpc('delete_user_rpc', { p_id: id });

    if (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Erro ao excluir usuário.' };
    }

    if (!data.success) {
        return { success: false, error: data.error };
    }

    return { success: true };
};
