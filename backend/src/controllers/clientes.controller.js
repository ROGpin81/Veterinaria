const pool = require("../config/db");

exports.crear = async (req, res, next) => {
  try {
    const { nombre, telefono } = req.body;
    if (!nombre) return res.status(400).json({ message: "nombre es requerido" });

    const [result] = await pool.execute(
      "INSERT INTO cliente (nombre, telefono) VALUES (?, ?)",
      [nombre, telefono || null]
    );

    res.status(201).json({ message: "Cliente creado", id_cliente: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.obtenerPorId = async (req, res, next) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.execute(
      "SELECT id_cliente, nombre, telefono FROM cliente WHERE id_cliente = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Cliente no existe" });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.listar = async (req, res, next) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : null;

    let rows;
    if (q) {
      [rows] = await pool.execute(
        "SELECT id_cliente, nombre, telefono FROM cliente WHERE nombre LIKE ? ORDER BY nombre",
        [q]
      );
    } else {
      [rows] = await pool.execute(
        "SELECT id_cliente, nombre, telefono FROM cliente ORDER BY nombre"
      );
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
