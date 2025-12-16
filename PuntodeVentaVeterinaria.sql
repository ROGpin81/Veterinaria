-- =========================================================
-- BD: PuntodeVentaVeterinaria
-- =========================================================

DROP DATABASE IF EXISTS PuntodeVentaVeterinaria;
CREATE DATABASE PuntodeVentaVeterinaria
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE PuntodeVentaVeterinaria;

-- =========================================================
-- 1) Configuración fija de la veterinaria (para la factura)
-- =========================================================
CREATE TABLE veterinaria_config (
  id_config INT NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  telefono      VARCHAR(20)  NULL,
  direccion     VARCHAR(200) NULL,
  email         VARCHAR(150) NULL,
  rtn           VARCHAR(30)  NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_config)
) ENGINE=InnoDB;

-- Inserta 1 fila (edítala a tu gusto)
INSERT INTO veterinaria_config (nombre, telefono, direccion, email, rtn)
VALUES ('Veterinaria (Nombre Fijo)', '0000-0000', 'Dirección (Fija)', 'correo@veterinaria.com', NULL);

-- =========================================================
-- 2) Usuario
-- =========================================================
CREATE TABLE usuario (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(120) NOT NULL,
  correo        VARCHAR(150) NOT NULL,
  contrasena    VARCHAR(255) NOT NULL,  -- aquí va el HASH (bcrypt/argon2), no la contraseña en texto
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuario_correo (correo)
) ENGINE=InnoDB;

-- =========================================================
-- 3) Cliente
-- =========================================================
CREATE TABLE cliente (
  id_cliente INT NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  telefono      VARCHAR(20)  NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cliente)
) ENGINE=InnoDB;

-- =========================================================
-- 4) Producto / Servicio
-- =========================================================
CREATE TABLE producto (
  id_producto INT NOT NULL AUTO_INCREMENT,
  nombre        VARCHAR(150) NOT NULL,
  tipo          ENUM('PRODUCTO','SERVICIO') NOT NULL DEFAULT 'PRODUCTO',
  precio        DECIMAL(10,2) NOT NULL,
  stock         INT UNSIGNED NOT NULL DEFAULT 0,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_producto),
  KEY idx_producto_nombre (nombre),
  CONSTRAINT chk_producto_precio CHECK (precio >= 0),
  CONSTRAINT chk_producto_stock CHECK (stock >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- 5) Venta
-- =========================================================
CREATE TABLE venta (
  id_venta INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_cliente INT NOT NULL,
  fecha       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total       DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_venta),
  KEY idx_venta_fecha (fecha),
  KEY idx_venta_usuario (id_usuario),
  KEY idx_venta_cliente (id_cliente),
  CONSTRAINT fk_venta_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_venta_cliente
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_venta_total CHECK (total >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- 6) DetalleVenta
-- =========================================================
CREATE TABLE detalle_venta (
  id_detalle INT NOT NULL AUTO_INCREMENT,
  id_venta     INT NOT NULL,
  id_producto  INT NOT NULL,
  cantidad     INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,   -- guardamos el precio al momento de la venta
  subtotal     DECIMAL(12,2) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_detalle),
  KEY idx_detalle_venta (id_venta),
  KEY idx_detalle_producto (id_producto),

  CONSTRAINT fk_detalle_venta
    FOREIGN KEY (id_venta) REFERENCES venta(id_venta)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT fk_detalle_producto
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0),
  CONSTRAINT chk_detalle_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB;

-- =========================================================
-- (Opcional) Vista rápida para factura
-- =========================================================
CREATE OR REPLACE VIEW vw_factura AS
SELECT
  v.id_venta,
  v.fecha,
  u.nombre AS usuario,
  c.nombre AS cliente,
  c.telefono AS telefono_cliente,
  dv.id_detalle,
  p.nombre AS producto,
  p.tipo,
  dv.cantidad,
  dv.precio_unitario,
  dv.subtotal,
  v.total
FROM venta v
JOIN usuario u ON u.id_usuario = v.id_usuario
JOIN cliente c ON c.id_cliente = v.id_cliente
JOIN detalle_venta dv ON dv.id_venta = v.id_venta
JOIN producto p ON p.id_producto = dv.id_producto;
