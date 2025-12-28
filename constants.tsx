
import { Service, Barber } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Corte a Tesoura',
    duration: '50 min',
    price: 50.0,
    description: 'Acabamento clássico e preciso, ideal para quem busca elegância tradicional.',
    icon: 'content_cut'
  },
  {
    id: 's2',
    name: 'Corte Degradê',
    duration: '45 min',
    price: 45.0,
    description: 'Visual moderno com transições suaves e linhas marcantes.',
    icon: 'content_cut'
  },
  {
    id: 's3',
    name: 'Barba',
    duration: '35 min',
    price: 35.0,
    description: 'Ritual completo com toalha quente e navalha para um barbear perfeito.',
    icon: 'face'
  },
  {
    id: 's_infantil',
    name: 'Corte Infantil',
    duration: '40 min',
    price: 40.0,
    description: 'Corte especial para os pequenos com paciência e estilo.',
    icon: 'child_care'
  },
  {
    id: 's_sobrancelha',
    name: 'Sobrancelha',
    duration: '15 min',
    price: 15.0,
    description: 'Design de sobrancelha na navalha ou pinça para realçar o olhar.',
    icon: 'face_retouching_natural'
  },
  {
    id: 's_pigmentacao',
    name: 'Pigmentação',
    duration: '30 min',
    price: 30.0,
    description: 'Correção de falhas e realce do contorno do cabelo ou barba.',
    icon: 'brush'
  },
  {
    id: 's4',
    name: 'Prótese Capilar',
    duration: '2h',
    price: 'Sob Consulta',
    description: 'Aplicação profissional para um visual natural e renovado.',
    icon: 'person'
  },
  {
    id: 's5',
    name: 'Manutenção da Prótese',
    duration: '1h 30min',
    price: 150.0,
    description: 'Limpeza profunda, ajuste e recolocação para garantir a durabilidade.',
    icon: 'build'
  },
  {
    id: 's6',
    name: 'Combo VIP',
    duration: '1h 45min',
    price: 90.0,
    description: 'A experiência completa "Sou Negão". Corte, barba e tratamento facial.',
    icon: 'diamond'
  }
];

export const BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'Robson',
    photoUrl: 'https://images.unsplash.com/photo-1599351431247-f13b28320393?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 'b2',
    name: 'Leliane',
    photoUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&q=80&w=200'
  }
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
];

export const BUSY_SLOTS = ['10:00', '12:00', '12:30'];
export const BUSY_DAYS = [5, 12, 19];
