export interface Producto {
  id_producto: number;
  nombre: string;
  tipo: 'PRODUCTO' | 'SERVICIO';
  precio: number;
  stock: number;
  activo: number;
}
