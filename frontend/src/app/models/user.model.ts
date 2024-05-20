export interface User {
  uid: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: number;
  fecha: Date;
  dni: number;
  ubicacion: string;
  direccion: string;
  // Otras propiedades del usuario
  admin: boolean;
  empresa: boolean;
  message?: string; // Mensaje enviado por el usuario estándar para solicitar cuenta de empresa
  requestHandled: boolean;
  favorites?: string[];
}