
import React from 'react';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: string;
  actionText: string;
  isSpecial?: boolean;
}

interface ServicesProps {
  onStartBooking: () => void;
}

const servicesList: ServiceItem[] = [
  {
    id: '1',
    name: 'Corte a Tesoura',
    description: 'Acabamento clássico e preciso, ideal para quem busca elegância tradicional. Utilizamos técnicas avançadas para o melhor caimento.',
    price: 'R$ 50,00',
    icon: 'content_cut',
    actionText: 'Agendar'
  },
  {
    id: '2',
    name: 'Corte Degradê',
    description: 'Visual moderno com transições suaves e linhas marcantes. Perfeito para quem quer estar na moda com um visual limpo.',
    price: 'R$ 45,00',
    icon: 'content_cut',
    actionText: 'Agendar'
  },
  {
    id: '3',
    name: 'Barba',
    description: 'Ritual completo com toalha quente e navalha para um barbear perfeito. Inclui hidratação e modelagem dos fios.',
    price: 'R$ 35,00',
    icon: 'face',
    actionText: 'Agendar'
  },
  {
    id: '7',
    name: 'Corte Infantil',
    description: 'Corte especial para os pequenos com paciência e estilo. Ambiente preparado para deixar as crianças totalmente à vontade.',
    price: 'R$ 40,00',
    icon: 'child_care',
    actionText: 'Agendar'
  },
  {
    id: '8',
    name: 'Sobrancelha',
    description: 'Design de sobrancelha na navalha ou pinça para realçar o olhar e garantir um acabamento impecável ao rosto masculino.',
    price: 'R$ 15,00',
    icon: 'face_retouching_natural',
    actionText: 'Agendar'
  },
  {
    id: '9',
    name: 'Pigmentação',
    description: 'Técnica de correção de falhas e realce do contorno do cabelo ou barba, proporcionando um visual mais preenchido e definido.',
    price: 'R$ 30,00',
    icon: 'brush',
    actionText: 'Agendar'
  },
  {
    id: '4',
    name: 'Prótese Capilar',
    description: 'Aplicação profissional para um visual natural e renovado. Recuperamos sua autoestima com discrição e qualidade técnica superior.',
    price: 'Sob Consulta',
    icon: 'person',
    actionText: 'Saiba Mais',
    isSpecial: true
  },
  {
    id: '5',
    name: 'Manutenção da Prótese',
    description: 'Limpeza profunda, ajuste e recolocação para garantir a durabilidade e o estilo impecável da sua prótese capilar.',
    price: 'R$ 150,00',
    icon: 'build',
    actionText: 'Agendar'
  },
  {
    id: '6',
    name: 'Combo VIP',
    description: 'A experiência completa "Sou Negão". Inclui corte, barba e tratamento facial relaxante para o homem que não abre mão do melhor.',
    price: 'R$ 90,00',
    icon: 'diamond',
    actionText: 'Agendar'
  }
];

const Services: React.FC<ServicesProps> = ({ onStartBooking }) => {
  return (
    <div className="flex flex-col w-full animate-in fade-in duration-700">
      {/* Services Hero Header */}
      <section className="text-center mb-16 py-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">Em Cada Detalhe</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
          Conheça nossos serviços especializados. Do corte clássico à pigmentação, cuidamos do seu visual com a maestria que você merece.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={onStartBooking}
            className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            Agendar Horário
          </button>
          <button className="px-8 py-3 bg-transparent border border-slate-700 text-slate-300 font-bold rounded-lg hover:bg-white/5 transition-all">
            Ver Catálogo
          </button>
        </div>
      </section>

      {/* Main Services Grid Section */}
      <section className="mb-20">
        <div className="flex flex-col gap-2 mb-10 pl-4 border-l-4 border-primary">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Nossos Serviços</h2>
          <p className="text-slate-500">Escolha o tratamento ideal para renovar seu estilo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service) => (
            <div 
              key={service.id} 
              className="bg-surface-dark border border-border-dark p-8 rounded-2xl flex flex-col h-full group hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/5"
            >
              <div className="size-12 rounded-full bg-background-dark flex items-center justify-center text-slate-400 mb-6 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined">{service.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{service.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <span className={`text-lg font-bold ${service.isSpecial ? 'text-slate-400' : 'text-primary'}`}>
                  {service.price}
                </span>
                <button 
                  onClick={service.isSpecial ? undefined : onStartBooking}
                  className="flex items-center gap-2 text-sm font-bold text-white hover:text-primary transition-colors"
                >
                  {service.actionText}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="relative overflow-hidden rounded-3xl mb-24">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1599351431247-f13b28320393?auto=format&fit=crop&q=80&w=2000")' }}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        </div>
        <div className="relative z-10 px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Primeira vez na Sou Negão?</h2>
            <p className="text-slate-400">Agende seu serviço pelo site e garanta um visual impecável com quem entende do assunto.</p>
          </div>
          <button 
            onClick={onStartBooking}
            className="whitespace-nowrap px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all shadow-xl active:scale-95"
          >
            Agendar Agora
          </button>
        </div>
      </section>
    </div>
  );
};

export default Services;
