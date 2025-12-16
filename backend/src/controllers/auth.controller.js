const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const SECRET_KEY = process.env.JWT_SECRET || "MiClaveSecreta";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "8h";

exports.login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ message: "correo y password son requeridos" });
    }

    const [rows] = await pool.execute(
      "SELECT id_usuario, nombre, correo, contrasena, activo FROM usuario WHERE correo = ? AND activo = 1 LIMIT 1",
      [correo]
    );

    if (rows.length === 0) return res.status(401).json({ message: "Credenciales inválidas" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.contrasena);
    if (!isMatch) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { id_usuario: user.id_usuario, correo: user.correo, nombre: user.nombre },
      SECRET_KEY,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: { id_usuario: user.id_usuario, nombre: user.nombre, correo: user.correo },
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const id = req.user.id_usuario;

    const [rows] = await pool.execute(
      "SELECT id_usuario, nombre, correo, activo, created_at FROM usuario WHERE id_usuario = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: "Usuario no existe" });

    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: "nombre, correo, password son requeridos" });
    }

    const saltRound = 10;
    const hash = await bcrypt.hash(password, saltRound);

    const [result] = await pool.execute(
      "INSERT INTO usuario (nombre, correo, contrasena, activo) VALUES (?, ?, ?, 1)",
      [nombre, correo, hash]
    );

    res.status(201).json({ message: "Usuario creado", id_usuario: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "El correo ya está registrado" });
    next(err);
  }
};
