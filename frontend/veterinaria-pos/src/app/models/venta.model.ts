export interface VentaItem {
  id_producto: number;
  cantidad: number;
}

export interface CrearVentaRequest {
  id_cliente: number;
  items: VentaItem[];
}

export interface CrearVentaResponse {
  message: string;
  id_venta: number;
  total: number;
}
