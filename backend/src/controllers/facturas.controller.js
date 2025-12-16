const pool = require("../config/db");

exports.obtenerPorVenta = async (req, res, next) => {
  try {
    const idVenta = req.params.idVenta;

    const [vetRows] = await pool.execute(
      "SELECT nombre, telefono, direccion, email, rtn FROM veterinaria_config ORDER BY id_config LIMIT 1"
    );

    const [headRows] = await pool.execute(
      `SELECT v.id_venta, v.fecha, v.total,
              u.nombre AS usuario,
              c.nombre AS cliente, c.telefono AS telefono_cliente
       FROM venta v
       JOIN usuario u ON u.id_usuario = v.id_usuario
       JOIN cliente c ON c.id_cliente = v.id_cliente
       WHERE v.id_venta = ? LIMIT 1`,
      [idVenta]
    );

    if (headRows.length === 0) return res.status(404).json({ message: "Venta no existe" });

    const [detRows] = await pool.execute(
      `SELECT p.nombre AS producto, p.tipo,
              dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_venta dv
       JOIN producto p ON p.id_producto = dv.id_producto
       WHERE dv.id_venta = ?`,
      [idVenta]
    );

    res.json({
      veterinaria: vetRows[0] || null,
      factura: headRows[0],
      detalle: detRows,
    });
  } catch (err) {
    next(err);
  }
};
