
export interface Service {
  id: string;
  name: string;
  duration: string;
  price: number | string | null;
  description: string;
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  photoUrl: string;
  userId?: string;
}

export interface UserInfo {
  name: string;
  phone: string;
  email?: string;
}

export interface Appointment {
  barberId: string;
  serviceIds: string[];
  date: Date;
  time: string;
  user: UserInfo;
}

export enum Page {
  HOME = 'home',
  BOOKING = 'booking',
  SERVICES = 'services',
  CONTACT = 'contact',
  MY_BOOKINGS = 'my-bookings',
  LOGIN = 'login',
  ADMIN = 'admin',
  BARBER_PROFILE = 'barber-profile'
}
