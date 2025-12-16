const pool = require("../config/db");

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_producto, nombre, tipo, precio, stock, activo FROM producto WHERE activo = 1 ORDER BY nombre"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.obtenerPorId = async (req, res, next) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.execute(
      "SELECT id_producto, nombre, tipo, precio, stock, activo FROM producto WHERE id_producto = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Producto no existe" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
