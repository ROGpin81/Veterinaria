import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FacturaResponse } from '../models/factura.model';

@Injectable({ providedIn: 'root' })
export class FacturasService {
  private base = environment.apiBaseUrl;
  constructor(private http: HttpClient) {}

  obtener(idVenta: number): Observable<FacturaResponse> {
    return this.http.get<FacturaResponse>(`${this.base}/api/facturas/${idVenta}`);
  }
}
