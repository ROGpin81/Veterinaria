const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const errorMiddleware = require("./middleware/error.middleware");

const utilsRoutes = require("./routes/utils.routes");
const authRoutes = require("./routes/auth.routes");
const productosRoutes = require("./routes/productos.routes");
const clientesRoutes = require("./routes/clientes.routes");
const ventasRoutes = require("./routes/ventas.routes");
const facturasRoutes = require("./routes/facturas.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("Conectado a MySQL correctamente.");
    conn.release();
  } catch (err) {
    console.error("Error conectando a MySQL:", err.message);
  }
})();

app.get("/", (req, res) => res.send("API Punto de Venta Veterinaria OK"));

app.use("/", utilsRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/facturas", facturasRoutes);

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
