import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./authRoutes.js";

dotenv.config();

const app = express();

// ✅ CORS middleware ПЕРВЫМ (заменяет app.options('*'))
app.use(cors({
  origin: "*",  // Разрешаем все origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Ручной middleware для OPTIONS (без wildcard)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }
  next();
});

app.use(bodyParser.json({ limit: "10mb" }));

// ✅ Routes
app.use(authRoutes);

// ✅ 404 handler (без wildcard проблемы)
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => 
  console.log(`✅ Auth server running on port ${PORT}`)
);