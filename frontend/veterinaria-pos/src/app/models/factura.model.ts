export interface FacturaResponse {
  veterinaria: {
    nombre: string;
    telefono?: string;
    direccion?: string;
    email?: string;
    rtn?: string;
  };
  factura: {
    id_venta: number;
    fecha: string;
    total: number;
    usuario: string;
    cliente: string;
    telefono_cliente?: string;
  };
  detalle: Array<{
    producto: string;
    tipo: 'PRODUCTO' | 'SERVICIO';
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
}
