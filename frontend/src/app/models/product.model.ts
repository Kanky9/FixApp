export interface Product {
    productId?: string; 
    userId?: string; 
    imagePrincipal: string;
    nombre: string;
    imagenes: string[]; // Array para almacenar las URLs de las imágenes
    categoria: string;
    area: string;
    descripcion: string;
    ubicacion: string;
    direccion: string;
    telefono: number;
}