import express from "express";
import { supabase } from "./db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ user: data.user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("Supabase result:", { data, error });

    if (error) {
      return res.status(400).json({ error: error.message });
    }
    if (!data || !data.session) {
      return res.status(400).json({ error: "Invalid session" });
    }

    res.json({ session: data.session });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/test", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});
export default router;