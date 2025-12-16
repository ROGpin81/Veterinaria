import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api`;

  getClientes(q?: string): Observable<Cliente[]> {
    const cb = Date.now();

    let params = new HttpParams().set('cb', cb.toString());
    if (q && q.trim()) params = params.set('q', q.trim());

    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`, { params }).pipe(
      map((rows) => rows || [])
    );
  }

  crearCliente(data: { nombre: string; telefono?: string }): Observable<{ message: string; id_cliente: number }> {
    return this.http.post<{ message: string; id_cliente: number }>(`${this.baseUrl}/clientes`, data);
  }
}
