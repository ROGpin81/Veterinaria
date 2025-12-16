import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ClientesService } from '../../services/clientes.service';
import { ProductosService } from '../../services/productos.service';
import { VentasService } from '../../services/ventas.service';
import { AuthService } from '../../services/auth.service';

import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';

@Component({
  standalone: true,
  selector: 'app-venta',
  imports: [CommonModule, FormsModule],
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss'], // <- IMPORTANTE (plural)
})
export class VentaComponent {
  private clientesService = inject(ClientesService);
  private productosService = inject(ProductosService);
  private ventasService = inject(VentasService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  clientes: Cliente[] = [];
  productos: Producto[] = [];

  idClienteSeleccionado: number | null = null;

  crearClienteMode = false;
  nuevoClienteNombre = '';
  nuevoClienteTelefono = '';

  qty: Record<number, number> = {};

  loadingInit = false;
  loadingAction = false;
  errorMsg = '';

  ngOnInit(): void {
    this.cargarDataInicial();
  }

  private asArray<T>(value: any): T[] {
    if (Array.isArray(value)) return value;
    if (value && Array.isArray(value.rows)) return value.rows;
    if (value && Array.isArray(value.data)) return value.data;
    return [];
  }
  async cargarDataInicial(): Promise<void> {
    this.loadingInit = true;
    this.errorMsg = '';

    this.cdr.detectChanges();

    try {
      const [clientesRes, productosRes] = await Promise.all([
        firstValueFrom(this.clientesService.getClientes()),
        firstValueFrom(this.productosService.getProductos()),
      ]);

      this.clientes = this.asArray<Cliente>(clientesRes);
      this.productos = this.asArray<Producto>(productosRes);

      const newQty: Record<number, number> = {};
      for (const p of this.productos) {
        newQty[p.id_producto] = Number(this.qty[p.id_producto] ?? 0);
      }
      this.qty = newQty;
    } catch (err: any) {
      console.error('Error carga inicial /venta:', err);

      const status = err?.status;
      if (status === 401 || status === 403) {
        this.authService.logout();
        this.router.navigate(['/login']);
        return;
      }

      this.errorMsg =
        err?.error?.message ||
        'Error cargando productos o clientes. Revisa el backend, token y endpoints.';
    } finally {
      this.loadingInit = false;

      this.cdr.detectChanges();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleCrearCliente(): void {
    this.crearClienteMode = !this.crearClienteMode;
    this.errorMsg = '';
  }

  guardarClienteRapido(): void {
    this.errorMsg = '';

    const nombre = this.nuevoClienteNombre.trim();
    if (!nombre) {
      this.errorMsg = 'El nombre del cliente es requerido.';
      return;
    }

    this.loadingAction = true;

    this.clientesService
      .crearCliente({
        nombre,
        telefono: this.nuevoClienteTelefono.trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.idClienteSeleccionado = res.id_cliente;

          this.nuevoClienteNombre = '';
          this.nuevoClienteTelefono = '';
          this.crearClienteMode = false;

          this.clientesService.getClientes().subscribe({
            next: (rows) => (this.clientes = this.asArray<Cliente>(rows)),
            error: () => {},
          });

          this.loadingAction = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error creando cliente:', err);
          this.errorMsg = err?.error?.message || 'No se pudo crear el cliente.';
          this.loadingAction = false;
          this.cdr.detectChanges();
        },
      });
  }

  totalActual(): number {
    return this.productos.reduce((acc, p) => {
      const q = Number(this.qty[p.id_producto] || 0);
      return q > 0 ? acc + Number(p.precio) * q : acc;
    }, 0);
  }

  registrarVenta(): void {
    this.errorMsg = '';

    if (!this.idClienteSeleccionado) {
      this.errorMsg = 'Selecciona un cliente para registrar la venta.';
      return;
    }

    const items = this.productos
      .map((p) => ({
        id_producto: p.id_producto,
        cantidad: Number(this.qty[p.id_producto] || 0),
        producto: p,
      }))
      .filter((x) => x.cantidad > 0);

    if (items.length === 0) {
      this.errorMsg =
        'Agrega al menos 1 producto/servicio con cantidad mayor a 0.';
      return;
    }

    for (const it of items) {
      if (!Number.isFinite(it.cantidad) || it.cantidad < 0) {
        this.errorMsg = 'Cantidad inválida.';
        return;
      }
      if (it.producto.tipo === 'PRODUCTO' && it.cantidad > it.producto.stock) {
        this.errorMsg = `Stock insuficiente para: ${it.producto.nombre}.`;
        return;
      }
    }

    this.loadingAction = true;
    this.cdr.detectChanges();

    this.ventasService
      .crearVenta({
        id_cliente: this.idClienteSeleccionado,
        items: items.map((x) => ({
          id_producto: x.id_producto,
          cantidad: x.cantidad,
        })),
      })
      .subscribe({
        next: (res) => {
          for (const k of Object.keys(this.qty)) this.qty[Number(k)] = 0;

          this.loadingAction = false;
          this.cdr.detectChanges();

          this.router.navigate(['/factura', res.id_venta]);
        },
        error: (err) => {
          console.error('Error registrando venta:', err);
          this.errorMsg =
            err?.error?.message || 'No se pudo registrar la venta.';
          this.loadingAction = false;
          this.cdr.detectChanges();
        },
      });
  }
}
