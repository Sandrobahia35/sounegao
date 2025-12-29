
import React, { useState, useRef, useEffect } from 'react';
import { getStyleAdvice } from '../services/geminiService';

const WhatsAppIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.715 11.715 0 0012.008 0C5.339 0 0 5.34 0 12.007c0 2.132.559 4.212 1.62 6.082L0 24l6.063-1.59a11.701 11.701 0 005.938 1.597h.005c6.669 0 12.007-5.341 12.007-12.01a11.66 11.66 0 00-3.515-8.487" />
  </svg>
);

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Olá! Sou o assistente da Sou Negão. Precisa de ajuda para escolher seu estilo hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    const botResponse = await getStyleAdvice(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#075E54] p-4 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-1 rounded-full">
                <WhatsAppIcon />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Sou Negão IA</span>
                <span className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="size-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5] dark:bg-background-dark/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[85%] p-3 shadow-md ${m.role === 'user'
                  ? 'bg-[#dcf8c6] text-slate-800 rounded-l-xl rounded-br-xl'
                  : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-r-xl rounded-bl-xl'
                  }`}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                  <span className="text-[9px] text-slate-400 block text-right mt-1 font-medium">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-border-dark flex gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Mensagem"
              className="flex-1 bg-slate-100 dark:bg-background-dark border-none rounded-full px-5 py-2.5 text-sm focus:ring-1 focus:ring-[#25D366] outline-none text-slate-900 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-[#128C7E] text-white size-11 rounded-full flex items-center justify-center hover:bg-[#075E54] disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined filled-icon">send</span>
            </button>
          </div>
        </div>
      ) : (
        <a
          href="https://wa.me/5573988259991?text=Olá!%20Vim%20pelo%20site%20e%20gostaria%20de%20mais%20informações."
          target="_blank"
          rel="noopener noreferrer"
          className="size-16 bg-[#25D366] text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative"
          title="Fale conosco no WhatsApp"
        >
          <WhatsAppIcon />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white dark:border-background-dark"></span>
          </span>
        </a>
      )}
    </div>
  );
};

export default ChatBot;
