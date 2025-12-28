import React, { useState } from 'react';
import { login } from '../services/authService';
import { User } from '../services/authService';

interface LoginProps {
    onLoginSuccess: (user: User) => void;
    onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setError('');

        if (!email || !password) {
            setError('Preencha todos os campos.');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success && result.user) {
                onLoginSuccess(result.user);
            } else {
                setError(result.error || 'Erro ao fazer login.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Erro ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background-dark p-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-full max-w-md bg-[#111722] border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 relative overflow-hidden">

                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>

                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-3xl">lock</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Área Restrita</h1>
                    <p className="text-slate-500 text-sm">Acesse com suas credenciais.</p>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-white placeholder-slate-600 focus:border-primary outline-none transition-colors"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-12 w-full rounded-lg border border-white/10 bg-black/20 px-4 text-white placeholder-slate-600 focus:border-primary outline-none transition-colors"
                            placeholder="******"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={isLoading}
                    className={`w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {isLoading ? 'Entrando...' : 'Entrar'}
                </button>

                <button
                    onClick={onCancel}
                    className="text-sm text-slate-500 hover:text-white transition-colors"
                >
                    Voltar para o site
                </button>
            </div>
        </div>
    );
};

export default Login;
