
import React from 'react';
import { Page } from '../types';

interface HomeProps {
  onStartBooking: () => void;
  onViewServices: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartBooking, onViewServices }) => {
  return (
    <div className="flex flex-col w-full -mt-8">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] w-full flex items-center justify-center overflow-hidden rounded-3xl shadow-2xl">
        {/* Background - Dark textured wall matching the logo background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[3000ms] hover:scale-110"
          style={{
            backgroundImage: 'url("/hero-bg.jpg")',
            filter: 'brightness(0.3) contrast(1.1)'
          }}
        >
          {/* Vignette and gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl animate-in fade-in zoom-in duration-1000">

          {/* Precise Afro Logo Implementation */}
          <div className="mb-12 flex flex-col items-center">
            <div className="relative mb-6 flex items-center justify-center">
              <div className="relative size-56 md:size-72 flex items-center justify-center overflow-visible">
                <img
                  src="/logo.jpg"
                  alt="Sou Negão Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] rounded-full"
                />
              </div>
            </div>

            <div className="flex flex-col gap-0 items-center -mt-8">
              <span className="text-white text-sm md:text-base font-bold tracking-[0.7em] uppercase opacity-90 mb-2">Barbearia</span>
              <h1 className="text-6xl md:text-8xl font-serif text-white tracking-widest uppercase drop-shadow-[0_5px_20px_rgba(0,0,0,0.9)] leading-none font-black">
                SOU NEGÃO
              </h1>
            </div>
          </div>

          <div className="flex flex-col items-center gap-0 mb-16">
            <p className="whitespace-nowrap text-lg sm:text-xl md:text-2xl text-white font-black uppercase tracking-[0.15em] md:tracking-[0.2em] mb-4 opacity-90">
              Comece a semana com o
            </p>
            <span className="text-8xl md:text-[11rem] font-serif italic text-orange-400 drop-shadow-[0_0_40px_rgba(251,146,60,0.7)] leading-none select-none animate-pulse-slow">
              Estilo
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-sm sm:max-w-none">
            <button
              onClick={onStartBooking}
              className="group w-full sm:w-auto px-16 py-6 bg-primary text-white font-black text-xl rounded-full shadow-[0_15px_60px_rgba(19,91,236,0.5)] hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              Agendar Agora
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">arrow_forward</span>
            </button>
            <button
              onClick={onViewServices}
              className="w-full sm:w-auto px-16 py-6 bg-white/5 backdrop-blur-3xl border border-white/20 text-white font-black text-xl rounded-full hover:bg-white/10 transition-all flex items-center justify-center active:scale-95"
            >
              Ver Serviços
            </button>
          </div>
        </div>
      </section>

      {/* Services/Features Summary */}
      <section className="py-32 px-6 md:px-12 bg-background-dark">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group bg-surface-dark/40 p-12 rounded-[3rem] border border-white/5 hover:border-primary/40 transition-all duration-500 hover:-translate-y-3">
              <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl">
                <span className="material-symbols-outlined text-5xl">cut</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Corte de Mestre</h3>
              <p className="text-slate-400 leading-relaxed text-xl">Especialistas em visuais modernos e clássicos, garantindo a sua melhor versão em cada detalhe.</p>
            </div>

            <div className="group bg-surface-dark/40 p-12 rounded-[3rem] border border-white/5 hover:border-primary/40 transition-all duration-500 hover:-translate-y-3">
              <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl">
                <span className="material-symbols-outlined text-5xl">content_cut</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Barba & Navalha</h3>
              <p className="text-slate-400 leading-relaxed text-xl">O ritual da toalha quente e o acabamento perfeito que só a Sou Negão proporciona para você.</p>
            </div>

            <div className="group bg-surface-dark/40 p-12 rounded-[3rem] border border-white/5 hover:border-primary/40 transition-all duration-500 hover:-translate-y-3">
              <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl">
                <span className="material-symbols-outlined text-5xl">history</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Tradição & Respeito</h3>
              <p className="text-slate-400 leading-relaxed text-xl">Ambiente familiar e acolhedor onde cada cliente é tratado como um verdadeiro amigo da casa.</p>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 50px rgba(251,146,60,0.8)); }
          50% { opacity: 0.8; filter: drop-shadow(0 0 20px rgba(251,146,60,0.3)); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default Home;
