import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CrearVentaRequest, CrearVentaResponse } from '../models/venta.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VentasService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api`;

  crearVenta(payload: CrearVentaRequest): Observable<CrearVentaResponse> {
    return this.http.post<CrearVentaResponse>(`${this.baseUrl}/ventas`, payload);
  }
}
