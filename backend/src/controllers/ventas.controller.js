const pool = require("../config/db");

exports.crear = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { id_cliente, items } = req.body;

    if (!id_cliente || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "id_cliente e items son requeridos" });
    }

    await conn.beginTransaction();

    const [ventaRes] = await conn.execute(
      "INSERT INTO venta (id_usuario, id_cliente, total) VALUES (?, ?, 0)",
      [req.user.id_usuario, id_cliente]
    );
    const id_venta = ventaRes.insertId;

    let total = 0;

    for (const it of items) {
      const { id_producto, cantidad } = it;

      if (!id_producto || !cantidad || cantidad <= 0) {
        const e = new Error("Cada item requiere id_producto y cantidad > 0");
        e.status = 400;
        throw e;
      }

      const [prodRows] = await conn.execute(
        "SELECT id_producto, nombre, tipo, precio, stock, activo FROM producto WHERE id_producto = ? AND activo = 1 FOR UPDATE",
        [id_producto]
      );
      if (prodRows.length === 0) {
        const e = new Error(`Producto no existe o inactivo: ${id_producto}`);
        e.status = 400;
        throw e;
      }

      const p = prodRows[0];

      if (p.tipo === "PRODUCTO") {
        if (p.stock < cantidad) {
          const e = new Error(`Stock insuficiente para ${p.nombre}. Disponible: ${p.stock}`);
          e.status = 400;
          throw e;
        }

        await conn.execute(
          "UPDATE producto SET stock = stock - ? WHERE id_producto = ?",
          [cantidad, id_producto]
        );
      }

      const subtotal = Number(p.precio) * Number(cantidad);
      total += subtotal;

      await conn.execute(
        "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)",
        [id_venta, id_producto, cantidad, p.precio, subtotal]
      );
    }

    await conn.execute(
      "UPDATE venta SET total = ? WHERE id_venta = ?",
      [total, id_venta]
    );

    await conn.commit();
    res.status(201).json({ message: "Venta creada", id_venta, total });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

exports.obtenerPorId = async (req, res, next) => {
  try {
    const id = req.params.id;

    const [ventaRows] = await pool.execute(
      "SELECT id_venta, id_usuario, id_cliente, fecha, total FROM venta WHERE id_venta = ? LIMIT 1",
      [id]
    );

    if (ventaRows.length === 0) return res.status(404).json({ message: "Venta no existe" });

    const [detalleRows] = await pool.execute(
      `SELECT dv.id_detalle, dv.id_producto, p.nombre, p.tipo, 
              dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_venta dv
       JOIN producto p ON p.id_producto = dv.id_producto
       WHERE dv.id_venta = ?`,
      [id]
    );

    res.json({ venta: ventaRows[0], detalle: detalleRows });
  } catch (err) {
    next(err);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT v.id_venta, v.fecha, v.total,
              u.nombre AS usuario,
              c.nombre AS cliente
       FROM venta v
       JOIN usuario u ON u.id_usuario = v.id_usuario
       JOIN cliente c ON c.id_cliente = v.id_cliente
       ORDER BY v.fecha DESC`
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
