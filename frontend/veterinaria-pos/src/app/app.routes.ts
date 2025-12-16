import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { VentaComponent } from './pages/venta/venta.component';
import { FacturaComponent } from './pages/factura/factura.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },

  { path: 'venta', component: VentaComponent, canActivate: [authGuard] },

  { path: 'factura/:idVenta', component: FacturaComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' },
];
