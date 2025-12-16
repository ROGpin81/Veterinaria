import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { AuthService } from '../../services/auth.service';
import { FacturaResponse } from '../../models/factura.model';

@Component({
  standalone: true,
  selector: 'app-factura',
  imports: [CommonModule],
  templateUrl: './factura.component.html',
  styleUrls: ['./factura.component.scss'], // <- IMPORTANTE (plural)
})
export class FacturaComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facturasService = inject(FacturasService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  errorMsg = '';
  data: FacturaResponse | null = null;

  ngOnInit(): void {
    const idVenta = Number(this.route.snapshot.paramMap.get('idVenta'));
    if (!idVenta) {
      this.errorMsg = 'ID de venta inválido.';
      return;
    }

    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.facturasService.obtener(idVenta).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        const status = err?.status;
        if (status === 401 || status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }
        this.loading = false;
        this.errorMsg = err?.error?.message || 'No se pudo cargar la factura.';
        this.cdr.detectChanges();
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  nuevaVenta(): void {
    this.router.navigate(['/venta']);
  }

  imprimir(): void {
    window.print();
  }
}
