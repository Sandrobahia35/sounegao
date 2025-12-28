// Customer Authentication Service with Google OAuth
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface CustomerUser {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
}

// Sign in with Google OAuth
export const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });

        if (error) {
            console.error('Google OAuth error:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected Google OAuth error:', err);
        return { success: false, error: 'Erro inesperado ao fazer login com Google.' };
    }
};

// Sign out customer
export const signOutCustomer = async (): Promise<void> => {
    await supabase.auth.signOut();
};

// Get current customer session
export const getCustomerSession = async (): Promise<CustomerUser | null> => {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) return null;

        return mapSupabaseUser(session.user);
    } catch (e) {
        console.error('Error getting customer session:', e);
        return null;
    }
};

// Map Supabase user to CustomerUser
const mapSupabaseUser = (user: SupabaseUser): CustomerUser => {
    return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Cliente',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture
    };
};

// Subscribe to auth state changes
export const onCustomerAuthStateChange = (
    callback: (user: CustomerUser | null) => void
): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                callback(mapSupabaseUser(session.user));
            } else {
                callback(null);
            }
        }
    );

    return () => subscription.unsubscribe();
};
