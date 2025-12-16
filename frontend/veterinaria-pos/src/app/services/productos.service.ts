import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Producto } from '../models/producto.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/api`;

  getProductos(): Observable<Producto[]> {
    // cache-buster: evita 304 y fuerza 200 con body
    const cb = Date.now();
    return this.http.get<Producto[]>(`${this.baseUrl}/productos?cb=${cb}`).pipe(
      map((rows) => rows || [])
    );
  }
}
