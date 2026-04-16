import express from "express";
import bodyParser from "body-parser";
import cors from "cors";  // npm i cors
import dotenv from "dotenv";
import authRoutes from "./authRoutes.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // или ваш домен
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});

app.options('*', cors());

app.use(bodyParser.json({ limit: '10mb' }));

// авторизация /api/register, /api/login
app.use(authRoutes);



const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Auth server running on port ${PORT}`)
);