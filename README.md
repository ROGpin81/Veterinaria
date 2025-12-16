Veterinaria — Sistema Punto de Venta (POS)

Sistema básico de Punto de Venta para una veterinaria.

Componentes:
- Backend: Node.js + Express + JWT + MySQL
- Frontend: Angular
- Base de datos: MySQL

Funcionalidades:
- Inicio de sesión con JWT
- Registro de ventas
- Visualización de facturas

Estructura del proyecto:
Veterinaria/
- backend/
- frontend/veterinaria-pos/

Requisitos:
- Node.js LTS
- MySQL
- npm
- Angular CLI (opcional)

Configuración BD:
Importar el archivo PuntodeVentaVeterinaria.sql en MySQL.

Backend:
1. npm install
2. Crear .env con credenciales
3. npm run dev

Frontend:
1. npm install
2. Configurar environment.ts
3. ng serve

Endpoints principales:
- POST /api/auth/login
- POST /api/ventas
- GET /api/facturas/:id

Buenas prácticas:
- No subir .env
- No subir node_modules

Autor:
G3-T51Proyecto Veterinaria POS
